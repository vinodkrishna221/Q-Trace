"""Repository module and dependency injection selectors for Q-Trace."""

from typing import Optional
from app.repositories.base import DataRepositoryProtocol
from app.repositories.memory import InMemoryRepository
from app.repositories.mongo import MongoRepository
from app.repositories.seeds import (
    CORE_CHALLENGES,
    CORE_CIRCUIT_MODELS,
    CORE_INSTRUCTOR_PROFILE,
    CORE_LEARNER_PROFILES,
    CORE_LEARNING_PATHS,
    CORE_MODULES,
    CORE_PREDICTION_CHECKPOINTS,
    CORE_PROGRESS_RECORDS,
    get_core_seed_dataset,
    get_demo_cohort_dataset,
    seed_core_truth,
    seed_demo_cohort,
    seed_synthetic_cohort,
)

_default_repository: Optional[DataRepositoryProtocol] = None


def get_repository() -> DataRepositoryProtocol:
    """Dependency provider returning the active datastore repository singleton."""
    global _default_repository
    if _default_repository is None:
        _default_repository = InMemoryRepository()
    return _default_repository


def set_repository(repo: Optional[DataRepositoryProtocol]) -> None:
    """Explicitly set or reset the repository singleton (useful for test isolation)."""
    global _default_repository
    _default_repository = repo


__all__ = [
    "DataRepositoryProtocol",
    "InMemoryRepository",
    "MongoRepository",
    "get_repository",
    "set_repository",
    "seed_core_truth",
    "seed_synthetic_cohort",
    "seed_demo_cohort",
    "get_core_seed_dataset",
    "get_demo_cohort_dataset",
    "CORE_LEARNER_PROFILES",
    "CORE_INSTRUCTOR_PROFILE",
    "CORE_LEARNING_PATHS",
    "CORE_MODULES",
    "CORE_PREDICTION_CHECKPOINTS",
    "CORE_CIRCUIT_MODELS",
    "CORE_CHALLENGES",
    "CORE_PROGRESS_RECORDS",
]


