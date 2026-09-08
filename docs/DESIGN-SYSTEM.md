# Q-Trace Design System — "Observatory Dark"

> Screen-level contract for everything the judges see. Derived artifacts (tokens, components,
> pages) MUST trace back to this file. Changes go through the same review path as API contracts.
> Complements `.agents/rules/stack/quantum-ui.md` (interaction mechanics) — this file owns
> *appearance, layout, and copy*.

## 1. Design intent

Q-Trace is a **measurement instrument**, not a generic SaaS dashboard. The visual metaphor is a
physics observatory / flight recorder: a dark instrument panel where quantum evidence glows.
Every screen should feel like it was *machined*, not assembled — one accent, disciplined type,
generous darkness, and light used only to mean something.

Judges should remember it as "the quantum flight recorder product," not "another dark-mode app."

## 2. Tokens (single source: `apps/web/app/globals.css`)

### Palette

| Token | Value | Meaning |
|---|---|---|
| `--bg-abyss` | `#06070d` | Page background — deepest layer |
| `--bg-panel` | `#0b0d17` | Card / panel surface |
| `--bg-raised` | `#111425` | Raised elements (hover, wells) |
| `--line` | `#1c2138` | Default border |
| `--line-bright` | `#2b3355` | Emphasized border / dividers |
| `--ink` | `#e8ecf8` | Primary text |
| `--ink-dim` | `#8b93b0` | Secondary text |
| `--ink-faint` | `#565d78` | Captions, metadata |
| `--accent` | `#22d3ee` | Cyan — *quantum energy*: primary actions, active states, the H gate, brand |
| `--accent-deep` | `#0e7490` | Accent pressed / gradient anchor |
| `--evidence` | `#34d399` | Emerald — verified evidence, pass states, mastery |
| `--caution` | `#fbbf24` | Amber — prediction checkpoints, misconceptions, warnings |
| `--danger` | `#fb7185` | Rose — errors, divergence, destructive |
| `--violet` | `#a78bfa` | Violet — entanglement / CNOT target / second-qubit accent (sparingly) |

Rules:
- **One accent.** Cyan does all primary work. Violet appears ONLY for second-qubit /
  entanglement semantics (CNOT target, |11⟩ correlation). Never decorative violet.
- Color is never the only signal (quantum-ui.md) — pair with icon + label.
- No raw palette classes (`cyan-950/70`, `zinc-850`, `amber-400`) in page files. Pages consume
  semantic utilities: `bg-panel`, `text-ink-dim`, `border-line`, `text-evidence`, etc.

### Typography

Loaded once in `app/layout.tsx` via Google Fonts `<link>` (NOT `next/font` — demo must render
offline with `scripts/demo-local.sh`; the link degrades gracefully to system stack).

| Role | Font | Usage |
|---|---|---|
| Display | **Space Grotesk** (500/700) | Page titles, hero, big numbers, brand wordmark |
| Body | **Inter** (400/500/600) | Paragraphs, UI labels, card body |
| Mono | **JetBrains Mono** (400/600) | Circuit ops, contract IDs, code, metrics, timestamps |

Scale (Tailwind classes): hero `text-5xl md:text-6xl font-display` → page title `text-3xl
font-display` → section `text-lg font-display` → body `text-sm` → meta `text-xs font-mono`.
Never more than 3 sizes above the fold.

### Rhythm & shape

- Spacing on an 8px grid: section gaps `space-y-8`, card padding `p-6`, inline gaps `gap-2|3|4`.
- Radius: `rounded-xl` cards, `rounded-lg` wells, `rounded-md` controls, `rounded-full` badges.
- Every primary panel carries a **1px border** (`border-line`) and sits on `bg-panel`. Nesting
  goes one level darker (`bg-abyss` wells inside `bg-panel` cards).
- Glow is evidence, not decoration: `shadow-glow` (cyan) only on the primary action and on
  active/verified elements. Max one glowing element per viewport region.

## 3. Layout archetypes (closed list — pick one per screen)

| Archetype | Grid | Used by |
|---|---|---|
| `hero-observatory` | Centered hero (max-w-4xl) → 3-up persona cards → strip | `/` |
| `module-lesson` | `lg:grid-cols-3`: content col-span-2 + context rail | `/learn/[slug]` |
| `lab-bench` | `lg:grid-cols-12`: gate palette 3 · wire grid 6 · inspector 3 | `/lab` |
| `card-index` | Header + responsive card grid | `/learn` |
| `dashboard` | Stat strip → 3 metric panels → disclosure footer | `/instructor`, `/progress` |

All pages share the **PageHeader** block (see §4). Max content width is owned by the archetype
(`max-w-7xl` for lab, `max-w-5xl` for lesson/dashboard), never re-declared ad hoc per page.

## 4. Shared components (in `components/ui/` / `components/layout/`)

- `PageHeader` — eyebrow badges · display title · one-line purpose · right-side context slot.
  Every routed page uses it. No hand-rolled `border-b` headers.
- `AppShell` / `AppHeader` — sticky instrument-bar header: brand mark, nav with active glow,
  role switcher. Footer carries the mandatory disclaimer (§5).
- `Card`, `Badge`, `Button`, `Tabs`, `Skeleton` — token-driven variants only.
- Evidence states: pass = `evidence` + check icon; caution/prediction = `caution`;
  error/divergence = `danger`. Labels always accompany color.

## 5. Mandatory copy (never paraphrase)

- Footer, every page: **"Mathematical representation, not physical trajectory."**
- Mixed-subsystem Bloch views: label `MIXED_SUBSYSTEM` (quantum-ui.md).
- Loading routes render seeded skeletons; empty states carry explicit copy from the screen
  spec's copy table. No blank canvas, no lorem, no TODO.

## 6. Copy discipline

All user-visible strings live in the owning screen spec's **copy table**
(`board/screen-specs/*.md`). Page code imports or matches those strings. A PR that introduces a
user-facing string not present in the spec fails Warden review. Persona names (Aarav, Meera,
Dr. Rao) appear only where the spec's role-framing section allows them.

## 7. Banned patterns

- Per-page ad-hoc colors, one-off gradients, or a second accent.
- Centered walls of body text; paragraphs wider than ~70ch.
- Emoji as UI icons (Lucide only).
- Hardcoded hex/opacity values in page files (tokens only).
- New layout archetypes without a design-system edit in the same PR.
- Animating qubits/photons as physical objects (quantum-ui.md, restated).

## 8. Accessibility & demo floor

- Contrast: `ink` on `bg-panel` ≥ 12:1; `ink-dim` reserved for ≥14px text.
- Focus rings visible on all interactive elements (`focus-visible:ring-2 ring-accent`).
- Rehearse at 1366×768 (quantum-ui.md): primary evidence readable without hover, no horizontal
  scroll, hero fits above the fold.
