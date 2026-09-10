# Q-Trace — Internal-Round PPT Evidence Package · SHIP-5

> **Source file:** `docs/deck/ship-5-ppt-content.md`
> **Deck version:** 1.0 · **Authored:** 09 Sep 2026 · **Author:** Vinod Krishna (Herald persona)
> **Template target:** Official SIH 2026 Idea Submission Template — 6-slide format
> **Engine:** B (prescribed-template paste — see `ppt-builder` skill)
> **Source mapping:** PRD §1-§2, ARCHITECTURE §1-§3, IDEA-BRIEF, DEMO-SCRIPT.md v0, TEAM.md
> **Freeze gate:** feature freeze 28 Aug 09:00 IST · merge/PPT readiness 28 Aug 18:00 IST
> **Checked by:** `python3 scripts/check_deck.py` — must pass before PR

---

## Paste instructions

1. Open the official SIH 2026 Idea Submission Template (.pptx).
2. Map each `## Slide n` section below to the corresponding slide.
3. Bullets <=5 lines per section; speaker notes under each `NOTES:` block.
4. Replace every `[PLACEHOLDER: ...]` marker with the captured image from `docs/deck/assets/`.
5. Fill `[FILL FROM PORTAL]` fields from the SIH registration portal after team registration.

---

## Slide 1 — Title Page

**Team Name (oval badge):** Q-Trace *(replace with portal-registered name)*

| Field | Value |
|---|---|
| Problem Statement ID | [FILL FROM PORTAL] |
| Problem Statement Title | AI-assisted Quantum Computing Learning Platform with Misconception Repair |
| Theme | Smart Education / EdTech |
| PS Category | Software |
| Team ID | [FILL FROM PORTAL] |
| Team Name | [FILL FROM PORTAL — as registered] |

**Team members:** Vinod Krishna · Venu Gopal · Uday Rohit · Rani · Rajeswari · Akshaya

NOTES:
> "Good morning — we are [Team Name]. Our problem statement asks: how do students actually develop correct quantum intuition, not just correct answers? We built Q-Trace."
> Vinod delivers this in the first 15 seconds. Keep it one sentence; do not read the slide.

---

## Slide 2 — Proposed Solution: Q-Trace — Build it, See it, Repair it

**Section heading (bold underline, per template):** Proposed Solution — Describe your Idea / Solution / Prototype

**Layout structure:** 4-Quadrant Stacked Visual Grid (Top: UI Screenshot / Pills · Bottom: 2 punchy bullets)

### Quadrant 1 (Top-Left) — Challenges & Problems [Step 1: Predict]
- **Visual:** Screenshot of Prediction Checkpoint UI (`assets/slide2-q1-prediction.png`)
- **Bullet 1 (Problem evidence):** Hidden Misconception Trap: Quantum learners assemble circuits without intuition; ~50% baseline failure rate without evidence-based feedback (McKagan et al., 2010 — source [1]).
- **Bullet 2 (Uncaptured Hypotheses):** Existing circuit builders and generic chatbots hide errors until final execution, never capturing what the student expected or where their mental model broke.

### Quadrant 2 (Bottom-Left) — Proposed Solution [Step 2: Build & Code]
- **Visual:** Screenshot of Circuit Workspace UI (`assets/slide2-q2-workspace.png`)
- **Bullet 1 (Visual-to-Code Parity):** Interactive drag-and-drop qubit canvas paired with instant bi-directional Qiskit Python code generation via CodeMirror 6.
- **Bullet 2 (Offline Execution):** 100% offline dual simulation: local Qiskit Aer statevector simulation verified against PennyLane; runs on one laptop with zero cloud dependencies (`DEMO_LOCAL=1`).

### Quadrant 3 (Top-Right) — Innovation & Uniqueness [Core Differentiators]
- **Visual:** 4 Colored Pill Badges (Quantum Flight Recorder · Evidence-Bound AI Tutor · Dual-Engine Conformance · Closed-Loop Pedagogy)
- **Bullet 1 (Quantum Flight Recorder):** Replays the State Trace gate-by-gate to locate the exact gate of prediction divergence and name the Misconception Signal.
- **Bullet 2 (Evidence-Bound AI Tutor):** AI explains verified simulator evidence; mathematically impossible to hallucinate or invent quantum probabilities.

