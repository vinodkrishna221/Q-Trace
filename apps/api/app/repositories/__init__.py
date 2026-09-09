import logging
import os
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

logger = logging.getLogger("qtrace.repository")

_default_repository: Optional[DataRepositoryProtocol] = None
_mongo_client: Optional[object] = None


def get_repository() -> DataRepositoryProtocol:
    """Dependency provider returning the active datastore repository singleton.

    When DEMO_LOCAL=0 and MONGODB_URI is configured, instantiates and returns
    MongoRepository backed by MongoDB.
    Otherwise (DEMO_LOCAL=1 or MONGODB_URI unset), returns InMemoryRepository.
    """
    global _default_repository, _mongo_client
    if _default_repository is None:
        demo_local = os.getenv("DEMO_LOCAL", "1") == "1"
        mongodb_uri = os.getenv("MONGODB_URI", "").strip()
        if not demo_local and mongodb_uri:
            try:
                from pymongo import AsyncMongoClient

                db_name = os.getenv("MONGODB_DB", "qtrace_prod")
                _mongo_client = AsyncMongoClient(mongodb_uri)
                db = _mongo_client[db_name]
                _default_repository = MongoRepository(db=db)
                logger.info("Initialized MongoRepository for database '%s'", db_name)
            except Exception as exc:
                logger.warning(
                    "Failed to connect to MongoDB (%s); falling back to InMemoryRepository: %s",
                    mongodb_uri[:25] + "...",
                    exc,
                )
                _default_repository = InMemoryRepository()
        else:
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


