"""Qiskit Aer adapter — SIM-3.

Converts a validated CircuitModel into a State Trace + measurement results
using Qiskit Aer statevector simulation.

Key rules from quantum-runtime.md:
  - Run CPU-bound SDK calls outside the async event loop (sync function, called
    via run_in_threadpool in routes — SIM-4).
  - Save PRE-MEASUREMENT statevector for State Trace; sample counts separately.
  - MEASURE gates do NOT appear in stateTrace steps.
  - Normalize wire/basis order at the adapter boundary (see normalizer.py).
  - Reject NaN/Infinity; probabilities must be finite, in [0,1], sum within tol.
  - Purity < 1 must carry MIXED_SUBSYSTEM label.
  - JSON complex: {re, im}.

This module imports Qiskit only inside the function — the import happens AFTER
CircuitModel validation (per quantum-runtime.md: "Reject outside the subset
before importing a quantum SDK").
"""

from __future__ import annotations

import math
import time
from dataclasses import dataclass, field

from app.models.circuit import CircuitModel, GateName
from app.services.quantum.normalizer import (
    build_normalized_amplitude_map,
    build_normalized_probability_map,
    normalize_counts,
)

# ---------------------------------------------------------------------------
# Output data classes (no Pydantic here — plain Python, fast to instantiate)
# ---------------------------------------------------------------------------


@dataclass
class BlochVector:
    x: float
    y: float
    z: float


@dataclass
class ReducedQubit:
    qubit: int
    bloch: BlochVector
    purity: float
    label: str  # "PURE_SUBSYSTEM" | "MIXED_SUBSYSTEM"


@dataclass
class StateTraceStep:
    stepIndex: int
    operationId: str
    label: str
    basisProbabilities: dict[str, float]
    amplitudes: dict[str, dict[str, float]]
    reducedQubits: list[ReducedQubit]


@dataclass
class AerResult:
    stateTrace: list[StateTraceStep] = field(default_factory=list)
    probabilities: dict[str, float] = field(default_factory=dict)
    counts: dict[str, int] = field(default_factory=dict)
    durationMs: int = 0


# ---------------------------------------------------------------------------
# Numerical helpers
# ---------------------------------------------------------------------------

_PROB_TOL = 1e-10
_PURITY_MIXED_THRESHOLD = 1.0 - 1e-9  # purity strictly < 1 → MIXED


def _assert_finite(value: float, context: str) -> None:
    """Raise if value is NaN or Infinity — quantum-runtime.md constraint."""
    if not math.isfinite(value):
        raise ValueError(f"Non-finite value detected in {context}: {value}")


def _partial_density_matrix(statevector: list[complex], n_qubits: int, qubit: int):
    """Compute the 2×2 reduced density matrix for a single qubit by tracing out all others.

    Returns a 2×2 list-of-lists of complex numbers.
    """
    dim = 2 ** n_qubits
    rho = [[complex(0), complex(0)], [complex(0), complex(0)]]

    for i in range(dim):
        for j in range(dim):
            # Check if all OTHER qubits match between i and j
            # In Qiskit convention: qubit k occupies bit position k (LSB)
            # Only differ in the qubit of interest
            mask = ~(1 << qubit)
            if (i & mask) != (j & mask):
                continue
            # Row/col in reduced matrix = bit at position `qubit`
            ri = (i >> qubit) & 1
            rj = (j >> qubit) & 1
            rho[ri][rj] += statevector[i] * statevector[j].conjugate()

    return rho


def _bloch_and_purity(rho_2x2) -> tuple[BlochVector, float]:
    """Compute Bloch vector (x,y,z) and purity from a 2×2 density matrix.

    Bloch vector: r = Tr(ρ σ)
      x = 2 Re(ρ[0][1])
      y = 2 Im(ρ[1][0])   (note: ρ[1][0] = ρ[0][1]*)
      z = ρ[0][0] - ρ[1][1]

    Purity = Tr(ρ²) = ρ[0][0]² + ρ[1][1]² + 2|ρ[0][1]|²
    """
    r00 = rho_2x2[0][0].real
    r11 = rho_2x2[1][1].real
    r01 = rho_2x2[0][1]

    x = 2.0 * r01.real
    y = -2.0 * r01.imag  # Tr(ρ σ_y) = -2 Im(ρ[0][1]) by standard Bloch convention
    z = r00 - r11

    purity = r00 ** 2 + r11 ** 2 + 2.0 * (abs(r01) ** 2)
    # Clamp purity to [0, 1] to absorb floating-point rounding
    purity = max(0.0, min(1.0, purity))

    return BlochVector(x=x, y=y, z=z), purity


