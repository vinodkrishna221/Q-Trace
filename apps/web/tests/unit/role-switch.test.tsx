import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import BellStateLearnPage from '@/app/(app)/learn/bell-state/page';
import { useRoleStore } from '@/lib/role-store';
import { SYNTHETIC_ROLES } from '@/lib/fixtures';

describe('Role Switcher & Learner Application Shell (UX-1)', () => {
  beforeEach(() => {
    // Reset to default role (Aarav) before each test
    useRoleStore.getState().setRole('role_aarav');
  });

  it('renders all three synthetic roles (Aarav, Meera, Dr. Rao)', () => {
    render(<RoleSwitcher />);

    // Verify all 3 synthetic roles exist
    expect(screen.getByTestId('role-btn-aarav')).toBeDefined();
    expect(screen.getByTestId('role-btn-meera')).toBeDefined();
    expect(screen.getByTestId('role-btn-drrao')).toBeDefined();

    // Verify role count
    expect(SYNTHETIC_ROLES).toHaveLength(3);

    // Verify default active role is Aarav
    const activeRole = useRoleStore.getState().activeRole;
    expect(activeRole.name).toBe('Aarav');
    expect(activeRole.roleTag).toBe('BEGINNER_CSE');
    expect(activeRole.profileId).toBe('lp_aarav');
  });

  it('switches roles to Meera and Dr. Rao cleanly', () => {
    render(<RoleSwitcher />);

    // Switch to Meera
    const meeraBtn = screen.getByTestId('role-btn-meera');
    fireEvent.click(meeraBtn);

    let state = useRoleStore.getState();
    expect(state.activeRole.name).toBe('Meera');
    expect(state.activeRole.roleTag).toBe('PHYSICS_TO_CODE');
    expect(state.activeLearnerProfile?.id).toBe('lp_meera');
    expect(state.getAuthHeaders()['X-Demo-Profile-Id']).toBe('lp_meera');

    // Switch to Dr. Rao (Instructor)
    const raoBtn = screen.getByTestId('role-btn-drrao');
    fireEvent.click(raoBtn);

    state = useRoleStore.getState();
    expect(state.activeRole.name).toBe('Dr. Rao');
    expect(state.activeRole.roleType).toBe('INSTRUCTOR');
    expect(state.activeInstructorProfile?.id).toBe('instructor_rao');
    expect(state.getAuthHeaders()['X-Demo-Profile-Id']).toBe('instructor_rao');

    // Switch back to Aarav
    const aaravBtn = screen.getByTestId('role-btn-aarav');
    fireEvent.click(aaravBtn);

    state = useRoleStore.getState();
    expect(state.activeRole.name).toBe('Aarav');
    expect(state.activeLearnerProfile?.id).toBe('lp_aarav');
  });

  it('opens /learn/bell-state as Aarav without network access', () => {
    // Ensure active role is Aarav
    useRoleStore.getState().setRole('role_aarav');

    render(<BellStateLearnPage />);

    // Verify view container
    expect(screen.getByTestId('learn-bell-state-view')).toBeDefined();

    // Verify active learner is rendered as Aarav
    const learnerName = screen.getByTestId('active-learner-name');
    expect(learnerName.textContent).toBe('Aarav');

    // Verify Bell State module title
    expect(screen.getByText('From Superposition to Bell Correlation')).toBeDefined();

    // Verify Prediction Checkpoint card and options
    expect(screen.getByTestId('prediction-checkpoint-card')).toBeDefined();
    expect(screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM')).toBeDefined();
    expect(screen.getByTestId('prediction-opt-CORRELATED_00_11')).toBeDefined();

    // Verify selecting prediction option
    const option = screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM');
    fireEvent.click(option);
    expect(screen.getByText('Selected: INDEPENDENT_RANDOM')).toBeDefined();
  });
});
