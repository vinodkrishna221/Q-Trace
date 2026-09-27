import { describe, it, expect } from "vitest";
import {
  UNITS_4_TO_5_STAGES,
  units4To5Stages,
  UNITS_4_TO_5_META,
  GATE_MATRICES,
  getStageById,
  getStagesByUnit,
} from "../../lib/curriculum/units-4-to-5";
import {
  getStageById as getUnifiedStageById,
  getStagesByUnit as getUnifiedStagesByUnit,
  ALL_CURRICULUM_STAGES,
  ALL_CURRICULUM_UNITS_META,
} from "../../lib/curriculum";

describe("Curriculum Engine: Units 1.4 to 1.5 (DUO-8)", () => {
  const EXPECTED_LESSON_SLUGS = [
    "mod1_bloch_sphere_intro",
    "mod1_bloch_coordinates",
    "mod1_bloch_sandbox",
    "mod1_gate_x",
    "superposition",
    "mod1_gate_h_reversibility",
    "mod1_gate_z",
    "mod1_gate_y",
    "mod1_phase_gates_s_t",
    "mod1_boss_qrng",
  ];

  it("validates all 10 stages are present in Units 1.4 and 1.5", () => {
    expect(UNITS_4_TO_5_STAGES).toHaveLength(10);
    expect(units4To5Stages).toHaveLength(10);

    const stageIds = UNITS_4_TO_5_STAGES.map((s) => s.id);
    expect(stageIds).toEqual(EXPECTED_LESSON_SLUGS);
  });

  it("ensures all stage IDs match the lessonId slugs from the curriculum spec", () => {
    UNITS_4_TO_5_STAGES.forEach((stage) => {
      expect(stage.id).toBe(stage.lessonId);
      expect(EXPECTED_LESSON_SLUGS).toContain(stage.lessonId);
    });
  });

  it("verifies superposition lessonId maps to existing route /learn/superposition", () => {
    const superpositionStage = getStageById("superposition");
    expect(superpositionStage).toBeDefined();
    expect(superpositionStage?.lessonId).toBe("superposition");
    expect(superpositionStage?.route).toBe("/learn/superposition");
    expect(superpositionStage?.metadata?.route).toBe("/learn/superposition");
    expect(superpositionStage?.archetype).toBe("NODE_GATE_LAB");
  });

  it("verifies QRNG boss has NODE_MILESTONE archetype and capstone challenge criteria", () => {
    const qrngBoss = getStageById("mod1_boss_qrng");
    expect(qrngBoss).toBeDefined();
    expect(qrngBoss?.archetype).toBe("NODE_MILESTONE");
    expect(qrngBoss?.category).toBe("Capstone Boss");
    expect(qrngBoss?.coherenceReward).toBe(100);
    expect(qrngBoss?.shieldReward).toBe(50);

    // Metadata criteria
    const metadata = qrngBoss?.metadata;
    expect(metadata).toBeDefined();
    expect(metadata?.bossChallenge).toBe(true);
    expect(metadata?.milestoneType).toBe("UNIT_1_CAPSTONE");
    expect(metadata?.shotsRequired).toBe(1024);
    expect(metadata?.allowedOutcomeTolerance).toEqual([0.2, 0.3]);
    expect(metadata?.expectedOutcomes).toEqual(["00", "01", "10", "11"]);
    expect(metadata?.expectedProbability).toBe(0.25);
    expect(metadata?.zeroCnotRequirement).toBe(true);
    expect(metadata?.allowedGateTypes).toContain("h");
    expect(metadata?.prohibitedGateTypes).toContain("cnot");
    expect(metadata?.prohibitedGateTypes).toContain("cx");
  });

  it("verifies statevector fidelity acceptance criteria (F >= 0.99 for boss) is included in stage metadata", () => {
    const qrngBoss = getStageById("mod1_boss_qrng");
    expect(qrngBoss).toBeDefined();
    const fidelity = qrngBoss?.metadata?.statevectorFidelity as number;
    const threshold = qrngBoss?.metadata?.fidelityThreshold as number;

    expect(fidelity).toBeDefined();
    expect(fidelity).toBeGreaterThanOrEqual(0.99);
    expect(threshold).toBeDefined();
    expect(threshold).toBeGreaterThanOrEqual(0.99);
  });

  it("verifies H reversibility checkpoint has exactly DETERMINISTIC_0 as the correct answer", () => {
    const reversibilityStage = getStageById("mod1_gate_h_reversibility");
    expect(reversibilityStage).toBeDefined();
    expect(reversibilityStage?.archetype).toBe("NODE_PREDICTION");

    const checkpoint = reversibilityStage!.predictionCheckpoint;
    expect(checkpoint.prompt).toContain("H -> H");

    const optionIds = checkpoint.options.map((o) => o.id);
    expect(optionIds).toContain("DETERMINISTIC_0");
    expect(optionIds).toContain("RANDOM_50_50");
    expect(optionIds).toContain("ALWAYS_1");

    const correctOption = checkpoint.options.find((o) => o.correct === true);
    expect(correctOption).toBeDefined();
    expect(correctOption?.id).toBe("DETERMINISTIC_0");
    expect(correctOption?.text).toContain("100% |0⟩");

    const incorrectOptions = checkpoint.options.filter((o) => o.correct === false);
    expect(incorrectOptions).toHaveLength(2);
    expect(incorrectOptions.map((o) => o.id)).toEqual(
      expect.arrayContaining(["RANDOM_50_50", "ALWAYS_1"])
    );

    // Misconception check
    expect(checkpoint.misconceptionMap?.RANDOM_50_50).toBeDefined();
    expect(reversibilityStage?.misconceptionHandled).toContain("twice as random");
  });

  it("verifies prediction checkpoint correct flags are mutually exclusive (exactly one correct per stage)", () => {
    UNITS_4_TO_5_STAGES.forEach((stage) => {
      expect(stage.predictionCheckpoint).toBeDefined();
      expect(stage.predictionCheckpoint.options.length).toBeGreaterThanOrEqual(2);

      const correctOptions = stage.predictionCheckpoint.options.filter(
        (opt) => opt.correct === true
      );
      expect(
        correctOptions.length,
        `Stage ${stage.id} should have exactly one correct option`
      ).toBe(1);

      const incorrectOptions = stage.predictionCheckpoint.options.filter(
        (opt) => opt.correct === false
      );
      expect(
        incorrectOptions.length,
        `Stage ${stage.id} should have at least one incorrect option`
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it("verifies gate truth tables and matrix definitions", () => {
    // Pauli-X
    expect(GATE_MATRICES.X.matrix).toEqual([
      [0, 1],
      [1, 0],
    ]);

    // Pauli-Z
    expect(GATE_MATRICES.Z.matrix).toEqual([
      [1, 0],
      [0, -1],
    ]);

    // Hadamard (1/√2)
    const invSqrt2 = 1 / Math.SQRT2;
    expect(GATE_MATRICES.H.matrix[0][0]).toBeCloseTo(invSqrt2, 5);
    expect(GATE_MATRICES.H.matrix[0][1]).toBeCloseTo(invSqrt2, 5);
    expect(GATE_MATRICES.H.matrix[1][0]).toBeCloseTo(invSqrt2, 5);
    expect(GATE_MATRICES.H.matrix[1][1]).toBeCloseTo(-invSqrt2, 5);

    // Pauli-Y
    expect(GATE_MATRICES.Y.matrix).toEqual([
      [0, "-i"],
      ["i", 0],
    ]);

    // Phase S & T
    expect(GATE_MATRICES.S.matrix).toEqual([
      [1, 0],
      [0, "i"],
    ]);
    expect(GATE_MATRICES.T.matrix).toEqual([
      [1, 0],
      [0, "e^(iπ/4)"],
    ]);
  });

  it("verifies 3D Bloch sphere stage metadata (theta/phi coordinate explanations)", () => {
    const coordinatesStage = getStageById("mod1_bloch_coordinates");
    expect(coordinatesStage).toBeDefined();
    expect(coordinatesStage?.metadata?.formula).toContain("cos(θ/2)");
    expect(coordinatesStage?.metadata?.polarAngleRange).toContain("0 <= θ <= π");
    expect(coordinatesStage?.metadata?.azimuthalAngleRange).toContain("0 <= φ < 2π");

    const sandboxStage = getStageById("mod1_bloch_sandbox");
    expect(sandboxStage).toBeDefined();
    expect(sandboxStage?.metadata?.cartesianFormula).toContain("x = sin(θ)cos(φ)");
    expect(sandboxStage?.metadata?.statePlusCoords).toEqual([1, 0, 0]);
  });

  it("verifies unit grouping across Unit 1.4 (3 stages) and Unit 1.5 (7 stages)", () => {
    const unit14 = getStagesByUnit("unit_1_4");
    const unit15 = getStagesByUnit("unit_1_5");

    expect(unit14).toHaveLength(3);
    expect(unit15).toHaveLength(7);

    expect(unit14.map((s) => s.id)).toEqual([
      "mod1_bloch_sphere_intro",
      "mod1_bloch_coordinates",
      "mod1_bloch_sandbox",
    ]);

    expect(unit15.map((s) => s.id)).toEqual([
      "mod1_gate_x",
      "superposition",
      "mod1_gate_h_reversibility",
      "mod1_gate_z",
      "mod1_gate_y",
      "mod1_phase_gates_s_t",
      "mod1_boss_qrng",
    ]);
  });

  it("verifies 5-beat pedagogical fields are populated for every stage", () => {
    UNITS_4_TO_5_STAGES.forEach((stage) => {
      expect(stage.title.trim().length).toBeGreaterThan(0);
      expect(stage.analogyHook.trim().length).toBeGreaterThan(10);
      expect(stage.conceptSummary.trim().length).toBeGreaterThan(10);
      expect(stage.misconceptionHandled.trim().length).toBeGreaterThan(5);
      expect(stage.estimatedMinutes).toBeGreaterThanOrEqual(1);
      expect(stage.coherenceReward).toBeGreaterThanOrEqual(25);
    });
  });

  it("verifies unit metadata and lookup helper functions", () => {
    expect(UNITS_4_TO_5_META).toHaveLength(2);
    expect(UNITS_4_TO_5_META[0].title).toBe("The Bloch Sphere");
    expect(UNITS_4_TO_5_META[1].title).toBe("Single-Qubit Logic Gates");

    const nonExistent = getStageById("mod1_unknown");
    expect(nonExistent).toBeUndefined();

    const emptyUnit = getStagesByUnit("unit_unknown");
    expect(emptyUnit).toEqual([]);
  });

  it("verifies unified index.ts provides access across all Units 1-5 (19 total stages)", () => {
    expect(ALL_CURRICULUM_STAGES).toHaveLength(19);
    expect(ALL_CURRICULUM_UNITS_META).toHaveLength(5);

    // Retrieve from Unit 1.1
    const unit1Stage = getUnifiedStageById("mod1_transistor_limits");
    expect(unit1Stage).toBeDefined();
    expect(unit1Stage?.unitId).toBe("unit_1_1");

    // Retrieve from Unit 1.5
    const bossStage = getUnifiedStageById("mod1_boss_qrng");
    expect(bossStage).toBeDefined();
    expect(bossStage?.unitId).toBe("unit_1_5");
    expect(bossStage?.archetype).toBe("NODE_MILESTONE");

    // Query by unit
    const unit15Stages = getUnifiedStagesByUnit("unit_1_5");
    expect(unit15Stages).toHaveLength(7);
  });
});
