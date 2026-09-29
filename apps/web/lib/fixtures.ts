/**
 * Seeded contract fixtures and loader for Q-Trace.
 * Meets requirements for offline execution, role switching, and contract fidelity.
 */
import {
  LearnerProfile,
  InstructorProfile,
  LearningPath,
  ModuleDetail,
  CircuitModel,
  Challenge,
  ProgressRecord,
  InstructorInsight,
  SimulationRun,
  DiagnoseResponse,
  TutorExplanation,
  CreateChallengeAttemptResponse,
} from './contracts';

export interface SyntheticRole {
  id: string;
  name: string;
  roleType: 'LEARNER' | 'INSTRUCTOR';
  roleTag: string;
  description: string;
  profileId: string;
}

export const SYNTHETIC_ROLES: SyntheticRole[] = [
  {
    id: 'role_aarav',
    name: 'Aarav',
    roleType: 'LEARNER',
    roleTag: 'BEGINNER_CSE',
    description: 'CSE Undergraduate · Strong Python, beginner in quantum mechanics & linear algebra',
    profileId: 'lp_aarav',
  },
  {
    id: 'role_meera',
    name: 'Meera',
    roleType: 'LEARNER',
    roleTag: 'PHYSICS_TO_CODE',
    description: 'Physics Graduate · Strong quantum theory & math, transitioning to Qiskit code',
    profileId: 'lp_meera',
  },
  {
    id: 'role_rao',
    name: 'Dr. Rao',
    roleType: 'INSTRUCTOR',
    roleTag: 'INSTRUCTOR',
    description: 'Course Instructor / Lab Operator · Monitors cohort misconceptions & lab progress',
    profileId: 'instructor_rao',
  },
];

export const DEMO_LEARNER_PROFILES: Record<string, LearnerProfile> = {
  lp_aarav: {
    id: 'lp_aarav',
    displayName: 'Aarav',
    role: 'BEGINNER_CSE',
    cohortId: 'cohort_demo_2026',
    priorKnowledge: {
      python: true,
      linearAlgebra: false,
      quantumTheory: false,
      circuitProgramming: false,
    },
    completedSkillIds: [],
    activeLearningPathId: 'path_aarav_foundations',
    schemaVersion: 1,
    createdAt: '2026-08-23T05:27:00Z',
    updatedAt: '2026-08-23T05:27:00Z',
  },
  lp_meera: {
    id: 'lp_meera',
    displayName: 'Meera',
    role: 'PHYSICS_TO_CODE',
    cohortId: 'cohort_demo_2026',
    priorKnowledge: {
      python: true,
      linearAlgebra: true,
      quantumTheory: true,
      circuitProgramming: false,
    },
    completedSkillIds: ['skill_quantum_math'],
    activeLearningPathId: 'path_meera_code',
    schemaVersion: 1,
    createdAt: '2026-08-23T05:27:00Z',
    updatedAt: '2026-08-23T05:27:00Z',
  },
};

export const DEMO_INSTRUCTOR_PROFILE: InstructorProfile = {
  id: 'instructor_rao',
  displayName: 'Dr. Rao',
  cohortId: 'cohort_demo_2026',
};

export const DEMO_LEARNING_PATHS: Record<string, LearningPath> = {
  path_aarav_foundations: {
    id: 'path_aarav_foundations',
    learnerProfileId: 'lp_aarav',
    entryBand: 'FOUNDATIONS',
    moduleIds: ['mod_superposition', 'mod_measurement', 'mod_bell'],
    currentModuleId: 'mod_bell',
    recommendationReason: 'Complete the Bell-state lab after the superposition checkpoint.',
    schemaVersion: 1,
    updatedAt: '2026-08-23T05:27:00Z',
  },
  path_meera_code: {
    id: 'path_meera_code',
    learnerProfileId: 'lp_meera',
    entryBand: 'THEORY_TO_CODE',
    moduleIds: ['mod_bell'],
    currentModuleId: 'mod_bell',
    recommendationReason: 'Fast-track directly to Bell correlation and Qiskit verification.',
    schemaVersion: 1,
    updatedAt: '2026-08-23T05:27:00Z',
  },
};

