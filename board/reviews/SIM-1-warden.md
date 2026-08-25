# Warden Review — SIM-1 · Create the FastAPI service boundary

**Branch:** `feat/simulation-api/sim-1-create-the-fastapi-service-boundary`
**Reviewer:** Warden (fresh session) · **Date:** 2026-08-25T11:02 IST
**Author:** Uday Rohit · **Card load:** 1h / timebox 1h
**Bar applied:** standard (not endgame; presentation >=72h away)

---

## Checks

| # | Check | Result |
|---|---|---|
| 1 | Card match — all deliverables present | PASS |
| 2 | Contract fidelity — error shape exact | PASS |
| 3 | Proof — TEST command run independently, 7/7 green | PASS |
| 4 | Ponytail audit — no unrequested abstractions or premature deps | PASS |
| 5 | Demo-path safety — ops endpoints green, no console errors | PASS |
| 6 | File ownership — no cross-track edits | PASS |
| 7 | Hygiene — no secrets, no bare prints, no dead code | PASS |
| 8 | quantum-runtime rules — SDK imports correctly deferred | PASS |

---

## TEST result (Warden-executed)

```
uv run --project apps/api pytest apps/api/tests/unit/simulation/test_health.py -v
```

```
platform win32 -- Python 3.13.7, pytest-9.1.1
collected 7 items

test_health.py::test_health_returns_200                    PASSED [ 14%]
test_health.py::test_health_body                           PASSED [ 28%]
test_health.py::test_ready_returns_200                     PASSED [ 42%]
test_health.py::test_ready_reports_primary_adapter         PASSED [ 57%]
test_health.py::test_ready_reports_adapter_statuses        PASSED [ 71%]
test_health.py::test_error_response_includes_request_id    PASSED [ 85%]
test_health.py::test_x_request_id_header_on_response       PASSED [100%]

7 passed, 1 warning in 0.54s
```

One benign StarletteDeprecationWarning (starlette -> httpx2); unrelated to card correctness.

---

## Detail notes

- Contract error shape matches board/contracts/circuit-simulation.md field-for-field.
- Request-ID middleware: UUID generated per request, echoed on X-Request-ID response header.
- /ready exposes primaryAdapter: "QISKIT_AER", per-adapter status map, DEMO_LOCAL/DEMO_FALLBACK flags.
- Router placeholders /v1/circuits and /v1/simulation-runs registered but empty; no SIM-2+ code pre-loaded.
- Quantum SDKs (qiskit, qiskit-aer, pennylane) in [optional-dependencies.quantum] only — no premature import.
- uv.lock committed as required by quantum-runtime.md.
- Cross-track edits: board/STATUS.md (log append) and missions/uday-rohit-mission.md (checkbox) both permitted. .gitignore addition (*.egg-info/) is monorepo housekeeping.

---

## Verdict

VERDICT: MERGE
7/7 card tests green (Warden-run); contract error shape exact; request-ID middleware
end-to-end; adapter flags on /ready; no cross-track edits; no secrets; uv.lock committed;
router placeholders scoped correctly with no SIM-2+ code pre-loaded.

Do not merge the PR yourself. Hand off to Vinod (SHIP lead) to merge in DAG order.
Unblocked by this merge: SIM-2, SHIP-2.
