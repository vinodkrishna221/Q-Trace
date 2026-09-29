"""Grading router for /v1/grading endpoints (FEA-6).

Implements:
  POST /v1/grading/assess             -> 200 AssessResponse
  GET  /v1/grading/assess/{attemptId} -> 200 AssessResponse
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request

from app.models.entities import ChallengeAttempt
from app.repositories import get_repository
from app.repositories.base import DataRepositoryProtocol
from app.services.grading.socratic_engine import (
    AssessRequest,
    AssessResponse,
    assess_circuit,
    get_saved_assessment,
    get_target_circuit_for_challenge,
    store_saved_assessment,
)

router = APIRouter(prefix="/v1/grading", tags=["grading"])


@router.post(
    "/assess",
    status_code=200,
    response_model=AssessResponse,
)
async def assess_submission(
    body: AssessRequest,
    request: Request,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> AssessResponse:
    """Evaluate a learner's submitted circuit against a challenge target using Socratic invariants."""
    request_id: str = getattr(request.state, "request_id", "req_unknown")

    # 1. Validate challenge existence
    challenge = await repo.get_challenge(body.challengeId)
    known_mutation_challenges = {
        "CH_BELL_ENTANGLE",
        "CH_PHASE_SUPER",
        "CH_GROVER_2Q",
        "CH_UNITARY_REV",
        "CH_BELL_PSI_PLUS",
        "CH_BELL_REPAIR",
    }
    if not challenge and body.challengeId.upper() not in known_mutation_challenges:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CHALLENGE_NOT_FOUND",
                "message": f"Challenge '{body.challengeId}' not found.",
                "requestId": request_id,
            },
        )

    # 2. Run deterministic invariant evaluation
    target = body.targetCircuitModel or get_target_circuit_for_challenge(body.challengeId)
    assessment = assess_circuit(
        student_circuit=body.circuitModel,
        challenge_id=body.challengeId,
        learner_id=body.learnerId,
        target_circuit=target,
    )

    # 3. Best-effort persistence into repository
    try:
        attempt_number = await repo.get_next_attempt_number(body.learnerId, body.challengeId)
        attempt_record = ChallengeAttempt(
            id=assessment.attemptId,
            challengeId=body.challengeId,
            learnerProfileId=body.learnerId,
            submittedAnswer={
                "type": "CIRCUIT_MODEL",
                "circuitModel": body.circuitModel.model_dump(),
                "assessment": assessment.model_dump(),
            },
            passed=assessment.passed,
            score=100 if assessment.passed else 0,
            feedbackCode="SOCRATIC_INVARIANT_PASS" if assessment.passed else f"FAILED_{assessment.invariantsChecked[0].invariant}",
            attemptNumber=attempt_number,
        )
        await repo.create_challenge_attempt(attempt_record)
    except Exception:
        # Memory or fallback store already holds assessment
        pass

    return assessment


@router.get(
    "/assess/{attempt_id}",
    status_code=200,
    response_model=AssessResponse,
)
async def get_assessment(
    attempt_id: str,
    request: Request,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> AssessResponse:
    """Retrieve an assessment result by attemptId."""
    request_id: str = getattr(request.state, "request_id", "req_unknown")

    # Check cache first
    cached = get_saved_assessment(attempt_id)
    if cached:
        return cached

    # Check repository attempt
    attempt = await repo.get_challenge_attempt(attempt_id)
    if attempt and "assessment" in attempt.submittedAnswer:
        try:
            res = AssessResponse(**attempt.submittedAnswer["assessment"])
            store_saved_assessment(res)
            return res
        except Exception:
            pass

    raise HTTPException(
        status_code=404,
        detail={
            "code": "ASSESSMENT_NOT_FOUND",
            "message": f"Assessment attempt '{attempt_id}' not found.",
            "requestId": request_id,
        },
    )
