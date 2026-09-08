/**
 * QA-2 — Frontend contract shape tests with runtime Zod schemas.
 *
 * Validates that every export in apps/web/tests/fixtures/golden.ts matches the
 * authoritative contract shapes defined in all four contract files (v1).
 *
 * Sourced contracts (all v1):
 *   - board/contracts/circuit-simulation.md
 *   - board/contracts/flight-recorder-tutor.md
 *   - board/contracts/progress-analytics.md
 *   - board/contracts/learning-content.md
 *
 * Tests:
 *   1. All golden fixtures pass real Zod schema.parse(...) validation.
 *   2. Deliberate breakages are caught by Zod schema rejection:
 *      - Renamed field (e.g. "probability" instead of "probabilities")
 *      - Missing requestId in ErrorEnvelope
 *      - Missing id in MisconceptionSignal or LearnerProfile
 *      - Injected MongoDB ObjectId (_id / $oid) rejected via strict schema
 *
 * Run: pnpm --dir apps/web test tests/fixtures/contract.test.ts
 */

import { describe, it, expect } from "vitest";
import { z, ZodError } from "zod";

import type {
  GateName,
  CircuitSource,
  AdapterName,
  SimulationStatus,
  ComplexValue,
  Operation,
  CircuitModel,
  ReducedQubit,
  StateTraceStep,
  ConformanceResult,
  ContractError,
  SimulationRun,
} from "../../lib/contracts/circuit-simulation";

import type {
  MisconceptionCode,
  MisconceptionEvidence,
  MisconceptionSignal,
  ReplayStep,
  TutorIntent,
  TutorStep,
  NumericalClaim,
  TutorExplanation,
} from "../../lib/contracts/flight-recorder-tutor";

import type {
  SkillStatus,
  ChallengeAttempt,
  SkillState,
  MisconceptionSummaryItem,
  ProgressRecord,
  InstructorInsight,
} from "../../lib/contracts/progress-analytics";

import type {
  LearnerRole,
  PriorKnowledge,
  LearnerProfile,
  LearningPath,
} from "../../lib/contracts/learning-content";

import {
  GOLDEN_IDS,
  GOLDEN_BELL_SIMULATION_RUN,
  GOLDEN_DIAGNOSIS_RESULT,
  GOLDEN_TUTOR_RESPONSE,
  GOLDEN_PROGRESS_AFTER_REPAIR,
  GOLDEN_UNSUPPORTED_GATE_ERROR,
} from "./golden";

// ═════════════════════════════════════════════════════════════════════════════
// Contract Enums (type-checked against imported contract unions)
// ═════════════════════════════════════════════════════════════════════════════

export const GateNames = ["H", "X", "Y", "Z", "CNOT", "MEASURE"] as const satisfies readonly GateName[];
export const AdapterNames = ["QISKIT_AER", "PENNYLANE"] as const satisfies readonly AdapterName[];
export const CircuitSources = ["BUILDER", "SUPPORTED_QISKIT", "SEED"] as const satisfies readonly CircuitSource[];
export const SimulationStatuses = ["SUCCEEDED", "FAILED"] as const satisfies readonly SimulationStatus[];
export const MisconceptionCodes = [
  "SUPERPOSITION_VS_ENTANGLEMENT",
  "MEASUREMENT_DETERMINISM",
  "GATE_ORDER",
  "NO_SIGNAL",
] as const satisfies readonly MisconceptionCode[];
export const SkillStatuses = ["NOT_STARTED", "PRACTICING", "MASTERED"] as const satisfies readonly SkillStatus[];
export const LearnerRoles = ["BEGINNER_CSE", "PHYSICS_TO_CODE"] as const satisfies readonly LearnerRole[];
export const TutorIntents = ["EXPLAIN_DIVERGENCE", "EXPLAIN_CODE_ERROR", "SUGGEST_OPTIMIZATION"] as const satisfies readonly TutorIntent[];

// ═════════════════════════════════════════════════════════════════════════════
// CONTRACT 1: circuit-simulation v1 Schemas
// ═════════════════════════════════════════════════════════════════════════════

export const GateNameSchema = z.enum(GateNames);
export const AdapterNameSchema = z.enum(AdapterNames);
export const CircuitSourceSchema = z.enum(CircuitSources);
export const SimulationStatusSchema = z.enum(SimulationStatuses);

export const ComplexValueSchema = z.object({
  re: z.number(),
  im: z.number(),
}).strict();

