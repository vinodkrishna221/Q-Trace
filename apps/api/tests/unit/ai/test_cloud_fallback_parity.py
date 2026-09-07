"""
Unit and Contract Tests for Q-Trace Cloud and Fallback Parity.
==============================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-6
Branch:  feat/ai-pedagogy/ai-6-prove-cloud-and-fallback-parity
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md

Verifies:
1. Both Cloud and Fallback modes cite the same trace steps and repair challenge.
2. Parity holds across all canonical parity fixtures (superposition, measurement, gate order, no-signal).
3. Provider and Fallback Badges correctly track mode transitions (cloud verified, timeout, 429, malformed, evidence invalid).
4. Redacted telemetry scrubs API keys, bearer tokens, and secret identifiers while emitting structured [llm] logs.
5. Drill script executes all 7 failover transitions with zero crashes and 100% parity preservation.
6. HTTP POST /v1/tutor/explain endpoint delivers identical trace step citations, repair challenge, and badge payload.
"""

from __future__ import annotations

import copy
import os
from typing import Any, Dict, List
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.repositories import get_repository, seed_core_truth
from app.routers.tutor import (
    BELL_MISCONCEPTION_SIGNAL_FIXTURE,
    BELL_SIMULATION_RUN_FIXTURE,
)
from app.services.tutor import (
    FakeTutorProvider,
    PARITY_FIXTURES,
    TutorService,
    compute_tutor_badge,
    default_tutor_service,
    extract_cited_step_indexes,
    run_tutor_resilience_drill,
    telemetry,
    verify_cloud_fallback_parity,
)
from app.services.tutor.telemetry import redact_sensitive_text


@pytest.fixture(autouse=True)
async def seed_truth():
    """Ensure core repository truth is seeded before each test."""
    repo = get_repository()
    await seed_core_truth(repo)
    telemetry.clear()


# ==============================================================================
# 1. Core Parity Verification: Cloud vs Fallback
# ==============================================================================

@pytest.mark.asyncio
async def test_bell_superposition_cloud_and_fallback_parity():
    """Proves both cloud and fallback modes cite the same trace steps and repair challenge."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="success", model="qtrace-tutor-v1")
    service = TutorService(provider=provider)

    # 1. Cloud response
    cloud_resp = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=False,
    )

    # 2. Fallback response
    fallback_resp = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=True,
    )

    # 3. Assert parity verification
    parity = verify_cloud_fallback_parity(cloud_resp, fallback_resp)
    assert parity.isParity is True, f"Parity discrepancies found: {parity.discrepancies}"
    assert parity.repairChallengeMatch is True
    assert parity.stepIndexesMatch is True
    assert parity.intentMatch is True

    # 4. Exact trace steps and challenge
    assert parity.repairChallengeId == "ch_bell_repair"
    assert parity.cloudStepIndexes == [0, 1]
    assert parity.fallbackStepIndexes == [0, 1]

    # 5. Badges
    assert cloud_resp["badge"]["badgeType"] == "CLOUD_VERIFIED"
    assert cloud_resp["badge"]["label"] == "Cloud (Verified)"
    assert cloud_resp["fallbackUsed"] is False

    assert fallback_resp["badge"]["badgeType"] == "FALLBACK_CURATED"
    assert fallback_resp["badge"]["label"] == "Curated Fallback"
    assert fallback_resp["fallbackUsed"] is True


@pytest.mark.asyncio
async def test_all_parity_fixtures_preserve_trace_steps_and_repair_challenge():
    """Proves parity across all canonical learner misconception scenarios."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="success", model="qtrace-parity-eval")
    service = TutorService(provider=provider)

    for fix in PARITY_FIXTURES:
        code = fix["misconceptionCode"]
        expected_steps = fix["expectedStepIndexes"]
        expected_challenge = fix["expectedRepairChallengeId"]

        # Cloud mode
        cloud_resp = await service.generate_explanation(
            state_trace=trace,
            learner_profile_id=fix["learnerProfileId"],
            module_id=fix["moduleId"],
            misconception_code=code,
            intent=fix["intent"],
            force_fallback=False,
        )

        # Fallback mode
        fallback_resp = await service.generate_explanation(
            state_trace=trace,
            learner_profile_id=fix["learnerProfileId"],
            module_id=fix["moduleId"],
            misconception_code=code,
            intent=fix["intent"],
            force_fallback=True,
        )

        # Both modes must yield the exact same repair challenge and trace steps
        assert cloud_resp["repairChallengeId"] == expected_challenge
        assert fallback_resp["repairChallengeId"] == expected_challenge

        cloud_steps = extract_cited_step_indexes(cloud_resp)
        fallback_steps = extract_cited_step_indexes(fallback_resp)

        assert cloud_steps == fallback_steps == expected_steps, (
            f"Step mismatch for {fix['id']}: cloud={cloud_steps}, fallback={fallback_steps}, expected={expected_steps}"
        )


