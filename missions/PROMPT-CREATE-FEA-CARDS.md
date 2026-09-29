# Prompt: Generate & Assign Features Phase Task Cards (FEA-1 through FEA-N)

> **Instructions for the Executing Agent:**
> Copy and run this prompt in a fresh agent session (Antigravity, Claude Code, or OpenCode)
> to generate production-ready FEA task cards across all 6 team member mission files
> and update the mission map. Do NOT run this in the same session that wrote code.

---

```text
You are Orion, Lead Architect of Q-Trace operating inside the WarRoom hackathon framework.

## Mission Objective

Generate a complete set of atomic, executable task cards for the **Q-Trace Features Phase
(FEA-1 through FEA-N)**, covering the 5 differentiating features from `docs/FEATURES-SPEC.md`,
and distribute them across ALL 6 team members IRRESPECTIVE of their legacy roles.

## Context & Grounding Documents

Before taking ANY action, thoroughly read and strictly adhere to:

1. `docs/FEATURES-SPEC.md` — The canonical spec for all 5 features:
   - F1: Grover's Algorithm Unit (Module 2 Launch) — §1
   - F2: Quantum Invariant Linter — §2
   - F3: Tri-Engine Conformance Arena & Endianness Rosetta Stone — §3
   - F4: Q-Sphere + NISQ Noise Emulation — §4
   - F5: Socratic Counterexample Engine & Mutation Challenges — §5
   - Build dependency graph — §"Build Priority & Dependency Order"

2. `docs/FEATURE-DIFFERENTIATION.md` — Competitive context, why each feature exists,
   and the demo wow-moments each card must enable.

3. `board/STATUS.md` — Current project state, what is already merged, what is pending.

4. `apps/api/app/models/circuit.py` — Current GateName enum (H, X, Y, Z, CNOT, MEASURE only).
   Gate Model Expansion (FEA-1) extends this.

5. `apps/api/app/services/quantum/adapter.py`, `parser.py`, `normalizer.py`,
   `pennylane_adapter.py` — Existing backend quantum services to extend (not rewrite).

6. `apps/web/lib/curriculum/units-8-to-10.ts` — Existing Module 1 curriculum. Module 2
   starts with `module2-unit-2-1.ts` (FEA-3, FEA-4).

7. `apps/web/features/evidence/two-qubit-qsphere.tsx` — Already built; needs wiring (FEA-13).

8. `board/contracts/` — All 4 contracts. Gate expansion changes `circuit-simulation.md`;
   F5 grading adds a new `grading-assessment.md` contract.

9. `missions/MISSION-MAP.md` and existing mission files in `missions/` — Team roster,
   existing card format, load gates, branch conventions.

10. `.agents/rules/stack/quantum-runtime.md` and `.agents/rules/stack/quantum-ui.md` —
    Simulation safety and UI standards. All new quantum gates must pass runtime rules.

11. `docs/DESIGN-SYSTEM.md` — Design tokens for all new UI components.

12. `missions/AGENT-CARD-PROMPT.md` — The card execution protocol every member uses.

## Core Rule: "Irrespective of Legacy Roles"

DO NOT pigeonhole team members into old track silos.
DO NOT give only backend to Uday, only frontend to Venu, only AI to Rajeswari, only QA to Sohail.

Instead:
- The entire team is a unified full-stack pod building these 5 differentiating features.
- Load is HEAVIER than the DUO phase: target 3–4 cards per member, 6–8h total load each.
- Distribute backend (Python/FastAPI), frontend (Next.js/React/TypeScript), curriculum
  (TypeScript data), and test/QA cards across all 6 members so every member owns
  a visible, demoable piece of the Features Phase.

## The 6 Team Members & File Targets

1. **Vinod Krishna**   → `missions/vinod-krishna-mission.md`
2. **Venu Gopal**      → `missions/venu-gopal-mission.md`
3. **Uday Rohit**      → `missions/uday-rohit-mission.md`
4. **Rani**            → `missions/rani-mission.md`
5. **Rajeswari**       → `missions/rajeswari-mission.md`
6. **Sohail**          → `missions/sohail-mission.md`

## Card Numbering

Cards are numbered sequentially: **FEA-1, FEA-2, FEA-3, …** continuing the hackathon card
sequence after DUO-12. Do not reuse DUO numbers or SIM/UX/AI prefixes.

## Build Dependency Order (MUST respect this DAG)

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
  │         └──► FEA-11 (F4: Noise Toggle UI — lab page, Bloch contraction, purity label)     │
  │                                                                                             │
  └──► FEA-12 (Gate Palette & Glyph — CCX/CZ/S/T in gate-palette.tsx + gate-glyph.tsx)        │
  (parallel with other FEA cards)                                                               │
                                                                                               │
FEA-13 (F4: Q-Sphere Wiring — two-qubit-qsphere.tsx into lab/page.tsx) ──────────────────────┘
  (no dependency on FEA-1; two-qubit-qsphere.tsx already exists — just needs mounting)

FEA-14 (Cross-Feature Contract & Golden Fixtures — grading-assessment.md + golden fixtures
         for Grover, Linter, Conformance) ── depends on FEA-1, FEA-2, FEA-6, FEA-8
         ── UNBLOCKS: SHIP-6 re-run, final certify
```