### Quadrant 4 (Bottom-Right) — How it Addresses Problems [Step 4: Repair Loop]
- **Visual:** Screenshot of AI Tutor & Repair Challenge UI (`assets/slide2-q4-repairtutor.png`)
- **Bullet 1 (Targeted Repair):** Diagnoses specific root causes (e.g. `SUPERPOSITION_VS_ENTANGLEMENT`) and generates targeted single-gate repair challenges to lift mastery from ~50% to ~80%.
- **Bullet 2 (Progress Record):** Live attempts update learner mastery records and instructor analytics instantly without invasive chat surveillance.

[PLACEHOLDER: assets/slide2-hero-comparison.png — 4-quadrant layout composite or interactive preview at docs/deck/slide2-preview.html]

NOTES:
> "Our innovation isn't another circuit builder or chatbot — those are table stakes. The innovation is connecting a learner's wrong prediction to the exact gate where their intuition broke, and turning that into an immediate repair challenge. Venu, show them live."
> Vinod -> Venu handoff at 20 s mark.

---

## Slide 3 — Technical Approach

**Bullet 1 — Technologies used:**

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind v4, shadcn/ui | Team stack; App Router for server-side data fetching |
| Circuit Workspace | Custom qubit-wire grid + @dnd-kit/core; CodeMirror 6 | Deterministic ordered grid; avoids React Flow complexity |
| Visualization | Plotly.js (Bloch sphere/histogram); custom SVG (State Trace) | Labeled quantum views without a 3D engine |
| Backend | Python 3.12 + FastAPI + Pydantic v2 | Qiskit and PennyLane are Python-native; one process |
| Quantum execution | Qiskit SDK 2.3 + Aer 0.17 (primary); PennyLane 0.45 (conformance) | Two genuine backends; statevector + intermediate states |
| Data store | MongoDB Atlas M0 (PyMongo Async); deterministic in-memory seed fallback | Venue-resilient offline path; document-shaped trace data |
| Tutor | Provider-adapter interface; curated DEMO_FALLBACK corpus | Numerical truth from simulator — Tutor is evidence-bound |
| Deploy | Vercel (web) + Railway (API) + Atlas M0; DEMO_LOCAL=1 offline path | Early live URLs + full offline venue fallback |

**Bullet 2 — System flow (methodology):**

Learner opens Bell Module
  -> Records Prediction Checkpoint (structured expectation)
  -> Builds circuit visually -> synchronized Qiskit code generated (Circuit Model)
  -> POST /v1/simulation-runs -> Qiskit Aer + PennyLane execute the Circuit Model
  -> State Trace + probabilities returned -> Visual Evidence rendered
  -> POST /v1/flight-recorder/diagnose
     Deterministic rule: Prediction vs State Trace -> Misconception Signal
  -> Tutor receives [lesson context + State Trace + Prediction] -> explanation + Repair Challenge
  -> POST /v1/challenge-attempts -> Progress Record + Instructor Insight update

Safety: Submitted Qiskit text is parsed with Python ast only — never executed. Qubit count: 2-5. Gates: H, X, Y, Z, CNOT, Measure.

[PLACEHOLDER: assets/slide3-architecture-diagram.png — rendered ARCHITECTURE.md section 3 mermaid system sketch. Export dark-background PNG at >=1280px wide.]

NOTES:
> "Qiskit Aer owns every numerical result — statevector simulation gives us exact intermediate states. PennyLane runs the same circuit for conformance. The AI receives those numbers as immutable evidence; it cannot change them."
> Uday delivers this beat, ~20 s.

---

## Slide 4 — Feasibility and Viability

**Bullet 1 — Technical feasibility:**
- All simulation libraries (Qiskit Aer, PennyLane) are open-source and run locally — zero paid infrastructure for simulation.
- FastAPI and Next.js are production-grade frameworks; the team has delivered SIM-1..SIM-9, UX-1..UX-9, DATA-1..DATA-8, AI-1..AI-8, and QA-1..QA-5 all merged to main.
- Walking skeleton (P0) ran successfully on one laptop without internet or cloud AI by 25 Aug 2026.

**Bullet 2 — Operational feasibility:**
- Runs on one laptop at the venue: DEMO_LOCAL=1 starts web, API, in-memory data, and Tutor fallback — no internet required.
- Full offline path verified by scripts/smoke.sh (6/6 HTTP learner-loop endpoints green) and scripts/smoke-live.sh (5/5 live checks green).

**Bullet 3 — Economic feasibility:**
- Local simulation is free (open-source). Optional cloud Tutor inference is the only recurring cost.
- MongoDB Atlas M0 is free-tier; Vercel and Railway hobby tiers cover prototype hosting.
- A college lab incurs zero per-student cost beyond hardware it already owns.