# ==============================================================================
# 2. Provider and Fallback Badges
# ==============================================================================

def test_compute_tutor_badge_variants():
    """Tests badge model computation across all success and resilient failover states."""
    # 1. Cloud verified
    b_cloud = compute_tutor_badge(fallback_used=False, model="gpt-4o")
    assert b_cloud.badgeType == "CLOUD_VERIFIED"
    assert b_cloud.label == "Cloud (Verified)"
    assert b_cloud.variant == "success"
    assert b_cloud.fallbackUsed is False

    # 2. Curated fallback
    b_curated = compute_tutor_badge(fallback_used=True, model="DEMO_FALLBACK")
    assert b_curated.badgeType == "FALLBACK_CURATED"
    assert b_curated.label == "Curated Fallback"
    assert b_curated.variant == "secondary"
    assert b_curated.fallbackUsed is True

    # 3. Timeout recovery
    b_timeout = compute_tutor_badge(fallback_used=True, model="DEMO_FALLBACK", trigger_reason="Provider timeout")
    assert b_timeout.badgeType == "FALLBACK_TIMEOUT"
    assert "Timeout" in b_timeout.label
    assert b_timeout.variant == "warning"

    # 4. Rate limit 429 recovery
    b_rate = compute_tutor_badge(fallback_used=True, model="DEMO_FALLBACK", trigger_reason="HTTP 429 Rate limited")
    assert b_rate.badgeType == "FALLBACK_RATE_LIMIT"
    assert "Rate Limit" in b_rate.label
    assert b_rate.variant == "warning"

    # 5. Malformed schema recovery
    b_malformed = compute_tutor_badge(fallback_used=True, model="DEMO_FALLBACK", trigger_reason="malformed schema")
    assert b_malformed.badgeType == "FALLBACK_MALFORMED"
    assert "Schema" in b_malformed.label
    assert b_malformed.variant == "warning"

    # 6. Evidence claim invalid
    b_ev = compute_tutor_badge(fallback_used=True, model="DEMO_FALLBACK", trigger_reason="fabricated claim rejected")
    assert b_ev.badgeType == "FALLBACK_EVIDENCE_MISMATCH"
    assert "Evidence" in b_ev.label
    assert b_ev.variant == "warning"


@pytest.mark.asyncio
async def test_fallback_badge_invariants_during_transitions():
    """Verifies that every resilient fallback transition preserves parity and badges."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="timeout", max_retries=0)
    service = TutorService(provider=provider)

    # Timeout transition
    resp = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        force_fallback=False,
        timeout_seconds=0.05,
    )
    assert resp["fallbackUsed"] is True
    assert resp["badge"]["badgeType"] == "FALLBACK_TIMEOUT"
    assert resp["repairChallengeId"] == "ch_bell_repair"
    assert extract_cited_step_indexes(resp) == [0, 1]


# ==============================================================================
# 3. Redacted Telemetry
# ==============================================================================

def test_telemetry_redaction_rules():
    """Ensures sensitive secrets and auth tokens are stripped from telemetry."""
    secret_string = "Authorization: Bearer mySecretToken12345 with key sk-proj-123456789abcdef"
    redacted = redact_sensitive_text(secret_string)

    assert "mySecretToken12345" not in redacted
    assert "sk-proj-123456789abcdef" not in redacted
    assert "Bearer [REDACTED]" in redacted
    assert "[REDACTED_KEY]" in redacted


@pytest.mark.asyncio
async def test_telemetry_records_llm_events_without_free_text_leakage():
    """Telemetry records structured execution without leaking question or secret data."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="success", model="qtrace-telemetry-model")
    service = TutorService(provider=provider)

    secret_question = "Why does Bearer secret-auth-token occur in sk-key-12345678?"
    resp = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        learner_question=secret_question,
        force_fallback=False,
    )

    events = telemetry.get_events()
    assert len(events) >= 1
    last_event = events[-1]

    assert last_event.provider == "fake"
    assert last_event.model == "qtrace-telemetry-model"
    assert last_event.status == "success"
    assert last_event.badgeType == "CLOUD_VERIFIED"
    assert last_event.durationMs >= 0

    # Verify ZERO leakage of raw learner question in telemetry
    for ev in events:
        assert secret_question not in ev.model_dump_json()
        assert "secret-auth-token" not in ev.model_dump_json()


