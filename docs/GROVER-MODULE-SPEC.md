# Grover's Search Algorithm Learning Module Specification

> **Status:** APPROVED PROPOSAL  
> **Route Hierarchy:** `/learn/oracle` ➔ `/learn/diffusion` ➔ `/learn/grover` (Hero Lab)  
> **Design Standard:** Linear Precision Quantum Instrument (`docs/DESIGN-SYSTEM.md`)  
> **Governing Law:** `.agents/rules/stack/quantum-ui.md` & `AGENTS.md`  

---

## 1. Executive Summary & Pedagogical Alignment

Just as Unit 1 and Unit 2 broke down entanglement into bite-sized, visual concept modules before the hero lab:
1. `/learn/superposition` ➔ Single-Qubit Hadamard Gate + **Interactive 3D Bloch Sphere**
2. `/learn/measurement` ➔ Wavefunction Collapse + **Interactive Born Rule Simulation**
3. `/learn/bell-state` ➔ **The 7-Step Hero Lab** (Prediction ➔ Workspace ➔ Histogram ➔ Flight Recorder ➔ Socratic Tutor ➔ Repair Challenge ➔ Progress Mastery)

Unit 3 (Grover's Search Algorithm) follows the exact same pedagogical blueprint:
1. **Module 3A (`/learn/oracle`):** The Phase Oracle & Toffoli Gate (CCX) + **Interactive CCX 3-Wire Gate Simulator & Phase Flip Mirror**
2. **Module 3B (`/learn/diffusion`):** Amplitude Amplification & Inversion About the Mean + **Interactive Mean Reflection Scrubber & 2D State Plane Rotation**
3. **Module 3C (`/learn/grover`):** **The 3-Qubit Grover Search Hero Lab** + **The 7-Step Evidence Loop** (Prediction Checkpoint ➔ 3-Qubit Circuit Workspace ➔ 8-Basis Statevector Histogram ➔ Quantum Flight Recorder with Amplitude Scrubber ➔ Evidence-Bound AI Tutor ➔ Oracle/Diffusion Repair Challenge ➔ Certified Progress Record)

---

## 2. Architecture & Route Organization

```
/learn (Curriculum Serpentine Map)
 │
 ├── Unit 1: THE QUANTUM COMPASS
 │    ├── /learn/superposition [Hadamard Gate + 3D Bloch Sphere]
 │    └── /learn/measurement   [Born Rule + State Collapse Simulation]
 │
 ├── Unit 2: ENTANGLEMENT & BELL STATES
 │    └── /learn/bell-state     [7-Beat Hero Lab: H + CNOT + Non-local Correlation]
 │
 └── Unit 3: GROVER'S SEARCH ALGORITHM
      │
      ├── [Stage 3.1 & 3.3 & 3.5] ➔ /learn/oracle
      │    • Concept: Phase marking without collapse & CCX multi-controlled logic
      │    • Visual 1: Interactive 3-Wire CCX Gate Simulator & Live Truth Table
      │    • Visual 2: Phase Inversion Mirror (Marks |101⟩ to -1/√8)
      │
      ├── [Stage 3.2 & 3.4 & 3.7] ➔ /learn/diffusion
      │    • Concept: Inversion about the mean (2|s⟩⟨s| - I) & O(√N) rotation
      │    • Visual 3: Geometric Reflection About Average Scrubber
      │    • Visual 4: 2D State Space Circle (Optimal 2 iterations vs Soufflé Over-rotation)
      │
      └── [Stage 3.6, 3.8 & 3.9] ➔ /learn/grover (The Capstone Hero Chamber)
           • The 7-Step Evidence Loop:
             1. Prediction Checkpoint (Optimal iterations & state outcomes)
             2. 3-Qubit Interactive Circuit Workspace (H^⊗3 + Oracle + Diffusion)
             3. 8-Basis Measurement Histogram (P(|101⟩) >= 94.5%)
             4. Quantum Flight Recorder with Grover Amplitude Scrubber
             5. Evidence-Bound Socratic AI Tutor Card (Phase kickback diagnostics)
             6. Grover Repair Challenge (Fix broken oracle or diffusion layer)
             7. Certified Progress Record & Coherence Shield Reward
```

---

## 3. Interactive Visual Widgets for Concepts

### 3.1 Visual Widget 1: Interactive CCX (Toffoli) Gate & Live Truth Table
*Embedded in `/learn/oracle` and the Right Stage Inspector for Stage 3.3/3.5.*

- **Controls:** 3 toggle switches for inputs $q_0, q_1, q_2 \in \{0, 1\}$.
- **Wire Diagram:** Shows input voltages, the two control nodes ($\bullet$), and the target inverter ($\oplus$).
- **Live Output:** Target $q_2$ flips if and only if $q_0 = 1$ AND $q_1 = 1$.
- **Truth Table Synchronization:** Highlights the matching row out of 8 possible states in real time.

```
+---------------------------------------------------------------------------------------+
|  CCX (TOFFOLI) INTERACTIVE GATE SIMULATOR                                             |
+---------------------------------------------------------------------------------------+
|  INPUT SWITCHES:           CIRCUIT WIRE TRACE:                  ACTIVE TRUTH ROW:     |
|                                                                                       |
|  q[0]: [  1  ] (ctrl 0) ---*------------------- q[0] = 1        | c1 | c0 | tgt | out |
|                            |                                    |----+----+-----+-----|
|  q[1]: [  1  ] (ctrl 1) ---*------------------- q[1] = 1        | 1  | 1  |  0  |  1  |
|                            |                                    | 1  | 1  |  1  | [0] | <--
|  q[2]: [  0  ] (target) ---+---[ (X) ]--------- q[2] = 1 (FLIP) | 1  | 0  |  0  |  0  |
|                                                                                       |
|  STATUS: Both controls ACTIVE (1, 1) -> Target inverted from |0> to |1>.              |
+---------------------------------------------------------------------------------------+
```

---

### 3.2 Visual Widget 2: Phase Inversion Mirror (Signed Amplitude Inspector)
*Embedded in `/learn/oracle` for Stage 3.1 & 3.6.*

- **Concept:** Demonstrates that the oracle changes the sign ($\alpha \to -\alpha$) of target $|101\rangle$ without altering its probability ($|\alpha|^2 = 1/8 = 12.5\%$).
- **Controls:** Button `[ Apply Oracle U_ω ]` / `[ Reset ]`. Target selector: `|101⟩` (default), `|011⟩`, `|110⟩`.
- **Bar Display:** 8 vertical amplitude bars with center zero-line. The marked bar flips downwards into the negative zone, and the dashed average line $\bar{\alpha}$ visibly drops from $+0.354$ to $+0.265$.

```
+---------------------------------------------------------------------------------------+
|  ORACLE PHASE INVERSION MIRROR (Target: |101>)                                        |
+---------------------------------------------------------------------------------------+
|  Amplitudes:                                                                          |
|  +0.354 |  [|000>] [|001>] [|010>] [|011>] [|100>]         [|110>] [|111>]           |
|         |    ||      ||      ||      ||      ||              ||      ||               |
|  ------ | - -||- - - || - - -||- - - || - - -|| - - - - - - -||- - - || - - - (Mean) |
|   0.000 | ===||======||======||======||======||==============||======||============== |
|         |                                            ||                               |
|  -0.354 |                                         [|101>]                             |
|                                                                                       |
|  [ Apply Phase Oracle U_ω ]      [ Reset ]                                            |
|  NOTE: Probabilities |α|² remain 12.5% each! The phase flip is invisible until       |
|  the diffusion operator reflects amplitudes about the mean line.                      |
+---------------------------------------------------------------------------------------+
```

---

### 3.3 Visual Widget 3: Inversion-About-the-Mean Geometric Scrubber
*Embedded in `/learn/diffusion` and Step 4 of `/learn/grover`.*

- **Concept:** Visualizes $U_s = 2|s\rangle\langle s| - I$. Each amplitude $\alpha_i$ transforms to $2\bar{\alpha} - \alpha_i$.
- **Interactive Scrubber:** 3-step slider:
  1. `Marked State Phase Inverted`: Target is negative, average line is lowered ($\bar{\alpha} = 0.265$).
  2. `Compute Delta to Mean`: Shows dashed vector arrows $\Delta_i = \bar{\alpha} - \alpha_i$.
  3. `Reflect Across Mean`: Marked state shoots upwards to $+0.729$; other 7 states drop to $+0.177$.

```
+---------------------------------------------------------------------------------------+
|  DIFFUSION: INVERSION ABOUT THE MEAN (Step 1 of Iteration 1)                          |
+---------------------------------------------------------------------------------------+
|  Amplitudes α:                                                                        |
|  +0.729 |                                         ▲ [|101>] (Amplified)               |
|         |                                         │                                   |
|  +0.265 | - - - - - - - - - - - - - - - - - - - - ┼ - - - - - - - - - - - (Mean ᾱ)    |
|  +0.177 |  [000] [001] [010] [011] [100]          │         [110] [111] (Suppressed)  |
|   0.000 | ===|=====|=====|=====|=====|============│===========|=====|==================== |
|         |                                         │ (Reflected 2ᾱ - α_marked)         |
|  -0.354 |                                         ▼ Initial inverted position         |
|                                                                                       |
|  [ << Prev Step ]    Step 2 of 3: Reflect Across Mean    [ Next Step >> ]             |
|  Formula: α' = 2(0.265) - (-0.354) = 0.530 + 0.354 = +0.729 (P = 53.1% on Iter 1!)   |
+---------------------------------------------------------------------------------------+
```

---

### 3.4 Visual Widget 4: 2D State Plane Rotation & Over-Rotation Guard
*Embedded in `/learn/diffusion` for Stage 3.4 & 3.7.*

- **Concept:** Grover's algorithm rotates the statevector in the 2D plane spanned by $|\omega^\perp\rangle$ (uniform sum of unmarked states) and $|\omega\rangle$ (marked state) by angle $2\theta$ per iteration ($\sin\theta = 1/\sqrt{8} \approx 0.354 \implies \theta \approx 20.7^\circ$).
- **Soufflé Analogy:** 2 iterations $\to 5\theta \approx 103.5^\circ \implies \sin^2(5\theta) = 94.5\%$. 3 iterations $\to 7\theta \approx 145^\circ \implies \sin^2(7\theta) = 33\%$ (over-rotation / soufflé collapsed).

```
+---------------------------------------------------------------------------------------+
|  2D HILBERT SPACE ROTATION (Grover Subspace)                                          |
+---------------------------------------------------------------------------------------+
|              |ω⟩ (Marked State |101>)                                                 |
|               ▲                                                                       |
|               │       Iteration 2 (k=2): P(|101>) ≈ 94.5% [OPTIMAL PEAK]              |
|               │     ↗                                                                 |
|               │   ↗   Iteration 1 (k=1): P(|101>) ≈ 53.1%                             |
|               │ ↗                                                                     |
|               │↗  Initial |s> (k=0): P(|101>) = 12.5%                                 |
|               ┼──────────────────────────────► |ω_perp⟩ (7 Unmarked States)           |
|                \                                                                      |
|                 ↘ Iteration 3 (k=3): P(|101>) ≈ 33.1% [OVER-ROTATION FALLACY]         |
|                                                                                       |
|  ITERATION SLIDER: [---(k=2)---] (Optimal: ⌊(π/4)√8⌋ = 2)                            |
|  PREDICTION STATUS: ✓ Optimal count reached. 3rd iteration decreases target fidelity. |
+---------------------------------------------------------------------------------------+
```

---

## 4. The Capstone Hero Chamber: `/learn/grover` (7-Step Evidence Loop)

The `/learn/grover` page implements the unified 7-step guided progression:

```
+---------------------------------------------------------------------------------------+
|  HEADER: [ADVANCED MODULE] · 12 MINS · ID: grover-search                              |
|  Grover's Search Algorithm: 3-Qubit Quantum Database Search                           |
+---------------------------------------------------------------------------------------+
|  STEPPER: [01: Predict] [02: Circuit] [03: Histogram] [04: Flight Recorder]          |
|           [05: AI Tutor] [06: Repair] [07: Mastery]                                   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  == STEP 01: PREDICTION CHECKPOINT ==                                                 |
|  • Directive: Test mental model on iteration count and amplitude amplification.       |
|  • ConceptBlocks: Phase oracle formula + Inversion about mean theorem.                |
|  • Question: "For N=8 states with marked state |101⟩, what happens after 2 iterations?"|
|    [ ] State collapses into random 50/50 mix                                          |
|    [*] State |101⟩ is amplified to ~94.5% probability (CORRECT)                       |
|    [ ] All 8 states cancel out to zero                                                |
|  • Starter Circuit Diagram preview (3 wires, 10 columns).                             |
|                                                                                       |
|  == STEP 02: 3-QUBIT CIRCUIT WORKSPACE & QISKIT AER ==                                |
|  • 3-Wire Grid: q[0], q[1], q[2] with classical bits c[0..2].                         |
|  • Gate Palette: H, X, CCX (Toffoli), MEASURE.                                        |
|  • Actions: [ Run Simulation (1024 shots) ]   [ Load Grover Template ]  [ Reset ]     |
|  • Synchronized Python Code Viewer with live Qiskit Aer compilation.                  |
|                                                                                       |
|  == STEP 03: VISUAL EVIDENCE (8-BASIS PROBABILITY HISTOGRAM) ==                       |
|  • 8 Columns: |000⟩ through |111⟩.                                                    |
|  • Highlighted Column: |101⟩ in bright emerald (>90% probability).                    |
|  • Unmarked Columns: |000⟩, |001⟩, etc. (<2% probability each).                       |
|                                                                                       |
|  == STEP 04: QUANTUM FLIGHT RECORDER & GROVER AMPLITUDE SCRUBBER ==                   |
|  • Gate-by-gate state trace replay (Columns 0 to 9).                                 |
|  • Embedded GroverAmplitudeScrubber:                                                  |
|    - Step 0: Equal Superposition (all +0.354)                                         |
|    - Step 1: Oracle 1 (marked -0.354)                                                 |
|    - Step 2: Diffusion 1 (marked +0.729, unmarked +0.177)                             |
|    - Step 3: Oracle 2 (marked -0.729)                                                 |
|    - Step 4: Diffusion 2 (marked +0.972, P = 94.5%)                                   |
|                                                                                       |
|  == STEP 05: EVIDENCE-BOUND SOCRATIC AI TUTOR ==                                      |
|  • Grounded in exact gate-by-gate trace.                                              |
|  • Adapts to persona (CSE Beginner vs Physics-to-Code).                               |
|  • Explains why measurement was NEVER performed until amplitude reached peak.         |
|                                                                                       |
|  == STEP 06: QUANTUM REPAIR CHALLENGE ==                                              |
|  • Challenge A (Target Mutation): Oracle is configured for |111⟩. Modify X gates to   |
|    target |101⟩.                                                                     |
|  • Challenge B (Diffusion Repair): Toffoli control polarity was omitted. Repair the  |
|    diffusion sandwich to restore constructive interference.                           |
|  • In-situ live simulator verifies fix with "Run & Submit".                           |
|                                                                                       |
|  == STEP 07: PROGRESS MASTERY & COHERENCE CERTIFICATION ==                            |
|  • Award: "Master of Quantum Search" Badge.                                           |
|  • XP / Coherence: +150 Coherence Points, +50 Shield.                                 |
|  • Updates cohort dashboard & returns learner to `/learn` path.                      |
+---------------------------------------------------------------------------------------+
```

---

## 5. Serpentine Roadmap Navigation & "ENTER CHAMBER" Behavior

### 5.1 The Root Cause of User Confusion
Previously:
- In Unit 1, `/learn/superposition` and `/learn/measurement` had routes defined.
- In Unit 2, `bell-state` had route `/learn/bell-state`.
- In Unit 3 (Grover), the stages had **no route defined** in `module2-unit-2-1.ts`, causing `RightStageInspector` to treat them as in-situ reading concepts that just turned green (`✓ CONCEPT GROUNDED`), or gate labs that routed to the generic `/lab?preset=grover` sandbox.

### 5.2 The Unified Fix
Every stage in Unit 3 now maps directly to its corresponding learning chamber:

| Stage ID | Stage Title | Archetype | Target Route | Chamber Purpose |
|---|---|---|---|---|
| `mod2_grover_oracle_concept` | The Oracle: Phase Marking | `NODE_CONCEPT` | `/learn/oracle` | Theory + Phase Inversion Mirror |
| `mod2_amplitude_amplification` | Amplitude Amplification | `NODE_CONCEPT` | `/learn/diffusion` | Theory + Mean Reflection Scrubber |
| `mod2_toffoli_ccx` | The Toffoli Gate (CCX) | `NODE_CONCEPT` | `/learn/oracle#ccx` | Interactive 3-Wire Gate + Truth Table |
| `mod2_grover_speedup` | Grover Speedup & Rotation | `NODE_CONCEPT` | `/learn/diffusion#rotation` | 2D State Vector Rotation |
| `mod2_ccx_lab` | CCX Gate Lab | `NODE_GATE_LAB` | `/learn/oracle#lab` | Build & test CCX in-situ |
| `mod2_phase_oracle_lab` | Phase Oracle Lab | `NODE_GATE_LAB` | `/learn/oracle#phase-lab` | Build phase flip on |101⟩ |
| `pc_grover_iterations` | Optimal Iterations Prediction | `NODE_PREDICTION` | `/learn/diffusion#iterations` | Over-rotation test |
| `mod2_full_grover_lab` | Full 3-Qubit Grover Circuit Lab | `NODE_GATE_LAB` | `/learn/grover` | Hero Lab Steps 1-4 |
| `mod2_boss_grover` | Grover Boss: Secret State | `NODE_MILESTONE` | `/learn/grover#boss` | Hero Lab Steps 5-7 (Repair Challenge) |

When the user clicks **"ENTER CHAMBER"** on any of these nodes in the right inspector, the router will smoothly navigate them to the dedicated interactive module with back/forward breadcrumb navigation.
