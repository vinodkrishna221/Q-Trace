"""Unit tests for InMemoryRepository and repository protocols."""

import pytest
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
    PriorKnowledge,
    ProgressRecord,
    SimulationRun,
    SkillState,
)
from app.repositories import InMemoryRepository, get_repository, set_repository
from app.repositories.base import DataRepositoryProtocol


@pytest.fixture
def repo() -> InMemoryRepository:
    """Fixture providing a fresh in-memory repository instance."""
    return InMemoryRepository()


@pytest.mark.asyncio
async def test_protocol_conformance(repo: InMemoryRepository) -> None:
    """Verify that InMemoryRepository satisfies DataRepositoryProtocol."""
    assert isinstance(repo, DataRepositoryProtocol)


@pytest.mark.asyncio
async def test_reset_twice_to_identical_state(repo: InMemoryRepository) -> None:
    """Verify that resetting twice returns the repository to clean, identical state."""
    # First cycle: populate data
    p1 = LearnerProfile(
        id="lp_aarav",
        displayName="Aarav",
        role="BEGINNER_CSE",
        cohortId="cohort_demo_2026",
        priorKnowledge=PriorKnowledge(python=True),
        activeLearningPathId="path_aarav_foundations",
    )
    await repo.create_or_update_learner_profile(p1)
    assert await repo.get_learner_profile("lp_aarav") is not None

    # First reset
    await repo.reset()
    assert await repo.get_learner_profile("lp_aarav") is None
    assert len(await repo.list_learner_profiles()) == 0

    # Second cycle: populate same data
    await repo.create_or_update_learner_profile(p1)
    stored = await repo.get_learner_profile("lp_aarav")
    assert stored is not None
    assert stored.id == "lp_aarav"
    assert stored.displayName == "Aarav"

    # Second reset
    await repo.reset()
    assert await repo.get_learner_profile("lp_aarav") is None
    assert len(await repo.list_learner_profiles()) == 0
    assert len(await repo.list_modules()) == 0
    assert len(await repo.list_simulation_runs()) == 0


@pytest.mark.asyncio
async def test_learner_and_instructor_profiles(repo: InMemoryRepository) -> None:
    """Verify CRUD and listing for learner and instructor profiles."""
    aarav = LearnerProfile(
        id="lp_aarav",
        displayName="Aarav",
        role="BEGINNER_CSE",
        cohortId="cohort_demo_2026",
        priorKnowledge=PriorKnowledge(python=True),
        activeLearningPathId="path_aarav_foundations",
    )
    meera = LearnerProfile(
        id="lp_meera",
        displayName="Meera",
        role="PHYSICS_TO_CODE",
        cohortId="cohort_demo_2026",
        priorKnowledge=PriorKnowledge(python=True, linearAlgebra=True, quantumTheory=True),
        activeLearningPathId="path_meera_code",
    )
    other = LearnerProfile(
        id="lp_other",
        displayName="Other",
        role="BEGINNER_CSE",
        cohortId="cohort_other",
        priorKnowledge=PriorKnowledge(),
        activeLearningPathId="path_other",
    )
    await repo.create_or_update_learner_profile(aarav)
    await repo.create_or_update_learner_profile(meera)
    await repo.create_or_update_learner_profile(other)

    # Retrieval by ID
    res = await repo.get_learner_profile("lp_aarav")
    assert res is not None
    assert res.displayName == "Aarav"

    # Filtered listing by cohort
    cohort_list = await repo.list_learner_profiles(cohort_id="cohort_demo_2026")
    assert len(cohort_list) == 2
    assert [p.id for p in cohort_list] == ["lp_aarav", "lp_meera"]

    # Instructor profile
    instructor = InstructorProfile(
        id="instructor_rao",
        displayName="Dr. Rao",
        cohortId="cohort_demo_2026",
    )
    await repo.create_or_update_instructor_profile(instructor)
    inst_res = await repo.get_instructor_profile("instructor_rao")
    assert inst_res is not None
    assert inst_res.displayName == "Dr. Rao"


