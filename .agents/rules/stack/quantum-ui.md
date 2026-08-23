# Stack Pack — Quantum Learning UI (load on frontend and QA tracks)

Compatibility baseline: Next.js 15 line · React 19 · TypeScript strict · Tailwind 4 · dnd-kit 6 · CodeMirror 6 · TanStack Query 5 · Zustand 5 · Plotly 3. Commit the tested lockfile.

## Hackathon defaults (decided — don't relitigate)

- `Circuit Model` is the only editable truth. Grid cells, generated Qiskit, OpenQASM export and API payloads derive from it; never maintain parallel circuit arrays.
- Build qubit wires as an ordered CSS grid with dnd-kit keyboard sensors. React Flow is banned for the prototype; this is not a free graph.
- Zustand stores only the unsaved Circuit Model, selected gate and Flight Recorder cursor. TanStack Query owns server results; React local state owns temporary panel UI.
- CodeMirror shows generated Qiskit and accepts only the frozen supported grammar. Unsupported edits stay visible with an explicit error and never mutate the Circuit Model.
- Plotly is client-only and dynamically imported. Provide a static SVG/table fallback for every demo chart.
- State amplitudes/probabilities, sampled measurement counts and reduced-qubit Bloch views are separate panels with separate labels.
- A Bloch vector with purity `<1` is labeled `MIXED_SUBSYSTEM`; it never represents the whole entangled state.
- Every quantum visualization displays “mathematical representation, not physical trajectory.” Do not animate qubits or photons literally splitting.
- Flight Recorder steps use immutable State Trace indexes; UI animation never computes quantum values.
- Drag/drop has click-to-place and keyboard alternatives. Gate identity never depends on color alone.
- Demo routes render seeded empty/loading/error/fallback states; no blank canvas while API or Plotly loads.

## Traps that kill demos

- Hydrating Plotly or browser APIs on the server → wrap in a client component and dynamic import with SSR disabled.
- dnd-kit item order drifting from gate columns → serialize by explicit `column`, then stable operation ID, never DOM order.
- Code editor and builder both writing at once → parse to a candidate model, validate, then atomically replace or reject.
- Reversing basis labels between frontend and backend → render normalized basis keys exactly as the contract returns them.
- Dense Bloch/phase graphics at projector resolution → rehearse at 1366×768 and keep the primary evidence readable without hover.
