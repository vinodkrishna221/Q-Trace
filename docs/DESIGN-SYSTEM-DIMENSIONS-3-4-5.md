# Q-Trace Design System — Dimensions 3, 4 & 5

> Scientific Developer Instrument Specifications for Q-Trace (Quantum Flight Recorder)
> Covering: Component System & Surface Anatomy, Micro-Interactions & Animation Choreography, and the Anti-AI Slop Checklist.

---

# DIMENSION 3: Component System & Surface Anatomy

## 1. The Circuit Workspace Card
*Source Context: `apps/web/features/circuit/qubit-wire.tsx`, `apps/web/features/circuit/gate-palette.tsx`*

```
       Wire Rail q[0]                                             Gate Slot
┌─────────────────────────┬──────────────────────────────────┬────────────────────────┐
│  q[0]  |0⟩ ─────────────┼───────────────[ H ]──────────────┼───────────●────────────┤
└─────────────────────────┴──────────────────────────────────┴───────────│────────────┘
       Wire Rail q[1]                                                     │ CNOT Link
┌─────────────────────────┬──────────────────────────────────┬────────────│───────────┐
│  q[1]  |0⟩ ─────────────┼──────────────────────────────────┼───────────⊕────────────┤
└─────────────────────────┴──────────────────────────────────┴────────────────────────┘
       Classical Bus c
═════════════════════════════════════════════════════════════════════════╤══════════════
                                                                         │ Measure (M)
```

### A. Wire Rails (`q[0]`, `q[1]`)
- **Geometry**: Continuous $1.5\text{px}$ solid vector rail drawn horizontally and centered vertically at `top: 50%` of each qubit channel.
- **Stroke & Opacity**:
  - Inactive / Baseline: `--border-medium` (`rgba(255, 255, 255, 0.16)` in dark mode / `rgba(11, 15, 23, 0.16)` in light mode).
  - Active execution sweep: Gradient sweep with `--gate-h` head illuminating the wire as the unitary clock passes.
- **Channel Header Badge**:
  - Left register identifier: `q[0] |0⟩`.
  - Dimensions: Fixed $24\text{px}$ height (`h-6 px-2`).
  - Styling: Milled sunken well (`bg-surface-sunken border border-border-subtle rounded-sm font-mono text-[11px] font-bold text-text-primary`).

### B. Quantum State Wires vs. Classical Measurement Channels
- **Quantum State Wire ($q[i]$)**: Single continuous $1.5\text{px}$ rail representing quantum phase and probability amplitudes.
- **Classical Measurement Bus ($c$)**: Double hairline rail ($1\text{px}$ stroke, $2\text{px}$ transparent gap, $1\text{px}$ stroke) rendered in `--text-muted`. A downward right-angle tap line connects the measurement gate $M$ to $c[i]$, clearly demarcating wavefunction collapse into classical bit storage.

### C. Gate Chips
- **Geometry**: $44\text{px} \times 44\text{px}$ rounded rectangle (`rounded-md`, $6\text{px}$ radius). Avoid circular pills for standard gates to preserve structural alignment with the grid.
- **Surface Finish**: Anodized milled surface with specular top highlight:
  ```css
  box-shadow: inset 0 1px 0 0 var(--bevel-specular), 0 1px 3px rgba(0, 0, 0, 0.25);
  ```
- **Typography**:
  - Primary gate glyph: JetBrains Mono 14px bold (`font-mono font-bold tracking-tight text-text-primary`).
  - Subtitle subscript: 8px uppercase sans (`tracking-wider text-text-secondary`).
- **Drag & Interaction Preview**:
  - Hover: Elevation lift (`translateY(-1px)`), border shifts to `--border-strong`.
  - Dragging (Active): Scale `1.05`, opacity `0.92`, shadow increases to `0 8px 16px rgba(0, 0, 0, 0.3)`.
  - Target Drop Slot: $1\text{px}$ dashed perimeter outline in `--border-strong` with zero layout shift.

---

## 2. The Prediction Checkpoint & Concept Card
*Source Context: `apps/web/features/learning/prediction-checkpoint.tsx`*

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ [STEP 1 · PREDICTION CHECKPOINT]                                     [Draft Saved]    │
│ ❓ What is the state of qubit 1 after the CNOT gate is executed?                      │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Formula Context:                                                                      │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │  |\Psi\rangle = \frac{1}{\sqrt{2}}|00\rangle + \frac{1}{\sqrt{2}}|11\rangle      │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│ [○] INDEPENDENT_RANDOM                                                                │
│     Qubit 1 collapses to 50% |0⟩ or |1⟩ independently of Qubit 0                      │
│                                                                                       │
│ [●] CORRELATED_00_11  ◄ (Selected Mechanical Detent)                                 │
│     Entangled state: outcomes are deterministic and correlated on every measurement   │
│                                                                                       │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Selected: CORRELATED_00_11                           [ Confirm & Advance to Run → ]  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### A. Container & Dividing Architecture
- **Container**: Precision instrument card (`bg-surface border border-border-subtle rounded-lg shadow-instrument p-5`).
- **Dividers**: $1\text{px}$ hairline rules using `--border-subtle` (`my-4`).
- **LaTeX Formula Well**:
  - Displayed in a sunken, milled trough (`bg-surface-sunken border border-border-subtle rounded-md p-3 my-3`).
  - KaTeX rendering scaled to `1.05em`, color mapped to `--text-primary`.

