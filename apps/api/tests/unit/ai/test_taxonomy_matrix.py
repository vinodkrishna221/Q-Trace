"""
AI-4 Test Suite — Complete Misconception Taxonomy Matrix and Replay Copy
========================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-4
Branch:  feat/ai-pedagogy/ai-4-complete-the-misconception-taxonomy-and
Run:     uv run --project apps/api pytest apps/api/tests/unit/ai/test_taxonomy_matrix.py

Assertions:
  1. Matrix exhaustiveness: every prediction option x every learner role executes
     without unhandled branches.
  2. All four MisconceptionCodes are fully covered with deterministic rules,
     targeted repair challenge IDs, and verified divergence steps.
  3. Replay copy is explicitly tailored and differentiated between Aarav (BEGINNER_CSE)
     and Meera (PHYSICS_TO_CODE).
  4. Every explanation template explicitly distinguishes state representation
     from physical spatial trajectory.
  5. Measurement determinism and gate order rules and copy are verified in detail.
  6. No-signal behavior correctly handles correct predictions, missing predictions,
     and unrecognized inputs with null divergence step.
  7. All emitted evidence keys belong strictly to KNOWN_EVIDENCE_KEYS.
  8. Contract replay structure conforms to flight-recorder-tutor contract v1.
"""

from __future__ import annotations

import pytest

from app.services.diagnosis import (
    DEFAULT_LEARNER_ROLE,
    EXPLANATION_TEMPLATES,
    KNOWN_EVIDENCE_KEYS,
    KNOWN_LEARNER_ROLES,
    KNOWN_MISCONCEPTION_CODES,
    REPLAY_COPY_TABLE,
    ExplanationTemplate,
    ReplayStepCopy,
    TaxonomyDiagnosis,
    build_contract_replay,
    diagnose_with_taxonomy,
    get_explanation_template,
    get_replay_copy_for_role,
    normalize_learner_role,
)

# ---------------------------------------------------------------------------
# Canonical Bell State Trace Fixture (from circuit-simulation contract v1)
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
# Matrix Test Parameters
# ---------------------------------------------------------------------------

ALL_PREDICTION_OPTIONS = [
    ("INDEPENDENT_RANDOM", "SUPERPOSITION_VS_ENTANGLEMENT", 1, "ch_bell_repair"),
    ("ALWAYS_00", "MEASUREMENT_DETERMINISM", 1, "ch_measurement_repair"),
    ("ALWAYS_11", "MEASUREMENT_DETERMINISM", 1, "ch_measurement_repair"),
    ("ALWAYS_01", "GATE_ORDER", 0, "ch_gate_order_repair"),
    ("ALWAYS_10", "GATE_ORDER", 0, "ch_gate_order_repair"),
    ("CORRELATED_00_11", "NO_SIGNAL", None, "ch_no_signal_repair"),
    (None, "NO_SIGNAL", None, "ch_no_signal_repair"),
    ("UNKNOWN_PREDICTION_XYZ", "NO_SIGNAL", None, "ch_no_signal_repair"),
]

ALL_ROLES = [
    "BEGINNER_CSE",
    "PHYSICS_TO_CODE",
    None,
    "INVALID_ROLE",
]


