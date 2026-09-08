"""
Pedagogy Release Verification Test Suite — Q-Trace AI-8.
=========================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-8
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md, .agents/rules/stack/quantum-runtime.md

Verification Suite:
- Scans responses and prompt fixtures for uncited numbers
- Verifies anti-copy guardrails (hints precede answers, zero repair code leakage)
- Verifies zero persistence of learner free-text questions
- Verifies 8 prepared <=20-second technical judge explanations
- Verifies safety notes presence across all execution modes
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List
import pytest

from app.services.tutor.adapter import FakeTutorProvider
from app.services.tutor.fallback import (
    get_curated_bell_explanation,
    select_repair_challenge,
)
from app.services.tutor.pedagogy_qa import (
    JUDGE_TECHNICAL_ANSWERS,
    get_all_judge_answers,
    get_judge_answer,
)
from app.services.tutor.service import TutorService
from app.services.tutor.telemetry import (
    TelemetryBuffer,
    redact_sensitive_text,
    telemetry,
)


@pytest.fixture
def bell_state_trace_fixture() -> List[Dict[str, Any]]:
    return [
        {
            "stepIndex": 0,
            "operationId": "op_1",
            "label": "After H",
            "basisProbabilities": {"00": 0.5, "10": 0.5},
            "reducedQubits": [
                {"qubit": 0, "bloch": {"x": 1.0, "y": 0.0, "z": 0.0}, "purity": 1.0},
                {"qubit": 1, "bloch": {"x": 0.0, "y": 0.0, "z": 1.0}, "purity": 1.0},
            ],
        },
        {
            "stepIndex": 1,
            "operationId": "op_2",
            "label": "After CNOT",
            "basisProbabilities": {"00": 0.5, "11": 0.5},
            "reducedQubits": [
                {"qubit": 0, "bloch": {"x": 0.0, "y": 0.0, "z": 0.0}, "purity": 0.5},
                {"qubit": 1, "bloch": {"x": 0.0, "y": 0.0, "z": 0.0}, "purity": 0.5},
            ],
        },
    ]


# ---------------------------------------------------------------------------
# 1. Prompt and Anti-Copy Guardrail Tests
# ---------------------------------------------------------------------------


def test_system_prompt_anti_copy_and_safety_rules() -> None:
    """Verifies that tutor_system.txt enforces Socratic hints, anti-copy guardrail, and safety note."""
    prompts_dir = Path(__file__).resolve().parent.parent.parent.parent / "app" / "prompts"
    sys_prompt_file = prompts_dir / "tutor_system.txt"
    assert sys_prompt_file.exists(), "tutor_system.txt must exist in app/prompts/"

    content = sys_prompt_file.read_text(encoding="utf-8")
    assert "Socratic" in content or "hints" in content.lower()
    assert "Anti-Copy" in content or "anti-copy" in content.lower() or "solution" in content.lower()
    assert "Explanation is grounded in this Simulation Run; it is not a hardware claim." in content
    assert "evidenceKeys" in content
    assert "numericalClaims" in content


def test_user_template_anti_copy_and_evidence_structure() -> None:
    """Verifies that tutor_user_template.txt formats learner context, keys, and anti-copy cues."""
    prompts_dir = Path(__file__).resolve().parent.parent.parent.parent / "app" / "prompts"
    usr_prompt_file = prompts_dir / "tutor_user_template.txt"
    assert usr_prompt_file.exists(), "tutor_user_template.txt must exist in app/prompts/"

    content = usr_prompt_file.read_text(encoding="utf-8")
    assert "{learner_profile_id}" in content
    assert "{misconception_code}" in content
    assert "{state_trace_json}" in content
    assert "{available_evidence_keys}" in content
    assert "DO NOT provide the circuit solution code" in content or "anti-copy" in content.lower()


# ---------------------------------------------------------------------------
# 2. Eight <=20-Second Technical Judge Explanations
# ---------------------------------------------------------------------------


def test_eight_judge_technical_answers_completeness() -> None:
    """Verifies that exactly 8 technical judge Q&A explanations exist and are complete."""
    assert len(JUDGE_TECHNICAL_ANSWERS) == 8, "Must provide exactly eight prepared judge answers."

    expected_topics = [
        "hallucinat",
        "solution",
        "fallback",
        "parity",
        "privacy",
        "diagnos",
        "representation",
        "recommend",
    ]

    all_qas = get_all_judge_answers()
    assert len(all_qas) == 8

    for qa in JUDGE_TECHNICAL_ANSWERS:
        assert qa.id.startswith("qa_")
        assert len(qa.question.strip()) > 10
        assert len(qa.answer.strip()) > 20
        assert qa.max_seconds <= 20
        assert len(qa.key_concept.strip()) > 5

    # Check that each topic is covered across the 8 questions/answers
    combined_text = " ".join(qa.question + " " + qa.answer + " " + qa.key_concept for qa in JUDGE_TECHNICAL_ANSWERS).lower()
    for topic in expected_topics:
        assert topic in combined_text, f"Topic '{topic}' should be covered in judge Q&A."


def test_judge_technical_answers_duration_limit() -> None:
    """Verifies that all 8 answers are concise and comfortably readable in <=20 seconds (<=80 words)."""
    for qa in JUDGE_TECHNICAL_ANSWERS:
        word_count = len(qa.answer.split())
        # Average adult reading speed: ~3 words/sec -> 20 seconds = ~60-80 words max
        assert word_count <= 80, f"Answer for {qa.id} is too verbose ({word_count} words > 80 words max for 20s)."
        assert word_count >= 15, f"Answer for {qa.id} is too brief ({word_count} words)."


def test_get_judge_answer_lookup() -> None:
    """Tests retrieve helper by ID."""
    qa = get_judge_answer("qa_1_zero_hallucination")
    assert qa is not None
    assert "hallucinate" in qa.question

    missing = get_judge_answer("qa_nonexistent")
    assert missing is None


# ---------------------------------------------------------------------------
# 3. Anti-Leakage and Grounded Number Citation Tests
# ---------------------------------------------------------------------------


def test_fallback_copy_grounding_and_safety(bell_state_trace_fixture: List[Dict[str, Any]]) -> None:
    """Verifies curated fallback has safety notes, evidence citations, and no answer leaks."""
    res = get_curated_bell_explanation(bell_state_trace_fixture)

    assert res["safetyNote"] == "Explanation is grounded in this Simulation Run; it is not a hardware claim."
    assert res["fallbackUsed"] is True
    assert res["model"] == "DEMO_FALLBACK"
    assert res["repairChallengeId"] == "ch_bell_repair"

    # Check evidence keys exist in state trace
    for step in res["steps"]:
        assert len(step["evidenceKeys"]) > 0
        for k in step["evidenceKeys"]:
            assert k.startswith("stateTrace.")

    # Check numerical claims
    for claim in res["numericalClaims"]:
        assert claim["evidenceKey"].startswith("stateTrace.")
        assert "0.5" in claim["claim"]

    # Verify no raw solution code leakage (e.g. "qc.cx(0, 1)", "circuit.append", etc.)
    full_text = res["summary"] + " " + " ".join(s["body"] for s in res["steps"])
    assert "qc.cx" not in full_text
    assert "circuit.append" not in full_text
    assert "qiskit.QuantumCircuit" not in full_text


@pytest.mark.asyncio
async def test_tutor_service_anti_copy_and_safety_note(bell_state_trace_fixture: List[Dict[str, Any]]) -> None:
    """Verifies that TutorService produces responses with required safety notes and evidence citations."""
    fake_provider = FakeTutorProvider(
        mode="success",
        custom_payload={
            "responseId": "tr_fake_001",
            "intent": "EXPLAIN_DIVERGENCE",
            "summary": "Notice how applying the Hadamard gate created uncertainty on qubit 0 before the CNOT gate tied qubit 1 to it.",
            "steps": [
                {
                    "title": "Superposition Observation",
                    "body": "State trace step 0 verifies 50% probability on 00 and 50% on 10.",
                    "evidenceKeys": ["stateTrace.0.basisProbabilities"],
                },
                {
                    "title": "Correlation Observation",
                    "body": "State trace step 1 verifies 50% probability on 00 and 50% on 11.",
                    "evidenceKeys": ["stateTrace.1.basisProbabilities"],
                },
            ],
            "numericalClaims": [
                {"claim": "P(00)=0.5", "evidenceKey": "stateTrace.0.basisProbabilities.00"},
                {"claim": "P(11)=0.5", "evidenceKey": "stateTrace.1.basisProbabilities.11"},
            ],
            "repairChallengeId": "ch_bell_repair",
            "fallbackUsed": False,
            "model": "FAKE_LLM_PROVIDER",
            "safetyNote": "Explanation is grounded in this Simulation Run; it is not a hardware claim.",
        },
    )

    service = TutorService(provider=fake_provider)
    result = await service.generate_explanation(
        state_trace=bell_state_trace_fixture,
        learner_profile_id="lp_aarav",
        force_fallback=False,
    )

    assert result["safetyNote"] == "Explanation is grounded in this Simulation Run; it is not a hardware claim."
    assert result["fallbackUsed"] is False
    assert len(result["steps"]) == 2
    assert len(result["numericalClaims"]) == 2


# ---------------------------------------------------------------------------
# 4. Zero Learner Question and Free-Text Persistence Tests
# ---------------------------------------------------------------------------


def test_telemetry_never_persists_learner_question() -> None:
    """Verifies telemetry records do not capture raw student free-form questions."""
    buf = TelemetryBuffer(max_capacity=10)
    buf.clear()

    # Simulate logging an event
    event = buf.record(
        provider="CloudTutorProvider",
        model="gpt-4o-mini",
        duration_ms=450,
        status="success",
        badge_type="CLOUD_VERIFIED",
        estimated_tokens=120,
        fallback_used=False,
    )

    events = buf.get_events()
    assert len(events) == 1

    # Check event fields: learner question is NOT in TelemetryEvent schema
    event_dict = event.model_dump()
    assert "learnerQuestion" not in event_dict
    assert "student_question" not in event_dict
    assert "free_text" not in event_dict


def test_telemetry_redaction_scrubs_secrets() -> None:
    """Verifies that secrets like sk- and Bearer tokens are scrubbed from telemetry logs."""
    sensitive_reason = "Failed with auth Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and sk-1234567890abcdef"
    scrubbed = redact_sensitive_text(sensitive_reason)

    assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in scrubbed
    assert "sk-1234567890abcdef" not in scrubbed
    assert "[REDACTED]" in scrubbed
    assert "[REDACTED_KEY]" in scrubbed
