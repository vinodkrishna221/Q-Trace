"""QA-5: Cross-track acceptance tests — Tutor evidence binding integrity.

Consumes (read-only):
    - app.services.tutor.fallback   (AI-3)
    - app.services.tutor.validator  (AI-3)
    - board/contracts/flight-recorder-tutor.md v1

QA owns this file; implementation tracks retain their own unit tests.

Contract requirement being verified:
    "the service validates every evidenceKey and rejects numerical claims
     without a matching value" — flight-recorder-tutor.md v1 NOTES section.
"""

from __future__ import annotations

import pytest

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

# ---------------------------------------------------------------------------
# Shared Bell state trace (identical to test_diagnosis_grading.py fixture)
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

EPSILON = 1e-6


# ===========================================================================
# 1. Curated fallback response contract shape
# ===========================================================================

class TestCuratedFallbackContractShape:
    """get_curated_bell_explanation() returns flight-recorder-tutor v1 contract shape."""

    def test_response_has_required_top_level_fields(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        required = {
            "responseId", "intent", "summary", "steps",
            "numericalClaims", "repairChallengeId", "fallbackUsed",
            "model", "safetyNote",
        }
        for field in required:
            assert field in resp, f"Curated fallback missing required field {field!r}"

    def test_fallback_used_is_true(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        assert resp["fallbackUsed"] is True

    def test_model_is_demo_fallback(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        assert resp["model"] == "DEMO_FALLBACK"

    def test_intent_is_valid_contract_value(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        assert resp["intent"] in SUPPORTED_INTENTS

    def test_steps_is_list_of_two(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        assert isinstance(resp["steps"], list)
        assert len(resp["steps"]) == 2

    def test_each_step_has_title_body_evidence_keys(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        for step in resp["steps"]:
            assert "title" in step
            assert "body" in step
            assert "evidenceKeys" in step
            assert isinstance(step["evidenceKeys"], list)
            assert len(step["evidenceKeys"]) >= 1

    def test_numerical_claims_is_list(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        assert isinstance(resp["numericalClaims"], list)

    def test_each_numerical_claim_has_claim_and_evidence_key(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        for nc in resp["numericalClaims"]:
            assert "claim" in nc
            assert "evidenceKey" in nc

    def test_safety_note_present_and_non_empty(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        assert resp["safetyNote"]
        assert "Simulation Run" in resp["safetyNote"] or "grounded" in resp["safetyNote"]


# ===========================================================================
# 2. Evidence key validation — every step key resolves
# ===========================================================================

class TestEvidenceKeyValidation:
    """Every evidence key in the curated fallback must resolve in the Bell trace."""

    def test_all_step_evidence_keys_resolve(self):
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        for step in resp["steps"]:
            for key in step["evidenceKeys"]:
                value = resolve_evidence_key(key, BELL_STATE_TRACE)
                assert value is not None, f"Evidence key {key!r} resolved to None"

    def test_after_h_step_resolves_to_correct_probs(self):
        key = "stateTrace.0.basisProbabilities"
        probs = resolve_evidence_key(key, BELL_STATE_TRACE)
        assert isinstance(probs, dict)
        assert abs(probs.get("00", 0.0) - 0.5) <= EPSILON
        assert abs(probs.get("10", 0.0) - 0.5) <= EPSILON

    def test_after_cnot_step_resolves_to_correct_probs(self):
        key = "stateTrace.1.basisProbabilities"
        probs = resolve_evidence_key(key, BELL_STATE_TRACE)
        assert isinstance(probs, dict)
        assert abs(probs.get("00", 0.0) - 0.5) <= EPSILON
        assert abs(probs.get("11", 0.0) - 0.5) <= EPSILON

    def test_invalid_key_format_raises(self):
        with pytest.raises(EvidenceKeyValidationError):
            resolve_evidence_key("notStateTrace.1.foo", BELL_STATE_TRACE)

    def test_out_of_range_step_raises(self):
        with pytest.raises(EvidenceKeyValidationError):
            resolve_evidence_key("stateTrace.99.basisProbabilities", BELL_STATE_TRACE)

    def test_missing_field_raises(self):
        with pytest.raises(EvidenceKeyValidationError):
            resolve_evidence_key("stateTrace.0.nonExistentField", BELL_STATE_TRACE)

    def test_empty_key_raises(self):
        with pytest.raises(EvidenceKeyValidationError):
            resolve_evidence_key("", BELL_STATE_TRACE)


# ===========================================================================
# 3. Numerical claim validation — P(00)=0.5 and P(11)=0.5
# ===========================================================================

class TestNumericalClaimValidation:
    """Every numerical claim in curated fallback must match the verified simulator output."""

    def test_p00_claim_validates(self):
        is_valid = validate_numerical_claim(
            "P(00)=0.5",
            "stateTrace.1.basisProbabilities.00",
            BELL_STATE_TRACE,
        )
        assert is_valid is True

    def test_p11_claim_validates(self):
        is_valid = validate_numerical_claim(
            "P(11)=0.5",
            "stateTrace.1.basisProbabilities.11",
            BELL_STATE_TRACE,
        )
        assert is_valid is True

    def test_all_curated_fallback_numerical_claims_validate(self):
        """The whole batch must pass — no fabricated claims in the curated fallback."""
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        # Validation is already called internally; this test calls it explicitly from QA
        validate_tutor_response_evidence(
            resp["steps"],
            resp["numericalClaims"],
            BELL_STATE_TRACE,
        )
        # If no exception raised, all claims are grounded

    def test_fabricated_claim_raises(self):
        """A claim of P(00)=0.99 when actual is 0.5 must be rejected."""
        with pytest.raises(FabricatedClaimError):
            validate_numerical_claim(
                "P(00)=0.99",
                "stateTrace.1.basisProbabilities.00",
                BELL_STATE_TRACE,
            )

    def test_extract_claimed_value_simple(self):
        assert abs(extract_claimed_value("P(00)=0.5") - 0.5) < EPSILON

    def test_extract_claimed_value_no_number_raises(self):
        with pytest.raises(FabricatedClaimError):
            extract_claimed_value("no number here")

    def test_validate_batch_missing_evidence_key_raises(self):
        steps = [{"title": "T", "body": "B", "evidenceKeys": []}]
        bad_claims = [{"claim": "P(00)=0.5", "evidenceKey": ""}]
        with pytest.raises((FabricatedClaimError, EvidenceKeyValidationError)):
            validate_tutor_response_evidence(steps, bad_claims, BELL_STATE_TRACE)

    def test_validate_batch_bad_step_key_raises(self):
        steps = [{"title": "T", "body": "B", "evidenceKeys": ["notStateTrace.0.foo"]}]
        with pytest.raises(EvidenceKeyValidationError):
            validate_tutor_response_evidence(steps, [], BELL_STATE_TRACE)


# ===========================================================================
# 4. Repair challenge selection — deterministic per misconception code
# ===========================================================================

class TestRepairChallengeSelection:
    """select_repair_challenge() returns the seeded repair challenge ID per contract."""

    def test_default_returns_bell_repair(self):
        assert select_repair_challenge() == "ch_bell_repair"

    def test_svse_returns_bell_repair(self):
        assert select_repair_challenge("SUPERPOSITION_VS_ENTANGLEMENT") == "ch_bell_repair"

    def test_gate_order_returns_bell_repair(self):
        assert select_repair_challenge("GATE_ORDER") == "ch_bell_repair"

    def test_measurement_determinism_returns_measurement_repair(self):
        assert select_repair_challenge("MEASUREMENT_DETERMINISM") == "ch_measurement_repair"

    def test_no_signal_returns_bell_repair(self):
        assert select_repair_challenge("NO_SIGNAL") == "ch_bell_repair"

    def test_none_code_returns_bell_repair(self):
        assert select_repair_challenge(None) == "ch_bell_repair"


# ===========================================================================
# 5. Supported intents vocabulary — contract sealed
# ===========================================================================

class TestSupportedIntents:
    def test_all_three_contract_intents_present(self):
        """Contract defines exactly three intents."""
        expected = {"EXPLAIN_DIVERGENCE", "EXPLAIN_CODE_ERROR", "SUGGEST_OPTIMIZATION"}
        assert expected == SUPPORTED_INTENTS

    def test_supported_intents_is_frozenset(self):
        assert isinstance(SUPPORTED_INTENTS, frozenset)


# ===========================================================================
# 6. Free text non-persistence enforcement
# ===========================================================================

class TestFreeTextNonPersistence:
    """Tutor free-form learner question is never echoed back in the response."""

    def test_learner_question_not_in_curated_response(self):
        """The curated fallback must not contain any field that could echo a question."""
        resp = get_curated_bell_explanation(BELL_STATE_TRACE)
        FORBIDDEN_FIELDS = {"learnerQuestion", "userInput", "freeText", "rawQuestion"}
        for field in FORBIDDEN_FIELDS:
            assert field not in resp, (
                f"Tutor response contains forbidden field {field!r} that could echo free text"
            )
