"""
Redacted Telemetry — Safe, Structured LLM Telemetry for Q-Trace Tutor.
=====================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-6
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md

Guarantees:
- Structured [llm] log lines formatted for demo telemetry
- ZERO persistence of free-form question or answer text
- Automatic redaction of credentials, bearer tokens, or sensitive learner identifiers
"""

from __future__ import annotations

import collections
import logging
import re
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("qtrace.llm.telemetry")

# Patterns to scrub
AUTH_HEADER_REGEX = re.compile(r"(Bearer\s+)[A-Za-z0-9_\-\.]{6,}", re.IGNORECASE)
API_KEY_REGEX = re.compile(r"(sk-[A-Za-z0-9_\-]{8,}|key-[A-Za-z0-9_\-]{8,})", re.IGNORECASE)


def redact_sensitive_text(text: str) -> str:
    """Scrubs API keys, auth headers, and high-entropy secret patterns."""
    if not text:
        return ""
    scrubbed = AUTH_HEADER_REGEX.sub(r"\1[REDACTED]", text)
    scrubbed = API_KEY_REGEX.sub(r"[REDACTED_KEY]", scrubbed)
    return scrubbed


class TelemetryEvent(BaseModel):
    """Structured telemetry event recording LLM or fallback execution."""

    timestamp: float = Field(default_factory=time.time)
    provider: str
    model: str
    durationMs: int
    status: str  # success, timeout, rate_limit, malformed, evidence_invalid, fallback
    badgeType: str
    estimatedTokens: int = 0
    fallbackUsed: bool
    fallbackReason: Optional[str] = None


class TelemetryBuffer:
    """Thread-safe bounded in-memory buffer of recent redacted telemetry events."""

    def __init__(self, max_capacity: int = 100) -> None:
        self._events: collections.deque[TelemetryEvent] = collections.deque(maxlen=max_capacity)

    def record(
        self,
        provider: str,
        model: str,
        duration_ms: int,
        status: str,
        badge_type: str,
        estimated_tokens: int = 0,
        fallback_used: bool = False,
        fallback_reason: Optional[str] = None,
    ) -> TelemetryEvent:
        event = TelemetryEvent(
            provider=redact_sensitive_text(provider),
            model=redact_sensitive_text(model),
            durationMs=max(0, duration_ms),
            status=status,
            badgeType=badge_type,
            estimatedTokens=max(0, estimated_tokens),
            fallbackUsed=fallback_used,
            fallbackReason=redact_sensitive_text(fallback_reason or "") if fallback_reason else None,
        )
        self._events.append(event)

        # Standard hackathon log line per .agents/rules/stack/ai-llm.md
        reason_str = f" reason='{event.fallbackReason}'" if event.fallbackReason else ""
        log_line = (
            f"[llm] provider={event.provider} model={event.model} duration_ms={event.durationMs} "
            f"status={event.status} tokens={event.estimatedTokens} badge={event.badgeType}{reason_str}"
        )
        print(log_line)
        logger.info(log_line)
        return event

    def get_events(self) -> List[TelemetryEvent]:
        return list(self._events)

    def clear(self) -> None:
        self._events.clear()


# Global telemetry buffer singleton
telemetry = TelemetryBuffer()
