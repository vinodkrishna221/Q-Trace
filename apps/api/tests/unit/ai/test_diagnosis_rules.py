"""
AI-1 test suite — deterministic misconception diagnosis rules
=============================================================
Owner:   Rajeswari (ai-pedagogy track)
Branch:  feat/ai-pedagogy/ai-1-define-deterministic-misconception-rules
Run:     uv run --project apps/api pytest apps/api/tests/unit/ai/test_diagnosis_rules.py

Assertions (all must be green before the card is marked done):
  1. Every seeded prediction answer maps to the expected MisconceptionCode.
  2. No rule emits an evidence key outside KNOWN_EVIDENCE_KEYS.
  3. None / unknown prediction answers safely return NO_SIGNAL.
  4. apply_rules rejects an empty state_trace.
  5. The RULES_VERSION constant is present and an integer.
  6. All four MisconceptionCodes are covered by at least one rule.
  7. CORRELATED_00_11 (correct answer) produces no misconception code
     (i.e. find_rule returns None / NO_SIGNAL as a safe default — correct
     learners are not diagnosed).
"""

from __future__ import annotations

import pytest

from app.services.diagnosis.rules import (
    BELL_VERIFIED_BEHAVIOR,
    KNOWN_EVIDENCE_KEYS,
    KNOWN_MISCONCEPTION_CODES,
    RULES,
    RULES_VERSION,
    DiagnosisResult,
    apply_rules,
    find_rule,
    is_known_evidence_key,
    list_all_rules,
)

# ---------------------------------------------------------------------------
# Fixtures — seeded Bell State Trace (from circuit-simulation contract v1)
# ---------------------------------------------------------------------------

BELL_STATE_TRACE = [
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
            {"qubit": 0, "bloch": {"x": 1.0, "y": 0.0, "z": 0.0}, "purity": 1.0, "label": "PURE_SUBSYSTEM"},
            {"qubit": 1, "bloch": {"x": 0.0, "y": 0.0, "z": 1.0}, "purity": 1.0, "label": "PURE_SUBSYSTEM"},
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
            {"qubit": 0, "bloch": {"x": 0.0, "y": 0.0, "z": 0.0}, "purity": 0.5, "label": "MIXED_SUBSYSTEM"},
            {"qubit": 1, "bloch": {"x": 0.0, "y": 0.0, "z": 0.0}, "purity": 0.5, "label": "MIXED_SUBSYSTEM"},
        ],
    },
]


# ---------------------------------------------------------------------------
# 1. Seeded prediction → expected MisconceptionCode mapping
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "prediction, expected_code, expected_first_divergence_step",
    [
        # Learner thinks qubits behave independently
        ("INDEPENDENT_RANDOM", "SUPERPOSITION_VS_ENTANGLEMENT", 1),
        # Learner thinks outcome is always 00
        ("ALWAYS_00", "MEASUREMENT_DETERMINISM", 1),
        # Learner thinks outcome is always 11
        ("ALWAYS_11", "MEASUREMENT_DETERMINISM", 1),
        # Learner has qubit/gate order confusion (01)
        ("ALWAYS_01", "GATE_ORDER", 0),
        # Learner has qubit/gate order confusion (10)
        ("ALWAYS_10", "GATE_ORDER", 0),
        # No prediction recorded
        (None, "NO_SIGNAL", 0),
        # Unknown / garbage answer
        ("SOMETHING_WEIRD", "NO_SIGNAL", 0),
    ],
)
def test_seeded_predictions_map_to_expected_codes(
    prediction: str | None,
    expected_code: str,
    expected_first_divergence_step: int,
) -> None:
    """Every seeded prediction maps to the correct MisconceptionCode and
    first_divergence_step, and all emitted evidence keys are registered."""

    result: DiagnosisResult = apply_rules(prediction, BELL_STATE_TRACE)

    assert result.code == expected_code, (
        f"Prediction {prediction!r}: expected code {expected_code!r}, "
        f"got {result.code!r}"
    )
    assert result.first_divergence_step == expected_first_divergence_step, (
        f"Prediction {prediction!r}: expected first_divergence_step "
        f"{expected_first_divergence_step}, got {result.first_divergence_step}"
    )

    # Every emitted evidence key must be in the known registry
    for key in result.evidence_keys:
        assert key in KNOWN_EVIDENCE_KEYS, (
            f"Code {result.code!r}: unknown evidence key emitted: {key!r}"
        )


# ---------------------------------------------------------------------------
# 2. No unknown evidence keys across the entire rule table
# ---------------------------------------------------------------------------

def test_no_rule_emits_unknown_evidence_key() -> None:
    """All rules in the table reference only registered evidence keys."""
    for rule in RULES:
        for key in rule.evidence_keys:
            assert key in KNOWN_EVIDENCE_KEYS, (
                f"Rule {rule.code!r} references unregistered evidence key: {key!r}"
            )


# ---------------------------------------------------------------------------
# 3. None / unknown prediction → NO_SIGNAL (safe fallback)
# ---------------------------------------------------------------------------

def test_none_prediction_returns_no_signal() -> None:
    result = apply_rules(None, BELL_STATE_TRACE)
    assert result.code == "NO_SIGNAL"
    assert result.confidence == 1.0


def test_unknown_prediction_string_returns_no_signal() -> None:
    result = apply_rules("COMPLETELY_UNKNOWN_PREDICTION", BELL_STATE_TRACE)
    assert result.code == "NO_SIGNAL"


