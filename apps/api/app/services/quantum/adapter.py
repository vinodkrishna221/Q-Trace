"""Qiskit Aer adapter — SIM-3 / SIM-9.

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

SIM-9 performance tuning:
  - AerSimulator instances are cached at module level (created once per process).
    Per-call construction triggered JIT compilation on every invocation; caching
    drops warm-path latency by eliminating that overhead.
  - prewarm_adapters() is called from main.py startup so the first real request
    hits the warm path immediately.  Guarded by ENABLE_QISKIT so disabled
    deployments pay zero cost.

This module still imports Qiskit inside functions — the import happens AFTER
CircuitModel validation (per quantum-runtime.md: "Reject outside the subset
before importing a quantum SDK").
"""

from __future__ import annotations

import math
import time
from dataclasses import dataclass, field

from app.models.circuit import CircuitModel, GateName, Operation
from app.services.quantum.normalizer import (
    build_normalized_amplitude_map,
    build_normalized_probability_map,
    normalize_counts,
)

# ---------------------------------------------------------------------------
# SIM-9: Module-level cached simulators (created once per process, not per call)
# ---------------------------------------------------------------------------
# AerSimulator construction per-call triggered JIT compilation each time.
# Caching at module level eliminates that cost on warm paths.
# Both are None until prewarm_adapters() is called (or first use in run_qiskit_aer).
# ENABLE_QISKIT guard: if the flag is off, prewarm_adapters() is a no-op.

import logging as _logging
import os as _os

_adapter_logger = _logging.getLogger("qtrace.adapter")
_sv_simulator = None   # AerSimulator(method="statevector") — reused across calls
_meas_simulator = None  # AerSimulator() — reused across calls
_noise_models: dict[str, object] = {}
_noisy_dm_simulators: dict[str, object] = {}
_noisy_meas_simulators: dict[str, object] = {}


def get_noise_model(preset: str = "superconducting"):
    """Build or retrieve cached NoiseModel for a known preset.

    FEA-10 NISQ Noise Presets:
      'superconducting': Realistic superconducting qubit parameters (IBM Eagle QPU typical).
        - T1 = 50 µs thermal relaxation
        - T2 = 70 µs dephasing
        - gate_time = 50 ns (single and 2-qubit gates)
        - readout error: [[0.99, 0.01], [0.01, 0.99]]
    """
    if preset != "superconducting":
        raise ValueError(f"Unsupported noise preset: {preset}")

    if preset not in _noise_models:
        from qiskit_aer.noise import NoiseModel, thermal_relaxation_error  # noqa: PLC0415

        nm = NoiseModel()
        t1 = 50e-6
        t2 = 70e-6
        gate_time = 50e-9

        error_1q = thermal_relaxation_error(t1, t2, gate_time)
        error_2q = error_1q.tensor(error_1q)
        error_3q = error_1q.tensor(error_2q)

        # Single-qubit gates (including S, T for forward compatibility with FEA-1)
        nm.add_all_qubit_quantum_error(error_1q, ["h", "x", "y", "z", "s", "t"])
        # Two-qubit gates (including CZ for forward compatibility with FEA-1)
        nm.add_all_qubit_quantum_error(error_2q, ["cx", "cz"])
        # Three-qubit gates (CCX / Toffoli for forward compatibility with FEA-1)
        nm.add_all_qubit_quantum_error(error_3q, ["ccx"])
        # Readout error (~1%)
        nm.add_all_qubit_readout_error([[0.99, 0.01], [0.01, 0.99]])

        _noise_models[preset] = nm

    return _noise_models[preset]


def get_noisy_dm_simulator(preset: str = "superconducting"):
    """Retrieve or construct cached density matrix simulator with noise model."""
    if preset not in _noisy_dm_simulators:
        from qiskit_aer import AerSimulator  # noqa: PLC0415

        nm = get_noise_model(preset)
        _noisy_dm_simulators[preset] = AerSimulator(noise_model=nm, method="density_matrix")
    return _noisy_dm_simulators[preset]


def get_noisy_meas_simulator(preset: str = "superconducting"):
    """Retrieve or construct cached measurement simulator with noise model."""
    if preset not in _noisy_meas_simulators:
        from qiskit_aer import AerSimulator  # noqa: PLC0415

        nm = get_noise_model(preset)
        _noisy_meas_simulators[preset] = AerSimulator(noise_model=nm)
    return _noisy_meas_simulators[preset]


