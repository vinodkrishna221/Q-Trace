# Q-Trace Learn Redesign — Duolingo-Style Progressive Quantum Path
## Visual, Interaction, Responsive & Systems Architecture Specification

> **Document Type:** UI/UX Redesign Specification & Engineering Blueprint  
> **Route:** `/learn`  
> **Target Archetype:** Progressive Gamified Quantum Coherence Path ("The Statevector Way")  
> **Design Philosophy:** Linear Precision Scientific Instrument meets Duolingo Progressive Skill Path  
> **Design System Compliance:** Strictly conforms to `docs/DESIGN-SYSTEM.md`, `.agents/rules/stack/quantum-ui.md`, and `apps/web/app/globals.css`. Permanently anchored to Light Mode Archival Mineral Alabaster (`--bg-canvas: #faf6f0`, `--bg-surface: #ffffff`) with semantic CSS tokens, hairline specular bevels, and surgical luminescence.

---

## 1. Executive Summary & Paradigm Shift

### 1.1 The Problem with the Current Learn Screen
The existing `/learn` screen (as captured in `reports/images/beat2_learn_catalogue.png`) is structured as a standard dashboard catalog with 3 horizontal cards (`Qubits and Superposition`, `Measurement and Probability`, `From Superposition to Bell Correlation`) and a text-heavy sidebar. While functional for a quick hackathon pitch, user feedback and cognitive analysis expose four severe pain points:
1. **Intimidation Factor:** Beginners entering quantum computing are immediately confronted with dense paragraphs, unfamiliar mathematical acronyms (`|00⟩`, `|Φ⁺⟩`, `Tr(ρ²)`), and feel overwhelmed before running their first gate.
2. **Lack of Progression Momentum:** Flat cards lack the visual gratification, tangible sense of momentum, and incremental milestone dopamine that makes Duolingo or Brilliant addictive.
3. **Disconnected Lab Sandbox:** Learners cannot see where their current experiment fits into the larger journey from single-qubit intuition to quantum algorithms (Grover, Deutsch-Jozsa, VQE).
4. **Poor Mobile Ergonomics:** The 3-card desktop grid compresses uncomfortably on mobile devices, forcing endless vertical scrolling without a coherent mental map.

### 1.2 The Duolingo-Style Quantum Path Solution
We transform `/learn` into **The Quantum Coherence Path**: a winding, level-by-level progressive skill tree where each stage is a tactile, interactive stepping stone ("Chamber Node").
- **Pedagogical Pacing:** Complex quantum concepts are atomized into bite-sized 3–5 minute stages.
- **Hypothesis-First Mechanics:** Stages enforce Q-Trace's signature loop: **Predict** (Hypothesis Checkpoint) $\rightarrow$ **Construct** (Circuit Workspace) $\rightarrow$ **Simulate** (Qiskit Aer) $\rightarrow$ **Inspect** (Visual Evidence & Flight Recorder).
- **Gamified Yet Surgically Precise:** Replaces cartoonish characters with precision scientific hardware metaphors: Quantum Coherence Streaks, Calibration Stars, Unit Superposition Gateways, and Flight Recorder Repair Challenges.
- **Unified Progressive Mastery:** Every individual learner progresses sequentially through foundational nodes with clean, structured pacing, building solid physical and mathematical intuition before tackling multi-qubit entanglement and the Bell State Hero Lab.

---

## 2. Comprehensive Inventory of UI Items

To achieve the addictive rhythm of Duolingo while honoring the Linear scientific instrument aesthetic, the page incorporates the following explicit item primitives:

### 2.1 Navigation & Telemetry HUD Items
1. **Brand Wordmark:** `Q-TRACE` with live quantum statevector glyph.
2. **Calibration Streak Pill:** `🔥 4-Day Streak` with streak-freeze shield status tooltip.
3. **Coherence Joules (Energy/XP):** `⚡ 850 Coherence` (quantum currency earned by completing stages and accurate predictions).
4. **Coherence Shield (Health/Hearts Meter):** `🛡️ 100% Coherence` (quantum stability meter; incorrect predictions or broken circuits cause decoherence, replenished by completing quick Flight Recorder calibration practice).
5. **Individual Learner Profile Pill / Settings:** Current learner avatar and account menu pill (`[👤 Learner Profile ▾]` / `[⚙]`) displaying personal calibration telemetry, streak status, and individual preference settings.

