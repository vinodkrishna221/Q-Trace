# Warden Review — SIM-8 · Harden timeouts, flags and deployed readiness

**Reviewer:** Warden (fresh session)  
**Card:** SIM-8  
**Branch:** `feat/simulation-api/sim-8-harden-timeouts-flags-and-deployed`  
**Base:** `feat/simulation-api/sim-7-swap-routes-to-the-production` (`1d601bf`) / `main`  
**Date:** 2026-09-06  
**Member:** Uday Rohit  

## Verdict: MERGE

All 9 review gates are GREEN. Zero blockers. Verified through independent test runs in a fresh session.

---

## Check-by-check

### 1. File ownership & cross-track check — PASS
Files touched:
- `apps/api/app/main.py`
- `apps/api/app/routers/simulation_runs.py`
- `apps/api/app/services/simulation_service.py`
- `apps/api/railway.toml`
- `apps/api/tests/unit/simulation/test_runtime_guards.py`
- `board/STATUS.md`
- `missions/uday-rohit-mission.md`

All code files reside strictly inside `apps/api/**` within the simulation-api ownership boundary. Zero cross-track edits (no edits to `apps/web/`, AI pedagogy, progress analytics, or data models).

### 2. Deliverable completeness — PASS
All requirements from `plans/simulation-api-phase-plan.md` SIM-8 card delivered:
- **Adapter flags:** `ENABLE_QISKIT` (`_qiskit_enabled()`) returns 503 `ADAPTER_UNAVAILABLE` immediately when disabled; `ENABLE_PENNYLANE` (`_pennylane_enabled()`) returns `skippedReason="PENNYLANE_DISABLED"` when disabled.
- **1500ms timeout:** Default timeout locked to 1.5s via `_DEFAULT_TIMEOUT_S = 1.5`, overridable via `QTRACE_SIM_TIMEOUT_S`. Returns 504 `SIMULATION_TIMEOUT` with integer `details.timeoutMs`.
- **Threadpool boundary:** `loop.run_in_executor(None, build_simulation_run, body, request_id)` runs synchronous CPU-bound Qiskit simulator safely off the event loop.
- **Structured duration/error logs:** `qtrace.sim_route` and `qtrace.sim_service` log structured messages (`sim_route.adapter_disabled`, `sim_route.timeout`, `sim_route.success`, `sim_service.aer_ok`, `sim_service.aer_error`) with `requestId`, `runId`, `durationMs`, and `adapter`.
- **Readiness checks:** `/ready` endpoint updated with `primaryAdapterEnabled` boolean, per-adapter statuses (`adapters.QISKIT_AER`, `adapters.PENNYLANE`), and `workerNote`.
- **Railway smoke configuration:** `apps/api/railway.toml` specifies Nixpacks builder, start command locking `--workers 1`, `/health` health check, and runtime env defaults.

### 3. Exact TEST command and result — PASS
**Command:**
```bash
uv run --project apps/api pytest apps/api/tests/unit/simulation/test_runtime_guards.py
```
**Result (Warden-run):**
```text
10 passed, 1 warning in 21.58s
```
- `test_timeout_returns_504`: PASS
- `test_timeout_detail_includes_timeout_ms`: PASS
- `test_pennylane_disabled_flag_skips_conformance`: PASS
- `test_assert_finite_raises_on_nan`: PASS
- `test_assert_finite_raises_on_inf`: PASS
- `test_assert_finite_passes_on_valid_float`: PASS
- `test_ready_reflects_qiskit_enabled`: PASS
- `test_ready_reflects_qiskit_disabled`: PASS
- `test_ready_pennylane_disabled_visible`: PASS
- `test_qiskit_disabled_returns_503`: PASS

### 4. Regression test suite — PASS
**Command:**
```bash
uv run --project apps/api pytest apps/api/tests/unit/simulation/
```
**Result (Warden-run):**
```text
165 passed, 1 warning in 23.47s
```
Zero regressions across all 7 simulation test modules (SIM-1 through SIM-8).

