import { describe, it, expect } from "vitest";
import { units8to10Stages } from "@/lib/curriculum/units-8-to-10";
import type { CurriculumStage, StageArchetype } from "@/lib/curriculum/types";

describe("DUO-10: Curriculum Units 1.8 to 1.10 (Quantum Telemetry, Kickback & Teleportation Stages)", () => {
  it("verifies all 9 stages are present with valid IDs and unit mapping", () => {
    expect(units8to10Stages).toBeDefined();
    expect(Array.isArray(units8to10Stages)).toBe(true);
    expect(units8to10Stages).toHaveLength(9);

    const expectedLessonIds = [
      "mod1_shot_noise",
      "mod1_global_vs_relative_phase",
      "mod1_no_cloning",
      "mod1_quantum_interference",
      "mod1_phase_kickback",
      "mod1_teleportation",
      "mod1_superdense_coding",
      "mod1_capstone_exam",
      "mod1_algorithm_bridge",
    ];

    const actualLessonIds = units8to10Stages.map((s) => s.lessonId);
    expect(actualLessonIds).toEqual(expectedLessonIds);

    // Verify each stage has positive estimated minutes and coherence rewards
    for (const stage of units8to10Stages) {
      expect(stage.id).toBeTruthy();
      expect(stage.title).toBeTruthy();
      expect(stage.conceptSummary).toBeTruthy();
      expect(stage.estimatedMinutes).toBeGreaterThan(0);
      expect(stage.coherenceReward).toBeGreaterThan(0);
      expect(["unit_1_8", "unit_1_9", "unit_1_10"]).toContain(stage.unitId);
    }
  });

  it("verifies capstone mod1_capstone_exam has NODE_MILESTONE archetype", () => {
    const capstoneStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_capstone_exam"
    );
    expect(capstoneStage).toBeDefined();
    expect(capstoneStage?.archetype).toBe("NODE_MILESTONE");
    expect(capstoneStage?.unitId).toBe("unit_1_10");
    expect(capstoneStage?.unitNumber).toBe(10);
    expect(capstoneStage?.stageNumber).toBe(1);
    expect(capstoneStage?.capstone?.bossChallenge).toBe(true);
    expect(capstoneStage?.metadata?.boss).toBe(true);
  });

  it("verifies teleportation protocol has 6 steps in stage metadata", () => {
    const teleportationStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_teleportation"
    );
    expect(teleportationStage).toBeDefined();
    expect(teleportationStage?.archetype).toBe("NODE_GATE_LAB");
    expect(teleportationStage?.unitId).toBe("unit_1_9");

    const protocol = teleportationStage?.teleportationProtocol;
    expect(protocol).toBeDefined();
    expect(protocol?.numQubits).toBe(3);
    expect(protocol?.classicalBitsTransmitted).toBe(2);
    expect(protocol?.steps).toHaveLength(6);

    // Verify key protocol step requirements
    expect(protocol?.steps[0]).toContain("Share a Bell pair");
    expect(protocol?.steps[1]).toContain("CNOT");
    expect(protocol?.steps[1]).toContain("Hadamard");
    expect(protocol?.steps[2]).toContain("measures qubits q0 and q1");
    expect(protocol?.steps[3]).toContain("transmits the 2 classical bits");
    expect(protocol?.steps[4]).toContain("conditional Pauli corrections");
    expect(protocol?.steps[5]).toContain("exact original quantum state");

    // Verify 4 correction rules (00, 01, 10, 11)
    expect(protocol?.correctionRules).toHaveLength(4);
    expect(protocol?.correctionRules.find((r) => r.aliceMeasurement === "00")?.bobCorrection).toContain("Identity");
    expect(protocol?.correctionRules.find((r) => r.aliceMeasurement === "01")?.bobCorrection).toContain("Pauli-X");
    expect(protocol?.correctionRules.find((r) => r.aliceMeasurement === "10")?.bobCorrection).toContain("Pauli-Z");
    expect(protocol?.correctionRules.find((r) => r.aliceMeasurement === "11")?.bobCorrection).toContain("ZX");
  });

  it("verifies shot noise stage includes 3 distinct shot-count configurations (10, 100, 1024)", () => {
    const shotNoiseStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_shot_noise"
    );
    expect(shotNoiseStage).toBeDefined();
    expect(shotNoiseStage?.archetype).toBe("NODE_GATE_LAB");
    expect(shotNoiseStage?.unitId).toBe("unit_1_8");

    const shotNoise = shotNoiseStage?.shotNoise;
    expect(shotNoise).toBeDefined();
    expect(shotNoise?.formula).toContain("1/\\sqrt{N}");
    expect(shotNoise?.configurations).toHaveLength(3);

    const shots = shotNoise?.configurations.map((c) => c.shots);
    expect(shots).toEqual([10, 100, 1024]);

    const config10 = shotNoise?.configurations.find((c) => c.shots === 10);
    const config100 = shotNoise?.configurations.find((c) => c.shots === 100);
    const config1024 = shotNoise?.configurations.find((c) => c.shots === 1024);

    expect(config10).toBeDefined();
    expect(config100).toBeDefined();
    expect(config1024).toBeDefined();

    expect(config10?.expectedErrorPercent).toBe(31.6);
    expect(config100?.expectedErrorPercent).toBe(10.0);
    expect(config1024?.expectedErrorPercent).toBe(3.1);
  });

  it("verifies Module 1 Capstone fidelity threshold (0.99) is in acceptance criteria", () => {
    const capstoneStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_capstone_exam"
    );
    expect(capstoneStage).toBeDefined();

    // Verify acceptance criteria on root and on capstone metadata
    const criteria = capstoneStage?.acceptanceCriteria;
    expect(criteria).toBeDefined();
    expect(criteria?.targetFidelity).toBe(0.99);
    expect(criteria?.circuitQubits).toBe(3);
    expect(criteria?.runtimeBackend).toContain("Qiskit Aer");
    expect(criteria?.verificationMetric).toContain("0.99");
    expect(criteria?.criteria.some((c) => c.includes("0.99"))).toBe(true);

    expect(capstoneStage?.capstone?.acceptanceCriteria.targetFidelity).toBe(0.99);
    expect(capstoneStage?.metadata?.thresholdFidelity).toBe(0.99);

    // Verify 3-qubit circuit role definition
    const circuitDef = capstoneStage?.capstone?.circuitDefinition;
    expect(circuitDef).toBeDefined();
    expect(circuitDef?.numQubits).toBe(3);
    expect(circuitDef?.bellPairQubits).toEqual([1, 2]);
    expect(circuitDef?.measurementQubits).toEqual([0, 1]);
    expect(circuitDef?.correctionQubit).toBe(2);
  });

  it("verifies bridge stage mod1_algorithm_bridge has NODE_CONCEPT archetype", () => {
    const bridgeStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_algorithm_bridge"
    );
    expect(bridgeStage).toBeDefined();
    expect(bridgeStage?.archetype).toBe("NODE_CONCEPT");
    expect(bridgeStage?.unitId).toBe("unit_1_10");
    expect(bridgeStage?.unitNumber).toBe(10);
    expect(bridgeStage?.stageNumber).toBe(2);

    const bridge = bridgeStage?.algorithmBridge;
    expect(bridge).toBeDefined();
    expect(bridge?.module1ConceptsMastered.length).toBeGreaterThanOrEqual(10);
    expect(bridge?.module1ConceptsMastered.some((c) => c.includes("Teleportation"))).toBe(true);
    expect(bridge?.module1ConceptsMastered.some((c) => c.includes("Bell State"))).toBe(true);

    expect(bridge?.module2Preview.length).toBe(7);
    expect(bridge?.module2Preview.some((p) => p.includes("Deutsch-Jozsa"))).toBe(true);
    expect(bridge?.module2Preview.some((p) => p.includes("Grover"))).toBe(true);
    expect(bridge?.module2Preview.some((p) => p.includes("Shor"))).toBe(true);
  });

  it("verifies Unit 1.8 phase distinction & no-cloning theorem data", () => {
    // 1. Phase distinction stage
    const phaseStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_global_vs_relative_phase"
    );
    expect(phaseStage).toBeDefined();
    expect(phaseStage?.archetype).toBe("NODE_PREDICTION");
    expect(phaseStage?.phaseDistinction?.globalPhase.observable).toBe(false);
    expect(phaseStage?.phaseDistinction?.relativePhase.observable).toBe(true);

    const checkpoint = phaseStage?.predictionCheckpoint;
    expect(checkpoint).toBeDefined();
    expect(checkpoint?.correctOptionId).toBe("RELATIVE_PHASE_OBSERVABLE");
    const correctOption = checkpoint?.options.find((o) => o.correct);
    expect(correctOption?.id).toBe("RELATIVE_PHASE_OBSERVABLE");
    expect(checkpoint?.options.some((o) => o.id === "GLOBAL_PHASE_OBSERVABLE" && !o.correct)).toBe(true);

    // 2. No-cloning theorem stage
    const noCloningStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_no_cloning"
    );
    expect(noCloningStage).toBeDefined();
    expect(noCloningStage?.archetype).toBe("NODE_CONCEPT");
    expect(noCloningStage?.noCloning?.citation).toContain("Wootters");
    expect(noCloningStage?.noCloning?.citation).toContain("Zurek");
    expect(noCloningStage?.noCloning?.citation).toContain("1982");
    expect(noCloningStage?.noCloning?.unitaryProofSummary).toContain("⟨ψ|φ⟩");
  });

  it("verifies Unit 1.9 quantum interference, phase kickback & superdense coding data", () => {
    // 1. Quantum interference stage
    const interferenceStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_quantum_interference"
    );
    expect(interferenceStage).toBeDefined();
    expect(interferenceStage?.archetype).toBe("NODE_GATE_LAB");
    expect(interferenceStage?.metadata?.constructiveFormula).toBeDefined();
    expect(interferenceStage?.metadata?.destructiveFormula).toBeDefined();

    // 2. Phase kickback stage
    const kickbackStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_phase_kickback"
    );
    expect(kickbackStage).toBeDefined();
    expect(kickbackStage?.archetype).toBe("NODE_GATE_LAB");
    expect(kickbackStage?.phaseKickback?.algorithmsPowered).toContain("Deutsch-Jozsa Algorithm");
    expect(kickbackStage?.phaseKickback?.algorithmsPowered).toContain("Shor's Factoring Algorithm");
    expect(kickbackStage?.phaseKickback?.controlStateEffect).toContain("absorbs phase");

    // 3. Superdense coding stage
    const superdenseStage = units8to10Stages.find(
      (s) => s.lessonId === "mod1_superdense_coding"
    );
    expect(superdenseStage).toBeDefined();
    expect(superdenseStage?.archetype).toBe("NODE_GATE_LAB");
    expect(superdenseStage?.metadata?.qubitsTransmitted).toBe(1);
    expect(superdenseStage?.metadata?.classicalBitsDecoded).toBe(2);
  });
});
