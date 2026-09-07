"""
AI-2 — Flight Recorder Diagnosis Service
=========================================
Owner:   Rajeswari (ai-pedagogy track)
Branch:  feat/ai-pedagogy/ai-2-expose-flight-recorder-diagnosis-and
Version: 1
Contract owned:    board/contracts/flight-recorder-tutor.md v1
Contract consumed: board/contracts/circuit-simulation.md v1

This module is a pure async service layer — no LLM calls, no I/O beyond
the injected repository, no direct FastAPI imports.

The service:
 1. Validates learner and simulation run existence.
 2. Extracts prediction and stateTrace from the simulation run.
 3. Delegates to apply_rules() (AI-1 pure function).
 4. Persists a MisconceptionSignal via the repository protocol.
 5. Builds the two-step replay headlines from KNOWN_EVIDENCE_KEYS.
 6. Returns a DiagnosisServiceResult value object — never raises HTTP errors.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any, Optional

from app.models.entities import MisconceptionSignal, SimulationRun, utc_now_iso
from app.repositories.base import DataRepositoryProtocol
from app.services.diagnosis.rules import BELL_VERIFIED_BEHAVIOR, DiagnosisResult, apply_rules

# ---------------------------------------------------------------------------
# Error sentinel codes returned to the router (never HTTP codes directly)
# ---------------------------------------------------------------------------

ERR_LEARNER_NOT_FOUND = "LEARNER_NOT_FOUND"
ERR_SIMULATION_RUN_NOT_FOUND = "SIMULATION_RUN_NOT_FOUND"
ERR_RUN_NOT_SUCCEEDED = "RUN_NOT_SUCCEEDED"
ERR_PREDICTION_MISSING = "PREDICTION_MISSING"
ERR_TRACE_INSUFFICIENT = "TRACE_INSUFFICIENT"

# ---------------------------------------------------------------------------
# Replay headlines (deterministic — no LLM)
# ---------------------------------------------------------------------------

# Maps a (MisconceptionCode, stepIndex) key to a static headline string.
# These are the two-step replay headlines defined in the flight-recorder contract
# and always cite the verified Bell state trace.
_REPLAY_HEADLINES: dict[tuple[str, int], str] = {
    ("SUPERPOSITION_VS_ENTANGLEMENT", 0): "Superposition created",
    ("SUPERPOSITION_VS_ENTANGLEMENT", 1): "Correlation introduced",
    ("MEASUREMENT_DETERMINISM", 0): "Superposition created",
    ("MEASUREMENT_DETERMINISM", 1): "Both outcomes have equal probability",
    ("GATE_ORDER", 0): "Hadamard gate creates superposition on qubit 0",
    ("GATE_ORDER", 1): "CNOT propagates qubit 0 branch to qubit 1",
    ("NO_SIGNAL", 0): "Superposition created",
}

_REPLAY_EVIDENCE_KEYS: dict[tuple[str, int], list[str]] = {
    ("SUPERPOSITION_VS_ENTANGLEMENT", 0): ["stateTrace.0.basisProbabilities"],
    ("SUPERPOSITION_VS_ENTANGLEMENT", 1): [
        "stateTrace.1.basisProbabilities",
        "stateTrace.1.reducedQubits",
    ],
    ("MEASUREMENT_DETERMINISM", 0): ["stateTrace.0.basisProbabilities"],
    ("MEASUREMENT_DETERMINISM", 1): [
        "stateTrace.1.basisProbabilities",
        "stateTrace.1.basisProbabilities.00",
        "stateTrace.1.basisProbabilities.11",
    ],
    ("GATE_ORDER", 0): [
        "stateTrace.0.basisProbabilities",
        "stateTrace.0.reducedQubits",
    ],
    ("GATE_ORDER", 1): ["stateTrace.1.basisProbabilities"],
    ("NO_SIGNAL", 0): ["stateTrace.0.basisProbabilities"],
}


def _build_replay(result: DiagnosisResult) -> list[dict[str, Any]]:
    """Build the two-step replay list for the contract response."""
    steps: list[dict[str, Any]] = []
    for idx in result.state_trace_step_indexes:
        key = (result.code, idx)
        headline = _REPLAY_HEADLINES.get(key, f"Step {idx}")
        evidence_keys = _REPLAY_EVIDENCE_KEYS.get(key, [f"stateTrace.{idx}.basisProbabilities"])
        steps.append(
            {
                "stepIndex": idx,
                "headline": headline,
                "evidenceKeys": evidence_keys,
            }
        )
    return steps


# ---------------------------------------------------------------------------
# Service result value object
# ---------------------------------------------------------------------------


@dataclass
class DiagnosisServiceResult:
    """Successful result from run_diagnosis().

    ok == True  → misconception_signal and replay are populated.
    ok == False → error_code is set; misconception_signal and replay are None.
    """

    ok: bool
    error_code: Optional[str] = None
    misconception_signal: Optional[MisconceptionSignal] = None
    replay: Optional[list[dict[str, Any]]] = None


# ---------------------------------------------------------------------------
# Public service function
# ---------------------------------------------------------------------------


async def run_diagnosis(
    learner_profile_id: str,
    simulation_run_id: str,
    repo: DataRepositoryProtocol,
) -> DiagnosisServiceResult:
    """Apply deterministic rules and persist a MisconceptionSignal.

    Parameters
    ----------
    learner_profile_id:
        ID of the learner whose run is being diagnosed.
    simulation_run_id:
        ID of the simulation run to diagnose.
    repo:
        Active DataRepositoryProtocol instance (injected by the router).

    Returns
    -------
    DiagnosisServiceResult
        .ok=True with misconception_signal + replay, or
        .ok=False with error_code set to one of the ERR_* sentinels.

    Notes
    -----
    - Zero LLM calls; all logic is deterministic.
    - Replay is idempotent: if a MisconceptionSignal already exists for this
      simulation_run_id, a new one is still created (multiple diagnoses are
      allowed in P0; deduplication is a P1+ concern).
    """

    # 1. Verify learner exists
    learner = await repo.get_learner_profile(learner_profile_id)
    if learner is None:
        return DiagnosisServiceResult(ok=False, error_code=ERR_LEARNER_NOT_FOUND)

    # 2. Verify simulation run exists
    sim_run: Optional[SimulationRun] = await repo.get_simulation_run(simulation_run_id)
    if sim_run is None:
        return DiagnosisServiceResult(ok=False, error_code=ERR_SIMULATION_RUN_NOT_FOUND)

    # 3. Run must be in SUCCEEDED state
    if sim_run.status != "SUCCEEDED":
        return DiagnosisServiceResult(ok=False, error_code=ERR_RUN_NOT_SUCCEEDED)

    # 4. Extract prediction from simulation run's predictionResponse
    prediction_response: Optional[dict[str, Any]] = sim_run.predictionResponse
    if not prediction_response:
        return DiagnosisServiceResult(ok=False, error_code=ERR_PREDICTION_MISSING)

    prediction_answer: Optional[str] = prediction_response.get("answer")
    # A missing or empty "answer" field is treated as PREDICTION_MISSING
    if not prediction_answer:
        return DiagnosisServiceResult(ok=False, error_code=ERR_PREDICTION_MISSING)

    # 5. Validate state trace sufficiency
    state_trace: list[dict[str, Any]] = sim_run.stateTrace or []
    if len(state_trace) < 1:
        return DiagnosisServiceResult(ok=False, error_code=ERR_TRACE_INSUFFICIENT)

    # 6. Apply deterministic rules (AI-1 pure function — no LLM)
    diagnosis: DiagnosisResult = apply_rules(prediction_answer, state_trace)

    # 7. Build MisconceptionSignal entity
    signal_id = f"ms_{uuid.uuid4().hex[:12]}"
    evidence = diagnosis.evidence_dict()
    # Enrich evidence with verified behavior from Bell trace
    evidence["verifiedBehavior"] = BELL_VERIFIED_BEHAVIOR

    signal = MisconceptionSignal(
        id=signal_id,
        learnerProfileId=learner_profile_id,
        simulationRunId=simulation_run_id,
        code=diagnosis.code,  # type: ignore[arg-type]
        firstDivergenceStep=diagnosis.first_divergence_step,
        evidence=evidence,
        confidence=diagnosis.confidence,
        repairChallengeId=diagnosis.repair_challenge_id or None,
        schemaVersion=1,
        createdAt=utc_now_iso(),
    )

    # 8. Persist via repository protocol
    persisted_signal = await repo.create_misconception_signal(signal)

    # 9. Build two-step replay headlines
    replay = _build_replay(diagnosis)

    return DiagnosisServiceResult(
        ok=True,
        misconception_signal=persisted_signal,
        replay=replay,
    )
