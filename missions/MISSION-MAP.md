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

---

## Duolingo Path Phase — DUO-1 through DUO-12

> Appended at kickoff of the Duolingo-Style Progressive Quantum Path feature phase. All 12 cards target brand-new files with non-overlapping paths — zero merge conflicts guaranteed when team members create these branches from main.

### Load Summary

| Member | DUO Cards | New Branches | Phase Load |
|---|---|---|---|
| Uday Rohit | DUO-1, DUO-2 | `feat/duolingo-path/duo-1-serpentine-canvas-spline`, `feat/duolingo-path/duo-2-unit-banners-guidebook` | +7h |
| Rani | DUO-3, DUO-4 | `feat/duolingo-path/duo-3-chamber-node-archetypes`, `feat/duolingo-path/duo-4-anchored-node-popover` | +7h |
| Vinod Krishna | DUO-5, DUO-6 | `feat/duolingo-path/duo-5-coherence-shield-store`, `feat/duolingo-path/duo-6-telemetry-hud-profile` | +7h |
| Rajeswari | DUO-7, DUO-8 | `feat/duolingo-curriculum/duo-7-foundations-units-1-3`, `feat/duolingo-curriculum/duo-8-single-qubit-gates-qrng` | +8h |
| Venu Gopal | DUO-9, DUO-10 | `feat/duolingo-curriculum/duo-9-cnot-bell-correlation`, `feat/duolingo-curriculum/duo-10-teleportation-capstone` | +8h |
| Sohail | DUO-11, DUO-12 | `feat/duolingo-ui/duo-11-desktop-assembly-inspector`, `feat/duolingo-ui/duo-12-mobile-sheet-acceptance` | +10h |

### Dependency Chain

```
DUO-1 (canvas math) ──► DUO-2 (banners use canvas)
DUO-1 ──────────────────────────────────────────────────────────► DUO-11 (assembly)
DUO-2 ──────────────────────────────────────────────────────────► DUO-11
DUO-3 (nodes) ──────► DUO-4 (popovers anchor to nodes)
DUO-3 ──────────────────────────────────────────────────────────► DUO-11
DUO-4 ──────────────────────────────────────────────────────────► DUO-11
DUO-5 (store) ──────► DUO-6 (HUD reads from store)
DUO-6 ──────────────────────────────────────────────────────────► DUO-11
DUO-7 (units 1-3) ──► DUO-8 (units 4-5) ──► DUO-9 (units 6-7) ──► DUO-10 (units 8-10)
DUO-7 ──────────────────────────────────────────────────────────► DUO-11
DUO-10 ─────────────────────────────────────────────────────────► DUO-11
DUO-11 (desktop assembly) ──────────────────────────────────────► DUO-12 (mobile)

Note: DUO-1 and DUO-3 run IN PARALLEL (no dependency between them). Both feed DUO-11.
```

### Discord Acceptance Lines — DUO Phase

- `Uday Rohit: ACCEPTED — DUO Duolingo Path Phase — starting DUO-1 — feat/duolingo-path/duo-1-serpentine-canvas-spline` — STATUS: [x] done
- `Uday Rohit: ACCEPTED — DUO Duolingo Path Phase — starting DUO-2 — feat/duolingo-path/duo-2-unit-banners-guidebook` — STATUS: [ ] ready
- `Rani: ACCEPTED — DUO Duolingo Path Phase — starting DUO-3 — feat/duolingo-path/duo-3-chamber-node-archetypes` — STATUS: [ ] ready
- `Rani: ACCEPTED — DUO Duolingo Path Phase — starting DUO-4 — feat/duolingo-path/duo-4-anchored-node-popover` — STATUS: [ ] ready
- `Vinod Krishna: ACCEPTED — DUO Duolingo Path Phase — starting DUO-5 — feat/duolingo-path/duo-5-coherence-shield-store` — STATUS: [ ] ready
- `Vinod Krishna: ACCEPTED — DUO Duolingo Path Phase — starting DUO-6 — feat/duolingo-path/duo-6-telemetry-hud-profile` — STATUS: [ ] ready
- `Rajeswari: ACCEPTED — DUO Duolingo Path Phase — starting DUO-7 — feat/duolingo-curriculum/duo-7-foundations-units-1-3` — STATUS: [ ] ready
- `Rajeswari: ACCEPTED — DUO Duolingo Path Phase — starting DUO-8 — feat/duolingo-curriculum/duo-8-single-qubit-gates-qrng` — STATUS: [ ] ready
- `Venu Gopal: ACCEPTED — DUO Duolingo Path Phase — starting DUO-9 — feat/duolingo-curriculum/duo-9-cnot-bell-correlation` — STATUS: [ ] ready
- `Venu Gopal: ACCEPTED — DUO Duolingo Path Phase — starting DUO-10 — feat/duolingo-curriculum/duo-10-teleportation-capstone` — STATUS: [ ] ready
- `Sohail: ACCEPTED — DUO Duolingo Path Phase — starting DUO-11 — feat/duolingo-ui/duo-11-desktop-assembly-inspector` — STATUS: [ ] ready
- `Sohail: ACCEPTED — DUO Duolingo Path Phase — starting DUO-12 — feat/duolingo-ui/duo-12-mobile-sheet-acceptance` — STATUS: [ ] ready
