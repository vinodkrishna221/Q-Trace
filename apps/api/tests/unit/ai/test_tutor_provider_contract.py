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


def test_openrouter_provider_configuration(monkeypatch):
    """OpenRouter provider defaults to https://openrouter.ai/api/v1 and uses CloudTutorProvider."""
    from app.services.tutor.adapter import CloudTutorProvider, get_tutor_provider

    monkeypatch.setenv("TUTOR_PROVIDER", "openrouter")
    monkeypatch.setenv("TUTOR_MODEL", "meta-llama/llama-3.3-70b-instruct")
    monkeypatch.setenv("TUTOR_API_KEY", "sk-or-test-key")
    monkeypatch.delenv("TUTOR_API_BASE_URL", raising=False)

    provider = get_tutor_provider()
    assert isinstance(provider, CloudTutorProvider)
    assert provider.name == "openrouter"
    assert provider.model == "meta-llama/llama-3.3-70b-instruct"
    assert provider.api_base_url == "https://openrouter.ai/api/v1"
    assert provider.api_key == "sk-or-test-key"


@pytest.mark.asyncio
async def test_tutor_chat_endpoint_success(monkeypatch):
    """POST /v1/tutor/chat succeeds and returns socratic grounded answer."""
    fake_provider = FakeTutorProvider(model="test-model-chat")
    monkeypatch.setattr(default_tutor_service, "provider", fake_provider)
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")
    monkeypatch.setenv("TUTOR_API_KEY", "sk-fake-key")
    monkeypatch.setenv("DEMO_FALLBACK", "0")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "question": "Why does tracing out one qubit produce a mixed state?",
            "circuit": {"qubitCount": 2, "operations": [{"gate": "H", "targets": [0], "controls": []}]},
            "stateTrace": [
                {"stepIndex": 1, "basisProbabilities": {"00": 0.5, "11": 0.5}, "reducedQubits": [{"qubit": 0, "purity": 0.5}]}
            ],
            "prediction": "INDEPENDENT_RANDOM",
            "learnerRole": "BEGINNER_CSE",
        }
        res = await ac.post("/v1/tutor/chat", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "mixed state" in data["answer"].lower()
        assert data["fallbackUsed"] is False
        assert data["model"] == "test-model-chat"


@pytest.mark.asyncio
async def test_tutor_chat_smart_fallback_when_offline(monkeypatch):
    """POST /v1/tutor/chat provides smart fallback when offline."""
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "0")
    monkeypatch.setenv("DEMO_FALLBACK", "1")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "question": "hi",
        }
        res = await ac.post("/v1/tutor/chat", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["fallbackUsed"] is True
        assert "hello" in data["answer"].lower()


@pytest.mark.asyncio
async def test_generate_explanation_falls_back_when_api_key_missing(monkeypatch):
    """Problem 1.4: generate_explanation immediately falls back without 401 retries when TUTOR_API_KEY is empty."""
    monkeypatch.setenv("ENABLE_TUTOR_CLOUD", "1")
    monkeypatch.setenv("DEMO_FALLBACK", "0")
    monkeypatch.setenv("TUTOR_PROVIDER", "openrouter")
    monkeypatch.setenv("TUTOR_API_KEY", "")

    # Clean default_tutor_service without pre-injected fake provider
    service = TutorService()
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])

    result = await service.generate_explanation(
        state_trace=trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
    )

    assert result["fallbackUsed"] is True
    assert result["model"] == "DEMO_FALLBACK"
    assert result["repairChallengeId"] == "ch_bell_repair"


