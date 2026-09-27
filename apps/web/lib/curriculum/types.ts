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
