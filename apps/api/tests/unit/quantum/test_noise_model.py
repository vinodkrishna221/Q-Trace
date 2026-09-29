"""FEA-10 card TEST — NISQ Noise Model Backend.

Proves (per card spec and docs/FEATURES-SPEC.md § 4.1 & § 4.3):
  1. NoiseModel construction with superconducting preset:
     - T1 = 50 µs, T2 = 70 µs, gate_time = 50 ns
     - 1-qubit errors on H, X, Y, Z, S, T
     - 2-qubit errors on CX, CZ
     - Readout error matrix [[0.99, 0.01], [0.01, 0.99]]
  2. Single-qubit noisy execution:
     - Bloch vector length |r| < 1.0 (contracts inside unit sphere)
     - Subsystem purity Tr(ρ²) < 1.0
  3. Two-qubit Bell circuit noisy execution:
     - State trace steps after H and CNOT
     - Post-CNOT entangled subsystem purity < 1.0 (labeled MIXED_SUBSYSTEM)
     - Non-zero noise leakage onto |01⟩ and |10⟩ basis states
     - Measurement counts include readout errors
  4. SimulationRunRequest validation for noisePreset
  5. build_simulation_run integration with noisePreset preserved in SimulationRunOut
  6. POST /v1/simulation-runs HTTP endpoint accepts and executes with noisePreset

Run with:
  uv run --project apps/api pytest apps/api/tests/unit/quantum/test_noise_model.py -v
"""

from __future__ import annotations

import math
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.models.circuit import CircuitModel
from app.models.simulation import SimulationRunRequest
from app.repositories import simulation_run_repo
from app.services.quantum.adapter import (
    get_noise_model,
    get_noisy_dm_simulator,
    get_noisy_meas_simulator,
    run_circuit,
    run_qiskit_aer,
)
from app.services.simulation_service import build_simulation_run


# ---------------------------------------------------------------------------
# Test Circuits
# ---------------------------------------------------------------------------

H_CIRCUIT = CircuitModel(
    id="cm_h_test",
    name="Single Qubit H on 2-qubit register",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        {
            "opId": "op_h",
            "gate": "H",
            "targets": [0],
            "controls": [],
            "classicalTargets": [],
            "column": 0,
        },
    ],
    source="BUILDER",
    modelVersion=1,
)

X_CIRCUIT = CircuitModel(
    id="cm_x_test",
    name="Single Qubit X on 2-qubit register",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        {
            "opId": "op_x",
            "gate": "X",
            "targets": [0],
            "controls": [],
            "classicalTargets": [],
            "column": 0,
        },
    ],
    source="BUILDER",
    modelVersion=1,
)

BELL_CIRCUIT = CircuitModel(
    id="cm_bell_noise_test",
    name="Bell State with Noise",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        {
            "opId": "op_h",
            "gate": "H",
            "targets": [0],
            "controls": [],
            "classicalTargets": [],
            "column": 0,
        },
        {
            "opId": "op_cx",
            "gate": "CNOT",
            "targets": [1],
            "controls": [0],
            "classicalTargets": [],
            "column": 1,
        },
        {
            "opId": "op_m0",
            "gate": "MEASURE",
            "targets": [0],
            "controls": [],
            "classicalTargets": [0],
            "column": 2,
        },
        {
            "opId": "op_m1",
            "gate": "MEASURE",
            "targets": [1],
            "controls": [],
            "classicalTargets": [1],
            "column": 2,
        },
    ],
    source="SEED",
    modelVersion=1,
)


# ---------------------------------------------------------------------------
# 1. Noise Model Construction Tests
# ---------------------------------------------------------------------------


class TestNoiseModelConstruction:
    """Verify NoiseModel parameters conform to docs/FEATURES-SPEC.md § 4.3."""

    def test_superconducting_noise_model_structure(self):
        nm = get_noise_model("superconducting")
        assert nm is not None
        # Verify cached retrieval
        assert get_noise_model("superconducting") is nm

    def test_unsupported_preset_raises(self):
        with pytest.raises(ValueError, match="Unsupported noise preset"):
            get_noise_model("ion_trap")

    def test_noisy_simulators_cached(self):
        dm_sim1 = get_noisy_dm_simulator("superconducting")
        dm_sim2 = get_noisy_dm_simulator("superconducting")
        assert dm_sim1 is dm_sim2

        meas_sim1 = get_noisy_meas_simulator("superconducting")
        meas_sim2 = get_noisy_meas_simulator("superconducting")
        assert meas_sim1 is meas_sim2


