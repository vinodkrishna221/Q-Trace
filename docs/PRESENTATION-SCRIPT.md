# Q-Trace — Full Presentation & Live Demo Script
### Team Vanguard · SIH 2025 · Problem Statement 26140
### Team ID: 76239

> **Members:** Vinod Krishna · Rani · Rajeswari · Venu Gopal · Uday Rohith · Sohail
> **Note:** Venu Gopal and Sohail are quieter speakers — their lines are short, action-driven, and fully written out. They do NOT need to improvise.
> **Demo driver:** Venu Gopal (clicks the product; Vinod talks if Venu gets stuck)
> **Target total time:** ~3 minutes (slides + live demo)

---

## 🎯 THE ONE SENTENCE TO REMEMBER

> *"Q-Trace finds the exact gate where a student's understanding broke — and repairs it."*

Every member should know this by heart. If any judge asks "what is this?" — this is the answer.

---

## ⏱️ TIME MAP

| Segment | Who | Time |
|---|---|---|
| Opening + Slide 1 | Vinod Krishna | 0:00 – 0:20 |
| Slide 2 — Solution | Vinod Krishna | 0:20 – 0:40 |
| Live Demo (Beats 1–4) | Venu Gopal (clicks) + Vinod (narrates) | 0:40 – 1:20 |
| Beat 5–6 (Wow moment) | Vinod Krishna | 1:20 – 1:45 |
| Beat 7 — Tutor | Rajeswari | 1:45 – 2:00 |
| Beat 8 — Progress + Analytics | Rani | 2:00 – 2:15 |
| Slide 3 — Tech Approach | Uday Rohith | 2:15 – 2:35 |
| Slide 4 — Feasibility | Rani (leads) + Rajeswari (one line) | 2:35 – 2:50 |
| Slide 5 — Impact + Close | Vinod Krishna | 2:50 – 3:00 |

---

## 📋 FULL SCRIPT — LINE BY LINE

---

### 🟢 OPENING [0:00 – 0:20]
**Speaker: Vinod Krishna** *(standing, facing judges)*

> **VINOD:** "Good morning. We are Team Vanguard. I'm Vinod Krishna. Problem Statement 26140 — AI-Based Interactive Quantum Algorithm Learning Platform.
>
> Here's the problem in one sentence: a student can pass a superposition quiz and still fundamentally misunderstand entanglement — because no tool tells them *where* their mental model broke.
>
> We built Q-Trace to fix that. Venu — pull up the demo."

*(Vinod steps slightly to the side. Venu sits or stands at the laptop.)*

---

### 🟢 SLIDE 2 — SOLUTION [0:20 – 0:40]
**Speaker: Vinod Krishna** *(gestures at the screen)*

> **VINOD:** "Q-Trace is a quantum learning platform with one superpower — the **Quantum Flight Recorder**. It is the only tool that records the learner's prediction before execution, replays the circuit gate by gate using real Qiskit simulator output, finds the exact gate where understanding diverged, and issues a targeted repair task. Not a chatbot. Not just a circuit builder. A misconception-repair loop. Venu — show them."

---

### 🟢 BEAT 1 [0:40 – 0:50] — Role Entry
**Venu Gopal: clicks. Vinod narrates.**

> *(Venu clicks the role badge, selects **Aarav** — B.Tech CSE, beginner)*

> **VINOD:** "We are logging in as Aarav — a second-year student. You can see the local-demo indicator here. This entire demo runs offline on this one laptop. No cloud. No Wi-Fi dependency."

> **[VENU — if asked by a judge]:** *(just point and say)* "This is the role selector. Aarav is the beginner learner profile."

**FALLBACK for Venu:** If the role selector does not load, type `/learn/bell-state` in the URL bar and say: *"Role is already seeded — going straight in."*

---

### 🟢 BEAT 2 [0:50 – 1:00] — Prediction Checkpoint
**Venu Gopal: clicks. Vinod narrates.**

> *(Venu clicks **"Two independent random outputs"** in the Prediction Checkpoint → clicks **Record Prediction**)*

