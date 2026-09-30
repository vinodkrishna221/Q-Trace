# SIH 2026 Idea Description — Section 3: Technical Implementation

> **Problem Statement Reference:** SIH26140 — AI-Based Interactive Quantum Algorithm Learning Platform
> **Submitted by:** Team Q-Trace | Smart India Hackathon 2026
> **Section Length Target:** ~12,000 characters

---

## SECTION 3: TECHNICAL IMPLEMENTATION

### 3.1 Architecture Philosophy: One Canonical Model, Multiple Consumers

Q-Trace is built around a single foundational architectural principle: **the Circuit Model is the single source of truth**. Every downstream consumer — the visual drag-and-drop builder, the Qiskit code generator, the CodeMirror editor, the Qiskit Aer adapter, the PennyLane conformance runner, the Google Cirq adapter, the OpenQASM 3.0 exporter, the invariant linter, and the Socratic grading engine — reads from and writes to the same versioned Circuit Model JSON schema. No information is ever silently translated between representations; all conversions are explicit, validated, and reversible. This design eliminates the most common failure mode in multi-tool educational platforms: the silent drift between what the learner built visually and what the simulator actually executed.

The system is organized as a monorepo (`apps/web`, `apps/api`, `scripts`, `board/contracts`) providing a single clone, a single smoke command, and explicit frontend/backend boundaries without the deployment complexity of a microservices architecture.

### 3.2 Frontend Architecture — apps/web

**Framework: Next.js 15 App Router + React 19 + TypeScript (strict)**

Next.js 15 with App Router was selected over a Vite single-page application for three specific reasons: the team's pre-existing production Next.js patterns eliminate framework-switching costs under time pressure; App Router's route groups enable clean separation of learner (`/learn`, `/lab`, `/assess`, `/progress`) and instructor (`/instructor`) surfaces within a single deployment; and Vercel's edge network provides sub-100ms time-to-first-byte for the static learning content pages without additional CDN configuration.

React 19 is used specifically for its improved hydration and concurrent features. TypeScript strict mode enforces interface contracts between frontend components and backend API responses at compile time, catching contract drift before it reaches runtime.

**Styling: Tailwind CSS v4 + shadcn/ui**

Tailwind v4's CSS custom property architecture enables the dual-theme system (Light: Porcelain White / Dark: Carbon Obsidian) through a single token registry without JavaScript theme-switching overhead. shadcn/ui provides accessible, unstyled primitive components that integrate cleanly with Tailwind without a bundled CSS-in-JS runtime. The design system defines hairline borders (0.12–0.18 alpha, 1.5px), projector-safe contrast ratios (>6:1 on all text tokens), and a custom atomic cursor system with a tri-orbital SVG at (0,0) origin eliminating orbit drift artifacts.

**Circuit Workspace: Custom Qubit-Wire Grid + @dnd-kit/core**

A standard node-graph library (React Flow, Cytoscape) would be overpowered for a quantum circuit: quantum gates occupy ordered columns on discrete qubit wires, not arbitrary positions on an infinite canvas. The custom qubit-wire grid models the circuit as a two-dimensional array of gate cells with deterministic column normalization — exactly what the Circuit Model requires. `@dnd-kit/core` handles drag-and-drop gate placement with keyboard accessibility (`Tab` to select, `Space` to place, `Delete` to remove) and focus-visible rings compliant with WCAG 2.1 AA, verified on 1366×768 projector resolution.

**Code Editor: CodeMirror 6**

CodeMirror 6 provides syntax highlighting for the supported Qiskit subset (gate constructors, QuantumCircuit instantiation, measure calls) with custom token definitions for `QuantumCircuit`, `qc.h()`, `qc.cx()`, and related gates. The editor is integrated with a 300ms debounce that triggers the backend linter on every safe edit, returning lint warnings for QI-1/QI-2/QI-3 violations as wavy amber underlines with line gutter glyphs (⚠). Monaco was evaluated and rejected: it is substantially heavier (>1.5MB), introduces Next.js SSR compatibility issues, and provides no meaningful advantage for the bounded Qiskit grammar Q-Trace supports.