def _reduced_qubits(statevector: list[complex], n_qubits: int) -> list[ReducedQubit]:
    """Compute ReducedQubit list (Bloch + purity) for all qubits."""
    result = []
    for q in range(n_qubits):
        rho = _partial_density_matrix(statevector, n_qubits, q)
        bloch, purity = _bloch_and_purity(rho)
        _assert_finite(bloch.x, f"Bloch x qubit {q}")
        _assert_finite(bloch.y, f"Bloch y qubit {q}")
        _assert_finite(bloch.z, f"Bloch z qubit {q}")
        _assert_finite(purity, f"purity qubit {q}")
        label = "PURE_SUBSYSTEM" if purity >= _PURITY_MIXED_THRESHOLD else "MIXED_SUBSYSTEM"
        result.append(ReducedQubit(qubit=q, bloch=bloch, purity=purity, label=label))
    return result


# ---------------------------------------------------------------------------
# Gate mapping: CircuitModel GateName → Qiskit method name
# ---------------------------------------------------------------------------

_SINGLE_QUBIT_GATES = {
    GateName.H: "h",
    GateName.X: "x",
    GateName.Y: "y",
    GateName.Z: "z",
}


# ---------------------------------------------------------------------------
# Main adapter
# ---------------------------------------------------------------------------


