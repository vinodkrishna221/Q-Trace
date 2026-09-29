import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, act, within } from '@testing-library/react';
import { render } from '../test-utils';
import { InteractiveCircuitWorkspace } from '@/features/circuit/interactive-circuit-workspace';
import { GatePalette } from '@/features/circuit/gate-palette';
import { useCircuitStore } from '@/lib/circuit-store';
import {
  generateQiskitCode,
  parseQiskitCode,
} from '@/features/circuit/circuit-parser';
import { exportCircuitModelJson, importCircuitModelJson } from '@/features/circuit/circuit-serializer';
import { CircuitModel, Operation } from '@/lib/contracts';
import {
  CcxMultiTerminalIcon,
  CzMultiTerminalIcon,
  PhaseSIcon,
  PhaseTIcon,
  GateTile,
} from '@/features/circuit/gate-glyph';
import { GATE_FAMILIES, SUPPORTED_GATES_LIST } from '@/features/circuit/circuit-types';

describe('FEA-12: Gate Palette & Multi-Terminal Glyph Expansion', () => {
  beforeEach(() => {
    useCircuitStore.getState().resetToBellSeed();
  });

  describe('1. Gate Palette Rendering & Family Groupings', () => {
    it('renders all 4 gate family groups in the palette', () => {
      render(<GatePalette />);

      expect(screen.getByTestId('gate-palette-card')).toBeDefined();
      expect(screen.getByTestId('gate-family-single')).toBeDefined();
      expect(screen.getByTestId('gate-family-phase')).toBeDefined();
      expect(screen.getByTestId('gate-family-controlled')).toBeDefined();
      expect(screen.getByTestId('gate-family-measure')).toBeDefined();
    });

    it('renders all gate tiles including new CCX, CZ, S, and T gates', () => {
      render(<GatePalette />);

      // Original gates
      expect(screen.getByTestId('palette-gate-h')).toBeDefined();
      expect(screen.getByTestId('palette-gate-x')).toBeDefined();
      expect(screen.getByTestId('palette-gate-y')).toBeDefined();
      expect(screen.getByTestId('palette-gate-z')).toBeDefined();
      expect(screen.getByTestId('palette-gate-cnot')).toBeDefined();
      expect(screen.getByTestId('palette-gate-measure')).toBeDefined();

      // Expanded gates (FEA-12)
      expect(screen.getByTestId('palette-gate-ccx')).toBeDefined();
      expect(screen.getByTestId('palette-gate-cz')).toBeDefined();
      expect(screen.getByTestId('palette-gate-s')).toBeDefined();
      expect(screen.getByTestId('palette-gate-t')).toBeDefined();
    });

    it('arms CCX, CZ, S, and T on click and displays informative banner', () => {
      render(<GatePalette />);

      // Arm CCX
      const ccxBtn = screen.getByTestId('palette-gate-ccx');
      fireEvent.click(ccxBtn);
      expect(screen.getByTestId('armed-badge')).toBeDefined();
      const banner = screen.getByTestId('click-to-place-banner');
      expect(within(banner).getByText('CCX')).toBeDefined();

      // Arm CZ
      const czBtn = screen.getByTestId('palette-gate-cz');
      fireEvent.click(czBtn);
      expect(within(screen.getByTestId('click-to-place-banner')).getByText('CZ')).toBeDefined();

      // Arm S
      const sBtn = screen.getByTestId('palette-gate-s');
      fireEvent.click(sBtn);
      expect(within(screen.getByTestId('click-to-place-banner')).getByText('S')).toBeDefined();

      // Arm T
      const tBtn = screen.getByTestId('palette-gate-t');
      fireEvent.click(tBtn);
      expect(within(screen.getByTestId('click-to-place-banner')).getByText('T')).toBeDefined();
    });
  });

  describe('2. Multi-Terminal SVG Glyphs', () => {
    it('renders standalone SVG glyphs for CCX, CZ, S, and T without throwing', () => {
      const { container } = render(
        <div>
          <CcxMultiTerminalIcon data-testid="ccx-icon" />
          <CzMultiTerminalIcon data-testid="cz-icon" />
          <PhaseSIcon data-testid="s-icon" />
          <PhaseTIcon data-testid="t-icon" />
        </div>
      );

      expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('S')).toBeDefined();
      expect(screen.getByText('T')).toBeDefined();
      expect(screen.getByText('π/2')).toBeDefined();
      expect(screen.getByText('π/4')).toBeDefined();
    });

    it('renders GateTile with proper styling for each new gate', () => {
      render(
        <div>
          <GateTile gate="CCX" size="md" />
          <GateTile gate="CZ" size="md" />
          <GateTile gate="S" size="md" />
          <GateTile gate="T" size="md" />
        </div>
      );

      expect(screen.getByText('S')).toBeDefined();
      expect(screen.getByText('T')).toBeDefined();
    });
  });

  describe('3. Multi-Wire Wire Placement & Spans (CCX & CZ)', () => {
    it('places 3-qubit CCX gate with vertical multi-wire connecting spine and control dots', () => {
      const store = useCircuitStore.getState();
      store.clearCircuit();
      store.setQubitCount(3);

      render(<InteractiveCircuitWorkspace />);

      // Place CCX targeting qubit 2, with controls 0 and 1 at column 1
      act(() => {
        store.addGate('CCX', 2, 1, [0, 1]);
      });

      const ops = useCircuitStore.getState().circuit.operations;
      expect(ops).toHaveLength(1);
      expect(ops[0].gate).toBe('CCX');
      expect(ops[0].targets).toEqual([2]);
      expect(ops[0].controls).toEqual([0, 1]);
      expect(ops[0].column).toBe(1);

      // Verify wire visual elements
      expect(screen.getByTestId(`ccx-vertical-link-${ops[0].opId}`)).toBeDefined();
      const controlDots = screen.getAllByTestId('gate-ccx-control');
      expect(controlDots).toHaveLength(2);
      expect(screen.getByTestId('gate-ccx-target')).toBeDefined();

      // Generated Qiskit code contains qc.ccx(0, 1, 2)
      const code = useCircuitStore.getState().code;
      expect(code).toContain('qc.ccx(0, 1, 2)');
    });

    it('places 2-qubit CZ gate with connecting vertical spine and control dots', () => {
      const store = useCircuitStore.getState();
      store.clearCircuit();

      render(<InteractiveCircuitWorkspace />);

      act(() => {
        store.addGate('CZ', 1, 1, 0);
      });

      const ops = useCircuitStore.getState().circuit.operations;
      expect(ops).toHaveLength(1);
      expect(ops[0].gate).toBe('CZ');
      expect(ops[0].targets).toEqual([1]);
      expect(ops[0].controls).toEqual([0]);

      // Verify visual elements for CZ
      expect(screen.getByTestId(`cz-vertical-link-${ops[0].opId}`)).toBeDefined();
      expect(screen.getByTestId('gate-cz-control')).toBeDefined();
      expect(screen.getByTestId('gate-cz-target')).toBeDefined();

      // Generated Qiskit code contains qc.cz(0, 1)
      const code = useCircuitStore.getState().code;
      expect(code).toContain('qc.cz(0, 1)');
    });

    it('places S and T phase rotation gates on wires and generates valid Qiskit code', () => {
      const store = useCircuitStore.getState();
      store.clearCircuit();

      render(<InteractiveCircuitWorkspace />);

      act(() => {
        store.addGate('S', 0, 0);
        store.addGate('T', 1, 0);
      });

      const ops = useCircuitStore.getState().circuit.operations;
      expect(ops).toHaveLength(2);
      expect(ops[0].gate).toBe('S');
      expect(ops[1].gate).toBe('T');

      const code = useCircuitStore.getState().code;
      expect(code).toContain('qc.s(0)');
      expect(code).toContain('qc.t(1)');
    });

    it('auto-expands circuit qubit count to 3 when CCX is added to a 2-qubit circuit', () => {
      const store = useCircuitStore.getState();
      store.clearCircuit();
      expect(useCircuitStore.getState().circuit.qubitCount).toBe(2);

      act(() => {
        store.addGate('CCX', 2, 0);
      });

      expect(useCircuitStore.getState().circuit.qubitCount).toBe(3);
      const ops = useCircuitStore.getState().circuit.operations;
      expect(ops).toHaveLength(1);
      expect(ops[0].gate).toBe('CCX');
      expect(ops[0].controls).toEqual([0, 1]);
      expect(ops[0].targets).toEqual([2]);
    });
  });

  describe('4. Qiskit Code Parser & Serializer Round-Trip for Expanded Gates', () => {
    it('parses Qiskit code containing CCX, CZ, S, and T into a valid CircuitModel', () => {
      const code = `from qiskit import QuantumCircuit
qc = QuantumCircuit(3, 3)
qc.h(0)
qc.s(0)
qc.t(1)
qc.cz(0, 1)
qc.ccx(0, 1, 2)
qc.measure([0, 1, 2], [0, 1, 2])
`;
      const result = parseQiskitCode(code);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.circuit.qubitCount).toBe(3);
        const gates = result.circuit.operations.map((op) => op.gate);
        expect(gates).toContain('H');
        expect(gates).toContain('S');
        expect(gates).toContain('T');
        expect(gates).toContain('CZ');
        expect(gates).toContain('CCX');
        expect(gates).toContain('MEASURE');
      }
    });

    it('still rejects unsupported gates (e.g. RX, SWAP) with UNSUPPORTED_GATE error', () => {
      const rxCode = `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.rx(1.57, 0)
`;
      const result = parseQiskitCode(rxCode);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe('UNSUPPORTED_GATE');
        expect(result.error).toContain('RX');
      }
    });

    it('serializes and imports circuit models with up to 30 operations', () => {
      const operations: Operation[] = Array.from({ length: 25 }, (_, i) => ({
        opId: `op_${i}`,
        gate: (i % 2 === 0 ? 'H' : 'X') as 'H' | 'X',
        targets: [0],
        controls: [],
        classicalTargets: [],
        column: i,
      }));

      const model: CircuitModel = {
        id: 'cm_large_test',
        name: 'Large Grover Circuit',
        qubitCount: 3,
        classicalBitCount: 3,
        operations,
        source: 'BUILDER',
        modelVersion: 1,
      };

      const jsonStr = exportCircuitModelJson(model);
      const importResult = importCircuitModelJson(jsonStr);

      expect(importResult.success).toBe(true);
      if (importResult.success) {
        expect(importResult.circuit.operations).toHaveLength(25);
      }
    });
  });

  describe('5. Interactive Workspace Qubit Count Controls', () => {
    it('allows increasing and decreasing qubit count within prototype bounds (1 to 5)', () => {
      render(<InteractiveCircuitWorkspace />);

      const increaseBtn = screen.getByTestId('increase-qubits-btn');
      const decreaseBtn = screen.getByTestId('decrease-qubits-btn');

      // Default is 2 qubits
      expect(screen.getByTestId('qubit-count-display').textContent).toContain('2 Qubits');

      // Click + to make it 3 qubits
      fireEvent.click(increaseBtn);
      expect(useCircuitStore.getState().circuit.qubitCount).toBe(3);
      expect(screen.getByTestId('qubit-count-display').textContent).toContain('3 Qubits');

      // Click - to go back to 2 qubits
      fireEvent.click(decreaseBtn);
      expect(useCircuitStore.getState().circuit.qubitCount).toBe(2);
      expect(screen.getByTestId('qubit-count-display').textContent).toContain('2 Qubits');
    });
  });
});
