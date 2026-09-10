# ⚛️ Q-Trace — Complete Team Explainer

> **Who this is for:** Any teammate (or new joiner) who wants a single document to understand
> what we're building, why, how the whole system fits together, and where we are right now.
> Read this before anything else.

---

## 1. The One-Line Pitch

> **"Build it, see it, repair it."**
> Q-Trace is an AI-assisted quantum computing learning platform with a **Quantum Flight Recorder**
> that finds the exact gate where a learner's understanding broke — and explains it using
> real simulator evidence.

---

## 2. The Problem We're Solving

Quantum computing is hard to learn because:

- Theory (superposition, entanglement, measurement) is deeply counterintuitive.
- Most learning tools split the journey: theory in one place, circuit building in another,
  simulations in a third, and AI help from a chatbot that has no idea what you just ran.
- Instructors get no actionable signal — they can't see **where** students are getting stuck
  conceptually, only that their grade is low.

**Research evidence:** After traditional instruction, only ~50% of learners correctly reason
about basic qubit state counts. After a *prediction-driven interactive tutorial*, that jumps to
~80%. Our platform is built on that insight — make learners *predict* before they run, then show
them exactly where their model diverged.

---

## 3. Who Uses It (The Three Demo Users)

| User | Who they are | What they need |
|---|---|---|
| **Aarav** | 2nd-year B.Tech CSE student, knows Python, never studied quantum | Visual scaffolding, plain-language explanations, immediate feedback |
| **Meera** | 3rd-year Physics student, knows the math, new to quantum code | Shorter conceptual path, code-first view, framework comparisons |
| **Dr. Rao** | Engineering faculty running a quantum lab | Aggregate misconception signals for his cohort — not individual surveillance |

---

## 4. The Full Learning Loop (How It Works End-to-End)

This is the journey every user takes. Memorize this — it is the core product.

```
Dr. Rao assigns a Module
        ↓
Aarav / Meera enters via an adaptive Learning Path
(different entry steps based on prior knowledge)
        ↓
Prediction Checkpoint
(What do you think will happen? Record it BEFORE running.)
        ↓
Circuit Workspace
(Drag-and-drop gates OR edit generated Qiskit code)
        ↓
Simulation Run
(Circuit Model → Qiskit Aer + PennyLane, results verified within tolerance)
        ↓
Visual Evidence
(State probabilities, amplitudes, measurement histogram, Bloch sphere view)
        ↓
⭐ Quantum Flight Recorder ⭐
(Gate-by-gate replay → finds the FIRST divergence from the prediction
 → emits a Misconception Signal e.g. SUPERPOSITION_VS_ENTANGLEMENT)
        ↓
Tutor
(Explains the divergence using ONLY the State Trace — never invents quantum results)
Issues one Repair Challenge
        ↓
Aarav repairs and passes → Progress Record updates
        ↓
Dr. Rao's Instructor Insight reflects the difficulty across the whole cohort
```

---

## 5. The 90-Second Demo (What the Judges See)

| Beat | What judges see | Key tech |
|---:|---|---|
| 0 | One-line problem framing: "Build it, see it, repair it." | — |
| 1 | Local-demo indicator (works offline). Aarav and Meera get the same Bell Module via different Learning Paths. | Seeded roles, 3-module catalogue |
| 2 | Aarav answers a Prediction Checkpoint — **incorrectly** expects two independent random outputs. | Prediction Checkpoint |
| 3 | Aarav builds H + CNOT in the visual Circuit Workspace. Synchronized Qiskit code appears. | Circuit Workspace, Circuit Model, code gen |
| 4 | Same Circuit Model runs on Qiskit Aer AND PennyLane. Results agree within tolerance. | Dual adapters, conformance check |
| 5 | Visual Evidence shows probabilities and measurement correlation. | Plotly, custom SVG |
| **6 ⭐** | **Flight Recorder replays H then CNOT, identifies the divergence, emits SUPERPOSITION_VS_ENTANGLEMENT.** | Flight Recorder, Misconception Engine |
| 7 | Tutor explains using the State Trace. Issues one Repair Challenge. | Evidence-bound Tutor, curated fallback |
| 8 | Aarav passes. Progress Record updates. Dr. Rao's Instructor Insight chart updates. | Progress Record, Instructor Insight |

**The three judge-retellable phrases:**
1. *"Build it, see it, repair it."*
2. *"The Flight Recorder finds where understanding broke."*
3. *"AI explains simulator evidence; it never invents quantum results."*

---

## 6. The Tech Stack

### Frontend — apps/web

