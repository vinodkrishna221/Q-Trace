# Judge Q&A Cheat-Sheet — Rajeswari
### AI Pedagogy & Misconception Tutor · Q-Trace Team Vanguard

---

## 1. What I Built (My Elevator Pitch)
I created the Quantum Flight Recorder and the evidence-bound AI Tutor, which pinpoint the exact gate where a student's mental model diverged from quantum reality and guide them to repair it. My deterministic rules engine guarantees that the AI never hallucinates physics or guesses quantum states, anchoring every explanation strictly in verified simulator evidence.

---

## 2. My Tech Stack & Code Footprint

### Technologies & Libraries
- **Deterministic Rules Engine:** Pure Python diagnosis functions (zero-LLM, strictly deterministic)
- **Misconception Taxonomy:** Closed 4-code classification matrix (`SUPERPOSITION_VS_ENTANGLEMENT`, `MEASUREMENT_DETERMINISM`, `GATE_ORDER`, `NO_SIGNAL`)
- **Evidence-Bound Prompt Engine:** Versioned prompt templates enforcing Socratic scaffolding and anti-copy constraints
- **Provider Adapter Architecture:** Multi-provider interface with cloud timeout guards and instant fallback
- **Curated Fallback Corpus:** Offline-ready verified pedagogical explanations (`DEMO_FALLBACK`)
- **Pedagogical Foundations:** Grounded in physics education research on interactive prediction and immediate feedback (McKagan et al., Phys. Rev. PER 2010, DOI: 10.1103/PhysRevPhysEducRes.20.020108)

### Where My Code Lives
- [`apps/api/app/routers/flight_recorder.py`](file:///d:/Q-Trace/apps/api/app/routers/flight_recorder.py): Flight Recorder diagnosis and step-by-step circuit replay endpoints
- [`apps/api/app/routers/tutor.py`](file:///d:/Q-Trace/apps/api/app/routers/tutor.py): Evidence-bound Tutor explanation and targeted Repair Challenge endpoints
- [`apps/api/app/services/diagnosis/rules.py`](file:///d:/Q-Trace/apps/api/app/services/diagnosis/rules.py): Pure deterministic rule functions mapping pre-run predictions and State Traces to misconception codes
- [`apps/api/app/services/diagnosis/taxonomy.py`](file:///d:/Q-Trace/apps/api/app/services/diagnosis/taxonomy.py): Closed taxonomy definitions and first-divergence gate index calculators
- [`apps/api/app/services/tutor/adapter.py`](file:///d:/Q-Trace/apps/api/app/services/tutor/adapter.py): Cloud LLM adapter interface with response validation and timeout fallback
- [`apps/api/app/services/tutor/fallback.py`](file:///d:/Q-Trace/apps/api/app/services/tutor/fallback.py): Curated, classroom-tested explanations for all demo and offline states
- [`apps/api/app/services/tutor/validator.py`](file:///d:/Q-Trace/apps/api/app/services/tutor/validator.py): Post-generation numerical claim validator catching hallucinated numbers
- [`apps/api/app/services/tutor/pedagogy_qa.py`](file:///d:/Q-Trace/apps/api/app/services/tutor/pedagogy_qa.py): Canonical 8 technical judge Q&A definitions and release validation checks
- [`apps/api/app/prompts/`](file:///d:/Q-Trace/apps/api/app/prompts): Versioned prompt templates (`tutor_system.txt`, `tutor_user_template.txt`) enforcing Socratic hints and anti-copy barriers
- [`apps/api/tests/unit/ai/`](file:///d:/Q-Trace/apps/api/tests/unit/ai): Unit tests for taxonomy rules, evidence-key validation, fallback parity, and prompt safety

---

## 3. Top 3–4 Likely Judge Questions & Spoken Answers

### Q1: "Can your AI tutor hallucinate or invent false quantum physics?"
> **Spoken Answer (17s):**
> *"No. The AI acts like a courtroom stenographer: it only quotes the official transcript. Qiskit Aer passes an immutable State Trace containing exact probabilities and amplitudes. The Tutor is strictly evidence-bound to those numbers. If any generated response cites an unverified value, our validator blocks it instantly."*

### Q2: "How does the Flight Recorder diagnose misconceptions? Is an AI model guessing?"
> **Spoken Answer (17s):**
> *"An airplane black box doesn't guess why a plane drifted; it compares instruments against the flight plan. Similarly, our Flight Recorder is a 100% deterministic rules engine. We compare the student's prediction against the simulator's step-by-step trace to pinpoint the exact gate of divergence without any LLM."*

### Q3: "How do you stop students from cheating or using the AI as an answer-dispenser for their homework?"
> **Spoken Answer (16s):**
> *"Like a lab professor guiding over a student's shoulder, our Tutor gives Socratic hints, never answers. Our system prompts explicitly forbid revealing circuit solutions. It explains where the student's model broke, and then issues a separate Repair Challenge where the student must apply the fix themselves."*

### Q4: "What happens if a student makes an unusual mistake that doesn't fit your taxonomy?"
> **Spoken Answer (16s):**
> *"Our taxonomy is deliberately closed to four well-researched codes: Superposition vs Entanglement, Measurement Determinism, Gate Order, or No-Signal. If a prediction doesn't match an established pattern, the engine emits `NO_SIGNAL` with general guidance. We prioritize scientific honesty over guessing."*

---

## 4. What NEVER to Say (Red Lines & Traps)

1. ❌ **TRAP:** *"We trained our own custom quantum LLM from scratch on arXiv physics papers."*
   - **Why it's fatal:** Unbelievable for a hackathon prototype; judges will immediately grill you on GPU clusters, training datasets, token budgets, and loss curves.
   - ✅ **SAY INSTEAD:** *"We use evidence-bound prompt templates backed by an immutable simulator trace and a curated local fallback corpus that requires zero external AI."*

2. ❌ **TRAP:** *"The AI grades the student's quantum circuit and decides if they pass or fail."*
   - **Why it's fatal:** AI is nondeterministic and cannot be trusted for academic grading or physics verification.
   - ✅ **SAY INSTEAD:** *"Grading is 100% deterministic. Qiskit Aer calculates the physical outcome, and our rules engine checks if the repair criteria are met. The AI's only role is providing plain-English pedagogical feedback."*

3. ❌ **TRAP:** *"Our app is proven to improve student exam scores by 80%."*
   - **Why it's fatal:** Making efficacy claims without your own IRB-approved clinical trial data is an academic red flag.
   - ✅ **SAY INSTEAD:** *"We implement the proven pedagogical model of McKagan, Perkins, and Wieman in Physical Review PER, which demonstrated significant conceptual gains through prediction and immediate simulation feedback."*

---

## 5. Emergency Handoff Line
If a judge asks an out-of-scope question about monorepo CI/CD pipelines, MongoDB indexing internals, or business partnership pricing:

> *"My domain is pedagogical design, the Flight Recorder diagnosis engine, and evidence-bound tutoring. For full-stack monorepo infrastructure, database scaling, or institutional business models, let me hand over to our lead, Vinod."*
