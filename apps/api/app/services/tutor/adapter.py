"""
Tutor Provider Adapter Interface and Implementations for Q-Trace.
==================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-5
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md

Features:
- Abstract BaseTutorProvider interface
- FakeTutorProvider for hermetic unit and contract testing
- CloudTutorProvider for external LLM inference via httpx
- Retry (exponential backoff) and timeout handling
- [llm] telemetry logging
"""

from __future__ import annotations

import abc
import asyncio
import json
import logging
import os
import time
from typing import Any, Callable, Dict, Optional

import httpx

logger = logging.getLogger("qtrace.tutor")


class TutorProviderError(Exception):
    """Base exception for all provider adapter failures."""
    pass


class TutorTimeoutError(TutorProviderError):
    """Raised when the provider call exceeds its timeout budget."""
    pass


class TutorRateLimitError(TutorProviderError):
    """Raised when the provider returns HTTP 429 / rate limited."""
    pass


class TutorMalformedOutputError(TutorProviderError):
    """Raised when the provider produces unparseable or schema-violating JSON."""
    pass


class BaseTutorProvider(abc.ABC):
    """Abstract interface for Tutor LLM providers."""

    def __init__(
        self,
        name: str,
        model: str,
        max_retries: int = 2,
        initial_retry_delay: float = 0.05,
    ) -> None:
        self.name = name
        self.model = model
        self.max_retries = max_retries
        self.initial_retry_delay = initial_retry_delay

    @abc.abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        timeout_seconds: float = 2.0,
    ) -> Dict[str, Any]:
        """Generate structured response payload.
        
        Must return a parsed dictionary conforming to StructuredTutorResponse schema.
        Raises TutorProviderError or subclasses on failure.
        """
        pass

    async def execute_with_retry(
        self,
        func: Callable[[], Any],
        timeout_seconds: float = 2.0,
    ) -> Any:
        """Executes a coroutine with timeout and exponential backoff retry."""
        attempt = 0
        delay = self.initial_retry_delay

        while True:
            attempt += 1
            start_time = time.perf_counter()
            try:
                result = await asyncio.wait_for(func(), timeout=timeout_seconds)
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                print(f"[llm] provider={self.name} model={self.model} duration_ms={duration_ms} status=success attempt={attempt}")
                return result
            except asyncio.TimeoutError as err:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                print(f"[llm] provider={self.name} model={self.model} duration_ms={duration_ms} status=timeout attempt={attempt}")
                if attempt > self.max_retries:
                    raise TutorTimeoutError(f"Provider '{self.name}' timed out after {attempt} attempts ({timeout_seconds}s limit).") from err
                await asyncio.sleep(delay)
                delay *= 2
            except TutorRateLimitError as err:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                print(f"[llm] provider={self.name} model={self.model} duration_ms={duration_ms} status=rate_limit attempt={attempt}")
                if attempt > self.max_retries:
                    raise
                await asyncio.sleep(delay)
                delay *= 2
            except TutorMalformedOutputError:
                # Do not retry purely malformed non-JSON responses
                raise
            except Exception as err:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                print(f"[llm] provider={self.name} model={self.model} duration_ms={duration_ms} status=error attempt={attempt} error={err}")
                if attempt > self.max_retries:
                    raise TutorProviderError(f"Provider '{self.name}' failed: {err}") from err
                await asyncio.sleep(delay)
                delay *= 2


class FakeTutorProvider(BaseTutorProvider):
    """Test fake provider simulating success, malformed output, timeout, rate-limits, and claims."""

    def __init__(
        self,
        mode: str = "success",
        custom_payload: Optional[Dict[str, Any]] = None,
        model: str = "fake-tutor-v1",
        max_retries: int = 2,
        initial_retry_delay: float = 0.01,
    ) -> None:
        super().__init__(
            name="fake",
            model=model,
            max_retries=max_retries,
            initial_retry_delay=initial_retry_delay,
        )
        self.mode = mode
        self.custom_payload = custom_payload
        self.call_count = 0

    def set_mode(self, mode: str, custom_payload: Optional[Dict[str, Any]] = None) -> None:
        self.mode = mode
        if custom_payload is not None:
            self.custom_payload = custom_payload

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        timeout_seconds: float = 2.0,
    ) -> Dict[str, Any]:
        """Generates response based on configured mode using the retry harness."""

        async def _call() -> Dict[str, Any]:
            self.call_count += 1

            if self.mode == "timeout":
                # Exceed timeout to trigger timeout handler
                await asyncio.sleep(timeout_seconds + 0.1)
                raise asyncio.TimeoutError("Fake timeout")

            elif self.mode == "rate_limit":
                raise TutorRateLimitError("429 Too Many Requests: Rate limit exceeded")

            elif self.mode == "malformed":
                raise TutorMalformedOutputError("Output was not valid JSON or lacked required schema fields")

            elif self.mode == "retry_success":
                # Fails on first call with rate limit, then succeeds on retry
                if self.call_count == 1:
                    raise TutorRateLimitError("429 Too Many Requests: Temporary surge")
                return self._build_valid_payload()

            elif self.mode == "fabricated_claim":
                # Returns valid JSON structure, but asserting a fabricated numeric probability
                payload = self._build_valid_payload()
                payload["numericalClaims"] = [
                    {"claim": "P(00)=0.9999", "evidenceKey": "stateTrace.1.basisProbabilities.00"}
                ]
                return payload

            elif self.mode == "invalid_key":
                # Returns valid JSON structure, but citing a nonexistent dot-path
                payload = self._build_valid_payload()
                payload["steps"][0]["evidenceKeys"] = ["stateTrace.99.nonexistentField"]
                return payload

            else:  # default 'success'
                if self.custom_payload is not None:
                    return self.custom_payload
                return self._build_valid_payload()

        return await self.execute_with_retry(_call, timeout_seconds=timeout_seconds)

    def _build_valid_payload(self) -> Dict[str, Any]:
        return {
            "responseId": "tr_fake_001",
            "intent": "EXPLAIN_DIVERGENCE",
            "summary": "The Hadamard gate initialized equal superposition, and the CNOT entangled the two qubits.",
            "steps": [
                {
                    "title": "Superposition Phase",
                    "body": "Qubit 0 is in equal superposition with P(00)=0.5 and P(10)=0.5.",
                    "evidenceKeys": ["stateTrace.0.basisProbabilities"],
                },
                {
                    "title": "Entanglement Correlation",
                    "body": "CNOT shifted basis support entirely to correlated states 00 and 11.",
                    "evidenceKeys": ["stateTrace.1.basisProbabilities"],
                },
            ],
            "numericalClaims": [
                {"claim": "P(00)=0.5", "evidenceKey": "stateTrace.1.basisProbabilities.00"},
                {"claim": "P(11)=0.5", "evidenceKey": "stateTrace.1.basisProbabilities.11"},
            ],
            "repairChallengeId": "ch_bell_repair",
            "fallbackUsed": False,
            "model": self.model,
            "safetyNote": "Explanation is grounded in this Simulation Run; it is not a hardware claim.",
        }