export const DEMO_MODULES: Record<string, ModuleDetail> = {
  'bell-state': {
    id: 'mod_bell',
    slug: 'bell-state',
    title: 'From Superposition to Bell Correlation',
    skillIds: ['skill_create_bell', 'skill_explain_correlation'],
    level: 'FOUNDATION',
    estimatedMinutes: 18,
    contentBlocks: [
      {
        type: 'TEXT',
        body: 'Apply a Hadamard gate (H) to put qubit 0 in superposition, then apply a CNOT gate with control on qubit 0 and target on qubit 1 to create maximum entanglement.',
      },
      {
        type: 'CALLOUT',
        tone: 'CAUTION',
        body: 'Random outcomes can still be perfectly correlated: each qubit measured individually looks purely 50/50 random, but their measurement outcomes will always match (00 or 11).',
      },
      {
        type: 'FORMULA',
        latex: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
      },
      {
        type: 'BELL_STATE_SIMULATION',
      },
    ],
    predictionCheckpoint: {
      id: 'pc_bell_outcomes',
      moduleId: 'mod_bell',
      prompt: 'After applying H on qubit 0 and CNOT(0->1), which measurement outcome pattern should dominate the ideal state?',
      answerSchema: {
        type: 'SINGLE_CHOICE',
        options: [
          'INDEPENDENT_RANDOM',
          'CORRELATED_00_11',
          'ALWAYS_00',
          'ALWAYS_11',
        ],
      },
      misconceptionMap: {
        INDEPENDENT_RANDOM: 'SUPERPOSITION_VS_ENTANGLEMENT',
        ALWAYS_00: 'MEASUREMENT_DETERMINISM',
        ALWAYS_11: 'MEASUREMENT_DETERMINISM',
      },
      schemaVersion: 1,
    },
    starterCircuitModelId: 'cm_bell_seed',
    challengeIds: ['ch_bell_repair', 'ch_bell_psi_plus'],
    schemaVersion: 1,
  },
  superposition: {
    id: 'mod_superposition',
    slug: 'superposition',
    title: 'Qubits and Superposition',
    skillIds: ['skill_create_superposition'],
    level: 'FOUNDATION',
    estimatedMinutes: 14,
    contentBlocks: [
      {
        type: 'TEXT',
        body: 'A single qubit in state |0> transformed by a Hadamard gate enters an equal superposition (|0> + |1>)/sqrt(2).',
      },
    ],
    challengeIds: [],
    schemaVersion: 1,
  },
  measurement: {
    id: 'mod_measurement',
    slug: 'measurement',
    title: 'Measurement and Probability',
    skillIds: ['skill_predict_measurement'],
    level: 'FOUNDATION',
    estimatedMinutes: 12,
    contentBlocks: [
      {
        type: 'TEXT',
        body: 'Measurement collapses a quantum superposition into a definite classical state with probabilities given by the Born rule.',
      },
    ],
    challengeIds: [],
    schemaVersion: 1,
  },
  grover: {
    id: 'mod_grover',
    slug: 'grover',
    title: "Grover's Search Algorithm: 3-Qubit Search",
    skillIds: ['skill_grover_oracle', 'skill_amplitude_amplification', 'skill_ccx_toffoli'],
    level: 'INTERMEDIATE',
    estimatedMinutes: 20,
    contentBlocks: [
      {
        type: 'TEXT',
        body: 'Grover\'s algorithm achieves a quadratic speedup O(√N) for unstructured database search. By chaining oracle phase marking with diffusion reflection about the mean, target state |101⟩ is amplified to >90% probability.',
      },
      {
        type: 'CALLOUT',
        tone: 'INFO',
        body: 'Optimal count: For N = 8 states (3 qubits), exactly 2 iterations amplify the target |101⟩ to ~94.5% probability without inspecting non-matching states.',
      },
      {
        type: 'FORMULA',
        latex: '|\\psi_k\\rangle = (U_s U_\\omega)^k H^{\\otimes 3} |000\\rangle',
      },
    ],
    predictionCheckpoint: {
      id: 'pc_grover_outcomes',
      moduleId: 'mod_grover',
      prompt: 'After applying 2 Grover iterations targeting state |101⟩ on 3 qubits, which outcome should dominate the measurement?',
      answerSchema: {
        type: 'SINGLE_CHOICE',
        options: [
          'TARGET_101_AMPLIFIED',
          'EQUAL_RANDOM_12_5',
          'OVER_ROTATED_COLLAPSE',
          'ALWAYS_000',
        ],
      },
      misconceptionMap: {
        EQUAL_RANDOM_12_5: 'ORACLE_WITHOUT_DIFFUSION',
        OVER_ROTATED_COLLAPSE: 'SOUFFLE_FALLACY',
        ALWAYS_000: 'INITIAL_STATE_BIAS',
      },
      schemaVersion: 1,
    },
    starterCircuitModelId: 'cm_grover_seed',
    challengeIds: ['ch_grover_repair'],
    schemaVersion: 1,
  },
};

