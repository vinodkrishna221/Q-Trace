"""Flight Recorder diagnosis router for Q-Trace.

AI-2 — Expose Flight Recorder diagnosis and replay
====================================================
Owner:   Rajeswari (ai-pedagogy track)
Branch:  feat/ai-pedagogy/ai-2-expose-flight-recorder-diagnosis-and
Contract: board/contracts/flight-recorder-tutor.md v1

Endpoints implemented
---------------------
POST /v1/flight-recorder/diagnose
    Accepts learnerProfileId + simulationRunId.
    Applies deterministic misconception rules (AI-1).
    Persists a MisconceptionSignal via repository protocol.
    Returns misconceptionSignal + replay headlines.

Error codes (per contract)
--------------------------
404 LEARNER_NOT_FOUND
404 SIMULATION_RUN_NOT_FOUND
409 RUN_NOT_SUCCEEDED
422 PREDICTION_MISSING
422 TRACE_INSUFFICIENT
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict

from app.repositories import DataRepositoryProtocol, get_repository
from app.services.diagnosis.service import (
    ERR_LEARNER_NOT_FOUND,
    ERR_PREDICTION_MISSING,
    ERR_RUN_NOT_SUCCEEDED,
    ERR_SIMULATION_RUN_NOT_FOUND,
    ERR_TRACE_INSUFFICIENT,
    run_diagnosis,
)

router = APIRouter(prefix="/v1/flight-recorder", tags=["flight-recorder"])

# ---------------------------------------------------------------------------
# Request / Response models (contract-aligned)
# ---------------------------------------------------------------------------


class DiagnoseRequest(BaseModel):
    """POST /v1/flight-recorder/diagnose request body.

    Fields match the contract exactly:
      learnerProfileId — ID of the learner whose run is being diagnosed.
      simulationRunId  — ID of a SUCCEEDED simulation run with stateTrace.
    """

    model_config = ConfigDict(extra="ignore")

    learnerProfileId: str
    simulationRunId: str


# ---------------------------------------------------------------------------
# HTTP error mapping
# ---------------------------------------------------------------------------

_HTTP_STATUS: dict[str, int] = {
    ERR_LEARNER_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ERR_SIMULATION_RUN_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ERR_RUN_NOT_SUCCEEDED: status.HTTP_409_CONFLICT,
    ERR_PREDICTION_MISSING: status.HTTP_422_UNPROCESSABLE_ENTITY,
    ERR_TRACE_INSUFFICIENT: status.HTTP_422_UNPROCESSABLE_ENTITY,
}

_HTTP_MESSAGE: dict[str, str] = {
    ERR_LEARNER_NOT_FOUND: "Learner profile not found.",
    ERR_SIMULATION_RUN_NOT_FOUND: "Simulation run not found.",
    ERR_RUN_NOT_SUCCEEDED: "Simulation run has not succeeded; diagnosis requires a succeeded run.",
    ERR_PREDICTION_MISSING: "Simulation run has no prediction recorded; cannot diagnose without a prediction.",
    ERR_TRACE_INSUFFICIENT: "State trace is empty; at least one step is required for diagnosis.",
}


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post(
    "/diagnose",
    status_code=status.HTTP_201_CREATED,
    summary="Diagnose a misconception from a simulation run",
    response_description="Misconception signal and two-step replay headlines",
)
async def post_diagnose(
    request: DiagnoseRequest,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """Apply deterministic misconception rules and persist the result.

    The diagnosis is fully deterministic — no LLM is involved.
    The response always includes:
      - ``misconceptionSignal``: the persisted signal entity.
      - ``replay``: ordered list of step headlines citing verified evidence keys.

    Returns 201 on success; see Error codes section for failure modes.
    """
    result = await run_diagnosis(
        learner_profile_id=request.learnerProfileId,
        simulation_run_id=request.simulationRunId,
        repo=repo,
    )

    if not result.ok:
        error_code = result.error_code or "UNKNOWN_ERROR"
        http_status = _HTTP_STATUS.get(error_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        message = _HTTP_MESSAGE.get(error_code, "Diagnosis could not be completed.")
        raise HTTPException(
            status_code=http_status,
            detail={
                "code": error_code,
                "message": message,
            },
        )

    # Build contract-shaped response
    signal = result.misconception_signal
    assert signal is not None  # guaranteed when ok=True

    return {
        "misconceptionSignal": signal.model_dump(),
        "replay": result.replay,
    }
