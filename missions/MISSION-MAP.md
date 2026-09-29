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

- `Uday Rohit: ACCEPTED — DUO Duolingo Path Phase — starting DUO-1 — feat/duolingo-path/duo-1-serpentine-canvas-spline` — STATUS: [x] merged
- `Uday Rohit: ACCEPTED — DUO Duolingo Path Phase — starting DUO-2 — feat/duolingo-path/duo-2-unit-banners-guidebook` — STATUS: [x] merged
- `Rani: ACCEPTED — DUO Duolingo Path Phase — starting DUO-3 — feat/duolingo-path/duo-3-chamber-node-archetypes` — STATUS: [x] merged
- `Rani: ACCEPTED — DUO Duolingo Path Phase — starting DUO-4 — feat/duolingo-path/duo-4-anchored-node-popover` — STATUS: [x] merged
- `Vinod Krishna: ACCEPTED — DUO Duolingo Path Phase — starting DUO-5 — feat/duolingo-path/duo-5-coherence-shield-store` — STATUS: [x] merged
- `Vinod Krishna: ACCEPTED — DUO Duolingo Path Phase — starting DUO-6 — feat/duolingo-path/duo-6-telemetry-hud-profile` — STATUS: [x] merged
- `Rajeswari: ACCEPTED — DUO Duolingo Path Phase — starting DUO-7 — feat/duolingo-curriculum/duo-7-foundations-units-1-3` — STATUS: [x] merged
- `Rajeswari: ACCEPTED — DUO Duolingo Path Phase — starting DUO-8 — feat/duolingo-curriculum/duo-8-single-qubit-gates-qrng` — STATUS: [x] merged
- `Venu Gopal: ACCEPTED — DUO Duolingo Path Phase — starting DUO-9 — feat/duolingo-curriculum/duo-9-cnot-bell-correlation` — STATUS: [x] merged
- `Venu Gopal: ACCEPTED — DUO Duolingo Path Phase — starting DUO-10 — feat/duolingo-curriculum/duo-10-teleportation-capstone` — STATUS: [x] merged
- `Sohail: ACCEPTED — DUO Duolingo Path Phase — starting DUO-11 — feat/duolingo-ui/duo-11-desktop-assembly-inspector` — STATUS: [x] merged
- `Sohail: ACCEPTED — DUO Duolingo Path Phase — starting DUO-12 — feat/duolingo-ui/duo-12-mobile-sheet-acceptance` — STATUS: [ ] ready

---

## Features Phase — FEA-1 through FEA-14

> Appended at kickoff of the F1–F5 Differentiating Features Phase.
> All cards target files defined in docs/FEATURES-SPEC.md — read it before starting any FEA card.

### Load Summary

| Member | FEA Cards | New Branches | Phase Load |
|---|---|---|---|
| Vinod Krishna | FEA-1, FEA-12, FEA-14 | `feat/features-phase/fea-1-gate-model-expansion`, `feat/features-phase/fea-12-gate-palette-glyph`, `feat/features-phase/fea-14-contracts-golden-fixtures` | ~7h |
| Rajeswari | FEA-3, FEA-4 | `feat/features-phase/fea-3-grover-curriculum`, `feat/features-phase/fea-4-grover-amplitude-scrubber` | ~7h |
| Uday Rohit | FEA-2, FEA-5 | `feat/features-phase/fea-2-linter-backend`, `feat/features-phase/fea-5-linter-frontend` | ~6h |
| Rani | FEA-8, FEA-9 | `feat/features-phase/fea-8-cirq-adapter-backend`, `feat/features-phase/fea-9-engine-selector-rosetta-ui` | ~6h |
| Venu Gopal | FEA-10, FEA-11 | `feat/features-phase/fea-10-nisq-noise-backend`, `feat/features-phase/fea-11-noise-toggle-qsphere-ui` | ~5h |
| Sohail | FEA-6, FEA-7 | `feat/features-phase/fea-6-socratic-grading-engine`, `feat/features-phase/fea-7-assess-route-ui` | ~7h |

### Dependency Chain

