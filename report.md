# Q-Trace UI/UX Transformation Report: Achieving Linear-Grade Perfection

> **Author**: Antigravity Design & Engineering Team  
> **Date**: September 24, 2026  
> **Target**: Q-Trace Quantum Learning Platform (`https://q-trace-web.vercel.app/`)  
> **Goal**: Complete architectural and visual redesign to eliminate cognitive overload, implement Linear-grade craftsmanship, support dual themes (Dark + Light mode, defaulting to System), and satisfy demanding hackathon judging panels.

---

## 1. Executive Summary & The "Judges' Feedback" Diagnostic

During recent evaluations, judges provided harsh but critical feedback:  
> *"We can't easily process this much information showing in every component... it looks cluttered and overwhelming."*

A thorough visual inspection of the live application at `https://q-trace-web.vercel.app/` reveals that while the underlying quantum mechanics and Qiskit Aer simulation engine are robust, the interface suffers from **acute cognitive overload and visual noise**. Rather than presenting a refined, professional software instrument, the platform currently presents itself as an unstyled developer debug harness.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CURRENT Q-TRACE DESIGN PATHOLOGIES                   │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Developer Telemetry Leaks   │ Raw request IDs, contract IDs, and    │
│                                │ database keys dumped into UI cards.   │
├────────────────────────────────┼───────────────────────────────────────┤
│ 2. Nested Box Syndrome         │ Cards nested inside cards with harsh  │
│                                │ 1px high-contrast borders everywhere. │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. 4,000px Vertical Doom-Scroll│ Every single panel, code editor, and  │
│                                │ diagnostic chart stacked in one column│
├────────────────────────────────┼───────────────────────────────────────┤
│ 4. Visual Loudness & Glows     │ Neon cyan glows, competing badge fills│
│                                │ and heavy uppercase display type.     │
├────────────────────────────────┼───────────────────────────────────────┤
│ 5. Header Navbar Congestion    │ 25-word persona bio paragraphs crammed│
│                                │ directly into the top navigation bar. │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Why the Current UI Overwhelms Users: The 5 Core Flaws

### Flaw 1: Developer Telemetry Pollution
The UI forces judges and learners to read raw implementation artifacts that belong in backend logs, not user interfaces:
- **Raw Request & Session IDs**: Badges like `Req: req_live_muf90u1k_hl6qqm` and `ID: progress_lp_aarav` take prime real estate in headers.
- **Raw JSON Keys in Evidence Cards**: Flight Recorder and Tutor views show literal internal state paths:
  - `Evidence keys: stateTrace.0.basisProbabilities`
  - `Grounded Simulator Evidence Key: stateTrace.1.basisProbabilities.00`
- **Raw Enum Identifiers**:
  - `MISCONCEPTION SIGNAL: NO_SIGNAL`
  - `Deterministic Acceptance Rule: PROBABILITY_SUPPORT_EQUALS`
  - `Learner Prediction: ✕ CORRELATED_00_11`
  - `MIXED_SUBSYSTEM`
- **Unrounded Floating Point Numbers**:
  - Bloch coordinates displayed as `(x: 1, y: 0, z: 2.220446049250313e-16)` and `tolerance ε = 0.000001`.

*Judges do not care about internal variable names; they care about quantum concepts, intuitive outcomes, and clean feedback.*

