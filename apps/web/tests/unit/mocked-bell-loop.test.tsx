import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import BellStateLearnPage from '@/app/(app)/learn/bell-state/page';
import { useRoleStore } from '@/lib/role-store';
import { usePredictionStore } from '@/lib/prediction-store';
import {
  DEMO_MODULES,
} from '@/lib/fixtures';

describe('Mocked Learner Evidence Loop (UX-3)', () => {
  beforeEach(() => {
    localStorage.clear();
    usePredictionStore.getState().resetAllDrafts();
    useRoleStore.getState().setRole('role_aarav');
  });

  it('renders the complete 90-second learner journey with all contract-shaped fixtures', () => {
    render(<BellStateLearnPage />);

    // 1. Header & Module metadata
    expect(screen.getByTestId('learn-bell-state-view')).toBeDefined();
    expect(screen.getByText(DEMO_MODULES['bell-state'].title)).toBeDefined();

    // 2. Prediction Checkpoint
    expect(screen.getByTestId('prediction-checkpoint-card')).toBeDefined();
    expect(screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM')).toBeDefined();

    // 3. Read-Only Circuit Workspace
    expect(screen.getByTestId('circuit-workspace-readonly')).toBeDefined();
    expect(screen.getByTestId('qubit-wire-0')).toBeDefined();
    expect(screen.getByTestId('qubit-wire-1')).toBeDefined();
    expect(screen.getByTestId('gate-op_1')).toBeDefined(); // H
    expect(screen.getByTestId('gate-op_2')).toBeDefined(); // CNOT
    expect(screen.getByTestId('gate-op_3')).toBeDefined(); // Measure q[0]
    expect(screen.getByTestId('gate-op_4')).toBeDefined(); // Measure q[1]

    // 4. Synchronized Qiskit Code Panel
    expect(screen.getByTestId('qiskit-code-panel')).toBeDefined();
    const codeContent = screen.getByTestId('qiskit-code-content').textContent;
    expect(codeContent).toContain('from qiskit import QuantumCircuit');
    expect(codeContent).toContain('qc.h(0)');
    expect(codeContent).toContain('qc.cx(0, 1)');
    expect(codeContent).toContain('qc.measure([0, 1], [0, 1])');

    // 5. Visual Evidence View
    expect(screen.getByTestId('visual-evidence-card')).toBeDefined();

    // 6. Quantum Flight Recorder
    expect(screen.getByTestId('flight-recorder-card')).toBeDefined();

    // 7. Evidence-bound Tutor Card
    expect(screen.getByTestId('tutor-card')).toBeDefined();

    // 8. Repair Challenge Card
    expect(screen.getByTestId('repair-challenge-card')).toBeDefined();

    // 9. Progress Success Card
    expect(screen.getByTestId('progress-success-card')).toBeDefined();
  });

  it('verifies visual evidence displays basis labels 00 and 11, probabilities, and measurement counts', () => {
    render(<BellStateLearnPage />);

    // Check basis probabilities
    const basis00 = screen.getByTestId('basis-prob-00');
    expect(basis00.textContent).toContain('|00⟩');
    expect(basis00.textContent).toContain('50.0%');
    expect(basis00.textContent).toContain('P = 0.5');

    const basis11 = screen.getByTestId('basis-prob-11');
    expect(basis11.textContent).toContain('|11⟩');
    expect(basis11.textContent).toContain('50.0%');
    expect(basis11.textContent).toContain('P = 0.5');

    // Check measurement counts
    const count00 = screen.getByTestId('count-00');
    expect(count00.textContent).toContain("'00'");
    expect(count00.textContent).toContain('512 counts');
    expect(count00.textContent).toContain('50.0%');

    const count11 = screen.getByTestId('count-11');
    expect(count11.textContent).toContain("'11'");
    expect(count11.textContent).toContain('512 counts');
    expect(count11.textContent).toContain('50.0%');

    // Check status and conformance badges
    expect(screen.getByTestId('simulation-status-badge').textContent).toContain('SUCCEEDED');
    expect(screen.getByTestId('simulation-status-badge').textContent).toContain('QISKIT_AER');
    expect(screen.getByTestId('conformance-badge').textContent).toContain('PENNYLANE Conformance: PASS');

    // Check physical honesty disclaimer
    expect(screen.getAllByText(/Mathematical representation, not physical trajectory/i).length).toBeGreaterThan(0);
  });

  it('verifies Quantum Flight Recorder replays trace, isolates divergence step, and displays MIXED_SUBSYSTEM', () => {
    render(<BellStateLearnPage />);

    // Misconception signal
    expect(screen.getByTestId('misconception-code').textContent).toBe('SUPERPOSITION_VS_ENTANGLEMENT');
    expect(screen.getByTestId('first-divergence-step').textContent).toContain('Step 1');

    // Step 1 (After CNOT) should show MIXED_SUBSYSTEM labels for reduced density subsystems
    const subsystemLabel0 = screen.getByTestId('subsystem-label-0');
    expect(subsystemLabel0.textContent).toBe('MIXED_SUBSYSTEM');

    const subsystemLabel1 = screen.getByTestId('subsystem-label-1');
    expect(subsystemLabel1.textContent).toBe('MIXED_SUBSYSTEM');

    // Verify evidence keys displayed on active step 1
    const evidenceKeysContainer = screen.getByTestId('evidence-keys-list');
    expect(evidenceKeysContainer.textContent).toContain('stateTrace.1.basisProbabilities');
    expect(evidenceKeysContainer.textContent).toContain('stateTrace.1.reducedQubits');

    // Click Step 0 (After H)
    fireEvent.click(screen.getByTestId('step-btn-0'));

    // Step 0 should show PURE_SUBSYSTEM
    expect(screen.getByTestId('subsystem-label-0').textContent).toBe('PURE_SUBSYSTEM');
    expect(screen.getByTestId('subsystem-label-1').textContent).toBe('PURE_SUBSYSTEM');

    // Verify step 0 evidence key
    expect(screen.getByTestId('evidence-keys-list').textContent).toContain('stateTrace.0.basisProbabilities');
  });

  it('verifies Evidence-Bound Tutor Card provides grounded summary and numerical claims', () => {
    render(<BellStateLearnPage />);

    // Tutor summary
    const tutorSummary = screen.getByTestId('tutor-summary');
    expect(tutorSummary.textContent).toContain(
      'The Hadamard gate made qubit 0 uncertain; the CNOT then tied qubit 1 to that branch.'
    );

    // Tutor steps
    expect(screen.getByTestId('tutor-step-0').textContent).toContain('After H');
    expect(screen.getByTestId('tutor-step-0').textContent).toContain('stateTrace.0.basisProbabilities');
    expect(screen.getByTestId('tutor-step-1').textContent).toContain('After CNOT');
    expect(screen.getByTestId('tutor-step-1').textContent).toContain('stateTrace.1.basisProbabilities');

    // Numerical claims table
    const claimsTable = screen.getByTestId('numerical-claims-table');
    expect(claimsTable.textContent).toContain('P(00)=0.5');
    expect(claimsTable.textContent).toContain('stateTrace.1.basisProbabilities.00');
    expect(claimsTable.textContent).toContain('P(11)=0.5');
    expect(claimsTable.textContent).toContain('stateTrace.1.basisProbabilities.11');

    // Fallback badge and safety note
    expect(screen.getByTestId('tutor-fallback-badge').textContent).toContain('DEMO_FALLBACK');
    expect(screen.getByTestId('tutor-safety-note').textContent).toContain(
      'Explanation is grounded in this Simulation Run; it is not a hardware claim.'
    );
  });

  it('verifies Repair Challenge execution and Progress Record mastery update', () => {
    render(<BellStateLearnPage />);

    // Repair challenge card checks
    expect(screen.getByTestId('challenge-title').textContent).toBe('Restore Bell Correlation');
    expect(screen.getByTestId('challenge-prompt').textContent).toContain(
      'Repair the circuit so only 00 and 11 have non-zero ideal probability.'
    );

    // Initial attempt feedback
    expect(screen.getByTestId('repair-status-badge').textContent).toBe('REPAIR ATTEMPT PASSED');
    expect(screen.getByTestId('repair-feedback-code').textContent).toBe('BELL_SUPPORT_CORRECT');

    // Progress record checks
    expect(screen.getByTestId('total-points-display').textContent).toContain('150 pts');
    expect(screen.getByTestId('completed-modules-list').textContent).toContain('2 Modules');
    expect(screen.getByTestId('completed-modules-list').textContent).toContain('mod_bell');

    // Skill states
    expect(screen.getByTestId('skill-status-skill_create_bell').textContent).toContain('MASTERED');
    expect(screen.getByTestId('skill-status-skill_explain_correlation').textContent).toContain('PRACTICING');
  });
});
