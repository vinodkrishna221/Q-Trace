"""Unit test suite for DATA-3: Persist Challenge Attempts and progress atomically."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.models.entities import SimulationRun, utc_now_iso
from app.repositories import (
    DataRepositoryProtocol,
    InMemoryRepository,
    seed_core_truth,
    set_repository,
)
from app.routers.progress import _idempotency_cache


@pytest_asyncio.fixture
async def test_repo() -> DataRepositoryProtocol:
    """Isolated, freshly-seeded in-memory repository for each test."""
    repo = InMemoryRepository()
    await seed_core_truth(repo)
    set_repository(repo)
    _idempotency_cache.clear()
    return repo


@pytest_asyncio.fixture
async def client(test_repo: DataRepositoryProtocol) -> AsyncClient:
    """Async test client bound to the FastAPI app with the test repository."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_get_challenge(client: AsyncClient, test_repo: DataRepositoryProtocol) -> None:
    """Proves retrieval of challenge and 404 when challenge does not exist."""
    # 1. Existing Bell Repair challenge
    res = await client.get("/v1/challenges/ch_bell_repair")
    assert res.status_code == 200
    data = res.json()
    assert "challenge" in data
    ch = data["challenge"]
    assert ch["id"] == "ch_bell_repair"
    assert ch["moduleId"] == "mod_bell"
    assert ch["type"] == "CIRCUIT_REPAIR"
    assert ch["points"] == 100
    assert ch["starterCircuitModelId"] == "cm_bell_broken"
    assert ch["acceptanceRule"]["kind"] == "PROBABILITY_SUPPORT_EQUALS"

    # 2. Nonexistent challenge
    res_404 = await client.get("/v1/challenges/ch_nonexistent_xyz")
    assert res_404.status_code == 404
    err = res_404.json()["detail"]
    assert err["code"] == "CHALLENGE_NOT_FOUND"


@pytest.mark.asyncio
async def test_post_passing_bell_attempt_twice_idempotency_and_atomic_progress(
    client: AsyncClient, test_repo: DataRepositoryProtocol
) -> None:
    """Proves posting a passing Bell attempt twice with idempotency key results in

    exactly ONE attempt, ONE 100-point increment, and updated Instructor Insight.
    """
    # Baseline checks
    init_prog = await test_repo.get_progress_record_by_learner("lp_aarav")
    assert init_prog is not None
    assert init_prog.totalPoints == 200
    assert "mod_bell" not in init_prog.completedModuleIds

    # Register a successful simulation run for Aarav
    sim_run = SimulationRun(
        id="sr_demo_002",
        learnerProfileId="lp_aarav",
        moduleId="mod_bell",
        circuitModelId="cm_aarav_repaired",
        status="SUCCEEDED",
        probabilities={"00": 0.5, "11": 0.5},
        counts={"00": 512, "11": 512},
        stateTrace=[],
        createdAt=utc_now_iso(),
    )
    await test_repo.create_simulation_run(sim_run)

    payload = {
        "challengeId": "ch_bell_repair",
        "learnerProfileId": "lp_aarav",
        "submittedAnswer": {
            "type": "CIRCUIT_MODEL",
            "circuitModelId": "cm_aarav_repaired",
        },
        "simulationRunId": "sr_demo_002",
    }
    headers = {"Idempotency-Key": "idem_attempt_aarav_bell_001"}

    # First POST attempt
    res1 = await client.post("/v1/challenge-attempts", json=payload, headers=headers)
    assert res1.status_code == 201
    data1 = res1.json()

    attempt1 = data1["challengeAttempt"]
    progress1 = data1["progressRecord"]

    assert attempt1["challengeId"] == "ch_bell_repair"
    assert attempt1["learnerProfileId"] == "lp_aarav"
    assert attempt1["passed"] is True
    assert attempt1["score"] == 100
    assert attempt1["feedbackCode"] == "BELL_SUPPORT_CORRECT"
    assert attempt1["attemptNumber"] == 1

    assert progress1["totalPoints"] == 300  # 200 baseline + 100 points
    assert "mod_bell" in progress1["completedModuleIds"]
    skill_map = {s["skillId"]: s for s in progress1["skillStates"]}
    assert skill_map["skill_create_bell"]["status"] == "MASTERED"
    assert skill_map["skill_create_bell"]["score"] == 100

    # Second POST attempt with the SAME Idempotency-Key
    res2 = await client.post("/v1/challenge-attempts", json=payload, headers=headers)
    assert res2.status_code == 201
    data2 = res2.json()

    # Data returned is identical
    assert data2 == data1

    # Verify repository state: ONLY 1 attempt was recorded and points were not double-incremented
    attempts_in_store = await test_repo.list_challenge_attempts(
        learner_profile_id="lp_aarav", challenge_id="ch_bell_repair"
    )
    assert len(attempts_in_store) == 1
    assert attempts_in_store[0].id == attempt1["id"]

    updated_prog_in_store = await test_repo.get_progress_record_by_learner("lp_aarav")
    assert updated_prog_in_store is not None
    assert updated_prog_in_store.totalPoints == 300

    # Verify Instructor Insight updated after passing attempt
    res_insight = await client.get("/v1/instructor-insights/cohort_demo_2026")
    assert res_insight.status_code == 200
    insight_data = res_insight.json()["instructorInsight"]
    assert insight_data["cohortId"] == "cohort_demo_2026"
    assert insight_data["liveDemoLearner"]["learnerProfileId"] == "lp_aarav"
    assert insight_data["liveDemoLearner"]["latestAttemptPassed"] is True

    # Check challenge pass rate for ch_bell_repair
    ch_rates = {r["challengeId"]: r for r in insight_data["challengePassRate"]}
    assert "ch_bell_repair" in ch_rates
    assert ch_rates["ch_bell_repair"]["passed"] == 1
    assert ch_rates["ch_bell_repair"]["attempted"] == 1
    assert ch_rates["ch_bell_repair"]["rate"] == 1.0


