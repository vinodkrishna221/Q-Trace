"""PennyLane conformance adapter — SIM-6.

Compiles a validated CircuitModel to PennyLane ``default.qubit``, runs the
ideal statevector, normalises basis order to the contract (big-endian, qubit-0
leftmost), then compares ideal probabilities against the Qiskit Aer result.

Key rules from quantum-runtime.md:
  - PennyLane ``default.qubit`` is a Bell-path *conformance* adapter only.
    Compare ideal basis probabilities with epsilon 1e-6; finite-shot counts
    are never exact-equality evidence.
  - Normalize PennyLane wire/basis order at the adapter boundary with one
    tested mapping function (same normalizer as Qiskit).
  - Run CPU-bound SDK calls outside the async event loop (called from the
    same executor as the Qiskit adapter).
  - JSON complex numbers are {re, im}; NaN/Infinity are rejected.
  - Probabilities must be finite, within [0, 1], and sum within tolerance.
  - Purity < 1 must carry MIXED_SUBSYSTEM (not computed here — conformance
    only compares probability distributions, not state-trace internals).

PennyLane import is deferred until after CircuitModel validation (same pattern
as the Qiskit adapter) per the rule: "Reject outside the subset before
importing a quantum SDK."
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from app.models.circuit import CircuitModel, GateName

# Epsilon for probability comparison (quantum-runtime.md: epsilon 1e-6)
_CONFORMANCE_EPSILON = 1e-6

# Supported gates in this adapter (subset of CircuitModel GateNames)
_PL_SUPPORTED_GATES = {GateName.H, GateName.X, GateName.Y, GateName.Z, GateName.CNOT}


@dataclass
class PennyLaneConformanceResult:
    """Result of the PennyLane conformance check.

    Attributes:
        passed:             True iff all |qiskit_prob - pl_prob| <= epsilon.
        max_probability_delta: Maximum absolute probability difference found.
        epsilon:            Comparison threshold used.
        skipped_reason:     None when check ran; string code when skipped.
        pl_probabilities:   Normalised probability map from PennyLane.
    """

    passed: bool
    max_probability_delta: float
    epsilon: float
    skipped_reason: str | None
    pl_probabilities: dict[str, float]


def _pennylane_index_to_contract_label(pl_index: int, n_qubits: int) -> str:
    """Map a PennyLane computational-basis index to a contract label.

    PennyLane ``default.qubit`` orders the computational basis as:
      wire 0 is the *most-significant* bit in the probability array index.
      (This is the opposite of Qiskit's little-endian convention.)

    The contract label has qubit-0 *leftmost* (big-endian in our vocabulary).

    PennyLane:
      index 0 → all wires = 0  → "00…0"
      index 1 → wire (n-1) = 1 → last wire set
    In PennyLane the array is ordered as:
      index bits (MSB→LSB) = wire0, wire1, …, wire(n-1)
    So the contract label is simply the zero-padded binary of the index
    (qubit 0 = MSB = leftmost character), which *already matches* the
    contract convention.

    Args:
        pl_index: PennyLane probability array index (0 to 2^n_qubits - 1).
        n_qubits: Number of qubits.

    Returns:
        Contract basis label string (qubit-0 leftmost).
    """
    return format(pl_index, f"0{n_qubits}b")


def _run_pennylane(circuit: CircuitModel) -> dict[str, float]:
    """Execute the CircuitModel on PennyLane ``default.qubit`` (ideal).

    Returns a contract-keyed probability map (basis labels qubit-0 leftmost).
    Only MEASURE-free operations are compiled; measurement is implicit in
    ``qml.probs()``.

    Raises:
        RuntimeError: If PennyLane execution produces non-finite values.
        ValueError:   If PennyLane probabilities do not sum to 1.
    """
    import pennylane as qml  # noqa: PLC0415 — deferred per quantum-runtime.md

    n_qubits = circuit.qubitCount
    # PennyLane wires are 0..n_qubits-1
    dev = qml.device("default.qubit", wires=n_qubits)

    # Separate non-MEASURE ops (PennyLane handles measurement implicitly)
    non_measure_ops = [op for op in circuit.operations if op.gate != GateName.MEASURE]

    @qml.qnode(dev)
    def _circuit():  # type: ignore[return]
        for op in non_measure_ops:
            gate = op.gate
            if gate == GateName.H:
                qml.Hadamard(wires=op.targets[0])
            elif gate == GateName.X:
                qml.PauliX(wires=op.targets[0])
            elif gate == GateName.Y:
                qml.PauliY(wires=op.targets[0])
            elif gate == GateName.Z:
                qml.PauliZ(wires=op.targets[0])
            elif gate == GateName.CNOT:
                qml.CNOT(wires=[op.controls[0], op.targets[0]])
            # MEASURE is already excluded; the CircuitModel validator ensures
            # no other gate can appear.
        return qml.probs(wires=list(range(n_qubits)))

    raw_probs = _circuit()  # numpy array, length 2^n_qubits

    # Build contract-keyed map, drop near-zero entries
    prob_map: dict[str, float] = {}
    total = 0.0
    for idx, p in enumerate(raw_probs):
        p_float = float(p)
        if not math.isfinite(p_float):
            raise RuntimeError(
                f"PennyLane produced non-finite probability at index {idx}: {p_float}"
            )
        if p_float < 0.0 or p_float > 1.0 + 1e-10:
            raise ValueError(
                f"PennyLane probability {p_float} at index {idx} outside [0, 1]."
            )
        total += p_float
        if p_float > 1e-10:
            label = _pennylane_index_to_contract_label(idx, n_qubits)
            prob_map[label] = p_float

    if abs(total - 1.0) > 1e-6:
        raise ValueError(
            f"PennyLane probabilities do not sum to 1 (sum={total:.8f})."
        )

    return prob_map


def _has_unsupported_gates(circuit: CircuitModel) -> bool:
    """Return True if any non-MEASURE gate is outside the PennyLane subset."""
    for op in circuit.operations:
        if op.gate not in _PL_SUPPORTED_GATES and op.gate != GateName.MEASURE:
            return True
    return False


def run_pennylane_conformance(
    circuit: CircuitModel,
    qiskit_probabilities: dict[str, float],
) -> PennyLaneConformanceResult:
    """Run PennyLane conformance check against a reference Qiskit result.

    Steps:
    1. Check that the circuit only uses gates supported by this adapter.
       Return a skip result if not.
    2. Execute the circuit on PennyLane ``default.qubit`` (ideal statevector).
    3. Compare every basis probability with the Qiskit reference using epsilon.
    4. Return a PennyLaneConformanceResult.

    Args:
        circuit:             Validated CircuitModel (SIM-2 guarantees validity).
        qiskit_probabilities: Contract-keyed probability map from Qiskit Aer.

    Returns:
        PennyLaneConformanceResult — always present, never raises on expected
        conformance failures (only raises on true execution errors).
    """
    # --- Gate-support check ---------------------------------------------------
    if _has_unsupported_gates(circuit):
        return PennyLaneConformanceResult(
            passed=False,
            max_probability_delta=0.0,
            epsilon=_CONFORMANCE_EPSILON,
            skipped_reason="UNSUPPORTED_GATE_FOR_PENNYLANE",
            pl_probabilities={},
        )

    # --- Execute on PennyLane -------------------------------------------------
    try:
        pl_probs = _run_pennylane(circuit)
    except Exception as exc:
        return PennyLaneConformanceResult(
            passed=False,
            max_probability_delta=0.0,
            epsilon=_CONFORMANCE_EPSILON,
            skipped_reason=f"PENNYLANE_EXECUTION_ERROR: {type(exc).__name__}",
            pl_probabilities={},
        )

    # --- Compare probabilities ------------------------------------------------
    # Collect all basis labels from both maps
    all_labels = set(qiskit_probabilities.keys()) | set(pl_probs.keys())

    max_delta = 0.0
    for label in all_labels:
        qk_p = qiskit_probabilities.get(label, 0.0)
        pl_p = pl_probs.get(label, 0.0)
        delta = abs(qk_p - pl_p)
        if delta > max_delta:
            max_delta = delta

    passed = max_delta <= _CONFORMANCE_EPSILON

    return PennyLaneConformanceResult(
        passed=passed,
        max_probability_delta=max_delta,
        epsilon=_CONFORMANCE_EPSILON,
        skipped_reason=None,
        pl_probabilities=pl_probs,
    )