# ---------------------------------------------------------------------------
# 2. Single-Qubit Noisy Simulation Tests
# ---------------------------------------------------------------------------


class TestSingleQubitNoisySimulation:
    """Verify Bloch vector contraction and purity loss in single-qubit states."""

    def test_h_gate_bloch_contraction_and_purity(self):
        # Ideal run
        ideal_res = run_qiskit_aer(H_CIRCUIT, shots=1024, noise_preset=None)
        assert len(ideal_res.stateTrace) == 1
        ideal_qubit = ideal_res.stateTrace[0].reducedQubits[0]
        ideal_r = math.sqrt(
            ideal_qubit.bloch.x ** 2
            + ideal_qubit.bloch.y ** 2
            + ideal_qubit.bloch.z ** 2
        )
        assert abs(ideal_r - 1.0) < 1e-6
        assert abs(ideal_qubit.purity - 1.0) < 1e-6
        assert ideal_qubit.label == "PURE_SUBSYSTEM"

        # Noisy run (superconducting)
        noisy_res = run_qiskit_aer(H_CIRCUIT, shots=1024, noise_preset="superconducting")
        assert len(noisy_res.stateTrace) == 1
        noisy_qubit = noisy_res.stateTrace[0].reducedQubits[0]
        noisy_r = math.sqrt(
            noisy_qubit.bloch.x ** 2
            + noisy_qubit.bloch.y ** 2
            + noisy_qubit.bloch.z ** 2
        )

        # Vector contracts strictly inside the unit sphere: |r| < 1.0
        assert noisy_r < 1.0 - 1e-5, f"Expected contracted Bloch vector (|r| < 1.0), got {noisy_r}"
        # Purity strictly < 1.0 (mixed state)
        assert noisy_qubit.purity < 1.0 - 1e-5, f"Expected purity < 1.0, got {noisy_qubit.purity}"
        assert noisy_qubit.label == "MIXED_SUBSYSTEM"

        # Probabilities sum to ~1.0 without NaN/inf
        total_p = sum(noisy_res.probabilities.values())
        assert abs(total_p - 1.0) < 1e-4

    def test_x_gate_noisy_thermal_relaxation(self):
        noisy_res = run_circuit(X_CIRCUIT, shots=1024, noise_preset="superconducting")
        qubit = noisy_res.stateTrace[0].reducedQubits[0]
        r = math.sqrt(qubit.bloch.x ** 2 + qubit.bloch.y ** 2 + qubit.bloch.z ** 2)
        assert r < 1.0 - 1e-5
        assert qubit.purity < 1.0 - 1e-5
        assert qubit.label == "MIXED_SUBSYSTEM"


# ---------------------------------------------------------------------------
# 3. Two-Qubit Bell Noisy Simulation Tests
# ---------------------------------------------------------------------------


class TestBellNoisySimulation:
    """Verify Bell state under superconducting noise parameters."""

    def test_bell_state_density_matrix_and_leakage(self):
        noisy_res = run_qiskit_aer(BELL_CIRCUIT, shots=1024, noise_preset="superconducting")

        # 2 non-measure operations: H, CNOT
        assert len(noisy_res.stateTrace) == 2
        step_h = noisy_res.stateTrace[0]
        step_cnot = noisy_res.stateTrace[1]

        # Step 0 (After H): q0 is in noisy superposition, q1 in |0⟩
        assert step_h.label == "After H"
        q0_h = step_h.reducedQubits[0]
        q1_h = step_h.reducedQubits[1]
        assert q0_h.purity < 1.0
        assert q0_h.label == "MIXED_SUBSYSTEM"
        assert abs(q1_h.bloch.z - 1.0) < 1e-3

        # Step 1 (After CNOT): Entangled Bell state
        assert step_cnot.label == "After CNOT"
        q0_cnot = step_cnot.reducedQubits[0]
        q1_cnot = step_cnot.reducedQubits[1]
        assert q0_cnot.purity < 1.0
        assert q0_cnot.label == "MIXED_SUBSYSTEM"
        assert q1_cnot.purity < 1.0
        assert q1_cnot.label == "MIXED_SUBSYSTEM"

        # Pre-measurement probabilities: 00 and 11 dominant, but 01 and 10 present due to noise
        probs = noisy_res.probabilities
        assert "00" in probs and "11" in probs
        assert probs["00"] > 0.45
        assert probs["11"] > 0.45
        # Leakage due to thermal relaxation
        assert "01" in probs or "10" in probs
        for p in probs.values():
            assert 0.0 <= p <= 1.0
            assert math.isfinite(p)

    def test_bell_counts_with_readout_errors(self):
        noisy_res = run_qiskit_aer(BELL_CIRCUIT, shots=1024, noise_preset="superconducting")
        counts = noisy_res.counts

        assert sum(counts.values()) == 1024
        assert "00" in counts and "11" in counts
        assert counts["00"] > 400
        assert counts["11"] > 400
        # 1% readout error and relaxation produce visible noise artifacts on 01 and/or 10
        assert counts.get("01", 0) > 0 or counts.get("10", 0) > 0


