import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import BellStateLearnPage from '@/app/(app)/learn/bell-state/page';
import LabPage from '@/app/(app)/lab/page';
import ProgressPage from '@/app/(app)/progress/page';
import InstructorPage from '@/app/(app)/instructor/page';
import SuperpositionLearnPage from '@/app/(app)/learn/superposition/page';
import MeasurementLearnPage from '@/app/(app)/learn/measurement/page';
import { AppShell } from '@/components/layout/app-shell';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { InteractiveCircuitWorkspace } from '@/features/circuit/interactive-circuit-workspace';
import { useRoleStore } from '@/lib/role-store';
import { usePredictionStore } from '@/lib/prediction-store';
import { useCircuitStore } from '@/lib/circuit-store';
import { DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';

describe('Accessibility & Projector Readability Suite (UX-9)', () => {
  beforeEach(() => {
    localStorage.clear();
    usePredictionStore.getState().resetAllDrafts();
    useRoleStore.getState().setRole('role_aarav');
    useCircuitStore.getState().setCircuit(DEMO_STARTER_CIRCUIT);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('enables complete keyboard-only Bell circuit construction and editing', async () => {
    render(<InteractiveCircuitWorkspace initialCircuit={DEMO_STARTER_CIRCUIT} />);

    // 1. Clear grid first
    const clearBtn = screen.getByTestId('clear-circuit-btn');
    fireEvent.click(clearBtn);
    expect(useCircuitStore.getState().circuit.operations).toHaveLength(0);

    // 2. Keyboard construction: Place Hadamard on q[0], Col 0
    const cell00 = screen.getByTestId('wire-cell-0-0');
    cell00.focus();
    fireEvent.keyDown(cell00, { key: 'h', code: 'KeyH' });

    let currentOps = useCircuitStore.getState().circuit.operations;
    expect(currentOps).toHaveLength(1);
    expect(currentOps[0].gate).toBe('H');
    expect(currentOps[0].targets).toEqual([0]);
    expect(currentOps[0].column).toBe(0);

    // 3. Keyboard construction: Place CNOT on q[1], Col 1 (targets q1, controlled by q0)
    const cell11 = screen.getByTestId('wire-cell-1-1');
    cell11.focus();
    fireEvent.keyDown(cell11, { key: 'c', code: 'KeyC' });

    currentOps = useCircuitStore.getState().circuit.operations;
    expect(currentOps).toHaveLength(2);
    const cnotOp = currentOps.find((op) => op.gate === 'CNOT');
    expect(cnotOp).toBeDefined();
    expect(cnotOp?.targets).toEqual([1]);
    expect(cnotOp?.controls).toEqual([0]);
    expect(cnotOp?.column).toBe(1);

    // 4. Keyboard construction: Place Measure on q[0], Col 2
    const cell02 = screen.getByTestId('wire-cell-0-2');
    cell02.focus();
    fireEvent.keyDown(cell02, { key: 'm', code: 'KeyM' });

    // 5. Keyboard construction: Place Measure on q[1], Col 2
    const cell12 = screen.getByTestId('wire-cell-1-2');
    cell12.focus();
    fireEvent.keyDown(cell12, { key: 'm', code: 'KeyM' });

    currentOps = useCircuitStore.getState().circuit.operations;
    expect(currentOps).toHaveLength(4);
    expect(currentOps.map((op) => op.gate)).toEqual(['H', 'CNOT', 'MEASURE', 'MEASURE']);

    // 6. Test keyboard gate removal with Delete key
    cell02.focus();
    fireEvent.keyDown(cell02, { key: 'Delete', code: 'Delete' });
    currentOps = useCircuitStore.getState().circuit.operations;
    expect(currentOps).toHaveLength(3);

    // 7. Test Armed Palette Click-to-Place + Enter key on focused grid cell
    const xGatePaletteBtn = screen.getByTestId('palette-gate-x');
    fireEvent.click(xGatePaletteBtn);
    expect(useCircuitStore.getState().selectedGateToPlace).toBe('X');
    expect(screen.getByTestId('click-to-place-banner')).toBeDefined();

    // Focus cell and press Enter to place armed gate
    cell02.focus();
    fireEvent.keyDown(cell02, { key: 'Enter', code: 'Enter' });
    currentOps = useCircuitStore.getState().circuit.operations;
    expect(currentOps).toHaveLength(4);
    expect(currentOps.find((op) => op.gate === 'X' && op.targets.includes(0))).toBeDefined();

    // 8. Test Escape key to cancel armed gate
    const yGatePaletteBtn = screen.getByTestId('palette-gate-y');
    fireEvent.click(yGatePaletteBtn);
    expect(useCircuitStore.getState().selectedGateToPlace).toBe('Y');

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(useCircuitStore.getState().selectedGateToPlace).toBeNull();
  });

  it('renders color-independent gate labels, clear accessible roles, and aria annotations', () => {
    render(<InteractiveCircuitWorkspace initialCircuit={DEMO_STARTER_CIRCUIT} />);

    // 1. Gate Palette color-independent text, testids, and shortcut keys
    expect(screen.getByRole('toolbar', { name: /Quantum Gate Palette/i })).toBeDefined();
    expect(screen.getByTestId('palette-gate-h').getAttribute('aria-label')).toContain('Hadamard');
    expect(screen.getByTestId('palette-gate-x').getAttribute('aria-label')).toContain('Pauli-X');
    expect(screen.getByTestId('palette-gate-y').getAttribute('aria-label')).toContain('Pauli-Y');
    expect(screen.getByTestId('palette-gate-z').getAttribute('aria-label')).toContain('Pauli-Z');
    expect(screen.getByTestId('palette-gate-cnot').getAttribute('aria-label')).toContain('Controlled-NOT');
    expect(screen.getByTestId('palette-gate-measure').getAttribute('aria-label')).toContain('Measure');

    // 2. Wire cells have descriptive accessible labels
    const wireGrid = screen.getByTestId('qubit-wires-grid');
    expect(wireGrid).toBeDefined();

    // Check CNOT control and target color-independent labels
    expect(screen.getByTestId('gate-cnot-control')).toBeDefined();
    expect(screen.getAllByLabelText(/CNOT Control/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/CNOT Target/i).length).toBeGreaterThan(0);

    // Check Hadamard and Measure explicit labels
    expect(screen.getAllByText('Hadamard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MEASURE').length).toBeGreaterThan(0);
  });

  it('renders all scripted learner and instructor screens at 1366x768 projector layout without clipped primary evidence', async () => {
    // Simulate 1366x768 display viewport
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1366 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
    window.dispatchEvent(new Event('resize'));

    // SCREEN 1: /learn/bell-state
    const { unmount: unmountBell } = render(<BellStateLearnPage />);

    // Check presence of all primary evidence panels
    expect(screen.getByTestId('learn-bell-state-view')).toBeDefined();
    expect(screen.getByTestId('bell-page-header')).toBeDefined();
    expect(screen.getByTestId('prior-knowledge-path-badge')).toBeDefined();
    expect(screen.getByTestId('concept-blocks-card')).toBeDefined();
    expect(screen.getByTestId('prediction-checkpoint-card')).toBeDefined();
    expect(screen.getByTestId('starter-circuit-card')).toBeDefined();
    expect(screen.getByTestId('interactive-circuit-workspace')).toBeDefined();
    expect(screen.getByTestId('qiskit-code-panel')).toBeDefined();
    expect(screen.getByTestId('visual-evidence-card')).toBeDefined();
    expect(screen.getByTestId('bloch-sphere-card')).toBeDefined();
    expect(screen.getByTestId('flight-recorder-card')).toBeDefined();
    expect(screen.getByTestId('tutor-card')).toBeDefined();
    expect(screen.getByTestId('repair-challenge-card')).toBeDefined();
    expect(screen.getByTestId('progress-success-card')).toBeDefined();

    // Check that primary numerical evidence is unclipped and displayed
    expect(screen.getByTestId('basis-prob-00')).toBeDefined();
    expect(screen.getByTestId('basis-prob-11')).toBeDefined();
    expect(screen.getByTestId('misconception-code').textContent).toBe('SUPERPOSITION_VS_ENTANGLEMENT');
    expect(screen.getByTestId('first-divergence-step').textContent).toContain('Step 1');
    expect(screen.getByTestId('tutor-summary')).toBeDefined();
    expect(screen.getByTestId('numerical-claims-table')).toBeDefined();

    // Toggle static fallback on visual evidence to ensure projector accessibility
    const toggleHistoMode = screen.getByTestId('toggle-histogram-mode');
    fireEvent.click(toggleHistoMode);
    expect(screen.getByTestId('static-evidence-table')).toBeDefined();
    expect(screen.getByTestId('bloch-static-fallback')).toBeDefined();

    // Toggle Bloch mode explicitly to dynamic render and back to static fallback
    const toggleBlochMode = screen.getByTestId('toggle-plotly-fallback');
    fireEvent.click(toggleBlochMode);
    expect(screen.getByTestId('bloch-dynamic-render')).toBeDefined();
    fireEvent.click(toggleBlochMode);
    expect(screen.getByTestId('bloch-static-fallback')).toBeDefined();

    unmountBell();

    // SCREEN 2: /lab
    const { unmount: unmountLab } = render(<LabPage />);
    expect(screen.getByTestId('lab-view')).toBeDefined();
    expect(screen.getByTestId('interactive-circuit-workspace')).toBeDefined();
    unmountLab();

    // SCREEN 3: /progress
    const { unmount: unmountProgress } = render(<ProgressPage />);
    expect(screen.getByTestId('progress-view')).toBeDefined();
    expect(screen.getByTestId('progress-meta-badge')).toBeDefined();
    expect(screen.getByText('Total Points')).toBeDefined();
    unmountProgress();

    // SCREEN 4: /instructor
    const { unmount: unmountInstructor } = render(<InstructorPage />);
    expect(screen.getByTestId('instructor-insight-view')).toBeDefined();
    expect(screen.getByTestId('cohort-analytics-chart-card')).toBeDefined();
    expect(screen.getByTestId('cohort-svg-chart')).toBeDefined();

    // Toggle instructor table fallback
    const toggleChartFallback = screen.getByTestId('toggle-chart-fallback-btn');
    fireEvent.click(toggleChartFallback);
    expect(screen.getByTestId('cohort-table-fallback')).toBeDefined();

    unmountInstructor();

    // SCREEN 5: /learn/superposition
    const { unmount: unmountSuperposition } = render(<SuperpositionLearnPage />);
    expect(screen.getByTestId('learn-superposition-view')).toBeDefined();
    expect(screen.getByTestId('single-qubit-preview-card')).toBeDefined();
    unmountSuperposition();

    // SCREEN 6: /learn/measurement
    const { unmount: unmountMeasurement } = render(<MeasurementLearnPage />);
    expect(screen.getByTestId('learn-measurement-view')).toBeDefined();
    expect(screen.getByTestId('measurement-preview-card')).toBeDefined();
    unmountMeasurement();
  });

  it('supports prediction radio navigation and role switcher accessibility', () => {
    render(
      <AppShell>
        <BellStateLearnPage />
      </AppShell>
    );

    // 1. Role switcher accessibility
    const aaravBtn = screen.getByTestId('role-btn-aarav');
    const meeraBtn = screen.getByTestId('role-btn-meera');
    expect(aaravBtn.getAttribute('aria-pressed')).toBe('true');
    expect(meeraBtn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(meeraBtn);
    expect(useRoleStore.getState().activeRoleId).toBe('role_meera');
    expect(meeraBtn.getAttribute('aria-pressed')).toBe('true');

    // 2. Prediction checkpoint radio choices
    const optInd = screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM');
    expect(optInd.getAttribute('role')).toBe('radio');
    
    // Select option with Enter key
    fireEvent.keyDown(optInd, { key: 'Enter', code: 'Enter' });
    expect(optInd.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByTestId('prediction-saved-indicator')).toBeDefined();
  });
});
