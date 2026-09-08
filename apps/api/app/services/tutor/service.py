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
from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import ValidationError

from app.services.tutor.adapter import (
    BaseTutorProvider,
    FakeTutorProvider,
    TutorProviderError,
    get_tutor_provider,
)
from app.services.tutor.fallback import (
    get_curated_bell_explanation,
    select_repair_challenge,
)
from app.services.tutor.schemas import StructuredTutorResponse
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
        self.prompts_dir = prompts_dir or (Path(__file__).resolve().parent.parent.parent / "prompts")
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
        timeout_seconds: float = 2.0,
    ) -> Dict[str, Any]:
        """Main entrypoint for tutor explanations.
        
        Evaluates environment flags, prepares evidence injection, attempts provider inference,
        validates post-generation numerical claims, and seamlessly falls back on any failure.
        """
        # Determine whether cloud inference is active
        demo_fallback_flag = os.getenv("DEMO_FALLBACK", "1") == "1"
        enable_cloud_flag = os.getenv("ENABLE_TUTOR_CLOUD", "0") == "1"

        should_fallback = (
            force_fallback is True
            or (force_fallback is None and (demo_fallback_flag or not enable_cloud_flag))
        )

        repair_challenge_id = select_repair_challenge(misconception_code, module_id)

        # 1. If fallback requested or cloud disabled, return curated fallback immediately
        if should_fallback and provider_override is None:
            return get_curated_bell_explanation(
                state_trace=state_trace,
                misconception_code=misconception_code,
                module_id=module_id,
                intent=intent,
            )

        # 2. Select provider
        active_provider = provider_override or self.provider or get_tutor_provider()

        # 3. Load prompts and perform evidence injection
        system_prompt, user_template = self._load_prompts()
        available_keys = extract_available_evidence_keys(state_trace)

        formatted_user_prompt = user_template.format(
            learner_profile_id=learner_profile_id,
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
        raw_output: Dict[str, Any]
        try:
            raw_output = await active_provider.generate(
                system_prompt=system_prompt,
                user_prompt=formatted_user_prompt,
                timeout_seconds=timeout_seconds,
            )
        except (TutorProviderError, Exception) as err:
            logger.warning("[llm] Provider failure, triggering curated fallback: %s", err)
            print(f"[llm] fallback_triggered provider_error={err}")
            return get_curated_bell_explanation(
                state_trace=state_trace,
                misconception_code=misconception_code,
                module_id=module_id,
                intent=intent,
            )

        # 5. Schema validation of structured LLM output
        structured_response: StructuredTutorResponse
        try:
            # Ensure model and repairChallengeId are correctly set
            if not raw_output.get("repairChallengeId"):
                raw_output["repairChallengeId"] = repair_challenge_id
            if not raw_output.get("model"):
                raw_output["model"] = active_provider.model
            raw_output["fallbackUsed"] = False

            structured_response = StructuredTutorResponse(**raw_output)
        except (ValidationError, TypeError, ValueError) as err:
            logger.warning("[llm] Schema validation error, triggering curated fallback: %s", err)
            print(f"[llm] fallback_triggered schema_validation_error={err}")
            return get_curated_bell_explanation(
                state_trace=state_trace,
                misconception_code=misconception_code,
                module_id=module_id,
                intent=intent,
            )

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
            logger.warning("[llm] Evidence claim validation failed, triggering curated fallback: %s", err)
            print(f"[llm] fallback_triggered claim_validation_error={err}")
            return get_curated_bell_explanation(
                state_trace=state_trace,
                misconception_code=misconception_code,
                module_id=module_id,
                intent=intent,
            )

        # 7. Success: Return verified cloud response
        return structured_response.model_dump()


# Singleton service instance
default_tutor_service = TutorService()
