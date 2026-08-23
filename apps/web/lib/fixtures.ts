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
    challengeIds: ['ch_bell_repair'],
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
