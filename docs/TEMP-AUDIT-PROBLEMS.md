# Q-Trace Systems & Failure Mode Audit

**Generated:** 2026-09-12  
**Scope:** OpenRouter Live AI Integration, Multi-Model Failover, KaTeX Mathematical Rendering, Token Minimization, Render Cold-Start Mitigation, and Concurrency/State Integrity.

---

## Executive Summary

| Severity | Count | Primary Areas |
|---|---|---|
| **CRITICAL (P0)** | 4 | Timeout Deadlock, 504 Gateway Conflation, Circuit State Desync Race Condition, Unauthenticated API Key Cloud Cascade |
| **HIGH (P1)** | 6 | Main TutorCard KaTeX Bypass, 350-Token Truncation Corrupting Delimiters, Markdown JSON Parsing Failures, Vitest Production Bypass, Model Attribution Drift, Shared Free-Tier Concurrency Limits |
| **MEDIUM (P2)** | 5 | Plain-text Dirac Conversion, Leaked `<think>` Chain-of-Thought, Route-Specific Pre-warming, Contract Markdown Drift, Stale Chat History |
| **LOW (P3)** | 3 | Dead Exception Handling, Asymmetric StateTrace Size, Generic Basis Key Attributions |

---

## 1. Critical Failures (P0 — Must Fix Before Live Demo)

