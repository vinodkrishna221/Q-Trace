import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { render } from '../test-utils';
import LearnIndexPage from '@/app/(app)/learn/page';
import { useRoleStore } from '@/lib/role-store';

describe('Mobile Sinusoidal Arc, Spring Bottom Sheet & Bottom Nav Suite (DUO-12)', () => {
  beforeEach(() => {
    localStorage.clear();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the fixed bottom 4-tab navigation bar with all 4 tabs on mobile', () => {
    render(<LearnIndexPage />);

    const bottomNav = screen.getByTestId('mobile-bottom-nav');
    expect(bottomNav).toBeDefined();

    // 4 Tabs: Learn, Practice, Quests, Profile
    const learnTab = within(bottomNav).getByTestId('tab-learn');
    expect(learnTab).toBeDefined();
    expect(learnTab.textContent).toContain('Learn');

    const practiceTab = within(bottomNav).getByTestId('tab-practice');
    expect(practiceTab).toBeDefined();
    expect(practiceTab.textContent).toContain('Practice');

    const questsTab = within(bottomNav).getByTestId('tab-quests');
    expect(questsTab).toBeDefined();
    expect(questsTab.textContent).toContain('Quests');

    const profileTab = within(bottomNav).getByTestId('tab-profile');
    expect(profileTab).toBeDefined();
    expect(profileTab.textContent).toContain('Profile');
  });

  it('renders serpentine chamber nodes with mobile 52px diameter and opens spring bottom sheet on node tap', () => {
    render(<LearnIndexPage />);

    // Select Chamber Node 2 (Pauli-X)
    const xGateNode = screen.getByTestId('chamber-node-stage_1_2_x_gate');
    expect(xGateNode).toBeDefined();
    expect(xGateNode.className).toContain('w-[52px]');
    expect(xGateNode.className).toContain('h-[52px]');

    // Tap node to open bottom sheet
    fireEvent.click(xGateNode);

    // Spring Bottom Sheet opens
    const bottomSheet = screen.getByTestId('stage-bottom-sheet');
    expect(bottomSheet).toBeDefined();
    expect(bottomSheet.className).toContain('h-[75vh]');

    // Sheet displays stage title
    const sheetTitle = screen.getByTestId('sheet-stage-title');
    expect(sheetTitle.textContent).toContain('The Pauli-X Gate: Quantum Bit Flip');

    // Drag handle is accessible
    const dragHandle = screen.getByTestId('sheet-drag-handle');
    expect(dragHandle).toBeDefined();

    // Enter Chamber CTA button is present
    const enterBtn = screen.getByTestId('mobile-enter-chamber-btn');
    expect(enterBtn).toBeDefined();
    expect(enterBtn.textContent).toContain('ENTER CHAMBER');
    expect(enterBtn.className).toContain('h-12');
  });

  it('allows dismissing bottom sheet via drag handle click or close button', () => {
    render(<LearnIndexPage />);

    // Click node to open
    const node = screen.getByTestId('chamber-node-stage_1_3_hadamard');
    fireEvent.click(node);

    const sheetWrapper = screen.getByTestId('stage-bottom-sheet-wrapper');
    expect(sheetWrapper.className).toContain('opacity-100');

    // Click close button
    const closeBtn = screen.getByTestId('bottom-sheet-close-btn');
    fireEvent.click(closeBtn);

    expect(sheetWrapper.className).toContain('opacity-0');
    expect(sheetWrapper.className).toContain('pointer-events-none');
  });

  it('preserves existing canonical slug routes and acceptance test data-testids', () => {
    render(<LearnIndexPage />);

    // Guided prompt
    expect(screen.getByTestId('learning-guided-prompt')).toBeDefined();

    // Module catalogue
    expect(screen.getByTestId('modules-catalogue-grid')).toBeDefined();
    expect(screen.getByTestId('module-card-superposition')).toBeDefined();
    expect(screen.getByTestId('module-card-measurement')).toBeDefined();
    expect(screen.getByTestId('module-card-bell-state')).toBeDefined();

    // Launch buttons to canonical routes
    expect(screen.getByTestId('launch-module-superposition')).toBeDefined();
    expect(screen.getByTestId('launch-module-measurement')).toBeDefined();
    expect(screen.getByTestId('launch-module-bell-state')).toBeDefined();
  });
});
