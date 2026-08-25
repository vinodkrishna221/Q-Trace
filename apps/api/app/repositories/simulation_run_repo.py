"""In-memory Simulation Run repository — SIM-4 mock path for DATA-1.

DATA-1 (Rani) defines the real repository protocol and MongoDB implementation.
This module provides the in-memory implementation per the mission mock path:
  "Use an internal test object without editing QA-owned files."

SIM-7 will swap this for the shared Atlas/memory repository once DATA-6 is merged.

Idempotency cache (contract NOTES: "request ID provides idempotency for 60 seconds"):
  - _idempotency_store maps request_id -> (SimulationRunOut, monotonic_timestamp)
  - get_by_request_id() returns the cached run if within TTL, else evicts and returns None
"""

from __future__ import annotations

import time

from app.models.simulation import SimulationRunOut

# --- Primary store (by simulation run ID) -----------------------------------
_store: dict[str, SimulationRunOut] = {}

# --- Idempotency cache (by request ID, TTL 60s) ----------------------------
# Value: (run, monotonic timestamp at save time)
_idempotency_store: dict[str, tuple[SimulationRunOut, float]] = {}


def save(run: SimulationRunOut, request_id: str | None = None) -> None:
    """Persist a simulation run by its ID (immutable snapshot).

    If request_id is provided, also index in the idempotency cache with the
    current monotonic timestamp so duplicate requests within 60s are served
    from cache without re-running the quantum simulator.
    """
    _store[run.id] = run
    if request_id:
        _idempotency_store[request_id] = (run, time.monotonic())


def get(run_id: str) -> SimulationRunOut | None:
    """Retrieve a simulation run by run ID, or None if not found."""
    return _store.get(run_id)


def get_by_request_id(
    request_id: str,
    ttl_seconds: float = 60.0,
) -> SimulationRunOut | None:
    """Return a cached SimulationRun if the same request_id was seen within TTL.

    If the cached entry is expired (> ttl_seconds old), evicts it and returns None.

    Args:
        request_id: The X-Request-ID header value from the incoming request.
        ttl_seconds: Time-to-live for the idempotency window (default 60s per contract).

    Returns:
        Cached SimulationRunOut if within TTL, else None.
    """
    entry = _idempotency_store.get(request_id)
    if entry is None:
        return None
    run, saved_at = entry
    if time.monotonic() - saved_at > ttl_seconds:
        # Expired — evict and treat as a new request
        del _idempotency_store[request_id]
        return None
    return run


def clear() -> None:
    """Clear all stored runs and the idempotency cache — used in tests only."""
    _store.clear()
    _idempotency_store.clear()
