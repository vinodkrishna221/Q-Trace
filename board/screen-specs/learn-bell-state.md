# Screen Spec — `/learn/bell-state` (Module Lesson — hero screen)

- **Archetype:** `module-lesson`
- **Purpose:** The demo's opening act. A learner reads the concept, commits to a prediction,
  and sees the circuit they are about to entangle. The Flight Recorder loop must be legible
  before any interaction.

## Section inventory

| # | Section | Content source | Notes |
|---|---|---|---|
| 1 | PageHeader | fixture + copy table | Eyebrow: level + est. minutes + module id (mono). Right slot: learner-context card (name, roleTag, path reason) |
| 2 | Prior-knowledge badge | role store + fixtures | Existing `PriorKnowledgeBadge` component; entry-band + prior-knowledge chips. TestIds frozen |
| 3 | Concept blocks | `moduleData.contentBlocks` | Existing `ConceptBlocks`; formula panels get the accent treatment (§ design system) |
| 4 | Prediction checkpoint | `moduleData.predictionCheckpoint` | Existing `PredictionCheckpoint`; amber = prediction semantics. TestIds frozen |
| 5 | Rail: Starter circuit | `DEMO_STARTER_CIRCUIT` | Mini wire diagram (visual), op list, Aer target line |
| 6 | Rail: Demo path | copy table | 4-step spine (Predict → Simulate → Diagnose → Repair), step 1 active |

## Copy table

| Key | Text |
|---|---|
| header.purpose | `Build, simulate, and diagnose an entangled two-qubit Bell pair — with Qiskit Aer evidence at every gate.` |
| header.moduleId | `ID: {moduleData.id}` |
| rail.circuit.title | `Starter Circuit` |
| rail.circuit.subtitle | `{qubitCount} qubits · {operations.length} operations` |
| rail.circuit.target | `Target: Qiskit Aer · 1024 shots` |
| rail.path.title | `Flight Recorder Path` |
| rail.path.1 | `Predict the measurement pattern` |
| rail.path.2 | `Simulate on Aer` |
| rail.path.3 | `Flight Recorder diagnosis` |
| rail.path.4 | `Evidence-based repair` |
| checkpoint.eyebrow | `STEP 1 · PREDICTION CHECKPOINT` (rendered by component; unchanged) |

## Notes

- All existing `data-testid`s on this page are frozen (unit tests cover them).
- Formula block keeps the "Mathematical representation (not physical trajectory)" caption —
  mandatory copy, never paraphrased.
- Rail cards are `bg-panel`; the demo-path card is the single rail element with accent emphasis.
