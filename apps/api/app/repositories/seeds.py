"""Core truth seed definitions and loader for Q-Trace data analytics."""

from typing import Any
from app.models.entities import (
    Challenge,
    ChallengeAttempt,
    CircuitModel,
    InstructorProfile,
    LearnerProfile,
    LearningPath,
    MisconceptionSignal,
    MisconceptionSummaryItem,
    Module,
    Operation,
    PredictionCheckpoint,
    PriorKnowledge,
    ProgressRecord,
    SimulationRun,
    SkillState,
)
from app.repositories.base import DataRepositoryProtocol


# ==============================================================================
# Hero Learner & Instructor Profiles
# ==============================================================================

CORE_LEARNER_PROFILES: list[LearnerProfile] = [
    LearnerProfile(
        id="lp_aarav",
        displayName="Aarav",
        role="BEGINNER_CSE",
        cohortId="cohort_demo_2026",
        priorKnowledge=PriorKnowledge(
            python=True,
            linearAlgebra=False,
            quantumTheory=False,
            circuitProgramming=False,
        ),
        completedSkillIds=[],
        activeLearningPathId="path_aarav_foundations",
        schemaVersion=1,
    ),
    LearnerProfile(
        id="lp_meera",
        displayName="Meera",
        role="PHYSICS_TO_CODE",
        cohortId="cohort_demo_2026",
        priorKnowledge=PriorKnowledge(
            python=True,
            linearAlgebra=True,
            quantumTheory=True,
            circuitProgramming=False,
        ),
        completedSkillIds=[],
        activeLearningPathId="path_meera_code",
        schemaVersion=1,
    ),
]

CORE_INSTRUCTOR_PROFILE: InstructorProfile = InstructorProfile(
    id="instructor_rao",
    displayName="Dr. Rao",
    cohortId="cohort_demo_2026",
)


# ==============================================================================
# Learning Paths
# ==============================================================================

CORE_LEARNING_PATHS: list[LearningPath] = [
    LearningPath(
        id="path_aarav_foundations",
        learnerProfileId="lp_aarav",
        entryBand="FOUNDATIONS",
        moduleIds=["mod_superposition", "mod_measurement", "mod_bell"],
        currentModuleId="mod_bell",
        recommendationReason="Complete the Bell-state lab after the superposition checkpoint.",
        schemaVersion=1,
    ),
    LearningPath(
        id="path_meera_code",
        learnerProfileId="lp_meera",
        entryBand="THEORY_TO_CODE",
        moduleIds=["mod_superposition", "mod_measurement", "mod_bell"],
        currentModuleId="mod_bell",
        recommendationReason="Translate mathematical bra-ket state formulations into gate sequence operations.",
        schemaVersion=1,
    ),
]


# ==============================================================================
# Prediction Checkpoints
# ==============================================================================

CORE_PREDICTION_CHECKPOINTS: list[PredictionCheckpoint] = [
    PredictionCheckpoint(
        id="pc_bell_outcomes",
        moduleId="mod_bell",
        prompt="After H and CNOT, which measurement pattern should dominate?",
        answerSchema={
            "type": "SINGLE_CHOICE",
            "options": [
                "INDEPENDENT_RANDOM",
                "CORRELATED_00_11",
                "ALWAYS_00",
                "ALWAYS_11",
            ],
        },
        misconceptionMap={
            "INDEPENDENT_RANDOM": "SUPERPOSITION_VS_ENTANGLEMENT",
            "ALWAYS_00": "MEASUREMENT_DETERMINISM",
            "ALWAYS_11": "MEASUREMENT_DETERMINISM",
        },
        schemaVersion=1,
    ),
]


# ==============================================================================
# Circuit Models (Starter & Broken Seeds)
# ==============================================================================