### 2.2 Curriculum Structure & Section Items
6. **Unit Section Banner:** Full-width header card introducing each unit (e.g. `UNIT 1: THE QUANTUM COMPASS`), with subtitle, progress count (`3/6 Completed`), and accent color rail.
7. **Unit Guidebook Button (`[Guidebook 📖]`):** Prominent button on the unit banner that opens a slide-over modal containing high-yield formula cheatsheets, gate truth tables, and Dirac notation summaries.
8. **Unit Progress Fill Bar:** Milled progress gauge tracking unit completion percentage.

### 2.3 Serpentine Path Items
9. **Dual-Rail Quantum Bus Spline:** Continuous SVG spline connecting stages, showing inactive hairline tracks, active flowing voltage pulses, and completed solid indigo lines.
10. **Tactile Chamber Nodes:** Multi-layered circular stepping stones (Concept, Prediction Checkpoint, Gate Lab, Debug Station, Milestone Boss, Bonus Vault).
11. **Radar Sonar Beacon:** Pulsing concentric wave around the active stage indicating the current learning frontier.
12. **In-Situ Anchored Popover Card:** Interactive speech-bubble card anchored directly to a tapped/clicked node with lesson title, star rating, XP reward, and the prominent `▶ START` button.
13. **AI Socratic Mascot / Companion Callout:** Interactive floating thought-bubble avatar (`Quantum Observer`) positioned along the path offering bite-sized contextual hints and encouragement.
14. **Bonus Discovery Vault Nodes:** Branching side-path nodes awarding historical physics lore (e.g. Alain Aspect 1982 experiment, EPR paradox).
15. **Flight Recorder Practice Station (Dumbbell):** Dedicated practice node to replay past diverged predictions and restore Coherence Shield.
16. **Capstone Boss Trophy Gateway:** Grand hexagonal gateway marking the completion of a unit, requiring circuit synthesis without hints.

### 2.4 Companion Panels & Drawers
17. **Left Rail / Daily Calibration Quests Card:** Daily goals (e.g. "Create 1 Superposition", "Solve 1 Repair Challenge", "Maintain >90% Fidelity").
18. **Cohort Benchmark Card:** Live cohort ranking (e.g. "Superconducting League: You #3").
19. **Right Floating Stage Inspector Drawer (Desktop):** Contextual instrument panel showing deep state telemetry, reduced purity, prerequisites, and Qiskit preview.
20. **Spring-Animated Bottom Sheet (Mobile):** Touch-friendly modal sliding up from the bottom when any node is tapped on mobile.
21. **Mobile Bottom Navigation Bar:** Fixed bottom tab bar (`Learn`, `Practice`, `Quests`, `Profile`).

---

## 3. Desktop Primary Architecture & ASCII Wireframe

On desktop viewports ($\ge 1024\text{px}$, optimized for $1440\text{px}$ and safe down to $1280\text{px}$):
- **3-Zone Layout:** Left Rail (Col 3) + Center Serpentine Canvas (Col 6) + Right Stage Inspector (Col 3).
- **In-Situ Popover:** Displays directly anchored to whichever node is active or clicked.

### 3.1 Desktop ASCII Wireframe (`max-w-7xl`, 1440px Viewport)

