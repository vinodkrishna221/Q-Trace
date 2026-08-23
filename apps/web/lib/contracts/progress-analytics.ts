/**
 * Contract: progress-analytics (version: 1)
 * Mirror of board/contracts/progress-analytics.md
 */

export type ChallengeType = "QUIZ" | "CIRCUIT_REPAIR";
export type SkillStatus = "NOT_STARTED" | "PRACTICING" | "MASTERED";

export interface AcceptanceRule {
  version: number;
  kind: "PROBABILITY_SUPPORT_EQUALS" | string;
  states: string[];
  epsilon: number;
}

export interface Challenge {
  id: string;
  moduleId: string;
  type: ChallengeType;
  title: string;
  prompt: string;
  starterCircuitModelId?: string;
  acceptanceRule: AcceptanceRule;
  targetsMisconceptionCodes: string[];
  points: number;
  schemaVersion?: number;
}

export interface ChallengeResponse {
  challenge: Challenge;
}

export type ChallengeAnswer =
  | { type: "CIRCUIT_MODEL"; circuitModelId: string }
  | { type: "QUIZ_OPTION"; selectedOption: string };

export interface ChallengeAttempt {
  id: string;
  challengeId: string;
  learnerProfileId: string;
  simulationRunId?: string;
  submittedAnswer: ChallengeAnswer;
  passed: boolean;
  score: number;
  feedbackCode: string;
  attemptNumber: number;
  schemaVersion?: number;
  createdAt: string;
}

export interface SkillState {
  skillId: string;
  status: SkillStatus;
  score: number;
}

export interface MisconceptionSummaryItem {
  code: string;
  count: number;
  latestAt: string;
}

export interface ProgressRecord {
  id: string;
  learnerProfileId: string;
  completedModuleIds: string[];
  skillStates: SkillState[];
  latestChallengeAttemptId: string | null;
  misconceptionSummary: MisconceptionSummaryItem[];
  totalPoints: number;
  schemaVersion?: number;
  updatedAt: string;
}

export interface CreateChallengeAttemptRequest {
  challengeId: string;
  learnerProfileId: string;
  submittedAnswer: ChallengeAnswer;
  simulationRunId?: string;
}

export interface CreateChallengeAttemptResponse {
  challengeAttempt: ChallengeAttempt;
  progressRecord: ProgressRecord;
}

export interface ProgressRecordResponse {
  progressRecord: ProgressRecord;
}

export interface ModuleCompletionStat {
  moduleId: string;
  completed: number;
  assigned: number;
}

export interface ChallengePassRateStat {
  challengeId: string;
  passed: number;
  attempted: number;
  rate: number;
}

export interface TopMisconceptionStat {
  code: string;
  learnerCount: number;
  occurrences: number;
}

export interface LiveDemoLearnerStat {
  learnerProfileId: string;
  latestAttemptPassed: boolean;
}

export interface InstructorInsight {
  cohortId: string;
  generatedAt: string;
  learnerCount: number;
  moduleCompletion: ModuleCompletionStat[];
  challengePassRate: ChallengePassRateStat[];
  topMisconceptions: TopMisconceptionStat[];
  liveDemoLearner: LiveDemoLearnerStat;
  dataDisclosure?: string;
}

export interface InstructorInsightResponse {
  instructorInsight: InstructorInsight;
}