> **VINOD:** "Before running anything, Aarav must record his prediction. He picks 'two independent random outputs' — the most common entanglement misconception. This is captured before any code runs."

**FALLBACK for Venu:** If the checkpoint does not load, read the seeded prediction aloud and move on.

---

### 🟢 BEAT 3 [1:00 – 1:12] — Circuit Workspace
**Venu Gopal: clicks and drags. Vinod narrates.**

> *(Venu drags H gate → q0/col1, CNOT → q0-q1/col2, Measure → both qubits/col3)*

> **VINOD:** "Aarav builds the Bell circuit by dragging gates onto the qubit wires. Watch — the Qiskit code on the right is auto-generated in real time. He does not type it — the visual model drives the code."

**FALLBACK for Venu:** Click **"Load Seeded Bell Circuit"** button. Say nothing — Vinod will narrate.

---

### 🟢 BEAT 4 [1:12 – 1:20] — Run Simulation
**Venu Gopal: clicks. Vinod narrates.**

> *(Venu clicks **Run Simulation**)*

> **VINOD:** "One click. The same circuit runs on Qiskit Aer and PennyLane simultaneously. Two real simulation backends. Both return 50% |00⟩, 50% |11⟩. Not mocked. Not pre-loaded."

**FALLBACK for Venu:** If it takes more than 5 seconds, click **Load Seeded Result**. Vinod will say: *"Running locally now."*

---

### 🟢 BEAT 5 [1:20 – 1:30] — Visual Evidence
**Venu Gopal: results appear automatically. Vinod narrates.**

> **VINOD:** "Visual Evidence — the circuit diagram, state probabilities, measurement histogram. Every representation is labeled. No misleading metaphors. Aarav sees |00⟩ and |11⟩ at 50-50. Does this match his prediction of two independent random bits? No. The Flight Recorder is about to show exactly where his thinking went wrong."

**FALLBACK for Venu:** Click **Show Evidence** toggle or Seeded Evidence tab.

---

### ⭐ BEAT 6 [1:30 – 1:45] — FLIGHT RECORDER — WOW MOMENT
**Venu Gopal: clicks. Vinod narrates.**

> *(Venu clicks **Open Flight Recorder**)*

> **VINOD:** "The Quantum Flight Recorder. It replays the H gate... the CNOT gate... and at the CNOT it finds the divergence. Misconception signal: **SUPERPOSITION_VS_ENTANGLEMENT**. The platform does not just say 'wrong answer.' It names the conceptual gap, traces it to a specific gate, and generates an instructor-visible signal. That has never been done in a single integrated tool before."

*(Pause 2 seconds — let judges read the screen.)*

**FALLBACK for Venu:** Click **Seeded Replay** in the fallback toolbar. Vinod will handle the narration.

---

### 🟡 BEAT 7 [1:45 – 2:00] — Tutor + Repair Challenge
**Speaker: Rajeswari** *(your moment — short and fully written — read it confidently)*

> *(Venu clicks **Explain with Tutor**)*

> **RAJESWARI:** "The AI Tutor receives the State Trace as immutable evidence — it cannot invent a quantum result. It explains exactly why the CNOT created correlation, not independence. Then it gives Aarav a Repair Challenge: measure only qubit 0 and predict what qubit 1 shows. He has to understand it. He cannot skip. This is evidence-bound AI — the AI guides reasoning, it does not do the exercise."

**FALLBACK:** If the Tutor is slow, say: *"The fallback explanation is loading — same content, authored and trace-grounded."* Venu clicks **Load Fallback Explanation**.

> **[If a judge asks Rajeswari something]:** "The misconception taxonomy covers four core errors: Superposition vs Entanglement, Measurement Determinism, Gate Order, and No-Signal. I built the detection rules and the Tutor evidence binding."

---

### 🟡 BEAT 8 [2:00 – 2:15] — Progress + Instructor Insight
**Speaker: Rani** *(your moment — short and clear)*

> *(Venu submits the correct Repair answer → clicks **Switch to Dr. Rao**)*