CORE_CIRCUIT_MODELS: list[CircuitModel] = [
    CircuitModel(
        id="cm_bell_seed",
        name="Bell State Seed",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_1", gate="H", targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_2", gate="CNOT", targets=[1], controls=[0], classicalTargets=[], column=1),
            Operation(opId="op_3", gate="MEASURE", targets=[0], controls=[], classicalTargets=[0], column=2),
            Operation(opId="op_4", gate="MEASURE", targets=[1], controls=[], classicalTargets=[1], column=2),
        ],
        source="SEED",
        ownerLearnerProfileId=None,
        openQasm3=None,
        modelVersion=1,
    ),
    CircuitModel(
        id="cm_bell_broken",
        name="Broken Bell State (Misordered Gates)",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_b1", gate="CNOT", targets=[1], controls=[0], classicalTargets=[], column=0),
            Operation(opId="op_b2", gate="H", targets=[0], controls=[], classicalTargets=[], column=1),
            Operation(opId="op_b3", gate="MEASURE", targets=[0], controls=[], classicalTargets=[0], column=2),
            Operation(opId="op_b4", gate="MEASURE", targets=[1], controls=[], classicalTargets=[1], column=2),
        ],
        source="SEED",
        ownerLearnerProfileId=None,
        openQasm3=None,
        modelVersion=1,
    ),
]


# ==============================================================================
# Challenges (Quizzes & Circuit Repairs)
# ==============================================================================

CORE_CHALLENGES: list[Challenge] = [
    Challenge(
        id="ch_superposition_quiz",
        moduleId="mod_superposition",
        type="QUIZ",
        title="Superposition Principles",
        prompt="What is the amplitude distribution of |+> = (|0> + |1>)/sqrt(2)?",
        starterCircuitModelId=None,
        acceptanceRule={
            "version": 1,
            "kind": "MULTIPLE_CHOICE",
            "correctOption": "EQUAL_AMPLITUDES_1_OVER_SQRT_2",
        },
        targetsMisconceptionCodes=["MEASUREMENT_DETERMINISM"],
        points=50,
        schemaVersion=1,
    ),
    Challenge(
        id="ch_measurement_quiz",
        moduleId="mod_measurement",
        type="QUIZ",
        title="Measurement and Collapse",
        prompt="When a qubit in superposition (|0> + |1>)/sqrt(2) is measured in the computational basis, what happens to its state?",
        starterCircuitModelId=None,
        acceptanceRule={
            "version": 1,
            "kind": "MULTIPLE_CHOICE",
            "correctOption": "COLLAPSES_TO_MEASURED_EIGENSTATE",
        },
        targetsMisconceptionCodes=["MEASUREMENT_DETERMINISM"],
        points=50,
        schemaVersion=1,
    ),
    Challenge(
        id="ch_bell_quiz",
        moduleId="mod_bell",
        type="QUIZ",
        title="Bell State Entanglement Concept Check",
        prompt="Why does measuring qubit 0 in a Bell state instantaneously determine the outcome of qubit 1?",
        starterCircuitModelId=None,
        acceptanceRule={
            "version": 1,
            "kind": "MULTIPLE_CHOICE",
            "correctOption": "ENTANGLED_STATE_NON_FACTORABLE",
        },
        targetsMisconceptionCodes=["SUPERPOSITION_VS_ENTANGLEMENT"],
        points=50,
        schemaVersion=1,
    ),
    Challenge(
        id="ch_bell_repair",
        moduleId="mod_bell",
        type="CIRCUIT_REPAIR",
        title="Restore Bell Correlation",
        prompt="Repair the circuit so only 00 and 11 have non-zero ideal probability.",
        starterCircuitModelId="cm_bell_broken",
        acceptanceRule={
            "version": 1,
            "kind": "PROBABILITY_SUPPORT_EQUALS",
            "states": ["00", "11"],
            "epsilon": 0.000001,
        },
        targetsMisconceptionCodes=["SUPERPOSITION_VS_ENTANGLEMENT", "GATE_ORDER"],
        points=100,
        schemaVersion=1,
    ),
]


# ==============================================================================
# Modules (Three Modules)
# ==============================================================================

