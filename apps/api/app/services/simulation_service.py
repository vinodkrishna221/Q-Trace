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

import numpy as np

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

    # --- Multi-Engine Execution & Conformance (FEA-8) -------------------------
    conformance_results: dict[str, Any] = {}
    engine_svs: dict[str, np.ndarray] = {}

    # Normalize requested backend identifiers
    raw_backends = getattr(request, "backends", None) or ["qiskit"]
    req_backends = [b.lower().strip() for b in raw_backends]
    req_backends = ["qiskit" if b in ("qiskit_aer", "aer") else b for b in req_backends]

    # Always ensure qiskit statevector is recorded
    if aer_result.finalStatevector:
        qk_sv = np.asarray(aer_result.finalStatevector, dtype=complex)
    else:
        dim = 2 ** request.circuitModel.qubitCount
        qk_sv = np.zeros(dim, dtype=complex)
        qk_sv[0] = 1.0

    if "qiskit" in req_backends:
        engine_svs["qiskit"] = qk_sv
        conformance_results["qiskit"] = {
            "statevector": [{"re": float(c.real), "im": float(c.imag)} for c in qk_sv],
            "durationMs": aer_result.durationMs,
        }

    # Parallel execution for Cirq and PennyLane via ThreadPoolExecutor
    other_backends = [b for b in req_backends if b in ("cirq", "pennylane")]
    if other_backends:
        from concurrent.futures import ThreadPoolExecutor

        futures = {}
        with ThreadPoolExecutor(max_workers=max(1, len(other_backends))) as executor:
            if "cirq" in other_backends:
                from app.services.quantum.cirq_adapter import run_cirq  # noqa: PLC0415

                futures["cirq"] = executor.submit(run_cirq, request.circuitModel)
            if "pennylane" in other_backends:
                from app.services.quantum.pennylane_adapter import (  # noqa: PLC0415
                    run_pennylane_statevector,
                )

                futures["pennylane"] = executor.submit(
                    run_pennylane_statevector, request.circuitModel
                )

        for backend_name, fut in futures.items():
            try:
                res = fut.result()
                sv_list = res.get("statevector", [])
                sv_arr = np.asarray(sv_list, dtype=complex)
                engine_svs[backend_name] = sv_arr
                conformance_results[backend_name] = {
                    "statevector": [
                        {"re": float(c.real), "im": float(c.imag)} for c in sv_arr
                    ],
                    "durationMs": res.get("durationMs", 1),
                }
            except Exception as exc:
                logger.warning(
                    "sim_service.multi_engine_error backend=%s error=%s",
                    backend_name,
                    exc,
                )
                conformance_results[backend_name] = {
                    "statevector": [],
                    "durationMs": 0,
                    "error": str(exc),
                }

    # Compute maximum pairwise L2 delta across all successful engine statevectors
    max_delta = 0.0
    valid_sv_backends = list(engine_svs.keys())
    if len(valid_sv_backends) >= 2:
        for i in range(len(valid_sv_backends)):
            for j in range(i + 1, len(valid_sv_backends)):
                sv_a = engine_svs[valid_sv_backends[i]]
                sv_b = engine_svs[valid_sv_backends[j]]
                if len(sv_a) == len(sv_b):
                    delta = float(np.linalg.norm(sv_a - sv_b))
                    if delta > max_delta:
                        max_delta = delta

    failed_backends = [b for b in other_backends if b not in engine_svs]
    if failed_backends:
        conformance_badge = "DIVERGED"
    else:
        conformance_badge = "VERIFIED" if max_delta <= 1e-6 else "DIVERGED"

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
        conformanceResults=conformance_results if conformance_results else None,
        conformanceDelta=max_delta,
        conformanceBadge=conformance_badge,
    )


