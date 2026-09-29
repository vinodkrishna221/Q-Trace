/**
 * Q-Trace Curriculum: Module 2 Unit 2.1 (Grover's Search Algorithm)
 * 
 * Conforms to:
 * - docs/FEATURES-SPEC.md (Section 1: F1 Grover's Algorithm Unit)
 * - docs/FEATURE-DIFFERENTIATION.md (F1: Grover's Algorithm Unit)
 * - board/contracts/learning-content.md (v1)
 * - docs/LEARN-DUOLINGO-PATH-UI-SPEC.md (Section 5.1: Archetypes)
 * - .agents/rules/stack/quantum-ui.md (Scientific honesty law, Light-mode tokens)
 */

import type {
  CurriculumStage,
  CurriculumUnitInfo,
  GroverMathMetadata,
  GateTruthTableMetadata,
  GroverSpeedupTableMetadata,
  GroverLabCircuitMetadata,
  StarterCircuitDefinition,
  GroverAcceptanceCriteria,
} from "./types";

export const module2Unit21Stages: CurriculumStage[] = [
  // -------------------------------------------------------------------------
  // Stage 2.1.1: NODE_CONCEPT — The Oracle
  // -------------------------------------------------------------------------
  {
    id: "mod2_grover_oracle_concept",
    lessonId: "mod2_grover_oracle_concept",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 1,
    category: "Concept Prep",
    archetype: "NODE_CONCEPT",
    title: "The Oracle: Marking the Answer Without Reading It",
    estimatedMinutes: 5,
    coherenceReward: 60,
    shieldReward: 15,
    route: "/learn/oracle",
    analogyHook:
      "A metal detector doesn't tell you what's buried — it just beeps louder over the right spot. Grover's oracle does the same: it marks the answer qubit with a phase flip without revealing which item it is.",
    conceptSummary:
      "The Grover oracle U_ω applies a phase flip to exactly one computational basis state |ω⟩ (the \"marked\" state): U_ω|x⟩ = -|x⟩ if x = ω, and |x⟩ otherwise. It does NOT measure or collapse the state — the query register remains in superposition. The oracle's phase flip is invisible until the Diffusion operator interferes the amplitudes.",
    metadata: {
      oracleType: "phase_flip",
      classicalEquivalent: "f(x) = 1 if x == ω else 0",
      formula: "U_\\omega|x\\rangle = (-1)^{f(x)}|x\\rangle",
      markedStateRole: "Phase inversion without measurement collapse",
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2.1.2: NODE_CONCEPT — Amplitude Amplification
  // -------------------------------------------------------------------------
  {
    id: "mod2_amplitude_amplification",
    lessonId: "mod2_amplitude_amplification",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 2,
    category: "Concept Prep",
    archetype: "NODE_CONCEPT",
    title: "Amplitude Amplification: Reflecting About the Mean",
    estimatedMinutes: 6,
    coherenceReward: 70,
    shieldReward: 15,
    route: "/learn/diffusion",
    analogyHook:
      "Imagine all arrow heights on a target represent probability amplitudes. Grover flips the marked arrow negative, then reflects every arrow about their average height. The positive arrows shrink; the once-negative marked arrow shoots up above the average.",
    conceptSummary:
      "The Grover Diffusion operator U_s = 2|s⟩⟨s| - I (where |s⟩ = H^{\\otimes n}|0⟩^n) performs an inversion about the mean: each amplitude α_i is transformed to 2ᾱ - α_i where ᾱ = (1/N) ∑ α_j. After the oracle negates α_ω, the reflection amplifies α_ω while suppressing all other amplitudes. After ⌊(π/4)√N⌋ iterations, P(|ω⟩) ≈ 1.",
    groverMath: {
      diffusionOperator: "2|s⟩⟨s| - I",
      meanAmplitude: "ᾱ = (1/N) ∑ αᵢ",
      reflectionRule: "αᵢ → 2ᾱ - αᵢ",
      optimalIterations: "⌊(π/4)√N⌋",
      finalProbability: "P(|ω⟩) ≈ sin²((2k+1)θ) where θ = arcsin(1/√N)",
    },
    metadata: {
      diffusionOperator: "2|s⟩⟨s| - I",
      meanAmplitude: "ᾱ = (1/N) ∑ αᵢ",
      reflectionRule: "αᵢ → 2ᾱ - αᵢ",
      optimalIterations: "⌊(π/4)√N⌋",
      finalProbability: "P(|ω⟩) ≈ sin²((2k+1)θ) where θ = arcsin(1/√N)",
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2.1.3: NODE_CONCEPT — The Toffoli Gate (CCX)
  // -------------------------------------------------------------------------
  {
    id: "mod2_toffoli_ccx",
    lessonId: "mod2_toffoli_ccx",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 3,
    category: "Gate Intro",
    archetype: "NODE_CONCEPT",
    title: "The Toffoli Gate (CCX): Quantum AND",
    estimatedMinutes: 5,
    coherenceReward: 65,
    shieldReward: 15,
    route: "/learn/oracle",
    analogyHook:
      "A traffic light changes to green ONLY IF both the pedestrian button is pressed AND the timer has elapsed. CCX (Toffoli) flips its target qubit ONLY IF both control qubits are |1⟩ — it is a quantum AND gate.",
    conceptSummary:
      "The Toffoli gate (CCX) is a 3-qubit gate with 2 control qubits and 1 target. It applies an X (NOT) gate to the target only when both controls are |1⟩: CCX|c1 c0 t⟩ = |c1 c0⟩ ⊗ X^(c1 · c0)|t⟩. It is the universal building block for the multi-controlled phase-flip oracle in Grover. CCX is also classically reversible — the Fredkin/Toffoli gate is universal for reversible classical computation.",
    gateTruthTable: {
      gate: "CCX (Toffoli)",
      qiskitAPI: "qc.ccx(ctrl1, ctrl2, target)",
      controls: 2,
      targets: 1,
      truthTable: [
        { input: "|000⟩", output: "|000⟩" },
        { input: "|001⟩", output: "|001⟩" },
        { input: "|010⟩", output: "|010⟩" },
        { input: "|011⟩", output: "|011⟩" },
        { input: "|100⟩", output: "|100⟩" },
        { input: "|101⟩", output: "|101⟩" },
        { input: "|110⟩", output: "|111⟩" },
        { input: "|111⟩", output: "|110⟩" },
      ],
      universality: "Universal for reversible classical computation",
    },
    metadata: {
      gate: "CCX",
      qiskitAPI: "qc.ccx(ctrl1, ctrl2, target)",
      controls: 2,
      targets: 1,
      reversible: true,
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2.1.4: NODE_CONCEPT — Grover Speedup
  // -------------------------------------------------------------------------
  {
    id: "mod2_grover_speedup",
    lessonId: "mod2_grover_speedup",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 4,
    category: "Concept Prep",
    archetype: "NODE_CONCEPT",
    title: "Grover Speedup: O(√N) vs O(N)",
    estimatedMinutes: 4,
    coherenceReward: 55,
    shieldReward: 15,
    route: "/learn/diffusion",
    analogyHook:
      "Finding a name in an unsorted phone book requires reading, on average, half the pages — N/2 lookups. Grover finds the name by opening the book roughly √N times, using quantum wave interference to cancel out every wrong page.",
    conceptSummary:
      "Classical unstructured search requires O(N) oracle queries on average (and at least N/2 in the worst case). Grover's algorithm provably solves the same problem with O(√N) oracle queries — a quadratic speedup. For N = 2^n items encoded in n qubits, the optimal number of Grover iterations is k_opt = ⌊(π/4)√N⌋. For n = 3 qubits (N = 8), k_opt = 2 iterations reach P(|ω⟩) ≈ 0.945.",
    speedupTable: {
      items: [4, 8, 16, 64, 1024],
      classicalAvg: [2, 4, 8, 32, 512],
      groverIterations: [1, 2, 3, 6, 25],
      successProbability: [1.0, 0.945, 0.961, 0.987, 0.999],
    },
    metadata: {
      classicalComplexity: "O(N)",
      quantumComplexity: "O(sqrt(N))",
      optimalFormula: "floor((pi/4)*sqrt(N))",
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2.1.5: NODE_GATE_LAB — CCX Gate Lab
  // -------------------------------------------------------------------------
  {
    id: "mod2_ccx_lab",
    lessonId: "mod2_ccx_lab",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 5,
    category: "Gate Lab",
    archetype: "NODE_GATE_LAB",
    title: "CCX Gate Lab: Build a Quantum AND",
    estimatedMinutes: 6,
    coherenceReward: 80,
    shieldReward: 20,
    route: "/learn/oracle",
    analogyHook:
      "Just like testing a logic gate with a multimeter, assemble two control inputs and see the CCX target flip only when both switches are ON.",
    conceptSummary:
      "Interactive gate lab using the upgraded Circuit Workspace with CCX. Students build a 3-qubit circuit: initialize q0=|1⟩, q1=|1⟩ via X gates, then apply CCX. The Flight Recorder shows the statevector confirm |111⟩ → |110⟩ (target flipped). Students then try with q1=|0⟩ and observe the CCX does NOT fire (no flip).",
    labCircuit: {
      qubitCount: 3,
      steps: [
        "Apply X to q0 (prepare |1⟩)",
        "Apply X to q1 (prepare |1⟩)",
        "Apply CCX(ctrl=q0, ctrl=q1, target=q2)",
        "Measure all qubits",
      ],
      expectedOutput: "|110⟩ with P=1.0",
      learnerTask: "Verify CCX fires only when both controls are |1⟩",
    },
    handsOnLab: {
      codeSnippet:
        "# Qiskit 3-Qubit CCX Test\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 3)\nqc.x(0)\nqc.x(1)\nqc.ccx(0, 1, 2)\nqc.measure([0, 1, 2], [0, 1, 2])",
      witnessDescription:
        "Verify state |110⟩ is produced with 100% probability when q0=1 and q1=1.",
      instructions:
        "Initialize q0 and q1 to |1⟩ with X gates, then attach CCX controlling q2. Verify state flips.",
    },
    metadata: {
      qubitCount: 3,
      controlsRequired: [0, 1],
      targetQubit: 2,
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2.1.6: NODE_GATE_LAB — Phase Oracle Lab
  // -------------------------------------------------------------------------
  {
    id: "mod2_phase_oracle_lab",
    lessonId: "mod2_phase_oracle_lab",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 6,
    category: "Gate Lab",
    archetype: "NODE_GATE_LAB",
    title: "Phase Oracle Lab: Mark |101⟩ with a Phase Flip",
    estimatedMinutes: 7,
    coherenceReward: 85,
    shieldReward: 20,
    route: "/learn/oracle",
    analogyHook:
      "Tagging a luggage bag with a hidden RFID tag: the bag looks identical from the outside, but when passed through the scanner, the phase tag lights up.",
    conceptSummary:
      "Students build a 3-qubit phase oracle that marks the state |101⟩ (q0=1, q1=0, q2=1) with a phase flip. Technique: flip q1 (X gate), apply CCX with controls q0 and q2 targeting an ancilla-free approach using CZ, then un-flip q1. The Flight Recorder captures the statevector to show the phase of |101⟩ is now -1/√8 while all other states remain +1/√8.",
    labCircuit: {
      qubitCount: 3,
      targetState: "|101⟩",
      oracleSteps: [
        "H on all qubits (equal superposition)",
        "X on q1 (so q1 is |1⟩ when input is |101⟩)",
        "CCX(ctrl=q0, ctrl=q1, target=q2) — marks |111⟩ after X-flip trick",
        "X on q1 (undo flip)",
        "Capture statevector: |101⟩ amplitude is now negative",
      ],
      expectedOutput: "Amplitude of |101⟩ is -1/√8, all other 7 states +1/√8",
    },
    handsOnLab: {
      codeSnippet:
        "# Phase Oracle for |101⟩\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(3)\nqc.h([0, 1, 2])\nqc.x(1)\nqc.cz(0, 2)\nqc.x(1)",
      witnessDescription:
        "Phase of basis state |101⟩ is inverted (-1/√8) relative to other states.",
      instructions:
        "Apply H to all 3 qubits, X on q1, execute oracle phase inversion, and un-flip q1.",
    },
    metadata: {
      markedState: "|101⟩",
      qubitCount: 3,
      phaseFlipMagnitude: -0.35355339,
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2.1.7: NODE_PREDICTION — Optimal Iterations
  // -------------------------------------------------------------------------
  {
    id: "pc_grover_iterations",
    lessonId: "pc_grover_iterations",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 7,
    category: "Prediction",
    archetype: "NODE_PREDICTION",
    title: "How Many Iterations? Predict the Grover Count",
    estimatedMinutes: 3,
    coherenceReward: 50,
    shieldReward: 10,
    route: "/learn/diffusion",
    analogyHook:
      "Baking a soufflé: take it out too early and it hasn't risen; leave it in too long and it collapses. Quantum amplitude amplification has an exact sweet spot.",
    conceptSummary:
      "For a 3-qubit Grover search (N = 8 states, 1 marked state), how many Grover iterations are needed to maximize P(|ω⟩)? Predict the optimal iteration count to avoid over-rotation.",
    misconceptionHandled:
      "Over-iteration and classical search analogy confusion",
    predictionCheckpoint: {
      id: "pc_grover_iterations",
      prompt:
        "For a 3-qubit Grover search (N = 8 states, 1 marked state), how many Grover iterations are needed to maximize P(|ω⟩)?",
      options: [
        {
          id: "GROVER_2_ITER",
          label: "2 iterations — ⌊(π/4)√8⌋ = ⌊2.22⌋ = 2",
          text: "2 iterations — ⌊(π/4)√8⌋ = ⌊2.22⌋ = 2",
          correct: true,
          explanation:
            "Correct! After exactly 2 Grover iterations on 3 qubits, P(|ω⟩) ≈ 94.5%. A 3rd iteration would OVER-rotate and reduce probability back down.",
        },
        {
          id: "GROVER_1_ITER",
          label: "1 iteration",
          text: "1 iteration",
          correct: false,
          explanation:
            "One iteration brings P(|ω⟩) to ~78.1% for N=8 — the state is not yet maximally amplified.",
        },
        {
          id: "GROVER_4_ITER",
          label: "4 iterations — we need to check every state",
          text: "4 iterations — we need to check every state",
          correct: false,
          explanation:
            "This reveals a classical intuition fallacy. Grover does NOT check every state. 4 iterations over-rotates the amplitude past the peak.",
        },
      ],
      correctOptionId: "GROVER_2_ITER",
      misconceptionHandled:
        "Over-iteration and classical search analogy confusion",
    },
    metadata: {
      formula: "floor((pi/4)*sqrt(8))",
      optimalCount: 2,
      peakProbability: 0.945,
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2.1.8: NODE_GATE_LAB — Full 3-Qubit Grover Circuit Lab
  // -------------------------------------------------------------------------
  {
    id: "mod2_full_grover_lab",
    lessonId: "mod2_full_grover_lab",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 8,
    category: "Gate Lab",
    archetype: "NODE_GATE_LAB",
    title: "Full 3-Qubit Grover Circuit Lab",
    estimatedMinutes: 10,
    coherenceReward: 100,
    shieldReward: 25,
    route: "/learn/grover",
    analogyHook:
      "Putting the entire engine together: initialization, oracle phase marking, and diffusion reflection working in tandem to pull the needle out of the haystack.",
    conceptSummary:
      "Students build and run the complete 3-qubit Grover circuit targeting |ω⟩ = |101⟩. The Flight Recorder scrubber animates each step: initialization, oracle application (step 1), diffusion (step 1), oracle again (step 2), diffusion again (step 2), final measurement.",
    starterCircuitDefinition: {
      qubitCount: 3,
      classicalBitCount: 3,
      operations: [
        // Step 0: Equal superposition
        { gate: "H", targets: [0], column: 0 },
        { gate: "H", targets: [1], column: 0 },
        { gate: "H", targets: [2], column: 0 },
        // Oracle iteration 1: mark |101⟩
        { gate: "X", targets: [1], column: 1 },
        { gate: "CCX", targets: [2], controls: [0, 1], column: 2 },
        { gate: "X", targets: [1], column: 3 },
        // Diffusion iteration 1
        { gate: "H", targets: [0], column: 4 },
        { gate: "H", targets: [1], column: 4 },
        { gate: "H", targets: [2], column: 4 },
        { gate: "X", targets: [0], column: 5 },
        { gate: "X", targets: [1], column: 5 },
        { gate: "X", targets: [2], column: 5 },
        { gate: "CCX", targets: [2], controls: [0, 1], column: 6 },
        { gate: "X", targets: [0], column: 7 },
        { gate: "X", targets: [1], column: 7 },
        { gate: "X", targets: [2], column: 7 },
        { gate: "H", targets: [0], column: 8 },
        { gate: "H", targets: [1], column: 8 },
        { gate: "H", targets: [2], column: 8 },
        // Measure
        { gate: "MEASURE", targets: [0], classicalTargets: [0], column: 9 },
        { gate: "MEASURE", targets: [1], classicalTargets: [1], column: 9 },
        { gate: "MEASURE", targets: [2], classicalTargets: [2], column: 9 },
      ],
    },
    acceptanceCriteria: {
      criteria: [
        "Circuit uses 3 qubits and 3 classical bits",
        "Full diffusion operator constructed with H, X, CCX",
        "P(|101⟩) >= 0.90 on Qiskit Aer (1024 shots)",
      ],
      targetProbability: 0.90,
      targetState: "|101⟩",
      runtimeBackend: "Qiskit Aer",
      shots: 1024,
    },
    handsOnLab: {
      codeSnippet:
        "# Complete 3-Qubit Grover Circuit\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 3)\n# 1. Superposition\nqc.h([0, 1, 2])\n# 2. Oracle for |101⟩\nqc.x(1)\nqc.ccx(0, 1, 2)\nqc.x(1)\n# 3. Diffusion\nqc.h([0, 1, 2])\nqc.x([0, 1, 2])\nqc.ccx(0, 1, 2)\nqc.x([0, 1, 2])\nqc.h([0, 1, 2])\nqc.measure([0, 1, 2], [0, 1, 2])",
      witnessDescription:
        "Measure state |101⟩ with probability >= 0.90 after optimal iterations.",
      instructions:
        "Construct equal superposition, oracle phase marking for |101⟩, and diffusion reflection.",
    },
    metadata: {
      qubitCount: 3,
      classicalBitCount: 3,
      targetState: "|101⟩",
      shots: 1024,
      minProbability: 0.90,
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2.1.9: NODE_MILESTONE — Grover Boss
  // -------------------------------------------------------------------------
  {
    id: "mod2_boss_grover",
    lessonId: "mod2_boss_grover",
    unitId: "unit_2_1",
    unitNumber: 2,
    stageNumber: 9,
    category: "Milestone Boss",
    archetype: "NODE_MILESTONE",
    title: "Grover Boss: Find the Hidden State",
    estimatedMinutes: 10,
    coherenceReward: 150,
    shieldReward: 50,
    bossChallenge: true,
    route: "/learn/grover",
    analogyHook:
      "The ultimate test of quantum advantage: a black-box oracle conceals a secret 3-bit password. You cannot inspect the oracle wires — only run the search and let quantum interference reveal the answer.",
    conceptSummary:
      "The boss generates a random marked state at session start (unknown to the student). The student is given only the oracle and must build the complete Grover circuit around it to identify the hidden state.",
    acceptanceCriteria: {
      criteria: [
        "Circuit must use CCX and all diffusion operator gates",
        "P(|ω⟩) >= 0.90 on Qiskit Aer",
        "Student must name the marked state correctly",
      ],
      targetProbability: 0.90,
      requiredGates: ["H", "X", "CCX", "MEASURE"],
      runtimeBackend: "Qiskit Aer",
      bossChallenge: true,
    },
    capstone: {
      challengeName: "Grover Boss: Find the Hidden State",
      archetype: "NODE_MILESTONE",
      bossChallenge: true,
      acceptanceCriteria: {
        circuitQubits: 3,
        targetFidelity: 0.90,
        runtimeBackend: "Qiskit Aer",
        requiredGates: ["H", "X", "CCX", "MEASURE"],
        verificationMetric: "P(|marked_state⟩) >= 0.90 across 1024 shots",
        criteria: [
          "Circuit must use CCX and all diffusion operator gates",
          "P(|ω⟩) >= 0.90 on Qiskit Aer",
          "Student must name the marked state correctly",
        ],
      },
      circuitDefinition: {
        numQubits: 3,
        q0Role: "Search Register Qubit 0",
        bellPairQubits: [0, 1],
        measurementQubits: [0, 2],
        correctionQubit: 2,
      },
    },
    metadata: {
      boss: true,
      hiddenStateChallenge: true,
      thresholdProbability: 0.90,
      simulator: "Qiskit Aer",
      requiredGates: ["H", "X", "CCX", "MEASURE"],
    },
  },
];

export const MODULE_2_UNIT_2_1_META: CurriculumUnitInfo = {
  id: "unit_2_1",
  unitNumber: 2,
  subUnitNumber: 1,
  title: "Grover's Search Algorithm",
  subtitle: "Quantum Oracles, Diffusion & Quadratic Speedup",
  stages: module2Unit21Stages,
};

export default module2Unit21Stages;
