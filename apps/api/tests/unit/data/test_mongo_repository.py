"""Unit tests for Q-Trace MongoRepository, collection getters, index verification, and schema version guards."""

import pytest
from typing import Any, Optional
from app.models.entities import (
    Challenge,
    ChallengeAttempt,
    CircuitModel,
    InstructorProfile,
    LearnerProfile,
    LearningPath,
    MisconceptionSignal,
    Module,
    Operation,
    PredictionCheckpoint,
    ProgressRecord,
    SimulationRun,
    SkillState,
)
from app.repositories.mongo import MongoRepository


class MockAsyncCursor:
    """Mock for PyMongo AsyncCursor supporting find() iteration and to_list()."""

    def __init__(self, items: list[dict[str, Any]]) -> None:
        self.items = [dict(item) for item in items]

    async def to_list(self, length: Optional[int] = None) -> list[dict[str, Any]]:
        return self.items

    def __aiter__(self):
        self._iter = iter(self.items)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


class MockAsyncCollection:
    """In-memory mock of a PyMongo AsyncCollection for unit testing."""

    def __init__(self, name: str) -> None:
        self.name = name
        self.docs: dict[str, dict[str, Any]] = {}
        self.indexes: dict[str, dict[str, Any]] = {}

    async def create_index(self, keys: list[tuple[str, int]], unique: bool = False, name: Optional[str] = None) -> str:
        idx_name = name or "_".join(f"{k}_{v}" for k, v in keys)
        self.indexes[idx_name] = {"keys": keys, "unique": unique}
        return idx_name

    async def delete_many(self, query: dict[str, Any]) -> None:
        if not query:
            self.docs.clear()
            return
        to_delete = [
            doc_id for doc_id, doc in self.docs.items()
            if self._matches(doc, query)
        ]
        for doc_id in to_delete:
            del self.docs[doc_id]

    async def find_one(self, query: dict[str, Any]) -> Optional[dict[str, Any]]:
        for doc in self.docs.values():
            if self._matches(doc, query):
                return dict(doc)
        return None

    def find(self, query: dict[str, Any]) -> MockAsyncCursor:
        matches = [dict(doc) for doc in self.docs.values() if self._matches(doc, query)]
        return MockAsyncCursor(matches)

    async def update_one(self, filter_query: dict[str, Any], update_doc: dict[str, Any], upsert: bool = False) -> None:
        doc_id = filter_query.get("id") or filter_query.get("_id")
        existing = None
        if doc_id and doc_id in self.docs:
            existing = self.docs[doc_id]
        else:
            for d in self.docs.values():
                if self._matches(d, filter_query):
                    existing = d
                    doc_id = d.get("id") or d.get("_id")
                    break

        if existing is not None:
            if "$set" in update_doc:
                existing.update(update_doc["$set"])
        elif upsert:
            new_doc = dict(update_doc.get("$set", {}))
            if doc_id:
                new_doc.setdefault("id", doc_id)
                new_doc.setdefault("_id", doc_id)
            target_id = str(new_doc.get("id") or new_doc.get("_id") or len(self.docs) + 1)
            self.docs[target_id] = new_doc

    def _matches(self, doc: dict[str, Any], query: dict[str, Any]) -> bool:
        for k, v in query.items():
            if k not in doc or doc[k] != v:
                return False
        return True


class MockAsyncDatabase:
    """In-memory mock of a PyMongo AsyncDatabase."""

    def __init__(self) -> None:
        self.collections: dict[str, MockAsyncCollection] = {}

    def __getitem__(self, name: str) -> MockAsyncCollection:
        if name not in self.collections:
            self.collections[name] = MockAsyncCollection(name)
        return self.collections[name]


@pytest.fixture
def mock_db() -> MockAsyncDatabase:
    return MockAsyncDatabase()


@pytest.fixture
def mongo_repo(mock_db: MockAsyncDatabase) -> MongoRepository:
    return MongoRepository(db=mock_db)