@pytest.mark.asyncio
async def test_post_failing_bell_attempt_deterministic_scoring(
    client: AsyncClient, test_repo: DataRepositoryProtocol
) -> None:
    """Proves a failing circuit attempt yields score=0, passed=False, and no points increment."""
    # Register a failing simulation run (probabilities not 00 and 11)
    failing_run = SimulationRun(
        id="sr_demo_failing",
        learnerProfileId="lp_aarav",
        moduleId="mod_bell",
        circuitModelId="cm_bell_broken",
        status="SUCCEEDED",
        probabilities={"00": 0.5, "10": 0.5},
        counts={"00": 512, "10": 512},
        stateTrace=[],
        createdAt=utc_now_iso(),
    )
    await test_repo.create_simulation_run(failing_run)

    payload = {
        "challengeId": "ch_bell_repair",
        "learnerProfileId": "lp_aarav",
        "submittedAnswer": {"circuitModelId": "cm_bell_broken"},
        "simulationRunId": "sr_demo_failing",
    }

    res = await client.post("/v1/challenge-attempts", json=payload)
    assert res.status_code == 201
    data = res.json()

    attempt = data["challengeAttempt"]
    progress = data["progressRecord"]

    assert attempt["passed"] is False
    assert attempt["score"] == 0
    assert attempt["feedbackCode"] == "BELL_SUPPORT_INCORRECT"

    # Progress points should remain unchanged (200)
    assert progress["totalPoints"] == 200


@pytest.mark.asyncio
async def test_post_attempt_validation_and_conflict_errors(
    client: AsyncClient, test_repo: DataRepositoryProtocol
) -> None:
    """Proves contract-specified error responses (404, 409, 422)."""
    # 1. Nonexistent challenge -> 404
    res_ch_404 = await client.post(
        "/v1/challenge-attempts",
        json={"challengeId": "ch_unknown", "learnerProfileId": "lp_aarav"},
    )
    assert res_ch_404.status_code == 404
    assert res_ch_404.json()["detail"]["code"] == "CHALLENGE_NOT_FOUND"

    # 2. Nonexistent learner -> 404
    res_lr_404 = await client.post(
        "/v1/challenge-attempts",
        json={"challengeId": "ch_bell_repair", "learnerProfileId": "lp_unknown"},
    )
    assert res_lr_404.status_code == 404
    assert res_lr_404.json()["detail"]["code"] == "LEARNER_NOT_FOUND"

    # 3. Nonexistent simulation run -> 404
    res_sr_404 = await client.post(
        "/v1/challenge-attempts",
        json={
            "challengeId": "ch_bell_repair",
            "learnerProfileId": "lp_aarav",
            "simulationRunId": "sr_nonexistent",
        },
    )
    assert res_sr_404.status_code == 404
    assert res_sr_404.json()["detail"]["code"] == "SIMULATION_RUN_NOT_FOUND"

    # 4. Simulation run failed status -> 409
    failed_run = SimulationRun(
        id="sr_failed_status",
        learnerProfileId="lp_aarav",
        moduleId="mod_bell",
        circuitModelId="cm_bell_seed",
        status="FAILED",
        probabilities={},
        counts={},
        stateTrace=[],
        createdAt=utc_now_iso(),
    )
    await test_repo.create_simulation_run(failed_run)

    res_409 = await client.post(
        "/v1/challenge-attempts",
        json={
            "challengeId": "ch_bell_repair",
            "learnerProfileId": "lp_aarav",
            "simulationRunId": "sr_failed_status",
        },
    )
    assert res_409.status_code == 409
    assert res_409.json()["detail"]["code"] == "RUN_NOT_SUCCEEDED"

    # 5. Missing simulation run on circuit repair -> 422
    res_422 = await client.post(
        "/v1/challenge-attempts",
        json={
            "challengeId": "ch_bell_repair",
            "learnerProfileId": "lp_aarav",
            "simulationRunId": None,
        },
    )
    assert res_422.status_code == 422
    assert res_422.json()["detail"]["code"] == "ACCEPTANCE_EVIDENCE_INVALID"