# ---------------------------------------------------------------------------
# 4. apply_rules rejects empty state_trace
# ---------------------------------------------------------------------------

def test_apply_rules_raises_on_empty_state_trace() -> None:
    with pytest.raises(ValueError, match="state_trace"):
        apply_rules("INDEPENDENT_RANDOM", [])


# ---------------------------------------------------------------------------
# 5. RULES_VERSION is present and an integer
# ---------------------------------------------------------------------------

def test_rules_version_is_integer() -> None:
    assert isinstance(RULES_VERSION, int)
    assert RULES_VERSION >= 1


# ---------------------------------------------------------------------------
# 6. All four MisconceptionCodes are covered
# ---------------------------------------------------------------------------

def test_all_four_codes_covered() -> None:
    """The rule table must have at least one entry for each known code."""
    covered: set[str] = {rule.code for rule in RULES}
    for code in KNOWN_MISCONCEPTION_CODES:
        assert code in covered, f"MisconceptionCode {code!r} has no rule."


# ---------------------------------------------------------------------------
# 7. Correct answer (CORRELATED_00_11) falls back to NO_SIGNAL, not an error
# ---------------------------------------------------------------------------

def test_correct_prediction_returns_no_signal() -> None:
    """A learner who predicted the correct Bell outcome triggers NO_SIGNAL —
    they have no misconception to diagnose."""
    result = apply_rules("CORRELATED_00_11", BELL_STATE_TRACE)
    assert result.code == "NO_SIGNAL"


# ---------------------------------------------------------------------------
# 8. DiagnosisResult.evidence_dict matches contract shape
# ---------------------------------------------------------------------------

def test_evidence_dict_shape() -> None:
    result = apply_rules("INDEPENDENT_RANDOM", BELL_STATE_TRACE)
    ev = result.evidence_dict()
    assert "prediction" in ev
    assert "verifiedBehavior" in ev
    assert "stateTraceStepIndexes" in ev
    assert isinstance(ev["stateTraceStepIndexes"], list)
    assert ev["verifiedBehavior"] == BELL_VERIFIED_BEHAVIOR


# ---------------------------------------------------------------------------
# 9. is_known_evidence_key helper
# ---------------------------------------------------------------------------

def test_is_known_evidence_key_true() -> None:
    assert is_known_evidence_key("stateTrace.1.basisProbabilities") is True


def test_is_known_evidence_key_false() -> None:
    assert is_known_evidence_key("stateTrace.99.fabricatedField") is False


# ---------------------------------------------------------------------------
# 10. list_all_rules returns immutable tuple
# ---------------------------------------------------------------------------

def test_list_all_rules_returns_tuple() -> None:
    rules = list_all_rules()
    assert isinstance(rules, tuple)
    assert len(rules) == 4  # one entry per MisconceptionCode


# ---------------------------------------------------------------------------
# 11. find_rule returns correct DiagnosisRule for each known prediction
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "prediction, expected_code",
    [
        ("INDEPENDENT_RANDOM", "SUPERPOSITION_VS_ENTANGLEMENT"),
        ("ALWAYS_00", "MEASUREMENT_DETERMINISM"),
        ("ALWAYS_11", "MEASUREMENT_DETERMINISM"),
        ("ALWAYS_01", "GATE_ORDER"),
        ("ALWAYS_10", "GATE_ORDER"),
    ],
)
def test_find_rule_returns_correct_rule(prediction: str, expected_code: str) -> None:
    rule = find_rule(prediction)
    assert rule.code == expected_code


# ---------------------------------------------------------------------------
# 12. DiagnosisRule dataclass validation — bad code rejected at definition
# ---------------------------------------------------------------------------

def test_diagnosis_rule_rejects_unknown_code() -> None:
    from app.services.diagnosis.rules import DiagnosisRule

    with pytest.raises(ValueError, match="Unknown MisconceptionCode"):
        DiagnosisRule(
            code="INVENTED_CODE",
            matched_predictions=frozenset({"ALWAYS_00"}),
            first_divergence_step=0,
            evidence_keys=("stateTrace.0.basisProbabilities",),
            state_trace_step_indexes=(0,),
            confidence=1.0,
            repair_challenge_id="ch_test",
        )


def test_diagnosis_rule_rejects_unknown_evidence_key() -> None:
    from app.services.diagnosis.rules import DiagnosisRule

    with pytest.raises(ValueError, match="unknown evidence key"):
        DiagnosisRule(
            code="NO_SIGNAL",
            matched_predictions=frozenset(),
            first_divergence_step=0,
            evidence_keys=("stateTrace.99.fakeField",),
            state_trace_step_indexes=(0,),
            confidence=1.0,
            repair_challenge_id="ch_test",
        )


# ---------------------------------------------------------------------------
# 13. confidence is always 1.0 for all deterministic rules
# ---------------------------------------------------------------------------

def test_all_rules_have_max_confidence() -> None:
    for rule in RULES:
        assert rule.confidence == 1.0, (
            f"Rule {rule.code!r} has confidence {rule.confidence}, expected 1.0"
        )


# ---------------------------------------------------------------------------
# 14. repair_challenge_id is always non-empty
# ---------------------------------------------------------------------------

def test_all_rules_have_repair_challenge_id() -> None:
    for rule in RULES:
        assert rule.repair_challenge_id, (
            f"Rule {rule.code!r} has empty repair_challenge_id"
        )