**Bullet 4 — Mandate alignment:**
- NQM + AICTE have announced undergraduate quantum computing courses (DST + AICTE joint announcement — source [5]).
- This is mandate alignment, not a claim that DST/AICTE authored the SIH problem statement.

**Bullet 5 — Risks and mitigations:**

| Risk | Mitigation |
|---|---|
| Multi-framework adapter overrun | Qiskit Aer is live primary; PennyLane restricted to seeded Bell circuit with explicit disclosure |
| LLM hallucinating quantum results | Simulator owns all numerical truth; Tutor receives immutable evidence fields; DEMO_FALLBACK for all scripted inputs |
| Venue internet or provider failure | DEMO_LOCAL=1 full offline path; phone hotspot secondary; backup video at SHIP-7 |
| Visualizations teaching a false model | Every view labeled with mathematical representation; MIXED_SUBSYSTEM label for entangled subsystems |
| Instructor Insight lacking real data | 40 seeded synthetic cohort sessions; live demo attempt writes one real record into the same schema |

[VISUAL: assets/slide4-feasibility-viability.png — official SIH 4-pillar feasibility tree + strategies for overcoming challenges master slide]
[PLACEHOLDER: assets/slide4-live-smoke-result.png — terminal screenshot of bash scripts/smoke.sh --mode local showing 6/6 green checks. Redact any keys or connection strings.]

NOTES:
> "The whole system runs offline on this laptop. No cloud, no venue Wi-Fi, no provider key. The fallback is not a backup plan — it is the plan."
> Rani + Rajeswari deliver this beat, ~20 s.

---

## Slide 5 — Impact and Benefits

**Bullet 1 — Learner impact (Aarav + Meera):**
- Guided interactive simulation with evidence-based feedback improves correct reasoning on quantum state-count questions from ~50% to ~80% (McKagan et al., 2010 — source [1]).
- Q-Trace applies this pedagogical model at scale: every learner gets a personalized misconception-repair loop.
- Two entry personas: Aarav (beginner B.Tech CSE, visual-first), Meera (physics undergrad, code-first) — same platform, adaptive path.

**Bullet 2 — Instructor impact (Dr. Rao):**
- Instructor Insight surfaces aggregate Misconception Signals without private chat surveillance.
- Faculty identify which concepts the cohort misunderstands before the exam, not after.
- SYNTHETIC DATA DISCLOSURE: Instructor Insight demo data = 40 seeded synthetic learner sessions, labeled in the UI. Only Aarav's live demo attempt is real.

**Bullet 3 — Institutional and national impact:**
- One deployable platform covers NQM/AICTE quantum lab requirement with no paid QPU credits or proprietary licenses.
- Roadmap: Bhashini multilingual Tutor (regional-language students), Cirq/qBraid adapters, real QPU when institutional partnerships mature.

**Bullet 4 — Social, economic, and national benefits:**

| Dimension | Benefit |
|---|---|
| Social | Democratizes quantum education — existing hardware, offline, zero per-student cost |
| Economic | Eliminates friction for college labs; reduces quantum workforce skill gap identified by NQM |
| Educational | Prediction -> simulation -> repair loop grounded in physics-education research, not gamification |
| National / strategic | Supports India's quantum workforce readiness goal; QPU-ready architecture |
| Environmental | Local CPU simulation uses negligible energy vs. cloud QPU submission |

[VISUAL: assets/slide5-impact-benefits.png — official SIH 3-pillar stakeholder impact + 5-dimensional benefits matrix master slide]
[PLACEHOLDER: assets/slide5-instructor-insight.png — screenshot of /instructor route showing SUPERPOSITION_VS_ENTANGLEMENT as the top misconception signal. MUST show the "SYNTHETIC DATA — 40 seeded learner sessions" disclosure label visible in the UI.]

NOTES:
> "Build it. See it. Repair it. Q-Trace turns one laptop into a quantum learning lab that finds where understanding broke and fixes it — for every student, every time."
> Vinod delivers the closing beat, ~15 s.

---

## Slide 6 — References

All numerical claims in Slides 1-5 trace to the sources below.

