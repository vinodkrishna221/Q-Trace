import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { render } from '../test-utils';
import LabPage from '@/app/(app)/lab/page';
import { Bloch3DSphere } from '@/features/evidence/bloch-3d-sphere';
import { TwoQubitQSphere } from '@/features/evidence/two-qubit-qsphere';
import { Switch } from '@/components/ui/switch';
import { useCircuitStore } from '@/lib/circuit-store';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_SIMULATION_RUN, DEMO_FLIGHT_RECORDER_DIAGNOSIS } from '@/lib/fixtures';
import { apiClient } from '@/lib/api-client';

describe('FEA-11: Noise Toggle UI + Bloch Contraction + Q-Sphere Wiring', () => {
  beforeEach(() => {
    localStorage.clear();
    useCircuitStore.getState().resetToBellSeed();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Bloch3DSphere Purity Readout & Contraction', () => {
    it('renders purity readout badge for pure state (purity = 1.0)', () => {
      render(
        <Bloch3DSphere
          qubitIndex={0}
          bloch={{ x: 0.0, y: 0.0, z: 1.0 }}
          purity={1.0}
          label="PURE_SUBSYSTEM"
        />
      );

      const readout = screen.getByTestId('bloch-purity-readout-0');
      expect(readout).toBeDefined();
      expect(readout.textContent).toContain('Purity:');
      expect(readout.textContent).toContain('Tr(ρ²) = 1.000');
      expect(readout.textContent).toContain('[pure state]');
    });

    it('renders purity readout badge and unclamped contracted state for mixed state (purity = 0.847)', () => {
      // Contracted Bloch vector (|r| = 0.847 < 1.0) under superconducting noise
      render(
        <Bloch3DSphere
          qubitIndex={0}
          bloch={{ x: 0.0, y: 0.0, z: 0.847 }}
          purity={0.847}
          label="MIXED_SUBSYSTEM"
        />
      );

      const readout = screen.getByTestId('bloch-purity-readout-0');
      expect(readout).toBeDefined();
      expect(readout.textContent).toContain('Purity:');
      expect(readout.textContent).toContain('Tr(ρ²) = 0.847');
      expect(readout.textContent).toContain('[mixed state]');
    });
  });

  describe('2. TwoQubitQSphere Multi-Qubit Visualizer', () => {
    it('renders the 3D Q-Sphere canvas and orientation control', () => {
      render(
        <TwoQubitQSphere
          amplitudes={{
            '00': { re: 0.70710678, im: 0 },
            '01': { re: 0, im: 0 },
            '10': { re: 0, im: 0 },
            '11': { re: 0.70710678, im: 0 },
          }}
          basisProbabilities={{ '00': 0.5, '01': 0, '10': 0, '11': 0.5 }}
          qubitCount={2}
          noiseEnabled={false}
        />
      );

      expect(screen.getByTestId('qsphere-container')).toBeDefined();
      expect(screen.queryByTestId('qsphere-noise-badge')).toBeNull();
    });

    it('renders active noise badge when noiseEnabled is true', () => {
      render(
        <TwoQubitQSphere
          basisProbabilities={{ '00': 0.46, '01': 0.04, '10': 0.04, '11': 0.46 }}
          qubitCount={2}
          noiseEnabled={true}
        />
      );

      const noiseBadge = screen.getByTestId('qsphere-noise-badge');
      expect(noiseBadge).toBeDefined();
      expect(noiseBadge.textContent).toContain('NISQ Noise Emulation Active');
    });
  });

  describe('3. Accessible Switch Component', () => {
    it('renders role="switch" with aria-checked and handles state change', () => {
      const onCheckedChange = vi.fn();
      render(
        <Switch
          id="test-switch"
          data-testid="test-switch"
          checked={false}
          onCheckedChange={onCheckedChange}
        />
      );

      const switchEl = screen.getByTestId('test-switch');
      expect(switchEl.getAttribute('role')).toBe('switch');
      expect(switchEl.getAttribute('aria-checked')).toBe('false');

      fireEvent.click(switchEl);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('4. LabPage NISQ Noise Toggle & Q-Sphere Integration', () => {
    it('mounts TwoQubitQSphere and Noise Switch in Stage 2 after simulation execution', async () => {
      vi.spyOn(apiClient, 'runSimulation').mockResolvedValue({
        data: DEMO_SIMULATION_RUN,
        meta: {
          requestId: 'req_test_noise_001',
          isFallback: false,
          durationMs: 40,
        },
      });

      vi.spyOn(apiClient, 'diagnoseFlightRecorder').mockResolvedValue({
        data: {
          ...DEMO_FLIGHT_RECORDER_DIAGNOSIS,
          isCorrectPrediction: true,
        },
        meta: {
          requestId: 'req_test_diag_001',
          isFallback: false,
          durationMs: 25,
        },
      });

      render(<LabPage />);

      // Stage 2 is hidden initially
      expect(screen.queryByTestId('lab-visual-evidence-section')).toBeNull();

      // Trigger simulation via workspace primary run button
      const runBtn = screen.getByTestId('run-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      // Stage 2 is now revealed
      await waitFor(() => {
        expect(screen.getByTestId('lab-visual-evidence-section')).toBeDefined();
      });

      // NISQ Noise Switch toolbar is mounted in Stage 2
      expect(screen.getByTestId('nisq-noise-toolbar')).toBeDefined();
      const noiseSwitch = screen.getByTestId('noise-toggle-switch');
      expect(noiseSwitch).toBeDefined();
      expect(noiseSwitch.getAttribute('aria-checked')).toBe('false');
      expect(screen.getByText('NISQ Noise Model (Superconducting T₁/T₂)')).toBeDefined();

      // Multi-qubit Q-Sphere is mounted for 2-qubit circuit
      expect(screen.getByTestId('lab-qsphere-section')).toBeDefined();
      expect(screen.getByTestId('qsphere-container')).toBeDefined();
      expect(screen.getByText('Multi-Qubit State (3D Q-Sphere)')).toBeDefined();
    });

    it('toggling NISQ Noise switch re-submits circuit with noisePreset: "superconducting"', async () => {
      const runSimulationSpy = vi.spyOn(apiClient, 'runSimulation').mockResolvedValue({
        data: {
          ...DEMO_SIMULATION_RUN,
          noisePreset: 'superconducting',
          probabilities: { '00': 0.46, '01': 0.04, '10': 0.04, '11': 0.46 },
          counts: { '00': 471, '01': 41, '10': 41, '11': 471 },
          stateTrace: [
            {
              stepIndex: 0,
              operationId: 'op_1',
              label: 'After H (noisy)',
              basisProbabilities: { '00': 0.5, '10': 0.5 },
              amplitudes: {
                '00': { re: 0.70710678, im: 0 },
                '10': { re: 0.70710678, im: 0 },
              },
              reducedQubits: [
                {
                  qubit: 0,
                  bloch: { x: 0.847, y: 0.0, z: 0.0 },
                  purity: 0.847,
                  label: 'MIXED_SUBSYSTEM',
                },
                {
                  qubit: 1,
                  bloch: { x: 0.0, y: 0.0, z: 0.847 },
                  purity: 0.847,
                  label: 'MIXED_SUBSYSTEM',
                },
              ],
            },
          ],
        },
        meta: {
          requestId: 'req_test_noisy_002',
          isFallback: false,
          durationMs: 75,
        },
      });

      vi.spyOn(apiClient, 'diagnoseFlightRecorder').mockResolvedValue({
        data: {
          ...DEMO_FLIGHT_RECORDER_DIAGNOSIS,
          isCorrectPrediction: true,
        },
        meta: {
          requestId: 'req_test_diag_002',
          isFallback: false,
          durationMs: 25,
        },
      });

      render(<LabPage />);

      // Initial simulation run
      const runBtn = screen.getByTestId('run-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('noise-toggle-switch')).toBeDefined();
      });

      // Clear spy call history before toggling
      runSimulationSpy.mockClear();

      // Toggle NISQ Noise switch
      const noiseSwitch = screen.getByTestId('noise-toggle-switch');
      await act(async () => {
        fireEvent.click(noiseSwitch);
      });

      // Verifies circuit was re-submitted with noisePreset: "superconducting"
      await waitFor(() => {
        expect(runSimulationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            noisePreset: 'superconducting',
          })
        );
      });

      // Switch should now be checked and active badge displayed
      expect(noiseSwitch.getAttribute('aria-checked')).toBe('true');
      expect(screen.getByTestId('noise-active-badge')).toBeDefined();
      expect(screen.getByText('T₁=50µs · T₂=70µs · Readout 1%')).toBeDefined();
    });
  });
});
