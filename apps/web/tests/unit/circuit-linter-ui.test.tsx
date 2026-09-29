import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, act, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import { InteractiveCircuitWorkspace } from '@/features/circuit/interactive-circuit-workspace';
import { QiskitCodeEditor } from '@/features/circuit/qiskit-code-editor';
import { QubitWiresGrid } from '@/features/circuit/qubit-wire';
import { useCircuitStore } from '@/lib/circuit-store';
import { apiClient } from '@/lib/api-client';
import {
  lintCircuitLocally,
  mapWarningsToCodeLines,
  LintWarning,
} from '@/features/circuit/circuit-linter';
import { CircuitModel } from '@/lib/contracts';

describe('Quantum Invariant Linter Frontend Integration (FEA-5)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useCircuitStore.getState().resetToBellSeed();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('1. Pure Invariant Rules Detection (QI-1, QI-2, QI-3)', () => {
    it('detects QI-1 post-collapse unitary when H is placed after MEASURE on q[0]', () => {
      const circuitWithViolation: CircuitModel = {
        id: 'cm_violation_qi1',
        name: 'Post-Collapse Violation',
        qubitCount: 2,
        classicalBitCount: 2,
        modelVersion: 1,
        source: 'BUILDER',
        operations: [
          {
            opId: 'op_m0',
            gate: 'MEASURE',
            targets: [0],
            controls: [],
            classicalTargets: [0],
            column: 0,
          },
          {
            opId: 'op_h0',
            gate: 'H',
            targets: [0],
            controls: [],
            classicalTargets: [],
            column: 1,
          },
        ],
      };

      const warnings = lintCircuitLocally(circuitWithViolation);
      expect(warnings.length).toBeGreaterThan(0);
      const qi1 = warnings.find((w) => w.rule === 'QI-1');
      expect(qi1).toBeDefined();
      expect(qi1?.severity).toBe('WARNING');
      expect(qi1?.qubit).toBe(0);
      expect(qi1?.column).toBe(1);
      expect(qi1?.message).toContain('Post-collapse unitary');
      expect(qi1?.message).toContain('H');
    });

    it('detects QI-2 cloning attempt when two CNOTs target the same superposition qubit', () => {
      const cloningCircuit: CircuitModel = {
        id: 'cm_violation_qi2',
        name: 'Cloning Attempt',
        qubitCount: 3,
        classicalBitCount: 3,
        modelVersion: 1,
        source: 'BUILDER',
        operations: [
          {
            opId: 'op_h0',
            gate: 'H',
            targets: [0],
            controls: [],
            classicalTargets: [],
            column: 0,
          },
          {
            opId: 'op_h1',
            gate: 'H',
            targets: [1],
            controls: [],
            classicalTargets: [],
            column: 0,
          },
          {
            opId: 'op_cx1',
            gate: 'CNOT',
            targets: [1],
            controls: [0],
            classicalTargets: [],
            column: 1,
          },
          {
            opId: 'op_cx2',
            gate: 'CNOT',
            targets: [1],
            controls: [2],
            classicalTargets: [],
            column: 2,
          },
        ],
      };

      const warnings = lintCircuitLocally(cloningCircuit);
      const qi2 = warnings.find((w) => w.rule === 'QI-2');
      expect(qi2).toBeDefined();
      expect(qi2?.severity).toBe('INFO');
      expect(qi2?.message).toContain('Cloning attempt detected');
      expect(qi2?.message).toContain('No-Cloning Theorem');
    });

    it('detects QI-3 controlled gate wire collision when control equals target', () => {
      const collisionCircuit: CircuitModel = {
        id: 'cm_violation_qi3',
        name: 'Wire Collision',
        qubitCount: 2,
        classicalBitCount: 2,
        modelVersion: 1,
        source: 'BUILDER',
        operations: [
          {
            opId: 'op_cx_collision',
            gate: 'CNOT',
            targets: [0],
            controls: [0],
            classicalTargets: [],
            column: 0,
          },
        ],
      };

      const warnings = lintCircuitLocally(collisionCircuit);
      const qi3 = warnings.find((w) => w.rule === 'QI-3');
      expect(qi3).toBeDefined();
      expect(qi3?.severity).toBe('ERROR');
      expect(qi3?.qubit).toBe(0);
      expect(qi3?.message).toContain('Wire collision');
    });

    it('produces zero warnings on valid canonical Bell circuit', () => {
      const bellCircuit: CircuitModel = {
        id: 'cm_bell_clean',
        name: 'Bell Clean',
        qubitCount: 2,
        classicalBitCount: 2,
        modelVersion: 1,
        source: 'BUILDER',
        operations: [
          {
            opId: 'op_1',
            gate: 'H',
            targets: [0],
            controls: [],
            classicalTargets: [],
            column: 0,
          },
          {
            opId: 'op_2',
            gate: 'CNOT',
            targets: [1],
            controls: [0],
            classicalTargets: [],
            column: 1,
          },
          {
            opId: 'op_3',
            gate: 'MEASURE',
            targets: [0],
            controls: [],
            classicalTargets: [0],
            column: 2,
          },
          {
            opId: 'op_4',
            gate: 'MEASURE',
            targets: [1],
            controls: [],
            classicalTargets: [1],
            column: 2,
          },
        ],
      };

      const warnings = lintCircuitLocally(bellCircuit);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('2. Code Editor Invariant Highlighting & Gutter Warning Glyph', () => {
    it('maps QI-1 violation to Qiskit code lines, renders gutter icon ⚠ and wavy underline', () => {
      const qiskitCode = [
        'from qiskit import QuantumCircuit',
        'qc = QuantumCircuit(2, 2)',
        'qc.measure(0, 0)',
        'qc.h(0)',
      ].join('\n');

      const mockWarnings: LintWarning[] = [
        {
          rule: 'QI-1',
          severity: 'WARNING',
          qubit: 0,
          column: 1,
          opId: 'op_h0',
          message:
            'Post-collapse unitary detected: H gate applied to q[0] after MEASURE.',
        },
      ];

      const lineMap = mapWarningsToCodeLines(qiskitCode, mockWarnings);
      // Line 4 has qc.h(0) after qc.measure(0, 0)
      expect(lineMap.has(4)).toBe(true);
      expect(lineMap.get(4)?.[0].rule).toBe('QI-1');

      // Render QiskitCodeEditor with mock warnings and code
      render(
        <QiskitCodeEditor
          isReadOnly={false}
          lintWarnings={mockWarnings}
          code={qiskitCode}
        />
      );

      // Verify gutter warning icon is displayed at line 4
      const warningIcons = screen.getAllByTestId('gutter-warning-icon');
      expect(warningIcons.length).toBeGreaterThan(0);
      expect(warningIcons[0].textContent).toBe('⚠');

      // Verify offending line has wavy amber underline styling
      const offendingLine = screen.getByTestId('offending-code-line');
      expect(offendingLine).toBeDefined();
      expect(offendingLine.getAttribute('data-line-number')).toBe('4');
      expect(offendingLine.style.textDecoration).toContain('underline wavy #F59E0B');

      // Verify warning banner is displayed
      const banner = screen.getByTestId('code-lint-warning-banner');
      expect(banner).toBeDefined();
      expect(banner.textContent).toContain('QI-1');
      expect(banner.textContent).toContain('Post-collapse unitary detected');
    });

    it('renders cleanly without gutter warning icons or wavy underlines on valid code', () => {
      render(<QiskitCodeEditor isReadOnly={false} lintWarnings={[]} />);

      expect(screen.queryByTestId('gutter-warning-icon')).toBeNull();
      expect(screen.queryByTestId('offending-code-line')).toBeNull();
      expect(screen.queryByTestId('code-lint-warning-banner')).toBeNull();
    });
  });

  describe('3. Circuit Canvas Column Amber Warning Pills', () => {
    it('renders amber warning badge pills at affected column header with tooltip', () => {
      const mockWarnings: LintWarning[] = [
        {
          rule: 'QI-1',
          severity: 'WARNING',
          qubit: 0,
          column: 2,
          opId: 'op_h0',
          message:
            'Post-collapse unitary detected: H gate applied to q[0] after MEASURE.',
        },
      ];

      render(<QubitWiresGrid readOnly={false} lintWarnings={mockWarnings} />);

      // Verify amber warning pill appears in column header
      const pills = screen.getAllByTestId('lint-warning-pill');
      expect(pills.length).toBeGreaterThan(0);
      const pill = pills[0];
      expect(pill.getAttribute('data-rule')).toBe('QI-1');
      expect(pill.getAttribute('data-column')).toBe('2');
      expect(pill.textContent).toContain('QI-1');
      expect(pill.textContent).toContain('q[0]');

      // Verify tooltip expansion text exists in the DOM
      const tooltip = pill.querySelector('[role="tooltip"]');
      expect(tooltip).toBeDefined();
      expect(tooltip?.textContent).toContain('Post-collapse unitary detected');
    });
  });

  describe('4. InteractiveCircuitWorkspace Real-time 300ms Debounce Integration', () => {
    it('surfaces amber pill within 300ms when circuit contains a post-collapse unitary', async () => {
      const violationCircuit: CircuitModel = {
        id: 'cm_test_post_collapse',
        name: 'Debounce Test Circuit',
        qubitCount: 2,
        classicalBitCount: 2,
        modelVersion: 1,
        source: 'BUILDER',
        operations: [
          {
            opId: 'op_m0',
            gate: 'MEASURE',
            targets: [0],
            controls: [],
            classicalTargets: [0],
            column: 0,
          },
          {
            opId: 'op_h0',
            gate: 'H',
            targets: [0],
            controls: [],
            classicalTargets: [],
            column: 1,
          },
        ],
      };

      // Mock apiClient.lintCircuit to return the detected warning
      const lintSpy = vi.spyOn(apiClient, 'lintCircuit').mockResolvedValue({
        data: {
          lintWarnings: [
            {
              rule: 'QI-1',
              severity: 'WARNING',
              qubit: 0,
              column: 1,
              opId: 'op_h0',
              message:
                'Post-collapse unitary detected: H gate applied to q[0] after MEASURE.',
            },
          ],
        },
        meta: { requestId: 'req_test_123', isFallback: false },
      });

      render(
        <InteractiveCircuitWorkspace initialCircuit={violationCircuit} />
      );

      // Before 300ms debounce timer expires
      expect(screen.queryByTestId('circuit-lint-warnings-banner')).toBeNull();

      // Fast-forward timers by 350ms
      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      // Verify apiClient was called with the circuit
      expect(lintSpy).toHaveBeenCalledWith(violationCircuit);

      // Verify amber warning pill appeared
      await waitFor(() => {
        const pills = screen.getAllByTestId('lint-warning-pill');
        expect(pills.length).toBeGreaterThan(0);
        expect(pills[0].textContent).toContain('QI-1');
      });

      expect(screen.getByTestId('circuit-lint-warnings-banner')).toBeDefined();
    });

    it('falls back seamlessly to local deterministic linter when backend endpoint fails', async () => {
      const violationCircuit: CircuitModel = {
        id: 'cm_test_fallback',
        name: 'Fallback Test Circuit',
        qubitCount: 2,
        classicalBitCount: 2,
        modelVersion: 1,
        source: 'BUILDER',
        operations: [
          {
            opId: 'op_cx_err',
            gate: 'CNOT',
            targets: [0],
            controls: [0],
            classicalTargets: [],
            column: 0,
          },
        ],
      };

      // Mock apiClient.lintCircuit throwing an error (e.g. backend 503 or offline)
      vi.spyOn(apiClient, 'lintCircuit').mockRejectedValue(
        new Error('Network error: backend endpoint offline')
      );

      render(
        <InteractiveCircuitWorkspace initialCircuit={violationCircuit} />
      );

      // Advance timers past 300ms debounce
      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      // Verify the fallback linter caught the QI-3 wire collision
      await waitFor(() => {
        const pills = screen.getAllByTestId('lint-warning-pill');
        expect(pills.length).toBeGreaterThan(0);
        expect(pills[0].getAttribute('data-rule')).toBe('QI-3');
      });

      const banner = screen.getByTestId('circuit-lint-warnings-banner');
      expect(banner.textContent).toContain('QI-3');
      expect(banner.textContent).toContain('Wire collision');
    });
  });
});
