"""
AI-7 — Recommend Next Module From Verified Outcomes
=====================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-7
Branch:  feat/ai-pedagogy/ai-7-recommend-the-next-module-from
Version: 1
Contracts consumed: board/contracts/learning-content.md v1
                    board/contracts/progress-analytics.md v1
Contract owned:    board/contracts/flight-recorder-tutor.md v1

Key Requirements (AI-7):
1. Small deterministic rules table mapping Challenge outcome (passed/failed) +
   latest Misconception Signal (SUPERPOSITION_VS_ENTANGLEMENT, MEASUREMENT_DETERMINISM,
   GATE_ORDER, NO_SIGNAL) to the next Module and pedagogical recommendation reason.
2. Returns ONLY known Module IDs from learning-content.md v1:
   - mod_superposition
   - mod_measurement
   - mod_bell
3. Learner-level tailored copy for both demo personas:
   - Aarav (BEGINNER_CSE): code, observable frequencies, step order, accessible intuition.
   - Meera (PHYSICS_TO_CODE): formal Hilbert space, state vectors, Born's rule, tensor products.
4. Deterministic and safe:
   - Zero LLM calls; pure deterministic rules table.
   - Robust handling of edge cases, unknown inputs, missing signals, and None values.
   - Feature flag (ENABLE_AI_RECOMMENDATION) to enable/disable or fallback to linear progression.
   - Exposable through progress enrichment or dedicated Tutor router endpoint.
"""

from __future__ import annotations

from dataclasses import dataclass
import os
from typing import Any, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Version & Vocabulary
# ---------------------------------------------------------------------------

RULES_VERSION: int = 1

KNOWN_MODULE_IDS: frozenset[str] = frozenset(
    {
        "mod_superposition",
        "mod_measurement",
        "mod_bell",
    }
)

DEFAULT_MODULE_ID: str = "mod_bell"

MODULE_METADATA: dict[str, dict[str, str]] = {
    "mod_superposition": {
        "id": "mod_superposition",
        "slug": "superposition",
        "title": "Qubits and Superposition",
        "nextLinear": "mod_measurement",
    },
    "mod_measurement": {
        "id": "mod_measurement",
        "slug": "measurement",
        "title": "Measurement and Probability",
        "nextLinear": "mod_bell",
    },
    "mod_bell": {
        "id": "mod_bell",
        "slug": "bell-state",
        "title": "From Superposition to Bell Correlation",
        "nextLinear": "mod_bell",
    },
}

CHALLENGE_TO_MODULE: dict[str, str] = {
    "ch_superposition_quiz": "mod_superposition",
    "ch_measurement_quiz": "mod_measurement",
    "ch_bell_quiz": "mod_bell",
    "ch_bell_repair": "mod_bell",
}

LearnerRole = Literal["BEGINNER_CSE", "PHYSICS_TO_CODE"]
DEFAULT_LEARNER_ROLE: LearnerRole = "BEGINNER_CSE"


def normalize_learner_role(role: Optional[str]) -> LearnerRole:
    """Normalize learner role string safely to known literal."""
    if role and str(role).strip().upper() == "PHYSICS_TO_CODE":
        return "PHYSICS_TO_CODE"
    return "BEGINNER_CSE"


def normalize_module_id(module_id: Optional[str], challenge_id: Optional[str] = None) -> str:
    """Ensure the module ID is known; resolve from challenge or fall back to default."""
    if module_id and module_id in KNOWN_MODULE_IDS:
        return module_id
    if challenge_id and challenge_id in CHALLENGE_TO_MODULE:
        return CHALLENGE_TO_MODULE[challenge_id]
    return DEFAULT_MODULE_ID


