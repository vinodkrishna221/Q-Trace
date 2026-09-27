/**
 * Curriculum Registry & Stage Data Engine for Units 1.4 to 1.5
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

/**
 * Pauli & Single-Qubit Gate Matrix Definitions
 * Truth tables and unitary operator representations
 */
export const GATE_MATRICES = {
  I: {
    name: "Identity",
    symbol: "I",
    matrix: [
      [1, 0],
      [0, 1],
    ],
    description: "Leaves qubit state unchanged (zero rotation).",
  },
  X: {
    name: "Pauli-X",
    symbol: "X",
    matrix: [
      [0, 1],
      [1, 0],
    ],
    description: "Quantum NOT gate. 180° rotation around X-axis. X|0⟩ = |1⟩, X|1⟩ = |0⟩.",
  },
  Y: {
    name: "Pauli-Y",
    symbol: "Y",
    matrix: [
      [0, "-i"],
      ["i", 0],
    ],
    description: "Bit and phase flip. 180° rotation around Y-axis. Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩.",
  },
  Z: {
    name: "Pauli-Z",
    symbol: "Z",
    matrix: [
      [1, 0],
      [0, -1],
    ],
    description: "Phase flip gate. 180° rotation around Z-axis. Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩.",
  },
  H: {
    name: "Hadamard",
    symbol: "H",
    matrix: [
      [1 / Math.SQRT2, 1 / Math.SQRT2],
      [1 / Math.SQRT2, -1 / Math.SQRT2],
    ],
    latexMatrix: "\\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}",
    description: "Superposition generator. Rotates 90° around Y followed by 180° around X. H|0⟩ = |+⟩, H|1⟩ = |-⟩.",
  },
  S: {
    name: "Phase (S)",
    symbol: "S",
    matrix: [
      [1, 0],
      [0, "i"],
    ],
    description: "Quarter-turn phase gate (90° / π/2 around Z-axis). S = √Z.",
  },
  T: {
    name: "T Gate",
    symbol: "T",
    matrix: [
      [1, 0],
      [0, "e^(iπ/4)"],
    ],
    description: "Eighth-turn phase gate (45° / π/4 around Z-axis). T = √S = Z^(1/4).",
  },
};

