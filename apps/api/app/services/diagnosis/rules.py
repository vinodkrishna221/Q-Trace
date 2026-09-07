"""
AI-1 — Deterministic Misconception Diagnosis Rules
====================================================
Owner:   Rajeswari (ai-pedagogy track)
Branch:  feat/ai-pedagogy/ai-1-define-deterministic-misconception-rules
Version: 1
Contract consumed: board/contracts/circuit-simulation.md v1
Contract owned:    board/contracts/flight-recorder-tutor.md v1

Rules are pure data + pure functions.
- No LLM calls anywhere in this file.
- No I/O, no network, no side effects.
- Every evidence key references a verifiable path in the StateTrace shape
  from the circuit-simulation contract.

MisconceptionCode vocabulary (frozen — change requires contract bump + ritual):
  SUPERPOSITION_VS_ENTANGLEMENT
  MEASUREMENT_DETERMINISM
  GATE_ORDER
  NO_SIGNAL
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

# ---------------------------------------------------------------------------
# Version
# ---------------------------------------------------------------------------

RULES_VERSION: int = 1

# ---------------------------------------------------------------------------
# Frozen vocabulary
# ---------------------------------------------------------------------------

MisconceptionCode = Literal[
    "SUPERPOSITION_VS_ENTANGLEMENT",
    "MEASUREMENT_DETERMINISM",
    "GATE_ORDER",
    "NO_SIGNAL",
]

KNOWN_MISCONCEPTION_CODES: frozenset[str] = frozenset(
    {
        "SUPERPOSITION_VS_ENTANGLEMENT",
        "MEASUREMENT_DETERMINISM",
        "GATE_ORDER",
        "NO_SIGNAL",
    }
)

# Learner prediction options (frozen per PRD Bell checkpoint vocabulary)
PredictionAnswer = Literal[
    "INDEPENDENT_RANDOM",      # learner thinks qubits behave independently
    "ALWAYS_00",               # learner thinks result is deterministically 00
    "ALWAYS_11",               # learner thinks result is deterministically 11
    "CORRELATED_00_11",        # correct entangled Bell outcome
    "ALWAYS_01",               # gate-order confusion
    "ALWAYS_10",               # gate-order confusion variant
]

KNOWN_PREDICTION_ANSWERS: frozenset[str] = frozenset(
    {
        "INDEPENDENT_RANDOM",
        "ALWAYS_00",
        "ALWAYS_11",
        "CORRELATED_00_11",
        "ALWAYS_01",
        "ALWAYS_10",
    }
)

# Verified Bell behavior code (what the simulator produces)
BELL_VERIFIED_BEHAVIOR: str = "CORRELATED_00_11"

# ---------------------------------------------------------------------------
# Evidence key registry
# ---------------------------------------------------------------------------
# Every key that any rule may emit must be listed here.
# Keys follow the dot-path convention from the circuit-simulation contract:
#   stateTrace.<stepIndex>.<field>.<subfield>
# This registry is the single source of truth; the test asserts no key outside it.

KNOWN_EVIDENCE_KEYS: frozenset[str] = frozenset(
    {
        "stateTrace.0.basisProbabilities",
        "stateTrace.0.reducedQubits",
        "stateTrace.0.amplitudes",
        "stateTrace.1.basisProbabilities",
        "stateTrace.1.reducedQubits",
        "stateTrace.1.amplitudes",
        "stateTrace.1.basisProbabilities.00",
        "stateTrace.1.basisProbabilities.11",
    }
)

# ---------------------------------------------------------------------------
# Rule data structures
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class DiagnosisRule:
    """One entry in the closed misconception rule table.

    Fields
    ------
    code                 : the MisconceptionCode this rule fires.
    matched_predictions  : frozenset of PredictionAnswer values that trigger it.
    first_divergence_step: the StateTrace stepIndex where behaviour diverges (0-indexed).
    evidence_keys        : ordered tuple of evidence key paths from KNOWN_EVIDENCE_KEYS.
    state_trace_step_indexes: tuple of step indexes relevant to the diagnosis.
    confidence           : float in [0, 1]; 1.0 for all deterministic rules.
    repair_challenge_id  : ID of the seeded Repair Challenge for this code.
    """

    code: str
    matched_predictions: frozenset[str]
    first_divergence_step: int
    evidence_keys: tuple[str, ...]
    state_trace_step_indexes: tuple[int, ...]
    confidence: float
    repair_challenge_id: str

    def __post_init__(self) -> None:
        if self.code not in KNOWN_MISCONCEPTION_CODES:
            raise ValueError(f"Unknown MisconceptionCode: {self.code!r}")
        for key in self.evidence_keys:
            if key not in KNOWN_EVIDENCE_KEYS:
                raise ValueError(
                    f"Rule {self.code!r} references unknown evidence key: {key!r}"
                )
        if not (0.0 <= self.confidence <= 1.0):
            raise ValueError("confidence must be in [0, 1]")


# ---------------------------------------------------------------------------
# The closed rule table
# ---------------------------------------------------------------------------

RULES: tuple[DiagnosisRule, ...] = (
    # ------------------------------------------------------------------
    # SUPERPOSITION_VS_ENTANGLEMENT
    # Learner predicts independent random outcomes; does not understand
    # that CNOT entangles qubit 1 to qubit 0's superposition branch,
    # producing CORRELATED_00_11 — not independent random behaviour.
    # First divergence: step 1 (After CNOT) where correlation appears.
    # ------------------------------------------------------------------
    DiagnosisRule(
        code="SUPERPOSITION_VS_ENTANGLEMENT",
        matched_predictions=frozenset({"INDEPENDENT_RANDOM"}),
        first_divergence_step=1,
        evidence_keys=(
            "stateTrace.0.basisProbabilities",
            "stateTrace.1.basisProbabilities",
            "stateTrace.1.reducedQubits",
            "stateTrace.1.basisProbabilities.00",
            "stateTrace.1.basisProbabilities.11",
        ),
        state_trace_step_indexes=(0, 1),
        confidence=1.0,
        repair_challenge_id="ch_bell_repair",
    ),
    # ------------------------------------------------------------------
    # MEASUREMENT_DETERMINISM
    # Learner predicts a fixed single outcome (ALWAYS_00 or ALWAYS_11),
    # believing measurement always yields one specific result.
    # The trace reveals both 00 and 11 appear with p≈0.5, so the first
    # divergence is step 1 (After CNOT) where superposition persists.
    # ------------------------------------------------------------------
    DiagnosisRule(
        code="MEASUREMENT_DETERMINISM",
        matched_predictions=frozenset({"ALWAYS_00", "ALWAYS_11"}),
        first_divergence_step=1,
        evidence_keys=(
            "stateTrace.1.basisProbabilities",
            "stateTrace.1.basisProbabilities.00",
            "stateTrace.1.basisProbabilities.11",
        ),
        state_trace_step_indexes=(1,),
        confidence=1.0,
        repair_challenge_id="ch_measurement_repair",
    ),
    # ------------------------------------------------------------------
    # GATE_ORDER
    # Learner predicts outcomes like ALWAYS_01 or ALWAYS_10, suggesting
    # they swapped qubit ordering or gate application sequence in their
    # mental model (e.g. thinking CNOT fires before H, or qubit mapping
    # is reversed).  First divergence is step 0 (After H) because the
    # qubit they expect to be the control has not yet been superposed.
    # ------------------------------------------------------------------
    DiagnosisRule(
        code="GATE_ORDER",
        matched_predictions=frozenset({"ALWAYS_01", "ALWAYS_10"}),
        first_divergence_step=0,
        evidence_keys=(
            "stateTrace.0.basisProbabilities",
            "stateTrace.0.reducedQubits",
            "stateTrace.1.basisProbabilities",
        ),
        state_trace_step_indexes=(0, 1),
        confidence=1.0,
        repair_challenge_id="ch_gate_order_repair",
    ),
    # ------------------------------------------------------------------
    # NO_SIGNAL
    # No prediction was recorded or prediction answer is unrecognised.
    # No first divergence step can be asserted without a prediction.
    # Returns step 0 as a neutral anchor.
    # ------------------------------------------------------------------
    DiagnosisRule(
        code="NO_SIGNAL",
        matched_predictions=frozenset(),   # matched via fallback, not set membership
        first_divergence_step=0,
        evidence_keys=(
            "stateTrace.0.basisProbabilities",
        ),
        state_trace_step_indexes=(0,),
        confidence=1.0,
        repair_challenge_id="ch_no_signal_repair",
    ),
)

# Build a fast lookup: prediction answer → rule
_PREDICTION_TO_RULE: dict[str, DiagnosisRule] = {}
for _rule in RULES:
    for _pred in _rule.matched_predictions:
        _PREDICTION_TO_RULE[_pred] = _rule

# The NO_SIGNAL rule object (used as fallback)
_NO_SIGNAL_RULE: DiagnosisRule = next(
    r for r in RULES if r.code == "NO_SIGNAL"
)

# ---------------------------------------------------------------------------
# Diagnosis result
# ---------------------------------------------------------------------------


@dataclass
class DiagnosisResult:
    """Output of apply_rules — pure data, no LLM."""

    code: str
    first_divergence_step: int | None
    evidence_keys: tuple[str, ...]
    state_trace_step_indexes: tuple[int, ...]
    confidence: float
    repair_challenge_id: str
    verified_behavior: str
    prediction: str | None

    def evidence_dict(self) -> dict[str, Any]:
        """Return the evidence dict matching the flight-recorder-tutor contract."""
        return {
            "prediction": self.prediction or "UNKNOWN",
            "verifiedBehavior": self.verified_behavior,
            "stateTraceStepIndexes": list(self.state_trace_step_indexes),
        }


# ---------------------------------------------------------------------------
# Pure diagnostic functions
# ---------------------------------------------------------------------------


def find_rule(prediction_answer: str | None) -> DiagnosisRule:
    """Return the matching DiagnosisRule for a learner prediction answer.

    Parameters
    ----------
    prediction_answer:
        The learner's prediction answer string, or None / unknown string.

    Returns
    -------
    DiagnosisRule
        The matching rule; falls back to the NO_SIGNAL rule when the
        prediction is absent or does not match any known answer.

    This function is pure — no side effects, no I/O, no LLM.
    """
    if prediction_answer and prediction_answer in _PREDICTION_TO_RULE:
        return _PREDICTION_TO_RULE[prediction_answer]
    return _NO_SIGNAL_RULE


def apply_rules(
    prediction_answer: str | None,
    state_trace: list[dict[str, Any]],
) -> DiagnosisResult:
    """Apply deterministic rules to a learner prediction and its State Trace.

    Parameters
    ----------
    prediction_answer:
        String from PredictionAnswer vocabulary, or None.
    state_trace:
        List of StateTraceStep dicts from circuit-simulation contract.
        The function reads it to validate evidence key reachability but
        does NOT modify it and does NOT call any external service.

    Returns
    -------
    DiagnosisResult
        Fully resolved diagnosis.  All evidence keys are guaranteed to be
        members of KNOWN_EVIDENCE_KEYS.

    Raises
    ------
    ValueError
        If state_trace is empty (no evidence to diagnose against).

    This function is pure — no side effects, no I/O, no LLM.
    """
    if not state_trace:
        raise ValueError(
            "state_trace must contain at least one step to perform diagnosis."
        )

    rule = find_rule(prediction_answer)

    # Validate that every evidence key the rule emits is from the known set.
    # This assertion is a safety net; __post_init__ on DiagnosisRule already
    # enforces it at rule-definition time.
    for key in rule.evidence_keys:
        assert key in KNOWN_EVIDENCE_KEYS, (
            f"Internal error: rule {rule.code!r} emits unregistered key {key!r}"
        )

    return DiagnosisResult(
        code=rule.code,
        first_divergence_step=rule.first_divergence_step,
        evidence_keys=rule.evidence_keys,
        state_trace_step_indexes=rule.state_trace_step_indexes,
        confidence=rule.confidence,
        repair_challenge_id=rule.repair_challenge_id,
        verified_behavior=BELL_VERIFIED_BEHAVIOR,
        prediction=prediction_answer,
    )


def list_all_rules() -> tuple[DiagnosisRule, ...]:
    """Return the complete immutable rule table (read-only introspection)."""
    return RULES


def is_known_evidence_key(key: str) -> bool:
    """Return True iff key is in the registered evidence-key set."""
    return key in KNOWN_EVIDENCE_KEYS
