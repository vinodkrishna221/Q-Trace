# Warden Review — UX-4 · Swap the Bell journey to live contracts

**Branch:** `feat/learning-ux/ux-4-swap-the-bell-journey-to`  
**Reviewer:** Warden (fresh session) · **Date:** 2026-08-27T12:25 IST  
**Author:** Venu Gopal · **Card load:** 2h / timebox 2h  
**Bar applied:** standard (Phase 0 Skeleton, live contract swapping & fallback resilience)

---

## Checks

| # | Check | Result |
|---|---|---|
| 1 | Card match — all deliverables present (live TanStack queries/mutations, request ID exposure, disclosed fallbacks) | PASS |
| 2 | Contract fidelity — shapes match circuit-simulation, flight-recorder-tutor, progress-analytics, learning-content 1:1 | PASS |
| 3 | Proof — TEST command run independently in fresh session; 4/4 acceptance passed, 18/18 web suite passed, Next.js build passed (9/9 routes) | PASS |
| 4 | Ponytail audit — zero unnecessary abstractions, clean fetch wrapper + standard TanStack Query hooks | PASS |
| 5 | Demo-path safety — fully resilient offline fallback (`DEMO_LOCAL`), no blank canvases or unhandled network errors | PASS |
| 6 | File ownership — strictly within `apps/web/**` and tracking doc updates; zero cross-track edits | PASS |
| 7 | Hygiene — no secrets, no debug prints on hot paths, clean TypeScript types, strict lint/typecheck passes | PASS |
| 8 | quantum-ui / quantum-runtime rules — State Trace indexes preserved, basis keys ('00'/'11') unreversed, MIXED_SUBSYSTEM labels intact | PASS |

---

## TEST result (Warden-executed)

### Acceptance & Unit Test Suite
```bash
npm --prefix apps/web test
```

```
 RUN  v2.1.9 C:/Users/12ven/Downloads/q-trace/apps/web

 ✓ tests/unit/role-switch.test.tsx (3 tests) 242ms
 ✓ tests/unit/mocked-bell-loop.test.tsx (5 tests) 524ms
 ✓ tests/acceptance/bell-live.test.tsx (4 tests) 564ms
   ✓ Live Bell Journey & Contract Swapping (UX-4) > completes live journey: prediction -> simulation run -> diagnosis -> tutor -> repair -> progress and exposes the request ID 354ms
 ✓ tests/unit/bell-prediction.test.tsx (6 tests) 790ms

 Test Files  4 passed (4)
      Tests  18 passed (18)
   Start at  12:24:09
   Duration  3.28s
```

### Next.js Production Build
```bash
npm --prefix apps/web run build
```

```
   ▲ Next.js 15.5.23
   Creating an optimized production build ...
 ✓ Compiled successfully in 1636ms
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (9/9)
   Finalizing page optimization ...

Route (app)                                 Size  First Load JS
┌ ○ /                                      176 B         112 kB
├ ○ /_not-found                            993 B         103 kB
├ ○ /instructor                          3.73 kB         127 kB
├ ○ /lab                                 2.81 kB         116 kB
├ ○ /learn                               1.82 kB         119 kB
├ ○ /learn/bell-state                    94.4 kB         218 kB
└ ○ /progress                            4.19 kB         127 kB
+ First Load JS shared by all             102 kB

○  (Static)  prerendered as static content
```

---

## Detail notes

- `apps/web/lib/api-client.ts` implements contract-accurate HTTP calls for:
  - `POST /v1/simulation-runs`
  - `POST /v1/flight-recorder/diagnose`
  - `POST /v1/tutor/explain`
  - `GET /v1/challenges/:challengeId`
  - `POST /v1/challenge-attempts`
  - `GET /v1/progress-records/:learnerProfileId`
  - `GET /v1/instructor-insights/:cohortId`
  - `GET /v1/modules/:slug`
  - `GET /v1/learning-paths/:learnerProfileId`
  - `GET /v1/demo-profiles`
- `apps/web/lib/hooks/use-quantum-api.ts` provides clean, reactive TanStack Query hooks (`useSimulationRunMutation`, `useDiagnoseMutation`, `useTutorExplainMutation`, `useChallengeAttemptMutation`, `useProgressRecordQuery`, `useInstructorInsightQuery`, etc.) with query cache invalidation on challenge completion.
- `apps/web/app/(app)/learn/bell-state/page.tsx` integrates the live pipeline, exposing the `X-Request-Id` and `LIVE API` / `DEMO_LOCAL` disclosure badge in the UI.
- All network failures gracefully degrade to typed fallback fixtures without throwing unhandled exceptions, satisfying 100% offline venue demo resilience.
- File ownership respected: no edits outside `apps/web/**`, `board/STATUS.md`, `missions/venu-gopal-mission.md`, and `plans/learning-ux-phase-plan.md`.

---

## Verdict

VERDICT: MERGE
✅ 18/18 web tests green (including 4/4 live contract acceptance tests); Next.js build passes cleanly across all 9 static routes; live TanStack Query mutations/queries match contract schemas 1:1 with fully disclosed DEMO_LOCAL fallback resilience and zero cross-track edits.

BAR: normal

Do not merge the PR yourself. Hand off to Vinod (SHIP lead) to merge in DAG order.
Unblocks: UX-5, UX-6, QA-3, SHIP-5.
