# Q-Trace — Demo Script v0 · SHIP-3

> **Version:** v0 (draft) · **Authored:** 27 Aug 2026 · **Author:** Vinod Krishna (Herald persona)
> **Status:** draft — awaiting rehearsal timing in SHIP-7; do not mark final until SHIP-7 passes.
> **Freeze gate:** feature + script freeze 28 Aug 09:00 IST · presentation 29 Aug 2026 (exact time TBD)
> **Driver:** Venu Gopal (operates product, narrates learner-flow beats)
> **Speaker:** All six members (see TEAM.md speaking beats); Vinod opens, Venu drives.
> **Target runtime:** 90 seconds (leave 20 s under any time limit to handle venue clock drift)

---

## THE SPINE SENTENCE

> *"Every quantum learner hits the same invisible wall: theory says one thing, the simulator says another, and nobody tells them where they diverged. Q-Trace finds that exact gate, explains it from real simulator evidence, and hands them the repair."*

Open with this — or its condensed form — before touching the product. Judges decide in the first 20 seconds.

---

## THE PERSONAL-STAKE LINE

> *"Our own lab classes showed us: a student can pass a superposition quiz and still misunderstand what measurement does to an entangled state. That gap is not a content problem — it is a feedback problem. We built Q-Trace to close it."*

(Vinod delivers this in the opening 20 s. Real stake only — do not embellish.)

---

## PPT DECK OUTLINE

The following eight sections map one-to-one with the judge rubric and the SIH evaluation rhythm.
Each section is ≤2 slides. This outline feeds SHIP-5.

| § | Slide title | Key claim | Source/proof |
|---|---|---|---|
| 1 | **The Pain** | Students misunderstand superposition/entanglement even after instruction | https://doi.org/10.1103/physrevphyseducres.20.020108 |
| 2 | **The Gap** | Existing tools build but do not diagnose; generic chatbots explain but do not verify | Prior-art sweep (IDEA-BRIEF ban list items 1–15) |
| 3 | **Q-Trace Loop** | Assign → predict → build → simulate → inspect → diagnose → repair → track | PRD §2 Core Loop |
| 4 | **Flight Recorder — the wow** | First gate of conceptual divergence, identified deterministically from a simulator State Trace | PRD M10–M11, ARCHITECTURE §2 |
| 5 | **Architecture + Safety** | Next.js + FastAPI + Qiskit Aer + PennyLane; AST-only code parse, AI never invents quantum numbers | ARCHITECTURE §1, §5 |
| 6 | **Expected Impact** | Guided interactive simulation improved correct reasoning ~50 % → ~80 % on state-count questions | https://doi.org/10.1103/physrevphyseducres.20.020108 |
| 7 | **Safety, Privacy, Offline** | No production auth; no free-form Tutor text stored; full offline demo path (DEMO_LOCAL=1) | PRD M16, ARCHITECTURE §5 |
| 8 | **Roadmap** | Live Cirq/qBraid adapters · real QPU execution · Bhashini multilingual Tutor · IVR stub | PRD §5 NON-GOALS + v2 parking lot |

> **Synthetic data disclosure (mandatory):** Any cohort statistics in the Instructor Insight slide must
> carry the label *"Synthetic demo cohort — 40 seeded learner sessions."*
> Only Aarav's live attempt in the room is real.

---

## 90-SECOND DEMO SCRIPT

### Format key

```
BEAT n  [t=M:SS]   WHO: <driver>   SCREEN: <route or UI state>
CLICK:  <exact mouse/keyboard action>
SAY:    "<the line — ≤ 2 sentences, verbatim>"
FALLBACK: <if it hiccups: line + recovery action>
```

All beats are written against **seeded data** (demo profiles for Aarav, Meera, Dr. Rao) with
`DEMO_LOCAL=1`, `DEMO_FALLBACK=1`, `ENABLE_PENNYLANE=1`, `ENABLE_TUTOR_CLOUD=0`.

---

### OPEN [t=0:00–0:20]  WHO: Vinod (standing)   SCREEN: title slide / projection blank