```
========================================================================================================================
[⚛ Q-TRACE]  /learn  |  [🔥 4-Day Streak]  [⚡ 850 Coherence]  [🛡️ 100% Shield]  |  [👤 Learner Profile ▾]  [⚙]
========================================================================================================================

 ┌─ LEFT RAIL: QUESTS & NAV ─┐ ┌─── CENTER STAGE: THE QUANTUM COHERENCE PATH ───────────────┐ ┌─ RIGHT STAGE INSPECTOR ─┐
 │                           │ │                                                            │ │                          │
 │ ◈ UNIT ROADMAP            │ │  ┌──────────────────────────────────────────────────────┐  │ │ [STAGE 03 INSPECTION]    │
 │   ✓ Unit 0: Zero Ground   │ │  │ UNIT 1: THE QUANTUM COMPASS              [📖 GUIDEBOOK]│  │ │ ────────────────────── │
 │   ● Unit 1: Single-Qubit  │ │  │ Single-Qubit Rotations & Superposition   3/6 Completed│  │ │ ⬡ THE HADAMARD ROTATION  │
 │   ○ Unit 2: Entanglement  │ │  │ [=========================>              ] 50%        │  │ │                          │
 │   ○ Unit 3: Telemetry     │ │  └───────────────────────────┬──────────────────────────┘  │ │ "Rotate state |0⟩ into   │
 │   ○ Unit 4: Algorithms    │ │                              │                             │ │  equal superposition |+⟩"│
 │                           │ │                              ▼                             │ │                          │
 │ ───────────────────────── │ │                          [ (01) ] ◄── Mastered Concept     │ │ ◈ Difficulty: Foundation │
 │ 🎯 DAILY CALIBRATION      │ │                          /  ✓  \      "The Bloch Compass"  │ │ ⏱ Est. Time: 4 Mins      │
 │ • Run 1 Hadamard Circuit  │ │                         /       \                          │ │ ⚡ Reward: +50 Coherence │
 │   [================] Done │ │        Phase Rail ─────/         \                         │ │ 🛡️ Restores: +20% Shield │
 │ • Score 3★ on Prediction  │ │                       /           \                        │ │                          │
 │   [=========>      ] 1/2  │ │                      ▼             ▼                       │ │ ── KEY CONCEPTS ──────── │
 │ • Repair 1 Divergence     │ │                 [ (02) ]         [ 🎁 ] Discovery Vault    │ │ • North Pole to Equator  │
 │   [>               ] 0/1  │ │                 /  ✓   \         (Bloch History Lore)      │ │ • Unitary Matrix H       │
 │                           │ │                /  NOT   \                                  │ │ • Born Rule 50/50 State  │
 │ ───────────────────────── │ │               /  Gate    \                                 │ │                          │
 │ 🏆 COHORT BENCHMARK       │ │              /            \                                │ │ ── PREDICTION CHECKPOINT │
 │ Superconducting League    │ │             /              \                               │ │ ❓ What is the state of  │
 │ 1. Vikram S.      1,120⚡ │ │            ▼                \                              │ │    qubit 0 after gate H? │
 │ 2. Priya N.       1,040⚡ │ │       ╭──────────────────────╮\                             │ │    [|+⟩ Equal 50/50]     │
 │ 3. You (Active)     850⚡ │ │       │ 03. HADAMARD GATE    │ \                            │ │                          │
 │ 4. Elena R.         820⚡ │ │       │ ★ ★ ☆   +50 Coherence│  \                           │ │ ── HARDWARE VERIFICATION │
 │                           │ │       │ ┌──────────────────┐ │   \                          │ │ Backend: Qiskit Aer 1024 │
 │ ───────────────────────── │ │       │ │ ▶ START CHAMBER  │ │    \                         │ │ Purity Tr(ρ²): 1.00 Pure │
 │ 💡 OBSERVER TIP           │ │       │ └──────────────────┘ │     \                        │ │                          │
 │ "Remember: H is its own   │ │       ╰──────────┬───────────╯      \                       │ │ ┌──────────────────────┐ │
 │  inverse! H·H = I"        │ │                  ▼                   \                      │ │ │ ▶ ENTER CHAMBER      │ │
 │       — Quantum Observer  │ │              [ (03) ] ◄── ACTIVE      \                     │ │ └──────────────────────┘ │
 │                           │ │             / ◉ RADAR\   NODE          \                    │ │ [Press ↵ to Launch]      │
 │                           │ │            │  BEACON  │  (H-Gate)       \                   │ │                          │
 │                           │ │             \ ★ ★ ☆  /                   \                  │ │ ── PREREQUISITE STATUS ─ │
 │                           │ │              \──────/                     \                 │ │ ✓ Concept 01: Compass    │
 │                           │ │                  \                         \                │ │ ✓ Gate 02: Pauli-X       │
 │                           │ │                   \                         ▼               │ │ ⚠ Checkpoint 03: Pending │
 │                           │ │                    ▼                    [ 🏋️ ] Flight Station│ │                          │
 │                           │ │                 [ (04) ] ◄── Locked     (Practice Diverged) │ │ ── SCIENTIFIC HONESTY ── │
 │                           │ │                 /  🔒  \     "Z-Phase Flip"                 │ │ "Mathematical represen-  │
 │                           │ │                /        \                                   │ │  tation, not physical    │
 │                           │ │               /          \                                  │ │  trajectory."            │
 │                           │ │              ▼            ▼                                 │ │                          │
 │                           │ │          [ (05) ]      [ (06) ] Locked                      │ └──────────────────────────┘
 │                           │ │          /  🔒  \      /  🔒  \                             │
 │                           │ │         │ Phase  │    │ Lab    │                            │
 │                           │ │          \ S & T/      \ Sandbox/                           │
 │                           │ │           \────/        \──────/                            │
 │                           │ │               \            /                                │
 │                           │ │                ▼          ▼                                 │
 │                           │ │            ┌──────────────────────┐                         │
 │                           │ │            │ 👑 UNIT 1 CAPSTONE   │ ◄── Capstone Boss Stage │
 │                           │ │            │  QRNG Synthesis Lab  │     (Synthesize State)  │
 │                           │ │            │    [ 🔒 LOCKED ]     │                         │
 │                           │ │            └──────────┬───────────┘                         │
 │                           │ │                       │                                     │
 │                           │ │                       ▼                                     │
 │                           │ │            ┌──────────────────────┐                         │
 │                           │ │            │ UNIT 2: ENTANGLEMENT │                         │
 │                           │ │            └──────────────────────┘                         │
 └───────────────────────────┘ └─────────────────────────────────────────────────────────────┘
```

