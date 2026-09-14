# Q-Trace — Full Presentation & Live Demo Script
### Team Vanguard · SIH 2025 · Problem Statement 26140
### Team ID: 76239

> **Members:** Rani · Uday Rohith · Venu Gopal · Vinod Krishna · Rajeswari · Sohail
> **Note:** Every member has an active speaking role in both the slides and the live demo (~13–14s each in the demo).
> **Speaker ≠ Operator Rule:** The person speaking never operates the laptop. The 4 operators (Vinod, Venu, Uday, Sohail) operate while another teammate speaks.
> **Target total time:** ~3 minutes (slides + live demo)

---

## 🎯 THE ONE SENTENCE TO REMEMBER

> *"Q-Trace finds the exact gate where a student's understanding broke — and repairs it."*

Every member should know this by heart. If any judge asks "what is this?" — this is the answer.

---

## ⏱️ TIME MAP

| Segment | Speaker | Operator | Time |
|---|---|---|---|
| Opening + Slide 1 (Basic Details) | Rani | — | 0:00 – 0:15 |
| Slide 2 — Approach (Solution & Innovation) | Uday Rohith | — | 0:15 – 0:35 |
| **Live Demo (All 6 Members — ~13s each)** | | | **0:35 – 1:55** |
| • Beat 1: Role Entry & Offline Platform | Vinod Krishna | Sohail | 0:35 – 0:48 |
| • Beats 2–3: Prediction & Circuit Workspace | Venu Gopal | Uday Rohith | 0:48 – 1:02 |
| • Beat 4: Simulation Run & Dual Backends | Uday Rohith | Sohail | 1:02 – 1:15 |
| • Beat 5: Visual Evidence & Statevector Truth | Sohail | Vinod Krishna | 1:15 – 1:28 |
| • Beats 6–7: Flight Recorder & AI Tutor | Rajeswari | Vinod Krishna | 1:28 – 1:42 |
| • Beat 8: Progress Record & Instructor Insight | Rani | Venu Gopal | 1:42 – 1:55 |
| Slide 3 — Technical Approach & Architecture | Rajeswari | — | 1:55 – 2:15 |
| Slide 4 — Feasibility & Viability | Sohail | — | 2:15 – 2:35 |
| Slide 5 — Impact & Business Model | Rani (Impact) + Vinod (Business) | — | 2:35 – 2:50 |
| Closing | Vinod Krishna | — | 2:50 – 3:00 |

---

## 📋 FULL SCRIPT — LINE BY LINE

---

### 🟢 OPENING & SLIDE 1 — BASIC DETAILS [0:00 – 0:15]
**Speaker: Rani** *(standing, facing judges)*

> **RANI:** "Good morning, respected judges. We are Team Vanguard, Team ID 76239. Problem Statement 26140 — AI-Based Interactive Quantum Algorithm Learning Platform under the Smart Education theme.
>
> Here is the core educational challenge: quantum computing students assemble circuits without genuine intuition — facing a ~50% baseline failure rate because existing tools hide errors until final execution, never capturing what the learner expected or where their mental model broke.
>
> Uday will present our solution approach."

*(Rani steps aside. Uday Rohith presents Slide 2.)*

---

### 🟢 SLIDE 2 — APPROACH: PROPOSED SOLUTION & INNOVATION [0:15 – 0:35]
**Speaker: Uday Rohith** *(gesturing at Slide 2)*

> **UDAY ROHITH:** "Our approach breaks the misconception trap in four connected steps:
>
> First, **Predict** — we capture the learner's pre-execution hypothesis before any code runs.
> Second, **Build & Code** — visual-to-code parity with an interactive drag-and-drop canvas generating real-time Qiskit code, backed by 100% offline dual simulation on Qiskit Aer and PennyLane.
> Third, our core innovation — the **Quantum Flight Recorder**: deterministic gate-by-gate replay that pinpoints the exact divergence point.
> Fourth, the **Repair Loop** — an evidence-bound AI Tutor and targeted single-gate repair challenges that boost conceptual mastery from 50% to 80%.
>
> Venu and Vinod will now demonstrate the live product."

---

### 🟢 LIVE DEMO (BEATS 1–8) [0:35 – 1:55]
**All 6 team members present (~13–14s each) · Speaker ≠ Operator on every beat**

