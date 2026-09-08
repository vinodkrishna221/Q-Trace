"""QA-4: Trace-before-measurement and reduced-state purity acceptance tests.

Verifies two key quantum-runtime.md rules:
  1. MEASURE gates do NOT appear in stateTrace steps.
  2. Post-CNOT reduced qubits carry purity=0.5 and label=MIXED_SUBSYSTEM.

These tests consume the adapter implementation directly (cross-track acceptance).
"""

import os
import pytest

pytestmark = pytest.mark.skipif(
    os.getenv("ENABLE_QISKIT", "1") == "0",
    reason="ENABLE_QISKIT=0 — Qiskit Aer not available",
)


def _bell_circuit():
    from app.models.circuit import CircuitModel, GateName, Operation
    return CircuitModel(
        id="cm_bell_purity",
        name="Bell purity test",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate=GateName.H,       targets=[0], controls=[],  classicalTargets=[],  column=0),
            Operation(opId="op_2", gate=GateName.CNOT,    targets=[1], controls=[0], classicalTargets=[],  column=1),
            Operation(opId="op_3", gate=GateName.MEASURE, targets=[0], controls=[],  classicalTargets=[0], column=2),
            Operation(opId="op_4", gate=GateName.MEASURE, targets=[1], controls=[],  classicalTargets=[1], column=2),
        ],
        source="BUILDER",
        modelVersion=1,
    )


# ---------------------------------------------------------------------------
# Test 1 — MEASURE excluded from stateTrace
# ---------------------------------------------------------------------------

def test_measure_excluded_from_state_trace():
    """MEASURE operations must NOT appear in any stateTrace step.

    quantum-runtime.md: "Save pre-measurement statevector for State Trace;
    sample measurement counts in a separate execution/result path."
    """
    from app.services.quantum.adapter import run_qiskit_aer

    circuit = _bell_circuit()
    result = run_qiskit_aer(circuit, shots=1024)

    from app.models.circuit import GateName
    for step in result.stateTrace:
        # The stateTrace step's operationId maps to a non-MEASURE op
        matching_ops = [op for op in circuit.operations if op.opId == step.operationId]
        assert matching_ops, f"stateTrace references unknown opId: {step.operationId}"
        assert matching_ops[0].gate != GateName.MEASURE, (
            f"stateTrace step {step.stepIndex} references a MEASURE operation "
            f"(opId={step.operationId}) — MEASURE must be excluded from trace."
        )


def test_state_trace_length_equals_non_measure_ops():
    """stateTrace must have exactly one entry per non-MEASURE gate (Bell: H + CNOT = 2)."""
    from app.services.quantum.adapter import run_qiskit_aer
    from app.models.circuit import GateName

    circuit = _bell_circuit()
    result = run_qiskit_aer(circuit, shots=1024)

    non_measure_count = sum(1 for op in circuit.operations if op.gate != GateName.MEASURE)
    assert len(result.stateTrace) == non_measure_count, (
        f"Expected {non_measure_count} stateTrace steps (one per non-MEASURE gate), "
        f"got {len(result.stateTrace)}"
    )


# ---------------------------------------------------------------------------
# Test 2 — Post-CNOT purity: both qubits MIXED_SUBSYSTEM
# ---------------------------------------------------------------------------

def test_post_cnot_reduced_state_purity_mixed():
    """After CNOT on Bell state, both qubits are entangled → purity ≈ 0.5 = MIXED_SUBSYSTEM.

    quantum-runtime.md: "Purity < 1 must carry MIXED_SUBSYSTEM."
    contract: post-CNOT reducedQubits purity=0.5, label=MIXED_SUBSYSTEM.
    """
    from app.services.quantum.adapter import run_qiskit_aer

    circuit = _bell_circuit()
    result = run_qiskit_aer(circuit, shots=1024)

    # stepIndex 1 = After CNOT (the second step)
    assert len(result.stateTrace) >= 2, "Expected at least 2 stateTrace steps for Bell circuit"
    cnot_step = result.stateTrace[1]  # index 1 = After CNOT

    assert cnot_step.operationId == "op_2", (
        f"Expected stateTrace[1].operationId='op_2' (CNOT), got '{cnot_step.operationId}'"
    )
    assert len(cnot_step.reducedQubits) == 2, (
        f"Expected 2 reducedQubits in CNOT step, got {len(cnot_step.reducedQubits)}"
    )

    PURITY_TOLERANCE = 1e-6
    for rq in cnot_step.reducedQubits:
        assert abs(rq.purity - 0.5) <= PURITY_TOLERANCE, (
            f"qubit {rq.qubit}: expected purity≈0.5, got {rq.purity}"
        )
        assert rq.label == "MIXED_SUBSYSTEM", (
            f"qubit {rq.qubit}: expected label='MIXED_SUBSYSTEM', got '{rq.label}'"
        )


def test_after_h_qubit0_pure_qubit1_pure():
    """After H on qubit-0 only, qubit-0 is pure (superposition), qubit-1 is |0⟩ (also pure).

    contract: stateTrace[0].reducedQubits → both PURE_SUBSYSTEM, purity=1.0.
    """
    from app.services.quantum.adapter import run_qiskit_aer

    circuit = _bell_circuit()
    result = run_qiskit_aer(circuit, shots=1024)

    h_step = result.stateTrace[0]  # index 0 = After H
    assert h_step.operationId == "op_1"

    PURITY_TOLERANCE = 1e-6
    for rq in h_step.reducedQubits:
        assert abs(rq.purity - 1.0) <= PURITY_TOLERANCE, (
            f"qubit {rq.qubit}: after H (pre-CNOT) expected purity=1.0, got {rq.purity}"
        )
        assert rq.label == "PURE_SUBSYSTEM", (
            f"qubit {rq.qubit}: after H expected 'PURE_SUBSYSTEM', got '{rq.label}'"
        )


# ---------------------------------------------------------------------------
# Test 3 — probabilities are finite, within [0,1], sum to 1
# ---------------------------------------------------------------------------

def test_final_probabilities_are_valid():
    """All output probabilities are finite, in [0,1], and sum within tolerance."""
    import math
    from app.services.quantum.adapter import run_qiskit_aer

    circuit = _bell_circuit()
    result = run_qiskit_aer(circuit, shots=1024)

    total = 0.0
    for basis, p in result.probabilities.items():
        assert math.isfinite(p), f"Non-finite probability for '{basis}': {p}"
        assert 0.0 <= p <= 1.0 + 1e-10, f"Probability {p} for '{basis}' outside [0,1]"
        total += p

    assert abs(total - 1.0) <= 1e-6, f"Probabilities sum to {total}, expected 1.0"
