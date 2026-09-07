"""Test suite for SIM-5: parse-qiskit AST parser and OpenQASM 3 exporter.

Card TEST command:
  uv run --project apps/api pytest apps/api/tests/unit/simulation/test_code_and_qasm.py

Coverage:
  - parse_qiskit_code: accepts Bell, round-trips back to CircuitModel.
  - parse_qiskit_code: rejects loops, imports, file/network calls, expressions, unsupported gates.
  - export_openqasm3: round-trips Bell and produces correct QASM string.
  - POST /v1/circuits/parse-qiskit endpoint: 200 on valid, 422 on invalid.
  - POST /v1/circuits/export-openqasm3 endpoint: 200 on valid CircuitModel.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.circuit import CircuitModel, GateName, Operation
from app.services.quantum.openqasm_exporter import ExportError, export_openqasm3
from app.services.quantum.parser import ParseError, parse_qiskit_code

client = TestClient(app)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

BELL_CODE = (
    "from qiskit import QuantumCircuit\n"
    "qc = QuantumCircuit(2, 2)\n"
    "qc.h(0)\n"
    "qc.cx(0, 1)\n"
    "qc.measure([0, 1], [0, 1])\n"
)

BELL_MODEL = CircuitModel(
    id="cm_bell_test",
    name="Bell State",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_1", gate=GateName.H,       targets=[0], controls=[],  classicalTargets=[],    column=0),
        Operation(opId="op_2", gate=GateName.CNOT,    targets=[1], controls=[0], classicalTargets=[],    column=1),
        Operation(opId="op_3", gate=GateName.MEASURE,  targets=[0], controls=[],  classicalTargets=[0],   column=2),
        Operation(opId="op_4", gate=GateName.MEASURE,  targets=[1], controls=[],  classicalTargets=[1],   column=3),
    ],
    source="SEED",
    modelVersion=1,
)

BELL_NO_MEASURE_MODEL = CircuitModel(
    id="cm_bell_no_measure",
    name="Bell no measure",
    qubitCount=2,
    classicalBitCount=0,
    operations=[
        Operation(opId="op_1", gate=GateName.H,    targets=[0], controls=[],  classicalTargets=[], column=0),
        Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
    ],
    source="SEED",
    modelVersion=1,
)


# ===========================================================================
# parse_qiskit_code — ACCEPT cases
# ===========================================================================

class TestParserAccepts:
    def test_bell_circuit_parse_succeeds(self):
        """Bell circuit parses to CircuitModel without error."""
        result = parse_qiskit_code(BELL_CODE)
        assert isinstance(result, CircuitModel)
        assert result.qubitCount == 2
        assert result.classicalBitCount == 2
        assert result.source == "SUPPORTED_QISKIT"
        assert result.modelVersion == 1

    def test_bell_gate_sequence(self):
        """Parsed Bell has correct gate sequence: H, CNOT, MEASURE.
        qc.measure([0, 1], [0, 1]) produces ONE MEASURE op with targets=[0,1].
        """
        result = parse_qiskit_code(BELL_CODE)
        gates = [op.gate for op in result.operations]
        assert gates == [GateName.H, GateName.CNOT, GateName.MEASURE]

    def test_bell_qubit_mapping(self):
        """H on qubit 0; cx control=0, target=1."""
        result = parse_qiskit_code(BELL_CODE)
        h_op = result.operations[0]
        cx_op = result.operations[1]
        assert h_op.gate == GateName.H
        assert h_op.targets == [0]
        assert cx_op.gate == GateName.CNOT
        assert cx_op.controls == [0]
        assert cx_op.targets == [1]

    def test_no_measure_circuit(self):
        """Circuit without measure parses correctly."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.h(0)\n"
            "qc.cx(0, 1)\n"
        )
        result = parse_qiskit_code(code)
        assert result.qubitCount == 2
        assert result.classicalBitCount == 0
        gates = [op.gate for op in result.operations]
        assert gates == [GateName.H, GateName.CNOT]

    def test_all_single_qubit_gates_accepted(self):
        """H, X, Y, Z are all accepted."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.h(0)\n"
            "qc.x(0)\n"
            "qc.y(1)\n"
            "qc.z(1)\n"
        )
        result = parse_qiskit_code(code)
        gates = [op.gate for op in result.operations]
        assert gates == [GateName.H, GateName.X, GateName.Y, GateName.Z]

    def test_max_qubits_accepted(self):
        """5 qubits is within the prototype limit."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(5)\n"
            "qc.h(0)\n"
        )
        result = parse_qiskit_code(code)
        assert result.qubitCount == 5

    def test_columns_are_ascending(self):
        """Each operation gets a unique ascending column."""
        result = parse_qiskit_code(BELL_CODE)
        cols = [op.column for op in result.operations]
        assert cols == sorted(cols)


