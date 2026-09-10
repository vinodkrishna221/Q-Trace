"""Router for /v1/simulation-runs — SIM-8 (hardened timeouts, flags, readiness).

SIM-7 injected the repository via FastAPI Depends().
SIM-8 hardens the runtime boundary:
  - Default timeout locked to 1500ms (QTRACE_SIM_TIMEOUT_S still overridable
    for test environments that need cold-start headroom).
  - Structured JSON log on success and timeout (durationMs, requestId, adapter).
  - ENABLE_QISKIT=0 returns 503 ADAPTER_UNAVAILABLE immediately so the route
    never enters the executor with a disabled primary adapter.

quantum-runtime.md:
  - CPU-bound Qiskit call runs in executor (not event loop).
  - Timeout 1500ms → 504 SIMULATION_TIMEOUT.
  - Return SIMULATION_TIMEOUT, never a hung request.

fastapi.md:
  - Async by default; sync SDK calls via run_in_executor.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request

from app.models.simulation import (
    SimulationRunGetResponse,
    SimulationRunRequest,
    SimulationRunResponse,
)
from app.repositories.sim_run_repository import (
    SimulationRunRepositoryProtocol,
    get_sim_run_repo,
)
from app.services.simulation_service import build_simulation_run

logger = logging.getLogger("qtrace.sim_route")

router = APIRouter(prefix="/v1/simulation-runs", tags=["simulation-runs"])

# ---------------------------------------------------------------------------
# Runtime guard constants — SIM-8
# ---------------------------------------------------------------------------

# Timeout: contract budget is 1500ms.  QTRACE_SIM_TIMEOUT_S overrides for tests
# (e.g., tests that need Qiskit cold-start headroom set this to 30.0).
# Default is the production-hardened contract value.
_DEFAULT_TIMEOUT_S: float = 1.5
_TIMEOUT_S: float = float(os.getenv("QTRACE_SIM_TIMEOUT_S", str(_DEFAULT_TIMEOUT_S)))

# Type alias for the injected repository dependency.
_Repo = Annotated[SimulationRunRepositoryProtocol, Depends(get_sim_run_repo)]


def _qiskit_enabled() -> bool:
    """Return True when ENABLE_QISKIT env var is not explicitly 0."""
    return os.getenv("ENABLE_QISKIT", "1") != "0"


@router.post("", status_code=201, response_model=SimulationRunResponse)
async def create_simulation_run(
    body: SimulationRunRequest,
    request: Request,
    repo: _Repo,
) -> SimulationRunResponse:
    """POST /v1/simulation-runs — execute and persist a simulation run.

    Idempotency: if the same X-Request-ID has been seen within 60s, return the
    cached SimulationRun without re-running the quantum simulator.

    Runs Qiskit Aer in a thread pool executor so the async event loop stays
    responsive.  Returns:
      - 503 ADAPTER_UNAVAILABLE when ENABLE_QISKIT=0.
      - 504 SIMULATION_TIMEOUT when execution exceeds the budget.
    """
    request_id: str = getattr(request.state, "request_id", "req_unknown")

    # --- Adapter-disabled guard (SIM-8) ---
    if not _qiskit_enabled():
        logger.warning(
            "sim_route.adapter_disabled requestId=%s adapter=QISKIT_AER",
            request_id,
        )
        raise HTTPException(
            status_code=503,
            detail={
                "code": "ADAPTER_UNAVAILABLE",
                "message": "Primary adapter QISKIT_AER is disabled (ENABLE_QISKIT=0).",
                "requestId": request_id,
                "details": {"adapter": "QISKIT_AER", "flag": "ENABLE_QISKIT"},
            },
        )

    # --- Idempotency check (contract: "request ID provides idempotency for 60s") ---
    cached = repo.get_by_request_id(request_id)
    if cached is not None:
        return SimulationRunResponse(simulationRun=cached)

    loop = asyncio.get_running_loop()
    t_route_start = time.monotonic()

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
        elapsed_ms = int((time.monotonic() - t_route_start) * 1000)
        logger.error(
            "sim_route.timeout requestId=%s budgetMs=%d elapsedMs=%d",
            request_id,
            int(_TIMEOUT_S * 1000),
            elapsed_ms,
        )
        raise HTTPException(
            status_code=504,
            detail={
                "code": "SIMULATION_TIMEOUT",
                "message": (
                    "Simulation exceeded the 1 500 ms budget. "
                    "Try a shorter circuit (≤ 5 qubits, ≤ 20 gates)."
                ),
                "requestId": request_id,
                "details": {
                    "timeoutMs": int(_TIMEOUT_S * 1000),
                    "hint": "Reduce circuit depth or qubit count and retry.",
                },
            },
        )

    logger.info(
        "sim_route.success requestId=%s runId=%s durationMs=%d adapter=%s",
        request_id,
        run.id,
        run.durationMs,
        run.adapter,
    )

    pred_dict = (
        body.predictionResponse.model_dump()
        if body.predictionResponse is not None
        else None
    )
    await repo.save(run, request_id=request_id, prediction_response=pred_dict)
    return SimulationRunResponse(simulationRun=run)


@router.get("/{simulation_run_id}", response_model=SimulationRunGetResponse)
async def get_simulation_run(
    simulation_run_id: str,
    request: Request,
    repo: _Repo,
) -> SimulationRunGetResponse:
    """GET /v1/simulation-runs/{simulationRunId} — retrieve a persisted run."""
    run = await repo.get(simulation_run_id)
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

