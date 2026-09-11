"""
Unit Tests for Q-Trace Tutor Fallback and Evidence Validation.
=============================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-3
Branch:  feat/ai-pedagogy/ai-3-ship-the-evidence-bound-tutor
Contract: board/contracts/flight-recorder-tutor.md v1

Verifies:
1. Validates both numerical evidence keys (P(00)=0.5 and P(11)=0.5) against the Bell State Trace.
2. Rejects fabricated probability claims that do not match simulator evidence.
3. Rejects malformed or unresolved evidence keys.
4. Confirms fallbackUsed=True and model='DEMO_FALLBACK' metadata.
5. Confirms deterministic selection of Repair Challenge (ch_bell_repair).
6. Confirms zero persistence of free-form text.
7. Validates full HTTP behaviour of POST /v1/tutor/explain endpoint.
"""

from __future__ import annotations

import copy
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
    EvidenceKeyValidationError,
    FabricatedClaimError,
    extract_claimed_value,
    get_curated_bell_explanation,
    resolve_evidence_key,
    select_repair_challenge,
    validate_numerical_claim,
    validate_tutor_response_evidence,
)


@pytest.fixture(autouse=True)
async def seed_truth():
    """Ensure core repository truth is seeded before each test."""
    repo = get_repository()
    await seed_core_truth(repo)


# ==============================================================================
# 1. Evidence Key Resolution & Numerical Claim Validation Tests
# ==============================================================================

def test_resolve_valid_evidence_keys():
    """Resolves dot-path evidence keys into the verified State Trace."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])

    # Step 0 basis probabilities
    step0_probs = resolve_evidence_key("stateTrace.0.basisProbabilities", trace)
    assert step0_probs == {"00": 0.5, "10": 0.5}

    # Step 1 basis probabilities
    step1_probs = resolve_evidence_key("stateTrace.1.basisProbabilities", trace)
    assert step1_probs == {"00": 0.5, "11": 0.5}

    # Specific subkeys for Bell state outcomes
    val_00 = resolve_evidence_key("stateTrace.1.basisProbabilities.00", trace)
    assert val_00 == 0.5

    val_11 = resolve_evidence_key("stateTrace.1.basisProbabilities.11", trace)
    assert val_11 == 0.5


def test_validates_both_numerical_evidence_keys():
    """Validates both numerical evidence keys for the Bell state against verified State Trace."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])

    # Key 1: P(00)=0.5
    valid_00 = validate_numerical_claim(
        claim="P(00)=0.5",
        evidence_key="stateTrace.1.basisProbabilities.00",
        state_trace=trace,
    )
    assert valid_00 is True

    # Key 2: P(11)=0.5
    valid_11 = validate_numerical_claim(
        claim="P(11)=0.5",
        evidence_key="stateTrace.1.basisProbabilities.11",
        state_trace=trace,
    )
    assert valid_11 is True


@pytest.mark.parametrize(
    "bad_claim,key",
    [
        ("P(00)=0.99", "stateTrace.1.basisProbabilities.00"),
        ("P(00)=0.25", "stateTrace.1.basisProbabilities.00"),
        ("P(11)=0.75", "stateTrace.1.basisProbabilities.11"),
        ("P(11)=0.0", "stateTrace.1.basisProbabilities.11"),
        ("P(00)=0.5001", "stateTrace.1.basisProbabilities.00"),
        ("P(00)=0.99", "stateTrace.0.basisProbabilities"),
        ("After H, probability of measuring 00 is 0.85 (step 0)", "stateTrace.0.basisProbabilities"),
    ],
)
def test_rejects_fabricated_probability_claim(bad_claim: str, key: str):
    """Rejects any numerical claim that contradicts verified simulation output."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    with pytest.raises(FabricatedClaimError) as exc_info:
        validate_numerical_claim(claim=bad_claim, evidence_key=key, state_trace=trace)
    assert "Fabricated claim" in str(exc_info.value)


def test_validates_container_key_and_natural_language_claim():
    """Validates natural language claims and container evidence keys like basisProbabilities."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    assert validate_numerical_claim(
        claim="After H, the probability of measuring 00 is 0.5 (step 0)",
        evidence_key="stateTrace.0.basisProbabilities",
        state_trace=trace,
    ) is True