SAY:
> *"Quantum computing education has a quiet failure mode: learners can reproduce a circuit and still carry a fundamental misconception — because nothing in their toolchain tells them where their mental model broke. Q-Trace fixes that. Watch what happens when a learner predicts wrong."*

*(Vinod nods to Venu. Venu clicks to the learner home screen.)*

---

### BEAT 1 [t=0:20]  WHO: Venu   SCREEN: /learn — Learner home, role switcher visible

BEAT TAG: **B1 — Seeded role entry (M1, M2, M16)**

CLICK: Click role badge → select **Aarav** (B.Tech CSE, beginner)
SAY:
> *"Aarav is a second-year student who has never studied quantum mechanics. A local-demo indicator confirms nothing here needs the internet."*

FALLBACK: If role switch fails — say *"The role is already seeded"* and navigate directly to `/learn/bell-state`.

---

### BEAT 2 [t=0:30]  WHO: Venu   SCREEN: /learn/bell-state — Prediction Checkpoint card

BEAT TAG: **B2 — Prediction Checkpoint (M3)**

CLICK: Click into the Prediction Checkpoint input; select *"Two independent random outputs — each qubit gives 0 or 1 independently"*; click **Record Prediction**.
SAY:
> *"Before running anything, Aarav records his prediction. He expects independent randomness — a very common misconception."*

FALLBACK: If checkpoint input is unresponsive, read the seeded prediction from the screen and say *"His prediction is already recorded — two independent random bits."* Continue to Beat 3.

---

### BEAT 3 [t=0:42]  WHO: Venu   SCREEN: /lab/bell-state — Circuit Workspace, empty grid

BEAT TAG: **B3 — Visual builder + code sync (M4, M5, M6)**

CLICK: Drag **H gate** onto qubit 0, column 1. Drag **CNOT** (control: q0, target: q1) onto column 2. Drag **Measure** onto both qubits in column 3.
SAY:
> *"Aarav places H and CNOT visually. The synchronized Qiskit code appears on the right — live, from the circuit model."*

FALLBACK: If drag-and-drop stalls, click **Load Seeded Bell Circuit** and say *"Let's load the seeded Bell circuit — same model, same result."*

---

### BEAT 4 [t=0:55]  WHO: Venu   SCREEN: Circuit Workspace — Run button highlighted

BEAT TAG: **B4 — Dual simulation (M7, M8)**

CLICK: Click **Run Simulation**.
SAY:
> *"One click runs the same circuit on Qiskit Aer and PennyLane. Both adapters return matching Bell-state probabilities — 50 % |00⟩, 50 % |11⟩."*

FALLBACK: If simulation hangs > 3 s, say *"While that computes — the circuit runs locally with Qiskit Aer; PennyLane conformance runs in parallel."* Wait 5 s more; if still hung, click **Load Seeded Result** from the fallback toolbar.

---

### BEAT 5 [t=1:07]  WHO: Venu   SCREEN: Visual Evidence panel — histogram + state amplitudes

BEAT TAG: **B5 — Visual Evidence (M9)**

*(Results appear automatically after Beat 4.)*
SAY:
> *"Visual Evidence shows circuit, state probabilities, and the measurement histogram. The interface labels what each representation means — no false classical metaphors."*

FALLBACK: If Evidence panel is blank, click **Show Evidence** toggle; if still blank, switch to the Seeded Evidence tab and continue.

---

### BEAT 6 ⭐ [t=1:18]  WHO: Venu   SCREEN: Flight Recorder panel — gate timeline

BEAT TAG: **B6 — Quantum Flight Recorder + Misconception Signal (M10, M11) ⭐ WOW MOMENT**

CLICK: Click **Open Flight Recorder**.
SAY:
> *"The Quantum Flight Recorder replays H — then CNOT — and finds the exact gate where Aarav's prediction of 'independent randomness' diverged from verified simulator behavior. Signal: SUPERPOSITION_VS_ENTANGLEMENT. The platform names the misconception, not just the wrong answer."*