**State Management: TanStack Query + Zustand (strict boundary)**

A strict data architecture boundary separates server state from local application state:
- **TanStack Query** manages all server-derived data (Simulation Runs, Flight Recorder diagnoses, Tutor responses, Challenge Attempts, Progress Records, Instructor Insights) with built-in caching, optimistic updates, and retry logic. The 1500ms simulation timeout surfaces through TanStack Query's error state as a retry banner with a single-click re-execution affordance.
- **Zustand** manages only the two pieces of genuinely local state: the unsaved Circuit Model (gates, qubits, columns) and the Flight Recorder replay cursor position. Storing server truth in Zustand would conflate cached server data with unsaved local edits — a common source of race conditions in interactive editors.

**Visualization: Plotly.js + Custom SVG + React Three Fiber (selective)**

- **Plotly.js** renders the Bloch sphere (3D surface with qubit state vector and interior mixed-state vector for entangled subsystems) and the measurement histogram, loaded client-only via dynamic import to avoid SSR weight.
- **Custom SVG** renders the amplitude/probability State Trace view and the serpentine learning path ChamberNodes — giving precise mathematical layout control without a rendering engine boundary.
- **React Three Fiber** was used selectively for the Bell State 3D interactive simulation on the `/learn/bell-state` page, rendering dual Bloch spheres contracting to origin during entanglement. This is isolated to one page and does not add WebGL dependency to the main Lab surface.

**Gamification Engine: Zustand + localStorage persistence**

The gamification store manages Coherence Shield (0–100%, amber warning below 30%, crimson below 10%), Joules XP counter, streak tracking with decoherence penalty (-20% shield on a missed day), and shield restoration (+15% on lesson completion). The sticky LearningHUD renders these metrics as a compact telemetry bar at the top of every learning surface, with award flash animations on XP gain events.

### 3.3 Backend Architecture — apps/api

**Framework: Python 3.12 + FastAPI + Pydantic v2 + uv**

Python was the only viable choice for the backend: Qiskit Aer, PennyLane, and Google Cirq are all Python-native SDKs. Any alternative backend language would require a Python subprocess or inter-process communication layer that introduces latency, deployment complexity, and failure modes unacceptable under hackathon constraints. FastAPI's async-first architecture ensures that the 1500ms Qiskit Aer simulation — which blocks the threadpool executor — does not starve concurrent API requests. Pydantic v2 enforces schema validation at the API boundary, catching malformed Circuit Models before they reach the quantum runtime. `uv` replaces pip for deterministic dependency resolution, eliminating the "works on my machine" environment divergence that plagues hackathon submissions.

The backend is organized as a modular monolith with explicit domain boundaries:

```
apps/api/app/
├── routers/
│   ├── circuits.py          # Circuit Model parsing and OpenQASM export
│   ├── simulation_runs.py   # Qiskit Aer / PennyLane / Cirq execution
│   ├── flight_recorder.py   # Misconception diagnosis endpoints
│   ├── tutor.py             # Evidence-bound Tutor service
│   ├── grading.py           # Socratic Counterexample Engine
│   ├── progress.py          # Challenge Attempt and Progress Record
│   ├── instructor.py        # Cohort analytics and Remedial Dispatch
│   └── learning.py          # Module and Learning Path serving
├── services/
│   ├── quantum/
│   │   ├── adapter.py           # Qiskit Aer statevector + density matrix
│   │   ├── pennylane_adapter.py # PennyLane default.qubit conformance
│   │   ├── cirq_adapter.py      # Google Cirq simulator adapter
│   │   ├── normalizer.py        # Basis endianness normalization (ε = 1e-6)
│   │   ├── parser.py            # AST allowlist parser + QI-1/2/3 linter
│   │   └── openqasm_exporter.py # OpenQASM 3.0 round-trip validated export
│   ├── diagnosis/
│   │   ├── rules.py             # Deterministic misconception matching rules
│   │   └── taxonomy.py          # 4-code misconception taxonomy
│   ├── tutor/
│   │   ├── service.py           # Provider-adapter Tutor orchestrator
│   │   ├── validator.py         # Numerical claim validator (FabricatedClaimError)
│   │   └── pedagogy_qa.py       # ≤20s curated judge Q&A responses
│   └── grading/
│       └── socratic_engine.py   # Socratic Counterexample Engine
└── repositories/            # Repository interface + MongoDB + in-memory impls
```

