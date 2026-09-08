# Warden Review — SHIP-2 · Create the one-laptop demo launcher

**Branch:** `feat/story-ship/ship-2-create-the-one-laptop-demo`  
**Reviewer:** Warden (fresh session) · **Date:** 2026-08-26T12:32 IST  
**Author:** Vinod Krishna · **Card load:** 2h / timebox 2h  
**Bar applied:** standard (Phase 0 Skeleton, local launcher & offline resilience)

---

## Checks

| # | Check | Result |
|---|---|---|
| 1 | Card match — all deliverables present (launcher script, reset, readiness polling, cleanup, disclosure) | PASS |
| 2 | Contract fidelity — env variables, fallback flags & `/ready` response match specification exact | PASS |
| 3 | Proof — TEST command run independently in fresh session, all checks green, clean exit | PASS |
| 4 | Ponytail audit — zero unnecessary dependencies, lightweight bash with cross-platform PID/port cleanup | PASS |
| 5 | Demo-path safety — proves 100% venue offline execution without cloud AI or Atlas keys | PASS |
| 6 | File ownership — no cross-track edits (only `scripts/`, `package.json`, and tracking docs) | PASS |
| 7 | Hygiene — no secrets, no leaked keys, strict error trapping, clean process cleanup on exit | PASS |
| 8 | quantum-runtime / quantum-ui rules — local execution defaults, zero cloud dependencies | PASS |

---

## TEST result (Warden-executed)

```bash
bash scripts/demo-local.sh --check
```

```
================================================================================
🚀 Q-TRACE · ONE-LAPTOP VENUE DEMO LAUNCHER
================================================================================
[LOCAL DEMO CONTRACT & DISCLOSURE]
  • Runtime Mode:          LOCAL OFFLINE (DEMO_LOCAL=1)
  • AI Pedagogy Strategy:  TRACE-AWARE DETERMINISTIC FALLBACK (DEMO_FALLBACK=1)
  • Cloud AI Credentials:  DISCLOSED ABSENT (TUTOR_API_KEY is empty / mock active)
  • Database Backend:      IN-MEMORY REPOSITORY (MongoDB Atlas not required)
  • Quantum Engine:        Qiskit Aer local simulation
  • Web Interface:         http://localhost:3000
  • Backend API:           http://localhost:8000
  • Ops Endpoints:         http://localhost:8000/health | http://localhost:8000/ready
--------------------------------------------------------------------------------
💡 Venue resilience: Works 100% offline from this laptop during judge evaluations.
================================================================================

🔬 EXECUTING CARD SHIP-2 TEST PROTOCOL (--check mode)...
--------------------------------------------------------
  ✅ Python runner found: py -3.14 -m uvicorn
  ✅ Web runner found: pnpm
⚡ Starting API service on port 8000 (DEMO_LOCAL=1, TUTOR_PROVIDER=mock)...
🌐 Starting Web service on port 3000...
⏳ Waiting for API service readiness at http://127.0.0.1:8000/ready...
  ✅ API is READY (attempt 1/30)
⏳ Waiting for Web service readiness at http://127.0.0.1:3000...
  ✅ Web service is READY (HTTP 200 on attempt 2/35)
🔍 Verifying offline contract & key absence...
  ✅ TUTOR_API_KEY is confirmed ABSENT (value is empty string)
  ✅ TUTOR_PROVIDER is set to 'mock' (trace-aware fallback enabled)
  ✅ ENABLE_TUTOR_CLOUD is '0' (cloud calls disabled)
  ✅ Atlas connection is confirmed ABSENT (local in-memory repository active)
  ✅ API /ready contract confirmed: demoLocal=true, demoFallback=true

--------------------------------------------------------
🎉 SHIP-2 CHECK PASSED: Both services started, reached health/readiness, and proved offline key absence.
--------------------------------------------------------
🧹 Shutting down local demo processes...
✅ All local services stopped cleanly.
```

---

## Detail notes

- `scripts/demo-local.sh` handles startup, readiness health polling, interactive execution, `--check` verification mode, and `--reset` clean state restoration.
- Offline environment contract enforces `DEMO_LOCAL=1`, `DEMO_FALLBACK=1`, `ENABLE_TUTOR_CLOUD=0`, `TUTOR_PROVIDER=mock`, `TUTOR_API_KEY=""`, `MONGODB_URI=""`.
- Process management includes cleanup traps on `EXIT`, `INT`, `TERM`, port listener killing for ports 8000/3000 on Windows/Unix, and PID file cleanup.
- Root `package.json` updated with `demo:local` and `demo:check` scripts.
- No cross-track file edits: only story-ship owned files modified (`scripts/demo-local.sh`, `package.json`, `board/STATUS.md`, `missions/vinod-krishna-mission.md`, `plans/story-ship-phase-plan.md`).

---

## Verdict

VERDICT: MERGE
Card test passed independently; one-laptop demo launcher starts and verifies both services, enforces offline fallback and absent external keys, cleans up processes on exit, and respects file boundaries.

Do not merge the PR yourself. Hand off to Vinod (SHIP lead) to merge in DAG order.
Unblocked by this merge: QA-3 (once UX-4, SIM-4, DATA-3, AI-3 complete).
