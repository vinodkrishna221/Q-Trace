"""Unit and integration tests for Google Cirq adapter and Tri-Engine Conformance Arena — FEA-8.

Tests:
  1. Circuit construction: single-qubit gates (H, X, Y, Z, S, T), two-qubit gates (CNOT, CZ), three-qubit (CCX).
  2. Measure flag handling (include_measure True vs False).
  3. Endianness normalization between big-endian (Cirq/PennyLane) and little-endian (Qiskit).
  4. Cirq simulation execution and output structure.
  5. Cross-engine statevector conformance: Qiskit Aer vs Cirq vs PennyLane (delta <= 1e-6).
  6. Multi-engine simulation service integration (build_simulation_run with backends).
  7. API route integration: POST /v1/simulation-runs with backends parameter.
"""

from __future__ import annotations

import math
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.circuit import CircuitModel, GateName, Operation
from app.models.simulation import SimulationRunRequest
from app.services.quantum.adapter import run_qiskit_aer
from app.services.quantum.cirq_adapter import build_cirq_circuit, run_cirq
from app.services.quantum.normalizer import normalize_statevector
from app.services.quantum.pennylane_adapter import run_pennylane_statevector
from app.services.simulation_service import build_simulation_run


# --- Fixtures / Helpers -----------------------------------------------------

def _make_bell_circuit() -> CircuitModel:
    return CircuitModel(
        id="cm_bell_conformance",
        name="Bell State Conformance",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
            Operation(opId="op_3", gate=GateName.MEASURE, targets=[0], controls=[], classicalTargets=[0], column=2),
            Operation(opId="op_4", gate=GateName.MEASURE, targets=[1], controls=[], classicalTargets=[1], column=2),
        ],
        source="BUILDER",
        modelVersion=1,
    )


def _make_toffoli_circuit() -> CircuitModel:
    """3-qubit circuit: X(0), X(1), CCX(0,1,2) -> state |111>."""
    return CircuitModel(
        id="cm_toffoli_conformance",
        name="Toffoli Conformance",
        qubitCount=3,
        classicalBitCount=3,
        operations=[
            Operation(opId="op_1", gate=GateName.X, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.X, targets=[1], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_3", gate=GateName.CCX, targets=[2], controls=[0, 1], classicalTargets=[], column=1),
        ],
        source="BUILDER",
        modelVersion=1,
    )


def _make_multi_gate_circuit() -> CircuitModel:
    """3-qubit circuit with H, X, Y, Z, S, T, CNOT, CZ, CCX."""
    return CircuitModel(
        id="cm_multi_conformance",
        name="Multi-Gate Conformance",
        qubitCount=3,
        classicalBitCount=3,
        operations=[
            Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.X, targets=[1], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_3", gate=GateName.Y, targets=[2], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_4", gate=GateName.Z, targets=[0], controls=[], classicalTargets=[], column=1),
            Operation(opId="op_5", gate=GateName.S, targets=[1], controls=[], classicalTargets=[], column=1),
            Operation(opId="op_6", gate=GateName.T, targets=[2], controls=[], classicalTargets=[], column=1),
            Operation(opId="op_7", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=2),
            Operation(opId="op_8", gate=GateName.CZ, targets=[2], controls=[1], classicalTargets=[], column=3),
            Operation(opId="op_9", gate=GateName.CCX, targets=[2], controls=[0, 1], classicalTargets=[], column=4),
        ],
        source="BUILDER",
        modelVersion=1,
    )


# --- Unit Tests: Circuit Construction ---------------------------------------

def test_build_cirq_circuit_single_qubit_gates():
    model = CircuitModel(
        id="cm_single_gates",
        name="Single Qubit Gates",
        qubitCount=3,
        classicalBitCount=0,
        operations=[
            Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.X, targets=[1], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_3", gate=GateName.Y, targets=[2], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_4", gate=GateName.Z, targets=[0], controls=[], classicalTargets=[], column=1),
            Operation(opId="op_5", gate=GateName.S, targets=[1], controls=[], classicalTargets=[], column=1),
            Operation(opId="op_6", gate=GateName.T, targets=[2], controls=[], classicalTargets=[], column=1),
        ],
        source="BUILDER",
        modelVersion=1,
    )
    circuit = build_cirq_circuit(model)
    # Check that all 6 operations are present
    all_ops = list(circuit.all_operations())
    assert len(all_ops) == 6


def test_build_cirq_circuit_two_and_three_qubit_gates():
    model = CircuitModel(
        id="cm_multi_qubit",
        name="Two and Three Qubit Gates",
        qubitCount=3,
        classicalBitCount=0,
        operations=[
            Operation(opId="op_1", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.CZ, targets=[2], controls=[1], classicalTargets=[], column=1),
            Operation(opId="op_3", gate=GateName.CCX, targets=[2], controls=[0, 1], classicalTargets=[], column=2),
        ],
        source="BUILDER",
        modelVersion=1,
    )
    circuit = build_cirq_circuit(model)
    all_ops = list(circuit.all_operations())
    assert len(all_ops) == 3


def test_build_cirq_circuit_measurement_flag():
    bell = _make_bell_circuit()
    c_with = build_cirq_circuit(bell, include_measure=True)
    c_without = build_cirq_circuit(bell, include_measure=False)
    assert len(list(c_with.all_operations())) == 4
    assert len(list(c_without.all_operations())) == 2


# --- Unit Tests: Endianness Normalization -----------------------------------

