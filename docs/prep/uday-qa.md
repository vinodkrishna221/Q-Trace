# Judge Q&A Cheat-Sheet — Uday Rohit
### Backend & Quantum Simulation · Q-Trace Team Vanguard

---

## 1. What I Built (My Elevator Pitch)
I engineered the Python quantum execution core that compiles Circuit Models into real Qiskit Aer simulations and cross-checks them against PennyLane for strict mathematical conformance. My engine powers the State Trace that acts like a step-by-step debugger for quantum circuits, ensuring every probability, amplitude, and gate transition in Q-Trace is 100% verified and grounded in physical truth.

---

## 2. My Tech Stack & Code Footprint

### Technologies & Libraries
- **API Runtime:** [Python 3.12](file:///d:/Q-Trace/apps/api) with FastAPI (modular monolith architecture)
- **Validation & Serialization:** [Pydantic v2](file:///d:/Q-Trace/apps/api/app/models) for strict schema enforcement of Circuit Models, operations, and basis orderings
- **Primary Quantum Engine:** [Qiskit SDK 2.3 + Qiskit Aer 0.17](file:///d:/Q-Trace/apps/api/app/services/quantum) for statevector simulation with intermediate `save_statevector()` snapshots
- **Conformance Engine:** [PennyLane 0.45](file:///d:/Q-Trace/apps/api/app/services/quantum) (`default.qubit` backend) for cross-simulator mathematical verification within $10^{-6}$ epsilon
- **Parser & AST Security:** Python `ast` allowlist parser — extracts circuit semantics without executing untrusted code
- **Interoperability:** OpenQASM 3 exporter and round-trip parser for circuit interchange

### Where My Code Lives
- [`apps/api/app/models/circuit.py`](file:///d:/Q-Trace/apps/api/app/models/circuit.py): Canonical domain schemas for `CircuitModel`, `Operation`, `GateType`, and qubit register bounds
- [`apps/api/app/models/simulation.py`](file:///d:/Q-Trace/apps/api/app/models/simulation.py): Domain models for `SimulationRun`, `StateTraceStep`, and reduced density matrices
- [`apps/api/app/routers/circuits.py`](file:///d:/Q-Trace/apps/api/app/routers/circuits.py): Circuit validation, safe AST parsing, and OpenQASM export endpoints
- [`apps/api/app/routers/simulation_runs.py`](file:///d:/Q-Trace/apps/api/app/routers/simulation_runs.py): Synchronous simulation execution and State Trace retrieval endpoints
- [`apps/api/app/services/quantum/adapter.py`](file:///d:/Q-Trace/apps/api/app/services/quantum/adapter.py): Qiskit Aer statevector runner, intermediate state extraction, subsystem purity, and Bloch coordinates
- [`apps/api/app/services/quantum/pennylane_adapter.py`](file:///d:/Q-Trace/apps/api/app/services/quantum/pennylane_adapter.py): PennyLane compilation and cross-simulator probability conformance checks
- [`apps/api/app/services/quantum/parser.py`](file:///d:/Q-Trace/apps/api/app/services/quantum/parser.py): Safe Python AST traversal rejecting loops, imports, builtins, and system calls
- [`apps/api/app/services/quantum/openqasm_exporter.py`](file:///d:/Q-Trace/apps/api/app/services/quantum/openqasm_exporter.py): OpenQASM 3 exporter and format serializer
- [`apps/api/tests/unit/simulation/`](file:///d:/Q-Trace/apps/api/tests/unit/simulation): Unit tests for Qiskit traces, PennyLane conformance, AST security, and execution timeouts

---

## 3. Top 3–4 Likely Judge Questions & Spoken Answers

### Q1: "Why did you use simulator software instead of connecting to real IBM or Rigetti quantum computers in the cloud?"
> **Spoken Answer (17s):**
> *"Real quantum computers queue for hours, cost money per shot, and collapse when measured — they cannot reveal intermediate states. Qiskit Aer acts like a step-by-step code debugger, capturing exact statevectors after every single gate. That intermediate State Trace is what makes our Flight Recorder possible."*

### Q2: "What is PennyLane doing in your system if Qiskit Aer is already your main simulator?"
> **Spoken Answer (17s):**
> *"Think of it like double-entry bookkeeping. Qiskit Aer is our primary simulator, but we run the exact same circuit through PennyLane to verify the math independently. When both match within one part in a million, judges know the results are genuine quantum physics, not vendor quirks."*

### Q3: "If students can edit Qiskit code in the browser, how do you prevent them from running an infinite loop or hacking your server?"
> **Spoken Answer (17s):**
> *"We never execute raw user code with Python's exec or eval. Our backend acts like an airport X-ray scanner. We parse the code into an Abstract Syntax Tree using Python's AST library, allowlisting only basic quantum gates. Any loops, file calls, or imports are rejected before execution."*

### Q4: "What gates and circuit limits do you support, and how do you guarantee simulation won't freeze the server?"
> **Spoken Answer (17s):**
> *"We support H, X, Y, Z, CNOT, and Measure across up to 5 qubits and 20 operations — covering 100% of the AICTE syllabus. Every simulation executes inside an isolated worker with a hard 1.5-second timeout, completing standard Bell circuits in under 200 milliseconds."*

---

## 4. What NEVER to Say (Red Lines & Traps)

1. ❌ **TRAP:** *"We are connected to a live 127-qubit quantum processor over IBM Quantum Cloud."*
   - **Why it's fatal:** Judges with physics or cloud expertise will ask for your IBM job ID or API token, instantly disproving the claim.
   - ✅ **SAY INSTEAD:** *"We deliberately use local Qiskit Aer statevector simulation. It runs instantly on any laptop, provides intermediate pre-measurement states which real hardware destroys, and eliminates cloud queuing and venue internet dependency."*

2. ❌ **TRAP:** *"Our backend executes arbitrary Python quantum scripts sent by the user."*
   - **Why it's fatal:** Signals catastrophic remote code execution (RCE) and denial-of-service vulnerabilities.
   - ✅ **SAY INSTEAD:** *"We parse code structurally using Python AST allowlists; we never execute raw user code. We translate valid AST nodes into our canonical JSON Circuit Model."*

3. ❌ **TRAP:** *"PennyLane is a required cloud service that must respond for the demo to work."*
   - **Why it's fatal:** Makes the prototype look fragile and exposes it to network or setup failure.
   - ✅ **SAY INSTEAD:** *"PennyLane runs completely locally using `default.qubit` as an optional conformance adapter. If disabled or skipped, Qiskit Aer continues running seamlessly without interruption."*

---

## 5. Emergency Handoff Line
If a judge asks an out-of-scope question about AI pedagogical prompt design, student grading metrics, institutional pricing, or frontend UI layout:

> *"My domain is the Python quantum simulation engine, circuit validation, and numerical correctness. For how our pedagogical tutor, cohort database, or overarching business plan connects into this, let me hand over to our lead, Vinod."*