### 🔴 Problem 1.1: Inner/Outer Timeout Deadlock Starves Candidate 2 (Backup Model)
- **Files:** 
  - [`apps/api/app/services/tutor/adapter.py#L104-L114`](file:///d:/Q-Trace/apps/api/app/services/tutor/adapter.py#L104-L114)
  - [`apps/api/app/services/tutor/adapter.py#L390-L435`](file:///d:/Q-Trace/apps/api/app/services/tutor/adapter.py#L390-L435)
  - [`apps/api/app/services/tutor/service.py#L420`](file:///d:/Q-Trace/apps/api/app/services/tutor/service.py#L420)
- **Failure Mechanism:**
  `service.py` sets `effective_timeout = 25.0s`. `adapter.py`'s `execute_with_retry` sets an outer `asyncio.wait_for(..., timeout=25.0s)`. Inside `_call`, `httpx.AsyncClient(timeout=25.0s)` runs a candidate loop over `[primary, backup]`.
  If Candidate 1 (`inclusionai/ling-3.0-flash-vl:free`) hangs or stalls:
  1. `client.post` times out at 25s.
  2. At the exact same instant, `asyncio.wait_for` hits 25s and terminates `_call`.
  3. The loop is aborted before advancing to Candidate 2 (`nex-agi/nex-n2.5-mini:free`).
  4. `execute_with_retry` catches `TimeoutError`, triggers an outer retry, and restarts `_call` at Candidate 1. Total UI hang: **75+ seconds**.
- **Impact:** The backup model is structurally unreachable during provider stalls or connection hangs.
- **Proposed Solution:** Decouple per-candidate HTTP timeout (e.g. 5.0s) from overall execution budget (12.0s). Never retry candidate 1 in outer backoff if candidate 1 already timed out.

---

### 🔴 Problem 1.2: Conflation of Render HTTP 504 Gateway Timeout with Simulator Runtime Timeout
- **Files:**
  - [`apps/web/lib/api-client.ts#L146-L155`](file:///d:/Q-Trace/apps/web/lib/api-client.ts#L146-L155)
  - [`apps/web/app/(app)/learn/bell-state/page.tsx#L234-L245`](file:///d:/Q-Trace/apps/web/app/%28app%29/learn/bell-state/page.tsx#L234-L245)
- **Failure Mechanism:**
  `api-client.ts` detects simulator timeouts using:
  ```typescript
  const isTimeout = Boolean(
    errorObj?.message?.toLowerCase().includes('timeout') ||
    errorObj?.status === 504 ||
    errorObj?.code === 'SIMULATION_TIMEOUT'
  );
  if (isTimeout) throw err;
  ```
  On Render Free Tier, backend containers spin down after 15 minutes of inactivity (spin-up takes 50–90 seconds). If a user clicks "Run Simulation" while the container is spinning up:
  1. Cloudflare/Render proxy times out and returns generic `HTTP 504 Gateway Timeout`.
  2. Because `status === 504`, `apiClient` throws `err`, bypassing the graceful `DEMO_SIMULATION_RUN` fallback.
  3. `page.tsx` catches this and displays an amber alert:
     > *"Simulation execution exceeded 1500ms timeout threshold."*
  4. The user/judge is falsely told the quantum simulator timed out, and Steps 3, 4, and 5 remain locked and unrendered.
- **Impact:** Misdiagnoses infrastructure container boot latency as a quantum engine bug and crashes the user flow.
- **Proposed Solution:** Only treat errors with `errorObj?.code === 'SIMULATION_TIMEOUT'` as engine timeouts. If `status === 504`, offer an instant switch to offline simulation.

---

### 🔴 Problem 1.3: Circuit Workspace Remains Editable During Async Pipeline Run (Race Condition)
- **Files:**
  - [`apps/web/features/circuit/interactive-circuit-workspace.tsx#L91-L94`](file:///d:/Q-Trace/apps/web/features/circuit/interactive-circuit-workspace.tsx#L91-L94)
  - [`apps/web/app/(app)/learn/bell-state/page.tsx#L110-L135`](file:///d:/Q-Trace/apps/web/app/%28app%29/learn/bell-state/page.tsx#L110-L135)
- **Failure Mechanism:**
  `handleRunSimulation` executes an asynchronous pipeline: `runSimulation()` $\rightarrow$ `diagnoseFlightRecorder()` $\rightarrow$ `explainWithTutor()`. Over cloud networks, this takes 3–15 seconds.
  While running, the "Run Simulation" button is disabled, but `interactive-circuit-workspace.tsx` only disables the gate palette and grid when `readOnly` is true. `readOnly` is not bound to `isSimulating`.
  The learner can drag, move, or delete gates while the pipeline is in flight. When execution finishes, the visual canvas displays the newly edited circuit, while the flight recorder and tutor display data from the old circuit.
- **Impact:** Complete visual-state desynchronization between canvas and quantum flight recorder.
- **Proposed Solution:** Pass `readOnly={readOnly || isSimulating}` to `<GatePalette />` and `<QubitWiresGrid />`.

---

### 🔴 Problem 1.4: Missing API Key Guard in `generate_explanation` Causes 3 Failed HTTP 401s
- **Files:**
  - [`apps/api/app/services/tutor/service.py#L125-L133`](file:///d:/Q-Trace/apps/api/app/services/tutor/service.py#L125-L133)
  - [`render.yaml#L33-L34`](file:///d:/Q-Trace/render.yaml#L33-L34)
- **Failure Mechanism:**
  In `chat_with_tutor`, `has_api_key = bool(os.getenv("TUTOR_API_KEY", "").strip())` prevents cloud calls if no key exists.
  However, in `generate_explanation` (`POST /v1/tutor/explain`), this guard is missing. If `TUTOR_API_KEY` is not manually set in the Render dashboard (`sync: false`), `generate_explanation` makes an HTTP request with an empty `Authorization: Bearer ` header.
  OpenRouter rejects with `HTTP 401 Unauthorized`. `adapter.py` classifies this as `TutorProviderError`, retrying 3 times and adding 2–3 seconds of latency before falling back to local explanations.
- **Impact:** Unnecessary latency and failed requests on every divergence step if unconfigured.
- **Proposed Solution:** Add `not has_api_key` to `should_fallback` in `generate_explanation`.

---

## 2. High-Severity Problems (P1 — Resilience & Display Defects)

### ⚠️ Problem 2.1: Main Diagnostic TutorCard and FlightRecorder Omit `renderMathText`
- **Files:**
  - [`apps/web/features/tutor/tutor-card.tsx#L401, L474, L505, L531`](file:///d:/Q-Trace/apps/web/features/tutor/tutor-card.tsx#L401)
  - [`apps/web/features/flight-recorder/flight-recorder-view.tsx#L452, L481, L505`](file:///d:/Q-Trace/apps/web/features/flight-recorder/flight-recorder-view.tsx#L452)
- **Failure Mechanism:**
  `renderMathText` was implemented exclusively in `SocraticQAPanel` (line 339) for follow-up chat turns.
  The main TutorCard and FlightRecorder components still render plain text strings:
  - Summary: `<p className="text-ink font-medium">{summary}</p>` (L474)
  - Step explanations: `<p className="text-ink-dim font-sans">{step.body}</p>` (L505)
  - Numerical claims: `<span className="text-evidence">{item.claim}</span>` (L531)
  - FlightRecorder summary: `<p className="text-ink font-medium">{tutorResponse.summary}</p>` (L452)
  Because backend curated fallbacks and cloud responses output mathematical symbols (`$|\Phi^+\rangle$`, `$\rho_0 = \text{Tr}_1(...) = \frac{1}{2}|0\rangle\langle 0|$`), learners see unrendered raw text with dollar signs and backslashes in the main diagnosis card.
- **Proposed Solution:** Wrap `summary`, `step.body`, and `claim` text nodes with `renderMathText()`.

---

### ⚠️ Problem 2.2: Output Token Truncation (`max_tokens: 350`) Corrupts KaTeX Math
- **Files:**
  - [`apps/api/app/services/tutor/adapter.py#L381`](file:///d:/Q-Trace/apps/api/app/services/tutor/adapter.py#L381)
  - [`apps/web/features/tutor/tutor-card.tsx#L60-L90`](file:///d:/Q-Trace/apps/web/features/tutor/tutor-card.tsx#L60-L90)
- **Failure Mechanism:**
  `max_tokens: 350` was chosen to aggressively reduce latency. If the LLM generates a detailed explanation with formulas, truncating output mid-formula (e.g. `$$\rho_A = \frac{1}{2}|0\rangle\langle 0| + \frac{1}{`) leaves the closing delimiter unclosed.
  The frontend regex `/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g` fails to match the unclosed delimiter, causing the entire remaining text to be rendered as raw LaTeX. If KaTeX parses truncated syntax, it renders an inline `<span class="katex-error">` error badge.
- **Proposed Solution:** Increase `TUTOR_MAX_TOKENS` to `600`, verify `finish_reason != "length"`, and sanitize unclosed LaTeX delimiters prior to KaTeX rendering.

---

### ⚠️ Problem 2.3: Flawed Markdown JSON Parser Breaks on Trailing Commentary
- **Files:**
  - [`apps/api/app/services/tutor/adapter.py#L344-L352`](file:///d:/Q-Trace/apps/api/app/services/tutor/adapter.py#L344-L352)
- **Failure Mechanism:**
  Because `TUTOR_STRUCTURED_OUTPUTS=0` is active on free models, JSON is wrapped in markdown fences. `adapter.py` strips fences only if `content.startswith("```")` and `lines[-1].startswith("```")`.
  If a free model outputs closing commentary after the fence (e.g. ```` ```\nHope this helps! ````), `lines[-1]` is not a code fence. Code fences are not stripped, causing `json.loads` to crash with `JSONDecodeError: Extra data` and discard the live response.
- **Proposed Solution:** Use regex boundary extraction (`re.search(r"\{[\s\S]*\}", content)`) to extract the JSON object.

---

### ⚠️ Problem 2.4: Production Component Contains Vitest Unit Test Bypass
- **Files:**
  - [`apps/web/features/tutor/tutor-card.tsx#L176-L193`](file:///d:/Q-Trace/apps/web/features/tutor/tutor-card.tsx#L176-L193)
- **Failure Mechanism:**
  `tutor-card.tsx` includes:
  ```tsx
  if (process.env.NODE_ENV === 'test') {
    let syncAnswer = 'In a maximally entangled Bell state |Φ+⟩...';
    setQaHistory((prev) => [...prev, { q, a: syncAnswer, model: 'DEMO_FALLBACK', fallbackUsed: true }]);
    return;
  }
  ```
  This bypasses `chatMutation.mutateAsync`, `apiClient.askTutorChat`, TanStack Query hooks, and network error handling during automated testing. CI passes even if network or state logic is broken.
- **Proposed Solution:** Remove the bypass from production source code. Mock the API client at the test file level with `vi.spyOn(apiClient, 'askTutorChat')`.

---

### ⚠️ Problem 2.5: False Model Attribution in UI and Telemetry on Failover
- **Files:**
  - [`apps/api/app/services/tutor/adapter.py#L422`](file:///d:/Q-Trace/apps/api/app/services/tutor/adapter.py#L422)
  - [`apps/api/app/services/tutor/service.py#L430`](file:///d:/Q-Trace/apps/api/app/services/tutor/service.py#L430)
- **Failure Mechanism:**
  `chat_completion()` returns only `content: str`. `service.py` always logs `active_provider.model` (the primary model).
  If Candidate 1 fails and Candidate 2 (`nex-agi/nex-n2.5-mini:free`) answers, the UI badge still displays `Live AI (inclusionai/ling-3.0-flash-vl:free)`.
- **Proposed Solution:** Have `chat_completion()` return `(content: str, model_used: str)` so UI badges and audit logs reflect the actual model.

---

### ⚠️ Problem 2.6: Shared Account Rate & Concurrency Caps on Free Tier
- **Files:**
  - [`apps/api/app/services/tutor/adapter.py#L383-L387`](file:///d:/Q-Trace/apps/api/app/services/tutor/adapter.py#L383-L387)
  - [`.env#L16`](file:///d:/Q-Trace/.env#L16)
- **Failure Mechanism:**
  Both candidate models share the same `TUTOR_API_KEY`. OpenRouter enforces global account-level concurrency limits on free tiers. If an account is rate-limited (HTTP 429), immediately retrying with Candidate 2 on the same key will also return 429.
- **Proposed Solution:** On HTTP 429, skip Candidate 2 and immediately drop to deterministic curated fallback (`DEMO_FALLBACK`).

---

## 3. Medium & Low Severity Problems (P2 / P3)

### 🟡 Problem 3.1: Dirac Normalization Converts Plain Text to Raw LaTeX
- **File:** [`apps/web/features/tutor/tutor-card.tsx#L44`](file:///d:/Q-Trace/apps/web/features/tutor/tutor-card.tsx#L44)
- **Mechanism:** Replaces `|0⟩` with `|0\rangle` without wrapping in `$`. In plain text, it renders on-screen as literal `|0\rangle`.
- **Fix:** Replace with `$|0\rangle$` and expand regex to match bras (`⟨0|`) and Bell states (`|Φ+⟩`).

### 🟡 Problem 3.2: Reasoning `<think>` Tags Leaked to UI
- **File:** [`apps/api/app/services/tutor/adapter.py#L421`](file:///d:/Q-Trace/apps/api/app/services/tutor/adapter.py#L421)
- **Mechanism:** Reasoning models emit `<think>...</think>`, which leaks into the chat window and exhausts the token budget.
- **Fix:** Strip `<think>[\s\S]*?</think>` with regex before returning.

### 🟡 Problem 3.3: Pre-warm Ping Restricted to Single Route
- **File:** [`apps/web/app/(app)/learn/bell-state/page.tsx#L97`](file:///d:/Q-Trace/apps/web/app/%28app%29/learn/bell-state/page.tsx#L97)
- **Mechanism:** Ping only fires when `/learn/bell-state` mounts. If a user spends 1 minute on `/` or `/modules`, container boot is delayed until they enter the lesson.
- **Fix:** Move the fire-and-forget pre-warm ping to `apps/web/app/layout.tsx`.

### 🟡 Problem 3.4: Contract Drift (WarRoom Prime Directive 2)
- **File:** [`board/contracts/flight-recorder-tutor.md`](file:///d:/Q-Trace/board/contracts/flight-recorder-tutor.md)
- **Mechanism:** `POST /v1/tutor/chat` was implemented in code, but was not updated in the canonical contract specification.
- **Fix:** Document `POST /v1/tutor/chat` in `flight-recorder-tutor.md` v1.3.

### 🟡 Problem 3.5: Chat History Retained Across Circuit Mutations
- **File:** [`apps/web/features/tutor/tutor-card.tsx#L133`](file:///d:/Q-Trace/apps/web/features/tutor/tutor-card.tsx#L133)
- **Mechanism:** When a user modifies the circuit and re-simulates, previous Q&A history is still passed to the LLM, creating context confusion.
- **Fix:** Reset or label `qaHistory` when `simulationRunId` changes.

---

## 4. Priority Action Checklist

```markdown
- [x] P0.1 Decouple candidate timeouts in adapter.py (5s per candidate, 12s overall) — VERIFIED & TESTED.
- [x] P0.2 Lock circuit workspace in interactive-circuit-workspace.tsx when isSimulating is true — VERIFIED & TESTED.
- [x] P0.3 Differentiate Render 504 infrastructure gateway errors from simulator runtime timeouts in api-client.ts — VERIFIED & TESTED.
- [x] P0.4 Add has_api_key validation guard to generate_explanation in service.py — VERIFIED & TESTED.
- [x] P1.1 Wrap summary, step bodies, and numerical claims in renderMathText in tutor-card.tsx & flight-recorder-view.tsx — VERIFIED & TESTED.
- [x] P1.2 Increase TUTOR_MAX_TOKENS to 600 and heal unclosed math delimiters — VERIFIED & TESTED.
- [x] P1.3 Implement regex boundary extraction (re.search(r"\{[\s\S]*\}")) for structured JSON parsing — VERIFIED & TESTED.
- [x] P1.4 Remove process.env.NODE_ENV === 'test' production bypass from tutor-card.tsx — VERIFIED & TESTED.
- [x] P1.5 Return model_used from chat_completion to fix UI badge attribution — VERIFIED & TESTED.
- [x] P1.6 Fail-fast on HTTP 429 without retrying candidate on saturated account key — VERIFIED & TESTED.
```
