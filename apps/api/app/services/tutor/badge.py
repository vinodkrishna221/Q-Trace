"""
Tutor Badges — Provider and Fallback Runtime Mode Badges for Q-Trace.
=====================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-6
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TutorBadge(BaseModel):
    """Badge representation indicating whether Tutor response is Cloud Verified or Fallback."""

    model_config = ConfigDict(extra="ignore")

    badgeType: str = Field(
        ...,
        description="Machine code: CLOUD_VERIFIED, FALLBACK_CURATED, FALLBACK_TIMEOUT, "
        "FALLBACK_RATE_LIMIT, FALLBACK_MALFORMED, FALLBACK_EVIDENCE_MISMATCH, FALLBACK_ERROR",
    )
    label: str = Field(
        ...,
        description="User/Judge visible label e.g. 'Cloud (Verified)' or 'Curated Fallback'",
    )
    variant: str = Field(
        default="default",
        description="Design system badge variant: 'success', 'secondary', 'warning', 'destructive'",
    )
    fallbackUsed: bool = Field(
        default=False,
        description="True if offline curated fallback was served",
    )
    model: str = Field(
        ...,
        description="Model identifier, e.g. 'mock-tutor-v1', 'gpt-4o', or 'DEMO_FALLBACK'",
    )
    reason: Optional[str] = Field(
        default=None,
        description="Explanation when fallback was engaged due to resilience recovery",
    )


def compute_tutor_badge(
    fallback_used: bool,
    model: str,
    trigger_reason: Optional[str] = None,
) -> TutorBadge:
    """Computes the appropriate UI/audit badge from execution parameters."""
    if not fallback_used:
        return TutorBadge(
            badgeType="CLOUD_VERIFIED",
            label="Cloud (Verified)",
            variant="success",
            fallbackUsed=False,
            model=model,
            reason=None,
        )

    # Fallback modes
    reason_lower = (trigger_reason or "").lower()

    if "timeout" in reason_lower or "timed out" in reason_lower or "deadline" in reason_lower:
        badge_type = "FALLBACK_TIMEOUT"
        label = "Fallback (Timeout Recovered)"
        variant = "warning"
        desc = "Provider exceeded latency budget; resilient fallback engaged."
    elif "rate_limit" in reason_lower or "rate limit" in reason_lower or "429" in reason_lower or "too many requests" in reason_lower:
        badge_type = "FALLBACK_RATE_LIMIT"
        label = "Fallback (Rate Limit Recovered)"
        variant = "warning"
        desc = "Provider rate limited; resilient fallback engaged."
    elif "malformed" in reason_lower or "schema" in reason_lower or "json" in reason_lower or "parse" in reason_lower:
        badge_type = "FALLBACK_MALFORMED"
        label = "Fallback (Schema Recovered)"
        variant = "warning"
        desc = "Provider output unparseable or malformed; resilient fallback engaged."
    elif "claim" in reason_lower or "evidence" in reason_lower or "fabricated" in reason_lower or "mismatch" in reason_lower:
        badge_type = "FALLBACK_EVIDENCE_MISMATCH"
        label = "Fallback (Evidence Shielded)"
        variant = "warning"
        desc = "Ungrounded claim or invalid key rejected by post-generation validator."
    elif "error" in reason_lower or "failed" in reason_lower or "transport" in reason_lower:
        badge_type = "FALLBACK_ERROR"
        label = "Fallback (Error Recovered)"
        variant = "warning"
        desc = "Provider transport error; resilient fallback engaged."
    else:
        badge_type = "FALLBACK_CURATED"
        label = "Curated Fallback"
        variant = "secondary"
        desc = "Configured offline fallback active."

    return TutorBadge(
        badgeType=badge_type,
        label=label,
        variant=variant,
        fallbackUsed=True,
        model=model,
        reason=trigger_reason or desc,
    )
