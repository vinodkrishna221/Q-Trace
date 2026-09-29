# Mission — Uday Rohit · Quantum simulation and safe circuit runtime

> Context capsule: this file + the repo = everything needed in any tool, cold.
> ACCEPTED: [ ] **Uday Rohit ticks this after reading; unaccepted by the next 4-hour standup is reassigned by Vinod.**

## The project in 30 seconds

**Q-Trace** is an AI-assisted quantum learning platform where Aarav or Meera learns, predicts, builds, simulates, sees and repairs a circuit. The live Bell-state path runs through real Qiskit evidence. **Quantum Flight Recorder** finds the first gate where the learner’s mental model diverged, the evidence-bound Tutor explains it, and a Repair Challenge updates Progress and Instructor Insight. The internal prototype must work from one laptop without cloud AI, Atlas or venue internet.

## Your mission

**Goal:** Ship the Python quantum runtime that safely validates circuits, produces Qiskit State Traces and proves PennyLane conformance without becoming demo-fragile.
**Victory =** your seeded demo beats are green · every card test passes · every card branch receives fresh-session Warden review · PRs merge in DAG order · the local smoke path remains green.
**Declared availability:** 48h · **Mission card load:** 20h (41.7%) · **70% cap:** 33.6h · **Buffer:** 28h — PASS.
**First card:** `SIM-1` · **First branch:** `feat/simulation-api/sim-1-create-the-fastapi-service-boundary`.
**Recommended tool:** Claude Code/OpenCode preferred for Python; fresh Warden session for every PR.

## File boundary

**Owns:** `apps/api/app/routers/circuits.py`, `simulation_runs.py`, `apps/api/app/services/quantum/**`, quantum Pydantic models and `apps/api/tests/unit/simulation/**`.
**Never touch silently:** another mission’s implementation or unit-test surface; contracts change only through version bump + DECISIONS + Discord ping.

## Rules and frozen inputs

Load: core four · fastapi.md · quantum-runtime.md · circuit-simulation.md · SCHEMA.md.
Always read `board/STATUS.md`, your phase plan, `docs/PRD.md`, `docs/ARCHITECTURE.md` and the relevant contract before taking a card.
Start every card in a fresh session by copying `missions/AGENT-CARD-PROMPT.md` and replacing only `MEMBER_NAME` and `CARD_ID`. The prompt enforces identity, ownership, dependency, branch and TEST gates.

## Branch map

| Card | Branch | PR requirement |
|---|---|---|
| SIM-1 | `feat/simulation-api/sim-1-create-the-fastapi-service-boundary` | card TEST + fresh Warden verdict + contract check |
| SIM-2 | `feat/simulation-api/sim-2-validate-the-canonical-circuit-model` | card TEST + fresh Warden verdict + contract check |
| SIM-3 | `feat/simulation-api/sim-3-execute-bell-and-normalize-the` | card TEST + fresh Warden verdict + contract check |
| SIM-4 | `feat/simulation-api/sim-4-expose-and-persist-simulation-runs` | card TEST + fresh Warden verdict + contract check |
| SIM-5 | `feat/simulation-api/sim-5-parse-safe-qiskit-and-export` | card TEST + fresh Warden verdict + contract check |
| SIM-6 | `feat/simulation-api/sim-6-add-pennylane-conformance-and-circuit` | card TEST + fresh Warden verdict + contract check |
| SIM-7 | `feat/simulation-api/sim-7-swap-routes-to-the-production` | card TEST + fresh Warden verdict + contract check |
| SIM-8 | `feat/simulation-api/sim-8-harden-timeouts-flags-and-deployed` | card TEST + fresh Warden verdict + contract check |
| SIM-9 | `feat/simulation-api/sim-9-tune-the-supported-runtime-and` | card TEST + fresh Warden verdict + contract check |
| DUO-1 | `feat/duolingo-path/duo-1-serpentine-canvas-spline` | card TEST + fresh Warden verdict + contract check |
| DUO-2 | `feat/duolingo-path/duo-2-unit-banners-guidebook` | card TEST + fresh Warden verdict + contract check |
| FEA-2 | `feat/features-phase/fea-2-linter-backend` | card TEST + fresh Warden verdict + contract check |
| FEA-5 | `feat/features-phase/fea-5-linter-frontend` | card TEST + fresh Warden verdict + contract check |

