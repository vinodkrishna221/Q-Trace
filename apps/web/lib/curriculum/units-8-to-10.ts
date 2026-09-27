/**
 * Q-Trace Curriculum: Units 1.8 to 1.10
 * - Unit 1.8: Quantum Telemetry & Hardware Realities (3 stages)
 * - Unit 1.9: Pre-Algorithm Quantum Protocols (4 stages)
 * - Unit 1.10: Module 1 Capstone Exam & Bridge to Algorithms (2 stages)
 *
 * Conforms to:
 * - board/contracts/learning-content.md (v1)
 * - docs/LEARN-DUOLINGO-PATH-UI-SPEC.md (Section 5.1 Archetypes)
 * - docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md (Section 3 Units 1.8 - 1.10)
 */

import type { CurriculumStage } from "./types";

export const units8to10Stages: CurriculumStage[] = [
  // -------------------------------------------------------------------------
  // UNIT 1.8: Quantum Telemetry & Hardware Realities
  // -------------------------------------------------------------------------
  {
    id: "mod1_shot_noise",
    lessonId: "mod1_shot_noise",
    unitId: "unit_1_8",
    unitNumber: 8,
    stageNumber: 1,
    archetype: "NODE_GATE_LAB",
    title: "Shot Noise vs. Exact Statevectors (1024 Shots)",
    estimatedMinutes: 5,
    coherenceReward: 50,
    analogyHook:
      "Flipping a fair coin 10 times might yield 7 heads (70%), but flipping it 1024 times brings the observed average right near 50%. Quantum measurement shot noise obeys the exact same statistics.",
    conceptSummary:
      "Quantum computers output discrete classical bitstrings (0 or 1) upon projective measurement. To reconstruct probabilities, circuits are sampled repeatedly across Shots. Statistical variance diminishes as shot count increases according to the Central Limit Theorem: sigma proportional to 1/sqrt(N).",
    shotNoise: {
      formula: "\\sigma \\propto 1/\\sqrt{N}",
      scalingLaw: "Central Limit Theorem sampling variance (1/sqrt(N))",
      configurations: [
        {
          shots: 10,
          varianceFormula: "\\sigma \\approx 0.316",
          expectedErrorPercent: 31.6,
          description:
            "High statistical variance; observed probabilities fluctuate widely from true state amplitudes.",
        },
        {
          shots: 100,
          varianceFormula: "\\sigma \\approx 0.100",
          expectedErrorPercent: 10.0,
          description:
            "Moderate variance; overall probability distribution shape emerges with minor fluctuations.",
        },
        {
          shots: 1024,
          varianceFormula: "\\sigma \\approx 0.031",
          expectedErrorPercent: 3.1,
          description:
            "Standard benchmark; sampling error drops below 3.1%, reconstructing statevector fidelity.",
        },
      ],
      samplingNote:
        "1024 shots provides reliable state reconstruction for small circuits while respecting quantum execution timeboxes.",
    },
    metadata: {
      shotCounts: [10, 100, 1024],
      varianceLaw: "1/sqrt(N)",
    },
  },

  {
    id: "mod1_global_vs_relative_phase",
    lessonId: "mod1_global_vs_relative_phase",
    unitId: "unit_1_8",
    unitNumber: 8,
    stageNumber: 2,
    archetype: "NODE_PREDICTION",
    title: "Global Phase vs. Relative Phase: The Unseen Difference",
    estimatedMinutes: 4,
    coherenceReward: 50,
    analogyHook:
      "Raising the sea level everywhere by one meter changes nothing about where waves crash against each other. But shifting the crest of one wave relative to another creates complete cancellation.",
    conceptSummary:
      "Multiplying an entire state by e^{i theta} is a Global Phase: it has zero observable effect on measurement probabilities (|c*psi|^2 = |psi|^2). However, multiplying only one basis state by e^{i theta} creates a Relative Phase: it rotates the statevector along the Bloch equator and completely alters quantum interference.",
    misconceptionHandled:
      "Global phase fallacy (assuming an overall phase factor changes measurement probabilities or physical behavior).",
    phaseDistinction: {
      globalPhase: {
        formula: "e^{i\\theta}|\\psi\\rangle",
        observable: false,
        description:
          "Global phase factor has zero observable consequence; |-0⟩ and |0⟩ produce identical measurement distributions in every measurement basis.",
      },
      relativePhase: {
        formula: "(|0\\rangle + e^{i\\theta}|1\\rangle)/\\sqrt{2}",
        observable: true,
        description:
          "Relative phase shifts the state along the Bloch sphere equator; applying subsequent gates rotates phase into measurable bit populations.",
      },
      interferenceImpact:
        "Relative phase directly determines whether waves combine constructively (amplifying probability) or destructively (cancelling probability).",
    },
    predictionCheckpoint: {
      id: "pc_phase_observability",
      prompt:
        "Which of the following state modifications produces an experimentally observable change in measurement probabilities when tested across different measurement bases?",
      options: [
        {
          id: "RELATIVE_PHASE_OBSERVABLE",
          label:
            "Applying a relative phase: |ψ⟩ = (|0⟩ + i|1⟩)/√2 vs (|0⟩ + |1⟩)/√2",
          correct: true,
          explanation:
            "Correct! Relative phase shifts the state on the Bloch sphere equator (from |+⟩ to |i+⟩), changing outcome probabilities in the X or Y measurement basis.",
        },
        {
          id: "GLOBAL_PHASE_OBSERVABLE",
          label: "Applying an overall global phase: -|0⟩ vs |0⟩",
          correct: false,
          explanation:
            "Incorrect. Global phase e^{iπ} = -1 has zero observable consequences; |-0⟩ and |0⟩ produce identical measurement distributions in every basis.",
        },
        {
          id: "NEITHER_OBSERVABLE",
          label: "Neither phase change has any physical or mathematical effect.",
          correct: false,
          explanation:
            "Incorrect. Relative phase changes the physical quantum state and interference pattern.",
        },
      ],
      correctOptionId: "RELATIVE_PHASE_OBSERVABLE",
      misconceptionHandled: "Global phase fallacy",
    },
  },

  {
    id: "mod1_no_cloning",
    lessonId: "mod1_no_cloning",
    unitId: "unit_1_8",
    unitNumber: 8,
    stageNumber: 3,
    archetype: "NODE_CONCEPT",
    title: "The No-Cloning Theorem (Wootters & Zurek, 1982)",
    estimatedMinutes: 4,
    coherenceReward: 45,
    analogyHook:
      "In classical software, copy = qubit.clone() is trivial and ubiquitous. In quantum mechanics, nature strictly forbids duplicating an unknown quantum state — to copy it would violate the fundamental linearity of quantum physics.",
    conceptSummary:
      "Formulated by Wootters & Zurek in 1982, the No-Cloning Theorem proves that no unitary operator U can clone an arbitrary unknown quantum state |ψ⟩: U(|ψ⟩ ⊗ |0⟩) ≠ |ψ⟩ ⊗ |ψ⟩. Because unitary operators preserve inner products (U†U = I), cloning is only possible for known orthogonal basis states, never general superpositions.",
    noCloning: {
      theorem:
        "It is mathematically impossible to create an identical copy of an arbitrary unknown quantum state.",
      citation:
        "Wootters, W. K., & Zurek, W. H. (1982). A single quantum cannot be cloned. Nature, 299(5886), 802-803.",
      unitaryProofSummary:
        "Assuming a unitary cloning operator U existed such that U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ and U|φ⟩|0⟩ = |φ⟩|φ⟩, taking inner products gives ⟨ψ|φ⟩ = (⟨ψ|φ⟩)², which only holds if ⟨ψ|φ⟩ is 0 or 1. Thus, cloning non-orthogonal superpositions is mathematically impossible.",
      classicalVsQuantumDifference:
        "Classical data can be duplicated freely; quantum information cannot be cloned without destroying the original superposition.",
    },
    metadata: {
      year: 1982,
      authors: ["William Wootters", "Wojciech Zurek"],
      keyImplication:
        "Quantum cryptography (QKD/BB84) relies on no-cloning for eavesdropping detection; classical error correction cannot clone qubits directly.",
    },
  },

  // -------------------------------------------------------------------------
  // UNIT 1.9: Pre-Algorithm Quantum Protocols
  // -------------------------------------------------------------------------
  {
    id: "mod1_quantum_interference",
    lessonId: "mod1_quantum_interference",
    unitId: "unit_1_9",
    unitNumber: 9,
    stageNumber: 1,
    archetype: "NODE_GATE_LAB",
    title: "Wave Interference: Constructive vs. Destructive",
    estimatedMinutes: 5,
    coherenceReward: 55,
    analogyHook:
      "Noise-cancelling headphones emit inverted sound waves that perfectly cancel background noise. Quantum algorithms do the exact same thing with probability amplitudes to eliminate wrong answers.",
    conceptSummary:
      "Quantum algorithms achieve computational speedups not by testing all inputs faster, but by engineering wave interference. Probability amplitudes are complex numbers: when computational paths arrive at incorrect states with opposite signs (+alpha and -alpha), destructive interference cancels them out (probability -> 0). When paths arrive at correct states in phase, constructive interference amplifies them (probability -> 100%).",
    metadata: {
      constructiveFormula:
        "P(x) = |\\alpha_1 + \\alpha_2|^2 > |\\alpha_1|^2 + |\\alpha_2|^2",
      destructiveFormula:
        "P(x) = |\\alpha_1 - \\alpha_2|^2 < |\\alpha_1|^2 + |\\alpha_2|^2",
      hadamardInterferenceExample:
        "H|0⟩ = (|0⟩+|1⟩)/√2, H|1⟩ = (|0⟩-|1⟩)/√2 => H(H|0⟩) = |0⟩ (destructive on |1⟩, constructive on |0⟩)",
    },
  },

  {
    id: "mod1_phase_kickback",
    lessonId: "mod1_phase_kickback",
    unitId: "unit_1_9",
    unitNumber: 9,
    stageNumber: 2,
    archetype: "NODE_GATE_LAB",
    title: "Phase Kickback: The Quantum Trapdoor",
    estimatedMinutes: 6,
    coherenceReward: 65,
    analogyHook:
      "Usually, turning a steering wheel turns the car's wheels. But if the wheels are locked in place, the reaction torque kicks straight back into the driver's hands. In phase kickback, an eigenstate target kicks its phase backwards into the control qubit.",
    conceptSummary:
      "When a target qubit is in an eigenstate of an operator U (such that U|ψ⟩ = e^{iθ}|ψ⟩), applying a controlled-U gate kicks the eigenvalue phase factor e^{iθ} backward into the control qubit, leaving the target state completely unaffected. For example, CNOT(|+⟩|-⟩) = |-⟩|-⟩: the control qubit flips from |+⟩ to |-⟩ while the target remains |-⟩.",
    phaseKickback: {
      mechanism:
        "The control qubit absorbs the target qubit's eigenvalue phase shift without changing the target state.",
      eigenvalueEquation:
        "U|\\psi_t\\rangle = e^{i\\theta}|\\psi_t\\rangle \\implies \\text{C-}U(|c\\rangle|\\psi_t\\rangle) = (e^{i\\theta \\cdot c}|c\\rangle)|\\psi_t\\rangle",
      controlStateEffect:
        "Control qubit absorbs phase factor e^{i\\theta}; target qubit remains unchanged in its eigenstate.",
      algorithmsPowered: [
        "Deutsch-Jozsa Algorithm",
        "Bernstein-Vazirani Algorithm",
        "Quantum Phase Estimation (QPE)",
        "Shor's Factoring Algorithm",
        "Grover's Search Algorithm",
      ],
    },
    metadata: {
      exampleControlInitial: "|+⟩ = (|0⟩ + |1⟩)/√2",
      exampleTargetEigenstate: "|-⟩ = (|0⟩ - |1⟩)/√2",
      examplePostGateState: "|-⟩|-⟩",
    },
  },

  {
    id: "mod1_teleportation",
    lessonId: "mod1_teleportation",
    unitId: "unit_1_9",
    unitNumber: 9,
    stageNumber: 3,
    archetype: "NODE_GATE_LAB",
    title: "Quantum Teleportation Protocol (Alice to Bob)",
    estimatedMinutes: 7,
    coherenceReward: 75,
    analogyHook:
      "Quantum teleportation does not beam matter across space like science fiction — it transfers the exact quantum state of an unknown qubit to another qubit across distance using shared entanglement and 2 classical bits.",
    conceptSummary:
      "The 3-qubit teleportation protocol enables Alice to transmit an unknown quantum state |ψ⟩ = α|0⟩ + β|1⟩ on q0 to Bob's distant qubit q2 without measuring |ψ⟩ directly (which would collapse it) or copying it (forbidden by No-Cloning). It consumes 1 shared Bell pair and transmits 2 classical bits.",
    teleportationProtocol: {
      numQubits: 3,
      qubitAssignments: {
        q0: "Unknown input state |ψ⟩ = α|0⟩ + β|1⟩ (Alice)",
        q1: "Alice's half of shared Bell pair |Φ⁺⟩",
        q2: "Bob's half of shared Bell pair |Φ⁺⟩",
      },
      steps: [
        "1. Share a Bell pair (|Φ⁺⟩ = (|00⟩ + |11⟩)/√2) between Alice (q1) and Bob (q2).",
        "2. Alice performs CNOT with control q0 (unknown state) and target q1, then applies Hadamard to q0.",
        "3. Alice measures qubits q0 and q1 in the computational basis, obtaining 2 classical bits (m0, m1).",
        "4. Alice transmits the 2 classical bits (m0, m1) to Bob over a classical communication channel.",
        "5. Bob applies conditional Pauli corrections to qubit q2: Pauli-X if m1 == 1, and Pauli-Z if m0 == 1.",
        "6. Bob's qubit q2 is now in the exact original quantum state |ψ⟩ = α|0⟩ + β|1⟩ that was on q0!",
      ],
      classicalBitsTransmitted: 2,
      correctionRules: [
        {
          aliceMeasurement: "00",
          bobCorrection: "Identity I (No correction needed)",
        },
        {
          aliceMeasurement: "01",
          bobCorrection: "Pauli-X gate on q2",
        },
        {
          aliceMeasurement: "10",
          bobCorrection: "Pauli-Z gate on q2",
        },
        {
          aliceMeasurement: "11",
          bobCorrection: "Pauli-Z followed by Pauli-X (ZX) on q2",
        },
      ],
    },
    metadata: {
      qubitCount: 3,
      stepsCount: 6,
      preservesNoCloning: true,
      disallowsFTLCommunication: true,
    },
  },

  {
    id: "mod1_superdense_coding",
    lessonId: "mod1_superdense_coding",
    unitId: "unit_1_9",
    unitNumber: 9,
    stageNumber: 4,
    archetype: "NODE_GATE_LAB",
    title: "Superdense Coding: 2 Classical Bits via 1 Qubit",
    estimatedMinutes: 6,
    coherenceReward: 70,
    analogyHook:
      "Teleportation transmits 1 quantum state by sending 2 classical bits. Superdense coding is the dual counterpart: sending 2 classical bits by transmitting only 1 physical qubit!",
    conceptSummary:
      "Using a pre-shared entangled Bell pair (|Φ⁺⟩), Alice encodes one of four classical messages (00, 01, 10, 11) by applying a single local unitary gate (I, X, Z, or XZ) to her qubit, then sends her single qubit to Bob. Bob performs a Bell measurement to decode both classical bits with 100% certainty.",
    metadata: {
      encodingTable: [
        {
          bits: "00",
          gate: "Identity I",
          resultingBellState: "|Φ⁺⟩ = (|00⟩+|11⟩)/√2",
        },
        {
          bits: "01",
          gate: "Pauli-X",
          resultingBellState: "|Ψ⁺⟩ = (|01⟩+|10⟩)/√2",
        },
        {
          bits: "10",
          gate: "Pauli-Z",
          resultingBellState: "|Φ⁻⟩ = (|00⟩-|11⟩)/√2",
        },
        {
          bits: "11",
          gate: "iY or XZ",
          resultingBellState: "|Ψ⁻⟩ = (|01⟩-|10⟩)/√2",
        },
      ],
      qubitsTransmitted: 1,
      classicalBitsDecoded: 2,
    },
  },

  // -------------------------------------------------------------------------
  // UNIT 1.10: Module 1 Capstone Exam & Bridge to Algorithms
  // -------------------------------------------------------------------------
  {
    id: "mod1_capstone_exam",
    lessonId: "mod1_capstone_exam",
    unitId: "unit_1_10",
    unitNumber: 10,
    stageNumber: 1,
    archetype: "NODE_MILESTONE",
    title: "Module 1 Capstone: Universal Teleportation Suite (Boss)",
    estimatedMinutes: 8,
    coherenceReward: 150,
    analogyHook:
      "The ultimate trial of Module 1: synthesizing an end-to-end 3-qubit quantum teleportation circuit that initializes unknown state |ψ⟩, creates Bell entanglement, executes Bell measurement, and verifies high-fidelity state reconstruction.",
    conceptSummary:
      "Synthesize and verify the complete 3-qubit quantum teleportation protocol. Initialize an arbitrary state on q0, prepare an entangled Bell pair on (q1, q2), execute Alice's Bell-basis measurement, transmit classical bits, and verify Bob's reconstructed state achieves state fidelity F >= 0.99 on Qiskit Aer simulation.",
    acceptanceCriteria: {
      circuitQubits: 3,
      targetFidelity: 0.99,
      runtimeBackend: "Qiskit Aer (statevector_simulator)",
      requiredGates: [
        "H",
        "CNOT",
        "Measure",
        "Conditional-X",
        "Conditional-Z",
      ],
      verificationMetric:
        "Quantum State Fidelity F = |⟨ψ_target|ψ_bob⟩|² ≥ 0.99",
      criteria: [
        "3-qubit circuit initialized: q0 (unknown input), q1 (Alice EPR), q2 (Bob EPR)",
        "Bell pair (|Φ⁺⟩) correctly synthesized on (q1, q2) using H + CNOT",
        "Bell-basis measurement executed on (q0, q1) with CNOT + H",
        "Classical feedforward conditional corrections (X, Z) applied to q2",
        "Reconstructed statevector on q2 achieves fidelity F ≥ 0.99 against input state |ψ⟩ on Qiskit Aer",
      ],
    },
    capstone: {
      challengeName: "Universal Bell Correlator & Teleportation Suite",
      archetype: "NODE_MILESTONE",
      bossChallenge: true,
      acceptanceCriteria: {
        circuitQubits: 3,
        targetFidelity: 0.99,
        runtimeBackend: "Qiskit Aer (statevector_simulator)",
        requiredGates: [
          "H",
          "CNOT",
          "Measure",
          "Conditional-X",
          "Conditional-Z",
        ],
        verificationMetric:
          "Quantum State Fidelity F = |⟨ψ_target|ψ_bob⟩|² ≥ 0.99",
        criteria: [
          "3-qubit circuit initialized: q0 (unknown input), q1 (Alice EPR), q2 (Bob EPR)",
          "Bell pair (|Φ⁺⟩) correctly synthesized on (q1, q2) using H + CNOT",
          "Bell-basis measurement executed on (q0, q1) with CNOT + H",
          "Classical feedforward conditional corrections (X, Z) applied to q2",
          "Reconstructed statevector on q2 achieves fidelity F ≥ 0.99 against input state |ψ⟩ on Qiskit Aer",
        ],
      },
      circuitDefinition: {
        numQubits: 3,
        q0Role: "Arbitrary input state |ψ⟩",
        bellPairQubits: [1, 2],
        measurementQubits: [0, 1],
        correctionQubit: 2,
      },
    },
    metadata: {
      boss: true,
      thresholdFidelity: 0.99,
      simulator: "Qiskit Aer",
    },
  },

  {
    id: "mod1_algorithm_bridge",
    lessonId: "mod1_algorithm_bridge",
    unitId: "unit_1_10",
    unitNumber: 10,
    stageNumber: 2,
    archetype: "NODE_CONCEPT",
    title: "The Algorithm Horizon: Bridge to Module 2",
    estimatedMinutes: 3,
    coherenceReward: 30,
    analogyHook:
      "You have built the quantum engine, calibrated the sensors, and learned the laws of quantum mechanics. Now you are ready to drive: entering the realm of quantum algorithms with exponential speedups.",
    conceptSummary:
      "Congratulations! You have mastered the foundational building blocks of quantum mechanics: qubits, Dirac bra-ket vectors, Bloch spheres, single-qubit rotations (X, Z, H, S, T), multi-qubit tensor registers, CNOT, entanglement, measurement collapse, shot noise telemetry, and phase kickback. You possess every conceptual tool required to explore Deutsch-Jozsa, Grover search, and Shor's factoring in Module 2.",
    algorithmBridge: {
      module1ConceptsMastered: [
        "What is Quantum & Energy Quanta",
        "Qubits vs Classical Bits",
        "Dirac Bra-Ket Notation & Statevectors",
        "Superposition & Wavefunction Collapse",
        "Bloch Sphere Geometry & Coordinates",
        "Single-Qubit Unitary Gates (X, Y, Z, H, S, T)",
        "Multi-Qubit Tensor Product Explosion (2^N)",
        "Controlled Gates & CNOT Truth Table",
        "Bell State Synthesis (|Φ⁺⟩)",
        "Subsystem Purity & Density Matrices Tr(ρ²)=0.50",
        "Shot Noise Telemetry & Sampling Variance (1024 shots)",
        "Global vs Relative Phase Observability",
        "No-Cloning Theorem",
        "Wave Interference & Amplitude Cancellation",
        "Phase Kickback Mechanism",
        "Quantum Teleportation & Superdense Coding",
      ],
      module2Preview: [
        "Unit 2.1: Quantum Oracle Mechanism",
        "Unit 2.2: Deutsch-Jozsa Algorithm",
        "Unit 2.3: Bernstein-Vazirani Algorithm",
        "Unit 2.4: Simon's Algorithm",
        "Unit 2.5: Grover's Search Algorithm",
        "Unit 2.6: Quantum Fourier Transform (QFT)",
        "Unit 2.7: Shor's Factoring Algorithm",
      ],
    },
    metadata: {
      moduleCompleted: "Module 1: Foundations of Quantum Information",
      nextModule: "Module 2: Quantum Algorithms & Computational Advantage",
    },
  },
];

export default units8to10Stages;
