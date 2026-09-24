# Judge Q&A Cheat-Sheet — Venu Gopal
### Frontend & Learner Experience · Q-Trace Team Vanguard

---

## 1. What I Built (My Elevator Pitch)
I built the interactive learner frontend for Q-Trace, turning abstract quantum theory into an intuitive visual workspace where students can predict, assemble circuits, and immediately see physical results. My interface connects the learner's hands directly to live quantum simulation and the Quantum Flight Recorder, making invisible quantum phenomena tangible and easy to explore.

---

## 2. My Tech Stack & Code Footprint

### Technologies & Libraries
- **Core Framework:** [Next.js 15](file:///d:/Q-Trace/apps/web) App Router with React 19 and strict TypeScript
- **Styling & Primitives:** Tailwind CSS v4 and [shadcn/ui](file:///d:/Q-Trace/apps/web/components/ui) accessible UI primitives
- **Circuit Workspace:** Custom ordered qubit-wire grid using `@dnd-kit/core` and `@dnd-kit/utilities` for rigid gate placement
- **Code Synchronization:** Native synchronized Qiskit code editor panel with real-time bidirectional updates
- **Client State Management:** [Zustand v5](file:///d:/Q-Trace/apps/web/lib/circuit-store.ts) for unsaved client-side circuit workspace, role switching, and prediction state
- **Visual Evidence Rendering:** Custom interactive HTML5 Canvas 3D Bloch sphere with orbit controls, plus responsive SVG probability histograms and two-qubit correlation bridges

### Where My Code Lives
- [`apps/web/app/`](file:///d:/Q-Trace/apps/web/app): Application routes (`/learn/bell-state`, `/lab`, `/progress`, `/instructor`) and layouts
- [`apps/web/components/`](file:///d:/Q-Trace/apps/web/components): Layout shells, navigation bars, and instant role switcher ([`role-switcher.tsx`](file:///d:/Q-Trace/apps/web/components/ui/role-switcher.tsx)) for Aarav, Meera, and Dr. Rao
- [`apps/web/features/circuit/`](file:///d:/Q-Trace/apps/web/features/circuit): Interactive Circuit Workspace ([`interactive-circuit-workspace.tsx`](file:///d:/Q-Trace/apps/web/features/circuit/interactive-circuit-workspace.tsx)), qubit wires ([`qubit-wire.tsx`](file:///d:/Q-Trace/apps/web/features/circuit/qubit-wire.tsx)), gate palette ([`gate-palette.tsx`](file:///d:/Q-Trace/apps/web/features/circuit/gate-palette.tsx)), and Qiskit code panel ([`qiskit-code-editor.tsx`](file:///d:/Q-Trace/apps/web/features/circuit/qiskit-code-editor.tsx))
- [`apps/web/features/learning/`](file:///d:/Q-Trace/apps/web/features/learning): Structured Prediction Checkpoint ([`prediction-checkpoint.tsx`](file:///d:/Q-Trace/apps/web/features/learning/prediction-checkpoint.tsx)) and concept blocks
- [`apps/web/features/evidence/`](file:///d:/Q-Trace/apps/web/features/evidence): Interactive 3D Bloch sphere ([`bloch-3d-sphere.tsx`](file:///d:/Q-Trace/apps/web/features/evidence/bloch-3d-sphere.tsx)), probability histogram ([`probability-histogram-view.tsx`](file:///d:/Q-Trace/apps/web/features/evidence/probability-histogram-view.tsx)), and correlation views
- [`apps/web/features/flight-recorder/`](file:///d:/Q-Trace/apps/web/features/flight-recorder): Flight Recorder gate replay and divergence indicator ([`flight-recorder-view.tsx`](file:///d:/Q-Trace/apps/web/features/flight-recorder/flight-recorder-view.tsx))
- [`apps/web/features/challenges/`](file:///d:/Q-Trace/apps/web/features/challenges): In-situ circuit repair workspace ([`in-situ-repair-workspace.tsx`](file:///d:/Q-Trace/apps/web/features/challenges/in-situ-repair-workspace.tsx)) and repair challenge cards
- [`apps/web/features/tutor/`](file:///d:/Q-Trace/apps/web/features/tutor): Evidence-bound Tutor feedback card ([`tutor-card.tsx`](file:///d:/Q-Trace/apps/web/features/tutor/tutor-card.tsx))
- [`apps/web/lib/`](file:///d:/Q-Trace/apps/web/lib): Zustand stores ([`circuit-store.ts`](file:///d:/Q-Trace/apps/web/lib/circuit-store.ts), [`role-store.ts`](file:///d:/Q-Trace/apps/web/lib/role-store.ts), [`prediction-store.ts`](file:///d:/Q-Trace/apps/web/lib/prediction-store.ts))
- [`apps/web/tests/`](file:///d:/Q-Trace/apps/web/tests): Unit tests, contract fixtures, and accessibility/projector test suites ([`accessibility-projector.test.tsx`](file:///d:/Q-Trace/apps/web/tests/acceptance/accessibility-projector.test.tsx))

---

## 3. Top 3–4 Likely Judge Questions & Spoken Answers

### Q1: "Why did you build a custom drag-and-drop circuit grid instead of using an off-the-shelf flowchart library like React Flow?"
> **Spoken Answer (16s):**
> *"Think of a quantum circuit like musical sheet music, not an arbitrary flowchart. Notes belong on specific staff lines in strict time order. A generic graph lets gates float anywhere, creating physically invalid circuits. Our custom grid with dnd-kit enforces strict qubit wires and time steps, guaranteeing every circuit is physically valid and keyboard navigable."*

### Q2: "How do you keep the visual circuit builder and the Python Qiskit code synchronized without lag or drift?"
> **Spoken Answer (17s):**
> *"We treat our JSON Circuit Model like a single master blueprint. The visual wire grid and the code panel are simply two synchronized windows looking at that exact same blueprint. Place a gate on wire zero, and the code updates instantly via our Zustand store. They can never contradict each other."*

### Q3: "Can your UI handle low-resolution classroom projectors or students who can only use a keyboard?"
> **Spoken Answer (16s):**
> *"Yes, we engineered for real Indian government college classrooms. The entire workspace has full keyboard accessibility — you can place gates and run a complete Bell circuit using only Tab, arrow keys, and Enter. And we hardened the interface for 1366-by-768 budget projectors with high-contrast text and color-blind-friendly badges."*

### Q4: "What happens on screen if the backend simulator is slow or the AI service goes down?"
> **Spoken Answer (17s):**
> *"Like an airplane dashboard with backup instruments, our UI never crashes or shows a blank white screen. If simulation takes more than 1.5 seconds, clear timeout indicators appear with a retry button. If cloud AI is unreachable, the interface displays our vetted local explanation instantly. The learner always stays in control."*

---

## 4. What NEVER to Say (Red Lines & Traps)

1. ❌ **TRAP:** *"Students can type any Python script they want in our editor and run it."*
   - **Why it's fatal:** Judges will raise massive alarms about server security, malicious loops, and remote code execution.
   - ✅ **SAY INSTEAD:** *"We support a safe, allowlisted subset of Qiskit essential for the undergraduate curriculum. Any unsupported code like loops, file access, or unknown packages is caught and rejected by our parser before execution."*

2. ❌ **TRAP:** *"Our 3D Bloch sphere shows the physical trajectory of the electron."*
   - **Why it's fatal:** Physics judges will immediately penalize you. Quantum states do not have classical trajectories, and entangled qubits cannot be represented as pure states on a single Bloch sphere.
   - ✅ **SAY INSTEAD:** *"The Bloch sphere is a mathematical representation of single-qubit state probabilities and subsystem purity. When qubits become entangled, our UI explicitly flags that the individual sphere enters a mixed state."*

3. ❌ **TRAP:** *"Our platform features real-time collaborative multi-user editing like Google Docs."*
   - **Why it's fatal:** Real-time multi-user synchronization is not implemented; claiming it invites judges to ask for a live demo you cannot give.
   - ✅ **SAY INSTEAD:** *"We focus on clean artifact sharing: students can export and share their circuits via standardized OpenQASM 3 or normalized JSON files to reproduce experiments on any machine."*

---

## 5. Emergency Handoff Line
If a judge asks an out-of-scope question about global cloud infrastructure, backend API scaling, institutional pricing, or broader team strategy:

> *"My focus is delivering a rock-solid, accessible learner experience on the frontend while driving our live demo. For how our cloud deployment, backend architecture, and institutional roadmap connect into this, let me hand over to our lead, Vinod."*
