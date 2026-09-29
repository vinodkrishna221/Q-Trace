"""Comprehensive unit tests for FEA-1: Gate Model Expansion (CCX, CZ, S, T).

Covers:
  - GateName enum additions (CCX, CZ, S, T)
  - CircuitModel Pydantic v2 validators for CCX, CZ, S, T
  - CircuitModel operations limit expansion to 30
  - Qiskit AST parser for qc.ccx, qc.cz, qc.s, qc.t and limit to 30 ops
  - OpenQASM 3 exporter for CCX, CZ, S, T and round-trip structural validation
  - Qiskit Aer simulation execution for CCX, CZ, S, T, stateTrace and counts
"""

from __future__ import annotations

import math
import pytest
from pydantic import ValidationError

from app.models.circuit import CircuitModel, GateName, Operation
from app.services.quantum.adapter import run_qiskit_aer
from app.services.quantum.openqasm_exporter import (
    ExportError,
    export_openqasm3,
    validate_roundtrip,
)
from app.services.quantum.parser import ParseError, parse_qiskit_code


# ===========================================================================
# 1. GateName Enum & Model Validation Tests
# ===========================================================================

class TestGateNameAndModelValidation:
    """Verifies GateName enum members and Pydantic validators for CCX, CZ, S, T."""

    def test_gate_name_enum_members(self):
        """All required new gates exist in GateName."""
        assert GateName.CCX == "CCX"
        assert GateName.CZ == "CZ"
        assert GateName.S == "S"
        assert GateName.T == "T"
        assert set(GateName) == {
            GateName.H,
            GateName.X,
            GateName.Y,
            GateName.Z,
            GateName.CNOT,
            GateName.MEASURE,
            GateName.CCX,
            GateName.CZ,
            GateName.S,
            GateName.T,
        }

    def test_valid_ccx_circuit(self):
        """Valid 3-qubit Toffoli circuit validates cleanly."""
        cm = CircuitModel(
            id="cm_ccx_valid",
            name="CCX Test",
            qubitCount=3,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.CCX, targets=[2], controls=[0, 1], column=0),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        assert cm.operations[0].gate == GateName.CCX
        assert cm.operations[0].controls == [0, 1]
        assert cm.operations[0].targets == [2]

    def test_invalid_ccx_controls_count(self):
        """CCX with fewer or more than 2 controls must fail."""
        # 1 control
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_ccx_bad_ctrl",
                name="CCX Bad",
                qubitCount=3,
                classicalBitCount=0,
                operations=[
                    Operation(opId="op_1", gate=GateName.CCX, targets=[2], controls=[0], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "exactly 2 controls" in str(exc.value)

        # 3 controls
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_ccx_bad_ctrl3",
                name="CCX Bad 3",
                qubitCount=4,
                classicalBitCount=0,
                operations=[
                    Operation(opId="op_1", gate=GateName.CCX, targets=[3], controls=[0, 1, 2], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "exactly 2 controls" in str(exc.value)

    def test_invalid_ccx_duplicate_controls(self):
        """CCX controls must be distinct."""
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_ccx_dup_ctrl",
                name="CCX Dup Ctrl",
                qubitCount=3,
                classicalBitCount=0,
                operations=[
                    Operation(opId="op_1", gate=GateName.CCX, targets=[2], controls=[1, 1], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "distinct" in str(exc.value)

    def test_invalid_ccx_target_in_controls(self):
        """CCX target cannot be one of the controls."""
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_ccx_tgt_ctrl",
                name="CCX Target in Control",
                qubitCount=3,
                classicalBitCount=0,
                operations=[
                    Operation(opId="op_1", gate=GateName.CCX, targets=[1], controls=[0, 1], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "different qubits" in str(exc.value)

    def test_invalid_ccx_classical_targets(self):
        """CCX must not have classicalTargets."""
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_ccx_classical",
                name="CCX Classical",
                qubitCount=3,
                classicalBitCount=1,
                operations=[
                    Operation(opId="op_1", gate=GateName.CCX, targets=[2], controls=[0, 1], classicalTargets=[0], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "classicalTargets must be empty" in str(exc.value)

    def test_valid_cz_circuit(self):
        """Valid CZ circuit validates cleanly."""
        cm = CircuitModel(
            id="cm_cz_valid",
            name="CZ Test",
            qubitCount=2,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.CZ, targets=[1], controls=[0], column=0),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        assert cm.operations[0].gate == GateName.CZ
        assert cm.operations[0].controls == [0]
        assert cm.operations[0].targets == [1]

    def test_invalid_cz_same_control_and_target(self):
        """CZ control and target cannot be the same qubit."""
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_cz_same",
                name="CZ Same",
                qubitCount=2,
                classicalBitCount=0,
                operations=[
                    Operation(opId="op_1", gate=GateName.CZ, targets=[0], controls=[0], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "different qubits" in str(exc.value)

    def test_invalid_cz_controls_count(self):
        """CZ must have exactly 1 control."""
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_cz_ctrl_count",
                name="CZ Ctrl Count",
                qubitCount=3,
                classicalBitCount=0,
                operations=[
                    Operation(opId="op_1", gate=GateName.CZ, targets=[2], controls=[0, 1], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "exactly 1 control" in str(exc.value)

    def test_valid_s_and_t_circuit(self):
        """Valid S and T gates validate cleanly as single-qubit gates."""
        cm = CircuitModel(
            id="cm_st_valid",
            name="S and T Test",
            qubitCount=2,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.S, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.T, targets=[1], column=1),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        assert len(cm.operations) == 2
        assert cm.operations[0].gate == GateName.S
        assert cm.operations[1].gate == GateName.T

    def test_invalid_s_gate_with_controls(self):
        """S gate cannot have controls."""
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_s_ctrl",
                name="S with Ctrl",
                qubitCount=2,
                classicalBitCount=0,
                operations=[
                    Operation(opId="op_1", gate=GateName.S, targets=[0], controls=[1], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "controls must be empty" in str(exc.value)

    def test_invalid_t_gate_with_controls(self):
        """T gate cannot have controls."""
        with pytest.raises(ValidationError) as exc:
            CircuitModel(
                id="cm_t_ctrl",
                name="T with Ctrl",
                qubitCount=2,
                classicalBitCount=0,
                operations=[
                    Operation(opId="op_1", gate=GateName.T, targets=[0], controls=[1], column=0),
                ],
                source="BUILDER",
                modelVersion=1,
            )
        assert "controls must be empty" in str(exc.value)

    def test_expanded_operation_count_limit(self):
        """CircuitModel supports up to 30 operations (expanded from 20 for Grover)."""
        ops_30 = [
            Operation(opId=f"op_{i}", gate=GateName.H, targets=[0], column=i)
            for i in range(30)
        ]
        cm = CircuitModel(
            id="cm_30_ops",
            name="30 Operations",
            qubitCount=2,
            classicalBitCount=0,
            operations=ops_30,
            source="BUILDER",
            modelVersion=1,
        )
        assert len(cm.operations) == 30

        # 31 operations must fail max_length validator
        ops_31 = [
            Operation(opId=f"op_{i}", gate=GateName.H, targets=[0], column=i)
            for i in range(31)
        ]
        with pytest.raises(ValidationError):
            CircuitModel(
                id="cm_31_ops",
                name="31 Operations",
                qubitCount=2,
                classicalBitCount=0,
                operations=ops_31,
                source="BUILDER",
                modelVersion=1,
            )


# ===========================================================================
# 2. Qiskit AST Parser Tests (qc.ccx, qc.cz, qc.s, qc.t)
# ===========================================================================

class TestSafeQiskitParserExpansion:
    """Verifies AST allowlist and parsing for CCX, CZ, S, T methods."""

    def test_parse_ccx_call(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(3)\n"
            "qc.ccx(0, 1, 2)\n"
        )
        cm = parse_qiskit_code(code)
        assert cm.qubitCount == 3
        assert len(cm.operations) == 1
        op = cm.operations[0]
        assert op.gate == GateName.CCX
        assert op.controls == [0, 1]
        assert op.targets == [2]

    def test_parse_cz_call(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.cz(0, 1)\n"
        )
        cm = parse_qiskit_code(code)
        assert cm.qubitCount == 2
        assert len(cm.operations) == 1
        op = cm.operations[0]
        assert op.gate == GateName.CZ
        assert op.controls == [0]
        assert op.targets == [1]

    def test_parse_s_and_t_calls(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.s(0)\n"
            "qc.t(1)\n"
        )
        cm = parse_qiskit_code(code)
        assert cm.qubitCount == 2
        assert len(cm.operations) == 2
        assert cm.operations[0].gate == GateName.S
        assert cm.operations[0].targets == [0]
        assert cm.operations[1].gate == GateName.T
        assert cm.operations[1].targets == [1]

    def test_parse_ccx_invalid_args_count(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(3)\n"
            "qc.ccx(0, 1)\n"
        )
        with pytest.raises(ParseError) as exc:
            parse_qiskit_code(code)
        assert exc.value.code == "PARSE_ERROR"
        assert "requires exactly 3 args" in exc.value.message

    def test_parse_ccx_duplicate_controls(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(3)\n"
            "qc.ccx(0, 0, 1)\n"
        )
        with pytest.raises(ParseError) as exc:
            parse_qiskit_code(code)
        assert exc.value.code == "PARSE_ERROR"
        assert "distinct" in exc.value.message

    def test_parse_ccx_target_same_as_control(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(3)\n"
            "qc.ccx(0, 1, 1)\n"
        )
        with pytest.raises(ParseError) as exc:
            parse_qiskit_code(code)
        assert exc.value.code == "PARSE_ERROR"
        assert "different qubits" in exc.value.message

    def test_parse_cz_same_qubit(self):
        code = (
            "from qiskit import QuantumCircuit\n"
            "qc = QuantumCircuit(2)\n"
            "qc.cz(0, 0)\n"
        )
        with pytest.raises(ParseError) as exc:
            parse_qiskit_code(code)
        assert exc.value.code == "PARSE_ERROR"
        assert "different qubits" in exc.value.message

    def test_parser_accepts_up_to_30_operations(self):
        """Parser admits circuits with up to 30 operations."""
        lines = ["from qiskit import QuantumCircuit", "qc = QuantumCircuit(2)"]
        for _ in range(30):
            lines.append("qc.h(0)")
        code = "\n".join(lines) + "\n"
        cm = parse_qiskit_code(code)
        assert len(cm.operations) == 30

    def test_parser_rejects_over_30_operations(self):
        """Parser rejects circuits with >30 operations with CIRCUIT_LIMIT_EXCEEDED."""
        lines = ["from qiskit import QuantumCircuit", "qc = QuantumCircuit(2)"]
        for _ in range(31):
            lines.append("qc.h(0)")
        code = "\n".join(lines) + "\n"
        with pytest.raises(ParseError) as exc:
            parse_qiskit_code(code)
        assert exc.value.code == "CIRCUIT_LIMIT_EXCEEDED"
        assert "maximum is 30" in exc.value.message


# ===========================================================================
# 3. OpenQASM 3 Exporter Tests
# ===========================================================================

class TestOpenQASMExporterExpansion:
    """Verifies OpenQASM 3 export and structural round-trip for CCX, CZ, S, T."""

    def test_export_ccx_cz_s_t(self):
        cm = CircuitModel(
            id="cm_qasm_exp",
            name="QASM Expansion Test",
            qubitCount=3,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.S, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.T, targets=[1], column=1),
                Operation(opId="op_3", gate=GateName.CZ, targets=[1], controls=[0], column=2),
                Operation(opId="op_4", gate=GateName.CCX, targets=[2], controls=[0, 1], column=3),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        result = export_openqasm3(cm)
        qasm = result["openQasm3"]
        assert "s q[0];" in qasm
        assert "t q[1];" in qasm
        assert "cz q[0], q[1];" in qasm
        assert "ccx q[0], q[1], q[2];" in qasm

    def test_validate_roundtrip_ccx_cz_s_t(self):
        cm = CircuitModel(
            id="cm_qasm_rt",
            name="QASM RT Test",
            qubitCount=3,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.H, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.S, targets=[0], column=1),
                Operation(opId="op_3", gate=GateName.T, targets=[1], column=2),
                Operation(opId="op_4", gate=GateName.CZ, targets=[1], controls=[0], column=3),
                Operation(opId="op_5", gate=GateName.CCX, targets=[2], controls=[0, 1], column=4),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        warnings = validate_roundtrip(cm)
        assert isinstance(warnings, list)


# ===========================================================================
# 4. Qiskit Aer Simulation Execution Tests
# ===========================================================================

class TestQiskitAerSimulationExpansion:
    """Verifies Aer execution of CCX, CZ, S, T gates."""

    def test_s_gate_simulation(self):
        """S gate: |0> -> |0>, |1> -> i|1>."""
        # On |0>: S|0> = |0>
        cm_s0 = CircuitModel(
            id="cm_s0",
            name="S on 0",
            qubitCount=2,
            classicalBitCount=0,
            operations=[Operation(opId="op_1", gate=GateName.S, targets=[0], column=0)],
            source="BUILDER",
            modelVersion=1,
        )
        res0 = run_qiskit_aer(cm_s0)
        assert res0.probabilities["00"] == pytest.approx(1.0, abs=1e-6)

        # On |1>: X(0) then S(0) -> i|10> (q0 is 1)
        cm_s1 = CircuitModel(
            id="cm_s1",
            name="S on 1",
            qubitCount=2,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.X, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.S, targets=[0], column=1),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        res1 = run_qiskit_aer(cm_s1)
        # In Q-Trace big-endian format: q0 is leftmost bit (q0 q1 -> "10")
        assert res1.probabilities["10"] == pytest.approx(1.0, abs=1e-6)
        amp = res1.stateTrace[-1].amplitudes["10"]
        # Amplitude should have imaginary part ~ 1.0, real part ~ 0.0
        assert amp["re"] == pytest.approx(0.0, abs=1e-6)
        assert amp["im"] == pytest.approx(1.0, abs=1e-6)

    def test_t_gate_simulation(self):
        """T gate: on |1> gives e^(i*pi/4) = 1/sqrt(2) + i/sqrt(2)."""
        cm_t = CircuitModel(
            id="cm_t",
            name="T on 1",
            qubitCount=2,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.X, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.T, targets=[0], column=1),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        res = run_qiskit_aer(cm_t)
        assert res.probabilities["10"] == pytest.approx(1.0, abs=1e-6)
        amp = res.stateTrace[-1].amplitudes["10"]
        inv_sqrt2 = 1.0 / math.sqrt(2.0)
        assert amp["re"] == pytest.approx(inv_sqrt2, abs=1e-6)
        assert amp["im"] == pytest.approx(inv_sqrt2, abs=1e-6)

    def test_cz_gate_simulation(self):
        """CZ gate on |11> gives -|11>."""
        cm_cz = CircuitModel(
            id="cm_cz",
            name="CZ on 11",
            qubitCount=2,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.X, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.X, targets=[1], column=1),
                Operation(opId="op_3", gate=GateName.CZ, targets=[1], controls=[0], column=2),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        res = run_qiskit_aer(cm_cz)
        assert res.probabilities["11"] == pytest.approx(1.0, abs=1e-6)
        amp = res.stateTrace[-1].amplitudes["11"]
        # Amplitude phase flipped to -1.0
        assert amp["re"] == pytest.approx(-1.0, abs=1e-6)
        assert amp["im"] == pytest.approx(0.0, abs=1e-6)

    def test_ccx_toffoli_truth_table(self):
        """CCX flips target |2> iff controls |0> and |1> are both 1."""
        # 1. |110> -> |111> (q0=1, q1=1, q2 flipped to 1)
        cm_110 = CircuitModel(
            id="cm_110",
            name="CCX on 110",
            qubitCount=3,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.X, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.X, targets=[1], column=1),
                Operation(opId="op_3", gate=GateName.CCX, targets=[2], controls=[0, 1], column=2),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        res_110 = run_qiskit_aer(cm_110)
        # All three qubits are 1 -> "111"
        assert res_110.probabilities["111"] == pytest.approx(1.0, abs=1e-6)

        # 2. |100> -> |100> (q0=1, q1=0, target q2 is not flipped)
        cm_100 = CircuitModel(
            id="cm_100",
            name="CCX on 100",
            qubitCount=3,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.X, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.CCX, targets=[2], controls=[0, 1], column=1),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        res_100 = run_qiskit_aer(cm_100)
        # q0=1, q1=0, q2=0 -> in big-endian "100" (q0 q1 q2)
        assert res_100.probabilities["100"] == pytest.approx(1.0, abs=1e-6)

    def test_grover_oracle_diffusion_slice_simulation(self):
        """Test a multi-gate 3-qubit circuit slice with H, CCX, CZ, S, T, and MEASURE."""
        cm = CircuitModel(
            id="cm_grover_slice",
            name="Grover Slice",
            qubitCount=3,
            classicalBitCount=3,
            operations=[
                Operation(opId="op_1", gate=GateName.H, targets=[0], column=0),
                Operation(opId="op_2", gate=GateName.H, targets=[1], column=1),
                Operation(opId="op_3", gate=GateName.H, targets=[2], column=2),
                Operation(opId="op_4", gate=GateName.CZ, targets=[1], controls=[0], column=3),
                Operation(opId="op_5", gate=GateName.CCX, targets=[2], controls=[0, 1], column=4),
                Operation(opId="op_6", gate=GateName.S, targets=[0], column=5),
                Operation(opId="op_7", gate=GateName.T, targets=[1], column=6),
                Operation(opId="op_8", gate=GateName.MEASURE, targets=[0], classicalTargets=[0], column=7),
                Operation(opId="op_9", gate=GateName.MEASURE, targets=[1], classicalTargets=[1], column=8),
                Operation(opId="op_10", gate=GateName.MEASURE, targets=[2], classicalTargets=[2], column=9),
            ],
            source="BUILDER",
            modelVersion=1,
        )
        res = run_qiskit_aer(cm, shots=256)
        # Non-measure gates: 7
        assert len(res.stateTrace) == 7
        # Total probability sums to 1.0
        assert sum(res.probabilities.values()) == pytest.approx(1.0, abs=1e-6)
        # Counts exist and sum to shots
        assert sum(res.counts.values()) == 256
        # Reduced qubits on each step are valid
        for step in res.stateTrace:
            assert len(step.reducedQubits) == 3
            for rq in step.reducedQubits:
                assert rq.label in ("PURE_SUBSYSTEM", "MIXED_SUBSYSTEM")
                assert 0.0 <= rq.purity <= 1.0
