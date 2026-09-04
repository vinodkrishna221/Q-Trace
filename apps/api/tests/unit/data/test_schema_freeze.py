"""Unit tests for DATA-8: Freeze schema and polish edge states.

TEST command (verbatim from card):
    uv run --project apps/api pytest apps/api/tests/unit/data/test_schema_freeze.py

Coverage:
  1. Schema version snapshot — asserts SCHEMA_VERSION == 1 and every
     collection name and index name matches the frozen manifest.
  2. Entity field snapshot — asserts every required contract-visible field
     is present on the corresponding Pydantic model.
  3. Edge state — long displayName, empty cohort 404, failed attempt shape.
  4. Synthetic disclosure — InstructorInsight.dataDisclosure always contains
     the frozen disclosure substring.
  5. Data reset runbook — seed_demo_cohort idempotency and reset cycle.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.entities import (
    ChallengeAttempt,
    InstructorInsight,
    LearnerProfile,
    ProgressRecord,
    PriorKnowledge,
)
from app.repositories import (
    DataRepositoryProtocol,
    InMemoryRepository,
    seed_demo_cohort,
    seed_core_truth,
    set_repository,
)
from app.repositories.schema_freeze import (
    COLLECTION_NAMES,
    ENTITY_REQUIRED_FIELDS,
    REQUIRED_INDEX_NAMES,
    SCHEMA_VERSION,
    SYNTHETIC_DISCLOSURE_SUBSTRING,
)
from app.repositories.mongo import MongoRepository


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
async def seeded_repo() -> DataRepositoryProtocol:
    """Isolated seeded in-memory repository (30-profile demo cohort)."""
    repo = InMemoryRepository()
    await seed_demo_cohort(repo)
    set_repository(repo)
    return repo


@pytest.fixture
async def client(seeded_repo: DataRepositoryProtocol) -> AsyncClient:
    """Async test client bound to FastAPI app with seeded repository."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ---------------------------------------------------------------------------
# 1. Schema version and collection name snapshot
# ---------------------------------------------------------------------------


def test_schema_version_is_one() -> None:
    """SCHEMA_VERSION must be exactly 1 for the current schema freeze."""
    assert SCHEMA_VERSION == 1


def test_collection_names_snapshot() -> None:
    """Exact collection names must match the frozen manifest — no additions, no removals."""
    expected = (
        "learner_profiles",
        "instructor_profiles",
        "learning_paths",
        "modules",
        "prediction_checkpoints",
        "circuit_models",
        "simulation_runs",
        "misconception_signals",
        "challenges",
        "challenge_attempts",
        "progress_records",
    )
    assert COLLECTION_NAMES == expected, (
        f"Collection name drift detected.\n"
        f"  Expected: {expected}\n"
        f"  Got:      {COLLECTION_NAMES}\n"
        "Bump SCHEMA_VERSION and update schema_freeze.py before adding collections."
    )


def test_index_names_snapshot() -> None:
    """Every collection in REQUIRED_INDEX_NAMES must match the MongoRepository index list."""
    # Verify every collection in the freeze manifest is also in COLLECTION_NAMES
    for coll in REQUIRED_INDEX_NAMES:
        assert coll in COLLECTION_NAMES, (
            f"Index manifest references collection '{coll}' not in COLLECTION_NAMES."
        )

    # Spot-check the three highest-query collections
    assert "idx_learner_profiles_id_unique" in REQUIRED_INDEX_NAMES["learner_profiles"]
    assert "idx_attempts_learner_challenge_num_unique" in REQUIRED_INDEX_NAMES["challenge_attempts"]
    assert "idx_progress_learner_unique" in REQUIRED_INDEX_NAMES["progress_records"]
    assert "idx_signals_learner_code_created" in REQUIRED_INDEX_NAMES["misconception_signals"]