### B. Tactile Instrument Toggle Cards (Replacing Generic Radios)
- **Accessibility & Test Safety**: Must retain `role="radio"`, `aria-checked`, and `data-testid={`prediction-opt-${opt}`}` to guarantee all test suites pass.
- **Unselected State**:
  - Container: `--bg-surface` with $1\text{px}$ `--border-subtle`.
  - Indicator: $14\text{px}$ milled sunken ring (`border border-border-medium rounded-full bg-surface-sunken`).
  - Typography: Option enum token in JetBrains Mono (`text-xs font-semibold text-text-primary`), conceptual description in Inter (`text-[11px] text-text-secondary leading-relaxed`).
- **Selected State**:
  - Container: `--bg-surface-raised` with $1\text{px}$ `--border-strong`.
  - Top Bevel: `box-shadow: inset 0 1px 0 0 var(--bevel-specular)`.
  - Indicator: Solid active center node with a 2px concentric ring (`bg-accent ring-2 ring-accent/30`).
- **Confirmation Button**:
  - Anodized instrument action button with micro-depress (`active:scale-[0.985]`).

---

## 3. The Flight Recorder Wow-Moment Card
*Source Context: `apps/web/features/flight-recorder/flight-recorder-view.tsx`*

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ [FLIGHT RECORDER] · REPLAY TIMELINE                             [Confidence: 100%]    │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│ Step 0: |00⟩ Initial ──► Step 1: H Gate (q0) ──► [Step 2: CNOT Divergence Point ⚠]    │
│                                                  ▲ First divergence detected here     │
│ ───────────────────────────────────────────────────────────────────────────────────── │
│  DIAGNOSTIC EVIDENCE COMPARISON                                                       │
│ ┌───────────────────────────────────┬───────────────────────────────────────────────┐ │
│ │ Learner Mental Model              │ Verified Quantum Physics (Qiskit Aer)        │ │
│ │ ✕ INDEPENDENT_RANDOM              │ ✓ CORRELATED_00_11                            │ │
│ │ Subsystem assumed independent     │ Entangled Bell State |\Phi^+\rangle           │ │
│ └───────────────────────────────────┴───────────────────────────────────────────────┘ │
│                                                                                       │
│ Telemetry Note:                                                                       │
│ "Entangled Subsystem · Reduced Purity Tr(\rho^2) = 0.50. Measurement collapses both." │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### A. Spotlighting Divergence Without Alarmist Red
- **Philosophy**: Divergence is a productive learning milestone, not a catastrophic server error.
- **Forbidden**: Flashing neon crimson overlays (`bg-red-950 text-red-200 animate-ping`).
- **Allowed Solution**: **Diagnostic Amber Sonar Ribbon**:
  - Tinted amber background (`rgba(245, 158, 11, 0.08)` in dark mode / `rgba(194, 65, 12, 0.06)` in light mode).
  - Border: $1\text{px}$ solid `--evidence-diverge` (`#f59e0b` dark / `#c2410c` light).
  - Icon: Controlled delta symbol (`Δ MISMATCH AT STEP 2`) instead of aggressive red `✕`.

### B. Trace Step Scrubber & Timeline UI
- **Timeline Structure**: Horizontal sequence of discrete instrument steps (`Step 0`, `Step 1`, `Step 2`, etc.).
- **Active Step Marker**: Top indicator notch (`w-full h-[2px] bg-accent`).
- **Divergent Step Marker**: Amber indicator pip with a controlled 2-pulse sonar animation (scales to $1.2\times$ and halts).
- **Test Integrity**: Preserves `data-testid="first-divergence-step"` and `data-testid="misconception-code"`.

---

## 4. Telemetry & Header Badges
*Source Context: `apps/web/components/ui/badge.tsx`*

### A. ID Sanitization with Retained Test Anchors
- **User-Facing Presentation**: Raw database IDs (`req_live_abc123`, `ch_entangle_01`, `progress_lp_01`) are stripped from high-level headers and replaced with semantic human labels ("Target State Match", "Bell State Synthesis").
- **Test Compatibility**: Technical IDs are rendered in the card footer or accessible metadata nodes with `data-testid="request-id"` preserved:
  ```tsx
  <div className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
    <span>Req:</span>
    <span data-testid="request-id">{requestId}</span>
  </div>
  ```

