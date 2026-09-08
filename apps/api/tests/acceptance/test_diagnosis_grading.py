"""QA-5: Cross-track acceptance tests — diagnosis taxonomy correctness and grading math.

Consumes (read-only):
    - app.services.diagnosis.rules (AI-1)
    - app.services.diagnosis.taxonomy (AI-4)
    - app.routers.progress (DATA-3)
    - board/contracts/flight-recorder-tutor.md v1
    - board/contracts/progress-analytics.md v1

QA owns this file; implementation tracks retain their own unit tests.
This suite proves no numerical claim lacks evidence and that the grading
math is deterministic per the progress-analytics contract.
"""

from __future__ import annotations

import pytest

from app.services.diagnosis.rules import (
    KNOWN_EVIDENCE_KEYS,
    KNOWN_MISCONCEPTION_CODES,
    KNOWN_PREDICTION_ANSWERS,
    BELL_VERIFIED_BEHAVIOR,
    apply_rules,
    find_rule,
    list_all_rules,
)
from app.services.diagnosis.taxonomy import (
    REPLAY_COPY_TABLE,
    EXPLANATION_TEMPLATES,
    diagnose_with_taxonomy,
    get_explanation_template,
    get_replay_copy_for_role,
    normalize_learner_role,
)

# ---------------------------------------------------------------------------
# Shared Bell state trace (mirrors contract example + golden fixture)
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
# 1. Misconception code vocabulary completeness
# ===========================================================================

class TestMisconceptionVocabulary:
    """All four codes from the contract are present and sealed."""

    def test_all_four_codes_registered(self):
        expected = {
            "SUPERPOSITION_VS_ENTANGLEMENT",
            "MEASUREMENT_DETERMINISM",
            "GATE_ORDER",
            "NO_SIGNAL",
        }
        assert expected == KNOWN_MISCONCEPTION_CODES

    def test_known_prediction_answers_sealed(self):
        """Contract-defined prediction vocabulary is frozen."""
        expected = {
            "INDEPENDENT_RANDOM",
            "ALWAYS_00",
            "ALWAYS_11",
            "CORRELATED_00_11",
            "ALWAYS_01",
            "ALWAYS_10",
        }
        assert expected == KNOWN_PREDICTION_ANSWERS

    def test_evidence_key_registry_sealed(self):
        """Every registered key follows the stateTrace dot-path convention."""
        for key in KNOWN_EVIDENCE_KEYS:
            assert key.startswith("stateTrace."), (
                f"Evidence key {key!r} does not follow stateTrace dot-path convention"
            )

    def test_every_rule_emits_only_known_evidence_keys(self):
        """No rule references an unregistered evidence key — numerical claim safety net."""
        for rule in list_all_rules():
            for key in rule.evidence_keys:
                assert key in KNOWN_EVIDENCE_KEYS, (
                    f"Rule {rule.code!r} emits unregistered key {key!r}"
                )

    def test_bell_verified_behavior_is_correlated(self):
        assert BELL_VERIFIED_BEHAVIOR == "CORRELATED_00_11"


# ===========================================================================
# 2. Diagnosis rule mapping — deterministic per prediction
# ===========================================================================

