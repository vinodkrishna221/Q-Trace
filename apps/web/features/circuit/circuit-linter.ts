import { CircuitModel, Operation, GateName } from '@/lib/contracts';

export type LintSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface LintWarning {
  rule: 'QI-1' | 'QI-2' | 'QI-3' | string;
  severity: LintSeverity;
  qubit: number | null;
  column: number;
  opId: string;
  message: string;
}

export interface LintCircuitRequest {
  circuitModel: CircuitModel;
}

export interface LintCircuitResponse {
  lintWarnings: LintWarning[];
}

/**
 * Pure deterministic client-side linter implementing the 3 rules from docs/FEATURES-SPEC.md §2.2
 */
export function lintCircuitLocally(circuit: CircuitModel): LintWarning[] {
  const warnings: LintWarning[] = [];
  const measuredQubits = new Set<number>();
  const superpositionQubits = new Set<number>();
  const cnotTargetCount = new Map<number, number>();

  // Sort operations stably by column then target
  const sortedOps = [...(circuit.operations || [])].sort((a, b) => {
    if (a.column !== b.column) return a.column - b.column;
    return (a.targets[0] ?? 0) - (b.targets[0] ?? 0);
  });

  for (const op of sortedOps) {
    const gate = op.gate;

    // Track superposition creation (e.g. H gate on a qubit)
    if (gate === 'H') {
      for (const t of op.targets) {
        superpositionQubits.add(t);
      }
    }

    // QI-3: Controlled gate wire collision (check first, ERROR)
    for (const ctrl of op.controls) {
      if (op.targets.includes(ctrl)) {
        warnings.push({
          rule: 'QI-3',
          severity: 'ERROR',
          qubit: ctrl,
          column: op.column,
          opId: op.opId,
          message: `Wire collision: Control qubit q[${ctrl}] == target qubit q[${ctrl}]. A qubit cannot be its own control. Assign control and target to different qubits.`,
        });
      }
    }

    // QI-2: No-cloning violation attempt (INFO)
    // Trigger: CNOT where control or target is in a known-superposition state
    // AND user has placed a second CNOT with the same target.
    if (gate === 'CNOT' && op.controls.length > 0 && op.targets.length > 0) {
      const ctrl = op.controls[0];
      const tgt = op.targets[0];
      const count = (cnotTargetCount.get(tgt) ?? 0) + 1;
      cnotTargetCount.set(tgt, count);

      if (
        count >= 2 &&
        (superpositionQubits.has(tgt) || superpositionQubits.has(ctrl))
      ) {
        warnings.push({
          rule: 'QI-2',
          severity: 'INFO',
          qubit: tgt,
          column: op.column,
          opId: op.opId,
          message: `Cloning attempt detected: You are trying to duplicate a superposition state via two CNOT gates. This does not copy quantum states — it creates entanglement. The No-Cloning Theorem (Wootters & Zurek, 1982) proves this is impossible.`,
        });
      }
    }

    // QI-1: Post-collapse unitary (WARNING)
    // Any unitary gate placed on a qubit wire after MEASURE on same qubit.
    if (gate !== 'MEASURE') {
      const involvedQubits = [...op.targets, ...op.controls];
      for (const q of involvedQubits) {
        if (measuredQubits.has(q)) {
          warnings.push({
            rule: 'QI-1',
            severity: 'WARNING',
            qubit: q,
            column: op.column,
            opId: op.opId,
            message: `Post-collapse unitary detected: ${gate} gate applied to q[${q}] after MEASURE. Qubit q[${q}] collapsed into classical bit c[${q}]; subsequent unitary operations are physically invalid. Remove the ${gate} or move it before the MEASURE.`,
          });
        }
      }
    }

    // Track measured qubits
    if (gate === 'MEASURE') {
      for (const t of op.targets) {
        measuredQubits.add(t);
      }
    }
  }

  return warnings;
}

/**
 * Maps lint warnings to 1-indexed line numbers in Qiskit python code.
 */
export function mapWarningsToCodeLines(
  code: string,
  warnings: LintWarning[]
): Map<number, LintWarning[]> {
  const lineMap = new Map<number, LintWarning[]>();
  if (!code || warnings.length === 0) return lineMap;

  const lines = code.split('\n');

  const addWarning = (lineNum: number, w: LintWarning) => {
    const existing = lineMap.get(lineNum) || [];
    if (!existing.some((e) => e.opId === w.opId && e.rule === w.rule)) {
      existing.push(w);
      lineMap.set(lineNum, existing);
    }
  };

  const measuredQubits = new Set<number>();

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed.length === 0) return;

    // Check for measure calls
    const measureMatch = trimmed.match(/qc\.measure\s*\(\s*(\d+|\[.*?\])/);
    if (measureMatch) {
      const matchContent = measureMatch[1];
      if (matchContent.startsWith('[')) {
        const nums = matchContent
          .slice(1, -1)
          .split(',')
          .map((s) => parseInt(s.trim(), 10));
        nums.forEach((n) => !isNaN(n) && measuredQubits.add(n));
      } else {
        const n = parseInt(matchContent, 10);
        if (!isNaN(n)) measuredQubits.add(n);
      }
      return;
    }

    // Check QI-3: Wire collision in line, e.g. qc.cx(0, 0)
    for (const w of warnings) {
      if (w.rule === 'QI-3' && w.qubit !== null) {
        const cxRegex = new RegExp(`qc\\.cx\\s*\\(\\s*${w.qubit}\\s*,\\s*${w.qubit}\\s*\\)`);
        if (cxRegex.test(trimmed)) {
          addWarning(lineNum, w);
        }
      }
    }

    // Check QI-1: Post-collapse unitary in line
    for (const w of warnings) {
      if (w.rule === 'QI-1' && w.qubit !== null) {
        if (measuredQubits.has(w.qubit)) {
          const gateRegex = new RegExp(`qc\\.(?:h|x|y|z|s|t|cx|cz|ccx)\\s*\\([^)]*\\b${w.qubit}\\b[^)]*\\)`);
          if (gateRegex.test(trimmed)) {
            addWarning(lineNum, w);
          }
        }
      }
    }

    // Check QI-2: No-cloning in line
    for (const w of warnings) {
      if (w.rule === 'QI-2' && w.qubit !== null) {
        const cxTargetRegex = new RegExp(`qc\\.cx\\s*\\(\\s*\\d+\\s*,\\s*${w.qubit}\\s*\\)`);
        if (cxTargetRegex.test(trimmed)) {
          addWarning(lineNum, w);
        }
      }
    }
  });

  return lineMap;
}
