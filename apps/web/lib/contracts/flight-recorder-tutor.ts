/**
 * Contract: flight-recorder-tutor (version: 1)
 * Mirror of board/contracts/flight-recorder-tutor.md
 */

export type MisconceptionCode =
  | "SUPERPOSITION_VS_ENTANGLEMENT"
  | "MEASUREMENT_DETERMINISM"
  | "GATE_ORDER"
  | "NO_SIGNAL";

export interface MisconceptionEvidence {
  prediction: string;
  verifiedBehavior: string;
  stateTraceStepIndexes: number[];
}

export interface MisconceptionSignal {
  id: string;
  learnerProfileId: string;
  simulationRunId: string;
  code: MisconceptionCode;
  firstDivergenceStep: number | null;
  evidence: MisconceptionEvidence;
  confidence: number;
  repairChallengeId: string | null;
  createdAt: string;
  schemaVersion?: number;
}

export interface ReplayStep {
  stepIndex: number;
  headline: string;
  evidenceKeys: string[];
}

export interface DiagnoseRequest {
  learnerProfileId: string;
  simulationRunId: string;
}

export interface DiagnoseResponse {
  misconceptionSignal: MisconceptionSignal;
  replay: ReplayStep[];
}

export type TutorIntent =
  | "EXPLAIN_DIVERGENCE"
  | "EXPLAIN_CODE_ERROR"
  | "SUGGEST_OPTIMIZATION";

export interface TutorStep {
  title: string;
  body: string;
  evidenceKeys: string[];
}

export interface NumericalClaim {
  claim: string;
  evidenceKey: string;
}

export interface TutorExplanation {
  responseId: string;
  intent: TutorIntent;
  summary: string;
  steps: TutorStep[];
  numericalClaims: NumericalClaim[];
  repairChallengeId: string | null;
  fallbackUsed: boolean;
  model: string;
  safetyNote: string;
}

export interface ExplainRequest {
  learnerProfileId: string;
  moduleId: string;
  simulationRunId: string;
  misconceptionSignalId: string;
  intent: TutorIntent;
  learnerQuestion?: string;
}

export interface ExplainResponse {
  tutorResponse: TutorExplanation;
}

export interface CircuitHealthSuggestion {
  code: string;
  message: string;
  verified: boolean;
}

export interface CircuitHealth {
  qubitCount: number;
  gateCount: number;
  measurementCount: number;
  depth: number;
  suggestions: CircuitHealthSuggestion[];
}

export interface CircuitHealthResponse {
  health: CircuitHealth;
}
