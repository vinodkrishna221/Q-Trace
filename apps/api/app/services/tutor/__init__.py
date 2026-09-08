"""Q-Trace Tutor service package."""

from app.services.tutor.fallback import (
    SUPPORTED_INTENTS,
    get_curated_bell_explanation,
    select_repair_challenge,
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
    "EvidenceKeyValidationError",
    "FabricatedClaimError",
    "SUPPORTED_INTENTS",
    "extract_claimed_value",
    "get_curated_bell_explanation",
    "resolve_evidence_key",
    "select_repair_challenge",
    "validate_numerical_claim",
    "validate_tutor_response_evidence",
]