export const UNITS_4_TO_5_STAGES: CurriculumStage[] = [
  // =========================================================================
  // UNIT 1.4: The Bloch Sphere (The Quantum Compass)
  // =========================================================================
  {
    id: "mod1_bloch_sphere_intro",
    lessonId: "mod1_bloch_sphere_intro",
    unitId: "unit_1_4",
    stageNumber: "1.4.1",
    category: "Bloch Sphere",
    archetype: "NODE_CONCEPT",
    title: "Visualizing a Qubit in 3D: The Bloch Sphere",
    estimatedMinutes: 4,
    coherenceReward: 40,
    shieldReward: 15,
    analogyHook:
      "Imagine holding a geographic globe of Planet Earth in your hands. The North Pole is state |0⟩. The South Pole is state |1⟩. The Equator is the vibrant ring where equal superpositions live. Just as every point on Earth has an address, every single-qubit quantum state has a unique address on this quantum sphere.",
    conceptSummary:
      "Because quantum state normalization dictates |α|² + |β|² = 1, any single-qubit pure state can be represented as a vector of length r = 1.0 pointing to the surface of a unit sphere in 3D Euclidean space: the Bloch Sphere. Basis states |0⟩ and |1⟩ form the antipodal North and South poles along the vertical Z-axis, while superposition states lie along the equator and surrounding latitudes.",
    predictionCheckpoint: {
      id: "pc_bloch_sphere_intro",
      prompt:
        "Where on the Bloch sphere does the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2 live?",
      options: [
        {
          id: "EQUATOR",
          text: "On the equator (intersection of the sphere surface with the XY plane, along the +X axis).",
          correct: true,
        },
        {
          id: "NORTH_POLE",
          text: "At the North Pole (Z = +1).",
          correct: false,
        },
        {
          id: "SOUTH_POLE",
          text: "At the South Pole (Z = -1).",
          correct: false,
        },
        {
          id: "SPHERE_CENTER",
          text: "At the exact geometric center (origin) inside the sphere.",
          correct: false,
        },
      ],
      explanation:
        "The North Pole is |0⟩ and the South Pole is |1⟩. Equal superpositions have equal probabilities (|α|² = |β|² = 0.5), which correspond geometrically to points lying along the equator where polar angle θ = π/2.",
      misconceptionMap: {
        NORTH_POLE:
          "The North Pole is exclusively the basis state |0⟩ with zero amplitude in |1⟩.",
        SOUTH_POLE:
          "The South Pole is exclusively the basis state |1⟩ with zero amplitude in |0⟩.",
        SPHERE_CENTER:
          "Points inside the sphere represent mixed (incoherent) states, whereas pure single-qubit states always have unit radius r = 1.0 on the surface.",
      },
    },
    misconceptionHandled:
      "Assuming superpositions point somewhere outside the unit sphere or inside the core rather than on the equator surface.",
    metadata: {
      blochCoordinates: {
        northPole: { state: "|0⟩", coordinates: [0, 0, 1] },
        southPole: { state: "|1⟩", coordinates: [0, 0, -1] },
        equatorPlus: { state: "|+⟩", coordinates: [1, 0, 0] },
      },
      radius: 1.0,
    },
  },
  {
    id: "mod1_bloch_coordinates",
    lessonId: "mod1_bloch_coordinates",
    unitId: "unit_1_4",
    stageNumber: "1.4.2",
    category: "Bloch Sphere",
    archetype: "NODE_CONCEPT",
    title: "Latitude θ (Probabilities) & Longitude φ (Relative Phase)",
    estimatedMinutes: 5,
    coherenceReward: 45,
    shieldReward: 15,
    analogyHook:
      "GPS navigation relies on two angles: latitude (how far North or South of the equator) and longitude (how far East or West around the prime meridian). On the Bloch Sphere, latitude angle θ dictates your measurement probabilities, while longitude angle φ sets your hidden quantum phase.",
    conceptSummary:
      "Any pure state is parameterized as |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩. The polar angle θ (0 ≤ θ ≤ π) controls latitude: θ=0 is |0⟩, θ=π is |1⟩, and θ=π/2 is the equator (equal 50/50 superposition). The azimuthal angle φ (0 ≤ φ < 2π) controls longitude, representing the relative quantum phase between basis states around the Z-axis.",
    predictionCheckpoint: {
      id: "pc_bloch_coordinates",
      prompt:
        "If you change only the longitude angle φ while keeping latitude θ fixed at π/2 (on the equator), what happens to the measurement probabilities in the standard { |0⟩, |1⟩ } basis?",
      options: [
        {
          id: "UNCHANGED_50_50",
          text: "The measurement probabilities remain exactly 50% |0⟩ and 50% |1⟩.",
          correct: true,
        },
        {
          id: "COLLAPSE_TO_ZERO",
          text: "The state collapses to 100% |0⟩.",
          correct: false,
        },
        {
          id: "RANDOM_FLUCTUATION",
          text: "The probabilities fluctuate between 0% and 100% depending on φ.",
          correct: false,
        },
      ],
      explanation:
        "In the computational basis, P(0) = |cos(θ/2)|² and P(1) = |e^(iφ)sin(θ/2)|² = |sin(θ/2)|² because |e^(iφ)|² = 1. Relative phase φ does not affect standard Z-axis measurement probabilities.",
      misconceptionMap: {
        COLLAPSE_TO_ZERO:
          "Rotating longitude around the Z-axis alters relative phase, not the polar projection along the Z-axis.",
        RANDOM_FLUCTUATION:
          "Standard Z-basis measurement is invariant under phase rotation around the Z-axis.",
      },
    },
    misconceptionHandled:
      "Confusing relative phase (longitude φ) with basis probability distribution (latitude θ).",
    metadata: {
      formula: "|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩",
      polarAngleRange: "0 <= θ <= π",
      azimuthalAngleRange: "0 <= φ < 2π",
      equatorAngle: "θ = π/2",
    },
  },
  {
    id: "mod1_bloch_sandbox",
    lessonId: "mod1_bloch_sandbox",
    unitId: "unit_1_4",
    stageNumber: "1.4.3",
    category: "Bloch Sphere",
    archetype: "NODE_GATE_LAB",
    title: "Interactive Bloch Compass Sandbox",
    estimatedMinutes: 5,
    coherenceReward: 50,
    shieldReward: 20,
    analogyHook:
      "Think of an aircraft artificial horizon instrument. Pitch tilts the nose up or down (latitude θ), while yaw rotates the heading compass (longitude φ). In this sandbox, you take the flight stick of a single qubit in 3D Euclidean space.",
    conceptSummary:
      "Drag the Bloch vector slider in 3D. Watch how changing latitude alters the measurement bar chart, while rotating longitude around the equator changes phase without altering the 50/50 measurement probabilities! Cartesian coordinates relate via x = sin(θ)cos(φ), y = sin(θ)sin(φ), z = cos(θ).",
    handsOnLab: {
      codeSnippet:
        "# Q-Trace Bloch Compass State Preparation\nfrom qiskit import QuantumCircuit\nimport numpy as np\n\n# Rotate to equator (theta = pi/2) and set longitude phase phi = pi/4\nqc = QuantumCircuit(1)\nqc.ry(np.pi / 2, 0)  # Tilt polar angle theta\nqc.rz(np.pi / 4, 0)  # Rotate azimuthal phase phi",
      witnessDescription:
        "Bloch coordinates: x = sin(θ)cos(φ) = 0.707, y = sin(θ)sin(φ) = 0.707, z = cos(θ) = 0.0 with fidelity F = 1.0.",
      instructions:
        "Interact with the 3D Bloch vector controls. Notice that state |+⟩ lies at (1, 0, 0) along the positive X-axis.",
    },
    predictionCheckpoint: {
      id: "pc_bloch_sandbox",
      prompt:
        "What are the Cartesian coordinates (x, y, z) of state |+⟩ = (|0⟩ + |1⟩)/√2 on the Bloch sphere?",
      options: [
        {
          id: "PLUS_STATE_COORDS",
          text: "(x = 1, y = 0, z = 0) on the positive X-axis.",
          correct: true,
        },
        {
          id: "ZERO_STATE_COORDS",
          text: "(x = 0, y = 0, z = 1) at the North pole.",
          correct: false,
        },
        {
          id: "MINUS_STATE_COORDS",
          text: "(x = -1, y = 0, z = 0) on the negative X-axis.",
          correct: false,
        },
      ],
      explanation:
        "For state |+⟩, θ = π/2 and φ = 0. Therefore x = sin(π/2)cos(0) = 1, y = sin(π/2)sin(0) = 0, and z = cos(π/2) = 0.",
      misconceptionMap: {
        ZERO_STATE_COORDS:
          "(0, 0, 1) is the North Pole corresponding to state |0⟩.",
        MINUS_STATE_COORDS:
          "(-1, 0, 0) corresponds to state |-⟩ = (|0⟩ - |1⟩)/√2.",
      },
    },
    misconceptionHandled:
      "Thinking state |+⟩ points along the Z-axis rather than along the positive X-axis on the equator.",
    metadata: {
      cartesianFormula: "x = sin(θ)cos(φ), y = sin(θ)sin(φ), z = cos(θ)",
      statePlusCoords: [1, 0, 0],
      stateMinusCoords: [-1, 0, 0],
    },
  },

  // =========================================================================
  // UNIT 1.5: Single-Qubit Logic Gates (Rotations in Space)
  // =========================================================================
  {
    id: "mod1_gate_x",
    lessonId: "mod1_gate_x",
    unitId: "unit_1_5",
    stageNumber: "1.5.1",
    category: "Single-Qubit Gates",
    archetype: "NODE_GATE_LAB",
    title: "The Classical Bit-Flip: Pauli-X Gate",
    estimatedMinutes: 3,
    coherenceReward: 45,
    shieldReward: 15,
    analogyHook:
      "A classical light switch: flicking it flips OFF (0) to ON (1), and ON (1) to OFF (0). In quantum computing, the Pauli-X gate performs this exact bit-flip by rotating the state vector 180° around the X-axis of the Bloch sphere.",
    conceptSummary:
      "The Pauli-X gate is the quantum NOT gate. Matrix: [[0, 1], [1, 0]]. It maps X|0⟩ = |1⟩ and X|1⟩ = |0⟩. On the Bloch sphere, it performs a 180° (π radians) rotation around the X-axis, carrying a state from the North Pole (0, 0, 1) to the South Pole (0, 0, -1).",
    handsOnLab: {
      codeSnippet:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1, 1)\nqc.x(0)  # Apply Pauli-X NOT gate\nqc.measure(0, 0)",
      witnessDescription:
        "100% measurement probability in outcome '1', Bloch vector at (0, 0, -1).",
      instructions:
        "Drag gate [X] onto wire q0. Run simulation on Qiskit Aer and verify 100% collapse into |1⟩.",
    },
    predictionCheckpoint: {
      id: "pc_gate_x",
      prompt:
        "What is the measurement outcome of applying Pauli-X to the ground state |0⟩?",
      options: [
        {
          id: "RESULT_ONE",
          text: "|1⟩ with 100% deterministic probability.",
          correct: true,
        },
        {
          id: "RESULT_ZERO",
          text: "|0⟩ with 100% probability (unchanged).",
          correct: false,
        },
        {
          id: "SUPERPOSITION_EQUAL",
          text: "An equal 50/50 superposition (|0⟩ + |1⟩)/√2.",
          correct: false,
        },
      ],
      explanation:
        "Pauli-X flips amplitudes: [[0, 1], [1, 0]] · [1, 0]ᵀ = [0, 1]ᵀ = |1⟩. Measurement yields 1 with 100% probability.",
      misconceptionMap: {
        RESULT_ZERO:
          "Pauli-X is a flip gate; it does not leave |0⟩ unchanged.",
        SUPERPOSITION_EQUAL:
          "Hadamard creates superposition; Pauli-X is a discrete deterministic bit-flip.",
      },
    },
    misconceptionHandled:
      "Confusing Pauli-X (quantum NOT bit-flip) with Hadamard (superposition generator).",
    metadata: {
      gate: "X",
      matrix: [
        [0, 1],
        [1, 0],
      ],
      rotationAxis: "X",
      rotationAngle: "π (180°)",
    },
  },
  {
    id: "superposition",
    lessonId: "superposition",
    unitId: "unit_1_5",
    stageNumber: "1.5.2",
    category: "Single-Qubit Gates",
    archetype: "NODE_GATE_LAB",
    title: "The Superposition Generator: Hadamard (H) Gate",
    route: "/learn/superposition",
    estimatedMinutes: 5,
    coherenceReward: 55,
    shieldReward: 20,
    analogyHook:
      "Spinning a balanced coin on a glass tabletop. Before spinning, it rested flat as heads |0⟩. While spinning, it is neither purely heads nor tails, but an equal blend of both possibilities waiting for an observation to catch it.",
    conceptSummary:
      "The cornerstone gate of quantum computing. The Hadamard (H) gate rotates a state 90° around the Y-axis followed by 180° around the X-axis: H = (1/√2)[[1, 1], [1, -1]]. It maps H|0⟩ = |+⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = |-⟩ = (|0⟩ - |1⟩)/√2. Geometrically, it moves the vector from the North Pole (0, 0, 1) directly onto the X-axis equator (1, 0, 0).",
    handsOnLab: {
      codeSnippet:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1, 1)\nqc.h(0)  # Transform ground state to superposition\nqc.measure(0, 0)",
      witnessDescription:
        "Equal 50% |0⟩ and 50% |1⟩ distribution across 1024 shots. Statevector at (|0⟩ + |1⟩)/√2.",
      instructions:
        "Apply gate [H] to wire q0. Observe statevector movement from North Pole to the equator.",
    },
    predictionCheckpoint: {
      id: "pc_superposition_h",
      prompt:
        "When a Hadamard (H) gate is applied to ground state |0⟩, what state is produced?",
      options: [
        {
          id: "PLUS_STATE",
          text: "|+⟩ = (|0⟩ + |1⟩)/√2, yielding 50/50 measurement probabilities.",
          correct: true,
        },
        {
          id: "MINUS_STATE",
          text: "|-⟩ = (|0⟩ - |1⟩)/√2, with a relative negative phase.",
          correct: false,
        },
        {
          id: "DETERMINISTIC_1",
          text: "|1⟩ with 100% deterministic probability.",
          correct: false,
        },
      ],
      explanation:
        "H|0⟩ = (1/√2)(|0⟩ + |1⟩) = |+⟩. Both basis states have amplitude 1/√2, yielding probabilities |1/√2|² = 0.5 each.",
      misconceptionMap: {
        MINUS_STATE:
          "H|1⟩ produces |-⟩; H|0⟩ produces |+⟩ with a positive relative phase.",
        DETERMINISTIC_1:
          "Hadamard creates an equal superposition, not a deterministic bit-flip.",
      },
    },
    misconceptionHandled:
      "Thinking Hadamard acts like a classical coin toss rather than a deterministic unitary rotation into the |+⟩ state.",
    metadata: {
      route: "/learn/superposition",
      gate: "H",
      matrix: [
        [1 / Math.SQRT2, 1 / Math.SQRT2],
        [1 / Math.SQRT2, -1 / Math.SQRT2],
      ],
      blochDestination: [1, 0, 0],
    },
  },
  {
    id: "mod1_gate_h_reversibility",
    lessonId: "mod1_gate_h_reversibility",
    unitId: "unit_1_5",
    stageNumber: "1.5.3",
    category: "Single-Qubit Gates",
    archetype: "NODE_PREDICTION",
    title: "Reversibility: Why H · H = I",
    estimatedMinutes: 4,
    coherenceReward: 45,
    shieldReward: 15,
    analogyHook:
      "Imagine turning an optical polarizing filter 45° to split light, and immediately passing it through a matched inverse filter that recombines the beams. In quantum physics, operations are not lossy like wiping chalk off a board; every gate is fully reversible.",
    conceptSummary:
      "Quantum mechanics is fundamentally reversible. Every quantum gate is represented by a unitary matrix (U† U = I). Because H is both Hermitian and unitary, H = H† = H⁻¹. Applying two Hadamard gates in a row restores the exact initial state: H(H|0⟩) = I|0⟩ = |0⟩.",
    predictionCheckpoint: {
      id: "pc_gate_h_reversibility",
      prompt:
        "If you apply two Hadamard gates in series to |0⟩ (`H -> H`), what will you measure?",
      options: [
        {
          id: "DETERMINISTIC_0",
          text: "100% |0⟩ (Constructive and destructive interference cancels the superposition).",
          correct: true,
        },
        {
          id: "RANDOM_50_50",
          text: "Still 50% |0⟩ and 50% |1⟩.",
          correct: false,
        },
        {
          id: "ALWAYS_1",
          text: "It flips to |1⟩.",
          correct: false,
        },
      ],
      explanation:
        "Because H · H = I, applying two consecutive Hadamard gates completely uncomputes the superposition through interference, restoring |0⟩ with 100% certainty.",
      misconceptionMap: {
        RANDOM_50_50:
          "Assuming that applying a randomizing gate twice makes the outcome 'twice as random' ignores quantum phase interference.",
        ALWAYS_1:
          "Two Hadamards do not act like a Pauli-X gate; they cancel each other out to Identity.",
      },
    },
    misconceptionHandled:
      "Assuming that applying a randomizing gate twice makes the outcome 'twice as random'.",
    metadata: {
      unitaryCheck: "H · H = I",
      matrixMultiplication:
        "[[1, 1], [1, -1]] · [[1, 1], [1, -1]] / 2 = [[2, 0], [0, 2]] / 2 = [[1, 0], [0, 1]]",
    },
  },
  {
    id: "mod1_gate_z",
    lessonId: "mod1_gate_z",
    unitId: "unit_1_5",
    stageNumber: "1.5.4",
    category: "Single-Qubit Gates",
    archetype: "NODE_PREDICTION",
    title: "The Hidden Dimension: Pauli-Z Gate & Phase Flips",
    estimatedMinutes: 4,
    coherenceReward: 50,
    shieldReward: 20,
    analogyHook:
      "Two identical acoustic tones played through two speakers. In phase, they reinforce each other into double volume. But flip the phase of one speaker by 180°, and their sound waves cancel into complete silence. The Pauli-Z gate flips quantum phase without altering sound volume (basis probability).",
    conceptSummary:
      "The Pauli-Z gate leaves state |0⟩ unchanged, but multiplies state |1⟩ by -1: Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩. Matrix: [[1, 0], [0, -1]]. When applied to |+⟩, it produces |-⟩ = (|0⟩ - |1⟩)/√2. Measuring |-⟩ in the computational basis STILL yields 50% |0⟩ and 50% |1⟩! Why does Z matter? Because applying H afterwards yields H|+⟩ = |0⟩ while H|-⟩ = |1⟩. Phase is invisible to standard measurement, but dictates quantum interference!",
    predictionCheckpoint: {
      id: "pc_gate_z_phase",
      prompt:
        "If you apply Pauli-Z to state |+⟩ = (|0⟩ + |1⟩)/√2, then measure the qubit in the computational basis, what is the probability of measuring |0⟩?",
      options: [
        {
          id: "EQUAL_FIFTY_PERCENT",
          text: "50% (the phase flip does not alter standard computational basis probabilities).",
          correct: true,
        },
        {
          id: "ZERO_PERCENT",
          text: "0% (the state collapses directly to |1⟩).",
          correct: false,
        },
        {
          id: "ONE_HUNDRED_PERCENT",
          text: "100% (the minus sign cancels out state |1⟩).",
          correct: false,
        },
      ],
      explanation:
        "Z|+⟩ = |-⟩ = (|0⟩ - |1⟩)/√2. Under the Born rule, P(0) = |1/√2|² = 0.5 and P(1) = |-1/√2|² = 0.5. Phase is invisible to direct measurement.",
      misconceptionMap: {
        ZERO_PERCENT:
          "Pauli-Z flips relative phase, not the computational measurement probabilities.",
        ONE_HUNDRED_PERCENT:
          "The minus sign is a relative phase on |1⟩, not amplitude destruction.",
      },
    },
    misconceptionHandled:
      "Believing phase flips immediately change measurement probabilities in the standard computational basis.",
    metadata: {
      gate: "Z",
      matrix: [
        [1, 0],
        [0, -1],
      ],
      phaseInvisibilityInsight:
        "Measuring |+⟩ yields 50/50. Applying Z gives |-⟩, which still measures 50/50. But H|+⟩ = |0⟩ while H|-⟩ = |1⟩.",
    },
  },
  {
    id: "mod1_gate_y",
    lessonId: "mod1_gate_y",
    unitId: "unit_1_5",
    stageNumber: "1.5.5",
    category: "Single-Qubit Gates",
    archetype: "NODE_GATE_LAB",
    title: "The Pauli-Y Gate: Bit-and-Phase Flip",
    estimatedMinutes: 3,
    coherenceReward: 40,
    shieldReward: 15,
    analogyHook:
      "Taking a globe and tilting it sideways so that the equator rolls along the imaginary plane. Pauli-Y combines the bit-flip of X with the phase-flip of Z, rotating through the complex axis.",
    conceptSummary:
      "Combines a bit-flip and a phase-flip with an imaginary unit i = √(-1): Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩. Matrix: [[0, -i], [i, 0]]. Rotates the state 180° around the Y-axis into the imaginary plane of the Bloch sphere.",
    handsOnLab: {
      codeSnippet:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.y(0)  # 180-degree rotation around Y-axis into complex plane",
      witnessDescription:
        "Statevector [0, 1j]. Bloch vector points to (0, 0, -1) when measured along Z, but phase lies along Y.",
      instructions:
        "Apply gate [Y] to wire q0 and inspect the imaginary amplitude component.",
    },
    predictionCheckpoint: {
      id: "pc_gate_y",
      prompt:
        "What is the mathematical result of applying Pauli-Y to ground state |0⟩ = [1, 0]ᵀ?",
      options: [
        {
          id: "IMAGINARY_ONE",
          text: "[0, i]ᵀ (state i|1⟩ with an imaginary amplitude).",
          correct: true,
        },
        {
          id: "REAL_ONE",
          text: "[0, 1]ᵀ (state |1⟩ with purely real amplitude).",
          correct: false,
        },
        {
          id: "MINUS_ZERO",
          text: "[-1, 0]ᵀ (state -|0⟩).",
          correct: false,
        },
      ],
      explanation:
        "Y[[1], [0]] = [[0, -i], [i, 0]] · [1, 0]ᵀ = [0, i]ᵀ = i|1⟩. It performs both a bit-flip and an imaginary phase shift.",
      misconceptionMap: {
        REAL_ONE:
          "Pauli-Y introduces an imaginary phase factor i, unlike Pauli-X which produces a purely real 1.",
        MINUS_ZERO:
          "Y flips the bit from |0⟩ to |1⟩ along with adding the phase factor i.",
      },
    },
    misconceptionHandled:
      "Ignoring complex/imaginary components in quantum statevectors.",
    metadata: {
      gate: "Y",
      matrix: [
        [0, "-i"],
        ["i", 0],
      ],
      rotationAxis: "Y",
      rotationAngle: "π (180°)",
    },
  },
  {
    id: "mod1_phase_gates_s_t",
    lessonId: "mod1_phase_gates_s_t",
    unitId: "unit_1_5",
    stageNumber: "1.5.6",
    category: "Single-Qubit Gates",
    archetype: "NODE_CONCEPT",
    title: "Fine-Tuning Rotations: S and T Phase Gates",
    estimatedMinutes: 4,
    coherenceReward: 45,
    shieldReward: 15,
    analogyHook:
      "If Pauli-Z is making a full 180° U-turn on the equator, the S gate is taking a crisp 90° right turn, and the T gate is nudging your steering wheel 45°. Combining these fine turns with Hadamard gives you the power to steer a qubit to any point on the sphere.",
    conceptSummary:
      "The Z gate is a half-turn (180°) around the Z-axis. The S Gate is a quarter-turn (90°, or π/2): S = √Z, matrix [[1, 0], [0, i]]. The T Gate is an eighth-turn (45°, or π/4): T = √S, matrix [[1, 0], [0, e^(iπ/4)]]. Together with the Hadamard gate, T gates form a universal quantum gate set (Solovay-Kitaev theorem).",
    predictionCheckpoint: {
      id: "pc_phase_gates_s_t",
      prompt:
        "How many T gates applied in series are mathematically equivalent to a single Pauli-Z gate?",
      options: [
        {
          id: "FOUR_T_GATES",
          text: "4 T gates (each contributes π/4 rotation; 4 × π/4 = π = 180°).",
          correct: true,
        },
        {
          id: "TWO_T_GATES",
          text: "2 T gates (each is π/4; 2 × π/4 = π/2, which is an S gate).",
          correct: false,
        },
        {
          id: "EIGHT_T_GATES",
          text: "8 T gates (that equals a full 2π rotation, which is Identity).",
          correct: false,
        },
      ],
      explanation:
        "T = Rz(π/4). Applying 4 T gates gives Rz(4 × π/4) = Rz(π) = Z (up to a global phase). S = T² and Z = S² = T⁴.",
      misconceptionMap: {
        TWO_T_GATES:
          "2 T gates yield S = Rz(π/2), a quarter turn, not a full half-turn Z.",
        EIGHT_T_GATES:
          "8 T gates produce a 2π rotation which returns to the identity I.",
      },
    },
    misconceptionHandled:
      "Thinking T gate is a quarter-turn rather than an eighth-turn (45°), or confusing S and T powers.",
    metadata: {
      sGateMatrix: [
        [1, 0],
        [0, "i"],
      ],
      tGateMatrix: [
        [1, 0],
        [0, "e^(iπ/4)"],
      ],
      hierarchy: "T⁴ = S² = Z",
      universalSet: "{H, T}",
    },
  },
  {
    id: "mod1_boss_qrng",
    lessonId: "mod1_boss_qrng",
    unitId: "unit_1_5",
    stageNumber: "1.5.7",
    category: "Capstone Boss",
    archetype: "NODE_MILESTONE",
    title: "Unit 1 Milestone Boss: True Quantum Random Number Generator (QRNG)",
    estimatedMinutes: 6,
    coherenceReward: 100,
    shieldReward: 50,
    analogyHook:
      "Rolling two physical quantum dice simultaneously. Unlike pseudo-random computer algorithms (PRNGs) which are deterministic and crackable if you know the seed, a QRNG harnesses fundamental quantum indeterminism to generate true, unpredictable entropy.",
    conceptSummary:
      "Construct a true Quantum Random Number Generator that outputs 2 random classical bits (00, 01, 10, 11) with an equal 25% distribution using only single-qubit gates and measurements. Acceptance criteria: executes on Qiskit Aer across 1024 shots, all 4 outcomes in [20%, 30%] tolerance, zero CNOT used, statevector fidelity F >= 0.99.",
    handsOnLab: {
      codeSnippet:
        "from qiskit import QuantumCircuit, Aer, execute\n\n# 2-Qubit Quantum Random Number Generator\nqc = QuantumCircuit(2, 2)\nqc.h(0)  # Superposition on bit 0\nqc.h(1)  # Superposition on bit 1\nqc.measure([0, 1], [0, 1])",
      witnessDescription:
        "Equal 25% distribution across |00⟩, |01⟩, |10⟩, |11⟩. Zero entanglement (purity = 1.0, mutual information = 0.0).",
      instructions:
        "Place an H gate on wire 0 and an H gate on wire 1. Measure both qubits into classical register. Verify 4 distinct outcomes in [20%, 30%] tolerance.",
    },
    predictionCheckpoint: {
      id: "pc_boss_qrng",
      prompt:
        "To generate 2 independent random bits (outcomes 00, 01, 10, 11 with 25% probability each), what gates must be placed on qubits q0 and q1?",
      options: [
        {
          id: "TWO_HADAMARDS",
          text: "Apply H to q0 and H to q1 (no two-qubit entanglement gates).",
          correct: true,
        },
        {
          id: "HADAMARD_AND_CNOT",
          text: "Apply H to q0 followed by CNOT(0, 1) (creates Bell state: only 00 and 11).",
          correct: false,
        },
        {
          id: "TWO_PAULI_X",
          text: "Apply X to q0 and X to q1 (deterministic 11 outcome).",
          correct: false,
        },
      ],
      explanation:
        "Two independent Hadamard gates H ⊗ H create state (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2, yielding an exact 25% probability for each of the four 2-bit outcomes without any inter-qubit correlation.",
      misconceptionMap: {
        HADAMARD_AND_CNOT:
          "CNOT creates entanglement where outcomes are correlated to only 00 and 11 (50% each), missing 01 and 10.",
        TWO_PAULI_X:
          "Pauli-X produces deterministic bit-flips without generating random entropy.",
      },
    },
    misconceptionHandled:
      "Thinking a QRNG requires multi-qubit entanglement gates like CNOT rather than independent single-qubit superpositions.",
    metadata: {
      bossChallenge: true,
      milestoneType: "UNIT_1_CAPSTONE",
      shotsRequired: 1024,
      fidelityThreshold: 0.99,
      statevectorFidelity: 0.99,
      allowedOutcomeTolerance: [0.2, 0.3],
      expectedOutcomes: ["00", "01", "10", "11"],
      expectedProbability: 0.25,
      allowedGateTypes: ["h", "measure"],
      prohibitedGateTypes: ["cx", "cnot", "cz", "swap"],
      zeroCnotRequirement: true,
      circuitCode:
        "qc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.h(1)\nqc.measure([0, 1], [0, 1])",
    },
  },
];

