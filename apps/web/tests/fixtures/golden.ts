/**
 * QA-1 — Golden fixture mirrors for the frontend.
 *
 * Generated from apps/api/tests/fixtures/golden/ — DO NOT hand-edit.
 * Source contracts: circuit-simulation v1, flight-recorder-tutor v1,
 *                   progress-analytics v1, learning-content v1.
 *
 * These are the only authoritative fixture IDs for the scripted demo path.
 * All frontend tests must import from here, never inline equivalent objects.
 */

// ─── IDs ──────────────────────────────────────────────────────────────────────

export const GOLDEN_IDS = {
  learnerProfile: "lp_aarav",
  moduleId: "mod_bell",
  circuitModelId: "cm_bell_seed",
  brokenCircuitModelId: "cm_bell_broken",
  repairedCircuitModelId: "cm_aarav_repaired",
  checkpointId: "pc_bell_outcomes",
  simulationRunId: "sr_demo_001",
  repairRunId: "sr_demo_002",
  misconceptionSignalId: "ms_demo_001",
  tutorResponseId: "tr_demo_001",
  challengeId: "ch_bell_repair",
  challengeAttemptId: "ca_demo_001",
  progressRecordId: "progress_lp_aarav",
  instructorId: "instructor_rao",
  cohortId: "cohort_demo_2026",
} as const;

// ─── Bell Simulation Run ───────────────────────────────────────────────────────

export const GOLDEN_BELL_SIMULATION_RUN = {
  id: "sr_demo_001",
  learnerProfileId: "lp_aarav",
  moduleId: "mod_bell",
  circuitModelId: "cm_bell_seed",
  adapter: "QISKIT_AER",
  shots: 1024,
  status: "SUCCEEDED",
  probabilities: { "00": 0.5, "11": 0.5 },
  counts: { "00": 512, "11": 512 },
  stateTrace: [
    {
      stepIndex: 0,
      operationId: "op_1",
      label: "After H",
      basisProbabilities: { "00": 0.5, "10": 0.5 },
      amplitudes: {
        "00": { re: 0.70710678, im: 0.0 },
        "10": { re: 0.70710678, im: 0.0 },
      },
      reducedQubits: [
        { qubit: 0, bloch: { x: 1.0, y: 0.0, z: 0.0 }, purity: 1.0, label: "PURE_SUBSYSTEM" },
        { qubit: 1, bloch: { x: 0.0, y: 0.0, z: 1.0 }, purity: 1.0, label: "PURE_SUBSYSTEM" },
      ],
    },
    {
      stepIndex: 1,
      operationId: "op_2",
      label: "After CNOT",
      basisProbabilities: { "00": 0.5, "11": 0.5 },
      amplitudes: {
        "00": { re: 0.70710678, im: 0.0 },
        "11": { re: 0.70710678, im: 0.0 },
      },
      reducedQubits: [
        { qubit: 0, bloch: { x: 0.0, y: 0.0, z: 0.0 }, purity: 0.5, label: "MIXED_SUBSYSTEM" },
        { qubit: 1, bloch: { x: 0.0, y: 0.0, z: 0.0 }, purity: 0.5, label: "MIXED_SUBSYSTEM" },
      ],
    },
  ],
  conformance: {
    adapter: "PENNYLANE",
    maxProbabilityDelta: 0.0,
    epsilon: 0.000001,
    passed: true,
    skippedReason: null,
  },
  durationMs: 84,
  createdAt: "2026-08-23T05:27:00Z",
} as const;

// ─── Diagnosis Result ─────────────────────────────────────────────────────────

