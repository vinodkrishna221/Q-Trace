# Mission — Rajeswari · Flight Recorder diagnosis and evidence-bound Tutor

> Context capsule: this file + the repo = everything needed in any tool, cold.
> ACCEPTED: [ ] **Rajeswari ticks this after reading; unaccepted by the next 4-hour standup is reassigned by Vinod.**

## The project in 30 seconds

**Q-Trace** is an AI-assisted quantum learning platform where Aarav or Meera learns, predicts, builds, simulates, sees and repairs a circuit. The live Bell-state path runs through real Qiskit evidence. **Quantum Flight Recorder** finds the first gate where the learner’s mental model diverged, the evidence-bound Tutor explains it, and a Repair Challenge updates Progress and Instructor Insight. The internal prototype must work from one laptop without cloud AI, Atlas or venue internet.

## Your mission

**Goal:** Make Q-Trace diagnose misconceptions deterministically and explain only verified simulator evidence while retaining a complete offline Tutor fallback.
**Victory =** your seeded demo beats are green · every card test passes · every card branch receives fresh-session Warden review · PRs merge in DAG order · the local smoke path remains green.
**Declared availability:** 48h · **Mission card load:** 18h (37.5%) · **70% cap:** 33.6h · **Buffer:** 30h — PASS.
**First card:** `AI-1` · **First branch:** `feat/ai-pedagogy/ai-1-define-deterministic-misconception-rules`.
**Recommended tool:** Claude Code/OpenCode for Python/AI services; fresh Warden session for every PR.

## File boundary

**Owns:** `apps/api/app/routers/flight_recorder.py`, `tutor.py`, `services/diagnosis/**`, `services/tutor/**`, `prompts/**`, and `apps/api/tests/unit/ai/**`.
**Never touch silently:** another mission’s implementation or unit-test surface; contracts change only through version bump + DECISIONS + Discord ping.

## Rules and frozen inputs

Load: core four · ai-llm.md · quantum-runtime.md · flight-recorder-tutor.md · circuit-simulation.md · progress-analytics.md.
Always read `board/STATUS.md`, your phase plan, `docs/PRD.md`, `docs/ARCHITECTURE.md` and the relevant contract before taking a card.
Start every card in a fresh session by copying `missions/AGENT-CARD-PROMPT.md` and replacing only `MEMBER_NAME` and `CARD_ID`. The prompt enforces identity, ownership, dependency, branch and TEST gates.

## Branch map

| Card | Branch | PR requirement |
|---|---|---|
| AI-1 | `feat/ai-pedagogy/ai-1-define-deterministic-misconception-rules` | card TEST + fresh Warden verdict + contract check |
| AI-2 | `feat/ai-pedagogy/ai-2-expose-flight-recorder-diagnosis-and` | card TEST + fresh Warden verdict + contract check |
| AI-3 | `feat/ai-pedagogy/ai-3-ship-the-evidence-bound-tutor` | card TEST + fresh Warden verdict + contract check |
| AI-4 | `feat/ai-pedagogy/ai-4-complete-the-misconception-taxonomy-and` | card TEST + fresh Warden verdict + contract check |
| AI-5 | `feat/ai-pedagogy/ai-5-add-the-optional-structured-tutor` | card TEST + fresh Warden verdict + contract check |
| AI-6 | `feat/ai-pedagogy/ai-6-prove-cloud-and-fallback-parity` | card TEST + fresh Warden verdict + contract check |
| AI-7 | `feat/ai-pedagogy/ai-7-recommend-the-next-module-from` | card TEST + fresh Warden verdict + contract check |
| AI-8 | `feat/ai-pedagogy/ai-8-polish-anti-copy-guidance-and` | card TEST + fresh Warden verdict + contract check |
| DUO-7 | `feat/duolingo-curriculum/duo-7-foundations-units-1-3` | card TEST + fresh Warden verdict + contract check |
| DUO-8 | `feat/duolingo-curriculum/duo-8-single-qubit-gates-qrng` | card TEST + fresh Warden verdict + contract check |