---

## 4. Mobile Primary Architecture & ASCII Wireframe

On mobile viewports ($< 640\text{px}$, standard $390\text{px}$ iPhone 15 / Pixel 8):
- **Single-Column Sinusoidal Serpentine:** Nodes sway within a thumb-friendly arc ($x \in [-44\text{px}, +44\text{px}]$ from center).
- **Sticky Top HUD:** Ultra-compact bar with Streak, Shield, Coherence, and Avatar.
- **Collapsible Unit Header:** Displays current unit with a direct `[📖 Guide]` pill.
- **In-Situ Anchored Popover:** Tapping an active node displays the in-situ popover directly on the path, or opens the Spring Bottom Sheet for rich inspection.
- **Sticky Bottom Navigation Bar:** Standard 4-tab bar for thumb navigation.

### 4.1 Mobile ASCII Wireframe (390px Viewport)

```
 ┌──────────────────────────────────────┐
 │ [⚛] Q-TRACE   🔥4  🛡️100%  ⚡850  [👤] │  ◄ Sticky Top HUD (h-12)
 ├──────────────────────────────────────┤
 │ ◈ UNIT 1: QUANTUM COMPASS   [📖 GUIDE]│  ◄ Unit Pill Header
 │ [=======================>     ] 50%  │
 └──────────────────────────────────────┘
                    │
                    │ Coherence Bus (1.5px)
                    ▼
                [ (01) ]   ◄ 01. The Compass
                /  ✓   \     Mastered (★ ★ ★)
               |  PASS  |
                \      /
                 \
                  \
                   ▼
               [ (02) ]    ◄ 02. The X-Gate
               /  ✓   \      Mastered (★ ★ ☆)
              |  X-NOT |
               \      /
                 \
                  \
                   ▼
         ╭──────────────────────╮  ◄── IN-SITU ANCHORED POPOVER
         │ 03. HADAMARD GATE    │      (Floats above active node)
         │ Rotate |0⟩ into |+⟩  │
         │ ★ ★ ☆   +50⚡  🛡️+20% │
         │ ┌──────────────────┐ │
         │ │ ▶ START (+50 XP) │ │
         │ └──────────────────┘ │
         ╰──────────┬───────────╯
                    ▼
                [ (03) ]   ◄── ACTIVE RADAR NODE
               / ◉ ◉ ◉ \      "03. Hadamard Gate"
              │ ⚡  H  ⚡ │     Concentric Pulsing Ring
               \ ★ ★ ☆ /      Tap launches / inspects
                \─────/
                /
               /
              ▼
          [ (04) ]         ◄ 04. Z-Phase Flip
          /  🔒   \          Locked (Requires 03)
         |  PHASE  |
          \       /
                  \
                   \
                    ▼
                [ (05) ]   ◄ 05. S & T Precision
                /  🔒   \    Locked
               |   S/T   |
                \       /
                    │
                    ▼
          ┌───────────────────┐
          │ 👑 UNIT 1 BOSS    │ ◄ Unit Milestone Capstone
          │   [ 🔒 LOCKED ]   │
          └─────────┬─────────┘
                    ▼
          ┌───────────────────┐
          │ UNIT 2: BELL PAIR │
          └───────────────────┘

 ┌── SPRING BOTTOM SHEET (SWIPE UP / DEEP INSPECT) ──┐
 │ ═════════════════════════════════════════════════ │  ◄ Drag Handle Pill
 │ [STAGE 03 · FOUNDATION]             ⏱ 4m · +50⚡   │
 │                                                   │
 │ The Hadamard Transformation                       │
 │ Rotate single-qubit |0⟩ into equal superposition  │
 │ |+⟩ on the Bloch sphere equator.                  │
 │                                                   │
 │ ── PREDICTION CHECKPOINT ──────────────────────── │
 │ ❓ What will be the observed state?               │
 │  (●) 50% |0⟩ and 50% |1⟩ (Equal Superposition)    │
 │  (○) 100% |0⟩ (No change)                         │
 │                                                   │
 │ ┌───────────────────────────────────────────────┐ │
 │ │ ▶ ENTER CHAMBER & RUN CIRCUIT                 │ │  ◄ 48px Thumb Action
 │ └───────────────────────────────────────────────┘ │
 └───────────────────────────────────────────────────┘
 ┌───────────────────────────────────────────────────┐
 │  [📖 Learn]   [🏋️ Practice]   [🎯 Quests]   [👤 Profile]│  ◄ Sticky Bottom Bar
 └───────────────────────────────────────────────────┘
```

