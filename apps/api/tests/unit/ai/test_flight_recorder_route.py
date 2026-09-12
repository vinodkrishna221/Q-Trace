"""
AI-2 test suite — Flight Recorder diagnosis endpoint
======================================================
Owner:   Rajeswari (ai-pedagogy track)
Branch:  feat/ai-pedagogy/ai-2-expose-flight-recorder-diagnosis-and
Run:     uv run --project apps/api pytest apps/api/tests/unit/ai/test_flight_recorder_route.py

Contract under test: board/contracts/flight-recorder-tutor.md v1

Assertions (all must be green before the card is marked done):

 1. POST the Bell fixture → 201; firstDivergenceStep=1; repairChallengeId present.
 2. Correct prediction (CORRELATED_00_11) → NO_SIGNAL code, still 201.
 3. Unknown learner → 404 LEARNER_NOT_FOUND.
 4. Unknown simulation run → 404 SIMULATION_RUN_NOT_FOUND.
 5. Run with status FAILED → 409 RUN_NOT_SUCCEEDED.
 6. Run without predictionResponse → 422 PREDICTION_MISSING.
 7. Run with empty stateTrace → 422 TRACE_INSUFFICIENT.
 8. Response shape matches contract (misconceptionSignal + replay keys).
 9. MisconceptionSignal is persisted (can be retrieved from repo).
10. Replay steps cite registered evidence keys only.
11. All contract MisconceptionCodes round-trip through the endpoint.
12. Confidence is always 1.0 for deterministic diagnosis.
"""

from __future__ import annotations

from typing import Any, Optional

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.models.entities import (
    LearnerProfile,
    MisconceptionSignal,
    PriorKnowledge,
    SimulationRun,
    utc_now_iso,
)
from app.repositories import set_repository
from app.repositories.memory import InMemoryRepository
from app.repositories.seeds import seed_core_truth
from app.routers.flight_recorder import router as flight_recorder_router
from app.services.diagnosis.rules import KNOWN_EVIDENCE_KEYS

# ---------------------------------------------------------------------------
# Fixtures — Bell State Trace (from circuit-simulation.md v1)
# ---------------------------------------------------------------------------

BELL_STATE_TRACE: list[dict[str, Any]] = [
    {
        "stepIndex": 0,
        "operationId": "op_1",
        "label": "After H",
        "basisProbabilities": {"00": 0.5, "10": 0.5},
        "amplitudes": {
            "00": {"re": 0.70710678, "im": 0.0},
            "10": {"re": 0.70710678, "im": 0.0},
        },
        "reducedQubits": [
            {
                "qubit": 0,
                "bloch": {"x": 1.0, "y": 0.0, "z": 0.0},
                "purity": 1.0,
                "label": "PURE_SUBSYSTEM",
            },
            {
                "qubit": 1,
                "bloch": {"x": 0.0, "y": 0.0, "z": 1.0},
                "purity": 1.0,
                "label": "PURE_SUBSYSTEM",
            },
        ],
    },
    {
        "stepIndex": 1,
        "operationId": "op_2",
        "label": "After CNOT",
        "basisProbabilities": {"00": 0.5, "11": 0.5},
        "amplitudes": {
            "00": {"re": 0.70710678, "im": 0.0},
            "11": {"re": 0.70710678, "im": 0.0},
        },
        "reducedQubits": [
            {
                "qubit": 0,
                "bloch": {"x": 0.0, "y": 0.0, "z": 0.0},
                "purity": 0.5,
                "label": "MIXED_SUBSYSTEM",
            },
            {
                "qubit": 1,
                "bloch": {"x": 0.0, "y": 0.0, "z": 0.0},
                "purity": 0.5,
                "label": "MIXED_SUBSYSTEM",
            },
        ],
    },
]

# A SimulationRun fixture that matches the contract's sr_demo_001 shape
BELL_SIMULATION_RUN = SimulationRun(
    id="sr_demo_001",
    learnerProfileId="lp_aarav",
    moduleId="mod_bell",
    circuitModelId="cm_bell_seed",
    predictionResponse={
        "checkpointId": "pc_bell_outcomes",
        "answer": "INDEPENDENT_RANDOM",
    },
    adapter="QISKIT_AER",
    shots=1024,
    status="SUCCEEDED",
    probabilities={"00": 0.5, "11": 0.5},
    counts={"00": 512, "11": 512},
    stateTrace=BELL_STATE_TRACE,
    conformance={
        "adapter": "PENNYLANE",
        "maxProbabilityDelta": 0.0,
        "epsilon": 0.000001,
        "passed": True,
        "skippedReason": None,
    },
    durationMs=84,
    createdAt="2026-08-23T05:27:00Z",
    schemaVersion=1,
)


