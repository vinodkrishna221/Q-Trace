# Mission — Rani · Learning data, progress and instructor analytics

> Context capsule: this file + the repo = everything needed in any tool, cold.
> ACCEPTED: [x] **Rani ticks this after reading; unaccepted by the next 4-hour standup is reassigned by Vinod.**

## The project in 30 seconds

**Q-Trace** is an AI-assisted quantum learning platform where Aarav or Meera learns, predicts, builds, simulates, sees and repairs a circuit. The live Bell-state path runs through real Qiskit evidence. **Quantum Flight Recorder** finds the first gate where the learner’s mental model diverged, the evidence-bound Tutor explains it, and a Repair Challenge updates Progress and Instructor Insight. The internal prototype must work from one laptop without cloud AI, Atlas or venue internet.

## Your mission

**Goal:** Provide deterministic content/learner seeds, venue-safe repositories, atomic progress updates and honest aggregate Instructor Insights.
**Victory =** your seeded demo beats are green · every card test passes · every card branch receives fresh-session Warden review · PRs merge in DAG order · the local smoke path remains green.
**Declared availability:** 48h · **Mission card load:** 18h (37.5%) · **70% cap:** 33.6h · **Buffer:** 30h — PASS.
**First card:** `DATA-1` · **First branch:** `feat/data-analytics/data-1-define-repositories-and-the-in`.
**Recommended tool:** Claude Code/OpenCode for FastAPI/Mongo; fresh Warden session for every PR.

## File boundary

**Owns:** `apps/api/app/repositories/**`, `routers/learning.py`, `progress.py`, `instructor.py`, `scripts/seed.py`, and `apps/api/tests/unit/data/**`.
**Never touch silently:** another mission’s implementation or unit-test surface; contracts change only through version bump + DECISIONS + Discord ping.

## Rules and frozen inputs

Load: core four · mongodb.md · fastapi.md · learning-content.md · progress-analytics.md · SCHEMA.md.
Always read `board/STATUS.md`, your phase plan, `docs/PRD.md`, `docs/ARCHITECTURE.md` and the relevant contract before taking a card.
Start every card in a fresh session by copying `missions/AGENT-CARD-PROMPT.md` and replacing only `MEMBER_NAME` and `CARD_ID`. The prompt enforces identity, ownership, dependency, branch and TEST gates.

## Branch map

| Card | Branch | PR requirement |
|---|---|---|
| DATA-1 | `feat/data-analytics/data-1-define-repositories-and-the-in` | card TEST + fresh Warden verdict + contract check |
| DATA-2 | `feat/data-analytics/data-2-seed-learner-content-and-challenge` | card TEST + fresh Warden verdict + contract check |
| DATA-3 | `feat/data-analytics/data-3-persist-challenge-attempts-and-progress` | card TEST + fresh Warden verdict + contract check |
| DATA-4 | `feat/data-analytics/data-4-implement-mongo-collections-and-indexes` | card TEST + fresh Warden verdict + contract check |
| DATA-5 | `feat/data-analytics/data-5-seed-the-synthetic-cohort-and` | card TEST + fresh Warden verdict + contract check |
| DATA-6 | `feat/data-analytics/data-6-prove-repository-parity-and-deploy` | card TEST + fresh Warden verdict + contract check |
| DATA-7 | `feat/data-analytics/data-7-harden-analytics-aggregation-and-idempotency` | card TEST + fresh Warden verdict + contract check |
| DATA-8 | `feat/data-analytics/data-8-freeze-schema-and-polish-edge` | card TEST + fresh Warden verdict + contract check |

## Your cards — verbatim from `plans/data-analytics-phase-plan.md`