# ---------------------------------------------------------------------------
# Data Schemas
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ModuleRecommendation:
    """Deterministic recommendation outcome data."""

    nextModuleId: str
    recommendationReason: str
    remedial: bool
    targetMisconceptionCode: Optional[str] = None
    confidence: float = 1.0
    featureFlagActive: bool = True
    rulesVersion: int = RULES_VERSION

    def __post_init__(self) -> None:
        if self.nextModuleId not in KNOWN_MODULE_IDS:
            raise ValueError(
                f"nextModuleId '{self.nextModuleId}' must be in KNOWN_MODULE_IDS: {KNOWN_MODULE_IDS}"
            )


class ModuleRecommendationResponse(BaseModel):
    """Pydantic schema for serialization and API responses."""

    model_config = ConfigDict(extra="ignore")

    nextModuleId: str = Field(
        ...,
        description="Recommended next module ID from vetted learning-content contract",
    )
    recommendationReason: str = Field(
        ...,
        description="Deterministic pedagogical explanation for the recommendation",
    )
    remedial: bool = Field(
        ...,
        description="True if the recommendation reviews prior concepts following divergence/failure",
    )
    targetMisconceptionCode: Optional[str] = Field(
        default=None,
        description="Target misconception code addressed by this recommendation, if any",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Recommendation confidence score",
    )
    featureFlagActive: bool = Field(
        default=True,
        description="Whether dynamic pedagogical recommendation feature flag is active",
    )
    rulesVersion: int = Field(
        default=RULES_VERSION,
        description="Version of the recommendation rules table",
    )


# ---------------------------------------------------------------------------
# Feature Flagging
# ---------------------------------------------------------------------------


def is_recommendation_feature_enabled() -> bool:
    """Check whether dynamic AI module recommendation is enabled via environment flag.
    
    Default is True (1). Can be toggled with ENABLE_AI_RECOMMENDATION=0.
    """
    flag = os.getenv("ENABLE_AI_RECOMMENDATION", "1").strip().lower()
    return flag not in ("0", "false", "no", "off")


# ---------------------------------------------------------------------------
# Pedagogical Copy Tables (Deterministic by Misconception & Role)
# ---------------------------------------------------------------------------

REMEDIAL_COPY: dict[str, dict[LearnerRole, str]] = {
    "SUPERPOSITION_VS_ENTANGLEMENT": {
        "BEGINNER_CSE": (
            "Review single-qubit superposition: verify why individual random qubits differ from "
            "correlated two-qubit pairs before re-attempting the Bell repair."
        ),
        "PHYSICS_TO_CODE": (
            "Review single-qubit superposition and tensor product factorization: an entangled Bell state "
            "cannot be decomposed into separable product states |ψA⟩ ⊗ |ψB⟩."
        ),
    },
    "MEASUREMENT_DETERMINISM": {
        "BEGINNER_CSE": (
            "Review measurement and probability: computational basis measurement yields probabilistic "
            "outcomes with verified frequencies, not fixed deterministic states."
        ),
        "PHYSICS_TO_CODE": (
            "Review projective measurement: Born's rule defines outcome probabilities via projection "
            "operators P_m = |m⟩⟨m|, yielding non-deterministic state reduction."
        ),
    },
    "GATE_ORDER": {
        "BEGINNER_CSE": (
            "Revisit gate ordering in Bell state generation: the Hadamard gate must execute first on qubit 0 "
            "before CNOT can entangle qubit 1."
        ),
        "PHYSICS_TO_CODE": (
            "Review operator sequencing: gate operations are non-commutative; CNOT · (H ⊗ I) synthesizes "
            "the Bell basis, whereas (H ⊗ I) · CNOT on |00⟩ produces an unentangled state."
        ),
    },
    "NO_SIGNAL": {
        "BEGINNER_CSE": (
            "Re-examine the simulation state trace and repair prompt to identify where your circuit "
            "output diverged from target probabilities."
        ),
        "PHYSICS_TO_CODE": (
            "Inspect the state vector amplitudes across each operation step before submitting your next "
            "repair attempt."
        ),
    },
}

