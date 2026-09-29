"""Test suite for FEA-2: Quantum Invariant Linter (F2).

Card TEST command:
  uv run --project apps/api pytest apps/api/tests/unit/quantum/test_linter.py -v

Rules covered:
  - QI-1: Post-collapse unitary gate (WARNING)
  - QI-2: No-cloning violation attempt (INFO)
  - QI-3: Controlled gate wire collision (ERROR)
  - Integration with POST /v1/circuits/lint
  - Integration with POST /v1/circuits/parse-qiskit
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.circuit import (
    CircuitModel,
    GateName,
    LintSeverity,
    Operation,
)
from app.services.quantum.linter import lint_circuit

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test Fixtures & Helpers
# ---------------------------------------------------------------------------

def make_circuit(operations: list[Operation], qubit_count: int = 3, classical_count: int = 2) -> CircuitModel:
    """Helper to construct a valid CircuitModel with ascending column operations."""
    return CircuitModel.model_construct(
        id="cm_lint_test",
        name="Linter Test Circuit",
        qubitCount=qubit_count,
        classicalBitCount=classical_count,
        operations=operations,
        source="BUILDER",
        modelVersion=1,
    )


# ---------------------------------------------------------------------------
# Clean circuits — Zero warnings expected
# ---------------------------------------------------------------------------

class TestCleanCircuits:
    def test_clean_bell_circuit_has_zero_warnings(self):
        ops = [
            Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], column=0),
            Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], column=1),
            Operation(opId="op_3", gate=GateName.MEASURE, targets=[0, 1], classicalTargets=[0, 1], column=2),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=2)
        warnings = lint_circuit(circuit)
        assert len(warnings) == 0

    def test_clean_single_qubit_gates_sequence(self):
        ops = [
            Operation(opId="op_1", gate=GateName.H, targets=[0], column=0),
            Operation(opId="op_2", gate=GateName.X, targets=[1], column=0),
            Operation(opId="op_3", gate=GateName.Y, targets=[0], column=1),
            Operation(opId="op_4", gate=GateName.Z, targets=[1], column=1),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=0)
        warnings = lint_circuit(circuit)
        assert len(warnings) == 0


# ---------------------------------------------------------------------------
# QI-1: Post-collapse unitary gate (WARNING)
# ---------------------------------------------------------------------------

class TestQI1PostCollapseUnitary:
    def test_unitary_after_measure_same_qubit_flags_warning(self):
        ops = [
            Operation(opId="op_1", gate=GateName.H, targets=[0], column=0),
            Operation(opId="op_2", gate=GateName.MEASURE, targets=[0], classicalTargets=[0], column=1),
            Operation(opId="op_3", gate=GateName.H, targets=[0], column=2),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=1)
        warnings = lint_circuit(circuit)

        assert len(warnings) == 1
        w = warnings[0]
        assert w.rule == "QI-1"
        assert w.severity == LintSeverity.WARNING
        assert w.qubit == 0
        assert w.column == 2
        assert w.opId == "op_3"
        assert "Post-collapse unitary: H on q[0] after MEASURE" in w.message

    def test_unitary_on_unmeasured_qubit_does_not_flag_qi1(self):
        ops = [
            Operation(opId="op_1", gate=GateName.MEASURE, targets=[0], classicalTargets=[0], column=0),
            Operation(opId="op_2", gate=GateName.X, targets=[1], column=1),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=1)
        warnings = lint_circuit(circuit)
        assert len(warnings) == 0

    def test_multiple_gates_after_measure_flag_all(self):
        ops = [
            Operation(opId="op_1", gate=GateName.MEASURE, targets=[0], classicalTargets=[0], column=0),
            Operation(opId="op_2", gate=GateName.X, targets=[0], column=1),
            Operation(opId="op_3", gate=GateName.Z, targets=[0], column=2),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=1)
        warnings = lint_circuit(circuit)
        assert len(warnings) == 2
        assert all(w.rule == "QI-1" for w in warnings)
        assert warnings[0].opId == "op_2"
        assert warnings[1].opId == "op_3"

    def test_cnot_with_collapsed_control_flags_warning(self):
        ops = [
            Operation(opId="op_1", gate=GateName.MEASURE, targets=[0], classicalTargets=[0], column=0),
            Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], column=1),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=1)
        warnings = lint_circuit(circuit)
        assert any(w.rule == "QI-1" and w.qubit == 0 for w in warnings)


# ---------------------------------------------------------------------------
# QI-2: No-cloning violation attempt (INFO)
# ---------------------------------------------------------------------------

class TestQI2NoCloningAttempt:
    def test_two_cnots_same_target_in_superposition_flags_qi2(self):
        ops = [
            Operation(opId="op_1", gate=GateName.H, targets=[0], column=0),
            Operation(opId="op_2", gate=GateName.H, targets=[1], column=0),
            Operation(opId="op_3", gate=GateName.CNOT, targets=[1], controls=[0], column=1),
            Operation(opId="op_4", gate=GateName.CNOT, targets=[1], controls=[0], column=2),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=0)
        warnings = lint_circuit(circuit)

        assert any(w.rule == "QI-2" for w in warnings)
        qi2_warn = [w for w in warnings if w.rule == "QI-2"][0]
        assert qi2_warn.severity == LintSeverity.INFO
        assert qi2_warn.qubit == 1
        assert qi2_warn.opId == "op_4"
        assert "No-Cloning Theorem" in qi2_warn.message

    def test_fan_out_cnots_from_superposition_register_flags_qi2(self):
        ops = [
            Operation(opId="op_1", gate=GateName.H, targets=[0], column=0),
            Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], column=1),
            Operation(opId="op_3", gate=GateName.CNOT, targets=[2], controls=[0], column=2),
        ]
        circuit = make_circuit(ops, qubit_count=3, classical_count=0)
        warnings = lint_circuit(circuit)

        assert any(w.rule == "QI-2" for w in warnings)
        qi2_warn = [w for w in warnings if w.rule == "QI-2"][0]
        assert qi2_warn.severity == LintSeverity.INFO
        assert qi2_warn.qubit == 2
        assert qi2_warn.column == 2
        assert qi2_warn.opId == "op_3"

    def test_single_cnot_does_not_flag_qi2(self):
        ops = [
            Operation(opId="op_1", gate=GateName.H, targets=[0], column=0),
            Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], column=1),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=0)
        warnings = lint_circuit(circuit)
        assert not any(w.rule == "QI-2" for w in warnings)


# ---------------------------------------------------------------------------
# QI-3: Controlled gate wire collision (ERROR)
# ---------------------------------------------------------------------------

class TestQI3WireCollision:
    def test_cnot_control_equals_target_flags_error(self):
        ops = [
            Operation(opId="op_1", gate=GateName.CNOT, targets=[0], controls=[0], column=0),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=0)
        warnings = lint_circuit(circuit)

        assert len(warnings) == 1
        w = warnings[0]
        assert w.rule == "QI-3"
        assert w.severity == LintSeverity.ERROR
        assert w.qubit == 0
        assert w.opId == "op_1"
        assert "Wire collision" in w.message
        assert "control q[0] == target q[0]" in w.message

    def test_different_control_and_target_no_collision(self):
        ops = [
            Operation(opId="op_1", gate=GateName.CNOT, targets=[1], controls=[0], column=0),
        ]
        circuit = make_circuit(ops, qubit_count=2, classical_count=0)
        warnings = lint_circuit(circuit)
        assert not any(w.rule == "QI-3" for w in warnings)


# ---------------------------------------------------------------------------
# Generic and dictionary input flexibility
# ---------------------------------------------------------------------------

class TestInputFlexibility:
    def test_lint_circuit_accepts_raw_dict(self):
        raw_dict = {
            "operations": [
                {"opId": "op_1", "gate": "MEASURE", "targets": [0], "controls": [], "column": 0},
                {"opId": "op_2", "gate": "H", "targets": [0], "controls": [], "column": 1},
            ]
        }
        warnings = lint_circuit(raw_dict)
        assert len(warnings) == 1
        assert warnings[0].rule == "QI-1"

    def test_lint_circuit_accepts_list_of_operations(self):
        ops = [
            Operation(opId="op_1", gate=GateName.CNOT, targets=[0], controls=[0], column=0),
        ]
        warnings = lint_circuit(ops)
        assert len(warnings) == 1
        assert warnings[0].rule == "QI-3"


# ---------------------------------------------------------------------------
# HTTP Endpoints: POST /v1/circuits/lint & POST /v1/circuits/parse-qiskit
# ---------------------------------------------------------------------------

class TestLintEndpoints:
    def test_post_lint_clean_circuit_returns_200_empty(self):
        payload = {
            "circuitModel": {
                "id": "cm_clean",
                "name": "Clean Bell",
                "qubitCount": 2,
                "classicalBitCount": 2,
                "operations": [
                    {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
                    {"opId": "op_2", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
                ],
                "source": "BUILDER",
                "modelVersion": 1,
            }
        }
        resp = client.post("/v1/circuits/lint", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "lintWarnings" in data
        assert data["lintWarnings"] == []

    def test_post_lint_post_collapse_circuit_returns_warnings(self):
        payload = {
            "circuitModel": {
                "id": "cm_post_collapse",
                "name": "Post Collapse",
                "qubitCount": 2,
                "classicalBitCount": 2,
                "operations": [
                    {"opId": "op_1", "gate": "MEASURE", "targets": [0], "controls": [], "classicalTargets": [0], "column": 0},
                    {"opId": "op_2", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 1},
                ],
                "source": "BUILDER",
                "modelVersion": 1,
            }
        }
        resp = client.post("/v1/circuits/lint", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["lintWarnings"]) == 1
        w = data["lintWarnings"][0]
        assert w["rule"] == "QI-1"
        assert w["severity"] == "WARNING"
        assert w["qubit"] == 0
        assert w["column"] == 1

    def test_post_lint_wire_collision_returns_error_warning(self):
        payload = {
            "circuitModel": {
                "id": "cm_collision",
                "name": "Collision Circuit",
                "qubitCount": 2,
                "classicalBitCount": 0,
                "operations": [
                    {"opId": "op_1", "gate": "CNOT", "targets": [0], "controls": [0], "classicalTargets": [], "column": 0},
                ],
                "source": "BUILDER",
                "modelVersion": 1,
            }
        }
        resp = client.post("/v1/circuits/lint", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert any(w["rule"] == "QI-3" and w["severity"] == "ERROR" for w in data["lintWarnings"])

    def test_parse_qiskit_populates_lint_warnings(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2, 2)\n"
            "qc.h(0)\n"
            "qc.measure(0, 0)\n"
            "qc.h(0)\n"
        )
        resp = client.post("/v1/circuits/parse-qiskit", json={"code": code, "modelVersion": 1})
        assert resp.status_code == 200
        data = resp.json()
        assert "lintWarnings" in data
        assert len(data["lintWarnings"]) == 1
        w = data["lintWarnings"][0]
        assert w["rule"] == "QI-1"
        assert w["severity"] == "WARNING"
        assert w["qubit"] == 0
        assert w["column"] == 2
        assert w["opId"] == "op_3"

    def test_parse_qiskit_clean_circuit_has_empty_lint_warnings(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2, 2)\n"
            "qc.h(0)\n"
            "qc.cx(0, 1)\n"
            "qc.measure([0, 1], [0, 1])\n"
        )
        resp = client.post("/v1/circuits/parse-qiskit", json={"code": code, "modelVersion": 1})
        assert resp.status_code == 200
        data = resp.json()
        assert "lintWarnings" in data
        assert data["lintWarnings"] == []