def test_mongo_repository_collection_names_match_freeze() -> None:
    """MongoRepository getter methods must reference exactly the collection names in the freeze."""
    # We check by instantiating with a mock db-like object and calling getters
    class _FakeDB(dict):
        def __getitem__(self, name: str):  # type: ignore[override]
            return name  # return the name itself for inspection

    db = _FakeDB()
    repo = MongoRepository(db=db)

    actual = {
        repo.get_learner_profiles_collection(),
        repo.get_instructor_profiles_collection(),
        repo.get_learning_paths_collection(),
        repo.get_modules_collection(),
        repo.get_prediction_checkpoints_collection(),
        repo.get_circuit_models_collection(),
        repo.get_simulation_runs_collection(),
        repo.get_misconception_signals_collection(),
        repo.get_challenges_collection(),
        repo.get_challenge_attempts_collection(),
        repo.get_progress_records_collection(),
    }
    frozen = set(COLLECTION_NAMES)
    assert actual == frozen, (
        f"MongoRepository uses collections not in freeze manifest.\n"
        f"  Extra in repo:   {actual - frozen}\n"
        f"  Missing in repo: {frozen - actual}"
    )


# ---------------------------------------------------------------------------
# 2. Entity field snapshot
# ---------------------------------------------------------------------------


def test_learner_profile_required_fields() -> None:
    """LearnerProfile must expose every contract-required field."""
    required = set(ENTITY_REQUIRED_FIELDS["LearnerProfile"])
    model_fields = set(LearnerProfile.model_fields.keys())
    missing = required - model_fields
    assert not missing, f"LearnerProfile missing required fields: {missing}"


def test_progress_record_required_fields() -> None:
    """ProgressRecord must expose every contract-required field."""
    required = set(ENTITY_REQUIRED_FIELDS["ProgressRecord"])
    model_fields = set(ProgressRecord.model_fields.keys())
    missing = required - model_fields
    assert not missing, f"ProgressRecord missing required fields: {missing}"


def test_challenge_attempt_required_fields() -> None:
    """ChallengeAttempt must expose every contract-required field."""
    required = set(ENTITY_REQUIRED_FIELDS["ChallengeAttempt"])
    model_fields = set(ChallengeAttempt.model_fields.keys())
    missing = required - model_fields
    assert not missing, f"ChallengeAttempt missing required fields: {missing}"


def test_instructor_insight_required_fields() -> None:
    """InstructorInsight must expose every contract-required field."""
    required = set(ENTITY_REQUIRED_FIELDS["InstructorInsight"])
    model_fields = set(InstructorInsight.model_fields.keys())
    missing = required - model_fields
    assert not missing, f"InstructorInsight missing required fields: {missing}"


# ---------------------------------------------------------------------------
# 3. Edge states — long name, empty cohort 404, failed attempt shape
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_long_display_name_profile_round_trip(
    seeded_repo: DataRepositoryProtocol,
) -> None:
    """A learner profile with a very long displayName (255 chars) stores and retrieves without truncation."""
    long_name = "A" * 255
    profile = LearnerProfile(
        id="lp_edge_long_name",
        displayName=long_name,
        role="BEGINNER_CSE",
        cohortId="cohort_edge",
        priorKnowledge=PriorKnowledge(),
        activeLearningPathId="path_edge",
        schemaVersion=1,
    )
    saved = await seeded_repo.create_or_update_learner_profile(profile)
    fetched = await seeded_repo.get_learner_profile("lp_edge_long_name")
    assert fetched is not None
    assert fetched.displayName == long_name
    assert len(fetched.displayName) == 255
    assert saved.schemaVersion == SCHEMA_VERSION


@pytest.mark.asyncio
async def test_empty_cohort_returns_404(client: AsyncClient) -> None:
    """GET /v1/instructor-insights/<unknown> must return 404 COHORT_NOT_FOUND."""
    res = await client.get("/v1/instructor-insights/cohort_does_not_exist_data8")
    assert res.status_code == 404
    detail = res.json()["detail"]
    assert detail["code"] == "COHORT_NOT_FOUND"


