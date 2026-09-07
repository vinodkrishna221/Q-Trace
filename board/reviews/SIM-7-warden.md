# Warden Review — SIM-7 · Swap routes to the production repository

**Reviewer:** Warden (fresh session)
**Card:** SIM-7
**Branch:** feat/simulation-api/sim-7-swap-routes-to-the-production
**Base:** main
**Date:** 2026-09-06
**Member:** Uday Rohit

## Verdict: MERGE

All 9 gates green. One advisory note for SIM-8.

---

## Check-by-check

### 1. File ownership — PASS
Files touched: only apps/api/**, board/STATUS.md, board/reviews/SIM-*.md, missions/uday-rohit-mission.md, .gitignore (+*.egg-info/).
Zero edits to another track's implementation surface.

### 2. Deliverable completeness — PASS
- SimulationRunRepositoryProtocol defined (sim_run_repository.py L51-72)
- InMemorySimRunRepo encapsulated as class (L80-115)
- MongoSimRunRepo wraps DATA-6 DataRepositoryProtocol (L124-246)
- Graceful fallback when DATA-6 unavailable (_build_mongo_repo L296-314)
- Router uses FastAPI Depends(get_sim_run_repo)
- DEMO_LOCAL=1 → InMemorySimRunRepo; DEMO_LOCAL=0 → Mongo or fallback
- Backwards-compat shim for SIM-4 tests (simulation_run_repo.py)
All items delivered.

### 3. TEST command and result — PASS
Command: uv run --project apps/api pytest apps/api/tests/unit/simulation/test_repository_swap.py
Result (Warden-run): 13 passed, 1 warning in 1.14s

### 4. Regression — PASS
Full suite tests/unit/simulation/: 155 passed, 1 warning in 3.06s
No prior card regressions.

### 5. Contract / schema consistency — PASS
- SimulationRun response shape matches circuit-simulation.md v1 exactly
- conformance field always present in both branches of build_simulation_run
- skippedReason = PENNYLANE_NOT_ENABLED when runConformance=False
- 404 SIMULATION_RUN_NOT_FOUND uses correct contract envelope
- Idempotency TTL=60s matches contract NOTES
- Contract version unchanged, no bump required.

### 6. quantum-runtime rules — PASS
- CPU-bound Qiskit call outside event loop (run_in_executor path)
- SIMULATION_TIMEOUT returned on asyncio.TimeoutError (504)
- DEMO_LOCAL=1 venue-safe path verified by TestGetSimRunRepo tests
- No NaN/Infinity introduced (enforced upstream, not touched here)
- Immutable snapshot persistence (write-once, no mutation path)

### 7. FastAPI rules — PASS
- Domain router registered in main.py L116
- Async route + sync SDK via threadpool
- HTTPException with contract-shaped dict {code, message, requestId, details}
- Dependency injection via Depends; tests use dependency_overrides

### 8. Fallback / demo behavior — PASS
- DEMO_LOCAL=1 (default) → InMemorySimRunRepo, no external dep, venue-safe
- DEMO_LOCAL=0 + DATA-6 absent → warning log + memory fallback; demo never breaks
- DEMO_LOCAL=0 + DATA-6 present → MongoSimRunRepo with graceful entity conversion
- Shim file keeps SIM-4 tests green with zero changes

### 9. Scope discipline — PASS
Exactly scoped to: protocol + two implementations + factory + router DI + card tests.
QTRACE_SIM_TIMEOUT_S defaulted 30s with explicit comment deferring to SIM-8. No cross-card claims.

---

## Advisory for SIM-8 (not a blocker)

MongoSimRunRepo._run_async() spawns asyncio.new_event_loop() per call. Correct for
executor context but will raise RuntimeError if called from within a running loop.
SIM-8 should guard this or migrate Mongo I/O to motor/asyncio.to_thread before
the service runs multi-worker.

---

## Summary table

| Check | Result |
|---|---|
| File ownership | PASS |
| Deliverable completeness | PASS |
| Card TEST 13/13 | PASS |
| Regression 155/155 | PASS |
| Contract consistency | PASS |
| quantum-runtime rules | PASS |
| FastAPI rules | PASS |
| Fallback / demo safety | PASS |
| Scope discipline | PASS |

MERGE — do not merge the PR yourself; this is a review record only.
