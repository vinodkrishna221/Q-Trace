/**
 * Curriculum Registry & Stage Data Engine for Units 1.1 to 1.3
 * Conforms to docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md Section 3
 * and board/contracts/learning-content.md
 */

import {
  CurriculumStage,
  CurriculumUnitInfo,
  PredictionCheckpointOption,
  StageArchetype,
  StagePredictionCheckpoint,
} from "./types";

export * from "./types";

export const UNITS_1_TO_3_STAGES: CurriculumStage[] = [
  // =========================================================================
  // UNIT 1.1: What is "Quantum"? (The Macro vs. Micro Physics)
  // =========================================================================
  {
    id: "mod1_transistor_limits",
    lessonId: "mod1_transistor_limits",
    unitId: "unit_1_1",
    stageNumber: "1.1.1",
    category: "Foundation",
    archetype: "NODE_CONCEPT",
    title: "Why Quantum? The Death of Moore's Law & Silicon Transistor Limits",
    estimatedMinutes: 3,
    coherenceReward: 30,
    shieldReward: 10,
    analogyHook:
      "Think of an automated factory where conveyor belts move water droplets. As pipes shrink to microscopic diameters, water no longer flows smoothly — it starts spraying unpredictably through leaks. In microchips, as transistors shrink below 2nm (the size of a single DNA strand), electrons simply 'leak' right through closed gates via quantum tunneling.",
    conceptSummary:
      "Classical computers are built from billions of microscopic electrical switches (transistors) representing 0 (low voltage) and 1 (high voltage). Because silicon transistors have reached atomic limits, classical scaling is stalling. Instead of fighting quantum mechanics, quantum computers harness quantum properties to solve problems that scale exponentially — such as molecular folding for medicine, battery materials, and optimization.",
    predictionCheckpoint: {
      id: "pc_transistor_limits",
      prompt:
        "Why can't classical computers simply keep doubling clock speeds and shrinking transistors forever?",
      options: [
        {
          id: "ATOMIC_TUNNELING_LIMIT",
          text: "At atomic scales, electrons jump barriers via quantum tunneling, preventing clean OFF states.",
          correct: true,
        },
        {
          id: "RAM_BANDWIDTH",
          text: "RAM buses cannot transfer data faster than 64 bits.",
          correct: false,
        },
        {
          id: "SOFTWARE_COMPLEXITY",
          text: "Operating systems have too many lines of code.",
          correct: false,
        },
      ],
      explanation:
        "At sub-2nm scales, quantum mechanical tunneling permits electrons to cross insulating barriers, destroying classical binary switching fidelity.",
      misconceptionMap: {
        RAM_BANDWIDTH:
          "RAM bus width affects memory throughput, not the fundamental quantum tunneling limit of silicon gates.",
        SOFTWARE_COMPLEXITY:
          "Software volume has no physical bearing on atomic semiconductor gate leakage.",
      },
    },
    misconceptionHandled:
      "Believing classical hardware limits are purely software or cooling issues rather than fundamental atomic physics.",
  },
  {
    id: "mod1_wave_particle",
    lessonId: "mod1_wave_particle",
    unitId: "unit_1_1",
    stageNumber: "1.1.2",
    category: "Foundation",
    archetype: "NODE_CONCEPT",
    title: "Wave-Particle Duality (The Double Slit Experiment Made Simple)",
    estimatedMinutes: 4,
    coherenceReward: 35,
    shieldReward: 10,
    analogyHook:
      "If you toss tennis balls at a wooden fence with two vertical slits, you get two distinct stripes of tennis balls on the back wall. But if you send water ripples toward the two slits, the waves pass through BOTH slits simultaneously, ripple outward, and create an intricate series of bright and dark bands (an interference pattern).",
    conceptSummary:
      "Subatomic particles (electrons, photons) behave like particles when detected, but travel through space like probability waves. When a particle has multiple pathways to a destination, its wave nature explores all pathways, interfering constructively (adding up) or destructively (canceling out).",
    predictionCheckpoint: {
      id: "pc_wave_particle",
      prompt:
        "What produces the alternating light and dark bands on the screen in the double-slit experiment?",
      options: [
        {
          id: "WAVE_INTERFERENCE",
          text: "The crests and troughs of the particle's probability waves reinforce and cancel each other.",
          correct: true,
        },
        {
          id: "PARTICLE_COLLISION",
          text: "Particles bounce off each other mid-air and scatter into stripes.",
          correct: false,
        },
        {
          id: "SLIT_DEFECT",
          text: "Irregularities in the slit edges deflect particles at fixed angles.",
          correct: false,
        },
      ],
      explanation:
        "Interference is wave behavior: constructive crests create bright bands, while destructive cancellations create dark bands.",
      misconceptionMap: {
        PARTICLE_COLLISION:
          "The interference pattern forms even when single particles are fired one by one through the apparatus.",
        SLIT_DEFECT:
          "The interference pattern is produced by geometry and wavelength, independent of microscopic slit edge defects.",
      },
    },
    misconceptionHandled:
      "Assuming particles must follow a single classical trajectory before detection.",
  },
  {
    id: "mod1_discrete_quanta",
    lessonId: "mod1_discrete_quanta",
    unitId: "unit_1_1",
    stageNumber: "1.1.3",
    category: "Foundation",
    archetype: "NODE_CONCEPT",
    title: "Discrete Energy Quanta (The Quantum Leap)",
    estimatedMinutes: 3,
    coherenceReward: 30,
    shieldReward: 10,
    analogyHook:
      "A ramp vs. a flight of stairs. On a ramp, you can stand at any continuous height: 1.2m, 1.25m, 1.257m. On a flight of stairs, you can ONLY stand on step 1, step 2, or step 3 — you cannot float at step 1.5.",
    conceptSummary:
      "'Quantum' comes from the Latin for 'how much.' In the microscopic realm, physical quantities like energy, angular momentum, and electron orbits come in discrete, indivisible packets called quanta. A qubit exploits two specific discrete energy levels of a physical quantum system (ground state |0⟩ and excited state |1⟩).",
    predictionCheckpoint: {
      id: "pc_discrete_quanta",
      prompt:
        "Can an electron in an atom orbit halfway between two discrete quantum energy levels?",
      options: [
        {
          id: "DISCRETE_ONLY",
          text: "No, energy states are quantized; electrons transition between allowed rungs without stable in-between states.",
          correct: true,
        },
        {
          id: "CONTINUOUS_ANY",
          text: "Yes, an electron can remain at any continuous energy level if heated gradually.",
          correct: false,
        },
        {
          id: "ONLY_WITH_OBSERVER",
          text: "Yes, but only when actively observed by a detector.",
          correct: false,
        },
      ],
      explanation:
        "Atomic energy levels are discrete eigenvalues of the Hamiltonian; bound electrons cannot occupy forbidden intermediate energy states.",
      misconceptionMap: {
        CONTINUOUS_ANY:
          "Continuous energy transitions occur in classical mechanics, not in bound quantum eigenstates.",
        ONLY_WITH_OBSERVER:
          "Observation does not create continuous intermediate energy levels in bound atomic orbitals.",
      },
    },
    misconceptionHandled:
      "Assuming subatomic systems can take continuous values like classical macroscopic objects.",
  },

  // =========================================================================
  // UNIT 1.2: The Qubit vs. The Classical Bit
  // =========================================================================
  {
    id: "mod1_bit_vs_qubit",
    lessonId: "mod1_bit_vs_qubit",
    unitId: "unit_1_2",
    stageNumber: "1.2.1",
    category: "Qubit Intuition",
    archetype: "NODE_CONCEPT",
    title: "Bits vs. Qubits: The Spinning Coin on the Table",
    estimatedMinutes: 4,
    coherenceReward: 40,
    shieldReward: 15,
    analogyHook:
      "A classical bit is a coin lying flat on the table: it is definitively Heads (0) or Tails (1). A qubit is a coin spinning rapidly on the table. While it is spinning, is it Heads or Tails? Neither! It is in a continuous dynamic state that holds probabilities of both. Slapping your hand down to stop the coin is measurement: it forces the dynamic spinning state to snap into a flat Heads or Tails.",
    conceptSummary:
      "A classical bit stores exactly one binary value: 0 or 1. A qubit (quantum bit) is a two-level quantum system that can exist in a linear combination of basis states until measured.",
    predictionCheckpoint: {
      id: "pc_bit_vs_qubit",
      prompt:
        "While a qubit is spinning in superposition, what happens if you measure it?",
      options: [
        {
          id: "COLLAPSES_TO_DEFINITE_VALUE",
          text: "It instantly collapses to a single definite classical value: 0 or 1.",
          correct: true,
        },
        {
          id: "REMAINS_SPINNING",
          text: "It gives you both 0 and 1 simultaneously on the screen.",
          correct: false,
        },
        {
          id: "DELETED",
          text: "The qubit vanishes from memory.",
          correct: false,
        },
      ],
      explanation:
        "Measurement irreversibly projects the statevector onto one of the classical measurement basis states (|0⟩ or |1⟩).",
      misconceptionMap: {
        REMAINS_SPINNING:
          "Measurement forces the superposition to collapse into a single definite classical bit (0 or 1).",
        DELETED:
          "The physical qubit remains; only its quantum coherence is converted into classical outcome information.",
      },
    },
    misconceptionHandled:
      "REMAINS_SPINNING -> The myth that measurement reveals both values at once.",
  },
  {
    id: "mod1_braket_notation",
    lessonId: "mod1_braket_notation",
    unitId: "unit_1_2",
    stageNumber: "1.2.2",
    category: "Dirac Notation",
    archetype: "NODE_CONCEPT",
    title: "State Vectors & Dirac Bra-Ket Notation for Programmers",
    estimatedMinutes: 5,
    coherenceReward: 45,
    shieldReward: 15,
    analogyHook:
      "Think of Dirac notation as syntactic sugar for array vectors: |0⟩ is shorthand for the column vector [1, 0]^T (Index 0 is 100%). |1⟩ is shorthand for the column vector [0, 1]^T (Index 1 is 100%).",
    conceptSummary:
      "Physicist Paul Dirac invented bra-ket notation to streamline quantum calculations: Ket |ψ⟩ is a column vector representing a quantum state (|0⟩ = [1, 0]^T, |1⟩ = [0, 1]^T). Bra ⟨ψ| is the conjugate transpose row vector (⟨0| = [1, 0]). Bracket ⟨ϕ|ψ⟩ is the inner product (dot product), yielding the probability overlap.",
    predictionCheckpoint: {
      id: "pc_braket_notation",
      prompt:
        "In Dirac notation, which 2D column vector representation corresponds to the basis state |1⟩?",
      options: [
        {
          id: "COLUMN_0_1",
          text: "[0, 1]^T (Index 0 has amplitude 0, Index 1 has amplitude 1).",
          correct: true,
        },
        {
          id: "COLUMN_1_0",
          text: "[1, 0]^T (Index 0 has amplitude 1, Index 1 has amplitude 0).",
          correct: false,
        },
        {
          id: "SCALAR_ONE",
          text: "The scalar integer 1.",
          correct: false,
        },
      ],
      explanation:
        "|1⟩ represents the second standard basis vector in C^2, corresponding to column vector [0, 1]^T.",
      misconceptionMap: {
        COLUMN_1_0:
          "[1, 0]^T corresponds to |0⟩, where amplitude 1 is at index 0.",
        SCALAR_ONE:
          "|1⟩ is a state vector in Hilbert space, not an isolated classical scalar value.",
      },
    },
    misconceptionHandled:
      "Confusing state labels |0⟩ and |1⟩ with scalar numbers 0 and 1 rather than orthogonal basis vectors.",
  },
  {
    id: "mod1_amplitudes_normalization",
    lessonId: "mod1_amplitudes_normalization",
    unitId: "unit_1_2",
    stageNumber: "1.2.3",
    category: "Math Rigor",
    archetype: "NODE_PREDICTION",
    title: "Probability Amplitudes & Normalization",
    estimatedMinutes: 4,
    coherenceReward: 45,
    shieldReward: 20,
    analogyHook:
      "If a pie is sliced into parts, the sum of all slice percentages must equal exactly 100%. In quantum mechanics, the squares of probability amplitudes |α|² + |β|² must sum to 1.0 (100% total probability).",
    conceptSummary:
      "Any single-qubit state |ψ⟩ is written as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex numbers called probability amplitudes. Because total probability must always equal 100% (1.0), all quantum states obey the normalization constraint: |α|² + |β|² = 1.0.",
    predictionCheckpoint: {
      id: "pc_amplitudes_normalization",
      prompt:
        "If α = 1/√2, what MUST β be for |ψ⟩ = α|0⟩ + β|1⟩ to be a valid normalized quantum state obeying |α|² + |β|² = 1?",
      options: [
        {
          id: "PLUS_MINUS_ONE_OVER_SQRT_2",
          text: "± 1/√2, because (1/√2)² + (± 1/√2)² = 0.5 + 0.5 = 1.0.",
          correct: true,
        },
        {
          id: "ZERO",
          text: "β must be 0.",
          correct: false,
        },
        {
          id: "ONE",
          text: "β must be 1.0.",
          correct: false,
        },
      ],
      explanation:
        "|α|² = (1/√2)² = 0.5. To satisfy |α|² + |β|² = 1, |β|² must equal 0.5, so β = ± 1/√2 (or e^(iφ)/√2).",
      misconceptionMap: {
        ZERO:
          "If β = 0, |α|² + |β|² = 0.5 + 0 = 0.5 ≠ 1.0, violating the total probability axiom.",
        ONE:
          "If β = 1.0, |α|² + |β|² = 0.5 + 1.0 = 1.5 > 1.0, creating unphysical probabilities.",
      },
    },
    misconceptionHandled:
      "Assuming probabilities add linearly without squaring amplitudes (α + β = 1 instead of |α|² + |β|² = 1).",
  },

  // =========================================================================
  // UNIT 1.3: Superposition & Wavefunction Collapse
  // =========================================================================
  {
    id: "mod1_superposition_truth",
    lessonId: "mod1_superposition_truth",
    unitId: "unit_1_3",
    stageNumber: "1.3.1",
    category: "Superposition",
    archetype: "NODE_CONCEPT",
    title: "Busting the Myth: Why Superposition is NOT '0 and 1 at the Same Time'",
    estimatedMinutes: 4,
    coherenceReward: 40,
    shieldReward: 15,
    analogyHook:
      "Think of an audio chord on a piano. Playing middle C and G together is not 'middle C and G taking turns,' nor is it a blurred mystery tone. It is a definite, harmonic sound wave composed of two frequencies. Superposition is a single, precise vector pointing in a vector space, composed of two basis vectors.",
    conceptSummary:
      "Superposition is NOT indecision or parallel universes. Mathematically, a qubit is in a single, well-defined physical state vector |ψ⟩ = α|0⟩ + β|1⟩. The uncertainty only arises when we attempt to force this continuous 2D vector onto a 1-bit classical readout device.",
    predictionCheckpoint: {
      id: "pc_superposition_truth",
      prompt:
        "What is the true mathematical nature of a qubit in superposition before measurement?",
      options: [
        {
          id: "DEFINITE_STATE_VECTOR",
          text: "A single, definite, deterministic state vector in a 2D complex vector space.",
          correct: true,
        },
        {
          id: "FLICKERING_RAPIDLY",
          text: "A physical switch flickering between 0 and 1 billions of times per second.",
          correct: false,
        },
        {
          id: "UNKNOWN_UNDEFINED",
          text: "An undefined state that does not physically exist until observed.",
          correct: false,
        },
      ],
      explanation:
        "A qubit in superposition occupies a deterministic vector in Hilbert space; indeterminism only enters during projection/measurement.",
      misconceptionMap: {
        FLICKERING_RAPIDLY:
          "Superposition is a stationary statevector with constant amplitudes and phases, not a high-speed alternating switch.",
        UNKNOWN_UNDEFINED:
          "The statevector is fully defined and unitary operations can rotate it deterministically before measurement.",
      },
    },
    misconceptionHandled:
      "Believing superposition means a physical bit rapidly vibrating between 0 and 1 or having two contradictory values simultaneously.",
  },
  {
    id: "mod1_measurement_collapse",
    lessonId: "mod1_measurement_collapse",
    unitId: "unit_1_3",
    stageNumber: "1.3.2",
    category: "Measurement Lab",
    archetype: "NODE_GATE_LAB",
    title: "Observation Changes Reality: Wavefunction Collapse & The Measurement Problem",
    estimatedMinutes: 4,
    coherenceReward: 50,
    shieldReward: 20,
    analogyHook:
      "Polarized sunglasses. Natural sunlight oscillates in all directions. When it strikes polarized glass, the glass does not 'read' the light's angle — it forces all passing photons to snap into the vertical transmission axis.",
    conceptSummary:
      "In quantum mechanics, measurement is an active physical interaction, not a passive camera snapshot. Measuring a qubit in state |ψ⟩ = α|0⟩ + β|1⟩ forces it to collapse into |0⟩ (with probability |α|²) or |1⟩ (with probability |β|²). Once collapsed, immediate repeat measurements yield the identical collapsed state with 100% certainty.",
    predictionCheckpoint: {
      id: "pc_measurement_collapse",
      prompt:
        "If you measure a qubit in superposition and get '0', what will an immediate second measurement yield?",
      options: [
        {
          id: "ALWAYS_SAME_COLLAPSED_VALUE",
          text: "Guaranteed '0' 100% of the time, because the first measurement collapsed the state.",
          correct: true,
        },
        {
          id: "ANOTHER_50_50_COIN_FLIP",
          text: "Another 50/50 random outcome between 0 and 1.",
          correct: false,
        },
        {
          id: "OPPOSITE_VALUE_1",
          text: "The opposite value '1' due to conservation of probability.",
          correct: false,
        },
      ],
      explanation:
        "Wavefunction collapse is projective; once projected into |0⟩, subsequent measurements in the same basis remain in |0⟩ with probability 1.0.",
      misconceptionMap: {
        ANOTHER_50_50_COIN_FLIP:
          "The first measurement eliminated superposition; consecutive measurements do not reset the state unless a unitary gate is applied.",
        OPPOSITE_VALUE_1:
          "Measurement does not alternate or invert states; it projects and confirms the collapsed state.",
      },
    },
    handsOnLab: {
      codeSnippet: `from qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 2)\nqc.h(0)           # Put in superposition\nqc.measure(0, 0)  # First measurement -> collapses qubit\nqc.measure(0, 1)  # Second measurement -> guarantees 100% same value`,
      witnessDescription:
        "Bits c0 and c1 are guaranteed to match 100% of the time! Once collapsed, subsequent measurements confirm the collapsed state.",
      instructions:
        "Run the dual-measurement circuit on Qiskit Aer to confirm that the second measurement never diverges from the first.",
    },
    misconceptionHandled:
      "Assuming measurement does not alter the quantum state, so repeating measurement immediately would roll the dice again.",
  },
  {
    id: "mod1_born_rule",
    lessonId: "mod1_born_rule",
    unitId: "unit_1_3",
    stageNumber: "1.3.3",
    category: "Math Rigor",
    archetype: "NODE_CONCEPT",
    title: "The Born Rule: Why We Square Amplitudes",
    estimatedMinutes: 4,
    coherenceReward: 40,
    shieldReward: 15,
    analogyHook:
      "Light wave intensity. In classical wave optics, the brightness of light is proportional to the square of the electric field wave amplitude (Intensity ∝ |E|²). Similarly, in quantum mechanics, probability is proportional to the squared magnitude of probability amplitude.",
    conceptSummary:
      "In 1926, Max Born realized that quantum amplitudes are complex numbers (with magnitude and phase: α = a + bi). Probabilities in the physical world must be positive real numbers. The Born Rule states P(0) = |α|² and P(1) = |β|², converting complex amplitudes into observable probabilities.",
    predictionCheckpoint: {
      id: "pc_born_rule",
      prompt:
        "If the state of a qubit has amplitude α = -1/√2 for state |0⟩, what is the probability P(0) of measuring 0?",
      options: [
        {
          id: "PROBABILITY_HALF",
          text: "0.5 (50%), because P(0) = |-1/√2|² = (-1/√2)² = 1/2.",
          correct: true,
        },
        {
          id: "NEGATIVE_PROBABILITY",
          text: "-0.5 (-50%), because the amplitude is negative.",
          correct: false,
        },
        {
          id: "ZERO_PROBABILITY",
          text: "0%, because negative amplitudes cancel out.",
          correct: false,
        },
      ],
      explanation:
        "The Born rule squares the amplitude magnitude: |-1/√2|² = 0.5. Probabilities are strictly non-negative real numbers.",
      misconceptionMap: {
        NEGATIVE_PROBABILITY:
          "Probabilities can never be negative; squaring the amplitude guarantees a non-negative real outcome in [0, 1].",
        ZERO_PROBABILITY:
          "A negative sign indicates phase, not zero probability.",
      },
    },
    misconceptionHandled:
      "Thinking probabilities can be negative or that minus signs in amplitudes destroy probability without squaring.",
  },
];