### 5. Contract / schema consistency — PASS
- 503 `ADAPTER_UNAVAILABLE` matches `board/contracts/circuit-simulation.md` error table for `POST /v1/simulation-runs`.
- 504 `SIMULATION_TIMEOUT` matches contract specification, returning `{code, message, requestId, details: {timeoutMs}}`.
- When `ENABLE_PENNYLANE=0`, conformance returns `skippedReason: "PENNYLANE_DISABLED"`, `passed: false`, and primary simulation status remains `SUCCEEDED`, exactly fulfilling contract NOTES: *"primary response succeeds when PennyLane is disabled and sets a disclosed skippedReason"*.
- No contract schema drift; version 1 remains intact.

### 6. quantum-runtime rules — PASS
- CPU-bound Qiskit Aer simulation executes via threadpool executor, never blocking the asyncio event loop.
- Timeout enforced at 1500ms contract budget (`_DEFAULT_TIMEOUT_S = 1.5`), returning `SIMULATION_TIMEOUT` instead of hanging requests.
- `_assert_finite` verifies non-NaN and non-Infinity guarantees on amplitudes, probabilities, and Bloch components.
- State trace pre-measurement and measurement sampling remain intact from SIM-3/SIM-4.

### 7. FastAPI rules — PASS
- Standard error envelope maintained via `HTTPException` detail dictionary `{code, message, requestId, details}`.
- Request-ID propagated from `request.state.request_id` into all logs, error payloads, and saved entities.
- Logging utilizes standard library `logging.getLogger` on module namespace.

### 8. Fallback / demo behavior — PASS
- Demo safety: when PennyLane is toggled off (`ENABLE_PENNYLANE=0`), circuit simulation does not crash or abort; it executes primary Qiskit Aer and returns cleanly with `skippedReason="PENNYLANE_DISABLED"`.
- When Qiskit is toggled off (`ENABLE_QISKIT=0`), returns 503 immediately without hanging or exhausting threadpool workers.
- Single-worker configuration enforced in `railway.toml` (`--workers 1`), preserving in-memory repository safety for `DEMO_LOCAL=1` venue demos.

### 9. Scope discipline & ponytail audit — PASS
- Pure standard library implementation (`os`, `logging`, `asyncio`, `time`). Zero new external dependencies added.
- Implementation directly addresses SIM-8 deliverables without speculative architecture or roadmap leakage.
- Mission checkboxes and `board/STATUS.md` log updated with precise test metrics.

---

## Summary Table

| Gate | Check | Verdict | Notes |
|---|---|---|---|
| 1 | File Ownership | **PASS** | `apps/api/**` only; no cross-track edits |
| 2 | Deliverable Completeness | **PASS** | 1500ms timeout, adapter flags, logging, /ready, railway.toml |
| 3 | Card Test Suite | **PASS** | 10/10 passed in 21.58s |
| 4 | Full Regression | **PASS** | 165/165 passed in 23.47s |
| 5 | Contract Consistency | **PASS** | 503 & 504 envelopes and skippedReason match circuit-simulation.md |
| 6 | Quantum Runtime Pack | **PASS** | Off-loop CPU bounds, 1500ms budget, non-finite guard verified |
| 7 | FastAPI Pack | **PASS** | HTTPException format, request_id tracing, structured logging |
| 8 | Fallback / Demo Safety | **PASS** | Offline-safe flags, graceful skip, single-worker deploy |
| 9 | Scope Discipline | **PASS** | No bloat, no extra deps, rung 1-2 ponytail compliance |

---

```
VERDICT: MERGE
✅ 10/10 card tests + 165/165 regression green; 1500ms timeout, adapter flags, structured logging, and railway.toml deploy config strictly adhere to contract and runtime law.
BAR: normal
```