## Your cards — verbatim from `plans/simulation-api-phase-plan.md`

### SIM-1 · Create the FastAPI service boundary                        [timebox: 1h]
CONTEXT: The monorepo root exists. Load `fastapi.md`, `quantum-runtime.md`, `circuit-simulation.md` and shared error shape. This card creates only the API skeleton.
DELIVERABLE: Create `apps/api` with uv project, FastAPI app, CORS settings, request-ID middleware, `/health`, `/ready`, router placeholders and contract-shaped global error handler.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/simulation/test_health.py` proves health=200, readiness reports primary adapter status and errors include requestId.
DEPENDS: SHIP-1          UNBLOCKS: SIM-2,SHIP-2
DEMO: Plumbing for the first deployable backend and every quantum endpoint.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-1-create-the-fastapi-service-boundary`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SIM-2 · Validate the canonical Circuit Model                        [timebox: 2h]
CONTEXT: SIM-1 provides app/models. Load circuit contract and quantum-runtime limits. No SDK import should happen before validation.
DELIVERABLE: Add Pydantic v2 Circuit Model/Operation types, closed gate enum, qubit/operation/column/control/measurement validation and normalized operation ordering.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/simulation/test_circuit_model.py` accepts Bell and rejects RX, six qubits, duplicate op IDs and invalid control/target mappings.
DEPENDS: SIM-1          UNBLOCKS: SIM-3
DEMO: Ensures the visual builder cannot send unsafe or ambiguous circuits.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-2-validate-the-canonical-circuit-model`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SIM-3 · Execute Bell and normalize the State Trace ⭐ ⭐                        [timebox: 4h]
CONTEXT: Validated Circuit Models exist. Load `quantum-runtime.md`, Qiskit docs and Bell contract example. Save pre-measurement state; counts are a separate path.
DELIVERABLE: Implement Qiskit Aer adapter for H/X/Y/Z/CNOT/Measure, normalized basis order, `{re,im}` amplitudes, reduced density/Bloch/purity, measurement probabilities/counts and trace steps after supported gates.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/simulation/test_qiskit_bell_trace.py` verifies Bell support 00/11=0.5, trace length 2, post-CNOT purity 0.5 and asymmetric-order fixture labels.
DEPENDS: SIM-2          UNBLOCKS: SIM-4
DEMO: Produces the verified evidence that powers the Flight Recorder wow moment.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-3-execute-bell-and-normalize-the`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SIM-4 · Expose and persist Simulation Runs                        [timebox: 3h]
CONTEXT: Qiskit adapter is green and DATA-1 defines repository protocol/in-memory implementation. Load circuit contract; do not implement Mongo here.
DELIVERABLE: Implement POST/GET Simulation Run routes, synchronous timeout/threadpool execution, request idempotency, circuit snapshot persistence, conformance skipped shape and contract errors.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/simulation/test_simulation_routes.py` posts the contract Bell request and retrieves the same persisted run with duration and request ID.
DEPENDS: SIM-3,DATA-1          UNBLOCKS: UX-4,SIM-5,SIM-6,AI-4,QA-3
DEMO: The frontend can run a real circuit and replay a persistent State Trace.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-4-expose-and-persist-simulation-runs`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SIM-5 · Parse safe Qiskit and export OpenQASM                        [timebox: 3h]
CONTEXT: P0 accepts Circuit Model JSON only. Load `quantum-runtime.md` and circuit contract. Submitted code must be parsed, never executed.
DELIVERABLE: Implement allowlisted Python AST parser for the frozen Qiskit grammar plus OpenQASM 3 export/round-trip validation for the supported Circuit Model.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/simulation/test_code_and_qasm.py` round-trips Bell and rejects loops, imports, file/network calls, expressions and unsupported gates.
DEPENDS: SIM-4          UNBLOCKS: UX-8,QA-4
DEMO: Meera edits one supported Qiskit line and judges can export the circuit safely.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-5-parse-safe-qiskit-and-export`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SIM-6 · Add PennyLane conformance and circuit evidence                        [timebox: 2h]
CONTEXT: Primary Qiskit output is stable. Load quantum-runtime pack and QA golden/asymmetric fixtures; PennyLane is a narrow adapter, not a second platform.
DELIVERABLE: Compile supported Circuit Models to `default.qubit`, normalize probabilities, compare with epsilon, compute circuit health and expose explicit skip/unavailable reasons.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/simulation/test_pennylane_conformance.py` passes Bell and asymmetric fixtures and fails a deliberately reversed basis mapping.
DEPENDS: SIM-4,QA-1          UNBLOCKS: UX-6,SIM-7,QA-4
DEMO: The prototype demonstrates two genuine simulators without making the second one demo-critical.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-6-add-pennylane-conformance-and-circuit`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SIM-7 · Swap routes to the production repository                        [timebox: 2h]
CONTEXT: DATA-6 provides repository parity and Atlas implementation. Load `circuit-simulation.md`, repository protocol and Mongo/in-memory parity tests; keep Simulation Run business logic unchanged and preserve the venue fallback.
DELIVERABLE: Inject the shared repository into simulation routes, persist immutable snapshots in Atlas, and verify `DEMO_LOCAL=1` still selects memory.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/simulation/test_repository_swap.py` runs the same contract suite against memory and an isolated Mongo test database.
DEPENDS: SIM-6,DATA-6          UNBLOCKS: SIM-8
DEMO: Simulation history works on live deploy while venue mode remains independent.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-7-swap-routes-to-the-production`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SIM-8 · Harden timeouts, flags and deployed readiness                        [timebox: 2h]
CONTEXT: Live deployment shell exists. Load FastAPI and runtime packs. Optional adapters must never create broken controls or hung workers.
DELIVERABLE: Add adapter flags, 1500ms timeout, threadpool boundary, structured duration/error logs, readiness checks and Railway smoke configuration.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/simulation/test_runtime_guards.py` proves timeout, disabled PennyLane, no NaN/Infinity and one-worker readiness behavior.
DEPENDS: SIM-7,SHIP-4          UNBLOCKS: SIM-9,QA-6
DEMO: The live and local APIs fail softly instead of freezing during judging.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-8-harden-timeouts-flags-and-deployed`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SIM-9 · Tune the supported runtime and error evidence                        [timebox: 1h]
CONTEXT: SIM-8 and QA-7 make runtime guards and the release gate green. Load `quantum-runtime.md`, `circuit-simulation.md`, smoke timing logs and Warden findings; dependencies are frozen and endpoint shapes cannot change.
DELIVERABLE: Profile the Bell path, remove avoidable setup work, pre-initialize adapters on readiness and polish unsupported/timeout details for UI display.
TEST: `bash scripts/smoke.sh --mode local --repeat 5` completes every run within budget and returns identical ideal probabilities.
DEPENDS: SIM-8,QA-7          UNBLOCKS: —
DEMO: The quantum execution beat feels instant and its failures remain explainable.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/simulation-api/sim-9-tune-the-supported-runtime-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

