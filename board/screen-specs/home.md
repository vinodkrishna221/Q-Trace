# Screen Spec — `/` (Home)

- **Archetype:** `hero-observatory`
- **Purpose:** In 5 seconds a judge understands: this is an AI quantum-learning platform whose
  signature is the Quantum Flight Recorder — and there is one obvious door into the demo.

## Section inventory (in order)

| # | Section | Content source | Notes |
|---|---|---|---|
| 1 | Status pill | copy table | Small mono pill above headline |
| 2 | Hero | copy table | Display headline + one-sentence lede; product name gets accent gradient |
| 3 | Primary actions | routes | 2 buttons: Enter the Bell-State Module (primary, glow), Open Circuit Lab (outline) |
| 4 | Flight Recorder strip | copy table | Horizontal 4-step spine: Predict → Simulate → Diagnose → Repair. The differentiator, visible without scrolling |
| 5 | Persona cards ×3 | copy table | Aarav / Meera / Dr. Rao — one card each, links to their surface |
| 6 | Footer | AppShell | Mandatory disclaimer verbatim |

## Copy table

| Key | Text |
|---|---|
| pill | `SIH 2026 PROTOTYPE · QUANTUM FLIGHT RECORDER` |
| headline.pre | `Learn quantum computing from` |
| headline.accent | `verified evidence` |
| headline.post | `— not guesswork.` |
| lede | `Q-Trace captures your prediction, replays the true simulator state gate by gate, and pinpoints the exact moment your mental model diverges from the physics.` |
| cta.primary | `Enter the Bell-State Module` |
| cta.secondary | `Open Circuit Lab` |
| spine.1 | `Predict` / `Commit to an outcome before execution` |
| spine.2 | `Simulate` / `Run the circuit on Qiskit Aer` |
| spine.3 | `Diagnose` / `Find the gate where your model diverged` |
| spine.4 | `Repair` / `Fix the misconception with evidence` |
| persona.aarav.tag | `AARAV · BEGINNER CSE` |
| persona.aarav.title | `Structured Learning` |
| persona.aarav.body | `Prediction checkpoints surface misconceptions before the simulation ever runs.` |
| persona.aarav.cta | `Start Module` |
| persona.meera.tag | `MEERA · PHYSICS → CODE` |
| persona.meera.title | `Circuit Lab & State Trace` |
| persona.meera.body | `Synchronized circuit grid, generated Qiskit, and verified statevector evidence.` |
| persona.meera.cta | `Launch Lab` |
| persona.rao.tag | `DR. RAO · COURSE OPERATOR` |
| persona.rao.title | `Instructor Insight` |
| persona.rao.body | `Cohort completion, pass rates, and the misconceptions worth re-teaching.` |
| persona.rao.cta | `View Cohort` |

## Notes

- No "enter as Aarav" framing in CTAs — role selection lives in the header role switcher.
- The Flight Recorder strip is the wow beat: four nodes connected by a traced line, step 3
  (Diagnose) carries the accent glow. It is decorative markup, no JS required.
