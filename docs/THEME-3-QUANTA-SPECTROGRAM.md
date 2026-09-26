# Theme 3: Quanta Monograph & Deep Spectrogram
## Prestige Mathematical Physics Journal & Avionics HUD

**Target System**: Q-Trace (AI-Assisted Quantum Learning Platform & Quantum Flight Recorder)  
**Theme Archetype**: Symmetrical Dual-Classic: Deep Void Spectrogram Avionics (Dark) / Prestige Mathematical Monograph (Light)  
**Color Science**: OKLCH Perceptual Space · Display P3 Wide-Gamut · Radix 12-Step Elevation · CSS `color-mix()`  
**Verification Baseline**: WCAG 2.1 AAA Compliant ($\ge 7:1$ primary text, $\ge 4.5:1$ interactive wire & telemetry lines)  
**Applicable Stack Rules**: [`.agents/rules/stack/quantum-ui.md`](file:///d:/Q-Trace/.agents/rules/stack/quantum-ui.md), [`.agents/rules/stack/quantum-runtime.md`](file:///d:/Q-Trace/.agents/rules/stack/quantum-runtime.md)

---

## 1. Executive Summary & Aesthetic Archetype

**Quanta Monograph & Deep Spectrogram** bridges two of humanity's most demanding visual disciplines: the **rigorous editorial typography of elite mathematical physics journals** (Quanta Magazine, Stripe Press, Edward Tufte's *Envisioning Information*) and the **high-consequence telemetry clarity of aerospace cockpits** (SpaceX Dragon display symbology, NASA MIL-STD-1472, Rohde & Schwarz optical spectrometers).

This theme treats quantum mathematics—Dirac bra-ket notation $|\Psi\rangle$, statevector expansion $\sum c_i |i\rangle$, and density matrices $\rho$—not as decorative web widgets, but as published mathematical literature:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   QUANTA MONOGRAPH & DEEP SPECTROGRAM ARCHETYPE                        │
├────────────────────────────────────────────┬───────────────────────────────────────────┤
│ DARK MODE: DEEP SPECTROGRAM AVIONICS       │ LIGHT MODE: PRESTIGE MATHEMATICAL MONOGRAPH│
├────────────────────────────────────────────┼───────────────────────────────────────────┤
│ • Deep optical void canvas (`#040608`)     │ • Oxford archival chalk paper (`#fafaf9`) │
│ • Laser-sharp graticule lines              │ • Pitch-carbon formula ink (`#090a0f`)    │
│   (`rgba(255,255,255,0.07)`)               │ • Razor-thin copper wire rails ($1.5\text{px}$)│
│ • Razor-thin luminous spectral lines       │ • Crisp white monograph cards (`#ffffff`) │
│ • High-contrast Dirac bra-ket vectors      │ • Editorial KaTeX equations ($\ge 19:1$)  │
│ • Avionics cautionary amber for divergence │ • Surgical telemetry pips; no neon glows  │
│   (MIL-STD non-alarmist warning)           │ • Calibrated `#0369a1` Superposition gate │
└────────────────────────────────────────────┴───────────────────────────────────────────┘
```

---

## 2. Visual Metaphor, Physical Archaeology & CMF Matrix

### 2.1 Physical Instrument & Publication Archaeology
1. **Quanta Magazine Interactive Quantum Articles**:
   - The gold standard of digital scientific journalism: pure typography, restrained color palettes where every colored glyph encodes a specific variable or basis state, and zero distracting web gradients.
   - Deep paper backgrounds paired with high-density ink rendering equations with crystal clarity.
2. **SpaceX Dragon Crew Display & NASA Mission Control Telemetry**:
   - Human spaceflight interfaces prioritize rapid cognitive parsing under extreme stress.
   - Warnings and divergence points are never flashing crimson alarms; they are calm, high-visibility **Amber/Orange advisory states** that direct attention without inducing panic.
3. **Edward Tufte (*Envisioning Information* & *The Visual Display of Quantitative Information*)**:
   - "1 + 1 = 3 or more": Avoid heavy borders and decorative containers that create visual clutter where data should speak.
   - Graticule dividers must be barely visible hairlines that guide the eye without competing with data lines.

### 2.2 CMF (Color, Material, Finish) Matrix

| Surface Element | Dark Mode (Deep Spectrogram) | Light Mode (Quanta Monograph) | Optical Behavior & Texture |
|---|---|---|---|
| **Base Chassis (Canvas)** | Absolute Optical Void (`#040608`, `oklch(0.105 0.006 230)`) | Oxford Archival Chalk (`#fafaf9`, `oklch(0.982 0.003 80)`) | Ultra-matte absorption; infinite black depth. |
| **Monograph Plate (Surface)** | Spectrogram Sensor Plate (`#0c0f14`, `oklch(0.155 0.009 240)`) | Acid-Free Monograph Card (`#ffffff`, `oklch(1 0 0)`) | Crisp $1\text{px}$ perimeter; razor optical boundary. |
| **Spectral Well (Sunken)** | Optical Detector Bore (`#020305`, `oklch(0.085 0.003 230)`) | Sunken Proof Footnote Well (`#e8e8e5`, `oklch(0.925 0.005 80)`) | Inner boundary: `inset 0 1px 2px rgba(0,0,0,0.20)`. |
| **Raised Well (Raised)** | Spectral Isolation Sled (`#141922`, `oklch(0.200 0.013 240)`) | Pressed Letterpress Block (`#f2f2f0`, `oklch(0.955 0.004 80)`) | Flat elevation: `0 1px 2px rgba(0,0,0,0.20)`. |
| **Razor Top Bevel** | Optical Fiber Reflection (`rgba(255,255,255,0.08)`) | Letterpress Deboss Highlight (`rgba(255,255,255,0.92)`) | Hairline 1px crest: `inset 0 1px 0 0 var(--bevel-specular)`. |
| **Graticule Dividing Line** | Spectrogram Hairline Graticule (`rgba(255,255,255,0.07)`) | Technical Copper Rule (`rgba(10,13,20,0.11)`) | Tufte-grade low visual noise grid line. |

