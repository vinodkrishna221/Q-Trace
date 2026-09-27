# Mission — Vinod Krishna · Integration, deployment and shared story

> Context capsule: this file + the repo = everything needed in any tool, cold.
> ACCEPTED: [x] **Vinod Krishna ticks this after reading; unaccepted by the next 4-hour standup is reassigned by Vinod.**

## The project in 30 seconds

**Q-Trace** is an AI-assisted quantum learning platform where Aarav or Meera learns, predicts, builds, simulates, sees and repairs a circuit. The live Bell-state path runs through real Qiskit evidence. **Quantum Flight Recorder** finds the first gate where the learner’s mental model diverged, the evidence-bound Tutor explains it, and a Repair Challenge updates Progress and Instructor Insight. The internal prototype must work from one laptop without cloud AI, Atlas or venue internet.

## Your mission

**Goal:** Keep Q-Trace continuously runnable and judge-ready while owning repository structure, deploys, merge trains, demo/PPT evidence and final freeze.
**Victory =** your seeded demo beats are green · every card test passes · every card branch receives fresh-session Warden review · PRs merge in DAG order · the local smoke path remains green.
**Declared availability:** 48h · **Mission card load:** 16h (33.3%) · **70% cap:** 33.6h · **Buffer:** 32h — PASS.
**First card:** `SHIP-1` · **First branch:** `feat/story-ship/ship-1-scaffold-the-monorepo-and-environment`.
**Recommended tool:** Antigravity or Claude Code; fresh Warden session for every PR.

## File boundary

**Owns:** root workspace files, `.env.example`, `scripts/demo-local.sh`, deploy configs, `docs/DEMO-SCRIPT.md`, PPT/deck assets and submission files.
**Never touch silently:** another mission’s implementation or unit-test surface; contracts change only through version bump + DECISIONS + Discord ping.

## Rules and frozen inputs

Load: 00-warroom-core.md · 10-git-protocol.md · 20-advisor-protocol.md · 30-scope-guard.md · 40-endgame.md · arenas/sih.md · deploy-runbook · demo-script · bolt-slides/ppt-builder.
Always read `board/STATUS.md`, your phase plan, `docs/PRD.md`, `docs/ARCHITECTURE.md` and the relevant contract before taking a card.
Start every card in a fresh session by copying `missions/AGENT-CARD-PROMPT.md` and replacing only `MEMBER_NAME` and `CARD_ID`. The prompt enforces identity, ownership, dependency, branch and TEST gates.

## Branch map

| Card | Branch | PR requirement |
|---|---|---|
| SHIP-1 | `feat/story-ship/ship-1-scaffold-the-monorepo-and-environment` | card TEST + fresh Warden verdict + contract check |
| SHIP-2 | `feat/story-ship/ship-2-create-the-one-laptop-demo` | card TEST + fresh Warden verdict + contract check |
| SHIP-3 | `feat/story-ship/ship-3-draft-the-deck-spine-and` | card TEST + fresh Warden verdict + contract check |
| SHIP-4 | `feat/story-ship/ship-4-deploy-frontend-api-and-atlas` | card TEST + fresh Warden verdict + contract check |
| SHIP-5 | `feat/story-ship/ship-5-build-the-internal-round-ppt` | card TEST + fresh Warden verdict + contract check |
| SHIP-6 | `feat/story-ship/ship-6-run-merge-trains-and-pre` | card TEST + fresh Warden verdict + contract check |
| SHIP-7 | `feat/story-ship/ship-7-rehearse-twice-and-record-the` | card TEST + fresh Warden verdict + contract check |
| SHIP-8 | `feat/story-ship/ship-8-freeze-the-final-submission-and` | card TEST + fresh Warden verdict + contract check |
| SHIP-9 | `feat/learning-ux/ux-linear-design-system-and-contracts` | card TEST + fresh Warden verdict + contract check |
| DUO-5 | `feat/duolingo-path/duo-5-coherence-shield-store` | card TEST + fresh Warden verdict + contract check |
| DUO-6 | `feat/duolingo-path/duo-6-telemetry-hud-profile` | card TEST + fresh Warden verdict + contract check |


## Your cards — verbatim from `plans/story-ship-phase-plan.md`