| What | Technology |
|---|---|
| Framework | **Next.js 15** App Router, React 19, TypeScript (strict) |
| Styling | **Tailwind v4** + **shadcn/ui** components |
| Circuit Workspace | Custom qubit-wire grid + **@dnd-kit/core** for drag-and-drop |
| Code editor | **CodeMirror 6** (safe Qiskit subset only) |
| Data fetching | **TanStack Query** (server data) + **Zustand** (unsaved circuit state only) |
| Visualization | **Plotly.js** (Bloch sphere, histogram) + custom SVG (amplitude views, State Trace) |

### Backend — apps/api

| What | Technology |
|---|---|
| Framework | **Python 3.12 + FastAPI** (modular monolith) |
| Validation | **Pydantic v2** |
| Quantum execution | **Qiskit SDK 2.3 + Qiskit Aer 0.17** (primary), **PennyLane 0.45** (conformance) |
| Circuit code safety | Python ast parser — allowlisted grammar only, **never executes submitted code** |
| Database | **MongoDB Atlas M0** via async PyMongo + deterministic in-memory fallback |
| AI Tutor | Provider-adapter interface (cloud key when available); **DEMO_FALLBACK** curated responses always present |

### Infrastructure

| What | Where |
|---|---|
| Frontend | **Vercel** |
| Backend | **Railway** |
| Database | **MongoDB Atlas M0** |
| Local/offline | DEMO_LOCAL=1 — runs everything on one laptop, no internet needed |

---

## 7. System Architecture (How the Pieces Connect)

```
┌────────────────────────── Next.js Web ───────────────────────────────────┐
│  Role Switch → Learning Path → Prediction Checkpoint → Circuit Workspace  │
│  Visual Evidence ← Flight Recorder UI ← Tutor UI ← Progress ← Insight   │
└───────────────────────┬──────────────────────────────────────────────────┘
                        │ HTTP (JSON contracts)
┌───────────────────────▼───────────── FastAPI ────────────────────────────┐
│  Learning Router | Circuit Parser/Export | Simulation Router              │
│  Misconception Engine | Tutor Service | Progress Router | Instructor API  │
└──────────────────┬───────────────┬───────────────────────────────────────┘
                   │               │
       ┌───────────▼───┐   ┌───────▼───────────────────────────────────────┐
       │ Quantum Runtime│   │ Data Layer (Repository Interface)              │
       │ Circuit Model  │   │ MongoDB Atlas M0 (prod) / In-Memory (DEMO_LOCAL)│
       │ Qiskit Aer     │   └───────────────────────────────────────────────┘
       │ PennyLane      │
       │ State Trace    │
       └───────────────┘
```

**Key design principle:** The **Circuit Model** is the single canonical JSON representation.
The visual builder, code generator, Qiskit Aer, and PennyLane all speak Circuit Model.
Nothing is ever lost in translation.

---

## 8. The Core Data Model (What We Store)

| Entity | Collection | What it represents |
|---|---|---|
| **Learner Profile** | learner_profiles | Who the learner is: role, prior knowledge, skills completed |
| **Learning Path** | learning_paths | The ordered list of Modules for this learner, with entry band |
| **Module** | modules | One guided lesson (e.g., "Bell State") with content blocks and checkpoint |
| **Prediction Checkpoint** | prediction_checkpoints | The structured question asked BEFORE simulation |
| **Circuit Model** | circuit_models | The canonical JSON circuit (gates, qubits, columns) — framework-neutral |
| **Simulation Run** | simulation_runs | The result: probabilities, counts, State Trace, conformance check |
| **Misconception Signal** | misconception_signals | The diagnosed misconception + evidence + first divergence step |
| **Challenge** | challenges | A quiz or circuit repair task with deterministic acceptance rules |
| **Challenge Attempt** | challenge_attempts | One learner's attempt: passed/failed, score |
| **Progress Record** | progress_records | Running record: completed modules, skill states, misconception history |
| **Instructor Insight** | (computed on-the-fly) | Aggregate cohort stats — computed from above, not a stored truth |

### The Misconception Taxonomy (Closed List — 4 codes only)

| Code | What it means |
|---|---|
| SUPERPOSITION_VS_ENTANGLEMENT | Learner expected independent random outputs, got correlated ones |
| MEASUREMENT_DETERMINISM | Learner expected deterministic outcomes from a superposition state |
| GATE_ORDER | Learner's mental model of gate sequence was wrong |
| NO_SIGNAL | Prediction matched — no misconception detected |

---

## 9. Key Safety and Trust Rules (Non-Negotiable)

1. **The Tutor never invents quantum results.** The Tutor receives immutable evidence fields
   (probabilities, State Trace, Prediction Checkpoint). It explains — it never modifies.