### 3.4 Data Flow: Input Sources → Processing → Output Delivery

The complete data flow for the Bell State learner journey demonstrates how Q-Trace's layers interact:

```
[1] LEARNER INPUT
    └── Learner drags H gate onto qubit 0, CNOT gate (ctrl: q0, tgt: q1)
        Circuit Workspace builds: CircuitModel {qubits: 2, operations: [{gate:"H",qubit:0}, {gate:"CNOT",control:0,target:1}, {gate:"MEASURE"}]}

[2] FRONTEND → BACKEND
    └── POST /v1/simulation-runs
        Body: {circuitModel: CircuitModel, learnerId: "aarav", predictionCheckpoint: {answer: "INDEPENDENT_RANDOM"}}
        Headers: X-Demo-Profile-Id, X-Request-ID (traces across logs)

[3] QUANTUM EXECUTION LAYER
    └── CircuitModelValidator validates: 2 qubits (2-5 range ✓), 3 operations (≤30 ✓), all gates in GateName enum ✓
        AerSimulator (pre-warmed at startup via lifespan event):
          → qc.h(0) → save_statevector("step_0")
          → qc.cx(0,1) → save_statevector("step_1")
          → qc.measure_all()
        Returns: statevectors [step_0: (|00⟩+|10⟩)/√2, step_1: (|00⟩+|11⟩)/√2]
        Density matrix at step_1 for qubit 0: ρ_0 = Tr_1(|Φ+⟩⟨Φ+|) = I/2 → Tr(ρ_0²) = 0.5 (MIXED_SUBSYSTEM)
        PennyLane conformance: P(00)=0.500, P(11)=0.500 → Δ_max = 1.2×10⁻⁷ < ε=10⁻⁶ → CONFORMANCE_PASS
        SimulationRun persisted to MongoDB (or in-memory if DEMO_LOCAL=1)

[4] MISCONCEPTION DIAGNOSIS
    └── POST /v1/flight-recorder/diagnose
        Rules engine compares PredictionCheckpoint.answer="INDEPENDENT_RANDOM" vs State Trace:
          step_1 subsystem purity = 0.5 (MIXED: entangled, NOT independent)
          Emits: MisconceptionSignal {code: "SUPERPOSITION_VS_ENTANGLEMENT", first_divergence_step: 1, evidence: {step_1_purity: 0.5, P_00: 0.5, P_11: 0.5, P_01: 0.0, P_10: 0.0}}

[5] TUTOR EVIDENCE-BINDING
    └── POST /v1/tutor/explain
        TutorService receives immutable evidence payload (no modification permitted)
        Validator pre-checks LLM output: zero fabricated probability values
        If DEMO_FALLBACK=1: curated 20-second explanation retrieved from pedagogy_qa.py
        If ENABLE_TUTOR_CLOUD=1: cloud provider called with evidence-constrained prompt

[6] GRADING (Repair Challenge)
    └── POST /v1/grading/assess
        Student submits H-only circuit (no CNOT)
        SocraticEngine checks G-1 (Entanglement Entropy):
          Student output: product state |+0⟩ → Tr(ρ_0²) = 1.0 (pure, separable) — but challenge is to BREAK entanglement, so this PASSES
          G-1 satisfied: state IS separable (as required by the repair challenge target)
        ChallengeAttempt persisted: passed=True, score=100

[7] OUTPUT DELIVERY TO FRONTEND
    └── SimulationRunResponse: counts, probabilities, stateTrace, conformanceResults, lintWarnings
        DiagnosisResponse: misconceptionCode, firstDivergenceStep, evidence
        TutorResponse: explanation, repairChallenge, fallbackUsed (badge: CLOUD_VERIFIED or FALLBACK_CURATED)
        ProgressResponse: skillsCompleted, misconceptionHistory, totalJoules
        InstructorInsightResponse: cohortSize, commonMisconceptions (aggregate counts only)
```

