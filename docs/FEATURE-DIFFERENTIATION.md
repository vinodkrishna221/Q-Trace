# Q-Trace: Feature Differentiation & Ideation Brief
**Target Event**: Smart India Hackathon (SIH 2026) — Problem Statement 4: *AI-Based Interactive Quantum Algorithm Learning Platform*  
**Workflow**: `/ideate` (Ideation Gauntlet & Consensus Ban)  
**Codebase Base**: `Q-Trace` (`apps/web` + `apps/api`)  
**Date**: September 28, 2026  

---

## 1. Codebase Reality & Existing Feature Audit

An in-depth inspection of the current Q-Trace repository reveals significant production-grade assets alongside critical architectural bottlenecks that must be resolved to fulfill the hackathon problem statement.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Q-TRACE CODEBASE REALITY                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ apps/web (Next.js 15, React 19, Tailwind CSS 4, Zustand 5, Canvas2D / Three.js)         │
│  ├── /lab: Synchronized Studio with QubitWiresGrid + QiskitCodeEditor (Hardcoded Aer) │
│  ├── /learn: Serpentine Path for Module 1 (Foundations Units 1.1–1.10; 0 Algorithms)   │
│  ├── /evidence: Bloch3DSphere (Canvas2D), TwoQubitQSphere, ProbabilityHistogramView    │
│  └── /instructor: CohortAnalyticsChart (Hardcoded to mod_bell and ch_bell_repair)      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ apps/api (FastAPI, Python 3.12, Qiskit Aer 0.17, PennyLane 0.45)                       │
│  ├── models/circuit.py: Closed GateName {H, X, Y, Z, CNOT, MEASURE} (NO Rotations/CCX)│
│  ├── services/quantum/parser.py: Safe AST parser (Bans loops, functions, non-qc calls) │
│  ├── services/quantum/adapter.py: Qiskit Aer cached statevector + partial density matrix│
│  ├── services/quantum/pennylane_adapter.py: PennyLane default.qubit conformance runner │
│  ├── services/diagnosis/rules.py: 4 Misconceptions (Bell-state step 0 & 1 hardcoded)  │
│  └── services/tutor/service.py: Zero-hallucination grounded tutor with offline fallback│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Verified Strengths in Codebase
- **Subsystem State Telemetry**: `apps/api/app/services/quantum/adapter.py` computes reduced $2 \times 2$ density matrices $\rho$ by tracing out foreign qubits, computing purity $\text{Tr}(\rho^2)$ and Bloch coordinates $(x,y,z)$ at every step.
- **Deterministic Tutor Guardrails**: `apps/api/app/services/tutor/validator.py` cross-examines LLM statements against simulator telemetry, throwing `FabricatedClaimError` if an LLM hallucinates numbers.
- **AST Bidirectional Code Synchronization**: `apps/web/features/circuit/circuit-parser.ts` and `apps/api/app/services/quantum/parser.py` synchronize visual canvas operations with Qiskit Python code safely.
- **Gamified Serpentine Path**: Next.js `/learn` features an interactive serpentine path with 10 units, tactile nodes, and a HUD tracking Coherence Shield & Joules XP.

### 1.2 Architectural Constraints Discovered
- **Closed Gate Vocabulary**: `apps/api/app/models/circuit.py` only recognizes `H`, `X`, `Y`, `Z`, `CNOT`, `MEASURE`. Algorithmic mandates (QAOA, VQE) require parameterized gates ($R_X(\theta), R_Y(\theta), R_Z(\theta)$) and Grover requires multi-controlled gates (`CCX` / Toffoli).
- **AST Loop Ban**: `apps/api/app/services/quantum/parser.py` unconditionally bans `ast.For` and `ast.While`. Students cannot write loop-based Grover iterations or variational optimizers without triggering security exceptions.
- **Empty Module 2 (Algorithms)**: In `apps/web/lib/curriculum/units-8-to-10.ts`, Module 2 (Algorithms: Deutsch-Jozsa, Grover, Shor) is merely listed as an unimplemented preview.
- **Multi-SDK UI Gap**: While PennyLane exists in backend conformance tests, `apps/web/features/circuit/interactive-circuit-workspace.tsx` hardcodes execution target display to `Qiskit Aer (1024 shots)` with no UI backend switcher. Google Cirq and qBraid are missing.

---

## 2. Competitive Landscape & Consensus Ban List

### 2.1 Benchmark Against State-of-the-Art Tools