#### 🟢 Beat 1 [0:35 – 0:48] — Role Entry & Offline Platform
**Speaker: Vinod Krishna · Operator: Sohail** *(at the laptop, clicks Aarav)*

> *(Sohail clicks the role badge, selects **Aarav** — B.Tech CSE, beginner)*

> **VINOD:** "We log in as Aarav — a second-year learner. Notice the local demo indicator: this entire platform runs 100% offline on this single laptop with zero cloud or internet dependency. Venu, set up the prediction and circuit."

**FALLBACK for Sohail:** If the role selector does not load, type `/learn/bell-state` in the URL bar and say: *"Role is already seeded — going straight in."*

---

#### 🟢 Beats 2 & 3 [0:48 – 1:02] — Prediction Checkpoint & Circuit Workspace
**Speaker: Venu Gopal · Operator: Uday Rohith** *(at the laptop, clicks prediction, then drags gates)*

> *(Uday clicks **"Two independent random outputs"** → clicks **Record Prediction**; then drags H gate → q0/col1, CNOT → q0-q1/col2, Measure → both qubits/col3)*

> **VENU GOPAL:** "Before running, Aarav must commit to a hypothesis — he picks 'two independent random outputs', the most common misconception. Uday now places the Hadamard gate on wire 0, CNOT to entangle, and measurement. Watch the right panel — Qiskit code auto-generates in real time from the visual grid with zero manual typing. Uday, run the simulation."

**FALLBACK for Uday:** Click **"Load Seeded Bell Circuit"** button and continue.

---

#### 🟢 Beat 4 [1:02 – 1:15] — Simulation Run & Dual Engine Conformance
**Speaker: Uday Rohith · Operator: Sohail** *(at the laptop, clicks Run Simulation)*

> *(Sohail clicks **Run Simulation**)*

> **UDAY ROHITH:** "One click. Dual execution on Qiskit Aer and PennyLane executes locally. Both return 50% |00⟩ and 50% |11⟩ — genuine local statevector simulation, not mocked or pre-recorded. Sohail, show the visual evidence."

**FALLBACK for Sohail:** If simulation takes >5 seconds, click **Load Seeded Result** and say: *"Running locally now."*

---

#### 🟢 Beat 5 [1:15 – 1:28] — Visual Evidence & Statevector Truth
**Speaker: Sohail · Operator: Vinod Krishna** *(at the laptop, displays results and points to charts)*

> *(Vinod displays the probabilities and measurement histogram on screen)*

> **SOHAIL:** "Visual Evidence: state probabilities and measurement histograms are rendered mathematically honestly. Aarav sees only |00⟩ and |11⟩ at 50-50. This directly contradicts his prediction of independent random bits. Rajeswari, show how the Flight Recorder diagnoses this."

**FALLBACK for Vinod:** Click **Show Evidence** toggle or Seeded Evidence tab.

---

#### ⭐ Beats 6 & 7 [1:28 – 1:42] — Quantum Flight Recorder & Evidence-Bound AI Tutor
**Speaker: Rajeswari · Operator: Vinod Krishna** *(standing; Vinod clicks Open Flight Recorder, then clicks Explain with Tutor)*

> *(Vinod clicks **Open Flight Recorder**, then clicks **Explain with Tutor**)*

> **RAJESWARI:** "The Quantum Flight Recorder replays intermediate states gate-by-gate: at the CNOT, it isolates the exact divergence and emits the signal: **SUPERPOSITION_VS_ENTANGLEMENT**. The AI Tutor receives the State Trace as immutable ground truth — it cannot hallucinate. It explains the entanglement correlation, then issues an active Repair Challenge: measure qubit 0 and predict qubit 1. Rani, show the progress result."

**FALLBACK for Vinod:** If needed, click **Seeded Replay** or **Load Fallback Explanation**.

---

#### 🟡 Beat 8 [1:42 – 1:55] — Progress Record & Instructor Insight
**Speaker: Rani · Operator: Venu Gopal** *(standing; Venu submits repair challenge answer, then clicks Switch to Dr. Rao)*

> *(Venu submits correct Repair answer → clicks **Switch to Dr. Rao**)*

> **RANI:** "Aarav submits, earning 100 points as his progress record updates live. Switching to Dr. Rao — the instructor view shows SUPERPOSITION_VS_ENTANGLEMENT as the cohort's primary gap, aggregating learning signals without invasive surveillance.
>
> Rajeswari will now walk through our technical architecture."