## Your cards — verbatim from `plans/ai-pedagogy-phase-plan.md`

### AI-1 · Define deterministic misconception rules ⭐ ⭐                        [timebox: 2h]
CONTEXT: The PRD freezes the Bell prediction and misconception vocabulary. Load `flight-recorder-tutor.md`, `circuit-simulation.md` and `quantum-runtime.md`. This logic must not call an LLM.
DELIVERABLE: Create versioned diagnosis rule data and pure functions for `SUPERPOSITION_VS_ENTANGLEMENT`, `MEASUREMENT_DETERMINISM`, `GATE_ORDER` and `NO_SIGNAL`, including first-divergence evidence keys.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/ai/test_diagnosis_rules.py` maps all seeded predictions/traces to expected codes and never emits an unknown evidence key.
DEPENDS: —          UNBLOCKS: AI-2
DEMO: Creates the reliable intellectual engine behind the Flight Recorder.
PERSONA: Sage           STATUS: [x] done
BRANCH: `feat/ai-pedagogy/ai-1-define-deterministic-misconception-rules`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### AI-2 · Expose Flight Recorder diagnosis and replay                        [timebox: 2h]
CONTEXT: AI-1 provides pure rules; Simulation Run may still be a contract fixture. Load flight-recorder contract and keep the endpoint deterministic.
DELIVERABLE: Implement diagnosis service/router, persisted Misconception Signal via repository protocol, two-step replay headlines and contract errors for missing prediction/trace.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/ai/test_flight_recorder_route.py` posts the Bell fixture and returns firstDivergenceStep=1 plus the repair challenge ID.
DEPENDS: AI-1          UNBLOCKS: AI-3
DEMO: The UI can reveal exactly where Aarav’s understanding diverged.
PERSONA: Sage           STATUS: [x] done
BRANCH: `feat/ai-pedagogy/ai-2-expose-flight-recorder-diagnosis-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### AI-3 · Ship the evidence-bound Tutor fallback                        [timebox: 2h]
CONTEXT: Diagnosis and seeded Challenge exist. Load AI pack and Tutor contract. P0 must work with no provider key.
DELIVERABLE: Implement curated Bell explanation, evidence-key validator, fallbackUsed/model metadata and deterministic Repair Challenge selection; do not persist free text.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/ai/test_tutor_fallback.py` validates both numerical evidence keys and rejects a fabricated probability claim.
DEPENDS: AI-2,DATA-2          UNBLOCKS: UX-4,AI-4,QA-3
DEMO: Aarav receives an immediate grounded explanation and repair task offline.
PERSONA: Sage           STATUS: [x] done
BRANCH: `feat/ai-pedagogy/ai-3-ship-the-evidence-bound-tutor`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### AI-4 · Complete the misconception taxonomy and replay copy                        [timebox: 3h]
CONTEXT: P0 handles one seeded error. Load live State Trace shape and vetted module content; preserve deterministic code selection.
DELIVERABLE: Add rules/tests for measurement determinism and gate order, learner-level replay copy for Aarav/Meera, no-signal behavior and explanation templates that distinguish representation from physical trajectory.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/ai/test_taxonomy_matrix.py` covers every prediction option, code and learner role with no unhandled branch.
DEPENDS: AI-3,SIM-4          UNBLOCKS: AI-5,AI-7,DATA-7,QA-5
DEMO: The Flight Recorder remains useful beyond a single hard-coded sentence.
PERSONA: Sage           STATUS: [x] done
BRANCH: `feat/ai-pedagogy/ai-4-complete-the-misconception-taxonomy-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### AI-5 · Add the optional structured Tutor provider                        [timebox: 3h]
CONTEXT: AI-4 makes deterministic fallback and taxonomy complete. Load `ai-llm.md`, `flight-recorder-tutor.md`, evidence-key fixtures and environment flag names; provider credentials/model are environment-selected and never assumed.
DELIVERABLE: Implement one provider adapter interface, structured response schema, timeout/retry, prompt files, evidence injection and post-generation numerical-claim validation; fallback on any failure.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/ai/test_tutor_provider_contract.py` uses a fake provider for success, malformed output, timeout and 429; every failure returns the curated fallback.
DEPENDS: AI-4          UNBLOCKS: AI-6
DEMO: When configured, judges see contextual AI without gambling the demo on it.
PERSONA: Sage           STATUS: [x] done
BRANCH: `feat/ai-pedagogy/ai-5-add-the-optional-structured-tutor`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### AI-6 · Prove cloud and fallback parity                        [timebox: 2h]
CONTEXT: AI-5 and SHIP-4 provide the provider adapter and deployment shell. Load `ai-llm.md`, `flight-recorder-tutor.md` and cloud/fallback fixture IDs; learner-facing meaning must stay constant across modes.
DELIVERABLE: Add parity fixtures, provider/fallback badges, redacted telemetry and a drill script that forces timeout/rate-limit/fallback transitions.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/ai/test_cloud_fallback_parity.py` proves both modes cite the same trace steps and repair challenge.
DEPENDS: AI-5,SHIP-4          UNBLOCKS: UX-7,AI-8,QA-6
DEMO: The team can deliberately demonstrate resilience if judges question AI reliability.
PERSONA: Sage           STATUS: [x] done
BRANCH: `feat/ai-pedagogy/ai-6-prove-cloud-and-fallback-parity`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### AI-7 · Recommend the next Module from verified outcomes                        [timebox: 2h]
CONTEXT: AI-4 and DATA-5 provide the misconception taxonomy, Learning Paths and seeded Progress Records. Load `learning-content.md` and `progress-analytics.md`; this SHOULD scope is deterministic, not autonomous planning.
DELIVERABLE: Implement a small rules table mapping Challenge outcome + latest Misconception Signal to next Module/reason; expose it through existing progress response or feature-flag it off.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/ai/test_recommendation_rules.py` covers pass/fail/no-signal combinations and returns only known Module IDs.
DEPENDS: AI-4,DATA-5          UNBLOCKS: —
DEMO: The platform demonstrates personalized progression without opaque AI decisions.
PERSONA: Sage           STATUS: [x] done
BRANCH: `feat/ai-pedagogy/ai-7-recommend-the-next-module-from`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### AI-8 · Polish anti-copy guidance and judge explanations                        [timebox: 2h]
CONTEXT: AI-6 and QA-7 have release-gated Tutor modes. Load `ai-llm.md`, `flight-recorder-tutor.md`, the approved demo script and Warden findings; change no models, providers, codes or contracts.
DELIVERABLE: Tighten prompts/fallback copy so hints precede answers, add safety notes, prepare eight ≤20-second technical answers and verify no stored free-text logs.
TEST: `uv run --project apps/api pytest apps/api/tests/unit/ai/test_pedagogy_release.py` scans responses/log fixtures for uncited numbers, answer leakage and persisted learner questions.
DEPENDS: AI-6,QA-7          UNBLOCKS: —
DEMO: Judges hear a defensible “AI guides reasoning; it does not do the exercise” answer.
PERSONA: Sage           STATUS: [x] done
BRANCH: `feat/ai-pedagogy/ai-8-polish-anti-copy-guidance-and`
PR: one card per PR; paste the TEST result and link any contract/version decision.

## Contracts

**You OWN:** board/contracts/flight-recorder-tutor.md.
**You CONSUME:** circuit-simulation.md for immutable State Trace evidence · learning-content.md for vetted Module context · progress-analytics.md for repair outcomes.

## Cross-mission WAITS-ON and mock paths

- `AI-3` waits on **Rani / DATA-2** for live integration — mock path: Use the QA Bell Simulation Run/State Trace fixture until SIM-4 is live; diagnosis rules never wait on an LLM or simulator call.
- `AI-4` waits on **Uday Rohit / SIM-4** for live integration — mock path: Use the QA Bell Simulation Run/State Trace fixture until SIM-4 is live; diagnosis rules never wait on an LLM or simulator call.
- `AI-6` waits on **Vinod Krishna / SHIP-4** for live integration — mock path: Use the QA Bell Simulation Run/State Trace fixture until SIM-4 is live; diagnosis rules never wait on an LLM or simulator call.
- `AI-7` waits on **Rani / DATA-5** for live integration — mock path: Use the QA Bell Simulation Run/State Trace fixture until SIM-4 is live; diagnosis rules never wait on an LLM or simulator call.
- `AI-8` waits on **Akshaya / QA-7** for live integration — mock path: Use the QA Bell Simulation Run/State Trace fixture until SIM-4 is live; diagnosis rules never wait on an LLM or simulator call.

## Shared pitch beat

Explain the first-divergence logic, closed misconception taxonomy, why AI cannot invent quantum numbers and how fallback/cloud Tutor parity protects the demo.

## Sync expectations

- Push at least every 60 minutes; one card per branch/PR.
- Discord is the canonical record: post `ACCEPTED`, four-hour standups, blockers, contract-change pings and PR links there.
- WhatsApp is urgent-only: blocked critical path, venue/power/network issue or voice handoff. Copy the resulting decision back to Discord/DECISIONS.
- Standups: 10:00 / 14:00 / 18:00 / 22:00 IST daily. Read `board/STATUS.md` first; post `OFFSHIFT` when unavailable.
- Blocked >20 minutes: add STATUS blocker + Discord ping Vinod + move to the next dependency-safe card. Silent hero-debugging is banned.
- Every PR gets a fresh-session Warden review. Akshaya coordinates release evidence but is not the only reviewer.
- Contract change: edit contract → bump version/changelog → DECISIONS entry → ping consumers in Discord → then change code.

## Acceptance

- [ ] I, **Rajeswari**, accept this mission, the 18h card load, file boundary, first branch and shared pitch beat.
- [ ] I have opened the first card in a fresh agent session and confirmed its TEST command is executable from the repo.
- [ ] I posted `ACCEPTED — <mission> — starting <card> — <branch>` in Discord.

---

## Duolingo Curriculum Phase Cards

### DUO-7 · Curriculum Registry & Stage Data Engine for Units 1.1 to 1.3 [timebox: 4h]
CONTEXT: Per `docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md` Section 3 (Deep-Dive Lesson Breakdown), Units 1.1 through 1.3 define 9 stages covering: "What is Quantum?" (Stage 1.1.1 `mod1_transistor_limits` — Moore's Law, 1.1.2 `mod1_wave_particle` — double-slit, 1.1.3 `mod1_discrete_quanta` — energy quantization), "Bit vs Qubit" (1.2.1 `mod1_bit_vs_qubit` — spinning coin, 1.2.2 `mod1_braket_notation` — Dirac notation, 1.2.3 `mod1_amplitudes_normalization` — normalization), and "Superposition & Collapse" (1.3.1 `mod1_superposition_truth` — busting the myth, 1.3.2 `mod1_measurement_collapse` — polarized sunglasses lab, 1.3.3 `mod1_born_rule` — squaring amplitudes). Each stage has the 5-beat structure (analogy, concept, prediction checkpoint, simulation evidence, flight recorder). Stage data must conform to `board/contracts/learning-content.md` (`ModuleDetail`, `LearnerProfile`, `LearningPath` types).
DELIVERABLE: Create `apps/web/lib/curriculum/units-1-to-3.ts` implementing a typed `CurriculumStage[]` array for all 9 stages across Units 1.1–1.3, each with: `id`, `lessonId`, `unitId`, `archetype` (NODE_CONCEPT | NODE_PREDICTION | NODE_GATE_LAB), `title`, `estimatedMinutes`, `coherenceReward`, `analogyHook`, `conceptSummary`, `predictionCheckpoint` (options array with correct flag), and `misconceptionHandled`.
TEST: `pnpm test:web tests/unit/curriculum-units-1-to-3.test.ts` validating all 9 stages are present, `|α|² + |β|² = 1` normalization checkpoint options parse correctly, prediction checkpoint correct flags are mutually exclusive (exactly one correct per stage), and all stage IDs match the lessonId slugs from the curriculum spec.
DEPENDS: —          UNBLOCKS: DUO-8, DUO-11
DEMO: The `/learn` path populates Units 1.1–1.3 with real pedagogical content — the "Why Quantum?" transistor stage, the spinning coin bit/qubit analogy, and the polarized sunglasses measurement collapse lab — as learnable ChamberNodes.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/duolingo-curriculum/duo-7-foundations-units-1-3`
PR: one card per PR; paste the TEST result and link any contract/version decision.