Total: **14 cards** across 6 members (~2–3 per member).

## Card Distribution Plan (FEA-1 through FEA-14)

### Block A: Foundation (Assigned to: Vinod Krishna — Integration Owner)
- **FEA-1: Gate Model Expansion (CCX / CZ / S / T)**
  - The single unblocking card. Vinod owns because it touches shared backend contracts.
  - Load: 3h

- **FEA-12: Gate Palette & Glyph Renderer**
  - Frontend mirror of FEA-1. Add CCX/CZ/S/T tiles to gate-palette.tsx and gate-glyph.tsx.
  - Load: 2h

- **FEA-14: Cross-Feature Contracts & Golden Fixtures**
  - Update `board/contracts/circuit-simulation.md` (new gates + noise + conformance fields).
  - Create new `board/contracts/grading-assessment.md`.
  - Add 3 golden fixture files (grover_simulation_run, lint_warning_response, conformance_result).
  - Validate all fixtures with `scripts/validate_fixtures.py`.
  - Load: 2h

  **Vinod total: 3 cards / ~7h**

### Block B: F1 Grover Curriculum & Scrubber (Assigned to: Rajeswari — Curriculum Expert)
- **FEA-3: Grover Algorithm Curriculum — Module 2 Unit 2.1**
  - Create `apps/web/lib/curriculum/module2-unit-2-1.ts` with all 9 stages as defined in
    `docs/FEATURES-SPEC.md` §1.3: Oracle concept (2.1.1), Amplitude Amplification (2.1.2),
    Toffoli gate intro (2.1.3), Speedup table (2.1.4), CCX Gate Lab (2.1.5), Phase Oracle
    Lab (2.1.6), Prediction Checkpoint (2.1.7), Full Grover Circuit Lab (2.1.8), Boss (2.1.9).
  - Import and spread into `apps/web/lib/curriculum/all-stages.ts`.
  - Load: 4h

