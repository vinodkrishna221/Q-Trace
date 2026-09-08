"""
Unit and Contract Tests for Q-Trace Optional Structured Tutor Provider.
=======================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-5
Branch:  feat/ai-pedagogy/ai-5-add-the-optional-structured-tutor
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md

Verifies:
1. Fake provider success generates valid structured response (fallbackUsed=False).
2. Malformed output from provider triggers curated fallback (fallbackUsed=True, model=DEMO_FALLBACK).
3. Timeout from provider triggers curated fallback (fallbackUsed=True, model=DEMO_FALLBACK).
4. 429 Too Many Requests (Rate Limit) triggers curated fallback (fallbackUsed=True, model=DEMO_FALLBACK).
5. Post-generation validation rejects fabricated numerical claim and triggers fallback.
6. Post-generation validation rejects invalid evidence keys and triggers fallback.
7. Exponential backoff retry succeeds after transient error.
8. Environment flags (ENABLE_TUTOR_CLOUD=0, DEMO_FALLBACK=1) enforce deterministic fallback.
9. HTTP POST /v1/tutor/explain integration seamlessly returns cloud response or fallback on failure.
10. Confirms zero persistence of free-form text in cloud mode.
"""

from __future__ import annotations

import copy
import os
from typing import Any
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
    TutorService,
    default_tutor_service,
    extract_available_evidence_keys,
)


@pytest.fixture(autouse=True)
async def seed_truth():
    """Ensure core repository truth is seeded before each test."""
    repo = get_repository()
    await seed_core_truth(repo)


# ==============================================================================
# 1. Service Layer Tests with FakeTutorProvider
# ==============================================================================

@pytest.mark.asyncio
async def test_fake_provider_success():
    """Fake provider success returns validated structured output with fallbackUsed=False."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="success", model="test-provider-v1")
    service = TutorService(provider=provider)

    result = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=False,
    )

    assert result["fallbackUsed"] is False
    assert result["model"] == "test-provider-v1"
    assert result["repairChallengeId"] == "ch_bell_repair"
    assert len(result["steps"]) >= 2
    assert len(result["numericalClaims"]) == 2
    assert "not a hardware claim" in result["safetyNote"]


@pytest.mark.asyncio
async def test_fake_provider_malformed_output_triggers_curated_fallback():
    """Malformed output from provider is caught and returns curated fallback."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="malformed")
    service = TutorService(provider=provider)

    result = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=False,
    )

    assert result["fallbackUsed"] is True
    assert result["model"] == "DEMO_FALLBACK"
    assert result["repairChallengeId"] == "ch_bell_repair"
    assert len(result["steps"]) == 2


@pytest.mark.asyncio
async def test_fake_provider_timeout_triggers_curated_fallback():
    """Provider timeout is caught within deadline and returns curated fallback."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="timeout", max_retries=0)
    service = TutorService(provider=provider)

    result = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=False,
        timeout_seconds=0.05,
    )

    assert result["fallbackUsed"] is True
    assert result["model"] == "DEMO_FALLBACK"
    assert result["repairChallengeId"] == "ch_bell_repair"


@pytest.mark.asyncio
async def test_fake_provider_429_rate_limit_triggers_curated_fallback():
    """HTTP 429 Too Many Requests triggers curated fallback."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="rate_limit", max_retries=0)
    service = TutorService(provider=provider)

    result = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=False,
    )

    assert result["fallbackUsed"] is True
    assert result["model"] == "DEMO_FALLBACK"
    assert result["repairChallengeId"] == "ch_bell_repair"


@pytest.mark.asyncio
async def test_post_generation_validation_fails_on_fabricated_claim():
    """Provider output asserting fabricated numerical claim is rejected and falls back."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="fabricated_claim")
    service = TutorService(provider=provider)

    result = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=False,
    )

    # Must fall back to curated truth because P(00)=0.9999 is fabricated
    assert result["fallbackUsed"] is True
    assert result["model"] == "DEMO_FALLBACK"
    claims = {nc["evidenceKey"]: nc["claim"] for nc in result["numericalClaims"]}
    assert claims["stateTrace.1.basisProbabilities.00"] == "P(00)=0.5"


@pytest.mark.asyncio
async def test_post_generation_validation_fails_on_invalid_evidence_key():
    """Provider output citing an invalid evidence key is rejected and falls back."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="invalid_key")
    service = TutorService(provider=provider)

    result = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=False,
    )

    # Must fall back to curated truth because stateTrace.99.nonexistentField does not exist
    assert result["fallbackUsed"] is True
    assert result["model"] == "DEMO_FALLBACK"


