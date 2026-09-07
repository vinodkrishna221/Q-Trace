import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { render } from '../test-utils';
import {
  generateOpenQasm3,
  exportOpenQasm3,
  normalizeCircuitModel,
  exportCircuitModelJson,
  importCircuitModelJson,
  CircuitSharePanel,
  InteractiveCircuitWorkspace,
} from '@/features/circuit';
import { DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';
import { CircuitModel, Operation } from '@/lib/contracts';
import { useCircuitStore } from '@/lib/circuit-store';

describe('Circuit Sharing & Export (UX-8)', () => {
  beforeEach(() => {
    useCircuitStore.getState().resetToBellSeed();
    vi.restoreAllMocks();
  });

  describe('OpenQASM 3.0 Generation', () => {
    it('generates standard-compliant OpenQASM 3.0 code for Bell State seed', () => {
      const qasm = generateOpenQasm3(DEMO_STARTER_CIRCUIT);

      expect(qasm).toContain('OPENQASM 3.0;');
      expect(qasm).toContain('include "stdgates.inc";');
      expect(qasm).toContain('qubit[2] q;');
      expect(qasm).toContain('bit[2] c;');
      expect(qasm).toContain('h q[0];');
      expect(qasm).toContain('cx q[0], q[1];');
      expect(qasm).toContain('c[0] = measure q[0];');
      expect(qasm).toContain('c[1] = measure q[1];');
    });

    it('generates OpenQASM for all supported gates (H, X, Y, Z, CNOT, MEASURE)', () => {
      const allGatesCircuit: CircuitModel = {
        id: 'cm_all_gates',
        name: 'All Supported Gates',
        qubitCount: 3,
        classicalBitCount: 3,
        operations: [
          { opId: 'op_1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
          { opId: 'op_2', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 0 },
          { opId: 'op_3', gate: 'Y', targets: [2], controls: [], classicalTargets: [], column: 0 },
          { opId: 'op_4', gate: 'Z', targets: [0], controls: [], classicalTargets: [], column: 1 },
          { opId: 'op_5', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 2 },
          { opId: 'op_6', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 3 },
          { opId: 'op_7', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 3 },
        ],
        source: 'BUILDER',
        modelVersion: 1,
      };

      const qasm = generateOpenQasm3(allGatesCircuit);
      expect(qasm).toContain('qubit[3] q;');
      expect(qasm).toContain('bit[3] c;');
      expect(qasm).toContain('h q[0];');
      expect(qasm).toContain('x q[1];');
      expect(qasm).toContain('y q[2];');
      expect(qasm).toContain('z q[0];');
      expect(qasm).toContain('cx q[0], q[1];');
      expect(qasm).toContain('c[0] = measure q[0];');
      expect(qasm).toContain('c[1] = measure q[1];');

      const exportResponse = exportOpenQasm3(allGatesCircuit);
      expect(exportResponse.openQasmVersion).toBe('3.0');
      expect(exportResponse.lossy).toBe(false);
      expect(exportResponse.warnings).toEqual([]);
      expect(exportResponse.openQasm3).toBe(qasm);
    });
  });

  describe('Circuit Model JSON Export & Reimport Round-trip', () => {
    it('exports the Bell model, reimports it and obtains a byte-for-byte equivalent normalized Circuit Model', () => {
      // 1. Obtain baseline normalized Bell state model
      const normalizedBellBaseline = normalizeCircuitModel(DEMO_STARTER_CIRCUIT);

      // 2. Export to canonical JSON string
      const exportedJson = exportCircuitModelJson(normalizedBellBaseline, false);
      expect(typeof exportedJson).toBe('string');
      expect(exportedJson.length).toBeGreaterThan(0);

      // 3. Reimport from the exported JSON
      const importResult = importCircuitModelJson(exportedJson);
      expect(importResult.success).toBe(true);
      if (!importResult.success) return;

      // 4. Normalize the reimported circuit
      const normalizedReimported = normalizeCircuitModel(importResult.circuit);

      // 5. Verify byte-for-byte stringified and object equality
      const baselineJsonString = JSON.stringify(normalizedBellBaseline);
      const reimportedJsonString = JSON.stringify(normalizedReimported);

      expect(reimportedJsonString).toBe(baselineJsonString);
      expect(normalizedReimported).toEqual(normalizedBellBaseline);
    });

    it('handles pretty-printed JSON export and round-trip reimport correctly', () => {
      const prettyJson = exportCircuitModelJson(DEMO_STARTER_CIRCUIT, true);
      expect(prettyJson).toContain('\n');

      const importResult = importCircuitModelJson(prettyJson);
      expect(importResult.success).toBe(true);
      if (!importResult.success) return;

      expect(normalizeCircuitModel(importResult.circuit)).toEqual(
        normalizeCircuitModel(DEMO_STARTER_CIRCUIT)
      );
    });
  });

  describe('Validation, Safety & Error Handling', () => {
    it('rejects empty or invalid JSON string', () => {
      const emptyResult = importCircuitModelJson('');
      expect(emptyResult.success).toBe(false);
      if (!emptyResult.success) {
        expect(emptyResult.errorCode).toBe('PARSE_ERROR');
      }

      const invalidJsonResult = importCircuitModelJson('{ invalid_json: ');
      expect(invalidJsonResult.success).toBe(false);
      if (!invalidJsonResult.success) {
        expect(invalidJsonResult.errorCode).toBe('PARSE_ERROR');
      }
    });

    it('rejects unsupported gate (RX) without mutating the circuit', () => {
      const unsupportedGateJson = JSON.stringify({
        id: 'cm_invalid',
        name: 'Invalid RX Circuit',
        qubitCount: 2,
        classicalBitCount: 2,
        operations: [
          { opId: 'op_1', gate: 'RX', targets: [0], controls: [], column: 0 },
        ],
        source: 'BUILDER',
        modelVersion: 1,
      });

      const initialCircuit = useCircuitStore.getState().circuit;
      const result = importCircuitModelJson(unsupportedGateJson);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe('UNSUPPORTED_GATE');
        expect(result.error).toContain('Gate RX is outside the prototype subset');
      }

      // Store remains intact
      expect(useCircuitStore.getState().circuit).toEqual(initialCircuit);
    });

    it('rejects qubit count exceeding prototype limits (>5 qubits or <1 qubit)', () => {
      const oversizedCircuitJson = JSON.stringify({
        id: 'cm_oversized',
        name: 'Too Many Qubits',
        qubitCount: 6,
        classicalBitCount: 6,
        operations: [],
        source: 'BUILDER',
        modelVersion: 1,
      });

      const result = importCircuitModelJson(oversizedCircuitJson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe('CIRCUIT_LIMIT_EXCEEDED');
        expect(result.error).toContain('qubitCount 6 exceeds prototype limits');
      }
    });

    it('rejects unsupported model version (modelVersion !== 1)', () => {
      const futureModelJson = JSON.stringify({
        id: 'cm_v2',
        name: 'Future Circuit',
        qubitCount: 2,
        classicalBitCount: 2,
        operations: [],
        source: 'BUILDER',
        modelVersion: 2,
      });

      const result = importCircuitModelJson(futureModelJson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe('UNSUPPORTED_VERSION');
        expect(result.error).toContain('modelVersion');
        expect(result.error).toContain('2');
      }
    });

    it('rejects CNOT with matching control and target qubit', () => {
      const invalidCnotJson = JSON.stringify({
        id: 'cm_bad_cnot',
        name: 'Self-control CNOT',
        qubitCount: 2,
        classicalBitCount: 2,
        operations: [
          { opId: 'op_1', gate: 'CNOT', targets: [0], controls: [0], column: 0 },
        ],
        source: 'BUILDER',
        modelVersion: 1,
      });

      const result = importCircuitModelJson(invalidCnotJson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe('INVALID_CIRCUIT_MODEL');
        expect(result.error).toContain('same control and target qubit');
      }
    });
  });

  describe('Interactive Share Panel Component UI', () => {
    it('renders the share panel with local artifact sharing disclosure and export previews', () => {
      render(<CircuitSharePanel />);

      expect(screen.getByTestId('circuit-share-panel')).toBeDefined();
      expect(screen.getByText('LOCAL ARTIFACT SHARING')).toBeDefined();
      expect(screen.getByText(/Zero cloud accounts or fake multiplayer claims/i)).toBeDefined();

      // Check previews
      expect(screen.getByTestId('qasm-preview')).toBeDefined();
      expect(screen.getByTestId('json-preview')).toBeDefined();
      expect(screen.getByTestId('copy-qasm-btn')).toBeDefined();
      expect(screen.getByTestId('download-qasm-btn')).toBeDefined();
      expect(screen.getByTestId('copy-json-btn')).toBeDefined();
      expect(screen.getByTestId('download-json-btn')).toBeDefined();
    });

    it('allows importing a circuit via the Import tab and updates workspace state', async () => {
      const onImportSuccess = vi.fn();
      render(<CircuitSharePanel onImportSuccess={onImportSuccess} />);

      // Switch to Import tab
      const importTab = screen.getByTestId('tab-import');
      fireEvent.click(importTab);

      // Load sample Bell State
      const loadSampleBtn = screen.getByTestId('load-sample-bell-btn');
      fireEvent.click(loadSampleBtn);

      const textarea = screen.getByTestId('import-json-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toContain('Bell State Seed');

      // Click Import button
      const importBtn = screen.getByTestId('import-circuit-btn');
      fireEvent.click(importBtn);

      expect(screen.getByTestId('import-success-banner')).toBeDefined();
      expect(onImportSuccess).toHaveBeenCalled();
    });

    it('shows validation error banner when invalid JSON or unsupported gate is imported', () => {
      render(<CircuitSharePanel />);

      // Switch to Import tab
      fireEvent.click(screen.getByTestId('tab-import'));

      const textarea = screen.getByTestId('import-json-textarea');
      fireEvent.change(textarea, {
        target: {
          value: JSON.stringify({
            qubitCount: 2,
            modelVersion: 1,
            operations: [{ gate: 'RX', targets: [0], controls: [] }],
          }),
        },
      });

      const importBtn = screen.getByTestId('import-circuit-btn');
      fireEvent.click(importBtn);

      expect(screen.getByTestId('import-error-banner')).toBeDefined();
      expect(screen.getByText(/Gate RX is outside the prototype subset/i)).toBeDefined();
    });
  });

  describe('Integration with InteractiveCircuitWorkspace', () => {
    it('toggles the Share & Export panel when the header action button is clicked', () => {
      render(<InteractiveCircuitWorkspace initialCircuit={DEMO_STARTER_CIRCUIT} />);

      const shareToggleBtn = screen.getByTestId('open-share-panel-btn');
      expect(shareToggleBtn).toBeDefined();

      // Initially closed
      expect(screen.queryByTestId('circuit-share-panel')).toBeNull();

      // Open panel
      fireEvent.click(shareToggleBtn);
      expect(screen.getByTestId('circuit-share-panel')).toBeDefined();

      // Close panel via close button
      const closeBtn = screen.getByTestId('close-share-panel-btn');
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId('circuit-share-panel')).toBeNull();
    });
  });
});
