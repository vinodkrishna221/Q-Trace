# Mission — Venu Gopal · Learner experience and live demo operation

> Context capsule: this file + the repo = everything needed in any tool, cold.
> ACCEPTED: [ ] **Venu Gopal ticks this after reading; unaccepted by the next 4-hour standup is reassigned by Vinod.**

## The project in 30 seconds

**Q-Trace** is an AI-assisted quantum learning platform where Aarav or Meera learns, predicts, builds, simulates, sees and repairs a circuit. The live Bell-state path runs through real Qiskit evidence. **Quantum Flight Recorder** finds the first gate where the learner’s mental model diverged, the evidence-bound Tutor explains it, and a Repair Challenge updates Progress and Instructor Insight. The internal prototype must work from one laptop without cloud AI, Atlas or venue internet.

## Your mission

**Goal:** Deliver the learner-facing Q-Trace journey from adaptive Module and prediction through circuit construction, visual evidence, repair and progress.
**Victory =** your seeded demo beats are green · every card test passes · every card branch receives fresh-session Warden review · PRs merge in DAG order · the local smoke path remains green.
**Declared availability:** 48h · **Mission card load:** 20h (41.7%) · **70% cap:** 33.6h · **Buffer:** 28h — PASS.
**First card:** `UX-1` · **First branch:** `feat/learning-ux/ux-1-create-the-learner-application-shell`.
**Recommended tool:** Antigravity preferred for Next.js UI; fresh Warden session for every PR.

## File boundary

**Owns:** `apps/web/app/**`, `apps/web/components/**`, `apps/web/features/**`, `apps/web/lib/contracts/**`, `apps/web/tests/unit/**`.
**Never touch silently:** another mission’s implementation or unit-test surface; contracts change only through version bump + DECISIONS + Discord ping.

## Rules and frozen inputs

Load: core four · nextjs.md · quantum-ui.md · all four board contracts.
Always read `board/STATUS.md`, your phase plan, `docs/PRD.md`, `docs/ARCHITECTURE.md` and the relevant contract before taking a card.
Start every card in a fresh session by copying `missions/AGENT-CARD-PROMPT.md` and replacing only `MEMBER_NAME` and `CARD_ID`. The prompt enforces identity, ownership, dependency, branch and TEST gates.

## Branch map

| Card | Branch | PR requirement |
|---|---|---|
| UX-1 | `feat/learning-ux/ux-1-create-the-learner-application-shell` | card TEST + fresh Warden verdict + contract check |
| UX-2 | `feat/learning-ux/ux-2-render-the-bell-module-and` | card TEST + fresh Warden verdict + contract check |
| UX-3 | `feat/learning-ux/ux-3-build-the-mocked-learner-evidence` | card TEST + fresh Warden verdict + contract check |
| UX-4 | `feat/learning-ux/ux-4-swap-the-bell-journey-to` | card TEST + fresh Warden verdict + contract check |
| UX-5 | `feat/learning-ux/ux-5-implement-the-interactive-circuit-workspace` | card TEST + fresh Warden verdict + contract check |
| UX-6 | `feat/learning-ux/ux-6-complete-learning-paths-and-visual` | card TEST + fresh Warden verdict + contract check |
| UX-7 | `feat/learning-ux/ux-7-integrate-progress-instructor-proof-and` | card TEST + fresh Warden verdict + contract check |
| UX-8 | `feat/learning-ux/ux-8-add-supported-circuit-sharing-and` | card TEST + fresh Warden verdict + contract check |
| UX-9 | `feat/learning-ux/ux-9-polish-accessibility-and-projector-readability` | card TEST + fresh Warden verdict + contract check |

## Your cards — verbatim from `plans/learning-ux-phase-plan.md`