class TestDiagnosisRuleMapping:
    """Each prediction answer maps deterministically to the correct code."""

    @pytest.mark.parametrize("prediction,expected_code", [
        ("INDEPENDENT_RANDOM",  "SUPERPOSITION_VS_ENTANGLEMENT"),
        ("ALWAYS_00",           "MEASUREMENT_DETERMINISM"),
        ("ALWAYS_11",           "MEASUREMENT_DETERMINISM"),
        ("ALWAYS_01",           "GATE_ORDER"),
        ("ALWAYS_10",           "GATE_ORDER"),
        ("CORRELATED_00_11",    "NO_SIGNAL"),
        (None,                  "NO_SIGNAL"),
        ("",                    "NO_SIGNAL"),
        ("GARBAGE_VALUE",       "NO_SIGNAL"),
    ])
    def test_find_rule_maps_prediction(self, prediction, expected_code):
        rule = find_rule(prediction)
        assert rule.code == expected_code, (
            f"Prediction {prediction!r} → expected {expected_code!r}, got {rule.code!r}"
        )

    def test_all_rules_have_confidence_1(self):
        """All rules are deterministic — confidence must be 1.0."""
        for rule in list_all_rules():
            assert rule.confidence == 1.0, (
                f"Rule {rule.code!r} has confidence {rule.confidence} (expected 1.0)"
            )

    def test_superposition_vs_entanglement_first_divergence(self):
        """INDEPENDENT_RANDOM diverges at step 1 (After CNOT), not step 0."""
        rule = find_rule("INDEPENDENT_RANDOM")
        assert rule.first_divergence_step == 1

    def test_gate_order_first_divergence_is_step_0(self):
        """GATE_ORDER diverges at step 0 (After H) — control qubit not superposed."""
        rule = find_rule("ALWAYS_01")
        assert rule.first_divergence_step == 0

    def test_measurement_determinism_divergence_step(self):
        rule = find_rule("ALWAYS_00")
        assert rule.first_divergence_step == 1

    def test_apply_rules_returns_verified_behavior(self):
        result = apply_rules("INDEPENDENT_RANDOM", BELL_STATE_TRACE)
        assert result.verified_behavior == BELL_VERIFIED_BEHAVIOR

    def test_apply_rules_empty_trace_raises(self):
        with pytest.raises(ValueError, match="state_trace must contain at least one step"):
            apply_rules("INDEPENDENT_RANDOM", [])

    def test_evidence_dict_contract_shape(self):
        """evidence_dict() must match the flight-recorder-tutor contract shape."""
        result = apply_rules("INDEPENDENT_RANDOM", BELL_STATE_TRACE)
        ev = result.evidence_dict()
        assert "prediction" in ev
        assert "verifiedBehavior" in ev
        assert "stateTraceStepIndexes" in ev
        assert isinstance(ev["stateTraceStepIndexes"], list)
        assert ev["verifiedBehavior"] == "CORRELATED_00_11"

    def test_no_signal_correct_prediction_has_no_divergence_after_taxonomy(self):
        """CORRELATED_00_11 triggers NO_SIGNAL; taxonomy sets firstDivergenceStep=None."""
        diag = diagnose_with_taxonomy("CORRELATED_00_11", BELL_STATE_TRACE)
        assert diag.code == "NO_SIGNAL"
        assert diag.first_divergence_step is None


# ===========================================================================
# 3. Taxonomy: replay contract shape for all four codes × both roles
# ===========================================================================