*(Pause 2 s — let judges read the signal label.)*

FALLBACK: If Flight Recorder panel does not load, click **Seeded Replay** in the fallback toolbar. Say *"This is the seeded replay of the same trace — signal is identical."*

---

### BEAT 7 [t=1:35]  WHO: Venu   SCREEN: Tutor panel — explanation + Repair Challenge

BEAT TAG: **B7 — Evidence-bound Tutor + Repair Challenge (M12, M13)**

CLICK: Click **Explain with Tutor**.
SAY:
> *"The Tutor explains the divergence using the simulator State Trace — it cannot invent a probability. Then it issues one Repair Challenge: 'Measure only qubit 0. Predict what qubit 1 shows.' Aarav must fix it; he cannot skip straight to the answer."*

FALLBACK: If Tutor response is slow, say *"The Tutor is running locally — here is its explanation."* Click **Load Fallback Explanation**; the DEMO_FALLBACK response renders instantly.

---

### BEAT 8 [t=1:52]  WHO: Venu   SCREEN: Progress Record → brief cut to Instructor Insight (Dr. Rao view)

BEAT TAG: **B8 — Progress Record + Instructor Insight (M14, M15)**

CLICK: Aarav submits correct Repair answer → Progress Record updates (skill tick, attempt count). Then click **Switch to Dr. Rao** → Instructor Insight panel.
SAY:
> *"Aarav's progress updates in real time. A ten-second switch to Dr. Rao's view — Instructor Insight shows SUPERPOSITION_VS_ENTANGLEMENT as the cohort's most common gap. One live attempt; real signal."*

FALLBACK: If progress update is not visible, say *"Progress is persisted — refresh shows the updated record."* For Instructor Insight, load Seeded Dr. Rao View if the route fails.

---

### CLOSE [t=2:05–2:30]  WHO: Vinod (standing)   SCREEN: title slide or product logo

SAY:
> *"Build it. See it. Repair it. Q-Trace connects circuit construction, live simulation, and misconception repair in one learner loop — running right now on one laptop, no internet, no vendor dependency. The Flight Recorder finds where understanding broke; the Tutor explains from simulator evidence, never from a language model's imagination. That is a different category of tool."*

*(Yield to Q&A or next speaker.)*

---

## FALLBACK CUE (NETWORK / AI FAILURE)

If **any** live service fails during the demo:

> *"We designed for this — every beat has a seeded fallback. Let me reload from the local dataset."*

Then: click **Load Full Seeded Session** from the top-right fallback toolbar. The entire scripted journey
(Beats 1–8) replays from cached seeded data with `DEMO_FALLBACK=1`. Do not apologize; complete the beat; move on.

---

## SOURCED EVIDENCE LEDGER

Every number in the script and deck traces to one of the following:

| Claim | Source | URL |
|---|---|---|
| Correct reasoning on state-count questions improved ~50 % → ~80 % after guided interactive simulation | McKagan et al. (2010), Phys. Rev. Phys. Educ. Res. 20, 020108 | https://doi.org/10.1103/physrevphyseducres.20.020108 |
| Interactive visualizations can reinforce misconceptions if poorly chosen visual metaphors are used | Catalogues of quantum visualization pitfalls | https://doi.org/10.48550/arxiv.1410.0867 |
| Qiskit Aer supports statevector, density-matrix, and intermediate save instructions | Qiskit Aer official docs | https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html |
| PennyLane supports circuit inspection, state snapshots, and interactive debugging | PennyLane official docs | https://docs.pennylane.ai/en/stable/introduction/inspecting_circuits.html |
| NQM + AICTE quantum undergraduate mandate (platform mandate alignment — not a claim of PS authorship) | DST + AICTE announcement | https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum |
| National Quantum Mission overview | DST | https://dst.gov.in/national-quantum-mission-nqm |
| OpenQASM standardized circuit representation | OpenQASM spec | https://openqasm.com/ |

> **Synthetic data notice:** All cohort statistics visible in Instructor Insight are from 40 seeded synthetic
> learner sessions. Only Aarav's live attempt during the demo is real. State this if a judge asks.

