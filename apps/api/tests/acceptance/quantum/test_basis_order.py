"""QA-4: Asymmetric basis-order acceptance tests.

Verifies that the normalizer maps qubit-0 to the MSB (leftmost character) in
contract basis labels, and that a deliberately reversed mapper produces a
detectably wrong result.

Key rule (quantum-runtime.md):
  "Normalize Qiskit and PennyLane wire/basis order at the adapter boundary
   with one tested mapping function."

Golden fixture note (asymmetric_bit_order_run.json):
  H on qubit-0 only, qubit-1 idle → expected P(00)=0.5, P(10)=0.5.
  A reversed mapper would produce {"01": 0.5, "00": 0.5} instead.
"""

import json
from pathlib import Path

import pytest

FIXTURES_DIR = Path(__file__).parents[3] / "tests" / "fixtures" / "golden"


def _load_golden(name: str) -> dict:
    return json.loads((FIXTURES_DIR / f"{name}.json").read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# Test 1 — Normalizer: correct mapping for asymmetric circuit
# ---------------------------------------------------------------------------

def test_qiskit_index_to_contract_label_correct_order():
    """qubit-0 is MSB (leftmost). Qiskit index 1 (binary '01') → contract '10'."""
    from app.services.quantum.normalizer import qiskit_index_to_contract_label

    # 2-qubit system
    # Qiskit index 0 (00) → contract "00"
    assert qiskit_index_to_contract_label(0, 2) == "00"
    # Qiskit index 1 (01) → qubit-0=1, qubit-1=0 → contract "10"
    assert qiskit_index_to_contract_label(1, 2) == "10"
    # Qiskit index 2 (10) → qubit-0=0, qubit-1=1 → contract "01"
    assert qiskit_index_to_contract_label(2, 2) == "01"
    # Qiskit index 3 (11) → contract "11"
    assert qiskit_index_to_contract_label(3, 2) == "11"


def test_reversed_mapper_is_detectably_wrong():
    """A reversed mapping (LSB-as-MSB) produces '01' where '10' is expected.

    This is the deliberately-wrong variant QA-4 must catch, as described in
    the golden fixture's _basisOrderNote.
    """
    from app.services.quantum.normalizer import qiskit_index_to_contract_label

    # Correct: H on qubit-0, qubit-1 idle → Qiskit index 1 maps to "10"
    correct_label = qiskit_index_to_contract_label(1, 2)
    assert correct_label == "10", f"Expected '10', got '{correct_label}'"

    # Deliberately wrong mapper: does NOT reverse (keeps Qiskit's little-endian)
    def reversed_wrong_mapper(qiskit_index: int, n_qubits: int) -> str:
        """Wrong: keeps Qiskit bit order instead of reversing to contract order."""
        return format(qiskit_index, f"0{n_qubits}b")  # no [::-1] reversal

    wrong_label = reversed_wrong_mapper(1, 2)
    assert wrong_label == "01", f"Reversed (wrong) mapper should give '01', got '{wrong_label}'"

    # They must differ — proving the two are distinct and the test catches the bug
    assert correct_label != wrong_label, (
        "Correct and wrong mappers should differ for asymmetric circuits"
    )


# ---------------------------------------------------------------------------
# Test 2 — Adapter end-to-end: H on qubit-0 produces "10" not "01"
# ---------------------------------------------------------------------------

import os
pytestmark_skip = pytest.mark.skipif(
    os.getenv("ENABLE_QISKIT", "1") == "0",
    reason="ENABLE_QISKIT=0",
)


@pytestmark_skip
def test_aer_asymmetric_circuit_basis_order():
    """Adapter result matches golden: H on qubit-0 → P(00)=0.5, P(10)=0.5."""
    from app.models.circuit import CircuitModel, GateName, Operation
    from app.services.quantum.adapter import run_qiskit_aer

    circuit = CircuitModel(
        id="cm_asym",
        name="Asymmetric H on qubit-0",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.MEASURE, targets=[0], controls=[], classicalTargets=[0], column=1),
            Operation(opId="op_3", gate=GateName.MEASURE, targets=[1], controls=[], classicalTargets=[1], column=1),
        ],
        source="BUILDER",
        modelVersion=1,
    )

    result = run_qiskit_aer(circuit, shots=1024)
    probs = result.probabilities

    # Key assertions: qubit-0 in superposition, qubit-1 idle → P(10) ~0.5, P(00) ~0.5
    # "10" means qubit-0=1, qubit-1=0 (qubit-0 is leftmost/MSB)
    assert "10" in probs, f"Expected '10' in probabilities, got: {list(probs.keys())}"
    assert "00" in probs, f"Expected '00' in probabilities, got: {list(probs.keys())}"
    assert "01" not in probs, (
        f"Found '01' in probabilities — this would indicate reversed mapper bug. Got: {probs}"
    )
    assert "11" not in probs, (
        f"Found '11' in probabilities — unexpected. Got: {probs}"
    )

    EPSILON = 1e-6
    golden = _load_golden("asymmetric_bit_order_run")["simulationRun"]
    for basis, expected in golden["probabilities"].items():
        actual = probs.get(basis, 0.0)
        assert abs(actual - expected) <= EPSILON, (
            f"Asymmetric P({basis})={actual} disagrees with golden {expected}"
        )


@pytestmark_skip
def test_pennylane_asymmetric_circuit_basis_order():
    """PennyLane also maps H on qubit-0 to P(00)=0.5, P(10)=0.5 within epsilon."""
    from app.models.circuit import CircuitModel, GateName, Operation
    from app.services.quantum.adapter import run_qiskit_aer
    from app.services.quantum.pennylane_adapter import run_pennylane_conformance

    circuit = CircuitModel(
        id="cm_asym_pl",
        name="Asymmetric H on qubit-0 PL",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.MEASURE, targets=[0], controls=[], classicalTargets=[0], column=1),
            Operation(opId="op_3", gate=GateName.MEASURE, targets=[1], controls=[], classicalTargets=[1], column=1),
        ],
        source="BUILDER",
        modelVersion=1,
    )

    aer_result = run_qiskit_aer(circuit, shots=1024)
    conformance = run_pennylane_conformance(circuit, aer_result.probabilities)

    assert conformance.skipped_reason is None
    assert conformance.passed, (
        f"PennyLane/Qiskit disagree on asymmetric circuit: delta={conformance.max_probability_delta}"
    )
