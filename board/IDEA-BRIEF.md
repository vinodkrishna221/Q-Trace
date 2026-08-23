# Idea Brief — SIH Quantum Learning Platform

> Output of /ideate. Feeds /kickoff. Project name remains provisional until PRD sign-off.

## The pick

**One-line pitch:** Learn quantum algorithms by building, simulating, seeing, and repairing them—not by memorizing their final output.

**Product shape:** A web-based learning platform with structured modules, synchronized visual and code circuit construction, live simulation, quantum-state visualization, an evidence-bound AI tutor, assessments, progress tracking, and instructor analytics.

**Unfair advantage:** Most teams will assemble a course portal, circuit builder, simulator, and generic chatbot. This platform connects those expected features through a misconception-repair loop: the learner predicts a result, runs the circuit, and the Quantum Flight Recorder finds the first gate where the learner’s mental model diverged from verified simulator behavior.

**Wow moment:** Quantum Flight Recorder — a learner predicts that a Bell circuit produces independent random bits; the platform replays H and CNOT gate by gate, exposes the transition from superposition to entangled correlation, identifies the misconception, and issues a repair challenge. Demoable in the walking skeleton.

**Mandate hook:** The platform supports the National Quantum Mission and AICTE goal of combining quantum theory with hands-on lab experience to build a quantum-ready workforce. This is mandate alignment, not a claim that DST or AICTE authored the SIH problem statement. Sources: https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum and https://dst.gov.in/national-quantum-mission-nqm

**Deployability battery:** rails ✓ browser/PWA on existing college devices · operator instructor or lab coordinator · zero-training ✓ guided first Bell-state lab begins in under two minutes · cold-start ✓ seeded lessons, circuits, challenges, and misconception rules provide day-one value · unit cost prototype local simulation avoids paid QPU execution; production hosting and optional Tutor inference cost remain **TBD pending blueprint deployment and model selection** · zero-bars cached lessons, local simulator, saved circuits, and deterministic tutor fallbacks remain usable without venue internet.

## Rubric verdict (Oracle)

Official internal-round criteria were not provided. Weights below are ASSUMED.

| Criterion | Weight | Score | Evidence |
|---|---:|---:|---|
| Innovation | 25% | 9.2/10 | Misconception localization and simulator-grounded repair differentiate the platform from feature-bundle competitors. |
| Technical | 25% | 8.7/10 | Qiskit Aer statevectors and PennyLane snapshots make gate-level traces feasible; OpenQASM can provide the canonical circuit representation. |
| Impact/fit | 25% | 9.2/10 | Directly covers learning, construction, simulation, visualization, tutoring, assessment, progress, and instructor requirements while aligning with national capacity-building goals. |
| Presentation | 25% | 9.5/10 | One coherent 90-second journey moves from lesson to prediction, visual/code construction, two simulators, state replay, misconception repair, assessment, and dashboard update. |

Weighted: **9.15/10**

**Killer judge question:** “Is this merely IBM Composer plus a chatbot?”

**Answer:** No. Composer helps users construct and run circuits; our core learning loop records the learner’s prediction, derives a gate-by-gate trace from deterministic simulators, locates the first conceptual divergence, and converts it into a targeted repair challenge and instructor-visible misconception signal. The AI explains simulator evidence; it does not invent quantum results.

## Approved prototype coverage

1. Three structured modules: qubits and superposition, entanglement, and Bell-state construction.
2. Drag-and-drop circuit builder with a constrained gate library.
3. Synchronized Qiskit code view/editor for the supported circuit subset.
4. Two genuine simulator adapters: Qiskit Aer and PennyLane default.qubit.
5. OpenQASM-based canonical circuit representation and export; Cirq and qBraid remain roadmap unless time permits.
6. Bloch sphere where physically valid, statevector/probability view, and measurement histogram.
7. Evidence-bound AI tutor for explanation, supported-code debugging, and simple circuit optimization guidance.
8. One concept quiz and one circuit-building challenge.
9. Learner progress, attempts, challenge status, and misconception history.
10. Instructor dashboard for cohort progress, difficult concepts, and common misconception categories.
11. Save/share or OpenQASM export as the prototype collaboration surface; real-time multi-user editing is not P0.
12. Quantum Flight Recorder as the innovative feature connecting the entire journey.

## The gauntlet record