## Contracts

**You OWN:** board/contracts/circuit-simulation.md.
**You CONSUME:** learning-content.md for Module IDs · progress-analytics.md only where Simulation Run evidence links to attempts.

## Cross-mission WAITS-ON and mock paths

- `SIM-1` waits on **Vinod Krishna / SHIP-1** for live integration — mock path: Use contract examples and QA Bell/asymmetric fixtures; if QA-1 is not merged, use an internal test object without editing QA-owned files.
- `SIM-4` waits on **Rani / DATA-1** for live integration — mock path: Use contract examples and QA Bell/asymmetric fixtures; if QA-1 is not merged, use an internal test object without editing QA-owned files.
- `SIM-6` waits on **Akshaya / QA-1** for live integration — mock path: Use contract examples and QA Bell/asymmetric fixtures; if QA-1 is not merged, use an internal test object without editing QA-owned files.
- `SIM-7` waits on **Rani / DATA-6** for live integration — mock path: Use contract examples and QA Bell/asymmetric fixtures; if QA-1 is not merged, use an internal test object without editing QA-owned files.
- `SIM-8` waits on **Vinod Krishna / SHIP-4** for live integration — mock path: Use contract examples and QA Bell/asymmetric fixtures; if QA-1 is not merged, use an internal test object without editing QA-owned files.
- `SIM-9` waits on **Akshaya / QA-7** for live integration — mock path: Use contract examples and QA Bell/asymmetric fixtures; if QA-1 is not merged, use an internal test object without editing QA-owned files.

## Shared pitch beat

Explain the Circuit Model, why submitted Python is never executed, Qiskit numerical truth, State Trace-before-measurement and the narrow PennyLane conformance claim.

