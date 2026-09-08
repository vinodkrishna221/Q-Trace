"""SIM-8: test_runtime_guards.py

Proves the four guards introduced by SIM-8:
  1. Timeout: a circuit that takes too long returns 504 SIMULATION_TIMEOUT.
  2. Disabled PennyLane: ENABLE_PENNYLANE=0 ? skippedReason=PENNYLANE_DISABLED.
  3. No NaN/Infinity: adapter._assert_finite raises on bad values.
  4. One-worker readiness: /ready reflects primaryAdapterEnabled flag.

quantum-runtime.md:
  - Timeout 1500ms ? 504 SIMULATION_TIMEOUT, never a hung request.
  - ENABLE_PENNYLANE=0, ENABLE_QISKIT=0 must still complete the /ready path.
  - JSON complex: {re, im}; NaN/Infinity rejected.

fastapi.md:
  - Every router gets at least one httpx.AsyncClient smoke test.

TEST COMMAND (from repo root):
  uv run --project apps/api pytest apps/api/tests/unit/simulation/test_runtime_guards.py
"""

from __future__ import annotations

import asyncio
import os
from unittest.mock import patch, AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.circuit import CircuitModel, GateName
from app.models.simulation import SimulationRunRequest
from app.services.quantum.adapter import _assert_finite


# ---------------------------------------------------------------------------
# Shared Bell request fixtures
# ---------------------------------------------------------------------------

