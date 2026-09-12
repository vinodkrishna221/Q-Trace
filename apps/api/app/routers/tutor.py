"""
Tutor Router — Q-Trace Evidence-Bound Tutor.
============================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-3
Contract: board/contracts/flight-recorder-tutor.md v1
"""

from __future__ import annotations

from typing import Any, Literal, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from app.repositories import get_repository
from app.services.tutor.badge import TutorBadge
from app.services.tutor.fallback import (
    SUPPORTED_INTENTS,
    get_curated_bell_explanation,
)
from app.services.tutor.recommendation import (
    ModuleRecommendationResponse,
    recommend_next_module,
)
from app.services.tutor.service import default_tutor_service
from app.services.tutor.validator import (
    EvidenceKeyValidationError,
    FabricatedClaimError,
)

router = APIRouter(prefix="/tutor", tags=["tutor"])

# QA Bell State Simulation Run contract fixture (used when live SIM-4 run is absent)
BELL_SIMULATION_RUN_FIXTURE: dict[str, Any] = {
    "id": "sr_demo_001",
    "learnerProfileId": "lp_aarav",
    "moduleId": "mod_bell",
    "circuitModelId": "cm_bell_seed",
    "adapter": "QISKIT_AER",
    "shots": 1024,
    "status": "SUCCEEDED",
    "probabilities": {"00": 0.5, "11": 0.5},
    "counts": {"00": 512, "11": 512},
    "stateTrace": [
        {
            "stepIndex": 0,
            "operationId": "op_1",
            "label": "After H",
            "basisProbabilities": {"00": 0.5, "10": 0.5},
            "amplitudes": {
                "00": {"re": 0.70710678, "im": 0.0},
                "10": {"re": 0.70710678, "im": 0.0},
            },
            "reducedQubits": [
                {
                    "qubit": 0,
                    "bloch": {"x": 1.0, "y": 0.0, "z": 0.0},
                    "purity": 1.0,
                    "label": "PURE_SUBSYSTEM",
                },
                {
                    "qubit": 1,
                    "bloch": {"x": 0.0, "y": 0.0, "z": 1.0},
                    "purity": 1.0,
                    "label": "PURE_SUBSYSTEM",
                },
            ],
        },
        {
            "stepIndex": 1,
            "operationId": "op_2",
            "label": "After CNOT",
            "basisProbabilities": {"00": 0.5, "11": 0.5},
            "amplitudes": {
                "00": {"re": 0.70710678, "im": 0.0},
                "11": {"re": 0.70710678, "im": 0.0},
            },
            "reducedQubits": [
                {
                    "qubit": 0,
                    "bloch": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "purity": 0.5,
                    "label": "MIXED_SUBSYSTEM",
                },
                {
                    "qubit": 1,
                    "bloch": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "purity": 0.5,
                    "label": "MIXED_SUBSYSTEM",
                },
            ],
        },
    ],
    "conformance": {
        "adapter": "PENNYLANE",
        "maxProbabilityDelta": 0.0,
        "epsilon": 0.000001,
        "passed": True,
        "skippedReason": None,
    },
    "durationMs": 84,
    "createdAt": "2026-08-23T05:27:00Z",
}

# QA Misconception Signal contract fixture (used when live AI-2 signal is absent)
BELL_MISCONCEPTION_SIGNAL_FIXTURE: dict[str, Any] = {
    "id": "ms_demo_001",
    "learnerProfileId": "lp_aarav",
    "simulationRunId": "sr_demo_001",
    "code": "SUPERPOSITION_VS_ENTANGLEMENT",
    "firstDivergenceStep": 1,
    "evidence": {
        "prediction": "INDEPENDENT_RANDOM",
        "verifiedBehavior": "CORRELATED_00_11",
        "stateTraceStepIndexes": [0, 1],
    },
    "confidence": 1.0,
    "repairChallengeId": "ch_bell_repair",
    "createdAt": "2026-08-23T05:27:01Z",
}


class TutorExplainRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    learnerProfileId: str
    moduleId: str
    simulationRunId: str
    misconceptionSignalId: str
    intent: str
    learnerQuestion: Optional[str] = Field(default=None, max_length=500)
    learnerRole: Optional[str] = None


class TutorStep(BaseModel):
    title: str
    body: str
    evidenceKeys: list[str]


class NumericalClaim(BaseModel):
    claim: str
    evidenceKey: str


class TutorResponsePayload(BaseModel):
    responseId: str
    intent: str
    summary: str
    steps: list[TutorStep]
    numericalClaims: list[NumericalClaim]
    repairChallengeId: str
    fallbackUsed: bool = True
    model: str = "DEMO_FALLBACK"
    safetyNote: str
    badge: Optional[TutorBadge] = None


class TutorExplainResponse(BaseModel):
    tutorResponse: TutorResponsePayload


@router.post("/explain", response_model=TutorExplainResponse, status_code=status.HTTP_200_OK)
async def explain_divergence(request: TutorExplainRequest) -> TutorExplainResponse:
    """POST /v1/tutor/explain
    
    Generates an evidence-grounded explanation for a learner's divergence.
    Never persists free-form question or answer text.
    """
    # 1. Validate intent
    if request.intent not in SUPPORTED_INTENTS:
        raise HTTPException(
            status_code=422,
            detail=f"INTENT_UNSUPPORTED: Intent '{request.intent}' is not supported.",
        )

    # 2. Check learner question length (guaranteed by pydantic, but explicit check)
    if request.learnerQuestion and len(request.learnerQuestion) > 500:
        raise HTTPException(
            status_code=422,
            detail="LEARNER_QUESTION_TOO_LONG: Question must not exceed 500 characters.",
        )

    repo = get_repository()

    # 3. Retrieve and verify learner profile
    learner = await repo.get_learner_profile(request.learnerProfileId)
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"EVIDENCE_NOT_FOUND: Learner profile '{request.learnerProfileId}' not found.",
        )

    # 4. Retrieve simulation run evidence
    sim_run = await repo.get_simulation_run(request.simulationRunId)
    state_trace: list[dict[str, Any]]

    if sim_run:
        state_trace = sim_run.stateTrace
    elif request.simulationRunId == BELL_SIMULATION_RUN_FIXTURE["id"]:
        # Mock path fallback: use QA contract fixture
        state_trace = BELL_SIMULATION_RUN_FIXTURE["stateTrace"]
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"EVIDENCE_NOT_FOUND: Simulation run '{request.simulationRunId}' not found.",
        )

    # 5. Retrieve misconception signal or use mock fixture
    signal = await repo.get_misconception_signal(request.misconceptionSignalId)
    misconception_code = "SUPERPOSITION_VS_ENTANGLEMENT"
    prediction = None
    verified_behavior = None
    first_divergence_step = None

    if signal:
        misconception_code = signal.code
        if hasattr(signal, "evidence") and isinstance(signal.evidence, dict):
            prediction = signal.evidence.get("prediction")
            verified_behavior = signal.evidence.get("verifiedBehavior")
        first_divergence_step = getattr(signal, "firstDivergenceStep", None)
    elif request.misconceptionSignalId == BELL_MISCONCEPTION_SIGNAL_FIXTURE["id"]:
        misconception_code = BELL_MISCONCEPTION_SIGNAL_FIXTURE["code"]
        prediction = BELL_MISCONCEPTION_SIGNAL_FIXTURE["evidence"]["prediction"]
        verified_behavior = BELL_MISCONCEPTION_SIGNAL_FIXTURE["evidence"]["verifiedBehavior"]
        first_divergence_step = BELL_MISCONCEPTION_SIGNAL_FIXTURE["firstDivergenceStep"]

    # 6. Generate explanation with verified evidence validation and fallback protection
    learner_role = request.learnerRole
    if not learner_role and learner:
        learner_role = getattr(learner, "role", None)

    try:
        explanation = await default_tutor_service.generate_explanation(
            state_trace=state_trace,
            learner_profile_id=request.learnerProfileId,
            module_id=request.moduleId,
            misconception_code=misconception_code,
            intent=request.intent,
            learner_question=request.learnerQuestion,
            prediction=prediction,
            verified_behavior=verified_behavior,
            first_divergence_step=first_divergence_step,
            learner_role=learner_role,
        )
    except (EvidenceKeyValidationError, FabricatedClaimError) as err:
        raise HTTPException(
            status_code=422,
            detail=f"EVIDENCE_KEY_INVALID: {err}",
        )

    # 7. Strictly DO NOT persist free-form learnerQuestion or explanation
    return TutorExplainResponse(tutorResponse=TutorResponsePayload(**explanation))