@pytest.mark.asyncio
async def test_chat_completion_candidate_failover_on_timeout(monkeypatch):
    """Problem 1.1: Candidate 1 timeout immediately fails over to Candidate 2."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider

    provider = CloudTutorProvider(
        name="openrouter",
        model="inclusionai/ling-3.0-flash-vl:free",
        api_key="test-api-key",
    )
    monkeypatch.setenv("TUTOR_BACKUP_MODEL", "nex-agi/nex-n2.5-mini:free")
    monkeypatch.setenv("TUTOR_CANDIDATE_TIMEOUT_SECONDS", "0.1")

    call_models = []

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        model = json.get("model")
        call_models.append(model)
        if model == "inclusionai/ling-3.0-flash-vl:free":
            # Simulate candidate 1 timing out
            raise httpx.TimeoutException("Candidate 1 timed out")
        # Candidate 2 responds successfully
        return httpx.Response(
            status_code=200,
            json={
                "choices": [
                    {"message": {"content": "Candidate 2 answered successfully with $|\\Phi^+\\rangle$."}}
                ]
            },
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    result = await provider.chat_completion(
        messages=[{"role": "user", "content": "Explain Bell state"}],
        system_prompt="You are a tutor",
        timeout_seconds=5.0,
    )

    assert "Candidate 2 answered" in result
    assert "inclusionai/ling-3.0-flash-vl:free" in call_models
    assert "nex-agi/nex-n2.5-mini:free" in call_models


@pytest.mark.asyncio
async def test_chat_completion_all_candidates_timeout_raises_tutor_timeout_error(monkeypatch):
    """Problem 1.1: When both candidates time out, raises TutorTimeoutError immediately without retrying Candidate 1."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider, TutorTimeoutError

    provider = CloudTutorProvider(
        name="openrouter",
        model="inclusionai/ling-3.0-flash-vl:free",
        api_key="test-api-key",
    )
    monkeypatch.setenv("TUTOR_BACKUP_MODEL", "nex-agi/nex-n2.5-mini:free")
    monkeypatch.setenv("TUTOR_CANDIDATE_TIMEOUT_SECONDS", "0.1")

    call_attempts = []

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        call_attempts.append(json.get("model"))
        raise httpx.TimeoutException("Provider candidate timed out")

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    with pytest.raises(TutorTimeoutError):
        await provider.chat_completion(
            messages=[{"role": "user", "content": "Explain Bell state"}],
            system_prompt="You are a tutor",
            timeout_seconds=5.0,
        )

    # Candidate 1 and Candidate 2 should each be called once (not repeatedly retrying Candidate 1)
    assert call_attempts.count("inclusionai/ling-3.0-flash-vl:free") == 1
    assert call_attempts.count("nex-agi/nex-n2.5-mini:free") == 1


