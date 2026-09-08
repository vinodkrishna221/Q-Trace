import { CircuitModel, ExportOpenQasm3Response } from '@/lib/contracts';
import { sortOperations } from './circuit-parser';

/**
 * Generates canonical, valid OpenQASM 3.0 code from a CircuitModel.
 * Only uses supported gates: H, X, Y, Z, CNOT, MEASURE.
 */
export function generateOpenQasm3(circuit: CircuitModel): string {
  const lines: string[] = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    `qubit[${circuit.qubitCount}] q;`,
  ];

  const hasMeasurement = circuit.operations.some((op) => op.gate === 'MEASURE');
  if (circuit.classicalBitCount > 0 && hasMeasurement) {
    lines.push(`bit[${circuit.classicalBitCount}] c;`);
  }

  const sortedOps = sortOperations(circuit.operations || []);

  for (const op of sortedOps) {
    switch (op.gate) {
      case 'H':
        lines.push(`h q[${op.targets[0]}];`);
        break;
      case 'X':
        lines.push(`x q[${op.targets[0]}];`);
        break;
      case 'Y':
        lines.push(`y q[${op.targets[0]}];`);
        break;
      case 'Z':
        lines.push(`z q[${op.targets[0]}];`);
        break;
      case 'CNOT':
        lines.push(`cx q[${op.controls[0]}], q[${op.targets[0]}];`);
        break;
      case 'MEASURE': {
        const cTarget = op.classicalTargets?.[0] ?? op.targets[0];
        lines.push(`c[${cTarget}] = measure q[${op.targets[0]}];`);
        break;
      }
    }
  }

  return lines.join('\n') + '\n';
}

/**
 * Exports OpenQASM 3.0 matching the API response contract.
 */
export function exportOpenQasm3(circuit: CircuitModel): ExportOpenQasm3Response {
  const qasmCode = generateOpenQasm3(circuit);
  return {
    openQasmVersion: '3.0',
    openQasm3: qasmCode,
    lossy: false,
    warnings: [],
  };
}

/**
 * Helper to trigger client-side file download in browser environments.
 */
export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string = 'text/plain;charset=utf-8'
): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
