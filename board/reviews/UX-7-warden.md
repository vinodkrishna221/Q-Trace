# Warden Review — UX-7 · Integrate progress, instructor proof and failure states

**Branch:** \eat/learning-ux/ux-7-integrate-progress-instructor-proof-and\  
**Reviewer:** Warden (fresh session) · **Date:** 2026-08-27T16:05 IST  
**Author:** Venu Gopal · **Card load:** 2h / timebox 2h  
**Bar applied:** standard (Phase 2 Integration, resilience & instructor proof)

---

## Checks

| # | Check | Result |
|---|---|---|
| 1 | **Card match** — all deliverables present (live Progress Record, three-card/one-chart Instructor Insight, provider/fallback badges, empty/loading/timeout states, retry actions, zero new product surfaces) | PASS |
| 2 | **Contract fidelity** — shapes match \progress-analytics.md\ (\ProgressRecord\, \InstructorInsight\, \ChallengeAttempt\), \light-recorder-tutor.md\, \circuit-simulation.md\ 1:1 | PASS |
| 3 | **Proof** — TEST command independently executed; 4/4 resilient journey tests passed, 40/40 web suite passed, Next.js build passed (11/11 static routes) | PASS |
| 4 | **Ponytail audit** — clean standard SVG + table fallback; no heavy external charting bloat; idiomatic TanStack Query integration | PASS |
| 5 | **Demo-path safety** — offline/cloud-off fallback (\DEMO_LOCAL\) and simulation timeout (1500ms) recovery banner tested with zero blank UI | PASS |
| 6 | **File ownership** — strictly within \pps/web/**\ and tracking doc status lines; zero cross-track edits | PASS |
| 7 | **Hygiene** — no secrets, no console noise on hot paths, clean TypeScript types, strict lint/typecheck passes | PASS |
| 8 | **quantum-ui / runtime rules** — static SVG/table fallback for cohort chart, non-blank error/loading skeletons, separate metric cards | PASS |

---

## TEST result (Warden-executed)

### Resilient Journey Acceptance Tests
\\\ash
npm --prefix apps/web test -- resilient-journey
\\\

\\\
 RUN  v2.1.9 C:/Users/12ven/Downloads/q-trace/apps/web

 ✓ tests/acceptance/resilient-journey.test.tsx (4 tests) 543ms
   ✓ Resilient Journey, Failure Recovery & Instructor Proof (UX-7) > completes the learner journey with cloud Tutor off (curated fallback active) and updates progress 310ms
   ✓ Resilient Journey, Failure Recovery & Instructor Proof (UX-7) > renders a simulation-timeout recovery banner and recovers cleanly without blank UI
   ✓ Resilient Journey, Failure Recovery & Instructor Proof (UX-7) > renders Instructor Insight 3-card and 1-chart structure with live demo learner connection
   ✓ Resilient Journey, Failure Recovery & Instructor Proof (UX-7) > renders Progress Record with live points, skill competencies, and misconception history

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Duration  2.77s
\\\

### Full Web Test Suite
\\\ash
npm --prefix apps/web test
\\\

\\\
 RUN  v2.1.9 C:/Users/12ven/Downloads/q-trace/apps/web

 ✓ tests/unit/circuit-workspace.test.tsx (12 tests) 257ms
 ✓ tests/acceptance/learning-visuals.test.tsx (6 tests) 299ms
 ✓ tests/unit/role-switch.test.tsx (3 tests) 420ms
 ✓ tests/unit/mocked-bell-loop.test.tsx (5 tests) 870ms
 ✓ tests/acceptance/bell-live.test.tsx (4 tests) 853ms
 ✓ tests/acceptance/resilient-journey.test.tsx (4 tests) 919ms
 ✓ tests/unit/bell-prediction.test.tsx (6 tests) 1369ms

 Test Files  7 passed (7)
      Tests  40 passed (40)
   Duration  4.39s
\\\

### Next.js Production Build
\\\ash
npm --prefix apps/web run build
\\\

\\\
   ▲ Next.js 15.5.23
   Creating an optimized production build ...
 ✓ Compiled successfully in 1774ms
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (11/11)
   Finalizing page optimization ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    2.79 kB         112 kB
├ ○ /_not-found                            993 B         103 kB
├ ○ /instructor                          8.06 kB         130 kB
├ ○ /lab                                 2.44 kB         137 kB
├ ○ /learn                               4.23 kB         121 kB
├ ○ /learn/bell-state                    17.7 kB         229 kB
├ ○ /learn/measurement                   1.67 kB         198 kB
├ ○ /learn/superposition                 1.74 kB         198 kB
└ ○ /progress                            3.86 kB         130 kB
+ First Load JS shared by all             102 kB

○  (Static)  prerendered as static content
\\\

---

## Detail notes

- **Live Progress Record (\pps/web/app/(app)/progress/page.tsx\):**
  - Fully wired to \useProgressRecordQuery(profileId)\ consuming \GET /v1/progress-records/:learnerProfileId\.
  - Displays total points, modules completed, skill mastery progress bars, misconception summary history, request ID, and \DEMO_LOCAL\ / \LIVE API\ badges.
  - Implements loading skeletons, zero-state onboarding prompt, and error/timeout banner with retry button.

- **Instructor Insight (\pps/web/app/(app)/instructor/page.tsx\ & \pps/web/features/instructor/cohort-analytics-chart.tsx\):**
  - Strictly adheres to Cut List item 5: exactly three cards (Module Completion, Challenge Pass Rate, Top Misconceptions) and one dedicated chart (\CohortAnalyticsChart\).
  - \CohortAnalyticsChart\ renders responsive SVG visual comparisons with an accessible table fallback toggle.
  - Features live demo learner callout connecting Dr. Rao's view to Aarav's latest repair attempt (\lp_aarav\), plus transparent dataset disclosure.
  - Implements loading skeleton, empty state, and query error banner with retry button.

- **Failure Resilience & Timeout Handling (\pps/web/lib/api-client.ts\ & \pps/web/app/(app)/learn/bell-state/page.tsx\):**
  - \pi-client.ts\ distinguishes simulation timeout (504 / \SIMULATION_TIMEOUT\) so it throws to the UI rather than masking failure, allowing the UI to present a clear recovery banner.
  - \ell-state/page.tsx\ renders a non-destructive timeout banner with a "Retry Simulation" action that preserves the learner's circuit workspace without blanking the screen.
  - Cloud AI provider outages (\503 TUTOR_UNAVAILABLE\) gracefully activate curated trace-aware Tutor fallbacks (\DEMO_FALLBACK\) with explicit badge disclosure.

- **Scope & Boundaries:**
  - Zero cross-track edits: no changes to \pps/api/**\ or shared contracts in \oard/contracts/\.
  - Zero roadmap creep or fake multiplayer/cloud claims.

---

## Verdict

VERDICT: MERGE
✅ All 4 resilient journey tests pass (40/40 full web test suite green); Next.js production build passes cleanly across all 11 static routes; Progress Record and 3-card/1-chart Instructor Insight conform 1:1 to contracts; timeout recovery banner and cloud-off fallback guarantee venue demo resilience without cross-track edits.

BAR: standard

Do not merge the PR yourself. Hand off to Vinod (SHIP lead) to merge in DAG order.
Unblocks: UX-9, QA-6.