```
FEA-1 (Gate Model Expansion) ──────────────────────────────────────────────────────────────────┐
  │                                                                                             │
  ├──► FEA-2 (F2: Linter Backend — linter.py + /v1/circuits/lint)                              │
  │         └──► FEA-5 (F2: Linter Frontend — amber pills + code editor squiggles)             │
  │                                                                                             │
  ├──► FEA-3 (F1: Grover Curriculum — module2-unit-2-1.ts, 9 stages)                           │
  │         └──► FEA-4 (F1: Grover Amplitude Scrubber — grover-amplitude-scrubber.tsx)         │
  │                                                                                             │
  ├──► FEA-6 (F5: Grading Engine — socratic_engine.py + /v1/grading/assess)                    │
  │         └──► FEA-7 (F5: /assess Route — assess/page.tsx two-column UI)                    │
  │                                                                                             │
  ├──► FEA-8 (F3: Cirq Adapter — cirq_adapter.py, reuse normalizer.py)                         │
  │         └──► FEA-9 (F3: Engine Selector UI + Conformance Badge + Rosetta Stone panel)      │
  │                                                                                             │
  ├──► FEA-10 (F4: Noise Model Backend — adapter.py noise_preset param + API field)            │
  │         └──► FEA-11 (F4: Noise Toggle UI + Bloch Contraction + Q-Sphere Wiring)             │
  │                                                                                             │
  └──► FEA-12 (Gate Palette & Glyph — CCX/CZ/S/T in gate-palette.tsx + gate-glyph.tsx)        │
  (parallel with other FEA cards)                                                               │
                                                                                                │
FEA-14 (Cross-Feature Contract & Golden Fixtures — grading-assessment.md + golden fixtures      │
         for Grover, Linter, Conformance) ── depends on FEA-1, FEA-2, FEA-6, FEA-8             │
         ── UNBLOCKS: SHIP-6 re-run, final certify                                             │
```

### Discord Acceptance Lines — FEA Phase

- `Vinod Krishna: ACCEPTED — Features Phase — starting FEA-1 — feat/features-phase/fea-1-gate-model-expansion` — STATUS: [x] done
- `Vinod Krishna: ACCEPTED — Features Phase — starting FEA-12 — feat/features-phase/fea-12-gate-palette-glyph` — STATUS: [x] done
- `Vinod Krishna: ACCEPTED — Features Phase — starting FEA-14 — feat/features-phase/fea-14-contracts-golden-fixtures` — STATUS: [ ] ready
- `Rajeswari: ACCEPTED — Features Phase — starting FEA-3 — feat/features-phase/fea-3-grover-curriculum` — STATUS: [x] done
- `Rajeswari: ACCEPTED — Features Phase — starting FEA-4 — feat/features-phase/fea-4-grover-amplitude-scrubber` — STATUS: [x] done
- `Uday Rohit: ACCEPTED — Features Phase — starting FEA-2 — feat/features-phase/fea-2-linter-backend` — STATUS: [x] done
- `Uday Rohit: ACCEPTED — Features Phase — starting FEA-5 — feat/features-phase/fea-5-linter-frontend` — STATUS: [x] done
- `Rani: ACCEPTED — Features Phase — starting FEA-8 — feat/features-phase/fea-8-cirq-adapter-backend` — STATUS: [x] done
- `Rani: ACCEPTED — Features Phase — starting FEA-9 — feat/features-phase/fea-9-engine-selector-rosetta-ui` — STATUS: [x] done
- `Venu Gopal: ACCEPTED — Features Phase — starting FEA-10 — feat/features-phase/fea-10-nisq-noise-backend` — STATUS: [x] done
- `Venu Gopal: ACCEPTED — Features Phase — starting FEA-11 — feat/features-phase/fea-11-noise-toggle-qsphere-ui` — STATUS: [ ] ready
- `Sohail: ACCEPTED — Features Phase — starting FEA-6 — feat/features-phase/fea-6-socratic-grading-engine` — STATUS: [ ] ready
- `Sohail: ACCEPTED — Features Phase — starting FEA-7 — feat/features-phase/fea-7-assess-route-ui` — STATUS: [ ] ready

