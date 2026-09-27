# Q-Trace Logo & Atomic Cursor Design Specification

> **Status**: PROPOSAL & DESIGN REVIEW — Awaiting User Approval  
> **Target System**: Q-Trace (AI-Assisted Quantum Learning Platform & Quantum Flight Recorder)  
> **Theme Alignment**: [Theme 4: True Black OLED & Mineral Lithograph](file:///d:/Q-Trace/docs/THEME-4-TRUE-BLACK-PILL.md) & [Linear Precision Quantum Instrument](file:///d:/Q-Trace/docs/DESIGN-SYSTEM.md)  
> **Interactive Live Preview**: Open [`docs/preview-logo-cursor.html`](file:///d:/Q-Trace/docs/preview-logo-cursor.html) in any browser to test the interactive atom cursor and examine all logo variants in real time.

---

## 1. Executive Summary & Objectives

This specification delivers a cohesive, mathematically grounded brand mark and interactive cursor experience for **Q-Trace**:

1. **Precision Quantum Logo System (`<QTraceLogo />`)**:
   - Replaces the placeholder stroke circle with an authentic, high-precision SVG brandmark tailored to Q-Trace's identity: the intersection of **Quantum Superposition**, **Dirac Notation**, and **Flight Recorder Telemetry Traces**.
   - Uniformly integrates across all layouts, headers, authentication screens, footers, metadata, and favicons.
   - Symmetrically calibrated for **True Black OLED** (`#000000`) and **Archival Mineral Lithograph** (`#faf6f0`).

2. **Interactive Atomic Custom Cursor (`<AtomicCursor />`)**:
   - Transforms the standard mouse pointer into a living quantum atom: a central high-precision **nucleus** surrounded by **three orbiting electrons** traversing distinct orbital planes ($0^\circ$, $60^\circ$, $120^\circ$).
   - Engineered with reactive **micro-animations**:
     - **Ground State (Idle)**: Gentle, organic orbital rotation with fluid spring tracking.
     - **Excited State (Hovering Buttons/Links/Gates)**: Target reticle expansion, orbital dilation, and accelerated electron revolution ($2\times$ frequency jump).
     - **Wavefunction Collapse (Mousedown/Click)**: Instantaneous orbital implosion to the nucleus with an expanding translucent quantum coherence shockwave.
     - **Collimation (Text/Inputs)**: Orbital contraction to prevent obscuring text or code lines.
   - **Guarantees**: Zero click latency (`pointer-events: none`), 120 FPS GPU transforms, full `prefers-reduced-motion` accessibility, and automatic touchscreen deactivation (`pointer: coarse`).

---

## 2. Part I: Logo Design & Global Branding

### 2.1 Aesthetic Concept: *"The Quantum Statevector Trace"*

The brand mark fuses three core scientific motifs into an iconic, memorable silhouette:
1. **The Quantum Statevector Loop (Letter 'Q')**: A continuous geometric orbital circle representing the Bloch sphere equator and qubit superposition.
2. **Dirac Ket Angle Bracket (`|...⟩`)**: The right quadrant of the loop features a subtle mathematical bracket facet, honoring Dirac notation foundational to quantum mechanics.
3. **Flight Recorder Telemetry Descender**: A dynamic $45^\circ$ vector trace penetrating through the loop's lower right, featuring a glowing coherence node that symbolizes gate-by-gate divergence diagnosis.
4. **Coherence Core Pip**: An inner concentric focal pip aligned with the center of the quantum coordinate system.

```
                  ╭───━━━━━━━───╮
               ╭──               ──╮
             ╭─                     ─╮
            │      ╭───━━━━━───╮      │
            │    ╭─             ─╮    │
            │   │        ●        │   │   <-- Coherence Core Nucleus
            │    ╰─             ─╯    │
            │      ╰───━━━━━───╯      │
             ╰─                     ─┫ <-- Dirac Ket Facet
               ╰──               ──╭─╯
                  ╰───━━━━━━━───╯  ╲
                                    ╲  <-- Telemetry Trace Descender
                                     ●
```

### 2.2 Logo Variants & Proportions

| Variant | Layout & Dimensions | Primary Application |
|---|---|---|
| **Mark-Only** (`mark-only`) | Isolated $24\times24\text{px}$ to $48\times48\text{px}$ SVG glyph | Favicon, collapsed mobile drawer, app header badge, social icon |
| **Horizontal Lockup** (`full`) | Mark ($28\text{px}$) + "Q-TRACE" (Geist SemiBold tracking $+0.08\text{em}$) + optional "FLIGHT RECORDER" micro-pill badge | Primary desktop `AppHeader`, `AuthLayout` top bar, splash hero |
| **Stacked Hero Mark** (`hero`) | Large mark ($64\text{px}$–$80\text{px}$) with radial coherence corona | Landing page hero banner, documentation cover, presentation slides |

### 2.3 Color Science & Dual-Mode Token Palette

The logo strictly consumes theme CSS custom properties without hardcoded hex values:

| Element | Light Mode (Mineral Lithograph) | Dark Mode (True Black Vacuum) | CSS Variable |
|---|---|---|---|
| **Orbital Loop & Ket** | Midnight Indigo (`#0b0a43`, `oklch(0.20 0.102 273)`) | Luminous Periwinkle (`#90a4fd`, `oklch(0.740 0.130 273)`) | `var(--gate-h)` / `var(--text-primary)` |
| **Trace Descender** | Royal Amethyst Violet (`#4a02b1`, `oklch(0.39 0.222 288)`) | Radiant Iris (`#a48fff`, `oklch(0.730 0.190 288)`) | `var(--gate-cnot)` / `var(--violet)` |
| **Coherence Nucleus** | Deep Pine Emerald (`#033c00`, `oklch(0.31 0.104 142)`) | Spring Emerald (`#7ccf73`, `oklch(0.780 0.150 142)`) | `var(--evidence-success)` |
| **Wordmark Typography** | Midnight Indigo (`#0b0a43`) | Emissive Snow (`#f9fafb`) | `var(--text-primary)` |

### 2.4 Codebase Integration Touchpoints

Once approved, the logo will be updated across all pages via a reusable component:
- `apps/web/components/ui/q-trace-logo.tsx`: Master vector component.
- `apps/web/components/layout/app-header.tsx`: Navigation header brand mark.
- `apps/web/app/(auth)/layout.tsx`: Authentication suite header.
- `apps/web/components/layout/app-shell.tsx`: Footer and shell branding.
- `apps/web/app/page.tsx`: Landing page hero presentation.
- `apps/web/app/layout.tsx`: HTML `<head>` icons, SVG favicon (`app/icon.svg`), OpenGraph tags.

---

## 3. Part II: Interactive Atomic Custom Cursor

### 3.1 Scientific Metaphor & Physical Model

The cursor is modeled after a **tri-orbital Rutherford-Bohr atom**:
- **Nucleus**: Zero-latency focal dot precisely aligned with cursor coordinates $(x, y)$. When clicking, the user feels absolute tactical precision with zero perceived lag.
- **Orbital Shells**: Three microscopic elliptical rings tilted at:
  - **Orbit 1**: $0^\circ$ (Equatorial/Horizontal)
  - **Orbit 2**: $60^\circ$ (Tilted Ascending)
  - **Orbit 3**: $-60^\circ$ (Tilted Descending)
- **Revolving Electrons**: Three luminescent quantum particles ($2.5\text{px}$ radius) circulating along their respective orbital ellipses. Each electron operates with slightly detuned harmonic orbital periods ($3.4\text{s}$, $4.2\text{s}$, $2.8\text{s}$) so their orbits never look mechanical or repetitive.

### 3.2 Micro-Animations & Interaction State Matrix

```
                      [DEFAULT / GROUND STATE]
                     (R_orbital = 16px, 1x Speed)
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
  [HOVER INTERACTIVE]    [MOUSEDOWN / CLICK]        [TEXT / INPUT]
   Buttons, Links,       Wavefunction Collapse      Editor, Inputs,
    Gates, Sliders        Implosion + Shockwave     Caret Selection
  (R = 24px, 2.2x Spd,    (R -> 0px in 90ms,       (R -> 6px, Collimated
   Pulsing Crosshair)     Shockwave ring out)       Vertical Alignment)
```

| State | Trigger Criteria | Visual Behavior & Physics | Micro-Animation Feedback |
|---|---|---|---|
| **Ground State** | Normal viewport mouse movement | $32\text{px}$ diameter atom, smooth lerping spring follower ($k=0.22$). | Continuous gentle orbital revolution; nucleus rests at $3.5\text{px}$. |
| **Excited State** | Hovering `button`, `a`, `[role="button"]`, circuit gates, cards | Orbital radius expands to $48\text{px}$. Rings take on an active luminescence. | Electron revolution speed accelerates $2.2\times$; nucleus renders subtle crosshair laser graticules. |
| **Measurement Collapse** | `mousedown` event on any element | Orbitals collapse inward to $0\text{px}$ radius in $90\text{ms}$ ($E = h\nu$ collapse). | Instantaneous quantum ripple shockwave expands outward to $40\text{px}$ with opacity falloff, simulating state measurement. |
| **Collimated Focus** | Hovering `input`, `textarea`, Monaco/Qiskit editor | Orbitals compress along the X-axis into a slender quantum vertical reticle. | Ensures zero obstruction of code syntax, Dirac bra-kets, or text selection. |
| **Entanglement Drag** | Dragging a quantum gate from the palette onto a wire | Cursor turns into an active Bell-pair dipole with a trailing coherence beam. | Orbitals sync with the circuit grid line coordinates. |

### 3.3 Ergonomics, Latency & Accessibility Guarantees

1. **Zero Click Latency (`pointer-events: none`)**:
   - The cursor element carries `pointer-events: none` at all times. All browser hit testing, text selections, context menus, and drag-and-drop operations trigger native browser handlers without any interference or event hijacking.
2. **Dual-Layer Architecture**:
   - **Layer 1 (The Point Nucleus)**: Follows the hardware cursor directly via CSS `translate3d(clientX, clientY, 0)` updated in standard `mousemove` event — **zero lag**.
   - **Layer 2 (The Orbital Electron Assembly)**: Follows with a subtle, fluid spring interpolation (`requestAnimationFrame`), giving a weightless, floating quantum orbital feel.
3. **Hardware Acceleration**:
   - All rotations and orbital motions use `transform: rotate(...) translate(...)` handled entirely on the GPU compositing layer. CPU usage remains $<0.5\%$.
4. **Touch & Mobile Immunity**:
   - Auto-deactivated when `@media (pointer: coarse)` is active or on touch-primary devices.
5. **Reduced Motion Compliance**:
   - Evaluates `prefers-reduced-motion: reduce`. When active, electrons freeze into stationary, elegant quantum probability clouds, and shockwaves are disabled.
6. **User Preference Toggle**:
   - Provides a clean toggle in the settings / footer to switch between "Quantum Atomic Cursor" and "Standard Precision Pointer" if a user ever prefers default OS cursors.

---

## 4. Interactive Prototype & Live Preview

To evaluate the designs before implementation, an interactive prototype has been created at:  
👉 **`docs/preview-logo-cursor.html`**

### What You Can Experience in the Preview:
1. **Live Interactive Atomic Cursor**: Move your mouse anywhere on the page to see the nucleus and 3 orbiting electrons in action.
2. **Interactive Button & Gate Triggers**: Hover over the test buttons, quantum gate tiles (H, CNOT, X, Z), and input fields to experience the excited-state acceleration and reticle framing.
3. **Click Wavefunction Collapse**: Click anywhere on the preview to trigger the quantum measurement collapse and ripple animation.
4. **Theme Switcher**: Toggle between **Theme 4 Dark (True Black OLED)** and **Theme 4 Light (Archival Mineral Lithograph)** to verify contrast and color science.
5. **3 Logo Concepts Showcase**: Side-by-side inspection of Option A (Quantum Statevector Trace), Option B (Entangled Dual-Core), and Option C (Telemetry Monogram).

---

## 5. Proposed Implementation Plan

Upon your explicit approval, we will execute the implementation in disciplined stages:

1. **Stage 1: Logo Component (`QTraceLogo`)**
   - Create `apps/web/components/ui/q-trace-logo.tsx` with mark-only, full-lockup, and hero variants.
   - Generate high-res SVG favicon and web manifest icons.
2. **Stage 2: Atomic Cursor Component (`AtomicCursor`)**
   - Create `apps/web/components/ui/atomic-cursor.tsx`.
   - Add cursor animation keyframes and OKLCH color rules to `apps/web/app/globals.css`.
   - Wire cursor component into `apps/web/app/providers.tsx` or `apps/web/app/layout.tsx`.
3. **Stage 3: Global Branding Rollout**
   - Update `apps/web/components/layout/app-header.tsx` with `<QTraceLogo variant="full" />`.
   - Update `apps/web/app/(auth)/layout.tsx` with `<QTraceLogo variant="full" />`.
   - Update `apps/web/components/layout/app-shell.tsx` footer branding.
   - Update `apps/web/app/page.tsx` hero mark.
4. **Stage 4: Verification & Automated Tests**
   - Run unit test suite (`pnpm --filter web test`) to guarantee zero regressions.
   - Test interaction across all routes (`/`, `/learn/bell-state`, `/lab`, `/progress`, `/instructor`, `/login`, `/signup`).

---

## 6. Permissions & Feedback Request

Please review the proposed design and the interactive preview in `docs/preview-logo-cursor.html`.  
Kindly let us know:
1. **Logo Preference**: Do you approve **Option A (The Quantum Statevector Trace)** as the primary logo, or do you prefer Option B or C?
2. **Atomic Cursor**: Do you approve the 3-orbital nucleus + revolving electron model with hover excitation and click-collapse micro-animations?
3. **Permission to Proceed**: Are you ready for us to implement these components and update all pages across the project?