def test_normalize_statevector_endianness():
    # In a 2-qubit system:
    # Big-endian basis string representation:
    # index 0 = "00", index 1 = "01" (q0=0, q1=1), index 2 = "10" (q0=1, q1=0), index 3 = "11"
    # Little-endian (Qiskit) indexing:
    # index 0 = "00", index 1 = "10" in big-endian (q0=1, q1=0), index 2 = "01" (q0=0, q1=1), index 3 = "11"

    # Test |10> state: q0=1, q1=0
    # In Cirq (big-endian), this is index 2
    sv_cirq = [0.0, 0.0, 1.0, 0.0]
    normalized = normalize_statevector(sv_cirq, n_qubits=2, source_endian="big")
    # In Qiskit, q0 is LSB, so |q1=0, q0=1> is index 1
    assert abs(normalized[1] - 1.0) < 1e-12
    assert abs(normalized[0]) < 1e-12
    assert abs(normalized[2]) < 1e-12
    assert abs(normalized[3]) < 1e-12

    # Test source_endian="little" returns unchanged
    sv_qk = np.array([1.0, 0.0, 0.0, 0.0], dtype=complex)
    unchanged = normalize_statevector(sv_qk, n_qubits=2, source_endian="little")
    assert np.allclose(sv_qk, unchanged)


# --- Unit Tests: Cirq Simulation --------------------------------------------

def test_run_cirq_bell_state():
    bell = _make_bell_circuit()
    res = run_cirq(bell)
    assert res["backend"] == "cirq"
    assert "durationMs" in res
    sv = res["statevector"]
    assert len(sv) == 4
    inv_sqrt2 = 1.0 / math.sqrt(2)
    # Bell state |00> and |11>
    assert abs(abs(sv[0]) - inv_sqrt2) < 1e-5
    assert abs(abs(sv[3]) - inv_sqrt2) < 1e-5
    assert abs(sv[1]) < 1e-5
    assert abs(sv[2]) < 1e-5


def test_run_cirq_toffoli():
    circuit = _make_toffoli_circuit()
    res = run_cirq(circuit)
    sv = res["statevector"]
    assert len(sv) == 8
    # State |111> is index 7 in both big and little endian
    assert abs(abs(sv[7]) - 1.0) < 1e-5


# --- Unit Tests: Tri-Engine Conformance -------------------------------------

def test_conformance_qiskit_and_cirq_bell_state():
    bell = _make_bell_circuit()
    aer_res = run_qiskit_aer(bell, shots=1)
    cirq_res = run_cirq(bell)

    sv_qiskit = np.asarray(aer_res.finalStatevector, dtype=complex)
    sv_cirq = np.asarray(cirq_res["statevector"], dtype=complex)

    delta = float(np.linalg.norm(sv_qiskit - sv_cirq))
    assert delta <= 1e-6, f"Qiskit vs Cirq delta exceeded epsilon: {delta}"


def test_conformance_tri_engine_multi_gate():
    circuit = _make_multi_gate_circuit()

    aer_res = run_qiskit_aer(circuit, shots=1)
    cirq_res = run_cirq(circuit)
    pl_res = run_pennylane_statevector(circuit)

    sv_qk = np.asarray(aer_res.finalStatevector, dtype=complex)
    sv_cq = np.asarray(cirq_res["statevector"], dtype=complex)
    sv_pl = np.asarray(pl_res["statevector"], dtype=complex)

    delta_qc = float(np.linalg.norm(sv_qk - sv_cq))
    delta_qp = float(np.linalg.norm(sv_qk - sv_pl))
    delta_cp = float(np.linalg.norm(sv_cq - sv_pl))

    assert delta_qc <= 1e-6, f"Qiskit vs Cirq delta: {delta_qc}"
    assert delta_qp <= 1e-6, f"Qiskit vs PennyLane delta: {delta_qp}"
    assert delta_cp <= 1e-6, f"Cirq vs PennyLane delta: {delta_cp}"


# --- Integration Tests: Simulation Service Multi-Engine ---------------------

def test_build_simulation_run_multi_engine():
    circuit = _make_bell_circuit()
    req = SimulationRunRequest(
        learnerProfileId="lp_test",
        moduleId="mod_bell",
        circuitModel=circuit,
        backends=["qiskit", "cirq", "pennylane"],
    )
    sim_out = build_simulation_run(req, "req_test_conformance")

    assert sim_out.conformanceResults is not None
    assert "qiskit" in sim_out.conformanceResults
    assert "cirq" in sim_out.conformanceResults
    assert "pennylane" in sim_out.conformanceResults

    assert sim_out.conformanceDelta is not None
    assert sim_out.conformanceDelta <= 1e-6
    assert sim_out.conformanceBadge == "VERIFIED"


def test_build_simulation_run_default_single_engine():
    circuit = _make_bell_circuit()
    req = SimulationRunRequest(
        learnerProfileId="lp_test",
        moduleId="mod_bell",
        circuitModel=circuit,
    )
    sim_out = build_simulation_run(req, "req_test_single")
    assert sim_out.conformanceResults is not None
    assert "qiskit" in sim_out.conformanceResults
    assert sim_out.conformanceDelta == 0.0
    assert sim_out.conformanceBadge == "VERIFIED"


# --- HTTP Route Test: POST /v1/simulation-runs with backends ----------------

def test_post_simulation_runs_with_backends():
    client = TestClient(app)
    payload = {
        "learnerProfileId": "lp_aarav",
        "moduleId": "mod_bell",
        "circuitModel": _make_bell_circuit().model_dump(),
        "backends": ["qiskit", "cirq"],
        "shots": 1024,
    }
    response = client.post("/v1/simulation-runs", json=payload)
    assert response.status_code == 201
    data = response.json()
    run = data["simulationRun"]

    assert "conformanceResults" in run
    assert run["conformanceResults"] is not None
    assert "qiskit" in run["conformanceResults"]
    assert "cirq" in run["conformanceResults"]
    assert run["conformanceDelta"] <= 1e-6
    assert run["conformanceBadge"] == "VERIFIED"