### B. Live Status Chip Anatomy
- **Dimensions**: Fixed $22\text{px}$ height (`h-[22px] px-2.5 rounded-full font-mono text-[11px]`).
- **Live Status Pip**: $6\text{px}$ circular node preceding the label:
  - **Qiskit Aer Live**: Pulsing `--evidence-success` pip + `"Qiskit Aer (Local Simulator)"`.
  - **Shots Counter**: Muted telemetry pip + `"1024 shots · 8ms"`.
  - **Offline Fallback**: Amber pip + `"DEMO_LOCAL (Offline Seed)"`.

---

# DIMENSION 4: Micro-Interactions & Animation Choreography

All animations use GPU-accelerated transforms (`transform`, `opacity`, `filter`), maintaining a strict 60fps frame budget with **zero layout shift**.

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                            6 SIGNATURE MICRO-INTERACTIONS                             │
├───────────────────────────────┬───────────────────────────────────────────────────────┤
│ 1. Quantum Unitary Scan       │ 4. Interactive Checkpoint Confirmation                │
│    Clock playhead sweep       │    Mechanical tactile switch depress & checkmark draw │
│    across wires (900ms ease)  │    (stiffness: 500, damping: 30)                      │
├───────────────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Magnetic Gate Snap         │ 5. Bloch Sphere Vector Interpolation                  │
│    Slot docking with haptic   │    Spherical linear interpolation (SLERP) +           │
│    spring (stiffness: 450)    │    origin contraction on mixed state (500ms)          │
├───────────────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Divergence Discovery       │ 6. Theme Switcher Cross-Fade                          │
│    Amber sonar ripple & drawer│    CSS View Transitions API cross-fade                │
│    expansion (320ms cubic)    │    (180ms easeInOut, no element flash)                │
└───────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 1. Quantum Unitary Execution Scan (Timeline Sweep)
- **Physics Rationale**: In strict accordance with `.agents/rules/stack/quantum-ui.md:14`, quantum visualizations must represent mathematical state evolution, not physical particle trajectories. Qubits are not balls flying along wires.
- **Behavior**: An illuminated hairline scanhead (gradient line, $1.5\text{px}$ stroke) sweeps across the circuit columns from left to right over 900ms. As it intersects each gate, the gate chip momentarily brightens (`filter: brightness(1.2) translateY(-1px)`) for 120ms and emits a subtle $2\text{px}$ perimeter glow before settling.

### Implementation:
```css
/* Zero-Dependency Native CSS */
@keyframes timeline-scan {
  0% { transform: translateX(0%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}

.animate-unitary-scan {
  animation: timeline-scan 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

```typescript
// Framer Motion / Motion Variant
export const executionScanVariant = {
  initial: { left: '0%', opacity: 0 },
  animate: {
    left: '100%',
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
  }
};
```

---

## 2. Magnetic Gate Snap
- **Behavior**: When releasing a gate into a wire slot, the gate snaps into place with an overdamped mechanical spring recoil (`scale: 1.05 -> 0.98 -> 1.0`), simulating a precision physical keycap docking into an anodized socket.

### Implementation:
```css
/* Zero-Dependency Native CSS Fallback */
@keyframes gate-dock {
  0% { transform: scale(1.06); }
  60% { transform: scale(0.98); }
  100% { transform: scale(1.0); }
}

