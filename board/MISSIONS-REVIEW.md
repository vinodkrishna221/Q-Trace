# Warden Review — Q-Trace Missions

> Review date: 23 Aug 2026 · verdict: **MERGE — briefs ready for six-member acceptance**

## Mission map

| Member | Track | Cards | Card hours | Declared hours | Load | First card |
|---|---|---:|---:|---:|---:|---|
| Vinod Krishna | story-ship | 8 | 16h | 48h | 33.3% | SHIP-1 |
| Venu Gopal | learning-ux | 9 | 20h | 48h | 41.7% | UX-1 |
| Uday Rohit | simulation-api | 9 | 20h | 48h | 41.7% | SIM-1 |
| Rani | data-analytics | 8 | 18h | 48h | 37.5% | DATA-1 |
| Rajeswari | ai-pedagogy | 8 | 18h | 48h | 37.5% | AI-1 |
| Akshaya | fixtures-qa | 8 | 16h | 48h | 33.3% | QA-1 |

All loads are below the 33.6h / 70% cap. Remaining capacity is integration, review, rehearsal, sleep and contingency—not spare feature scope.

## Gates

| Gate | Verdict | Evidence |
|---|---|---|
| One brief per member | PASS | Six named files; no unassigned mission. |
| Exact-once task coverage | PASS | All 50 approved card blocks appear verbatim in exactly one mission. |
| Branch isolation | PASS | 50 unique one-card branch names, grouped by owned track surface. |
| Contract ownership | PASS | Uday owns circuit-simulation; Rani owns learning-content and progress-analytics; Rajeswari owns flight-recorder-tutor; other missions consume without silent edits. |
| File ownership | PASS | Mission boundaries match ARCHITECTURE and repaired phase-plan ownership. |
| External dependencies | PASS | Every cross-mission dependency has a named owner, card ID and contract/fixture/in-memory mock path. |
| Cold-start capsule | PASS | Every brief includes project narrative, goal, victory, rules, cards, branch map, contracts, waits, sync protocol, pitch beat and acceptance checks. |
| Identity/card binding | PASS | `missions/AGENT-CARD-PROMPT.md` forces MEMBER_NAME + CARD_ID validation, mission ownership, dependency/mock, branch and TEST preflight before edits; every brief and map points to it. |
| Load law | PASS | Maximum mission load is 20h/48h = 41.7%. |
| P0 fan-out | PASS | AI-1 and SHIP-3 are immediate; SHIP-1 unlocks UX-1, SIM-1, DATA-1 and QA-1; QA-3 is the convergence gate. |
| Warden independence | PASS | Every PR requires fresh-session review; Akshaya coordinates evidence but is not the sole reviewer. |
| Communication | PASS | Discord is canonical; WhatsApp urgent-only; four-hour IST standups are written into every brief. |
| Stage roles | PASS | Venu operates/narrates learner flow; all six own short domain beats; Vinod opens and handles architecture/Q&A. |

## Automated checks

- Six mission files plus mission map and reusable MEMBER_NAME/CARD_ID agent prompt.
- 50 cards covered exactly once and verbatim.
- 50 unique card branches.
- 108 total card-hours; maximum mission 20h.
- Every external dependency appears in a WAITS-ON line with a mock path.
- Every mission carries acceptance checkboxes and Discord acceptance text.

## Start protocol

1. Post `missions/MISSION-MAP.md` in Discord.
2. Every member reads and ticks their ACCEPTED box, then posts the generated acceptance line.
3. Every new card session starts with `missions/AGENT-CARD-PROMPT.md`, replacing only MEMBER_NAME and CARD_ID; the agent prints preflight before editing.
4. Vinod starts SHIP-1; Rajeswari starts AI-1 and Vinod may draft SHIP-3 immediately.
5. After SHIP-1 merges, Venu/Uday/Rani/Akshaya fan out on UX-1/SIM-1/DATA-1/QA-1.
6. Fresh Warden review per PR; merge in DAG order; smoke after every merge.
7. Exact 29 Aug presentation time remains unknown; conservative freeze dates remain binding.

## Verdict

**MERGE.** Mission generation is complete. The next action belongs to the human team: distribute the complete WarRoom copy, post the mission map in Discord, collect six ACCEPTED responses and create the first branches. No code was implemented in this planning thread.
