"""Backwards-compatibility shim for the module-level simulation_run_repo API.

SIM-4 tests and any other code that imported from this module directly still
work without modification.  All calls delegate to the InMemorySimRunRepo
singleton in sim_run_repository.py.

SIM-7 switches the router to use the repository via FastAPI Depends().
This shim is retained so existing tests remain green; do not add new callers.
"""

from __future__ import annotations

from typing import Optional

from app.models.simulation import SimulationRunOut
from app.repositories.sim_run_repository import InMemorySimRunRepo

# Module-level singleton (same instance used by get_sim_run_repo in DEMO_LOCAL=1)
from app.repositories.sim_run_repository import _memory_repo as _repo


def save(run: SimulationRunOut, request_id: str | None = None) -> None:
    """Persist a simulation run by its ID (immutable snapshot)."""
    _repo.save(run, request_id=request_id)


def get(run_id: str) -> Optional[SimulationRunOut]:
    """Retrieve a simulation run by run ID, or None if not found."""
    return _repo.get(run_id)


def get_by_request_id(
    request_id: str,
    ttl_seconds: float = 60.0,
) -> Optional[SimulationRunOut]:
    """Return a cached SimulationRun if the same request_id was seen within TTL."""
    return _repo.get_by_request_id(request_id, ttl_seconds=ttl_seconds)


def clear() -> None:
    """Clear all stored runs and the idempotency cache — used in tests only."""
    _repo.clear()


__all__ = ["save", "get", "get_by_request_id", "clear", "InMemorySimRunRepo"]