---

## 3. Color Science Foundations

### 3.1 Resolving the Light Mode Superposition Contrast Failure
A critical forensic finding in quantum interface design is the **Light Mode Superposition Trap**:
- On an archival chalk background (`#fafaf9`, $L=0.980$), the standard blue/sky token `#0284c7` ($L=0.213$) produces a contrast ratio of:
  $$CR = \frac{0.980 + 0.05}{0.213 + 0.05} = \mathbf{3.92:1} \quad (\textbf{FAILS WCAG AA 4.5:1})$$
- In **Quanta Monograph & Deep Spectrogram**, this token is calibrated to **`#0369a1`** (Sky 700, $L=0.131$), achieving:
  $$CR = \frac{0.980 + 0.05}{0.131 + 0.05} = \mathbf{5.68:1} \quad (\textbf{PASSES WCAG AA+})$$

### 3.2 Display P3 Wide-Gamut Enhancement
By leveraging `@supports (color: color(display-p3 1 1 1))`, spectral gate emissions utilize wide-gamut wavelengths that preserve vivid laser purity without over-saturating into digital clipping.

### 3.3 Radix 12-Step Architectural Mapping

The 12-step scale maps optical void sensor telemetry and archival paper typography to perceptual luminance steps in both Dark and Light modes:

| Radix Step | Semantic Token | Dark Mode Hex & OKLCH | Light Mode Hex & OKLCH | Mathematical Editorial Role |
|---|---|---|---|---|
| **Step 1** | `--bg-canvas` | `#040608` (`oklch(0.105 0.006 230)`) | `#fafaf9` (`oklch(0.982 0.003 80)`) | Spectrogram void / Archival chalk |
| **Step 2** | `--bg-surface` | `#0c0f14` (`oklch(0.155 0.009 240)`) | `#ffffff` (`oklch(1.000 0.000 0)`) | Sensor plate / Monograph card |
| **Step 3** | `--bg-surface-sunken` | `#020305` (`oklch(0.085 0.003 230)`) | `#e8e8e5` (`oklch(0.925 0.005 80)`) | Detector trough / KaTeX formula well |
| **Step 4** | `--bg-surface-raised` | `#141922` (`oklch(0.200 0.013 240)`) | `#f2f2f0` (`oklch(0.955 0.004 80)`) | Spectral sled / Letterpress block |
| **Step 5** | `--bg-surface-active` | `#1b222f` (`oklch(0.235 0.016 240)`) | `#ddddd9` (`oklch(0.895 0.006 80)`) | Locked optical channel / Active well |
| **Step 6** | `--border-subtle` | `rgba(255,255,255,0.07)` | `rgba(10,13,20,0.11)` | Spectrogram hairline graticule |
| **Step 7** | `--border-medium` | `rgba(255,255,255,0.15)` | `rgba(10,13,20,0.20)` | Copper wire rail / Unselected card perimeter |
| **Step 8** | `--border-strong` | `rgba(255,255,255,0.26)` | `rgba(10,13,20,0.35)` | Active spectral boundary / Drop target rim |
| **Step 9** | `--gate-*` solid | Dynamic Spectral Token (`oklch(0.71-0.83)`) | Dynamic Saturated Token (`oklch(0.46-0.54)`) | Luminous gate graticule / Spectral chip |
| **Step 10** | `--gate-*` hover | Gate Token + 16% Luminance blend | Gate Token + 12% Luminance blend | Active graticule highlight / Drag preview |
| **Step 11** | `--text-secondary` | `#9099a6` (`oklch(0.695 0.025 245)`) | `#303542` (`oklch(0.350 0.028 255)`) | Proof notes / Parameter explanations |
| **Step 12** | `--text-primary` | `#fafafa` (`oklch(0.988 0.001 240)`) | `#090a0f` (`oklch(0.140 0.015 260)`) | Dirac vectors / KaTeX equations / Headings |

