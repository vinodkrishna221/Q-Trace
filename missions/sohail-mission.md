# Mission — Sohail · Contract fixtures, end-to-end proof and release confidence

> Context capsule: this file + the repo = everything needed in any tool, cold.
> ACCEPTED: [ ] **Sohail ticks this after reading; unaccepted by the next 4-hour standup is reassigned by Vinod.**

## The project in 30 seconds

**Q-Trace** is an AI-assisted quantum learning platform where Aarav or Meera learns, predicts, builds, simulates, sees and repairs a circuit. The live Bell-state path runs through real Qiskit evidence. **Quantum Flight Recorder** finds the first gate where the learner’s mental model diverged, the evidence-bound Tutor explains it, and a Repair Challenge updates Progress and Instructor Insight. The internal prototype must work from one laptop without cloud AI, Atlas or venue internet.

## Your mission

**Goal:** Own the independent evidence that Q-Trace is contract-correct, quantum-correct, safe offline and ready for the projector and backup path.
**Victory =** your seeded demo beats are green · every card test passes · every card branch receives fresh-session Warden review · PRs merge in DAG order · the local smoke path remains green.
**Declared availability:** 48h · **Mission card load:** 16h (33.3%) · **70% cap:** 33.6h · **Buffer:** 32h — PASS.
**First card:** `QA-1` · **First branch:** `feat/fixtures-qa/qa-1-freeze-golden-quantum-and-contract`.
**Recommended tool:** Any tool in a fresh session; QA review must be independent of the implementation session.

## File boundary

**Owns:** `apps/api/tests/{contract,fixtures/golden,acceptance,security}/**`, `apps/web/{e2e,tests/fixtures,tests/acceptance}/**`, cross-track release scripts and checklists.
**Never touch silently:** another mission’s implementation or unit-test surface; contracts change only through version bump + DECISIONS + Discord ping.

## Rules and frozen inputs

Load: core four · pr-review skill · quantum-ui.md · quantum-runtime.md · all four contracts · arenas/sih.md.
Always read `board/STATUS.md`, your phase plan, `docs/PRD.md`, `docs/ARCHITECTURE.md` and the relevant contract before taking a card.
Start every card in a fresh session by copying `missions/AGENT-CARD-PROMPT.md` and replacing only `MEMBER_NAME` and `CARD_ID`. The prompt enforces identity, ownership, dependency, branch and TEST gates.

## Branch map

| Card | Branch | PR requirement |
|---|---|---|
| QA-1 | `feat/fixtures-qa/qa-1-freeze-golden-quantum-and-contract` | card TEST + fresh Warden verdict + contract check |
| QA-2 | `feat/fixtures-qa/qa-2-enforce-contract-shapes-at-both` | card TEST + fresh Warden verdict + contract check |
| QA-3 | `feat/fixtures-qa/qa-3-build-the-real-walking-skeleton` | card TEST + fresh Warden verdict + contract check |
| QA-4 | `feat/fixtures-qa/qa-4-test-adapters-parser-safety-and` | card TEST + fresh Warden verdict + contract check |
| QA-5 | `feat/fixtures-qa/qa-5-test-diagnosis-grading-and-critical` | card TEST + fresh Warden verdict + contract check |
| QA-6 | `feat/fixtures-qa/qa-6-automate-the-learner-led-playwright` | card TEST + fresh Warden verdict + contract check |
| QA-7 | `feat/fixtures-qa/qa-7-run-offline-live-deploy-and` | card TEST + fresh Warden verdict + contract check |
| QA-8 | `feat/fixtures-qa/qa-8-certify-projector-demo-and-backup` | card TEST + fresh Warden verdict + contract check |
| DUO-11 | `feat/duolingo-ui/duo-11-desktop-assembly-inspector` | card TEST + fresh Warden verdict + contract check |
| DUO-12 | `feat/duolingo-ui/duo-12-mobile-sheet-acceptance` | card TEST + fresh Warden verdict + contract check |

