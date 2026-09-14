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
    learner_role: Optional[str] = None,
) -> dict[str, Any]:
    """Produce the curated Bell state explanation payload grounded in state_trace."""
    repair_challenge_id = select_repair_challenge(misconception_code, module_id)

    if len(state_trace) == 1:
        step_0 = state_trace[0]
        step_label = step_0.get("label", "After CNOT")
        probs = step_0.get("basisProbabilities", {})
        non_zero_states = [s for s, p in probs.items() if p > 1e-6]
        primary_state = (
            non_zero_states[0]
            if non_zero_states
            else ("00" if "00" in probs else (next(iter(probs.keys())) if probs else None))
        )
        primary_prob = probs.get(primary_state, 1.0) if primary_state else 1.0

        step_ev_keys = (
            ["stateTrace.0.basisProbabilities"]
            if "basisProbabilities" in step_0
            else ["stateTrace.0"]
        )
        steps = [
            {
                "title": step_label or "After CNOT",
                "body": (
                    f"Without superposition on qubit 0, the system remained in product state |{primary_state or '00'}⟩."
                ),
                "evidenceKeys": step_ev_keys,
            }
        ]
        numerical_claims = []
        if primary_state and primary_state in probs:
            numerical_claims.append(
                {
                    "claim": f"P({primary_state})={primary_prob}",
                    "evidenceKey": f"stateTrace.0.basisProbabilities.{primary_state}",
                }
            )
        if learner_role == "PHYSICS_TO_CODE":
            summary = (
                f"Without the Hadamard gate preparing (|0⟩+|1⟩)/√2 on the control qubit, "
                f"the CNOT gate acted trivially on computational basis state |00⟩, leaving the system "
                f"in product state |{primary_state}⟩ with purity 1.0."
            )
        else:
            summary = (
                "The circuit did not apply superposition to qubit 0 first. "
                f"The control qubit remained in |0⟩, so the CNOT was inactive and the pair remained in state |{primary_state}⟩."
            )
    else:
        last_step_idx = len(state_trace) - 1
        last_probs = state_trace[last_step_idx].get("basisProbabilities", {})
        if "00" in last_probs and "11" in last_probs:
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
                {"claim": f"P(00)={last_probs.get('00', 0.5)}", "evidenceKey": f"stateTrace.{last_step_idx}.basisProbabilities.00"},
                {"claim": f"P(11)={last_probs.get('11', 0.5)}", "evidenceKey": f"stateTrace.{last_step_idx}.basisProbabilities.11"},
            ]
        else:
            active_states = [s for s, p in last_probs.items() if p > 1e-6]
            steps = [
                {
                    "title": state_trace[0].get("label", "After First Gate"),
                    "body": "First gate prepared intermediate state.",
                    "evidenceKeys": ["stateTrace.0.basisProbabilities"],
                },
                {
                    "title": state_trace[last_step_idx].get("label", "After Gate"),
                    "body": f"The verified output support is {', '.join(active_states)}.",
                    "evidenceKeys": [f"stateTrace.{last_step_idx}.basisProbabilities"],
                },
            ]
            numerical_claims = [
                {"claim": f"P({s})={last_probs[s]}", "evidenceKey": f"stateTrace.{last_step_idx}.basisProbabilities.{s}"}
                for s in active_states[:2]
            ]

        if learner_role == "PHYSICS_TO_CODE":
            summary = (
                "The Hadamard transformation H prepares product state (|00⟩+|10⟩)/√2; CNOT maps it to "
                "entangled Bell state |Φ+⟩=(|00⟩+|11⟩)/√2. Reduced subsystems are maximally mixed (purity 0.5), "
                "demonstrating non-separable state correlation."
            )
        else:
            summary = (
                "The Hadamard gate made qubit 0 uncertain; the CNOT then tied qubit 1 "
                "to that branch. Each shot is random, but the pair is correlated."
            )

    # Validate all evidence keys and numerical claims before returning
    validate_tutor_response_evidence(steps, numerical_claims, state_trace)

    return {
        "responseId": "tr_demo_001",
        "intent": intent,
        "summary": summary,
        "steps": steps,
        "numericalClaims": numerical_claims,
        "repairChallengeId": repair_challenge_id,
        "fallbackUsed": True,
        "model": "DEMO_FALLBACK",
        "safetyNote": "Explanation is grounded in this Simulation Run; it is not a hardware claim.",
    }