def run_qiskit_aer(circuit: CircuitModel, shots: int = 1024) -> AerResult:
    """Execute a validated CircuitModel with Qiskit Aer.

    Imports Qiskit inside the function — validation already passed at this point.

    Steps:
    1. Build Qiskit QuantumCircuit from CircuitModel operations (no MEASURE yet)
    2. After each non-MEASURE gate, snapshot the statevector → one StateTraceStep
    3. Add MEASURE gates and run statevector_simulator with shots for counts
    4. Compute ideal probabilities from final pre-measurement statevector
    5. Normalize all basis labels to contract big-endian order
    6. Validate no NaN/Infinity

    Args:
        circuit: Validated CircuitModel (SIM-2 guarantees validity)
        shots: Number of measurement shots for counts

    Returns:
        AerResult with stateTrace, probabilities, counts, durationMs
    """
    # Late import — Qiskit only imported AFTER CircuitModel validation
    from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister  # noqa: PLC0415
    from qiskit_aer import AerSimulator  # noqa: PLC0415

    t_start = time.monotonic()

    n_qubits = circuit.qubitCount
    n_classical = circuit.classicalBitCount

    # Separate non-MEASURE ops from MEASURE ops
    non_measure_ops = [op for op in circuit.operations if op.gate != GateName.MEASURE]
    measure_ops = [op for op in circuit.operations if op.gate == GateName.MEASURE]

    # ------------------------------------------------------------------
    # Build incremental statevector snapshots (one per non-MEASURE gate)
    # ------------------------------------------------------------------
    trace_steps: list[StateTraceStep] = []
    step_index = 0

    # We build the circuit incrementally to capture statevector after each gate
    qr = QuantumRegister(n_qubits, "q")
    qc_trace = QuantumCircuit(qr)

    sv_simulator = AerSimulator(method="statevector")

    for op in non_measure_ops:
        gate = op.gate

        if gate in _SINGLE_QUBIT_GATES:
            qiskit_method = _SINGLE_QUBIT_GATES[gate]
            getattr(qc_trace, qiskit_method)(op.targets[0])
        elif gate == GateName.CNOT:
            qc_trace.cx(op.controls[0], op.targets[0])
        else:
            # Should never happen — CircuitModel validation already enforced the enum
            raise ValueError(f"Unexpected gate {gate} in adapter")  # pragma: no cover

        # Save statevector snapshot after this gate
        qc_snap = qc_trace.copy()
        qc_snap.save_statevector()
        job = sv_simulator.run(qc_snap, shots=1)
        result_snap = job.result()
        sv = result_snap.get_statevector(qc_snap).data  # numpy array of complex

        # Convert numpy complex to Python complex
        sv_list: list[complex] = [complex(a) for a in sv]

        # Validate no NaN/Infinity in statevector
        for idx, amp in enumerate(sv_list):
            _assert_finite(amp.real, f"statevector[{idx}].real after {op.opId}")
            _assert_finite(amp.imag, f"statevector[{idx}].imag after {op.opId}")

        amplitudes = build_normalized_amplitude_map(sv_list, n_qubits)
        basis_probs = build_normalized_probability_map(sv_list, n_qubits)

        # Validate probabilities
        total_prob = sum(basis_probs.values())
        if not (abs(total_prob - 1.0) < 1e-6 or len(basis_probs) == 0):
            raise ValueError(
                f"Probabilities do not sum to 1 after {op.opId}: sum={total_prob}"
            )
        for label, p in basis_probs.items():
            _assert_finite(p, f"probability for {label} after {op.opId}")
            if not (0.0 <= p <= 1.0 + 1e-10):
                raise ValueError(f"Probability {p} for {label} out of [0,1]")

        reduced = _reduced_qubits(sv_list, n_qubits)

        trace_steps.append(
            StateTraceStep(
                stepIndex=step_index,
                operationId=op.opId,
                label=f"After {op.gate.value}",
                basisProbabilities=basis_probs,
                amplitudes=amplitudes,
                reducedQubits=reduced,
            )
        )
        step_index += 1

    # ------------------------------------------------------------------
    # Ideal probabilities from last pre-measurement statevector
    # ------------------------------------------------------------------
    if trace_steps:
        # Re-use the last snapshot's basis probabilities as ideal probabilities
        ideal_probs = trace_steps[-1].basisProbabilities.copy()
    else:
        # No non-measure gates → uniform over all basis states
        dim = 2 ** n_qubits
        ideal_probs = {
            qiskit_index_to_contract_label(i, n_qubits): 1.0 / dim
            for i in range(dim)
        }

    # ------------------------------------------------------------------
    # Measurement counts (separate execution with MEASURE gates added)
    # ------------------------------------------------------------------
    counts: dict[str, int] = {}
    if measure_ops and n_classical > 0:
        cr = ClassicalRegister(n_classical, "c")
        qc_measure = QuantumCircuit(qr, cr)

        # Re-apply all non-measure gates
        for op in non_measure_ops:
            gate = op.gate
            if gate in _SINGLE_QUBIT_GATES:
                getattr(qc_measure, _SINGLE_QUBIT_GATES[gate])(op.targets[0])
            elif gate == GateName.CNOT:
                qc_measure.cx(op.controls[0], op.targets[0])

        # Apply MEASURE gates
        for op in measure_ops:
            for t, c in zip(op.targets, op.classicalTargets):
                qc_measure.measure(t, c)

        meas_simulator = AerSimulator()
        job_meas = meas_simulator.run(qc_measure, shots=shots)
        raw_counts = job_meas.result().get_counts(qc_measure)
        counts = normalize_counts(dict(raw_counts), n_classical)

    t_end = time.monotonic()
    duration_ms = int((t_end - t_start) * 1000)

    return AerResult(
        stateTrace=trace_steps,
        probabilities=ideal_probs,
        counts=counts,
        durationMs=duration_ms,
    )


# Late import helper exposed for normalizer tests
def qiskit_index_to_contract_label(qiskit_index: int, n_qubits: int) -> str:
    """Re-export from normalizer for convenience."""
    from app.services.quantum.normalizer import qiskit_index_to_contract_label as _f  # noqa: PLC0415
    return _f(qiskit_index, n_qubits)