## Sync expectations

- Push at least every 60 minutes; one card per branch/PR.
- Discord is the canonical record: post `ACCEPTED`, four-hour standups, blockers, contract-change pings and PR links there.
- WhatsApp is urgent-only: blocked critical path, venue/power/network issue or voice handoff. Copy the resulting decision back to Discord/DECISIONS.
- Standups: 10:00 / 14:00 / 18:00 / 22:00 IST daily. Read `board/STATUS.md` first; post `OFFSHIFT` when unavailable.
- Blocked >20 minutes: add STATUS blocker + Discord ping Vinod + move to the next dependency-safe card. Silent hero-debugging is banned.
- Every PR gets a fresh-session Warden review. Akshaya coordinates release evidence but is not the only reviewer.
- Contract change: edit contract → bump version/changelog → DECISIONS entry → ping consumers in Discord → then change code.

## Acceptance

- [ ] I, **Uday Rohit**, accept this mission, the 20h card load, file boundary, first branch and shared pitch beat.
- [ ] I have opened the first card in a fresh agent session and confirmed its TEST command is executable from the repo.
- [ ] I posted `ACCEPTED — <mission> — starting <card> — <branch>` in Discord.

---

## Duolingo Path Phase Cards

### DUO-1 · Sinusoidal Serpentine Path Canvas & SVG Bus Spline [timebox: 4h]
CONTEXT: Per `docs/LEARN-DUOLINGO-PATH-UI-SPEC.md` Section 3 (Desktop Architecture) and Section 7.2 (Path Voltage Animation), the `/learn` route requires a responsive SVG serpentine canvas connecting ChamberNodes via a dual-rail coherence bus spline. Node x-coordinates swing sinusoidally: ±120px desktop (≥1024px), ±96px tablet, ±68px landscape, ±42px mobile (<640px) as specified in Section 9 (Breakpoints). The bus uses animated `stroke-dashoffset` for the voltage stream and `--border-subtle` for locked segments.
DELIVERABLE: Create `apps/web/features/learning/components/serpentine-path.tsx` — a purely computational SVG canvas component that accepts a list of node positions and outputs bezier/sinusoidal coordinate math for dual-rail bus paths with animated `stroke-dashoffset` coherence-flow stream. No node rendering — path geometry only.
TEST: `pnpm test:web tests/unit/serpentine-path.test.ts` verifying SVG path coordinate calculations produce correct x-offsets at 390px and 1440px viewport widths, dual-rail path generation, and stroke-dashoffset animation class presence.
DEPENDS: —          UNBLOCKS: DUO-2, DUO-11
DEMO: The winding quantum coherence bus spine appears on `/learn`, connecting all ChamberNodes in a sinusoidal serpentine pattern with animated voltage pulses flowing along the completed path segments.
PERSONA: Nova           STATUS: [x] done
BRANCH: `feat/duolingo-path/duo-1-serpentine-canvas-spline`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DUO-2 · Path Section Banners & Unit Guidebook Cheatsheet Modal [timebox: 3h]
CONTEXT: Per `docs/LEARN-DUOLINGO-PATH-UI-SPEC.md` Section 2.2 (Curriculum Structure Items 6–8) and `docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md` Section 3 (Module 1 Units), each unit requires a full-width Unit Section Banner with subtitle, progress count, accent rail, a `[Guidebook 📖]` button, and a milled progress fill bar. The Guidebook slide-over modal contains high-yield gate truth tables (X, H, Z, S, T), Dirac formulas, and Bloch sphere summaries from the curriculum spec.
DELIVERABLE: Create `apps/web/features/learning/components/unit-section-banner.tsx` (unit title, subtitle, `X/Y Completed` count, progress fill bar, Guidebook button) and `apps/web/features/learning/components/unit-guidebook-modal.tsx` (slide-over drawer with gate truth tables, Dirac notation formulas, and Born rule summary using design tokens from `docs/DESIGN-SYSTEM.md`).
TEST: `pnpm test:web tests/unit/unit-section-banner.test.tsx` verifying banner renders unit title and progress, Guidebook button triggers modal open, modal renders gate truth tables and Dirac formulas, and Esc key / click-outside closes the modal.
DEPENDS: DUO-1          UNBLOCKS: DUO-11
DEMO: Judge sees a full-width "UNIT 1: THE QUANTUM COMPASS" banner with a `[Guidebook 📖]` button; clicking it opens a slide-over drawer with all single-qubit gate matrices, truth tables, and Dirac bra-ket formulas from the curriculum spec.
PERSONA: Nova           STATUS: [x] done
BRANCH: `feat/duolingo-path/duo-2-unit-banners-guidebook`
PR: one card per PR; paste the TEST result and link any contract/version decision.