export const DEMO_STARTER_CIRCUIT: CircuitModel = {
  id: 'cm_bell_seed',
  name: 'Bell State Seed',
  qubitCount: 2,
  classicalBitCount: 2,
  operations: [
    { opId: 'op_1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_2', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 1 },
    { opId: 'op_3', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 2 },
    { opId: 'op_4', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 2 },
  ],
  source: 'SEED',
  openQasm3: 'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nbit[2] c;\nh q[0];\ncx q[0], q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];\n',
  modelVersion: 1,
  ownerLearnerProfileId: null,
  createdAt: '2026-08-23T05:27:00Z',
  updatedAt: '2026-08-23T05:27:00Z',
};

export const DEMO_BELL_BUILDER_STARTER: CircuitModel = {
  id: 'cm_bell_builder_starter',
  name: 'Bell State Builder (Workspace)',
  qubitCount: 2,
  classicalBitCount: 2,
  operations: [
    { opId: 'op_3', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 2 },
    { opId: 'op_4', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 2 },
  ],
  source: 'BUILDER',
  openQasm3:
    'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nbit[2] c;\nc[0] = measure q[0];\nc[1] = measure q[1];\n',
  modelVersion: 1,
  ownerLearnerProfileId: null,
  createdAt: '2026-08-23T05:27:00Z',
  updatedAt: '2026-08-23T05:27:00Z',
};

export const DEMO_BROKEN_CIRCUIT: CircuitModel = {
  id: 'cm_bell_broken',
  name: 'Broken Bell State (Missing Superposition)',
  qubitCount: 2,
  classicalBitCount: 2,
  operations: [
    { opId: 'op_b_cnot', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 1 },
    { opId: 'op_b_m0', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 3 },
    { opId: 'op_b_m1', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 3 },
  ],
  source: 'SEED',
  openQasm3:
    'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nbit[2] c;\ncx q[0], q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];\n',
  modelVersion: 1,
  ownerLearnerProfileId: null,
  createdAt: '2026-08-23T05:27:00Z',
  updatedAt: '2026-08-23T05:27:00Z',
};

export const DEMO_CHALLENGE: Challenge = {
  id: 'ch_bell_repair',
  moduleId: 'mod_bell',
  type: 'CIRCUIT_REPAIR',
  title: 'Restore Bell Correlation',
  prompt: 'Repair the circuit so only 00 and 11 have non-zero ideal probability.',
  starterCircuitModelId: 'cm_bell_broken',
  acceptanceRule: {
    version: 1,
    kind: 'PROBABILITY_SUPPORT_EQUALS',
    states: ['00', '11'],
    epsilon: 0.000001,
  },
  targetsMisconceptionCodes: ['SUPERPOSITION_VS_ENTANGLEMENT', 'GATE_ORDER'],
  points: 100,
  schemaVersion: 1,
};

export const DEMO_BRIDGE_STARTER_CIRCUIT: CircuitModel = {
  id: 'cm_bell_psi_seed',
  name: 'Teleportation Channel Seed (Psi+ Starter)',
  qubitCount: 2,
  classicalBitCount: 2,
  operations: [
    { opId: 'op_psi_1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_psi_2', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 1 },
    { opId: 'op_psi_3', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 3 },
    { opId: 'op_psi_4', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 3 },
  ],
  source: 'SEED',
  openQasm3: 'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nbit[2] c;\nh q[0];\ncx q[0], q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];\n',
  modelVersion: 1,
  ownerLearnerProfileId: null,
  createdAt: '2026-08-23T05:27:00Z',
  updatedAt: '2026-08-23T05:27:00Z',
};

export const DEMO_BRIDGE_CHALLENGE: Challenge = {
  id: 'ch_bell_psi_plus',
  moduleId: 'mod_bell',
  type: 'CIRCUIT_REPAIR',
  title: 'Teleportation Channel: Prepare Anti-Correlated Bell Pair',
  prompt: 'Add a Pauli-X gate to produce an anti-correlated Bell pair (|01⟩ and |10⟩) for Stage 2 Quantum Teleportation.',
  starterCircuitModelId: 'cm_bell_psi_seed',
  acceptanceRule: {
    version: 1,
    kind: 'PROBABILITY_SUPPORT_EQUALS',
    states: ['01', '10'],
    epsilon: 0.000001,
  },
  targetsMisconceptionCodes: ['SUPERPOSITION_VS_ENTANGLEMENT', 'GATE_ORDER'],
  points: 100,
  schemaVersion: 1,
};