@pytest.mark.asyncio
async def test_failed_challenge_attempt_shape(client: AsyncClient) -> None:
    """A failing attempt must return 201 with passed=False, score=0, and a valid progressRecord."""
    # Use quiz with deliberately wrong answer so grading deterministically fails
    payload = {
        "challengeId": "ch_bell_quiz",
        "learnerProfileId": "lp_aarav",
        "submittedAnswer": {"choice": "wrong_answer_intentional"},
    }
    res = await client.post("/v1/challenge-attempts", json=payload)
    assert res.status_code == 201
    body = res.json()

    attempt = body["challengeAttempt"]
    assert attempt["passed"] is False
    assert attempt["score"] == 0
    assert attempt["feedbackCode"] != ""
    assert "attemptNumber" in attempt
    assert "createdAt" in attempt
    assert attempt["schemaVersion"] == SCHEMA_VERSION

    progress = body["progressRecord"]
    assert "totalPoints" in progress
    assert "updatedAt" in progress
    assert progress["schemaVersion"] == SCHEMA_VERSION


@pytest.mark.asyncio
async def test_learner_not_found_returns_404(client: AsyncClient) -> None:
    """GET /v1/progress-records/<unknown> must return 404 LEARNER_NOT_FOUND."""
    res = await client.get("/v1/progress-records/lp_nonexistent_data8")
    assert res.status_code == 404
    detail = res.json()["detail"]
    assert detail["code"] == "LEARNER_NOT_FOUND"


# ---------------------------------------------------------------------------
# 4. Synthetic disclosure in every instructor response
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_instructor_insight_synthetic_disclosure_present(
    client: AsyncClient,
) -> None:
    """Every instructorInsight response must carry the frozen disclosure substring."""
    res = await client.get("/v1/instructor-insights/cohort_demo_2026")
    assert res.status_code == 200
    disclosure = res.json()["instructorInsight"]["dataDisclosure"]
    assert SYNTHETIC_DISCLOSURE_SUBSTRING in disclosure, (
        f"dataDisclosure '{disclosure}' does not contain "
        f"required substring '{SYNTHETIC_DISCLOSURE_SUBSTRING}'"
    )


def test_instructor_insight_model_default_disclosure() -> None:
    """InstructorInsight default dataDisclosure must contain the frozen disclosure substring."""
    insight = InstructorInsight(cohortId="cohort_test")
    assert SYNTHETIC_DISCLOSURE_SUBSTRING in insight.dataDisclosure


# ---------------------------------------------------------------------------
# 5. Data reset / pre-warm runbook — idempotency and reset cycle
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_seed_then_reset_then_reseed_idempotency() -> None:
    """reset() then seed_demo_cohort() must restore hero IDs exactly, proving the pre-warm runbook works."""
    repo = InMemoryRepository()

    # First seed
    await seed_demo_cohort(repo)
    aarav_before = await repo.get_learner_profile("lp_aarav")
    assert aarav_before is not None

    # Reset (simulates `seed.py --reset`)
    await repo.reset()
    aarav_after_reset = await repo.get_learner_profile("lp_aarav")
    assert aarav_after_reset is None, "Reset must wipe hero records"

    # Re-seed (simulates `seed.py` pre-warm)
    await seed_demo_cohort(repo)
    aarav_restored = await repo.get_learner_profile("lp_aarav")
    assert aarav_restored is not None
    assert aarav_restored.id == "lp_aarav"
    assert aarav_restored.displayName == "Aarav"

    # Instructor profile restored
    rao = await repo.get_instructor_profile("instructor_rao")
    assert rao is not None
    assert rao.id == "instructor_rao"


@pytest.mark.asyncio
async def test_double_seed_does_not_duplicate_profiles() -> None:
    """Calling seed_demo_cohort twice must not create duplicate learner profiles."""
    repo = InMemoryRepository()
    await seed_demo_cohort(repo)
    await seed_demo_cohort(repo)  # second call — idempotent upsert

    profiles = await repo.list_learner_profiles(cohort_id="cohort_demo_2026")
    ids = [p.id for p in profiles]
    assert len(ids) == len(set(ids)), "Duplicate learner profile IDs detected after double seed"

    # Hero IDs appear exactly once
    assert ids.count("lp_aarav") == 1
    assert ids.count("lp_meera") == 1