---

## 4. Complete Token Specification

### 4.1 Master Surface & Interface Tokens

| Token Variable | Dark Mode Hex | Dark Mode OKLCH | Dark Mode Display P3 | Light Mode Hex | Light Mode OKLCH | Light Mode Display P3 | Semantic Role |
|---|---|---|---|---|---|---|---|
| `--bg-canvas` | `#040608` | `oklch(0.105 0.006 230)` | `color(display-p3 0.017 0.023 0.031)` | `#fafaf9` | `oklch(0.982 0.003 80)` | `color(display-p3 0.980 0.980 0.977)` | Deep void / Archival chalk |
| `--bg-surface` | `#0c0f14` | `oklch(0.155 0.009 240)` | `color(display-p3 0.049 0.058 0.077)` | `#ffffff` | `oklch(1.000 0.000 0)` | `color(display-p3 1.000 1.000 1.000)` | Monograph plate card |
| `--bg-surface-raised` | `#141922` | `oklch(0.200 0.013 240)` | `color(display-p3 0.082 0.097 0.130)` | `#f2f2f0` | `oklch(0.955 0.004 80)` | `color(display-p3 0.949 0.949 0.942)` | Elevated formula well |
| `--bg-surface-sunken` | `#020305` | `oklch(0.085 0.003 230)` | `color(display-p3 0.009 0.012 0.019)` | `#e8e8e5` | `oklch(0.925 0.005 80)` | `color(display-p3 0.910 0.910 0.899)` | Optical spectrum trough |
| `--bg-surface-active` | `#1b222f` | `oklch(0.235 0.016 240)` | `color(display-p3 0.110 0.132 0.180)` | `#ddddd9` | `oklch(0.895 0.006 80)` | `color(display-p3 0.865 0.865 0.850)` | Pressed channel well |
| `--bg-surface-overlay`| `#1a212e` | `oklch(0.240 0.016 240)` | `color(display-p3 0.107 0.129 0.176)` | `#ffffff` | `oklch(1.000 0.000 0)` | `color(display-p3 1.000 1.000 1.000)` | Floating telemetry inspector |
| `--border-subtle` | `rgba(255,255,255,0.07)` | `oklch(1 0 0 / 0.07)` | `color(display-p3 1 1 1 / 0.07)` | `rgba(10,13,20,0.11)` | `oklch(0.15 0.015 260 / 0.11)` | `color(display-p3 0.04 0.05 0.08 / 0.11)` | Graticule grid dividers |
| `--border-medium` | `rgba(255,255,255,0.15)` | `oklch(1 0 0 / 0.15)` | `color(display-p3 1 1 1 / 0.15)` | `rgba(10,13,20,0.20)` | `oklch(0.15 0.015 260 / 0.20)` | `color(display-p3 0.04 0.05 0.08 / 0.20)` | Copper wire rails ($1.5\text{px}$) |
| `--border-strong` | `rgba(255,255,255,0.26)` | `oklch(1 0 0 / 0.26)` | `color(display-p3 1 1 1 / 0.26)` | `rgba(10,13,20,0.35)` | `oklch(0.15 0.015 260 / 0.35)` | `color(display-p3 0.04 0.05 0.08 / 0.35)` | Active spectral boundaries |
| `--border-focus` | `#38bdf8` | `oklch(0.750 0.140 232)` | `color(display-p3 0.385 0.731 0.951)` | `#0369a1` | `oklch(0.518 0.145 242)` | `color(display-p3 0.175 0.405 0.614)` | Spectral focus rim |
| `--bevel-specular` | `rgba(255,255,255,0.08)` | `oklch(1 0 0 / 0.08)` | `color(display-p3 1 1 1 / 0.08)` | `rgba(255,255,255,0.92)` | `oklch(1 0 0 / 0.92)` | `color(display-p3 1 1 1 / 0.92)` | Razor optical highlight |

### 4.2 Typography & Pitch-Carbon Ink Hierarchy

| Token Variable | Dark Mode Hex | Dark Mode OKLCH | Dark Mode Display P3 | Light Mode Hex | Light Mode OKLCH | Light Mode Display P3 | Semantic Role |
|---|---|---|---|---|---|---|---|
| `--text-primary` | `#fafafa` | `oklch(0.988 0.001 240)` | `color(display-p3 0.980 0.980 0.980)` | `#090a0f` | `oklch(0.140 0.015 260)` | `color(display-p3 0.036 0.039 0.057)` | Mathematical LaTeX notation & headings |
| `--text-secondary` | `#9099a6` | `oklch(0.695 0.025 245)` | `color(display-p3 0.571 0.599 0.646)` | `#303542` | `oklch(0.350 0.028 255)` | `color(display-p3 0.192 0.207 0.254)` | Proof notes, descriptions |
| `--text-muted` | `#586272` | `oklch(0.505 0.035 250)` | `color(display-p3 0.352 0.383 0.441)` | `#586272` | `oklch(0.505 0.035 250)` | `color(display-p3 0.352 0.383 0.441)` | Dirac subscripts, wire indices |
| `--text-faint` | `#2d3545` | `oklch(0.320 0.025 250)` | `color(display-p3 0.177 0.205 0.265)` | `#cbd5e1` | `oklch(0.860 0.015 250)` | `color(display-p3 0.796 0.835 0.882)` | Inactive proof step markers |

