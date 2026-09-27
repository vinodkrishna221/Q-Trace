/**
 * Q-Trace Curriculum: Units 1.6 & 1.7 (Multi-Qubit, CNOT & Entanglement)
 * 
 * Conforms to:
 * - docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md (Section 3: Units 1.6 & 1.7)
 * - docs/LEARN-DUOLINGO-PATH-UI-SPEC.md (Section 5.1: Archetypes)
 * - board/contracts/learning-content.md (v1)
 * - .agents/rules/stack/quantum-ui.md (Scientific honesty law, Light-mode tokens)
 */

import { CurriculumStage } from "./types";

export const units6to7Stages: CurriculumStage[] = [
  // -------------------------------------------------------------------------
  // UNIT 1.6: Multi-Qubit Systems & Two-Qubit Gates
  // -------------------------------------------------------------------------
  {
    id: "mod1_multi_qubit_register",
    lessonId: "mod1_multi_qubit_register",
    unitId: "unit_1_6",
    unitNumber: 6,
    stageNumber: 1,
    archetype: "NODE_CONCEPT",
    title: "Multi-Qubit Registers: Tensor Products and the 2ⁿ Explosion",
    estimatedMinutes: 4,
    coherenceReward: 45,
    analogyHook:
      "A classical register with 2 bits can only store one value at a time (00, 01, 10, or 11). A 2-qubit quantum register exists in a simultaneous superposition of all 4 combinations through the tensor product.",
    conceptSummary:
      "When combining two independent qubits q0 and q1, their joint state space is formed by the tensor product (⊗): |ψ⟩ = |ψ₀⟩ ⊗ |ψ₁⟩. A 2-qubit register holds 4 simultaneous basis state amplitudes: |ψ⟩ = c₀₀|00⟩ + c₀₁|01⟩ + c₁₀|10⟩ + c₁₁|11⟩. As qubits grow linearly (1, 2, 3... N), state space explodes exponentially (2, 4, 8... 2ⁿ). At N=300, 2³⁰⁰ exceeds the total number of atoms in the observable universe.",
    misconceptionHandled:
      "Linear scaling misconception (believing quantum memory capacity grows linearly rather than exponentially as 2ⁿ).",
    tensorProduct: {
      formula: "|ψ⟩ = |ψ₀⟩ ⊗ |ψ₁⟩",
      expansion: "|ψ⟩ = c₀₀|00⟩ + c₀₁|01⟩ + c₁₀|10⟩ + c₁₁|11⟩",
      amplitudesScaling: [
        { qubits: 1, amplitudes: 2, formula: "2¹ = 2" },
        { qubits: 2, amplitudes: 4, formula: "2² = 4" },
        { qubits: 3, amplitudes: 8, formula: "2³ = 8" },
        { qubits: "N", formula: "2^N" },
      ],
      cosmicScaleNote:
        "At N = 300, 2³⁰⁰ exceeds the estimated 10⁸⁰ atoms in the observable universe.",
    },
    predictionCheckpoint: {
      id: "pc_tensor_scaling",
      prompt:
        "How many simultaneous complex amplitudes are required to describe a 3-qubit quantum register?",
      options: [
        {
          id: "AMPLITUDES_8",
          label: "8 amplitudes (2³ = 8)",
          correct: true,
          explanation:
            "Correct! A register of N qubits requires 2ⁿ amplitudes. For 3 qubits, 2³ = 8.",
        },
        {
          id: "AMPLITUDES_6",
          label: "6 amplitudes (3 × 2 = 6)",
          correct: false,
          explanation:
            "Common error: quantum states combine via tensor products (multiplication 2ⁿ), not linear addition.",
        },
        {
          id: "AMPLITUDES_3",
          label: "3 amplitudes (1 per qubit)",
          correct: false,
          explanation:
            "Incorrect. Each qubit doubles the total dimensions of the joint Hilbert space.",
        },
      ],
      correctOptionId: "AMPLITUDES_8",
      misconceptionHandled: "Linear scaling misconception",
    },
  },

  {
    id: "mod1_gate_cnot",
    lessonId: "mod1_gate_cnot",
    unitId: "unit_1_6",
    unitNumber: 6,
    stageNumber: 2,
    archetype: "NODE_GATE_LAB",
    title: "The Controlled-NOT (CNOT) Gate",
    estimatedMinutes: 5,
    coherenceReward: 55,
    analogyHook:
      "Think of an automated security turnstile: if your badge scans valid (Control is 1), the turnstile unlocks and rotates (Target flips). If no badge is scanned (Control is 0), the gate remains unchanged.",
    conceptSummary:
      "The CNOT (Controlled-X) gate is the fundamental two-qubit conditional operator. Wire 0 acts as the Control Qubit (●) and Wire 1 acts as the Target Qubit (⊕). If Control is |1⟩, target is inverted with an X gate; if Control is |0⟩, target remains unchanged.",
    misconceptionHandled:
      "Target affecting control (believing CNOT acts symmetrically like classical wires, or forgetting control state is preserved).",
    cnotTruthTable: [
      {
        input: "|00⟩",
        output: "|00⟩",
        control: "0",
        targetIn: "0",
        targetOut: "0",
        explanation: "Control is 0: target is unchanged (0 → 0)",
      },
      {
        input: "|01⟩",
        output: "|01⟩",
        control: "0",
        targetIn: "1",
        targetOut: "1",
        explanation: "Control is 0: target is unchanged (1 → 1)",
      },
      {
        input: "|10⟩",
        output: "|11⟩",
        control: "1",
        targetIn: "0",
        targetOut: "1",
        explanation: "Control is 1: target is flipped (0 → 1)",
      },
      {
        input: "|11⟩",
        output: "|10⟩",
        control: "1",
        targetIn: "1",
        targetOut: "0",
        explanation: "Control is 1: target is flipped (1 → 0)",
      },
    ],
    predictionCheckpoint: {
      id: "pc_cnot_truth",
      prompt:
        "If input state |10⟩ (Control q0 = 1, Target q1 = 0) passes through a CNOT gate, what is the output state?",
      options: [
        {
          id: "STATE_11",
          label: "|11⟩: Control is |1⟩, so Target flips from 0 to 1",
          correct: true,
          explanation:
            "Correct! Because Control q0 is |1⟩, the X operation applies to Target q1, yielding |11⟩.",
        },
        {
          id: "STATE_10",
          label: "|10⟩: Target remains unchanged",
          correct: false,
          explanation:
            "Incorrect. When Control is |1⟩, the target bit must flip.",
        },
        {
          id: "STATE_01",
          label: "|01⟩: The bits are swapped",
          correct: false,
          explanation:
            "CNOT is conditional bit flip, not SWAP. Control bit q0 never flips.",
        },
      ],
      correctOptionId: "STATE_11",
      misconceptionHandled: "Incomplete conditional execution understanding",
    },
  },

  {
    id: "mod1_gates_cz_swap",
    lessonId: "mod1_gates_cz_swap",
    unitId: "unit_1_6",
    unitNumber: 6,
    stageNumber: 3,
    archetype: "NODE_GATE_LAB",
    title: "Controlled-Z (CZ) and SWAP Gates",
    estimatedMinutes: 4,
    coherenceReward: 50,
    analogyHook:
      "While CNOT requires designating a specific master control and slave target, the Controlled-Z gate is completely symmetric: both qubits control each other equally to apply a relative sign flip.",
    conceptSummary:
      "The Controlled-Z (CZ) gate multiplies the joint basis state |11⟩ by -1, leaving |00⟩, |01⟩, and |10⟩ untouched. CZ is completely symmetric: CZ(q0, q1) = CZ(q1, q0). The SWAP gate exchanges the states of two qubits (|01⟩ ↔ |10⟩) and can be constructed using exactly three alternating CNOT gates.",
    misconceptionHandled:
      "Asymmetry assumption on CZ (assuming one qubit must be designated control and behaves differently from target).",
    metadata: {
      czMatrix: "diag(1, 1, 1, -1)",
      swapDecomposition: [
        "CNOT(control=0, target=1)",
        "CNOT(control=1, target=0)",
        "CNOT(control=0, target=1)",
      ],
    },
  },

  // -------------------------------------------------------------------------
  // UNIT 1.7: Quantum Entanglement & The Bell State
  // -------------------------------------------------------------------------
  {
    id: "bell-state",
    lessonId: "bell-state",
    unitId: "unit_1_7",
    unitNumber: 7,
    stageNumber: 1,
    archetype: "NODE_GATE_LAB",
    title: "Synthesizing the Bell State |Φ⁺⟩ (Hero Lab)",
    estimatedMinutes: 6,
    coherenceReward: 80,
    route: "/learn/bell-state",
    analogyHook:
      "Imagine two magic coins tossed in different rooms: each coin lands heads or tails completely randomly at 50%, yet whenever coin A shows heads, coin B is guaranteed to show heads. They share one unified quantum reality.",
    conceptSummary:
      "The Bell State |Φ⁺⟩ is the quintessential maximally entangled two-qubit state. Prepared by applying a Hadamard gate to q0 followed by a CNOT gate with control q0 and target q1, it produces |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Notice amplitudes for |01⟩ and |10⟩ are strictly zero. The qubits are 100% correlated.",
    bellSynthesis: {
      recipe: [
        "1. Initialize two qubits in ground state |00⟩",
        "2. Apply Hadamard to q0: (|00⟩ + |10⟩)/√2",
        "3. Apply CNOT with control q0 and target q1",
        "4. Yields maximally entangled Bell State: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2",
      ],
      formula: "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2",
      targetState: "|Φ⁺⟩",
    },
  },

  {
    id: "mod1_entanglement_correlation",
    lessonId: "mod1_entanglement_correlation",
    unitId: "unit_1_7",
    unitNumber: 7,
    stageNumber: 2,
    archetype: "NODE_PREDICTION",
    title: "Spooky Action vs. Perfect Correlation: The Classical Independence Trap",
    estimatedMinutes: 5,
    coherenceReward: 60,
    analogyHook:
      "Classical intuition tells us that two separated objects possess independent properties. In quantum mechanics, an entangled pair behaves as a single indivisible system regardless of physical distance.",
    conceptSummary:
      "In the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2, individual measurement outcomes on q0 and q1 are completely random (50% |0⟩, 50% |1⟩). However, the joint outcomes are 100% correlated: observing |1⟩ on q0 instantaneously collapses q1 into |1⟩. Entanglement does not permit faster-than-light signaling, but proves nature is non-locally correlated.",
    misconceptionHandled:
      "The Classical Independence Trap — assuming spatially separated qubits retain independent 50% random distributions rather than 100% mutual correlation.",
    predictionCheckpoint: {
      id: "pc_bell_correlation",
      prompt:
        "After preparing |Φ⁺⟩, if Alice measures q0 and observes |1⟩, what is the probability that Bob measures |1⟩ on q1, even if Bob is in another galaxy?",
      options: [
        {
          id: "CORRELATED_00_11",
          label:
            "Exactly 100% |1⟩. Measurement collapses the joint wavefunction into |11⟩ instantaneously.",
          correct: true,
          explanation:
            "Correct! Because |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 contains zero amplitude for |10⟩, observing q0 = 1 guarantees q1 = 1 with 100% probability.",
        },
        {
          id: "INDEPENDENT_RANDOM",
          label:
            "50% random chance, because Bob's qubit is spatially independent.",
          correct: false,
          explanation:
            "The Classical Independence Trap! Classical systems have independent outcomes, but entangled quantum states collapse as an indivisible unit.",
        },
        {
          id: "ZERO_PERCENT",
          label:
            "0%: Bob must measure 0 to balance Alice's 1.",
          correct: false,
          explanation:
            "Incorrect: That would be the antisymmetric singlet state |Ψ⁻⟩. |Φ⁺⟩ correlates identical bit values (00 and 11).",
        },
      ],
      correctOptionId: "CORRELATED_00_11",
      misconceptionHandled: "Classical Independence Trap",
    },
  },

  {
    id: "mod1_subsystem_purity",
    lessonId: "mod1_subsystem_purity",
    unitId: "unit_1_7",
    unitNumber: 7,
    stageNumber: 3,
    archetype: "NODE_DEBUG",
    title: "Subsystem Purity & The Bloch Sphere Breakdown",
    estimatedMinutes: 5,
    coherenceReward: 60,
    analogyHook:
      "A pure quantum state lives on the surface of the Bloch sphere (|r| = 1). An entangled subsystem loses its individual identity — its statevector contracts inward toward the center of the sphere as a mixed state.",
    conceptSummary:
      "Why can't an entangled Bell state be drawn on two separate Bloch spheres? Because |Φ⁺⟩ cannot be factored: |Φ⁺⟩ ≠ |ψ₁⟩ ⊗ |ψ₂⟩. Tracing out qubit 1 leaves qubit 0 in a maximally mixed state: ρ_q0 = 0.5|0⟩⟨0| + 0.5|1⟩⟨1|. Its Bloch vector contracts to the exact center (0, 0, 0) with reduced purity Tr(ρ²) = 0.50.",
    misconceptionHandled:
      "Independent statevector fallacy (attempting to assign individual pure Bloch vectors to entangled subsystems).",
    purityValue: 0.50,
    subsystemPurity: {
      purityValue: 0.50,
      formula: "Tr(ρ_A²) = 0.50",
      reducedDensityMatrix: [
        [0.5, 0],
        [0, 0.5],
      ],
      blochCoordinates: { x: 0, y: 0, z: 0 },
      uiBadge: "Entangled Subsystem · Reduced Purity Tr(ρ²) = 0.50",
      scientificHonestyNote:
        "Mathematical representation, not physical trajectory. An entangled state cannot be represented as independent pure states on individual Bloch spheres.",
    },
  },

  {
    id: "mod1_flight_recorder_repair",
    lessonId: "mod1_flight_recorder_repair",
    unitId: "unit_1_7",
    unitNumber: 7,
    stageNumber: 4,
    archetype: "NODE_DEBUG",
    title: "Flight Recorder Diagnosis & In-Situ Repair Challenge",
    estimatedMinutes: 7,
    coherenceReward: 90,
    analogyHook:
      "Like an aircraft black box replaying sensor logs before an incident, the Quantum Flight Recorder steps gate-by-gate through state trace execution to pinpoint the exact moment of divergence.",
    conceptSummary:
      "Interactive replay through state trace steps: Step 0 (|00⟩) → Step 1 (H|00⟩) → Step 2 (CNOT → |Φ⁺⟩). When the learner or simulation diagnoses a parity error or divergence, the Socratic Repair Challenge prompts a targeted circuit adjustment to achieve the desired entangled state.",
    misconceptionHandled:
      "Bell state basis confusion (confusing |Φ⁺⟩ with |Ψ⁺⟩ or missing the necessary Pauli flip).",
    repairChallenge: {
      initialState: "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2",
      targetState: "|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2",
      challengePrompt:
        "Modify the Bell circuit to transform |Φ⁺⟩ into |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2.",
      solution: "Add an X gate on q1 after the CNOT (or on q1 before the CNOT).",
      repairGate: "X",
      targetQubit: 1,
      misconceptionKey: "BELL_STATE_PARITY_DIVERGENCE",
    },
  },
];

export default units6to7Stages;