@pytest.mark.parametrize(
    "invalid_key",
    [
        "stateTrace.99.basisProbabilities",
        "stateTrace.1.basisProbabilities.01",
        "stateTrace.1.nonexistentField",
        "invalidFormatKey",
        "circuitModel.operations",
        "",
    ],
)
def test_rejects_invalid_evidence_key(invalid_key: str):
    """Rejects evidence keys that do not resolve to a valid path in StateTrace."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    with pytest.raises(EvidenceKeyValidationError):
        resolve_evidence_key(invalid_key, trace)


def test_extract_claimed_value():
    """Extracts numeric float from diverse claim strings."""
    assert extract_claimed_value("P(00)=0.5") == 0.5
    assert extract_claimed_value("P(11) = 0.500") == 0.5
    assert extract_claimed_value("probability is 0.7071") == 0.7071
    assert extract_claimed_value("0.5") == 0.5

    with pytest.raises(FabricatedClaimError):
        extract_claimed_value("no number in this claim")


# ==============================================================================
# 2. Curated Fallback Generation & Metadata Tests
# ==============================================================================

def test_curated_bell_explanation_metadata_and_structure():
    """Curated Bell explanation must include required metadata, valid steps, and grounded claims."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])

    explanation = get_curated_bell_explanation(
        state_trace=trace,
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        module_id="mod_bell",
        intent="EXPLAIN_DIVERGENCE",
    )

    assert explanation["responseId"] == "tr_demo_001"
    assert explanation["intent"] == "EXPLAIN_DIVERGENCE"
    assert explanation["fallbackUsed"] is True
    assert explanation["model"] == "DEMO_FALLBACK"
    assert "not a hardware claim" in explanation["safetyNote"]
    assert explanation["repairChallengeId"] == "ch_bell_repair"

    # Verify steps and numerical claims
    assert len(explanation["steps"]) == 2
    assert explanation["steps"][0]["title"] == "After H"
    assert explanation["steps"][1]["title"] == "After CNOT"

    claims = {nc["evidenceKey"]: nc["claim"] for nc in explanation["numericalClaims"]}
    assert "stateTrace.1.basisProbabilities.00" in claims
    assert "stateTrace.1.basisProbabilities.11" in claims


def test_deterministic_repair_challenge_selection():
    """Repair challenge selection is strictly deterministic based on misconception code."""
    assert select_repair_challenge("SUPERPOSITION_VS_ENTANGLEMENT", "mod_bell") == "ch_bell_repair"
    assert select_repair_challenge("GATE_ORDER", "mod_bell") == "ch_bell_repair"
    assert select_repair_challenge("MEASUREMENT_DETERMINISM", "mod_bell") == "ch_measurement_repair"
    assert select_repair_challenge(None, "mod_bell") == "ch_bell_repair"


def test_tutor_response_evidence_validation_fails_on_tampered_step_key():
    """Tampering with an evidenceKey in explanation steps fails validation."""
    trace = copy.deepcopy(BELL_SIMULATION_RUN_FIXTURE["stateTrace"])
    steps = [
        {"title": "Step", "body": "text", "evidenceKeys": ["stateTrace.1.fabricatedKey"]}
    ]
    numerical_claims = [
        {"claim": "P(00)=0.5", "evidenceKey": "stateTrace.1.basisProbabilities.00"}
    ]

    with pytest.raises(EvidenceKeyValidationError):
        validate_tutor_response_evidence(steps, numerical_claims, trace)


# ==============================================================================
# 3. HTTP Endpoint Integration Tests (POST /v1/tutor/explain)
# ==============================================================================

@pytest.mark.asyncio
async def test_tutor_explain_endpoint_success():
    """POST /v1/tutor/explain returns 200 with validated curated fallback."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
            "learnerQuestion": "Why are the outcomes random but still linked?",
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 200

        data = res.json()
        assert "tutorResponse" in data
        resp = data["tutorResponse"]
        assert resp["responseId"] == "tr_demo_001"
        assert resp["fallbackUsed"] is True
        assert resp["model"] == "DEMO_FALLBACK"
        assert resp["repairChallengeId"] == "ch_bell_repair"
        assert len(resp["steps"]) == 2
        assert len(resp["numericalClaims"]) == 2


@pytest.mark.asyncio
async def test_tutor_explain_missing_learner_404():
    """POST /v1/tutor/explain returns 404 EVIDENCE_NOT_FOUND if learner does not exist."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_nonexistent",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 404
        assert "EVIDENCE_NOT_FOUND" in res.json()["detail"]


@pytest.mark.asyncio
async def test_tutor_explain_missing_simulation_run_404():
    """POST /v1/tutor/explain returns 404 EVIDENCE_NOT_FOUND if simulation run does not exist."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_unknown_999",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 404
        assert "EVIDENCE_NOT_FOUND" in res.json()["detail"]


@pytest.mark.asyncio
async def test_tutor_explain_unsupported_intent_422():
    """POST /v1/tutor/explain returns 422 INTENT_UNSUPPORTED for unknown intent."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "DO_MY_HOMEWORK",
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 422
        assert "INTENT_UNSUPPORTED" in res.json()["detail"]


@pytest.mark.asyncio
async def test_tutor_explain_question_exceeds_500_chars_422():
    """POST /v1/tutor/explain returns 422 when learnerQuestion exceeds 500 characters."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
            "learnerQuestion": "x" * 501,
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 422


@pytest.mark.asyncio
async def test_tutor_explain_does_not_persist_free_text():
    """Verifies that learnerQuestion and tutor responses are never persisted in the store."""
    repo = get_repository()
    transport = ASGITransport(app=app)
    unique_question = "SpecialSecretQuestion_12345"

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "simulationRunId": "sr_demo_001",
            "misconceptionSignalId": "ms_demo_001",
            "intent": "EXPLAIN_DIVERGENCE",
            "learnerQuestion": unique_question,
        }
        res = await ac.post("/v1/tutor/explain", json=payload)
        assert res.status_code == 200

    # Ensure no repository collection has stored the secret text
    if hasattr(repo, "learner_profiles"):
        for profile in repo.learner_profiles.values():
            assert unique_question not in str(profile)
    if hasattr(repo, "progress_records"):
        for prog in repo.progress_records.values():
            assert unique_question not in str(prog)
    if hasattr(repo, "challenge_attempts"):
        for att in repo.challenge_attempts.values():
            assert unique_question not in str(att)