@pytest.mark.asyncio
async def test_chat_completion_candidate_timeout_larger_than_overall_budget(monkeypatch):
    """Problem 1.1: Even if TUTOR_CANDIDATE_TIMEOUT_SECONDS is configured larger than overall timeout, Candidate 1 does not starve Candidate 2."""
    import asyncio
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider

    provider = CloudTutorProvider(
        name="openrouter",
        model="inclusionai/ling-3.0-flash-vl:free",
        api_key="test-api-key",
        max_retries=1,
    )
    monkeypatch.setenv("TUTOR_BACKUP_MODEL", "nex-agi/nex-n2.5-mini:free")
    monkeypatch.setenv("TUTOR_CANDIDATE_TIMEOUT_SECONDS", "10.0")

    call_models = []

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        model = json.get("model")
        call_models.append(model)
        if model == "inclusionai/ling-3.0-flash-vl:free":
            # Simulate candidate 1 hanging indefinitely
            await asyncio.sleep(5.0)
        return httpx.Response(
            status_code=200,
            json={
                "choices": [
                    {"message": {"content": "Candidate 2 responded successfully within budget."}}
                ]
            },
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    result = await provider.chat_completion(
        messages=[{"role": "user", "content": "Explain Bell state"}],
        system_prompt="You are a tutor",
        timeout_seconds=2.0,
    )

    assert "Candidate 2 responded successfully" in result
    assert call_models == ["inclusionai/ling-3.0-flash-vl:free", "nex-agi/nex-n2.5-mini:free"]


@pytest.mark.asyncio
async def test_chat_completion_candidate_404_not_retried(monkeypatch):
    """Problem 1.1: Candidate 1 returning 404 is never retried on outer retry cycles."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider, TutorProviderError

    provider = CloudTutorProvider(
        name="openrouter",
        model="inclusionai/ling-3.0-flash-vl:free",
        api_key="test-api-key",
        max_retries=1,
    )
    monkeypatch.setenv("TUTOR_BACKUP_MODEL", "nex-agi/nex-n2.5-mini:free")
    monkeypatch.setenv("TUTOR_CANDIDATE_TIMEOUT_SECONDS", "0.5")

    call_models = []

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        model = json.get("model")
        call_models.append(model)
        if model == "inclusionai/ling-3.0-flash-vl:free":
            return httpx.Response(status_code=404, text="Model not found")
        return httpx.Response(status_code=429, text="Rate limited")

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    with pytest.raises((TutorProviderError, Exception)):
        await provider.chat_completion(
            messages=[{"role": "user", "content": "Explain Bell state"}],
            system_prompt="You are a tutor",
            timeout_seconds=2.0,
        )

    # Candidate 1 must only be called once, not retried after 404
    assert call_models.count("inclusionai/ling-3.0-flash-vl:free") == 1


@pytest.mark.asyncio
async def test_cloud_generate_strips_markdown_and_trailing_commentary(monkeypatch):
    """Problem 2.3: Boundary regex extraction cleanly parses JSON with markdown fences and trailing commentary."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider

    provider = CloudTutorProvider(
        name="openrouter",
        model="inclusionai/ling-3.0-flash-vl:free",
        api_key="test-api-key",
    )

    messy_response_content = (
        "Here is the quantum diagnostic analysis:\n"
        "```json\n"
        "{\n"
        '  "responseId": "tr_messy_001",\n'
        '  "intent": "EXPLAIN_DIVERGENCE",\n'
        '  "summary": "Superposition correctly identified.",\n'
        '  "steps": [\n'
        '    {"title": "Step 0", "body": "Hadamard superposition.", "evidenceKeys": ["stateTrace.0.basisProbabilities"]}\n'
        "  ],\n"
        '  "numericalClaims": [\n'
        '    {"claim": "P(00)=0.5", "evidenceKey": "stateTrace.0.basisProbabilities.00"}\n'
        "  ],\n"
        '  "repairChallengeId": "ch_bell_repair",\n'
        '  "fallbackUsed": false,\n'
        '  "model": "inclusionai/ling-3.0-flash-vl:free",\n'
        '  "safetyNote": "Grounded in stateTrace."\n'
        "}\n"
        "```\n"
        "Hope this helps! Feel free to ask more questions."
    )

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        return httpx.Response(
            status_code=200,
            json={"choices": [{"message": {"content": messy_response_content}}]},
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    result = await provider.generate("system", "user", timeout_seconds=2.0)
    assert result["responseId"] == "tr_messy_001"
    assert result["summary"] == "Superposition correctly identified."
    assert result["fallbackUsed"] is False


@pytest.mark.asyncio
async def test_chat_completion_model_attribution_on_failover(monkeypatch):
    """Problem 2.5: Failover returns actual model used and service records it."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider
    from app.services.tutor.service import TutorService

    provider = CloudTutorProvider(
        name="openrouter",
        model="primary-candidate-model",
        api_key="test-api-key",
    )
    monkeypatch.setenv("TUTOR_BACKUP_MODEL", "backup-candidate-model")
    monkeypatch.setenv("TUTOR_CANDIDATE_TIMEOUT_SECONDS", "0.1")

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        model = json.get("model")
        if model == "primary-candidate-model":
            raise httpx.TimeoutException("Primary model timeout")
        return httpx.Response(
            status_code=200,
            json={"choices": [{"message": {"content": "Backup model replied."}}]},
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    # 1. Direct adapter call returns ChatCompletionResult with actual model
    chat_res = await provider.chat_completion(
        messages=[{"role": "user", "content": "Explain Bell state"}],
        system_prompt="You are a tutor",
        timeout_seconds=2.0,
    )
    assert isinstance(chat_res, tuple)
    content, model_used = chat_res
    assert content == "Backup model replied."
    assert model_used == "backup-candidate-model"
    assert "Backup model replied." in chat_res

    # 2. Service level chat_with_tutor records actual model in response dict
    service = TutorService(provider=provider)
    svc_res = await service.chat_with_tutor(
        learner_profile_id="lp_test",
        question="Explain Bell state",
        timeout_seconds=2.0,
    )
    assert svc_res["model"] == "backup-candidate-model"
    assert svc_res["fallbackUsed"] is False


@pytest.mark.asyncio
async def test_chat_completion_candidate_429_fails_fast_without_calling_candidate_2(monkeypatch):
    """Problem 2.6: HTTP 429 halts candidate loop immediately and fails fast to protect shared API key."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider, TutorAccountRateLimitError
    from app.services.tutor.service import TutorService

    provider = CloudTutorProvider(
        name="openrouter",
        model="primary-candidate-model",
        api_key="test-api-key",
    )
    monkeypatch.setenv("TUTOR_BACKUP_MODEL", "backup-candidate-model")
    monkeypatch.setenv("TUTOR_CANDIDATE_TIMEOUT_SECONDS", "0.5")

    called_models = []

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        model = json.get("model")
        called_models.append(model)
        return httpx.Response(status_code=429, text="Account rate limit exceeded")

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    # 1. Adapter call raises TutorAccountRateLimitError and does not call backup
    with pytest.raises(TutorAccountRateLimitError):
        await provider.chat_completion(
            messages=[{"role": "user", "content": "Explain Bell state"}],
            system_prompt="You are a tutor",
            timeout_seconds=2.0,
        )

    assert called_models == ["primary-candidate-model"]
    assert "backup-candidate-model" not in called_models

    # 2. Service level chat_with_tutor catches it and drops to DEMO_FALLBACK smoothly
    service = TutorService(provider=provider)
    svc_res = await service.chat_with_tutor(
        learner_profile_id="lp_test",
        question="Explain Bell state",
        timeout_seconds=2.0,
    )
    assert svc_res["model"] == "DEMO_FALLBACK"
    assert svc_res["fallbackUsed"] is True


@pytest.mark.asyncio
async def test_cloud_generate_429_fails_fast_without_retrying(monkeypatch):
    """Problem 2.6: generate() raises TutorAccountRateLimitError on HTTP 429 and fails fast without retrying."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider, TutorAccountRateLimitError

    provider = CloudTutorProvider(
        name="openrouter",
        model="primary-candidate-model",
        api_key="test-api-key",
        max_retries=2,
    )

    call_count = 0

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        nonlocal call_count
        call_count += 1
        return httpx.Response(status_code=429, text="Account rate limit exceeded")

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    with pytest.raises(TutorAccountRateLimitError):
        await provider.generate(
            system_prompt="System",
            user_prompt="User",
            timeout_seconds=2.0,
        )

    # Must fail fast on 1st attempt and not retry 2 more times
    assert call_count == 1


@pytest.mark.asyncio
async def test_cloud_generate_strips_think_tags_with_curly_braces(monkeypatch):
    """Problem 2.3 & 3.2: Reasoning models emitting <think> tags with braces do not corrupt JSON parsing."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider

    provider = CloudTutorProvider(
        name="openrouter",
        model="deepseek/deepseek-r1:free",
        api_key="test-api-key",
    )

    reasoning_response = (
        "<think>\n"
        "Let's analyze the state: { 'qubits': 2, 'state': '|Φ+>' }.\n"
        "We need to return JSON format.\n"
        "</think>\n"
        "```json\n"
        "{\n"
        '  "responseId": "tr_think_001",\n'
        '  "intent": "EXPLAIN_DIVERGENCE",\n'
        '  "summary": "Bell state correctly diagnosed.",\n'
        '  "steps": [\n'
        '    {"title": "Step 0", "body": "Superposition.", "evidenceKeys": ["stateTrace.0.basisProbabilities"]}\n'
        "  ],\n"
        '  "numericalClaims": [\n'
        '    {"claim": "P(00)=0.5", "evidenceKey": "stateTrace.0.basisProbabilities.00"}\n'
        "  ],\n"
        '  "repairChallengeId": "ch_bell_repair",\n'
        '  "fallbackUsed": false,\n'
        '  "model": "deepseek/deepseek-r1:free",\n'
        '  "safetyNote": "Grounded in stateTrace."\n'
        "}\n"
        "```\n"
        "Hope this helps!"
    )

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        return httpx.Response(
            status_code=200,
            json={"choices": [{"message": {"content": reasoning_response}}]},
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    result = await provider.generate("system", "user", timeout_seconds=2.0)
    assert result["responseId"] == "tr_think_001"
    assert result["summary"] == "Bell state correctly diagnosed."


@pytest.mark.asyncio
async def test_chat_completion_strips_think_tags(monkeypatch):
    """Problem 3.2: <think> internal thoughts are stripped before returning conversational answers."""
    import httpx
    from app.services.tutor.adapter import CloudTutorProvider

    provider = CloudTutorProvider(
        name="openrouter",
        model="deepseek/deepseek-r1:free",
        api_key="test-api-key",
    )

    raw_answer = (
        "<think>\n"
        "User is asking about Bell state.\n"
        "</think>\n"
        "In a Bell state $|\\Phi^+\\rangle$, both qubits are entangled."
    )

    async def mock_post(self, url, json=None, headers=None, **kwargs):
        return httpx.Response(
            status_code=200,
            json={"choices": [{"message": {"content": raw_answer}}]},
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    res = await provider.chat_completion(
        messages=[{"role": "user", "content": "Explain Bell state"}],
        system_prompt="You are a tutor",
        timeout_seconds=2.0,
    )
    assert "<think>" not in res.content
    assert res.content == "In a Bell state $|\\Phi^+\\rangle$, both qubits are entangled."


@pytest.mark.asyncio
async def test_chat_with_tutor_records_telemetry(monkeypatch):
    """Problem 2.5: chat_with_tutor records telemetry with model_used on success and fallback."""
    from app.services.tutor.adapter import FakeTutorProvider
    from app.services.tutor.service import TutorService
    from app.services.tutor.telemetry import telemetry

    provider = FakeTutorProvider(mode="success", model="test-chat-model")
    service = TutorService(provider=provider)

    events_before = len(telemetry.get_events())
    svc_res = await service.chat_with_tutor(
        learner_profile_id="lp_test",
        question="Why is purity 0.5?",
        timeout_seconds=2.0,
    )
    assert svc_res["model"] == "test-chat-model"
    events_after = telemetry.get_events()
    assert len(events_after) == events_before + 1
    last_event = events_after[-1]
    assert last_event.model == "test-chat-model"
    assert last_event.status == "success"