# ---------------------------------------------------------------------------
# Test app and client helpers
# ---------------------------------------------------------------------------


def _make_app() -> FastAPI:
    """Create a minimal FastAPI app with only the flight-recorder router."""
    from app.models.errors import ErrorDetail, ErrorEnvelope
    from fastapi import HTTPException, Request
    from fastapi.responses import JSONResponse

    app = FastAPI()

    @app.exception_handler(HTTPException)
    async def http_exc(request: Request, exc: HTTPException) -> JSONResponse:
        if isinstance(exc.detail, dict):
            code = exc.detail.get("code", "HTTP_ERROR")
            message = exc.detail.get("message", str(exc.detail))
        else:
            code = "HTTP_ERROR"
            message = str(exc.detail)
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code=code, message=message, requestId="req_test"
            )
        )
        content = envelope.model_dump()
        content["detail"] = {"code": code, "message": message}
        return JSONResponse(status_code=exc.status_code, content=content)

    app.include_router(flight_recorder_router)
    return app


async def _seed_repo(repo: InMemoryRepository) -> None:
    """Seed core truth (learner profiles, challenges, etc.)."""
    await seed_core_truth(repo)


@pytest.fixture
def client() -> TestClient:
    """Return a TestClient with a fresh in-memory repo seeded with core truth."""
    import asyncio

    repo = InMemoryRepository()

    async def _setup() -> None:
        await _seed_repo(repo)
        await repo.create_simulation_run(BELL_SIMULATION_RUN.model_copy(deep=True))

    asyncio.run(_setup())
    set_repository(repo)
    app = _make_app()
    return TestClient(app)


def _post_diagnose(client: TestClient, body: dict) -> Any:
    return client.post("/v1/flight-recorder/diagnose", json=body)


# ---------------------------------------------------------------------------
# 1. Happy path — Bell fixture → SUPERPOSITION_VS_ENTANGLEMENT
# ---------------------------------------------------------------------------


def test_bell_fixture_returns_201_with_expected_fields(client: TestClient) -> None:
    """POST the Bell fixture → 201, firstDivergenceStep=1, repairChallengeId present."""
    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_demo_001"},
    )
    assert resp.status_code == 201, resp.json()
    data = resp.json()

    assert "misconceptionSignal" in data, "Missing misconceptionSignal key"
    assert "replay" in data, "Missing replay key"

    sig = data["misconceptionSignal"]
    assert sig["learnerProfileId"] == "lp_aarav"
    assert sig["simulationRunId"] == "sr_demo_001"
    assert sig["firstDivergenceStep"] == 1, (
        f"Expected firstDivergenceStep=1, got {sig['firstDivergenceStep']}"
    )
    assert sig["repairChallengeId"], "repairChallengeId must be non-empty"


# ---------------------------------------------------------------------------
# 2. Correct prediction → NO_SIGNAL, still 201
# ---------------------------------------------------------------------------


def test_correct_prediction_returns_no_signal_code(client: TestClient) -> None:
    """CORRELATED_00_11 (correct answer) → NO_SIGNAL code, 201 success."""
    import asyncio
    from app.repositories import get_repository

    repo = get_repository()
    correct_run = BELL_SIMULATION_RUN.model_copy(
        update={
            "id": "sr_correct_001",
            "predictionResponse": {
                "checkpointId": "pc_bell_outcomes",
                "answer": "CORRELATED_00_11",
            },
        },
        deep=True,
    )
    asyncio.run(repo.create_simulation_run(correct_run))

    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_correct_001"},
    )
    assert resp.status_code == 201, resp.json()
    data = resp.json()
    sig = data["misconceptionSignal"]
    assert sig["code"] == "NO_SIGNAL"
    assert sig.get("isCorrectPrediction") is True
    assert sig.get("firstDivergenceStep") is None
    assert data.get("isCorrectPrediction") is True


# ---------------------------------------------------------------------------
# 3. Unknown learner → 404 LEARNER_NOT_FOUND
# ---------------------------------------------------------------------------


