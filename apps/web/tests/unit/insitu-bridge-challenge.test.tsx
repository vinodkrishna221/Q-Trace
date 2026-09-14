import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { render } from '../test-utils';
import { apiClient } from '@/lib/api-client';
import { InSituRepairWorkspace } from '@/features/challenges/in-situ-repair-workspace';
import { RepairChallengeCard } from '@/features/challenges/repair-challenge-card';
import BellStateLearnPage from '@/app/(app)/learn/bell-state/page';
import { useCircuitStore } from '@/lib/circuit-store';
import {
  DEMO_BRIDGE_CHALLENGE,
  DEMO_BRIDGE_STARTER_CIRCUIT,
  DEMO_STARTER_CIRCUIT,
} from '@/lib/fixtures';

describe('In-Situ Repair Workspace & Near-Future Bridge Challenge', () => {
  beforeEach(() => {
    useCircuitStore.getState().setCircuit(DEMO_STARTER_CIRCUIT);
  });

  it('renders InSituRepairWorkspace with starter circuit and allows placing Pauli-X on q[1]', async () => {
    let changedCircuit = DEMO_BRIDGE_STARTER_CIRCUIT;
    render(
      <InSituRepairWorkspace
        initialCircuit={DEMO_BRIDGE_STARTER_CIRCUIT}
        challengeId="ch_bell_psi_plus"
        expectedStates={['01', '10']}
        onCircuitChange={(c) => {
          changedCircuit = c;
        }}
      />
    );

    // Initial check: empty slot for q[1] at column 2 exists
    expect(screen.getByTestId('in-situ-repair-workspace')).toBeDefined();
    expect(screen.getByTestId('empty-slot-q1')).toBeDefined();

    // Click "Place Pauli-X on q[1] (Col 2)" button
    fireEvent.click(screen.getByTestId('place-x-gate-btn'));

    // Now gate on q[1] column 2 is visible
    expect(screen.getByTestId('insitu-gate-q1').textContent).toBe('X');
    expect(changedCircuit.operations.some((op) => op.gate === 'X' && op.targets.includes(1))).toBe(true);

    // Test the circuit
    fireEvent.click(screen.getByTestId('test-insitu-circuit-btn'));

    // Target state achieved badge is displayed
    await waitFor(() => {
      expect(screen.getByTestId('insitu-target-achieved-badge')).toBeDefined();
      expect(screen.getByTestId('insitu-target-achieved-badge').textContent).toContain(
        'Target State Prepared'
      );
    });

    // Probability breakdown shows 50% for |01⟩ and 50% for |10⟩
    const probBar = screen.getByTestId('insitu-probabilities-bar');
    expect(probBar.textContent).toContain('|01⟩');
    expect(probBar.textContent).toContain('|10⟩');
    expect(probBar.textContent).toContain('50%');
  });

  it('renders RepairChallengeCard with Stage 2 Teleportation narrative for ch_bell_psi_plus', () => {
    render(
      <RepairChallengeCard
        challenge={DEMO_BRIDGE_CHALLENGE}
        attempt={null}
        onSubmitAttempt={vi.fn()}
      />
    );

    // Bridge narrative visible
    expect(screen.getByTestId('teleportation-bridge-narrative')).toBeDefined();
    expect(screen.getByTestId('teleportation-bridge-narrative').textContent).toContain(
      'Bridge to Stage 2: Quantum Teleportation Protocol'
    );

    // Acceptance rule shows required states 01 and 10
    expect(screen.getByText('|01⟩')).toBeDefined();
    expect(screen.getByText('|10⟩')).toBeDefined();

    // Challenge unattempted state
    expect(screen.getByTestId('repair-unattempted-state')).toBeDefined();
    expect(screen.getByTestId('repair-status-badge').textContent).toBe('CHALLENGE UNATTEMPTED');
  });

  it('evaluates apiClient.getChallenge and apiClient.submitChallengeAttempt for bridge challenge', async () => {
    // 1. getChallenge for ch_bell_psi_plus
    const getRes = await apiClient.getChallenge('ch_bell_psi_plus');
    expect(getRes.data.challenge.id).toBe('ch_bell_psi_plus');
    expect(getRes.data.challenge.title).toBe(DEMO_BRIDGE_CHALLENGE.title);

    // 2. submitChallengeAttempt with a passing simulation run
    const simRes = await apiClient.runSimulation({
      learnerProfileId: 'lp_aarav',
      moduleId: 'mod_bell',
      circuitModel: {
        ...DEMO_BRIDGE_STARTER_CIRCUIT,
        id: 'cm_test_psi_plus',
        operations: [
          ...DEMO_BRIDGE_STARTER_CIRCUIT.operations,
          { opId: 'op_x', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 2 },
        ],
      },
      predictionResponse: { checkpointId: 'pc_bell', answer: 'CORRELATED_00_11' },
    });

    const submitRes = await apiClient.submitChallengeAttempt({
      challengeId: 'ch_bell_psi_plus',
      learnerProfileId: 'lp_aarav',
      submittedAnswer: { type: 'CIRCUIT_MODEL', circuitModelId: 'cm_test_psi_plus' },
      simulationRunId: simRes.data.id,
    });

    expect(submitRes.data.challengeAttempt.passed).toBe(true);
    expect(submitRes.data.challengeAttempt.score).toBe(100);
    expect(submitRes.data.challengeAttempt.feedbackCode).toBe('BELL_SUPPORT_CORRECT');
  });

  it('displays Circuit Variation alert in Step 2 when user modifies starter Bell circuit and resets on click', async () => {
    render(<BellStateLearnPage />);

    // Initially with DEMO_STARTER_CIRCUIT, no circuit variation alert
    expect(screen.queryByTestId('circuit-variation-alert')).toBeNull();

    // Modify circuit in store: e.g. add an extra gate inside act
    act(() => {
      useCircuitStore.getState().addGate('X', 0, 3);
    });

    // Circuit variation alert appears
    await waitFor(() => {
      expect(screen.getByTestId('circuit-variation-alert')).toBeDefined();
    });
    expect(screen.getByTestId('circuit-variation-alert').textContent).toContain(
      'Circuit Variation Detected'
    );

    // Click "Reset Bell Seed"
    fireEvent.click(screen.getByTestId('reset-bell-seed-btn'));

    // Circuit variation alert disappears
    await waitFor(() => {
      expect(screen.queryByTestId('circuit-variation-alert')).toBeNull();
    });
  });

  it('allows switching between Stage 2 Bridge Challenge and Remedial Repair in Step 6', () => {
    render(<BellStateLearnPage />);

    // Initially for default Aarav misconception path, it renders Repair Challenge
    expect(screen.getByTestId('challenge-title').textContent).toBe('Restore Bell Correlation');

    // Switch to Stage 2 Bridge Challenge
    fireEvent.click(screen.getByTestId('select-bridge-challenge-btn'));

    // Title updates to Bridge Challenge
    expect(screen.getByTestId('challenge-title').textContent).toBe(
      'Teleportation Channel: Prepare Anti-Correlated Bell Pair'
    );
    expect(screen.getByTestId('teleportation-bridge-narrative')).toBeDefined();

    // Switch back to Remedial Repair
    fireEvent.click(screen.getByTestId('select-remedial-challenge-btn'));
    expect(screen.getByTestId('challenge-title').textContent).toBe('Restore Bell Correlation');
  });

  it('invalidates stale simulation run when gates are modified after testing', async () => {
    render(
      <InSituRepairWorkspace
        initialCircuit={DEMO_BRIDGE_STARTER_CIRCUIT}
        challengeId="ch_bell_psi_plus"
        expectedStates={['01', '10']}
      />
    );

    // Place X on q[1]
    fireEvent.click(screen.getByTestId('place-x-gate-btn'));
    expect(screen.getByTestId('insitu-gate-q1')).toBeDefined();

    // Test circuit
    fireEvent.click(screen.getByTestId('test-insitu-circuit-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('insitu-target-achieved-badge')).toBeDefined();
    });

    // Now remove the gate
    fireEvent.click(screen.getByTestId('remove-gate-q1'));

    // Stale simulation badge and probabilities must be cleared
    await waitFor(() => {
      expect(screen.queryByTestId('insitu-target-achieved-badge')).toBeNull();
      expect(screen.queryByTestId('insitu-probabilities-bar')).toBeNull();
    });
  });

  it('submits bridge challenge successfully when user places gate and submits directly without test button', async () => {
    render(<BellStateLearnPage />);

    // Switch to bridge challenge
    fireEvent.click(screen.getByTestId('select-bridge-challenge-btn'));
    expect(screen.getByTestId('challenge-title').textContent).toBe(
      'Teleportation Channel: Prepare Anti-Correlated Bell Pair'
    );

    // Initial state is unattempted
    expect(screen.getByTestId('repair-status-badge').textContent).toBe('CHALLENGE UNATTEMPTED');

    // Place Pauli-X on q[1] in the in-situ workspace
    fireEvent.click(screen.getByTestId('place-x-gate-btn'));
    expect(screen.getByTestId('insitu-gate-q1')).toBeDefined();

    // Submit challenge attempt directly WITHOUT clicking Test Circuit
    const submitBtn = screen.getByTestId('submit-repair-btn');
    fireEvent.click(submitBtn);

    // Verify submission succeeds and passes with 100 points
    await waitFor(() => {
      expect(screen.getByTestId('repair-status-badge').textContent).toBe('REPAIR ATTEMPT PASSED');
    });
    expect(screen.getByTestId('repair-feedback-code').textContent).toBe('BELL_SUPPORT_CORRECT');
  });
});
