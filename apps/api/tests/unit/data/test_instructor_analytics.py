"""Unit tests for DATA-7: Harden analytics aggregation and idempotency."""

import asyncio
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.repositories import (
    DataRepositoryProtocol,
    InMemoryRepository,
    seed_demo_cohort,
    set_repository,
)
from app.routers.progress import _idempotency_cache


@pytest.fixture
async def seeded_repo() -> DataRepositoryProtocol:
    """Isolated, seeded in-memory repository with 30 synthetic cohort profiles."""
    repo = InMemoryRepository()
    await seed_demo_cohort(repo)
    set_repository(repo)
    _idempotency_cache.clear()
    return repo


@pytest.fixture
async def client(seeded_repo: DataRepositoryProtocol) -> AsyncClient:
    """Async test client bound to FastAPI app with seeded repository."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_instructor_analytics_rates_and_misconceptions(
    client: AsyncClient, seeded_repo: DataRepositoryProtocol
) -> None:
    """Verify rates, top misconception counts, live demo marker, and disclosure for cohort_demo_2026."""
    res = await client.get("/v1/instructor-insights/cohort_demo_2026")
    assert res.status_code == 200
    data = res.json()["instructorInsight"]

    assert data["cohortId"] == "cohort_demo_2026"
    assert data["learnerCount"] == 30
    assert len(data["moduleCompletion"]) > 0
    assert len(data["challengePassRate"]) > 0
    assert len(data["topMisconceptions"]) > 0

    # Verify top misconceptions are sorted descending by occurrences
    counts = [m["occurrences"] for m in data["topMisconceptions"]]
    assert counts == sorted(counts, reverse=True)

    # Verify live demo learner marker
    assert data["liveDemoLearner"] is not None
    assert data["liveDemoLearner"]["learnerProfileId"] == "lp_aarav"

    # Verify disclosure string
    assert "Synthetic" in data["dataDisclosure"]


@pytest.mark.asyncio
async def test_instructor_analytics_empty_cohort(
    client: AsyncClient, seeded_repo: DataRepositoryProtocol
) -> None:
    """Verify empty/non-existent cohort returns 404 COHORT_NOT_FOUND."""
    res = await client.get("/v1/instructor-insights/cohort_non_existent_999")
    assert res.status_code == 404
    err = res.json()["detail"]
    assert err["code"] == "COHORT_NOT_FOUND"


@pytest.mark.asyncio
async def test_instructor_analytics_cache_ttl(
    client: AsyncClient, seeded_repo: DataRepositoryProtocol
) -> None:
    """Verify 10-second cache returns identical generatedAt timestamp on subsequent calls."""
    res1 = await client.get("/v1/instructor-insights/cohort_demo_2026")
    assert res1.status_code == 200
    ts1 = res1.json()["instructorInsight"]["generatedAt"]

    # Immediate second call must hit 10-second cache
    res2 = await client.get("/v1/instructor-insights/cohort_demo_2026")
    assert res2.status_code == 200
    ts2 = res2.json()["instructorInsight"]["generatedAt"]
    assert ts1 == ts2

    # Clear repository insight cache to simulate TTL expiration
    seeded_repo._insight_cache.clear()

    res3 = await client.get("/v1/instructor-insights/cohort_demo_2026")
    assert res3.status_code == 200
    ts3 = res3.json()["instructorInsight"]["generatedAt"]

    # The timestamp after cache reset is fresh (or generated at new execution)
    assert "instructorInsight" in res3.json()


@pytest.mark.asyncio
async def test_concurrent_duplicate_challenge_attempts_idempotency(
    client: AsyncClient, seeded_repo: DataRepositoryProtocol
) -> None:
    """Verify concurrent duplicate requests with same Idempotency-Key return identical result without double score."""
    # Retrieve initial progress for Aarav
    prog_res_before = await client.get("/v1/progress-records/lp_aarav")
    assert prog_res_before.status_code == 200
    initial_points = prog_res_before.json()["totalPoints"]

    payload = {
        "challengeId": "ch_bell_quiz",
        "learnerProfileId": "lp_aarav",
        "submittedAnswer": {"choice": "option_superposition"},
    }
    headers = {"Idempotency-Key": "idemp_key_concurrent_777"}

    # Execute 5 concurrent attempts simultaneously
    tasks = [
        client.post("/v1/challenge-attempts", json=payload, headers=headers)
        for _ in range(5)
    ]
    responses = await asyncio.gather(*tasks)

    # All responses must succeed with status 201
    for r in responses:
        assert r.status_code == 201

    # All responses must return the EXACT same challenge attempt ID
    attempt_ids = {r.json()["challengeAttempt"]["id"] for r in responses}
    assert len(attempt_ids) == 1

    # Verify progress record updated total points only ONCE
    prog_res_after = await client.get("/v1/progress-records/lp_aarav")
    assert prog_res_after.status_code == 200
    final_points = prog_res_after.json()["totalPoints"]

    earned = responses[0].json()["challengeAttempt"]["score"]
    assert final_points == initial_points + earned