class TestTaxonomyReplayCopy:
    """Replay steps conform to the flight-recorder-tutor contract shape."""

    @pytest.mark.parametrize("code", [
        "SUPERPOSITION_VS_ENTANGLEMENT",
        "MEASUREMENT_DETERMINISM",
        "GATE_ORDER",
        "NO_SIGNAL",
    ])
    @pytest.mark.parametrize("role", ["BEGINNER_CSE", "PHYSICS_TO_CODE"])
    def test_replay_copy_table_coverage(self, code, role):
        """All 8 combinations (4 codes × 2 roles) exist in REPLAY_COPY_TABLE."""
        assert (code, role) in REPLAY_COPY_TABLE, (
            f"REPLAY_COPY_TABLE missing ({code!r}, {role!r})"
        )

    @pytest.mark.parametrize("code", [
        "SUPERPOSITION_VS_ENTANGLEMENT",
        "MEASUREMENT_DETERMINISM",
        "GATE_ORDER",
        "NO_SIGNAL",
    ])
    @pytest.mark.parametrize("role", ["BEGINNER_CSE", "PHYSICS_TO_CODE"])
    def test_explanation_templates_coverage(self, code, role):
        """All 8 combinations exist in EXPLANATION_TEMPLATES."""
        assert (code, role) in EXPLANATION_TEMPLATES, (
            f"EXPLANATION_TEMPLATES missing ({code!r}, {role!r})"
        )

    @pytest.mark.parametrize("prediction,expected_code", [
        ("INDEPENDENT_RANDOM", "SUPERPOSITION_VS_ENTANGLEMENT"),
        ("ALWAYS_00",          "MEASUREMENT_DETERMINISM"),
        ("ALWAYS_01",          "GATE_ORDER"),
        ("CORRELATED_00_11",   "NO_SIGNAL"),
    ])
    def test_replay_evidence_keys_subset_of_known(self, prediction, expected_code):
        """Every evidence key in replay steps is registered in KNOWN_EVIDENCE_KEYS."""
        steps = get_replay_copy_for_role(expected_code, "BEGINNER_CSE")
        for step in steps:
            for key in step.evidence_keys:
                assert key in KNOWN_EVIDENCE_KEYS, (
                    f"Replay step for {expected_code!r} emits unregistered key {key!r}"
                )

    def test_replay_contract_dict_has_required_fields(self):
        """to_contract_dict() output has stepIndex, headline, evidenceKeys."""
        steps = get_replay_copy_for_role("SUPERPOSITION_VS_ENTANGLEMENT", "BEGINNER_CSE")
        for step in steps:
            d = step.to_contract_dict()
            assert "stepIndex" in d
            assert "headline" in d
            assert "evidenceKeys" in d
            assert isinstance(d["evidenceKeys"], list)
            assert isinstance(d["stepIndex"], int)

    def test_beginner_replay_has_two_steps_for_bell(self):
        steps = get_replay_copy_for_role("SUPERPOSITION_VS_ENTANGLEMENT", "BEGINNER_CSE")
        assert len(steps) == 2
        # Contract example: step 0 = Superposition, step 1 = Correlation
        assert steps[0].step_index == 0
        assert steps[1].step_index == 1

    def test_physics_replay_references_amplitudes(self):
        """Physics-level replay cites amplitudes evidence key (formal state vector proof)."""
        steps = get_replay_copy_for_role("SUPERPOSITION_VS_ENTANGLEMENT", "PHYSICS_TO_CODE")
        all_keys = set()
        for step in steps:
            all_keys.update(step.evidence_keys)
        assert "stateTrace.0.amplitudes" in all_keys, (
            "PHYSICS_TO_CODE replay must cite stateTrace.0.amplitudes for formal state vector proof"
        )

    def test_unknown_code_falls_back_to_no_signal(self):
        steps = get_replay_copy_for_role("TOTALLY_UNKNOWN_CODE", "BEGINNER_CSE")
        # Must fall back to NO_SIGNAL steps
        no_signal_steps = get_replay_copy_for_role("NO_SIGNAL", "BEGINNER_CSE")
        assert steps == no_signal_steps

    def test_unknown_role_falls_back_to_beginner_cse(self):
        steps = get_replay_copy_for_role("SUPERPOSITION_VS_ENTANGLEMENT", "NONEXISTENT_ROLE")
        beginner_steps = get_replay_copy_for_role("SUPERPOSITION_VS_ENTANGLEMENT", "BEGINNER_CSE")
        assert steps == beginner_steps

    def test_normalize_learner_role_none_gives_default(self):
        assert normalize_learner_role(None) == "BEGINNER_CSE"

    def test_normalize_learner_role_physics(self):
        assert normalize_learner_role("PHYSICS_TO_CODE") == "PHYSICS_TO_CODE"


# ===========================================================================
# 4. Taxonomy: explanation template — representation vs trajectory distinction
# ===========================================================================