class CloudTutorProvider(BaseTutorProvider):
    """Generic Cloud LLM adapter using httpx and JSON structured response mode."""

    def __init__(
        self,
        name: str = "cloud",
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base_url: Optional[str] = None,
        max_retries: int = 2,
        initial_retry_delay: float = 0.05,
    ) -> None:
        model_name = model or os.getenv("TUTOR_MODEL", "mock-tutor-v1")
        super().__init__(
            name=name,
            model=model_name,
            max_retries=max_retries,
            initial_retry_delay=initial_retry_delay,
        )
        self.api_key = api_key or os.getenv("TUTOR_API_KEY", "")
        default_base_url = (
            "https://openrouter.ai/api/v1"
            if (name == "openrouter" or "openrouter" in str(model_name).lower())
            else "https://api.openai.com/v1"
        )
        self.api_base_url = api_base_url or os.getenv("TUTOR_API_BASE_URL", default_base_url)
        self.supports_response_format = os.getenv("TUTOR_STRUCTURED_OUTPUTS", "1") != "0"

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        timeout_seconds: float = 2.0,
    ) -> Dict[str, Any]:
        """Calls external cloud endpoint with structured JSON enforcement."""

        async def _call() -> Dict[str, Any]:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            if self.name == "openrouter" or "openrouter.ai" in self.api_base_url:
                headers["HTTP-Referer"] = os.getenv("OPENROUTER_HTTP_REFERER", "https://qtrace.dev")
                headers["X-Title"] = os.getenv("OPENROUTER_TITLE", "Q-Trace")

            use_response_format = self.supports_response_format
            body: Dict[str, Any] = {
                "model": self.model,
                "temperature": 0.1,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            }
            if use_response_format:
                body["response_format"] = {"type": "json_object"}

            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                try:
                    response = await client.post(
                        f"{self.api_base_url.rstrip('/')}/chat/completions",
                        json=body,
                        headers=headers,
                    )
                except httpx.TimeoutException as err:
                    raise asyncio.TimeoutError(str(err)) from err
                except httpx.HTTPError as err:
                    raise TutorProviderError(f"HTTP transport failure: {err}") from err

                # Auto-fallback if provider rejects structured-outputs / response_format
                if response.status_code == 400 and use_response_format and (
                    "structured-output" in response.text.lower()
                    or "response_format" in response.text.lower()
                ):
                    body.pop("response_format", None)
                    response = await client.post(
                        f"{self.api_base_url.rstrip('/')}/chat/completions",
                        json=body,
                        headers=headers,
                    )

                if response.status_code == 429:
                    raise TutorRateLimitError("429 Rate Limit Exceeded")
                elif response.status_code >= 400:
                    raise TutorProviderError(f"Provider returned error HTTP {response.status_code}: {response.text}")

                try:
                    raw_json = response.json()
                    content = raw_json["choices"][0]["message"]["content"].strip()
                    if content.startswith("```"):
                        lines = content.splitlines()
                        if lines and lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines and lines[-1].startswith("```"):
                            lines = lines[:-1]
                        content = "\n".join(lines).strip()

                    parsed = json.loads(content)
                    if not isinstance(parsed, dict):
                        raise ValueError("Root JSON is not an object")
                    parsed["model"] = self.model
                    parsed["fallbackUsed"] = False
                    return parsed
                except (KeyError, json.JSONDecodeError, ValueError) as err:
                    raise TutorMalformedOutputError(f"Malformed LLM JSON output: {err}") from err

        return await self.execute_with_retry(_call, timeout_seconds=timeout_seconds)


def get_tutor_provider(
    provider_type: Optional[str] = None,
    model: Optional[str] = None,
    api_key: Optional[str] = None,
) -> BaseTutorProvider:
    """Factory creating the appropriate tutor provider adapter based on config."""
    prov = (provider_type or os.getenv("TUTOR_PROVIDER", "mock")).lower().strip()
    if prov in ("mock", "fake"):
        return FakeTutorProvider(model=model or os.getenv("TUTOR_MODEL", "mock-tutor-v1"))
    elif prov in ("cloud", "openai", "anthropic", "gemini", "openrouter"):
        return CloudTutorProvider(name=prov, model=model, api_key=api_key)
    else:
        # Unknown provider falls back to safe FakeTutorProvider in mock mode
        return FakeTutorProvider(model=model or "mock-tutor-v1")
