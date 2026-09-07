# Warden Review — SIM-6 · PennyLane Conformance and Circuit Evidence

**Branch:** `feat/simulation-api/sim-6-add-pennylane-conformance-and-circuit`
**Commit:** `a6f199f`
**Reviewed:** 2026-09-04T20:00:00+05:30
**Reviewer:** Warden (fresh Antigravity session — independent of implementation chat)

---

## Gate 1 — Card Match ✅

| Requirement | Delivered |
|---|---|
| `default.qubit` compilation of supported CircuitModel ops | ✅ `pennylane_adapter.py` — H/X/Y/Z/CNOT compiled, MEASURE excluded |
| Normalize basis order, epsilon 1e-6 comparison | ✅ `_pennylane_index_to_contract_label`, `_CONFORMANCE_EPSILON = 1e-6` |
| Explicit skip/unavailable reasons | ✅ `UNSUPPORTED_GATE_FOR_PENNYLANE`, `PENNYLANE_EXECUTION_ERROR`, `PENNYLANE_NOT_ENABLED` |
| Wire `simulation_service` with `runConformance` flag | ✅ Conditional block, deferred import, existing stub preserved |
| Scope — one card, nothing more | ✅ 5 files touched in this commit only |

## Gate 2 — Contract Fidelity ✅

Checked against `board/contracts/circuit-simulation.md` v1:

| Contract field | Implementation |
|---|---|
| `conformance.adapter = "PENNYLANE"` | ✅ hardcoded in both branches |
| `conformance.maxProbabilityDelta: float` | ✅ mapped from `max_probability_delta` |
| `conformance.epsilon: 1e-6` | ✅ `_CONFORMANCE_EPSILON = 1e-6` returned directly |
| `conformance.passed: bool` | ✅ correct |
| `conformance.skippedReason: null | string` | ✅ `None` when ran, string code when skipped |
| Primary response succeeds when PennyLane disabled + `skippedReason` disclosed | ✅ `PENNYLANE_NOT_ENABLED` path intact |
| Contract version bump | ✅ Not needed — `ConformanceResult` shape pre-existed in v1 |

No contract drift found.

## Gate 3 — Proof ✅

**Card TEST command (exact):**
```
uv run --project apps/api pytest apps/api/tests/unit/simulation/test_pennylane_conformance.py
```

**Warden-witnessed result (run independently):**
```
25 passed in 3.25s
```

**Full regression suite (witnessed):**
```
142 passed, 1 warning in 3.00s
```
Zero regressions. The 1 warning is a pre-existing `httpx`/`starlette` deprecation, not SIM-6 code.

## Gate 4 — Ponytail Audit ✅

| Check | Finding |
|---|---|
| Unrequested abstractions | None — `@dataclass PennyLaneConformanceResult` is the minimum typed return |
| New deps below rung 5 | PennyLane pre-declared; `pyproject.toml` not touched in this commit |
| Config for constants | None — `_CONFORMANCE_EPSILON` is a module constant, correct for this card |
| Scaffold "for later" | None — no TODO/FIXME/roadmap hints in new code |

## Gate 5 — Demo-Path Safety ✅

No HTTP endpoint shape changed. Existing 22 SIM-4 route tests all green, including
`test_post_conformance_skipped` (uses `runConformance=False` — unaffected).

Demo behavior: `runConformance=False` -> `PENNYLANE_NOT_ENABLED` stub; primary response
still `SUCCEEDED`. Second simulator demonstrated without being demo-critical.

## Gate 6 — Hygiene ✅

| Check | Finding |
|---|---|
| Secrets / `.env` | None |
| `print()` / debug on hot paths | None |
| Dead code / commented-out corpses | None |
| Caveman prose in committed files | None |
| Mock path | ✅ Inline fixtures only; `tests/fixtures/golden/` untouched (QA-1 mock path respected) |
| Cross-track edits | ✅ Only `board/STATUS.md` (append-only log) + `missions/uday-rohit-mission.md` (status checkbox) |
| Deferred PL import | ✅ Imported only after CircuitModel validation, per quantum-runtime.md |
| NaN/Infinity rejection | ✅ `math.isfinite` guard + `ValueError` on probability sum drift |

---

```
VERDICT: MERGE
✅ 25/25 card tests green (witnessed live), 142/142 regression tests green,
   contract shape exact, no cross-track edits, deferred PL import correct,
   demo path safe with PENNYLANE_NOT_ENABLED stub, asymmetric endianness
   guard passes.
BAR: normal — all six gates pass without concession.
```

> Do not self-merge. Vinod / Patch handles merge train in DAG order (SIM-7 depends on this).
