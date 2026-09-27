import { describe, it, expect } from "vitest";
import {
  UNITS_1_TO_3_STAGES,
  units1To3Stages,
  getStageById,
  getStagesByUnit,
  UNITS_1_TO_3_META,
  CurriculumStage,
} from "../../lib/curriculum/units-1-to-3";

describe("Curriculum Engine: Units 1.1 to 1.3 (DUO-7)", () => {
  const EXPECTED_LESSON_SLUGS = [
    "mod1_transistor_limits",
    "mod1_wave_particle",
    "mod1_discrete_quanta",
    "mod1_bit_vs_qubit",
    "mod1_braket_notation",
    "mod1_amplitudes_normalization",
    "mod1_superposition_truth",
    "mod1_measurement_collapse",
    "mod1_born_rule",
  ];

  it("validates all 9 stages are present and correctly mapped", () => {
    expect(UNITS_1_TO_3_STAGES).toHaveLength(9);
    expect(units1To3Stages).toHaveLength(9);

    const stageIds = UNITS_1_TO_3_STAGES.map((s) => s.id);
    expect(stageIds).toEqual(EXPECTED_LESSON_SLUGS);
  });

  it("ensures all stage IDs exactly match the lessonId slugs from the curriculum spec", () => {
    UNITS_1_TO_3_STAGES.forEach((stage) => {
      expect(stage.id).toBe(stage.lessonId);
      expect(EXPECTED_LESSON_SLUGS).toContain(stage.lessonId);
    });
  });

  it("verifies prediction checkpoint correct flags are mutually exclusive (exactly one correct per stage)", () => {
    UNITS_1_TO_3_STAGES.forEach((stage) => {
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

  it("validates |α|² + |β|² = 1 normalization checkpoint options parse and evaluate correctly", () => {
    const normalizationStage = getStageById("mod1_amplitudes_normalization");
    expect(normalizationStage).toBeDefined();
    expect(normalizationStage?.archetype).toBe("NODE_PREDICTION");

    const checkpoint = normalizationStage!.predictionCheckpoint;
    expect(checkpoint.prompt).toMatch(/\|α\|²\s*\+\s*\|β\|²\s*=\s*1|normalization/i);

    const optionIds = checkpoint.options.map((o) => o.id);
    expect(optionIds).toContain("PLUS_MINUS_ONE_OVER_SQRT_2");
    expect(optionIds).toContain("ZERO");
    expect(optionIds).toContain("ONE");

    const correctOption = checkpoint.options.find((o) => o.id === "PLUS_MINUS_ONE_OVER_SQRT_2");
    expect(correctOption).toBeDefined();
    expect(correctOption?.correct).toBe(true);
    expect(correctOption?.text).toContain("1.0");

    // Math verification of normalization formula
    const alpha = 1 / Math.SQRT2;
    const betaMagnitude = 1 / Math.SQRT2;
    const totalProb = Math.pow(alpha, 2) + Math.pow(betaMagnitude, 2);
    expect(Math.abs(totalProb - 1.0)).toBeLessThan(1e-9);
  });

  it("verifies archetypes conform to Section 3 spec (NODE_CONCEPT | NODE_PREDICTION | NODE_GATE_LAB)", () => {
    const allowedArchetypes = ["NODE_CONCEPT", "NODE_PREDICTION", "NODE_GATE_LAB"];

    UNITS_1_TO_3_STAGES.forEach((stage) => {
      expect(allowedArchetypes).toContain(stage.archetype);
    });

    const predictionStages = UNITS_1_TO_3_STAGES.filter(
      (s) => s.archetype === "NODE_PREDICTION"
    );
    expect(predictionStages.map((s) => s.id)).toContain("mod1_amplitudes_normalization");

    const gateLabStages = UNITS_1_TO_3_STAGES.filter(
      (s) => s.archetype === "NODE_GATE_LAB"
    );
    expect(gateLabStages.map((s) => s.id)).toContain("mod1_measurement_collapse");

    // Measurement collapse lab has hands-on lab code snippet
    const collapseLab = getStageById("mod1_measurement_collapse");
    expect(collapseLab?.handsOnLab?.codeSnippet).toContain("QuantumCircuit");
    expect(collapseLab?.handsOnLab?.codeSnippet).toContain("qc.measure");
  });

  it("verifies unit grouping and division across 1.1, 1.2, and 1.3", () => {
    const unit11 = getStagesByUnit("unit_1_1");
    const unit12 = getStagesByUnit("unit_1_2");
    const unit13 = getStagesByUnit("unit_1_3");

    expect(unit11).toHaveLength(3);
    expect(unit12).toHaveLength(3);
    expect(unit13).toHaveLength(3);

    expect(unit11.map((s) => s.id)).toEqual([
      "mod1_transistor_limits",
      "mod1_wave_particle",
      "mod1_discrete_quanta",
    ]);

    expect(unit12.map((s) => s.id)).toEqual([
      "mod1_bit_vs_qubit",
      "mod1_braket_notation",
      "mod1_amplitudes_normalization",
    ]);

    expect(unit13.map((s) => s.id)).toEqual([
      "mod1_superposition_truth",
      "mod1_measurement_collapse",
      "mod1_born_rule",
    ]);
  });

  it("verifies 5-beat pedagogical fields are populated for every stage", () => {
    UNITS_1_TO_3_STAGES.forEach((stage) => {
      expect(stage.title.trim().length).toBeGreaterThan(0);
      expect(stage.analogyHook.trim().length).toBeGreaterThan(10);
      expect(stage.conceptSummary.trim().length).toBeGreaterThan(10);
      expect(stage.misconceptionHandled.trim().length).toBeGreaterThan(5);
      expect(stage.estimatedMinutes).toBeGreaterThanOrEqual(1);
      expect(stage.coherenceReward).toBeGreaterThanOrEqual(25);
    });
  });

  it("verifies unit metadata and lookup helper functions", () => {
    expect(UNITS_1_TO_3_META).toHaveLength(3);
    expect(UNITS_1_TO_3_META[0].title).toBe("What is 'Quantum'?");
    expect(UNITS_1_TO_3_META[1].title).toBe("The Qubit vs. The Classical Bit");
    expect(UNITS_1_TO_3_META[2].title).toBe("Superposition & Wavefunction Collapse");

    const nonExistent = getStageById("mod1_non_existent");
    expect(nonExistent).toBeUndefined();

    const emptyUnit = getStagesByUnit("unit_unknown");
    expect(emptyUnit).toEqual([]);
  });
});
