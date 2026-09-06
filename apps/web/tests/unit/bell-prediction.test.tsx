import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { render } from '../test-utils';
import BellStateLearnPage from '@/app/(app)/learn/bell-state/page';
import { useRoleStore } from '@/lib/role-store';
import { usePredictionStore } from '@/lib/prediction-store';
import { DEMO_MODULES } from '@/lib/fixtures';

describe('Bell Module & Prediction Checkpoint (UX-2)', () => {
  beforeEach(() => {
    // Reset stores and localStorage before each test
    localStorage.clear();
    usePredictionStore.getState().resetAllDrafts();
    useRoleStore.getState().setRole('role_aarav');
  });

  it('renders the Bell Module page with concept blocks and formulas', () => {
    render(<BellStateLearnPage />);

    const moduleData = DEMO_MODULES['bell-state'];

    // Verify view container and title
    expect(screen.getByTestId('learn-bell-state-view')).toBeDefined();
    expect(screen.getByText(moduleData.title)).toBeDefined();

    // Verify concept blocks component exists
    expect(screen.getByTestId('concept-blocks-card')).toBeDefined();

    // Verify text block
    expect(screen.getByTestId('concept-text-0')).toBeDefined();
    expect(screen.getByText(/Apply a Hadamard gate/i)).toBeDefined();

    // Verify callout block with caution styling
    expect(screen.getByTestId('concept-callout-1')).toBeDefined();
    expect(screen.getByText(/Random outcomes can still be perfectly correlated/i)).toBeDefined();

    // Verify formula block
    expect(screen.getByTestId('concept-formula-2')).toBeDefined();
    expect(screen.getByText(/\\Phi\^/i)).toBeDefined();
  });

  it('renders prior-knowledge path badge correctly for Aarav (Foundations) and Meera (Theory to Code)', () => {
    // Aarav: Foundations
    useRoleStore.getState().setRole('role_aarav');
    const { unmount } = render(<BellStateLearnPage />);

    expect(screen.getByTestId('prior-knowledge-path-badge')).toBeDefined();
    expect(screen.getByTestId('entry-band-badge').textContent).toContain('Foundations Path');
    expect(screen.getByTestId('role-tag-badge').textContent).toBe('BEGINNER_CSE');
    expect(screen.getByTestId('path-recommendation-reason').textContent).toContain(
      'Complete the Bell-state lab after the superposition checkpoint.'
    );

    // Prior knowledge chips for Aarav (only Python is true)
    expect(screen.getByTestId('prior-chip-python').className).toContain('text-emerald-300');
    expect(screen.getByTestId('prior-chip-linalg').className).toContain('text-zinc-500');
    expect(screen.getByTestId('prior-chip-theory').className).toContain('text-zinc-500');

    unmount();

    // Meera: Theory to Code
    useRoleStore.getState().setRole('role_meera');
    render(<BellStateLearnPage />);

    expect(screen.getByTestId('entry-band-badge').textContent).toContain('Theory → Code Path');
    expect(screen.getByTestId('role-tag-badge').textContent).toBe('PHYSICS_TO_CODE');
    expect(screen.getByTestId('path-recommendation-reason').textContent).toContain(
      'Fast-track directly to Bell correlation and Qiskit verification.'
    );

    // Prior knowledge chips for Meera (Python, Linear Algebra, Quantum Theory are true)
    expect(screen.getByTestId('prior-chip-python').className).toContain('text-emerald-300');
    expect(screen.getByTestId('prior-chip-linalg').className).toContain('text-emerald-300');
    expect(screen.getByTestId('prior-chip-theory').className).toContain('text-emerald-300');
  });

  it('renders all Prediction Checkpoint options and starts with Run disabled', () => {
    render(<BellStateLearnPage />);

    const checkpointCard = screen.getByTestId('prediction-checkpoint-card');
    expect(checkpointCard).toBeDefined();

    // Check all 4 options are rendered
    expect(screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM')).toBeDefined();
    expect(screen.getByTestId('prediction-opt-CORRELATED_00_11')).toBeDefined();
    expect(screen.getByTestId('prediction-opt-ALWAYS_00')).toBeDefined();
    expect(screen.getByTestId('prediction-opt-ALWAYS_11')).toBeDefined();

    // Check initial state: no prediction selected
    expect(screen.getByTestId('selected-prediction-label').textContent).toContain(
      'No prediction recorded yet'
    );

    // Run / Advance button is disabled
    const confirmBtn = screen.getByTestId('confirm-prediction-btn') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);
  });

  it('selects INDEPENDENT_RANDOM, reloads the route and shows the saved choice before Run is enabled', () => {
    // 1. Initial mount as Aarav
    useRoleStore.getState().setRole('role_aarav');
    const firstRender = render(<BellStateLearnPage />);

    // Verify initial button is disabled
    let confirmBtn = screen.getByTestId('confirm-prediction-btn') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    // 2. Select INDEPENDENT_RANDOM (Aarav's hero demo misconception)
    const independentOption = screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM');
    fireEvent.click(independentOption);

    // Verify UI reflects selection and draft is saved
    expect(screen.getByTestId('selected-prediction-label').textContent).toContain('INDEPENDENT_RANDOM');
    expect(screen.getByTestId('prediction-saved-indicator')).toBeDefined();

    // Verify Run button is now enabled
    confirmBtn = screen.getByTestId('confirm-prediction-btn') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);

    // Verify store draft state directly
    const draft = usePredictionStore.getState().getPredictionDraft('lp_aarav', 'mod_bell');
    expect(draft).not.toBeNull();
    expect(draft?.answer).toBe('INDEPENDENT_RANDOM');
    expect(draft?.checkpointId).toBe('pc_bell_outcomes');

    // 3. Simulate route reload / unmount and fresh remount
    firstRender.unmount();
    cleanup();

    // 4. Remount the page (simulating route reload)
    render(<BellStateLearnPage />);

    // Verify the saved choice is restored immediately
    expect(screen.getByTestId('selected-prediction-label').textContent).toContain('INDEPENDENT_RANDOM');
    expect(screen.getByTestId('prediction-saved-indicator')).toBeDefined();

    // Verify the Run / Advance button is enabled from the restored draft
    confirmBtn = screen.getByTestId('confirm-prediction-btn') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);

    // Click confirm to lock prediction
    fireEvent.click(confirmBtn);
    expect(confirmBtn.textContent).toContain('Prediction Locked');
  });

  it('isolates persisted drafts per learner/module cleanly', () => {
    // Aarav selects INDEPENDENT_RANDOM
    useRoleStore.getState().setRole('role_aarav');
    const { unmount } = render(<BellStateLearnPage />);

    fireEvent.click(screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM'));
    expect(screen.getByTestId('selected-prediction-label').textContent).toContain('INDEPENDENT_RANDOM');

    unmount();
    cleanup();

    // Switch to Meera - Meera has no draft saved yet
    useRoleStore.getState().setRole('role_meera');
    const meeraRender = render(<BellStateLearnPage />);

    expect(screen.getByTestId('selected-prediction-label').textContent).toContain('No prediction recorded yet');
    let confirmBtn = screen.getByTestId('confirm-prediction-btn') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    // Meera selects CORRELATED_00_11
    fireEvent.click(screen.getByTestId('prediction-opt-CORRELATED_00_11'));
    expect(screen.getByTestId('selected-prediction-label').textContent).toContain('CORRELATED_00_11');
    confirmBtn = screen.getByTestId('confirm-prediction-btn') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);

    meeraRender.unmount();
    cleanup();

    // Switch back to Aarav - Aarav's draft INDEPENDENT_RANDOM is still intact
    useRoleStore.getState().setRole('role_aarav');
    render(<BellStateLearnPage />);

    expect(screen.getByTestId('selected-prediction-label').textContent).toContain('INDEPENDENT_RANDOM');
    confirmBtn = screen.getByTestId('confirm-prediction-btn') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);
  });

  it('allows resetting / clearing the prediction draft', () => {
    useRoleStore.getState().setRole('role_aarav');
    render(<BellStateLearnPage />);

    // Select an option
    fireEvent.click(screen.getByTestId('prediction-opt-ALWAYS_00'));
    expect(screen.getByTestId('selected-prediction-label').textContent).toContain('ALWAYS_00');

    // Click reset button
    const clearBtn = screen.getByTestId('clear-prediction-btn');
    fireEvent.click(clearBtn);

    // Prediction is cleared and Run button is disabled again
    expect(screen.getByTestId('selected-prediction-label').textContent).toContain('No prediction recorded yet');
    const confirmBtn = screen.getByTestId('confirm-prediction-btn') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    // Store is cleared
    const draft = usePredictionStore.getState().getPredictionDraft('lp_aarav', 'mod_bell');
    expect(draft).toBeNull();
  });
});
