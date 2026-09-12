"""
Tutor Orchestration Service — Evidence Injection, Cloud Inference, and Validation.
===================================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-5
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md
"""

from __future__ import annotations

import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import ValidationError

from app.services.tutor.adapter import (
    BaseTutorProvider,
    FakeTutorProvider,
    TutorProviderError,
    get_tutor_provider,
)
from app.services.tutor.badge import TutorBadge, compute_tutor_badge
from app.services.tutor.fallback import (
    get_curated_bell_explanation,
    select_repair_challenge,
)
from app.services.tutor.schemas import StructuredTutorResponse
from app.services.tutor.telemetry import telemetry
from app.services.tutor.validator import (
    EvidenceKeyValidationError,
    FabricatedClaimError,
    validate_tutor_response_evidence,
)

logger = logging.getLogger("qtrace.tutor.service")


def extract_available_evidence_keys(state_trace: List[Dict[str, Any]]) -> List[str]:
    """Inspects a StateTrace and returns a sorted list of all valid dot-path evidence keys."""
    keys: List[str] = []
    if not isinstance(state_trace, list):
        return keys

    for step_idx, step in enumerate(state_trace):
        prefix = f"stateTrace.{step_idx}"
        keys.append(f"{prefix}.basisProbabilities")
        probs = step.get("basisProbabilities", {})
        if isinstance(probs, dict):
            for state_str in probs.keys():
                keys.append(f"{prefix}.basisProbabilities.{state_str}")

        keys.append(f"{prefix}.reducedQubits")
        reduced = step.get("reducedQubits", [])
        if isinstance(reduced, list):
            for q_idx in range(len(reduced)):
                keys.append(f"{prefix}.reducedQubits.{q_idx}")
                keys.append(f"{prefix}.reducedQubits.{q_idx}.purity")

    return sorted(keys)


