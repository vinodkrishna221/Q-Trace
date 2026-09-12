"""Q-Trace Tutor service package."""

from app.services.tutor.adapter import (
    BaseTutorProvider,
    CloudTutorProvider,
    FakeTutorProvider,
    TutorAuthError,
    TutorMalformedOutputError,
    TutorProviderError,
    TutorRateLimitError,
    TutorTimeoutError,
    get_tutor_provider,
)
from app.services.tutor.badge import TutorBadge, compute_tutor_badge
from app.services.tutor.drill import (
    DrillStepReport,
    DrillSummary,
    run_tutor_resilience_drill,
)
from app.services.tutor.fallback import (
    SUPPORTED_INTENTS,
    get_curated_bell_explanation,
    select_repair_challenge,
)
from app.services.tutor.parity import (
    PARITY_FIXTURES,
    ParityCheckResult,
    extract_cited_step_indexes,
    verify_cloud_fallback_parity,
)
from app.services.tutor.pedagogy_qa import (
    JUDGE_TECHNICAL_ANSWERS,
    JudgeTechnicalAnswer,
    get_all_judge_answers,
    get_judge_answer,
)
from app.services.tutor.recommendation import (
    KNOWN_MODULE_IDS,
    ModuleRecommendation,
    ModuleRecommendationResponse,
    enrich_progress_record_with_recommendation,
    is_recommendation_feature_enabled,
    recommend_next_module,
)
from app.services.tutor.schemas import (
    NumericalClaim,
    StructuredTutorResponse,
    TutorStep,
)
from app.services.tutor.service import (
    TutorService,
    default_tutor_service,
    extract_available_evidence_keys,
)
from app.services.tutor.telemetry import TelemetryBuffer, TelemetryEvent, telemetry
from app.services.tutor.validator import (
    EvidenceKeyValidationError,
    FabricatedClaimError,
    extract_claimed_value,
    resolve_evidence_key,
    validate_numerical_claim,
    validate_tutor_response_evidence,
)

__all__ = [
    "BaseTutorProvider",
    "CloudTutorProvider",
    "DrillStepReport",
    "DrillSummary",
    "EvidenceKeyValidationError",
    "FabricatedClaimError",
    "FakeTutorProvider",
    "JUDGE_TECHNICAL_ANSWERS",
    "JudgeTechnicalAnswer",
    "KNOWN_MODULE_IDS",
    "ModuleRecommendation",
    "ModuleRecommendationResponse",
    "NumericalClaim",
    "PARITY_FIXTURES",
    "ParityCheckResult",
    "SUPPORTED_INTENTS",
    "StructuredTutorResponse",
    "TelemetryBuffer",
    "TelemetryEvent",
    "TutorBadge",
    "TutorAuthError",
    "TutorMalformedOutputError",
    "TutorProviderError",
    "TutorRateLimitError",
    "TutorService",
    "TutorStep",
    "TutorTimeoutError",
    "compute_tutor_badge",
    "default_tutor_service",
    "enrich_progress_record_with_recommendation",
    "extract_available_evidence_keys",
    "extract_claimed_value",
    "extract_cited_step_indexes",
    "get_all_judge_answers",
    "get_curated_bell_explanation",
    "get_judge_answer",
    "get_tutor_provider",
    "is_recommendation_feature_enabled",
    "recommend_next_module",
    "resolve_evidence_key",
    "run_tutor_resilience_drill",
    "select_repair_challenge",
    "telemetry",
    "validate_numerical_claim",
    "validate_tutor_response_evidence",
    "verify_cloud_fallback_parity",
]