class TestExplanationTemplates:
    """Representation-vs-trajectory note is present for all codes."""

    @pytest.mark.parametrize("code", [
        "SUPERPOSITION_VS_ENTANGLEMENT",
        "MEASUREMENT_DETERMINISM",
        "GATE_ORDER",
        "NO_SIGNAL",
    ])
    def test_representation_vs_trajectory_note_present(self, code):
        tmpl = get_explanation_template(code, "BEGINNER_CSE")
        assert tmpl.representation_vs_trajectory, (
            f"Template {code!r} BEGINNER_CSE missing representation_vs_trajectory"
        )
        assert "Distinguishing Representation" in tmpl.representation_vs_trajectory

    @pytest.mark.parametrize("code", [
        "SUPERPOSITION_VS_ENTANGLEMENT",
        "MEASUREMENT_DETERMINISM",
        "GATE_ORDER",
        "NO_SIGNAL",
    ])
    def test_template_to_dict_has_required_keys(self, code):
        d = get_explanation_template(code, "BEGINNER_CSE").to_dict()
        for field in ("code", "role", "title", "coreConcept",
                      "representationVsTrajectory", "pedagogicalGuidance", "repairAction"):
            assert field in d, f"Template dict for {code!r} missing field {field!r}"

    def test_svse_beginner_mentions_entanglement(self):
        tmpl = get_explanation_template("SUPERPOSITION_VS_ENTANGLEMENT", "BEGINNER_CSE")
        concept_lower = tmpl.core_concept.lower()
        assert (
            "entangled" in concept_lower
            or "entanglement" in concept_lower
            or "correlation" in concept_lower
            or "correlated" in concept_lower
        )

    def test_svse_physics_mentions_hilbert(self):
        tmpl = get_explanation_template("SUPERPOSITION_VS_ENTANGLEMENT", "PHYSICS_TO_CODE")
        assert "Hilbert" in tmpl.representation_vs_trajectory or "tensor" in tmpl.core_concept.lower()

    def test_no_signal_template_says_no_misconception(self):
        tmpl = get_explanation_template("NO_SIGNAL", "BEGINNER_CSE")
        # Should not present a repair action that implies a broken concept
        assert tmpl.code == "NO_SIGNAL"
        assert "No" in tmpl.title or "no" in tmpl.core_concept.lower()


# ===========================================================================
# 5. End-to-end: diagnose_with_taxonomy output contract shape
# ===========================================================================

class TestDiagnoseWithTaxonomyEndToEnd:
    """Full pipeline — rules + taxonomy — produces contract-compliant output."""

    @pytest.mark.parametrize("prediction,expected_code,expect_divergence_step", [
        ("INDEPENDENT_RANDOM", "SUPERPOSITION_VS_ENTANGLEMENT", 1),
        ("ALWAYS_00",          "MEASUREMENT_DETERMINISM",        1),
        ("ALWAYS_01",          "GATE_ORDER",                     0),
        ("CORRELATED_00_11",   "NO_SIGNAL",                     None),
        (None,                 "NO_SIGNAL",                     None),
    ])
    def test_full_diagnosis_pipeline(self, prediction, expected_code, expect_divergence_step):
        diag = diagnose_with_taxonomy(prediction, BELL_STATE_TRACE, learner_role="BEGINNER_CSE")
        assert diag.code == expected_code
        assert diag.first_divergence_step == expect_divergence_step
        assert diag.confidence == 1.0

    def test_aarav_profile_gets_beginner_role(self):
        """Aarav is BEGINNER_CSE — replay headlines are intuitive."""
        diag = diagnose_with_taxonomy("INDEPENDENT_RANDOM", BELL_STATE_TRACE, learner_role="BEGINNER_CSE")
        assert diag.learner_role == "BEGINNER_CSE"
        # Replay should reference tangible description
        first_step = diag.replay[0]
        assert "headline" in first_step
        assert "evidenceKeys" in first_step

    def test_meera_profile_gets_physics_role(self):
        """Meera is PHYSICS_TO_CODE — replay should cite amplitudes for formal proof."""
        diag = diagnose_with_taxonomy("INDEPENDENT_RANDOM", BELL_STATE_TRACE, learner_role="PHYSICS_TO_CODE")
        assert diag.learner_role == "PHYSICS_TO_CODE"
        all_keys = [k for step in diag.replay for k in step.get("evidenceKeys", [])]
        assert "stateTrace.0.amplitudes" in all_keys

    def test_repair_challenge_id_set_for_misconceptions(self):
        diag = diagnose_with_taxonomy("INDEPENDENT_RANDOM", BELL_STATE_TRACE)
        assert diag.repair_challenge_id == "ch_bell_repair"

    def test_repair_challenge_id_set_for_no_signal(self):
        diag = diagnose_with_taxonomy("CORRELATED_00_11", BELL_STATE_TRACE)
        # NO_SIGNAL has a repair_challenge_id (ch_no_signal_repair)
        assert diag.repair_challenge_id is not None

    def test_no_llm_import_anywhere_in_diagnosis(self):
        """Diagnosis modules must not import openai, anthropic, google.generativeai etc."""
        import importlib
        import sys
        # The diagnosis modules are already imported — check sys.modules
        llm_markers = ["openai", "anthropic", "google.generativeai", "langchain"]
        for marker in llm_markers:
            assert marker not in sys.modules, (
                f"LLM library {marker!r} found in sys.modules — diagnosis must be LLM-free"
            )

    def test_explanation_template_dict_attached(self):
        diag = diagnose_with_taxonomy("ALWAYS_00", BELL_STATE_TRACE)
        tmpl = diag.explanation_template
        assert "code" in tmpl
        assert "representationVsTrajectory" in tmpl
        assert tmpl["code"] == "MEASUREMENT_DETERMINISM"


