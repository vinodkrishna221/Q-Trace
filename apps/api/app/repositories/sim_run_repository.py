"""SimulationRun repository protocol + two implementations — SIM-7.

Protocol
--------
SimulationRunRepositoryProtocol  — typed interface owned by the sim track.

Implementations
---------------
InMemorySimRunRepo   — DEMO_LOCAL=1 (venue-safe, no external dependency).
MongoSimRunRepo      — DEMO_LOCAL=0, wraps DataRepositoryProtocol from DATA-6.

Selection
---------
get_sim_run_repo()   — FastAPI dependency: reads DEMO_LOCAL env var.

DATA-6 mock-path note
---------------------
DATA-6 (Rani) defines DataRepositoryProtocol in app.repositories.base.
While that branch is not yet merged, MongoSimRunRepo.save/get gracefully
handle the missing app.models.entities import by passing SimulationRunOut
directly to the injected data_repo (duck-typed, works for test mocks).
Business logic in the router is unchanged; only the persistence backend
changes between environments.

Idempotency cache (contract NOTES: "request ID provides idempotency for 60s"):
- stored per-instance so it works identically in both backends.
- MongoSimRunRepo caches the in-process result to avoid a Mongo round-trip
  on the duplicate request within the TTL window.
"""

from __future__ import annotations

import asyncio
import concurrent.futures
import logging
import os
import time
from typing import Any, Optional, Protocol, runtime_checkable

from app.models.simulation import SimulationRunOut

logger = logging.getLogger("qtrace.sim_repo")

# ---------------------------------------------------------------------------
# Protocol (owned by simulation track, not DATA-6's DataRepositoryProtocol)
# ---------------------------------------------------------------------------

_TTL_SECONDS: float = 60.0


@runtime_checkable
class SimulationRunRepositoryProtocol(Protocol):
    """Minimal persistence interface for Simulation Runs."""

    def save(
        self,
        run: SimulationRunOut,
        request_id: str | None = None,
        prediction_response: Optional[dict[str, Any]] = None,
    ) -> None:
        """Persist a simulation run (immutable snapshot)."""
        ...

    def get(self, run_id: str) -> Optional[SimulationRunOut]:
        """Retrieve a run by ID, or None."""
        ...

    def get_by_request_id(
        self,
        request_id: str,
        ttl_seconds: float = _TTL_SECONDS,
    ) -> Optional[SimulationRunOut]:
        """Return a cached run for the same request_id if within TTL."""
        ...

    def clear(self) -> None:
        """Clear all data — tests only."""
        ...


# ---------------------------------------------------------------------------
# In-memory implementation (venue-safe; DEMO_LOCAL=1)
# ---------------------------------------------------------------------------


class InMemorySimRunRepo:
    """Thread-safe in-memory SimulationRun store.

    Identical behaviour to the previous module-level simulation_run_repo,
    but encapsulated in a class instance so tests can create isolated repos.
    """

    def __init__(self) -> None:
        self._store: dict[str, SimulationRunOut] = {}
        self._idempotency: dict[str, tuple[SimulationRunOut, float]] = {}

    def _run_async(self, coro) -> object:
        """Run an async coroutine synchronously from a sync call site."""
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop is not None and loop.is_running():
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                return pool.submit(asyncio.run, coro).result()
        new_loop = asyncio.new_event_loop()
        try:
            return new_loop.run_until_complete(coro)
        finally:
            new_loop.close()

    def save(
        self,
        run: SimulationRunOut,
        request_id: str | None = None,
        prediction_response: Optional[dict[str, Any]] = None,
    ) -> None:
        self._store[run.id] = run
        if request_id:
            self._idempotency[request_id] = (run, time.monotonic())

        # Bridge to shared DataRepositoryProtocol so downstream diagnosis & progress find it
        try:
            from app.models.entities import SimulationRun as SimRunEntity
            from app.repositories import get_repository

            payload = SimRunEntity(
                id=run.id,
                learnerProfileId=run.learnerProfileId,
                moduleId=run.moduleId,
                circuitModelId=run.circuitModelId,
                predictionResponse=prediction_response,
                adapter=run.adapter,
                shots=run.shots,
                status=run.status,
                probabilities=run.probabilities,
                counts=run.counts,
                stateTrace=[s.model_dump() for s in run.stateTrace],
                conformance=run.conformance.model_dump() if run.conformance else None,
                durationMs=run.durationMs,
                createdAt=run.createdAt,
            )
            data_repo = get_repository()
            self._run_async(data_repo.create_simulation_run(payload))
        except Exception as exc:
            logger.debug("Could not mirror simulation run to data repo: %s", exc)

    def get(self, run_id: str) -> Optional[SimulationRunOut]:
        return self._store.get(run_id)

    def get_by_request_id(
        self,
        request_id: str,
        ttl_seconds: float = _TTL_SECONDS,
    ) -> Optional[SimulationRunOut]:
        entry = self._idempotency.get(request_id)
        if entry is None:
            return None
        run, saved_at = entry
        if time.monotonic() - saved_at > ttl_seconds:
            del self._idempotency[request_id]
            return None
        return run

    def clear(self) -> None:
        self._store.clear()
        self._idempotency.clear()