def prewarm_adapters() -> None:
    """Pre-initialize Qiskit Aer simulators so the first real request hits
    the warm path without JIT/setup overhead.

    Called from main.py on startup (SIM-9). Skipped when ENABLE_QISKIT=0.
    Thread-safe for single-worker deployments (Railway free tier uses 1 worker).
    """
    global _sv_simulator, _meas_simulator  # noqa: PLW0603
    if _os.getenv("ENABLE_QISKIT", "1") == "0":
        _adapter_logger.info("adapter.prewarm_skip reason=ENABLE_QISKIT=0")
        return
    if _sv_simulator is not None:
        _adapter_logger.info("adapter.prewarm_skip reason=already_warm")
        return

    import time as _time  # noqa: PLC0415
    from qiskit_aer import AerSimulator as _AerSimulator  # noqa: PLC0415

    t0 = _time.monotonic()
    _sv_simulator = _AerSimulator(method="statevector")
    _meas_simulator = _AerSimulator()
    elapsed_ms = int((_time.monotonic() - t0) * 1000)
    _adapter_logger.info("adapter.prewarm_ok elapsedMs=%d", elapsed_ms)

    if _os.getenv("ENABLE_PENNYLANE", "1") != "0":
        try:
            t_pl = _time.monotonic()
            from app.services.quantum.pennylane_adapter import prewarm_pennylane  # noqa: PLC0415

            prewarm_pennylane()
            pl_elapsed = int((_time.monotonic() - t_pl) * 1000)
            _adapter_logger.info("adapter.prewarm_pennylane_ok elapsedMs=%d", pl_elapsed)
        except Exception as exc:
            _adapter_logger.warning("adapter.prewarm_pennylane_skip reason=%s", exc)


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
    finalStatevector: list[complex] = field(default_factory=list)


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


def _partial_density_matrix_from_dm(dm, n_qubits: int, qubit: int):
    """Compute the 2×2 reduced density matrix for a single qubit from a full density matrix.

    Returns a 2×2 list-of-lists of complex numbers.
    """
    dim = 2 ** n_qubits
    rho = [[complex(0), complex(0)], [complex(0), complex(0)]]

    for i in range(dim):
        for j in range(dim):
            mask = ~(1 << qubit)
            if (i & mask) != (j & mask):
                continue
            ri = (i >> qubit) & 1
            rj = (j >> qubit) & 1
            val = dm[i, j] if hasattr(dm, "shape") else dm[i][j]
            rho[ri][rj] += complex(val)

    return rho


def _reduced_qubits_from_dm(dm, n_qubits: int) -> list[ReducedQubit]:
    """Compute ReducedQubit list (Bloch + purity) for all qubits from full density matrix."""
    result = []
    for q in range(n_qubits):
        rho = _partial_density_matrix_from_dm(dm, n_qubits, q)
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
    GateName.S: "s",
    GateName.T: "t",
}


def _apply_gate(qc, op: Operation) -> None:
    """Apply a non-MEASURE Operation to a Qiskit QuantumCircuit."""
    gate = op.gate
    if gate in _SINGLE_QUBIT_GATES:
        getattr(qc, _SINGLE_QUBIT_GATES[gate])(op.targets[0])
    elif gate == GateName.CNOT:
        qc.cx(op.controls[0], op.targets[0])
    elif gate == GateName.CZ:
        qc.cz(op.controls[0], op.targets[0])
    elif gate == GateName.CCX:
        qc.ccx(op.controls[0], op.controls[1], op.targets[0])
    else:
        # Should never happen — CircuitModel validation already enforced the enum
        raise ValueError(f"Unexpected gate {gate} in adapter")  # pragma: no cover


# ---------------------------------------------------------------------------
# Main adapter
# ---------------------------------------------------------------------------