2. **Submitted code is never executed.** Learner-typed Qiskit code is parsed with Python ast
   through an allowlist. Only the safe subset (H, X, Y, Z, CNOT, Measure, 2–5 qubits, ≤20 ops)
   is translated to a Circuit Model. exec and eval are blocked.

3. **Numerical truth comes from the simulator.** Qiskit Aer owns the numbers.

4. **Free-form Tutor text is never persisted.** We store only structured outcome metadata
   (misconception code, challenge result). No chat surveillance.

5. **The demo must work offline.** DEMO_LOCAL=1 + DEMO_FALLBACK=1 must cover the full scripted
   journey. Venue internet is never assumed.

---

## 10. Feature Flags

| Flag | What it controls |
|---|---|
| DEMO_LOCAL=1 | Use in-memory seed data instead of MongoDB Atlas |
| DEMO_FALLBACK=1 | Use curated Tutor responses instead of cloud LLM |
| ENABLE_PENNYLANE=0 | Disable PennyLane conformance (graceful skip) |
| ENABLE_CODE_PARSE=0 | Show generated read-only code instead of editable code |
| ENABLE_TUTOR_CLOUD=0 | Force Tutor to fallback mode |
| ENABLE_NOISE_LAB=0 | Disable noise comparison lab |

---

## 11. The Team — Who Owns What

| Member | Track | What they build |
|---|---|---|
| **Vinod Krishna** | story-ship (Lead) | Monorepo scaffold, CI, deployment configs, demo script, PPT, smoke tests |
| **Venu Gopal** | learning-ux | All Next.js UI: Learning Path, Circuit Workspace, Flight Recorder UI, Progress, Accessibility |
| **Uday Rohit** | simulation-api | FastAPI: Circuit Model validator, Qiskit Aer adapter, PennyLane adapter, Simulation Run API |
| **Rani** | data-analytics | MongoDB repositories, seed script, Progress API, Instructor Insight API |
| **Rajeswari** | ai-pedagogy | Flight Recorder logic, Misconception Engine, Tutor service, evidence prompts |
| **Akshaya / Sohail** | fixtures-qa | Golden fixtures, contract tests, Playwright E2E, release gate |

### Pitch Speaking Plan
- **Vinod** — Opening problem, one-line pitch, architecture, technical Q&A
- **Venu** — Operates the live demo, narrates Aarav/Meera learner flow
- **Uday** — Qiskit/PennyLane execution and State Trace correctness
- **Rani** — Progress Record, Instructor Insight, data/privacy design
- **Rajeswari** — Flight Recorder misconception logic, evidence-bound Tutor
- **Akshaya** — Verification, offline fallback, contract tests, release confidence

---

## 12. Track Boundaries (Who Can Touch What)

**Golden rule: never silently edit another track's files.**