## Your cards — verbatim from `plans/fixtures-qa-phase-plan.md`

### QA-1 · Freeze golden quantum and contract fixtures                        [timebox: 1h]
CONTEXT: Contracts and schema are frozen but implementation may not exist. Load both quantum packs and all contract examples. QA owns this path exclusively.
DELIVERABLE: Create golden Bell, asymmetric bit-order, invalid gate, wrong prediction, diagnosis, Tutor and progress payloads under `apps/api/tests/fixtures/golden` plus frontend mirrors generated from them.
TEST: `python3 scripts/validate_fixtures.py` parses every JSON file, checks IDs/basis order/probability sums and reports zero drift from contract examples.
DEPENDS: SHIP-1          UNBLOCKS: SIM-6,QA-2,QA-4
DEMO: Provides one trusted story every track can build against without waiting.
PERSONA: Warden           STATUS: [x] done
BRANCH: `feat/fixtures-qa/qa-1-freeze-golden-quantum-and-contract`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### QA-2 · Enforce contract shapes at both boundaries                        [timebox: 2h]
CONTEXT: Golden payloads exist. Load API-contract skill; generate validators from one source per language rather than hand-copying expected shapes.
DELIVERABLE: Add backend Pydantic serialization tests, frontend Zod fixture tests and an error-shape suite for all four contract files.
TEST: `bash scripts/contract-check.sh` passes valid examples and deliberately fails a renamed field, ObjectId leak and missing requestId.
DEPENDS: QA-1          UNBLOCKS: QA-3
DEMO: Prevents integration drift before the live swap.
PERSONA: Warden           STATUS: [x] done
BRANCH: `feat/fixtures-qa/qa-2-enforce-contract-shapes-at-both`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### QA-3 · Build the real walking-skeleton smoke runner ⭐                        [timebox: 3h]
CONTEXT: All P0 slices exist and local launcher can start them. Load BUILD-PLAN acceptance and do not bypass HTTP with direct service calls.
DELIVERABLE: Implement `scripts/smoke.sh`: reset seeds, start/check local stack, post Bell Simulation Run, diagnose, obtain fallback Tutor, submit Repair Challenge, assert Progress and Instructor Insight, then cleanly exit.
TEST: `bash scripts/smoke.sh --mode local` exits 0 and prints each real endpoint, expected signal code and final 100-point Progress Record; any contract mismatch exits non-zero.
DEPENDS: QA-2,UX-4,SIM-4,AI-3,DATA-3,SHIP-2          UNBLOCKS: DATA-6,SHIP-4
DEMO: Proves the entire learner loop before the 25 Aug 09:00 skeleton deadline.
PERSONA: Warden           STATUS: [x] done
BRANCH: `feat/fixtures-qa/qa-3-build-the-real-walking-skeleton`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### QA-4 · Test adapters, parser safety and evidence math                        [timebox: 2h]
CONTEXT: SIM-5, SIM-6 and QA-1 provide the parser, both adapters and golden fixtures. Load `quantum-runtime.md`, `circuit-simulation.md` and QA-owned basis-order fixtures before writing acceptance tests.
DELIVERABLE: Add cross-track acceptance tests for Qiskit/PennyLane tolerance, asymmetric basis mapping, trace-before-measurement and reduced-state purity under `apps/api/tests/acceptance/quantum`; add the malicious AST corpus under QA-owned `apps/api/tests/security/`.
TEST: `uv run --project apps/api pytest apps/api/tests/acceptance/quantum apps/api/tests/security/test_qiskit_ast.py` passes and catches a deliberately reversed mapper.
DEPENDS: SIM-5,SIM-6,QA-1          UNBLOCKS: SHIP-6
DEMO: Gives judges defensible proof that multiple backends and code editing are real and safe.
PERSONA: Warden           STATUS: [x] done
BRANCH: `feat/fixtures-qa/qa-4-test-adapters-parser-safety-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### QA-5 · Test diagnosis, grading and critical UI states                        [timebox: 2h]
CONTEXT: AI-4, DATA-3 and UX-5 provide the taxonomy, progress flow and interactive workspace. Load `flight-recorder-tutor.md`, `progress-analytics.md` and quantum-ui/runtime packs; consume but never modify implementation-owned files.
DELIVERABLE: Add cross-track diagnosis/grading/Tutor evidence acceptance tests under `apps/api/tests/acceptance`, plus Circuit Workspace and fallback-state acceptance fixtures under `apps/web/tests/acceptance`; implementation tracks retain unit tests.
TEST: `bash scripts/test-core.sh` runs all unit and QA-owned acceptance suites and proves no numerical claim lacks evidence.
DEPENDS: AI-4,DATA-3,UX-5          UNBLOCKS: SHIP-6
DEMO: Protects the wow moment and repair outcome from regression.
PERSONA: Warden           STATUS: [x] done
BRANCH: `feat/fixtures-qa/qa-5-test-diagnosis-grading-and-critical`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### QA-6 · Automate the learner-led Playwright journey                        [timebox: 2h]
CONTEXT: UX-7, SIM-8, AI-6 and DATA-7 provide integrated services and failure states. Load the PRD demo narrative, all four contracts and seed reset command; use synthetic roles and never depend on test order.
DELIVERABLE: Create Playwright test for Aarav prediction → build/run → evidence → Flight Recorder → fallback/cloud Tutor badge → repair → progress → brief instructor proof.
TEST: `pnpm --dir apps/web playwright test bell-journey.spec.ts` passes against local mode and records trace/video only on failure.
DEPENDS: UX-7,SIM-8,AI-6,DATA-7          UNBLOCKS: UX-9,QA-7,SHIP-7
DEMO: Rehearses the exact 90-second path automatically.
PERSONA: Warden           STATUS: [x] done
BRANCH: `feat/fixtures-qa/qa-6-automate-the-learner-led-playwright`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### QA-7 · Run offline, live-deploy and Warden release gates                        [timebox: 2h]
CONTEXT: QA-6 and SHIP-6 provide the automated journey plus merged local/cloud stacks. Load `arenas/sih.md`, `40-endgame.md`, all contracts and the PR-review skill before issuing a release verdict.
DELIVERABLE: Add forced-offline/fallback drill, live CORS/readiness smoke, contract diff scan and fresh-session Warden checklist with BLOCK/MERGE verdict file.
TEST: `bash scripts/release-gate.sh` passes local-offline and live URLs or returns a single ranked blocker list.
DEPENDS: QA-6,SHIP-6          UNBLOCKS: SIM-9,AI-8,DATA-8,QA-8
DEMO: Ensures “show us” works with bad venue Wi-Fi and no last-minute contract drift.
PERSONA: Warden           STATUS: [x] done
BRANCH: `feat/fixtures-qa/qa-7-run-offline-live-deploy-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### QA-8 · Certify projector demo and backup release                        [timebox: 2h]
CONTEXT: QA-7 and SHIP-7 make feature freeze active after release gating and rehearsal. Load `40-endgame.md`, `docs/DEMO-SCRIPT.md`, the PPT source and release checklist; only review-approved demo defects may change implementation.
DELIVERABLE: Execute keyboard/projector run, 5× smoke, backup recording verification, PPT link check and final release checklist with artifact hashes.
TEST: `bash scripts/final-certify.sh` emits `board/RELEASE-CERT.md` with all gates green and package/video/PPT hashes.
DEPENDS: QA-7,SHIP-7          UNBLOCKS: SHIP-8
DEMO: The team enters the internal round with a rehearsed primary and verified backup.
PERSONA: Warden           STATUS: [x] done
BRANCH: `feat/fixtures-qa/qa-8-certify-projector-demo-and-backup`
PR: one card per PR; paste the TEST result and link any contract/version decision.

