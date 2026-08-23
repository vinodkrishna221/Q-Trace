# Q-Trace Mission Map

> Post this block in Discord. Accept boxes unmarked at the next standup are reassigned.

| Member | Mission | Cards | Load | First card | First branch | Speaking beat |
|---|---|---:|---:|---|---|---|
| Vinod Krishna | Integration, deployment and shared story | 8 | 16h / 48h | SHIP-1 | `feat/story-ship/ship-1-scaffold-the-monorepo-and-environment` | Opening/architecture/Q&A |
| Venu Gopal | Learner experience and live demo operation | 9 | 20h / 48h | UX-1 | `feat/learning-ux/ux-1-create-the-learner-application-shell` | Demo operator + learner flow |
| Uday Rohit | Quantum simulation and safe circuit runtime | 9 | 20h / 48h | SIM-1 | `feat/simulation-api/sim-1-create-the-fastapi-service-boundary` | Simulation correctness |
| Rani | Learning data, progress and instructor analytics | 8 | 18h / 48h | DATA-1 | `feat/data-analytics/data-1-define-repositories-and-the-in` | Progress/analytics/privacy |
| Rajeswari | Flight Recorder diagnosis and evidence-bound Tutor | 8 | 18h / 48h | AI-1 | `feat/ai-pedagogy/ai-1-define-deterministic-misconception-rules` | Flight Recorder/Tutor |
| Akshaya | Contract fixtures, end-to-end proof and release confidence | 8 | 16h / 48h | QA-1 | `feat/fixtures-qa/qa-1-freeze-golden-quantum-and-contract` | QA/offline/release proof |

## Discord acceptance lines

- `Vinod Krishna: ACCEPTED — Integration, deployment and shared story — starting SHIP-1 — feat/story-ship/ship-1-scaffold-the-monorepo-and-environment`
- `Venu Gopal: ACCEPTED — Learner experience and live demo operation — starting UX-1 — feat/learning-ux/ux-1-create-the-learner-application-shell`
- `Uday Rohit: ACCEPTED — Quantum simulation and safe circuit runtime — starting SIM-1 — feat/simulation-api/sim-1-create-the-fastapi-service-boundary`
- `Rani: ACCEPTED — Learning data, progress and instructor analytics — starting DATA-1 — feat/data-analytics/data-1-define-repositories-and-the-in`
- `Rajeswari: ACCEPTED — Flight Recorder diagnosis and evidence-bound Tutor — starting AI-1 — feat/ai-pedagogy/ai-1-define-deterministic-misconception-rules`
- `Akshaya: ACCEPTED — Contract fixtures, end-to-end proof and release confidence — starting QA-1 — feat/fixtures-qa/qa-1-freeze-golden-quantum-and-contract`

## Required per-card agent prompt

Every member starts each fresh card session with `missions/AGENT-CARD-PROMPT.md`, replacing only `MEMBER_NAME` and `CARD_ID`. The agent must print the preflight block before editing.

## Start order

1. Vinod starts SHIP-1 and posts the scaffold SHA; Rajeswari may start AI-1 and Vinod may also draft SHIP-3 immediately because both have no dependency.
2. After SHIP-1: Venu starts UX-1, Uday starts SIM-1, Rani starts DATA-1 and Akshaya starts QA-1 in parallel.
3. P0 converges only at QA-3 after UX-4, SIM-4, AI-3, DATA-3, QA-2 and SHIP-2 are green.
4. Merge in DAG order, smoke after every merge, and do not start P1 merely because one track finishes early.

## Load gate

All six declared 48h. Mission loads are 16–20h, below the 33.6h cap. The remaining 28–32h per member is integration, review, rehearsal, sleep and contingency—not spare scope.

## Remaining scheduling note

Exact 29 Aug presentation time is unknown. Conservative readiness gates in STATUS/BUILD-PLAN remain binding until the college publishes it.