### SHIP-1 · Scaffold the monorepo and environment contract                        [timebox: 1h]
CONTEXT: Blueprint is approved and no code exists. Load git, Next.js, FastAPI and both quantum packs. This card creates shared root structure only; implementation tracks own app internals.
DELIVERABLE: Create root workspace files, `apps/web`, `apps/api`, scripts/test directories, `.env.example`, feature-flag names, branch conventions and README start commands without adding product logic.
TEST: `bash scripts/check-layout.sh` verifies required directories/env names and that no secret value is committed.
DEPENDS: —          UNBLOCKS: UX-1,SIM-1,DATA-1,QA-1,SHIP-2
DEMO: Every teammate can clone and begin a track without inventing paths.
PERSONA: Patch           STATUS: [x] done
BRANCH: `feat/story-ship/ship-1-scaffold-the-monorepo-and-environment`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SHIP-2 · Create the one-laptop demo launcher                        [timebox: 2h]
CONTEXT: Web/API shells exist. Load SIH arena and deploy-runbook. The launcher must force memory seeds and Tutor fallback, not require Atlas or internet.
DELIVERABLE: Implement `scripts/demo-local.sh`, reset command, readiness wait, clean shutdown and disclosed local-mode banner contract; document prerequisites/cache preparation.
TEST: `bash scripts/demo-local.sh --check` starts both services, reaches web/API health and proves Atlas/Tutor keys are absent.
DEPENDS: SHIP-1,UX-1,SIM-1          UNBLOCKS: QA-3
DEMO: The entire prototype can run from one laptop at the venue.
PERSONA: Patch           STATUS: [x] done
BRANCH: `feat/story-ship/ship-2-create-the-one-laptop-demo`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SHIP-3 · Draft the deck spine and learner demo script                        [timebox: 2h]
CONTEXT: IDEA-BRIEF, PRD and evidence links are frozen. Load Herald, Oracle and SIH arena; do not claim production impact or sponsor authorship.
DELIVERABLE: Create `docs/DEMO-SCRIPT.md` v0 and PPT outline covering pain, existing gap, Q-Trace loop, Flight Recorder novelty, architecture, expected impact, safety and roadmap with sourced evidence.
TEST: `python3 scripts/check_story_claims.py` finds sources for every number and confirms the 90-second script includes all eight learner beats plus fallback cue.
DEPENDS: —          UNBLOCKS: SHIP-5
DEMO: The team can explain the product while builders work.
PERSONA: Herald           STATUS: [x] done
BRANCH: `feat/story-ship/ship-3-draft-the-deck-spine-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SHIP-4 · Deploy frontend, API and Atlas shells early                        [timebox: 3h]
CONTEXT: QA-3 proves local P0 smoke. Load the deploy-runbook, `.env.example`, BUILD-PLAN targets and contract health paths; create real resources only with team-owned accounts and never invent destination URLs or credentials.
DELIVERABLE: Configure Vercel web, Railway API, Atlas M0, CORS/env templates, seed/pre-warm commands and URL placeholders updated only after successful creation.
TEST: `bash scripts/smoke-live.sh` reaches deployed web, `/health`, `/ready` and seeded Bell Module without exposing keys.
DEPENDS: QA-3          UNBLOCKS: SIM-8,AI-6,SHIP-6
DEMO: Judges can open live URLs well before the final day.
PERSONA: Patch           STATUS: [x] done
BRANCH: `feat/story-ship/ship-4-deploy-frontend-api-and-atlas`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SHIP-5 · Build the internal-round PPT evidence package                        [timebox: 2h]
CONTEXT: SHIP-3 and UX-4 provide the narrative and learner skeleton screenshots. Load IDEA-BRIEF, PRD, ARCHITECTURE, source ledger and any official college template; keep content modular if the template has not arrived.
DELIVERABLE: Create PPT source/assets for problem evidence, personas, learner flow, Flight Recorder, architecture, multiple backends, safety, analytics, impact, feasibility and roadmap; mark synthetic data.
TEST: `python3 scripts/check_deck.py` verifies required sections, source URLs, readable screenshots and no roadmap feature presented as live.
DEPENDS: SHIP-3,UX-4          UNBLOCKS: —
DEMO: The PPT covers the official statement and gives judges a retellable innovation.
PERSONA: Herald           STATUS: [x] done
BRANCH: `feat/story-ship/ship-5-build-the-internal-round-ppt`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SHIP-6 · Run merge trains and pre-warm both modes                        [timebox: 2h]
CONTEXT: P1 branches are review-approved. Load integration workflow; merge only in DAG order and preserve contract versions.
DELIVERABLE: Execute P1/P2 merge train, contract checks, live/local seeds, dependency caches, pre-warm scripts and STATUS updates with exact SHAs.
TEST: `bash scripts/integration-train.sh --verify` reports green main, contract versions, seed IDs, live readiness and local fallback.
DEPENDS: SHIP-4,QA-4,QA-5,DATA-6          UNBLOCKS: QA-7,SHIP-7
DEMO: The project is continuously demoable instead of assembled at the deadline.
PERSONA: Patch           STATUS: [ ] todo
BRANCH: `feat/story-ship/ship-6-run-merge-trains-and-pre`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SHIP-7 · Rehearse twice and record the fallback demo                        [timebox: 2h]
CONTEXT: SHIP-6 and QA-6 provide an integrated learner journey and verified deck path. Load `docs/DEMO-SCRIPT.md`, seed reset command, SIH arena guidance and fallback controls; rehearse the same 90-second learner emphasis each time.
DELIVERABLE: Run two timed rehearsals, log questions/cuts, record a clean 60–90 second backup walkthrough and verify playback from the venue laptop.
TEST: `python3 scripts/check_rehearsal.py` records two ≤100-second runs, confirms all beats and validates local video duration/path.
DEPENDS: SHIP-6,QA-6          UNBLOCKS: QA-8,SHIP-8
DEMO: The team has stage timing and a network-independent visual backup.
PERSONA: Herald + Patch           STATUS: [ ] todo
BRANCH: `feat/story-ship/ship-7-rehearse-twice-and-record-the`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SHIP-8 · Freeze the final submission and viva pack                        [timebox: 2h]
CONTEXT: SHIP-7 and QA-8 provide rehearsal evidence and final certification. Load `40-endgame.md`, `docs/DEMO-SCRIPT.md`, source ledger, viva template and submission checklist; only human-approved defects may change code and the exact presentation time may remain unknown.
DELIVERABLE: Finalize PPT, demo script, source ledger, architecture one-pager, eight-answer viva dossier, submission bundle, hashes and freeze note; recompute T-minus gates if schedule arrives.
TEST: `bash scripts/final-package.sh --verify` reproduces the submission ZIP and matches recorded hashes with all links opening offline.
DEPENDS: SHIP-7,QA-8          UNBLOCKS: —
DEMO: The team has one authoritative presentation, demo and technical-answer package.
PERSONA: Herald + Patch           STATUS: [ ] todo
BRANCH: `feat/story-ship/ship-8-freeze-the-final-submission-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### SHIP-9 · Author the Linear design system and contract presentation standard        [timebox: 2h]
CONTEXT: Judges' feedback revealed severe cognitive overload and unstyled developer telemetry leakage. Load report.md, docs/DESIGN-SYSTEM.md, quantum-ui.md, and all four board contracts.
DELIVERABLE: Upgrade docs/DESIGN-SYSTEM.md with Linear-grade specification (dual-theme porcelain/carbon tokens, Inter typography, 3-stage studio workbench, distraction-free stepper, telemetry purge law); update .agents/rules/stack/quantum-ui.md to enforce theme neutrality and clean rounding; update board/contracts/*.md with Presentation Layer Boundaries; record ADR-14 in board/DECISIONS.md.
TEST: `bash scripts/contract-check.sh` passes, docs match report.md specification, zero broken contract schemas.
DEPENDS: SHIP-5          UNBLOCKS: UX-11, UX-12
DEMO: Clear, unified design contracts and Linear tokens established across engineering tracks.
PERSONA: Patch           STATUS: [x] done
BRANCH: `feat/learning-ux/ux-linear-design-system-and-contracts`
PR: one card per PR; paste the TEST result and link any contract/version decision.


## Contracts

**You OWN:** No API domain contract. Owns env/deploy conventions, root scripts and story artifacts; proposes cross-domain changes through DECISIONS.
**You CONSUME:** All four contracts; reads them to build launchers, smoke/live checks, architecture/PPT claims and merge gates.

## Cross-mission WAITS-ON and mock paths

- `SHIP-2` waits on **Venu Gopal / UX-1** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.
- `SHIP-2` waits on **Uday Rohit / SIM-1** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.
- `SHIP-4` waits on **Akshaya / QA-3** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.
- `SHIP-5` waits on **Venu Gopal / UX-4** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.
- `SHIP-6` waits on **Akshaya / QA-4** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.
- `SHIP-6` waits on **Akshaya / QA-5** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.
- `SHIP-6` waits on **Rani / DATA-6** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.
- `SHIP-7` waits on **Akshaya / QA-6** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.
- `SHIP-8` waits on **Akshaya / QA-8** for live integration — mock path: Deploy shell endpoints and rehearse against QA golden fixtures plus `DEMO_FALLBACK`; live cloud resources never block local readiness.

## Shared pitch beat

Lead the opening problem and one-line pitch; explain architecture, feasibility and safety; answer technical Q&A; hand the live learner flow to Venu.

## Sync expectations

- Push at least every 60 minutes; one card per branch/PR.
- Discord is the canonical record: post `ACCEPTED`, four-hour standups, blockers, contract-change pings and PR links there.
- WhatsApp is urgent-only: blocked critical path, venue/power/network issue or voice handoff. Copy the resulting decision back to Discord/DECISIONS.
- Standups: 10:00 / 14:00 / 18:00 / 22:00 IST daily. Read `board/STATUS.md` first; post `OFFSHIFT` when unavailable.
- Blocked >20 minutes: add STATUS blocker + Discord ping Vinod + move to the next dependency-safe card. Silent hero-debugging is banned.
- Every PR gets a fresh-session Warden review. Akshaya coordinates release evidence but is not the only reviewer.
- Contract change: edit contract → bump version/changelog → DECISIONS entry → ping consumers in Discord → then change code.

## Acceptance

- [x] I, **Vinod Krishna**, accept this mission, the 16h card load, file boundary, first branch and shared pitch beat.
- [x] I have opened the first card in a fresh agent session and confirmed its TEST command is executable from the repo.
- [x] I posted `ACCEPTED — <mission> — starting <card> — <branch>` in Discord.

---

## Duolingo Path Phase Cards

### DUO-5 · Coherence Shield & Joules Store with Decoherence Penalty [timebox: 4h]
CONTEXT: Per `docs/LEARN-DUOLINGO-PATH-UI-SPEC.md` Section 2.1 (Navigation & Telemetry HUD Items 2–4), the gamification layer manages: Calibration Streak Pill (`🔥 N-Day Streak`), Coherence Joules / XP (`⚡ 850 Coherence`), and Coherence Shield / health meter (`🛡️ 100% Coherence`). Per Section 10.2, an incorrect prediction at a Prediction Checkpoint triggers a decoherence penalty (shield loss) and activates an Amber Diagnostic Detour. Shield recovery occurs by completing Flight Recorder calibration practice. Per `docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md` Section 3 Stage rewards (e.g. +30⚡ concept, +50⚡ gate lab, +100⚡ boss), XP is awarded on stage completion. Store must be client-side only (no API) and Zustand-based to feed DUO-6's HUD.
DELIVERABLE: Create `apps/web/lib/gamification-store.ts` — a Zustand store with: `coherenceJoules` (XP total), `coherenceShield` (0–100%), `streakDays`, `lastActiveDate`; actions `awardXP(amount)`, `applyDecoherencePenalty(percentage)`, `restoreShield(percentage)`, `incrementStreak()`, `resetStreak()`; and persistence via `localStorage` (use Zustand `persist` middleware). Shield starts at 100%; incorrect prediction applies -20% penalty; practice restore applies +15%.
TEST: `pnpm test:web tests/unit/gamification-store.test.ts` verifying initial state is correct (100% shield, 0 joules, 0 streak), `applyDecoherencePenalty` reduces shield by correct amount, `awardXP` increments joules correctly, shield cannot go below 0% or above 100%, and localStorage persistence round-trips correctly.
DEPENDS: —          UNBLOCKS: DUO-6
DEMO: After Aarav makes an incorrect Prediction Checkpoint, the `🛡️ 100%` in the top HUD drops to `🛡️ 80%` with an amber flash. Completing a calibration practice restores it. XP ticks upward after each completed stage.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/duolingo-path/duo-5-coherence-shield-store`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DUO-6 · Unified Top Telemetry HUD & Account Profile Pill [timebox: 3h]
CONTEXT: Per `docs/LEARN-DUOLINGO-PATH-UI-SPEC.md` Section 2.1 (HUD Items 1–5) and Section 3.1 (Desktop ASCII wireframe top bar), the unified learning HUD displays: Brand wordmark `Q-TRACE`, Streak Pill `🔥 4-Day Streak`, Coherence Joules `⚡ 850 Coherence`, Coherence Shield `🛡️ 100%`, and Account Profile Pill `[👤 Learner Profile ▾] [⚙]`. Mobile shows a compact version per Section 4.1 ASCII wireframe. All values read reactively from the `gamification-store` created in DUO-5. Design tokens from `docs/DESIGN-SYSTEM.md` — no neon, hairline borders, Inter typography. The HUD is sticky at the top of the `/learn` route.
DELIVERABLE: Create `apps/web/features/learning/components/learning-hud.tsx` — a sticky header component that reactively subscribes to `gamification-store` and renders: brand wordmark, streak pill (with freeze-shield tooltip), coherence energy counter (flashes on XP award), shield gauge (amber flash on decoherence hit), and learner profile dropdown menu with avatar, calibration telemetry summary, streak status, settings link, and sign-out. Mobile: compact icon + number layout per Section 4.1.
TEST: `pnpm test:web tests/unit/learning-hud.test.tsx` verifying HUD renders all 5 items from store state, shield display changes color/class when below 50%, streak pill renders correct day count, profile dropdown opens and closes, and HUD is aria-labeled for accessibility.
DEPENDS: DUO-5          UNBLOCKS: DUO-11
DEMO: The top bar of `/learn` shows live `🔥 4`, `⚡ 850`, `🛡️ 80%` values that update in real-time as the judge completes stages and makes predictions — the shield visibly drops to amber tint after a wrong answer.
PERSONA: Nova           STATUS: [x] done
BRANCH: `feat/duolingo-path/duo-6-telemetry-hud-profile`
PR: one card per PR; paste the TEST result and link any contract/version decision.

