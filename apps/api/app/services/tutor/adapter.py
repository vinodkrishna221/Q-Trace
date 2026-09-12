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
import re
import time
from typing import Any, Callable, Dict, Optional, Tuple, Union

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


class TutorAccountRateLimitError(TutorRateLimitError):
    """Raised when provider returns HTTP 429 representing an account-wide shared key rate limit."""
    pass


class TutorMalformedOutputError(TutorProviderError):
    """Raised when the provider produces unparseable or schema-violating JSON."""
    pass


class TutorAuthError(TutorProviderError):
    """Raised when the provider returns HTTP 401/403 or API key is missing."""
    pass


class ChatCompletionResult(tuple):
    """Tuple of (content: str, model_used: str) supporting unpacking, named access, and substring containment."""

    def __new__(cls, content: str, model_used: str) -> ChatCompletionResult:
        return super().__new__(cls, (str(content), str(model_used)))

    @property
    def content(self) -> str:
        return self[0]

    @property
    def model_used(self) -> str:
        return self[1]

    @property
    def model(self) -> str:
        return self[1]

    def __contains__(self, item: Any) -> bool:
        if isinstance(item, str):
            return item in self[0] or item in self[1]
        return super().__contains__(item)

    def __str__(self) -> str:
        return self[0]


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

    @abc.abstractmethod
    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        system_prompt: str,
        timeout_seconds: float = 20.0,
    ) -> ChatCompletionResult:
        """Generate conversational text response from a dialogue history."""
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
                raise TutorTimeoutError(f"Provider '{self.name}' timed out after {attempt} attempts ({timeout_seconds}s limit).") from err
            except TutorAccountRateLimitError:
                # Account-wide rate limit (HTTP 429) fails fast immediately to protect shared key
                raise
            except TutorRateLimitError as err:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                print(f"[llm] provider={self.name} model={self.model} duration_ms={duration_ms} status=rate_limit attempt={attempt}")
                if attempt > self.max_retries:
                    raise
                await asyncio.sleep(delay)
                delay *= 2
            except TutorTimeoutError:
                # Do not retry if provider or candidate models have definitively timed out
                raise
            except TutorAuthError:
                # Do not retry authentication failures
                raise
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

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        system_prompt: str,
        timeout_seconds: float = 20.0,
    ) -> ChatCompletionResult:
        last_q = messages[-1]["content"] if messages else ""
        lower_q = last_q.lower()
        if "mixed" in lower_q or "trace" in lower_q:
            text = "Tracing out either qubit from $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$ yields a reduced density matrix $\\rho_A = \\frac{1}{2}|0\\rangle\\langle 0| + \\frac{1}{2}|1\\rangle\\langle 1|$, which has purity $\\text{Tr}(\\rho_A^2) = 0.5$ (a maximally mixed state). This mathematically proves that neither qubit possesses an independent statevector."
        elif "faster" in lower_q or "ftl" in lower_q or "light" in lower_q or "communication" in lower_q:
            text = "According to the No-Communication Theorem, local measurements produce genuinely random 50/50 outcomes, meaning no observable probability change occurs locally without classical signaling."
        elif "swap" in lower_q or "order" in lower_q:
            text = "Swapping the gates by applying CNOT before Hadamard on $|00\\rangle$ leaves the control and target in $|00\\rangle$ because the control qubit is $|0\\rangle$. The subsequent Hadamard would then only superpose qubit 0, yielding no entanglement at all."
        elif any(greet in lower_q for greet in ["hi", "hello", "hey"]):
            text = "Hello! I am your Q-Trace Socratic Tutor. Ask me any question about your Bell state circuit, the measurement probabilities, or why tracing out an entangled qubit produces a mixed state!"
        else:
            text = f"Grounded response from {self.model}: In this simulation run, measurement collapses both qubits into correlated outcomes (00 and 11 each with probability 0.5)."
        return ChatCompletionResult(text, self.model)


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
            if not self.api_key:
                raise TutorAuthError(f"API key missing for provider '{self.name}'.")

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            if self.name == "openrouter" or "openrouter.ai" in self.api_base_url:
                headers["HTTP-Referer"] = os.getenv("OPENROUTER_HTTP_REFERER", "https://qtrace.dev")
                headers["X-Title"] = os.getenv("OPENROUTER_TITLE", "Q-Trace")

            use_response_format = self.supports_response_format
            max_tokens_val = int(os.getenv("TUTOR_MAX_TOKENS", "600"))
            body: Dict[str, Any] = {
                "model": self.model,
                "temperature": 0.1,
                "max_tokens": max_tokens_val,
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

                if response.status_code in (401, 403):
                    raise TutorAuthError(f"Provider returned authentication failure HTTP {response.status_code}: {response.text}")
                elif response.status_code == 429:
                    # Problem 2.6: HTTP 429 is an account-level rate limit on the shared TUTOR_API_KEY.
                    # Fail fast immediately so execute_with_retry does not hammer the saturated key.
                    print(f"[llm] Account rate limit HTTP 429 on model {self.model}; failing fast to protect API key.")
                    raise TutorAccountRateLimitError(f"Account-level HTTP 429 Rate Limit Exceeded on model {self.model}")
                elif response.status_code >= 400:
                    raise TutorProviderError(f"Provider returned error HTTP {response.status_code}: {response.text}")

                try:
                    raw_json = response.json()
                    choice = raw_json["choices"][0]
                    content = choice["message"]["content"].strip()
                    # Strip reasoning <think> tags if model emits them
                    content = re.sub(r"<think>[\s\S]*?</think>", "", content).strip()

                    # Problem 2.3: Regex boundary extraction to cleanly extract outermost JSON object
                    # and ignore markdown fences or trailing conversational commentary.
                    fence_match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", content)
                    if fence_match:
                        json_str = fence_match.group(1).strip()
                    else:
                        json_match = re.search(r"\{[\s\S]*\}", content)
                        json_str = json_match.group(0) if json_match else content

                    parsed = json.loads(json_str)
                    if not isinstance(parsed, dict):
                        raise ValueError("Root JSON is not an object")
                    parsed["model"] = self.model
                    parsed["fallbackUsed"] = False
                    return parsed
                except (KeyError, json.JSONDecodeError, ValueError) as err:
                    raise TutorMalformedOutputError(f"Malformed LLM JSON output: {err}") from err

        return await self.execute_with_retry(_call, timeout_seconds=timeout_seconds)

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        system_prompt: str,
        timeout_seconds: float = 14.0,
    ) -> ChatCompletionResult:
        """Calls external cloud endpoint (e.g. OpenRouter) with conversational messages and per-candidate failover."""
        if not self.api_key or not str(self.api_key).strip():
            raise TutorAuthError(f"API key missing for provider '{self.name}'.")

        candidate_models = [self.model]
        backup_model = os.getenv("TUTOR_BACKUP_MODEL", "nex-agi/nex-n2.5-mini:free")
        if backup_model:
            backup_model = backup_model.strip()
        if (
            (self.name == "openrouter" or "openrouter.ai" in self.api_base_url)
            and backup_model
            and backup_model != self.model
        ):
            candidate_models.append(backup_model)

        # Allocate per-candidate timeout strictly bounded by overall timeout_seconds budget
        default_candidate_timeout = float(os.getenv("TUTOR_CANDIDATE_TIMEOUT_SECONDS", "6.0"))
        if len(candidate_models) > 1:
            per_candidate_timeout = min(
                default_candidate_timeout,
                max(0.5, (timeout_seconds - 0.5) / len(candidate_models)),
            )
        else:
            per_candidate_timeout = min(default_candidate_timeout, timeout_seconds)

        failed_candidates: set[str] = set()
        timed_out_candidates: set[str] = set()
        deadline = time.monotonic() + timeout_seconds

        async def _call() -> ChatCompletionResult:
            headers = {
                "Authorization": f"Bearer {self.api_key.strip()}",
                "Content-Type": "application/json",
            }
            if self.name == "openrouter" or "openrouter.ai" in self.api_base_url:
                headers["HTTP-Referer"] = os.getenv("OPENROUTER_HTTP_REFERER", "https://qtrace.dev")
                headers["X-Title"] = os.getenv("OPENROUTER_TITLE", "Q-Trace")

            conversation = [{"role": "system", "content": system_prompt}] + messages
            max_tokens_val = int(os.getenv("TUTOR_MAX_TOKENS", "600"))

            active_candidates = [c for c in candidate_models if c not in failed_candidates]
            if not active_candidates:
                if timed_out_candidates:
                    raise TutorTimeoutError(f"All candidate models {candidate_models} previously timed out.")
                raise TutorProviderError(f"All candidate models {candidate_models} previously failed.")

            last_err: Optional[Exception] = None

            for candidate in active_candidates:
                now = time.monotonic()
                remaining_budget = deadline - now
                if remaining_budget <= 0.2:
                    timed_out_candidates.add(candidate)
                    failed_candidates.add(candidate)
                    raise TutorTimeoutError(
                        f"Overall budget ({timeout_seconds}s) expired before candidate '{candidate}' could respond."
                    )

                call_timeout = min(per_candidate_timeout, max(0.2, remaining_budget - 0.1))

                body: Dict[str, Any] = {
                    "model": candidate,
                    "temperature": 0.4,
                    "max_tokens": max_tokens_val,
                    "messages": conversation,
                }

                try:
                    async with httpx.AsyncClient(timeout=call_timeout) as client:
                        response = await asyncio.wait_for(
                            client.post(
                                f"{self.api_base_url.rstrip('/')}/chat/completions",
                                json=body,
                                headers=headers,
                            ),
                            timeout=call_timeout,
                        )
                except (httpx.TimeoutException, asyncio.TimeoutError) as err:
                    timed_out_candidates.add(candidate)
                    failed_candidates.add(candidate)
                    last_err = asyncio.TimeoutError(str(err))
                    print(f"[llm-chat] Model {candidate} timed out ({call_timeout:.2f}s), checking next candidate...")
                    continue
                except asyncio.CancelledError:
                    timed_out_candidates.add(candidate)
                    failed_candidates.add(candidate)
                    raise
                except httpx.HTTPError as err:
                    failed_candidates.add(candidate)
                    last_err = TutorProviderError(f"HTTP transport failure on {candidate}: {err}")
                    continue

                if response.status_code in (401, 403):
                    failed_candidates.add(candidate)
                    raise TutorAuthError(f"Authentication failure HTTP {response.status_code} on {candidate}")

                if response.status_code == 429:
                    # Problem 2.6: HTTP 429 is an account-level rate limit on the shared TUTOR_API_KEY.
                    # Halting the candidate loop immediately and failing fast to DEMO_FALLBACK avoids hammering the API.
                    print(f"[llm-chat] Account rate limit HTTP 429 on model {candidate}; halting candidate loop to protect API key.")
                    raise TutorAccountRateLimitError(f"Account-level HTTP 429 Rate Limit Exceeded on model {candidate}")

                if response.status_code in (404, 502, 503, 504):
                    failed_candidates.add(candidate)
                    last_err = TutorRateLimitError(f"{response.status_code} Error on model {candidate}")
                    print(f"[llm-chat] Model {candidate} unavailable ({response.status_code}), checking backup model...")
                    continue
                elif response.status_code >= 400:
                    failed_candidates.add(candidate)
                    last_err = TutorProviderError(f"Provider returned error HTTP {response.status_code}: {response.text}")
                    continue

                try:
                    raw_json = response.json()
                    choice = raw_json["choices"][0]
                    content = choice["message"]["content"].strip()
                    # Strip reasoning <think> tags if model emits them
                    content = re.sub(r"<think>[\s\S]*?</think>", "", content).strip()
                    finish_reason = choice.get("finish_reason")
                    if finish_reason == "length":
                        print(f"[llm-chat] Model {candidate} response hit token limit (finish_reason=length)")
                    return ChatCompletionResult(content, candidate)
                except (KeyError, IndexError, json.JSONDecodeError, ValueError) as err:
                    failed_candidates.add(candidate)
                    last_err = TutorMalformedOutputError(f"Malformed LLM output: {err}")
                    continue

            if timed_out_candidates and len(timed_out_candidates) >= len(candidate_models):
                raise TutorTimeoutError(f"All candidate models {candidate_models} timed out.")
            if isinstance(last_err, TutorRateLimitError):
                raise last_err
            elif isinstance(last_err, asyncio.TimeoutError):
                raise last_err
            elif last_err:
                raise last_err
            raise TutorProviderError("All candidate models failed to return a response.")

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