@pytest.mark.asyncio
async def test_retry_mechanism_recovers_after_transient_failure():
    """Provider retries with exponential backoff on transient error and succeeds."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="retry_success", max_retries=2, initial_retry_delay=0.01)
    service = TutorService(provider=provider)

    result = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        intent="EXPLAIN_DIVERGENCE",
        force_fallback=False,
    )

    assert result["fallbackUsed"] is False
    assert provider.call_count == 2
    assert result["model"] == "mock-tutor-v1" or "fake" in result["model"]


def test_extract_available_evidence_keys():
    """Extracts valid dot-path keys from a StateTrace for prompt evidence injection."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    keys = extract_available_evidence_keys(trace)

    assert "stateTrace.0.basisProbabilities" in keys
    assert "stateTrace.0.basisProbabilities.00" in keys
    assert "stateTrace.1.basisProbabilities" in keys
    assert "stateTrace.1.basisProbabilities.11" in keys
    assert "stateTrace.0.reducedQubits" in keys
    assert "stateTrace.0.reducedQubits.0.purity" in keys


@pytest.mark.asyncio
async def test_environment_flags_enforce_deterministic_fallback(monkeypatch):
    """Environment flags DEMO_FALLBACK=1 and ENABLE_TUTOR_CLOUD=0 ensure zero cloud calls."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    provider = FakeTutorProvider(mode="success")
    service = TutorService(provider=provider)

    # Case 1: DEMO_FALLBACK=1 (default) forces fallback
    monkeypatch.setenv("DEMO_FALLBACK", "1")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")
    res1 = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
    )
    assert res1["fallbackUsed"] is True
    assert provider.call_count == 0

    # Case 2: ENABLE_TUTOR_CLOUD=0 forces fallback
    monkeypatch.setenv("DEMO_FALLBACK", "0")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "0")
    res2 = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
    )
    assert res2["fallbackUsed"] is True
    assert provider.call_count == 0


# ==============================================================================
# 2. HTTP Endpoint Integration Tests (POST /v1/tutor/explain)
# ==============================================================================

@pytest.mark.asyncio
async def test_tutor_explain_endpoint_with_cloud_provider_success(monkeypatch):
    """POST /v1/tutor/explain returns 200 with cloud explanation when enabled and green."""
    monkeypatch.setenv("DEMO_FALLBACK", "0")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")

    fake_provider = FakeTutorProvider(mode="success", model="gpt-4o-tutor")
    monkeypatch.setattr(default_tutor_service, "provider", fake_provider)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
            "learnerQuestion": "Why are 00 and 11 correlated?",
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 200

        data = res.json()["tutorResponse"]
        assert data["fallbackUsed"] is False
        assert data["model"] == "gpt-4o-tutor"
        assert data["repairChallengeId"] == "ch_bell_repair"


@pytest.mark.asyncio
async def test_tutor_explain_endpoint_with_cloud_timeout_falls_back(monkeypatch):
    """POST /v1/tutor/explain returns 200 with curated fallback on provider timeout."""
    monkeypatch.setenv("DEMO_FALLBACK", "0")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")

    fake_provider = FakeTutorProvider(mode="timeout", max_retries=0)
    monkeypatch.setattr(default_tutor_service, "provider", fake_provider)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 200

        data = res.json()["tutorResponse"]
        assert data["fallbackUsed"] is True
        assert data["model"] == "DEMO_FALLBACK"


@pytest.mark.asyncio
async def test_tutor_explain_endpoint_with_cloud_429_falls_back(monkeypatch):
    """POST /v1/tutor/explain returns 200 with curated fallback on provider 429 rate limit."""
    monkeypatch.setenv("DEMO_FALLBACK", "0")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")

    fake_provider = FakeTutorProvider(mode="rate_limit", max_retries=0)
    monkeypatch.setattr(default_tutor_service, "provider", fake_provider)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 200

        data = res.json()["tutorResponse"]
        assert data["fallbackUsed"] is True
        assert data["model"] == "DEMO_FALLBACK"


@pytest.mark.asyncio
async def test_tutor_explain_endpoint_with_cloud_malformed_falls_back(monkeypatch):
    """POST /v1/tutor/explain returns 200 with curated fallback on malformed provider output."""
    monkeypatch.setenv("DEMO_FALLBACK", "0")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")

    fake_provider = FakeTutorProvider(mode="malformed")
    monkeypatch.setattr(default_tutor_service, "provider", fake_provider)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 200

        data = res.json()["tutorResponse"]
        assert data["fallbackUsed"] is True
        assert data["model"] == "DEMO_FALLBACK"


@pytest.mark.asyncio
async def test_free_text_not_persisted_in_cloud_mode(monkeypatch):
    """Free text from learnerQuestion is never persisted, even when cloud mode succeeds."""
    monkeypatch.setenv("DEMO_FALLBACK", "0")
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")

    fake_provider = FakeTutorProvider(mode="success")
    monkeypatch.setattr(default_tutor_service, "provider", fake_provider)

    repo = get_repository()
    transport = ASGITransport(app=app)
    secret_marker = "UniqueCloudSecret_98765"

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
            "learnerQuestion": secret_marker,
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 200

    # Ensure no repository has stored the secret text
    if hasattr(repo, "learner_profiles"):
        for p in repo.learner_profiles.values():
            assert secret_marker not in str(p)
    if hasattr(repo, "progress_records"):
        for pr in repo.progress_records.values():
            assert secret_marker not in str(pr)
    if hasattr(repo, "challenge_attempts"):
        for ca in repo.challenge_attempts.values():
            assert secret_marker not in str(ca)