---

## 5. Chamber Node Typology & Anatomical Blueprint

Every stepping-stone node along the path is a **tactile scientific instrument**, not a generic flat button:

```
                       [ Floating Tooltip Label ]
                      ┌──────────────────────────┐
                      │ 03. Hadamard Rotation    │
                      └────────────┬─────────────┘
                                   │
                     ╭─────────────┴─────────────╮ ◄── Outer 1.5px Orbital Progress Ring
                  ╭──┴───────────────────────────┴──╮    (SVG stroke-dashoffset: 0% -> 100%)
                ╭─╯                                 ╰─╮
               │     ┌─────────────────────────┐       │
               │     │  Specular Top Bevel     │       │ ◄── Inset 1px Specular Highlight
               │   ┌─┴─────────────────────────┴─┐     │     box-shadow: inset 0 1px 0 rgba(255,255,255,0.9)
               │   │                             │     │
               │   │      [ GATE GLYPH ]         │     │ ◄── Gate Emblem / Icon
               │   │            H                │     │     JetBrains Mono 16px Bold
               │   │                             │     │
               │   └─┬─────────────────────────┬─┘     │
               │     │  Subscript Descriptor   │       │ ◄── Micro-label (e.g. "SUPERPOS")
               │     └─────────────────────────┘       │     Inter 8px Uppercase
                ╰─╮                                 ╭─╯
                  ╰──┬───────────────────────────┬──╯
                     ╰─────────────┬─────────────╯
                                   │
                         [ ★ ★ ☆ ] 3-Star Rating ◄── Mastery Badges (Prediction Accuracy)
```

### 5.1 The 6 Chamber Archetypes

