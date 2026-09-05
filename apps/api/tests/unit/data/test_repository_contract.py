"""Unit tests verifying behavioral contract parity between memory and Atlas Mongo repositories."""

import pytest
from typing import Any
from app.models.entities import LearnerProfile
from app.repositories.memory import InMemoryRepository
from app.repositories.mongo import MongoRepository
from app.repositories.base import DataRepositoryProtocol
import os, sys
sys.path.append(os.path.dirname(__file__))
from test_mongo_repository import MockAsyncDatabase


@pytest.fixture
def mock_db() -> MockAsyncDatabase:
    return MockAsyncDatabase()


@pytest.fixture
def memory_repo() -> InMemoryRepository:
    return InMemoryRepository()


@pytest.fixture
def mongo_repo(mock_db: MockAsyncDatabase) -> MongoRepository:
    return MongoRepository(db=mock_db)


@pytest.fixture(params=["memory", "mongo"])
def repo(request, memory_repo, mongo_repo) -> DataRepositoryProtocol:
    """Parameterized fixture to run identical tests on both repository implementations."""
    if request.param == "memory":
        return memory_repo
    else:
        return mongo_repo


@pytest.mark.asyncio
async def test_learner_profile_parity(repo: DataRepositoryProtocol):
    """Verify both repositories handle LearnerProfile creation, retrieval, and reset equivalently."""
    profile = LearnerProfile(
        id="lp_contract_test",
        displayName="Parity Test",
        role="BEGINNER_CSE",
        cohortId="cohort_1",
        priorKnowledge={},
        completedSkillIds=[],
        activeLearningPathId="path_1",
        schemaVersion=1,
    )
    saved = await repo.create_or_update_learner_profile(profile)
    assert saved.id == "lp_contract_test"
    
    fetched = await repo.get_learner_profile("lp_contract_test")
    assert fetched is not None
    assert fetched.displayName == "Parity Test"
    
    await repo.reset()
    assert await repo.get_learner_profile("lp_contract_test") is None
