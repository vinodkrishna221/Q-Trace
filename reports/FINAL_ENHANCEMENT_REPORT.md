# Q-Trace Frontend Test Report — Final Enhancement Summary

> **Synthesized from:** AARAV (Beginner Learner) · MEERA (Intermediate Learner) · DR. RAO (Instructor)  
> **Target:** [https://q-trace-web.vercel.app/](https://q-trace-web.vercel.app/)  
> **Test Date:** September 9–10, 2026  
> **Report Status:** Cross-Persona Synthesis · Final

---

## Site Overview

Q-Trace is a browser-based quantum computing learning platform that teaches the Bell State experiment through a structured, evidence-grounded pedagogy loop: **Predict → Simulate → Diagnose → Repair.** Learners select a persona (Aarav the CSE undergraduate, Meera the physics graduate, or Dr. Rao the course instructor), then advance through a 7-step module that takes them from forming a hypothesis about quantum measurement outcomes, through a live Qiskit Aer simulation (dual-verified with PennyLane), to a gate-by-gate Flight Recorder that identifies the exact conceptual divergence point. The platform features a bi-directional visual circuit builder synchronized with real, editable Qiskit 2.x Python code, a partial-trace-accurate Bloch subsystem visualizer, an evidence-bound AI tutor, and a Repair Challenge with deterministic unit-test grading. An Instructor Dashboard at `/instructor` surfaces aggregate cohort misconception telemetry without exposing individual student data. Three personas — a beginner CSE student, an intermediate physics undergraduate, and a senior faculty member — were tested end-to-end across all eight beats of the Bell State module, with 33 screenshots collected across all sessions.

---

## Screenshot Inventory

> All screenshots are located in [`d:\Q-Trace\reports\images\`](file:///d:/Q-Trace/reports/images)

### Aarav (Beginner — Beat-by-Beat)

| # | Filename | Description |
|---|---|---|
| A1 | [`beat1_landing_role_selection.png`](./images/beat1_landing_role_selection.png) | Dark-mode landing page with all three persona badges (`Aarav`, `Meera`, `Dr. Rao`), value proposition headline, and local verification badges. |
| A2 | [`beat2_module_catalogue.png`](./images/beat2_module_catalogue.png) | Foundations track learning catalogue showing Module 1, Module 2, and the glowing "Hero Lab" card for the Bell State (Step 3). |
| A3 | [`beat3_prediction_checkpoint.png`](./images/beat3_prediction_checkpoint.png) | Prediction Checkpoint with four multiple-choice options; Aarav's `INDEPENDENT_RANDOM` selection locked with a green "Prediction Locked" badge. |
| A4 | [`beat4_circuit_workspace.png`](./images/beat4_circuit_workspace.png) | 2-qubit visual gate grid (H → CNOT → MEASURE) with bi-directionally synchronized Qiskit Python code panel on the right. |
| A5 | [`beat5_run_simulation.png`](./images/beat5_run_simulation.png) | Simulation dispatch result: `SUCCEEDED (QISKIT_AER)` · 1024 shots · 49 ms latency. |
| A6 | [`beat6_visual_evidence.png`](./images/beat6_visual_evidence.png) | Visual evidence panel: probability bars (50% \|00⟩, 50% \|11⟩, 0% \|01⟩ / \|10⟩), 1024-shot histogram, and Bloch subsystem spheres. |
| A7 | [`beat7_quantum_flight_recorder.png`](./images/beat7_quantum_flight_recorder.png) | Quantum Flight Recorder: `SUPERPOSITION_VS_ENTANGLEMENT` misconception flagged at Step 1 (CNOT), gate-by-gate trace with divergence callout. |
| A8 | [`beat8_repair_challenge.png`](./images/beat8_repair_challenge.png) | Repair Challenge result (100/100) and Tutor explanation; Progress card updated to 150 pts with `skill_create_bell: MASTERED`. |

### Meera (Intermediate — Additional Screenshots)

| # | Filename | Description |
|---|---|---|
| M1 | [`beat1_landing_default.png`](./images/beat1_landing_default.png) | Landing page in default Aarav state before Meera's role switch — shows the beginner-oriented hero copy. |
| M2 | [`beat1_meera_selected.png`](./images/beat1_meera_selected.png) | Landing page after switching role to `Meera (Phys)` — same CTAs unchanged, no adaptive hero routing. |
| M3 | [`beat2_learn_catalogue.png`](./images/beat2_learn_catalogue.png) | Meera's learning catalogue: prerequisite modules marked `THEORY CREDITED`, Bell State highlighted as `HERO LAB · FAST-TRACK FOCUS`. |
| M4 | [`beat2_bell_state_module.png`](./images/beat2_bell_state_module.png) | Bell State module header with Meera's prior-knowledge badges: `[✓ Python] [✓ Linear Algebra] [✓ Quantum Theory] [✗ Qiskit Circuits]`. |
| M5 | [`beat4_qiskit_code_panel.png`](./images/beat4_qiskit_code_panel.png) | Qiskit code panel showing idiomatic 2.x syntax; no "code-first" layout toggle visible. |
| M6 | [`beat4_code_parse_error.png`](./images/beat4_code_parse_error.png) | Red parse-error banner triggered by entering `qc.rz(0.5, 0)` — "Gate RZ is outside the prototype subset." |
| M7 | [`beat4_code_sync_success.png`](./images/beat4_code_sync_success.png) | Green success banner after syncing a supported gate (`qc.x(1)`) — "Code successfully parsed and synchronized." |
| M8 | [`beat5_dual_simulation_results.png`](./images/beat5_dual_simulation_results.png) | Dual simulation panel: Qiskit Aer result (84 ms · exact probabilities) with PennyLane as a passive conformance badge only. |
| M9 | [`beat6_bloch_subsystem_view.png`](./images/beat6_bloch_subsystem_view.png) | Bloch Subsystem View: mixed state with Bloch vector at origin (r = 0.000), purity Tr(ρ²) = 0.5, and caveat disclaimer. |
| M10 | [`beat7_flight_recorder_cnot.png`](./images/beat7_flight_recorder_cnot.png) | Flight Recorder at Step 1 (CNOT) — erroneously shows red ✕ on Meera's correct `CORRELATED_00_11` prediction. |
| M11 | [`beat7_flight_recorder_hadamard.png`](./images/beat7_flight_recorder_hadamard.png) | Flight Recorder at Step 0 (H gate) — shows basis state probabilities (00: 50%, 10: 50%) without Dirac statevector notation. |
| M12 | [`beat8_tutor_card.png`](./images/beat8_tutor_card.png) | Tutor explanation card with pop-science phrasing ("made qubit 0 uncertain") and grounded numerical evidence ledger. |
| M13 | [`beat8_progress_record.png`](./images/beat8_progress_record.png) | Meera's progress card showing correct name "Meera" but bug: `ID: progress_lp_aarav` in the header. |
| M14 | [`circuit_lab_page.png`](./images/circuit_lab_page.png) | The standalone `/lab` circuit page — direct sandbox access without prediction gates or introductory prose. |

### Dr. Rao (Instructor — Additional Screenshots)

| # | Filename | Description |
|---|---|---|
| R1 | [`beat1_landing.png`](./images/beat1_landing.png) | Landing page before Dr. Rao's role selection — default Aarav view. |
| R2 | [`beat1_role_selected.png`](./images/beat1_role_selected.png) | Dr. Rao role selected; description banner updated, but no automatic redirect to `/instructor`. |
| R3 | [`beat1_full_dashboard.png`](./images/beat1_full_dashboard.png) | Full instructor dashboard view — dark telemetry aesthetic with metric cards and SVG charts. |
| R4 | [`beat2_metric_cards.png`](./images/beat2_metric_cards.png) | Instructor metric cards — Module Completion and Challenge Pass Rate cards are visually empty (API returns `[]`). |
| R5 | [`beat2_visual_chart.png`](./images/beat2_visual_chart.png) | SVG cohort analytics chart showing 0% Module Progress Rate and 0% Repair Pass Rate (N/A). |
| R6 | [`beat2_table_fallback.png`](./images/beat2_table_fallback.png) | Table fallback displaying hardcoded `30 assigned` / `24 attempts` — contradicts the `2 students` header badge. |
| R7 | [`beat5_live_learner_disclosure.png`](./images/beat5_live_learner_disclosure.png) | Live demo learner banner: `lp_aarav — latest repair attempt: not yet passed` blended into cohort statistics. |
| R8 | [`beat6_instructor_on_learn.png`](./images/beat6_instructor_on_learn.png) | Dr. Rao on `/learn/bell-state` — treated as a student: presented with prediction radio buttons instead of an instructor overlay. |

---

## Cross-Persona Friction Heatmap

> **Scoring key:** 1 = zero friction (delightful) · 5 = blocking/broken · Priority = HIGH if avg ≥ 3, MEDIUM if avg 2–2.9, LOW if avg < 2

| Feature | Aarav Score | Meera Score | Dr. Rao Score | Avg | Priority |
|---|:---:|:---:|:---:|:---:|:---:|
| **Role Selection** | 1 | 2 | 2 | 1.7 | 🟡 MEDIUM |
| **Learning Path** | 2 | 3 | — | 2.5 | 🟡 MEDIUM |
| **Prediction Checkpoint** | 2 | 1 | — | 1.5 | 🟢 LOW |
| **Circuit Workspace** | 2 | 3 | — | 2.5 | 🟡 MEDIUM |
| **Run Simulation** | 1 | 3 | — | 2.0 | 🟡 MEDIUM |
| **Visual Evidence** | 3 | 1 | — | 2.0 | 🟡 MEDIUM |
| **Flight Recorder ⭐** | 2 | 4 | — | 3.0 | 🔴 HIGH |
| **Tutor + Repair** | 1 | 3 | — | 2.0 | 🟡 MEDIUM |
| **Instructor Dashboard** | — | — | 4 | 4.0 | 🔴 HIGH |

> Notes: Dr. Rao's B2 (Data Quality) and B6 (Instructor Controls) scored 4/5 and 5/5 respectively, pulling the overall Instructor Dashboard score to 4.0. Flight Recorder's 4/5 from Meera (critical bug) anchors it as the single highest-risk learner-facing failure.

---

## Top 10 Enhancement Recommendations (Ordered by Impact)

---

**#1 — Flight Recorder — Meera (Intermediate Learner)**
- 🔴 **Problem:** When a student selects the *correct* prediction (`CORRELATED_00_11`), the Flight Recorder renders a red ✕ on their answer, attaches the wrong misconception label (`SUPERPOSITION_VS_ENTANGLEMENT` with the description for `INDEPENDENT_RANDOM`), and marks Step 0 as a spurious divergence. This is the most severe correctness bug in the platform.
- 💡 **Fix:** In the diagnose service and `flight-recorder-view.tsx`, guard with: `if (prediction === verifiedBehavior) → render green "✓ Hypothesis Confirmed — No Misconception Detected"` state and suppress all divergence badges. Only trigger the misconception engine when prediction ≠ verified outcome.
- 📈 **First-time user impact:** Currently, a capable physics student who understands Bell states is told they're wrong. This destroys trust in the platform's credibility.
- ⏱ **Estimated effort:** Small (logic guard in the diagnosis hook + one conditional render branch)

---

**#2 — Instructor Dashboard — Dr. Rao (Instructor)**
- 🔴 **Problem:** The Instructor Controls page (`/instructor`) has **zero assignment functionality**: no module assignment, no cohort roster, no deadline setting, no section filter. Visiting `/learn/bell-state` as Dr. Rao presents a student quiz — prediction radio buttons and all — with no instructor overlay.
- 💡 **Fix:** Add role-aware route guards: `if (activeRole.roleType === 'INSTRUCTOR')` render an **Instructor Overlay** on `/learn/[slug]` that shows cohort answer distributions per checkpoint, the verified reference circuit, and a disabled (non-mandatory) prediction gate. Add a basic "Assign Module" flow with batch + due-date fields on `/instructor`.
- 📈 **First-time user impact:** A department head evaluating the tool will abandon it immediately if they can't manage a class. This is the biggest barrier to institutional adoption.
- ⏱ **Estimated effort:** Large (new instructor overlay component, role guard HOC, assignment mutation + API)

---

**#3 — Empty State & Data Integrity — Dr. Rao (Instructor)**
- 🔴 **Problem:** When the live API returns `moduleCompletion: []` and `challengePassRate: []`, the Instructor Dashboard metric cards render as completely blank panels — no empty state illustration, no CTA. Simultaneously, the table fallback uses hardcoded `|| 30` and `|| 24` placeholders that flatly contradict the `2 students` header badge, destroying statistical credibility with STEM faculty.
- 💡 **Fix:** (a) Add graceful empty state UI to each card: *"No modules assigned yet — click 'Assign Module' to get started."* (b) Replace hardcoded fallback values with `insight.learnerCount` from the live API: `bellCompletion?.assigned ?? insight.learnerCount`. (c) Move the synthetic data disclaimer from 10px footer text to a prominent amber banner in the header.
- 📈 **First-time user impact:** Faculty see a blank UI and conflicting numbers within 15 seconds of opening the dashboard — an immediate trust-breaker.
- ⏱ **Estimated effort:** Small (conditional render + replace two hardcoded constants)

---

**#4 — Adaptive Pedagogical Tone — Meera (Intermediate Learner)**
- 🔴 **Problem:** The AI Tutor generates identical pop-science explanations regardless of learner profile: *"made qubit 0 uncertain"* (Hadamard creates coherent superposition, not classical uncertainty); *"tied qubit 1 to that branch"* (CNOT performs a coherent unitary, not a stochastic branch-tying). The Bell State module's Core Concepts block shows beginner prose even after Meera's `THEORY CREDITED` badges are displayed.
- 💡 **Fix:** Condition the tutor system prompt on `learnerProfile.role`: for `PHYSICS_TO_CODE`, use formal Hilbert-space notation ($|ψ₀⟩ \xrightarrow{H₀} \frac{|0⟩+|1⟩}{\sqrt{2}}|0⟩ \xrightarrow{CX_{01}} |Φ⁺⟩$); for `BEGINNER_CSE`, retain the operational branch metaphor. Apply the same profile flag to collapse/hide the beginner Core Concepts block for credited-theory users.
- 📈 **First-time user impact:** A physics student who has solved Bell-CHSH inequalities reads "qubit 0 uncertain" and loses confidence in the platform's rigor.
- ⏱ **Estimated effort:** Medium (prompt conditioning in tutor service + collapsible content block in module page)

---

**#5 — Persistent Role Storage — Dr. Rao (Instructor)**
- 🔴 **Problem:** Zustand role state is not backed by `localStorage` or a session cookie. Every page reload or direct URL visit resets the role to Aarav. An instructor navigating between `/instructor` and `/learn/bell-state` loses their role context.
- 💡 **Fix:** Add `zustand/middleware`'s `persist` middleware to `role-store.ts` with `localStorage` as the storage adapter. Scope the key to `q-trace-role` to avoid collisions.
- 📈 **First-time user impact:** Any instructor who bookmarks `/instructor` or refreshes their browser is immediately treated as a freshman learner — an embarrassing first impression.
- ⏱ **Estimated effort:** Small (one middleware wrapper in the store file)

---

**#6 — Bloch Sphere Tooltip for Beginners — Aarav (Beginner Learner)**
- 🔴 **Problem:** When the Bell state is active, the Bloch sphere card shows `r = 0.000` and `Tr(ρ²) = 0.500` with no plain-English explanation. A beginner assumes the simulator crashed or the qubit was destroyed.
- 💡 **Fix:** Add a contextual tooltip or inline callout on the `MIXED_SUBSYSTEM` badge: *"Why is the arrow at the center? Because this qubit is entangled with its partner — you can't describe its state alone. Looking at one entangled qubit is like reading one half of a torn lottery ticket."* Reserve the density-matrix math (`Tr(ρ²)`) for an expandable "Show math" disclosure.
- 📈 **First-time user impact:** The histogram's zero bars for |01⟩/|10⟩ already deliver the eureka moment — the Bloch sphere should reinforce it, not confuse the learner with graduate-level notation.
- ⏱ **Estimated effort:** Small (tooltip component + copy change)

---

**#7 — PennyLane Code Comparison View — Meera (Intermediate Learner)**
- 🔴 **Problem:** PennyLane appears only as a passive unit-test badge (`PENNYLANE Conformance: PASS (Δ = 0)`). There is no way to see the PennyLane QNode equivalent, the functional pipeline syntax (`@qml.qnode(dev)`), or a side-by-side SDK comparison. This is Meera's primary stated motivation for using the platform.
- 💡 **Fix:** Add a framework toggle tab in the code editor: `[Qiskit 2.3] | [PennyLane 0.38]`. The PennyLane tab renders the auto-generated equivalent:
  ```python
  import pennylane as qml
  dev = qml.device("default.qubit", wires=2)
  @qml.qnode(dev)
  def circuit():
      qml.Hadamard(wires=0)
      qml.CNOT(wires=[0, 1])
      return qml.probs(wires=[0, 1])
  ```
- 📈 **First-time user impact:** Directly addresses the core persona need. A developer choosing between SDKs for a research project gets concrete comparative evidence.
- ⏱ **Estimated effort:** Medium (generated PennyLane AST from circuit model + tab UI in code panel)

---

**#8 — Code-First Layout Toggle & Parameterized Gates — Meera (Intermediate Learner)**
- 🔴 **Problem:** The visual gate palette always occupies the top half of the workspace; there is no layout toggle for code-first view. Standard rotation gates (`Rz(θ)`, `Rx(θ)`) are rejected by the AST parser with a red error banner, making Bloch sphere trajectory exploration impossible.
- 💡 **Fix:** Add a three-way layout control in the workspace header: `[Visual | Split | Code-First]`. Extend the `circuit-parser.ts` gate allowlist to include parameterized single-qubit rotations (`qc.rx(theta, q)`, `qc.rz(theta, q)`) and update the visual grid to render them as parameter-labeled gate cells.
- 📈 **First-time user impact:** Intermediate and advanced users who think in code rather than drag-drop are currently second-class citizens in their own workspace.
- ⏱ **Estimated effort:** Medium (layout toggle CSS + parser extension for parameterized gates)

---

**#9 — Misconception Remediation Prompts — Dr. Rao (Instructor)**
- 🔴 **Problem:** The Top Misconceptions card displays `SUPERPOSITION_VS_ENTANGLEMENT · 1 learner · 2 detections` but provides zero instructional advice. The subtitle promises *"evidence for what to re-teach next"* — a promise that is currently unfulfilled.
- 💡 **Fix:** Map each misconception code to a concrete pedagogical intervention block:
  > **Faculty Action:** 50% of cohort confused CNOT entanglement with independent probability. Revisit the CNOT state mapping $|+0⟩ → \frac{|00⟩+|11⟩}{\sqrt{2}}$ before Lab 2. Suggested activity: Ask students to manually compute tensor product vs. entangled product state (10 min).
  
  Hardcode the mapping for the MVP prototype misconception set, with a JSON config for extensibility.
- 📈 **First-time user impact:** Transforms the dashboard from a passive telemetry mirror into an actionable instructional tool — the stated product vision.
- ⏱ **Estimated effort:** Small (static misconception-to-advice map + render block in instructor page)

---

**#10 — Jargon Tooltips for Ket Notation & "Support" — Aarav (Beginner Learner)**
- 🔴 **Problem:** Five terms appear without inline explanation for beginners: `Tr(ρ²)`, `Mixed Subsystem / Tracing Out`, `Support` (probability support), `Ideal State`, and ket notation (`|00⟩`, `|11⟩`) on histogram axes.
- 💡 **Fix:** Add hover tooltips to each term on first occurrence: e.g., `|00⟩` → *"Both qubit 0 and qubit 1 measured as 0."* · `Support` → *"The set of outcomes with non-zero probability."* · `Ideal State` → *"The mathematical, noise-free simulation — not physical hardware."* Use a `GlossaryTooltip` component that can be reused across the module.
- 📈 **First-time user impact:** Aarav's 5 jargon violations are the primary friction source in an otherwise near-perfect beginner experience. Fixing them lifts the score from 9.5 to a true 10.
- ⏱ **Estimated effort:** Small (tooltip component + glossary JSON, applied to 5 terms)

---

## First-Time Learner Onboarding Scorecard

| Dimension | Score | Notes |
|---|:---:|---|
| **Clarity of purpose (5-second test)** | 9/10 | *"Learn quantum computing from verified evidence — not guesswork"* paired with the `Predict → Simulate → Diagnose → Repair` pipeline is immediately legible. Minus 1 for the `SIH 2026 PROTOTYPE` badge that may read as unfinished to first-timers. |
| **Jargon accessibility** | 7/10 | The histogram and prediction checkpoint are admirably plain. However, 5 terms (`Tr(ρ²)`, `Mixed Subsystem`, `Support`, `Ideal State`, ket notation) appear without any inline explanation, all concentrated in the Visual Evidence and Flight Recorder steps. |
| **Visual feedback quality** | 9/10 | The 1024-shot histogram, dual-backend badges, and gate-level divergence trace are best-in-class. Minor deduction for the collapsed Bloch vector being unlabeled for beginners and the empty instructor metric cards. |
| **Error recovery / fallback visibility** | 6/10 | Supported-gate parse errors are clear and non-destructive. However, the Flight Recorder shows a false ✕ for correct predictions (critical), instructor metric cards fail silently with blank panels, and the table fallback contradicts live data — three distinct error-state failures. |
| **Instructor credibility** | 5/10 | The dark telemetry aesthetic is serious and professional. But hardcoded placeholder data that contradicts live counts, a `progress_lp_aarav` ID on Meera's card, and zero assignment controls would cause institutional rejection before a pilot is approved. |
| **OVERALL** | **7.2/10** | An exceptional learning engine with class-leading physics fidelity, undermined by one critical correctness bug (false divergence on correct predictions), a read-only instructor console, and silent data failures. Fix those three and the platform scores 9+. |

---

## The One Change That Would Help the Most

> **Fix the Flight Recorder's false-positive bug before any other work.**

When a student who *correctly understands Bell entanglement* selects `CORRELATED_00_11`, the platform marks their answer with a red ✕ and tells them they have the `SUPERPOSITION_VS_ENTANGLEMENT` misconception. This is not a UX polish issue — it is a **factual error** that silently teaches the right student that they are wrong.

Every other friction point in this report is additive polish: better tooltips, more layout options, deeper PennyLane integration. This bug is subtractive — it actively damages the thing the platform does best. The fix is a two-line logic guard: `if (prediction === verifiedBehavior) { showSuccess(); return; }`. It takes less than an hour to implement and its impact is felt by every learner who already understands the material — exactly the students a platform should be rewarding, not penalizing.

Fix this first. Then proceed with empty-state handling (#3), role persistence (#5), and the instructor overlay (#2). In that order.