@pytest.mark.asyncio
async def test_learning_paths(repo: InMemoryRepository) -> None:
    """Verify Learning Path persistence and retrieval by learner ID."""
    path = LearningPath(
        id="path_aarav_foundations",
        learnerProfileId="lp_aarav",
        entryBand="FOUNDATIONS",
        moduleIds=["mod_superposition", "mod_measurement", "mod_bell"],
        currentModuleId="mod_bell",
        recommendationReason="Complete the Bell-state lab after the superposition checkpoint.",
    )
    await repo.create_or_update_learning_path(path)

    by_id = await repo.get_learning_path("path_aarav_foundations")
    assert by_id is not None
    assert by_id.currentModuleId == "mod_bell"

    by_learner = await repo.get_learning_path_by_learner("lp_aarav")
    assert by_learner is not None
    assert by_learner.id == "path_aarav_foundations"


@pytest.mark.asyncio
async def test_modules_and_checkpoints(repo: InMemoryRepository) -> None:
    """Verify Module and Prediction Checkpoint storage and lookups."""
    mod = Module(
        id="mod_bell",
        slug="bell-state",
        title="From Superposition to Bell Correlation",
        skillIds=["skill_create_bell", "skill_explain_correlation"],
        level="FOUNDATION",
        estimatedMinutes=18,
        contentBlocks=[
            {"type": "TEXT", "body": "Apply H to create superposition, then CNOT to correlate the qubits."}
        ],
        predictionCheckpointId="pc_bell_outcomes",
        starterCircuitModelId="cm_bell_seed",
        challengeIds=["ch_bell_repair"],
    )
    await repo.create_or_update_module(mod)

    by_id = await repo.get_module("mod_bell")
    assert by_id is not None
    assert by_id.slug == "bell-state"

    by_slug = await repo.get_module_by_slug("bell-state")
    assert by_slug is not None
    assert by_slug.id == "mod_bell"

    listed = await repo.list_modules(level="FOUNDATION")
    assert len(listed) == 1
    assert listed[0].id == "mod_bell"

    # Prediction Checkpoint
    checkpoint = PredictionCheckpoint(
        id="pc_bell_outcomes",
        moduleId="mod_bell",
        prompt="After H and CNOT, which measurement pattern should dominate?",
        answerSchema={
            "type": "SINGLE_CHOICE",
            "options": ["INDEPENDENT_RANDOM", "CORRELATED_00_11", "ALWAYS_00", "ALWAYS_11"],
        },
        misconceptionMap={"INDEPENDENT_RANDOM": "SUPERPOSITION_VS_ENTANGLEMENT"},
    )
    await repo.create_or_update_prediction_checkpoint(checkpoint)

    cp_by_id = await repo.get_prediction_checkpoint("pc_bell_outcomes")
    assert cp_by_id is not None
    assert cp_by_id.moduleId == "mod_bell"

    cp_by_mod = await repo.get_prediction_checkpoint_by_module("mod_bell")
    assert cp_by_mod is not None
    assert cp_by_mod.id == "pc_bell_outcomes"


@pytest.mark.asyncio
async def test_circuits_and_simulation_runs(repo: InMemoryRepository) -> None:
    """Verify Circuit Model and Simulation Run persistence."""
    circuit = CircuitModel(
        id="cm_bell_seed",
        name="Bell State Seed",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate="H", targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate="CNOT", targets=[1], controls=[0], classicalTargets=[], column=1),
        ],
        source="SEED",
    )
    await repo.create_or_update_circuit_model(circuit)

    cm = await repo.get_circuit_model("cm_bell_seed")
    assert cm is not None
    assert len(cm.operations) == 2

    # Simulation Run
    run = SimulationRun(
        id="sr_demo_001",
        learnerProfileId="lp_aarav",
        moduleId="mod_bell",
        circuitModelId="cm_bell_seed",
        probabilities={"00": 0.5, "11": 0.5},
        counts={"00": 512, "11": 512},
        status="SUCCEEDED",
        durationMs=84,
    )
    await repo.create_simulation_run(run)

    sr = await repo.get_simulation_run("sr_demo_001")
    assert sr is not None
    assert sr.probabilities["00"] == 0.5

    runs = await repo.list_simulation_runs(learner_profile_id="lp_aarav")
    assert len(runs) == 1
    assert runs[0].id == "sr_demo_001"