| System | Strengths | Fatal Flaws for Hackathon & Classroom |
|---|---|---|
| **IBM Quantum Composer** | Industry standard, Qiskit integration, real QPU access. | Built for researchers; **zero diagnostic feedback** when circuits fail; no step-by-step hypothesis verification; no pedagogical guidance. |
| **Quirk (Craig Gidney)** | Instantaneous statevector calculation, rich visual displays. | Complete sandbox; **zero structured curriculum, zero AI assistance, zero automated grading**, no university cohort analytics. |
| **Brilliant.org** | High polish, intuitive puzzle gamification. | **Toy simulations only**; completely disconnected from real quantum SDKs (Qiskit, Cirq, PennyLane); closed commercial paywall. |
| **Typical Hackathon Entry** | Basic web app with a floating chatbot. | **Hallucinating ChatGPT wrapper** that invents quantum mechanics; static YouTube embeds; crashes on Python syntax; fake simulator spinners. |

### 2.2 The 14 Consensus Banned Ideas (What the Field Will Build)
To win top honors, we ban the generic solutions that 90% of competing teams will present:
1. ❌ *Floating Generic Chatbot*: Bottom-right chatbot answering general questions with ungrounded LLMs.
2. ❌ *Static Markdown / Video Portal*: Textbook articles embedding YouTube playlists with a "Mark Complete" button.
3. ❌ *Histogram-Only Output Canvas*: A simulator displaying only the final measurement bar chart.
4. ❌ *Single-Qubit-Only Bloch Spheres*: 3D spheres that fail to visually represent multi-qubit entanglement.
5. ❌ *Unsafe `eval()` / `exec()` Code Runner*: Raw Python execution exposing backend containers to RCE.
6. ❌ *Multiple-Choice-Only Quizzes*: Rote recall questions testing memorization rather than synthesis.
7. ❌ *Static Circuit Dropdown Library*: Pre-baked circuits without interactive guided exploration.
8. ❌ *Text-to-Circuit Generator*: Prompt box asking LLMs to generate Qiskit code that frequently fails syntax checks.
9. ❌ *Fake Hardware Queue*: Artificial timer animations claiming to submit circuits to IBM Brisbane or Heron.
10. ❌ *Vanity Instructor Metrics*: Dashboards displaying only login counts or click totals.
11. ❌ *Mock Multi-SDK Dropdown*: UI selector returning hardcoded JSON responses.
12. ❌ *Manual PDF Certificate*: Auto-generating a diploma image upon clicking through lessons.
13. ❌ *Isolated Drag-and-Drop*: Visual canvas with zero bidirectional code synchronization.
14. ❌ *Unbounded Free-Text AI Grading*: LLM grading open code without mathematical verification.

---

## 3. Mandatory Deliverables Mapping & Differentiating Feature Suite