### UX-1 · Create the learner application shell                        [timebox: 2h]
CONTEXT: The root workspace exists after SHIP-1. Load `nextjs.md`, `quantum-ui.md`, all four contracts, PRD vocabulary and ARCHITECTURE file ownership. This card creates only the web track surface and must support seeded role switching without production auth.
DELIVERABLE: Create `apps/web` with App Router, strict TypeScript, Tailwind, shadcn primitives, route groups for learn/lab/progress/instructor, contract fixture loader, error/loading shells and Aarav/Meera/Dr. Rao role switch.
TEST: `pnpm --dir apps/web test -- role-switch` renders three synthetic roles and opens `/learn/bell-state` as Aarav without network access.
DEPENDS: SHIP-1          UNBLOCKS: UX-2,SHIP-2
DEMO: The judge sees a credible product shell and can enter as Aarav.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-1-create-the-learner-application-shell`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### UX-2 · Render the Bell Module and capture a prediction                        [timebox: 2h]
CONTEXT: UX-1 provides the shell. Load `learning-content.md`, `circuit-simulation.md` and the Bell module fixture. The learner-led story requires a structured pre-run answer, not free text.
DELIVERABLE: Implement the Bell Module page with concept blocks, prior-knowledge path badge, Prediction Checkpoint options and persisted client draft keyed by learner/module.
TEST: `pnpm --dir apps/web test -- bell-prediction` selects `INDEPENDENT_RANDOM`, reloads the route and shows the saved choice before Run is enabled.
DEPENDS: UX-1          UNBLOCKS: UX-3
DEMO: Aarav makes the wrong prediction judges will watch the Flight Recorder repair.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-2-render-the-bell-module-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### UX-3 · Build the mocked learner evidence loop                        [timebox: 2h]
CONTEXT: UX-2 captures the Prediction Checkpoint. Load `quantum-ui.md` and fixture responses for Simulation Run, Flight Recorder, Tutor, Repair Challenge and Progress. This is a contract-shaped UI slice, not live integration.
DELIVERABLE: Add a read-only two-wire Circuit Workspace, generated Qiskit panel, probability/histogram evidence, two-step Flight Recorder, fallback Tutor card, repair challenge and progress success state driven entirely by typed fixtures.
TEST: `pnpm --dir apps/web test -- mocked-bell-loop` walks every state and verifies basis labels `00`/`11`, `MIXED_SUBSYSTEM`, evidence keys and repair success.
DEPENDS: UX-2          UNBLOCKS: UX-4
DEMO: The full 90-second learner story can be rehearsed before backend merge.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-3-build-the-mocked-learner-evidence`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### UX-4 · Swap the Bell journey to live contracts                        [timebox: 2h]
CONTEXT: The mocked loop is green and P0 domain endpoints exist. Load all four contracts and keep fixtures behind `DEMO_LOCAL` fallback. Do not redesign screens or alter response shapes.
DELIVERABLE: Replace P0 fixture calls with TanStack Query mutations/queries for Simulation Run, diagnosis, Tutor fallback, Challenge Attempt, Progress Record and Instructor Insight; retain disclosed fallback states.
TEST: `pnpm --dir apps/web test:e2e -- bell-live` against the local API completes prediction → run → diagnosis → repair → progress and exposes the request ID.
DEPENDS: UX-3,SIM-4,AI-3,DATA-3          UNBLOCKS: UX-5,UX-6,QA-3,SHIP-5
DEMO: Aarav completes the real HTTP walking skeleton; this unblocks the global smoke test.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-4-swap-the-bell-journey-to`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### UX-5 · Implement the interactive Circuit Workspace                        [timebox: 3h]
CONTEXT: The live Bell path exists with a read-only workspace. Load `quantum-ui.md` and `circuit-simulation.md`. Circuit Model is the sole editable truth; the grid and code must never diverge.
DELIVERABLE: Implement ordered dnd-kit qubit wires with H/X/Y/Z/CNOT/Measure placement/removal, keyboard/click alternatives, Zustand workspace slice, generated CodeMirror Qiskit and one safe parse-and-replace edit flow.
TEST: `pnpm --dir apps/web test -- circuit-workspace` places H+CNOT, serializes stable columns, round-trips the supported code edit and rejects an unsupported RX without mutating the model.
DEPENDS: UX-4          UNBLOCKS: UX-8,QA-5
DEMO: Judges build the Bell circuit visually and see synchronized Qiskit code.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-5-implement-the-interactive-circuit-workspace`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### UX-6 · Complete learning paths and visual evidence                        [timebox: 3h]
CONTEXT: P0 proves one Bell route. Load `learning-content.md`, `circuit-simulation.md` and visualization law. The three-Module catalogue may use concise seeded content, but Bell remains the complete path.
DELIVERABLE: Render the three-Module catalogue, Aarav/Meera entry differences, Plotly histogram/Bloch client components, static table/SVG fallbacks and purity/representation labels from live responses.
TEST: `pnpm --dir apps/web test:e2e -- learning-visuals` shows all three Modules, different entry badges, a mixed reduced-state label and functional static fallback with Plotly disabled.
DEPENDS: UX-4,DATA-5,SIM-6          UNBLOCKS: UX-7
DEMO: The prototype visibly covers structured learning and scientifically honest visualization.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-6-complete-learning-paths-and-visual`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### UX-7 · Integrate progress, instructor proof and failure states                        [timebox: 2h]
CONTEXT: Core learner screens and live services exist. Load progress/analytics and Tutor contracts. This card must preserve learner emphasis; instructor analytics is a brief closing beat.
DELIVERABLE: Add live Progress Record, three-card/one-chart Instructor Insight, provider/fallback badges, empty/loading/timeout/unsupported states and retry actions without adding new product surfaces.
TEST: `pnpm --dir apps/web test:e2e -- resilient-journey` completes with cloud Tutor off and then renders a simulation-timeout recovery without blank UI.
DEPENDS: UX-6,DATA-7,AI-6          UNBLOCKS: UX-9,QA-6
DEMO: The demo survives failures and closes with Dr. Rao seeing the same learner event.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-7-integrate-progress-instructor-proof-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### UX-8 · Add supported circuit sharing and export                        [timebox: 2h]
CONTEXT: The Circuit Model and OpenQASM export endpoint are stable. Load `circuit-simulation.md`; collaboration scope is artifact sharing, not realtime editing.
DELIVERABLE: Add OpenQASM download, Circuit Model JSON copy/import for the supported subset and a share panel that clearly labels local artifact sharing.
TEST: `pnpm --dir apps/web test -- circuit-share` exports the Bell model, reimports it and obtains a byte-for-byte equivalent normalized Circuit Model.
DEPENDS: UX-5,SIM-5          UNBLOCKS: —
DEMO: Judges see credible modular/collaborative learning without a fake multiplayer claim.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-8-add-supported-circuit-sharing-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### UX-9 · Polish accessibility and projector readability                        [timebox: 2h]
CONTEXT: All learner flows are integrated and P3 is pre-cut-listed. Load `quantum-ui.md`; change no contracts or page structure.
DELIVERABLE: Fix keyboard order, focus states, color-independent gate labels, 1366×768 overflow, chart text sizing and reduced-motion behavior on the scripted path.
TEST: `pnpm --dir apps/web test:e2e -- accessibility-projector` passes keyboard-only Bell construction and captures all scripted screens at 1366×768 with no clipped primary evidence.
DEPENDS: UX-7,QA-6          UNBLOCKS: —
DEMO: The learner demo remains readable and operable on the judging projector.
PERSONA: Nova           STATUS: [ ] todo
BRANCH: `feat/learning-ux/ux-9-polish-accessibility-and-projector-readability`
PR: one card per PR; paste the TEST result and link any contract/version decision.

## Contracts

**You OWN:** Frontend contract mirrors only; does not own a board contract.
**You CONSUME:** learning-content.md · circuit-simulation.md · flight-recorder-tutor.md · progress-analytics.md.

## Cross-mission WAITS-ON and mock paths

- `UX-1` waits on **Vinod Krishna / SHIP-1** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-4` waits on **Uday Rohit / SIM-4** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-4` waits on **Rajeswari / AI-3** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-4` waits on **Rani / DATA-3** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-6` waits on **Rani / DATA-5** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-6` waits on **Uday Rohit / SIM-6** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-7` waits on **Rani / DATA-7** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-7` waits on **Rajeswari / AI-6** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-8` waits on **Uday Rohit / SIM-5** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.
- `UX-9` waits on **Akshaya / QA-6** for live integration — mock path: Build against QA-owned contract fixtures in `apps/web/tests/fixtures/contracts/`; UX-4 is the only live P0 swap.

## Shared pitch beat

Operate the live demo; narrate Aarav/Meera entry, Prediction Checkpoint, Circuit Workspace, Flight Recorder transition and repair result; cue each teammate’s short domain beat.

## Sync expectations

- Push at least every 60 minutes; one card per branch/PR.
- Discord is the canonical record: post `ACCEPTED`, four-hour standups, blockers, contract-change pings and PR links there.
- WhatsApp is urgent-only: blocked critical path, venue/power/network issue or voice handoff. Copy the resulting decision back to Discord/DECISIONS.
- Standups: 10:00 / 14:00 / 18:00 / 22:00 IST daily. Read `board/STATUS.md` first; post `OFFSHIFT` when unavailable.
- Blocked >20 minutes: add STATUS blocker + Discord ping Vinod + move to the next dependency-safe card. Silent hero-debugging is banned.
- Every PR gets a fresh-session Warden review. Akshaya coordinates release evidence but is not the only reviewer.
- Contract change: edit contract → bump version/changelog → DECISIONS entry → ping consumers in Discord → then change code.

## Acceptance

- [ ] I, **Venu Gopal**, accept this mission, the 20h card load, file boundary, first branch and shared pitch beat.
- [ ] I have opened the first card in a fresh agent session and confirmed its TEST command is executable from the repo.
- [ ] I posted `ACCEPTED — <mission> — starting <card> — <branch>` in Discord.
