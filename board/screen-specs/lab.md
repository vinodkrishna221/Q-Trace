# Screen Spec — `/lab` (Circuit Lab)

- **Archetype:** `lab-bench` — `lg:grid-cols-12`: gate rail (3) · wire grid (6) · inspector (3)
- **Purpose:** The workspace. A judge should read it as an instrument: circuit in the center,
  gates on the left, generated evidence on the right.

## Section inventory

| # | Section | Content source | Notes |
|---|---|---|---|
| 1 | PageHeader | copy table | Eyebrow `CIRCUIT WORKSPACE`; right slot: `Simulate (Aer)` primary button |
| 2 | Gate rail | copy table (P0 static) | Available gates as instrument chips: H, X, CNOT, MEASURE. Labeled `GATE PALETTE`. Non-interactive in P0 — no fake drag affordances beyond hover |
| 3 | Wire grid | `DEMO_STARTER_CIRCUIT` | True circuit wires: continuous horizontal lines, gate boxes seated on the wire, vertical entanglement link between control (cyan ●) and target (violet ⊕). Caption: column-sorted ops, Circuit Model is the truth |
| 4 | Inspector: generated Qiskit | derived from fixture | Read-only mono code panel with syntax tinting; header `GENERATED QISKIT` + `READ-ONLY` badge |
| 5 | Inspector: circuit metadata | fixture | Qubit/classical counts, OpenQASM 3 badge, source `SEED` |

## Copy table

| Key | Text |
|---|---|
| header.eyebrow | `CIRCUIT WORKSPACE` |
| header.title | `Quantum Circuit Lab` |
| header.purpose | `Construct circuits on the wire grid and read verified simulator evidence — the Circuit Model is the single source of truth.` |
| header.cta | `Simulate (Aer)` |
| palette.title | `GATE PALETTE` |
| palette.note | `Click-to-place arrives with the builder card; grid below shows the seeded Bell circuit.` |
| grid.title | `Bell State Seed` |
| grid.caption | `Operations ordered by column · rendered from the Circuit Model` |
| code.title | `GENERATED QISKIT` |
| code.badge | `READ-ONLY` |
| meta.title | `CIRCUIT METADATA` |
| meta.qubits | `Qubits` / `Classical bits` / `Interchange` / `Source` |
| meta.interchange | `OpenQASM 3.0` |

## Notes

- Wire grid is semantic markup: `role="img"` with aria-label describing the circuit for a11y.
- Violet appears ONLY on the CNOT target (⊕) and the |11⟩ correlation semantics — nowhere else.
- Measurement gates render as instrument dials (mono `M` with a small arc), distinct from unitary gates.
