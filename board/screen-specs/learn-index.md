# Screen Spec — `/learn` (Module Index)

- **Archetype:** `card-index`
- **Purpose:** Show a real curriculum, not a one-page demo — three modules with clear levels,
  and make the Bell-state module obviously the hero.

## Section inventory

| # | Section | Content source | Notes |
|---|---|---|---|
| 1 | PageHeader | copy table | Eyebrow `LEARNING PATH`, title, one-line purpose |
| 2 | Module cards ×3 | `DEMO_MODULES` fixture | Level badge, est. minutes, title, skills, CTA. Bell-state card gets accent border + `HERO MODULE` marker; others muted |

## Copy table

| Key | Text |
|---|---|
| header.eyebrow | `LEARNING PATH` |
| header.title | `Quantum Learning Modules` |
| header.purpose | `A structured path from superposition to entanglement — every module guarded by a prediction checkpoint.` |
| card.minutes | `{estimatedMinutes} min` |
| card.skills.prefix | `Skills: ` (then skill ids minus `skill_` prefix, comma-joined) |
| card.cta.hero | `Launch Hero Lab` |
| card.cta.default | `View Module` |
| card.heroMarker | `HERO MODULE` |

## Notes

- Data comes from the `DEMO_MODULES` fixture only — no invented modules.
- Locked/unavailable modules are not faked; all three cards are navigable.
