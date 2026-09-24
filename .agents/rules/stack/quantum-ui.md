# Stack Pack — Quantum Learning UI (load on frontend and QA tracks)

Compatibility baseline: Next.js 15 line · React 19 · TypeScript strict · Tailwind 4 · dnd-kit 6 · CodeMirror 6 · TanStack Query 5 · Zustand 5 · Plotly 3. Commit the tested lockfile.

## Hackathon defaults (decided — don't relitigate)

- `Circuit Model` is the only editable truth. Grid cells, generated Qiskit, OpenQASM export and API payloads derive from it; never maintain parallel circuit arrays.
- Build qubit wires as an ordered CSS grid with dnd-kit keyboard sensors. React Flow is banned for the prototype; this is not a free graph.
- Zustand stores only the unsaved Circuit Model, selected gate and Flight Recorder cursor. TanStack Query owns server results; React local state owns temporary panel UI.
- CodeMirror shows generated Qiskit and accepts only the frozen supported grammar. Unsupported edits stay visible with an explicit error and never mutate the Circuit Model.
- Plotly is client-only and dynamically imported. Provide a static SVG/table fallback for every demo chart.
- State amplitudes/probabilities, sampled measurement counts and reduced-qubit Bloch views are separate panels with separate labels.
- A Bloch vector with purity `<1` is labeled `Entangled Subsystem · Purity Tr(ρ²): <purity>`; it never represents the whole entangled state.
- Every quantum visualization displays “mathematical representation, not physical trajectory.” Do not animate qubits or photons literally splitting.
- Flight Recorder steps use immutable State Trace indexes; UI animation never computes quantum values.
- Drag/drop has click-to-place and keyboard alternatives. Gate identity never depends on color alone.
- Demo routes render seeded empty/loading/error/fallback states; no blank canvas while API or Plotly loads.

## Linear UI & Presentation Standards (The Anti-Clutter Law)

- **Theme Neutrality**: All UI components consume semantic CSS variables (`bg-surface`, `text-primary`, `border-subtle`, `accent`) supporting both Light and Dark modes. Hardcoded dark classes (`bg-zinc-950`, `text-cyan-400`) are banned.
- **Developer Telemetry Boundary**: Contracts provide IDs for network traceability, but UI components MUST sanitize them:
  - Banned from UI copy: raw request IDs (`req_...`), internal contract IDs (`ch_...`, `progress_lp_...`), and raw JSON paths (`stateTrace.0.basisProbabilities`).
  - Banned from UI copy: raw enum constants (`PROBABILITY_SUPPORT_EQUALS`, `CORRELATED_00_11`, `NO_SIGNAL`). Translate to human-readable strings via presenter mappers.
  - Banned from UI copy: raw unrounded machine-epsilon floats (`2.2204e-16`). All coordinates and probabilities must be formatted to 2–3 decimal places (`toFixed(2)`).
- **Single Simulation Trigger**: Exactly one primary "Run Simulation" button per view. Duplicate run buttons in different cards are banned.
- **Stage Progression**: `/lab` follows a 3-Stage Studio workflow ([1. Construct & Code], [2. Visual Evidence], [3. Flight Recorder]). `/learn/[slug]` follows a single-column progressive stepper with curriculum catalog housed on the parent `/learn` route.

## Traps that kill demos

- Hydrating Plotly or browser APIs on the server → wrap in a client component and dynamic import with SSR disabled.
- dnd-kit item order drifting from gate columns → serialize by explicit `column`, then stable operation ID, never DOM order.
- Code editor and builder both writing at once → parse to a candidate model, validate, then atomically replace or reject.
- Reversing basis labels between frontend and backend → render normalized basis keys exactly as the contract returns them.
- Dense Bloch/phase graphics at projector resolution → rehearse at 1366×768 and keep the primary evidence readable without hover.
- Dumping raw database and contract IDs onto cards → destroys perceived product maturity and alienates judges.