export const units1To3Stages = UNITS_1_TO_3_STAGES;

export const UNITS_1_TO_3_META: CurriculumUnitInfo[] = [
  {
    id: "unit_1_1",
    unitNumber: 1,
    subUnitNumber: 1,
    title: "What is 'Quantum'?",
    subtitle: "The Macro vs. Micro Physics",
    stages: UNITS_1_TO_3_STAGES.filter((s) => s.unitId === "unit_1_1"),
  },
  {
    id: "unit_1_2",
    unitNumber: 1,
    subUnitNumber: 2,
    title: "The Qubit vs. The Classical Bit",
    subtitle: "Spinning Coins, Dirac Notation & Amplitudes",
    stages: UNITS_1_TO_3_STAGES.filter((s) => s.unitId === "unit_1_2"),
  },
  {
    id: "unit_1_3",
    unitNumber: 1,
    subUnitNumber: 3,
    title: "Superposition & Wavefunction Collapse",
    subtitle: "Wave Mechanics, Polarized Sunglasses & The Born Rule",
    stages: UNITS_1_TO_3_STAGES.filter((s) => s.unitId === "unit_1_3"),
  },
];

/**
 * Retrieve a stage by its unique id or lessonId slug
 */
export function getStageById(stageOrLessonId: string): CurriculumStage | undefined {
  return UNITS_1_TO_3_STAGES.find(
    (s) => s.id === stageOrLessonId || s.lessonId === stageOrLessonId
  );
}

/**
 * Retrieve all stages belonging to a specific unit (e.g. 'unit_1_1')
 */
export function getStagesByUnit(unitId: string): CurriculumStage[] {
  return UNITS_1_TO_3_STAGES.filter((s) => s.unitId === unitId);
}

export default UNITS_1_TO_3_STAGES;