export const ReducedQubitSchema = z.object({
  qubit: z.number().int().nonnegative(),
  bloch: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).strict(),
  purity: z.number().min(0).max(1),
  label: z.enum(["PURE_SUBSYSTEM", "MIXED_SUBSYSTEM"]),
}).strict();

export const StateTraceStepSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  operationId: z.string().min(1),
  label: z.string(),
  basisProbabilities: z.record(z.string(), z.number()),
  amplitudes: z.record(z.string(), ComplexValueSchema),
  reducedQubits: z.array(ReducedQubitSchema),
}).strict();

export const ConformanceResultSchema = z.object({
  adapter: AdapterNameSchema,
  maxProbabilityDelta: z.number(),
  epsilon: z.number(),
  passed: z.boolean(),
  skippedReason: z.string().nullable().optional(),
}).strict();

export const OperationSchema = z.object({
  opId: z.string().min(1),
  gate: GateNameSchema,
  targets: z.array(z.number().int().nonnegative()),
  controls: z.array(z.number().int().nonnegative()),
  classicalTargets: z.array(z.number().int().nonnegative()),
  column: z.number().int().nonnegative(),
}).strict();

export const CircuitModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  qubitCount: z.number().int().min(2).max(5),
  classicalBitCount: z.number().int().nonnegative(),
  operations: z.array(OperationSchema),
  source: CircuitSourceSchema,
  openQasm3: z.string().nullable().optional(),
  modelVersion: z.literal(1),
  ownerLearnerProfileId: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

export const ContractErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string(),
  requestId: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const ErrorEnvelopeSchema = z.object({
  error: ContractErrorSchema,
}).strict();

export const SimulationRunSchema = z.object({
  id: z.string().min(1),
  learnerProfileId: z.string().min(1),
  moduleId: z.string().min(1),
  circuitModelId: z.string().min(1),
  circuitSnapshot: z.record(z.string(), z.unknown()).optional(),
  predictionResponse: z.object({
    checkpointId: z.string(),
    answer: z.string(),
  }).strict().optional(),
  adapter: AdapterNameSchema,
  shots: z.number().int().positive(),
  status: SimulationStatusSchema,
  probabilities: z.record(z.string(), z.number()),
  counts: z.record(z.string(), z.number()),
  stateTrace: z.array(StateTraceStepSchema),
  conformance: ConformanceResultSchema.optional(),
  durationMs: z.number().nonnegative(),
  error: ContractErrorSchema.nullable().optional(),
  schemaVersion: z.number().optional(),
  createdAt: z.string(),
}).strict();

// ═════════════════════════════════════════════════════════════════════════════
// CONTRACT 2: flight-recorder-tutor v1 Schemas
// ═════════════════════════════════════════════════════════════════════════════

export const MisconceptionCodeSchema = z.enum(MisconceptionCodes);

export const MisconceptionEvidenceSchema = z.object({
  prediction: z.string(),
  verifiedBehavior: z.string(),
  stateTraceStepIndexes: z.array(z.number().int().nonnegative()),
}).strict();

export const MisconceptionSignalSchema = z.object({
  id: z.string().min(1),
  learnerProfileId: z.string().min(1),
  simulationRunId: z.string().min(1),
  code: MisconceptionCodeSchema,
  firstDivergenceStep: z.number().int().nonnegative().nullable(),
  evidence: MisconceptionEvidenceSchema,
  confidence: z.number().min(0).max(1),
  repairChallengeId: z.string().nullable(),
  createdAt: z.string(),
  schemaVersion: z.number().optional(),
}).strict();

export const ReplayStepSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  headline: z.string(),
  evidenceKeys: z.array(z.string()),
}).strict();

export const DiagnosisResponseSchema = z.object({
  misconceptionSignal: MisconceptionSignalSchema,
  replay: z.array(ReplayStepSchema),
}).strict();

export const TutorStepSchema = z.object({
  title: z.string(),
  body: z.string(),
  evidenceKeys: z.array(z.string()),
}).strict();

export const NumericalClaimSchema = z.object({
  claim: z.string(),
  evidenceKey: z.string(),
}).strict();

export const TutorExplanationSchema = z.object({
  responseId: z.string().min(1),
  intent: z.enum(TutorIntents),
  summary: z.string(),
  steps: z.array(TutorStepSchema),
  numericalClaims: z.array(NumericalClaimSchema),
  repairChallengeId: z.string().nullable(),
  fallbackUsed: z.boolean(),
  model: z.string(),
  safetyNote: z.string(),
}).strict();