def run_qiskit_aer(
    circuit: CircuitModel,
    shots: int = 1024,
    noise_preset: str | None = None,
) -> AerResult:
    """Execute a validated CircuitModel with Qiskit Aer.

    Imports Qiskit inside the function — validation already passed at this point.

    When noise_preset is None (default):
      Executes ideal statevector simulation (method="statevector").
    When noise_preset == "superconducting":
      Executes realistic NISQ simulation with thermal relaxation and readout errors
      using density matrix snapshots (method="density_matrix").

    Steps:
    1. Build Qiskit QuantumCircuit from CircuitModel operations (no MEASURE yet)
    2. After each non-MEASURE gate, snapshot the state (statevector or density matrix) → one StateTraceStep
    3. Add MEASURE gates and run simulator with shots for counts (including readout errors if noisy)
    4. Compute probabilities from final pre-measurement state
    5. Normalize all basis labels to contract big-endian order
    6. Validate no NaN/Infinity

    Args:
        circuit: Validated CircuitModel (SIM-2 guarantees validity)
        shots: Number of measurement shots for counts
        noise_preset: Optional noise preset name (e.g. "superconducting")

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
    # Build incremental state snapshots (one per non-MEASURE gate)
    # ------------------------------------------------------------------
    trace_steps: list[StateTraceStep] = []
    step_index = 0
    last_sv: list[complex] = []

    # We build the circuit incrementally to capture state after each gate
    qr = QuantumRegister(n_qubits, "q")
    qc_trace = QuantumCircuit(qr)

    if noise_preset is not None:
        if noise_preset != "superconducting":
            raise ValueError(f"Unsupported noise preset: {noise_preset}")
        dm_simulator = get_noisy_dm_simulator(noise_preset)
    else:
        # SIM-9: reuse cached simulator instance; create one only if cache is cold
        sv_simulator = _sv_simulator if _sv_simulator is not None else AerSimulator(method="statevector")

    for op in non_measure_ops:
        _apply_gate(qc_trace, op)

        if noise_preset is not None:
            # Snapshot density matrix under NISQ noise model
            qc_snap = qc_trace.copy()
            qc_snap.save_density_matrix()
            job = dm_simulator.run(qc_snap, shots=1)
            result_snap = job.result()
            dm_obj = result_snap.data(qc_snap)["density_matrix"]
            dm_data = dm_obj.data

            dim = 2 ** n_qubits
            basis_probs: dict[str, float] = {}
            amplitudes: dict[str, dict[str, float]] = {}

            for i in range(dim):
                prob = float(dm_data[i, i].real)
                _assert_finite(prob, f"density_matrix[{i},{i}].real after {op.opId}")
                prob = max(0.0, min(1.0, prob))
                if prob > _PROB_TOL:
                    label = qiskit_index_to_contract_label(i, n_qubits)
                    basis_probs[label] = prob
                    amplitudes[label] = {"re": float(math.sqrt(prob)), "im": 0.0}

            for label, p in basis_probs.items():
                _assert_finite(p, f"probability for {label} after {op.opId}")

            reduced = _reduced_qubits_from_dm(dm_data, n_qubits)

        else:
            # Save statevector snapshot after this gate
            qc_snap = qc_trace.copy()
            qc_snap.save_statevector()
            job = sv_simulator.run(qc_snap, shots=1)
            result_snap = job.result()
            sv = result_snap.get_statevector(qc_snap).data  # numpy array of complex

            # Convert numpy complex to Python complex
            sv_list: list[complex] = [complex(a) for a in sv]
            last_sv = sv_list

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
        # No non-measure gates → pure ground state |0...0⟩
        dim = 2 ** n_qubits
        ground_label = "0" * n_qubits
        ideal_probs = {
            qiskit_index_to_contract_label(i, n_qubits): (
                1.0 if qiskit_index_to_contract_label(i, n_qubits) == ground_label else 0.0
            )
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
            _apply_gate(qc_measure, op)

        # Apply MEASURE gates
        for op in measure_ops:
            for t, c in zip(op.targets, op.classicalTargets):
                qc_measure.measure(t, c)

        if noise_preset is not None:
            meas_simulator = get_noisy_meas_simulator(noise_preset)
        else:
            # SIM-9: reuse cached meas simulator; create one only if cache is cold
            meas_simulator = _meas_simulator if _meas_simulator is not None else AerSimulator()

        job_meas = meas_simulator.run(qc_measure, shots=shots)
        raw_counts = job_meas.result().get_counts(qc_measure)
        counts = normalize_counts(dict(raw_counts), n_classical)

    t_end = time.monotonic()
    duration_ms = int((t_end - t_start) * 1000)

    if not last_sv:
        dim = 2 ** n_qubits
        last_sv = [complex(1.0, 0.0)] + [complex(0.0, 0.0)] * (dim - 1)

    return AerResult(
        stateTrace=trace_steps,
        probabilities=ideal_probs,
        counts=counts,
        durationMs=duration_ms,
        finalStatevector=last_sv,
    )


# Late import helper exposed for normalizer tests
def qiskit_index_to_contract_label(qiskit_index: int, n_qubits: int) -> str:
    """Re-export from normalizer for convenience."""
    from app.services.quantum.normalizer import qiskit_index_to_contract_label as _f  # noqa: PLC0415
    return _f(qiskit_index, n_qubits)


# Alias run_circuit to run_qiskit_aer per FEATURES-SPEC.md § 4.3
run_circuit = run_qiskit_aer
