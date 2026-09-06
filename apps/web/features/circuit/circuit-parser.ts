import { CircuitModel, Operation, GateName } from '@/lib/contracts';
import { SUPPORTED_GATES_LIST } from './circuit-types';

export interface ParseSuccess {
  success: true;
  circuit: CircuitModel;
  warnings?: string[];
}

export interface ParseFailure {
  success: false;
  errorCode: 'UNSAFE_CODE' | 'UNSUPPORTED_GATE' | 'CIRCUIT_LIMIT_EXCEEDED' | 'PARSE_ERROR';
  error: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

/**
 * Sorts operations stably by column ASC, then primary target ASC, then opId ASC.
 */
export function sortOperations(operations: Operation[]): Operation[] {
  return [...operations].sort((a, b) => {
    if (a.column !== b.column) return a.column - b.column;
    const targetA = a.targets[0] ?? 0;
    const targetB = b.targets[0] ?? 0;
    if (targetA !== targetB) return targetA - targetB;
    return a.opId.localeCompare(b.opId);
  });
}

/**
 * Normalizes operation column indices so that no two conflicting operations on the same qubit wire share a column.
 */
export function serializeCircuitColumns(operations: Operation[]): Operation[] {
  // Track last assigned column for each qubit
  const qubitLastCol: Record<number, number> = {};
  
  // If operations already have distinct columns, sort by column while preserving sequence
  const sorted = [...operations].sort((a, b) => {
    if (a.column !== b.column) return a.column - b.column;
    return 0;
  });

  // If columns are already explicitly assigned and non-conflicting, verify/compact them
  const result: Operation[] = [];

  for (const op of sorted) {
    const participatingQubits = [...op.targets, ...op.controls];
    let maxPrevCol = -1;
    for (const q of participatingQubits) {
      if (qubitLastCol[q] !== undefined && qubitLastCol[q] > maxPrevCol) {
        maxPrevCol = qubitLastCol[q];
      }
    }

    // Determine target column
    let assignedCol: number;
    if (typeof op.column === 'number' && op.column > maxPrevCol) {
      assignedCol = op.column;
    } else {
      assignedCol = maxPrevCol + 1;
    }

    for (const q of participatingQubits) {
      qubitLastCol[q] = assignedCol;
    }

    result.push({
      ...op,
      column: assignedCol,
    });
  }

  return sortOperations(result);
}

/**
 * Generates canonical, valid Qiskit Python code from a CircuitModel.
 */
export function generateQiskitCode(circuit: CircuitModel): string {
  const lines: string[] = [];
  lines.push('from qiskit import QuantumCircuit');
  lines.push('');
  lines.push(`# Initialize ${circuit.qubitCount}-qubit, ${circuit.classicalBitCount}-classical-bit quantum circuit`);
  lines.push(`qc = QuantumCircuit(${circuit.qubitCount}, ${circuit.classicalBitCount})`);
  lines.push('');

  const sortedOps = sortOperations(circuit.operations);
  const columns = Array.from(new Set(sortedOps.map((op) => op.column))).sort((a, b) => a - b);

  for (const col of columns) {
    const colOps = sortedOps.filter((op) => op.column === col);
    const firstOp = colOps[0];
    const colLabel =
      firstOp.gate === 'H'
        ? 'Superposition'
        : firstOp.gate === 'CNOT'
          ? 'Entanglement'
          : firstOp.gate === 'MEASURE'
            ? 'Measurement'
            : `${firstOp.gate} Gate`;
    lines.push(`# Column ${col}: ${colLabel}`);

    const measureOps = colOps.filter((op) => op.gate === 'MEASURE');
    const nonMeasureOps = colOps.filter((op) => op.gate !== 'MEASURE');

    for (const op of nonMeasureOps) {
      switch (op.gate) {
        case 'H':
          lines.push(`qc.h(${op.targets[0]})`);
          break;
        case 'X':
          lines.push(`qc.x(${op.targets[0]})`);
          break;
        case 'Y':
          lines.push(`qc.y(${op.targets[0]})`);
          break;
        case 'Z':
          lines.push(`qc.z(${op.targets[0]})`);
          break;
        case 'CNOT':
          lines.push(`qc.cx(${op.controls[0]}, ${op.targets[0]})`);
          break;
      }
    }

    if (measureOps.length > 1) {
      const targets = measureOps.map((op) => op.targets[0]);
      const classicals = measureOps.map((op) => op.classicalTargets[0] ?? op.targets[0]);
      lines.push(`qc.measure([${targets.join(', ')}], [${classicals.join(', ')}])`);
    } else if (measureOps.length === 1) {
      const op = measureOps[0];
      lines.push(`qc.measure(${op.targets[0]}, ${op.classicalTargets[0] ?? op.targets[0]})`);
    }
  }

  return lines.join('\n') + '\n';
}

const DISALLOWED_KEYWORDS = [
  'os',
  'sys',
  'subprocess',
  'exec',
  'eval',
  '__',
  'open',
  'while',
  'for',
  'def',
  'class',
  'import requests',
  'import urllib',
  'import socket',
  'lambda',
];

/**
 * Safely parses the frozen Qiskit Python subset into a CircuitModel.
 * Rejects unsupported gates (like RX, RY, RZ, SWAP) and unsafe constructs without mutating the model.
 */
export function parseQiskitCode(code: string, currentModel?: CircuitModel): ParseResult {
  if (!code || typeof code !== 'string') {
    return {
      success: false,
      errorCode: 'PARSE_ERROR',
      error: 'Code string is empty or invalid.',
    };
  }

  if (code.length > 8000) {
    return {
      success: false,
      errorCode: 'CIRCUIT_LIMIT_EXCEEDED',
      error: 'Code exceeds 8000 character prototype limit.',
    };
  }

  // 1. Safety verification
  const lowerCode = code.toLowerCase();
  for (const kw of DISALLOWED_KEYWORDS) {
    // Check whole word or token
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(code) || (kw === '__' && code.includes('__'))) {
      return {
        success: false,
        errorCode: 'UNSAFE_CODE',
        error: `UNSAFE_CODE: Unallowed keyword or identifier "${kw}" found. Only linear QuantumCircuit calls are permitted.`,
      };
    }
  }

