"""Q-Trace Tutor service package."""

from app.services.tutor.adapter import (
    BaseTutorProvider,
    CloudTutorProvider,
    FakeTutorProvider,
    TutorMalformedOutputError,
    TutorProviderError,
    TutorRateLimitError,
    TutorTimeoutError,
    get_tutor_provider,
)
from app.services.tutor.fallback import (
    SUPPORTED_INTENTS,
    get_curated_bell_explanation,
    select_repair_challenge,
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
    "EvidenceKeyValidationError",
    "FabricatedClaimError",
    "FakeTutorProvider",
    "NumericalClaim",
    "SUPPORTED_INTENTS",
    "StructuredTutorResponse",
    "TutorMalformedOutputError",
    "TutorProviderError",
    "TutorRateLimitError",
    "TutorService",
    "TutorStep",
    "TutorTimeoutError",
    "default_tutor_service",
    "extract_available_evidence_keys",
    "extract_claimed_value",
    "get_curated_bell_explanation",
    "get_tutor_provider",
    "resolve_evidence_key",
    "select_repair_challenge",
    "validate_numerical_claim",
    "validate_tutor_response_evidence",
]
