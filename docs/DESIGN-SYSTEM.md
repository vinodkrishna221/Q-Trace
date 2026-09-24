# Q-Trace Design System — "Linear Precision Quantum Instrument"

> Screen-level contract for everything the judges and learners see. Derived artifacts (tokens, components,
> pages) MUST trace back to this file. Changes go through the same review path as API contracts.
> Complements `.agents/rules/stack/quantum-ui.md` (interaction mechanics) — this file owns
> *appearance, layout, themes, and presentation copy*.

## 1. Design Intent & Aesthetic Philosophy

Q-Trace is a **high-precision scientific instrument**, crafted to the standard of Linear (`linear.app`) and modern developer workspaces. The visual metaphor is a refined quantum measurement console: disciplined typography, hairline translucent borders, subtle surface elevations, and surgical luminescence where light and color represent verified quantum evidence.

The interface prioritizes **extreme cognitive clarity**:
- Progressive disclosure over 4,000px monolithic vertical scrolling.
- Human-centered quantum terminology over developer debug strings.
- Monochromatic sophistication over decorative neon glows and saturated gradients.
- Seamless **Dark & Light Mode** support, defaulting to the user's system preference.

Judges should experience Q-Trace as a peer to Linear, Raycast, or Figma — an unmistakably premium software instrument.

---

## 2. Tokens & Dual-Theme Color System

Single source of truth: `apps/web/app/globals.css`.  
Supported via `next-themes` with automatic system preference detection.

### 2.1 Surface & Border Palette

| Token | Light Mode (`:root`) | Dark Mode (`.dark`) | Semantic Role |
|---|---|---|---|
| `--bg-canvas` | `#ffffff` | `#08090a` | Deepest viewport background |
| `--bg-surface` | `#f9fafb` | `#121316` | Standard card and container surface |
| `--bg-surface-raised` | `#f3f4f6` | `#18191c` | Hover states, active tabs, recessed wells |
| `--bg-surface-active` | `#e5e7eb` | `#222429` | Pressed buttons, selected list rows |
| `--border-subtle` | `rgba(0, 0, 0, 0.06)` | `rgba(255, 255, 255, 0.05)` | Hairline dividers, card outlines |
| `--border-default` | `rgba(0, 0, 0, 0.10)` | `rgba(255, 255, 255, 0.08)` | Standard component borders, inputs |
| `--border-strong` | `rgba(0, 0, 0, 0.18)` | `rgba(255, 255, 255, 0.15)` | Emphasized cards, focused elements |

### 2.2 Text & Typography Palette

| Token | Light Mode (`:root`) | Dark Mode (`.dark`) | Semantic Role |
|---|---|---|---|
| `--text-primary` | `#0f172a` | `#f7f8f8` | Primary headings, prominent values, active titles |
| `--text-secondary` | `#475569` | `#8a8f98` | Body text, section explanations, descriptions |
| `--text-muted` | `#94a3b8` | `#575a61` | Micro-labels, disabled text, secondary metadata |
| `--text-faint` | `#cbd5e1` | `#34373d` | Hairline watermarks, placeholder tracks |

### 2.3 Semantic Accents & Quantum State Indicators

Color is **never decorative**; it is surgical state telemetry.

| Semantic Token | Light Mode | Dark Mode | Usage Rule |
|---|---|---|---|
| `--accent` | `#0284c7` (Sky 600) | `#38bdf8` (Sky 400) | Primary actions, H-gate, active wire focus. Never glowing neon. |
| `--accent-subtle` | `#f0f9ff` | `rgba(56, 189, 248, 0.10)` | Active button backgrounds, soft selection pills. |
| `--success` | `#059669` (Emerald 600) | `#34d399` (Emerald 400) | Verified evidence, passed repair challenge, pure state (purity = 1.0). |
| `--success-subtle` | `#ecfdf5` | `rgba(52, 211, 153, 0.10)` | Success pill backgrounds. |
| `--warning` | `#d97706` (Amber 600) | `#fbbf24` (Amber 400) | Prediction divergence, checkpoint prompt, stale circuit warning. |
| `--warning-subtle` | `#fffbeb` | `rgba(251, 191, 36, 0.10)` | Warning notification wells. |
| `--danger` | `#dc2626` (Rose 600) | `#f87171` (Rose 400) | Syntax parse errors, simulation timeouts, broken circuit alerts. |
| `--violet` | `#7c3aed` (Violet 600) | `#a78bfa` (Violet 400) | Entanglement, CNOT target, Bell correlation (|00⟩+|11⟩). |

Rules:
- **No raw Tailwind color utilities**: Never write `bg-zinc-900`, `text-cyan-400`, or `border-neutral-800` in JSX. All components consume semantic CSS variables (`bg-surface`, `text-primary`, `border-subtle`).
- **No glowing drop-shadows**: Banned `shadow-glow: 0 0 24px ...`. Replaced with subtle 1px border contrast and refined inset highlights:
  `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 2px rgba(0, 0, 0, 0.2);`
- **Subtle background depth**: The harsh 48px grid texture is completely removed. In Dark Mode, a soft radial falloff `radial-gradient(ellipse 60% 40% at 50% -10%, rgba(56, 189, 248, 0.04), transparent)` sits over `--bg-canvas`.

---