### DUO-8 · Single-Qubit Gate Chambers & QRNG Boss Milestone (Units 1.4 to 1.5) [timebox: 4h]
CONTEXT: Per `docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md` Section 3, Units 1.4 (Bloch Sphere — 3 stages: `mod1_bloch_sphere_intro`, `mod1_bloch_coordinates`, `mod1_bloch_sandbox`) and 1.5 (Single-Qubit Gates — 7 stages: `mod1_gate_x`, `superposition`, `mod1_gate_h_reversibility`, `mod1_gate_z`, `mod1_gate_y`, `mod1_phase_gates_s_t`, `mod1_boss_qrng`) covering 10 total stages. Stage 1.5.2 `superposition` maps to existing route `/learn/superposition`. Stage 1.5.7 `mod1_boss_qrng` is a `NODE_MILESTONE` archetype (Boss) requiring: circuit on Qiskit Aer with 1024 shots, all 4 outcomes in [20%, 30%] tolerance, zero CNOT. Gate truth tables: X matrix [[0,1],[1,0]], H matrix [[1,1],[1,-1]]/√2, Z matrix [[1,0],[0,-1]], S matrix [[1,0],[0,i]], T matrix [[1,0],[0,e^(iπ/4)]]. H·H = I reversibility prediction checkpoint and Z phase invisibility to direct measurement.
DELIVERABLE: Create `apps/web/lib/curriculum/units-4-to-5.ts` implementing a typed `CurriculumStage[]` for all 10 stages in Units 1.4–1.5, including 3D Bloch sphere stage metadata (θ/φ coordinate explanations), Pauli gate matrix definitions, H reversibility prediction checkpoint with options `DETERMINISTIC_0` / `RANDOM_50_50` / `ALWAYS_1`, Z phase flip insight, S/T gate quarter/eighth-turn descriptions, and the QRNG Boss capstone with acceptance criteria (fidelity thresholds and shot counts).
TEST: `pnpm test:web tests/unit/curriculum-units-4-to-5.test.ts` verifying all 10 stages present, `superposition` lessonId maps to existing route, QRNG boss has `NODE_MILESTONE` archetype, H reversibility checkpoint has exactly `DETERMINISTIC_0` as the correct answer, and statevector fidelity acceptance criteria (`F >= 0.99` for boss) is included in stage metadata.
DEPENDS: DUO-7          UNBLOCKS: DUO-9, DUO-11
DEMO: The path shows the Bloch sphere compass, Hadamard gate chamber, and Unit 1 Boss QRNG capstone — the judge can tap the QRNG boss to see the synthesis challenge requiring 2 random bits with 25% distribution.
PERSONA: Forge           STATUS: [x] done
BRANCH: `feat/duolingo-curriculum/duo-8-single-qubit-gates-qrng`
PR: one card per PR; paste the TEST result and link any contract/version decision.