### DATA-1 · Define repositories and the in-memory demo store                        [timebox: 1h]
CONTEXT: The API shell path exists after SHIP-1. Load SCHEMA, learning/progress contracts and Mongo pack. P0 consumers need persistence without Atlas.
DELIVERABLE: Create typed repository protocols, dependency selector and deterministic in-memory implementations for profiles, paths, modules, runs/signals, challenges/attempts and progress.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/data/test_memory_repository.py` resets twice to identical IDs and proves create/get plus atomic progress update primitives.
DEPENDS: SHIP-1          UNBLOCKS: SIM-4,DATA-2
DEMO: Plumbing for every P0 endpoint and the venue-safe store.
PERSONA: Atlas           STATUS: [x] done
BRANCH: `feat/data-analytics/data-1-define-repositories-and-the-in`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DATA-2 · Seed learner, content and challenge truth                        [timebox: 3h]
CONTEXT: Repository protocol exists. Load PRD vocabulary, SCHEMA seed plan and learning/progress contracts. Seed content is vetted and idempotent.
DELIVERABLE: Add Aarav, Meera, Dr. Rao session metadata, three Modules, two Learning Paths, Bell Prediction Checkpoint, starter/broken circuits, quiz, Repair Challenge and initial Progress Records.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/data/test_core_seed.py` seeds twice with no duplicates and retrieves every ID referenced by the contracts.
DEPENDS: DATA-1          UNBLOCKS: AI-3,DATA-3
DEMO: The prototype opens with all three users and a coherent Bell learning journey.
PERSONA: Atlas           STATUS: [x] done
BRANCH: `feat/data-analytics/data-2-seed-learner-content-and-challenge`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DATA-3 · Persist Challenge Attempts and progress atomically                        [timebox: 2h]
CONTEXT: Core seeds exist; diagnosis may still use fixtures. Load progress contract and keep grading deterministic outside the repository.
DELIVERABLE: Implement Challenge, Attempt, Progress and Instructor routers/services using the repository protocol, idempotency key and atomic attempt + Progress Record update.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/data/test_progress_flow.py` posts a passing Bell attempt twice and proves one attempt, one 100-point increment and updated Instructor Insight.
DEPENDS: DATA-2          UNBLOCKS: UX-4,DATA-4,QA-3,QA-5
DEMO: Aarav’s repair visibly changes progress and Dr. Rao’s aggregate proof.
PERSONA: Atlas           STATUS: [ ] todo
BRANCH: `feat/data-analytics/data-3-persist-challenge-attempts-and-progress`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DATA-4 · Implement Mongo collections and indexes                        [timebox: 3h]
CONTEXT: DATA-3 proves in-memory behavior and SCHEMA v1 is frozen. Load `mongodb.md`, `SCHEMA.md`, `learning-content.md` and `progress-analytics.md`; do not leak ObjectId across contracts.
DELIVERABLE: Add async Mongo repository, collection getters, schemaVersion guards and idempotent indexes for every documented demo query.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/data/test_mongo_repository.py` runs repository parity against isolated Mongo and verifies required index names.
DEPENDS: DATA-3          UNBLOCKS: DATA-5
DEMO: The live platform persists learner and simulation history credibly.
PERSONA: Atlas           STATUS: [ ] todo
BRANCH: `feat/data-analytics/data-4-implement-mongo-collections-and-indexes`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DATA-5 · Seed the synthetic cohort and complete Learning Paths                        [timebox: 3h]
CONTEXT: DATA-4 makes Mongo and memory share a repository protocol. Load the SCHEMA seed plan, `learning-content.md`, `progress-analytics.md` and synthetic-data disclosure; preserve stable hero IDs.
DELIVERABLE: Create deterministic 30-profile cohort, 60–90 attempts, 35–50 misconception signals, path variants and edge rows while preserving the same hero records in both stores.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/data/test_demo_seed_story.py` proves exact counts/ranges, idempotency, disclosure text and Aarav live-attempt override.
DEPENDS: DATA-4          UNBLOCKS: UX-6,AI-7,DATA-6
DEMO: Instructor charts look populated while clearly disclosing synthetic data.
PERSONA: Atlas           STATUS: [ ] todo
BRANCH: `feat/data-analytics/data-5-seed-the-synthetic-cohort-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DATA-6 · Prove repository parity and deploy Atlas seeds                        [timebox: 2h]
CONTEXT: DATA-5 and QA-3 make P1 repositories and P0 smoke green. Load `mongodb.md`, repository unit tests, `.env.example` names and deploy-runbook; Atlas credentials stay outside git and local mode remains primary fallback.
DELIVERABLE: Run one behavioral contract suite against memory and Atlas, add seed/pre-warm commands and document safe environment selection.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/data/test_repository_contract.py` passes both backends; `uv run --project apps/api python apps/api/scripts/seed.py --check` reports the same hero IDs.
DEPENDS: DATA-5,QA-3          UNBLOCKS: SIM-7,DATA-7,SHIP-6
DEMO: The cloud demo and laptop demo tell the same story.
PERSONA: Atlas           STATUS: [ ] todo
BRANCH: `feat/data-analytics/data-6-prove-repository-parity-and-deploy`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DATA-7 · Harden analytics aggregation and idempotency                        [timebox: 2h]
CONTEXT: DATA-6 and AI-4 provide deployed cohort seeds and Misconception Signals. Load `progress-analytics.md`, SCHEMA query/index notes and idempotency fixtures; keep Instructor Insight computed, not a second persisted truth.
DELIVERABLE: Implement indexed aggregation, 10-second cache, empty cohort response, live-demo learner marker and concurrent idempotency test for Challenge Attempts.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/data/test_instructor_analytics.py` verifies rates, top misconception counts, empty cohort and no double score under concurrent duplicate requests.
DEPENDS: DATA-6,AI-4          UNBLOCKS: UX-7,DATA-8,QA-6
DEMO: Dr. Rao sees fast, consistent analytics after Aarav’s live repair.
PERSONA: Atlas           STATUS: [ ] todo
BRANCH: `feat/data-analytics/data-7-harden-analytics-aggregation-and-idempotency`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DATA-8 · Freeze schema and polish edge states                        [timebox: 2h]
CONTEXT: Release gate is green and schema changes are now expensive. No new collection or field without a contract bump.
DELIVERABLE: Lock schemaVersion/index list, verify long/empty/failed rows, add data reset/pre-warm runbook and mark synthetic records in every instructor response.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/data/test_schema_freeze.py` snapshots field/index names and verifies all edge responses match contracts.
DEPENDS: DATA-7,QA-7          UNBLOCKS: —
DEMO: The demo never reveals empty mystery cards or undisclosed synthetic analytics.
PERSONA: Atlas           STATUS: [ ] todo
BRANCH: `feat/data-analytics/data-8-freeze-schema-and-polish-edge`
PR: one card per PR; paste the TEST result and link any contract/version decision.

## Contracts

**You OWN:** board/contracts/learning-content.md · board/contracts/progress-analytics.md.
**You CONSUME:** circuit-simulation.md for Simulation Run references · flight-recorder-tutor.md for Misconception Signal codes.

## Cross-mission WAITS-ON and mock paths

- `DATA-1` waits on **Vinod Krishna / SHIP-1** for live integration — mock path: The in-memory repository is P0 and contract-complete; Atlas is an explicit P2 parity swap, never a prerequisite.
- `DATA-6` waits on **Akshaya / QA-3** for live integration — mock path: The in-memory repository is P0 and contract-complete; Atlas is an explicit P2 parity swap, never a prerequisite.
- `DATA-7` waits on **Rajeswari / AI-4** for live integration — mock path: The in-memory repository is P0 and contract-complete; Atlas is an explicit P2 parity swap, never a prerequisite.
- `DATA-8` waits on **Akshaya / QA-7** for live integration — mock path: The in-memory repository is P0 and contract-complete; Atlas is an explicit P2 parity swap, never a prerequisite.

## Shared pitch beat

Explain learner progress, synthetic cohort disclosure, Instructor Insight, privacy choice not to store Tutor free text and memory/Atlas parity.

## Sync expectations

- Push at least every 60 minutes; one card per branch/PR.
- Discord is the canonical record: post `ACCEPTED`, four-hour standups, blockers, contract-change pings and PR links there.
- WhatsApp is urgent-only: blocked critical path, venue/power/network issue or voice handoff. Copy the resulting decision back to Discord/DECISIONS.
- Standups: 10:00 / 14:00 / 18:00 / 22:00 IST daily. Read `board/STATUS.md` first; post `OFFSHIFT` when unavailable.
- Blocked >20 minutes: add STATUS blocker + Discord ping Vinod + move to the next dependency-safe card. Silent hero-debugging is banned.
- Every PR gets a fresh-session Warden review. Akshaya coordinates release evidence but is not the only reviewer.
- Contract change: edit contract → bump version/changelog → DECISIONS entry → ping consumers in Discord → then change code.

## Acceptance

- [x] I, **Rani**, accept this mission, the 18h card load, file boundary, first branch and shared pitch beat.
- [x] I have opened the first card in a fresh agent session and confirmed its TEST command is executable from the repo.
- [x] I posted `ACCEPTED — Learning data, progress and instructor analytics — starting DATA-1 — feat/data-analytics/data-1-define-repositories-and-the-in` in Discord.
