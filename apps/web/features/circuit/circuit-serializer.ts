import { CircuitModel, Operation, GateName, CircuitSource } from '@/lib/contracts';
import { serializeCircuitColumns, sortOperations } from './circuit-parser';
import { SUPPORTED_GATES_LIST } from './circuit-types';

export interface ImportCircuitSuccess {
  success: true;
  circuit: CircuitModel;
  warnings?: string[];
}

export interface ImportCircuitFailure {
  success: false;
  errorCode:
    | 'UNSAFE_CODE'
    | 'UNSUPPORTED_GATE'
    | 'CIRCUIT_LIMIT_EXCEEDED'
    | 'PARSE_ERROR'
    | 'UNSUPPORTED_VERSION'
    | 'INVALID_CIRCUIT_MODEL';
  error: string;
}

export type ImportCircuitResult = ImportCircuitSuccess | ImportCircuitFailure;

/**
 * Produces a canonical, deterministic normalized CircuitModel.
 * Ensures stable property order, sorted operations, and conflict-free columns.
 */
export function normalizeCircuitModel(circuit: CircuitModel): CircuitModel {
  const operations = circuit.operations || [];
  const serializedOps = serializeCircuitColumns(operations);

  const normalizedOps: Operation[] = serializedOps.map((op) => ({
    opId: op.opId,
    gate: op.gate,
    targets: [...op.targets].sort((a, b) => a - b),
    controls: [...(op.controls || [])].sort((a, b) => a - b),
    classicalTargets: [...(op.classicalTargets || [])].sort((a, b) => a - b),
    column: op.column,
  }));

  const normalized: CircuitModel = {
    id: circuit.id || `cm_normalized_${Date.now()}`,
    name: circuit.name || 'Normalized Quantum Circuit',
    qubitCount: circuit.qubitCount,
    classicalBitCount: circuit.classicalBitCount ?? circuit.qubitCount,
    operations: normalizedOps,
    source: circuit.source || 'BUILDER',
    modelVersion: 1,
  };

  if (circuit.openQasm3 !== undefined && circuit.openQasm3 !== null) {
    normalized.openQasm3 = circuit.openQasm3;
  }
  if (circuit.ownerLearnerProfileId !== undefined && circuit.ownerLearnerProfileId !== null) {
    normalized.ownerLearnerProfileId = circuit.ownerLearnerProfileId;
  }
  if (circuit.createdAt !== undefined && circuit.createdAt !== null) {
    normalized.createdAt = circuit.createdAt;
  }
  if (circuit.updatedAt !== undefined && circuit.updatedAt !== null) {
    normalized.updatedAt = circuit.updatedAt;
  }

  return normalized;
}

/**
 * Serializes a CircuitModel to canonical JSON string.
 */
export function exportCircuitModelJson(circuit: CircuitModel, pretty: boolean = true): string {
  const normalized = normalizeCircuitModel(circuit);
  return pretty ? JSON.stringify(normalized, null, 2) : JSON.stringify(normalized);
}

/**
 * Safely parses and validates a CircuitModel JSON string.
 * Enforces prototype limits (1-5 qubits, <=20 operations, supported gates).
 * Never mutates or accepts invalid payloads.
 */
