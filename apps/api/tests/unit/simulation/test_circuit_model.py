"""SIM-2 card TEST — Validate the canonical Circuit Model.

Proves:
  1. Accepts the canonical Bell circuit (H on q0, CNOT q0→q1, MEASURE both)
  2. Rejects gate RX (not in closed enum)
  3. Rejects qubitCount=6 (> 5 limit)
  4. Rejects duplicate opId values
  5. Rejects CNOT with control == target (invalid mapping)
  6. Rejects CNOT with missing control
  7. Rejects target qubit index >= qubitCount
  8. Rejects MEASURE with mismatched targets / classicalTargets
  9. Rejects non-MEASURE gate with classicalTargets present
  10. Rejects operations out of column order

Run with:
  uv run --project apps/api --extra dev pytest apps/api/tests/unit/simulation/test_circuit_model.py -v
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.models.circuit import CircuitModel, GateName, Operation


# ---------------------------------------------------------------------------
# Helper — minimal Bell state circuit (2 qubits, H + CNOT + MEASURE×2)
# ---------------------------------------------------------------------------

def _bell_ops() -> list[dict]:
    return [
        {"opId": "op_1", "gate": "H",     "targets": [0], "controls": [],  "classicalTargets": [], "column": 0},
        {"opId": "op_2", "gate": "CNOT",  "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
        {"opId": "op_3", "gate": "MEASURE","targets": [0], "controls": [],  "classicalTargets": [0],"column": 2},
        {"opId": "op_4", "gate": "MEASURE","targets": [1], "controls": [],  "classicalTargets": [1],"column": 2},
    ]


def _bell_payload(**overrides) -> dict:
    base = {
        "id": "cm_bell_seed",
        "name": "Bell State Seed",
        "qubitCount": 2,
        "classicalBitCount": 2,
        "operations": _bell_ops(),
        "source": "SEED",
        "modelVersion": 1,
    }
    base.update(overrides)
    return base


# ---------------------------------------------------------------------------
# 1. Accept valid Bell circuit
# ---------------------------------------------------------------------------

def test_accepts_bell_circuit():
    model = CircuitModel.model_validate(_bell_payload())
    assert model.qubitCount == 2
    assert len(model.operations) == 4
    assert model.operations[0].gate == GateName.H
    assert model.operations[1].gate == GateName.CNOT
    assert model.modelVersion == 1
    assert model.source == "SEED"


def test_accepts_all_supported_single_qubit_gates():
    """H, X, Y, Z each accepted on qubit 0."""
    for gate in ("H", "X", "Y", "Z"):
        payload = _bell_payload(
            operations=[
                {"opId": "op_1", "gate": gate, "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
            ],
            qubitCount=2,
            classicalBitCount=0,
        )
        model = CircuitModel.model_validate(payload)
        assert model.operations[0].gate.value == gate


# ---------------------------------------------------------------------------
# 2. Reject unsupported gate RX
# ---------------------------------------------------------------------------

def test_rejects_gate_rx():
    payload = _bell_payload(
        operations=[
            {"opId": "op_1", "gate": "RX", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
        ]
    )
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(payload)
    assert "gate" in str(exc_info.value).lower() or "rx" in str(exc_info.value).lower()


def test_rejects_gate_ry():
    payload = _bell_payload(
        operations=[
            {"opId": "op_1", "gate": "RY", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
        ]
    )
    with pytest.raises(ValidationError):
        CircuitModel.model_validate(payload)


# ---------------------------------------------------------------------------
# 3. Reject qubitCount=6 (exceeds limit of 5)
# ---------------------------------------------------------------------------

def test_rejects_six_qubits():
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(qubitCount=6))
    errors = exc_info.value.errors()
    assert any("qubitCount" in str(e) or "less than" in str(e).lower() or "le" in str(e).lower()
               for e in errors)


def test_rejects_one_qubit():
    """qubitCount < 2 also invalid."""
    with pytest.raises(ValidationError):
        CircuitModel.model_validate(_bell_payload(qubitCount=1))


def test_accepts_qubit_count_5():
    """5 qubits is at the upper boundary — must be accepted."""
    ops = [
        {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
    ]
    model = CircuitModel.model_validate(_bell_payload(qubitCount=5, classicalBitCount=0, operations=ops))
    assert model.qubitCount == 5


# ---------------------------------------------------------------------------
# 4. Reject duplicate opId
# ---------------------------------------------------------------------------

def test_rejects_duplicate_op_ids():
    ops = [
        {"opId": "op_1", "gate": "H",    "targets": [0], "controls": [],  "classicalTargets": [], "column": 0},
        {"opId": "op_1", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
    ]
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(operations=ops))
    assert "duplicate" in str(exc_info.value).lower() or "op_1" in str(exc_info.value)


# ---------------------------------------------------------------------------
# 5. Reject invalid control/target mappings
# ---------------------------------------------------------------------------

def test_rejects_cnot_control_equals_target():
    """CNOT where control == target is physically meaningless."""
    ops = [
        {"opId": "op_1", "gate": "CNOT", "targets": [0], "controls": [0], "classicalTargets": [], "column": 0},
    ]
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(operations=ops))
    assert "different" in str(exc_info.value).lower() or "control" in str(exc_info.value).lower()


def test_rejects_cnot_missing_control():
    """CNOT with no control qubit."""
    ops = [
        {"opId": "op_1", "gate": "CNOT", "targets": [1], "controls": [], "classicalTargets": [], "column": 0},
    ]
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(operations=ops))
    assert "control" in str(exc_info.value).lower()


def test_rejects_target_qubit_out_of_bounds():
    """Target qubit index >= qubitCount."""
    ops = [
        {"opId": "op_1", "gate": "H", "targets": [5], "controls": [], "classicalTargets": [], "column": 0},
    ]
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(qubitCount=2, operations=ops))
    assert "qubit" in str(exc_info.value).lower() or "target" in str(exc_info.value).lower()


def test_rejects_control_qubit_out_of_bounds():
    """Control qubit index >= qubitCount."""
    ops = [
        {"opId": "op_1", "gate": "CNOT", "targets": [0], "controls": [9], "classicalTargets": [], "column": 0},
    ]
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(qubitCount=2, operations=ops))
    assert "control" in str(exc_info.value).lower() or "qubit" in str(exc_info.value).lower()


# ---------------------------------------------------------------------------
# 6. Reject MEASURE mismatches
# ---------------------------------------------------------------------------

def test_rejects_measure_mismatched_classical_targets():
    """MEASURE with 2 target qubits but only 1 classical target."""
    ops = [
        {"opId": "op_1", "gate": "MEASURE", "targets": [0, 1], "controls": [], "classicalTargets": [0], "column": 0},
    ]
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(qubitCount=2, classicalBitCount=2, operations=ops))
    assert "classicaltargets" in str(exc_info.value).lower() or "targets" in str(exc_info.value).lower()


# ---------------------------------------------------------------------------
# 7. Reject non-MEASURE gate with classicalTargets
# ---------------------------------------------------------------------------

def test_rejects_h_with_classical_targets():
    """H gate must have empty classicalTargets."""
    ops = [
        {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [0], "column": 0},
    ]
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(classicalBitCount=2, operations=ops))
    assert "classicaltargets" in str(exc_info.value).lower() or "empty" in str(exc_info.value).lower()


# ---------------------------------------------------------------------------
# 8. Reject operations not in column order
# ---------------------------------------------------------------------------

def test_rejects_out_of_column_order():
    """Operations with descending columns must be rejected."""
    ops = [
        {"opId": "op_1", "gate": "CNOT",   "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
        {"opId": "op_2", "gate": "H",      "targets": [0], "controls": [],  "classicalTargets": [], "column": 0},
    ]
    with pytest.raises(ValidationError) as exc_info:
        CircuitModel.model_validate(_bell_payload(classicalBitCount=0, operations=ops))
    assert "column" in str(exc_info.value).lower() or "order" in str(exc_info.value).lower()


# ---------------------------------------------------------------------------
# 9. GateName enum surface
# ---------------------------------------------------------------------------

def test_gate_name_enum_values():
    supported = {g.value for g in GateName}
    assert supported == {"H", "X", "Y", "Z", "CNOT", "MEASURE"}


# ---------------------------------------------------------------------------
# 10. Operation model standalone
# ---------------------------------------------------------------------------

def test_operation_rejects_negative_qubit_index():
    with pytest.raises(ValidationError):
        Operation(opId="op_1", gate=GateName.H, targets=[-1], controls=[], classicalTargets=[], column=0)
