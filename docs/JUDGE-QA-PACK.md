# Q-Trace — Judge Q&A Preparation Pack
### Team Vanguard · SIH 2025 · Problem Statement 26140

> This document has three parts:
> 1. **Likely judge questions** — with who answers and the exact answer
> 2. **Feature deep-dives** — detailed technical explanation of every feature, by who built it
> 3. **Quick-fire cheat sheet** — one-liners for common traps

---

## PART 1 — LIKELY JUDGE QUESTIONS & ANSWERS

*Each answer is ≤ 20 seconds when spoken. The "Who" column is the recommended speaker.*

---

### Q1: "How is this different from IBM Quantum Composer?"
**Who:** Vinod Krishna

> "IBM Quantum Composer helps you build and run circuits — that's it. We record your prediction before you run. We capture the simulator's intermediate State Trace gate by gate. We compare your prediction against that trace and name the exact gate where your understanding diverged. Then the AI explains that specific mismatch using real numbers — not a guess. No other tool connects prediction → execution → diagnosis → repair in one loop."

---

### Q2: "What is actually live vs. mocked or faked?"
**Who:** Vinod Krishna → Uday Rohith (adds one line)

> **Vinod:** "Qiskit Aer simulation is live — running on this laptop right now. The State Trace you see is computed in real time."
>
> **Uday:** "PennyLane conformance check is also live. The only pre-authored content is the Tutor fallback explanation — grounded in the simulator's real output, cached so we do not depend on venue internet."

---

### Q3: "Can the AI make up quantum results?"
**Who:** Rajeswari

> "No — and this is by design. The Tutor receives the Simulation Run payload as immutable evidence. It contains the actual amplitudes, probabilities, and State Trace from Qiskit Aer. The Tutor may reference these fields but cannot change them. The Misconception Signal itself comes from a deterministic rule engine — no LLM output involved. There is no way for the AI to invent a quantum number."

---

### Q4: "What if there is no internet at the venue?"
**Who:** Vinod Krishna → Sohail (adds one line)

> **Vinod:** "That is our primary deployment mode. DEMO_LOCAL=1 starts the web frontend, the FastAPI backend, in-memory data, and curated Tutor fallback — all on one laptop. Zero internet dependency."
>
> **Sohail:** "I tested this with our smoke suite — all 6 HTTP endpoints pass offline. The Playwright journey runs completely offline."

---

### Q5: "Where is student data stored? What about the DPDP Act?"
**Who:** Rani

> "In the prototype there is no production authentication. Demo profiles are pre-seeded synthetic data. The Tutor free-text responses are never persisted — by design. In production we would use local-first storage with explicit consent, aligned to DPDP 2023 principles. The architecture already separates personal profile data from anonymized cohort analytics."

---

### Q6: "Why not use a real quantum computer?"
**Who:** Uday Rohith

> "Real QPU jobs queue for hours, cost money per shot, and introduce hardware noise that confuses learners conceptually. Qiskit Aer's statevector simulator gives us exact intermediate states — that is what the Flight Recorder needs to locate a divergence. Real QPU integration is on our roadmap once institutional partnerships exist."

---

### Q7: "Your 50 percent to 80 percent improvement claim — is that real research?"
**Who:** Vinod Krishna → Rajeswari (adds source)

> **Vinod:** "Yes — from McKagan, Perkins, and Wieman's 2010 study in Physical Review Physics Education Research. They measured correct reasoning on quantum state-count questions before and after guided interactive simulation with immediate evidence-based feedback."
>
> **Rajeswari:** "The DOI is 10.1103/physrevphyseducres.20.020108. It is our primary pedagogical foundation. We are applying the same model — not claiming we achieved this yet."

---

### Q8: "Can this work in rural colleges with 2G or no internet?"
**Who:** Vinod Krishna

> "Yes. Simulation runs locally on a standard college PC — no GPU, no cloud. Lessons, circuits, and learner accounts are pre-seeded. The Tutor fallback is a curated offline corpus. Nothing requires internet. This is our preferred mode for college labs — it eliminates the biggest barrier to quantum education at Tier-2 and Tier-3 institutions."

---

### Q9: "What is your business model?"
**Who:** Vinod Krishna

> "The core platform is 100% free and open-source for college labs. We plan a tiered institutional SaaS model for cohort analytics and LMS integration — Canvas and Moodle. Additional revenue from skill-certification exam badges and PPP partnerships with hardware vendors. Funding sources: State university budgets, Central Government schemes under DST's National Quantum Mission, and Industry CSR grants."

---

### Q10: "How do you stop students from copying answers?"
**Who:** Rajeswari

> "The Tutor is specifically designed to give hints, not answers. Prompts are structured to explain the reasoning behind the divergence, not complete the Repair Challenge for the student. The response deliberately stops before revealing the answer. Free-form text responses are never logged, so there is no answer key to copy from."

---

### Q11: "Can your editor handle complex circuits beyond Bell state?"
**Who:** Uday Rohith