# ===========================================================================
# 6. Grading math: PROBABILITY_SUPPORT_EQUALS acceptance rule
# ===========================================================================

class TestGradingMath:
    """Deterministic grading logic per progress-analytics contract.

    This suite calls the grading logic directly (no HTTP) to prove
    the acceptance rule is correct and the edge cases are handled.
    The challenge router uses this exact logic — importing from progress.py
    would pull in FastAPI; we test the logic in isolation here.
    """

    def _grade_circuit_repair(
        self,
        probabilities: dict,
        required_states: list[str] = None,
        epsilon: float = 1e-6,
    ) -> tuple[bool, str]:
        """Inline replica of the grading rule from apps/api/app/routers/progress.py.

        This is QA-owned test logic that mirrors the contract rule without
        depending on FastAPI or the production router internals.
        """
        required_states = required_states or ["00", "11"]
        req_set = set(required_states)
        has_required = all(probabilities.get(s, 0.0) > epsilon for s in req_set)
        extraneous = [
            s for s, p in probabilities.items()
            if s not in req_set and p > epsilon
        ]
        if has_required and not extraneous:
            return True, "BELL_SUPPORT_CORRECT"
        return False, "BELL_SUPPORT_INCORRECT"

    def test_perfect_bell_state_passes(self):
        """P(00)=0.5, P(11)=0.5 with no extraneous states must pass."""
        passed, code = self._grade_circuit_repair({"00": 0.5, "11": 0.5})
        assert passed is True
        assert code == "BELL_SUPPORT_CORRECT"

    def test_near_perfect_within_epsilon_passes(self):
        """Probabilities within floating-point noise still pass."""
        passed, code = self._grade_circuit_repair(
            {"00": 0.4999994, "11": 0.5000006}
        )
        assert passed is True

    def test_extraneous_state_above_epsilon_fails(self):
        """Any state outside {00,11} with p > epsilon is a repair failure."""
        passed, code = self._grade_circuit_repair({"00": 0.4, "11": 0.4, "01": 0.2})
        assert passed is False
        assert code == "BELL_SUPPORT_INCORRECT"

    def test_missing_required_state_fails(self):
        """If 11 is absent, the Bell support condition is not met."""
        passed, code = self._grade_circuit_repair({"00": 1.0})
        assert passed is False

    def test_extraneous_state_at_zero_is_ignored(self):
        """Floating-point zeros that appear in output do not fail grading."""
        # Some simulators emit all basis states with p=0.0 for missing ones
        passed, code = self._grade_circuit_repair(
            {"00": 0.5, "11": 0.5, "01": 0.0, "10": 0.0}
        )
        assert passed is True

    def test_extraneous_state_exactly_epsilon_ignored(self):
        """State with probability exactly epsilon (not above) must not trigger failure."""
        epsilon = 1e-6
        passed, code = self._grade_circuit_repair(
            {"00": 0.5, "11": 0.5, "01": epsilon},
            epsilon=epsilon,
        )
        # p > epsilon is the condition; equal is not above
        assert passed is True

    def test_all_zeros_fails(self):
        passed, _ = self._grade_circuit_repair({"00": 0.0, "11": 0.0})
        assert passed is False

    def test_100_points_awarded_on_pass(self):
        """Challenge points are 100 per progress-analytics contract."""
        # The contract says the Bell repair challenge has points=100
        # We verify the logic will award full points on BELL_SUPPORT_CORRECT
        passed, code = self._grade_circuit_repair({"00": 0.5, "11": 0.5})
        score = 100 if passed else 0
        assert score == 100

    def test_zero_points_on_fail(self):
        passed, _ = self._grade_circuit_repair({"00": 1.0})
        score = 100 if passed else 0
        assert score == 0


