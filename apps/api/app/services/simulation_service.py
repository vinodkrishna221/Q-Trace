"""Simulation Run orchestration service — SIM-4.

Converts a validated SimulationRunRequest into a persisted SimulationRunOut
by calling the Qiskit Aer adapter and serializing its output into the
contract response shape.

Called from the async route via run_in_executor (CPU-bound — per fastapi.md:
"Async by default; sync only for CPU-bound SDKs, then run_in_threadpool").

quantum-runtime.md rules enforced here:
  - Adapter runs synchronously (called from executor, not inside event loop).
  - Conformance field always present; skippedReason set when PennyLane skipped.
  - Status is SUCCEEDED on clean Aer run; other statuses added in SIM-8.
"""

from __future__ import annotations

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
    aer_result = run_qiskit_aer(request.circuitModel, shots=request.shots)

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

    # --- Conformance (PennyLane added in SIM-6; skipped here) -----------------
    conformance = ConformanceResult(
        adapter="PENNYLANE",
        maxProbabilityDelta=0.0,
        epsilon=1e-6,
        passed=False,
        skippedReason="PENNYLANE_NOT_ENABLED",
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