## Contracts

**You OWN:** No product contract; owns golden fixtures, contract/acceptance/security/E2E tests, smoke and release-certification scripts.
**You CONSUME:** All four contracts and every implementation track’s public behavior; never edits implementation unit-test folders or production files.

## Cross-mission WAITS-ON and mock paths

- `QA-1` waits on **Vinod Krishna / SHIP-1** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-3` waits on **Venu Gopal / UX-4** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-3` waits on **Uday Rohit / SIM-4** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-3` waits on **Rajeswari / AI-3** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-3` waits on **Rani / DATA-3** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-3` waits on **Vinod Krishna / SHIP-2** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-4` waits on **Uday Rohit / SIM-5** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-4` waits on **Uday Rohit / SIM-6** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-5` waits on **Rajeswari / AI-4** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-5` waits on **Rani / DATA-3** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-5` waits on **Venu Gopal / UX-5** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-6` waits on **Venu Gopal / UX-7** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-6` waits on **Uday Rohit / SIM-8** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-6` waits on **Rajeswari / AI-6** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-6` waits on **Rani / DATA-7** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-7` waits on **Vinod Krishna / SHIP-6** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.
- `QA-8` waits on **Vinod Krishna / SHIP-7** for live integration — mock path: Freeze contract examples into QA-owned golden fixtures before implementation; other tracks consume them, and QA never waits silently for a live service.

## Shared pitch beat

Explain the real HTTP smoke path, malicious-code rejection, cross-backend tolerance, offline fallback drill and final Warden/release certification.

## Sync expectations

- Push at least every 60 minutes; one card per branch/PR.
- Discord is the canonical record: post `ACCEPTED`, four-hour standups, blockers, contract-change pings and PR links there.
- WhatsApp is urgent-only: blocked critical path, venue/power/network issue or voice handoff. Copy the resulting decision back to Discord/DECISIONS.
- Standups: 10:00 / 14:00 / 18:00 / 22:00 IST daily. Read `board/STATUS.md` first; post `OFFSHIFT` when unavailable.
- Blocked >20 minutes: add STATUS blocker + Discord ping Vinod + move to the next dependency-safe card. Silent hero-debugging is banned.
- Every PR gets a fresh-session Warden review. Sohail coordinates release evidence but is not the only reviewer.
- Contract change: edit contract → bump version/changelog → DECISIONS entry → ping consumers in Discord → then change code.

## Acceptance

- [ ] I, **Sohail**, accept this mission, the 16h card load, file boundary, first branch and shared pitch beat.
- [ ] I have opened the first card in a fresh agent session and confirmed its TEST command is executable from the repo.
- [ ] I posted `ACCEPTED — <mission> — starting <card> — <branch>` in Discord.

---

## Duolingo UI Phase Cards

### DUO-11 · Desktop Master-Detail Assembly & Right Stage Inspector Drawer [timebox: 5h]
CONTEXT: Per `docs/LEARN-DUOLINGO-PATH-UI-SPEC.md` Section 3 (Desktop Primary Architecture) and Section 3.1 (ASCII Wireframe), the `/learn` desktop layout requires a 3-zone `max-w-7xl` grid: Left Rail Col-3 (Daily Calibration Quests Card + Cohort Benchmark Card + Observer Tip), Center Col-6 (Serpentine Canvas from DUO-1 + Unit Banners from DUO-2 + ChamberNodes from DUO-3 + Popovers from DUO-4 + Telemetry HUD from DUO-6), Right Col-3 (Stage Inspector Drawer showing deep stage telemetry: difficulty, estimated time, XP reward, shield restore, key concepts, prediction checkpoint, Qiskit preview, prerequisite status). Stage selection via node click updates the Right Inspector without page reload per Section 2.4 (item 19). Design tokens from `docs/DESIGN-SYSTEM.md`; hairline borders, no neon shadows, `--bg-canvas: #faf6f0` background.
DELIVERABLE: Create `apps/web/app/learn/page.tsx` (or update existing) assembling the complete 3-zone desktop layout on `/learn`: Left Rail with daily quests and cohort leaderboard cards (hardcoded fixtures), Center serpentine canvas using DUO-1/2/3/4/6 components, Right Stage Inspector panel that reactively renders the selected stage's full telemetry when a node is clicked. Stage selection state managed via Zustand or React context. Preserves `data-testid="learning-guided-prompt"` and `data-testid="learn-sidebar"` for existing acceptance test compatibility per Section 11.
TEST: `pnpm test:web tests/integration/learn-desktop-assembly.test.tsx` verifying 3-column grid renders on viewport ≥1024px, clicking a ChamberNode updates the Right Inspector stage data without navigation, Left Rail quests card renders daily goals, and existing `data-testid` attributes are preserved.
DEPENDS: DUO-1, DUO-2, DUO-3, DUO-4, DUO-6, DUO-7          UNBLOCKS: DUO-12
DEMO: The complete `/learn` desktop experience — judge sees the winding serpentine path with unit banners, clicks a ChamberNode, the Right Inspector animates open with the stage's Qiskit preview and prediction checkpoint, while the top HUD tracks live XP and streak.
PERSONA: Warden           STATUS: [ ] ready
BRANCH: `feat/duolingo-ui/duo-11-desktop-assembly-inspector`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DUO-12 · Mobile Sinusoidal Arc, Spring Bottom Sheet & Full Test Suite [timebox: 5h]
CONTEXT: Per `docs/LEARN-DUOLINGO-PATH-UI-SPEC.md` Section 4 (Mobile Architecture) and Section 4.1 (Mobile ASCII Wireframe, 390px viewport), mobile layout requires: Sticky Top HUD (h-12, compact icon+number layout from DUO-6), single-column sinusoidal path (x ∈ [-44px, +44px] swing, 52px node diameter), In-Situ Anchored Popover on active node tap (from DUO-4), and Swipe-Up Spring Bottom Sheet Modal (75vh, drag handle pill, stage telemetry, `▶ ENTER CHAMBER` 48px thumb CTA, Prediction Checkpoint radio options). Section 2.4 item 20 specifies spring-animated bottom sheet for deep inspection on mobile. Section 2.4 item 21 specifies fixed 4-tab bottom navigation bar (`Learn`, `Practice`, `Quests`, `Profile`). Post-implementation: run full regression `pnpm test:web` and confirm all 195+ existing tests remain green.
DELIVERABLE: Implement the responsive mobile layout adaptations on `/learn`: (1) sticky compact HUD at h-12 with icon+number layout below 640px, (2) single-column path with ±44px sinusoidal swing on mobile viewport, (3) spring-animated bottom sheet component at `apps/web/features/learning/components/stage-bottom-sheet.tsx` with 75vh height, drag handle, full stage metadata, prediction checkpoint radio options, and 48px `▶ ENTER CHAMBER` CTA, (4) fixed bottom 4-tab navigation bar. Verify full `pnpm test:web` suite passes with no regressions.
TEST: `pnpm test:web` — full suite must pass with 195+ tests green. Additionally: `pnpm test:web tests/acceptance/learning-visuals.test.tsx tests/acceptance/bell-live.test.tsx` verifying mobile bottom sheet opens on node tap, drag handle is accessible, `▶ ENTER CHAMBER` fires stage navigation, and existing canonical slug routes (`/learn/superposition`, `/learn/measurement`, `/learn/bell-state`) remain intact.
DEPENDS: DUO-11          UNBLOCKS: —
DEMO: On mobile (390px), the judge taps the active Hadamard node — the In-Situ Popover appears briefly, then a spring-animated sheet glides up from the bottom (75vh) revealing full stage details, prediction checkpoint, and the large `▶ ENTER CHAMBER` button. The bottom 4-tab bar stays fixed throughout.
PERSONA: Warden           STATUS: [ ] ready
BRANCH: `feat/duolingo-ui/duo-12-mobile-sheet-acceptance`
PR: one card per PR; paste the TEST result and link any contract/version decision.