### 3.5 API Integrations and External System Connections

**Simulation SDKs (Local Process, No External API):**
- Qiskit Aer 0.17 executes within the FastAPI process via a cached `AerSimulator` instance (pre-warmed at application startup via FastAPI's lifespan event to eliminate cold-start latency on the first simulation request).
- PennyLane 0.45 runs `default.qubit` device within the same process.
- Google Cirq executes via `cirq.Simulator` in the same process.
- All three SDKs are pure-Python, operate entirely locally, and have zero external API dependencies — enabling complete offline venue operation.

**Database: MongoDB Atlas M0 via async PyMongo**
- 11 collections with 26 indexes for sub-10ms query performance on typical demo-scale data volumes.
- Repository interface pattern: `MongoRepository` and `InMemoryRepository` share an identical protocol, allowing DEMO_LOCAL=1 to switch to deterministic in-memory seeds without any code-path changes in the service layer.
- `DEMO_LOCAL=1` selects the in-memory repository. Seeds load 30 synthetic learner profiles, 75 challenge attempts, and 40 misconception signals in under 200ms.

**AI Tutor: Provider-Adapter Interface**
- A `BaseTutorProvider` protocol accepts any cloud LLM (Google Gemini, OpenAI GPT-4o, Anthropic Claude) by implementing three methods: `explain()`, `challenge()`, `recommend_module()`.
- `DEMO_FALLBACK=1` activates `FakeTutorProvider`, which returns curated trace-aware explanations for all scripted demo states with zero external dependency.
- Temperature: 0–0.2 (minimal creativity for factual explanation). All prompts include the full evidence payload as a system context block. The validator runs post-generation on every real LLM response.

**OpenQASM 3.0 Export / qBraid Interoperability**
- `POST /v1/circuits/export-openqasm3` converts any valid CircuitModel to OpenQASM 3.0 format with round-trip import validation.
- Exported circuits are natively executable on qBraid Cloud, IBM Quantum, and AWS Braket without modification.

### 3.6 Security, Privacy, and Compliance

**Code Execution Security (Critical Path):**
The most significant attack surface in any quantum education platform is the code editor. Q-Trace's security model is unconditional: submitted Qiskit code is NEVER executed. The Python `ast` module parses the submitted text and applies a closed allowlist grammar. Any of the following triggers immediate rejection with a descriptive error: `exec`, `eval`, `compile`, `__import__`, `open`, `subprocess`, arbitrary function definitions, `for`/`while` loops (outside QAOA templates), assignments to non-circuit variables, and any gate call not in the closed GateName enum. The AST inspection runs in the FastAPI process on the parsed syntax tree — no subprocess is spawned, no code leaves the parse stage. This architecture is verified by 24 security corpus tests covering exec/eval/compile injection, arbitrary imports, file access, obfuscation techniques, and circuit-limit evasion.

**Data Privacy:**
- Free-form Tutor text is never persisted. Only structured outcome metadata is stored: misconception code, challenge result, simulation run ID.
- Instructor Insight is aggregate-only: cohort-level misconception counts, never individual learner chat history.
- The synthetic demo cohort uses fictional personas (Aarav, Meera, Dr. Rao) with explicit `syntheticDataDisclosure: true` flags in all seed documents.
- No learner personally identifiable information (PII) is required or collected in the prototype; the institutional deployment path uses institutional email-domain authentication.

**API Security:**
- `X-Request-ID` header propagates through all services for distributed tracing without exposing internal entity IDs.
- ObjectId serialization is explicitly sanitized — MongoDB document IDs are never leaked in API responses.
- Contract tests verify that renamed fields, missing request IDs, and ObjectId leaks trigger validation failures at both the Pydantic (backend) and Zod (frontend) schema boundaries.

### 3.7 Mobile and Web Interface Design Philosophy

The interface is designed to three concentric screen targets:
1. **1920×1080 desktop (development and demo):** Full 3-zone Lab layout (Circuit Workspace + Visual Evidence + Flight Recorder side-by-side), 12-column learning catalogue, full serpentine path with dual-rail bus spline.
2. **1366×768 projector (hackathon demo):** Verified accessible text sizes (minimum 12px bold SVG text), projector-safe contrast ratios, accessible table fallbacks for all chart components.
3. **375–640px mobile:** Single-column serpentine path with ±44px sinusoidal swing (vs ±120px desktop), 52px ChamberNode diameter for touch targets, spring-animated bottom sheet replacing desktop inspector panel, 4-tab bottom navigation bar.

The design system defines five core interaction principles: **Porcelain precision** (hairline borders, minimal chrome), **Quantum materiality** (gate elements have physical weight — mechanical press animations, specular crests), **Evidence primacy** (simulator numbers always visible, never hidden behind loading spinners longer than 1500ms), **Signal clarity** (amber/crimson semantic color tokens for warning states, never decorative), and **Offline confidence** (venue-resilient fallback states are visually disclosed, not invisibly substituted).

### 3.8 Development Tools, Frameworks, and Testing Infrastructure

**Toolchain:**
- `pnpm` workspaces manage the monorepo with shared `node_modules` deduplication.
- `uv` provides sub-second Python dependency resolution and lockfile reproducibility.
- `uvicorn` (async ASGI server) runs the FastAPI application with hot-reload in development and production-mode workers in deployment.
- ESLint + Prettier enforce TypeScript code style; `ruff` enforces Python code style.

**Testing Infrastructure:**
The project maintains 601+ automated tests across the full stack:
- **421 Next.js tests** (Vitest + Testing Library) — covering all 39 test suites including circuit workspace interactions, gamification store state machines, serpentine path rendering, and mobile bottom-sheet accessibility.
- **694 FastAPI unit tests** — covering simulation correctness (Qiskit Aer Bell state probabilities, PennyLane conformance, Cirq adapter), AST security corpus (24 injection vectors), Socratic grading invariants (19 mutation scenarios), misconception taxonomy (50 rule combinations), and Tutor evidence binding.
- **120 acceptance tests** — cross-track API integration tests verifying end-to-end learner loop behavior.
- **1 Playwright E2E test** — `bell-journey.spec.ts` covering Beats B1–B8 of the full 90-second demo script with trace/video recording on failure.
- **Release gate:** `scripts/release-gate.sh` runs contract drift scan (zero drift across 4 contracts), 7-scenario forced-offline fallback drill (100% parity), local ephemeral stack smoke, and generates `board/WARDEN-RELEASE-VERDICT.md`.

**Deployment:**
- **Frontend:** Vercel (Next.js deployment, automatic preview URLs per branch).
- **Backend:** Railway (FastAPI + Qiskit Aer + PennyLane + Cirq, `railway.toml` configuration).
- **Database:** MongoDB Atlas M0 (free tier for prototype).
- **Local demo:** `DEMO_LOCAL=1 bash scripts/demo-local.sh` starts the complete stack on one laptop with in-memory data, memory-backed Tutor fallback, and offline Quantum SDK execution in under 30 seconds.

---

*The following section provides the feasibility assessment — including a realistic 36-hour development timeline, concrete impact metrics, challenge mitigation strategies, and the post-hackathon roadmap for institutional deployment.*