Below is the direct mapping of our 6 high-impact differentiating features to the 6 deliverables specified in the hackathon problem statement document (`SIH26140.pdf`, Page 2):

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                SIH26140 DELIVERABLE MAPPING & DIFFERENTIATING FEATURE SUITE                     │
├────────────────────────────────┬────────────────────────────────────────────────────────────────┤
│ SIH26140 Deliverable           │ Differentiating Feature Solution                               │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Deliverable 1: Learning        │ FEATURE 1: Quantum Algorithm Phase Interference Scrubber       │
│ Content & Curriculum Module    │ (Interactive Grover Amplitude & Deutsch-Jozsa Kickback Engine) │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Deliverable 2: Quantum         │ FEATURE 2: AST Bidirectional Studio with Live Quantum          │
│ Circuit Designer               │ Invariant & Post-Measurement Linting                           │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Deliverable 3: Multi-Framework │ FEATURE 3: Tri-Engine Conformance Arena & Endianness Rosetta   │
│ Simulation Engine              │ Stone (Unified Qiskit Aer, Google Cirq, PennyLane Bridge)      │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Deliverable 4: Quantum State   │ FEATURE 4: Multi-Qubit Q-Sphere Phase Vector & NISQ Hardware   │
│ & Result Visualization         │ Noise Emulation Mode (T1/T2 Relaxation & Contraction)          │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Deliverable 5: Assessment &    │ FEATURE 5: Socratic Counterexample Engine & Automated Quantum  │
│ Progress Tracking              │ Circuit Mutation Challenges                                    │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ Deliverable 6: Complete        │ FEATURE 6: Instructor "Failure Topology" Matrix & 1-Click      │
│ Platform (Web Application)     │ Automated Remedial Lab Dispatcher                              │
└────────────────────────────────┴────────────────────────────────────────────────────────────────┘
```

---

### FEATURE 1: Quantum Algorithm Phase Interference Scrubber (Grover & Deutsch-Jozsa)
- **SIH Deliverable**: **Deliverable 1 (Learning Content & Curriculum Module)** & **Deliverable 4 (Visualization)**.
- **The Problem It Solves**: The PDF mandates: *"Modules on qubits, gates, entanglement, algorithms (Deutsch-Jozsa, Grover, QAOA, VQE, etc.)"*. Existing platforms treat algorithms as black boxes where students see inputs and final measurement histograms, missing the critical phase cancellation dynamics that explain *why* quantum speedup occurs.
- **The Implementation**:
  - Implement **Module 2: Quantum Algorithms** in `apps/web/lib/curriculum/`, activating the roadmap promised in `units-8-to-10.ts`.
  - **Grover Amplitude Amplification Scrubber**: As the user drags the Flight Recorder scrubber across Oracle and Diffusion operators, intermediate amplitudes animate live:
    1. Oracle step flips the phase of target $|\omega\rangle$ from $+1/\sqrt{N}$ to $-1/\sqrt{N}$ ($e^{i\pi}$).
    2. Diffusion operator reflects all states about the mean amplitude $\mu$, driving non-marked states downward while boosting target state probability toward $\approx 1.0$.
  - **Deutsch-Jozsa Kickback Inspector**: Displays step-by-step statevector evolution demonstrating how an auxiliary qubit in $|-\rangle$ transfers evaluation $(-1)^{f(x)}$ into the query register without collapsing the query state.
- **Why the Field Won't Have It**: Competitors lack intermediate statevector capture. Q-Trace's existing `stateTrace` engine (`adapter.py:L115-123`) already logs pre-measurement mathematical statevectors at every execution step.
- **Demo Wow-Moment**: The presenter scrubs across a 3-qubit Grover search circuit: judges watch live as the 7 incorrect states cancel out via destructive interference while marked state $|101\rangle$ shoots up to 94.5% probability.

---

### FEATURE 2: AST Bidirectional Studio with Live Quantum Invariant Linting
- **SIH Deliverable**: **Deliverable 2 (Quantum Circuit Designer)**.
- **The Problem It Solves**: Visual drag-and-drop builders are dismissed as toys, while text code editors offer zero immediate physics feedback. Beginners constantly construct physically invalid circuits (e.g. attempting to operate on qubits post-measurement or violating unitarity).
- **The Implementation**:
  - Upgrade `apps/api/app/services/quantum/parser.py` and `apps/web/features/circuit/circuit-parser.ts` with **Real-Time Quantum Invariant Linting**:
    - **Post-Collapse Gate Warning**: Flags unitary gates placed on a wire after a `MEASURE` operation: *"Qubit collapsed into classical bit c[0]; subsequent unitary operations are physically invalid."*
    - **No-Cloning Violation Warning**: Identifies attempts to duplicate states without entanglement.
    - **Controlled Gate Wire Collision Guard**: Prevents control and target overlaps in real time.
- **Why the Field Won't Have It**: Other teams use standard textareas or Monaco instances with generic Python linters that have zero understanding of quantum mechanics.
- **Demo Wow-Moment**: The presenter types `qc.measure(0, 0)` followed by `qc.h(0)` in the Python code editor. An immediate amber warning pill illuminates on the synchronized visual canvas: *"Post-collapse unitary detected: Hadamard applied to collapsed state."*

---

### FEATURE 3: Tri-Engine Conformance Arena & Endianness Rosetta Stone
- **SIH Deliverable**: **Deliverable 3 (Multi-Framework Simulation Engine)**.
- **The Problem It Solves**: The PDF mandates: *"Integration with Qiskit Aer, PennyLane, Cirq, qBraid, Real-time simulation and result retrieval."* Most teams show a fake dropdown or single framework. Furthermore, basis endianness differences cause massive confusion for students switching between frameworks.
- **The Implementation**:
  - Unify execution across **Qiskit Aer**, **PennyLane**, and **Google Cirq** using Q-Trace's existing basis normalizer (`apps/api/app/services/quantum/normalizer.py`).
  - Build a lightweight `cirq_adapter.py` that maps `CircuitModel` to `cirq.Circuit` and executes via `cirq.Simulator`. Because Cirq uses big-endian indexing ($q_0$ MSB) identical to PennyLane, Q-Trace's existing `_pennylane_index_to_contract_label` mapping works directly for Cirq.
  - **The Endianness Rosetta Stone**: An interactive visual toggle in the Lab that displays statevectors simultaneously in both Qiskit (Little-Endian: $|q_1 q_0\rangle$) and Cirq/PennyLane (Big-Endian: $|q_0 q_1\rangle$) notations, teaching students why different SDKs order bits differently.
- **Why the Field Won't Have It**: Competitors will show mock UI buttons. Q-Trace has an established, verified normalizer with sub-microsecond delta comparison ($\epsilon = 10^{-6}$).
- **Demo Wow-Moment**: Switching the execution target from Qiskit Aer to Google Cirq, the application executes both simulators simultaneously and displays a green badge: *"Multi-Engine Conformance Verified: $\Delta = 0.000000$ across Qiskit Aer, PennyLane, and Google Cirq."*

---

### FEATURE 4: Multi-Qubit Q-Sphere Phase Vector & NISQ Hardware Noise Emulation
- **SIH Deliverable**: **Deliverable 4 (Visualization)** & **Deliverable 3 (Simulation Engine)**.
- **The Problem It Solves**: The PDF notes: *"Limited access to real quantum hardware further restricts practical learning."* Pure mathematical simulators give students a distorted view of quantum computing; they never learn why real QPUs require quantum error correction, or why phase angles determine algorithm correctness.
- **The Implementation**:
  - Connect the existing `apps/web/features/evidence/two-qubit-qsphere.tsx` component into the main Lab workflow. The Q-Sphere visualizes multi-qubit superposition states as points on a sphere where point size indicates probability and color represents phase angle $\theta$.
  - **NISQ Noise Emulation Toggle**: Add an optional noise model via `qiskit_aer.noise`:
    - **Thermal Relaxation ($T_1$)**: Models decay from $|1\rangle$ to $|0\rangle$.
    - **Dephasing ($T_2$)**: Simulates loss of phase coherence.
    - **Readout Error**: Injects realistic measurement misclassification.
  - **Bloch Vector Purity Contraction**: In `apps/web/features/evidence/bloch-3d-sphere.tsx`, as noise increases, the Bloch vector visibly contracts *inside* the sphere ($|\vec{r}| < 1$), visually rendering decoherence and purity degradation ($\text{Tr}(\rho^2) < 1$).
- **Why the Field Won't Have It**: Competitors only render pure-state surface vectors ($|\vec{r}| = 1$). Q-Trace already possesses the exact mathematical infrastructure for mixed-state density matrices in `adapter.py:L146-193`.
- **Demo Wow-Moment**: The presenter runs a circuit in "Ideal Simulator" mode (sharp 100% peak on $|11\rangle$), then activates "Superconducting Noise Model". The Bloch sphere vector shrinks inward, and the histogram develops noise artifacts, demonstrating the necessity of error mitigation.

---

### FEATURE 5: Socratic Counterexample Engine & Automated Quantum Mutation Challenges
- **SIH Deliverable**: **Deliverable 5 (Assessment & Progress Tracking Module)**.
- **The Problem It Solves**: The PDF mandates: *"Quizzes, coding challenges, automated grading, learner progress dashboard."* Standard hackathon entries rely on multiple-choice trivia or brittle string matching (`code.includes("qc.h(0)")`). When a student makes an error, standard tools output unhelpful compiler tracebacks.
- **The Implementation**:
  - When a student circuit fails a lab challenge, the **Socratic Counterexample Engine**:
    1. Generates the smallest executable input state $|\psi_{in}\rangle$ where the student circuit diverges from the target unitary $U_{\text{target}}$.
    2. Loads both circuits into the Flight Recorder side-by-side to highlight the precise diverged gate.
  - **Automated Mutation Grading**: Rather than checking syntax strings, student circuits are tested against quantum mechanical invariants:
    - *Entanglement Entropy*: Asserts that output states are non-separable.
    - *Phase Observability*: Verifies that relative phase shifts produce expected interference patterns upon measurement.
    - *Unitary Reversibility*: Verifies that appending $U^\dagger$ returns the register to $|0\dots0\rangle$.
- **Why the Field Won't Have It**: Competitors rely on regex string matching or hallucinating LLMs. Q-Trace's grading is 100% deterministic and grounded in linear algebra invariants.
- **Demo Wow-Moment**: A student submits a circuit using $X \to CNOT$ instead of $H \to CNOT$. The Socratic engine highlights: *"Your circuit produces deterministic bit correlation |11⟩, not quantum superposition. Measuring in the Hadamard basis yields random noise instead of definitive alignment."*

---

### FEATURE 6: Instructor "Failure Topology" Matrix & 1-Click Remedial Dispatch
- **SIH Deliverable**: **Deliverable 5 (Performance Analytics)** & **Deliverable 6 (Software Platform)**.
- **The Problem It Solves**: The PDF mandates: *"Instructor dashboards, performance analytics, user authentication."* Most dashboards present vanity metrics (logins, streaks, time spent). Professors have zero visibility into which concepts their students are struggling with.
- **The Implementation**:
  - Upgrade `apps/web/features/instructor/cohort-analytics-chart.tsx` and `apps/api/app/routers/instructor.py` into a **Conceptual Failure Topology**:
    - Surfaces cohort-wide misconception telemetry across all curriculum stages:
      * 44% confused Superposition vs. Entanglement at Bell Synthesis
      * 31% suffered Gate Order Inversion
      * 18% confused Measurement Collapse with Deterministic Logic
    - **1-Click Remedial Dispatch**: The instructor clicks "Dispatch Remedial Lab" on the top misconception. The system automatically pushes a targeted counterfactual repair stage directly to all affected students' `/learn` feeds.
- **Why the Field Won't Have It**: Other teams lack structured misconception taxonomies. Q-Trace already persists `MisconceptionSignal` events with full referential integrity.
- **Demo Wow-Moment**: Switching to the Dr. Rao instructor role, Dr. Rao observes that 14 students failed the Bell challenge due to `SUPERPOSITION_VS_ENTANGLEMENT`. Dr. Rao clicks "Dispatch Remedial Lab" — instantly pushing a targeted counterfactual repair challenge to the affected student accounts.

---

## 4. Phased Implementation Roadmap

| Priority | Deliverable & Feature | Key Files Touched | Engineering Deliverable | Timebox |
|---|---|---|---|---|
| **P0 (Critical)** | **Grover & Deutsch-Jozsa Curriculum (Deliv 1)** | `apps/web/lib/curriculum/`, `apps/api/app/models/circuit.py` | Add Module 2 stage definitions, expand `GateName` to support CCX / Toffoli, hook into Flight Recorder view. | 3.5h |
| **P0 (Critical)** | **Tri-Engine Simulation Arena (Deliv 3)** | `apps/api/app/services/quantum/`, `apps/web/app/(app)/lab/page.tsx` | Create `cirq_adapter.py` reusing `normalizer.py`; add backend selector dropdown in Lab workspace. | 2.5h |
| **P1 (High)** | **Quantum Invariant Linter (Deliv 2)** | `circuit-parser.ts`, `apps/api/app/services/quantum/parser.py` | Detect post-measurement unitary operations and wire collisions with live amber alert badges. | 2.0h |
| **P1 (High)** | **Q-Sphere & NISQ Noise Mode (Deliv 4)** | `two-qubit-qsphere.tsx`, `apps/api/app/services/quantum/adapter.py` | Mount Q-Sphere component in Lab; add thermal relaxation $T_1/T_2$ noise model toggle. | 2.5h |
| **P2 (Polish)** | **Instructor Remedial Dispatch (Deliv 5 & 6)** | `apps/api/app/routers/instructor.py`, `cohort-analytics-chart.tsx` | FastAPI remedial dispatch endpoint + 1-click button pushing repair missions to student accounts. | 1.5h |

---

## 5. Strategic Tradeoffs & Organizer Defenses

1. **qBraid Cloud vs. OpenQASM Interoperability**:
   - `SIH26140.pdf` mentions qBraid. Live qBraid API requires commercial credentials and live internet connectivity.
   - *Defense*: We use **OpenQASM 3.0** (already implemented via `apps/api/app/services/quantum/openqasm_exporter.py`) as the universal intermediate representation. Circuits created in Q-Trace export to standard OpenQASM 3.0, making them natively executable on qBraid, AWS Braket, and IBM Quantum.
2. **QAOA / VQE vs. AST Security Rules**:
   - Variational algorithms require loop optimizations and parameterized rotation angles ($R_Y, R_Z$), which are restricted by `parser.py`.
   - *Defense*: We present complete, interactive gate-by-gate visual execution for **Deutsch-Jozsa** and **Grover** (discrete gates $H, X, Z, CNOT, CCX$), while presenting QAOA/VQE as pre-parameterized algorithmic templates with step-by-step angle optimization sliders.
