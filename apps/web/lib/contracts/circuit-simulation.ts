/**
 * Contract: circuit-simulation (version: 1)
 * Mirror of board/contracts/circuit-simulation.md
 */

export type GateName = "H" | "X" | "Y" | "Z" | "CNOT" | "MEASURE";
export type CircuitSource = "BUILDER" | "SUPPORTED_QISKIT" | "SEED";
export type AdapterName = "QISKIT_AER" | "PENNYLANE";
export type SimulationStatus = "SUCCEEDED" | "FAILED";

export interface ComplexValue {
  re: number;
  im: number;
}

export interface Operation {
  opId: string;
  gate: GateName;
  targets: number[];
  controls: number[];
  classicalTargets: number[];
  column: number;
}

export interface CircuitModel {
  id: string;
  name: string;
  qubitCount: number;
  classicalBitCount: number;
  operations: Operation[];
  source: CircuitSource;
  openQasm3?: string | null;
  modelVersion: 1;
  ownerLearnerProfileId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReducedQubit {
  qubit: number;
  bloch: {
    x: number;
    y: number;
    z: number;
  };
  purity: number;
  label: "PURE_SUBSYSTEM" | "MIXED_SUBSYSTEM";
}

export interface StateTraceStep {
  stepIndex: number;
  operationId: string;
  label: string;
  basisProbabilities: Record<string, number>;
  amplitudes: Record<string, ComplexValue>;
  reducedQubits: ReducedQubit[];
}

export interface ConformanceResult {
  adapter: AdapterName;
  maxProbabilityDelta: number;
  epsilon: number;
  passed: boolean;
  skippedReason?: string | null;
}

export interface ContractError {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export interface SimulationRun {
  id: string;
  learnerProfileId: string;
  moduleId: string;
  circuitModelId: string;
  circuitSnapshot?: Partial<CircuitModel>;
  predictionResponse?: {
    checkpointId: string;
    answer: string;
  };
  adapter: AdapterName;
  shots: number;
  status: SimulationStatus;
  probabilities: Record<string, number>;
  counts: Record<string, number>;
  stateTrace: StateTraceStep[];
  conformance?: ConformanceResult;
  durationMs: number;
  error?: ContractError | null;
  schemaVersion?: number;
  createdAt: string;
}

export interface ParseQiskitRequest {
  code: string;
  modelVersion: 1;
}

export interface ParseQiskitResponse {
  circuitModel: CircuitModel;
  warnings: string[];
}

export interface ExportOpenQasm3Request {
  circuitModel: CircuitModel;
}

export interface ExportOpenQasm3Response {
  openQasmVersion: "3.0";
  openQasm3: string;
  lossy: boolean;
  warnings: string[];
}

export interface SimulationRunRequest {
  learnerProfileId: string;
  moduleId: string;
  circuitModel: CircuitModel;
  predictionResponse?: {
    checkpointId: string;
    answer: string;
  };
  primaryAdapter?: AdapterName;
  runConformance?: boolean;
  shots?: number;
}

export interface SimulationRunResponse {
  simulationRun: SimulationRun;
}