@pytest.mark.asyncio
async def test_get_progress_records(
    client: AsyncClient, test_repo: DataRepositoryProtocol
) -> None:
    """Proves retrieval of learner progress records and 404 on unknown learner."""
    # 1. Aarav's progress
    res = await client.get("/v1/progress-records/lp_aarav")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "progress_lp_aarav"
    assert data["learnerProfileId"] == "lp_aarav"
    assert data["totalPoints"] == 200
    assert len(data["skillStates"]) == 4

    # 2. Unknown learner -> 404
    res_404 = await client.get("/v1/progress-records/lp_nonexistent")
    assert res_404.status_code == 404
    assert res_404.json()["detail"]["code"] == "LEARNER_NOT_FOUND"


@pytest.mark.asyncio
async def test_instructor_insights_endpoint(
    client: AsyncClient, test_repo: DataRepositoryProtocol
) -> None:
    """Proves aggregate instructor insight generation and 404 on unknown cohort."""
    # 1. Existing cohort
    res = await client.get("/v1/instructor-insights/cohort_demo_2026")
    assert res.status_code == 200
    data = res.json()
    assert "instructorInsight" in data
    insight = data["instructorInsight"]
    assert insight["cohortId"] == "cohort_demo_2026"
    assert insight["learnerCount"] == 2
    assert insight["dataDisclosure"] == "Synthetic seeded cohort plus current live demo attempt"

    # 2. Unknown cohort -> 404
    res_404 = await client.get("/v1/instructor-insights/cohort_nonexistent")
    assert res_404.status_code == 404
    assert res_404.json()["detail"]["code"] == "COHORT_NOT_FOUND"


@pytest.mark.asyncio
async def test_learning_content_contract_endpoints(
    client: AsyncClient, test_repo: DataRepositoryProtocol
) -> None:
    """Proves learning content endpoints match contract v1."""
    # 1. Demo profiles
    res_dp = await client.get("/v1/demo-profiles")
    assert res_dp.status_code == 200
    dp = res_dp.json()
    assert len(dp["profiles"]) == 2
    assert dp["instructor"]["displayName"] == "Dr. Rao"

    # 2. Learning path for Aarav
    res_lp = await client.get("/v1/learning-paths/lp_aarav")
    assert res_lp.status_code == 200
    lp = res_lp.json()["learningPath"]
    assert lp["learnerProfileId"] == "lp_aarav"
    assert lp["entryBand"] == "FOUNDATIONS"
    assert "mod_bell" in lp["moduleIds"]

    # 3. Learning path 404
    res_lp_404 = await client.get("/v1/learning-paths/lp_unknown")
    assert res_lp_404.status_code == 404

    # 4. Modules list
    res_mods = await client.get("/v1/modules")
    assert res_mods.status_code == 200
    mods = res_mods.json()["modules"]
    assert len(mods) == 3
    assert mods[0]["id"] in ["mod_superposition", "mod_measurement", "mod_bell"]

    # 5. Single module by slug
    res_mod = await client.get("/v1/modules/bell-state")
    assert res_mod.status_code == 200
    mod = res_mod.json()["module"]
    assert mod["id"] == "mod_bell"
    assert mod["slug"] == "bell-state"
    assert mod["predictionCheckpoint"]["id"] == "pc_bell_outcomes"
    assert "ch_bell_repair" in mod["challengeIds"]

    # 6. Single module 404
    res_mod_404 = await client.get("/v1/modules/nonexistent-module")
    assert res_mod_404.status_code == 404