.animate-gate-dock {
  animation: gate-dock 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

```typescript
// Framer Motion / Motion Preset
export const magneticGateSnap = {
  initial: { scale: 1.06, opacity: 0.85 },
  animate: { scale: 1.0, opacity: 1.0 },
  transition: {
    type: 'spring',
    stiffness: 450,
    damping: 28,
    mass: 0.75
  }
};
```

---

## 3. Divergence Discovery Reveal
- **Behavior**: During the Flight Recorder step replay, reaching the divergence step pauses playback for 200ms. The divergence badge emits a localized amber sonar ripple (border ring expands from $1\text{px}$ to $4\text{px}$ with opacity falloff, zero layout shift), followed by a smooth downward expansion of the Diagnostic Comparison Drawer.

### Implementation:
```typescript
// Framer Motion / Motion Preset
export const divergenceDrawer = {
  hidden: { opacity: 0, height: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    height: 'auto',
    scale: 1.0,
    transition: {
      height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.22, delay: 0.08 }
    }
  }
};
```

---

## 4. Interactive Checkpoint Confirmation
- **Behavior**: Clicking an option activates a tactile button depress (`scale: 0.985`, 60ms). Triggering "Confirm Prediction" draws the SVG checkmark path (`pathLength: 0 -> 1` over 240ms), while the card border transitions smoothly to `--border-strong`.

### Implementation:
```typescript
// Framer Motion / Motion Preset
export const tactilePress = {
  rest: { scale: 1 },
  pressed: { scale: 0.985, transition: { duration: 0.06 } },
  selected: {
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 30 }
  }
};

export const checkmarkDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.24, ease: 'easeOut' }
  }
};
```

---

## 5. Bloch Sphere Vector Interpolation
- **Behavior**: State transitions on the Bloch sphere must never snap discontinuously. The state vector executes Spherical Linear Interpolation (SLERP) along the geodesic sphere arc over 500ms. When transitioning to an entangled mixed state ($r = 0$), the vector contracts radially into the origin while the mixed-state interior core expands smoothly.

### Mathematical Algorithm:
```typescript
export function slerpBlochVector(
  v0: [number, number, number],
  v1: [number, number, number],
  t: number
): [number, number, number] {
  const dot = Math.max(-1, Math.min(1, v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2]));
  const theta = Math.acos(dot) * t;
  const relative = [v1[0] - v0[0] * dot, v1[1] - v0[1] * dot, v1[2] - v0[2] * dot];
  const len = Math.hypot(...relative);
  if (len < 1e-6) return v0;
  const norm = relative.map((val) => val / len);
  return [
    v0[0] * Math.cos(theta) + norm[0] * Math.sin(theta),
    v0[1] * Math.cos(theta) + norm[1] * Math.sin(theta),
    v0[2] * Math.cos(theta) + norm[2] * Math.sin(theta),
  ];
}
```

---

## 6. Theme Switcher Transition
- **Behavior**: Switching between Dark Carbon and Light Porcelain must avoid white screen flashes, element pop, or font flickering. Using the modern CSS View Transitions API, the transition executes a cross-fade of surface layers.

### Implementation:
```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 180ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

# DIMENSION 5: What to Strictly Avoid ("Anti-AI Slop Checklist")

| # | Banned "AI Slop" Anti-Pattern | Why It Destroys Scientific Credibility | World-Class Professional Alternative |
|---|---|---|---|
| **1** | **Multi-Color Neon Glows (`shadow-[0_0_30px_#a855f7]`)** | Signals an uncalibrated crypto landing page or amateur template; induces visual fatigue in dense data views. | **1px Anodized Hairline Bevels**: `box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.3)`. |
| **2** | **Indiscriminate Glassmorphism (`backdrop-blur-2xl bg-white/5`)** | Blurs background text through cards, making Dirac notation ($|\Phi^+\rangle$) and matrices illegible. | **Opaque Solid Surfaces with Precision Elevation**: Pure `--bg-surface` (`#111317` dark / `#ffffff` light) with crisp borders. |
| **3** | **Muddy Washed-Out Light Mode** | Light mode styled with low-contrast borders (`#e2e8f0` against `#f8fafc`) makes circuits bleed into background. | **Linear Alabaster Contrast**: High-contrast borders (`rgba(11,15,23,0.16)`), bone-porcelain canvas (`#f8f9fa`), and pitch-black ink (`#0b0f17`). |
| **4** | **Centred Walls of Explanatory Text (>80ch)** | Scientific learners cannot track dense quantum concepts across wide screens. | **Strict Column Scaffolding**: Maximum line width `65ch`, left-aligned typography, side-by-side data/code inspection. |
| **5** | **Alarmist Crimson Divergence Warnings (`bg-red-950 text-red-200 animate-ping`)** | Makes incorrect learner predictions feel like catastrophic fatal server crashes rather than productive learning moments. | **Telemetry Amber Diagnostics**: Controlled amber diagnostic ribbons (`#f59e0b`), Socratic diff inspection, and calm divergence pips. |
| **6** | **Literal Photon Splitting / Particle Cartoons** | Violates quantum physics foundations; misleads learners into thinking qubits are classical balls splitting in space. | **Mathematical State Representation**: Discrete probability bars, Dirac bra-ket notation, and reduced density matrix Bloch vectors. |
| **7** | **Leaking Raw Backend IDs (`req_live_abc123`, `ch_entangle_01`)** | Exposing internal database keys in card headers destroys polished product perception. | **Human-Centered Semantic Presenters**: "Target State Match", "Entangled Bell Pair", "Stage 1: Prediction". |
| **8** | **Unrounded Machine-Epsilon Floats (`0.7071067811865475` or `2.22e-16`)** | Overwhelms learner working memory with floating point noise. | **Precision Rounding**: Strict 2 or 3 decimal formatting (`toFixed(2)`: `0.71`, `0.00`) across all telemetry tables and vectors. |
