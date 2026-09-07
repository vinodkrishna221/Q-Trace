"""
Unit tests for AI-7: Recommend Next Module From Verified Outcomes.
====================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-7
Branch:  feat/ai-pedagogy/ai-7-recommend-the-next-module-from
Test:    uv run --project apps/api pytest apps/api/tests/unit/ai/test_recommendation_rules.py

Verifies:
1. Matrix coverage of pass/fail, misconception codes, modules, and personas.
2. Invariant: nextModuleId is ALWAYS in KNOWN_MODULE_IDS.
3. Remedial mapping on failure (SUPERPOSITION_VS_ENTANGLEMENT -> mod_superposition,
   MEASUREMENT_DETERMINISM -> mod_measurement, GATE_ORDER -> mod_bell, NO_SIGNAL -> current).
4. Sequential advancement on pass (mod_superposition -> mod_measurement -> mod_bell).
5. Persona-specific copy differentiation (Aarav vs Meera).
6. Graceful edge-case handling (unknown modules, unknown codes, None inputs).
7. Feature flag behavior (ENABLE_AI_RECOMMENDATION toggle).
8. Progress record enrichment helper integrity.
9. FastAPI router endpoint integration (/v1/tutor/recommend-module).
"""

from __future__ import annotations

import itertools
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.tutor.recommendation import (
    DEFAULT_MODULE_ID,
    KNOWN_MODULE_IDS,
    MODULE_METADATA,
    ModuleRecommendation,
    ModuleRecommendationResponse,
    enrich_progress_record_with_recommendation,
    is_recommendation_feature_enabled,
    normalize_learner_role,
    normalize_module_id,
    recommend_next_module,
)


# ---------------------------------------------------------------------------
# 1. Exhaustive Combinatorial Matrix Test
# ---------------------------------------------------------------------------


class TestRecommendationMatrix:
    """Exhaustively verify all combinations of outcomes, codes, modules, and personas."""

    OUTCOMES = [True, False]
    MISCONCEPTION_CODES = [
        "SUPERPOSITION_VS_ENTANGLEMENT",
        "MEASUREMENT_DETERMINISM",
        "GATE_ORDER",
        "NO_SIGNAL",
        None,
    ]
    MODULE_IDS = ["mod_superposition", "mod_measurement", "mod_bell"]
    ROLES = ["BEGINNER_CSE", "PHYSICS_TO_CODE"]

    @pytest.mark.parametrize(
        "passed,misconception_code,module_id,role",
        list(itertools.product(OUTCOMES, MISCONCEPTION_CODES, MODULE_IDS, ROLES)),
    )
    def test_all_combinations_return_known_module_ids(
        self,
        passed: bool,
        misconception_code: str | None,
        module_id: str,
        role: str,
    ) -> None:
        rec = recommend_next_module(
            passed=passed,
            misconception_code=misconception_code,
            current_module_id=module_id,
            learner_role=role,
        )

        assert isinstance(rec, ModuleRecommendation)
        # CRITICAL CARD GATE: returns ONLY known Module IDs
        assert rec.nextModuleId in KNOWN_MODULE_IDS, (
            f"nextModuleId '{rec.nextModuleId}' is not in KNOWN_MODULE_IDS"
        )
        assert len(rec.recommendationReason) > 10
        assert isinstance(rec.remedial, bool)
        assert 0.0 <= rec.confidence <= 1.0
        assert rec.featureFlagActive is True
        assert rec.rulesVersion == 1


# ---------------------------------------------------------------------------
# 2. Remedial Failure Mappings
# ---------------------------------------------------------------------------