# ===========================================================================
# parse_qiskit_code — REJECT cases
# ===========================================================================

class TestParserRejects:

    def _assert_parse_error(self, code: str, expected_code: str) -> ParseError:
        with pytest.raises(ParseError) as exc_info:
            parse_qiskit_code(code)
        err = exc_info.value
        assert err.code == expected_code, f"Expected {expected_code}, got {err.code}: {err.message}"
        return err

    # --- Loops ---
    def test_for_loop_rejected(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "for i in range(2):\n"
            "    qc.h(i)\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    def test_while_loop_rejected(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "i = 0\n"
            "while i < 2:\n"
            "    qc.h(0)\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    # --- Imports ---
    def test_arbitrary_import_rejected(self):
        code = (
            "import os\n"
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    def test_extra_qiskit_import_rejected(self):
        """Only QuantumCircuit may be imported from qiskit."""
        code = (
            "from qiskit import QuantumCircuit, transpile\n"
            "qc = QuantumCircuit(2)\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    def test_qiskit_aer_import_rejected(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "from qiskit_aer import AerSimulator\n"
            "qc = QuantumCircuit(2)\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    # --- File / network calls ---
    def test_open_call_rejected(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "open('file.txt')\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    def test_exec_rejected(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "exec('qc.h(0)')\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    def test_eval_rejected(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "eval('1+1')\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    # --- Expressions / dynamic values ---
    def test_variable_as_qubit_index_rejected(self):
        """Qubit index must be an integer literal."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "n = 0\n"
            "qc.h(n)\n"
        )
        # n = 0 is an assignment with a constant RHS, but h(n) passes a Name node
        # The parser should reject the Name arg in gate call
        with pytest.raises(ParseError) as exc_info:
            parse_qiskit_code(code)
        assert exc_info.value.code in ("UNSAFE_CODE", "PARSE_ERROR")

    def test_expression_as_qubit_index_rejected(self):
        """Binary expressions as qubit indices are not allowed."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.h(0 + 1)\n"
        )
        with pytest.raises(ParseError) as exc_info:
            parse_qiskit_code(code)
        assert exc_info.value.code in ("UNSAFE_CODE", "PARSE_ERROR")

    # --- Unsupported gates ---
    def test_rx_gate_rejected(self):
        """RX is outside the supported subset."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.rx(0.5, 0)\n"
        )
        self._assert_parse_error(code, "UNSUPPORTED_GATE")

    def test_ccx_gate_rejected(self):
        """Toffoli (ccx) is not in the prototype subset."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(3)\n"
            "qc.ccx(0, 1, 2)\n"
        )
        self._assert_parse_error(code, "UNSUPPORTED_GATE")

    def test_swap_gate_rejected(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.swap(0, 1)\n"
        )
        self._assert_parse_error(code, "UNSUPPORTED_GATE")

    # --- Circuit limits ---
    def test_six_qubits_rejected(self):
        """6 qubits exceeds prototype limit."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(6)\n"
            "qc.h(0)\n"
        )
        self._assert_parse_error(code, "CIRCUIT_LIMIT_EXCEEDED")

    def test_one_qubit_rejected(self):
        """1 qubit is below prototype minimum."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(1)\n"
            "qc.h(0)\n"
        )
        self._assert_parse_error(code, "CIRCUIT_LIMIT_EXCEEDED")

    def test_empty_code_rejected(self):
        with pytest.raises(ParseError) as exc_info:
            parse_qiskit_code("")
        assert exc_info.value.code == "PARSE_ERROR"

    def test_function_def_rejected(self):
        """Function definitions are not allowed."""
        code = (
            "from qiskit import QuantumCircuit\n"
            "def make_circuit():\n"
            "    qc = QuantumCircuit(2)\n"
            "    return qc\n"
        )
        self._assert_parse_error(code, "UNSAFE_CODE")

    def test_no_circuit_assignment_rejected(self):
        """Code with no QuantumCircuit assignment fails."""
        code = "from qiskit import QuantumCircuit\n"
        with pytest.raises(ParseError) as exc_info:
            parse_qiskit_code(code)
        assert exc_info.value.code == "PARSE_ERROR"


# ===========================================================================
# export_openqasm3 — export and round-trip
# ===========================================================================

class TestOpenQASMExporter:

    def test_bell_export_contains_header(self):
        """Exported QASM starts with OPENQASM 3.0 header."""
        result = export_openqasm3(BELL_NO_MEASURE_MODEL)
        assert result["openQasm3"].startswith("OPENQASM 3.0;")
        assert 'include "stdgates.inc";' in result["openQasm3"]

    def test_bell_export_qubit_register(self):
        result = export_openqasm3(BELL_NO_MEASURE_MODEL)
        assert "qubit[2] q;" in result["openQasm3"]

    def test_bell_export_h_gate(self):
        result = export_openqasm3(BELL_NO_MEASURE_MODEL)
        assert "h q[0];" in result["openQasm3"]

    def test_bell_export_cx_gate(self):
        result = export_openqasm3(BELL_NO_MEASURE_MODEL)
        assert "cx q[0], q[1];" in result["openQasm3"]

    def test_export_not_lossy(self):
        """Supported subset export is not lossy."""
        result = export_openqasm3(BELL_NO_MEASURE_MODEL)
        assert result["lossy"] is False

    def test_export_version(self):
        result = export_openqasm3(BELL_NO_MEASURE_MODEL)
        assert result["openQasmVersion"] == "3.0"

    def test_export_with_measure(self):
        """MEASURE produces 'c[i] = measure q[j];' lines."""
        result = export_openqasm3(BELL_MODEL)
        qasm = result["openQasm3"]
        assert "c[0] = measure q[0];" in qasm
        assert "c[1] = measure q[1];" in qasm
        assert "bit[2] c;" in qasm

    def test_export_with_all_single_qubit_gates(self):
        model = CircuitModel(
            id="cm_all_gates",
            name="All gates",
            qubitCount=2,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
                Operation(opId="op_2", gate=GateName.X, targets=[1], controls=[], classicalTargets=[], column=1),
                Operation(opId="op_3", gate=GateName.Y, targets=[0], controls=[], classicalTargets=[], column=2),
                Operation(opId="op_4", gate=GateName.Z, targets=[1], controls=[], classicalTargets=[], column=3),
            ],
            source="SEED",
            modelVersion=1,
        )
        result = export_openqasm3(model)
        qasm = result["openQasm3"]
        assert "h q[0];" in qasm
        assert "x q[1];" in qasm
        assert "y q[0];" in qasm
        assert "z q[1];" in qasm

    def test_roundtrip_bell_parse_then_export(self):
        """Parse Bell code → CircuitModel; export to QASM; QASM contains expected gates."""
        parsed = parse_qiskit_code(
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.h(0)\n"
            "qc.cx(0, 1)\n"
        )
        result = export_openqasm3(parsed)
        qasm = result["openQasm3"]
        assert "h q[0];" in qasm
        assert "cx q[0], q[1];" in qasm
        assert result["lossy"] is False


# ===========================================================================
# HTTP endpoint tests
# ===========================================================================

class TestParseQiskitEndpoint:

    def test_valid_bell_returns_200(self):
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": BELL_CODE, "modelVersion": 1},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "circuitModel" in data
        cm = data["circuitModel"]
        assert cm["qubitCount"] == 2
        assert cm["source"] == "SUPPORTED_QISKIT"
        assert cm["modelVersion"] == 1

    def test_valid_bell_gate_sequence(self):
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": BELL_CODE, "modelVersion": 1},
        )
        assert resp.status_code == 200
        gates = [op["gate"] for op in resp.json()["circuitModel"]["operations"]]
        assert gates == ["H", "CNOT", "MEASURE"]

    def test_for_loop_returns_422(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "for i in range(2):\n"
            "    qc.h(i)\n"
        )
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": code, "modelVersion": 1},
        )
        assert resp.status_code == 422
        error = resp.json()["error"]
        assert error["code"] == "UNSAFE_CODE"
        assert "requestId" in error

    def test_unsupported_gate_returns_422(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.rx(0.5, 0)\n"
        )
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": code, "modelVersion": 1},
        )
        assert resp.status_code == 422
        assert resp.json()["error"]["code"] == "UNSUPPORTED_GATE"

    def test_arbitrary_import_returns_422(self):
        code = "import os\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\n"
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": code, "modelVersion": 1},
        )
        assert resp.status_code == 422

    def test_six_qubits_returns_422(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(6)\n"
            "qc.h(0)\n"
        )
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": code, "modelVersion": 1},
        )
        assert resp.status_code == 422
        assert resp.json()["error"]["code"] == "CIRCUIT_LIMIT_EXCEEDED"

    def test_exec_in_code_returns_422(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "exec('qc.h(0)')\n"
        )
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": code, "modelVersion": 1},
        )
        assert resp.status_code == 422

    def test_network_call_open_returns_422(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "open('/etc/passwd')\n"
        )
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": code, "modelVersion": 1},
        )
        assert resp.status_code == 422

    def test_expression_qubit_index_returns_422(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.h(0 + 1)\n"
        )
        resp = client.post(
            "/v1/circuits/parse-qiskit",
            json={"code": code, "modelVersion": 1},
        )
        assert resp.status_code == 422