**FALLBACK for Venu:** If chart does not load, click **Load Seeded Dr. Rao View**.

---

### 🟢 SLIDE 3 — TECHNICAL APPROACH & ARCHITECTURE [1:55 – 2:15]
**Speaker: Rajeswari** *(standing, presenting Slide 3)*

> **RAJESWARI:** "Our technical approach is architected in four clean, modular layers:
>
> **Layer 1: Next.js Web** — strict TypeScript and Tailwind CSS powering the Circuit Workspace, CodeMirror 6 synchronization, and real-time Plotly visual evidence.
>
> **Layer 2: FastAPI Backend** — high-performance Python services routing circuit validation, misconception diagnosis, and Tutor requests.
>
> **Layer 3: Quantum Runtime** — local Qiskit Aer 0.17 verified against PennyLane 0.45. For security, student Qiskit code is parsed strictly with Python AST — never executed unsafely.
>
> **Layer 4: Data Layer** — MongoDB Atlas M0 with deterministic in-memory fallback for offline resilience.
>
> Sohail will present our feasibility and reliability."

---

### 🟡 SLIDE 4 — FEASIBILITY & VIABILITY [2:15 – 2:35]
**Speaker: Sohail** *(standing, presenting Slide 4)*

> **SOHAIL:** "Four pillars prove Q-Trace's feasibility:
>
> **Technical & Operational:** Q-Trace is certified 100% offline. Our automated smoke suite verifies all 6 HTTP learner endpoints with zero network calls and zero cloud dependencies.
>
> **Economic:** Zero simulation cost — Qiskit Aer and PennyLane are open-source, and MongoDB Atlas M0 is free tier. Zero per-student licensing fee.
>
> **Policy Alignment:** Purpose-built for DST and AICTE mandates introducing undergraduate quantum computing courses under the National Quantum Mission.
>
> **Risk Mitigation:** Mathematical truth is anchored in the simulator. The AI receives the State Trace as read-only evidence, completely eliminating hallucination.
>
> Rani and Vinod will detail our impact and business model."

---

### 🟢 SLIDE 5 — IMPACT & BUSINESS MODEL [2:35 – 2:50]
**Speakers: Rani (Left Panel: Benefits & Impact) + Vinod Krishna (Right Panel: Business Model & Scalability)**

> **RANI (Left Panel — Benefits & Impact):** "On the impact panel: for students, active evidence feedback drives conceptual reasoning from 50% to 80% based on McKagan et al.'s PER research. For instructors, Dr. Rao's cohort radar surfaces misconceptions before exams. For institutions, it eliminates expensive QPU credits, democratizing deep-tech education for tier-2 and tier-3 colleges."
>
> **VINOD KRISHNA (Right Panel — Business Model & Scalability):** "For sustainability and business model: funding aligns with State university lab grants, AICTE modernization funds, and CSR tech partnerships. Our scalability roadmap expands from 10 pilot college labs, to state technical universities, to pan-India integration with SWAYAM and NPTEL."

---

### 🟢 CLOSING [2:50 – 3:00]
**Speaker: Vinod Krishna** *(steps center stage)*

> **VINOD KRISHNA:** "Build it. See it. Repair it. Q-Trace — the only platform that finds where understanding broke and repairs it. Thank you."

---

## 🚨 EMERGENCY FALLBACK LINES

If **anything** fails during the live demo:

> **VINOD:** *"We designed for exactly this — every beat has a seeded fallback. Loading from local dataset now."*

→ **Operator clicks "Load Full Seeded Session"** (top-right fallback toolbar)
→ Continue the beat. **Do not apologize. Do not panic.**

If the laptop crashes entirely: open the backup video on the desktop. Vinod narrates over it.

---

## 💬 TEAM ROLES & SPECIAL NOTES (Judge Q&A Cheat Sheet)

### Rani (Opening & Slide 1 · Demo Beat 8 Speaker · Slide 5 Impact Panel)
- **Live lines:** Delivers Opening & Slide 1 [0:00 – 0:15], speaks Demo Beat 8 (Venu operates) [1:42 – 1:55], and speaks Slide 5 Benefits & Impact [2:35 – 2:43].
- **If asked by a judge (Data & Analytics):**
  > *"I built the data layer — MongoDB schemas, progress tracking, and Dr. Rao's analytics aggregation. The PER research correlation showing ~50% to ~80% reasoning gains is grounded in McKagan et al. (2010)."*

