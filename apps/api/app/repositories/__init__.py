"""Repository module and dependency injection selectors for Q-Trace."""

from typing import Optional
from app.repositories.base import DataRepositoryProtocol
from app.repositories.memory import InMemoryRepository

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
    "get_repository",
    "set_repository",
]