export function importCircuitModelJson(jsonString: string): ImportCircuitResult {
  if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
    return {
      success: false,
      errorCode: 'PARSE_ERROR',
      error: 'Input string is empty or invalid.',
    };
  }

  if (jsonString.length > 32000) {
    return {
      success: false,
      errorCode: 'CIRCUIT_LIMIT_EXCEEDED',
      error: 'Circuit JSON exceeds 32KB payload limit.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON format';
    return {
      success: false,
      errorCode: 'PARSE_ERROR',
      error: `Failed to parse JSON: ${msg}`,
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      success: false,
      errorCode: 'INVALID_CIRCUIT_MODEL',
      error: 'Expected a JSON object representing a CircuitModel.',
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Check modelVersion
  if (obj.modelVersion !== 1) {
    return {
      success: false,
      errorCode: 'UNSUPPORTED_VERSION',
      error: `Unsupported modelVersion: ${obj.modelVersion}. Only modelVersion 1 is supported by this prototype.`,
    };
  }

  // Check qubitCount
  const qubitCount = typeof obj.qubitCount === 'number' ? obj.qubitCount : parseInt(String(obj.qubitCount), 10);
  if (isNaN(qubitCount) || qubitCount < 1 || qubitCount > 5) {
    return {
      success: false,
      errorCode: 'CIRCUIT_LIMIT_EXCEEDED',
      error: `qubitCount ${obj.qubitCount} exceeds prototype limits (1 to 5 qubits supported).`,
    };
  }

  // Check classicalBitCount
  const classicalBitCount =
    typeof obj.classicalBitCount === 'number'
      ? obj.classicalBitCount
      : typeof obj.classicalBitCount === 'string'
        ? parseInt(obj.classicalBitCount, 10)
        : qubitCount;

  if (isNaN(classicalBitCount) || classicalBitCount < 0 || classicalBitCount > 10) {
    return {
      success: false,
      errorCode: 'INVALID_CIRCUIT_MODEL',
      error: `classicalBitCount ${obj.classicalBitCount} must be between 0 and 10.`,
    };
  }

  // Check operations
  if (!Array.isArray(obj.operations)) {
    return {
      success: false,
      errorCode: 'INVALID_CIRCUIT_MODEL',
      error: 'Missing or invalid "operations" array in CircuitModel.',
    };
  }

  if (obj.operations.length > 20) {
    return {
      success: false,
      errorCode: 'CIRCUIT_LIMIT_EXCEEDED',
      error: `Operation count ${obj.operations.length} exceeds prototype limit of 20 operations.`,
    };
  }

  const validOperations: Operation[] = [];

  for (let i = 0; i < obj.operations.length; i++) {
    const rawOp = obj.operations[i];
    if (!rawOp || typeof rawOp !== 'object') {
      return {
        success: false,
        errorCode: 'INVALID_CIRCUIT_MODEL',
        error: `Operation at index ${i} is not a valid object.`,
      };
    }

    const op = rawOp as Record<string, unknown>;
    const gateStr = String(op.gate || '').toUpperCase();

    if (!SUPPORTED_GATES_LIST.includes(gateStr as GateName)) {
      return {
        success: false,
        errorCode: 'UNSUPPORTED_GATE',
        error: `Gate ${gateStr || 'UNKNOWN'} is outside the prototype subset. Allowed gates: ${SUPPORTED_GATES_LIST.join(', ')}.`,
      };
    }
    const gate = gateStr as GateName;

    // Validate targets
    if (!Array.isArray(op.targets) || op.targets.length === 0) {
      return {
        success: false,
        errorCode: 'INVALID_CIRCUIT_MODEL',
        error: `Operation at index ${i} (${gate}) has no target qubits.`,
      };
    }

    const targets: number[] = op.targets.map((t) => Number(t));
    for (const t of targets) {
      if (isNaN(t) || t < 0 || t >= qubitCount) {
        return {
          success: false,
          errorCode: 'INVALID_CIRCUIT_MODEL',
          error: `Operation at index ${i} (${gate}) has target qubit ${t} out of range [0, ${qubitCount - 1}].`,
        };
      }
    }

    // Validate controls
    const controls: number[] = Array.isArray(op.controls) ? op.controls.map((c) => Number(c)) : [];
    for (const c of controls) {
      if (isNaN(c) || c < 0 || c >= qubitCount) {
        return {
          success: false,
          errorCode: 'INVALID_CIRCUIT_MODEL',
          error: `Operation at index ${i} (${gate}) has control qubit ${c} out of range [0, ${qubitCount - 1}].`,
        };
      }
    }

    if (gate === 'CNOT') {
      if (controls.length !== 1) {
        return {
          success: false,
          errorCode: 'INVALID_CIRCUIT_MODEL',
          error: `CNOT operation at index ${i} must have exactly one control qubit.`,
        };
      }
      if (controls[0] === targets[0]) {
        return {
          success: false,
          errorCode: 'INVALID_CIRCUIT_MODEL',
          error: `CNOT operation at index ${i} cannot have the same control and target qubit (${targets[0]}).`,
        };
      }
    }

    // Classical targets
    const classicalTargets: number[] = Array.isArray(op.classicalTargets)
      ? op.classicalTargets.map((ct) => Number(ct))
      : [];

    const column = typeof op.column === 'number' && !isNaN(op.column) ? Math.max(0, op.column) : i;

    const opId = typeof op.opId === 'string' && op.opId.trim() ? op.opId : `op_imported_${i + 1}`;

    validOperations.push({
      opId,
      gate,
      targets,
      controls,
      classicalTargets,
      column,
    });
  }

  const source: CircuitSource =
    obj.source === 'SEED' || obj.source === 'SUPPORTED_QISKIT' || obj.source === 'BUILDER'
      ? obj.source
      : 'BUILDER';

  const candidateCircuit: CircuitModel = {
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id : `cm_imported_${Date.now()}`,
    name: typeof obj.name === 'string' && obj.name.trim() ? obj.name : 'Imported Circuit',
    qubitCount,
    classicalBitCount,
    operations: validOperations,
    source,
    openQasm3: typeof obj.openQasm3 === 'string' ? obj.openQasm3 : undefined,
    modelVersion: 1,
    ownerLearnerProfileId:
      typeof obj.ownerLearnerProfileId === 'string' ? obj.ownerLearnerProfileId : undefined,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : undefined,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
  };

  const normalized = normalizeCircuitModel(candidateCircuit);

  return {
    success: true,
    circuit: normalized,
    warnings: [],
  };
}