class TutorService:
    """Orchestrates evidence injection, optional LLM provider generation, and fallback."""

    def __init__(
        self,
        provider: Optional[BaseTutorProvider] = None,
        prompts_dir: Optional[Path] = None,
    ) -> None:
        self.provider = provider
        if prompts_dir:
            self.prompts_dir = prompts_dir
        else:
            cand1 = Path(__file__).resolve().parent.parent / "prompts"
            cand2 = Path(__file__).resolve().parent.parent.parent / "prompts"
            self.prompts_dir = cand1 if cand1.exists() else cand2
        self._system_prompt_cached: Optional[str] = None
        self._user_template_cached: Optional[str] = None

    def _load_prompts(self) -> tuple[str, str]:
        if self._system_prompt_cached is None or self._user_template_cached is None:
            sys_path = self.prompts_dir / "tutor_system.txt"
            usr_path = self.prompts_dir / "tutor_user_template.txt"

            if sys_path.exists():
                self._system_prompt_cached = sys_path.read_text(encoding="utf-8")
            else:
                self._system_prompt_cached = "You are Q-Trace Tutor. Ground every claim purely in StateTrace."

            if usr_path.exists():
                self._user_template_cached = usr_path.read_text(encoding="utf-8")
            else:
                self._user_template_cached = "Context:\n{state_trace_json}\nExplain misconception {misconception_code}."

        return self._system_prompt_cached, self._user_template_cached

    async def generate_explanation(
        self,
        state_trace: List[Dict[str, Any]],
        learner_profile_id: str,
        module_id: str = "mod_bell",
        misconception_code: str = "SUPERPOSITION_VS_ENTANGLEMENT",
        intent: str = "EXPLAIN_DIVERGENCE",
        learner_question: Optional[str] = None,
        prediction: Optional[str] = "INDEPENDENT_RANDOM",
        verified_behavior: Optional[str] = "CORRELATED_00_11",
        first_divergence_step: Optional[int] = 1,
        force_fallback: Optional[bool] = None,
        provider_override: Optional[BaseTutorProvider] = None,
        timeout_seconds: Optional[float] = None,
        learner_role: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Main entrypoint for tutor explanations.
        
        Evaluates environment flags, prepares evidence injection, attempts provider inference,
        validates post-generation numerical claims, and seamlessly falls back on any failure.
        """
        start_time = time.perf_counter()

        # Determine whether cloud inference is active
        demo_fallback_flag = os.getenv("DEMO_FALLBACK", "1") == "1"
        enable_cloud_flag = os.getenv("ENABLE_TUTOR_CLOUD", "0") == "1"
        active_provider = provider_override or self.provider or get_tutor_provider()
        api_key_val = getattr(active_provider, "api_key", None) or os.getenv("TUTOR_API_KEY", "")
        has_api_key = bool(api_key_val and str(api_key_val).strip())
        is_fake_provider = getattr(active_provider, "name", "") in ("fake", "mock")

        should_fallback = (
            force_fallback is True
            or (
                force_fallback is None
                and (
                    demo_fallback_flag
                    or not enable_cloud_flag
                    or (not has_api_key and not is_fake_provider)
                )
            )
        )

        repair_challenge_id = select_repair_challenge(misconception_code, module_id)

        # 1. If fallback requested or cloud disabled, return curated fallback immediately
        if should_fallback and provider_override is None:
            explanation = get_curated_bell_explanation(
                state_trace=state_trace,
                misconception_code=misconception_code,
                module_id=module_id,
                intent=intent,
                learner_role=learner_role,
            )
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            badge = compute_tutor_badge(
                fallback_used=True,
                model=explanation["model"],
                trigger_reason="Configured offline fallback active",
            )
            explanation["badge"] = badge.model_dump()
            telemetry.record(
                provider="fallback",
                model=explanation["model"],
                duration_ms=duration_ms,
                status="fallback",
                badge_type=badge.badgeType,
                fallback_used=True,
                fallback_reason="Configured offline fallback active",
            )
            return explanation

        # 2. Select provider (active_provider already resolved above)

        # 3. Load prompts and perform evidence injection
        system_prompt, user_template = self._load_prompts()
        available_keys = extract_available_evidence_keys(state_trace)

        formatted_user_prompt = user_template.format(
            learner_profile_id=learner_profile_id,
            learner_role=learner_role or "BEGINNER_CSE",
            module_id=module_id,
            intent=intent,
            learner_question=learner_question or "None provided",
            misconception_code=misconception_code,
            first_divergence_step=first_divergence_step if first_divergence_step is not None else "N/A",
            prediction=prediction or "Unknown",
            verified_behavior=verified_behavior or "Unknown",
            repair_challenge_id=repair_challenge_id,
            state_trace_json=json.dumps(state_trace, indent=2),
            available_evidence_keys="\n".join(f"- {k}" for k in available_keys),
        )

        # 4. Invoke provider with retry and timeout protection
        effective_timeout = (
            timeout_seconds
            if timeout_seconds is not None
            else float(os.getenv("TUTOR_TIMEOUT_SECONDS", "2.0"))
        )
        raw_output: Dict[str, Any]
        try:
            raw_output = await active_provider.generate(
                system_prompt=system_prompt,
                user_prompt=formatted_user_prompt,
                timeout_seconds=effective_timeout,
            )
        except (TutorProviderError, Exception) as err:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            logger.warning("[llm] Provider failure, triggering curated fallback: %s", err)
            fallback_res = get_curated_bell_explanation(
                state_trace=state_trace,
                misconception_code=misconception_code,
                module_id=module_id,
                intent=intent,
                learner_role=learner_role,
            )
            badge = compute_tutor_badge(
                fallback_used=True,
                model=fallback_res["model"],
                trigger_reason=str(err),
            )
            fallback_res["badge"] = badge.model_dump()
            status_tag = (
                "timeout"
                if "timeout" in str(err).lower()
                else ("rate_limit" if "429" in str(err) or "rate" in str(err).lower() else "error")
            )
            telemetry.record(
                provider=active_provider.name,
                model=active_provider.model,
                duration_ms=duration_ms,
                status=status_tag,
                badge_type=badge.badgeType,
                fallback_used=True,
                fallback_reason=str(err),
            )
            return fallback_res

        # 5. Schema validation of structured LLM output
        structured_response: StructuredTutorResponse
        try:
            # Deterministically enforce repairChallengeId from pedagogy engine
            raw_output["repairChallengeId"] = repair_challenge_id
            if not raw_output.get("model"):
                raw_output["model"] = active_provider.model
            raw_output["fallbackUsed"] = False

            structured_response = StructuredTutorResponse(**raw_output)
        except (ValidationError, TypeError, ValueError) as err:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            logger.warning("[llm] Schema validation error, triggering curated fallback: %s", err)
            fallback_res = get_curated_bell_explanation(
                state_trace=state_trace,
                misconception_code=misconception_code,
                module_id=module_id,
                intent=intent,
                learner_role=learner_role,
            )
            badge = compute_tutor_badge(
                fallback_used=True,
                model=fallback_res["model"],
                trigger_reason=f"malformed_schema: {err}",
            )
            fallback_res["badge"] = badge.model_dump()
            telemetry.record(
                provider=active_provider.name,
                model=active_provider.model,
                duration_ms=duration_ms,
                status="malformed",
                badge_type=badge.badgeType,
                fallback_used=True,
                fallback_reason=f"malformed_schema: {err}",
            )
            return fallback_res

        # 6. Post-generation evidence validation: verify evidence keys and numerical claims
        try:
            step_dicts = [step.model_dump() for step in structured_response.steps]
            claim_dicts = [claim.model_dump() for claim in structured_response.numericalClaims]
            validate_tutor_response_evidence(
                steps=step_dicts,
                numerical_claims=claim_dicts,
                state_trace=state_trace,
            )
        except (EvidenceKeyValidationError, FabricatedClaimError) as err:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            logger.warning("[llm] Evidence claim validation failed, triggering curated fallback: %s", err)
            fallback_res = get_curated_bell_explanation(
                state_trace=state_trace,
                misconception_code=misconception_code,
                module_id=module_id,
                intent=intent,
                learner_role=learner_role,
            )
            badge = compute_tutor_badge(
                fallback_used=True,
                model=fallback_res["model"],
                trigger_reason=f"evidence_claim_invalid: {err}",
            )
            fallback_res["badge"] = badge.model_dump()
            telemetry.record(
                provider=active_provider.name,
                model=active_provider.model,
                duration_ms=duration_ms,
                status="evidence_invalid",
                badge_type=badge.badgeType,
                fallback_used=True,
                fallback_reason=f"evidence_claim_invalid: {err}",
            )
            return fallback_res

        # 7. Success: Return verified cloud response
        duration_ms = int((time.perf_counter() - start_time) * 1000)
        cloud_badge = compute_tutor_badge(fallback_used=False, model=structured_response.model)
        structured_response.badge = cloud_badge
        est_tokens = len(formatted_user_prompt.split()) + len(structured_response.summary.split())
        telemetry.record(
            provider=active_provider.name,
            model=structured_response.model,
            duration_ms=duration_ms,
            status="success",
            badge_type=cloud_badge.badgeType,
            estimated_tokens=est_tokens,
            fallback_used=False,
        )
        return structured_response.model_dump()

    async def chat_with_tutor(
        self,
        learner_profile_id: str,
        question: str,
        history: Optional[List[Dict[str, str]]] = None,
        circuit: Optional[Dict[str, Any]] = None,
        prediction: Optional[str] = None,
        state_trace: Optional[List[Dict[str, Any]]] = None,
        misconception_code: Optional[str] = None,
        learner_role: Optional[str] = None,
        module_id: str = "mod_bell",
        timeout_seconds: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Socratic conversational interactive tutor grounded in circuit and simulation evidence."""
        start_time = time.perf_counter()
        active_provider = self.provider or get_tutor_provider()
        enable_cloud_flag = os.getenv("ENABLE_TUTOR_CLOUD", "0") == "1"
        api_key_val = getattr(active_provider, "api_key", None) or os.getenv("TUTOR_API_KEY", "")
        has_api_key = bool(api_key_val and str(api_key_val).strip())
        demo_fallback_flag = os.getenv("DEMO_FALLBACK", "0") == "1"

        use_cloud = (self.provider is not None) or (
            enable_cloud_flag and has_api_key and not demo_fallback_flag and active_provider.name != "fake"
        )

        # Construct Pedagogical System Prompt with strict quantum grounding
        role_guidance = (
            "The learner has a physics background (PHYSICS_TO_CODE). Use rigorous notation: statevectors (|Ψ⟩), tensor products (H ⊗ I), density matrices (ρ = Tr_B(|Φ+⟩⟨Φ+|)), and Hilbert space dimension. Avoid pop-science hand-waving."
            if learner_role == "PHYSICS_TO_CODE"
            else "The learner is a computer science undergraduate (BEGINNER_CSE). Use intuitive computational state branches, bitstrings (00, 11), probabilities (50%), and step-by-step logic. Avoid unnecessary advanced tensor algebra."
        )

        circuit_summary = "Bell State Starter Circuit (Hadamard on q[0], CNOT with control q[0] and target q[1])"
        if circuit and isinstance(circuit, dict) and "operations" in circuit:
            ops_desc = [
                f"{op.get('gate')}(targets={op.get('targets')}, ctrl={op.get('controls', [])})"
                for op in circuit.get("operations", [])
            ]
            circuit_summary = f"Circuit ({circuit.get('qubitCount', 2)} qubits): " + ", ".join(ops_desc)

        pred_summary = (
            f"Learner's prediction: {prediction}"
            if prediction
            else "Learner's prediction: INDEPENDENT_RANDOM"
        )

        trace_summary = (
            "StateTrace: Step 0 (After H): P(00)=0.5, P(10)=0.5, purity=1.0. "
            "Step 1 (After CNOT): P(00)=0.5, P(11)=0.5, reduced qubit 0 purity=0.5 (MIXED_SUBSYSTEM)."
        )
        if state_trace and isinstance(state_trace, list):
            steps_desc = []
            for s in state_trace:
                lbl = s.get("label", f"Step {s.get('stepIndex')}")
                probs = s.get("basisProbabilities", {})
                p_str = ", ".join(f"{k}={v}" for k, v in probs.items())
                red_purity = ""
                if s.get("reducedQubits"):
                    red_purity = f", qubit 0 purity={s['reducedQubits'][0].get('purity')}"
                steps_desc.append(f"{lbl}: [{p_str}]{red_purity}")
            if steps_desc:
                trace_summary = "StateTrace: " + " | ".join(steps_desc)

        rules_text = (
            "PEDAGOGICAL & INTERACTION RULES:\n"
            "1. Grounding: Answer questions using the verified simulation evidence above. Remind the student that Q-Trace is running on an ideal Qiskit Aer simulator with 0 noise unless configured otherwise. Do NOT invent hardware decoherence.\n"
            "2. Socratic & Conversational:\n"
            "   - For greetings like 'hi', 'hello', be welcoming, friendly, and invite the learner to ask about their Bell state circuit or simulation outcomes.\n"
            "   - For quantum questions, provide an intuitive yet mathematically sound explanation and conclude with a reflective Socratic follow-up question to deepen understanding.\n"
            "   - If asked why tracing out one qubit produces a mixed state: Explain that in an entangled state like |Φ+⟩, the individual qubit possesses no independent statevector; partial trace over the other qubit yields a density matrix with purity 0.5 (Tr(ρ²)=0.5), meaning it is maximally mixed.\n"
            "   - If asked about faster-than-light communication: Cite the No-Communication Theorem; measurement outcomes are intrinsically random (50/50), so without classical message transmission, no information can be sent.\n"
            "3. LaTeX Math Formatting:\n"
            "   - ALWAYS format mathematical formulas, statevectors, and operators in standard LaTeX ($...$ for inline like $|0\\rangle$, $|\\Phi^+\\rangle$, and $$...$$ for display equations).\n"
            "   - Use standard Dirac notation with \\rangle and \\langle (e.g., |0\\rangle, \\rho_A = \\frac{1}{2}|0\\rangle\\langle 0| + \\frac{1}{2}|1\\rangle\\langle 1|).\n"
            "4. Length & Token Economy: Keep answers concise, clear, and under 200 words (2-3 short, focused paragraphs). Never write full code solutions for repair challenges.\n"
        )

        system_prompt = (
            "You are Q-Trace Socratic Tutor, an expert quantum computing pedagogical AI pair-programming with a student in the Q-Trace IDE.\n\n"
            "GROUNDED QUANTUM CONTEXT FOR THIS RUN:\n"
            f"- Module: {module_id}\n"
            f"- Active Circuit: {circuit_summary}\n"
            f"- {pred_summary}\n"
            f"- Misconception / Hypothesis Signal: {misconception_code or 'SUPERPOSITION_VS_ENTANGLEMENT'}\n"
            f"- Verified Simulation Evidence: {trace_summary}\n"
            f"- Learner Role & Pedagogical Calibration: {role_guidance}\n\n"
            + rules_text
        )

        messages_payload: List[Dict[str, str]] = []
        if history:
            # Token minimization: window to last 2 turns (4 messages max) and truncate past replies
            for msg in history[-4:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ("user", "assistant") and content:
                    messages_payload.append({"role": role, "content": content[:400]})

        messages_payload.append({"role": "user", "content": question})

        if use_cloud:
            try:
                chat_timeout_env = os.getenv("TUTOR_CHAT_TIMEOUT_SECONDS")
                if chat_timeout_env:
                    default_timeout = float(chat_timeout_env)
                else:
                    default_timeout = min(float(os.getenv("TUTOR_TIMEOUT_SECONDS", "14.0")), 15.0)
                effective_timeout = timeout_seconds or default_timeout
                chat_res = await active_provider.chat_completion(
                    messages=messages_payload,
                    system_prompt=system_prompt,
                    timeout_seconds=effective_timeout,
                )
                if isinstance(chat_res, tuple) and len(chat_res) == 2:
                    reply_text, model_used = chat_res[0], chat_res[1]
                else:
                    reply_text, model_used = str(chat_res), getattr(active_provider, "model", "unknown")
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                print(f"[llm-chat] provider={active_provider.name} model={model_used} duration_ms={duration_ms} status=success")
                telemetry.record(
                    provider=active_provider.name,
                    model=model_used,
                    duration_ms=duration_ms,
                    status="success",
                    badge_type="live_verified",
                    fallback_used=False,
                )
                return {
                    "answer": reply_text,
                    "model": model_used,
                    "fallbackUsed": False,
                    "groundedEvidenceKeys": ["stateTrace.1.basisProbabilities", "stateTrace.1.reducedQubits"],
                }
            except Exception as err:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                print(f"[llm-chat] Cloud provider error, using smart fallback: {err}")
                telemetry.record(
                    provider=active_provider.name,
                    model=active_provider.model,
                    duration_ms=duration_ms,
                    status="rate_limit" if "429" in str(err) or "rate" in str(err).lower() else "fallback",
                    badge_type="curated_grounded",
                    fallback_used=True,
                    fallback_reason=str(err),
                )

        # Smart contextual fallback if offline or cloud failed
        duration_ms = int((time.perf_counter() - start_time) * 1000)
        fallback_answer = self._generate_smart_fallback_answer(question, learner_role)
        if not use_cloud:
            telemetry.record(
                provider="fallback",
                model="DEMO_FALLBACK",
                duration_ms=duration_ms,
                status="fallback",
                badge_type="curated_grounded",
                fallback_used=True,
                fallback_reason="Configured offline fallback active",
            )
        return {
            "answer": fallback_answer,
            "model": "DEMO_FALLBACK",
            "fallbackUsed": True,
            "groundedEvidenceKeys": ["stateTrace.1.basisProbabilities"],
        }

    def _generate_smart_fallback_answer(
        self,
        question: str,
        learner_role: Optional[str] = None,
    ) -> str:
        """Deterministic context-aware answer for demo resilience when offline."""
        q = question.lower().strip()
        if any(greet in q for greet in ["hi", "hello", "hey"]):
            return (
                "Hello! I am your Q-Trace Socratic Tutor. You're currently exploring the 2-qubit Bell state circuit "
                "($H$ on $q[0]$, $\\text{CNOT}$ targeting $q[1]$). Ask me anything about how superposition evolves into entanglement, "
                "why measurements correlate, or what happens when you trace out a qubit!"
            )
        if "mixed" in q or "trace" in q or "purity" in q:
            return (
                "When two qubits are in the maximally entangled Bell state $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$, "
                "the joint state is pure ($\\text{Tr}(\\rho^2)=1$), but individual subsystems are not separable.\n\n"
                "Tracing out qubit 1 yields the reduced density operator $\\rho_0 = \\text{Tr}_1(|\\Phi^+\\rangle\\langle\\Phi^+|) = \\frac{1}{2}|0\\rangle\\langle 0| + \\frac{1}{2}|1\\rangle\\langle 1|$. "
                "Its purity is $\\text{Tr}(\\rho_0^2) = (0.5)^2 + (0.5)^2 = 0.5$, which represents a **maximally mixed state**.\n\n"
                "*Socratic Question:* Why do you think measuring one qubit instantly determines the state of the other if neither qubit has a definite state beforehand?"
            )
        if "faster" in q or "ftl" in q or "light" in q or "communication" in q:
            return (
                "**No-Communication Theorem**: Quantum entanglement cannot transmit information faster than light.\n\n"
                "Although measurement outcomes at both qubits are 100% correlated ($00$ or $11$ with 50% probability each), "
                "an observer measuring only qubit 0 sees completely random 50/50 outcomes. Without a classical communication channel to compare results, "
                "no message has been sent.\n\n"
                "*Socratic Question:* If Bob measures his qubit in New York and Alice is on Mars, what would Bob observe if Alice didn't measure at all?"
            )
        if "swap" in q or "order" in q or "gate" in q and "order" in q:
            return (
                "If you swap the gate order by applying CNOT before the Hadamard gate on initial state $|00\\rangle$, "
                "the control qubit $q[0]$ is $|0\\rangle$, so CNOT acts as the identity operation and does nothing!\n\n"
                "The subsequent Hadamard gate then only superposes qubit 0, yielding $(|0\\rangle + |1\\rangle)|0\\rangle / \\sqrt{2}$. "
                "The qubits remain completely unentangled (a product state $|+0\\rangle$), rather than an entangled Bell pair $|\\Phi^+\\rangle$."
            )
        if "01" in q or "10" in q or "zero" in q or "support" in q:
            return (
                "In the verified Qiskit Aer state trace, $P(01)$ and $P(10)$ are exactly $0.0$ because the CNOT gate flips qubit 1 "
                "**if and only if** qubit 0 is $|1\\rangle$. Since Hadamard created the superposition $(|0\\rangle + |1\\rangle)/\\sqrt{2}$, "
                "the branches $|0\\rangle|0\\rangle \\to |00\\rangle$ and $|1\\rangle|0\\rangle \\to |11\\rangle$ receive all the amplitude support, "
                "leaving $|01\\rangle$ and $|10\\rangle$ with zero amplitude."
            )
        return (
            "In this simulation run, the Hadamard gate placed qubit 0 in equal superposition $(|00\\rangle + |10\\rangle)/\\sqrt{2}$, "
            "and the CNOT gate entangled qubit 1 to it, yielding the Bell state $|\\Phi^+\\rangle = (|00\\rangle + |11\\rangle)/\\sqrt{2}$.\n\n"
            "Notice that outcomes $01$ and $10$ have probability exactly $0.0$, while $00$ and $11$ each occur with probability $0.5$. "
            "What do you observe about the Bloch sphere vector length for either qubit after the CNOT gate?"
        )


# Singleton service instance
default_tutor_service = TutorService()
