# Warden Review — AI-2 · Expose Flight Recorder diagnosis and replay

**Branch:** `feat/ai-pedagogy/ai-2-expose-flight-recorder-diagnosis-and`  
**Reviewer:** Warden (fresh session) · **Date:** 2026-09-07T17:05 IST  
**Author:** Rajeswari · **Card load:** 2h / timebox 2h  
**Bar applied:** standard (deterministic P0 engine, offline fallback, contract fidelity)  

---

## Checks

| # | Check | Result | Detail |
|---|---|---|---|
| 1 | Card match — all deliverables present | PASS | Diagnosis service, persisted `MisconceptionSignal`, two-step replay headlines, contract error handling |
| 2 | Contract fidelity — schema & errors exact | PASS | Strict adherence to `board/contracts/flight-recorder-tutor.md v1`: `404 LEARNER_NOT_FOUND`, `404 SIMULATION_RUN_NOT_FOUND`, `409 RUN_NOT_SUCCEEDED`, `422 PREDICTION_MISSING`, `422 TRACE_INSUFFICIENT` |
| 3 | Proof — TEST command run independently, 18/18 green | PASS | `uv run --project apps/api pytest apps/api/tests/unit/ai/test_flight_recorder_route.py` passes completely |
| 4 | Ponytail audit — no unrequested abstractions or premature deps | PASS | Pure Python dataclasses, static replay lookup, zero LLM calls, standard `DataRepositoryProtocol` |
| 5 | Demo-path safety & fallback | PASS | Fully deterministic diagnosis from state trace; works offline with no provider credentials |
| 6 | File ownership — no cross-track edits | PASS | Owns `apps/api/app/routers/flight_recorder.py`, `services/diagnosis/**`, `tests/unit/ai/**`; main router mount and status tracking permitted |
| 7 | Hygiene — no secrets, no bare prints, no dead code | PASS | Clean type-annotated code, structured HTTPException details, zero leaked tokens |
| 8 | Scope discipline & no hidden roadmap claims | PASS | No v2 concepts or premature cloud adapters introduced; strictly implements P0 flight recorder diagnosis |

---

## TEST result (Warden-executed)

```
uv run --project apps/api pytest apps/api/tests/unit/ai/test_flight_recorder_route.py -v
```

```
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\ranig\OneDrive\Desktop\QUANTUM_PRO\Q-Trace\apps\api
configfile: pyproject.toml
plugins: anyio-4.15.0, asyncio-1.4.0
asyncio: mode=Mode.AUTO, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
collected 18 items

apps\api\tests\unit\ai\test_flight_recorder_route.py::test_bell_fixture_returns_201_with_expected_fields PASSED [  5%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_correct_prediction_returns_no_signal_code PASSED    [ 11%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_unknown_learner_returns_404 PASSED                 [ 16%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_unknown_simulation_run_returns_404 PASSED          [ 22%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_failed_run_returns_409 PASSED                      [ 27%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_run_without_prediction_returns_422 PASSED          [ 33%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_run_with_empty_trace_returns_422 PASSED            [ 38%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_response_shape_matches_contract PASSED             [ 44%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_misconception_signal_is_persisted PASSED           [ 50%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_replay_evidence_keys_are_all_registered PASSED     [ 55%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_all_prediction_variants_return_correct_code[INDEPENDENT_RANDOM-SUPERPOSITION_VS_ENTANGLEMENT-1] PASSED [ 61%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_all_prediction_variants_return_correct_code[ALWAYS_00-MEASUREMENT_DETERMINISM-1] PASSED [ 66%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_all_prediction_variants_return_correct_code[ALWAYS_11-MEASUREMENT_DETERMINISM-1] PASSED [ 72%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_all_prediction_variants_return_correct_code[ALWAYS_01-GATE_ORDER-0] PASSED [ 77%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_all_prediction_variants_return_correct_code[ALWAYS_10-GATE_ORDER-0] PASSED [ 83%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_all_prediction_variants_return_correct_code[CORRELATED_00_11-NO_SIGNAL-0] PASSED [ 88%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_confidence_is_always_one PASSED                   [ 94%]
apps\api\tests\unit\ai\test_flight_recorder_route.py::test_meera_learner_also_diagnoses PASSED                [100%]

======================= 18 passed, 8 warnings in 0.62s =======================
```

Full AI suite: 45 passed (27 AI-1 + 18 AI-2) with zero regressions.

---

## Detail notes

- `apps/api/app/services/diagnosis/service.py`:
  - Pure async service `run_diagnosis()`.
  - Verifies existence of learner profile and simulation run.
  - Enforces `run.status == "SUCCEEDED"`, valid `predictionResponse.answer`, and non-empty `stateTrace`.
  - Pure call to `apply_rules()` (AI-1); zero LLM calls.
  - Persists `MisconceptionSignal` via `repo.create_misconception_signal()`.
  - Builds two-step replay headlines bound to registered evidence keys.
- `apps/api/app/routers/flight_recorder.py`:
  - Implements `POST /v1/flight-recorder/diagnose` matching contract schema (`misconceptionSignal` + `replay`).
  - Strict contract error responses: `404 LEARNER_NOT_FOUND`, `404 SIMULATION_RUN_NOT_FOUND`, `409 RUN_NOT_SUCCEEDED`, `422 PREDICTION_MISSING`, `422 TRACE_INSUFFICIENT`.
- Router mounted in `apps/api/app/main.py`.
- No cross-track files modified beyond router mount and project coordination files (`board/STATUS.md`, `missions/rajeswari-mission.md`, `plans/ai-pedagogy-phase-plan.md`).

---

## Verdict

**VERDICT: MERGE**

18/18 card tests green (Warden-run); full contract compliance with `flight-recorder-tutor.md v1`; deterministic diagnosis and persistence verified; no cross-track violations; cleanly rebased on `origin/main`.

Do not merge the PR yourself. Hand off to Vinod / Patch to merge in DAG order.  
**Unblocked by this merge:** AI-3 (Ship the evidence-bound Tutor fallback).