CORE_MODULES: list[Module] = [
    Module(
        id="mod_superposition",
        slug="superposition",
        title="Qubits and Superposition",
        skillIds=["skill_create_superposition"],
        level="FOUNDATION",
        estimatedMinutes=14,
        contentBlocks=[
            {
                "type": "TEXT",
                "body": "Explore single-qubit states and how the Hadamard gate maps computational basis states into equal superpositions.",
            }
        ],
        predictionCheckpointId=None,
        starterCircuitModelId=None,
        challengeIds=["ch_superposition_quiz"],
        schemaVersion=1,
    ),
    Module(
        id="mod_measurement",
        slug="measurement",
        title="Measurement and Probability",
        skillIds=["skill_predict_measurement"],
        level="FOUNDATION",
        estimatedMinutes=12,
        contentBlocks=[
            {
                "type": "TEXT",
                "body": "Understand Born's rule, projection postulate, and how quantum states collapse upon computational basis measurement.",
            }
        ],
        predictionCheckpointId=None,
        starterCircuitModelId=None,
        challengeIds=["ch_measurement_quiz"],
        schemaVersion=1,
    ),
    Module(
        id="mod_bell",
        slug="bell-state",
        title="From Superposition to Bell Correlation",
        skillIds=["skill_create_bell", "skill_explain_correlation"],
        level="FOUNDATION",
        estimatedMinutes=18,
        contentBlocks=[
            {
                "type": "TEXT",
                "body": "Apply H to create superposition, then CNOT to correlate the qubits.",
            },
            {
                "type": "CALLOUT",
                "tone": "CAUTION",
                "body": "Random outcomes can still be perfectly correlated.",
            },
        ],
        predictionCheckpointId="pc_bell_outcomes",
        starterCircuitModelId="cm_bell_seed",
        challengeIds=["ch_bell_quiz", "ch_bell_repair"],
        schemaVersion=1,
    ),
]


# ==============================================================================
# Initial Progress Records
# ==============================================================================

CORE_PROGRESS_RECORDS: list[ProgressRecord] = [
    ProgressRecord(
        id="progress_lp_aarav",
        learnerProfileId="lp_aarav",
        completedModuleIds=[],
        skillStates=[
            SkillState(skillId="skill_create_superposition", status="MASTERED", score=100),
            SkillState(skillId="skill_predict_measurement", status="MASTERED", score=100),
            SkillState(skillId="skill_create_bell", status="PRACTICING", score=0),
            SkillState(skillId="skill_explain_correlation", status="NOT_STARTED", score=0),
        ],
        latestChallengeAttemptId=None,
        misconceptionSummary=[],
        totalPoints=200,
        schemaVersion=1,
    ),
    ProgressRecord(
        id="progress_lp_meera",
        learnerProfileId="lp_meera",
        completedModuleIds=[],
        skillStates=[
            SkillState(skillId="skill_create_superposition", status="MASTERED", score=100),
            SkillState(skillId="skill_predict_measurement", status="MASTERED", score=100),
            SkillState(skillId="skill_create_bell", status="PRACTICING", score=0),
            SkillState(skillId="skill_explain_correlation", status="NOT_STARTED", score=0),
        ],
        latestChallengeAttemptId=None,
        misconceptionSummary=[],
        totalPoints=200,
        schemaVersion=1,
    ),
]



# ==============================================================================
# Synthetic Cohort Definitions (30 profiles, 40 signals, 75 attempts)
# ==============================================================================

SYNTHETIC_LEARNER_PROFILES: list[LearnerProfile] = [
    LearnerProfile(
        id=f"lp_synth_{i:03d}",
        displayName=f"Learner {i:02d}",
        role="BEGINNER_CSE" if i % 2 == 1 else "PHYSICS_TO_CODE",
        cohortId="cohort_demo_2026",
        priorKnowledge=PriorKnowledge(
            python=True,
            linearAlgebra=(i % 3 == 0),
            quantumTheory=(i % 4 == 0),
            circuitProgramming=False,
        ),
        completedSkillIds=[],
        activeLearningPathId=f"path_synth_{i:03d}",
        schemaVersion=1,
    )
    for i in range(1, 29)
]

SYNTHETIC_LEARNING_PATHS: list[LearningPath] = [
    LearningPath(
        id=f"path_synth_{i:03d}",
        learnerProfileId=f"lp_synth_{i:03d}",
        entryBand="FOUNDATIONS" if i % 2 == 1 else "THEORY_TO_CODE",
        moduleIds=["mod_superposition", "mod_measurement", "mod_bell"],
        currentModuleId="mod_bell" if i > 10 else ("mod_measurement" if i > 5 else "mod_superposition"),
        recommendationReason="Progressing through foundation modules.",
        schemaVersion=1,
    )
    for i in range(1, 29)
]