# ==============================================================================
# 4. Drill Runner Test
# ==============================================================================

@pytest.mark.asyncio
async def test_tutor_resilience_drill_runner():
    """Executes the full 7-step resilience drill and asserts 100% parity preservation."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    summary = await run_tutor_resilience_drill(trace=trace)

    assert summary.totalSteps == 7
    assert summary.passedSteps == 7
    assert summary.failedSteps == 0
    assert summary.allParityPassed is True

    # Verify all transition badges are accounted for in the drill
    badge_types = {r.badgeType for r in summary.stepReports}
    assert "CLOUD_VERIFIED" in badge_types
    assert "FALLBACK_TIMEOUT" in badge_types
    assert "FALLBACK_RATE_LIMIT" in badge_types
    assert "FALLBACK_MALFORMED" in badge_types
    assert "FALLBACK_EVIDENCE_MISMATCH" in badge_types
    assert "FALLBACK_CURATED" in badge_types

    # Verify all steps cited the exact same repair challenge and trace steps
    for r in summary.stepReports:
        assert r.repairChallengeId == "ch_bell_repair"
        assert r.citedStepIndexes == [0, 1]


# ==============================================================================
# 5. HTTP Route Parity & Badge Exposure
# ==============================================================================

@pytest.mark.asyncio
async def test_tutor_explain_route_cloud_and_fallback_parity(monkeypatch):
    """POST /v1/tutor/explain returns identical trace steps, repair challenge, and badges."""
    transport = ASGITransport(app=app)

    payload = {
        "learnerProfileId": "lp_aarav",
        "moduleId": "mod_bell",
        "simulationRunId": "sr_demo_001",
        "misconceptionSignalId": "ms_demo_001",
        "intent": "EXPLAIN_DIVERGENCE",
    }

    # Case A: Cloud Provider enabled
    monkeypatch.setenv("DEMO_FALLBACK", "0")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")
    fake_provider = FakeTutorProvider(mode="success", model="cloud-parity-model")
    monkeypatch.setattr(default_tutor_service, "provider", fake_provider)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res_cloud = await ac.post("/v1/tutor/explain", json=payload)
        assert res_cloud.status_code == 200
        cloud_tutor = res_cloud.json()["tutorResponse"]

    # Case B: Offline fallback enforced
    monkeypatch.setenv("DEMO_FALLBACK", "1")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "0")
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res_fallback = await ac.post("/v1/tutor/explain", json=payload)
        assert res_fallback.status_code == 200
        fallback_tutor = res_fallback.json()["tutorResponse"]

    # Parity assertions on HTTP responses
    assert cloud_tutor["repairChallengeId"] == fallback_tutor["repairChallengeId"] == "ch_bell_repair"

    cloud_steps = extract_cited_step_indexes(cloud_tutor)
    fallback_steps = extract_cited_step_indexes(fallback_tutor)
    assert cloud_steps == fallback_steps == [0, 1]

    # Badges
    assert cloud_tutor["badge"]["badgeType"] == "CLOUD_VERIFIED"
    assert cloud_tutor["fallbackUsed"] is False

    assert fallback_tutor["badge"]["badgeType"] == "FALLBACK_CURATED"
    assert fallback_tutor["fallbackUsed"] is True