@pytest.mark.asyncio
async def test_ensure_indexes(mongo_repo: MongoRepository):
    """Verify all required collection indexes are created with exact schema names."""
    indexes = await mongo_repo.ensure_indexes()
    
    assert "learner_profiles" in indexes
    assert "idx_learner_profiles_id_unique" in indexes["learner_profiles"]
    assert "idx_learner_profiles_cohort_name" in indexes["learner_profiles"]

    assert "learning_paths" in indexes
    assert "idx_learning_paths_learner_unique" in indexes["learning_paths"]

    assert "modules" in indexes
    assert "idx_modules_slug_unique" in indexes["modules"]
    assert "idx_modules_level_title" in indexes["modules"]

    assert "prediction_checkpoints" in indexes
    assert "idx_checkpoints_module_unique" in indexes["prediction_checkpoints"]

    assert "circuit_models" in indexes
    assert "idx_circuits_owner_updated" in indexes["circuit_models"]

    assert "simulation_runs" in indexes
    assert "idx_runs_learner_created" in indexes["simulation_runs"]

    assert "misconception_signals" in indexes
    assert "idx_signals_run_unique" in indexes["misconception_signals"]

    assert "challenge_attempts" in indexes
    assert "idx_attempts_learner_challenge_num_unique" in indexes["challenge_attempts"]

    assert "progress_records" in indexes
    assert "idx_progress_learner_unique" in indexes["progress_records"]


@pytest.mark.asyncio
async def test_learner_and_instructor_profiles(mongo_repo: MongoRepository):
    """Test CRUD and query filtering for Learner and Instructor profiles."""
    profile = LearnerProfile(
        id="lp_test_aarav",
        displayName="Aarav Test",
        role="BEGINNER_CSE",
        cohortId="cohort_demo_2026",
        priorKnowledge={"python": True, "linearAlgebra": False, "quantumTheory": False, "circuitProgramming": False},
        completedSkillIds=[],
        activeLearningPathId="path_test",
        schemaVersion=1,
    )
    saved = await mongo_repo.create_or_update_learner_profile(profile)
    assert saved.id == "lp_test_aarav"

    retrieved = await mongo_repo.get_learner_profile("lp_test_aarav")
    assert retrieved is not None
    assert retrieved.displayName == "Aarav Test"
    assert retrieved.schemaVersion == 1

    profiles = await mongo_repo.list_learner_profiles(cohort_id="cohort_demo_2026")
    assert len(profiles) == 1
    assert profiles[0].id == "lp_test_aarav"

    instructor = InstructorProfile(
        id="ip_dr_rao",
        displayName="Dr. Rao",
        cohortId="cohort_demo_2026",
    )
    await mongo_repo.create_or_update_instructor_profile(instructor)
    fetched_inst = await mongo_repo.get_instructor_profile("ip_dr_rao")
    assert fetched_inst is not None
    assert fetched_inst.displayName == "Dr. Rao"


@pytest.mark.asyncio
async def test_modules_and_checkpoints(mongo_repo: MongoRepository):
    """Test Module and PredictionCheckpoint collection getters and queries."""
    module = Module(
        id="mod_bell_test",
        slug="bell-state-test",
        title="Bell Test Module",
        skillIds=["skill_bell"],
        level="FOUNDATION",
        estimatedMinutes=15,
        contentBlocks=[],
        schemaVersion=1,
    )
    await mongo_repo.create_or_update_module(module)

    by_slug = await mongo_repo.get_module_by_slug("bell-state-test")
    assert by_slug is not None
    assert by_slug.id == "mod_bell_test"

    cp = PredictionCheckpoint(
        id="pc_bell_test",
        moduleId="mod_bell_test",
        prompt="What outcome do you expect?",
        answerSchema={"type": "SINGLE_CHOICE", "options": ["00", "11"]},
        misconceptionMap={"00": "GATE_ORDER"},
        schemaVersion=1,
    )
    await mongo_repo.create_or_update_prediction_checkpoint(cp)

    by_mod_cp = await mongo_repo.get_prediction_checkpoint_by_module("mod_bell_test")
    assert by_mod_cp is not None
    assert by_mod_cp.id == "pc_bell_test"


@pytest.mark.asyncio
async def test_circuit_model_and_simulation_run(mongo_repo: MongoRepository):
    """Test CircuitModel and SimulationRun persistence."""
    circuit = CircuitModel(
        id="cm_test_001",
        name="Test Circuit",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate="H", targets=[0], column=0),
            Operation(opId="op_2", gate="CNOT", targets=[1], controls=[0], column=1),
        ],
        source="SEED",
        ownerLearnerProfileId="lp_test_aarav",
    )
    await mongo_repo.create_or_update_circuit_model(circuit)

    saved_circuits = await mongo_repo.list_circuit_models_by_owner("lp_test_aarav")
    assert len(saved_circuits) == 1
    assert saved_circuits[0].name == "Test Circuit"

    run = SimulationRun(
        id="sr_test_001",
        learnerProfileId="lp_test_aarav",
        moduleId="mod_bell_test",
        circuitModelId="cm_test_001",
        shots=1024,
        status="SUCCEEDED",
        probabilities={"00": 0.5, "11": 0.5},
        counts={"00": 512, "11": 512},
        schemaVersion=1,
    )
    await mongo_repo.create_simulation_run(run)

    runs = await mongo_repo.list_simulation_runs(learner_profile_id="lp_test_aarav")
    assert len(runs) == 1
    assert runs[0].id == "sr_test_001"
    assert runs[0].status == "SUCCEEDED"