ADVANCEMENT_COPY: dict[str, dict[LearnerRole, str]] = {
    "mod_superposition": {
        "BEGINNER_CSE": (
            "Superposition mastered. Advance to measurement and probability collapse to understand "
            "measurement mechanics."
        ),
        "PHYSICS_TO_CODE": (
            "Single-qubit superposition confirmed. Advance to projective measurement formalism and Born's rule."
        ),
    },
    "mod_measurement": {
        "BEGINNER_CSE": (
            "Measurement principles verified. Advance to the Bell-state lab to correlate two qubits into an "
            "entangled state."
        ),
        "PHYSICS_TO_CODE": (
            "Measurement collapse verified. Advance to two-qubit entangled states and non-local Bell correlations."
        ),
    },
    "mod_bell": {
        "BEGINNER_CSE": (
            "Bell-state challenge complete! You have mastered all foundation quantum circuit modules in Q-Trace."
        ),
        "PHYSICS_TO_CODE": (
            "Bell correlation verified. Foundations pathway completed; ready for intermediate multi-qubit algorithms."
        ),
    },
}

REPAIRED_BELL_COPY: dict[LearnerRole, str] = {
    "BEGINNER_CSE": (
        "Bell correlation repaired! You successfully distinguished superposition from entanglement and "
        "verified target Bell support."
    ),
    "PHYSICS_TO_CODE": (
        "Bell state restored. You verified that non-factorable entanglement produces correlated measurement statistics."
    ),
}


# ---------------------------------------------------------------------------
# Core Pure Recommendation Engine
# ---------------------------------------------------------------------------