export const units4To5Stages = UNITS_4_TO_5_STAGES;

export const UNITS_4_TO_5_META: CurriculumUnitInfo[] = [
  {
    id: "unit_1_4",
    unitNumber: 1,
    subUnitNumber: 4,
    title: "The Bloch Sphere",
    subtitle: "The Quantum Compass & 3D Statevector Coordinates",
    stages: UNITS_4_TO_5_STAGES.filter((s) => s.unitId === "unit_1_4"),
  },
  {
    id: "unit_1_5",
    unitNumber: 1,
    subUnitNumber: 5,
    title: "Single-Qubit Logic Gates",
    subtitle: "Rotations in Space, Unitary Reversibility & The QRNG Boss",
    stages: UNITS_4_TO_5_STAGES.filter((s) => s.unitId === "unit_1_5"),
  },
];

/**
 * Retrieve a stage in Units 4-5 by its unique id or lessonId slug
 */
export function getStageById(stageOrLessonId: string): CurriculumStage | undefined {
  return UNITS_4_TO_5_STAGES.find(
    (s) => s.id === stageOrLessonId || s.lessonId === stageOrLessonId
  );
}

/**
 * Retrieve all stages belonging to a specific unit (e.g. 'unit_1_4' or 'unit_1_5')
 */
export function getStagesByUnit(unitId: string): CurriculumStage[] {
  return UNITS_4_TO_5_STAGES.filter((s) => s.unitId === unitId);
}

export default UNITS_4_TO_5_STAGES;