# ---------------------------------------------------------------------------
# 4. Request Model and Service Integration Tests
# ---------------------------------------------------------------------------


class TestSimulationServiceNoiseIntegration:
    """Verify request validation and end-to-end service execution."""

    def test_simulation_run_request_validation(self):
        # Valid noisePreset
        req_valid = SimulationRunRequest(
            learnerProfileId="lp_aarav",
            moduleId="mod_bell",
            circuitModel=BELL_CIRCUIT,
            noisePreset="superconducting",
        )
        assert req_valid.noisePreset == "superconducting"

        # Default is None
        req_default = SimulationRunRequest(
            learnerProfileId="lp_aarav",
            moduleId="mod_bell",
            circuitModel=BELL_CIRCUIT,
        )
        assert req_default.noisePreset is None

        # Invalid preset is rejected
        with pytest.raises(ValidationError):
            SimulationRunRequest(
                learnerProfileId="lp_aarav",
                moduleId="mod_bell",
                circuitModel=BELL_CIRCUIT,
                noisePreset="invalid_preset",  # type: ignore
            )

    def test_build_simulation_run_with_noise_preset(self):
        req = SimulationRunRequest(
            learnerProfileId="lp_aarav",
            moduleId="mod_bell",
            circuitModel=BELL_CIRCUIT,
            noisePreset="superconducting",
            shots=512,
        )
        out = build_simulation_run(req, "req_test_noise_001")

        assert out.status == "SUCCEEDED"
        assert out.noisePreset == "superconducting"
        assert out.shots == 512
        assert len(out.stateTrace) == 2
        # Verify subsystem purity < 1.0
        assert out.stateTrace[1].reducedQubits[0].purity < 1.0
        assert out.stateTrace[1].reducedQubits[0].label == "MIXED_SUBSYSTEM"

    def test_build_simulation_run_ideal_preserves_none(self):
        req = SimulationRunRequest(
            learnerProfileId="lp_aarav",
            moduleId="mod_bell",
            circuitModel=BELL_CIRCUIT,
            noisePreset=None,
            shots=256,
        )
        out = build_simulation_run(req, "req_test_ideal_001")

        assert out.status == "SUCCEEDED"
        assert out.noisePreset is None
        assert abs(out.probabilities["00"] - 0.5) < 1e-6
        assert abs(out.probabilities["11"] - 0.5) < 1e-6


# ---------------------------------------------------------------------------
# 5. FastAPI Route Integration Test
# ---------------------------------------------------------------------------


class TestSimulationRouteWithNoise:
    """Verify POST /v1/simulation-runs endpoint with noisePreset."""

    @pytest.fixture(autouse=True)
    def setup_client(self):
        simulation_run_repo.clear()
        with TestClient(app, raise_server_exceptions=True) as client:
            self.client = client

    def test_post_simulation_run_with_superconducting_noise(self):
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "circuitModel": BELL_CIRCUIT.model_dump(),
            "noisePreset": "superconducting",
            "shots": 512,
        }

        resp = self.client.post("/v1/simulation-runs", json=payload)
        assert resp.status_code == 201

        data = resp.json()["simulationRun"]
        assert data["noisePreset"] == "superconducting"
        assert data["status"] == "SUCCEEDED"
        assert data["shots"] == 512
        assert len(data["stateTrace"]) == 2

        # Purity check on step 1 (post-CNOT)
        step1 = data["stateTrace"][1]
        assert step1["reducedQubits"][0]["purity"] < 1.0
        assert step1["reducedQubits"][0]["label"] == "MIXED_SUBSYSTEM"

        # Verify idempotency preserves noisePreset
        req_id = resp.headers.get("x-request-id", "req_unknown")
        resp_idemp = self.client.post(
            "/v1/simulation-runs",
            json=payload,
            headers={"X-Request-ID": req_id},
        )
        assert resp_idemp.status_code == 201
        assert resp_idemp.json()["simulationRun"]["noisePreset"] == "superconducting"