> "The supported gate set is H, X, Y, Z, CNOT, and Measure — up to 5 qubits. That covers the full AICTE undergraduate quantum curriculum. We explicitly block unsupported gates with a safe error. The AST parser validates submitted Qiskit code before any execution. Expansion to more gates is straightforward — the architecture is designed for it."

---

### Q12: "What if the Flight Recorder gives a wrong diagnosis?"
**Who:** Rajeswari

> "The diagnosis is deterministic — it is a rules engine, not machine learning. Given the same prediction and State Trace it will always return the same Misconception Signal. The taxonomy covers four core misconceptions: Superposition vs Entanglement, Measurement Determinism, Gate Order, and No-Signal. If a learner's prediction does not match any known pattern, the system returns a 'no misconception detected' response rather than guessing."

---

### Q13: "How scalable is this?"
**Who:** Vinod Krishna → Rani (adds one line)

> **Vinod:** "Phase 1 is 10 pilot college labs. Phase 2 targets state technical universities. Phase 3 is a Pan-India SWAYAM and NPTEL rollout."
>
> **Rani:** "The data layer uses MongoDB with indexed queries and a 10-second analytics cache. The architecture supports horizontal scaling — stateless FastAPI workers behind a load balancer. Simulation completes in under 1.5 seconds for the Bell circuit."

---

### Q14: "What is your team's technical background and who built what?"
**Who:** Vinod Krishna (briefly)

> "We are a 6-member team. Vinod — integration, deployment, and the monorepo. Venu — frontend and learner UX. Uday — quantum simulation engine. Rajeswari — Flight Recorder, misconception taxonomy, and AI Tutor. Rani — data layer, MongoDB, and Instructor analytics. Sohail — QA, end-to-end testing, and release certification."

---

## PART 2 — FEATURE DEEP-DIVES (Who Built What)

---

### Flight Recorder — Built by Rajeswari (AI-1 through AI-8)

1. Before the circuit runs, the learner's prediction is captured as a structured enum.
2. After Qiskit Aer runs, a State Trace is generated — a list of statevector snapshots taken before measurement, after each supported gate.
3. A pure Python rules engine (no LLM) compares the learner's prediction against the actual State Trace.
4. The first gate where the prediction diverges from reality is identified as `firstDivergenceStep`.
5. A Misconception Signal is emitted: one of SUPERPOSITION_VS_ENTANGLEMENT, MEASUREMENT_DETERMINISM, GATE_ORDER, or NO_SIGNAL.
6. This signal is persisted in MongoDB and forwarded to the Tutor.

The taxonomy is closed — unknown patterns return a safe null signal, not a guess.

**Rajeswari's pitch beat:** "I own the first-divergence logic, the closed misconception taxonomy, and the evidence-bound Tutor. The AI cannot invent quantum numbers — the simulator owns them."

---

### Quantum Simulation Engine — Built by Uday Rohith (SIM-1 through SIM-9)

Three layers:

**1. Circuit Model Validation (SIM-2):** Pydantic v2 models enforce a closed gate enum, max 5 qubits, valid control/target pairs, and normalized column ordering. No SDK call happens before validation.

**2. Qiskit Aer Adapter (SIM-3):** Builds a QuantumCircuit from the validated model, inserts `save_statevector()` after each gate, runs on the statevector simulator, normalizes output to amplitude pairs with sorted basis labels. Also computes reduced density matrices, Bloch sphere coordinates, and measurement probabilities.

**3. PennyLane Conformance (SIM-6):** Compiles the same Circuit Model to PennyLane `default.qubit`, runs it, and compares output probabilities against Qiskit Aer with a tolerance of 1e-6. This is a conformance check — PennyLane is not the primary simulator.

**Code safety (SIM-5):** Any Qiskit text submitted by a learner is parsed with Python `ast` only — never `exec`'d. An allowlist of permitted AST node types is enforced. File I/O, network calls, imports, and loops are all rejected.

**Uday's pitch beat:** "Qiskit Aer owns every numerical result. PennyLane runs the same circuit for conformance. The AI receives those numbers as immutable evidence — it cannot change them."

---

### Data Layer and Analytics — Built by Rani (DATA-1 through DATA-8)

**Dual-repository pattern:**
- In-memory repository (DATA-1): Fully typed Python protocol with deterministic IDs. Venue-safe fallback — no MongoDB needed.
- MongoDB Atlas repository (DATA-4): Async PyMongo with the same protocol. Swappable at startup via environment flag.

**Seeded content (DATA-2):** Three learner profiles (Aarav, Meera, Dr. Rao), three learning modules, two learning paths, and the Bell-state Prediction Checkpoint — all pre-seeded idempotently.

**Progress tracking (DATA-3):** Challenge Attempt submission uses an idempotency key — submitting the same attempt twice produces one record and one 100-point increment.

**Instructor Insight (DATA-7):** Aggregated per-misconception-code counts computed on demand with a 10-second cache. The 30-profile synthetic cohort provides non-empty charts from day one — labeled as synthetic in the UI.

**Rani's pitch beat:** "I explain learner progress, synthetic cohort disclosure, Instructor Insight privacy design, and memory/Atlas parity."