export const GOLDEN_DIAGNOSIS_RESULT = {
  misconceptionSignal: {
    id: "ms_demo_001",
    learnerProfileId: "lp_aarav",
    simulationRunId: "sr_demo_001",
    code: "SUPERPOSITION_VS_ENTANGLEMENT",
    firstDivergenceStep: 1,
    evidence: {
      prediction: "INDEPENDENT_RANDOM",
      verifiedBehavior: "CORRELATED_00_11",
      stateTraceStepIndexes: [0, 1],
    },
    confidence: 1.0,
    repairChallengeId: "ch_bell_repair",
    createdAt: "2026-08-23T05:27:01Z",
  },
  replay: [
    {
      stepIndex: 0,
      headline: "Superposition created",
      evidenceKeys: ["stateTrace.0.basisProbabilities"],
    },
    {
      stepIndex: 1,
      headline: "Correlation introduced",
      evidenceKeys: ["stateTrace.1.basisProbabilities", "stateTrace.1.reducedQubits"],
    },
  ],
} as const;

// ─── Tutor Response (fallback / DEMO_FALLBACK) ────────────────────────────────

export const GOLDEN_TUTOR_RESPONSE = {
  tutorResponse: {
    responseId: "tr_demo_001",
    intent: "EXPLAIN_DIVERGENCE",
    summary:
      "The Hadamard gate made qubit 0 uncertain; the CNOT then tied qubit 1 to that branch. Each shot is random, but the pair is correlated.",
    steps: [
      {
        title: "After H",
        body: "The verified probabilities are 00 = 0.5 and 10 = 0.5.",
        evidenceKeys: ["stateTrace.0.basisProbabilities"],
      },
      {
        title: "After CNOT",
        body: "The verified support moves to 00 = 0.5 and 11 = 0.5.",
        evidenceKeys: ["stateTrace.1.basisProbabilities"],
      },
    ],
    numericalClaims: [
      { claim: "P(00)=0.5", evidenceKey: "stateTrace.1.basisProbabilities.00" },
      { claim: "P(11)=0.5", evidenceKey: "stateTrace.1.basisProbabilities.11" },
    ],
    repairChallengeId: "ch_bell_repair",
    fallbackUsed: true,
    model: "DEMO_FALLBACK",
    safetyNote: "Explanation is grounded in this Simulation Run; it is not a hardware claim.",
  },
} as const;

// ─── Progress After Repair ────────────────────────────────────────────────────

export const GOLDEN_PROGRESS_AFTER_REPAIR = {
  challengeAttempt: {
    id: "ca_demo_001",
    challengeId: "ch_bell_repair",
    learnerProfileId: "lp_aarav",
    simulationRunId: "sr_demo_002",
    submittedAnswer: { type: "CIRCUIT_MODEL", circuitModelId: "cm_aarav_repaired" },
    passed: true,
    score: 100,
    feedbackCode: "BELL_SUPPORT_CORRECT",
    attemptNumber: 1,
    createdAt: "2026-08-23T05:28:00Z",
  },
  progressRecord: {
    id: "progress_lp_aarav",
    learnerProfileId: "lp_aarav",
    completedModuleIds: ["mod_bell"],
    skillStates: [
      { skillId: "skill_create_bell", status: "MASTERED", score: 100 },
      { skillId: "skill_explain_correlation", status: "PRACTICING", score: 70 },
    ],
    latestChallengeAttemptId: "ca_demo_001",
    misconceptionSummary: [
      { code: "SUPERPOSITION_VS_ENTANGLEMENT", count: 1, latestAt: "2026-08-23T05:27:01Z" },
    ],
    totalPoints: 100,
    updatedAt: "2026-08-23T05:28:00Z",
  },
} as const;

// ─── Error Shapes ─────────────────────────────────────────────────────────────

export const GOLDEN_UNSUPPORTED_GATE_ERROR = {
  error: {
    code: "UNSUPPORTED_GATE",
    message: "Gate RX is outside the prototype subset.",
    requestId: "req_demo_001",
    details: {
      operationIndex: 2,
      allowedGates: ["H", "X", "Y", "Z", "CNOT", "MEASURE"],
    },
  },
} as const;