export const TutorResponseSchema = z.object({
  tutorResponse: TutorExplanationSchema,
}).strict();

// ═════════════════════════════════════════════════════════════════════════════
// CONTRACT 3: progress-analytics v1 Schemas
// ═════════════════════════════════════════════════════════════════════════════

export const SkillStatusSchema = z.enum(SkillStatuses);

export const ChallengeAttemptSchema = z.object({
  id: z.string().min(1),
  challengeId: z.string().min(1),
  learnerProfileId: z.string().min(1),
  simulationRunId: z.string().optional(),
  submittedAnswer: z.record(z.string(), z.unknown()),
  passed: z.boolean(),
  score: z.number().int().nonnegative(),
  feedbackCode: z.string(),
  attemptNumber: z.number().int().positive(),
  schemaVersion: z.number().optional(),
  createdAt: z.string(),
}).strict();

export const SkillStateSchema = z.object({
  skillId: z.string().min(1),
  status: SkillStatusSchema,
  score: z.number().int().nonnegative(),
}).strict();

export const MisconceptionSummaryItemSchema = z.object({
  code: z.string().min(1),
  count: z.number().int().nonnegative(),
  latestAt: z.string(),
}).strict();

export const ProgressRecordSchema = z.object({
  id: z.string().min(1),
  learnerProfileId: z.string().min(1),
  completedModuleIds: z.array(z.string()),
  skillStates: z.array(SkillStateSchema),
  latestChallengeAttemptId: z.string().nullable(),
  misconceptionSummary: z.array(MisconceptionSummaryItemSchema),
  totalPoints: z.number().int().nonnegative(),
  schemaVersion: z.number().optional(),
  updatedAt: z.string(),
}).strict();

export const ModuleCompletionStatSchema = z.object({
  moduleId: z.string().min(1),
  completed: z.number().int().nonnegative(),
  assigned: z.number().int().nonnegative(),
}).strict();

export const ChallengePassRateStatSchema = z.object({
  challengeId: z.string().min(1),
  passed: z.number().int().nonnegative(),
  attempted: z.number().int().nonnegative(),
  rate: z.number().min(0).max(1),
}).strict();

export const TopMisconceptionStatSchema = z.object({
  code: z.string().min(1),
  learnerCount: z.number().int().nonnegative(),
  occurrences: z.number().int().nonnegative(),
}).strict();

export const LiveDemoLearnerStatSchema = z.object({
  learnerProfileId: z.string().min(1),
  latestAttemptPassed: z.boolean(),
}).strict();

export const InstructorInsightSchema = z.object({
  cohortId: z.string().min(1),
  generatedAt: z.string(),
  learnerCount: z.number().int().nonnegative(),
  moduleCompletion: z.array(ModuleCompletionStatSchema),
  challengePassRate: z.array(ChallengePassRateStatSchema),
  topMisconceptions: z.array(TopMisconceptionStatSchema),
  liveDemoLearner: LiveDemoLearnerStatSchema.optional(),
  dataDisclosure: z.string().optional(),
}).strict();

// ═════════════════════════════════════════════════════════════════════════════
// CONTRACT 4: learning-content v1 Schemas
// ═════════════════════════════════════════════════════════════════════════════

export const PriorKnowledgeSchema = z.object({
  python: z.boolean(),
  linearAlgebra: z.boolean(),
  quantumTheory: z.boolean(),
  circuitProgramming: z.boolean(),
}).strict();

export const LearnerRoleSchema = z.enum(LearnerRoles);

export const LearnerProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  role: LearnerRoleSchema,
  cohortId: z.string().min(1),
  priorKnowledge: PriorKnowledgeSchema,
  completedSkillIds: z.array(z.string()).optional(),
  activeLearningPathId: z.string().min(1),
  schemaVersion: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

export const LearningPathSchema = z.object({
  id: z.string().min(1),
  learnerProfileId: z.string().min(1),
  entryBand: z.enum(["FOUNDATIONS", "THEORY_TO_CODE"]),
  moduleIds: z.array(z.string()),
  currentModuleId: z.string().min(1),
  recommendationReason: z.string(),
  schemaVersion: z.number().optional(),
  updatedAt: z.string(),
}).strict();

// ═════════════════════════════════════════════════════════════════════════════
// CONTRACT 1 TESTS: circuit-simulation v1
// ═════════════════════════════════════════════════════════════════════════════