def test_unknown_learner_returns_404(client: TestClient) -> None:
    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_nobody", "simulationRunId": "sr_demo_001"},
    )
    assert resp.status_code == 404
    detail = resp.json().get("detail", resp.json())
    assert detail.get("code") == "LEARNER_NOT_FOUND"


# ---------------------------------------------------------------------------
# 4. Unknown simulation run → 404 SIMULATION_RUN_NOT_FOUND
# ---------------------------------------------------------------------------


def test_unknown_simulation_run_returns_404(client: TestClient) -> None:
    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_nobody"},
    )
    assert resp.status_code == 404
    detail = resp.json().get("detail", resp.json())
    assert detail.get("code") == "SIMULATION_RUN_NOT_FOUND"


# ---------------------------------------------------------------------------
# 5. Run with status FAILED → 409 RUN_NOT_SUCCEEDED
# ---------------------------------------------------------------------------


def test_failed_run_returns_409(client: TestClient) -> None:
    import asyncio
    from app.repositories import get_repository

    repo = get_repository()
    failed_run = BELL_SIMULATION_RUN.model_copy(
        update={"id": "sr_failed_001", "status": "FAILED"},
        deep=True,
    )
    asyncio.run(repo.create_simulation_run(failed_run))

    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_failed_001"},
    )
    assert resp.status_code == 409
    detail = resp.json().get("detail", resp.json())
    assert detail.get("code") == "RUN_NOT_SUCCEEDED"


# ---------------------------------------------------------------------------
# 6. Run without predictionResponse → 422 PREDICTION_MISSING
# ---------------------------------------------------------------------------


def test_run_without_prediction_returns_422(client: TestClient) -> None:
    import asyncio
    from app.repositories import get_repository

    repo = get_repository()
    no_pred_run = BELL_SIMULATION_RUN.model_copy(
        update={"id": "sr_nopred_001", "predictionResponse": None},
        deep=True,
    )
    asyncio.run(repo.create_simulation_run(no_pred_run))

    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_nopred_001"},
    )
    assert resp.status_code == 422
    detail = resp.json().get("detail", resp.json())
    assert detail.get("code") == "PREDICTION_MISSING"


# ---------------------------------------------------------------------------
# 7. Run with empty stateTrace → 422 TRACE_INSUFFICIENT
# ---------------------------------------------------------------------------


def test_run_with_empty_trace_returns_422(client: TestClient) -> None:
    import asyncio
    from app.repositories import get_repository

    repo = get_repository()
    empty_trace_run = BELL_SIMULATION_RUN.model_copy(
        update={"id": "sr_notrace_001", "stateTrace": []},
        deep=True,
    )
    asyncio.run(repo.create_simulation_run(empty_trace_run))

    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_notrace_001"},
    )
    assert resp.status_code == 422
    detail = resp.json().get("detail", resp.json())
    assert detail.get("code") == "TRACE_INSUFFICIENT"


# ---------------------------------------------------------------------------
# 8. Response shape matches contract schema
# ---------------------------------------------------------------------------


def test_response_shape_matches_contract(client: TestClient) -> None:
    """Validate every required field from the flight-recorder-tutor contract."""
    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_demo_001"},
    )
    assert resp.status_code == 201
    data = resp.json()

    # Top-level keys
    assert set(data.keys()) >= {"misconceptionSignal", "replay"}

    # misconceptionSignal required fields (contract MisconceptionSignal type)
    sig = data["misconceptionSignal"]
    for field in ["id", "learnerProfileId", "simulationRunId", "code",
                  "firstDivergenceStep", "evidence", "confidence",
                  "repairChallengeId", "createdAt"]:
        assert field in sig, f"Missing field '{field}' in misconceptionSignal"

    # evidence sub-fields
    ev = sig["evidence"]
    for field in ["prediction", "verifiedBehavior", "stateTraceStepIndexes"]:
        assert field in ev, f"Missing field '{field}' in evidence"
    assert isinstance(ev["stateTraceStepIndexes"], list)

    # replay items
    assert isinstance(data["replay"], list)
    assert len(data["replay"]) >= 1
    for step in data["replay"]:
        for field in ["stepIndex", "headline", "evidenceKeys"]:
            assert field in step, f"Missing field '{field}' in replay step"


# ---------------------------------------------------------------------------
# 9. MisconceptionSignal is persisted in the repository
# ---------------------------------------------------------------------------