export const DEMO_PROGRESS_RECORDS: Record<string, ProgressRecord> = {
  lp_aarav: {
    id: 'progress_lp_aarav',
    learnerProfileId: 'lp_aarav',
    completedModuleIds: ['mod_superposition'],
    skillStates: [
      { skillId: 'skill_create_superposition', status: 'MASTERED', score: 100 },
      { skillId: 'skill_create_bell', status: 'PRACTICING', score: 40 },
    ],
    latestChallengeAttemptId: null,
    misconceptionSummary: [],
    totalPoints: 50,
    schemaVersion: 1,
    updatedAt: '2026-08-23T05:27:00Z',
  },
  lp_meera: {
    id: 'progress_lp_meera',
    learnerProfileId: 'lp_meera',
    completedModuleIds: ['mod_superposition', 'mod_measurement'],
    skillStates: [
      { skillId: 'skill_create_superposition', status: 'MASTERED', score: 100 },
      { skillId: 'skill_predict_measurement', status: 'MASTERED', score: 100 },
      { skillId: 'skill_create_bell', status: 'PRACTICING', score: 60 },
    ],
    latestChallengeAttemptId: null,
    misconceptionSummary: [],
    totalPoints: 120,
    schemaVersion: 1,
    updatedAt: '2026-08-23T05:27:00Z',
  },
};

export const DEMO_INSTRUCTOR_INSIGHT: InstructorInsight = {
  cohortId: 'cohort_demo_2026',
  generatedAt: '2026-08-23T05:28:01Z',
  learnerCount: 30,
  moduleCompletion: [
    { moduleId: 'mod_superposition', completed: 28, assigned: 30 },
    { moduleId: 'mod_measurement', completed: 22, assigned: 30 },
    { moduleId: 'mod_bell', completed: 18, assigned: 30 },
  ],
  challengePassRate: [
    { challengeId: 'ch_bell_repair', passed: 17, attempted: 24, rate: 0.7083 },
  ],
  topMisconceptions: [
    { code: 'SUPERPOSITION_VS_ENTANGLEMENT', learnerCount: 11, occurrences: 15 },
    { code: 'MEASUREMENT_DETERMINISM', learnerCount: 6, occurrences: 8 },
    { code: 'GATE_ORDER', learnerCount: 4, occurrences: 5 },
  ],
  liveDemoLearner: {
    learnerProfileId: 'lp_aarav',
    latestAttemptPassed: false,
  },
  dataDisclosure: 'Synthetic seeded cohort plus current live demo attempt',
};

export const DEMO_SIMULATION_RUN: SimulationRun = {
  id: 'sr_demo_001',
  learnerProfileId: 'lp_aarav',
  moduleId: 'mod_bell',
  circuitModelId: 'cm_bell_seed',
  adapter: 'QISKIT_AER',
  shots: 1024,
  status: 'SUCCEEDED',
  probabilities: { '00': 0.5, '11': 0.5 },
  counts: { '00': 512, '11': 512 },
  stateTrace: [
    {
      stepIndex: 0,
      operationId: 'op_1',
      label: 'After H',
      basisProbabilities: { '00': 0.5, '10': 0.5 },
      amplitudes: {
        '00': { re: 0.70710678, im: 0.0 },
        '10': { re: 0.70710678, im: 0.0 },
      },
      reducedQubits: [
        { qubit: 0, bloch: { x: 1.0, y: 0.0, z: 0.0 }, purity: 1.0, label: 'PURE_SUBSYSTEM' },
        { qubit: 1, bloch: { x: 0.0, y: 0.0, z: 1.0 }, purity: 1.0, label: 'PURE_SUBSYSTEM' },
      ],
    },
    {
      stepIndex: 1,
      operationId: 'op_2',
      label: 'After CNOT',
      basisProbabilities: { '00': 0.5, '11': 0.5 },
      amplitudes: {
        '00': { re: 0.70710678, im: 0.0 },
        '11': { re: 0.70710678, im: 0.0 },
      },
      reducedQubits: [
        { qubit: 0, bloch: { x: 0.0, y: 0.0, z: 0.0 }, purity: 0.5, label: 'MIXED_SUBSYSTEM' },
        { qubit: 1, bloch: { x: 0.0, y: 0.0, z: 0.0 }, purity: 0.5, label: 'MIXED_SUBSYSTEM' },
      ],
    },
  ],
  conformance: {
    adapter: 'PENNYLANE',
    maxProbabilityDelta: 0.0,
    epsilon: 0.000001,
    passed: true,
    skippedReason: null,
  },
  durationMs: 84,
  createdAt: '2026-08-23T05:27:00Z',
};