| Archetype | Icon Glyph | Role on Path | Interactive Mechanics | Completion Criteria | Design System Token Mapping |
|---|---|---|---|---|---|
| **1. Concept Chamber** (`NODE_CONCEPT`) | `BookOpen` or `Atom` | Physical intuition & everyday analogies (coin, compass). | 3-minute interactive scroll with 3D Bloch vector slider. | Read all 3 concept blocks & answer 1 micro-comprehension check. | Surface: `--bg-surface`<br>Border: `--border-subtle`<br>Accent: `--accent` |
| **2. Prediction Checkpoint** (`NODE_PREDICTION`) | `Compass` or `HelpCircle` | Formulate hypothesis before seeing simulation results. | Single-choice radio card selector with Dirac formula preview. | Learner commits structured prediction (persisted in store). | Surface: `--bg-surface-raised`<br>Border: `--border-strong`<br>Accent: `--caution` |
| **3. Gate Construction Lab** (`NODE_GATE_LAB`) | `GateGlyph` (`[H]`, `[X]`, `[Z]`, `[CNOT]`) | Hands-on circuit assembly using drag-and-drop or Qiskit. | Mini-workspace: drop gate onto wire & trigger simulation. | Successful execution matching target unitary matrix. | Surface: `--bg-surface`<br>Border: Specular bevel<br>Accent: Gate-specific token |
| **4. Flight Recorder Debug** (`NODE_DEBUG`) | `Radio` or `Activity` | Replay state traces & isolate divergence step. | Scrubber timeline through state trace steps: $0 \rightarrow 1 \rightarrow 2$. | Resolve Misconception Signal & pass Socratic Repair Challenge. | Surface: `--bg-surface-sunken`<br>Border: `--evidence-diverge`<br>Accent: Amber Sonar Pip |
| **5. Unit Milestone Boss** (`NODE_MILESTONE`) | `Crown` or `Sparkles` | Capstone synthesis uniting all concepts of the unit. | Multi-qubit circuit puzzle with zero initial hints. | Pass statevector fidelity test ($F \ge 0.99$) and zero errors. | Surface: Milled Raised Tile<br>Border: `--violet`<br>Emblem: Gold Crown |
| **6. Bonus Vault / Discovery** (`NODE_BONUS`) | `Gift` or `Lock` | Speed challenges, historical physics experiments. | Timed prediction quiz or open-ended sandbox exploration. | Yields bonus Coherence Badges & unlocks visualizer skins. | Surface: `--bg-surface-sunken`<br>Border: Hairline Translucent<br>Glyph: `--text-secondary` |

---

## 6. The Signature Duolingo In-Situ Anchored Popover

When a learner clicks or taps any stage node directly on the serpentine path, an **in-situ anchored popover card** (with a pointing triangular beak) sprouts directly above or below the node:

### 6.1 Popover Specifications
- **Dimensions:** Width `260px` (desktop), `240px` (mobile). Height auto (`~160px`).
- **Surface:** `--bg-surface` (`#ffffff`) with 1px border `--border-strong`, rounded-2xl (`rounded-2xl`), shadow `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`.
- **Triangular Beak:** $12\text{px} \times 8\text{px}$ SVG beak pointing directly to the node center.
- **Contents:**
  1. Header row: Stage number and category tag (e.g. `STAGE 03 · FOUNDATION`).
  2. Lesson title: `The Hadamard Gate` (Inter 14px SemiBold).
  3. Objective micro-copy: `"Rotate |0⟩ into equal superposition |+⟩"`.
  4. Reward badge strip: `+50⚡ Coherence` · `🛡️ +20% Shield`.
  5. Star rating: `★ ★ ☆` (mastery level).
  6. Big tactile CTA button: `▶ START (+50 XP)` (h-10, full width, `--accent`, font-bold, active mechanical click).
- **Dismissal:** Dismisses on click-outside, Esc key, or clicking another node.

---

## 7. Micro-Interactions, Effects & Animation Choreography

In strict accordance with `docs/DESIGN-SYSTEM-DIMENSIONS-3-4-5.md`, all animations use hardware-accelerated transforms (`transform`, `opacity`), maintaining an uncompromising **60fps budget with zero layout shift**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 6 STAGE MICRO-INTERACTIONS                            │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ 1. Idle Energy Breathing       │ Subtle 3-second harmonic oscillation on current node. │
│ 2. Radar Sonar Beacon          │ 1.8-second concentric pulse ring on active stage.     │
│ 3. Magnetic Hover & Tilt       │ 1.06x scale lift with directional cursor spring.      │
│ 4. Tactile Mechanical Depress  │ 0.94x haptic squash with overdamped spring recoil.    │
│ 5. Coherent Beam Ignition      │ SVG path voltage fill animating along the bus rail.   │
│ 6. Stage Unlock Bloom          │ Padlock burst with particle dispersion & crest reveal.│
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

### 7.1 Interactive Node States & Effects

#### State A: Locked (`STATE_LOCKED`)
- **Appearance:** Opacity `0.45`, grayscale filter `grayscale(0.8)`, border `--border-subtle`, background `--bg-surface-sunken`.
- **Center Icon:** Hairline padlock (`Lock` in `--text-faint`).
- **Interaction:** Tap/Click triggers a gentle horizontal head-shake animation (`translateX(-3px -> +3px -> 0)` over 200ms) with a floating tooltip: *"Complete Stage 02 to unlock"*.