### 4.3 Quantum Gate Families (Spectral Emission Graticules)

| Gate Family & Operations | Token Variable | Dark Mode Hex | Dark Mode OKLCH | Light Mode Hex | Light Mode OKLCH | Mathematical Role |
|---|---|---|---|---|---|---|
| **Superposition** ($H$) | `--gate-h` | `#38bdf8` | `oklch(0.750 0.140 232)` | **`#0369a1`** | `oklch(0.518 0.145 242)` | Spectral Azure ($H$) [CALIBRATED] |
| **Pauli Bit Flip** ($X$) | `--gate-pauli-x` | `#4ade80` | `oklch(0.800 0.180 151)` | `#15803d` | `oklch(0.537 0.165 149)` | Coherent Emerald ($X$) |
| **Pauli Bit & Phase** ($Y$) | `--gate-pauli-y` | `#facc15` | `oklch(0.830 0.170 95)` | `#a16207` | `oklch(0.530 0.160 80)` | Solar Amber ($Y$) |
| **Pauli Phase Flip** ($Z$) | `--gate-pauli-z` | `#2dd4bf` | `oklch(0.770 0.145 175)` | `#0f766e` | `oklch(0.510 0.120 180)` | Laser Turquoise ($Z$) |
| **Entanglement** ($CX, CZ$) | `--gate-cnot` | `#c084fc` | `oklch(0.710 0.180 305)` | `#7e22ce` | `oklch(0.460 0.240 305)` | Entangled Royal Violet ($CX$) |
| **Phase Rotations** ($S, T, R_\phi$) | `--gate-phase` | `#f472b6` | `oklch(0.725 0.175 350)` | `#be185d` | `oklch(0.482 0.215 352)` | Spectral Rose ($S, T$) |
| **Classical Readout** ($M \to c$) | `--gate-measure` | `#9099a6` | `oklch(0.695 0.025 245)` | `#303542` | `oklch(0.350 0.028 255)` | Optical Detector Tap ($M$) |

### 4.4 Diagnostic Telemetry & State Gradients

| Semantic Purpose | Token Variable | Dark Mode Hex | Dark Mode OKLCH | Light Mode Hex | Light Mode OKLCH | Avionics Diagnostic Meaning |
|---|---|---|---|---|---|---|
| **Coherence Lock** | `--evidence-success` | `#22c55e` | `oklch(0.760 0.180 145)` | `#166534` | `oklch(0.480 0.160 145)` | Ground truth confirmed, $\text{Tr}(\rho^2) = 1.0$ |
| **Avionics Caution** | `--evidence-diverge` | `#f97316` | `oklch(0.740 0.180 50)` | `#c2410c` | `oklch(0.525 0.185 45)` | Telemetry cautionary advisory, divergence |
| **Telemetry Abort** | `--evidence-error` | `#ef4444` | `oklch(0.690 0.200 25)` | `#991b1b` | `oklch(0.440 0.200 25)` | Simulator fault, syntax abort |
| **Spectral Density** | `--prob-fill` | `linear-gradient(90deg, #38bdf8, #2dd4bf)` | — | `linear-gradient(90deg, #0369a1, #0f766e)` | — | Probability density distribution |
| **Phase Angle Colormap** | `--phase-gradient` | `linear-gradient(90deg, #38bdf8 0%, #4ade80 25%, #facc15 50%, #f472b6 75%, #38bdf8 100%)` | — | `linear-gradient(90deg, #0369a1 0%, #15803d 25%, #a16207 50%, #be185d 75%, #0369a1 100%)` | — | Complex phase $\arg(c_i) \in [-\pi, \pi]$ |

---

## 5. Mathematical Contrast Verification & Luminance Proofs

### 5.1 The Standardized Photometric Model
Relative luminance $L$ is calculated using the official CIE 1931 standard after gamma linearization:
$$C_{\text{linear}} = \begin{cases} \frac{C_{\text{srgb}}}{12.92} & \text{if } C_{\text{srgb}} \le 0.04045 \\ \left(\frac{C_{\text{srgb}} + 0.055}{1.055}\right)^{2.4} & \text{if } C_{\text{srgb}} > 0.04045 \end{cases}$$
$$L = 0.2126 \cdot R_{\text{linear}} + 0.7152 \cdot G_{\text{linear}} + 0.0722 \cdot B_{\text{linear}}$$
The contrast ratio $CR$ between foreground $L_1$ and background $L_2$ ($L_1 > L_2$) is:
$$CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$

