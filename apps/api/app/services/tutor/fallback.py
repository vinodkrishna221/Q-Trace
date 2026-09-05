"""
Curated Offline Fallback Generator for Q-Trace Tutor.
=====================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-3
Contract: board/contracts/flight-recorder-tutor.md v1

Rules & Constraints:
- P0 must work with zero provider credentials and offline.
- Fallback responses are curated, deterministic, and cited to verified evidence keys.
- Free-form text is NEVER persisted.
- Repair Challenge is selected deterministically.
"""

from __future__ import annotations

from typing import Any, Optional
from app.services.tutor.validator import validate_tutor_response_evidence


SUPPORTED_INTENTS: frozenset[str] = frozenset(
    {"EXPLAIN_DIVERGENCE", "EXPLAIN_CODE_ERROR", "SUGGEST_OPTIMIZATION"}
)


def select_repair_challenge(
    misconception_code: Optional[str] = None,
    module_id: Optional[str] = None,
) -> str:
    """Deterministically select the appropriate seeded Repair Challenge ID."""
    if misconception_code == "MEASUREMENT_DETERMINISM":
        return "ch_measurement_repair"
    # Default for Bell journey & SUPERPOSITION_VS_ENTANGLEMENT or GATE_ORDER
    return "ch_bell_repair"


def get_curated_bell_explanation(
    state_trace: list[dict[str, Any]],
    misconception_code: Optional[str] = "SUPERPOSITION_VS_ENTANGLEMENT",
    module_id: Optional[str] = "mod_bell",
    intent: str = "EXPLAIN_DIVERGENCE",
) -> dict[str, Any]:
    """Produce the curated Bell state explanation payload grounded in state_trace."""
    repair_challenge_id = select_repair_challenge(misconception_code, module_id)

    steps = [
        {
            "title": "After H",
            "body": "The verified probabilities are 00 = 0.5 and 10 = 0.5.",
            "evidenceKeys": ["stateTrace.0.basisProbabilities"],
        },
        {
            "title": "After CNOT",
            "body": "The verified support moves to 00 = 0.5 and 11 = 0.5.",
            "evidenceKeys": ["stateTrace.1.basisProbabilities"],
        },
    ]

    numerical_claims = [
        {"claim": "P(00)=0.5", "evidenceKey": "stateTrace.1.basisProbabilities.00"},
        {"claim": "P(11)=0.5", "evidenceKey": "stateTrace.1.basisProbabilities.11"},
    ]

    # Validate all evidence keys and numerical claims before returning
    validate_tutor_response_evidence(steps, numerical_claims, state_trace)

    return {
        "responseId": "tr_demo_001",
        "intent": intent,
        "summary": (
            "The Hadamard gate made qubit 0 uncertain; the CNOT then tied qubit 1 "
            "to that branch. Each shot is random, but the pair is correlated."
        ),
        "steps": steps,
        "numericalClaims": numerical_claims,
        "repairChallengeId": repair_challenge_id,
        "fallbackUsed": True,
        "model": "DEMO_FALLBACK",
        "safetyNote": "Explanation is grounded in this Simulation Run; it is not a hardware claim.",
    }
