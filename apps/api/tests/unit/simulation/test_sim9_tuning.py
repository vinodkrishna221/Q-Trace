"""SIM-9 card tests — adapter pre-warm, cached simulators, error-message polish.

Tests cover:
  1. prewarm_adapters() pre-initialises the module-level simulator cache.
  2. run_qiskit_aer reuses cached simulators (no per-call AerSimulator construction).
  3. SIMULATION_TIMEOUT detail includes the UI-friendly hint field.
  4. skippedReason PENNYLANE_NOT_REQUESTED when runConformance=False (polished from NOT_ENABLED).
  5. prewarm_adapters() is a no-op when ENABLE_QISKIT=0.
  6. lifespan startup calls prewarm_adapters (integration smoke via TestClient).
"""
from __future__ import annotations

import os
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# 1. prewarm_adapters initialises module-level cache
# ---------------------------------------------------------------------------

def test_prewarm_adapters_sets_module_cache(monkeypatch):
    """prewarm_adapters() must populate _sv_simulator and _meas_simulator."""
    import app.services.quantum.adapter as adapter_mod

    # Reset cache
    monkeypatch.setattr(adapter_mod, "_sv_simulator", None)
    monkeypatch.setattr(adapter_mod, "_meas_simulator", None)
    monkeypatch.setenv("ENABLE_QISKIT", "1")

    adapter_mod.prewarm_adapters()

    assert adapter_mod._sv_simulator is not None, "_sv_simulator must be set after prewarm"
    assert adapter_mod._meas_simulator is not None, "_meas_simulator must be set after prewarm"


# ---------------------------------------------------------------------------
# 2. prewarm_adapters is idempotent (second call is a no-op)
# ---------------------------------------------------------------------------

def test_prewarm_adapters_idempotent(monkeypatch):
    """Calling prewarm_adapters() twice must not recreate simulators."""
    import app.services.quantum.adapter as adapter_mod

    monkeypatch.setenv("ENABLE_QISKIT", "1")
    # Ensure warm
    adapter_mod.prewarm_adapters()
    first_sv = adapter_mod._sv_simulator

    adapter_mod.prewarm_adapters()  # second call
    assert adapter_mod._sv_simulator is first_sv, "Second prewarm must reuse the same object"


# ---------------------------------------------------------------------------
# 3. prewarm_adapters is a no-op when ENABLE_QISKIT=0
# ---------------------------------------------------------------------------

def test_prewarm_adapters_skipped_when_qiskit_disabled(monkeypatch):
    """prewarm_adapters() must leave cache None when ENABLE_QISKIT=0."""
    import app.services.quantum.adapter as adapter_mod

    monkeypatch.setattr(adapter_mod, "_sv_simulator", None)
    monkeypatch.setattr(adapter_mod, "_meas_simulator", None)
    monkeypatch.setenv("ENABLE_QISKIT", "0")

    adapter_mod.prewarm_adapters()

    assert adapter_mod._sv_simulator is None, "Cache must stay None when Qiskit disabled"
    assert adapter_mod._meas_simulator is None, "Cache must stay None when Qiskit disabled"


# ---------------------------------------------------------------------------
# 4. run_qiskit_aer uses cached sv_simulator when cache is warm
# ---------------------------------------------------------------------------

def test_run_qiskit_aer_uses_cached_sv_simulator(monkeypatch):
    """When _sv_simulator is pre-set, run_qiskit_aer must use it (not create new one)."""
    import app.services.quantum.adapter as adapter_mod
    from app.models.circuit import CircuitModel, GateName, Operation

    bell = CircuitModel(
        id="cm_test_cache",
        name="Cache Test Bell",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
            Operation(opId="op_3", gate=GateName.MEASURE, targets=[0], controls=[], classicalTargets=[0], column=2),
            Operation(opId="op_4", gate=GateName.MEASURE, targets=[1], controls=[], classicalTargets=[1], column=2),
        ],
        source="SEED",
        modelVersion=1,
    )

    monkeypatch.setenv("ENABLE_QISKIT", "1")
    # Prewarm first
    adapter_mod.prewarm_adapters()
    cached_sv = adapter_mod._sv_simulator

    result = adapter_mod.run_qiskit_aer(bell, shots=128)

    # After run, sv_simulator must still be the same cached object
    assert adapter_mod._sv_simulator is cached_sv, "Cached sv_simulator must not be replaced"
    assert abs(result.probabilities.get("00", 0) - 0.5) < 0.01
    assert abs(result.probabilities.get("11", 0) - 0.5) < 0.01


