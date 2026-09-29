import { describe, it, expect } from "vitest";
import {
  module2Unit21Stages,
  MODULE_2_UNIT_2_1_META,
} from "@/lib/curriculum/module2-unit-2-1";
import {
  allCurriculumStages,
  getStageById,
  getStagesForUnit,
} from "@/lib/curriculum/all-stages";
import type { CurriculumStage, StageArchetype } from "@/lib/curriculum/types";

describe("FEA-3: Module 2 Unit 2.1 Curriculum (Grover's Search Algorithm)", () => {
  it("verifies all 9 stages are present with valid IDs and unitId 'unit_2_1'", () => {
    expect(module2Unit21Stages).toBeDefined();
    expect(Array.isArray(module2Unit21Stages)).toBe(true);
    expect(module2Unit21Stages).toHaveLength(9);

    const expectedLessonIds = [
      "mod2_grover_oracle_concept",
      "mod2_amplitude_amplification",
      "mod2_toffoli_ccx",
      "mod2_grover_speedup",
      "mod2_ccx_lab",
      "mod2_phase_oracle_lab",
      "pc_grover_iterations",
      "mod2_full_grover_lab",
      "mod2_boss_grover",
    ];

    const actualLessonIds = module2Unit21Stages.map((s) => s.lessonId);
    expect(actualLessonIds).toEqual(expectedLessonIds);

    for (const stage of module2Unit21Stages) {
      expect(stage.id).toBeTruthy();
      expect(stage.title).toBeTruthy();
      expect(stage.conceptSummary).toBeTruthy();
      expect(stage.estimatedMinutes).toBeGreaterThan(0);
      expect(stage.coherenceReward).toBeGreaterThan(0);
      expect(stage.unitId).toBe("unit_2_1");
      expect(stage.unitNumber).toBe(2);
    }
  });

  it("verifies stage archetypes map to pedagogical progression across all 9 stages", () => {
    const archetypes: Record<string, StageArchetype> = {
      mod2_grover_oracle_concept: "NODE_CONCEPT",
      mod2_amplitude_amplification: "NODE_CONCEPT",
      mod2_toffoli_ccx: "NODE_CONCEPT",
      mod2_grover_speedup: "NODE_CONCEPT",
      mod2_ccx_lab: "NODE_GATE_LAB",
      mod2_phase_oracle_lab: "NODE_GATE_LAB",
      pc_grover_iterations: "NODE_PREDICTION",
      mod2_full_grover_lab: "NODE_GATE_LAB",
      mod2_boss_grover: "NODE_MILESTONE",
    };

    for (const stage of module2Unit21Stages) {
      expect(stage.archetype).toBe(archetypes[stage.lessonId]);
    }
  });

  it("verifies Stage 2.1.1 (Oracle Concept) explains phase marking without measurement collapse", () => {
    const stage = module2Unit21Stages.find(
      (s) => s.lessonId === "mod2_grover_oracle_concept"
    );
    expect(stage).toBeDefined();
    expect(stage?.title).toContain("The Oracle");
    expect(stage?.analogyHook).toContain("metal detector");
    expect(stage?.conceptSummary).toContain("phase flip");
    expect(stage?.conceptSummary).toContain("superposition");
    expect(stage?.metadata?.oracleType).toBe("phase_flip");
  });

  it("verifies Stage 2.1.2 (Amplitude Amplification) includes mathematical formulas and diffusion operator", () => {
    const stage = module2Unit21Stages.find(
      (s) => s.lessonId === "mod2_amplitude_amplification"
    );
    expect(stage).toBeDefined();
    expect(stage?.groverMath).toBeDefined();
    expect(stage?.groverMath?.diffusionOperator).toContain("2|s");
    expect(stage?.groverMath?.meanAmplitude).toContain("1/N");
    expect(stage?.groverMath?.reflectionRule).toContain("2ᾱ - αᵢ");
    expect(stage?.groverMath?.optimalIterations).toContain("π/4");
    expect(stage?.groverMath?.finalProbability).toContain("sin²");
  });

  it("verifies Stage 2.1.3 (Toffoli Gate CCX) provides full 8-entry truth table and quantum AND mechanics", () => {
    const stage = module2Unit21Stages.find((s) => s.lessonId === "mod2_toffoli_ccx");
    expect(stage).toBeDefined();
    expect(stage?.gateTruthTable).toBeDefined();
    expect(stage?.gateTruthTable?.gate).toContain("CCX");
    expect(stage?.gateTruthTable?.controls).toBe(2);
    expect(stage?.gateTruthTable?.targets).toBe(1);
    expect(stage?.gateTruthTable?.truthTable).toHaveLength(8);

    // CCX flips target ONLY when controls are 11 (i.e. |110> <-> |111>)
    const flipped110 = stage?.gateTruthTable?.truthTable.find(
      (t) => t.input === "|110⟩"
    );
    expect(flipped110?.output).toBe("|111⟩");

    const flipped111 = stage?.gateTruthTable?.truthTable.find(
      (t) => t.input === "|111⟩"
    );
    expect(flipped111?.output).toBe("|110⟩");

    // All other 6 states are invariant
    const preserved000 = stage?.gateTruthTable?.truthTable.find(
      (t) => t.input === "|000⟩"
    );
    expect(preserved000?.output).toBe("|000⟩");
  });

  it("verifies Stage 2.1.4 (Grover Speedup) contains quadratic complexity scaling table", () => {
    const stage = module2Unit21Stages.find(
      (s) => s.lessonId === "mod2_grover_speedup"
    );
    expect(stage).toBeDefined();
    expect(stage?.speedupTable).toBeDefined();
    expect(stage?.speedupTable?.items).toEqual([4, 8, 16, 64, 1024]);
    expect(stage?.speedupTable?.classicalAvg).toEqual([2, 4, 8, 32, 512]);
    expect(stage?.speedupTable?.groverIterations).toEqual([1, 2, 3, 6, 25]);
    expect(stage?.speedupTable?.successProbability[1]).toBeCloseTo(0.945, 2);
  });

  it("verifies Stage 2.1.5 (CCX Gate Lab) defines 3-qubit circuit setup and expected output", () => {
    const stage = module2Unit21Stages.find((s) => s.lessonId === "mod2_ccx_lab");
    expect(stage).toBeDefined();
    expect(stage?.archetype).toBe("NODE_GATE_LAB");
    expect(stage?.labCircuit).toBeDefined();
    expect(stage?.labCircuit?.qubitCount).toBe(3);
    expect(stage?.labCircuit?.expectedOutput).toContain("|110⟩");
    expect(stage?.handsOnLab?.codeSnippet).toContain("qc.ccx(0, 1, 2)");
  });

  it("verifies Stage 2.1.6 (Phase Oracle Lab) marks |101> with phase inversion", () => {
    const stage = module2Unit21Stages.find(
      (s) => s.lessonId === "mod2_phase_oracle_lab"
    );
    expect(stage).toBeDefined();
    expect(stage?.archetype).toBe("NODE_GATE_LAB");
    expect(stage?.labCircuit?.targetState).toBe("|101⟩");
    expect(stage?.labCircuit?.oracleSteps?.some((s) => s.includes("CCX"))).toBe(true);
    expect(stage?.handsOnLab?.instructions).toContain("oracle");
  });

  it("verifies Stage 2.1.7 (Prediction Checkpoint) has mutually exclusive options and correct 2-iteration answer", () => {
    const stage = module2Unit21Stages.find(
      (s) => s.lessonId === "pc_grover_iterations"
    );
    expect(stage).toBeDefined();
    expect(stage?.archetype).toBe("NODE_PREDICTION");

    const checkpoint = stage?.predictionCheckpoint;
    expect(checkpoint).toBeDefined();
    expect(checkpoint?.id).toBe("pc_grover_iterations");
    expect(checkpoint?.prompt).toContain("how many Grover iterations");

    const correctOptions = checkpoint?.options.filter((o) => o.correct) || [];
    expect(correctOptions).toHaveLength(1);
    expect(correctOptions[0].id).toBe("GROVER_2_ITER");
    expect(checkpoint?.correctOptionId).toBe("GROVER_2_ITER");
    expect(correctOptions[0].label).toContain("2 iterations");
    expect(correctOptions[0].explanation).toContain("94.5%");

    // Verify distractors
    const distractor1 = checkpoint?.options.find((o) => o.id === "GROVER_1_ITER");
    expect(distractor1?.correct).toBe(false);

    const distractor4 = checkpoint?.options.find((o) => o.id === "GROVER_4_ITER");
    expect(distractor4?.correct).toBe(false);
    expect(distractor4?.explanation).toContain("classical intuition fallacy");
  });

  it("verifies Stage 2.1.8 (Full 3-Qubit Grover Circuit Lab) has complete starter circuit definition with CCX", () => {
    const stage = module2Unit21Stages.find(
      (s) => s.lessonId === "mod2_full_grover_lab"
    );
    expect(stage).toBeDefined();
    expect(stage?.starterCircuitDefinition).toBeDefined();
    expect(stage?.starterCircuitDefinition?.qubitCount).toBe(3);
    expect(stage?.starterCircuitDefinition?.classicalBitCount).toBe(3);

    const ops = stage?.starterCircuitDefinition?.operations || [];
    expect(ops.length).toBeGreaterThan(15);

    // Verify CCX gates are present for oracle and diffusion
    const ccxOps = ops.filter((op) => op.gate === "CCX");
    expect(ccxOps.length).toBe(2);
    expect(ccxOps[0].controls).toEqual([0, 1]);
    expect(ccxOps[0].targets).toEqual([2]);

    // Verify H and MEASURE gates are present
    const hOps = ops.filter((op) => op.gate === "H");
    expect(hOps.length).toBeGreaterThanOrEqual(6);
    const measureOps = ops.filter((op) => op.gate === "MEASURE");
    expect(measureOps).toHaveLength(3);

    expect(stage?.acceptanceCriteria?.targetProbability).toBeGreaterThanOrEqual(0.9);
  });

  it("verifies Stage 2.1.9 (Grover Boss) is a NODE_MILESTONE boss challenge", () => {
    const stage = module2Unit21Stages.find(
      (s) => s.lessonId === "mod2_boss_grover"
    );
    expect(stage).toBeDefined();
    expect(stage?.archetype).toBe("NODE_MILESTONE");
    expect(stage?.bossChallenge).toBe(true);
    expect(stage?.acceptanceCriteria?.targetProbability).toBe(0.9);
    expect(stage?.acceptanceCriteria?.requiredGates).toContain("CCX");
    expect(stage?.coherenceReward).toBe(150);
  });

  it("verifies MODULE_2_UNIT_2_1_META metadata is properly configured", () => {
    expect(MODULE_2_UNIT_2_1_META).toBeDefined();
    expect(MODULE_2_UNIT_2_1_META.id).toBe("unit_2_1");
    expect(MODULE_2_UNIT_2_1_META.unitNumber).toBe(2);
    expect(MODULE_2_UNIT_2_1_META.subUnitNumber).toBe(1);
    expect(MODULE_2_UNIT_2_1_META.title).toBe("Grover's Search Algorithm");
    expect(MODULE_2_UNIT_2_1_META.stages).toHaveLength(9);
  });

  it("verifies allCurriculumStages integrates module2Unit21Stages seamlessly", () => {
    expect(allCurriculumStages).toBeDefined();
    expect(allCurriculumStages.length).toBeGreaterThanOrEqual(9);

    // Stage lookup by id
    const oracleStage = getStageById("mod2_grover_oracle_concept");
    expect(oracleStage).toBeDefined();
    expect(oracleStage?.unitId).toBe("unit_2_1");

    const bossStage = getStageById("mod2_boss_grover");
    expect(bossStage).toBeDefined();
    expect(bossStage?.archetype).toBe("NODE_MILESTONE");

    const predictionStage = getStageById("pc_grover_iterations");
    expect(predictionStage).toBeDefined();
    expect(predictionStage?.predictionCheckpoint?.correctOptionId).toBe(
      "GROVER_2_ITER"
    );

    // Unit filtering
    const unit2Stages = getStagesForUnit(2);
    expect(unit2Stages).toHaveLength(9);
  });
});
