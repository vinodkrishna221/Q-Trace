import { CurriculumStage } from './types';
import { units6to7Stages } from './units-6-to-7';
import { units8to10Stages } from './units-8-to-10';

export const unit1FoundationsStages: CurriculumStage[] = [
  {
    id: 'stage_1_1_compass',
    lessonId: 'compass',
    unitId: 'unit_1',
    unitNumber: 1,
    stageNumber: 1,
    archetype: 'NODE_CONCEPT',
    title: 'The Quantum Compass: Bit vs Qubit',
    estimatedMinutes: 3,
    coherenceReward: 25,
    analogyHook: 'A classical bit is like a light switch (0 or 1). A qubit is a compass needle free to point anywhere on a 3D sphere.',
    conceptSummary: 'Quantum states inhabit a complex Hilbert space. The statevector |ψ⟩ = α|0⟩ + β|1⟩ combines basis states with probability amplitudes satisfying |α|² + |β|² = 1.',
    predictionCheckpoint: {
      id: 'pc_bit_vs_qubit',
      prompt: 'If a qubit has amplitude α = 1/√2 for state |0⟩ and β = 1/√2 for state |1⟩, what is the probability of measuring |0⟩?',
      options: [
        { id: 'opt_50', label: '50% (|1/√2|² = 1/2)', correct: true, explanation: 'Correct! By the Born rule, probability is amplitude squared.' },
        { id: 'opt_100', label: '100%', correct: false, explanation: 'Incorrect.' },
        { id: 'opt_25', label: '25%', correct: false, explanation: 'Incorrect.' },
      ],
      correctOptionId: 'opt_50',
    },
  },
  {
    id: 'stage_1_2_x_gate',
    lessonId: 'x-gate',
    unitId: 'unit_1',
    unitNumber: 1,
    stageNumber: 2,
    archetype: 'NODE_GATE_LAB',
    title: 'The Pauli-X Gate: Quantum Bit Flip',
    estimatedMinutes: 4,
    coherenceReward: 30,
    analogyHook: 'The Pauli-X gate acts as the quantum NOT gate, rotating statevectors 180° around the X-axis of the Bloch sphere.',
    conceptSummary: 'X|0⟩ = |1⟩ and X|1⟩ = |0⟩. It swaps basis amplitudes and represents a π rotation on the Bloch sphere.',
    predictionCheckpoint: {
      id: 'pc_x_gate_flip',
      prompt: 'Applying Pauli-X twice (X · X) to state |0⟩ results in which output?',
      options: [
        { id: 'opt_0', label: '|0⟩ (X is Hermitian and unitary: X² = I)', correct: true, explanation: 'Correct! Two 180° flips return to initial state.' },
        { id: 'opt_1', label: '|1⟩', correct: false },
        { id: 'opt_plus', label: '|+⟩', correct: false },
      ],
      correctOptionId: 'opt_0',
    },
  },
  {
    id: 'stage_1_3_hadamard',
    lessonId: 'hadamard',
    unitId: 'unit_1',
    unitNumber: 1,
    stageNumber: 3,
    archetype: 'NODE_GATE_LAB',
    title: 'The Hadamard Gate: Superposition & Inversion',
    estimatedMinutes: 4,
    coherenceReward: 35,
    route: '/learn/superposition',
    analogyHook: 'Hadamard is the coin spinner: turning definite states |0⟩ into equal superpositions |+⟩ = (|0⟩ + |1⟩)/√2.',
    conceptSummary: 'Hadamard creates equal superpositions from computational basis states. Crucially, H is its own inverse: H · H = I.',
    predictionCheckpoint: {
      id: 'pc_hadamard_inversion',
      prompt: 'If you apply H to |0⟩ to get |+⟩, and then apply H a second time, what state do you obtain?',
      options: [
        { id: 'opt_ground', label: '|0⟩ (Hadamard is self-inverse: H · H = I)', correct: true, explanation: 'Correct! Interference recombines amplitudes back to |0⟩.' },
        { id: 'opt_random', label: 'Random 50/50 mix', correct: false },
        { id: 'opt_one', label: '|1⟩', correct: false },
      ],
      correctOptionId: 'opt_ground',
    },
  },
  {
    id: 'stage_1_4_z_gate',
    lessonId: 'z-gate',
    unitId: 'unit_1',
    unitNumber: 1,
    stageNumber: 4,
    archetype: 'NODE_CONCEPT',
    title: 'Phase Flips: Pauli-Z, S & T Gates',
    estimatedMinutes: 5,
    coherenceReward: 35,
    analogyHook: 'Phase is invisible to standard measurement probabilities until rotated into amplitude interference.',
    conceptSummary: 'Pauli-Z leaves |0⟩ unchanged and maps |1⟩ to -|1⟩. Relative phase shifts are the engine of quantum interference algorithms.',
  },
  {
    id: 'stage_1_5_flight_station',
    lessonId: 'flight-station',
    unitId: 'unit_1',
    unitNumber: 1,
    stageNumber: 5,
    archetype: 'NODE_DEBUG',
    title: 'Flight Station: Misconception Replay & Practice',
    estimatedMinutes: 5,
    coherenceReward: 40,
    analogyHook: 'When your mental prediction diverges from Qiskit Aer simulation, the Flight Recorder pinpoints the exact diverged gate.',
    conceptSummary: 'Inspect gate-by-gate state trace telemetry, diagnose classical probability traps, and restore your Coherence Shield.',
  },
  {
    id: 'stage_1_6_capstone_qrng',
    lessonId: 'capstone-qrng',
    unitId: 'unit_1',
    unitNumber: 1,
    stageNumber: 6,
    archetype: 'NODE_MILESTONE',
    title: 'Unit 1 Capstone: True QRNG Synthesis Boss',
    estimatedMinutes: 8,
    coherenceReward: 50,
    analogyHook: 'Construct a certified Quantum Random Number Generator using superposition and measurement collapse.',
    conceptSummary: 'Prove mastery by synthesizing an unbiased single-qubit random bit generator with verified 50/50 measurement distribution.',
  },
];

export const allCurriculumStages: CurriculumStage[] = [
  ...unit1FoundationsStages,
  ...units6to7Stages,
  ...units8to10Stages,
];

export function getStageById(id: string): CurriculumStage | undefined {
  return allCurriculumStages.find((s) => s.id === id || s.lessonId === id);
}

export function getStagesForUnit(unitNumber: number): CurriculumStage[] {
  return allCurriculumStages.filter((s) => s.unitNumber === unitNumber);
}