# ---------------------------------------------------------------------------
# Mongo-backed implementation (DEMO_LOCAL=0)
# Wraps DataRepositoryProtocol from DATA-6 (Rani).
# ---------------------------------------------------------------------------


class MongoSimRunRepo:
    """Atlas-backed SimulationRun repository.

    Delegates persistence to the shared DataRepositoryProtocol defined by
    DATA-6 (Rani).  get/save run in a threadpool executor so this class
    remains compatible with the sync call sites in the router.

    Idempotency is handled with an in-process TTL cache to avoid a Mongo
    round-trip on duplicate requests within the 60s window (contract NOTES).

    DATA-6 mock path: when app.models.entities is not importable (branch not
    merged), SimulationRunOut is passed directly to the data repo — the mock
    in tests accepts duck-typed objects and the real MongoRepository will
    accept the entity once DATA-6 is merged.
    """

    def __init__(self, data_repo: object) -> None:
        """
        Args:
            data_repo: A DataRepositoryProtocol instance from DATA-6.
                       Typed as object to avoid a hard import while the branch
                       is not yet merged into main.
        """
        self._repo = data_repo
        self._idempotency: dict[str, tuple[SimulationRunOut, float]] = {}

    # --- Sync wrappers that drive async DataRepositoryProtocol calls --------

    def _run_async(self, coro) -> object:  # type: ignore[return]
        """Run an async coroutine synchronously from a sync call site."""
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop is not None and loop.is_running():
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                return pool.submit(asyncio.run, coro).result()
        new_loop = asyncio.new_event_loop()
        try:
            return new_loop.run_until_complete(coro)
        finally:
            new_loop.close()

    def save(
        self,
        run: SimulationRunOut,
        request_id: str | None = None,
        prediction_response: Optional[dict[str, Any]] = None,
    ) -> None:
        """Persist a SimulationRun via the DATA-6 repository protocol.

        When app.models.entities is available (DATA-6 merged), converts to
        the entity before persisting.  While DATA-6 is not merged (mock path),
        SimulationRunOut is passed directly — test mocks accept it duck-typed.
        """
        try:
            payload: object
            try:
                from app.models.entities import SimulationRun as SimRunEntity  # noqa: PLC0415

                payload = SimRunEntity(
                    id=run.id,
                    learnerProfileId=run.learnerProfileId,
                    moduleId=run.moduleId,
                    circuitModelId=run.circuitModelId,
                    predictionResponse=prediction_response,
                    adapter=run.adapter,
                    shots=run.shots,
                    status=run.status,
                    probabilities=run.probabilities,
                    counts=run.counts,
                    stateTrace=[s.model_dump() for s in run.stateTrace],
                    conformance=run.conformance.model_dump() if run.conformance else None,
                    durationMs=run.durationMs,
                    createdAt=run.createdAt,
                )
            except ModuleNotFoundError:
                # DATA-6 not merged — pass SimulationRunOut directly (mock path).
                logger.debug(
                    "app.models.entities unavailable (DATA-6 mock path); "
                    "passing SimulationRunOut directly to data repo."
                )
                payload = run

            self._run_async(self._repo.create_simulation_run(payload))  # type: ignore[attr-defined]
        except Exception as exc:
            logger.error("MongoSimRunRepo.save failed: %s", exc)
            raise

        if request_id:
            self._idempotency[request_id] = (run, time.monotonic())

    def get(self, run_id: str) -> Optional[SimulationRunOut]:
        try:
            raw = self._run_async(
                self._repo.get_simulation_run(run_id)  # type: ignore[attr-defined]
            )
            if raw is None:
                return None
            # If already a SimulationRunOut (mock path), return as-is.
            if isinstance(raw, SimulationRunOut):
                return raw
            # Otherwise convert from entity (DATA-6 merged path).
            return _entity_to_out(raw)
        except Exception as exc:
            logger.error("MongoSimRunRepo.get failed: %s", exc)
            return None

    def get_by_request_id(
        self,
        request_id: str,
        ttl_seconds: float = _TTL_SECONDS,
    ) -> Optional[SimulationRunOut]:
        entry = self._idempotency.get(request_id)
        if entry is None:
            return None
        run, saved_at = entry
        if time.monotonic() - saved_at > ttl_seconds:
            del self._idempotency[request_id]
            return None
        return run

    def clear(self) -> None:
        """Reset the in-process idempotency cache and the data_repo state (tests only).

        Calls reset() on the underlying data_repo if the method is available,
        so both the in-process cache and the backing store are cleared in sync.
        This matches the DataRepositoryProtocol.reset() contract from DATA-6.
        """
        self._idempotency.clear()
        reset_fn = getattr(self._repo, "reset", None)
        if callable(reset_fn):
            try:
                self._run_async(reset_fn())
            except Exception:
                pass  # best-effort; reset is tests-only