## 3. Typography & Micro-Hierarchy

- **Primary Font**: **Inter** (loaded locally or system fallback). Clean, neutral, highly legible at small sizes.
  - Headings: `font-sans font-semibold tracking-[-0.015em]`
  - Body: `font-sans font-normal text-sm leading-relaxed`
  - Meta/Badges: `font-sans font-medium text-[11px] uppercase tracking-wider`
- **Monospace Font**: **JetBrains Mono** strictly reserved for:
  - Qiskit Python editor lines
  - Quantum Dirac notation (e.g., `|00⟩`, `|Φ⁺⟩`)
  - Precision numerical percentages and mathematical formulas
- **Monospace is BANNED for general UI copy, badges, titles, and button labels.**

---

## 4. Layout Archetypes (Closed List)

Every routed screen conforms to one of these structured archetypes:

| Archetype | Grid & Viewport Model | Used By | Description |
|---|---|---|---|
| `studio-workbench` | 3-Stage Sequential Studio (`max-w-7xl`) | `/lab` | Stage 1 (Construct & Code) ➔ Stage 2 (Visual Evidence) ➔ Stage 3 (Flight Recorder). Single run trigger; no duplicate buttons; wire grid & code side-by-side on desktop. |
| `stepper-canvas` | Single-Column Focused Canvas (`max-w-4xl`) | `/learn/[slug]` | 7-step guided progression without the distracting sidebar. Completed steps collapse to 1-line checkmark summaries; only the active step is expanded. |
| `catalog-grid` | Header + Categorized Module Grid (`max-w-6xl`) | `/learn` | Algorithm directory (Grover, QFT, VQE) and progress tracker. Breadcrumb navigation leads back here from individual lessons. |
| `compact-dashboard` | KPI Strip ➔ 3 Clean Metric Panels (`max-w-5xl`) | `/progress`, `/instructor` | Summary statistics, skill competencies, and cohort charts with accessible table fallbacks. |

---

## 5. Purging Developer Telemetry & Human Presentation Rules

Q-Trace is built for learners and judges, not backend debugging. All internal identifiers MUST be sanitized before rendering in the UI:

1. **Request & Session IDs**: Banned from visible cards (`req_live_...`, `req_demo_...`, `progress_lp_...`). Logged to the browser developer console only.
2. **Raw JSON State Paths**: Banned from card text (`stateTrace.0.basisProbabilities`). Replaced with human labels (e.g., "Hadamard Basis Superposition").
3. **Raw Enum Constants**: Banned from headers and badges. Translated via UI presenters:
   - `PROBABILITY_SUPPORT_EQUALS` ➔ "Target State Match"
   - `CORRELATED_00_11` ➔ "Entangled Pair (|00⟩ & |11⟩)"
   - `NO_SIGNAL` ➔ "Mental Model Verified"
   - `MIXED_SUBSYSTEM` ➔ "Entangled Subsystem"
4. **Floating Point Precision**: Banned unrounded floats (`2.220446049250313e-16`). All coordinates and probabilities MUST be formatted to 2 or 3 decimal places (e.g., `(x: 1.00, y: 0.00, z: 0.00)`).
5. **Raw Tolerances**: Banned from card text (`tolerance ε = 0.000001`). Backend validates tolerances silently.

---

## 6. Shared Components & Ergonomics

- **`AppHeader` (`h-14`)**:
  - Sticky glass header with `border-b border-border-subtle backdrop-blur-md`.
  - Brand wordmark + minimal subtitle.
  - Active navigation links with clean indicator pills.
  - Compact **Role Switcher Dropdown** (`Aarav (Beginner CSE) ▾`): opens a menu to switch personas without wrapping bio paragraphs in the navbar.
  - **Theme Toggle**: Linear-style 3-way toggle (Light / Dark / System).
- **`PageHeader`**: Clean title, 1-line purpose, and optional breadcrumbs. No cluttered developer request ID badges.
- **`Card`**: 1px translucent border (`border-subtle`), subtle surface elevation (`bg-surface`), `rounded-xl`, padding disciplined to 16px–24px.
- **`Button`**: Compact heights (`h-8` for small, `h-9` for standard). Clean micro-transitions. Exactly one primary action per viewport.

---

## 7. Mandatory Copy & Scientific Honesty

- **Footer Disclaimer (Mandatory on every screen)**:  
  *"Mathematical representation, not physical trajectory."*
- **Entangled Bloch Spheres**: Reduced subsystems with purity `< 1.0` must carry the label:  
  *"Entangled Subsystem · Purity Tr(ρ²): 0.50"* (accompanied by note: *"Represents reduced single-qubit density matrix, not the entangled whole."*).

---

## 8. Banned Patterns (Enforced in Reviews)

- Hardcoded palette classes (`bg-zinc-950`, `text-cyan-400`, `border-line-bright`).
- Glowing neon drop shadows or oversaturated colored box shadows.
- Multi-line user bio text crammed into the navigation header.
- Two identical "Run Simulation" buttons on the same page.
- Exposing raw contract keys (`stateTrace.x.y`, `req_...`, `ch_...`, `PROBABILITY_...`) in UI copy.
- Unrounded floating point values.
- Centered walls of text or paragraphs wider than 70ch.
- Distracting multi-stage curriculum sidebars inside active individual learning steps.