---

## EIGHT REQUIRED DEMO BEATS — CHECKLIST

Used by `scripts/check_story_claims.py` to verify completeness.

- B1: Seeded role entry; local-demo indicator (M1, M2, M16)
- B2: Prediction Checkpoint; Aarav's wrong prediction recorded (M3)
- B3: Visual builder + synchronized code (M4, M5, M6)
- B4: Dual simulation (Qiskit Aer + PennyLane) (M7, M8)
- B5: Visual Evidence panel with labels (M9)
- B6: Quantum Flight Recorder + SUPERPOSITION_VS_ENTANGLEMENT signal (M10, M11) — WOW
- B7: Evidence-bound Tutor + Repair Challenge (M12, M13)
- B8: Progress Record update + Instructor Insight switch (M14, M15)
- FALLBACK: Explicitly scripted recovery line present

---

## JUDGE Q&A — PRE-ARMED ANSWERS (≤20 s each)

**"How is this different from IBM Composer plus a chatbot?"**
"Composer helps you build and run; we record your prediction beforehand, derive a gate-by-gate trace from deterministic simulators, and name the exact gate where your mental model diverged. The AI explains that specific mismatch — it cannot invent a probability or change a count."

**"What's real versus mocked?"**
"Simulation is live — Qiskit Aer runs on this laptop right now. Tutor explanations in this demo come from a cached fallback because we do not rely on venue internet; the fallback text is authored, not generated."

**"Where is student data stored? DPDP?"**
"No production authentication in the prototype. Demo profiles are synthetic seeds. Free-form Tutor text is never persisted. In production we would use local-first storage with explicit consent aligned to DPDP 2023 principles."

**"What does this cost a college per month?"**
"Local simulation is free — Qiskit Aer and PennyLane are open source. The only recurring cost is optional cloud Tutor inference. A college running locally pays nothing beyond hosting; we designed for low-connectivity, device-constrained environments."

**"Why not just use a real quantum computer?"**
"Real QPU jobs cost money, queue for hours, and introduce noise that confuses learners at the conceptual stage. Aer's statevector gives mathematically exact intermediate states — that is what the Flight Recorder needs. Real QPU remains a roadmap item once learners are past the conceptual phase."

**"What happens if the AI makes something up?"**
"It cannot change the numbers. The Tutor receives the Simulation Run payload as immutable evidence fields; every numerical claim must trace to that payload. The Misconception Signal comes from deterministic rule matching, never from LLM output."

**"Can this work on a 2G connection / rural college?"**
"Yes. Simulation runs locally; lessons, circuits and seeded accounts are pre-loaded; the Tutor fallback is a curated cached corpus. Nothing requires internet during the demo — this is our preferred venue path."

**"What is next after this prototype?"**
"Live Cirq and qBraid adapters, Bhashini-powered multilingual Tutor for regional language support, feature-phone IVR stub for accessibility, and a real QPU submission path once institutional partnerships exist."

---

## SUBMISSION CHECKLIST

*(Complete at T-2h before submission portal; portals crash at T-15m)*

- [ ] Title includes the retellable phrase: *"Q-Trace — Build it, See it, Repair it"*
- [ ] 3 screenshots or one hero GIF attached (circuit builder → Flight Recorder → Instructor Insight)
- [ ] 60–90 s backup video linked (record at SHIP-7; render and upload no later than T-3h)
- [ ] Spine paragraph present in submission body (≤100 words; opens with the spine sentence)
- [ ] 3 bullets of what is REAL (not aspirational) — Qiskit Aer, deterministic misconception rules, seeded demo data
- [ ] Architecture diagram image attached (export from ARCHITECTURE.md mermaid or a screenshot)
- [ ] Team roster + GitHub repo link included
- [ ] Mandate source named: DST NQM + AICTE announcement (not claiming authorship of the SIH PS)
- [ ] Synthetic data label present on Instructor Insight screenshot

---

*This document is owned by the story-ship track. Do not edit from other tracks.
Update version and date at every substantive change.*
