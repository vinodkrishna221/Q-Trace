"""Schema freeze snapshot for Q-Trace data-analytics track (DATA-8).

This module is the authoritative, locked record of:
  - SCHEMA_VERSION   — the single version number shared by all entity models.
  - COLLECTION_NAMES — every MongoDB collection name in insertion order.
  - INDEX_NAMES      — every required index name per collection.
  - ENTITY_FIELDS    — required top-level field names per entity type.

Rules (enforced by test_schema_freeze.py):
  - No new collection or field may be added without bumping SCHEMA_VERSION
    AND updating this file AND filing a DECISIONS entry.
  - Removing or renaming any entry here is equally a contract bump.
  - This file is owned by data-analytics; treat it as append-only during
    the current schema version.
"""

# ---------------------------------------------------------------------------
# Schema version — bump whenever any collection, field, or index changes.
# ---------------------------------------------------------------------------
SCHEMA_VERSION: int = 1

# ---------------------------------------------------------------------------
# Collection names (exact MongoDB collection strings used in MongoRepository)
# ---------------------------------------------------------------------------
COLLECTION_NAMES: tuple[str, ...] = (
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

# ---------------------------------------------------------------------------
# Required index names per collection (must match MongoRepository.ensure_indexes)
# ---------------------------------------------------------------------------
REQUIRED_INDEX_NAMES: dict[str, tuple[str, ...]] = {
    "learner_profiles": (
        "idx_learner_profiles_id_unique",
        "idx_learner_profiles_cohort_name",
    ),
    "instructor_profiles": (
        "idx_instructor_profiles_id_unique",
    ),
    "learning_paths": (
        "idx_learning_paths_id_unique",
        "idx_learning_paths_learner_unique",
    ),
    "modules": (
        "idx_modules_id_unique",
        "idx_modules_slug_unique",
        "idx_modules_level_title",
    ),
    "prediction_checkpoints": (
        "idx_checkpoints_id_unique",
        "idx_checkpoints_module_unique",
    ),
    "circuit_models": (
        "idx_circuits_id_unique",
        "idx_circuits_owner_updated",
    ),
    "simulation_runs": (
        "idx_runs_id_unique",
        "idx_runs_learner_created",
        "idx_runs_module_created",
    ),
    "misconception_signals": (
        "idx_signals_id_unique",
        "idx_signals_run_unique",
        "idx_signals_learner_code_created",
    ),
    "challenges": (
        "idx_challenges_id_unique",
        "idx_challenges_module_type",
    ),
    "challenge_attempts": (
        "idx_attempts_id_unique",
        "idx_attempts_learner_created",
        "idx_attempts_challenge_passed",
        "idx_attempts_learner_challenge_num_unique",
    ),
    "progress_records": (
        "idx_progress_id_unique",
        "idx_progress_learner_unique",
    ),
}

# ---------------------------------------------------------------------------
# Required top-level fields per entity (subset that is contract-visible).
# Source: board/contracts/learning-content.md and progress-analytics.md v1.
# ---------------------------------------------------------------------------
ENTITY_REQUIRED_FIELDS: dict[str, tuple[str, ...]] = {
    "LearnerProfile": (
        "id", "displayName", "role", "cohortId",
        "priorKnowledge", "activeLearningPathId", "schemaVersion",
    ),
    "InstructorProfile": (
        "id", "displayName", "cohortId",
    ),
    "LearningPath": (
        "id", "learnerProfileId", "entryBand", "moduleIds",
        "currentModuleId", "recommendationReason", "schemaVersion", "updatedAt",
    ),
    "Module": (
        "id", "slug", "title", "skillIds", "level",
        "estimatedMinutes", "schemaVersion",
    ),
    "PredictionCheckpoint": (
        "id", "moduleId", "prompt", "answerSchema", "schemaVersion",
    ),
    "CircuitModel": (
        "id", "name", "qubitCount", "classicalBitCount", "operations",
        "source", "modelVersion",
    ),
    "SimulationRun": (
        "id", "learnerProfileId", "moduleId", "circuitModelId",
        "status", "probabilities", "schemaVersion", "createdAt",
    ),
    "MisconceptionSignal": (
        "id", "learnerProfileId", "simulationRunId", "code",
        "schemaVersion", "createdAt",
    ),
    "Challenge": (
        "id", "moduleId", "type", "title", "prompt",
        "acceptanceRule", "points", "schemaVersion",
    ),
    "ChallengeAttempt": (
        "id", "challengeId", "learnerProfileId", "passed",
        "score", "feedbackCode", "attemptNumber", "schemaVersion", "createdAt",
    ),
    "ProgressRecord": (
        "id", "learnerProfileId", "completedModuleIds", "skillStates",
        "misconceptionSummary", "totalPoints", "schemaVersion", "updatedAt",
    ),
    "InstructorInsight": (
        "cohortId", "generatedAt", "learnerCount",
        "moduleCompletion", "challengePassRate", "topMisconceptions",
        "dataDisclosure",
    ),
}

# ---------------------------------------------------------------------------
# Edge-state disclosure — the exact string all instructor responses must contain.
# ---------------------------------------------------------------------------
SYNTHETIC_DISCLOSURE_SUBSTRING: str = "Synthetic"
