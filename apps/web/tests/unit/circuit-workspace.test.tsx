import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { render } from '../test-utils';
import { InteractiveCircuitWorkspace } from '@/features/circuit/interactive-circuit-workspace';
import { useCircuitStore } from '@/lib/circuit-store';
import {
  generateQiskitCode,
  parseQiskitCode,
  serializeCircuitColumns,
  sortOperations,
} from '@/features/circuit/circuit-parser';
import { CircuitModel, Operation } from '@/lib/contracts';
import { DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';

describe('Interactive Circuit Workspace (UX-5)', () => {
  beforeEach(() => {
    useCircuitStore.getState().resetToBellSeed();
  });

  describe('1. Visual placement of H + CNOT & Wire Operations', () => {
    it('places H and CNOT on qubit wires and serializes stable columns', () => {
      const store = useCircuitStore.getState();
      store.clearCircuit();

      expect(useCircuitStore.getState().circuit.operations).toHaveLength(0);

      // Place H on qubit 0 (assigned to column 0)
      act(() => {
        store.addGate('H', 0, 0);
      });

      let ops = useCircuitStore.getState().circuit.operations;
      expect(ops).toHaveLength(1);
      expect(ops[0].gate).toBe('H');
      expect(ops[0].targets).toEqual([0]);
      expect(ops[0].column).toBe(0);

      // Place CNOT with control 0, target 1 (assigned to column 1)
      act(() => {
        store.addGate('CNOT', 1, 1, 0);
      });

      ops = useCircuitStore.getState().circuit.operations;
      expect(ops).toHaveLength(2);
      expect(ops[1].gate).toBe('CNOT');
      expect(ops[1].targets).toEqual([1]);
      expect(ops[1].controls).toEqual([0]);
      expect(ops[1].column).toBe(1);

      // Place Measure on q0 and q1 (assigned to column 2)
      act(() => {
        store.addGate('MEASURE', 0, 2, undefined, 0);
        store.addGate('MEASURE', 1, 2, undefined, 1);
      });

      ops = useCircuitStore.getState().circuit.operations;
      expect(ops).toHaveLength(4);
      expect(ops[2].gate).toBe('MEASURE');
      expect(ops[2].targets).toEqual([0]);
      expect(ops[2].classicalTargets).toEqual([0]);
      expect(ops[2].column).toBe(2);
      expect(ops[3].gate).toBe('MEASURE');
      expect(ops[3].targets).toEqual([1]);
      expect(ops[3].classicalTargets).toEqual([1]);
      expect(ops[3].column).toBe(2);

      // Generated Qiskit code should match the serialized H + CNOT + Measure
      const code = useCircuitStore.getState().code;
      expect(code).toContain('qc.h(0)');
      expect(code).toContain('qc.cx(0, 1)');
      expect(code).toContain('qc.measure([0, 1], [0, 1])');
    });

    it('handles removal of gates via store action and updates model and code', () => {
      const store = useCircuitStore.getState();
      store.resetToBellSeed();

      const initialOps = store.circuit.operations;
      expect(initialOps.length).toBe(4);

      // Remove H gate (op_1)
      act(() => {
        store.removeGate('op_1');
      });

      const updatedOps = useCircuitStore.getState().circuit.operations;
      expect(updatedOps.find((op) => op.opId === 'op_1')).toBeUndefined();
      expect(updatedOps.length).toBe(3);

      const code = useCircuitStore.getState().code;
      expect(code).not.toContain('qc.h(0)');
      expect(code).toContain('qc.cx(0, 1)');
    });
  });

  describe('2. Stable Column Serialization', () => {
    it('serializes operations stably by column ASC, target ASC, and prevents wire collisions', () => {
      const unorganizedOps: Operation[] = [
        { opId: 'op_m1', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 2 },
        { opId: 'op_cnot', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 1 },
        { opId: 'op_h', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
        { opId: 'op_m0', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 2 },
      ];

      const serialized = serializeCircuitColumns(unorganizedOps);

      expect(serialized).toHaveLength(4);
      expect(serialized[0].gate).toBe('H');
      expect(serialized[0].column).toBe(0);
      expect(serialized[1].gate).toBe('CNOT');
      expect(serialized[1].column).toBe(1);
      expect(serialized[2].gate).toBe('MEASURE');
      expect(serialized[2].targets).toEqual([0]);
      expect(serialized[2].column).toBe(2);
      expect(serialized[3].gate).toBe('MEASURE');
      expect(serialized[3].targets).toEqual([1]);
      expect(serialized[3].column).toBe(2);
    });

    it('automatically offsets overlapping operations on the same qubit wire', () => {
      // Two gates on qubit 0 with conflicting column 0
      const conflictingOps: Operation[] = [
        { opId: 'op_h1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
        { opId: 'op_x1', gate: 'X', targets: [0], controls: [], classicalTargets: [], column: 0 },
      ];

      const serialized = serializeCircuitColumns(conflictingOps);
      expect(serialized[0].column).toBe(0);
      expect(serialized[1].column).toBe(1);
    });
  });

  describe('3. Round-trip Supported Qiskit Code Editing', () => {
    it('round-trips the supported code edit and updates the Circuit Model', () => {
      const store = useCircuitStore.getState();
      store.resetToBellSeed();

      const newQiskitCode = `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.x(1)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])
`;

      let result: any;
      act(() => {
        result = store.applyCodeEdit(newQiskitCode);
      });

      expect(result.success).toBe(true);
      expect(useCircuitStore.getState().parseError).toBeNull();
      expect(useCircuitStore.getState().parseSuccess).toBe(true);

      const updatedModel = useCircuitStore.getState().circuit;
      expect(updatedModel.operations).toHaveLength(5);

      const gates = updatedModel.operations.map((op) => op.gate);
      expect(gates).toContain('H');
      expect(gates).toContain('X');
      expect(gates).toContain('CNOT');
      expect(gates.filter((g) => g === 'MEASURE')).toHaveLength(2);

      // Verify columns are stably serialized
      const hOp = updatedModel.operations.find((op) => op.gate === 'H');
      const xOp = updatedModel.operations.find((op) => op.gate === 'X');
      const cxOp = updatedModel.operations.find((op) => op.gate === 'CNOT');
      expect(hOp?.column).toBe(0);
      expect(xOp?.column).toBe(0);
      expect(cxOp?.column).toBe(1);
    });

    it('parses individual gates (H, X, Y, Z, CNOT, MEASURE) into canonical CircuitModel', () => {
      const fullCode = `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.x(0)
qc.y(1)
qc.z(1)
qc.cx(0, 1)
qc.measure(0, 0)
qc.measure(1, 1)
`;

      const result = parseQiskitCode(fullCode);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.circuit.qubitCount).toBe(2);
        expect(result.circuit.classicalBitCount).toBe(2);
        expect(result.circuit.operations).toHaveLength(7);
        const gates = result.circuit.operations.map((o) => o.gate);
        expect(gates).toEqual(['H', 'Y', 'X', 'Z', 'CNOT', 'MEASURE', 'MEASURE']);
      }
    });
  });

  describe('4. Rejection of Unsupported Gates (e.g. RX) & Security Rules', () => {
    it('rejects an unsupported RX without mutating the Circuit Model', () => {
      const store = useCircuitStore.getState();
      store.resetToBellSeed();

      const originalModel = { ...store.circuit };
      const originalOps = [...store.circuit.operations];

      const unsupportedCode = `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.rx(0.5, 0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])
`;

      let result: any;
      act(() => {
        result = store.applyCodeEdit(unsupportedCode);
      });

      // 1. Must fail parsing with UNSUPPORTED_GATE
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('UNSUPPORTED_GATE');
      expect(result.error).toContain('Gate RX is outside the prototype subset');
      expect(result.error).toContain('Allowed gates: H, X, Y, Z, CNOT, MEASURE');

      // 2. Store records the parse error
      expect(useCircuitStore.getState().parseError).toContain('Gate RX is outside the prototype subset');
      expect(useCircuitStore.getState().parseSuccess).toBe(false);

      // 3. CRITICAL: Model MUST NOT be mutated!
      const currentModel = useCircuitStore.getState().circuit;
      expect(currentModel.operations).toEqual(originalOps);
      expect(currentModel.id).toBe(originalModel.id);
      expect(currentModel.operations.map((o) => o.gate)).not.toContain('RX');
    });

    it('rejects unsafe constructs (loops, functions, eval, imports) without mutating the model', () => {
      const store = useCircuitStore.getState();
      store.resetToBellSeed();
      const originalOpsCount = store.circuit.operations.length;

      const unsafeCode = `from qiskit import QuantumCircuit
import os
qc = QuantumCircuit(2, 2)
os.system('echo hacked')
qc.h(0)
`;

      let result: any;
      act(() => {
        result = store.applyCodeEdit(unsafeCode);
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('UNSAFE_CODE');
      expect(result.error).toContain('UNSAFE_CODE');

      // Model preserved
      expect(useCircuitStore.getState().circuit.operations).toHaveLength(originalOpsCount);
    });
  });

  describe('5. Interactive UI Rendering & Integration', () => {
    it('renders the interactive circuit workspace with palette, grid, and code editor', () => {
      render(<InteractiveCircuitWorkspace initialCircuit={DEMO_STARTER_CIRCUIT} />);

      // Palette
      expect(screen.getByTestId('gate-palette-card')).toBeDefined();
      expect(screen.getByTestId('palette-gate-h')).toBeDefined();
      expect(screen.getByTestId('palette-gate-x')).toBeDefined();
      expect(screen.getByTestId('palette-gate-y')).toBeDefined();
      expect(screen.getByTestId('palette-gate-z')).toBeDefined();
      expect(screen.getByTestId('palette-gate-cnot')).toBeDefined();
      expect(screen.getByTestId('palette-gate-measure')).toBeDefined();

      // Grid
      expect(screen.getByTestId('qubit-wires-grid')).toBeDefined();
      expect(screen.getByTestId('qubit-wire-0')).toBeDefined();
      expect(screen.getByTestId('qubit-wire-1')).toBeDefined();
      expect(screen.getByTestId('gate-op_1')).toBeDefined(); // H
      expect(screen.getByTestId('gate-op_2')).toBeDefined(); // CNOT
      expect(screen.getByTestId('gate-op_3')).toBeDefined(); // Measure 0
      expect(screen.getByTestId('gate-op_4')).toBeDefined(); // Measure 1

      // Code Editor
      expect(screen.getByTestId('qiskit-code-panel')).toBeDefined();
      expect(screen.getByTestId('qiskit-code-editor-input')).toBeDefined();
      expect(screen.getByTestId('apply-code-btn')).toBeDefined();

      // Simulation action
      expect(screen.getByTestId('run-simulation-btn')).toBeDefined();
    });

    it('arms palette gate on click and displays armed banner', () => {
      render(<InteractiveCircuitWorkspace initialCircuit={DEMO_STARTER_CIRCUIT} />);

      const hButton = screen.getByTestId('palette-gate-h');
      fireEvent.click(hButton);

      expect(screen.getByTestId('armed-badge')).toBeDefined();
      expect(screen.getByTestId('click-to-place-banner')).toBeDefined();
      expect(screen.getByText(/Armed: Click any cell on the grid to place/i)).toBeDefined();
    });

    it('displays error banner in UI when unsupported code is synced', () => {
      render(<InteractiveCircuitWorkspace initialCircuit={DEMO_STARTER_CIRCUIT} />);

      const textarea = screen.getByTestId('qiskit-code-editor-input');
      const applyBtn = screen.getByTestId('apply-code-btn');

      // Type unsupported RX code into the editor
      fireEvent.change(textarea, {
        target: {
          value: `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.rx(0.5, 0)
qc.cx(0, 1)
`,
        },
      });

      // Click "Sync to Circuit Model"
      fireEvent.click(applyBtn);

      // Error banner must be visible
      const errorBanner = screen.getByTestId('code-parse-error');
      expect(errorBanner).toBeDefined();
      expect(errorBanner.textContent).toContain('Gate RX is outside the prototype subset');

      // The original H gate from Bell seed should still exist because model was NOT mutated
      expect(useCircuitStore.getState().circuit.operations.some((o) => o.gate === 'H')).toBe(true);
    });

    it('supports keyboard shortcuts on wire cells to place gates', () => {
      render(<InteractiveCircuitWorkspace initialCircuit={DEMO_STARTER_CIRCUIT} />);

      // Find an empty cell or cell on wire 0 col 3
      const cell = screen.getByTestId('wire-cell-0-3');
      expect(cell).toBeDefined();

      // Press 'x' on the cell
      fireEvent.keyDown(cell, { key: 'x' });

      // Pauli-X should now exist in operations
      const ops = useCircuitStore.getState().circuit.operations;
      expect(ops.some((op) => op.gate === 'X' && op.targets.includes(0))).toBe(true);
    });
  });
});