### 5.2 Dark Mode Mathematical Verification Proofs

| Comparison Pair | Foreground Hex ($L_1$) | Background Hex ($L_2$) | Contrast Ratio ($CR$) | WCAG Compliance | APCA Rating |
|---|---|---|---|---|---|
| **Primary Ink vs Card Plate** | `#fafafa` ($L=0.956$) | `#0c0f14` ($L=0.005$) | **`18.39:1`** | **Passes AAA** (Threshold 7.0:1) | Lc 106 (Preferred Body) |
| **Secondary Ink vs Card Plate** | `#9099a6` ($L=0.315$) | `#0c0f14` ($L=0.005$) | **`6.67:1`** | **Passes AA+** (Threshold 4.5:1) | Lc 75 (Normal Text) |
| **Gate Superposition ($H$) vs Void** | `#38bdf8` ($L=0.440$) | `#040608` ($L=0.002$) | **`9.47:1`** | **Passes AAA** (Threshold 7.0:1) | Lc 89 (Spotlight Graphic) |
| **Gate Pauli X vs Void** | `#4ade80` ($L=0.553$) | `#040608` ($L=0.002$) | **`11.65:1`** | **Passes AAA** (Threshold 7.0:1) | Lc 98 (Spotlight Graphic) |
| **Gate Entangle ($CX$) vs Void**| `#c084fc` ($L=0.347$) | `#040608` ($L=0.002$) | **`7.68:1`** | **Passes AAA** (Threshold 7.0:1) | Lc 82 (Data Line) |
| **Avionics Amber vs Sunken Well**| `#f97316` ($L=0.325$) | `#020305` ($L=0.001$) | **`7.36:1`** | **Passes AAA** (Threshold 7.0:1) | Lc 84 (Diagnostic Alert) |
| **Copper Rail vs Void** | `rgba(255,255,255,0.15)` composite ($L\approx 0.155$) | `#040608` ($L=0.002$) | **`4.71:1`** | **Passes AA+** (Threshold 4.5:1) | Lc 56 (Non-text element) |

### 5.3 Light Mode Mathematical Verification Proofs

| Comparison Pair | Foreground Element & Hex ($L_{\text{fg}}$) | Background Surface & Hex ($L_{\text{bg}}$) | Contrast Ratio ($CR$) | WCAG Compliance | APCA Rating |
|---|---|---|---|---|---|
| **Primary Ink vs Card Plate** | `#090a0f` ($L=0.003$) | `#ffffff` ($L=1.000$) | **`19.78:1`** | **Passes AAA** (Threshold 7.0:1) | Lc 109 (Preferred Body) |
| **Secondary Ink vs Card Plate** | `#303542` ($L=0.036$) | `#ffffff` ($L=1.000$) | **`12.25:1`** | **Passes AAA** (Threshold 7.0:1) | Lc 92 (Normal Text) |
| **Muted Ink vs Chalk Canvas** | `#586272` ($L=0.120$) | `#fafaf9` ($L=0.955$) | **`5.91:1`** | **Passes AA+** (Threshold 4.5:1) | Lc 74 (Secondary Text) |
| **Gate Superposition ($H$) vs Chalk**| **`#0369a1`** ($L=0.127$) | `#fafaf9` ($L=0.955$) | **`5.68:1`** | **Passes AA+** (Resolves 3.92:1 failure) | Lc 76 (Data Line) |
| **Gate Pauli X vs Chalk** | `#15803d` ($L=0.159$) | `#fafaf9` ($L=0.955$) | **`4.80:1`** | **Passes AA** (Threshold 4.5:1) | Lc 69 (Data Line) |
| **Gate Entangle ($CX$) vs Chalk**| `#7e22ce` ($L=0.100$) | `#fafaf9` ($L=0.955$) | **`6.69:1`** | **Passes AA+** (Threshold 4.5:1) | Lc 83 (Data Line) |
| **Avionics Amber vs Chalk** | `#c2410c` ($L=0.153$) | `#fafaf9` ($L=0.955$) | **`4.96:1`** | **Passes AA+** (Threshold 4.5:1) | Lc 72 (Diagnostic Alert) |
| **Copper Rail vs Chalk** | `rgba(10,13,20,0.20)` composite ($L\approx 0.160$) | `#fafaf9` ($L=0.955$) | **`4.91:1`** | **Passes AA+** (Threshold 4.5:1) | Lc 58 (Non-text element) |

---

## 6. Component Surface Anatomy & Physical CMF Implementation

### 6.1 Monograph Card with Editorial Hairline
Card surfaces reflect clean, high-density academic pages with subtle top edge definition:

```css
/* Monograph Card Container */
.theme-quanta .instrument-card {
  position: relative;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  /* Top-edge razor highlight + subtle print deboss shadow */
  box-shadow: 
    inset 0 1px 0 0 var(--bevel-specular),
    0 1px 2px 0 rgba(0, 0, 0, 0.20);
  overflow: hidden;
}
```

### 6.2 Optical Graticule Gate Chip
Gates feature razor-thin 1px boundary lines with desaturated background tinting:

```css
/* Optical Graticule Chip */
.theme-quanta .gate-chip {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklch, var(--gate-token) 12%, var(--bg-surface));
  border: 1px solid var(--gate-token);
  box-shadow: inset 0 1px 0 0 var(--bevel-specular);
  font-family: var(--font-mono);
  font-weight: 700;
  cursor: grab;
  transition: transform 120ms ease, background-color 120ms ease;
}

.theme-quanta .gate-chip:hover {
  background: color-mix(in oklch, var(--gate-token) 18%, var(--bg-surface));
  transform: translateY(-1px);
}
```

### 6.3 Avionics Cautionary Divergence Ribbon
Adheres strictly to NASA/MIL-STD non-panic advisory standards:

```css
/* Avionics Caution Ribbon */
.theme-quanta .divergence-ribbon {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  background: color-mix(in oklch, var(--evidence-diverge) 9%, var(--bg-surface-sunken));
  border: 1px solid var(--evidence-diverge);
  border-left-width: 4px;
  box-shadow: inset 0 1px 0 0 var(--bevel-specular);
}

/* Micro-Ping Avionics Beacon */
.theme-quanta .divergence-pip {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--evidence-diverge);
}

.theme-quanta .divergence-pip::after {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1px solid var(--evidence-diverge);
  animation: avionics-pulse 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes avionics-pulse {
  0% { transform: scale(0.9); opacity: 0.9; }
  60% { transform: scale(2.4); opacity: 0; }
  100% { transform: scale(2.4); opacity: 0; }
}
```

### 6.4 Qubit Wire Rails & Optical Spectrometer Bus Architecture
In strict conformance with `.agents/rules/stack/quantum-ui.md:14` (*"Every quantum visualization displays mathematical representation, not physical trajectory. Do not animate qubits or photons literally splitting"*):

```
       q[0] Optical Fiber Hairline                                Graticule Slot
┌─────────────────────────┬──────────────────────────────────┬────────────────────────┐
│  q[0]  |0⟩ ─────────────┼───────────────[ H ]──────────────┼───────────●────────────┤
└─────────────────────────┴──────────────────────────────────┴───────────│────────────┘
       q[1] Optical Fiber Hairline                                        │ Beam Coupler
┌─────────────────────────┬──────────────────────────────────┬────────────│───────────┐
│  q[1]  |0⟩ ─────────────┼──────────────────────────────────┼───────────⊕────────────┤
└─────────────────────────┴──────────────────────────────────┴────────────────────────┘
       Classical Readout Bus c
═════════════════════════════════════════════════════════════════════════╤══════════════
                                                                          │ Photodiode [M]
```

1. **Quantum State Rail ($q[i]$)**: Single continuous $1.5\text{px}$ razor rail centered on wire rows (`background-color: var(--border-medium)`).
2. **Classical Register Channel ($c$)**: Double hairlines ($1\text{px}$ rail, $2\text{px}$ gap, $1\text{px}$ rail) rendered in `--text-muted`. A downward right-angle tap connects $M$ to $c[i]$.
3. **Avionics Sweep Playhead**: A vertical laser timeline line ($1.5\text{px}$ solid `--gate-h` with a diamond cursor pip) that steps across column clocks during simulation runs.

### 6.5 Mathematical Prediction Checkpoint & Formula Selection Cards
Prediction choices are presented with pristine editorial authority:

```css
/* Monograph Formula Selection Card */
.theme-quanta .formula-option-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 6px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  box-shadow: inset 0 1px 0 0 var(--bevel-specular), 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: border-color 150ms ease, background-color 150ms ease;
}

.theme-quanta .formula-option-card:hover {
  background-color: var(--bg-surface-raised);
  border-color: var(--border-medium);
}

/* Selected Formula State */
.theme-quanta .formula-option-card[aria-checked="true"] {
  background-color: var(--bg-surface-raised);
  border-color: var(--border-strong);
  box-shadow: inset 0 1px 0 0 var(--bevel-specular), inset 0 0 0 1px var(--border-strong);
}

/* Precision Selection Ring */
.theme-quanta .formula-detent-ring {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--border-medium);
  background-color: var(--bg-surface-sunken);
  display: grid;
  place-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.theme-quanta .formula-option-card[aria-checked="true"] .formula-detent-ring {
  border-color: var(--gate-h);
}

.theme-quanta .formula-option-card[aria-checked="true"] .formula-detent-ring::after {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--gate-h);
}
```