---

### Frontend and Learner UX — Built by Venu Gopal (UX-1 through UX-9)

Next.js 15, App Router, TypeScript strict mode, Tailwind v4, shadcn/ui.

Key components:
- **Role switcher (UX-1):** Aarav/Meera/Dr. Rao sessions swap without login.
- **Prediction Checkpoint (UX-2):** Structured radio options — no free text. Prediction persisted before Run is enabled.
- **Circuit Workspace (UX-5):** Custom ordered qubit-wire grid using dnd-kit. Gates placed in column order. CodeMirror 6 panel generated from the grid — the grid is canonical. Keyboard alternatives for accessibility.
- **Visual Evidence (UX-6):** Plotly.js for histogram and Bloch sphere. Every representation is labeled.
- **Fallback states (UX-7):** Timeout, cloud-off, and simulation-failed states all show specific recovery actions — no blank screens.

The platform is tested for projector readability at 1366×768 and keyboard-only navigation (UX-9).

**Venu's pitch beat:** "Venu operates the live demo. He narrates Aarav's entry, the Prediction Checkpoint, the Circuit Workspace, the Flight Recorder transition, and the repair result."

---

### QA and End-to-End Testing — Built by Sohail (QA-1 through QA-8)

- **Golden fixtures (QA-1):** Reference JSON payloads for every contract endpoint. Every track builds against these.
- **Contract shape enforcement (QA-2):** Backend Pydantic tests + frontend Zod tests. Catches renamed fields, ObjectId leaks, missing requestId.
- **Smoke test (QA-3):** `scripts/smoke.sh --mode local` hits all 6 P0 HTTP endpoints in sequence and asserts each response against the contract. Exits 0 for green.
- **AST security corpus (QA-4):** Malicious Qiskit inputs — loops, imports, exec, file writes — validated as rejected.
- **Playwright E2E (QA-6):** Automates the exact 90-second Bell journey from Aarav's prediction to Dr. Rao's Instructor Insight, run against local mode.
- **Release certification (QA-8):** `scripts/final-certify.sh` produces `board/RELEASE-CERT.md` with artifact hashes and smoke results.

**Sohail's pitch beat:** "I explain the real HTTP smoke path, malicious-code rejection, cross-backend tolerance, offline fallback drill, and final release certification."

---

### Infrastructure and Integration — Built by Vinod Krishna (SHIP-1 through SHIP-8)

- **Monorepo scaffold (SHIP-1):** Root `apps/web` + `apps/api` structure, `.env.example`, feature flag names.
- **One-laptop launcher (SHIP-2):** `scripts/demo-local.sh` starts both services, seeds in-memory data, waits for readiness, verifies no Atlas or provider key is present.
- **Deployment (SHIP-4):** Vercel (web) + Railway (API) + MongoDB Atlas M0. Live URLs available before the final round.
- **PPT and demo script (SHIP-3, SHIP-5):** The deck, evidence ledger, presentation script, and this pack.

**Vinod's pitch beat:** "Lead the opening problem and one-line pitch. Explain architecture, feasibility, and safety. Answer technical Q&A. Hand the live learner flow to Venu."

---

## PART 3 — QUICK-FIRE CHEAT SHEET

| If a judge says... | Say... | Who |
|---|---|---|
| "Show me the code" | "The repository is open source — GitHub link is on Slide 1." | Vinod |
| "Is this deployed?" | "Yes — Vercel frontend, Railway API, Atlas M0. Live URL on Slide 3." | Vinod |
| "Can I try it myself?" | "Absolutely — Aarav is logged in. Hand Venu the mouse." | Vinod |
| "What if a student runs an infinite loop?" | "Submitted code is never executed. Our AST parser rejects loops before they reach the simulator." | Uday |
| "How accurate is the diagnosis?" | "It is deterministic — same input always gives same output. No ML involved in the diagnosis step." | Rajeswari |
| "How many misconceptions do you detect?" | "Four core types, covering the most common Bell-state errors in physics education research." | Rajeswari |
| "Is the synthetic data labeled?" | "Yes — every Instructor Insight chart has a disclosure banner in the UI. Only the live demo attempt is real." | Rani |
| "What is the database schema?" | "MongoDB with 6 collections — profiles, learning paths, modules, simulation runs, challenge attempts, and progress records." | Rani |
| "Did you test for failures?" | "Yes — we have a forced offline drill, timeout simulation, and a Playwright suite that runs the full journey automatically." | Sohail |

---

## THE CORE INNOVATION — RETURN TO THIS IF LOST

If a judge pushes back on any feature and you lose your answer, return to this:

> **"The Flight Recorder is the differentiator. It captures the prediction before execution, derives a gate-by-gate trace from a real simulator, finds the first divergence, and converts it into a repair task — all without the AI inventing any quantum result. That four-step loop has never been in a single integrated tool before."**

This is true. This is defensible. This is what wins.

---

*Judge Q&A Pack version: SIH 2025 Internal Round · Team Vanguard*
*Update after every rehearsal with new questions encountered.*