| Track | Owns | Must not touch |
|---|---|---|
| learning-ux | apps/web/app, components, features/*, frontend tests | Python services, DB repos, QA fixtures |
| simulation-api | Simulation routers, quantum services, Pydantic models | Web UI, Tutor prompts, progress repos |
| ai-pedagogy | Flight recorder/tutor routers, diagnosis/tutor services, prompts | Quantum numeric kernels, web components, DB |
| data-analytics | Repositories, learning/progress/instructor routers, seed | Quantum adapters, Tutor prompts, web UI |
| fixtures-qa | Golden fixtures, contract tests, acceptance tests, E2E, release scripts | All production implementation code |
| story-ship | docs/, scripts/, deployment configs, demo assets | Product implementation code |

---

## 13. The Three Modules (What Learners Study)

| Module | What it teaches |
|---|---|
| Qubits and Superposition | What a qubit is, the H gate, single-qubit superposition |
| Measurement | What happens when you measure, why outcomes are probabilistic |
| **Bell State** (core demo) | H + CNOT → entanglement → why 00/11 always correlate |

The full end-to-end loop only needs to work for the Bell State module at demo time.

---

## 14. The Quantum Flight Recorder — The "Wow" Feature

**How it works step by step:**
1. Learner submits a **Prediction Checkpoint** before running (e.g., "I expect independent random outputs").
2. **Simulation Run** returns a **State Trace** — simulator state after each gate (H, then CNOT).
3. **Misconception Engine** compares prediction vs State Trace step by step using deterministic rules.
4. Finds the **first gate** where the mental model diverged from reality.
5. Emits a **Misconception Signal**: code, first divergence step index, verified evidence.
6. **Flight Recorder UI** replays the circuit beat by beat, highlights the divergence.
7. **Tutor** explains in plain language — using only simulator numbers, never inventing them.

**Why judges care:** Most AI tutors give generic answers. Q-Trace says:
*"After the CNOT gate at step 1, the state became (|00⟩ + |11⟩)/√2 — a maximally entangled Bell
state. Your prediction expected independent random outputs, but entanglement means the qubits can
only be measured in the same basis state. This is the exact moment your model diverged."*

---

## 15. Current Build Status (10 Sep 2026)

| Track | Status |
|---|---|
| learning-ux | ✅ Complete (UX-1 through UX-9 merged) |
| simulation-api | ✅ Complete (SIM-1 through SIM-9 merged) |
| ai-pedagogy | ✅ Complete (AI-1 through AI-8 merged) |
| data-analytics | 🔄 DATA-8 in Warden review |
| fixtures-qa | ✅ Complete (QA-1 through QA-8 merged, release cert passed) |
| story-ship | 🔄 SHIP-5 (PPT) merged; SHIP-8 pending |

**Test suite health:**
- API unit tests: 465/465 green
- Web tests: 136/136 green
- E2E Playwright (Bell B1–B8): 1/1 green
- Smoke (local): scripts/smoke.sh exits 0 (6/6 endpoints)
- Smoke (live): scripts/smoke-live.sh 5/5 checks green
- Release gate: scripts/release-gate.sh passes local-offline mode

---

## 16. The Freeze Calendar

| Gate | Deadline |
|---|---|
| Walking skeleton | 25 Aug 2026, 09:00 IST ✅ Done |
| Risky-feature freeze | 27 Aug 2026, 18:00 IST |
| Feature + video script freeze | 28 Aug 2026, 09:00 IST |
| Merge / deploy / PPT ready | 28 Aug 2026, 18:00 IST |
| Presentation | 29 Aug 2026, time TBD |

---

## 17. Git and Contribution Rules

- **Branch naming:** feat/<track>/<card-id>-<short-description>
  - Example: feat/learning-ux/ux-5-circuit-workspace
- **Commits:** Conventional Commits — feat(scope): ..., fix(scope): ...
- **One card per branch.** Run the card's exact TEST command before marking done.
- **Every PR requires a Warden review** in a fresh session before merge.
- **Contracts** in board/contracts/ change only via: version bump → DECISIONS entry → consumer ping → then code.
- **Blocked over 20 minutes?** Post to STATUS.md + ping + switch tasks. No silent hero-debugging.

---

## 18. The Cut List (If Time Runs Out)

Execute top-down — do not freelance cuts:

1. Remove ideal-versus-noisy comparison → saves ~4h
2. Replace editable code with generated read-only code → saves ~6h
3. Restrict PennyLane to Bell circuit only → saves ~4h
4. Replace adaptive module recommendation with deterministic rules table → saves ~3h
5. Reduce Instructor Insight to 3 cards + 1 chart → saves ~4h
6. Reduce to 2 modules (Superposition + Bell only) → saves ~5h
7. Use curated fallback for all Tutor states → removes AI provider risk

---

## 19. What We Are NOT Building

- Real quantum hardware (QPU) execution
- Arbitrary Python execution by learners
- Full Cirq/qBraid adapters (roadmap only)
- Real-time multi-user collaboration
- Production authentication, billing, or proctoring
- LLM-generated quantum results or grading
- Claims of measured learning efficacy
- Large-circuit or research-scale simulation

---

## 20. Quick Reference — Key Commands

```powershell
# Install and start frontend (http://localhost:3000)
pnpm install
pnpm dev:web

# Install and start backend (http://localhost:8000)
python -m venv .venv
.venv\Scripts\activate
pip install -e "./apps/api[quantum,dev]"
uvicorn apps.api.app.main:app --reload --port 8000

# Run the full local smoke test
bash scripts/smoke.sh

# Run the live deploy smoke test
bash scripts/smoke-live.sh

# Run the full release gate
bash scripts/release-gate.sh
```

---

## 21. Useful Files to Read Next

| File | What it contains |
|---|---|
| docs/PRD.md | Full product requirements, frozen vocabulary, MUST/SHOULD/CUT scope |
| docs/ARCHITECTURE.md | Every tech decision, system diagram, track ownership |
| docs/SCHEMA.md | Every MongoDB collection, field types, indexes, example documents |
| board/STATUS.md | Live project heartbeat — read at start of every session |
| board/DECISIONS.md | Architecture decision log |
| board/TEAM.md | Team roles, standup times, speaking plan |
| docs/DEMO-SCRIPT.md | The timed 90-second demo script with judge Q&A prep |
| missions/ | Individual mission briefs per team member |
| plans/ | Per-track phase plans with all task cards |

---

*Last updated: 10 Sep 2026 · Synthesized from PRD, ARCHITECTURE, SCHEMA, STATUS, and TEAM docs.*