---

## Features Phase Cards (FEA)

> Appended at kickoff of the F1–F5 Differentiating Features Phase. All cards target
> files defined in docs/FEATURES-SPEC.md. Read that document before starting any FEA card.

### FEA-2 · Quantum Invariant Linter Backend [timebox: 3h]
CONTEXT: Per docs/FEATURES-SPEC.md §2.2 (Three Invariant Rules to Enforce) and §2.3 (Backend Architecture), Q-Trace must validate quantum physics constraints at authoring time. Three rules must be implemented without quantum SDK dependencies:
1. QI-1: Post-collapse unitary (unitary gate on qubit after MEASURE on same qubit) → WARNING
2. QI-2: No-cloning violation attempt (two CNOTs attempting to duplicate a superposition register) → INFO
3. QI-3: Controlled gate wire collision (control qubit index == target qubit index) → ERROR
The backend must expose lint_circuit(circuit: CircuitModel) -> list[LintWarning], extend ParseQiskitResponse in apps/api/app/models/circuit.py with lintWarnings: list[LintWarning], and add a dedicated POST /v1/circuits/lint endpoint in apps/api/app/routers/circuits.py for sub-300ms debounce calls from the UI.
DELIVERABLE: Create apps/api/app/services/quantum/linter.py (implement LintSeverity, LintWarning, and lint_circuit() with rules QI-1, QI-2, QI-3), modify apps/api/app/models/circuit.py (add LintSeverity, LintWarning, and lintWarnings field to ParseQiskitResponse), modify apps/api/app/routers/circuits.py (add POST /v1/circuits/lint route and include lint warnings in /parse-qiskit), and create apps/api/tests/unit/quantum/test_linter.py.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/quantum/test_linter.py -v`
DEPENDS: FEA-1          UNBLOCKS: FEA-5, FEA-14
DEMO: Backend instantaneously flags quantum physics violations (post-collapse unitary, cloning attempt, wire collision) via structured lintWarnings payload with rule IDs and human-readable explanations.
PERSONA: Forge           STATUS: [ ] ready
BRANCH: `feat/features-phase/fea-2-linter-backend`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### FEA-5 · Quantum Invariant Linter Frontend Integration [timebox: 3h]
CONTEXT: Per docs/FEATURES-SPEC.md §2.3 (Frontend — Circuit Canvas Integration) and §2.4 (Demo Wow-Moment Script), the frontend must surface real-time quantum mechanics lint feedback. On every circuit canvas change or code edit in /lab, the frontend debounces (300ms) a call to POST /v1/circuits/lint. When violations are detected:
1. interactive-circuit-workspace.tsx renders amber warning pills at the top of the affected qubit wire column showing rule code (e.g. QI-1) with tooltip expansion.
2. qiskit-code-editor.tsx highlights the offending lines with an amber wavy underline (text-decoration: underline wavy #F59E0B) and displays an inline gutter warning icon (⚠) at the line number.
DELIVERABLE: Modify apps/web/features/circuit/interactive-circuit-workspace.tsx (integrate debounced lint query, render amber warning badge pill at affected column/qubit wire with hover tooltip), modify apps/web/features/circuit/qiskit-code-editor.tsx (map lintWarnings line targets to code editor DOM, add wavy amber underline styling and gutter warning glyph), and create apps/web/tests/unit/circuit-linter-ui.test.tsx.
TEST: `pnpm test:web tests/unit/circuit-linter-ui.test.tsx`
DEPENDS: FEA-2          UNBLOCKS: —
DEMO: When the user adds an H gate after a MEASURE on wire q[0], within 300ms an amber pill appears above q[0] and a wavy amber underline highlights the qc.h(0) line in the Qiskit editor.
PERSONA: Nova           STATUS: [ ] ready
BRANCH: `feat/features-phase/fea-5-linter-frontend`
PR: one card per PR; paste the TEST result and link any contract/version decision.