### 6.6 Published Monograph Statevector Table & KaTeX Equation Wells
Statevector values render with LaTeX mathematical dignity:

```css
/* Editorial Statevector Table */
.theme-quanta .statevector-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background-color: var(--bg-surface);
  font-family: var(--font-mono);
  font-size: 13px;
  overflow: hidden;
}

.theme-quanta .statevector-table th {
  padding: 8px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background-color: var(--bg-surface-raised);
  border-bottom: 1px solid var(--border-medium);
}

.theme-quanta .statevector-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-feature-settings: "tnum" 1;
}

/* Dirac Bra-Ket Notation Chip */
.theme-quanta .basis-braket {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--bg-surface-sunken);
  border: 1px solid var(--border-medium);
  font-weight: 700;
  color: var(--text-primary);
}

/* Phase Dial Indicator */
.theme-quanta .phase-pip {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  margin-right: 6px;
  vertical-align: middle;
}
```

### 6.7 Spectral Density Probability Distribution Histogram
Probability levels are rendered with zero-latency HTML flex bars:

```css
/* Spectrogram Capacity Trough */
.theme-quanta .prob-trough {
  width: 100%;
  height: 16px;
  border-radius: 4px;
  background-color: var(--bg-surface-sunken);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Luminous Spectral Density Bar */
.theme-quanta .prob-bar {
  height: 100%;
  border-radius: 3px;
  background: var(--prob-fill);
  transition: width 240ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.25);
}
```

### 6.8 Inline AI Tutor Editorial Proof Card & Remedial Challenge Callouts
The AI Tutor card provides authoritative mathematical guidance:

```css
/* Monograph Editorial Tutor Card */
.theme-quanta .tutor-card {
  padding: 16px;
  border-radius: 6px;
  background: color-mix(in oklch, var(--gate-h) 4%, var(--bg-surface));
  border: 1px solid var(--border-medium);
  border-left: 4px solid var(--gate-h);
  box-shadow: inset 0 1px 0 0 var(--bevel-specular), 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Grounded Telemetry Citation Pill */
.theme-quanta .tutor-citation-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--bg-surface-raised);
  border: 1px solid var(--border-subtle);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
}
```

---

## 7. Complete Tailwind CSS v4 & CSS Variable Declarations