SYNTHETIC_PROGRESS_RECORDS: list[ProgressRecord] = [
    ProgressRecord(
        id=f"progress_lp_synth_{i:03d}",
        learnerProfileId=f"lp_synth_{i:03d}",
        completedModuleIds=(
            ["mod_superposition", "mod_measurement"] if i > 15
            else (["mod_superposition"] if i > 5 else [])
        ),
        skillStates=[
            SkillState(skillId="skill_create_superposition", status="MASTERED" if i > 5 else "NOT_STARTED", score=100 if i > 5 else 0),
            SkillState(skillId="skill_predict_measurement", status="MASTERED" if i > 15 else "PRACTICING", score=100 if i > 15 else 50),
        ],
        latestChallengeAttemptId=f"att_synth_{((i - 1) * 2) + 1:03d}" if i <= 35 else None,
        misconceptionSummary=(
            [MisconceptionSummaryItem(code="SUPERPOSITION_VS_ENTANGLEMENT" if i % 2 == 0 else "MEASUREMENT_DETERMINISM", count=1, latestAt="2026-08-20T10:00:00Z")]
            if i % 3 == 0 else []
        ),
        totalPoints=50 * (i % 5),
        schemaVersion=1,
    )
    for i in range(1, 29)
]

SYNTHETIC_SIMULATION_RUNS: list[SimulationRun] = [
    SimulationRun(
        id=f"sim_synth_{i:03d}",
        learnerProfileId=f"lp_synth_{((i - 1) % 28) + 1:03d}",
        moduleId="mod_bell" if i % 2 == 1 else "mod_measurement",
        circuitModelId="cm_bell_broken" if i % 2 == 1 else "cm_bell_seed",
        shots=1024,
        status="SUCCEEDED",
        probabilities={"00": 0.5, "11": 0.5} if i % 2 == 0 else {"00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25},
        durationMs=12,
        schemaVersion=1,
    )
    for i in range(1, 41)
]

SYNTHETIC_MISCONCEPTION_SIGNALS: list[MisconceptionSignal] = [
    MisconceptionSignal(
        id=f"sig_synth_{i:03d}",
        learnerProfileId=f"lp_synth_{((i - 1) % 28) + 1:03d}",
        simulationRunId=f"sim_synth_{i:03d}",
        code=["SUPERPOSITION_VS_ENTANGLEMENT", "MEASUREMENT_DETERMINISM", "GATE_ORDER"][i % 3],
        firstDivergenceStep=i % 2,
        evidence={"expected": "H gate at col 0", "observed": "CNOT at col 0"},
        confidence=0.95,
        repairChallengeId="ch_bell_repair",
        schemaVersion=1,
    )
    for i in range(1, 41)
]

SYNTHETIC_CHALLENGE_ATTEMPTS: list[ChallengeAttempt] = [
    ChallengeAttempt(
        id=f"att_synth_{i:03d}",
        challengeId=["ch_superposition_quiz", "ch_measurement_quiz", "ch_bell_quiz", "ch_bell_repair"][i % 4],
        learnerProfileId=f"lp_synth_{((i - 1) % 28) + 1:03d}",
        simulationRunId=f"sim_synth_{((i - 1) % 40) + 1:03d}",
        submittedAnswer={"choice": "CORRELATED_00_11"} if (i % 4) != 3 else {"operations": []},
        passed=(i % 3 != 0),
        score=50 if (i % 3 != 0) else 0,
        feedbackCode="CORRECT" if (i % 3 != 0) else "MISCONCEPTION_DETECTED",
        attemptNumber=1,
        schemaVersion=1,
    )
    for i in range(1, 76)
]


# ==============================================================================
# Dataset Access & Idempotent Seeding Logic
# ==============================================================================

def get_core_seed_dataset() -> dict[str, Any]:
    """Return dictionary of all core seed collections."""
    return {
        "learner_profiles": CORE_LEARNER_PROFILES,
        "instructor_profiles": [CORE_INSTRUCTOR_PROFILE],
        "learning_paths": CORE_LEARNING_PATHS,
        "prediction_checkpoints": CORE_PREDICTION_CHECKPOINTS,
        "circuit_models": CORE_CIRCUIT_MODELS,
        "challenges": CORE_CHALLENGES,
        "modules": CORE_MODULES,
        "progress_records": CORE_PROGRESS_RECORDS,
    }


def get_demo_cohort_dataset() -> dict[str, Any]:
    """Return dictionary of all core and synthetic cohort seed collections."""
    core = get_core_seed_dataset()
    return {
        **core,
        "learner_profiles": CORE_LEARNER_PROFILES + SYNTHETIC_LEARNER_PROFILES,
        "learning_paths": CORE_LEARNING_PATHS + SYNTHETIC_LEARNING_PATHS,
        "progress_records": CORE_PROGRESS_RECORDS + SYNTHETIC_PROGRESS_RECORDS,
        "simulation_runs": SYNTHETIC_SIMULATION_RUNS,
        "misconception_signals": SYNTHETIC_MISCONCEPTION_SIGNALS,
        "challenge_attempts": SYNTHETIC_CHALLENGE_ATTEMPTS,
    }


async def seed_core_truth(repo: DataRepositoryProtocol) -> dict[str, int]:
    """Idempotently seed the core ground-truth dataset into any DataRepositoryProtocol.
    
    Returns a summary dictionary of record counts seeded per entity type.
    """
    counts = {
        "learner_profiles": 0,
        "instructor_profiles": 0,
        "learning_paths": 0,
        "prediction_checkpoints": 0,
        "circuit_models": 0,
        "challenges": 0,
        "modules": 0,
        "progress_records": 0,
    }

    # 1. Learner profiles
    for profile in CORE_LEARNER_PROFILES:
        await repo.create_or_update_learner_profile(profile.model_copy(deep=True))
        counts["learner_profiles"] += 1

    # 2. Instructor profile
    await repo.create_or_update_instructor_profile(CORE_INSTRUCTOR_PROFILE.model_copy(deep=True))
    counts["instructor_profiles"] += 1

    # 3. Learning paths
    for path in CORE_LEARNING_PATHS:
        await repo.create_or_update_learning_path(path.model_copy(deep=True))
        counts["learning_paths"] += 1

    # 4. Prediction checkpoints
    for cp in CORE_PREDICTION_CHECKPOINTS:
        await repo.create_or_update_prediction_checkpoint(cp.model_copy(deep=True))
        counts["prediction_checkpoints"] += 1

    # 5. Circuit models
    for circuit in CORE_CIRCUIT_MODELS:
        await repo.create_or_update_circuit_model(circuit.model_copy(deep=True))
        counts["circuit_models"] += 1

    # 6. Challenges
    for ch in CORE_CHALLENGES:
        await repo.create_or_update_challenge(ch.model_copy(deep=True))
        counts["challenges"] += 1

    # 7. Modules
    for module in CORE_MODULES:
        await repo.create_or_update_module(module.model_copy(deep=True))
        counts["modules"] += 1

    # 8. Progress records
    for progress in CORE_PROGRESS_RECORDS:
        await repo.create_or_update_progress_record(progress.model_copy(deep=True))
        counts["progress_records"] += 1

    return counts


async def seed_synthetic_cohort(repo: DataRepositoryProtocol) -> dict[str, int]:
    """Idempotently seed the synthetic cohort dataset into any DataRepositoryProtocol."""
    counts = {
        "synthetic_learner_profiles": 0,
        "synthetic_learning_paths": 0,
        "synthetic_progress_records": 0,
        "synthetic_simulation_runs": 0,
        "synthetic_misconception_signals": 0,
        "synthetic_challenge_attempts": 0,
    }

    for p in SYNTHETIC_LEARNER_PROFILES:
        await repo.create_or_update_learner_profile(p.model_copy(deep=True))
        counts["synthetic_learner_profiles"] += 1

    for lp in SYNTHETIC_LEARNING_PATHS:
        await repo.create_or_update_learning_path(lp.model_copy(deep=True))
        counts["synthetic_learning_paths"] += 1

    for pr in SYNTHETIC_PROGRESS_RECORDS:
        await repo.create_or_update_progress_record(pr.model_copy(deep=True))
        counts["synthetic_progress_records"] += 1

    for sr in SYNTHETIC_SIMULATION_RUNS:
        await repo.create_simulation_run(sr.model_copy(deep=True))
        counts["synthetic_simulation_runs"] += 1

    for ms in SYNTHETIC_MISCONCEPTION_SIGNALS:
        await repo.create_misconception_signal(ms.model_copy(deep=True))
        counts["synthetic_misconception_signals"] += 1

    for ca in SYNTHETIC_CHALLENGE_ATTEMPTS:
        await repo.create_challenge_attempt(ca.model_copy(deep=True))
        counts["synthetic_challenge_attempts"] += 1

    return counts


async def seed_demo_cohort(repo: DataRepositoryProtocol) -> dict[str, int]:
    """Seed both core truth and synthetic cohort datasets into the repository."""
    core = await seed_core_truth(repo)
    synth = await seed_synthetic_cohort(repo)
    merged = {**core, **synth}
    return merged