  // 2. Parse QuantumCircuit initialization
  // Matches: QuantumCircuit(2, 2) or QuantumCircuit(2)
  const initMatch = code.match(/QuantumCircuit\s*\(\s*(\d+)(?:\s*,\s*(\d+))?\s*\)/);
  if (!initMatch) {
    return {
      success: false,
      errorCode: 'PARSE_ERROR',
      error: 'Missing QuantumCircuit initialization: expected "qc = QuantumCircuit(qubitCount, classicalBitCount)".',
    };
  }

  const qubitCount = parseInt(initMatch[1], 10);
  const classicalBitCount = initMatch[2] ? parseInt(initMatch[2], 10) : qubitCount;

  if (qubitCount < 1 || qubitCount > 5) {
    return {
      success: false,
      errorCode: 'CIRCUIT_LIMIT_EXCEEDED',
      error: `qubitCount ${qubitCount} exceeds prototype limit (1 to 5 qubits).`,
    };
  }

  // 3. Scan line by line for method calls on the circuit
  const lines = code.split('\n');
  const operations: Operation[] = [];
  let opIndex = 1;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex].trim();
    if (!rawLine || rawLine.startsWith('#') || rawLine.startsWith('from ') || rawLine.startsWith('import ') || rawLine.includes('QuantumCircuit(')) {
      continue;
    }

    // Match method call on circuit variable: e.g. qc.h(0), qc.cx(0, 1), qc.rx(0.5, 0)
    const callMatch = rawLine.match(/(?:qc|[a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z0-9_]+)\s*\((.*)\)/);
    if (!callMatch) {
      // Check if this line looks like an invalid statement
      if (rawLine.includes('.') || rawLine.includes('(')) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Unrecognized statement "${rawLine}".`,
        };
      }
      continue;
    }

    const methodName = callMatch[1].toLowerCase();
    const argsString = callMatch[2].trim();

    // Check for unsupported gates explicitly
    if (['rx', 'ry', 'rz', 'swap', 'cz', 'crx', 'cry', 'crz', 'u', 'p', 't', 's', 'sdg', 'tdg'].includes(methodName)) {
      const upperGate = methodName.toUpperCase();
      return {
        success: false,
        errorCode: 'UNSUPPORTED_GATE',
        error: `Gate ${upperGate} is outside the prototype subset. Allowed gates: ${SUPPORTED_GATES_LIST.join(', ')}.`,
      };
    }

    if (methodName === 'h') {
      const q = parseInt(argsString, 10);
      if (isNaN(q) || q < 0 || q >= qubitCount) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid target qubit ${argsString} for Hadamard gate.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'H',
        targets: [q],
        controls: [],
        classicalTargets: [],
        column: 0, // will be assigned in serializeCircuitColumns
      });
    } else if (methodName === 'x') {
      const q = parseInt(argsString, 10);
      if (isNaN(q) || q < 0 || q >= qubitCount) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid target qubit ${argsString} for Pauli-X gate.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'X',
        targets: [q],
        controls: [],
        classicalTargets: [],
        column: 0,
      });
    } else if (methodName === 'y') {
      const q = parseInt(argsString, 10);
      if (isNaN(q) || q < 0 || q >= qubitCount) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid target qubit ${argsString} for Pauli-Y gate.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'Y',
        targets: [q],
        controls: [],
        classicalTargets: [],
        column: 0,
      });
    } else if (methodName === 'z') {
      const q = parseInt(argsString, 10);
      if (isNaN(q) || q < 0 || q >= qubitCount) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid target qubit ${argsString} for Pauli-Z gate.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'Z',
        targets: [q],
        controls: [],
        classicalTargets: [],
        column: 0,
      });
    } else if (methodName === 'cx' || methodName === 'cnot') {
      const parts = argsString.split(',').map((p) => parseInt(p.trim(), 10));
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: CNOT requires (control, target) arguments, got "${argsString}".`,
        };
      }
      const [ctrl, tgt] = parts;
      if (ctrl < 0 || ctrl >= qubitCount || tgt < 0 || tgt >= qubitCount || ctrl === tgt) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid CNOT qubits control=${ctrl}, target=${tgt}.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'CNOT',
        targets: [tgt],
        controls: [ctrl],
        classicalTargets: [],
        column: 0,
      });
    } else if (methodName === 'measure') {
      // Handles qc.measure(0, 0) or qc.measure([0, 1], [0, 1])
      if (argsString.startsWith('[')) {
        const match = argsString.match(/\[(.*?)\]\s*,\s*\[(.*?)\]/);
        if (match) {
          const targets = match[1].split(',').map((s) => parseInt(s.trim(), 10));
          const classicals = match[2].split(',').map((s) => parseInt(s.trim(), 10));
          for (let i = 0; i < targets.length; i++) {
            const t = targets[i];
            const c = classicals[i] ?? t;
            if (isNaN(t) || t < 0 || t >= qubitCount) {
              return {
                success: false,
                errorCode: 'PARSE_ERROR',
                error: `Line ${lineIndex + 1}: Invalid measurement target qubit ${t}.`,
              };
            }
            operations.push({
              opId: `op_parsed_${opIndex++}`,
              gate: 'MEASURE',
              targets: [t],
              controls: [],
              classicalTargets: [c],
              column: 0,
            });
          }
        } else {
          return {
            success: false,
            errorCode: 'PARSE_ERROR',
            error: `Line ${lineIndex + 1}: Invalid measure list syntax "${argsString}".`,
          };
        }
      } else {
        const parts = argsString.split(',').map((p) => parseInt(p.trim(), 10));
        const t = parts[0];
        const c = parts[1] ?? t;
        if (isNaN(t) || t < 0 || t >= qubitCount) {
          return {
            success: false,
            errorCode: 'PARSE_ERROR',
            error: `Line ${lineIndex + 1}: Invalid measurement target qubit ${t}.`,
          };
        }
        operations.push({
          opId: `op_parsed_${opIndex++}`,
          gate: 'MEASURE',
          targets: [t],
          controls: [],
          classicalTargets: [c],
          column: 0,
        });
      }
    } else {
      return {
        success: false,
        errorCode: 'UNSUPPORTED_GATE',
        error: `Gate ${methodName.toUpperCase()} is outside the prototype subset. Allowed gates: ${SUPPORTED_GATES_LIST.join(', ')}.`,
      };
    }
  }

  // Allocate stable column positions
  const serializedOps = serializeCircuitColumns(operations);

  const newModel: CircuitModel = {
    id: currentModel?.id || `cm_parsed_${Date.now()}`,
    name: currentModel?.name ? `${currentModel.name} (Synchronized)` : 'Parsed Qiskit Circuit',
    qubitCount,
    classicalBitCount,
    operations: serializedOps,
    source: 'SUPPORTED_QISKIT',
    modelVersion: 1,
  };

  return {
    success: true,
    circuit: newModel,
    warnings: [],
  };
}