export const DEMO_FLIGHT_RECORDER_DIAGNOSIS: DiagnoseResponse = {
  misconceptionSignal: {
    id: 'ms_demo_001',
    learnerProfileId: 'lp_aarav',
    simulationRunId: 'sr_demo_001',
    code: 'SUPERPOSITION_VS_ENTANGLEMENT',
    firstDivergenceStep: 1,
    evidence: {
      prediction: 'INDEPENDENT_RANDOM',
      verifiedBehavior: 'CORRELATED_00_11',
      predictionDescription: 'Assumed individual 50/50 measurement without entanglement',
      verifiedBehaviorDescription: 'Non-local correlation: outcomes match on 100% of shots',
      stateTraceStepIndexes: [0, 1],
    },
    confidence: 1.0,
    repairChallengeId: 'ch_bell_repair',
    createdAt: '2026-08-23T05:27:01Z',
  },
  replay: [
    {
      stepIndex: 0,
      headline: 'Superposition created',
      evidenceKeys: ['stateTrace.0.basisProbabilities'],
    },
    {
      stepIndex: 1,
      headline: 'Correlation introduced',
      evidenceKeys: ['stateTrace.1.basisProbabilities', 'stateTrace.1.reducedQubits'],
    },
  ],
};

export const DEMO_TUTOR_RESPONSE: TutorExplanation = {
  responseId: 'tr_demo_001',
  intent: 'EXPLAIN_DIVERGENCE',
  summary:
    'The Hadamard gate made qubit 0 uncertain; the CNOT then tied qubit 1 to that branch. Each shot is random, but the pair is correlated.',
  steps: [
    {
      title: 'After H',
      body: 'The verified probabilities are 00 = 0.5 and 10 = 0.5.',
      evidenceKeys: ['stateTrace.0.basisProbabilities'],
    },
    {
      title: 'After CNOT',
      body: 'The verified support moves to 00 = 0.5 and 11 = 0.5.',
      evidenceKeys: ['stateTrace.1.basisProbabilities'],
    },
  ],
  numericalClaims: [
    { claim: 'P(00)=0.5', evidenceKey: 'stateTrace.1.basisProbabilities.00' },
    { claim: 'P(11)=0.5', evidenceKey: 'stateTrace.1.basisProbabilities.11' },
  ],
  repairChallengeId: 'ch_bell_repair',
  fallbackUsed: true,
  model: 'DEMO_FALLBACK',
  safetyNote: 'Explanation is grounded in this Simulation Run; it is not a hardware claim.',
};

export const DEMO_REPAIRED_CIRCUIT: CircuitModel = {
  id: 'cm_aarav_repaired',
  name: 'Aarav Repaired Bell Circuit',
  qubitCount: 2,
  classicalBitCount: 2,
  operations: [
    { opId: 'op_1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_2', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 1 },
    { opId: 'op_3', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 2 },
    { opId: 'op_4', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 2 },
  ],
  source: 'BUILDER',
  modelVersion: 1,
  ownerLearnerProfileId: 'lp_aarav',
  createdAt: '2026-08-23T05:27:50Z',
  updatedAt: '2026-08-23T05:27:50Z',
};

export const DEMO_CHALLENGE_ATTEMPT_RESPONSE: CreateChallengeAttemptResponse = {
  challengeAttempt: {
    id: 'ca_demo_001',
    challengeId: 'ch_bell_repair',
    learnerProfileId: 'lp_aarav',
    simulationRunId: 'sr_demo_002',
    submittedAnswer: { type: 'CIRCUIT_MODEL', circuitModelId: 'cm_aarav_repaired' },
    passed: true,
    score: 100,
    feedbackCode: 'BELL_SUPPORT_CORRECT',
    attemptNumber: 1,
    createdAt: '2026-08-23T05:28:00Z',
  },
  progressRecord: {
    id: 'progress_lp_aarav',
    learnerProfileId: 'lp_aarav',
    completedModuleIds: ['mod_superposition', 'mod_bell'],
    skillStates: [
      { skillId: 'skill_create_bell', status: 'MASTERED', score: 100 },
      { skillId: 'skill_explain_correlation', status: 'PRACTICING', score: 70 },
    ],
    latestChallengeAttemptId: 'ca_demo_001',
    misconceptionSummary: [
      { code: 'SUPERPOSITION_VS_ENTANGLEMENT', count: 1, latestAt: '2026-08-23T05:27:01Z' },
    ],
    totalPoints: 150,
    updatedAt: '2026-08-23T05:28:00Z',
  },
};

