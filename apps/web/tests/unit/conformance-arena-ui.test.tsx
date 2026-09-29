import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { render } from '../test-utils';
import { ConformanceBadge } from '@/features/circuit/conformance-badge';
import { EndiannessRosettaStone } from '@/features/circuit/endianness-rosetta-stone';
import LabPage from '@/app/(app)/lab/page';
import { useCircuitStore } from '@/lib/circuit-store';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_SIMULATION_RUN } from '@/lib/fixtures';
import { apiClient } from '@/lib/api-client';

describe('FEA-9: Tri-Engine Conformance Arena & Endianness Rosetta Stone UI', () => {
  beforeEach(() => {
    localStorage.clear();
    useCircuitStore.getState().resetToBellSeed();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. ConformanceBadge Component', () => {
    it('renders green verified badge when delta <= 1e-6 and status is VERIFIED', () => {
      render(
        <ConformanceBadge
          status="VERIFIED"
          delta={0.000000}
          results={{
            qiskit: { durationMs: 12 },
            pennylane: { durationMs: 18 },
            cirq: { durationMs: 9 },
          }}
          selectedEngines={['Qiskit Aer', 'PennyLane', 'Cirq']}
        />
      );

      const badge = screen.getByTestId('conformance-badge');
      expect(badge).toBeDefined();

      const verifiedBadge = screen.getByTestId('conformance-badge-verified');
      expect(verifiedBadge).toBeDefined();
      expect(verifiedBadge.textContent).toContain('✓ Multi-Engine Verified');
      expect(screen.getByTestId('conformance-delta-val').textContent).toContain('Δ = 0.000000');
    });

    it('renders red diverged badge when delta > 1e-6 and status is DIVERGED', () => {
      render(
        <ConformanceBadge
          status="DIVERGED"
          delta={0.000031}
          results={{
            qiskit: { durationMs: 15 },
            pennylane: { durationMs: 20 },
            cirq: { durationMs: 11 },
          }}
          selectedEngines={['Qiskit Aer', 'PennyLane', 'Cirq']}
        />
      );

      const divergedBadge = screen.getByTestId('conformance-badge-diverged');
      expect(divergedBadge).toBeDefined();
      expect(divergedBadge.textContent).toContain('✗ Engines Diverged');
      expect(screen.getByTestId('conformance-delta-val').textContent).toContain('Δ = 0.000031');
    });

    it('opens and closes detailed telemetry popover on click and Esc', () => {
      render(
        <ConformanceBadge
          status="VERIFIED"
          delta={0.000000}
          results={{
            qiskit: { durationMs: 12 },
            pennylane: { durationMs: 18 },
            cirq: { durationMs: 9 },
          }}
          selectedEngines={['Qiskit Aer', 'PennyLane', 'Cirq']}
        />
      );

      // Initially closed
      expect(screen.queryByTestId('conformance-tooltip')).toBeNull();

      // Open on button click
      const badgeBtn = screen.getByTestId('conformance-badge-verified');
      fireEvent.click(badgeBtn);

      const tooltip = screen.getByTestId('conformance-tooltip');
      expect(tooltip).toBeDefined();
      expect(tooltip.textContent).toContain('Tri-Engine Conformance Telemetry');
      expect(tooltip.textContent).toContain('Tolerance Threshold (ε):');
      expect(tooltip.textContent).toContain('1.00e-6');
      expect(tooltip.textContent).toContain('Qiskit Aer');
      expect(tooltip.textContent).toContain('PennyLane');
      expect(tooltip.textContent).toContain('Google Cirq');
      expect(tooltip.textContent).toContain('12ms');
      expect(tooltip.textContent).toContain('18ms');
      expect(tooltip.textContent).toContain('9ms');

      // Close on Esc key
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('conformance-tooltip')).toBeNull();
    });
  });

  describe('2. EndiannessRosettaStone Component', () => {
    it('renders side-by-side Qiskit and Cirq/PennyLane endianness breakdown with translation matrix', () => {
      render(<EndiannessRosettaStone activeEngines={['Qiskit Aer', 'PennyLane', 'Cirq']} />);

      expect(screen.getByTestId('endianness-rosetta-stone')).toBeDefined();
      expect(screen.getByText('Endianness Rosetta Stone')).toBeDefined();
      expect(screen.getByText('MULTI-FRAMEWORK CONVENTION')).toBeDefined();

      // Side-by-side panels
      const qiskitPanel = screen.getByTestId('rosetta-qiskit-mapping');
      expect(qiskitPanel.textContent).toContain('Qiskit Aer');
      expect(qiskitPanel.textContent).toContain('Little-Endian (|q₁q₀⟩)');
      expect(qiskitPanel.textContent).toContain('|00⟩ = 50%');

      const cirqPanel = screen.getByTestId('rosetta-cirq-mapping');
      expect(cirqPanel.textContent).toContain('Google Cirq & PennyLane');
      expect(cirqPanel.textContent).toContain('Big-Endian (|q₀q₁⟩)');
      expect(cirqPanel.textContent).toContain('|00⟩ = 50%');

      // Translation matrix
      expect(screen.getByText('Computational Basis State Translation Matrix')).toBeDefined();
      expect(screen.getByText('Qiskit |01⟩')).toBeDefined();
      expect(screen.getByText('Cirq |10⟩')).toBeDefined();
    });

    it('toggles active notation between Qiskit Little-Endian and Cirq Big-Endian', () => {
      const handleToggle = vi.fn();
      render(<EndiannessRosettaStone onToggleNotation={handleToggle} />);

      const toggleBtn = screen.getByTestId('bit-order-toggle-btn');
      const activeLabel = screen.getByTestId('rosetta-active-notation');
      expect(activeLabel.textContent).toContain('Qiskit Little-Endian');

      // Click to toggle
      fireEvent.click(toggleBtn);
      expect(handleToggle).toHaveBeenCalledWith('cirq');
      expect(activeLabel.textContent).toContain('Cirq Big-Endian');

      // Click again to flip back
      fireEvent.click(toggleBtn);
      expect(handleToggle).toHaveBeenCalledWith('qiskit');
      expect(activeLabel.textContent).toContain('Qiskit Little-Endian');
    });
  });

  describe('3. Lab Page Engine Selector & Multi-Engine Execution', () => {
    it('renders the execution engine toolbar and allows selecting multiple backends', async () => {
      render(<LabPage />);

      const toolbar = screen.getByTestId('engine-selector-toolbar');
      expect(toolbar).toBeDefined();
      expect(toolbar.textContent).toContain('Execution Engines');

      // Engine toggle buttons
      const qiskitBtn = screen.getByTestId('engine-toggle-qiskit-aer');
      const pennyBtn = screen.getByTestId('engine-toggle-pennylane');
      const cirqBtn = screen.getByTestId('engine-toggle-cirq');

      expect(qiskitBtn).toBeDefined();
      expect(pennyBtn).toBeDefined();
      expect(cirqBtn).toBeDefined();

      // Initially only Qiskit Aer is active
      expect(qiskitBtn.getAttribute('aria-pressed')).toBe('true');
      expect(pennyBtn.getAttribute('aria-pressed')).toBe('false');
      expect(cirqBtn.getAttribute('aria-pressed')).toBe('false');

      // Toggle PennyLane and Cirq on
      fireEvent.click(pennyBtn);
      fireEvent.click(cirqBtn);

      expect(pennyBtn.getAttribute('aria-pressed')).toBe('true');
      expect(cirqBtn.getAttribute('aria-pressed')).toBe('true');
      expect(toolbar.textContent).toContain('TRI-ENGINE ARENA');

      // Target banner in header updates
      const targetLabel = screen.getByTestId('target-engine-label');
      expect(targetLabel.textContent).toContain('Tri-Engine (Qiskit Aer, PennyLane, Cirq)');

      // Disallow deselecting the last active engine
      fireEvent.click(qiskitBtn);
      fireEvent.click(pennyBtn);
      // Only Cirq remains
      expect(cirqBtn.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(cirqBtn); // Should not deselect
      expect(cirqBtn.getAttribute('aria-pressed')).toBe('true');
    });

    it('runs simulation with all 3 engines and displays green ConformanceBadge and EndiannessRosettaStone', async () => {
      const mockRunSimulation = vi.spyOn(apiClient, 'runSimulation').mockResolvedValueOnce({
        data: {
          ...DEMO_SIMULATION_RUN,
          conformanceResults: {
            qiskit: { durationMs: 12 },
            pennylane: { durationMs: 18 },
            cirq: { durationMs: 9 },
          },
          conformanceDelta: 0.000000,
          conformanceBadge: 'VERIFIED',
        },
        meta: {
          requestId: 'req_tri_engine_demo_01',
          isFallback: false,
          durationMs: 42,
        },
      });

      render(<LabPage />);

      // Select all 3 engines
      const pennyBtn = screen.getByTestId('engine-toggle-pennylane');
      const cirqBtn = screen.getByTestId('engine-toggle-cirq');
      fireEvent.click(pennyBtn);
      fireEvent.click(cirqBtn);

      // Run simulation using the workspace run button
      const runBtn = screen.getByTestId('run-simulation-btn');
      await act(async () => {
        fireEvent.click(runBtn);
      });

      await waitFor(() => {
        expect(mockRunSimulation).toHaveBeenCalled();
      });

      // Verify backends payload was passed
      const calledPayload = mockRunSimulation.mock.calls[0][0];
      expect(calledPayload.backends).toEqual(['qiskit', 'pennylane', 'cirq']);

      // Conformance badge appears with green verified state
      await waitFor(() => {
        const verifiedBadges = screen.getAllByTestId('conformance-badge-verified');
        expect(verifiedBadges.length).toBeGreaterThan(0);
        expect(verifiedBadges[0].textContent).toContain('✓ Multi-Engine Verified');
      });

      // Stage 2 Visual Evidence section is rendered and embeds EndiannessRosettaStone
      const visualEvidenceSection = screen.getByTestId('lab-visual-evidence-section');
      expect(visualEvidenceSection).toBeDefined();

      const rosettaStone = screen.getByTestId('endianness-rosetta-stone');
      expect(rosettaStone).toBeDefined();
      expect(rosettaStone.textContent).toContain('Endianness Rosetta Stone');
    });
  });
});