class TutorRecommendModuleRequest(BaseModel):
    """Request schema for deterministic next module recommendation."""

    learnerProfileId: str
    passed: bool
    misconceptionCode: Optional[str] = None
    currentModuleId: Optional[str] = None
    challengeId: Optional[str] = None
    learnerRole: Optional[str] = None


class TutorRecommendModuleResponse(BaseModel):
    """Response schema wrapping ModuleRecommendationResponse."""

    recommendation: ModuleRecommendationResponse


@router.post(
    "/recommend-module",
    response_model=TutorRecommendModuleResponse,
    status_code=status.HTTP_200_OK,
)
async def recommend_module_endpoint(
    request: TutorRecommendModuleRequest,
) -> TutorRecommendModuleResponse:
    """POST /v1/tutor/recommend-module
    
    Recommends the next module deterministically based on verified challenge outcomes
    and misconception signal.
    """
    repo = get_repository()
    learner = await repo.get_learner_profile(request.learnerProfileId)
    role = request.learnerRole
    if not role and learner:
        role = getattr(learner, "role", None)

    rec = recommend_next_module(
        passed=request.passed,
        misconception_code=request.misconceptionCode,
        current_module_id=request.currentModuleId,
        challenge_id=request.challengeId,
        learner_role=role,
    )

    return TutorRecommendModuleResponse(
        recommendation=ModuleRecommendationResponse(
            nextModuleId=rec.nextModuleId,
            recommendationReason=rec.recommendationReason,
            remedial=rec.remedial,
            targetMisconceptionCode=rec.targetMisconceptionCode,
            confidence=rec.confidence,
            featureFlagActive=rec.featureFlagActive,
            rulesVersion=rec.rulesVersion,
        )
    )


class ChatMessagePayload(BaseModel):
    role: str
    content: str


class TutorChatRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    learnerProfileId: str
    question: str = Field(..., max_length=1000)
    moduleId: str = "mod_bell"
    history: list[ChatMessagePayload] = []
    circuit: Optional[dict[str, Any]] = None
    prediction: Optional[str] = None
    stateTrace: Optional[list[dict[str, Any]]] = None
    misconceptionCode: Optional[str] = None
    learnerRole: Optional[str] = None


class TutorChatResponse(BaseModel):
    answer: str
    model: str
    fallbackUsed: bool
    groundedEvidenceKeys: list[str]


@router.post("/chat", response_model=TutorChatResponse, status_code=status.HTTP_200_OK)
async def tutor_chat_endpoint(request: TutorChatRequest) -> TutorChatResponse:
    """POST /v1/tutor/chat
    
    Interactive Socratic follow-up Q&A grounded in circuit and simulation evidence.
    """
    history_dicts = [{"role": m.role, "content": m.content} for m in request.history]
    result = await default_tutor_service.chat_with_tutor(
        learner_profile_id=request.learnerProfileId,
        question=request.question,
        history=history_dicts,
        circuit=request.circuit,
        prediction=request.prediction,
        state_trace=request.stateTrace,
        misconception_code=request.misconceptionCode,
        learner_role=request.learnerRole,
        module_id=request.moduleId,
    )
    return TutorChatResponse(**result)


