# PRD — Q-Trace

> Scale gate: **FULL** · Internal hackathon: **29 August 2026, exact time TBD** · Self-imposed skeleton deadline: **25 August 2026, 09:00 IST**
> Vocabulary freeze begins after human sign-off: the capitalized nouns below become final across code, schema, UI and pitch.

## 1 · Problem

Quantum computing learners must connect counterintuitive theory to executable circuits, but most resources split that journey across static courses, visual builders, code notebooks, simulators and generic chatbots. Research after traditional instruction found persistent misconceptions about bit-versus-qubit state counts, superposition, entanglement and measurement; on one core state-count question, correct reasoning improved from roughly 50% before a guided interactive tutorial to roughly 80% after it, showing both the gap and the value of prediction-driven scaffolding (https://doi.org/10.1103/physrevphyseducres.20.020108). The official SIH statement therefore needs more than a feature collection: learners need one continuous environment that teaches, lets them build and execute, shows verified state evolution, diagnoses where understanding diverged, and gives instructors actionable evidence.

## 2 · Users & Core Loop

### Primary Demo User

**Aarav** — a second-year B.Tech CSE student at an AICTE-affiliated college. He knows basic Python but has never studied quantum mechanics. He needs visual scaffolding, plain-language explanations and immediate feedback without being encouraged to copy generated code blindly.

### Secondary Learner

**Meera** — a third-year physics student. She understands superposition and measurement mathematically but is new to quantum circuit programming. She needs a shorter conceptual path, synchronized code, framework comparisons and debugging support.

### Instructor / Operator

**Dr. Rao** — an engineering faculty member introducing an undergraduate quantum-computing lab. He assigns a Module or Challenge and needs aggregate Concept and Misconception signals—not private chat surveillance—to decide what to reteach.

### Core Loop

Dr. Rao assigns a Module or Challenge → Aarav or Meera enters through an adaptive Learning Path → predicts circuit behavior at a Prediction Checkpoint → builds in the Circuit Workspace visually or in code → executes a Simulation Run → inspects Visual Evidence → Quantum Flight Recorder locates the first conceptual divergence → the Tutor explains only from verified evidence → the learner completes a Repair Challenge → the Progress Record and Instructor Insight update → the learner returns for the next Skill.

## 3 · Frozen Vocabulary

- **Learner Profile** — the learner’s role, prior-knowledge band and completed Skills.
- **Learning Path** — ordered Modules selected from prior knowledge and performance.
- **Module** — one guided concept-to-circuit lesson.
- **Skill** — a measurable capability such as creating superposition or explaining Bell correlation.
- **Prediction Checkpoint** — the learner’s expected state, probability or measurement behavior before execution.
- **Circuit Workspace** — synchronized visual and supported-code construction surface.
- **Circuit Model** — framework-neutral circuit representation used by the Workspace and adapters.
- **Simulation Run** — execution of one Circuit Model on one Simulator Adapter.
- **Simulator Adapter** — Qiskit Aer or PennyLane implementation of the supported Circuit Model.
- **Visual Evidence** — circuit diagram, state amplitudes/probabilities, valid Bloch or reduced-state view, and measurement histogram derived from a Simulation Run.
- **State Trace** — ordered simulator-derived states or summaries after supported gates.
- **Misconception Signal** — categorized mismatch between a Prediction Checkpoint and State Trace.
- **Quantum Flight Recorder** — replay interface that finds and explains the first divergence using a State Trace.
- **Tutor** — evidence-bound assistant for concept explanation, supported-code debugging and verified optimization guidance.
- **Challenge** — quiz or circuit task with deterministic acceptance criteria.
- **Repair Challenge** — smallest follow-up task targeting one Misconception Signal.
- **Progress Record** — learner Skills, attempts, completions and misconception history.
- **Instructor Insight** — aggregate, privacy-minimized view of cohort progress and common misconceptions.

## 4 · 90-Second Learner-Led Demo Narrative

| Beat | Judge sees | Powered by MUST |
|---:|---|---|
| 0 | Herald frames the problem in one sentence and names the promise: “Build it, see it, repair it.” | M17 |
| 1 | A local-demo indicator confirms the journey runs without venue internet. Aarav and Meera receive the same Bell-state Module from a three-Module catalogue; their Learning Paths show different entry steps based on prior knowledge. | M1, M2, M16 |
| 2 | Aarav answers a Prediction Checkpoint, incorrectly expecting two independent random outputs. | M3 |
| 3 | Aarav constructs H + CNOT in the visual Circuit Workspace; synchronized Qiskit code appears and accepts one supported edit. Meera can enter through the code-first view. | M4, M5, M6 |
| 4 | The same Circuit Model runs through Qiskit Aer and PennyLane; supported results agree within tolerance. | M7, M8 |
| 5 | Visual Evidence shows the circuit, state probabilities and measurement correlation; the interface labels what each representation means. | M9 |
| 6 ⭐ | **Quantum Flight Recorder** replays H then CNOT, identifies the first divergence from Aarav’s prediction, and produces a Misconception Signal for superposition-versus-entanglement. | M10, M11 |
| 7 | The Tutor explains the divergence using the State Trace, then issues one Repair Challenge instead of giving away the answer. | M12, M13 |
| 8 | Aarav repairs and passes; his Progress Record updates. A brief closing switch shows Dr. Rao’s aggregate Instructor Insight reflecting the concept difficulty. | M14, M15 |

## 5 · Scope

### MUST

- [ ] **M1 — Seeded role entry:** Aarav, Meera and Dr. Rao demo profiles with role switching; production authentication is not required.
- [ ] **M2 — Structured learning:** a three-Module catalogue—Qubits & Superposition, Measurement, and Entanglement/Bell State—with prior-knowledge entry variants for Aarav and Meera; only the Bell-state journey must be complete end to end for P0.
- [ ] **M3 — Prediction Checkpoint:** capture a structured expectation before the Bell Simulation Run.
- [ ] **M4 — Visual builder:** constrained two-to-five-qubit Workspace supporting H, X, Y, Z, CNOT and Measure with ordering/removal.
- [ ] **M5 — Supported code view:** Qiskit code generated from the Circuit Model and one controlled, safely parsed edit for the frozen supported subset; any unsupported edit fails explicitly. The Cut List may downgrade this to generated read-only code.
- [ ] **M6 — Framework-neutral Circuit Model:** one canonical representation powering visual construction, code generation, export and simulator adapters.
- [ ] **M7 — Qiskit Aer adapter:** genuine local/server simulation returning counts, probabilities and State Trace data for supported circuits.
- [ ] **M8 — PennyLane adapter:** genuine execution for the supported Bell journey and comparison result; unsupported features fail explicitly.
- [ ] **M9 — Visual Evidence:** circuit view, state amplitudes/probabilities, measurement histogram and a physically valid Bloch/reduced-state treatment with explanatory labels.
- [ ] **M10 — Quantum Flight Recorder:** gate-by-gate replay of the supported Bell State Trace.
- [ ] **M11 — Misconception diagnosis:** deterministic comparison of Prediction Checkpoint against State Trace and mapping to a curated misconception taxonomy.
- [ ] **M12 — Evidence-bound Tutor:** explanations receive the lesson context, supported code errors, Prediction Checkpoint and State Trace; every numerical claim comes from simulator output; scripted DEMO_FALLBACK responses exist.
- [ ] **M13 — Assessment:** one concept quiz and one Bell circuit Repair Challenge with deterministic checks.
- [ ] **M14 — Progress Record:** completion, attempts, score and misconception history update from one live demo attempt.
- [ ] **M15 — Instructor Insight:** aggregate cohort completion and misconception counts using disclosed synthetic cohort seeds plus the live learner attempt.
- [ ] **M16 — Venue resilience:** the scripted learner journey, local simulators, seeded data and Tutor fallback run on one laptop without internet.
- [ ] **M17 — Submission story:** the 90-second demo opens with the approved one-line pitch, mandate evidence and unfair advantage; the PPT and demo script preserve the learner-led narrative.

### SHOULD — pre-ranked

1. **S1 — Circuit health suggestions:** deterministic gate count, depth and simple supported-pattern optimization guidance.
2. **S2 — OpenQASM export/share:** download the supported Circuit Model as OpenQASM and reopen a shared circuit artifact.
3. **S3 — Adaptive recommendation:** choose the next Module from Challenge outcome and Misconception Signal.
4. **S4 — Ideal-versus-noisy comparison:** one curated Qiskit noise example to explain why simulator and hardware-like outcomes differ.
5. **S5 — Accessibility pass:** keyboard builder operations, color-independent states and concise glossary/tooltips.

### CUT LIST — execute top-down if schedule turns red

1. Remove ideal-versus-noisy comparison — saves approximately 4 hours.
2. Replace editable code parsing with generated read-only code plus copy/download — saves approximately 6 hours.
3. Restrict PennyLane to the single seeded Bell circuit and label the adapter boundary — saves approximately 4 hours.
4. Replace dynamic next-Module recommendation with a deterministic rules table — saves approximately 3 hours.
5. Reduce Instructor Insight to three aggregate cards and one misconception bar chart — saves approximately 4 hours.
6. Reduce modules to Superposition and Bell State while keeping the same end-to-end loop — saves approximately 5 hours.
7. If AI integration becomes unstable, use curated trace-aware explanations for all scripted demo states and retain the same Tutor UI — saves provider/debugging time without breaking the demo.

### NON-GOALS

- Real QPU job submission, queue management or paid hardware credits.
- Full live Cirq, qBraid or every-SDK execution during the internal prototype; they remain documented adapters on the roadmap.
- Real-time multi-user editing; prototype collaboration is Circuit Model/OpenQASM sharing.
- A complete quantum degree curriculum, accreditation claim or proof that the prototype improves learning outcomes.
- Large-circuit or research-scale simulation; the prototype is intentionally bounded to small educational circuits.
- Unrestricted arbitrary Python execution.
- LLM-generated quantum results, grading decisions or optimization claims without deterministic verification.
- Production institutional administration, billing, proctoring or student surveillance.
- Claiming that DST, AICTE or NQM authored the problem statement unless official metadata later confirms it.

## 6 · Success =

### Prototype acceptance

- The full learner-led path runs from Module selection to Progress Record on one laptop.
- Qiskit Aer and PennyLane produce matching supported Bell-state probabilities within a declared tolerance.
- Quantum Flight Recorder replays at least H and CNOT and emits the expected seeded Misconception Signal.
- The Tutor’s scripted numerical statements can be traced to the Simulation Run payload.
- One real demo attempt updates learner progress and the same aggregate store viewed by Dr. Rao.
- The fallback path survives disabled internet and disabled external AI provider.
- No demo beat depends on Cirq, qBraid or real hardware.

### Judge-retellable phrases

1. **“Build it, see it, repair it.”**
2. **“The Flight Recorder finds where understanding broke.”**
3. **“AI explains simulator evidence; it never invents quantum results.”**

### Delivery gates

- Walking skeleton ready by **25 August 2026, 09:00 IST**.
- Risky-feature freeze by **27 August 2026, 18:00 IST**.
- Feature and demo-script freeze by **28 August 2026, 09:00 IST**.
- Merge, deploy and PPT readiness by **28 August 2026, 18:00 IST**.
- Exact presentation-time gates remain relative until the college confirms the 29 August schedule.

## 7 · Direction Checks for Blueprint

1. Whether the supported editable-code subset is worth its parser cost versus generated code plus one controlled editor example.
2. Whether PennyLane adds enough judge value to remain a genuine P0/P1 adapter or should be a narrow conformance check.
3. Whether Tutor inference runs through a cloud model, a local model, or cloud plus deterministic fallback after fit-audit evidence.
4. Which database minimizes integration load while supporting Learner Profile, Progress Record and Instructor Insight.
5. Which visualization library can represent amplitudes, probabilities and reduced-state information without teaching false classical metaphors.
