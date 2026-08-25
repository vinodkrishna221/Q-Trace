"""In-memory Simulation Run repository — SIM-4 mock path for DATA-1.

DATA-1 (Rani) defines the real repository protocol and MongoDB implementation.
This module provides the in-memory implementation per the mission mock path:
  "Use an internal test object without editing QA-owned files."

SIM-7 will swap this for the shared Atlas/memory repository once DATA-6 is merged.
"""

from __future__ import annotations

from app.models.simulation import SimulationRunOut

# Module-level store — persists for process lifetime (single-worker, venue-safe)
_store: dict[str, SimulationRunOut] = {}


def save(run: SimulationRunOut) -> None:
    """Persist a simulation run by its ID (immutable snapshot)."""
    _store[run.id] = run


def get(run_id: str) -> SimulationRunOut | None:
    """Retrieve a simulation run by ID, or None if not found."""
    return _store.get(run_id)


def clear() -> None:
    """Clear all stored runs — used in tests only."""
    _store.clear()