| # | Citation | URL | Claim |
|---|---|---|---|
| [1] | McKagan, Perkins, Wieman (2010). Phys. Rev. Phys. Educ. Res. 20, 020108. | https://doi.org/10.1103/physrevphyseducres.20.020108 | ~50% to ~80% correct reasoning after guided interactive simulation |
| [2] | Catalogues of quantum visualization pitfalls. | https://doi.org/10.48550/arxiv.1410.0867 | Informs labeled-representation policy and MIXED_SUBSYSTEM disclosure |
| [3] | Qiskit Aer documentation — statevector, density-matrix, intermediate save instructions. | https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html | Technical basis for State Trace and Flight Recorder gate-level replay |
| [4] | PennyLane documentation — circuit inspection, state snapshots, interactive debugging. | https://docs.pennylane.ai/en/stable/introduction/inspecting_circuits.html | Technical basis for PennyLane conformance adapter |
| [5] | DST + AICTE — Undergraduate courses in Quantum Computing. | https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum | Mandate alignment — not a claim of PS authorship |
| [6] | DST — National Quantum Mission (NQM). | https://dst.gov.in/national-quantum-mission-nqm | National strategic context for quantum workforce readiness |
| [7] | OpenQASM 3 Specification. | https://openqasm.com/ | Canonical circuit interchange format for export and interoperability |

NOTES:
> "Every number we stated traces to a peer-reviewed source or official documentation. The ledger is in our repository. Happy to share."
> Akshaya or Vinod, 10 s — only if time permits; otherwise leave on screen during Q&A.

---

## Required sections checklist

Used by scripts/check_deck.py to verify deck completeness before PR.

- [x] PROBLEM-EVIDENCE — pain number with source (McKagan 50%->80%, source [1])
- [x] PERSONAS — Aarav (beginner B.Tech CSE) and Meera (physics undergrad) described
- [x] LEARNER-FLOW — 8-step loop: predict -> build -> simulate -> inspect -> diagnose -> repair -> progress -> instructor
- [x] FLIGHT-RECORDER — Quantum Flight Recorder section with gate-by-gate trace and Misconception Signal
- [x] ARCHITECTURE — technology table covering all 8 layers; system flow diagram; architecture image placeholder
- [x] MULTIPLE-BACKENDS — Qiskit Aer (primary) and PennyLane (conformance) both named
- [x] SAFETY — AST-only code parsing, qubit/gate limits, immutable evidence fields, no arbitrary execution
- [x] ANALYTICS — Instructor Insight section with synthetic data disclosure and not-private-surveillance language
- [x] IMPACT — learner, instructor, institutional, social/economic/national/environmental impact
- [x] FEASIBILITY — technical, operational, economic feasibility; risk table with mitigations
- [x] ROADMAP — multilingual Tutor (Bhashini), Cirq/qBraid adapters, real QPU — all marked ROADMAP, not live

---

## Asset manifest

| File | Status | Source |
|---|---|---|
| assets/slide2-hero-comparison.png | [PLACEHOLDER] | Create from wireframe or design tool |
| assets/slide3-architecture-diagram.png | [PLACEHOLDER] | Export rendered ARCHITECTURE.md mermaid diagram |
| assets/slide4-live-smoke-result.png | [PLACEHOLDER] | Terminal screenshot of bash scripts/smoke.sh --mode local (6/6 green) |
| assets/slide5-instructor-insight.png | [PLACEHOLDER] | Screenshot of /instructor route with synthetic data disclosure visible |

Capture instructions: run bash scripts/demo-local.sh --check; navigate to each route at 1366x768; screenshot at >=1280px wide; verify SYNTHETIC DATA disclosure label is visible on Instructor Insight screenshot before saving.

---

## Roadmap vs live feature boundary (WARDEN gate)

The following features are ROADMAP ONLY — they must not be presented as live in the deck:

| Feature | Status |
|---|---|
| Bhashini multilingual Tutor | ROADMAP |
| Cirq adapter | ROADMAP |
| qBraid adapter | ROADMAP |
| Real QPU execution | ROADMAP |
| IVR / feature-phone stub | ROADMAP |
| Real-time multi-user collaboration | ROADMAP |

---

## Synthetic data disclosure (mandatory)

The following disclosure must appear on every slide showing Instructor Insight data:

SYNTHETIC DATA — 40 seeded learner sessions. Only Aarav's live demo attempt is real.

This disclosure must be visible in the screenshot and stated in speaker notes for Slide 5.

---

## Speaker beat assignments

| Slide / beat | Speaker | Duration |
|---|---|---|
| Slide 1 — intro | Vinod | 15 s |
| Slide 2 — solution + uniqueness | Vinod | 20 s |
| Live demo Beats 1-8 | Venu (driver) | ~90 s |
| Slide 3 — tech approach | Uday | 20 s |
| Slide 4 — feasibility | Rani + Rajeswari | 20 s |
| Slide 5 — impact | Vinod (close) | 15 s |
| Q&A | All six (domain beats) | per question |

---

This file is owned by the story-ship track (SHIP-5). Do not edit from other tracks.
Update version and date at every substantive change. Checked by python3 scripts/check_deck.py.