@pytest.mark.asyncio
async def test_misconception_signals(repo: InMemoryRepository) -> None:
    """Verify Misconception Signal creation and queries."""
    signal = MisconceptionSignal(
        id="ms_demo_001",
        learnerProfileId="lp_aarav",
        simulationRunId="sr_demo_001",
        code="SUPERPOSITION_VS_ENTANGLEMENT",
        firstDivergenceStep=1,
        evidence={"prediction": "INDEPENDENT_RANDOM", "verifiedBehavior": "CORRELATED_00_11"},
        confidence=1.0,
        repairChallengeId="ch_bell_repair",
    )
    await repo.create_misconception_signal(signal)

    by_id = await repo.get_misconception_signal("ms_demo_001")
    assert by_id is not None
    assert by_id.code == "SUPERPOSITION_VS_ENTANGLEMENT"

    by_run = await repo.get_misconception_signal_by_run("sr_demo_001")
    assert by_run is not None
    assert by_run.id == "ms_demo_001"


@pytest.mark.asyncio
async def test_atomic_attempt_and_progress_update(repo: InMemoryRepository) -> None:
    """Prove atomic attempt recording and progress record updates."""
    # Seed challenge
    challenge = Challenge(
        id="ch_bell_repair",
        moduleId="mod_bell",
        type="CIRCUIT_REPAIR",
        title="Restore Bell Correlation",
        prompt="Repair the circuit so only 00 and 11 have non-zero ideal probability.",
        starterCircuitModelId="cm_bell_broken",
        points=100,
    )
    await repo.create_or_update_challenge(challenge)

    # Initial progress record for Aarav
    initial_progress = ProgressRecord(
        id="progress_lp_aarav",
        learnerProfileId="lp_aarav",
        completedModuleIds=[],
        skillStates=[
            SkillState(skillId="skill_create_bell", status="PRACTICING", score=0),
            SkillState(skillId="skill_explain_correlation", status="NOT_STARTED", score=0),
        ],
        totalPoints=0,
    )
    await repo.create_or_update_progress_record(initial_progress)

    # Execute atomic attempt
    attempt = ChallengeAttempt(
        id="ca_demo_001",
        challengeId="ch_bell_repair",
        learnerProfileId="lp_aarav",
        simulationRunId="sr_demo_002",
        submittedAnswer={"circuitModelId": "cm_aarav_repaired"},
        passed=True,
        score=100,
        feedbackCode="BELL_SUPPORT_CORRECT",
        attemptNumber=1,
    )

    saved_attempt, updated_progress = await repo.record_attempt_and_update_progress(
        attempt=attempt,
        points_earned=100,
        completed_module_id="mod_bell",
        updated_skills=[
            SkillState(skillId="skill_create_bell", status="MASTERED", score=100),
            SkillState(skillId="skill_explain_correlation", status="PRACTICING", score=70),
        ],
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
    )

    # Verify attempt
    assert saved_attempt.id == "ca_demo_001"
    assert saved_attempt.passed is True

    # Verify progress record updated atomically
    assert updated_progress.totalPoints == 100
    assert updated_progress.latestChallengeAttemptId == "ca_demo_001"
    assert "mod_bell" in updated_progress.completedModuleIds
    assert len(updated_progress.skillStates) == 2
    skill_map = {s.skillId: s for s in updated_progress.skillStates}
    assert skill_map["skill_create_bell"].status == "MASTERED"
    assert skill_map["skill_create_bell"].score == 100
    assert skill_map["skill_explain_correlation"].status == "PRACTICING"

    # Verify misconception summary
    assert len(updated_progress.misconceptionSummary) == 1
    assert updated_progress.misconceptionSummary[0].code == "SUPERPOSITION_VS_ENTANGLEMENT"
    assert updated_progress.misconceptionSummary[0].count == 1

    # Verify subsequent lookup returns the same updated state
    fetched = await repo.get_progress_record_by_learner("lp_aarav")
    assert fetched is not None
    assert fetched.totalPoints == 100
    assert fetched.latestChallengeAttemptId == "ca_demo_001"