export const DEMO_GROVER_STARTER_CIRCUIT: CircuitModel = {
  id: 'cm_grover_seed',
  name: 'Grover 3-Qubit Search (|101⟩ Target)',
  qubitCount: 3,
  classicalBitCount: 3,
  operations: [
    { opId: 'op_gh_0', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_gh_1', gate: 'H', targets: [1], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_gh_2', gate: 'H', targets: [2], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_gx_1', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 1 },
    { opId: 'op_gccx_1', gate: 'CCX', targets: [2], controls: [0, 1], classicalTargets: [], column: 2 },
    { opId: 'op_gx_2', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 3 },
    { opId: 'op_gdh_1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_gdh_2', gate: 'H', targets: [1], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_gdh_3', gate: 'H', targets: [2], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_gdx_1', gate: 'X', targets: [0], controls: [], classicalTargets: [], column: 5 },
    { opId: 'op_gdx_2', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 5 },
    { opId: 'op_gdx_3', gate: 'X', targets: [2], controls: [], classicalTargets: [], column: 5 },
    { opId: 'op_gdccx_1', gate: 'CCX', targets: [2], controls: [0, 1], classicalTargets: [], column: 6 },
    { opId: 'op_gdx_4', gate: 'X', targets: [0], controls: [], classicalTargets: [], column: 7 },
    { opId: 'op_gdx_5', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 7 },
    { opId: 'op_gdx_6', gate: 'X', targets: [2], controls: [], classicalTargets: [], column: 7 },
    { opId: 'op_gdh_4', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 8 },
    { opId: 'op_gdh_5', gate: 'H', targets: [1], controls: [], classicalTargets: [], column: 8 },
    { opId: 'op_gdh_6', gate: 'H', targets: [2], controls: [], classicalTargets: [], column: 8 },
    { opId: 'op_gm_0', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 9 },
    { opId: 'op_gm_1', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 9 },
    { opId: 'op_gm_2', gate: 'MEASURE', targets: [2], controls: [], classicalTargets: [2], column: 9 },
  ],
  source: 'SEED',
  openQasm3:
    'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[3] q;\nbit[3] c;\nh q[0];\nh q[1];\nh q[2];\nx q[1];\nccx q[0], q[1], q[2];\nx q[1];\nh q[0];\nh q[1];\nh q[2];\nx q[0];\nx q[1];\nx q[2];\nccx q[0], q[1], q[2];\nx q[0];\nx q[1];\nx q[2];\nh q[0];\nh q[1];\nh q[2];\nc[0] = measure q[0];\nc[1] = measure q[1];\nc[2] = measure q[2];\n',
  modelVersion: 1,
  ownerLearnerProfileId: null,
  createdAt: '2026-08-23T05:27:00Z',
  updatedAt: '2026-08-23T05:27:00Z',
};

export const DEMO_GROVER_BROKEN_CIRCUIT: CircuitModel = {
  id: 'cm_grover_broken',
  name: 'Broken Grover Circuit (Missing Phase Oracle)',
  qubitCount: 3,
  classicalBitCount: 3,
  operations: [
    { opId: 'op_b_h0', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_b_h1', gate: 'H', targets: [1], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_b_h2', gate: 'H', targets: [2], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_b_dh0', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_b_dh1', gate: 'H', targets: [1], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_b_dh2', gate: 'H', targets: [2], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_b_m0', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 9 },
    { opId: 'op_b_m1', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 9 },
    { opId: 'op_b_m2', gate: 'MEASURE', targets: [2], controls: [], classicalTargets: [2], column: 9 },
  ],
  source: 'SEED',
  openQasm3:
    'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[3] q;\nbit[3] c;\nh q[0];\nh q[1];\nh q[2];\nh q[0];\nh q[1];\nh q[2];\nc[0] = measure q[0];\nc[1] = measure q[1];\nc[2] = measure q[2];\n',
  modelVersion: 1,
  ownerLearnerProfileId: null,
  createdAt: '2026-08-23T05:27:00Z',
  updatedAt: '2026-08-23T05:27:00Z',
};

export const DEMO_GROVER_CHALLENGE: Challenge = {
  id: 'ch_grover_repair',
  moduleId: 'mod_grover',
  type: 'CIRCUIT_REPAIR',
  title: 'Restore Grover Phase Oracle for |101⟩',
  prompt: 'Insert the missing phase oracle (X on q1, then CCX on target q2 with controls q0 and q1, then X on q1) to mark state |101⟩ before the diffusion layer.',
  starterCircuitModelId: 'cm_grover_broken',
  acceptanceRule: {
    version: 1,
    kind: 'PROBABILITY_SUPPORT_EQUALS',
    states: ['101'],
    epsilon: 0.15,
  },
  targetsMisconceptionCodes: ['ORACLE_WITHOUT_DIFFUSION', 'GATE_ORDER'],
  points: 150,
  schemaVersion: 1,
};

export const DEMO_GROVER_SIMULATION_RUN: SimulationRun = {
  id: 'sr_grover_demo_001',
  learnerProfileId: 'lp_aarav',
  moduleId: 'mod_grover',
  circuitModelId: 'cm_grover_seed',
  adapter: 'QISKIT_AER',
  shots: 1024,
  status: 'SUCCEEDED',
  probabilities: {
    '000': 0.008,
    '001': 0.008,
    '010': 0.008,
    '011': 0.008,
    '100': 0.008,
    '101': 0.945,
    '110': 0.008,
    '111': 0.008,
  },
  counts: {
    '000': 8,
    '001': 8,
    '010': 8,
    '011': 8,
    '100': 8,
    '101': 968,
    '110': 8,
    '111': 8,
  },
  stateTrace: [
    {
      stepIndex: 0,
      operationId: 'op_gh_0',
      label: 'Equal Superposition (H^⊗3)',
      basisProbabilities: {
        '000': 0.125, '001': 0.125, '010': 0.125, '011': 0.125,
        '100': 0.125, '101': 0.125, '110': 0.125, '111': 0.125,
      },
      amplitudes: {
        '000': { re: 0.3536, im: 0.0 }, '001': { re: 0.3536, im: 0.0 },
        '010': { re: 0.3536, im: 0.0 }, '011': { re: 0.3536, im: 0.0 },
        '100': { re: 0.3536, im: 0.0 }, '101': { re: 0.3536, im: 0.0 },
        '110': { re: 0.3536, im: 0.0 }, '111': { re: 0.3536, im: 0.0 },
      },
      reducedQubits: [
        { qubit: 0, bloch: { x: 1.0, y: 0.0, z: 0.0 }, purity: 1.0, label: 'PURE_SUBSYSTEM' },
        { qubit: 1, bloch: { x: 1.0, y: 0.0, z: 0.0 }, purity: 1.0, label: 'PURE_SUBSYSTEM' },
        { qubit: 2, bloch: { x: 1.0, y: 0.0, z: 0.0 }, purity: 1.0, label: 'PURE_SUBSYSTEM' },
      ],
    },
    {
      stepIndex: 1,
      operationId: 'op_gccx_1',
      label: 'Oracle Phase Marking (|101⟩ Inverted)',
      basisProbabilities: {
        '000': 0.125, '001': 0.125, '010': 0.125, '011': 0.125,
        '100': 0.125, '101': 0.125, '110': 0.125, '111': 0.125,
      },
      amplitudes: {
        '000': { re: 0.3536, im: 0.0 }, '001': { re: 0.3536, im: 0.0 },
        '010': { re: 0.3536, im: 0.0 }, '011': { re: 0.3536, im: 0.0 },
        '100': { re: 0.3536, im: 0.0 }, '101': { re: -0.3536, im: 0.0 },
        '110': { re: 0.3536, im: 0.0 }, '111': { re: 0.3536, im: 0.0 },
      },
      reducedQubits: [],
    },
    {
      stepIndex: 2,
      operationId: 'op_gdccx_1',
      label: 'Diffusion Iteration 1 (Reflection)',
      basisProbabilities: {
        '000': 0.031, '001': 0.031, '010': 0.031, '011': 0.031,
        '100': 0.031, '101': 0.531, '110': 0.031, '111': 0.031,
      },
      amplitudes: {
        '000': { re: 0.1768, im: 0.0 }, '001': { re: 0.1768, im: 0.0 },
        '010': { re: 0.1768, im: 0.0 }, '011': { re: 0.1768, im: 0.0 },
        '100': { re: 0.1768, im: 0.0 }, '101': { re: 0.7289, im: 0.0 },
        '110': { re: 0.1768, im: 0.0 }, '111': { re: 0.1768, im: 0.0 },
      },
      reducedQubits: [],
    },
    {
      stepIndex: 3,
      operationId: 'op_gdh_6',
      label: 'Diffusion Iteration 2 (Peak Amplification)',
      basisProbabilities: {
        '000': 0.008, '001': 0.008, '010': 0.008, '011': 0.008,
        '100': 0.008, '101': 0.945, '110': 0.008, '111': 0.008,
      },
      amplitudes: {
        '000': { re: 0.0884, im: 0.0 }, '001': { re: 0.0884, im: 0.0 },
        '010': { re: 0.0884, im: 0.0 }, '011': { re: 0.0884, im: 0.0 },
        '100': { re: 0.0884, im: 0.0 }, '101': { re: 0.9723, im: 0.0 },
        '110': { re: 0.0884, im: 0.0 }, '111': { re: 0.0884, im: 0.0 },
      },
      reducedQubits: [],
    },
  ],
  conformance: {
    adapter: 'PENNYLANE',
    maxProbabilityDelta: 0.0,
    epsilon: 0.000001,
    passed: true,
    skippedReason: null,
  },
  durationMs: 92,
  createdAt: '2026-08-23T05:27:00Z',
};

export const DEMO_GROVER_DIAGNOSIS: DiagnoseResponse = {
  misconceptionSignal: {
    id: 'ms_grover_demo_001',
    learnerProfileId: 'lp_aarav',
    simulationRunId: 'sr_grover_demo_001',
    code: 'NO_SIGNAL',
    firstDivergenceStep: null,
    isCorrectPrediction: true,
    evidence: {
      prediction: 'TARGET_101_AMPLIFIED',
      verifiedBehavior: 'TARGET_101_AMPLIFIED',
      predictionDescription: 'Correctly predicted that 2 Grover iterations amplify |101⟩ to ~94.5%',
      verifiedBehaviorDescription: 'Constructive interference verified: |101⟩ measures with 94.5% probability',
      stateTraceStepIndexes: [0, 1, 2, 3],
    },
    confidence: 1.0,
    repairChallengeId: 'ch_grover_repair',
    createdAt: '2026-08-23T05:27:01Z',
  },
  replay: [
    {
      stepIndex: 0,
      headline: 'Equal superposition initialized',
      evidenceKeys: ['stateTrace.0.basisProbabilities'],
    },
    {
      stepIndex: 1,
      headline: 'Phase oracle marks target |101⟩ with negative phase',
      evidenceKeys: ['stateTrace.1.basisProbabilities'],
    },
    {
      stepIndex: 2,
      headline: 'First diffusion reflection boosts |101⟩ to 53.1%',
      evidenceKeys: ['stateTrace.2.basisProbabilities'],
    },
    {
      stepIndex: 3,
      headline: 'Second diffusion reflection reaches peak 94.5% fidelity',
      evidenceKeys: ['stateTrace.3.basisProbabilities'],
    },
  ],
};

export const DEMO_GROVER_TUTOR_RESPONSE: TutorExplanation = {
  responseId: 'tr_grover_demo_001',
  intent: 'EXPLAIN_DIVERGENCE',
  summary:
    'Grover\'s algorithm amplified state |101⟩ by inverting its phase with the CCX oracle, then reflecting all amplitudes across the mean ᾱ with the diffusion operator.',
  steps: [
    {
      title: 'Equal Superposition',
      body: 'All 8 states initialized with amplitude 1/√8 ≈ 0.354 (12.5% each).',
      evidenceKeys: ['stateTrace.0.basisProbabilities'],
    },
    {
      title: 'Oracle Phase Tag',
      body: 'The oracle flipped |101⟩ to -0.354, pulling the average line ᾱ down to 0.265.',
      evidenceKeys: ['stateTrace.1.basisProbabilities'],
    },
    {
      title: 'Diffusion Reflection',
      body: 'Inversion about the mean (2ᾱ - α) amplified |101⟩ to 0.972 (94.5% probability) while suppressing unmarked states.',
      evidenceKeys: ['stateTrace.3.basisProbabilities'],
    },
  ],
  numericalClaims: [
    { claim: 'P(101)=0.945', evidenceKey: 'stateTrace.3.basisProbabilities.101' },
  ],
  repairChallengeId: 'ch_grover_repair',
  fallbackUsed: true,
  model: 'DEMO_FALLBACK',
  safetyNote: 'Explanation is grounded in this Qiskit Aer Simulation Run; it is not a hardware claim.',
};


