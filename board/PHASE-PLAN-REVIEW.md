# Warden Review — Q-Trace Phase Plans

> Review date: 23 Aug 2026 · plan verdict: **MERGE — human approved and frozen** · `/missions` verdict: **PASS — roster, 70% load and pitch roles resolved**

## Plan summary

| Track | Cards | Card hours | Ceiling | Owner |
|---|---:|---:|---:|---|
| learning-ux | 9 | 20h | 20h | Venu Gopal |
| simulation-api | 9 | 20h | 20h | Uday Rohit |
| ai-pedagogy | 8 | 18h | 18h | Rajeswari |
| data-analytics | 8 | 18h | 18h | Rani |
| fixtures-qa | 8 | 16h | 16h | Akshaya; P0 split fallback retained until numeric hours are known |
| story-ship | 8 | 16h | 16h | Vinod Krishna |

**Total:** 50 cold-startable cards · 108 card-hours · every card ≤4h.

## Gates

| Gate | Verdict | Evidence |
|---|---|---|
| Four-phase spine | PASS | Every track has P0 Skeleton, P1 Core, P2 Integration and pre-cut-listed P3 Polish. |
| Global dependency graph | PASS | All 50 dependency references resolve and the graph is acyclic. |
| P0 walking skeleton | PASS | SHIP scaffold/local mode, UX prediction/mock/live swap, real Qiskit trace, deterministic diagnosis/Tutor, seeded attempt/progress and HTTP smoke runner form one thread. |
| Mock paths | PASS | Each plan names a contract/fixture/in-memory path; no P0/P1 card must wait silently for another track. |
| Contract law | PASS | Cards point to the four versioned contract files; integration swaps are explicit cards. |
| File ownership | PASS | Implementation unit tests stay with their track; QA owns golden/contract/acceptance/security/e2e and release scripts; no implementation surface is intentionally shared. |
| Cold-start cards | PASS | Automated structure check covers all cards; six-card manual sample across all tracks carries repo state, rules/contracts, deliverable, one command, dependencies, demo and persona. |
| Timeboxes | PASS | Maximum 4h. Track totals equal but never exceed blueprint ceilings. |
| Wow machinery | PASS | SIM-3 State Trace, AI-1 deterministic misconception rules and QA-3 real HTTP smoke are marked never-cut. |
| Five-member survival | PASS | Akshaya owns fixtures-qa with 48h declared; QA P0 still has a Vinod/Uday/Rani contingency. |
| Full 70% load proof | PASS | Every member declared 48h, so the per-member card cap is 33.6h; approved missions range from 16–20h. |
| Roster completion | PASS | All tracks are mapped; Venu operates the demo; the team shares domain pitch beats; Discord is canonical and WhatsApp urgent-only. |

## Automated checks

- Six plan files plus global index generated.
- 50 unique contiguous card IDs.
- 108 total card-hours; per-track totals: 20/20/18/18/16/16.
- Every declared dependency exists; DAG cycle check passes.
- Every card has CONTEXT, DELIVERABLE, TEST, DEPENDS/UNBLOCKS, DEMO, PERSONA and STATUS.
- Every test contains a concrete command.
- All contexts are ≥100 characters and point to repo rules, contracts or frozen documents.
- Cold-start sample UX-5, SIM-3, AI-5, DATA-6, QA-3 and SHIP-4 passes.

## Mission inputs resolved

1. Each member declared 48 usable hours through 28 Aug 18:00 IST.
2. Venu operates the demo and narrates learner-flow beats; all six share short domain pitch beats; Vinod leads opening, architecture and technical Q&A.
3. Discord is the canonical mission/standup/blocker record; WhatsApp is urgent-only.
4. The exact 29 Aug presentation time remains a scheduling note, not a mission blocker; conservative gates stay active.

## Verdict

**MERGE.** The human approved and froze the phase plans. All `/missions` prerequisites now pass; mission briefs may be generated without inventing capacity or stage ownership.