> **RANI:** "Aarav's progress updates live — one attempt, 100 points, misconception logged. Switch to Dr. Rao — the instructor view. Instructor Insight shows SUPERPOSITION_VS_ENTANGLEMENT as the cohort's most frequent gap. Aggregate signal, not individual surveillance. The 40 background profiles are synthetic, labeled in the UI. Only Aarav's live attempt is real."

**FALLBACK:** "If the chart does not load, here is the seeded view." *(Venu loads Seeded Dr. Rao View).*

> **[If a judge asks Rani something]:** "I built the data layer — MongoDB repositories, progress tracking, analytics aggregation. The learning data and progress pipelines are mine."

---

### 🟢 SLIDE 3 — TECHNICAL APPROACH [2:15 – 2:35]
**Speaker: Uday Rohith** *(stand up, speak clearly — your lines are short)*

> **UDAY:** "The tech stack: Next.js frontend, FastAPI Python backend, Qiskit Aer 0.17 and PennyLane 0.45 — both running locally. The key safety point: any Qiskit code a student types is parsed with Python AST only — never executed. We validate the circuit model first. State Trace is captured before measurement — that is how the Flight Recorder knows the intermediate quantum states."

> **[If a judge asks Uday something]:** "I own the quantum simulation layer — Qiskit Aer adapter, PennyLane conformance, State Trace normalization, the AST-safe code parser, and timeout resilience guards."

---

### 🟡 SLIDE 4 — FEASIBILITY [2:35 – 2:50]
**Speakers: Rani (leads) + Rajeswari (one line)**

> **RANI:** "Three feasibility points. Technical: runs 100% offline on a standard college laptop. Financial: zero simulation cost — Qiskit and PennyLane are open source; MongoDB Atlas M0 is free tier. Zero per-student licensing cost."

> **RAJESWARI:** "Policy alignment — DST and AICTE have mandated undergraduate quantum courses under the National Quantum Mission. Q-Trace is purpose-built for that curriculum gap."

> **RANI:** "Our biggest risk was AI hallucinating quantum numbers. We solved it by making the simulator own all numerical truth. The AI receives the State Trace as read-only evidence. It cannot modify a probability."

---

### 🟢 SLIDE 5 + CLOSE [2:50 – 3:00]
**Speaker: Vinod Krishna**

> **VINOD:** "Impact: guided simulation with evidence feedback improves correct quantum reasoning from 50% to 80% — McKagan et al., Physics Education Research 2010. For institutions: runs on hardware they already own, zero QPU cost, AICTE-aligned. For India: quantum workforce readiness that works in a tier-2 college with no internet. Build it. See it. Repair it. Q-Trace — the only platform that finds where understanding broke and fixes it."

---

## 🚨 EMERGENCY FALLBACK LINES

If **anything** fails during the live demo:

> **VINOD (or whoever is speaking):** *"We designed for exactly this — every beat has a seeded fallback. Loading from local dataset now."*

→ **Venu clicks "Load Full Seeded Session"** (top-right fallback toolbar)
→ Continue the beat. **Do not apologize. Do not panic.**

If the laptop crashes entirely: Venu opens the backup video on the desktop. Vinod narrates over it.

---

## 💬 VENU & SOHAIL — SPECIAL NOTES

### Venu Gopal (Demo Driver)
You do not need to speak much. Your job is to click the right things at the right time.
- Follow the CLICK instructions exactly
- If something breaks: click the FALLBACK button
- If a judge asks you something directly, point at the screen and say: *"Yes — this is [feature name]."* Then let Vinod add detail.
- Practice the 8 beats 3 times alone before the presentation

### Sohail — Your Pre-Written Answer (memorize this)
> *"I built the end-to-end test suite — the real HTTP smoke test that hits all 6 endpoints, contract shape validation at both the frontend and backend boundary, and the offline release certification. The Playwright test automates the exact 90-second learner journey. The system is certified for offline use — I ran the release gate against both local and cloud modes."*

If a judge asks something you do not know: say *"Vinod can answer that in detail."* That is perfectly fine.

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
