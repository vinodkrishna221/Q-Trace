# Fit Audit — Q-Trace

> Status: **APPROVED, APPLIED AND SYNCED** · blueprint step 6 · 23 Aug 2026
> Inputs: approved PRD, architecture stack record and four contract domains.

## 1 · Capability inventory

- Next.js 15+/React 19/TypeScript/Tailwind learner interface
- Custom circuit grid, supported Qiskit code view and Plotly-based educational visualization
- Python 3.12/FastAPI/Pydantic v2
- Qiskit SDK/Aer primary simulation and State Trace extraction
- PennyLane `default.qubit` conformance simulation and snapshots
- Framework-neutral Circuit Model and supported-subset OpenQASM 3 export
- Deterministic misconception rules plus evidence-bound Tutor provider adapter/fallback
- MongoDB Atlas M0 plus deterministic in-memory venue fallback
- Vercel, Railway and Atlas deployment with one-laptop local mode
- Seeded learner/content/challenge data and aggregate instructor analytics

## 2 · Coverage map

| Capability | Coverage | Existing evidence / gap |
|---|---|---|
| Next.js/React/Tailwind | COVERED | `rules/stack/nextjs.md` covers App Router, client boundaries, loading/error UX, version pins and Vercel traps. |
| FastAPI/Pydantic | COVERED | `rules/stack/fastapi.md` covers routers, async/threadpool, CORS, structured errors and health checks. |
| MongoDB Atlas | COVERED | `rules/stack/mongodb.md` covers driver choice, serverless connections, indexes, seeds and pre-warm. |
| Tutor provider/fallback | COVERED | `rules/stack/ai-llm.md` covers provider abstraction, structured output, evidence display, retries and DEMO_FALLBACK. |
| Offline venue path | COVERED | `rules/arenas/sih.md` requires one-laptop operation, local seeds, cached responses and network-independent demo readiness. |
| Qiskit Aer simulation/State Trace | MISSING | No stack pack covers state-save placement, measurement collapse, basis ordering, statevector limits or JSON complex values. |
| PennyLane conformance/snapshots | MISSING | No pack covers `default.qubit`, snapshot semantics, cross-adapter tolerance or explicit skip behavior. |
| Quantum runtime safety/OpenQASM | MISSING | API-contract law covers types, but nothing forbids arbitrary Python execution or defines resource limits, adapter normalization, tolerance and partial OpenQASM support. |
| Quantum visualization correctness | MISSING | No pack prevents misleading Bloch views of entangled subsystems, mixed amplitude/count labels or UI-generated quantum values. |
| Circuit grid/code synchronization | MISSING | Generic Next.js law does not define one Circuit Model truth, atomic code-to-model replacement, stable gate ordering or accessible drag/drop fallbacks. |
| TanStack Query/Zustand boundary | PARTIAL | Next.js pack discourages unnecessary global state, but this Circuit Workspace needs an explicit server-state versus unsaved-model boundary. |
| Instructor analytics/privacy | COVERED | Mongo/schema contracts plus SIH privacy law cover aggregate views and synthetic-data disclosure; no specialized regulated data is used. |

## 3 · Necessity gate

| Candidate asset | ≥3 cards? | Demo-fatal if wrong? | Unfamiliar/version-risk? | Decision |
|---|---:|---:|---:|---|
| `rules/stack/quantum-ui.md` | YES | YES | YES | **ADD — 3/3**; circuit/model drift or false visualization breaks the learner demo |
| `rules/stack/quantum-runtime.md` | YES | YES | YES | **ADD — 3/3**; unsafe parsing or incorrect traces/adapters invalidate the system |
| edit `AGENTS.md` rules index | YES | YES (unloaded packs are equivalent to absent) | NO | **EDIT — two index rows are mandatory companion work** |
| separate OpenQASM pack | NO | NO | YES | DECLINE — 1/3; covered in quantum-runtime plus the contract |
| generic Plotly/CodeMirror/dnd-kit pack | NO | NO | YES | DECLINE — the approved quantum-ui pack contains only this project’s demo-fatal usage, not generic library documentation |
| quantum-physicist persona | persona-specific role need: NO | existing Forge/Sage/Warden split covers it | factual truth comes from simulators/fixtures, not roleplay | DECLINE — duplicate cast, not a missing track owner |
| quantum-pedagogy skill | limited to three seeded Modules | YES | YES | DECLINE — project-specific misconception fixtures and the runtime evidence gate are smaller than a reusable procedure |
| Qiskit/PennyLane MCP server | NO | NO | YES | DECLINE — no approved server is needed; SDK tests provide introspection |
| Cirq/qBraid rules | NO | NO | YES | DECLINE — explicit internal-prototype non-goals |
| real-QPU execution pack | NO | NO | YES | DECLINE — explicit non-goal; no credentials/credits or hardware queue in the demo |

## 4 · Official sources used for the proposed packs

- Qiskit Aer simulator and save-state behavior: https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html
- Qiskit Aer statevector memory model: https://qiskit.github.io/qiskit-aer/stubs/qiskit_aer.StatevectorSimulator.html
- Qiskit SDK OpenQASM 3 feature table: https://qiskit.qotlabs.org/docs/guides/qasm-feature-table
- Qiskit SDK 2.3 release line: https://qiskit.qotlabs.org/docs/api/qiskit/release-notes/2.3
- PennyLane 0.45.1 circuit inspection and snapshots: https://docs.pennylane.ai/en/stable/introduction/inspecting_circuits.html
- PennyLane 0.45.1 snapshot API: https://docs.pennylane.ai/en/stable/code/api/pennylane.snapshots.html
- PennyLane circuit resource/depth API: https://docs.pennylane.ai/en/stable/code/api/pennylane.specs.html

## 5 · THE DIFF — awaiting approval

### ADD

1. **`.agents/rules/stack/quantum-ui.md`** — project UI pack covering one Circuit Model truth, ordered dnd-kit grid rules, TanStack Query/Zustand boundaries, atomic CodeMirror parsing, Plotly fallback, physically honest evidence labels and accessible non-drag controls. Necessity score: **3/3**.
2. **`.agents/rules/stack/quantum-runtime.md`** — project runtime pack covering compatibility baseline + tested lockfile, safe AST parsing, resource caps, pre-measurement traces, adapter normalization/tolerance, JSON complex values, reduced-state purity, OpenQASM limits and Tutor evidence boundaries. Necessity score: **3/3**.

### EDIT

3. **`AGENTS.md`** — add two Rules Index rows: frontend/QA load `quantum-ui.md`; simulation/AI-pedagogy/QA load `quantum-runtime.md`. No other core law changes.

### REMOVE FROM PROPOSAL

The earlier single `quantum-simulation.md` draft is superseded and will not enter `.agents/`.

### NO CHANGE

Personas · skills · workflows · templates · MCP servers · existing stack packs · arena rules.

## 6 · Proposed content summary

`quantum-ui.md` protects the learner-facing circuit model, code synchronization, visualization semantics and accessibility. `quantum-runtime.md` protects execution safety and numerical correctness across Qiskit Aer and PennyLane. Together they follow the approved Next.js quantum workspace + FastAPI modular-monolith boundary without duplicating the shipped Next.js, FastAPI, Mongo or AI packs.

Human approved all three operations. Both packs were added, the AGENTS.md index was updated, and `scripts/sync.sh` completed successfully. The kit freeze is re-engaged until `/retro` or a stack-changing `/pivot`.
