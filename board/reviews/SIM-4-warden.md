# Warden Review — SIM-4 — Expose and persist Simulation Runs

**Branch:** `feat/simulation-api/sim-4-expose-and-persist-simulation-runs`
**Reviewer:** Warden (fresh session) · **Date:** 2026-08-25T21:07 IST
**Author:** Uday Rohit · **Card load:** 3h / timebox 3h
**Bar applied:** standard (P0 skeleton completion card — unblocks UX-4, SIM-5, SIM-6, AI-4, QA-3)

---

## Checks

| # | Check | Result | Details |
|---|---|---|---|
| 1 | File ownership & boundary | PASS | Only touched `apps/api/app/` simulation routes/models/services/repo, simulation tests, mission, STATUS. Zero cross-track leaks. |
| 2 | Deliverable completeness | PASS | POST /v1/simulation-runs (201), GET /v1/simulation-runs/{id} (200), threadpool executor, 60s request idempotency, in-memory repository (DATA-1 mock path), contract errors. |
| 3 | Contract fidelity | PASS | Request, response envelopes, error structures, types match `board/contracts/circuit-simulation.md` v1 exactly. |
| 4 | Proof / Test execution | PASS | 23/23 tests green on `test_simulation_routes.py` (70/70 across full simulation suite). |
| 5 | Ponytail audit | PASS | In-memory dict repo with TTL eviction; clean async threadpool offloading via `run_in_executor`; no heavy unneeded dependencies. |
| 6 | Quantum-runtime rules | PASS | CPU-bound SDK executed in threadpool executor outside async event loop; timeout budget handled; state trace preserved; PennyLane conformance skipped reason explicit. |
| 7 | Demo-path & fallback | PASS | Fully self-contained in-memory fallback without requiring cloud AI, Atlas, or venue internet. |
| 8 | Hygiene | PASS | No secrets, no `.env` checked in, no console logs on hot paths, no dead code, no caveman leaks in committed files. |

---

## TEST result (Warden-executed)

```
uv run --project apps/api pytest apps/api/tests/unit/simulation/test_simulation_routes.py -v
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.7, pytest-9.1.1, pluggy-1.6.0 -- apps/api/.venv/Scripts/python.exe
rootdir: apps/api
configfile: pyproject.toml
plugins: anyio-4.14.2, asyncio-1.4.0
collected 23 items

apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_returns_201 PASSED [  4%]
apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_simulationRun_wrapper PASSED [  8%]
apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_run_id PASSED [ 13%]
apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_circuit_model_id PASSED [ 17%]
apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_duration_ms PASSED [ 21%]
apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_learner_and_module PASSED [ 26%]
apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_adapter PASSED [ 30%]
apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_status_succeeded PASSED [ 34%]
apps/api/tests/unit/simulation/test_simulation_routes.py::test_post_request_id_header PASSED [ 39%]
apps/api/tests/unit/simulation/test_get_returns_200 PASSED [ 43%]
apps/api/tests/unit/simulation/test_get_same_run_id PASSED [ 47%]
apps/api/tests/unit/simulation/test_get_same_circuit_model_id PASSED [ 52%]
apps/api/tests/unit/simulation/test_get_same_duration PASSED [ 56%]
apps/api/tests/unit/simulation/test_get_request_id_header PASSED [ 60%]
apps/api/tests/unit/simulation/test_get_unknown_run_404 PASSED [ 65%]
apps/api/tests/unit/simulation/test_get_unknown_run_error_envelope PASSED [ 69%]
apps/api/tests/unit/simulation/test_post_state_trace_has_steps PASSED [ 73%]
apps/api/tests/unit/simulation/test_post_state_trace_step_fields PASSED [ 78%]
apps/api/tests/unit/simulation/test_post_bell_probabilities PASSED [ 82%]
apps/api/tests/unit/simulation/test_post_bell_probabilities_values PASSED [ 86%]
apps/api/tests/unit/simulation/test_post_conformance_skipped PASSED [ 91%]
apps/api/tests/unit/simulation/test_post_invalid_circuit_422 PASSED [ 95%]
apps/api/tests/unit/simulation/test_post_idempotency_with_same_request_id PASSED [100%]

======================== 23 passed, 1 warning in 1.59s ========================
```

Full cumulative suite: 70/70 passed across `test_health.py`, `test_circuit_model.py`, `test_qiskit_bell_trace.py`, and `test_simulation_routes.py`.

---

## Verdict

VERDICT: MERGE
23/23 card tests green (70/70 full simulation suite); POST/GET /v1/simulation-runs contract shapes verified; threadpool offloading and timeout handling compliant with quantum-runtime rules; 60s request idempotency caching verified; clean in-memory repository mock path for DATA-1; zero cross-track edits.

BAR: normal
Do not merge the PR yourself. Hand off to Vinod (SHIP lead) to merge in DAG order.
Unblocked by this merge: UX-4, SIM-5, SIM-6, AI-4, QA-3.