def recommend_next_module(
    *,
    passed: bool,
    misconception_code: Optional[str] = None,
    current_module_id: Optional[str] = None,
    challenge_id: Optional[str] = None,
    learner_role: Optional[str] = None,
    completed_module_ids: Optional[list[str]] = None,
    force_feature_flag: Optional[bool] = None,
) -> ModuleRecommendation:
    """Recommend the next module and reason based on verified challenge outcomes and misconception signals.
    
    Parameters:
    - passed: Boolean indicating whether the learner passed or failed the challenge attempt.
    - misconception_code: Optional diagnosis code ('SUPERPOSITION_VS_ENTANGLEMENT', 'MEASUREMENT_DETERMINISM',
                          'GATE_ORDER', 'NO_SIGNAL', or None).
    - current_module_id: The ID of the module the learner is currently in.
    - challenge_id: The ID of the challenge attempted (used to infer module if missing).
    - learner_role: 'BEGINNER_CSE' (Aarav) or 'PHYSICS_TO_CODE' (Meera).
    - completed_module_ids: List of module IDs already completed.
    - force_feature_flag: Optional override for the feature flag (useful in testing).
    
    Returns:
    - ModuleRecommendation with nextModuleId guaranteed to be in KNOWN_MODULE_IDS.
    """
    feature_active = (
        force_feature_flag
        if force_feature_flag is not None
        else is_recommendation_feature_enabled()
    )

    role = normalize_learner_role(learner_role)
    current_mod = normalize_module_id(current_module_id, challenge_id)
    norm_code = str(misconception_code).strip() if misconception_code else "NO_SIGNAL"

    # If feature flag is explicitly off, provide baseline linear progression
    if not feature_active:
        linear_next = MODULE_METADATA.get(current_mod, {}).get("nextLinear", DEFAULT_MODULE_ID)
        if linear_next not in KNOWN_MODULE_IDS:
            linear_next = DEFAULT_MODULE_ID
        return ModuleRecommendation(
            nextModuleId=linear_next,
            recommendationReason=f"Standard curriculum progression for module {current_mod}.",
            remedial=False,
            targetMisconceptionCode=None,
            confidence=0.5,
            featureFlagActive=False,
            rulesVersion=RULES_VERSION,
        )

    # -----------------------------------------------------------------------
    # Case 1: Challenge Failed (Remedial Pedagogical Recommendation)
    # -----------------------------------------------------------------------
    if not passed:
        if norm_code == "SUPERPOSITION_VS_ENTANGLEMENT":
            # Conflated superposition and entanglement -> remediate by reviewing single-qubit superposition
            next_mod = "mod_superposition"
            reason = REMEDIAL_COPY["SUPERPOSITION_VS_ENTANGLEMENT"][role]
            target_code = "SUPERPOSITION_VS_ENTANGLEMENT"
            confidence = 1.0

        elif norm_code == "MEASUREMENT_DETERMINISM":
            # Conflated measurement with determinism -> remediate by reviewing measurement
            next_mod = "mod_measurement"
            reason = REMEDIAL_COPY["MEASUREMENT_DETERMINISM"][role]
            target_code = "MEASUREMENT_DETERMINISM"
            confidence = 1.0

        elif norm_code == "GATE_ORDER":
            # Gate sequence issue in Bell circuit -> stay on Bell module to fix gate ordering
            next_mod = "mod_bell"
            reason = REMEDIAL_COPY["GATE_ORDER"][role]
            target_code = "GATE_ORDER"
            confidence = 1.0

        else:
            # NO_SIGNAL or unspecified failure -> remain on current module to review trace
            next_mod = current_mod
            reason = REMEDIAL_COPY["NO_SIGNAL"][role]
            target_code = None if norm_code == "NO_SIGNAL" else norm_code
            confidence = 0.9

        # Invariant safety check
        if next_mod not in KNOWN_MODULE_IDS:
            next_mod = DEFAULT_MODULE_ID

        return ModuleRecommendation(
            nextModuleId=next_mod,
            recommendationReason=reason,
            remedial=True,
            targetMisconceptionCode=target_code,
            confidence=confidence,
            featureFlagActive=True,
            rulesVersion=RULES_VERSION,
        )

    # -----------------------------------------------------------------------
    # Case 2: Challenge Passed (Advancement Recommendation)
    # -----------------------------------------------------------------------
    # If the learner just solved the Bell repair after a misconception
    if current_mod == "mod_bell" and norm_code == "SUPERPOSITION_VS_ENTANGLEMENT":
        next_mod = "mod_bell"
        reason = REPAIRED_BELL_COPY[role]
        target_code = norm_code
        confidence = 1.0
    else:
        adv_info = ADVANCEMENT_COPY.get(current_mod, ADVANCEMENT_COPY["mod_bell"])
        reason = adv_info[role]
        target_code = None
        confidence = 1.0

        if current_mod == "mod_superposition":
            next_mod = "mod_measurement"
        elif current_mod == "mod_measurement":
            next_mod = "mod_bell"
        else:
            next_mod = "mod_bell"

    # Invariant safety check
    if next_mod not in KNOWN_MODULE_IDS:
        next_mod = DEFAULT_MODULE_ID

    return ModuleRecommendation(
        nextModuleId=next_mod,
        recommendationReason=reason,
        remedial=False,
        targetMisconceptionCode=target_code,
        confidence=confidence,
        featureFlagActive=True,
        rulesVersion=RULES_VERSION,
    )


# ---------------------------------------------------------------------------
# Progress Record Enrichment Helper
# ---------------------------------------------------------------------------


def enrich_progress_record_with_recommendation(
    progress_dict: dict[str, Any],
    recommendation: ModuleRecommendation,
) -> dict[str, Any]:
    """Enrich an existing progress record dictionary with recommendation metadata.
    
    Safe, non-destructive helper that preserves all original fields while adding
    an optional recommendation block.
    """
    enriched = dict(progress_dict)
    enriched["nextRecommendedModule"] = {
        "moduleId": recommendation.nextModuleId,
        "reason": recommendation.recommendationReason,
        "remedial": recommendation.remedial,
        "targetMisconceptionCode": recommendation.targetMisconceptionCode,
        "confidence": recommendation.confidence,
        "featureFlagActive": recommendation.featureFlagActive,
    }
    return enriched
