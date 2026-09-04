"""Progress and challenge attempt router for Q-Trace.

Endpoints:
- GET /v1/challenges/{challengeId}
- POST /v1/challenge-attempts
- GET /v1/progress-records/{learnerProfileId}
"""

from typing import Any, Optional
import uuid
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from app.models.entities import ChallengeAttempt, SkillState, utc_now_iso
from app.repositories import DataRepositoryProtocol, get_repository

router = APIRouter(tags=["progress"])

# In-memory idempotency cache for deduplication
_idempotency_cache: dict[str, dict[str, Any]] = {}


class ChallengeAttemptRequest(BaseModel):
    """Payload for submitting a challenge attempt."""

    model_config = ConfigDict(extra="ignore")
    challengeId: str
    learnerProfileId: str
    submittedAnswer: dict[str, Any] = Field(default_factory=dict)
    simulationRunId: Optional[str] = None


@router.get("/challenges/{challenge_id}")
async def get_challenge(
    challenge_id: str,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """Retrieve a challenge by its ID."""
    challenge = await repo.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CHALLENGE_NOT_FOUND",
                "message": f"Challenge '{challenge_id}' not found",
            },
        )
    return {"challenge": challenge.model_dump()}


@router.post(
    "/challenge-attempts",
    status_code=status.HTTP_201_CREATED,
)
async def post_challenge_attempt(
    request: ChallengeAttemptRequest,
    idempotency_key: Optional[str] = Header(default=None, alias="Idempotency-Key"),
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """Submit a challenge attempt and atomically update learner progress."""
    # 1. Idempotency check
    if idempotency_key and idempotency_key in _idempotency_cache:
        return _idempotency_cache[idempotency_key]

    # 2. Challenge & Learner existence checks
    challenge = await repo.get_challenge(request.challengeId)
    if not challenge:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CHALLENGE_NOT_FOUND",
                "message": f"Challenge '{request.challengeId}' not found",
            },
        )

    learner = await repo.get_learner_profile(request.learnerProfileId)
    if not learner:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "LEARNER_NOT_FOUND",
                "message": f"Learner '{request.learnerProfileId}' not found",
            },
        )

    # 3. Simulation run verification (if referenced)
    simulation_run = None
    if request.simulationRunId:
        simulation_run = await repo.get_simulation_run(request.simulationRunId)
        if not simulation_run:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "SIMULATION_RUN_NOT_FOUND",
                    "message": f"Simulation run '{request.simulationRunId}' not found",
                },
            )
        if simulation_run.status != "SUCCEEDED":
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "RUN_NOT_SUCCEEDED",
                    "message": f"Simulation run '{request.simulationRunId}' has status '{simulation_run.status}'",
                },
            )

    # 4. Deterministic grading evaluation
    passed = False
    score = 0
    feedback_code = ""

    if challenge.type == "CIRCUIT_REPAIR":
        rule = challenge.acceptanceRule
        if rule.get("kind") == "PROBABILITY_SUPPORT_EQUALS":
            required_states = set(rule.get("states", ["00", "11"]))
            epsilon = float(rule.get("epsilon", 1e-6))
            if not simulation_run:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "code": "ACCEPTANCE_EVIDENCE_INVALID",
                        "message": "Circuit repair requires a valid succeeded simulationRunId",
                    },
                )
            probs = simulation_run.probabilities
            has_required = all(probs.get(s, 0.0) > epsilon for s in required_states)
            extraneous = [
                s
                for s, p in probs.items()
                if s not in required_states and p > epsilon
            ]
            if has_required and not extraneous:
                passed = True
                score = challenge.points
                feedback_code = "BELL_SUPPORT_CORRECT"
            else:
                passed = False
                score = 0
                feedback_code = "BELL_SUPPORT_INCORRECT"
        else:
            passed = True
            score = challenge.points
            feedback_code = "CHALLENGE_PASSED"

    elif challenge.type == "QUIZ":
        rule = challenge.acceptanceRule
        correct_choice = rule.get("correctChoice")
        selected_choice = request.submittedAnswer.get("choice") or request.submittedAnswer.get(
            "selectedOption"
        )
        if correct_choice and selected_choice == correct_choice:
            passed = True
            score = challenge.points
            feedback_code = "QUIZ_CORRECT"
        else:
            passed = False
            score = 0
            feedback_code = "QUIZ_INCORRECT"
    else:
        passed = True
        score = challenge.points
        feedback_code = "ATTEMPT_RECORDED"

    # 5. Compute attempt number and create entity
    attempt_number = await repo.get_next_attempt_number(
        request.learnerProfileId, request.challengeId
    )
    attempt_id = f"ca_{uuid.uuid4().hex[:8]}"

    attempt = ChallengeAttempt(
        id=attempt_id,
        challengeId=challenge.id,
        learnerProfileId=learner.id,
        simulationRunId=request.simulationRunId,
        submittedAnswer=request.submittedAnswer,
        passed=passed,
        score=score,
        feedbackCode=feedback_code,
        attemptNumber=attempt_number,
        schemaVersion=1,
        createdAt=utc_now_iso(),
    )

    # 6. Prepare atomic updates
    completed_module_id = challenge.moduleId if passed else None
    updated_skills = None
    if passed and challenge.id == "ch_bell_repair":
        updated_skills = [
            SkillState(skillId="skill_create_bell", status="MASTERED", score=100),
            SkillState(skillId="skill_explain_correlation", status="PRACTICING", score=70),
        ]

    saved_attempt, updated_progress = await repo.record_attempt_and_update_progress(
        attempt=attempt,
        points_earned=score if passed else 0,
        completed_module_id=completed_module_id,
        updated_skills=updated_skills,
        misconception_code=None,
    )

    response_data = {
        "challengeAttempt": saved_attempt.model_dump(),
        "progressRecord": updated_progress.model_dump(),
    }

    # 7. Cache idempotency result
    if idempotency_key:
        _idempotency_cache[idempotency_key] = response_data

    return response_data


@router.get("/progress-records/{learner_profile_id}")
async def get_progress_record(
    learner_profile_id: str,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """Retrieve the progress record for a learner."""
    learner = await repo.get_learner_profile(learner_profile_id)
    if not learner:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "LEARNER_NOT_FOUND",
                "message": f"Learner '{learner_profile_id}' not found",
            },
        )

    progress = await repo.get_progress_record_by_learner(learner_profile_id)
    if not progress:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "PROGRESS_RECORD_NOT_FOUND",
                "message": f"Progress record for learner '{learner_profile_id}' not found",
            },
        )

    return progress.model_dump()
