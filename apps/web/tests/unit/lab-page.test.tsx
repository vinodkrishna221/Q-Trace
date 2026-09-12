import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { render } from '../test-utils';
import LabPage from '@/app/(app)/lab/page';
import { useCircuitStore } from '@/lib/circuit-store';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_SIMULATION_RUN, DEMO_FLIGHT_RECORDER_DIAGNOSIS } from '@/lib/fixtures';
import { apiClient } from '@/lib/api-client';

describe('Interactive Circuit Lab Page (/lab)', () => {
  beforeEach(() => {
    localStorage.clear();
    useCircuitStore.getState().resetToBellSeed();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Clean Initial Load State', () => {
    it('renders the lab header, preset toolbar, interactive workspace, and ready-to-simulate prompt card', () => {
      render(<LabPage />);

      // Lab Page container and header
      expect(screen.getByTestId('lab-view')).toBeDefined();
      expect(screen.getByText('Interactive Quantum Circuit Lab')).toBeDefined();
      expect(screen.getByTestId('lab-context-banner')).toBeDefined();
      expect(screen.getByText('READY TO RUN')).toBeDefined();

      // Preset toolbar
      expect(screen.getByTestId('circuit-preset-toolbar')).toBeDefined();
      expect(screen.getByTestId('preset-bell-state-btn')).toBeDefined();
      expect(screen.getByTestId('preset-superposition-btn')).toBeDefined();
      expect(screen.getByTestId('preset-clear-grid-btn')).toBeDefined();

      // Circuit workspace and code editor
      expect(screen.getByTestId('interactive-circuit-workspace')).toBeDefined();
      expect(screen.getByTestId('qubit-wires-grid')).toBeDefined();
      expect(screen.getByTestId('qiskit-code-panel')).toBeDefined();

      // Clean initial state: Ready to Simulate prompt card is visible
      expect(screen.getByTestId('lab-ready-to-simulate-card')).toBeDefined();
      expect(screen.getByTestId('lab-start-simulation-btn')).toBeDefined();
      expect(screen.getByText('Ready to Simulate')).toBeDefined();
      expect(screen.getByText('Visual Evidence')).toBeDefined();
      expect(screen.getByText('Bloch Spheres')).toBeDefined();
      expect(screen.getByText('Flight Recorder')).toBeDefined();

      // Output evidence suites are NOT visible before simulation
      expect(screen.queryByTestId('lab-visual-evidence-section')).toBeNull();
      expect(screen.queryByTestId('lab-flight-recorder-section')).toBeNull();
    });
  });

  describe('2. Dedicated Circuit Preset Selector', () => {
    it('loads the Superposition State (|+⟩) preset into the workspace and updates the code editor', async () => {
      render(<LabPage />);

      const superpositionBtn = screen.getByTestId('preset-superposition-btn');
      await act(async () => {
        fireEvent.click(superpositionBtn);
      });

      // Circuit store updated
      const { circuit, code } = useCircuitStore.getState();
      expect(circuit.name).toBe('Superposition State (|+⟩)');
      expect(circuit.operations.some((op) => op.gate === 'H' && op.targets.includes(0))).toBe(true);
      expect(code).toContain('qc.h(0)');

      // Workspace displays updated circuit name badge
      expect(screen.getByTestId('circuit-name-badge').textContent).toBe('Superposition State (|+⟩)');
    });

    it('clears the grid when Clear Grid preset is selected', async () => {
      render(<LabPage />);

      const clearBtn = screen.getByTestId('preset-clear-grid-btn');
      await act(async () => {
        fireEvent.click(clearBtn);
      });

      const { circuit } = useCircuitStore.getState();
      expect(circuit.operations).toHaveLength(0);
    });

    it('resets back to Bell State Seed (|Φ⁺⟩) when clicked', async () => {
      render(<LabPage />);

      // First switch to clear
      const clearBtn = screen.getByTestId('preset-clear-grid-btn');
      await act(async () => {
        fireEvent.click(clearBtn);
      });
      expect(useCircuitStore.getState().circuit.operations).toHaveLength(0);

      // Now click Bell State Seed
      const bellBtn = screen.getByTestId('preset-bell-state-btn');
      await act(async () => {
        fireEvent.click(bellBtn);
      });

      const { circuit } = useCircuitStore.getState();
      expect(circuit.name).toBe('Bell State Seed');
      expect(circuit.operations.length).toBeGreaterThan(0);
    });
  });

  describe('3. Robust Simulation & Diagnosis Pipeline', () => {
    it('executes simulation and reveals Visual Evidence (Histogram + Bloch) and Flight Recorder', async () => {
      vi.spyOn(apiClient, 'runSimulation').mockResolvedValue({
        data: DEMO_SIMULATION_RUN,
        meta: {
          requestId: 'req_test_lab_001',
          isFallback: false,
          durationMs: 45,
        },
      });

      vi.spyOn(apiClient, 'diagnoseFlightRecorder').mockResolvedValue({
        data: {
          ...DEMO_FLIGHT_RECORDER_DIAGNOSIS,
          isCorrectPrediction: true,
        },
        meta: {
          requestId: 'req_test_lab_diag_001',
          isFallback: false,
          durationMs: 30,
        },
      });

      render(<LabPage />);

      // Click the Ready to Simulate prompt button
      const runBtn = screen.getByTestId('lab-start-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      // Ready prompt is replaced by output evidence suites
      await waitFor(() => {
        expect(screen.queryByTestId('lab-ready-to-simulate-card')).toBeNull();
        expect(screen.getByTestId('lab-visual-evidence-section')).toBeDefined();
        expect(screen.getByTestId('visual-evidence-card')).toBeDefined();
        expect(screen.getByTestId('bloch-sphere-card')).toBeDefined();
        expect(screen.getByTestId('lab-flight-recorder-section')).toBeDefined();
        expect(screen.getByTestId('flight-recorder-card')).toBeDefined();
      });

      // Basis probabilities are rendered
      expect(screen.getByTestId('basis-prob-00')).toBeDefined();
      expect(screen.getByTestId('basis-prob-11')).toBeDefined();

      // Flight recorder step navigation is interactive
      expect(screen.getByTestId('hypothesis-confirmed-badge')).toBeDefined();
      expect(screen.getByTestId('step-btn-0')).toBeDefined();
    });

    it('renders timeout error banner when simulation times out and allows retry', async () => {
      const timeoutErr = new Error('Simulation execution exceeded 1500ms timeout threshold.');
      (timeoutErr as unknown as { code: string }).code = 'SIMULATION_TIMEOUT';

      vi.spyOn(apiClient, 'runSimulation').mockRejectedValue(timeoutErr);

      render(<LabPage />);

      const runBtn = screen.getByTestId('lab-start-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('simulation-error-banner')).toBeDefined();
        expect(screen.getByText('Simulation Execution Failed / Timed Out')).toBeDefined();
        expect(screen.getByTestId('retry-simulation-btn')).toBeDefined();
      });

      // Circuit workspace remains intact
      expect(screen.getByTestId('interactive-circuit-workspace')).toBeDefined();
    });

    it('resets outputs back to clean ready state when user changes preset after execution', async () => {
      vi.spyOn(apiClient, 'runSimulation').mockResolvedValue({
        data: DEMO_SIMULATION_RUN,
        meta: {
          requestId: 'req_test_lab_002',
          isFallback: false,
          durationMs: 40,
        },
      });

      vi.spyOn(apiClient, 'diagnoseFlightRecorder').mockResolvedValue({
        data: DEMO_FLIGHT_RECORDER_DIAGNOSIS,
        meta: {
          requestId: 'req_test_lab_diag_002',
          isFallback: false,
          durationMs: 25,
        },
      });

      render(<LabPage />);

      // Run simulation
      const runBtn = screen.getByTestId('lab-start-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('lab-visual-evidence-section')).toBeDefined();
      });

      // Switch preset to Superposition
      const supBtn = screen.getByTestId('preset-superposition-btn');
      await act(async () => {
        fireEvent.click(supBtn);
      });

      // Outputs reset, ready card shown again
      expect(screen.getByTestId('lab-ready-to-simulate-card')).toBeDefined();
      expect(screen.queryByTestId('lab-visual-evidence-section')).toBeNull();
    });

    it('simulates Clear Grid correctly, exhibiting pure ground state |00⟩ (purity 1.0) and baseline trace step', async () => {
      render(<LabPage />);

      // Clear grid
      const clearBtn = screen.getByTestId('preset-clear-grid-btn');
      await act(async () => {
        fireEvent.click(clearBtn);
      });

      // Click run simulation
      const runBtn = screen.getByTestId('lab-start-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('lab-visual-evidence-section')).toBeDefined();
        expect(screen.getByTestId('lab-flight-recorder-section')).toBeDefined();
      });

      // Ground state outcome |00⟩ is 100%
      expect(screen.getByTestId('basis-prob-00').textContent).toContain('100.0%');

      // Both qubits are pure subsystems with purity 1.0 (not mixed)
      expect(screen.getByTestId('subsystem-label-0').textContent).toBe('PURE_SUBSYSTEM');
      expect(screen.getByTestId('subsystem-label-1').textContent).toBe('PURE_SUBSYSTEM');

      // Initial ground state step is displayed in Flight Recorder
      expect(screen.getByTestId('step-btn-0')).toBeDefined();
      expect(screen.getByTestId('step-btn-0').textContent).toContain('Initial Ground State |00⟩');
    });

    it('renders error recovery banner on general runtime simulation failure (non-timeout)', async () => {
      vi.spyOn(apiClient, 'runSimulation').mockRejectedValue(new Error('Aer simulation runtime exception: invalid circuit syntax'));

      render(<LabPage />);

      const runBtn = screen.getByTestId('lab-start-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('simulation-error-banner')).toBeDefined();
        expect(screen.getByText('RUNTIME ERROR')).toBeDefined();
        expect(screen.getByText('Aer simulation runtime exception: invalid circuit syntax')).toBeDefined();
        expect(screen.getByTestId('retry-simulation-btn')).toBeDefined();
      });

      // Fallback outputs are NOT shown on fatal error
      expect(screen.queryByTestId('lab-visual-evidence-section')).toBeNull();
    });

    it('detects custom circuit when user adds a gate and displays stale circuit warning', async () => {
      vi.spyOn(apiClient, 'runSimulation').mockResolvedValue({
        data: DEMO_SIMULATION_RUN,
        meta: {
          requestId: 'req_test_lab_custom_001',
          isFallback: false,
          durationMs: 40,
        },
      });

      vi.spyOn(apiClient, 'diagnoseFlightRecorder').mockResolvedValue({
        data: DEMO_FLIGHT_RECORDER_DIAGNOSIS,
        meta: {
          requestId: 'req_test_lab_diag_custom_001',
          isFallback: false,
          durationMs: 25,
        },
      });

      render(<LabPage />);

      // 1. Run simulation on initial Bell state
      const runBtn = screen.getByTestId('lab-start-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('lab-visual-evidence-section')).toBeDefined();
        expect(screen.getByText('SIMULATION COMPLETE')).toBeDefined();
      });

      // 2. Add a gate via circuit store to make it a custom circuit
      act(() => {
        useCircuitStore.getState().addGate('X', 0, 3);
      });

      // 3. Preset badge updates to CUSTOM CIRCUIT
      expect(screen.getByTestId('preset-custom-badge')).toBeDefined();
      expect(screen.getByText('MODIFIED · RE-RUN REQUIRED')).toBeDefined();

      // 4. Stale circuit notice is shown
      expect(screen.getByTestId('stale-circuit-warning')).toBeDefined();
      expect(screen.getByTestId('rerun-stale-btn')).toBeDefined();
    });
  });
});