# ---------------------------------------------------------------------------
# 1. Full Matrix Coverage: Every Prediction Option x Every Learner Role
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "prediction, expected_code, expected_first_divergence, expected_challenge_id",
    ALL_PREDICTION_OPTIONS,
)
@pytest.mark.parametrize("role", ALL_ROLES)
def test_full_taxonomy_matrix_coverage(
    prediction: str | None,
    expected_code: str,
    expected_first_divergence: int | None,
    expected_challenge_id: str,
    role: str | None,
) -> None:
    """Executes every combination of prediction and learner role, asserting no
    unhandled branches, valid contract structures, and registered evidence keys."""
    diag: TaxonomyDiagnosis = diagnose_with_taxonomy(
        prediction_answer=prediction,
        state_trace=BELL_STATE_TRACE,
        learner_role=role,
    )

    # Core diagnosis assertions
    assert diag.code == expected_code
    assert diag.first_divergence_step == expected_first_divergence
    assert diag.repair_challenge_id == expected_challenge_id
    assert diag.confidence == 1.0

    # Role normalization check
    expected_normalized_role = (
        role if role in KNOWN_LEARNER_ROLES else DEFAULT_LEARNER_ROLE
    )
    assert diag.learner_role == expected_normalized_role

    # Replay steps structure
    assert len(diag.replay) >= 2
    for step in diag.replay:
        assert "stepIndex" in step
        assert "headline" in step and step["headline"]
        assert "evidenceKeys" in step and isinstance(step["evidenceKeys"], list)
        for key in step["evidenceKeys"]:
            assert key in KNOWN_EVIDENCE_KEYS

    # Explanation template structure
    tmpl = diag.explanation_template
    assert tmpl["code"] == expected_code
    assert tmpl["role"] == expected_normalized_role
    assert "coreConcept" in tmpl and tmpl["coreConcept"]
    assert "representationVsTrajectory" in tmpl and tmpl["representationVsTrajectory"]
    assert "pedagogicalGuidance" in tmpl and tmpl["pedagogicalGuidance"]
    assert "repairAction" in tmpl and tmpl["repairAction"]


# ---------------------------------------------------------------------------
# 2. Representation vs Physical Trajectory Distinction
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("code", sorted(KNOWN_MISCONCEPTION_CODES))
@pytest.mark.parametrize("role", ["BEGINNER_CSE", "PHYSICS_TO_CODE"])
def test_explanation_templates_distinguish_representation_from_trajectory(
    code: str,
    role: str,
) -> None:
    """Every explanation template must explicitly distinguish abstract state
    representation (Hilbert space, probabilities, amplitudes) from classical
    physical trajectories."""
    template: ExplanationTemplate = get_explanation_template(code, role)

    note = template.representation_vs_trajectory.lower()
    assert "representation" in note
    assert "trajectory" in note

    # Replay step copies must also embed representation guidance
    copies = get_replay_copy_for_role(code, role)
    for step_copy in copies:
        assert step_copy.representation_note
        assert len(step_copy.representation_note) > 10


# ---------------------------------------------------------------------------
# 3. Learner Role Differentiation (Aarav vs Meera)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("code", sorted(KNOWN_MISCONCEPTION_CODES))
def test_replay_copy_differentiated_by_learner_role(code: str) -> None:
    """Aarav (BEGINNER_CSE) and Meera (PHYSICS_TO_CODE) must receive distinctly
    tailored copy appropriate to their background."""
    aarav_copy = get_replay_copy_for_role(code, "BEGINNER_CSE")
    meera_copy = get_replay_copy_for_role(code, "PHYSICS_TO_CODE")

    assert len(aarav_copy) == len(meera_copy)

    for a_step, m_step in zip(aarav_copy, meera_copy):
        # Headlines and learner copy must differ to provide tailored pedagogy
        assert a_step.headline != m_step.headline
        assert a_step.learner_copy != m_step.learner_copy

    # Template differentiation
    aarav_tmpl = get_explanation_template(code, "BEGINNER_CSE")
    meera_tmpl = get_explanation_template(code, "PHYSICS_TO_CODE")
    assert aarav_tmpl.core_concept != meera_tmpl.core_concept
    assert aarav_tmpl.pedagogical_guidance != meera_tmpl.pedagogical_guidance


# ---------------------------------------------------------------------------
# 4. Specific Misconception: Measurement Determinism
# ---------------------------------------------------------------------------

def test_measurement_determinism_details() -> None:
    """Test measurement determinism rules, divergence step, and challenge ID."""
    for pred in ("ALWAYS_00", "ALWAYS_11"):
        diag = diagnose_with_taxonomy(pred, BELL_STATE_TRACE, "BEGINNER_CSE")
        assert diag.code == "MEASUREMENT_DETERMINISM"
        assert diag.first_divergence_step == 1
        assert diag.repair_challenge_id == "ch_measurement_repair"
        assert "stateTrace.1.basisProbabilities.00" in diag.evidence_keys
        assert "stateTrace.1.basisProbabilities.11" in diag.evidence_keys

        # Verification of contract replay format
        contract_replay = build_contract_replay(diag.code, "BEGINNER_CSE", BELL_STATE_TRACE)
        assert len(contract_replay) == 2
        assert contract_replay[1]["stepIndex"] == 1
        assert "Probabilistic" in contract_replay[1]["headline"]


