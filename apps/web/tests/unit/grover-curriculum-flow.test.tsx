import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { render } from '../test-utils';
import LearnIndexPage from '@/app/(app)/learn/page';
import { UNIT_DEFINITIONS, getUnitForStage } from '@/lib/curriculum/unit-definitions';
import { RightStageInspector } from '@/features/learning/components/right-stage-inspector';
import { module2Unit21Stages } from '@/lib/curriculum/all-stages';
import { useRoleStore } from '@/lib/role-store';

describe('Grover Curriculum Navigation & In-Situ Concept Flow Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Unit 1, Unit 2, and Unit 3 selector tabs above the 3-zone layout', () => {
    render(<LearnIndexPage />);

    // Verify unit banner container exists outside and above the 3-zone grid
    const bannerContainer = screen.getByTestId('learn-unit-banner-container');
    expect(bannerContainer).toBeDefined();

    // Verify all 4 tabs exist: Unit 1, Unit 2, Unit 3, All Units
    expect(screen.getByTestId('unit-tab-1')).toBeDefined();
    expect(screen.getByTestId('unit-tab-2')).toBeDefined();
    expect(screen.getByTestId('unit-tab-3')).toBeDefined();
    expect(screen.getByTestId('unit-tab-all')).toBeDefined();

    // Verify tab labels scoped to their testids
    expect(within(screen.getByTestId('unit-tab-1')).getByText(/The Quantum Compass/i)).toBeDefined();
    expect(within(screen.getByTestId('unit-tab-2')).getByText(/Entanglement & Bell States/i)).toBeDefined();
    expect(within(screen.getByTestId('unit-tab-3')).getByText(/Grover's Algorithm/i)).toBeDefined();
    expect(within(screen.getByTestId('unit-tab-all')).getByText('All Units')).toBeDefined();
  });

  it('switches to Unit 3: Grover Search Algorithm when Unit 3 tab is clicked', () => {
    render(<LearnIndexPage />);

    const unit3Tab = screen.getByTestId('unit-tab-3');
    fireEvent.click(unit3Tab);

    // Banner updates to Unit 3
    const banner = screen.getByTestId('unit-section-banner');
    expect(within(banner).getByText("UNIT 3: GROVER'S SEARCH ALGORITHM")).toBeDefined();
    expect(within(banner).getByText('Quantum Oracle Marking & Amplitude Amplification')).toBeDefined();
    expect(within(banner).getByText('0/9 Completed')).toBeDefined();

    // Inspector updates to first stage of Unit 3 (The Oracle)
    const inspector = screen.getByTestId('stage-inspector-panel');
    expect(within(inspector).getByTestId('inspector-stage-title').textContent).toContain('The Oracle');
  });

  it('navigates to /learn/oracle for Oracle concept stage', () => {
    const oracleStage = module2Unit21Stages.find((s) => s.id === 'mod2_grover_oracle_concept')!;
    expect(oracleStage).toBeDefined();

    const handleEnter = vi.fn();
    render(
      <RightStageInspector
        selectedStage={oracleStage}
        onEnterChamber={handleEnter}
      />
    );

    const inspector = screen.getByTestId('stage-inspector-panel');

    // Title and Concept Summary
    expect(within(inspector).getByTestId('inspector-stage-title').textContent).toContain('The Oracle');
    expect(within(inspector).getByTestId('inspector-concept-summary')).toBeDefined();
    expect(within(inspector).getAllByText(/phase flip/i).length).toBeGreaterThan(0);

    // Action button exists with text "ENTER CHAMBER" linking to /learn/oracle
    const enterBtn = within(inspector).getByTestId('enter-chamber-button');
    expect(enterBtn).toBeDefined();
    expect(within(enterBtn).getByText('ENTER CHAMBER')).toBeDefined();

    const link = enterBtn.closest('a');
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/learn/oracle');
  });

  it('supports in-situ completion for stages without a dedicated route', () => {
    const unroutedStage = {
      ...module2Unit21Stages[0],
      id: 'custom_concept_stage',
      lessonId: 'custom_concept_stage',
      unitId: 'unit_custom',
      route: undefined,
    };

    const handleEnter = vi.fn();
    render(
      <RightStageInspector
        selectedStage={unroutedStage}
        onEnterChamber={handleEnter}
      />
    );

    const inspector = screen.getByTestId('stage-inspector-panel');
    const enterBtn = within(inspector).getByTestId('enter-chamber-button');
    expect(within(enterBtn).getByText(/COMPLETE CONCEPT/i)).toBeDefined();

    fireEvent.click(enterBtn);
    expect(handleEnter).toHaveBeenCalledWith(unroutedStage);
    expect(within(enterBtn).getByText(/CONCEPT GROUNDED/i)).toBeDefined();
  });

  it('renders interactive CCX truth table for Toffoli stage', () => {
    const toffoliStage = module2Unit21Stages.find((s) => s.id === 'mod2_toffoli_ccx')!;
    expect(toffoliStage).toBeDefined();

    render(<RightStageInspector selectedStage={toffoliStage} />);

    const inspector = screen.getByTestId('stage-inspector-panel');
    const truthTable = within(inspector).getByTestId('inspector-truth-table');
    expect(truthTable).toBeDefined();
    expect(within(truthTable).getByText(/CCX \(Toffoli\) Truth Table/i)).toBeDefined();
    expect(within(truthTable).getAllByText('|110⟩').length).toBe(2);
    expect(within(truthTable).getAllByText('|111⟩').length).toBe(2);
  });

  it('renders quadratic speedup matrix for Grover speedup stage', () => {
    const speedupStage = module2Unit21Stages.find((s) => s.id === 'mod2_grover_speedup')!;
    expect(speedupStage).toBeDefined();

    render(<RightStageInspector selectedStage={speedupStage} />);

    const inspector = screen.getByTestId('stage-inspector-panel');
    const speedup = within(inspector).getByTestId('inspector-speedup-table');
    expect(speedup).toBeDefined();
    expect(within(speedup).getByText(/Speedup Matrix: O\(√N\) vs Classical O\(N\)/i)).toBeDefined();
    expect(within(speedup).getByText('1024')).toBeDefined();
  });

  it('renders interactive prediction checkpoint with feedback in RightStageInspector', () => {
    const iterStage = module2Unit21Stages.find((s) => s.id === 'pc_grover_iterations')!;
    expect(iterStage).toBeDefined();

    render(<RightStageInspector selectedStage={iterStage} />);

    const inspector = screen.getByTestId('stage-inspector-panel');
    const checkpoint = within(inspector).getByTestId('inspector-checkpoint-preview');
    expect(checkpoint).toBeDefined();

    // Select the correct option (2 iterations)
    const opt2 = within(checkpoint).getByText(/2 iterations/i);
    fireEvent.click(opt2);

    // Explanatory feedback is revealed
    expect(within(checkpoint).getByText(/94.5%/i)).toBeDefined();
  });

  it('routes to dedicated learning chambers for Grover stages', () => {
    const ccxLab = module2Unit21Stages.find((s) => s.id === 'mod2_ccx_lab')!;
    expect(ccxLab).toBeDefined();

    render(<RightStageInspector selectedStage={ccxLab} />);

    const inspector = screen.getByTestId('stage-inspector-panel');
    const enterBtn = within(inspector).getByTestId('enter-chamber-button');
    expect(enterBtn).toBeDefined();
    expect(within(enterBtn).getByText('ENTER CHAMBER')).toBeDefined();

    // Link target is /learn/oracle
    const link = enterBtn.closest('a');
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/learn/oracle');

    // Full Grover lab routes to /learn/grover
    const fullGroverLab = module2Unit21Stages.find((s) => s.id === 'mod2_full_grover_lab')!;
    expect(fullGroverLab).toBeDefined();
    expect(fullGroverLab.route).toBe('/learn/grover');
  });

  it('maps stage IDs to correct units via getUnitForStage helper', () => {
    expect(getUnitForStage({ id: 'stage_1_1_compass' } as any)).toBe(1);
    expect(getUnitForStage({ id: 'bell-state' } as any)).toBe(2);
    expect(getUnitForStage({ id: 'mod1_multi_qubit_register' } as any)).toBe(2);
    expect(getUnitForStage({ id: 'mod2_grover_oracle_concept' } as any)).toBe(3);
    expect(getUnitForStage({ id: 'pc_grover_iterations' } as any)).toBe(3);
  });
});
