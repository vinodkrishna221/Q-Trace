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
          : firstOp.gate === 'CCX'
            ? 'Toffoli'
            : firstOp.gate === 'CZ'
              ? 'Controlled-Z'
              : firstOp.gate === 'S' || firstOp.gate === 'T'
                ? 'Phase'
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
        case 'S':
          lines.push(`qc.s(${op.targets[0]})`);
          break;
        case 'T':
          lines.push(`qc.t(${op.targets[0]})`);
          break;
        case 'CNOT':
          lines.push(`qc.cx(${op.controls[0]}, ${op.targets[0]})`);
          break;
        case 'CZ':
          lines.push(`qc.cz(${op.controls[0]}, ${op.targets[0]})`);
          break;
        case 'CCX':
          lines.push(`qc.ccx(${op.controls[0]}, ${op.controls[1]}, ${op.targets[0]})`);
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

  // Security AST / keyword check: Reject unsafe patterns
  // Strip comment-only lines before scanning so generated comments (e.g. "# …classical-bit…")
  // don't false-positive on keywords like "class".
  const codeWithoutComments = code
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n');
  for (const keyword of DISALLOWED_KEYWORDS) {
    if (codeWithoutComments.includes(keyword)) {
      return {
        success: false,
        errorCode: 'UNSAFE_CODE',
        error: `UNSAFE_CODE: Unsafe Python code detected containing prohibited keyword "${keyword}". Execution blocked.`,
      };
    }
  }

  const lines = code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  // Ensure imports are allowlisted
  for (const line of lines) {
    if (line.startsWith('import ') || line.startsWith('from ')) {
      if (
        line !== 'from qiskit import QuantumCircuit' &&
        line !== 'import qiskit'
      ) {
        return {
          success: false,
          errorCode: 'UNSAFE_CODE',
          error: `UNSAFE_CODE: Disallowed import statement "${line}". Only "from qiskit import QuantumCircuit" is permitted.`,
        };
      }
    }
  }

  // Parse QuantumCircuit initialization
  let qubitCount = currentModel?.qubitCount || 2;
  let classicalBitCount = currentModel?.classicalBitCount || 2;
  let circuitInitialized = false;

  const initRegex = /(?:qc\s*=\s*)?QuantumCircuit\((\d+)(?:\s*,\s*(\d+))?\)/;
  for (const line of lines) {
    const match = line.match(initRegex);
    if (match) {
      qubitCount = parseInt(match[1], 10);
      classicalBitCount = match[2] ? parseInt(match[2], 10) : qubitCount;
      circuitInitialized = true;
      break;
    }
  }

  if (!circuitInitialized && lines.some((l) => l.startsWith('qc.'))) {
    // If not explicitly declared in code, keep currentModel dimension
    qubitCount = currentModel?.qubitCount || 2;
    classicalBitCount = currentModel?.classicalBitCount || 2;
  }

  // Validate limits (prototype max 5 qubits)
  if (qubitCount < 1 || qubitCount > 5) {
    return {
      success: false,
      errorCode: 'CIRCUIT_LIMIT_EXCEEDED',
      error: `Qubit count ${qubitCount} exceeds prototype limit of 1-5 qubits.`,
    };
  }

  const operations: Operation[] = [];
  let opIndex = 1;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex];

    // Skip blank lines, comments, and import/initialization lines
    if (
      rawLine.trim() === '' ||
      rawLine.trim().startsWith('#') ||
      rawLine.startsWith('from qiskit') ||
      rawLine.startsWith('import qiskit') ||
      rawLine.includes('QuantumCircuit(')
    ) {
      continue;
    }

    // Match qc.<method>(<args>)
    const callMatch = rawLine.match(/^qc\.([a-zA-Z0-9_]+)\((.*)\)$/);
    if (!callMatch) {
      if (rawLine.startsWith('qc.')) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Malformed gate call syntax "${rawLine}".`,
        };
      } else {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Unrecognized statement "${rawLine}".`,
        };
      }
    }

    const methodName = callMatch[1].toLowerCase();
    const argsString = callMatch[2].trim();

    // Check for unsupported gates explicitly
    if (['rx', 'ry', 'rz', 'swap', 'crx', 'cry', 'crz', 'u', 'p', 'sdg', 'tdg'].includes(methodName)) {
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
    } else if (methodName === 's') {
      const q = parseInt(argsString, 10);
      if (isNaN(q) || q < 0 || q >= qubitCount) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid target qubit ${argsString} for Phase S gate.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'S',
        targets: [q],
        controls: [],
        classicalTargets: [],
        column: 0,
      });
    } else if (methodName === 't') {
      const q = parseInt(argsString, 10);
      if (isNaN(q) || q < 0 || q >= qubitCount) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid target qubit ${argsString} for T gate.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'T',
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
    } else if (methodName === 'cz') {
      const parts = argsString.split(',').map((p) => parseInt(p.trim(), 10));
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: CZ requires (control, target) arguments, got "${argsString}".`,
        };
      }
      const [ctrl, tgt] = parts;
      if (ctrl < 0 || ctrl >= qubitCount || tgt < 0 || tgt >= qubitCount || ctrl === tgt) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid CZ qubits control=${ctrl}, target=${tgt}.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'CZ',
        targets: [tgt],
        controls: [ctrl],
        classicalTargets: [],
        column: 0,
      });
    } else if (methodName === 'ccx' || methodName === 'toffoli') {
      const parts = argsString.split(',').map((p) => parseInt(p.trim(), 10));
      if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: CCX requires (control1, control2, target) arguments, got "${argsString}".`,
        };
      }
      const [ctrl1, ctrl2, tgt] = parts;
      if (
        ctrl1 < 0 || ctrl1 >= qubitCount ||
        ctrl2 < 0 || ctrl2 >= qubitCount ||
        tgt < 0 || tgt >= qubitCount ||
        ctrl1 === ctrl2 || ctrl1 === tgt || ctrl2 === tgt
      ) {
        return {
          success: false,
          errorCode: 'PARSE_ERROR',
          error: `Line ${lineIndex + 1}: Invalid CCX qubits control1=${ctrl1}, control2=${ctrl2}, target=${tgt}. Controls and target must be distinct within 0..${qubitCount - 1}.`,
        };
      }
      operations.push({
        opId: `op_parsed_${opIndex++}`,
        gate: 'CCX',
        targets: [tgt],
        controls: [ctrl1, ctrl2],
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
