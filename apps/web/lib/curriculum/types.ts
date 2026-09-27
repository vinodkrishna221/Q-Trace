/**
 * Curriculum Data Types for Q-Trace Progressive Learning Path
 * Conforms to:
 * - board/contracts/learning-content.md (v1)
 * - docs/LEARN-DUOLINGO-PATH-UI-SPEC.md (Section 5.1 Archetypes)
 * - docs/QUANTUM-FOUNDATIONS-CURRICULUM-SPEC.md (Section 3)
 */

export type StageArchetype =
  | "NODE_CONCEPT"
  | "NODE_PREDICTION"
  | "NODE_GATE_LAB"
  | "NODE_DEBUG"
  | "NODE_MILESTONE"
  | "NODE_BONUS";

export interface PredictionCheckpointOption {
  id: string;
  text: string;
  label?: string;
  correct: boolean;
}

export interface StagePredictionCheckpoint {
  id?: string;
  prompt: string;
  options: PredictionCheckpointOption[];
  explanation?: string;
  misconceptionMap?: Record<string, string>;
}

export interface PredictionOption {
  id: string;
  label: string;
  text?: string;
  correct: boolean;
  explanation?: string;
}

export interface PredictionCheckpointData {
  id: string;
  prompt: string;
  options: PredictionOption[];
  correctOptionId: string;
  misconceptionHandled?: string;
}

export interface HandsOnLabSpec {
  codeSnippet?: string;
  witnessDescription?: string;
  instructions?: string;
}

export interface CnotTruthTableEntry {
  input: string;
  output: string;
  control: string;
  targetIn: string;
  targetOut: string;
  explanation?: string;
}

export interface TensorProductMetadata {
  formula: string;
  expansion: string;
  amplitudesScaling: Array<{
    qubits: number | string;
    amplitudes?: number;
    formula?: string;
  }>;
  cosmicScaleNote: string;
}

export interface BellSynthesisMetadata {
  recipe: string[];
  formula: string;
  targetState: string;
}

export interface SubsystemPurityMetadata {
  purityValue: number;
  formula: string;
  reducedDensityMatrix: number[][];
  blochCoordinates: { x: number; y: number; z: number };
  uiBadge: string;
  scientificHonestyNote: string;
}

export interface RepairChallengeMetadata {
  initialState: string;
  targetState: string;
  challengePrompt: string;
  solution: string;
  repairGate: string;
  targetQubit: number;
  misconceptionKey?: string;
}

// ---------------------------------------------------------------------------
// Units 1.8 to 1.10 Specific Metadata Interfaces (DUO-10)
// ---------------------------------------------------------------------------

export interface ShotNoiseConfiguration {
  shots: number;
  varianceFormula: string;
  expectedErrorPercent: number | string;
  description: string;
}

export interface ShotNoiseMetadata {
  formula: string;
  scalingLaw: string;
  configurations: ShotNoiseConfiguration[];
  samplingNote: string;
}

export interface PhaseDistinctionMetadata {
  globalPhase: {
    formula: string;
    observable: boolean;
    description: string;
  };
  relativePhase: {
    formula: string;
    observable: boolean;
    description: string;
  };
  interferenceImpact: string;
}

export interface NoCloningMetadata {
  theorem: string;
  citation: string;
  unitaryProofSummary: string;
  classicalVsQuantumDifference: string;
}

export interface PhaseKickbackMetadata {
  mechanism: string;
  eigenvalueEquation: string;
  controlStateEffect: string;
  algorithmsPowered: string[];
}

export interface TeleportationCorrectionRule {
  aliceMeasurement: string;
  bobCorrection: string;
}

export interface TeleportationProtocolMetadata {
  numQubits: number;
  qubitAssignments: {
    q0: string;
    q1: string;
    q2: string;
  };
  steps: string[];
  classicalBitsTransmitted: number;
  correctionRules: TeleportationCorrectionRule[];
}

export interface CapstoneAcceptanceCriteria {
  circuitQubits: number;
  targetFidelity: number;
  runtimeBackend: string;
  requiredGates: string[];
  verificationMetric: string;
  criteria: string[];
}

export interface CapstoneMetadata {
  challengeName: string;
  archetype: "NODE_MILESTONE";
  bossChallenge: boolean;
  acceptanceCriteria: CapstoneAcceptanceCriteria;
  circuitDefinition: {
    numQubits: number;
    q0Role: string;
    bellPairQubits: [number, number];
    measurementQubits: [number, number];
    correctionQubit: number;
  };
}

export interface AlgorithmBridgeMetadata {
  module1ConceptsMastered: string[];
  module2Preview: string[];
}

export interface CurriculumStage {
  id: string;
  lessonId: string;
  unitId: string;
  unitNumber?: number;
  stageNumber?: string | number;
  category?: string;
  archetype: StageArchetype;
  title: string;
  estimatedMinutes: number;
  coherenceReward: number;
  shieldReward?: number;
  analogyHook?: string;
  conceptSummary: string;
  predictionCheckpoint?: StagePredictionCheckpoint | PredictionCheckpointData;
  misconceptionHandled?: string;
  handsOnLab?: HandsOnLabSpec;
  route?: string;
  tensorProduct?: TensorProductMetadata;
  cnotTruthTable?: CnotTruthTableEntry[];
  bellSynthesis?: BellSynthesisMetadata;
  subsystemPurity?: SubsystemPurityMetadata;
  purityValue?: number;
  repairChallenge?: RepairChallengeMetadata;
  // Units 1.8 to 1.10 Extensions
  shotNoise?: ShotNoiseMetadata;
  phaseDistinction?: PhaseDistinctionMetadata;
  noCloning?: NoCloningMetadata;
  phaseKickback?: PhaseKickbackMetadata;
  teleportationProtocol?: TeleportationProtocolMetadata;
  capstone?: CapstoneMetadata;
  acceptanceCriteria?: CapstoneAcceptanceCriteria;
  algorithmBridge?: AlgorithmBridgeMetadata;
  metadata?: Record<string, unknown>;
}

export interface CurriculumUnitInfo {
  id: string;
  unitNumber: number;
  subUnitNumber?: number;
  title: string;
  subtitle: string;
  stages: CurriculumStage[];
}