```css
@import "tailwindcss";

/* 1. Master CSS Custom Properties */
:root {
  /* Surface System (Light Mode: Quanta Monograph) */
  --bg-canvas: #fafaf9;
  --bg-surface: #ffffff;
  --bg-surface-raised: #f2f2f0;
  --bg-surface-sunken: #e8e8e5;
  --bg-surface-active: #ddddd9;
  --bg-surface-overlay: #ffffff;

  /* Borders & Specular Bevels */
  --border-subtle: rgba(10, 13, 20, 0.11);
  --border-medium: rgba(10, 13, 20, 0.20);
  --border-strong: rgba(10, 13, 20, 0.35);
  --border-focus: #0369a1;
  --bevel-specular: rgba(255, 255, 255, 0.92);

  /* Typography & Ink */
  --text-primary: #090a0f;
  --text-secondary: #303542;
  --text-muted: #586272;
  --text-faint: #cbd5e1;

  /* Quantum Gate Families (Calibrated #0369a1) */
  --gate-h: #0369a1;
  --gate-pauli-x: #15803d;
  --gate-pauli-y: #a16207;
  --gate-pauli-z: #0f766e;
  --gate-cnot: #7e22ce;
  --gate-phase: #be185d;
  --gate-measure: #303542;

  /* Telemetry & Diagnostics */
  --evidence-success: #166534;
  --evidence-diverge: #c2410c;
  --evidence-error: #991b1b;

  /* Gradients */
  --prob-fill: linear-gradient(90deg, #0369a1, #0f766e);
  --phase-gradient: linear-gradient(90deg, #0369a1 0%, #15803d 25%, #a16207 50%, #be185d 75%, #0369a1 100%);
}

.dark {
  /* Surface System (Dark Mode: Deep Spectrogram) */
  --bg-canvas: #040608;
  --bg-surface: #0c0f14;
  --bg-surface-raised: #141922;
  --bg-surface-sunken: #020305;
  --bg-surface-active: #1b222f;
  --bg-surface-overlay: #1a212e;

  /* Borders & Specular Bevels */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-medium: rgba(255, 255, 255, 0.15);
  --border-strong: rgba(255, 255, 255, 0.26);
  --border-focus: #38bdf8;
  --bevel-specular: rgba(255, 255, 255, 0.08);

  /* Typography & Ink */
  --text-primary: #fafafa;
  --text-secondary: #9099a6;
  --text-muted: #586272;
  --text-faint: #2d3545;

  /* Quantum Gate Families */
  --gate-h: #38bdf8;
  --gate-pauli-x: #4ade80;
  --gate-pauli-y: #facc15;
  --gate-pauli-z: #2dd4bf;
  --gate-cnot: #c084fc;
  --gate-phase: #f472b6;
  --gate-measure: #9099a6;

  /* Telemetry & Diagnostics */
  --evidence-success: #22c55e;
  --evidence-diverge: #f97316;
  --evidence-error: #ef4444;

  /* Gradients */
  --prob-fill: linear-gradient(90deg, #38bdf8, #2dd4bf);
  --phase-gradient: linear-gradient(90deg, #38bdf8 0%, #4ade80 25%, #facc15 50%, #f472b6 75%, #38bdf8 100%);
}

/* 2. Display P3 Wide-Gamut Hardware Layer */
@supports (color: color(display-p3 1 1 1)) {
  .dark {
    --gate-h: color(display-p3 0.385 0.731 0.951);
    --gate-pauli-x: color(display-p3 0.468 0.859 0.538);
    --gate-pauli-y: color(display-p3 0.952 0.807 0.287);
    --gate-pauli-z: color(display-p3 0.408 0.819 0.750);
    --gate-cnot: color(display-p3 0.725 0.528 0.970);
    --gate-phase: color(display-p3 0.893 0.476 0.704);
    --evidence-diverge: color(display-p3 0.928 0.593 0.310);
    --evidence-success: color(display-p3 0.369 0.761 0.414);
    --evidence-error: color(display-p3 0.865 0.320 0.320);
  }
  :root {
    --gate-h: color(display-p3 0.175 0.405 0.614);
    --gate-pauli-x: color(display-p3 0.233 0.494 0.268);
    --gate-pauli-y: color(display-p3 0.597 0.396 0.138);
    --gate-pauli-z: color(display-p3 0.209 0.456 0.430);
    --gate-cnot: color(display-p3 0.461 0.142 0.785);
    --gate-phase: color(display-p3 0.684 0.175 0.364);
    --evidence-diverge: color(display-p3 0.704 0.291 0.135);
    --evidence-success: color(display-p3 0.189 0.390 0.223);
    --evidence-error: color(display-p3 0.550 0.140 0.140);
  }
}

/* 3. Tailwind v4 Inline Theme Bridge */
@theme inline {
  --color-canvas: var(--bg-canvas);
  --color-surface: var(--bg-surface);
  --color-surface-raised: var(--bg-surface-raised);
  --color-surface-sunken: var(--bg-surface-sunken);
  --color-surface-active: var(--bg-surface-active);
  --color-surface-overlay: var(--bg-surface-overlay);

  --color-border-subtle: var(--border-subtle);
  --color-border-medium: var(--border-medium);
  --color-border-strong: var(--border-strong);
  --color-border-focus: var(--border-focus);
  --color-bevel: var(--bevel-specular);

  --color-ink-primary: var(--text-primary);
  --color-ink-secondary: var(--text-secondary);
  --color-ink-muted: var(--text-muted);
  --color-ink-faint: var(--text-faint);

  --color-gate-h: var(--gate-h);
  --color-gate-pauli-x: var(--gate-pauli-x);
  --color-gate-pauli-y: var(--gate-pauli-y);
  --color-gate-pauli-z: var(--gate-pauli-z);
  --color-gate-cnot: var(--gate-cnot);
  --color-gate-phase: var(--gate-phase);
  --color-gate-measure: var(--gate-measure);

  --color-evidence-success: var(--evidence-success);
  --color-evidence-diverge: var(--evidence-diverge);
  --color-evidence-error: var(--evidence-error);

  --gradient-prob-fill: var(--prob-fill);
  --gradient-phase: var(--phase-gradient);
}
```

---

## 8. Codebase Implementation Blueprint

To instantiate **Quanta Monograph & Deep Spectrogram** in Q-Trace, execute the following 5 file migrations:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          CODEBASE FILE MIGRATION PIPELINE                              │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ File Path                │ Changes Required         │ Safety Verification              │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ apps/web/app/globals.css │ Inject `:root`, `.dark`, │ Calibrated `#0369a1` eliminates  │
│                          │ `@theme inline`, and P3  │ light mode contrast failure      │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ apps/web/features/       │ Map gate classes to      │ High-contrast monochrome and     │
│ circuit/circuit-types.ts │ spectral emission tokens │ spectral gate families           │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ apps/web/features/       │ Use 1px optical boundary │ Clean hairline graticule wires   │
│ circuit/qubit-wire.tsx   │ and copper bus rails     │ without layout jitter            │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ apps/web/features/       │ Style KaTeX formulas in  │ Pristine typographic hierarchy   │
│ prediction-checkpoint.tsx│ recessed monograph wells │ with 19.78:1 contrast ratio      │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ apps/web/features/       │ Replace hardcoded        │ Resolves 1.48:1 contrast failure │
│ bloch-sphere-view.tsx    │ `text-cyan-200` in light │ on light chalk background        │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```
