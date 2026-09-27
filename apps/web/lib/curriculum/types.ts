/**
 * Curriculum Data Types for Q-Trace Progressive Learning Path
 * Conforms to board/contracts/learning-content.md
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

export interface HandsOnLabSpec {
  codeSnippet?: string;
  witnessDescription?: string;
  instructions?: string;
}

export interface CurriculumStage {
  id: string;
  lessonId: string;
  unitId: string;
  stageNumber?: string | number;
  category?: string;
  archetype: StageArchetype;
  title: string;
  estimatedMinutes: number;
  coherenceReward: number;
  shieldReward?: number;
  analogyHook: string;
  conceptSummary: string;
  predictionCheckpoint: StagePredictionCheckpoint;
  misconceptionHandled: string;
  handsOnLab?: HandsOnLabSpec;
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