describe("circuit-simulation v1 — Zod schema validation", () => {
  it("GOLDEN_BELL_SIMULATION_RUN passes SimulationRunSchema.parse()", () => {
    const parsed = SimulationRunSchema.parse(GOLDEN_BELL_SIMULATION_RUN);
    expect(parsed.id).toBe("sr_demo_001");
    expect(parsed.adapter).toBe("QISKIT_AER");
    expect(parsed.status).toBe("SUCCEEDED");
    expect(parsed.shots).toBe(1024);
    expect(parsed.probabilities["00"]).toBe(0.5);
    expect(parsed.probabilities["11"]).toBe(0.5);
    expect(parsed.stateTrace).toHaveLength(2);
  });

  it("ConformanceResultSchema parses valid conformance payload", () => {
    const parsed = ConformanceResultSchema.parse(GOLDEN_BELL_SIMULATION_RUN.conformance);
    expect(parsed.adapter).toBe("PENNYLANE");
    expect(parsed.passed).toBe(true);
    expect(parsed.skippedReason).toBeNull();
  });

  it("CircuitModelSchema parses minimal Bell circuit", () => {
    const bellCircuit = {
      id: "cm_bell_seed",
      name: "Bell State Seed",
      qubitCount: 2,
      classicalBitCount: 2,
      operations: [
        { opId: "op_1", gate: "H", targets: [0], controls: [], classicalTargets: [], column: 0 },
        { opId: "op_2", gate: "CNOT", targets: [1], controls: [0], classicalTargets: [], column: 1 },
        { opId: "op_3", gate: "MEASURE", targets: [0], controls: [], classicalTargets: [0], column: 2 },
        { opId: "op_4", gate: "MEASURE", targets: [1], controls: [], classicalTargets: [1], column: 2 },
      ],
      source: "SEED" as const,
      modelVersion: 1 as const,
    };
    const parsed = CircuitModelSchema.parse(bellCircuit);
    expect(parsed.id).toBe("cm_bell_seed");
    expect(parsed.operations).toHaveLength(4);
  });

  it("GOLDEN_UNSUPPORTED_GATE_ERROR passes ErrorEnvelopeSchema.parse()", () => {
    const parsed = ErrorEnvelopeSchema.parse(GOLDEN_UNSUPPORTED_GATE_ERROR);
    expect(parsed.error.code).toBe("UNSUPPORTED_GATE");
    expect(parsed.error.requestId).toBe("req_demo_001");
  });

  // ── Deliberate breakages ──────────────────────────────────────────────────
  it("[breakage] renamed field 'probability' instead of 'probabilities' throws ZodError", () => {
    const broken = { ...GOLDEN_BELL_SIMULATION_RUN } as Record<string, unknown>;
    broken["probability"] = broken["probabilities"];
    delete broken["probabilities"];

    expect(() => SimulationRunSchema.parse(broken)).toThrow(ZodError);
  });

  it("[breakage] missing requestId in ErrorEnvelope throws ZodError", () => {
    const broken = {
      error: {
        code: "UNSUPPORTED_GATE",
        message: "Gate RX is outside the prototype subset.",
        // requestId intentionally omitted
        details: { operationIndex: 2 },
      },
    };

    expect(() => ErrorEnvelopeSchema.parse(broken)).toThrow(ZodError);
  });

  it("[breakage] injected MongoDB ObjectId (_id / $oid) is rejected by SimulationRunSchema", () => {
    const broken = {
      ...GOLDEN_BELL_SIMULATION_RUN,
      _id: { $oid: "507f1f77bcf86cd799439011" },
    };

    expect(() => SimulationRunSchema.parse(broken)).toThrow(ZodError);
  });

  it("[breakage] injected _id in ErrorEnvelope is rejected by ErrorEnvelopeSchema", () => {
    const broken = {
      ...GOLDEN_UNSUPPORTED_GATE_ERROR,
      _id: "507f1f77bcf86cd799439011",
    };

    expect(() => ErrorEnvelopeSchema.parse(broken)).toThrow(ZodError);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CONTRACT 2 TESTS: flight-recorder-tutor v1
// ═════════════════════════════════════════════════════════════════════════════

describe("flight-recorder-tutor v1 — Zod schema validation", () => {
  it("GOLDEN_DIAGNOSIS_RESULT passes DiagnosisResponseSchema.parse()", () => {
    const parsed = DiagnosisResponseSchema.parse(GOLDEN_DIAGNOSIS_RESULT);
    expect(parsed.misconceptionSignal.id).toBe("ms_demo_001");
    expect(parsed.misconceptionSignal.code).toBe("SUPERPOSITION_VS_ENTANGLEMENT");
    expect(parsed.misconceptionSignal.confidence).toBe(1.0);
    expect(parsed.replay).toHaveLength(2);
  });

  it("MisconceptionCode is a closed enum of exactly 4 valid codes", () => {
    for (const code of MisconceptionCodes) {
      expect(MisconceptionCodeSchema.parse(code)).toBe(code);
    }
    expect(() => MisconceptionCodeSchema.parse("UNKNOWN_MISCONCEPTION")).toThrow(ZodError);
  });

  it("GOLDEN_TUTOR_RESPONSE passes TutorResponseSchema.parse()", () => {
    const parsed = TutorResponseSchema.parse(GOLDEN_TUTOR_RESPONSE);
    expect(parsed.tutorResponse.responseId).toBe("tr_demo_001");
    expect(parsed.tutorResponse.intent).toBe("EXPLAIN_DIVERGENCE");
    expect(parsed.tutorResponse.fallbackUsed).toBe(true);
    expect(parsed.tutorResponse.model).toBe("DEMO_FALLBACK");
    expect(parsed.tutorResponse.numericalClaims).toHaveLength(2);
  });

  // ── Deliberate breakages ──────────────────────────────────────────────────
  it("[breakage] missing id in MisconceptionSignal throws ZodError", () => {
    const broken = { ...GOLDEN_DIAGNOSIS_RESULT.misconceptionSignal } as Record<string, unknown>;
    delete broken["id"];

    expect(() => MisconceptionSignalSchema.parse(broken)).toThrow(ZodError);
  });

  it("[breakage] renamed field 'signalCode' instead of 'code' in MisconceptionSignal throws ZodError", () => {
    const broken = { ...GOLDEN_DIAGNOSIS_RESULT.misconceptionSignal } as Record<string, unknown>;
    broken["signalCode"] = broken["code"];
    delete broken["code"];

    expect(() => MisconceptionSignalSchema.parse(broken)).toThrow(ZodError);
  });

  it("[breakage] injected _id in MisconceptionSignal throws ZodError", () => {
    const broken = {
      ...GOLDEN_DIAGNOSIS_RESULT.misconceptionSignal,
      _id: "507f1f77bcf86cd799439011",
    };

    expect(() => MisconceptionSignalSchema.parse(broken)).toThrow(ZodError);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CONTRACT 3 TESTS: progress-analytics v1
// ═════════════════════════════════════════════════════════════════════════════

describe("progress-analytics v1 — Zod schema validation", () => {
  it("GOLDEN_PROGRESS_AFTER_REPAIR.challengeAttempt passes ChallengeAttemptSchema.parse()", () => {
    const parsed = ChallengeAttemptSchema.parse(GOLDEN_PROGRESS_AFTER_REPAIR.challengeAttempt);
    expect(parsed.id).toBe("ca_demo_001");
    expect(parsed.challengeId).toBe("ch_bell_repair");
    expect(parsed.passed).toBe(true);
    expect(parsed.score).toBe(100);
    expect(parsed.feedbackCode).toBe("BELL_SUPPORT_CORRECT");
  });

  it("GOLDEN_PROGRESS_AFTER_REPAIR.progressRecord passes ProgressRecordSchema.parse()", () => {
    const parsed = ProgressRecordSchema.parse(GOLDEN_PROGRESS_AFTER_REPAIR.progressRecord);
    expect(parsed.id).toBe("progress_lp_aarav");
    expect(parsed.totalPoints).toBe(100);
    expect(parsed.skillStates).toHaveLength(2);
    expect(parsed.completedModuleIds).toContain("mod_bell");
  });

  it("InstructorInsightSchema parses valid aggregate instructor insight", () => {
    const raw = {
      cohortId: "cohort_demo_2026",
      generatedAt: "2026-08-23T05:28:01Z",
      learnerCount: 30,
      moduleCompletion: [{ moduleId: "mod_bell", completed: 18, assigned: 30 }],
      challengePassRate: [{ challengeId: "ch_bell_repair", passed: 17, attempted: 24, rate: 0.7083 }],
      topMisconceptions: [{ code: "SUPERPOSITION_VS_ENTANGLEMENT", learnerCount: 11, occurrences: 15 }],
      liveDemoLearner: { learnerProfileId: "lp_aarav", latestAttemptPassed: true },
      dataDisclosure: "Synthetic seeded cohort plus current live demo attempt",
    };
    const parsed = InstructorInsightSchema.parse(raw);
    expect(parsed.cohortId).toBe("cohort_demo_2026");
    expect(parsed.learnerCount).toBe(30);
  });

  // ── Deliberate breakages ──────────────────────────────────────────────────
  it("[breakage] renamed field 'totalScore' instead of 'totalPoints' in ProgressRecord throws ZodError", () => {
    const broken = { ...GOLDEN_PROGRESS_AFTER_REPAIR.progressRecord } as Record<string, unknown>;
    broken["totalScore"] = broken["totalPoints"];
    delete broken["totalPoints"];

    expect(() => ProgressRecordSchema.parse(broken)).toThrow(ZodError);
  });

  it("[breakage] injected _id in ChallengeAttempt throws ZodError", () => {
    const broken = {
      ...GOLDEN_PROGRESS_AFTER_REPAIR.challengeAttempt,
      _id: { $oid: "507f1f77bcf86cd799439011" },
    };

    expect(() => ChallengeAttemptSchema.parse(broken)).toThrow(ZodError);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CONTRACT 4 TESTS: learning-content v1
// ═════════════════════════════════════════════════════════════════════════════

describe("learning-content v1 — Zod schema validation", () => {
  it("LearnerProfileSchema parses Aarav profile from contract example", () => {
    const raw = {
      id: "lp_aarav",
      displayName: "Aarav",
      role: "BEGINNER_CSE" as const,
      cohortId: "cohort_demo_2026",
      priorKnowledge: {
        python: true,
        linearAlgebra: false,
        quantumTheory: false,
        circuitProgramming: false,
      },
      activeLearningPathId: "path_aarav_foundations",
    };
    const parsed = LearnerProfileSchema.parse(raw);
    expect(parsed.id).toBe("lp_aarav");
    expect(parsed.role).toBe("BEGINNER_CSE");
  });

  it("LearningPathSchema parses Aarav learning path from contract example", () => {
    const raw = {
      id: "path_aarav_foundations",
      learnerProfileId: "lp_aarav",
      entryBand: "FOUNDATIONS" as const,
      moduleIds: ["mod_superposition", "mod_measurement", "mod_bell"],
      currentModuleId: "mod_bell",
      recommendationReason: "Complete the Bell-state lab after the superposition checkpoint.",
      updatedAt: "2026-08-23T05:27:00Z",
    };
    const parsed = LearningPathSchema.parse(raw);
    expect(parsed.entryBand).toBe("FOUNDATIONS");
    expect(parsed.moduleIds).toHaveLength(3);
  });

  // ── Deliberate breakages ──────────────────────────────────────────────────
  it("[breakage] missing id in LearnerProfile throws ZodError", () => {
    const broken = {
      displayName: "Aarav",
      role: "BEGINNER_CSE",
      cohortId: "cohort_demo_2026",
      priorKnowledge: { python: true, linearAlgebra: false, quantumTheory: false, circuitProgramming: false },
      activeLearningPathId: "path_aarav_foundations",
    };

    expect(() => LearnerProfileSchema.parse(broken)).toThrow(ZodError);
  });

  it("[breakage] renamed field 'pathId' instead of 'activeLearningPathId' in LearnerProfile throws ZodError", () => {
    const broken = {
      id: "lp_aarav",
      displayName: "Aarav",
      role: "BEGINNER_CSE",
      cohortId: "cohort_demo_2026",
      priorKnowledge: { python: true, linearAlgebra: false, quantumTheory: false, circuitProgramming: false },
      pathId: "path_aarav_foundations",
    };

    expect(() => LearnerProfileSchema.parse(broken)).toThrow(ZodError);
  });

  it("[breakage] injected _id in LearnerProfile throws ZodError", () => {
    const broken = {
      id: "lp_aarav",
      displayName: "Aarav",
      role: "BEGINNER_CSE",
      cohortId: "cohort_demo_2026",
      priorKnowledge: { python: true, linearAlgebra: false, quantumTheory: false, circuitProgramming: false },
      activeLearningPathId: "path_aarav_foundations",
      _id: { $oid: "507f1f77bcf86cd799439011" },
    };

    expect(() => LearnerProfileSchema.parse(broken)).toThrow(ZodError);
  });

  it("GOLDEN_IDS constants match expected contract identifiers", () => {
    expect(GOLDEN_IDS.learnerProfile).toBe("lp_aarav");
    expect(GOLDEN_IDS.moduleId).toBe("mod_bell");
    expect(GOLDEN_IDS.cohortId).toBe("cohort_demo_2026");
  });
});
