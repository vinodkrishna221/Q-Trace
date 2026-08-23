/**
 * Contract: learning-content (version: 1)
 * Mirror of board/contracts/learning-content.md
 */

export type LearnerRole = "BEGINNER_CSE" | "PHYSICS_TO_CODE";

export interface PriorKnowledge {
  python: boolean;
  linearAlgebra: boolean;
  quantumTheory: boolean;
  circuitProgramming: boolean;
}

export interface LearnerProfile {
  id: string;
  displayName: string;
  role: LearnerRole;
  cohortId: string;
  priorKnowledge: PriorKnowledge;
  completedSkillIds?: string[];
  activeLearningPathId: string;
  schemaVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstructorProfile {
  id: string;
  displayName: string;
  cohortId: string;
}

export interface DemoProfilesResponse {
  profiles: LearnerProfile[];
  instructor: InstructorProfile;
}

export interface LearningPath {
  id: string;
  learnerProfileId: string;
  entryBand: "FOUNDATIONS" | "THEORY_TO_CODE";
  moduleIds: string[];
  currentModuleId: string;
  recommendationReason: string;
  schemaVersion?: number;
  updatedAt: string;
}

export interface LearningPathResponse {
  learningPath: LearningPath;
}

export type ContentBlock =
  | { type: "TEXT"; body: string }
  | { type: "CALLOUT"; tone: "INFO" | "CAUTION"; body: string }
  | { type: "FORMULA"; latex: string }
  | { type: "CIRCUIT_PREVIEW"; circuitModelId: string };

export type PredictionAnswerType = "SINGLE_CHOICE";

export interface PredictionAnswerSchema {
  type: PredictionAnswerType;
  options: string[];
}

export interface PredictionCheckpoint {
  id: string;
  prompt: string;
  answerSchema: PredictionAnswerSchema;
  moduleId?: string;
  misconceptionMap?: Record<string, string>;
  schemaVersion?: number;
}

export interface ModuleSummary {
  id: string;
  slug: string;
  title: string;
  level: "FOUNDATION" | "INTERMEDIATE";
  estimatedMinutes: number;
  skillIds: string[];
}

export interface ModuleDetail extends ModuleSummary {
  contentBlocks: ContentBlock[];
  predictionCheckpoint?: PredictionCheckpoint;
  starterCircuitModelId?: string;
  challengeIds: string[];
  schemaVersion?: number;
}

export interface ModulesResponse {
  modules: ModuleSummary[];
  nextCursor: string | null;
}

export interface ModuleResponse {
  module: ModuleDetail;
}