### Uday Rohith (Slide 2 Approach · Demo Beat 4 Speaker · Demo Beats 2–3 Operator)
- **Live lines:** Delivers Slide 2 Approach [0:15 – 0:35], operates Demo Beats 2 & 3 (while Venu speaks) [0:48 – 1:02], and speaks Demo Beat 4 (while Sohail operates) [1:02 – 1:15].
- **If asked by a judge (Quantum Simulation):**
  > *"I own the quantum simulation layer — Qiskit Aer adapter, PennyLane conformance, State Trace normalization, and AST parsing security to prevent arbitrary code execution."*

### Venu Gopal (Demo Beats 2–3 Speaker · Demo Beat 8 Operator)
- **Live lines:** Speaks Demo Beats 2 & 3 (while Uday operates) [0:48 – 1:02] and operates Demo Beat 8 (while Rani speaks) [1:42 – 1:55].
- **If asked by a judge (Frontend UX):**
  > *"I built the Next.js learner experience and the interactive Circuit Workspace using dnd-kit, with live two-way code synchronization to CodeMirror 6, Plotly visual evidence, and resilient UI fallback states."*

### Vinod Krishna (Demo Beat 1 Speaker · Demo Beats 5–7 Operator · Slide 5 Business Model · Closing · Team Lead)
- **Live lines:** Speaks Demo Beat 1 (while Sohail operates) [0:35 – 0:48], operates Demo Beats 5, 6, 7 (while Sohail & Rajeswari speak) [1:15 – 1:42], speaks Slide 5 Business Model [2:43 – 2:50], and delivers Closing [2:50 – 3:00].
- **If asked by a judge (System Architecture & Business Model):**
  > *"I lead team integration, monorepo architecture, and release engineering. Our 3-phase business model scales from 10 pilot college labs to state technical universities and pan-India SWAYAM/NPTEL integration with zero cloud simulation cost."*

### Rajeswari (Demo Beats 6–7 Speaker · Slide 3 Technical Approach)
- **Live lines:** Speaks Demo Beats 6 & 7 (while Vinod operates) [1:28 – 1:42] and delivers Slide 3 Technical Approach [1:55 – 2:15].
- **If asked by a judge (Flight Recorder & AI Tutor):**
  > *"The misconception taxonomy covers four core errors: Superposition vs Entanglement, Measurement Determinism, Gate Order, and No-Signal. I built the deterministic divergence rules and the Tutor evidence binding that prevents LLM hallucination."*

### Sohail (Demo Beat 5 Speaker · Demo Beats 1 & 4 Operator · Slide 4 Feasibility · QA Lead)
- **Live lines:** Operates Demo Beat 1 (while Vinod speaks) [0:35 – 0:48], operates Demo Beat 4 (while Uday speaks) [1:02 – 1:15], speaks Demo Beat 5 (while Vinod operates) [1:15 – 1:28], and delivers Slide 4 Feasibility & Viability [2:15 – 2:35].
- **If asked by a judge (Testing & Verification):**
  > *"I built the end-to-end test suite (QA-1 through QA-8) — the real HTTP smoke test that hits all 6 endpoints, contract shape validation using Pydantic and Zod, and the final release certification. The Playwright suite automates the exact 90-second learner journey offline."*

---

## 🔁 PRE-DEMO CHECKLIST (30 minutes before)

- [ ] `bash scripts/demo-local.sh` — confirm green start
- [ ] Aarav role loads on `/learn/bell-state`
- [ ] Bell circuit drag-and-drop works (or seeded fallback confirmed)
- [ ] Run Simulation completes in under 5 seconds (or seeded result ready)
- [ ] Flight Recorder shows SUPERPOSITION_VS_ENTANGLEMENT signal
- [ ] Tutor fallback response loads instantly
- [ ] Dr. Rao Instructor Insight dashboard loads with chart
- [ ] Backup video is on the desktop and plays
- [ ] Browser is full-screen, 1366×768, font size readable from 3 meters
- [ ] Every member has read their lines at least twice

---

*Script version: SIH 2025 Internal Round · Team Vanguard*
*Keep this file private — do not share on public repos before presentation.*