def test_misconception_signal_is_persisted(client: TestClient) -> None:
    import asyncio
    from app.repositories import get_repository

    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_demo_001"},
    )
    assert resp.status_code == 201
    signal_id = resp.json()["misconceptionSignal"]["id"]

    repo = get_repository()
    persisted: Optional[MisconceptionSignal] = asyncio.run(
        repo.get_misconception_signal(signal_id)
    )
    assert persisted is not None, "Signal not found in repository after POST"
    assert persisted.id == signal_id
    assert persisted.simulationRunId == "sr_demo_001"


# ---------------------------------------------------------------------------
# 10. Replay evidence keys are all from the registered KNOWN_EVIDENCE_KEYS set
# ---------------------------------------------------------------------------


def test_replay_evidence_keys_are_all_registered(client: TestClient) -> None:
    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_demo_001"},
    )
    assert resp.status_code == 201
    for step in resp.json()["replay"]:
        for key in step["evidenceKeys"]:
            assert key in KNOWN_EVIDENCE_KEYS, (
                f"Replay step emitted unregistered evidence key: {key!r}"
            )


# ---------------------------------------------------------------------------
# 11. All prediction variants round-trip through the endpoint
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "prediction, expected_code, expected_fds",
    [
        ("INDEPENDENT_RANDOM", "SUPERPOSITION_VS_ENTANGLEMENT", 1),
        ("ALWAYS_00", "MEASUREMENT_DETERMINISM", 1),
        ("ALWAYS_11", "MEASUREMENT_DETERMINISM", 1),
        ("ALWAYS_01", "GATE_ORDER", 0),
        ("ALWAYS_10", "GATE_ORDER", 0),
        ("CORRELATED_00_11", "NO_SIGNAL", None),
    ],
)
def test_all_prediction_variants_return_correct_code(
    client: TestClient,
    prediction: str,
    expected_code: str,
    expected_fds: Optional[int],
) -> None:
    """Every prediction variant maps to the expected code and firstDivergenceStep."""
    import asyncio
    from app.repositories import get_repository

    repo = get_repository()
    run_id = f"sr_variant_{prediction.lower()}"
    variant_run = BELL_SIMULATION_RUN.model_copy(
        update={
            "id": run_id,
            "predictionResponse": {
                "checkpointId": "pc_bell_outcomes",
                "answer": prediction,
            },
        },
        deep=True,
    )
    asyncio.run(repo.create_simulation_run(variant_run))

    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": run_id},
    )
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.json()}"
    sig = resp.json()["misconceptionSignal"]
    assert sig["code"] == expected_code, (
        f"Prediction {prediction!r}: expected code {expected_code!r}, got {sig['code']!r}"
    )
    assert sig["firstDivergenceStep"] == expected_fds, (
        f"Prediction {prediction!r}: expected firstDivergenceStep={expected_fds}, "
        f"got {sig['firstDivergenceStep']}"
    )


# ---------------------------------------------------------------------------
# 12. Confidence is always 1.0 for deterministic diagnosis
# ---------------------------------------------------------------------------


def test_confidence_is_always_one(client: TestClient) -> None:
    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_aarav", "simulationRunId": "sr_demo_001"},
    )
    assert resp.status_code == 201
    sig = resp.json()["misconceptionSignal"]
    assert sig["confidence"] == 1.0, (
        f"Expected confidence=1.0, got {sig['confidence']}"
    )


# ---------------------------------------------------------------------------
# 13. Meera learner also routes correctly (second hero learner)
# ---------------------------------------------------------------------------


def test_meera_learner_also_diagnoses(client: TestClient) -> None:
    """The Meera learner profile is also seeded and should work end-to-end."""
    import asyncio
    from app.repositories import get_repository

    repo = get_repository()
    meera_run = BELL_SIMULATION_RUN.model_copy(
        update={
            "id": "sr_meera_001",
            "learnerProfileId": "lp_meera",
        },
        deep=True,
    )
    asyncio.run(repo.create_simulation_run(meera_run))

    resp = _post_diagnose(
        client,
        {"learnerProfileId": "lp_meera", "simulationRunId": "sr_meera_001"},
    )
    assert resp.status_code == 201
    sig = resp.json()["misconceptionSignal"]
    assert sig["learnerProfileId"] == "lp_meera"