### Flaw 2: The 4,000px Vertical Doom-Scroll
On both the Circuit Lab (`/lab`) and Learn Module (`/learn/bell-state`), the interface forces the user through a massive vertical scroll:
1. Header + Role banner
2. Preset Toolbar
3. "Ready to Simulate" Card (with Run Button #1)
4. Interactive Circuit Grid + Gate Palette
5. Synchronized Qiskit Code Editor
6. "Ready to Simulate" Card #2 (with Run Button #2 — duplicate!)
7. Statevector Basis Probability Bars
8. Sampled Measurement Histogram Bars
9. 3D Bloch Spheres
10. Flight Recorder State Trace Replay
11. Step Details & Reduced Density Matrices

There are **two identical large cyan "Run Simulation" buttons** on the same `/lab` page. A user cannot keep the circuit and its resulting measurement distributions in view simultaneously without scrolling back and forth.

### Flaw 3: Distracting Curriculum Sidebar on Lesson Pages
On `/learn/bell-state`, 25%–33% of the horizontal screen is occupied by a persistent `LearnSidebar` that lists:
- Bell Correlation Benchmark
- CHSH Inequality Card
- Future Stage 4 Algorithms: *Grover's Search Algorithm*, *Quantum Fourier Transform (QFT)*, and *Variational Quantum Eigensolver (VQE)* with full stage tags and gate lists.

Showing future, unrelated algorithms while a learner is attempting Step 1 (Predicting a 2-qubit Bell pair) divides attention and creates cognitive exhaustion.

### Flaw 4: "Nested Box Syndrome" & Border Clutter
Every piece of information is encased inside a card, which sits inside another card, which sits on a dark panel, all outlined by high-contrast borders (`#1c2138` and `#2b3355`):
- A card for presets
- A card for workspace
- A sub-card for gate palette
- A sub-card for qubit wires
- A sub-card for footer actions
- A card for code
- A card for simulation prompts
- A card for visual evidence
The eye cannot rest because there are 30+ intersecting border rectangles on every screen.

### Flaw 5: Header Clutter
The top navigation bar contains:
- Logo & subtitle (`Q-TRACE QUANTUM FLIGHT RECORDER`)
- 4 navigation links
- "DEMO ROLE" label
- 3 segmented pill buttons (Aarav, Meera, Dr. Rao)
- **A full multi-line bio**: `"Aarav: CSE Undergraduate · Strong Python, beginner in quantum mechanics & linear algebra"`

This breaks header alignment, wraps awkwardly on laptops, and pushes critical controls down.

---

## 3. The Linear Design Philosophy Demystified

Linear (`linear.app`) is widely celebrated as the pinnacle of modern web craftsmanship. What makes Linear look and feel so high-class?

| Linear Design Principle | How Linear Does It | How Q-Trace Currently Does It | What Q-Trace Must Do |
|---|---|---|---|
| **Border Restraint** | Translucent hairline borders (`rgba(255,255,255,0.08)` in dark, `rgba(0,0,0,0.08)` in light). Subtle division, not boxed containment. | Heavy, opaque borders (`#1c2138`, `#2b3355`) on every element. | Replace hard borders with 1px translucent borders and surface tonal shifts. |
| **Typography** | Pure `Inter` or `Geist` with tight tracking (`-0.015em`), medium weights (500), high contrast primary text, soft secondary. | Wide `Space Grotesk` display font + raw monospace JetBrains Mono tags. | Switch to clean Inter/Geist typography; demote monospace to actual code editor only. |
| **Surface Elevation** | 3-tier subtle grayscale elevation (`#08090a` canvas → `#121316` card → `#18191c` elevated hover). No colored backgrounds. | Deep navy `#06070d` with harsh 48px grid lines and cyan radial glows. | Pure monochromatic neutral dark canvas; subtle neutral hover states. |
| **Surgical Accent** | 98% monochromatic. Color is used strictly as a 2px indicator, subtle pill, or active status dot. | Electric cyan `#22d3ee` everywhere + heavy glowing dropshadows (`shadow-glow`). | Remove neon box-shadows. Use accent color only on active toggles, primary CTA, and wire connections. |
| **Progressive Disclosure** | Show only what the user is deciding right now. Deep details live in drawers, tabs, or inspector panels. | Vertical stack: 10 complex components rendered simultaneously down a 4,000px page. | Stage-based progressive flows for both Lab and Learn. |
| **Component Sizing** | Compact, dense, keyboard-friendly: 32px (`h-8`) and 36px (`h-9`) controls, 12px/13px text, tight 8px/12px padding. | Sprawling 48px buttons, giant cards with `p-8`, massive gate soundboard buttons. | Standardize on compact 32px/36px control heights and disciplined 8pt grid. |

---

## 4. The New Dual-Theme System (Dark + Light, Defaulting to System)

As requested, Q-Trace will support both **Dark Mode** and **Light Mode**, defaulting automatically to the user's **System Preference** using `next-themes`.

### 4.1 Token Architecture (`globals.css`)

```css
/* ==========================================================================
   Q-TRACE DESIGN SYSTEM: LINEAR SPECIFICATION (LIGHT & DARK)
   ========================================================================== */

:root {
  /* LIGHT MODE (Clean, airy, high-contrast porcelain) */
  --bg-canvas: #ffffff;
  --bg-surface: #f9fafb;
  --bg-surface-raised: #f3f4f6;
  --bg-surface-active: #e5e7eb;

  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-default: rgba(0, 0, 0, 0.1);
  --border-strong: rgba(0, 0, 0, 0.18);

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --text-faint: #cbd5e1;

  /* Quantum Accents (Refined & Accessible) */
  --accent: #0284c7;             /* Precision Quantum Sky */
  --accent-subtle: #f0f9ff;
  --accent-border: #bae6fd;
  --accent-foreground: #ffffff;

  --success: #059669;            /* Verified Evidence Emerald */
  --success-subtle: #ecfdf5;
  --success-border: #a7f3d0;

  --warning: #d97706;            /* Prediction Divergence Amber */
  --warning-subtle: #fffbeb;
  --warning-border: #fde68a;

  --danger: #dc2626;             /* Misconception / Error Rose */
  --danger-subtle: #fef2f2;
  --danger-border: #fecaca;

  --violet: #7c3aed;             /* Entanglement / CNOT Target */
  --violet-subtle: #f5f3ff;
  --violet-border: #ddd6fe;

  color-scheme: light;
}

.dark {
  /* DARK MODE (Linear-grade deep carbon obsidian) */
  --bg-canvas: #08090a;
  --bg-surface: #121316;
  --bg-surface-raised: #18191c;
  --bg-surface-active: #222429;

  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-default: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.15);

  --text-primary: #f7f8f8;
  --text-secondary: #8a8f98;
  --text-muted: #575a61;
  --text-faint: #34373d;

  /* Quantum Accents (Surgical luminescence) */
  --accent: #38bdf8;             /* Precision Quantum Cyan */
  --accent-subtle: rgba(56, 189, 248, 0.1);
  --accent-border: rgba(56, 189, 248, 0.25);
  --accent-foreground: #08090a;

  --success: #34d399;            /* Verified Evidence Emerald */
  --success-subtle: rgba(52, 211, 153, 0.1);
  --success-border: rgba(52, 211, 153, 0.25);

  --warning: #fbbf24;            /* Prediction Divergence Amber */
  --warning-subtle: rgba(251, 191, 36, 0.1);
  --warning-border: rgba(251, 191, 36, 0.25);

  --danger: #f87171;             /* Misconception / Error Rose */
  --danger-subtle: rgba(248, 113, 113, 0.1);
  --danger-border: rgba(248, 113, 113, 0.25);

  --violet: #a78bfa;             /* Entanglement / CNOT Target */
  --violet-subtle: rgba(167, 139, 250, 0.1);
  --violet-border: rgba(167, 139, 250, 0.25);

  color-scheme: dark;
}
```

### 4.2 Eliminating the Ugly Background & Glows
- **Remove** the harsh 48px grid overlay and electric cyan radial gradient in `body`.
- In Dark Mode, replace with a subtle, velvety radial depth:
  `background: radial-gradient(ellipse 60% 40% at 50% -10%, rgba(56, 189, 248, 0.04), transparent), var(--bg-canvas);`
- **Eliminate** `shadow-glow: 0 0 24px ...` which creates cartoonish neon rings around buttons. Linear uses crisp 1px borders and refined inset shadows:
  `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 2px rgba(0, 0, 0, 0.3);`

---

## 5. Layout Architecture & Component Experiments

Based on our interactive design review, we are implementing two major layout transformations:

### 5.1 Transformation 1: Circuit Lab (`/lab`) 3-Stage Studio Flow

Currently, `/lab` is an overwhelming single vertical scroll with duplicate buttons. We are replacing this with a **3-Stage Sequential Studio Workflow**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE CONTROLLER: [ 1. Design Circuit ] ──> [ 2. Evidence ] ──> [ 3. Trace ]│
└─────────────────────────────────────────────────────────────────────────────┘
  STAGE 1: DESIGN & CONSTRUCT
  ┌───────────────────────────────────────────────────────────────────────────┐
  │  Presets: [ Bell State Seed ] [ Superposition ] [ Clear ]                │
  │  ┌───────────────────────────────┐ ┌───────────────────────────────────┐  │
  │  │ Interactive Wire Grid (q0, q1)│ │ Synchronized Qiskit (Python)      │  │
  │  │ Palette: [H] [X] [Y] [Z] [CX] │ │ qc.h(0); qc.cx(0,1); ...          │  │
  │  └───────────────────────────────┘ └───────────────────────────────────┘  │
  │  [ ▶ Run Simulation on Qiskit Aer (1024 Shots) ]                          │
  └───────────────────────────────────────────────────────────────────────────┘
                           │ (User clicks Run)
                           ▼
  STAGE 2: VISUAL EVIDENCE (Smoothly reveals below / auto-focuses)
  ┌───────────────────────────────────────────────────────────────────────────┐
  │  State Basis Probabilities P(|ψ⟩)  │  1024-Shot Sampled Histogram Counts  │
  │  |00⟩ ── 50.0%                     │  '00' ── 512 counts                  │
  │  |11⟩ ── 50.0%                     │  '11' ── 512 counts                  │
  │  3D Bloch Sphere View (Subsystem Purity Tr(ρ²): 0.500 [MIXED])            │
  └───────────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
  STAGE 3: FLIGHT RECORDER & DIAGNOSIS
  ┌───────────────────────────────────────────────────────────────────────────┐
  │  Replay Trace: [ Step 0: After H ] ──> [ Step 1: After CNOT ]            │
  │  Outcome: State Correlation Verified · No Divergence Detected            │
  └───────────────────────────────────────────────────────────────────────────┘
```

#### Key Enhancements in `/lab`:
1. **Single Simulation Trigger**: Exactly one primary "Run Simulation" button.
2. **Side-by-Side Builder & Code**: On desktop (`lg`), the circuit wire grid and the Qiskit code editor sit side-by-side in a 7:5 ratio rather than vertically stacked.
3. **Collapsible Gate Palette**: Compact horizontal strip (`h-10`) above wires rather than giant square cards.
4. **Instant Stage Focus**: Running the simulation unlocks Stage 2 (Visual Evidence) with a smooth scroll-into-view animation and a stage completion checkmark.

---

### 5.2 Transformation 2: Learn Module (`/learn/[slug]`) Distraction-Free Stepper

The user confirmed that a 7-step stepper is already written in `learn/bell-state/page.tsx`, but it feels cluttered because of the heavy sidebar and card-inside-card bloat.

#### The Fix:
1. **Move Syllabus to Dedicated `/learn` Page**:
   - The `/learn` catalog page houses the algorithm directory (Grover, QFT, VQE) and progress overview.
   - The lesson page `/learn/bell-state` is freed from the left sidebar, giving 100% of the viewport to the active learning step.
   - A clean breadcrumb at the top (`Learn / Bell State Entanglement`) lets users return to the catalog anytime.
2. **Progressive Step Pills**:
   - Previous completed steps collapse into a sleek 1-line summary:
     `✓ Step 1: Prediction — Entangled outcomes (50% |00⟩, 50% |11⟩) confirmed`
   - Only the **active step is expanded**.
   - Next/Previous controls are pinned in a sleek bottom or top action dock.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Learn / Bell State Entanglement                                │
│                                                                             │
│  [✓ 01 Predict] ── [✓ 02 Circuit] ── [● 03 Evidence] ── [04 Diagnosis] ... │
├─────────────────────────────────────────────────────────────────────────────┤
│  STEP 3 · VISUAL EVIDENCE                                                  │
│  Ideal Statevector vs 1024-Shot Measurement Distribution                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ |00⟩ ████████████████████  50.0% (P = 0.50)                           │  │
│  │ |11⟩ ████████████████████  50.0% (P = 0.50)                           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [ ← Back to Circuit ]                       [ Continue to Diagnosis → ]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.3 Transformation 3: Sleek Header & Role Switcher

#### Current Flaw:
The header contains a 25-word paragraph bio for the demo role, causing severe wrap and clutter.

#### The Fix:
- Replace the bio with a sleek, compact **Linear-style Role Switcher Dropdown**:
  - Displays avatar / pill: `[ Aarav (Beginner CSE) ▾ ]`
  - Clicking opens a polished dropdown menu showing all 3 personas (Aarav, Meera, Dr. Rao) with their descriptions cleanly formatted inside the menu.
- Add a **Theme Toggle** (Sun / Moon / System) directly adjacent to the role switcher.
- Header height locked to a svelte `h-14` (56px) with a subtle hairline bottom border `border-b border-border-subtle backdrop-blur-md`.

---

## 6. Purging Developer Telemetry: The Translation Matrix

Per our design alignment, **all raw developer request IDs, contract IDs, and raw enums will be completely removed from user-visible card copy**.

| Location / Component | Current Cluttered Copy (To Purge) | New Linear-Grade Human Copy |
|---|---|---|
| **Header Eyebrows** | `Req: req_live_muf90u1k_hl6qqm` | *Removed completely from visible card.* (Logged to DevTools console only). |
| **Header Eyebrows** | `ID: mod_bell_state`, `ID: progress_lp_aarav` | *Removed completely.* Replaced with clean breadcrumb. |
| **Card Footers** | `ID: ch_bell_repair` | *Removed completely.* Display "+100 Points" badge only. |
| **Evidence Keys** | `stateTrace.0.basisProbabilities` | **"Hadamard Basis Superposition"** |
| **Evidence Keys** | `stateTrace.1.basisProbabilities.00` | **"Entangled Correlation (q0 ⊗ q1)"** |
| **Flight Recorder** | `MISCONCEPTION SIGNAL: NO_SIGNAL` | **"Status: Mental Model Verified"** (Green dot + clean label) |
| **Flight Recorder** | `Learner Prediction: ✕ CORRELATED_00_11` | **"Predicted: Entangled Pair (|00⟩ & |11⟩)"** |
| **Acceptance Rules** | `Deterministic Acceptance Rule: PROBABILITY_SUPPORT_EQUALS` | **"Target: Produce 50% |00⟩ and 50% |11⟩"** |
| **Acceptance Rules** | `(tolerance ε = 0.000001)` | *Removed completely.* (Checked silently by backend). |
| **Bloch Coordinates** | `Bloch vector: (x: 1, y: 0, z: 2.220446049250313e-16)` | `Bloch: x: 1.00 · y: 0.00 · z: 0.00` |
| **Purity Labels** | `MIXED_SUBSYSTEM (Purity: 0.500)` | **"Entangled Subsystem · Purity 0.50"** |

---

## 7. Required Changes in Documentation & Contracts

To ensure our team builds in sync and adheres to the new standard, the following files must be updated first:

### 1. `docs/DESIGN-SYSTEM.md`
- **Section 1 (Intent)**: Redefine the design language from "Observatory Dark" to **"Precision Quantum Instrument — Linear Specification"**.
- **Section 2 (Tokens)**: Replace the hardcoded dark palette with the **Dual-Theme CSS Variable System** (Light mode `:root` and Dark mode `.dark`).
- **Section 3 (Typography)**: Standardize on **Inter / Geist** for all UI and Display text; limit **JetBrains Mono** strictly to Qiskit code editor and mathematical formulas.
- **Section 4 (Layout Archetypes)**:
  - Add `studio-workbench` archetype for `/lab` (3-stage flow).
  - Add `stepper-canvas` archetype for `/learn/[slug]` (distraction-free single column).
- **Section 7 (Banned Patterns)**: Add:
  - *Banned*: Exposing raw database IDs (`req_...`, `ch_...`, `lp_...`) in UI text.
  - *Banned*: Exposing raw JSON state paths (`stateTrace.x.y`) in card text.
  - *Banned*: Unrounded floating point values (must format with `.toFixed(2)`).
  - *Banned*: Glowing neon cyan drop shadows (`shadow-glow`).

### 2. `.agents/rules/stack/quantum-ui.md`
- Update rule 7: *"A Bloch vector with purity < 1 is labeled 'Entangled Subsystem (Purity: x.xx)'; never display unrounded machine-epsilon floats."*
- Update rule 10: *"Contracts provide IDs for network and test traceability, but UI components MUST format keys into human-readable labels."*
- Add rule 19: *"All UI components must be theme-neutral, using semantic variables (`bg-surface`, `text-primary`, `border-subtle`) rather than hardcoded dark tokens."*

### 3. `board/contracts/*.md`
- Annotate `circuit-simulation.md`, `flight-recorder-tutor.md`, and `progress-analytics.md` with a standard note:
  > **Presentation Contract**: Field identifiers like `operationId`, `requestId`, `challengeId`, and `evidenceKeys` are transport identifiers. Frontend implementations must map them to human-readable strings via UI presenter utilities.

---

## 8. Implementation Roadmap (Phased Execution)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PHASED IMPLEMENTATION PLAN                        │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: FOUNDATIONS (Tokens, Theme Engine & Base UI)                  │
│ • Install and configure `next-themes` with default='system'            │
│ • Rewrite `apps/web/app/globals.css` with dual-theme Linear tokens     │
│ • Refactor `Button`, `Badge`, `Card`, and `Tabs` components            │
│                                                                        │
│ PHASE 2: GLOBAL SHELL (Header & Navigation)                            │
│ • Refactor `app-header.tsx`: Clean brand, h-14 sticky, theme toggle    │
│ • Refactor `role-switcher.tsx`: Clean dropdown menu without bio clutter│
│ • Clean `page-header.tsx`: Breadcrumb navigation, purge request IDs    │
│                                                                        │
│ PHASE 3: CIRCUIT LAB (`/lab`) 3-STAGE STUDIO FLOW                      │
│ • Implement 3-Stage horizontal stepper: Construct -> Evidence -> Trace │
│ • Consolidate to a SINGLE "Run Simulation" button                      │
│ • Refactor gate palette into sleek 36px horizontal strip               │
│ • Side-by-side wire grid & Qiskit code editor layout                   │
│                                                                        │
│ PHASE 4: LEARN MODULE (`/learn/[slug]`) DISTRACTION-FREE CANVAS        │
│ • Remove heavy `LearnSidebar` from `/learn/[slug]`                     │
│ • House full algorithm catalog on `/learn` index page                  │
│ • Polish 7-step progressive disclosure with collapsible summary pills  │
│                                                                        │
│ PHASE 5: TELEMETRY PURGE & NUMBER FORMATTING                           │
│ • Replace raw JSON keys with human quantum concepts                    │
│ • Format all Bloch vector floats to 2 decimal places                   │
│ • Strip `tolerance` and raw enum text from repair challenge cards      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Conclusion

By executing this redesign:
1. **Cognitive load will plummet**: Judges will see one clear decision or outcome at a time instead of a 4,000px wall of cards.
2. **Visual aesthetics will match Linear**: Subtle hairline borders, velvety surfaces, beautiful Inter typography, and surgical accent colors will make Q-Trace feel like an Apple or Linear-grade engineering masterpiece.
3. **Accessibility and delight will surge**: Complete dark and light mode support with automatic system synchronization will ensure the platform looks breathtaking on high-contrast presentation projectors and laptops alike.