#### State B: Available / In-Progress (`STATE_ACTIVE`)
- **Appearance:** 100% opacity, border `--border-strong`, background `--bg-surface`, specular crest active.
- **Radar Sonar Beacon:** Concentric pulse ring expanding outwards:
  ```css
  @keyframes sonar-pulse {
    0% { transform: scale(1.0); opacity: 0.8; }
    50% { opacity: 0.35; }
    100% { transform: scale(1.45); opacity: 0; }
  }
  .animate-sonar-beacon {
    animation: sonar-pulse 1800ms cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  ```
- **Interaction:** Hover lifts node (`translateY(-2px)`, scale `1.06`). Click triggers mechanical squash (`scale(0.94)`) and sprouts the In-Situ Anchored Popover.

#### State C: Mastered / Completed (`STATE_COMPLETED`)
- **Appearance:** Border `--evidence-success` ($1.5\text{px}$ solid Pine Emerald), orbital progress ring filled 100%, background `--bg-surface-raised`.
- **Center Icon:** Gate glyph or verified checkmark in Deep Pine Emerald (`--evidence-success`).
- **Interaction:** Tapping opens the popover with a *"Review / Practice"* button to re-run simulations or review theory without penalty.

#### State D: Diverged / Misconception Flagged (`STATE_DIVERGED`)
- **Appearance:** Border `--evidence-diverge` (Amber), background tinted with subtle warm amber ($6\%$ opacity), pulsing amber sonar pip.
- **Micro-Copy:** *"Flight Recorder Flagged Divergence"*.
- **Interaction:** Tapping immediately opens the **Flight Recorder Replay Drawer** to diagnose the divergence and repair the mental model.

### 7.2 Path Voltage Animation (The Connecting Coherence Bus)
The serpentine path is drawn as a dual-rail SVG spline:
1. **Background Track:** Continuous $2\text{px}$ hairline stroke in `--border-subtle`.
2. **Coherence Voltage Stream (Active/Completed):** Continuous gradient stroke (`--prob-fill`, Deep Indigo to Royal Amethyst) with animated `stroke-dashoffset`:
   ```css
   @keyframes coherence-flow {
     from { stroke-dashoffset: 36; }
     to { stroke-dashoffset: 0; }
   }
   .animate-coherence-stream {
     stroke-dasharray: 6 12;
     animation: coherence-flow 1200ms linear infinite;
   }
   ```
3. **Locked Path Segment:** Muted dashed line ($2\text{px}$ dash, $6\text{px}$ gap) in `--border-subtle`.

---

## 8. Color Palette & Theming Rules (Locked Light Mode)

In strict adherence to `docs/DESIGN-SYSTEM.md` and `.agents/rules/stack/quantum-ui.md`, the platform is **permanently locked to Light Mode Archival Mineral Alabaster**. Color is never decorative neon; it is surgical scientific telemetry:

| Token Variable | Light Porcelain (`:root`) Value | UI Semantic Role on the Learning Path |
|---|---|---|
| `--bg-canvas` | `#faf6f0` (Archival Alabaster) | Deepest viewport canvas background |
| `--bg-surface` | `#ffffff` (Pure Kaolin) | Stepping-Stone Node body & Popover card |
| `--bg-surface-raised`| `#f3eee6` (Pressed Ivory) | Active / hovered node surface & unit cards |
| `--bg-surface-sunken`| `#ece6dc` (Mineral Trench)| Locked nodes & recessed well tracks |
| `--border-subtle` | `rgba(11, 10, 67, 0.08)` | Inactive connecting bus rails & card dividers |
| `--border-strong` | `rgba(11, 10, 67, 0.28)` | Focused node perimeter & active popover borders |
| `--text-primary` | `#0b0a43` (Midnight Indigo) | Node labels, headings, prominent numbers |
| `--text-secondary`| `#31306b` (Deep Slate) | Objective descriptions, unit subtitles |
| `--text-muted` | `#5a5895` (Soft Violet) | Estimated times, stage indices, secondary copy |
| `--accent` | `#2a2882` (Deep Indigo) | Single-qubit nodes, H-gate, primary action buttons |
| `--gate-cnot` / `--violet`| `#4a02b1` (Royal Amethyst)| Two-qubit entanglement stages & Capstone Bosses |
| `--evidence-success`| `#033c00` (Pine Emerald)| 100% completed & verified stages (Mastered) |
| `--evidence-diverge`| `#9a3412` (Amber Mineral)| Misconception divergence point & repair challenges |