class TestRemedialFailureRules:
    """Verify pedagogical remediation when learners fail challenges with diagnosed misconceptions."""

    def test_failure_superposition_vs_entanglement_remediates_to_superposition(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
            current_module_id="mod_bell",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_superposition"
        assert rec.remedial is True
        assert rec.targetMisconceptionCode == "SUPERPOSITION_VS_ENTANGLEMENT"
        assert "superposition" in rec.recommendationReason.lower()

    def test_failure_measurement_determinism_remediates_to_measurement(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code="MEASUREMENT_DETERMINISM",
            current_module_id="mod_bell",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_measurement"
        assert rec.remedial is True
        assert rec.targetMisconceptionCode == "MEASUREMENT_DETERMINISM"
        assert "measurement" in rec.recommendationReason.lower()

    def test_failure_gate_order_remediates_within_bell(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code="GATE_ORDER",
            current_module_id="mod_bell",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_bell"
        assert rec.remedial is True
        assert rec.targetMisconceptionCode == "GATE_ORDER"
        assert "gate ordering" in rec.recommendationReason.lower()

    def test_failure_no_signal_stays_on_current_module(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code="NO_SIGNAL",
            current_module_id="mod_superposition",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_superposition"
        assert rec.remedial is True
        assert "simulation state trace" in rec.recommendationReason.lower()

    def test_failure_none_signal_stays_on_current_module(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code=None,
            current_module_id="mod_measurement",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_measurement"
        assert rec.remedial is True


# ---------------------------------------------------------------------------
# 3. Advancement Success Mappings
# ---------------------------------------------------------------------------


class TestAdvancementRules:
    """Verify progressive curriculum advancement when challenges are completed."""

    def test_pass_superposition_advances_to_measurement(self) -> None:
        rec = recommend_next_module(
            passed=True,
            current_module_id="mod_superposition",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_measurement"
        assert rec.remedial is False
        assert "superposition mastered" in rec.recommendationReason.lower()

    def test_pass_measurement_advances_to_bell(self) -> None:
        rec = recommend_next_module(
            passed=True,
            current_module_id="mod_measurement",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_bell"
        assert rec.remedial is False
        assert "bell-state lab" in rec.recommendationReason.lower()

    def test_pass_bell_completes_foundation_path(self) -> None:
        rec = recommend_next_module(
            passed=True,
            current_module_id="mod_bell",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_bell"
        assert rec.remedial is False
        assert "complete" in rec.recommendationReason.lower()

    def test_pass_bell_with_repaired_misconception_acknowledges_repair(self) -> None:
        rec = recommend_next_module(
            passed=True,
            misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
            current_module_id="mod_bell",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId == "mod_bell"
        assert rec.remedial is False
        assert "repaired" in rec.recommendationReason.lower()


# ---------------------------------------------------------------------------
# 4. Persona Tailoring (Aarav vs Meera)
# ---------------------------------------------------------------------------


class TestPersonaTailoring:
    """Verify copy is adapted between beginner CSE and physics-to-code learners."""

    def test_aarav_copy_focuses_on_code_and_observable_behavior(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
            current_module_id="mod_bell",
            learner_role="BEGINNER_CSE",
        )
        assert "random qubits differ from correlated two-qubit pairs" in rec.recommendationReason
        assert "tensor product" not in rec.recommendationReason

    def test_meera_copy_focuses_on_formal_physics_and_linear_algebra(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
            current_module_id="mod_bell",
            learner_role="PHYSICS_TO_CODE",
        )
        assert "tensor product factorization" in rec.recommendationReason
        assert "|ψA⟩ ⊗ |ψB⟩" in rec.recommendationReason

    def test_measurement_determinism_persona_difference(self) -> None:
        rec_aarav = recommend_next_module(
            passed=False,
            misconception_code="MEASUREMENT_DETERMINISM",
            learner_role="BEGINNER_CSE",
        )
        rec_meera = recommend_next_module(
            passed=False,
            misconception_code="MEASUREMENT_DETERMINISM",
            learner_role="PHYSICS_TO_CODE",
        )
        assert "verified frequencies" in rec_aarav.recommendationReason
        assert "Born's rule" in rec_meera.recommendationReason
        assert "projection operators" in rec_meera.recommendationReason

    def test_gate_order_persona_difference(self) -> None:
        rec_aarav = recommend_next_module(
            passed=False,
            misconception_code="GATE_ORDER",
            learner_role="BEGINNER_CSE",
        )
        rec_meera = recommend_next_module(
            passed=False,
            misconception_code="GATE_ORDER",
            learner_role="PHYSICS_TO_CODE",
        )
        assert "Hadamard gate must execute first" in rec_aarav.recommendationReason
        assert "non-commutative" in rec_meera.recommendationReason


# ---------------------------------------------------------------------------
# 5. Robustness & Edge Cases
# ---------------------------------------------------------------------------


class TestRobustnessAndEdgeCases:
    """Verify unexpected inputs and edge cases are handled deterministically without crashes."""

    def test_unknown_module_id_safely_falls_back_to_known_module(self) -> None:
        rec = recommend_next_module(
            passed=False,
            current_module_id="mod_teleportation_unknown",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId in KNOWN_MODULE_IDS

    def test_unknown_misconception_code_treated_as_no_signal(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code="UNKNOWN_QUANTUM_CONFUSION",
            current_module_id="mod_bell",
            learner_role="BEGINNER_CSE",
        )
        assert rec.nextModuleId in KNOWN_MODULE_IDS
        assert rec.remedial is True

    def test_none_current_module_resolved_from_challenge_id(self) -> None:
        rec = recommend_next_module(
            passed=True,
            current_module_id=None,
            challenge_id="ch_superposition_quiz",
        )
        assert rec.nextModuleId == "mod_measurement"

    def test_invalid_role_defaults_to_beginner_cse(self) -> None:
        assert normalize_learner_role("ADVANCED_POSTDOC") == "BEGINNER_CSE"
        assert normalize_learner_role(None) == "BEGINNER_CSE"

    def test_module_normalization_helper(self) -> None:
        assert normalize_module_id("mod_bell") == "mod_bell"
        assert normalize_module_id(None, "ch_superposition_quiz") == "mod_superposition"
        assert normalize_module_id("invalid", "ch_measurement_quiz") == "mod_measurement"
        assert normalize_module_id(None, None) == DEFAULT_MODULE_ID


# ---------------------------------------------------------------------------
# 6. Feature Flag Behavior
# ---------------------------------------------------------------------------


class TestFeatureFlag:
    """Verify recommendation feature flag disables dynamic logic and provides linear baseline."""

    def test_feature_flag_disabled_returns_linear_baseline(self) -> None:
        rec = recommend_next_module(
            passed=False,
            misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
            current_module_id="mod_superposition",
            force_feature_flag=False,
        )
        assert rec.featureFlagActive is False
        assert rec.remedial is False
        assert rec.nextModuleId == "mod_measurement"
        assert "Standard curriculum progression" in rec.recommendationReason

    def test_is_recommendation_feature_enabled_env(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("ENABLE_AI_RECOMMENDATION", "1")
        assert is_recommendation_feature_enabled() is True

        monkeypatch.setenv("ENABLE_AI_RECOMMENDATION", "0")
        assert is_recommendation_feature_enabled() is False

        monkeypatch.setenv("ENABLE_AI_RECOMMENDATION", "false")
        assert is_recommendation_feature_enabled() is False


# ---------------------------------------------------------------------------
# 7. Progress Record Enrichment Helper
# ---------------------------------------------------------------------------


class TestProgressRecordEnrichment:
    """Verify enrichment preserves original progress record and adds recommendation."""

    def test_enrich_progress_record_preserves_keys(self) -> None:
        base_record = {
            "id": "progress_lp_aarav",
            "learnerProfileId": "lp_aarav",
            "completedModuleIds": ["mod_superposition"],
            "totalPoints": 50,
        }
        rec = recommend_next_module(
            passed=True,
            current_module_id="mod_superposition",
            learner_role="BEGINNER_CSE",
        )
        enriched = enrich_progress_record_with_recommendation(base_record, rec)

        assert enriched["id"] == "progress_lp_aarav"
        assert enriched["totalPoints"] == 50
        assert "nextRecommendedModule" in enriched
        assert enriched["nextRecommendedModule"]["moduleId"] == "mod_measurement"
        assert enriched["nextRecommendedModule"]["remedial"] is False
        assert base_record != enriched  # original dict not mutated directly


# ---------------------------------------------------------------------------
# 8. Tutor Router API Endpoint Integration
# ---------------------------------------------------------------------------


@pytest.mark.anyio
class TestTutorRecommendationRouterEndpoint:
    """Verify POST /v1/tutor/recommend-module endpoint in FastAPI application."""

    async def test_recommend_module_endpoint_success(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "learnerProfileId": "lp_aarav",
                "passed": False,
                "misconceptionCode": "SUPERPOSITION_VS_ENTANGLEMENT",
                "currentModuleId": "mod_bell",
                "challengeId": "ch_bell_repair",
                "learnerRole": "BEGINNER_CSE",
            }
            response = await client.post("/v1/tutor/recommend-module", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert "recommendation" in data
            rec = data["recommendation"]
            assert rec["nextModuleId"] in KNOWN_MODULE_IDS
            assert rec["nextModuleId"] == "mod_superposition"
            assert rec["remedial"] is True
            assert rec["targetMisconceptionCode"] == "SUPERPOSITION_VS_ENTANGLEMENT"

    async def test_recommend_module_endpoint_advancement(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "learnerProfileId": "lp_meera",
                "passed": True,
                "currentModuleId": "mod_superposition",
                "challengeId": "ch_superposition_quiz",
                "learnerRole": "PHYSICS_TO_CODE",
            }
            response = await client.post("/v1/tutor/recommend-module", json=payload)
            assert response.status_code == 200
            data = response.json()
            rec = data["recommendation"]
            assert rec["nextModuleId"] == "mod_measurement"
            assert rec["remedial"] is False
            assert "projective measurement" in rec["recommendationReason"]