@pytest.mark.asyncio
async def test_attempt_number_auto_increment(repo: InMemoryRepository) -> None:
    """Verify attemptNumber sequencing."""
    att1 = ChallengeAttempt(
        id="ca_001",
        challengeId="ch_bell_repair",
        learnerProfileId="lp_aarav",
        passed=False,
        attemptNumber=await repo.get_next_attempt_number("lp_aarav", "ch_bell_repair"),
    )
    await repo.create_challenge_attempt(att1)
    assert att1.attemptNumber == 1

    next_num = await repo.get_next_attempt_number("lp_aarav", "ch_bell_repair")
    assert next_num == 2


@pytest.mark.asyncio
async def test_instructor_insight_aggregation(repo: InMemoryRepository) -> None:
    """Verify aggregated InstructorInsight computation over cohort data."""
    # Cohort learners
    p1 = LearnerProfile(
        id="lp_aarav",
        displayName="Aarav",
        role="BEGINNER_CSE",
        cohortId="cohort_demo_2026",
        priorKnowledge=PriorKnowledge(),
        activeLearningPathId="path_1",
    )
    p2 = LearnerProfile(
        id="lp_meera",
        displayName="Meera",
        role="PHYSICS_TO_CODE",
        cohortId="cohort_demo_2026",
        priorKnowledge=PriorKnowledge(),
        activeLearningPathId="path_2",
    )
    await repo.create_or_update_learner_profile(p1)
    await repo.create_or_update_learner_profile(p2)

    # Progress with module completion
    prog1 = ProgressRecord(
        id="progress_lp_aarav",
        learnerProfileId="lp_aarav",
        completedModuleIds=["mod_bell"],
    )
    await repo.create_or_update_progress_record(prog1)

    # Challenge attempts
    att1 = ChallengeAttempt(
        id="ca_001",
        challengeId="ch_bell_repair",
        learnerProfileId="lp_aarav",
        passed=True,
    )
    att2 = ChallengeAttempt(
        id="ca_002",
        challengeId="ch_bell_repair",
        learnerProfileId="lp_meera",
        passed=False,
    )
    await repo.create_challenge_attempt(att1)
    await repo.create_challenge_attempt(att2)

    # Misconceptions
    sig = MisconceptionSignal(
        id="ms_001",
        learnerProfileId="lp_aarav",
        simulationRunId="sr_001",
        code="SUPERPOSITION_VS_ENTANGLEMENT",
    )
    await repo.create_misconception_signal(sig)

    # Generate insights
    insight = await repo.get_instructor_insight("cohort_demo_2026")
    assert insight is not None
    assert insight.cohortId == "cohort_demo_2026"
    assert insight.learnerCount == 2
    assert len(insight.moduleCompletion) == 1
    assert insight.moduleCompletion[0].moduleId == "mod_bell"
    assert insight.moduleCompletion[0].completed == 1

    # Challenge pass rate: 1/2 = 0.5
    assert len(insight.challengePassRate) == 1
    assert insight.challengePassRate[0].challengeId == "ch_bell_repair"
    assert insight.challengePassRate[0].passed == 1
    assert insight.challengePassRate[0].attempted == 2
    assert insight.challengePassRate[0].rate == 0.5

    # Top misconceptions
    assert len(insight.topMisconceptions) == 1
    assert insight.topMisconceptions[0].code == "SUPERPOSITION_VS_ENTANGLEMENT"
    assert insight.topMisconceptions[0].learnerCount == 1

    # Live demo learner
    assert insight.liveDemoLearner is not None
    assert insight.liveDemoLearner.learnerProfileId == "lp_aarav"
    assert insight.liveDemoLearner.latestAttemptPassed is True


def test_repository_dependency_selector() -> None:
    """Verify get_repository and set_repository behavior."""
    set_repository(None)
    repo1 = get_repository()
    assert isinstance(repo1, InMemoryRepository)
    repo2 = get_repository()
    assert repo1 is repo2

    # Override
    custom_repo = InMemoryRepository()
    set_repository(custom_repo)
    assert get_repository() is custom_repo
    set_repository(None)