---

## 9. Mobile-Friendly Responsiveness & Breakpoints

| Breakpoint | Viewport Width | Serpentine Winding Geometry | Node Diameter | Inspector / Popover Behavior | Navigation Experience |
|---|---|---|---|---|---|
| **Mobile Portrait** | `< 640px` | Sinusoidal swing ($x = \pm 42\text{px}$) | $52\text{px}$ | In-situ popover on tap + swipe-up Bottom Sheet Modal ($75\text{vh}$). | Sticky top HUD with compact icons; sticky bottom 4-tab bar. |
| **Mobile Landscape / Small Tablet** | `640px – 768px` | Sinusoidal swing ($x = \pm 68\text{px}$) | $56\text{px}$ | In-situ popover on tap + side sheet drawer. | Collapsible top bar with compact unit pills. |
| **Tablet / Small Laptop** | `769px – 1023px`| Serpentine swing ($x = \pm 96\text{px}$) | $60\text{px}$ | Split 2-column layout: Path (8 cols) + Inspector (4 cols). | Right-docked inspector panel. |
| **Desktop High-Res** | `1024px – 1536px`| Serpentine swing ($x = \pm 120\text{px}$) | $64\text{px}$ | 3-column studio: Left Nav (3) + Center Path (6) + Inspector (3). | Full Linear-style desktop instrument with anchored popovers. |

---

## 10. Unified Progressive Learning Mechanics & Individual Learner Pacing

The learning path provides every individual learner with a unified, cohesive journey that paces them from foundational quantum mechanics through multi-qubit systems and circuit synthesis with clean, self-paced scaffolding:

### 10.1 Structured Foundational Progression
- **Unified Starting Point:** All individual learners commence at Unit 1.1 (Stage 1.1.1: `mod1_transistor_limits` / `The Classical Bit vs The Quantum Qubit`), establishing physical intuition before mathematical formalism.
- **Clean Sequential Gating:** Stages unlock sequentially as the learner demonstrates mastery ($\ge 1$ calibration star). This eliminates cognitive overload and prevents skipping ahead before key principles (superposition, measurement collapse, unitary reversibility) are grounded.
- **Scaffolded Multimodal Explanations:** Every chamber pairs intuitive real-world metaphors (spinning coins, 3D compass needles, polarizing filters) alongside clean Dirac bra-ket notation and interactive Qiskit Python code snippets.

### 10.2 Individualized Diagnostic Detours & Flight Recorder
- **Evidence-Bound Intervention:** When an individual learner commits an incorrect prediction (such as selecting `INDEPENDENT_RANDOM` instead of correlated states at the Bell Checkpoint), the path activates an **Amber Diagnostic Detour Node** (`STATE_DIVERGED`).
- **Targeted Mental Model Repair:** The learner enters the Quantum Flight Recorder directly from the active node, inspects step-by-step gate state traces, and completes a guided Socratic Repair Challenge to restore their Coherence Shield before moving forward.

### 10.3 Self-Paced Mastery & Review Mode
- **Uncapped Practice & Review:** Completed stages remain permanently accessible with full telemetry in the Stage Inspector Drawer. Learners can replay simulations, review Dirac truth tables in the Unit Guidebook, or take on bonus Discovery Vault challenges at their own pace.
- **Personalized Telemetry:** The top HUD tracks individual progress: Calibration Streaks, earned Coherence Joules, and Coherence Shield integrity. Individual account preferences and display settings are managed via the profile pill in the header.

---

## 11. Verification & Test Suite Contract Preservation

This UI redesign maintains 100% backward-compatibility with all existing unit and acceptance tests:
- Preserves `data-testid="learning-guided-prompt"` and `data-testid="learn-sidebar"` on `/learn`.
- Preserves canonical slugs: `/learn/superposition`, `/learn/measurement`, `/learn/bell-state`.
- Preserves contract types in `board/contracts/learning-content.md` (`ModuleDetail`, `LearnerProfile`, `LearningPath`).
- Meets all accessibility benchmarks: full keyboard navigation (`Tab` through nodes, `Enter` to open popover, `Space` to launch, `Esc` to close), color-independent state glyphs, and projector readability at $1366 \times 768$.