**BAN LIST (what the field will build):**
1. Generic AI quantum chatbot
2. Video/course catalogue
3. Drag-and-drop circuit builder
4. Bloch-sphere visualizer
5. Qiskit editor with a Run button
6. Badges and leaderboard
7. Generic personalized learning path
8. Multi-SDK playground with shallow adapters
9. Algorithm template library
10. Static instructor dashboard
11. Natural-language-to-Qiskit generator
12. Generic code-error explainer
13. Real-hardware integration as the main novelty
14. Collaborative notebook
15. “All-in-one quantum education ecosystem” without a differentiated learning mechanism

**Runners-up:**
- Socratic Counterexample Engine — the learner states a belief and receives the smallest executable circuit that proves or disproves it; lost because free-form claim interpretation adds reliability risk for the internal sprint.
- Quantum Test-Driven Lab — circuits pass conceptual invariants such as entanglement and correction behavior; lost because its judge-facing story is less immediate than a gate-by-gate Flight Recorder, but it remains a strong SHOULD feature.

**Ground truth — PAIN:** Research documents persistent student confusion around bit-versus-qubit state counts, superposition versus entanglement, and quantum measurement after conventional teaching. Guided inquiry and simulation-based reconciliation improve understanding: https://doi.org/10.1103/physrevphyseducres.20.020108 and https://doi.org/10.1063/1.3515241

**Ground truth — visualization warning:** Interactive visualizations can reduce misconceptions, but poorly chosen visual metaphors can create incorrect classical models. The prototype must label what each visualization represents and avoid implying that a photon or qubit literally splits: https://doi.org/10.48550/arxiv.1410.0867

**ASSETS verified:**
- Qiskit Aer supports statevector, density-matrix, and intermediate save instructions: https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html
- PennyLane supports circuit inspection, state snapshots, and interactive simulator debugging: https://docs.pennylane.ai/en/stable/introduction/inspecting_circuits.html
- OpenQASM provides a standardized circuit representation for supported interoperability: https://openqasm.com/

**FIELD:**
- OVERDONE: generic courses, circuit construction, final-result histograms, chatbot explanations, gamification.
- WON-BEFORE: polished visual circuit builders with AI tutors already appear in hackathons and open-source projects.
- OPEN-GAP: prediction capture, first-divergence localization, evidence-bound explanation, counterfactual repair, and instructor-visible misconception analytics in one learner loop.
- SPONSOR-WANTS: a scalable, accessible, practical route from theory to hands-on quantum-algorithm competence and workforce readiness.

## 90-second judge-visible narrative

1. Learner opens the Bell-state module and answers a prediction question.
2. Learner places H and CNOT in the visual builder; synchronized Qiskit code appears.
3. The circuit runs on Qiskit Aer and PennyLane; outputs are compared.
4. Bloch/state/probability visualizations show the verified result.
5. Quantum Flight Recorder replays each gate and finds the first mismatch with the learner’s prediction.
6. The tutor explains that mismatch using the trace and issues one repair challenge.
7. The learner passes; progress and instructor misconception analytics update.

## Risk register

| Risk | If it fires | Plan B |
|---|---|---|
| Multi-framework adapter work overruns | Core demo becomes unstable | Keep Qiskit Aer live; use PennyLane only for the supported Bell circuit; disclose Cirq/qBraid as architecture-ready roadmap. |
| LLM hallucinates quantum behavior | Judges lose trust | Simulator owns every numerical result; tutor uses trace payloads and curated fallback explanations for scripted demo inputs. |
| Venue internet or provider fails | AI beat dies | Local simulators, cached lessons, seeded accounts, and DEMO_FALLBACK tutor responses run on one laptop. |
| Visualizations teach a false model | Educational claim is attacked | Label mathematical representations explicitly; use reduced-state views for entangled qubits and explain when a single-qubit Bloch vector is mixed. |
| Visual/code synchronization becomes brittle | Builder appears broken | Support a frozen gate/code subset and one-way regenerate-from-builder fallback. |
| Instructor dashboard lacks real cohort data | Analytics looks fake | Seed disclosed synthetic cohort attempts while the live demo writes one real attempt into the same schema. |
| Exact internal deadline remains unknown | Freeze calendar cannot be computed | Use relative T-minus gates until the organizer confirms the date and time. |
| Sixth teammate remains unnamed | QA or story work is ownerless | Keep the sixth mission unassigned and cap MUST scope so the five confirmed members can still deliver the skeleton. |