- **FEA-4: Grover Amplitude Scrubber UI Component**
  - Create `apps/web/features/evidence/grover-amplitude-scrubber.tsx`.
  - Horizontal scrubber mapped to `stateTrace` array. Signed amplitude bar chart.
  - Marked state |ω⟩ in Electric Cyan (#00D4FF). Mean amplitude dashed line.
  - Step labels: "Oracle Phase Flip", "Diffusion (Inversion About Mean)", etc.
  - Mount inside Stage 3 (Flight Recorder) in `/lab/page.tsx` when circuit uses CCX.
  - Load: 3h

  **Rajeswari total: 2 cards / ~7h**

### Block C: F2 Quantum Invariant Linter (Assigned to: Uday Rohit — Simulation API Expert)
- **FEA-2: Quantum Invariant Linter Backend**
  - Create `apps/api/app/services/quantum/linter.py` with 3 rules:
    - QI-1: Post-collapse unitary (gate after MEASURE on same qubit) → WARNING
    - QI-2: No-cloning violation attempt (double-CNOT superposition copy) → INFO
    - QI-3: Controlled gate wire collision (control == target) → ERROR
  - Extend `ParseQiskitResponse` model with `lintWarnings: list[LintWarning]`.
  - Add `POST /v1/circuits/lint` endpoint (standalone, 300ms debounce target).
  - All logic from `docs/FEATURES-SPEC.md` §2.3.
  - Load: 3h

- **FEA-5: Quantum Invariant Linter Frontend Integration**
  - Wire `POST /v1/circuits/lint` into `interactive-circuit-workspace.tsx` (debounced 300ms).
  - Show amber warning pills at top of affected wire column on canvas.
  - Highlight offending lines in `qiskit-code-editor.tsx` with amber wavy underline.
  - Show inline gutter ⚠ icon at offending line numbers.
  - All UX from `docs/FEATURES-SPEC.md` §2.3.
  - Load: 3h

  **Uday Rohit total: 2 cards / ~6h**

### Block D: F3 Tri-Engine Arena (Assigned to: Rani — Data & Analytics)
- **FEA-8: Cirq Adapter Backend**
  - Create `apps/api/app/services/quantum/cirq_adapter.py`.
  - Map `CircuitModel` → `cirq.Circuit` → `cirq.Simulator` → normalized statevector.
  - Use existing `normalizer.py` for big-endian → little-endian alignment.
  - Gate map: H/X/Y/Z/S/T → cirq.H/X/Y/Z/S/T; CNOT → cirq.CNOT; CCX → cirq.CCX; CZ → cirq.CZ.
  - Upgrade `POST /v1/simulation-runs` to accept `backends: ["qiskit", "pennylane", "cirq"]`.
  - Return `conformanceResults`, `conformanceDelta`, `conformanceBadge` in response.
  - All logic from `docs/FEATURES-SPEC.md` §3.2.
  - Load: 3h

- **FEA-9: Engine Selector UI + Conformance Badge + Endianness Rosetta Stone**
  - Add engine selector toggle row to `/lab/page.tsx` (Qiskit Aer / PennyLane / Cirq toggles).
  - Create `apps/web/features/circuit/conformance-badge.tsx` (green Δ=0.000000 / red diverged).
  - Create `apps/web/features/circuit/endianness-rosetta-stone.tsx` inline panel.
    Panel visible when non-Qiskit engine is selected. Shows |q₁q₀⟩ vs |q₀q₁⟩ notation
    with interactive toggle between Qiskit and Cirq statevector label ordering.
  - All UX from `docs/FEATURES-SPEC.md` §3.3.
  - Load: 3h

  **Rani total: 2 cards / ~6h**

### Block E: F4 Noise + Q-Sphere & F5 Socratic Engine (Assigned to: Venu Gopal — UX Expert)
- **FEA-10: NISQ Noise Model Backend**
  - Add `noise_preset: str | None` param to `adapter.py` `run_circuit()`.
  - Implement `"superconducting"` preset: thermal relaxation T₁=50μs / T₂=70μs, gate_time=50ns,
    readout error [[0.99, 0.01], [0.01, 0.99]] via `qiskit_aer.noise`.
  - Add `noisePreset` field to `POST /v1/simulation-runs` request body.
  - All logic from `docs/FEATURES-SPEC.md` §4.3.
  - Load: 2h

- **FEA-11: Noise Toggle UI + Bloch Contraction + Q-Sphere Wiring**
  - Add NISQ Noise toggle Switch to Visual Evidence stage in `/lab/page.tsx`.
  - On toggle: re-submit circuit with `noisePreset: "superconducting"`. Show brief loading state.
  - Add purity readout label below bloch-3d-sphere.tsx: `Purity: Tr(ρ²) = 0.847 [mixed state]`.
  - Mount `two-qubit-qsphere.tsx` in Visual Evidence stage (already built, needs wiring).
    Show Q-Sphere when `circuit.qubitCount >= 2`; Bloch sphere as subsystem view.
  - All UX from `docs/FEATURES-SPEC.md` §4.2 and §4.3.
  - Load: 3h

  **Venu Gopal total: 2 cards / ~5h**

### Block F: F5 Socratic Engine & /assess Route (Assigned to: Sohail — QA & Testing)
> Note: Sohail's QA expertise is deliberately inverted here — he now BUILDS the assessment
> engine rather than verifying it, owning the most novel feature in the platform.

- **FEA-6: Socratic Counterexample Grading Engine Backend**
  - Create `apps/api/app/services/grading/socratic_engine.py`:
    - 3 invariants: G-1 Entanglement Entropy, G-2 Phase Observability, G-3 Unitary Reversibility.
    - `generate_counterexample()` tests |0⟩, |1⟩, |+⟩ inputs against student vs target circuit.
    - Returns `CounterExample` with inputState, studentOutput, targetOutput, fidelity,
      invariantViolated, explanation.
  - Add `POST /v1/grading/assess` and `GET /v1/grading/assess/{attemptId}` endpoints.
  - Seed 4 mutation challenges in `seed.py`: CH_BELL_ENTANGLE, CH_PHASE_SUPER,
    CH_GROVER_2Q, CH_UNITARY_REV (see `docs/FEATURES-SPEC.md` §5.6).
  - All logic from `docs/FEATURES-SPEC.md` §5.2, §5.3, §5.5.
  - Load: 4h

- **FEA-7: /assess Route — Socratic Counterexample UI**
  - Create `apps/web/app/(app)/assess/page.tsx`.
  - Two-column layout (50/50): student circuit (read-only canvas) | target circuit (read-only canvas).
  - Flight Recorder divergence panel below: input state, step number, student output vs target output.
  - Invariant violation banner with human-readable explanation.
  - [Try Again] → navigates back to challenge. [View Hint] → expands hint panel.
  - Route params: `/assess?challengeId=<id>&attemptId=<id>`.
  - Data: `GET /v1/grading/assess/{attemptId}`.
  - All UX from `docs/FEATURES-SPEC.md` §5.4.
  - Load: 3h

  **Sohail total: 2 cards / ~7h**

---

## Required Task Card Template

Every card appended into the mission files MUST strictly adhere to this exact format:

```markdown
### FEA-N · Card Title [timebox: Xh]
CONTEXT: Detailed context citing docs/FEATURES-SPEC.md section + specific file paths involved.
Must reference the exact GateName enum change / adapter line range / component name from the spec.
DELIVERABLE: Specific new files created and existing files modified. Scope is closed — no extras.
TEST: Exact executable shell command. Examples:
  `uv run pytest apps/api/tests/unit/quantum/test_linter.py -v` (backend)
  `pnpm test:web tests/unit/grover-amplitude-scrubber.test.tsx` (frontend)
  `bash scripts/contract-check.sh` (contracts)
DEPENDS: FEA-X, FEA-Y          UNBLOCKS: FEA-A, FEA-B
DEMO: The exact visual or interactive behavior a judge experiences as a result of this card.
PERSONA: Orion / Nova / Forge / Warden           STATUS: [ ] ready
BRANCH: `feat/features-phase/fea-N-short-slug`
PR: one card per PR; paste the TEST result and link any contract/version decision.
```

IMPORTANT RULES FOR CARD WRITING:
- CONTEXT must cite the exact section number in `docs/FEATURES-SPEC.md` (e.g. "§2.3 Architecture")
  and the exact file paths and line ranges where relevant.
- DELIVERABLE must name every file created or modified — no vague "update X service".
- TEST must be a literally runnable shell command, not a description.
- DEMO must describe what a judge SEES or INTERACTS WITH — not what the code does internally.
- PERSONA must be a real WarRoom persona (Orion, Nova, Forge, Volt, Atlas, Sage, Warden, Patch, Herald).
- STATUS must be `[ ] ready` for all new cards.
- BRANCH must follow the pattern: `feat/features-phase/fea-N-short-slug`.

---

## Branch Map Pattern

Each mission file has a "Branch map" section. After appending the cards, ADD the new FEA branches
to each member's branch map table:

| Card | Branch | PR requirement |
|---|---|---|
| FEA-N | `feat/features-phase/fea-N-short-slug` | card TEST + fresh Warden verdict + contract check |

---

## Execution Steps

Execute these steps IN ORDER. Do not skip any step. Do not merge anything yourself.

### Step 1 — Pre-flight read (MANDATORY)
Read all 12 grounding documents listed above before generating a single card.
Confirm current STATUS.md state and that DUO-12 is the last completed phase.

### Step 2 — Generate the 14 cards
For each of the 14 FEA cards, produce the full card text using the Required Template above.
Cards must be internally consistent — DEPENDS / UNBLOCKS must match the DAG exactly.
Do not invent filenames not mentioned in `docs/FEATURES-SPEC.md`.

### Step 3 — Append cards to mission files (one atomic edit per file)
Append each member's assigned FEA cards to the END of their mission file,
after the last existing card section. Add a section header before the block:

```markdown
---

## Features Phase Cards (FEA)

> Appended at kickoff of the F1–F5 Differentiating Features Phase. All cards target
> files defined in docs/FEATURES-SPEC.md. Read that document before starting any FEA card.
```

Then append the card(s) for that member.

File → Cards to append:
- `missions/vinod-krishna-mission.md`   → FEA-1, FEA-12, FEA-14
- `missions/rajeswari-mission.md`       → FEA-3, FEA-4
- `missions/uday-rohit-mission.md`      → FEA-2, FEA-5
- `missions/rani-mission.md`            → FEA-8, FEA-9
- `missions/venu-gopal-mission.md`      → FEA-10, FEA-11
- `missions/sohail-mission.md`          → FEA-6, FEA-7

### Step 4 — Update branch map in each mission file
Add the new FEA branches to each member's "Branch map" table section.

### Step 5 — Update missions/MISSION-MAP.md
Append a new section at the bottom of MISSION-MAP.md following the exact DUO phase pattern:

```markdown
---

## Features Phase — FEA-1 through FEA-14

> Appended at kickoff of the F1–F5 Differentiating Features Phase.
> All 14 cards target brand-new files or isolated extensions defined in
> docs/FEATURES-SPEC.md — read it before starting any FEA card.

### Load Summary

| Member | FEA Cards | New Branches | Phase Load |
|---|---|---|---|
| Vinod Krishna  | FEA-1, FEA-12, FEA-14 | (3 branches) | ~7h |
| Rajeswari      | FEA-3, FEA-4          | (2 branches) | ~7h |
| Uday Rohit     | FEA-2, FEA-5          | (2 branches) | ~6h |
| Rani           | FEA-8, FEA-9          | (2 branches) | ~6h |
| Venu Gopal     | FEA-10, FEA-11        | (2 branches) | ~5h |
| Sohail         | FEA-6, FEA-7          | (2 branches) | ~7h |

### Dependency Chain

(paste the DAG from the "Build Dependency Order" section above)

### Discord Acceptance Lines — FEA Phase

(generate one acceptance line per member per card, matching the DUO phase format)
```

### Step 6 — Verify no syntax errors
Run `pnpm test:web` to ensure no TypeScript or lint errors were introduced by any
`.ts` / `.tsx` file additions. Run `bash scripts/contract-check.sh` to verify contracts.

### Step 7 — Report

Output a final summary containing:
- Table of all 14 FEA cards with owner, timebox, branch name, and DEPENDS/UNBLOCKS
- The full dependency DAG as a mermaid flowchart
- The Discord acceptance lines block (copy-paste ready)
- Any contradictions found in FEATURES-SPEC.md vs the current codebase
- The safe parallel execution groups (which cards can run in parallel after FEA-1)
```

---

## Quick Reference — 6 Team Members & Their FEA Cards

| Member | FEA Cards | Features Touched | Total Load |
|---|---|---|---|
| Vinod Krishna | FEA-1 · FEA-12 · FEA-14 | Gate Model Expansion (F1+F2+F3+F5 unblock) · Gate Palette UI · Contracts & Fixtures | ~7h |
| Rajeswari | FEA-3 · FEA-4 | F1 Grover Curriculum · F1 Grover Amplitude Scrubber | ~7h |
| Uday Rohit | FEA-2 · FEA-5 | F2 Linter Backend · F2 Linter Frontend | ~6h |
| Rani | FEA-8 · FEA-9 | F3 Cirq Adapter · F3 Engine Selector + Rosetta Stone | ~6h |
| Venu Gopal | FEA-10 · FEA-11 | F4 Noise Backend · F4 Noise UI + Q-Sphere Wiring | ~5h |
| Sohail | FEA-6 · FEA-7 | F5 Grading Engine · F5 /assess Route | ~7h |

**Total: 14 cards · ~38h combined · ~6.3h avg per member**

> [!IMPORTANT]
> FEA-1 (Gate Model Expansion, owned by Vinod) is the **critical path gate**.
> No other FEA card except FEA-13 (Q-Sphere wiring, already-built component)
> and FEA-6/FEA-7 dependency on FEA-1 should START before FEA-1 is merged to main.
> After FEA-1 merges: FEA-2, FEA-3, FEA-6, FEA-8, FEA-10, FEA-12 all fan out in parallel.