class TestExportOpenQasm3Endpoint:

    def _bell_payload(self):
        return {
            "circuitModel": {
                "id": "cm_bell_seed",
                "name": "Bell State Seed",
                "qubitCount": 2,
                "classicalBitCount": 2,
                "operations": [
                    {"opId": "op_1", "gate": "H",       "targets": [0], "controls": [],  "classicalTargets": [],  "column": 0},
                    {"opId": "op_2", "gate": "CNOT",    "targets": [1], "controls": [0], "classicalTargets": [],  "column": 1},
                    {"opId": "op_3", "gate": "MEASURE",  "targets": [0], "controls": [],  "classicalTargets": [0], "column": 2},
                    {"opId": "op_4", "gate": "MEASURE",  "targets": [1], "controls": [],  "classicalTargets": [1], "column": 3},
                ],
                "source": "SEED",
                "modelVersion": 1,
            }
        }

    def test_bell_export_returns_200(self):
        resp = client.post("/v1/circuits/export-openqasm3", json=self._bell_payload())
        assert resp.status_code == 200
        data = resp.json()
        assert data["openQasmVersion"] == "3.0"
        assert data["lossy"] is False
        assert "OPENQASM 3.0;" in data["openQasm3"]

    def test_bell_export_h_and_cx_in_qasm(self):
        resp = client.post("/v1/circuits/export-openqasm3", json=self._bell_payload())
        assert resp.status_code == 200
        qasm = resp.json()["openQasm3"]
        assert "h q[0];" in qasm
        assert "cx q[0], q[1];" in qasm

    def test_bell_export_measure_in_qasm(self):
        resp = client.post("/v1/circuits/export-openqasm3", json=self._bell_payload())
        qasm = resp.json()["openQasm3"]
        assert "c[0] = measure q[0];" in qasm
        assert "c[1] = measure q[1];" in qasm

    def test_contract_example_no_measure(self):
        """Contract example from circuit-simulation.md (no MEASURE)."""
        payload = {
            "circuitModel": {
                "id": "cm_bell_seed",
                "name": "Bell State Seed",
                "qubitCount": 2,
                "classicalBitCount": 2,
                "operations": [
                    {"opId": "op_1", "gate": "H",    "targets": [0], "controls": [],  "classicalTargets": [], "column": 0},
                    {"opId": "op_2", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
                ],
                "source": "SEED",
                "modelVersion": 1,
            }
        }
        resp = client.post("/v1/circuits/export-openqasm3", json=payload)
        assert resp.status_code == 200
        qasm = resp.json()["openQasm3"]
        # Contract expected: "OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nh q[0];\ncx q[0], q[1];\n"
        assert "h q[0];" in qasm
        assert "cx q[0], q[1];" in qasm