@pytest.mark.asyncio
async def test_atomic_attempt_and_progress_update(mongo_repo: MongoRepository):
    """Test atomic record_attempt_and_update_progress transaction."""
    attempt = ChallengeAttempt(
        id="ca_test_001",
        challengeId="ch_bell_repair",
        learnerProfileId="lp_test_aarav",
        passed=True,
        score=100,
        feedbackCode="CORRECT",
        attemptNumber=1,
        schemaVersion=1,
    )

    updated_attempt, progress = await mongo_repo.record_attempt_and_update_progress(
        attempt=attempt,
        points_earned=100,
        completed_module_id="mod_bell_test",
        updated_skills=[SkillState(skillId="skill_bell", status="MASTERED", score=100)],
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
    )

    assert updated_attempt.id == "ca_test_001"
    assert progress.learnerProfileId == "lp_test_aarav"
    assert progress.totalPoints == 100
    assert "mod_bell_test" in progress.completedModuleIds
    assert len(progress.skillStates) == 1
    assert progress.skillStates[0].status == "MASTERED"
    assert len(progress.misconceptionSummary) == 1
    assert progress.misconceptionSummary[0].code == "SUPERPOSITION_VS_ENTANGLEMENT"


@pytest.mark.asyncio
async def test_instructor_insight(mongo_repo: MongoRepository):
    """Test cohort aggregate InstructorInsight calculation."""
    profile = LearnerProfile(
        id="lp_aarav",
        displayName="Aarav",
        role="BEGINNER_CSE",
        cohortId="cohort_demo_2026",
        priorKnowledge={"python": True, "linearAlgebra": False, "quantumTheory": False, "circuitProgramming": False},
        completedSkillIds=[],
        activeLearningPathId="path_1",
        schemaVersion=1,
    )
    await mongo_repo.create_or_update_learner_profile(profile)

    attempt = ChallengeAttempt(
        id="ca_aarav_01",
        challengeId="ch_bell_repair",
        learnerProfileId="lp_aarav",
        passed=True,
        score=100,
        attemptNumber=1,
        schemaVersion=1,
    )
    await mongo_repo.record_attempt_and_update_progress(
        attempt=attempt,
        points_earned=100,
        completed_module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
    )

    signal = MisconceptionSignal(
        id="ms_aarav_01",
        learnerProfileId="lp_aarav",
        simulationRunId="sr_aarav_01",
        code="SUPERPOSITION_VS_ENTANGLEMENT",
        schemaVersion=1,
    )
    await mongo_repo.create_misconception_signal(signal)

    insight = await mongo_repo.get_instructor_insight("cohort_demo_2026")
    assert insight is not None
    assert insight.cohortId == "cohort_demo_2026"
    assert insight.learnerCount == 1
    assert len(insight.moduleCompletion) == 1
    assert insight.moduleCompletion[0].completed == 1
    assert len(insight.challengePassRate) == 1
    assert insight.challengePassRate[0].passed == 1
    assert len(insight.topMisconceptions) == 1
    assert insight.topMisconceptions[0].code == "SUPERPOSITION_VS_ENTANGLEMENT"
    assert insight.liveDemoLearner is not None
    assert insight.liveDemoLearner.latestAttemptPassed is True


@pytest.mark.asyncio
async def test_reset(mongo_repo: MongoRepository):
    """Test database reset clears all collections."""
    profile = LearnerProfile(
        id="lp_reset_me",
        displayName="Reset Me",
        role="BEGINNER_CSE",
        cohortId="cohort_1",
        priorKnowledge={"python": False, "linearAlgebra": False, "quantumTheory": False, "circuitProgramming": False},
        completedSkillIds=[],
        activeLearningPathId="path_reset",
        schemaVersion=1,
    )
    await mongo_repo.create_or_update_learner_profile(profile)
    assert await mongo_repo.get_learner_profile("lp_reset_me") is not None

    await mongo_repo.reset()
    assert await mongo_repo.get_learner_profile("lp_reset_me") is None
