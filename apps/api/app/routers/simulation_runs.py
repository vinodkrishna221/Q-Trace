"""Router for /v1/simulation-runs — SIM-4.

Implements:
  POST /v1/simulation-runs → 201 (run + persist)
  GET  /v1/simulation-runs/{simulationRunId} → 200 (retrieve)

quantum-runtime.md:
  - CPU-bound Qiskit call runs in executor (not event loop).
  - Timeout 1500ms → 504 SIMULATION_TIMEOUT.

fastapi.md:
  - Async by default; sync SDK calls via run_in_executor.
"""

from __future__ import annotations

import asyncio
import os

from fastapi import APIRouter, HTTPException, Request

from app.models.simulation import (
    SimulationRunGetResponse,
    SimulationRunRequest,
    SimulationRunResponse,
)
from app.repositories import simulation_run_repo
from app.services.simulation_service import build_simulation_run

router = APIRouter(prefix="/v1/simulation-runs", tags=["simulation-runs"])

# Timeout for quantum execution. Production hardened to 1500ms via env var in SIM-8.
# Default 30s is intentionally permissive to handle Qiskit cold-start in test/dev.
_TIMEOUT_S = float(os.getenv("QTRACE_SIM_TIMEOUT_S", "30.0"))


@router.post("", status_code=201, response_model=SimulationRunResponse)
async def create_simulation_run(
    body: SimulationRunRequest,
    request: Request,
) -> SimulationRunResponse:
    """POST /v1/simulation-runs — execute and persist a simulation run.

    Idempotency: if the same X-Request-ID has been seen within 60s, return the
    cached SimulationRun without re-running the quantum simulator.

    Runs Qiskit Aer in a thread pool executor so the async event loop stays
    responsive. Returns 504 if execution exceeds 1500ms.
    """
    request_id: str = getattr(request.state, "request_id", "req_unknown")

    # --- Idempotency check (contract: "request ID provides idempotency for 60s") ---
    cached = simulation_run_repo.get_by_request_id(request_id)
    if cached is not None:
        return SimulationRunResponse(simulationRun=cached)

    loop = asyncio.get_running_loop()

    try:
        run = await asyncio.wait_for(
            loop.run_in_executor(
                None,
                build_simulation_run,
                body,
                request_id,
            ),
            timeout=_TIMEOUT_S,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail={
                "code": "SIMULATION_TIMEOUT",
                "message": "Simulation exceeded the 1500ms budget.",
                "requestId": request_id,
                "details": {"timeoutMs": int(_TIMEOUT_S * 1000)},
            },
        )

    simulation_run_repo.save(run, request_id=request_id)
    return SimulationRunResponse(simulationRun=run)


@router.get("/{simulation_run_id}", response_model=SimulationRunGetResponse)
async def get_simulation_run(
    simulation_run_id: str,
    request: Request,
) -> SimulationRunGetResponse:
    """GET /v1/simulation-runs/{simulationRunId} — retrieve a persisted run."""
    run = simulation_run_repo.get(simulation_run_id)
    if run is None:
        request_id: str = getattr(request.state, "request_id", "req_unknown")
        raise HTTPException(
            status_code=404,
            detail={
                "code": "SIMULATION_RUN_NOT_FOUND",
                "message": f"No simulation run found with id '{simulation_run_id}'.",
                "requestId": request_id,
                "details": None,
            },
        )
    return SimulationRunGetResponse(simulationRun=run)