# ---------------------------------------------------------------------------
# Helper: entities.SimulationRun → SimulationRunOut
# ---------------------------------------------------------------------------


def _entity_to_out(entity: object) -> SimulationRunOut:
    """Convert a DATA-6 SimulationRun entity to the sim-track output model."""
    from app.models.simulation import (  # noqa: PLC0415
        ConformanceResult,
        StateTraceStepOut,
    )

    d = entity.model_dump() if hasattr(entity, "model_dump") else dict(entity)  # type: ignore[attr-defined]
    state_trace = [
        StateTraceStepOut.model_validate(s) if isinstance(s, dict) else s
        for s in d.get("stateTrace", [])
    ]
    conformance_raw = d.get("conformance", {})
    conformance = (
        ConformanceResult.model_validate(conformance_raw)
        if isinstance(conformance_raw, dict)
        else conformance_raw
    )
    return SimulationRunOut(
        id=d["id"],
        learnerProfileId=d["learnerProfileId"],
        moduleId=d.get("moduleId", ""),
        circuitModelId=d.get("circuitModelId", ""),
        adapter=d.get("adapter", "QISKIT_AER"),
        shots=d.get("shots", 1024),
        status=d.get("status", "SUCCEEDED"),
        probabilities=d.get("probabilities", {}),
        counts=d.get("counts", {}),
        stateTrace=state_trace,
        conformance=conformance,
        durationMs=d.get("durationMs", 0),
        createdAt=d.get("createdAt", ""),
    )


# ---------------------------------------------------------------------------
# Singleton instances (module-level; tests override via dependency_overrides)
# ---------------------------------------------------------------------------

_memory_repo: InMemorySimRunRepo = InMemorySimRunRepo()


def _build_mongo_repo() -> Optional[MongoSimRunRepo]:
    """Try to build a MongoSimRunRepo by wrapping the active MongoDB repository.

    Returns None if MongoDB is unconfigured or unavailable, which causes
    the caller to fall back to the in-memory implementation.
    """
    try:
        from app.repositories import get_repository  # noqa: PLC0415
        from app.repositories.mongo import MongoRepository  # noqa: PLC0415

        active_repo = get_repository()
        if isinstance(active_repo, MongoRepository):
            return MongoSimRunRepo(active_repo)

        mongodb_uri = os.getenv("MONGODB_URI", "").strip()
        if mongodb_uri:
            from pymongo import AsyncMongoClient  # noqa: PLC0415

            db_name = os.getenv("MONGODB_DB", "qtrace_prod")
            client = AsyncMongoClient(mongodb_uri)
            db = client[db_name]
            return MongoSimRunRepo(MongoRepository(db=db))
    except Exception as exc:
        logger.warning(
            "MongoSimRunRepo not available: %s — using memory fallback.",
            exc,
        )
    return None


# ---------------------------------------------------------------------------
# FastAPI dependency: get_sim_run_repo
# ---------------------------------------------------------------------------


def get_sim_run_repo() -> SimulationRunRepositoryProtocol:
    """Select the active SimulationRun repository based on DEMO_LOCAL env var.

    DEMO_LOCAL=1  (default) → InMemorySimRunRepo  (venue-safe)
    DEMO_LOCAL=0            → MongoSimRunRepo if MongoDB is available,
                              else falls back to InMemorySimRunRepo.
    """
    demo_local = os.getenv("DEMO_LOCAL", "1") == "1"
    if demo_local:
        return _memory_repo

    mongo = _build_mongo_repo()
    if mongo is not None:
        return mongo

    logger.info(
        "DEMO_LOCAL=0 but MongoDB is not configured or unavailable; "
        "using InMemorySimRunRepo for this request."
    )
    return _memory_repo