# ---------------------------------------------------------------------------
# 5. Specific Misconception: Gate Order
# ---------------------------------------------------------------------------

def test_gate_order_details() -> None:
    """Test gate order rules, first divergence at step 0, and repair challenge."""
    for pred in ("ALWAYS_01", "ALWAYS_10"):
        diag = diagnose_with_taxonomy(pred, BELL_STATE_TRACE, "PHYSICS_TO_CODE")
        assert diag.code == "GATE_ORDER"
        assert diag.first_divergence_step == 0
        assert diag.repair_challenge_id == "ch_gate_order_repair"
        assert "stateTrace.0.basisProbabilities" in diag.evidence_keys

        # Meera should see non-commutative operator explanation
        template = get_explanation_template(diag.code, "PHYSICS_TO_CODE")
        assert "non-commutat" in template.title.lower() or "non-commutat" in template.core_concept.lower() or "non-commutat" in template.pedagogical_guidance.lower()


# ---------------------------------------------------------------------------
# 6. Specific Misconception: Superposition vs Entanglement
# ---------------------------------------------------------------------------

def test_superposition_vs_entanglement_details() -> None:
    """Test superposition vs entanglement rule, divergence at step 1, and Bell repair."""
    diag = diagnose_with_taxonomy("INDEPENDENT_RANDOM", BELL_STATE_TRACE, "BEGINNER_CSE")
    assert diag.code == "SUPERPOSITION_VS_ENTANGLEMENT"
    assert diag.first_divergence_step == 1
    assert diag.repair_challenge_id == "ch_bell_repair"
    assert "stateTrace.0.basisProbabilities" in diag.evidence_keys
    assert "stateTrace.1.basisProbabilities" in diag.evidence_keys
    assert "stateTrace.1.reducedQubits" in diag.evidence_keys


# ---------------------------------------------------------------------------
# 7. No-Signal Behavior for Correct / Missing / Garbage Predictions
# ---------------------------------------------------------------------------

def test_no_signal_behavior() -> None:
    """Correct predictions and missing predictions return NO_SIGNAL with null divergence."""
    # Correct prediction
    diag_correct = diagnose_with_taxonomy("CORRELATED_00_11", BELL_STATE_TRACE, "BEGINNER_CSE")
    assert diag_correct.code == "NO_SIGNAL"
    assert diag_correct.first_divergence_step is None
    assert diag_correct.repair_challenge_id == "ch_no_signal_repair"

    # None prediction
    diag_none = diagnose_with_taxonomy(None, BELL_STATE_TRACE, "PHYSICS_TO_CODE")
    assert diag_none.code == "NO_SIGNAL"
    assert diag_none.first_divergence_step is None

    # Garbage / unhandled prediction string
    diag_garbage = diagnose_with_taxonomy("RANDOM_NOISE_123", BELL_STATE_TRACE)
    assert diag_garbage.code == "NO_SIGNAL"
    assert diag_garbage.first_divergence_step is None


# ---------------------------------------------------------------------------
# 8. Error Handling: Empty State Trace
# ---------------------------------------------------------------------------

def test_empty_state_trace_raises_error() -> None:
    """Attempting diagnosis without a state trace must raise a ValueError."""
    with pytest.raises(ValueError, match="state_trace"):
        diagnose_with_taxonomy("INDEPENDENT_RANDOM", [])


# ---------------------------------------------------------------------------
# 9. Role Normalization Safety
# ---------------------------------------------------------------------------

def test_role_normalization() -> None:
    """Normalize function safely maps valid strings and falls back for invalid/None."""
    assert normalize_learner_role("beginner_cse") == "BEGINNER_CSE"
    assert normalize_learner_role("PHYSICS_TO_CODE") == "PHYSICS_TO_CODE"
    assert normalize_learner_role("UNKNOWN") == DEFAULT_LEARNER_ROLE
    assert normalize_learner_role(None) == DEFAULT_LEARNER_ROLE
