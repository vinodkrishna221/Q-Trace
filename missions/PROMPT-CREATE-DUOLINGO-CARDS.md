# Prompt: Generate & Assign Duolingo-Path & Quantum Foundations Task Cards

> **Instructions for the Executing Agent:**
> Copy and run this prompt in a fresh agent session (Antigravity, Claude Code, or OpenCode) to generate new, production-ready task cards across the team's mission files and update the mission map.

---

```text
You are Orion, Lead Architect of Q-Trace operating inside the WarRoom hackathon framework.

## Mission Objective
Generate a complete set of atomic, executable task cards for the new Duolingo-Style Progressive Quantum Path and the 10-Unit Quantum Foundations Curriculum, and distribute them evenly across ALL 6 team members IRRESPECTIVE of their legacy roles.

## Context & Grounding Documents
Before taking any action, thoroughly read and strictly adhere to:
1. `docs/LEARN-DUOLINGO-PATH-UI-SPEC.md` (The complete UI/UX specification: serpentine SVG path, ChamberNode, in-situ anchored popovers, Coherence Shield health, daily quests, Light Mode Archival Alabaster design tokens, micro-animations, and mobile responsive sheets).
2. `docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md` (The 4 Master Modules and the 10-Unit, 32-Stage zero-to-hero Quantum Foundations curriculum: Moore's law limits, coin qubits, Dirac vectors, Bloch sphere, single-qubit gates, CNOT, Bell state, kickback, teleportation).
3. `board/TEAM.md` and `missions/MISSION-MAP.md` (The team roster and mission tracking).
4. `docs/DESIGN-SYSTEM.md` and `.agents/rules/stack/quantum-ui.md` (Light mode tokens, zero neon shadows, surgical instrument aesthetic).
5. Existing mission files in `missions/` to maintain formatting parity.

## Core Rule: "Irrespective of Legacy Roles"
DO NOT pigeonhole team members into their old track silos (e.g. DO NOT give only frontend to Venu, only backend to Uday, only AI to Rajeswari, or only QA to Sohail).
Instead:
- The entire team is building this next-generation learning platform as a unified full-stack pod.
- Work is balanced evenly: each member receives 2 to 3 well-scoped cards (~4h to 7h total load per member).
- Distribute frontend components, SVG canvas math, curriculum fixtures, state stores, and test verification across all members so everyone owns a visible, demoable piece of the Duolingo experience.

## The 6 Team Members & File Targets
1. **Vinod Krishna** → `missions/vinod-krishna-mission.md`
2. **Venu Gopal** → `missions/venu-gopal-mission.md`
3. **Uday Rohit** → `missions/uday-rohit-mission.md`
4. **Rani** → `missions/rani-mission.md`
5. **Rajeswari** → `missions/rajeswari-mission.md`
6. **Sohail** → `missions/sohail-mission.md`

## Card Breakdown & Distribution Plan (`DUO-1` through `DUO-12`)

Assign 2 cohesive cards per team member (12 cards total):

### Pair 1: Path Architecture & Serpentine Math (Assigned to: Uday Rohit)
- **DUO-1: Sinusoidal Serpentine Path Canvas & SVG Bus Spline**
  - Deliverable: Create `apps/web/features/learning/components/serpentine-path.tsx` with responsive bezier/sinusoidal node coordinate math ($x \in [\pm 42\text{px}, \pm 120\text{px}]$), dual-rail voltage bus stroke with animated `stroke-dashoffset`.
  - Test: Unit test verifying SVG path calculation and coordinate mapping across mobile (390px) and desktop (1440px) breakpoints.
  - Branch: `feat/duolingo-path/duo-1-serpentine-canvas-spline`
- **DUO-2: Path Section Banners & Unit Guidebook Cheatsheet Modal**
  - Deliverable: Create `apps/web/features/learning/components/unit-section-banner.tsx` and `unit-guidebook-modal.tsx` with high-yield gate truth tables, Dirac formulas, and progress metrics.
  - Test: Component test verifying Guidebook drawer open/close and formula rendering.
  - Branch: `feat/duolingo-path/duo-2-unit-banners-guidebook`

### Pair 2: Interactive Nodes & In-Situ Popover (Assigned to: Rani)
- **DUO-3: Tactile ChamberNode Component & 6 Archetype Glyphs**
  - Deliverable: Create `apps/web/features/learning/components/chamber-node.tsx` supporting the 6 archetypes (Concept, Prediction, Gate Lab, Debug, Milestone Boss, Bonus Vault) with specular top bevels, radar sonar beacon, 3D mechanical press (`scale(0.94)`), and locked head-shake.
  - Test: Test rendering all 6 archetypes and verifying click/keyboard interactions.
  - Branch: `feat/duolingo-path/duo-3-chamber-node-archetypes`
- **DUO-4: In-Situ Anchored Popover with Pointing Beak**
  - Deliverable: Create `apps/web/features/learning/components/node-popover.tsx` anchored directly to active/clicked nodes with pointing beak SVG, stage metadata, star ratings, XP yield, and tactile `▶ START` CTA.
  - Test: Test verifying popover anchoring geometry, click-outside dismissal, and keyboard accessibility.
  - Branch: `feat/duolingo-path/duo-4-anchored-node-popover`

### Pair 3: Gamification Engine & Telemetry HUD (Assigned to: Vinod Krishna)
- **DUO-5: Coherence Shield & Joules Store with Decoherence Penalty**
  - Deliverable: Create `apps/web/lib/gamification-store.ts` managing personal Coherence Joules (XP), 100% Coherence Shield (health meter), and streak counter. Implement shield loss on incorrect checkpoint predictions and practice recovery.
  - Test: Unit test covering prediction failure decoherence penalty and calibration recovery.
  - Branch: `feat/duolingo-path/duo-5-coherence-shield-store`
- **DUO-6: Unified Top Telemetry HUD & Account Profile Pill**
  - Deliverable: Create `apps/web/features/learning/components/learning-hud.tsx` with Streak pill, Coherence energy counter, Shield gauge, and unified learner profile menu (`[👤 Learner Profile ▾] [⚙]`).
  - Test: Component test verifying HUD rendering and reactivity to gamification store changes.
  - Branch: `feat/duolingo-path/duo-6-telemetry-hud-profile`

### Pair 4: Foundations Curriculum Fixtures — Units 1.1 to 1.5 (Assigned to: Rajeswari)
- **DUO-7: Curriculum Registry & Stage Data Engine for Units 1.1 to 1.3**
  - Deliverable: Create `apps/web/lib/curriculum/units-1-to-3.ts` implementing the full 5-beat data for What is Quantum (Moore's law, wave-particle, energy quanta), Bit vs Qubit (spinning coin, Dirac bra-ket), and Superposition & Collapse (Born rule, polarized sunglasses).
  - Test: Schema validation test verifying all stages conform to `board/contracts/learning-content.md`.
  - Branch: `feat/duolingo-curriculum/duo-7-foundations-units-1-3`
- **DUO-8: Single-Qubit Gate Chambers & QRNG Boss Milestone (Units 1.4 to 1.5)**
  - Deliverable: Create `apps/web/lib/curriculum/units-4-to-5.ts` containing the 3D Bloch sphere stages, Pauli-X, Hadamard reversibility ($H \cdot H = I$), Pauli-Z phase flips, S & T gates, and the Unit 1 Capstone QRNG Boss.
  - Test: Vitest test verifying statevector fidelity expectations and prediction checkpoint options.
  - Branch: `feat/duolingo-curriculum/duo-8-single-qubit-gates-qrng`

### Pair 5: Multi-Qubit, Entanglement & Pre-Algorithms (Assigned to: Venu Gopal)
- **DUO-9: Multi-Qubit, CNOT & Bell Correlation Stages (Units 1.6 to 1.7)**
  - Deliverable: Create `apps/web/lib/curriculum/units-6-to-7.ts` implementing the tensor product register explosion, CNOT conditional logic, Bell state $|\Phi^+\rangle$ Hero Lab, and the Classical Independence Trap checkpoint.
  - Test: Verification test proving Bell correlation logic and Socratic repair challenge triggers.
  - Branch: `feat/duolingo-curriculum/duo-9-cnot-bell-correlation`
- **DUO-10: Quantum Telemetry, Kickback & Teleportation Stages (Units 1.8 to 1.10)**
  - Deliverable: Create `apps/web/lib/curriculum/units-8-to-10.ts` implementing shot noise variance (1024 shots), phase kickback trapdoor, quantum teleportation protocol, and the Module 1 Capstone Exam.
  - Test: Schema test verifying 3-qubit circuit definitions and telemetry contract compatibility.
  - Branch: `feat/duolingo-curriculum/duo-10-teleportation-capstone`

### Pair 6: Layout Assembly, Mobile Experience & Verification (Assigned to: Sohail)
- **DUO-11: Desktop Master-Detail Assembly & Right Stage Inspector Drawer**
  - Deliverable: Assemble the complete 3-zone desktop layout on `/learn` matching `docs/LEARN-DUOLINGO-PATH-UI-SPEC.md` Section 3 (Left Quests Rail + Center Serpentine Canvas + Right Stage Inspector Panel).
  - Test: Integration test verifying stage selection updates the Right Inspector drawer without page reload.
  - Branch: `feat/duolingo-ui/duo-11-desktop-assembly-inspector`
- **DUO-12: Mobile Sinusoidal Arc, Spring Bottom Sheet & Full Test Suite**
  - Deliverable: Implement the responsive mobile layout with sticky top HUD, single-column path, spring-animated bottom sheet modal ($75\text{vh}$), and sticky bottom 4-tab bar. Verify full regression test suite (`pnpm test:web`).
  - Test: Acceptance test verifying mobile responsive rendering and confirming all 195+ tests remain green.
  - Branch: `feat/duolingo-ui/duo-12-mobile-sheet-acceptance`

---

## Required Task Card Template
Every card added into the mission files MUST strictly adhere to this exact format:

```markdown
### DUO-X · Card Title [timebox: Xh]
CONTEXT: Detailed context citing docs/LEARN-DUOLINGO-PATH-UI-SPEC.md and docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md.
DELIVERABLE: Specific files created or modified with clear scope boundaries.
TEST: Exact executable shell command (e.g. `pnpm test:web tests/unit/...`).
DEPENDS: Preceding card IDs          UNBLOCKS: Subsequent card IDs
DEMO: The exact visual or interactive behavior the user or judge experiences.
PERSONA: Nova / Orion / Forge / Warden           STATUS: [ ] ready
BRANCH: `feat/duolingo-...`
PR: one card per PR; paste the TEST result and link any contract/version decision.
```

---

## Execution Steps
1. Append the 2 assigned cards directly into each corresponding mission file:
   - `missions/uday-rohit-mission.md` (DUO-1, DUO-2)
   - `missions/rani-mission.md` (DUO-3, DUO-4)
   - `missions/vinod-krishna-mission.md` (DUO-5, DUO-6)
   - `missions/rajeswari-mission.md` (DUO-7, DUO-8)
   - `missions/venu-gopal-mission.md` (DUO-9, DUO-10)
   - `missions/sohail-mission.md` (DUO-11, DUO-12)
2. Update the Branch Map table in each of the 6 mission files to list the new branches.
3. Update `missions/MISSION-MAP.md`:
   - Add the Duolingo phase cards to each member's load summary.
   - Add the Discord acceptance lines.
4. Run `pnpm test:web` to ensure no syntax or lint errors were introduced.
5. Provide a summary of all created cards, assigned owners, and their dependency graph.
```
