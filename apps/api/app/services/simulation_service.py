"""Simulation Run orchestration service — SIM-4 / SIM-6 / SIM-8.

Converts a validated SimulationRunRequest into a persisted SimulationRunOut
by calling the Qiskit Aer adapter and serializing its output into the
contract response shape.

Called from the async route via run_in_executor (CPU-bound — per fastapi.md:
"Async by default; sync only for CPU-bound SDKs, then run_in_threadpool").

quantum-runtime.md rules enforced here:
  - Adapter runs synchronously (called from executor, not inside event loop).
  - Conformance field always present; skippedReason set when PennyLane skipped.
  - Status is SUCCEEDED on clean Aer run.
  - SIM-6: when runConformance=True, run_pennylane_conformance is called and
    the real delta/passed/skippedReason values are returned. When False, the
    PENNYLANE_NOT_ENABLED stub is preserved so existing tests stay green.
  - SIM-8: ENABLE_PENNYLANE=0 → skippedReason PENNYLANE_DISABLED so the
    primary result still succeeds. Structured duration/error logs added.
"""

from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone

from app.models.simulation import (
    BlochVectorOut,
    ComplexValue,
    ConformanceResult,
    ReducedQubitOut,
    SimulationRunOut,
    SimulationRunRequest,
    StateTraceStepOut,
)
from app.services.quantum.adapter import run_qiskit_aer

logger = logging.getLogger("qtrace.sim_service")


def _pennylane_enabled() -> bool:
    """Return True when ENABLE_PENNYLANE env var is not explicitly 0."""
    return os.getenv("ENABLE_PENNYLANE", "1") != "0"


def build_simulation_run(
    request: SimulationRunRequest,
    request_id: str,
) -> SimulationRunOut:
    """Execute a simulation and return the contract-shaped SimulationRunOut.

    This is a SYNCHRONOUS function — must be called via run_in_executor
    from async routes to keep the event loop free.

    Args:
        request: Validated SimulationRunRequest (circuit already validated by Pydantic)
        request_id: Current X-Request-ID for traceability

    Returns:
        SimulationRunOut ready for persistence and HTTP response
    """
    # Run Qiskit Aer adapter (CPU-bound — safe because we are already in executor)
    try:
        aer_result = run_qiskit_aer(request.circuitModel, shots=request.shots)
    except Exception as exc:
        logger.error(
            "sim_service.aer_error requestId=%s circuitId=%s error=%s",
            request_id,
            request.circuitModel.id,
            type(exc).__name__,
        )
        raise

    logger.info(
        "sim_service.aer_ok requestId=%s circuitId=%s durationMs=%d shots=%d",
        request_id,
        request.circuitModel.id,
        aer_result.durationMs,
        request.shots,
    )

    # --- Serialize State Trace -------------------------------------------------
    trace_out: list[StateTraceStepOut] = []
    for step in aer_result.stateTrace:
        trace_out.append(
            StateTraceStepOut(
                stepIndex=step.stepIndex,
                operationId=step.operationId,
                label=step.label,
                basisProbabilities=step.basisProbabilities,
                amplitudes={
                    label: ComplexValue(re=amp["re"], im=amp["im"])
                    for label, amp in step.amplitudes.items()
                },
                reducedQubits=[
                    ReducedQubitOut(
                        qubit=rq.qubit,
                        bloch=BlochVectorOut(x=rq.bloch.x, y=rq.bloch.y, z=rq.bloch.z),
                        purity=rq.purity,
                        label=rq.label,
                    )
                    for rq in step.reducedQubits
                ],
            )
        )

    # --- Conformance — SIM-6/SIM-8 --------------------------------------------
    if request.runConformance and _pennylane_enabled():
        # Deferred import: PennyLane only imported when conformance is requested
        # and ENABLE_PENNYLANE != 0.
        try:
            from app.services.quantum.pennylane_adapter import run_pennylane_conformance  # noqa: PLC0415

            pl_result = run_pennylane_conformance(
                circuit=request.circuitModel,
                qiskit_probabilities=aer_result.probabilities,
            )
            conformance = ConformanceResult(
                adapter="PENNYLANE",
                maxProbabilityDelta=pl_result.max_probability_delta,
                epsilon=pl_result.epsilon,
                passed=pl_result.passed,
                skippedReason=pl_result.skipped_reason,
            )
        except Exception as exc:
            logger.warning(
                "sim_service.conformance_failed requestId=%s error=%s", request_id, exc
            )
            conformance = ConformanceResult(
                adapter="PENNYLANE",
                maxProbabilityDelta=0.0,
                epsilon=1e-6,
                passed=False,
                skippedReason="PENNYLANE_UNAVAILABLE",
            )
    elif request.runConformance and not _pennylane_enabled():
        # SIM-8: ENABLE_PENNYLANE=0 — surface a clear skip reason so UI/demo
        # can display the correct message instead of a generic stub.
        # SIM-9: "PENNYLANE_DISABLED" → cleaner UI code
        conformance = ConformanceResult(
            adapter="PENNYLANE",
            maxProbabilityDelta=0.0,
            epsilon=1e-6,
            passed=False,
            skippedReason="PENNYLANE_DISABLED",
        )
    else:
        # runConformance=False → skip; existing route tests use this path.
        # SIM-9: "PENNYLANE_NOT_REQUESTED" is clearer for the UI than NOT_ENABLED
        conformance = ConformanceResult(
            adapter="PENNYLANE",
            maxProbabilityDelta=0.0,
            epsilon=1e-6,
            passed=False,
            skippedReason="PENNYLANE_NOT_REQUESTED",
        )

    return SimulationRunOut(
        id=f"sr_{uuid.uuid4().hex[:12]}",
        learnerProfileId=request.learnerProfileId,
        moduleId=request.moduleId,
        circuitModelId=request.circuitModel.id,
        adapter="QISKIT_AER",
        shots=request.shots,
        status="SUCCEEDED",
        probabilities=aer_result.probabilities,
        counts=aer_result.counts,
        stateTrace=trace_out,
        conformance=conformance,
        durationMs=aer_result.durationMs,
        createdAt=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )

