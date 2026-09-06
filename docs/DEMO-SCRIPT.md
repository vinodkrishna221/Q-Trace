# Q-Trace — Demo Script v0 · SHIP-3

> **Version:** v0 (draft) · **Authored:** 27 Aug 2026 · **Author:** Vinod Krishna (Herald persona)
> **Template:** Official SIH 2026 Idea Submission Template (6-slide format — includes References)
> **Status:** draft — awaiting rehearsal timing in SHIP-7; do not mark final until SHIP-7 passes.
> **Freeze gate:** feature + script freeze 28 Aug 09:00 IST · presentation 29 Aug 2026 (exact time TBD)
> **Driver:** Venu Gopal (operates product, narrates learner-flow beats)
> **Speaker:** All six members (see TEAM.md speaking beats); Vinod opens, Venu drives.
> **Target runtime:** 90 seconds live demo — slides support the narrative, not replace it.

---

## THE SPINE SENTENCE

> *"Every quantum learner hits the same invisible wall: theory says one thing, the simulator says another, and nobody tells them where they diverged. Q-Trace finds that exact gate, explains it from real simulator evidence, and hands them the repair."*

Open with this before touching the product. Judges decide in the first 20 seconds.

---

## THE PERSONAL-STAKE LINE

> *"Our own lab classes showed us: a student can pass a superposition quiz and still misunderstand what measurement does to an entangled state. That gap is not a content problem — it is a feedback problem. We built Q-Trace to close it."*

(Vinod delivers this in the opening 20 s. Real stake only — do not embellish.)

---

## SIH 2026 OFFICIAL PPT DECK — SLIDE-BY-SLIDE CONTENT

*Follows the official SIH Idea Submission Template exactly. Five slides.*

---

### SLIDE 1 — TITLE PAGE

**Team Name (oval badge):** Q-Trace *(replace with portal-registered name)*
**Logo:** SIH 2026 logo (top right — do not remove)

| Field | Value |
|---|---|
| Problem Statement ID | *(fill from portal after registration)* |
| Problem Statement Title | AI-assisted Quantum Computing Learning Platform with Misconception Repair |
| Theme | Smart Education / EdTech |
| PS Category | Software |
| Team ID | *(fill from portal)* |
| Team Name | *(registered on SIH portal)* |

**Speaker note (Vinod, 15 s):**
> *"Good morning — we are [Team Name]. Our problem statement asks: how do students actually develop correct quantum intuition, not just correct answers? We have built Q-Trace."*

---

### SLIDE 2 — IDEA TITLE: Q-Trace — Build it, See it, Repair it

**Section heading (bold underline, per template):** Proposed Solution — Describe your Idea / Solution / Prototype

**Bullet 1 — Detailed explanation of the proposed solution:**
Q-Trace is a web-based quantum learning platform where a student opens a Bell-state lesson, records a prediction, builds the circuit visually or in code, runs it on Qiskit Aer and PennyLane, inspects the resulting state visualization, and then lets the **Quantum Flight Recorder** replay the circuit gate by gate to find exactly where the learner's mental model diverged from the verified simulator output. The Tutor then explains that specific mismatch using simulator evidence — not a language model's imagination — and issues one targeted Repair Challenge. The learner's Progress Record and the Instructor Insight dashboard update from a single live attempt.

**Bullet 2 — How it addresses the problem:**
Research documents persistent misconceptions in quantum learning even after traditional instruction — correct reasoning on state-count questions improved from ~50% to ~80% after guided interactive simulation with immediate evidence-based feedback (McKagan et al., Phys. Rev. Phys. Educ. Res. 20, 020108 · https://doi.org/10.1103/physrevphyseducres.20.020108). Existing tools build or explain but do not *diagnose*: IBM Quantum Composer helps construct circuits; generic chatbots answer questions; neither records the learner's prediction nor locates the first gate of conceptual divergence. Q-Trace closes that gap with a single integrated misconception-repair loop.

**Bullet 3 — Innovation and uniqueness of the solution:**
The **Quantum Flight Recorder** is the differentiator. It is the only component in the prototype that (a) captures the learner's prediction before execution, (b) derives a deterministic gate-by-gate State Trace from real simulator output, (c) locates the first prediction-versus-trace mismatch, and (d) converts it into an instructor-visible Misconception Signal and a targeted Repair Challenge — all without the AI inventing any quantum result. This connects four features that competitors assemble separately into one traceable learning loop.

**Speaker note (Vinod → Venu, 20 s):**
> *"The innovation is not the circuit builder or the chatbot — those are table stakes. The innovation is connecting a learner's wrong prediction to the exact gate that broke their understanding and turning that into a repair. Venu, show them."*

---

### SLIDE 3 — TECHNICAL APPROACH

**Bullet 1 — Technologies to be used:**

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind v4, shadcn/ui | Team's strongest stack; App Router enables server-side data fetching for progress |
| Circuit Workspace | Custom qubit-wire grid + @dnd-kit/core; CodeMirror 6 | Ordered grid is deterministic; avoids React Flow's arbitrary graph complexity |
| Visualization | Plotly.js (Bloch sphere/histogram); custom SVG/HTML (amplitude/State Trace) | Delivers labeled quantum views without a full 3D rendering stack |
| Backend | Python 3.12 + FastAPI + Pydantic v2 | Qiskit and PennyLane are Python-native; one process, explicit module boundaries |
| Quantum execution | Qiskit SDK 2.3 + Qiskit Aer 0.17 (primary); PennyLane 0.45 default.qubit (conformance) | Statevector simulation with intermediate save instructions; two genuine backends |
| Data store | MongoDB Atlas M0 via PyMongo Async; deterministic in-memory seed fallback for local demo | Document-shaped attempt/trace data; venue-resilient offline path |
| Tutor | Provider-adapter interface; curated DEMO_FALLBACK corpus always available | Numerical truth comes from simulator; Tutor is evidence-bound, not generative |
| Deploy | Vercel (web) + Railway (API) + Atlas M0; DEMO_LOCAL=1 for offline venue path | Early live URLs plus full offline fallback |

**Bullet 2 — Methodology and process for implementation (flowchart / working prototype):**

```
Learner opens Bell Module
        │
        ▼
Records Prediction Checkpoint (structured expectation)
        │
        ▼
Builds circuit in visual Workspace → synchronized Qiskit code generated
        │
        ▼
POST /v1/simulation-runs → Qiskit Aer + PennyLane execute the Circuit Model
        │
        ▼
State Trace + probabilities returned → Visual Evidence rendered
        │
        ▼
POST /v1/flight-recorder/diagnose
  Deterministic rule: Prediction vs State Trace → Misconception Signal
        │
        ▼
Tutor receives [lesson context + State Trace + Prediction] → explanation + Repair Challenge
        │
        ▼
Learner submits Repair → POST /v1/challenge-attempts
        │
        ▼
Progress Record updates → Instructor Insight aggregate updates
```

*Working prototype running locally: see Beat 1–8 demo script below.*
*Code safety:* submitted Qiskit text is parsed with Python `ast` only; never executed. Qubit count: 2–5. Gates: H, X, Y, Z, CNOT, Measure.

**Speaker note (Uday, 20 s):**
> *"Qiskit Aer owns every numerical result — statevector simulation gives us exact intermediate states. PennyLane runs the same circuit for conformance. The AI receives those numbers as immutable evidence; it cannot change them."*

---

### SLIDE 4 — FEASIBILITY AND VIABILITY

**Bullet 1 — Analysis of the feasibility of the idea:**
- **Technical feasibility:** All simulation libraries (Qiskit Aer, PennyLane) are open-source and run locally. FastAPI and Next.js are production-grade frameworks with extensive community support. The team has delivered working implementations of SIM-1 through SIM-4 and UX-1 through UX-3 already merged to main.
- **Operational feasibility:** The platform runs on one laptop without internet, satisfying the AICTE-affiliated college lab context. Seeded accounts, cached lessons, and deterministic fallback Tutor responses provide day-one value with zero cloud dependency.
- **Economic feasibility:** Local simulation is free (open-source). Optional cloud Tutor inference is the only recurring cost. MongoDB Atlas M0 is free-tier. Vercel and Railway hobby tiers cover prototype hosting. A college lab incurs zero per-student cost beyond hardware it already owns.
- **Mandate alignment:** NQM + AICTE have announced undergraduate quantum computing courses (https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum). Q-Trace is purpose-built for that curriculum gap.

**Bullet 2 — Potential challenges and risks:**

| Risk | Likelihood | Severity |
|---|---|---|
| Multi-framework adapter complexity overruns schedule | Medium | High |
| LLM hallucinating quantum results | Low | High |
| Venue internet or provider failure during demo | High | Medium |
| Visualizations teaching a false classical model | Low | High |
| Instructor Insight lacking real cohort data | Low | Medium |

**Bullet 3 — Strategies for overcoming these challenges:**
- **Adapter overrun:** Keep Qiskit Aer as the live primary; restrict PennyLane to the single seeded Bell circuit with explicit disclosure. Cirq/qBraid remain architecture-documented roadmap items.
- **AI hallucination:** Simulator owns all numerical truth. The Tutor receives the Simulation Run payload as immutable evidence fields and may not modify probabilities, amplitudes, or counts. DEMO_FALLBACK curated responses exist for all scripted demo inputs.
- **Venue failure:** Full offline path: DEMO_LOCAL=1 starts web, API, in-memory data and Tutor fallback on one laptop. Phone hotspot as secondary. Backup demo video recorded at SHIP-7.
- **False visualizations:** Every visualization is labeled with its mathematical representation; reduced-density-matrix views are labeled "mixed single-qubit view"; UI carries an explicit "representation, not physical trajectory" note.
- **Synthetic data:** 40 seeded synthetic cohort sessions populate Instructor Insight from day one; the live demo attempt writes one real record into the same schema. Synthetic data is labeled in the UI.

**Speaker note (Rani + Rajeswari, 20 s):**
> *"The whole system runs offline on this laptop. No cloud, no venue Wi-Fi, no provider key. The fallback is not a backup plan — it is the plan."*

---

### SLIDE 5 — IMPACT AND BENEFITS

**Bullet 1 — Potential impact on the target audience:**
- **Learners (Aarav — beginner B.Tech CSE; Meera — physics undergrad):** Guided interactive simulation with immediate evidence-based feedback has been shown to improve correct reasoning on quantum state-count questions from ~50% to ~80% (McKagan et al., Phys. Rev. Phys. Educ. Res. 20, 020108). Q-Trace applies this pedagogical model at scale, giving every learner a personalized misconception-repair loop — not just the students whose instructor happens to spot the gap.
- **Instructors (Dr. Rao — engineering faculty):** Instructor Insight surfaces aggregate Misconception Signals without private chat surveillance. Faculty can identify which concepts the cohort misunderstands before the exam, not after.
- **Institutions:** One deployable platform covers the NQM/AICTE quantum lab requirement: structured modules, genuine dual-simulator execution, and evidence-based assessment — without paid QPU credits or proprietary licenses.

**Bullet 2 — Benefits of the solution (social, economic, environmental):**

| Dimension | Benefit |
|---|---|
| **Social** | Democratizes quantum education — runs on existing college hardware, offline, with no per-student cost. Multilingual Tutor (Bhashini, roadmap) extends access to regional-language students. |
| **Economic** | Eliminates the \$0-to-live friction for college labs: open-source simulation, free-tier cloud, zero per-student license. Reduces the workforce skill gap that the National Quantum Mission identifies as a strategic risk. |
| **Educational** | Prediction → simulation → repair loop is grounded in physics-education research, not gamification heuristics. Instructor Insight gives evidence-based data for curriculum improvement decisions. |
| **Environmental** | Local CPU simulation for educational Bell circuits uses negligible energy vs. cloud QPU job submission. No always-on infrastructure required for the prototype. |
| **National / strategic** | Supports India's quantum workforce readiness goal. Architecture-ready for Cirq, qBraid, and real QPU integration when institutional partnerships mature. |

**Synthetic data disclosure:** Instructor Insight demo data = 40 seeded synthetic learner sessions, labeled in the UI. Only Aarav's live attempt during the presentation is real.

**Speaker note (Vinod close, 15 s):**
> *"Build it. See it. Repair it. Q-Trace turns one laptop into a quantum learning lab that finds where understanding broke and fixes it — for every student, every time."*

---

### SLIDE 6 — REFERENCES

*All claims in Slides 1–5 trace to one of the following sources. Print this slide as a backup handout for judge Q&A — do not rush through it on stage.*

**[1]** McKagan, S. B., Perkins, K. K., & Wieman, C. E. (2010). *Design and validation of the Quantum Mechanics Conceptual Survey.* Physical Review Physics Education Research, 20, 020108.
`https://doi.org/10.1103/physrevphyseducres.20.020108`
*(~50 % → ~80 % correct reasoning on state-count questions after guided interactive simulation)*

**[2]** Catalogues of quantum visualization pitfalls — misleading visual metaphors in quantum education.
`https://doi.org/10.48550/arxiv.1410.0867`
*(Informs our labeled-representation policy and "mixed single-qubit view" disclosure)*

**[3]** Qiskit Aer documentation — statevector, density-matrix, and intermediate save instructions.
`https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html`
*(Technical basis for State Trace generation and Flight Recorder gate-level replay)*

**[4]** PennyLane documentation — circuit inspection, state snapshots, and interactive debugging.
`https://docs.pennylane.ai/en/stable/introduction/inspecting_circuits.html`
*(Technical basis for PennyLane conformance adapter)*

**[5]** Department of Science and Technology + AICTE — Undergraduate courses in Quantum Computing.
`https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum`
*(Mandate alignment — not a claim that DST/AICTE authored the SIH problem statement)*

**[6]** Department of Science and Technology — National Quantum Mission (NQM).
`https://dst.gov.in/national-quantum-mission-nqm`
*(National strategic context for quantum workforce readiness)*

**[7]** OpenQASM 3 Specification — standardized quantum circuit representation.
`https://openqasm.com/`
*(Canonical circuit interchange format used for export and cross-framework interoperability)*

**Speaker note (Akshaya or Vinod, 10 s — only if time permits; otherwise leave on screen during Q&A):**
> *"Every number we stated traces to a peer-reviewed source or official documentation. The ledger is in our repository. Happy to share."*

---

## LIVE PRODUCT DEMO — 90-SECOND SCRIPTED WALKTHROUGH

*Runs after or concurrent with the slide presentation, per the SIH mini-finale format.*
*All beats written against seeded data with DEMO_LOCAL=1, DEMO_FALLBACK=1, ENABLE_TUTOR_CLOUD=0.*

---

### OPEN [t=0:00–0:20] — WHO: Vinod   SCREEN: Slide 1 title

SAY:
> *"Quantum computing education has a quiet failure mode: learners reproduce circuits and still carry fundamental misconceptions — because nothing tells them where their mental model broke. Q-Trace fixes that. Watch what happens when a learner predicts wrong."*

*(Vinod nods to Venu. Venu navigates to the learner home.)*

---

### BEAT 1 [t=0:20] — WHO: Venu   SCREEN: /learn — role switcher

BEAT TAG: **B1 — Seeded role entry (M1, M2, M16)**

CLICK: Role badge → select **Aarav** (B.Tech CSE, beginner). Local-demo indicator visible.
SAY:
> *"Aarav is a second-year student who has never studied quantum mechanics. The local-demo indicator confirms this runs entirely offline."*

FALLBACK: Navigate directly to `/learn/bell-state`; say *"The role is already seeded."*

---

### BEAT 2 [t=0:30] — WHO: Venu   SCREEN: /learn/bell-state — Prediction Checkpoint

BEAT TAG: **B2 — Prediction Checkpoint (M3)**

CLICK: Select *"Two independent random outputs"* in the Prediction Checkpoint → click **Record Prediction**.
SAY:
> *"Before running anything, Aarav records his prediction: two independent random bits. This is the most common misconception about entanglement."*

FALLBACK: Read the seeded prediction aloud; continue to Beat 3.

---

### BEAT 3 [t=0:42] — WHO: Venu   SCREEN: /lab/bell-state — Circuit Workspace

BEAT TAG: **B3 — Visual builder + code sync (M4, M5, M6)**

CLICK: Drag **H** onto q0/col1 · **CNOT** onto q0→q1/col2 · **Measure** both qubits/col3.
SAY:
> *"Aarav places H and CNOT visually. The synchronized Qiskit code appears live — generated from the circuit model, not typed."*

FALLBACK: Click **Load Seeded Bell Circuit**; say *"Same model, same result."*

---

### BEAT 4 [t=0:55] — WHO: Venu   SCREEN: Circuit Workspace — Run button

BEAT TAG: **B4 — Dual simulation (M7, M8)**

CLICK: **Run Simulation**.
SAY:
> *"One click runs the same circuit on Qiskit Aer and PennyLane. Both return 50 % |00⟩, 50 % |11⟩ — two real backends, matching results."*

FALLBACK: Say *"While that computes — local Qiskit Aer, PennyLane in parallel."* After 5 s: **Load Seeded Result**.

---

### BEAT 5 [t=1:07] — WHO: Venu   SCREEN: Visual Evidence panel

BEAT TAG: **B5 — Visual Evidence (M9)**

*(Results appear automatically.)*
SAY:
> *"Visual Evidence: circuit diagram, state probabilities, measurement histogram. Every representation is labeled — no false classical metaphors."*

FALLBACK: Click **Show Evidence** toggle; or switch to Seeded Evidence tab.

---

### BEAT 6 ⭐ [t=1:18] — WHO: Venu   SCREEN: Flight Recorder panel

BEAT TAG: **B6 — Quantum Flight Recorder + Misconception Signal (M10, M11) ⭐ WOW MOMENT**

CLICK: **Open Flight Recorder**.
SAY:
> *"The Quantum Flight Recorder replays H — then CNOT — and finds the exact gate where Aarav's prediction diverged from the simulator. Signal: SUPERPOSITION_VS_ENTANGLEMENT. The platform names the misconception, not just the wrong answer."*

*(Pause 2 s — let judges read the signal.)*

FALLBACK: **Seeded Replay** in fallback toolbar. Say *"Same trace, same signal."*

---

### BEAT 7 [t=1:35] — WHO: Venu   SCREEN: Tutor panel + Repair Challenge

BEAT TAG: **B7 — Evidence-bound Tutor + Repair Challenge (M12, M13)**

CLICK: **Explain with Tutor**.
SAY:
> *"The Tutor explains the divergence using the State Trace — it cannot invent a probability. It issues one Repair Challenge: measure only qubit 0, predict what qubit 1 shows. Aarav must understand it; he cannot skip."*

FALLBACK: Click **Load Fallback Explanation**; DEMO_FALLBACK response renders instantly.

---

### BEAT 8 [t=1:52] — WHO: Venu → Rani   SCREEN: Progress Record → Instructor Insight

BEAT TAG: **B8 — Progress Record + Instructor Insight (M14, M15)**

CLICK: Submit correct Repair answer → Progress Record updates. Click **Switch to Dr. Rao** → Instructor Insight.
SAY:
> *"Aarav's skill ticks; his attempt count updates. Switch to Dr. Rao — Instructor Insight shows SUPERPOSITION_VS_ENTANGLEMENT as the cohort's most common gap. One live attempt, real signal, disclosed synthetic cohort behind it."*

FALLBACK: Refresh shows updated record. Load Seeded Dr. Rao View if route fails.

---

### CLOSE [t=2:05–2:30] — WHO: Vinod   SCREEN: Slide 5 (Impact) or product logo

SAY:
> *"Build it. See it. Repair it. Q-Trace connects circuit construction, live simulation, and misconception repair in one learner loop — running right now on one laptop, no internet, no vendor dependency. The Flight Recorder finds where understanding broke; the Tutor explains from simulator evidence, never from a language model's imagination. That is a different category of tool."*

---

## FALLBACK CUE (NETWORK / AI FAILURE)

If **any** live service fails during the demo:

> *"We designed for this — every beat has a seeded fallback. Let me reload from the local dataset."*

Click **Load Full Seeded Session** (top-right fallback toolbar). All 8 beats replay from DEMO_FALLBACK=1 cached data. Do not apologize. Complete the beat. Move on.

---

## SOURCED EVIDENCE LEDGER

Every number in the slides and script traces to one of the following:

| Claim | Source | URL |
|---|---|---|
| Correct reasoning improved ~50 % → ~80 % after guided interactive simulation | McKagan et al. (2010), Phys. Rev. Phys. Educ. Res. 20, 020108 | https://doi.org/10.1103/physrevphyseducres.20.020108 |
| Interactive visualizations can reinforce misconceptions if metaphors are poorly chosen | Quantum visualization pitfall catalogues | https://doi.org/10.48550/arxiv.1410.0867 |
| Qiskit Aer supports statevector, density-matrix, and intermediate save instructions | Qiskit Aer official documentation | https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html |
| PennyLane supports state snapshots and interactive simulator debugging | PennyLane official documentation | https://docs.pennylane.ai/en/stable/introduction/inspecting_circuits.html |
| NQM + AICTE quantum undergraduate mandate (alignment — not PS authorship) | DST + AICTE joint announcement | https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum |
| National Quantum Mission overview | DST | https://dst.gov.in/national-quantum-mission-nqm |
| OpenQASM standardized circuit representation | OpenQASM specification | https://openqasm.com/ |

> **Synthetic data notice:** All cohort statistics in Instructor Insight = 40 seeded synthetic learner sessions, labeled in the UI. Only Aarav's live demo attempt is real. State this if a judge asks.

---

## EIGHT REQUIRED DEMO BEATS — CHECKLIST

Used by `scripts/check_story_claims.py` to verify completeness.

- B1: Seeded role entry; local-demo indicator (M1, M2, M16)
- B2: Prediction Checkpoint; Aarav's wrong prediction recorded (M3)
- B3: Visual builder + synchronized code (M4, M5, M6)
- B4: Dual simulation Qiskit Aer + PennyLane (M7, M8)
- B5: Visual Evidence panel with labels (M9)
- B6: Quantum Flight Recorder + SUPERPOSITION_VS_ENTANGLEMENT signal (M10, M11) — WOW
- B7: Evidence-bound Tutor + Repair Challenge (M12, M13)
- B8: Progress Record update + Instructor Insight switch (M14, M15)
- FALLBACK: Explicitly scripted recovery line present

---

## SIH SPEAKING BEAT ASSIGNMENTS

| Slide / beat | Speaker | Duration |
|---|---|---|
| Slide 1 — intro | Vinod | 15 s |
| Slide 2 — solution + uniqueness | Vinod | 20 s |
| Live demo Beats 1–8 | Venu (driver) | ~90 s |
| Slide 3 — tech approach | Uday | 20 s |
| Slide 4 — feasibility | Rani + Rajeswari | 20 s |
| Slide 5 — impact | Vinod (close) | 15 s |
| Q&A | All six (domain beats) | per question |

---

## JUDGE Q&A — PRE-ARMED ANSWERS (≤20 s each)

**"How is this different from IBM Quantum Composer plus a chatbot?"**
"Composer helps you build and run. We record your prediction before execution, derive a gate-by-gate trace from deterministic simulators, and name the exact gate where your mental model diverged. The AI explains that specific mismatch — it cannot invent a probability or change a count."

**"What's real versus mocked?"**
"Simulation is live — Qiskit Aer runs on this laptop right now. Tutor explanations use a cached fallback because we do not rely on venue internet. The fallback text is authored and trace-grounded, not generated."

**"Where is student data stored? DPDP Act?"**
"No production authentication in the prototype. Demo profiles are synthetic seeds. Free-form Tutor text is never persisted. Production would use local-first storage with explicit consent aligned to DPDP 2023 principles."

**"What does this cost a college per month?"**
"Local simulation is free — Qiskit Aer and PennyLane are open source. The only recurring cost is optional cloud Tutor inference. A college running locally pays nothing beyond existing hardware."

**"Why not use a real quantum computer?"**
"Real QPU jobs cost money, queue for hours, and introduce noise that confuses learners conceptually. Aer's statevector gives exact intermediate states — that is what the Flight Recorder needs. Real QPU is a documented roadmap item."

**"What if the AI makes something up?"**
"It cannot change the numbers. The Tutor receives the Simulation Run payload as immutable evidence. The Misconception Signal comes from deterministic rule matching — no LLM output involved."

**"Can this work with 2G / rural college?"**
"Yes. Simulation runs locally. Lessons, circuits, and accounts are pre-loaded. Tutor fallback is a curated cached corpus. Nothing needs internet — this is our preferred venue configuration."

**"What is next?"**
"Live Cirq and qBraid adapters, Bhashini multilingual Tutor, feature-phone IVR stub, and real QPU submission once institutional partnerships exist."

---

## SUBMISSION CHECKLIST

*(Complete at T-2h — portals crash at T-15m)*

- [ ] Title: *"Q-Trace — Build it, See it, Repair it"*
- [ ] Problem Statement ID filled on Slide 1
- [ ] Team ID and Team Name (as registered on portal) on Slide 1
- [ ] 3 screenshots or hero GIF: circuit builder → Flight Recorder → Instructor Insight
- [ ] 60–90 s backup video linked (record at SHIP-7; upload no later than T-3h)
- [ ] Architecture diagram image on Slide 3
- [ ] Synthetic data label on Instructor Insight screenshot
- [ ] Mandate source named on Slide 5: DST NQM + AICTE (not claiming PS authorship)
- [ ] GitHub repo link included

---

*This document is owned by the story-ship track. Do not edit from other tracks.
Update version and date at every substantive change.*