# ---------------------------------------------------------------------------
# 5. SIMULATION_TIMEOUT detail includes 'hint' field for UI
# ---------------------------------------------------------------------------

def test_timeout_detail_includes_hint(monkeypatch):
    """The SIMULATION_TIMEOUT error detail must include a 'hint' key for UI display.

    _TIMEOUT_S is a module-level constant read at import time; patch it directly
    to avoid depending on env-var-at-import ordering.
    """
    from fastapi.testclient import TestClient
    from app.main import app
    import app.routers.simulation_runs as sim_runs_mod

    monkeypatch.setenv("ENABLE_QISKIT", "1")
    # Patch the already-imported module-level constant to force timeout
    monkeypatch.setattr(sim_runs_mod, "_TIMEOUT_S", 0.00001)

    client = TestClient(app)

    payload = {
        "learnerProfileId": "lp_test",
        "moduleId": "mod_bell",
        "circuitModel": {
            "id": "cm_timeout_test",
            "name": "Timeout Test",
            "qubitCount": 2,
            "classicalBitCount": 2,
            "operations": [
                {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
                {"opId": "op_2", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
            ],
            "source": "SEED",
            "modelVersion": 1,
        },
        "primaryAdapter": "QISKIT_AER",
        "runConformance": False,
        "shots": 1024,
    }

    resp = client.post("/v1/simulation-runs", json=payload, headers={"X-Request-ID": "req_timeout_sim9"})
    assert resp.status_code == 504
    error = resp.json()["error"]
    assert error["code"] == "SIMULATION_TIMEOUT"
    assert "hint" in error["details"], "details must include 'hint' for UI display"
    assert "timeoutMs" in error["details"]


# ---------------------------------------------------------------------------
# 6. skippedReason is PENNYLANE_NOT_REQUESTED when runConformance=False (SIM-9 polish)
# ---------------------------------------------------------------------------

def test_skipped_reason_not_requested_when_conformance_false(monkeypatch):
    """build_simulation_run must set skippedReason=PENNYLANE_NOT_REQUESTED when runConformance=False."""
    from app.services.simulation_service import build_simulation_run
    from app.models.simulation import SimulationRunRequest
    from app.models.circuit import CircuitModel, GateName, Operation

    monkeypatch.setenv("ENABLE_QISKIT", "1")
    monkeypatch.setenv("ENABLE_PENNYLANE", "1")

    req = SimulationRunRequest(
        learnerProfileId="lp_test",
        moduleId="mod_bell",
        circuitModel=CircuitModel(
            id="cm_skip_test",
            name="Skip Test",
            qubitCount=2,
            classicalBitCount=0,
            operations=[
                Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
                Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
            ],
            source="SEED",
            modelVersion=1,
        ),
        primaryAdapter="QISKIT_AER",
        runConformance=False,
        shots=128,
    )

    result = build_simulation_run(req, "req_skip_test")
    assert result.conformance.skippedReason == "PENNYLANE_NOT_REQUESTED", (
        f"Expected PENNYLANE_NOT_REQUESTED, got {result.conformance.skippedReason}"
    )


# ---------------------------------------------------------------------------
# 7. Warm Bell path stays within 1500ms budget (regression)
# ---------------------------------------------------------------------------

def test_warm_bell_within_budget(monkeypatch):
    """After prewarm, Bell simulation must complete within 1500ms budget."""
    import time
    import app.services.quantum.adapter as adapter_mod
    from app.models.circuit import CircuitModel, GateName, Operation

    monkeypatch.setenv("ENABLE_QISKIT", "1")
    adapter_mod.prewarm_adapters()

    bell = CircuitModel(
        id="cm_budget_test",
        name="Budget Test Bell",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
            Operation(opId="op_3", gate=GateName.MEASURE, targets=[0], controls=[], classicalTargets=[0], column=2),
            Operation(opId="op_4", gate=GateName.MEASURE, targets=[1], controls=[], classicalTargets=[1], column=2),
        ],
        source="SEED",
        modelVersion=1,
    )

    t0 = time.monotonic()
    result = adapter_mod.run_qiskit_aer(bell, shots=256)
    elapsed_ms = (time.monotonic() - t0) * 1000

    assert elapsed_ms < 1500, f"Warm Bell path took {elapsed_ms:.0f}ms, budget is 1500ms"
    assert result.durationMs < 1500, f"Adapter durationMs={result.durationMs} exceeds 1500ms budget"