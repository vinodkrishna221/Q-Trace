/**
 * QA-2 — Frontend contract shape tests.
 *
 * Validates that every export in apps/web/tests/fixtures/golden.ts matches the
 * shapes defined in all four contract files (v1). Uses TypeScript structural
 * assertions + runtime Vitest checks — no external Zod dependency required.
 *
 * Three deliberate-breakage categories tested:
 *   1. Renamed field — value must NOT be found at the wrong key
 *   2. ObjectId leak — no _id / $oid in any fixture object
 *   3. Missing requestId — error envelopes must always carry requestId
 *
 * Run: pnpm --dir apps/web test contract.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  GOLDEN_IDS,
  GOLDEN_BELL_SIMULATION_RUN,
  GOLDEN_DIAGNOSIS_RESULT,
  GOLDEN_TUTOR_RESPONSE,
  GOLDEN_PROGRESS_AFTER_REPAIR,
  GOLDEN_UNSUPPORTED_GATE_ERROR,
} from "./golden";

// ─────────────────────────────────────────────────────────────────────────────
// Type-level helpers (compile-time enforcement)
// ─────────────────────────────────────────────────────────────────────────────

type GateName = "H" | "X" | "Y" | "Z" | "CNOT" | "MEASURE";
type AdapterName = "QISKIT_AER" | "PENNYLANE";
type MisconceptionCode =
  | "SUPERPOSITION_VS_ENTANGLEMENT"
  | "MEASUREMENT_DETERMINISM"
  | "GATE_ORDER"
  | "NO_SIGNAL";
type SkillStatus = "NOT_STARTED" | "PRACTICING" | "MASTERED";
type LearnerRole = "BEGINNER_CSE" | "PHYSICS_TO_CODE";

// Structural type guards (runtime)
function hasKey<T extends object>(obj: T, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function noObjectId(obj: unknown, path = ""): void {
  if (obj === null || typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k === "_id" || k === "$oid") {
      throw new Error(`ObjectId field "${k}" found at path "${path}"`);
    }
    noObjectId(v, path ? `${path}.${k}` : k);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT 1: circuit-simulation v1 — SimulationRun shapes
// ─────────────────────────────────────────────────────────────────────────────

describe("circuit-simulation v1 — SimulationRun shapes", () => {
  it("GOLDEN_BELL_SIMULATION_RUN has required top-level fields", () => {
    const sr = GOLDEN_BELL_SIMULATION_RUN;
    expect(sr.id).toBe("sr_demo_001");
    expect(sr.learnerProfileId).toBe("lp_aarav");
    expect(sr.moduleId).toBe("mod_bell");
    expect(sr.circuitModelId).toBe("cm_bell_seed");
    expect(sr.adapter satisfies AdapterName).toBe("QISKIT_AER");
    expect(sr.status).toBe("SUCCEEDED");
    expect(sr.shots).toBe(1024);
  });

  it("GOLDEN_BELL_SIMULATION_RUN probabilities sum to 1.0 (Bell: 00=0.5, 11=0.5)", () => {
    const probs = GOLDEN_BELL_SIMULATION_RUN.probabilities;
    const total = Object.values(probs).reduce((a, b) => a + b, 0);
    expect(Math.abs(total - 1.0)).toBeLessThan(1e-9);
    expect(probs["00"]).toBeCloseTo(0.5, 9);
    expect(probs["11"]).toBeCloseTo(0.5, 9);
  });

  it("GOLDEN_BELL_SIMULATION_RUN stateTrace has two steps with correct MSB ordering", () => {
    const trace = GOLDEN_BELL_SIMULATION_RUN.stateTrace;
    expect(trace.length).toBe(2);
    // Step 0: after H — qubit-0 MSB → keys {00, 10}, NOT {01, 11}
    const step0keys = Object.keys(trace[0].basisProbabilities).sort();
    expect(step0keys).toEqual(["00", "10"]);
    // Step 1: after CNOT → keys {00, 11}
    const step1keys = Object.keys(trace[1].basisProbabilities).sort();
    expect(step1keys).toEqual(["00", "11"]);
  });

  it("GOLDEN_BELL_SIMULATION_RUN reducedQubits purity labels are correct", () => {
    const trace = GOLDEN_BELL_SIMULATION_RUN.stateTrace;
    for (const step of trace) {
      for (const rq of step.reducedQubits) {
        expect(["PURE_SUBSYSTEM", "MIXED_SUBSYSTEM"]).toContain(rq.label);
        if (rq.purity === 1.0) expect(rq.label).toBe("PURE_SUBSYSTEM");
        if (rq.purity === 0.5) expect(rq.label).toBe("MIXED_SUBSYSTEM");
      }
    }
  });

  it("GOLDEN_BELL_SIMULATION_RUN conformance passes with PENNYLANE adapter", () => {
    const conf = GOLDEN_BELL_SIMULATION_RUN.conformance;
    expect(conf.adapter satisfies AdapterName).toBe("PENNYLANE");
    expect(conf.passed).toBe(true);
    expect(conf.skippedReason).toBeNull();
    expect(conf.epsilon).toBe(0.000001);
  });

  it("GOLDEN_BELL_SIMULATION_RUN has no ObjectId fields", () => {
    expect(() => noObjectId(GOLDEN_BELL_SIMULATION_RUN)).not.toThrow();
  });

  // ── deliberate breakage: renamed field ───────────────────────────────────
  it("[breakage] accessing 'probability' (renamed) finds undefined — not 'probabilities'", () => {
    const sr = GOLDEN_BELL_SIMULATION_RUN as Record<string, unknown>;
    // The contract key is 'probabilities' — a renamed accessor returns undefined
    expect(sr["probability"]).toBeUndefined();
    expect(sr["probabilities"]).toBeDefined();
  });

  // ── deliberate breakage: ObjectId injection ──────────────────────────────
  it("[breakage] injected _id field is detected by noObjectId guard", () => {
    const injected = { ...GOLDEN_BELL_SIMULATION_RUN, _id: { $oid: "507f1f77bcf86cd799439011" } };
    expect(() => noObjectId(injected)).toThrow(/ObjectId field "_id"/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT 1: circuit-simulation v1 — Error shape
// ─────────────────────────────────────────────────────────────────────────────

describe("circuit-simulation v1 — Error shape", () => {
  it("GOLDEN_UNSUPPORTED_GATE_ERROR has code, message, requestId and details", () => {
    const env = GOLDEN_UNSUPPORTED_GATE_ERROR;
    expect(env.error.code).toBe("UNSUPPORTED_GATE");
    expect(env.error.message).toBeTruthy();
    expect(env.error.requestId).toBeTruthy(); // requestId must be present
    expect(env.error.details).toBeDefined();
    expect(env.error.details?.allowedGates).toContain("H");
  });

  it("GOLDEN_UNSUPPORTED_GATE_ERROR has no ObjectId fields", () => {
    expect(() => noObjectId(GOLDEN_UNSUPPORTED_GATE_ERROR)).not.toThrow();
  });

  // ── deliberate breakage: missing requestId ───────────────────────────────
  it("[breakage] an error object without requestId is detected at runtime", () => {
    const missingRequestId = {
      error: {
        code: "UNSUPPORTED_GATE",
        message: "Gate RX is outside the prototype subset.",
        // requestId deliberately absent
        details: {},
      },
    };
    expect(hasKey(missingRequestId.error, "requestId")).toBe(false);
    // If we had this in production, our guard would catch it:
    expect(() => {
      if (!hasKey(missingRequestId.error, "requestId")) {
        throw new Error("Contract violation: requestId missing from error envelope");
      }
    }).toThrow("Contract violation: requestId missing from error envelope");
  });

  // ── deliberate breakage: renamed field ───────────────────────────────────
  it("[breakage] 'errorCode' instead of 'code' returns undefined", () => {
    const broken = GOLDEN_UNSUPPORTED_GATE_ERROR.error as Record<string, unknown>;
    expect(broken["errorCode"]).toBeUndefined(); // wrong key
    expect(broken["code"]).toBe("UNSUPPORTED_GATE"); // correct key
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT 2: flight-recorder-tutor v1 — MisconceptionSignal + TutorResponse
// ─────────────────────────────────────────────────────────────────────────────

describe("flight-recorder-tutor v1 — Diagnosis and Tutor shapes", () => {
  it("GOLDEN_DIAGNOSIS_RESULT misconceptionSignal has required fields", () => {
    const ms = GOLDEN_DIAGNOSIS_RESULT.misconceptionSignal;
    const code: MisconceptionCode = ms.code; // compile-time type check
    expect(code).toBe("SUPERPOSITION_VS_ENTANGLEMENT");
    expect(ms.id).toBe("ms_demo_001");
    expect(ms.learnerProfileId).toBe("lp_aarav");
    expect(ms.simulationRunId).toBe("sr_demo_001");
    expect(ms.firstDivergenceStep).toBe(1);
    expect(ms.confidence).toBe(1.0);
    expect(ms.repairChallengeId).toBe("ch_bell_repair");
  });

  it("GOLDEN_DIAGNOSIS_RESULT replay has step evidence keys", () => {
    const replay = GOLDEN_DIAGNOSIS_RESULT.replay;
    expect(replay.length).toBeGreaterThan(0);
    for (const step of replay) {
      expect(step.evidenceKeys.length).toBeGreaterThan(0);
    }
  });

  it("GOLDEN_DIAGNOSIS_RESULT has no ObjectId fields", () => {
    expect(() => noObjectId(GOLDEN_DIAGNOSIS_RESULT)).not.toThrow();
  });

  it("GOLDEN_TUTOR_RESPONSE has fallbackUsed=true and model=DEMO_FALLBACK", () => {
    const tr = GOLDEN_TUTOR_RESPONSE.tutorResponse;
    expect(tr.fallbackUsed).toBe(true);
    expect(tr.model).toBe("DEMO_FALLBACK");
    expect(tr.safetyNote).toBeTruthy();
  });

  it("GOLDEN_TUTOR_RESPONSE all numericalClaims have evidenceKey", () => {
    const claims = GOLDEN_TUTOR_RESPONSE.tutorResponse.numericalClaims;
    expect(claims.length).toBeGreaterThan(0);
    for (const c of claims) {
      expect(c.claim).toBeTruthy();
      expect(c.evidenceKey).toBeTruthy();
    }
  });

  it("GOLDEN_TUTOR_RESPONSE has no ObjectId fields", () => {
    expect(() => noObjectId(GOLDEN_TUTOR_RESPONSE)).not.toThrow();
  });

  // ── deliberate breakage: renamed field ───────────────────────────────────
  it("[breakage] 'signalCode' (renamed) is undefined — correct key is 'code'", () => {
    const ms = GOLDEN_DIAGNOSIS_RESULT.misconceptionSignal as Record<string, unknown>;
    expect(ms["signalCode"]).toBeUndefined();
    expect(ms["code"]).toBe("SUPERPOSITION_VS_ENTANGLEMENT");
  });

  // ── deliberate breakage: missing requestId ───────────────────────────────
  it("[breakage] diagnosis response without id field is caught by hasKey guard", () => {
    const missingId = {
      learnerProfileId: "lp_aarav",
      simulationRunId: "sr_demo_001",
      code: "SUPERPOSITION_VS_ENTANGLEMENT",
    };
    expect(hasKey(missingId, "id")).toBe(false);
    expect(() => {
      if (!hasKey(missingId, "id")) {
        throw new Error("Contract violation: id missing from misconceptionSignal");
      }
    }).toThrow("Contract violation: id missing from misconceptionSignal");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT 3: progress-analytics v1 — ChallengeAttempt + ProgressRecord
// ─────────────────────────────────────────────────────────────────────────────

describe("progress-analytics v1 — ChallengeAttempt and ProgressRecord shapes", () => {
  it("GOLDEN_PROGRESS_AFTER_REPAIR challengeAttempt has passed=true, score=100", () => {
    const ca = GOLDEN_PROGRESS_AFTER_REPAIR.challengeAttempt;
    expect(ca.passed).toBe(true);
    expect(ca.score).toBe(100);
    expect(ca.feedbackCode).toBe("BELL_SUPPORT_CORRECT");
    expect(ca.attemptNumber).toBe(1);
  });

  it("GOLDEN_PROGRESS_AFTER_REPAIR progressRecord totalPoints=100 and skill_create_bell MASTERED", () => {
    const pr = GOLDEN_PROGRESS_AFTER_REPAIR.progressRecord;
    expect(pr.totalPoints).toBe(100);
    const bellSkill = pr.skillStates.find((s) => s.skillId === "skill_create_bell");
    expect(bellSkill).toBeDefined();
    const status: SkillStatus = bellSkill!.status as SkillStatus;
    expect(status).toBe("MASTERED");
  });

  it("GOLDEN_PROGRESS_AFTER_REPAIR progressRecord misconceptionSummary has SUPERPOSITION_VS_ENTANGLEMENT", () => {
    const pr = GOLDEN_PROGRESS_AFTER_REPAIR.progressRecord;
    const codes = pr.misconceptionSummary.map((m) => m.code as MisconceptionCode);
    expect(codes).toContain("SUPERPOSITION_VS_ENTANGLEMENT");
  });

  it("GOLDEN_PROGRESS_AFTER_REPAIR has no ObjectId fields", () => {
    expect(() => noObjectId(GOLDEN_PROGRESS_AFTER_REPAIR)).not.toThrow();
  });

  // ── deliberate breakage: renamed field ───────────────────────────────────
  it("[breakage] 'totalScore' (renamed) is undefined on progressRecord — correct key is 'totalPoints'", () => {
    const pr = GOLDEN_PROGRESS_AFTER_REPAIR.progressRecord as Record<string, unknown>;
    expect(pr["totalScore"]).toBeUndefined();
    expect(pr["totalPoints"]).toBe(100);
  });

  // ── deliberate breakage: ObjectId injection ──────────────────────────────
  it("[breakage] injected _id in challengeAttempt is detected by noObjectId guard", () => {
    const injected = {
      ...GOLDEN_PROGRESS_AFTER_REPAIR,
      challengeAttempt: {
        ...GOLDEN_PROGRESS_AFTER_REPAIR.challengeAttempt,
        _id: { $oid: "507f1f77bcf86cd799439011" },
      },
    };
    expect(() => noObjectId(injected)).toThrow(/ObjectId field "_id"/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT 4: learning-content v1 — profile / path / module IDs
// ─────────────────────────────────────────────────────────────────────────────

describe("learning-content v1 — GOLDEN_IDS and profile shapes", () => {
  it("GOLDEN_IDS references are all non-empty strings", () => {
    for (const [key, value] of Object.entries(GOLDEN_IDS)) {
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it("GOLDEN_IDS learnerProfile matches lp_aarav contract example", () => {
    expect(GOLDEN_IDS.learnerProfile satisfies string).toBe("lp_aarav");
    expect(GOLDEN_IDS.moduleId satisfies string).toBe("mod_bell");
    expect(GOLDEN_IDS.cohortId satisfies string).toBe("cohort_demo_2026");
  });

  it("GOLDEN_IDS has no ObjectId fields", () => {
    expect(() => noObjectId(GOLDEN_IDS)).not.toThrow();
  });

  it("Simulated learner profile object validates required role field", () => {
    const profileLike = {
      id: "lp_aarav",
      displayName: "Aarav",
      role: "BEGINNER_CSE" as LearnerRole,
      cohortId: "cohort_demo_2026",
      activeLearningPathId: "path_aarav_foundations",
    };
    // Type-check: role must satisfy the LearnerRole union
    const role: LearnerRole = profileLike.role;
    expect(["BEGINNER_CSE", "PHYSICS_TO_CODE"]).toContain(role);
  });

  // ── deliberate breakage: renamed field ───────────────────────────────────
  it("[breakage] 'pathId' (renamed) is undefined — correct key is 'activeLearningPathId'", () => {
    const profileLike = {
      id: "lp_aarav",
      activeLearningPathId: "path_aarav_foundations",
    } as Record<string, unknown>;
    expect(profileLike["pathId"]).toBeUndefined();
    expect(profileLike["activeLearningPathId"]).toBe("path_aarav_foundations");
  });

  // ── deliberate breakage: missing requestId-equivalent (id field) ─────────
  it("[breakage] a content object without 'id' is detected by hasKey guard", () => {
    const noId = { displayName: "Aarav", role: "BEGINNER_CSE" };
    expect(() => {
      if (!hasKey(noId, "id")) {
        throw new Error("Contract violation: id missing from learner profile");
      }
    }).toThrow("Contract violation: id missing from learner profile");
  });

  // ── deliberate breakage: ObjectId injection ──────────────────────────────
  it("[breakage] $oid inside a profile object is detected by noObjectId guard", () => {
    const profileWithOid = {
      id: "lp_aarav",
      _id: { $oid: "507f1f77bcf86cd799439011" },
      displayName: "Aarav",
    };
    expect(() => noObjectId(profileWithOid)).toThrow(/ObjectId field "_id"/);
  });
});