_BELL_CIRCUIT_DICT = {
    "id": "cm_bell_guard_test",
    "name": "Bell Guard Test",
    "qubitCount": 2,
    "classicalBitCount": 2,
    "operations": [
        {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
        {"opId": "op_2", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
        {"opId": "op_3", "gate": "MEASURE", "targets": [0], "controls": [], "classicalTargets": [0], "column": 2},
        {"opId": "op_4", "gate": "MEASURE", "targets": [1], "controls": [], "classicalTargets": [1], "column": 2},
    ],
    "source": "BUILDER",
    "modelVersion": 1,
}

_POST_BODY = {
    "learnerProfileId": "lp_guard_test",
    "moduleId": "mod_bell",
    "circuitModel": _BELL_CIRCUIT_DICT,
    "predictionResponse": {"checkpointId": "pc_bell", "answer": "ENTANGLED"},
    "primaryAdapter": "QISKIT_AER",
    "runConformance": False,
    "shots": 1024,
}


# ---------------------------------------------------------------------------
# Helper: a fresh TestClient with a short timeout env override
# The trick is to patch the module-level _TIMEOUT_S at the point it is
# read by the route, which is inside the async function (it reads the
# module-level constant). We patch it directly on the module object.
# ---------------------------------------------------------------------------

def _slow_build(*args, **kwargs):
    """Simulates a build_simulation_run call that blocks long past budget."""
    import time
    time.sleep(10)


# ---------------------------------------------------------------------------
# Test 1 — 504 SIMULATION_TIMEOUT when executor hangs past budget
# ---------------------------------------------------------------------------

def test_timeout_returns_504():
    """Patching _TIMEOUT_S to 0.05s and build to sleep ? 504 SIMULATION_TIMEOUT."""
    import app.routers.simulation_runs as sim_mod
    client = TestClient(app, raise_server_exceptions=False)
    with (
        patch.object(sim_mod, "_TIMEOUT_S", 0.05),
        patch.object(sim_mod, "_qiskit_enabled", return_value=True),
        patch("app.routers.simulation_runs.build_simulation_run", side_effect=_slow_build),
    ):
        resp = client.post(
            "/v1/simulation-runs",
            json=_POST_BODY,
            headers={"X-Request-ID": "req_timeout_test_1"},
        )
    assert resp.status_code == 504
    body = resp.json()
    assert body["error"]["code"] == "SIMULATION_TIMEOUT"
    assert "requestId" in body["error"]


# ---------------------------------------------------------------------------
# Test 2 — 504 detail includes timeoutMs
# ---------------------------------------------------------------------------

def test_timeout_detail_includes_timeout_ms():
    """504 detail.timeoutMs must be present and be an integer."""
    import app.routers.simulation_runs as sim_mod
    client = TestClient(app, raise_server_exceptions=False)
    with (
        patch.object(sim_mod, "_TIMEOUT_S", 0.05),
        patch.object(sim_mod, "_qiskit_enabled", return_value=True),
        patch("app.routers.simulation_runs.build_simulation_run", side_effect=_slow_build),
    ):
        resp = client.post(
            "/v1/simulation-runs",
            json=_POST_BODY,
            headers={"X-Request-ID": "req_timeout_test_2"},
        )
    assert resp.status_code == 504
    details = resp.json()["error"]["details"]
    assert "timeoutMs" in details
    assert isinstance(details["timeoutMs"], int)


# ---------------------------------------------------------------------------
# Test 3 — ENABLE_PENNYLANE=0 ? skippedReason=PENNYLANE_DISABLED
# ---------------------------------------------------------------------------

def test_pennylane_disabled_flag_skips_conformance():
    """When ENABLE_PENNYLANE=0, conformance skippedReason is PENNYLANE_DISABLED."""
    from app.services.simulation_service import _pennylane_enabled, build_simulation_run

    # Verify the helper reads the env correctly
    with patch.dict(os.environ, {"ENABLE_PENNYLANE": "0"}):
        assert not _pennylane_enabled()

    circuit = CircuitModel.model_validate(_BELL_CIRCUIT_DICT)
    req = SimulationRunRequest(
        learnerProfileId="lp_pl_disable_test",
        moduleId="mod_bell",
        circuitModel=circuit,
        predictionResponse={"checkpointId": "pc_bell", "answer": "ENTANGLED"},
        primaryAdapter="QISKIT_AER",
        runConformance=True,
        shots=256,
    )

    # Run with ENABLE_PENNYLANE=0 and generous timeout (real Qiskit used)
    with patch.dict(os.environ, {"ENABLE_PENNYLANE": "0", "QTRACE_SIM_TIMEOUT_S": "30"}):
        result = build_simulation_run(req, "req_pl_disabled_test")

    assert result.conformance.skippedReason == "PENNYLANE_DISABLED"
    assert result.conformance.passed is False
    assert result.status == "SUCCEEDED"  # primary run succeeds


# ---------------------------------------------------------------------------
# Test 4 — No NaN/Infinity: _assert_finite raises on bad values
# ---------------------------------------------------------------------------

def test_assert_finite_raises_on_nan():
    """_assert_finite must raise ValueError for NaN."""
    with pytest.raises(ValueError, match="Non-finite"):
        _assert_finite(float("nan"), "test context")


def test_assert_finite_raises_on_inf():
    """_assert_finite must raise ValueError for Infinity."""
    with pytest.raises(ValueError, match="Non-finite"):
        _assert_finite(float("inf"), "test context")


def test_assert_finite_passes_on_valid_float():
    """_assert_finite must not raise for normal finite floats."""
    _assert_finite(0.5, "prob")
    _assert_finite(0.0, "zero")
    _assert_finite(1.0, "one")
    _assert_finite(-1.0, "negative bloch component")


# ---------------------------------------------------------------------------
# Test 5 — /ready reflects primaryAdapterEnabled=True when unset
# ---------------------------------------------------------------------------

def test_ready_reflects_qiskit_enabled():
    """/ready primaryAdapterEnabled=True when ENABLE_QISKIT=1."""
    env = {"ENABLE_QISKIT": "1", "ENABLE_PENNYLANE": "1"}
    with patch.dict(os.environ, env, clear=False):
        client = TestClient(app)
        resp = client.get("/ready")
    assert resp.status_code == 200
    body = resp.json()
    assert body["primaryAdapterEnabled"] is True
    assert body["adapters"]["QISKIT_AER"] == "enabled"
    assert body["adapters"]["PENNYLANE"] == "enabled"
    assert "workerNote" in body


# ---------------------------------------------------------------------------
# Test 6 — /ready reflects primaryAdapterEnabled=False when ENABLE_QISKIT=0
# ---------------------------------------------------------------------------

def test_ready_reflects_qiskit_disabled():
    """/ready primaryAdapterEnabled=False when ENABLE_QISKIT=0."""
    with patch.dict(os.environ, {"ENABLE_QISKIT": "0"}, clear=False):
        client = TestClient(app)
        resp = client.get("/ready")
    assert resp.status_code == 200
    body = resp.json()
    assert body["primaryAdapterEnabled"] is False
    assert body["adapters"]["QISKIT_AER"] == "disabled"


# ---------------------------------------------------------------------------
# Test 7 — /ready shows PENNYLANE disabled
# ---------------------------------------------------------------------------

def test_ready_pennylane_disabled_visible():
    """/ready adapters.PENNYLANE=disabled when ENABLE_PENNYLANE=0."""
    with patch.dict(os.environ, {"ENABLE_PENNYLANE": "0"}, clear=False):
        client = TestClient(app)
        resp = client.get("/ready")
    assert resp.status_code == 200
    body = resp.json()
    assert body["adapters"]["PENNYLANE"] == "disabled"


# ---------------------------------------------------------------------------
# Test 8 — ENABLE_QISKIT=0 ? 503 ADAPTER_UNAVAILABLE from route
# ---------------------------------------------------------------------------

def test_qiskit_disabled_returns_503():
    """POST /v1/simulation-runs with ENABLE_QISKIT=0 ? 503 ADAPTER_UNAVAILABLE."""
    import app.routers.simulation_runs as sim_mod
    client = TestClient(app)
    with patch.object(sim_mod, "_qiskit_enabled", return_value=False):
        resp = client.post(
            "/v1/simulation-runs",
            json=_POST_BODY,
            headers={"X-Request-ID": "req_qiskit_disabled"},
        )
    assert resp.status_code == 503
    body = resp.json()
    assert body["error"]["code"] == "ADAPTER_UNAVAILABLE"
    assert "requestId" in body["error"]