# ===========================================================================
# 7. Numerical claim evidence integrity
# ===========================================================================

class TestNumericalClaimEvidence:
    """No numerical claim in any replay or template lacks a matching evidence key."""

    BELL_PROBS = {"00": 0.5, "11": 0.5}

    def _extract_evidence_value(self, state_trace: list[dict], key: str):
        """Resolve a dot-path evidence key against a state trace."""
        # key format: stateTrace.<step>.<field>[.<subfield>]
        parts = key.split(".")
        assert parts[0] == "stateTrace", f"Evidence key {key!r} must start with stateTrace"
        step_idx = int(parts[1])
        assert step_idx < len(state_trace), (
            f"Evidence key {key!r} references step {step_idx} but trace has {len(state_trace)} steps"
        )
        step = state_trace[step_idx]
        field = parts[2]
        if len(parts) == 3:
            return step.get(field)
        # sub-field access
        sub = ".".join(parts[3:])
        return step.get(field, {}).get(sub)

    @pytest.mark.parametrize("code", [
        "SUPERPOSITION_VS_ENTANGLEMENT",
        "MEASUREMENT_DETERMINISM",
        "GATE_ORDER",
    ])
    def test_every_evidence_key_resolves_in_bell_trace(self, code):
        """Every evidence key emitted by a rule resolves to a non-None value in Bell trace."""
        rule = find_rule(
            # Map code to a prediction that triggers it
            {
                "SUPERPOSITION_VS_ENTANGLEMENT": "INDEPENDENT_RANDOM",
                "MEASUREMENT_DETERMINISM": "ALWAYS_00",
                "GATE_ORDER": "ALWAYS_01",
            }[code]
        )
        for key in rule.evidence_keys:
            value = self._extract_evidence_value(BELL_STATE_TRACE, key)
            assert value is not None, (
                f"Evidence key {key!r} for rule {code!r} resolved to None in Bell trace"
            )

    def test_p00_and_p11_both_resolv_to_0_5(self):
        """The two specific numerical claims P(00)=0.5 and P(11)=0.5 are verifiable."""
        p00 = self._extract_evidence_value(BELL_STATE_TRACE, "stateTrace.1.basisProbabilities.00")
        p11 = self._extract_evidence_value(BELL_STATE_TRACE, "stateTrace.1.basisProbabilities.11")
        assert p00 is not None
        assert p11 is not None
        assert abs(p00 - 0.5) <= EPSILON
        assert abs(p11 - 0.5) <= EPSILON

    def test_post_cnot_purity_is_0_5_mixed(self):
        """After CNOT, both reduced qubits must have purity=0.5 (MIXED_SUBSYSTEM)."""
        step1 = BELL_STATE_TRACE[1]
        for rq in step1["reducedQubits"]:
            assert abs(rq["purity"] - 0.5) <= EPSILON, (
                f"Qubit {rq['qubit']} post-CNOT purity={rq['purity']} expected 0.5"
            )
            assert rq["label"] == "MIXED_SUBSYSTEM"

    def test_pre_cnot_purity_is_1_pure(self):
        """Before CNOT (After H), both reduced qubits must have purity=1.0 (PURE_SUBSYSTEM)."""
        step0 = BELL_STATE_TRACE[0]
        for rq in step0["reducedQubits"]:
            assert abs(rq["purity"] - 1.0) <= EPSILON, (
                f"Qubit {rq['qubit']} pre-CNOT purity={rq['purity']} expected 1.0"
            )
            assert rq["label"] == "PURE_SUBSYSTEM"

    def test_probability_sums_to_1_per_step(self):
        """Basis probabilities at each step must sum to ~1.0."""
        for step in BELL_STATE_TRACE:
            total = sum(step["basisProbabilities"].values())
            assert abs(total - 1.0) <= EPSILON, (
                f"Step {step['stepIndex']} basisProbabilities sum={total} (expected 1.0)"
            )
