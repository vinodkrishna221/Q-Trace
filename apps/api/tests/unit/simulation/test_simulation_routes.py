"""SIM-4 card TEST — Expose and persist Simulation Runs.

Proves (per card spec):
  1. POST /v1/simulation-runs with the contract Bell request → 201
  2. simulationRun.id, durationMs, circuitModelId present in response
  3. X-Request-ID header on POST response
  4. GET /v1/simulation-runs/{id} retrieves the SAME persisted run
  5. GET with unknown ID → 404 contract error envelope
  6. simulationRun.stateTrace has >= 1 step (Qiskit ran)
  7. simulationRun.probabilities has "00" and "11" keys
  8. conformance.skippedReason is set (PennyLane not enabled in SIM-4)
  9. POST response headers contain X-Request-ID

Run with:
  uv run --project apps/api --extra quantum --extra dev pytest
    apps/api/tests/unit/simulation/test_simulation_routes.py -v
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories import simulation_run_repo

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

BELL_REQUEST = {
    "learnerProfileId": "lp_aarav",
    "moduleId": "mod_bell",
    "circuitModel": {
        "id": "cm_bell_seed",
        "name": "Bell State Seed",
        "qubitCount": 2,
        "classicalBitCount": 2,
        "operations": [
            {"opId": "op_1", "gate": "H",       "targets": [0], "controls": [],  "classicalTargets": [], "column": 0},
            {"opId": "op_2", "gate": "CNOT",     "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
            {"opId": "op_3", "gate": "MEASURE",  "targets": [0], "controls": [],  "classicalTargets": [0], "column": 2},
            {"opId": "op_4", "gate": "MEASURE",  "targets": [1], "controls": [],  "classicalTargets": [1], "column": 2},
        ],
        "source": "BUILDER",
        "modelVersion": 1,
    },
    "predictionResponse": {"checkpointId": "pc_bell_outcomes", "answer": "INDEPENDENT_RANDOM"},
    "primaryAdapter": "QISKIT_AER",
    "runConformance": False,
    "shots": 256,
}


@pytest.fixture(scope="module")
def client():
    # Clear any residual runs from other test modules
    simulation_run_repo.clear()
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


@pytest.fixture(scope="module")
def posted_run(client):
    """POST the Bell request once and return the full response JSON."""
    resp = client.post("/v1/simulation-runs", json=BELL_REQUEST)
    assert resp.status_code == 201, f"POST failed: {resp.text}"
    return resp


# ---------------------------------------------------------------------------
# 1. POST returns 201
# ---------------------------------------------------------------------------

def test_post_returns_201(posted_run):
    assert posted_run.status_code == 201


# ---------------------------------------------------------------------------
# 2. simulationRun fields present
# ---------------------------------------------------------------------------

def test_post_simulationRun_wrapper(posted_run):
    data = posted_run.json()
    assert "simulationRun" in data, f"Missing simulationRun key: {data}"


def test_post_run_id(posted_run):
    run = posted_run.json()["simulationRun"]
    assert run["id"].startswith("sr_"), f"id={run['id']}"


def test_post_circuit_model_id(posted_run):
    run = posted_run.json()["simulationRun"]
    assert run["circuitModelId"] == "cm_bell_seed"


def test_post_duration_ms(posted_run):
    run = posted_run.json()["simulationRun"]
    assert run["durationMs"] >= 0, f"durationMs={run['durationMs']}"


def test_post_learner_and_module(posted_run):
    run = posted_run.json()["simulationRun"]
    assert run["learnerProfileId"] == "lp_aarav"
    assert run["moduleId"] == "mod_bell"


def test_post_adapter(posted_run):
    run = posted_run.json()["simulationRun"]
    assert run["adapter"] == "QISKIT_AER"


def test_post_status_succeeded(posted_run):
    run = posted_run.json()["simulationRun"]
    assert run["status"] == "SUCCEEDED"


# ---------------------------------------------------------------------------
# 3. X-Request-ID header on POST response
# ---------------------------------------------------------------------------

def test_post_request_id_header(posted_run):
    assert "x-request-id" in posted_run.headers or "X-Request-ID" in posted_run.headers, (
        f"Missing X-Request-ID header. Headers: {dict(posted_run.headers)}"
    )


# ---------------------------------------------------------------------------
# 4. GET retrieves the SAME persisted run
# ---------------------------------------------------------------------------

def test_get_returns_200(client, posted_run):
    run_id = posted_run.json()["simulationRun"]["id"]
    resp = client.get(f"/v1/simulation-runs/{run_id}")
    assert resp.status_code == 200, f"GET failed: {resp.text}"


def test_get_same_run_id(client, posted_run):
    run_id = posted_run.json()["simulationRun"]["id"]
    resp = client.get(f"/v1/simulation-runs/{run_id}")
    assert resp.json()["simulationRun"]["id"] == run_id


def test_get_same_circuit_model_id(client, posted_run):
    run_id = posted_run.json()["simulationRun"]["id"]
    resp = client.get(f"/v1/simulation-runs/{run_id}")
    assert resp.json()["simulationRun"]["circuitModelId"] == "cm_bell_seed"


def test_get_same_duration(client, posted_run):
    run_id = posted_run.json()["simulationRun"]["id"]
    post_duration = posted_run.json()["simulationRun"]["durationMs"]
    resp = client.get(f"/v1/simulation-runs/{run_id}")
    get_duration = resp.json()["simulationRun"]["durationMs"]
    assert post_duration == get_duration, "GET returned different durationMs than POST"


def test_get_request_id_header(client, posted_run):
    run_id = posted_run.json()["simulationRun"]["id"]
    resp = client.get(f"/v1/simulation-runs/{run_id}")
    assert "x-request-id" in resp.headers or "X-Request-ID" in resp.headers


# ---------------------------------------------------------------------------
# 5. GET unknown ID → 404 contract error envelope
# ---------------------------------------------------------------------------

def test_get_unknown_run_404(client):
    resp = client.get("/v1/simulation-runs/sr_does_not_exist")
    assert resp.status_code == 404


def test_get_unknown_run_error_envelope(client):
    resp = client.get("/v1/simulation-runs/sr_does_not_exist")
    data = resp.json()
    assert "error" in data, f"Expected error envelope, got: {data}"
    assert data["error"]["code"] == "SIMULATION_RUN_NOT_FOUND"
    assert "requestId" in data["error"]


# ---------------------------------------------------------------------------
# 6. stateTrace has steps (Qiskit actually ran)
# ---------------------------------------------------------------------------

def test_post_state_trace_has_steps(posted_run):
    run = posted_run.json()["simulationRun"]
    assert len(run["stateTrace"]) >= 1, "stateTrace is empty — Qiskit did not run"


def test_post_state_trace_step_fields(posted_run):
    step = posted_run.json()["simulationRun"]["stateTrace"][0]
    assert "stepIndex" in step
    assert "operationId" in step
    assert "basisProbabilities" in step
    assert "amplitudes" in step
    assert "reducedQubits" in step


# ---------------------------------------------------------------------------
# 7. probabilities has "00" and "11" keys (Bell result)
# ---------------------------------------------------------------------------

def test_post_bell_probabilities(posted_run):
    probs = posted_run.json()["simulationRun"]["probabilities"]
    assert "00" in probs, f"Missing '00' in probabilities: {list(probs.keys())}"
    assert "11" in probs, f"Missing '11' in probabilities: {list(probs.keys())}"


def test_post_bell_probabilities_values(posted_run):
    probs = posted_run.json()["simulationRun"]["probabilities"]
    assert abs(probs["00"] - 0.5) < 1e-3
    assert abs(probs["11"] - 0.5) < 1e-3


# ---------------------------------------------------------------------------
# 8. conformance.skippedReason is set (PennyLane not enabled in SIM-4)
# ---------------------------------------------------------------------------

def test_post_conformance_skipped(posted_run):
    conformance = posted_run.json()["simulationRun"]["conformance"]
    assert conformance["skippedReason"] is not None, (
        "Expected skippedReason to be set since PennyLane is not enabled in SIM-4"
    )
    assert conformance["adapter"] == "PENNYLANE"


# ---------------------------------------------------------------------------
# 9. POST with invalid circuit model → 422
# ---------------------------------------------------------------------------

def test_post_invalid_circuit_422(client):
    bad_request = dict(BELL_REQUEST)
    bad_request = {**BELL_REQUEST, "circuitModel": {**BELL_REQUEST["circuitModel"], "qubitCount": 6}}
    resp = client.post("/v1/simulation-runs", json=bad_request)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 10. Idempotency: same X-Request-ID within 60s returns the same run
# ---------------------------------------------------------------------------

def test_post_idempotency_with_same_request_id(client):
    """Two POSTs with the same X-Request-ID must return the same simulationRun.id.

    This proves the 60s idempotency cache works: the second call is served from
    cache without re-running the quantum simulator.
    """
    idempotency_key = "req_idempotency_test_001"

    resp1 = client.post(
        "/v1/simulation-runs",
        json=BELL_REQUEST,
        headers={"X-Request-ID": idempotency_key},
    )
    assert resp1.status_code == 201, f"First POST failed: {resp1.text}"
    run_id_1 = resp1.json()["simulationRun"]["id"]

    resp2 = client.post(
        "/v1/simulation-runs",
        json=BELL_REQUEST,
        headers={"X-Request-ID": idempotency_key},
    )
    assert resp2.status_code == 201, f"Second POST failed: {resp2.text}"
    run_id_2 = resp2.json()["simulationRun"]["id"]

    assert run_id_1 == run_id_2, (
        f"Idempotency failed: first POST got '{run_id_1}', "
        f"second POST (same X-Request-ID) got '{run_id_2}'"
    )
