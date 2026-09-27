import { describe, it, expect } from "vitest";
import { units6to7Stages } from "@/lib/curriculum/units-6-to-7";
import type { CurriculumStage, StageArchetype } from "@/lib/curriculum/types";

describe("DUO-9: Curriculum Units 1.6 & 1.7 (Multi-Qubit, CNOT & Bell Correlation)", () => {
  it("verifies all 7 stages are present with valid IDs and unit mapping", () => {
    expect(units6to7Stages).toBeDefined();
    expect(Array.isArray(units6to7Stages)).toBe(true);
    expect(units6to7Stages).toHaveLength(7);

    const expectedLessonIds = [
      "mod1_multi_qubit_register",
      "mod1_gate_cnot",
      "mod1_gates_cz_swap",
      "bell-state",
      "mod1_entanglement_correlation",
      "mod1_subsystem_purity",
      "mod1_flight_recorder_repair",
    ];

    const actualLessonIds = units6to7Stages.map((s) => s.lessonId);
    expect(actualLessonIds).toEqual(expectedLessonIds);

    // Verify each stage has positive estimated minutes and coherence rewards
    for (const stage of units6to7Stages) {
      expect(stage.id).toBeTruthy();
      expect(stage.title).toBeTruthy();
      expect(stage.conceptSummary).toBeTruthy();
      expect(stage.estimatedMinutes).toBeGreaterThan(0);
      expect(stage.coherenceReward).toBeGreaterThan(0);
      expect(["unit_1_6", "unit_1_7"]).toContain(stage.unitId);
    }
  });

  it("verifies bell-state lessonId maps to canonical route /learn/bell-state", () => {
    const bellStage = units6to7Stages.find((s) => s.lessonId === "bell-state");
    expect(bellStage).toBeDefined();
    expect(bellStage?.route).toBe("/learn/bell-state");
    expect(bellStage?.archetype).toBe("NODE_GATE_LAB");
    expect(bellStage?.unitId).toBe("unit_1_7");

    // Verify Bell synthesis recipe metadata
    expect(bellStage?.bellSynthesis).toBeDefined();
    expect(bellStage?.bellSynthesis?.recipe).toHaveLength(4);
    expect(bellStage?.bellSynthesis?.formula).toContain("|Φ⁺⟩");
    expect(bellStage?.bellSynthesis?.formula).toContain("√2");
    expect(bellStage?.bellSynthesis?.recipe.some((r) => r.includes("Hadamard"))).toBe(true);
    expect(bellStage?.bellSynthesis?.recipe.some((r) => r.includes("CNOT"))).toBe(true);
  });

  it("verifies Bell correlation prediction has exactly one correct option (CORRELATED_00_11)", () => {
    const corrStage = units6to7Stages.find(
      (s) => s.lessonId === "mod1_entanglement_correlation"
    );
    expect(corrStage).toBeDefined();
    expect(corrStage?.archetype).toBe("NODE_PREDICTION");

    const checkpoint = corrStage?.predictionCheckpoint;
    expect(checkpoint).toBeDefined();
    expect(checkpoint?.id).toBe("pc_bell_correlation");
    expect(checkpoint?.prompt).toContain("Bob measures");

    const correctOptions = checkpoint?.options.filter((o) => o.correct) || [];
    expect(correctOptions).toHaveLength(1);
    expect(correctOptions[0].id).toBe("CORRELATED_00_11");
    expect(checkpoint?.correctOptionId).toBe("CORRELATED_00_11");
    expect(correctOptions[0].label).toContain("100%");
  });

  it("verifies INDEPENDENT_RANDOM is present as a distractor option", () => {
    const corrStage = units6to7Stages.find(
      (s) => s.lessonId === "mod1_entanglement_correlation"
    );
    const checkpoint = corrStage?.predictionCheckpoint;
    expect(checkpoint).toBeDefined();

    const independentOption = checkpoint?.options.find(
      (o) => o.id === "INDEPENDENT_RANDOM"
    );
    expect(independentOption).toBeDefined();
    expect(independentOption?.correct).toBe(false);
    expect(independentOption?.label).toContain("50% random chance");
    expect(independentOption?.explanation).toContain("Classical Independence Trap");

    // Also verify ZERO_PERCENT distractor exists
    const zeroOption = checkpoint?.options.find((o) => o.id === "ZERO_PERCENT");
    expect(zeroOption).toBeDefined();
    expect(zeroOption?.correct).toBe(false);
  });

  it("verifies purity value for entangled subsystem is exactly 0.50", () => {
    const purityStage = units6to7Stages.find(
      (s) => s.lessonId === "mod1_subsystem_purity"
    );
    expect(purityStage).toBeDefined();
    expect(purityStage?.purityValue).toBe(0.5);
    expect(purityStage?.subsystemPurity).toBeDefined();
    expect(purityStage?.subsystemPurity?.purityValue).toBe(0.5);
    expect(purityStage?.subsystemPurity?.formula).toContain("0.50");

    // Verify scientific honesty coordinates & badge
    expect(purityStage?.subsystemPurity?.blochCoordinates).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
    expect(purityStage?.subsystemPurity?.uiBadge).toContain("Tr(ρ²) = 0.50");
    expect(purityStage?.subsystemPurity?.scientificHonestyNote).toContain(
      "Mathematical representation, not physical trajectory"
    );
  });

  it("verifies NODE_DEBUG archetype is assigned to the flight recorder stage", () => {
    const debugStage = units6to7Stages.find(
      (s) => s.lessonId === "mod1_flight_recorder_repair"
    );
    expect(debugStage).toBeDefined();
    expect(debugStage?.archetype).toBe("NODE_DEBUG");
    expect(debugStage?.unitId).toBe("unit_1_7");

    // Verify Socratic repair challenge metadata
    expect(debugStage?.repairChallenge).toBeDefined();
    expect(debugStage?.repairChallenge?.initialState).toContain("|Φ⁺⟩");
    expect(debugStage?.repairChallenge?.targetState).toContain("|Ψ⁺⟩");
    expect(debugStage?.repairChallenge?.repairGate).toBe("X");
    expect(debugStage?.repairChallenge?.targetQubit).toBe(1);
    expect(debugStage?.repairChallenge?.solution).toContain("X gate on q1");
  });

  it("verifies Unit 1.6 multi-qubit tensor product and CNOT truth table data", () => {
    // 1. Tensor product stage
    const tensorStage = units6to7Stages.find(
      (s) => s.lessonId === "mod1_multi_qubit_register"
    );
    expect(tensorStage).toBeDefined();
    expect(tensorStage?.archetype).toBe("NODE_CONCEPT");
    expect(tensorStage?.tensorProduct).toBeDefined();
    expect(tensorStage?.tensorProduct?.formula).toBe("|ψ⟩ = |ψ₀⟩ ⊗ |ψ₁⟩");
    expect(tensorStage?.tensorProduct?.amplitudesScaling).toEqual([
      { qubits: 1, amplitudes: 2, formula: "2¹ = 2" },
      { qubits: 2, amplitudes: 4, formula: "2² = 4" },
      { qubits: 3, amplitudes: 8, formula: "2³ = 8" },
      { qubits: "N", formula: "2^N" },
    ]);
    expect(tensorStage?.tensorProduct?.cosmicScaleNote).toContain("N = 300");

    // 2. CNOT truth table stage
    const cnotStage = units6to7Stages.find(
      (s) => s.lessonId === "mod1_gate_cnot"
    );
    expect(cnotStage).toBeDefined();
    expect(cnotStage?.archetype).toBe("NODE_GATE_LAB");
    expect(cnotStage?.cnotTruthTable).toHaveLength(4);
    expect(cnotStage?.cnotTruthTable).toEqual([
      {
        input: "|00⟩",
        output: "|00⟩",
        control: "0",
        targetIn: "0",
        targetOut: "0",
        explanation: "Control is 0: target is unchanged (0 → 0)",
      },
      {
        input: "|01⟩",
        output: "|01⟩",
        control: "0",
        targetIn: "1",
        targetOut: "1",
        explanation: "Control is 0: target is unchanged (1 → 1)",
      },
      {
        input: "|10⟩",
        output: "|11⟩",
        control: "1",
        targetIn: "0",
        targetOut: "1",
        explanation: "Control is 1: target is flipped (0 → 1)",
      },
      {
        input: "|11⟩",
        output: "|10⟩",
        control: "1",
        targetIn: "1",
        targetOut: "0",
        explanation: "Control is 1: target is flipped (1 → 0)",
      },
    ]);

    // 3. CZ and SWAP stage
    const czSwapStage = units6to7Stages.find(
      (s) => s.lessonId === "mod1_gates_cz_swap"
    );
    expect(czSwapStage).toBeDefined();
    expect(czSwapStage?.archetype).toBe("NODE_GATE_LAB");
    expect(czSwapStage?.metadata?.czMatrix).toBe("diag(1, 1, 1, -1)");
  });
});
