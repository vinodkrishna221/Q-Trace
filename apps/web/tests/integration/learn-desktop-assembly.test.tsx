import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { render } from '../test-utils';
import LearnIndexPage from '@/app/(app)/learn/page';
import { useRoleStore } from '@/lib/role-store';

describe('Desktop Master-Detail Assembly & Right Stage Inspector Suite (DUO-11)', () => {
  beforeEach(() => {
    localStorage.clear();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the complete 3-zone desktop layout on /learn (Left Rail, Center Canvas, Right Inspector)', () => {
    render(<LearnIndexPage />);

    // 1. Overall Page Container
    expect(screen.getByTestId('learn-catalogue-page')).toBeDefined();

    // 2. 3-Zone Grid Container
    const layout = screen.getByTestId('learn-desktop-3zone-layout');
    expect(layout).toBeDefined();
    expect(layout.className).toContain('lg:grid-cols-12');

    // 3. Zone 1: Left Rail (3 cols)
    const leftRail = screen.getByTestId('left-quest-rail');
    expect(leftRail).toBeDefined();

    // 4. Zone 2: Center Serpentine Canvas (6 cols)
    const centerCanvas = screen.getByTestId('serpentine-canvas');
    expect(centerCanvas).toBeDefined();

    // 5. Zone 3: Right Stage Inspector (3 cols)
    const rightInspector = screen.getByTestId('stage-inspector-panel');
    expect(rightInspector).toBeDefined();
  });

  it('renders Left Rail daily calibration quests, cohort benchmark, and observer tip cards', () => {
    render(<LearnIndexPage />);

    const leftRail = screen.getByTestId('left-quest-rail');

    // 1. Daily Calibration Quests Card
    const questsCard = within(leftRail).getByTestId('daily-quests-card');
    expect(questsCard).toBeDefined();
    expect(within(questsCard).getByText(/Daily Calibration Quests/i)).toBeDefined();
    expect(within(questsCard).getByText('Create 1 Superposition')).toBeDefined();
    expect(within(questsCard).getByText('Solve 1 Repair Challenge')).toBeDefined();
    expect(within(questsCard).getByText('Maintain >90% Fidelity')).toBeDefined();

    // 2. Cohort Benchmark Card
    const cohortCard = within(leftRail).getByTestId('cohort-benchmark-card');
    expect(cohortCard).toBeDefined();
    expect(within(cohortCard).getByText(/Cohort Benchmark/i)).toBeDefined();
    expect(within(cohortCard).getByText(/Superconducting League: You #3/i)).toBeDefined();
    expect(within(cohortCard).getByText('Dr. Rao')).toBeDefined();
    expect(within(cohortCard).getByText('Meera')).toBeDefined();
    expect(within(cohortCard).getAllByText(/You/i).length).toBeGreaterThan(0);
    expect(within(cohortCard).getByText('Alex')).toBeDefined();

    // 3. Observer Tip Card
    const observerCard = within(leftRail).getByTestId('observer-tip-card');
    expect(observerCard).toBeDefined();
    expect(within(observerCard).getByText(/OBSERVER TIP/i)).toBeDefined();
    expect(within(observerCard).getByText(/Remember: H is its own inverse! H·H = I/i)).toBeDefined();
    expect(within(observerCard).getByText(/— Quantum Observer/i)).toBeDefined();
  });

  it('reactively updates the Right Inspector telemetry without navigation when a ChamberNode is clicked', () => {
    render(<LearnIndexPage />);

    const inspector = screen.getByTestId('stage-inspector-panel');

    // Initial state: Inspector shows default active stage
    const initialTitle = within(inspector).getByTestId('inspector-stage-title').textContent;
    expect(initialTitle).toBeDefined();

    // Verify initial telemetry items
    expect(within(inspector).getByTestId('inspector-telemetry-grid')).toBeDefined();
    expect(within(inspector).getByTestId('enter-chamber-button')).toBeDefined();

    // Click ChamberNode 2 (Pauli-X Gate)
    const xGateNode = screen.getByTestId('chamber-node-stage_1_2_x_gate');
    expect(xGateNode).toBeDefined();
    fireEvent.click(xGateNode);

    // Inspector reactively updates to Pauli-X stage title without page reload
    const updatedTitle = within(inspector).getByTestId('inspector-stage-title');
    expect(updatedTitle.textContent).toContain('The Pauli-X Gate: Quantum Bit Flip');

    // Verify updated telemetry values
    expect(within(inspector).getByText(/~4 min/i)).toBeDefined();
    expect(within(inspector).getByText(/\+30 Joules/i)).toBeDefined();

    // Click ChamberNode 3 (Hadamard Gate)
    const hadamardNode = screen.getByTestId('chamber-node-stage_1_3_hadamard');
    expect(hadamardNode).toBeDefined();
    fireEvent.click(hadamardNode);

    // Inspector reactively updates to Hadamard
    const hadamardTitle = within(inspector).getByTestId('inspector-stage-title');
    expect(hadamardTitle.textContent).toContain('The Hadamard Gate: Superposition & Inversion');
    expect(within(inspector).getByText(/\+35 Joules/i)).toBeDefined();
  });

  it('renders Qiskit Aer code snippet and Enter Chamber action button in the Right Inspector', () => {
    render(<LearnIndexPage />);

    const inspector = screen.getByTestId('stage-inspector-panel');

    // Qiskit Preview Block
    const qiskitPreview = within(inspector).getByTestId('inspector-qiskit-preview');
    expect(qiskitPreview).toBeDefined();
    expect(within(qiskitPreview).getByText(/Qiskit Aer Runtime Snippet/i)).toBeDefined();
    expect(within(qiskitPreview).getByText(/1024 shots/i)).toBeDefined();
    expect(qiskitPreview.textContent).toContain('from qiskit import QuantumCircuit');

    // Scientific Honesty Callout
    expect(within(inspector).getByText(/Mathematical representation, not physical trajectory/i)).toBeDefined();

    // Enter Chamber Action Button
    const enterBtn = within(inspector).getByTestId('enter-chamber-button');
    expect(enterBtn).toBeDefined();
    expect(within(enterBtn).getByText('ENTER CHAMBER')).toBeDefined();
    expect(within(inspector).getByText(/\[Press ↵ to Launch\]/i)).toBeDefined();
  });

  it('preserves existing data-testid attributes for backward compatibility (learning-guided-prompt, learn-sidebar)', () => {
    render(<LearnIndexPage />);

    // 1. Guided Prompt presence & directive texts
    const prompt = screen.getByTestId('learning-guided-prompt');
    expect(prompt).toBeDefined();
    expect(within(prompt).getByText(/Pedagogical Directive · Sequential Mastery/i)).toBeDefined();
    expect(within(prompt).getByText(/Step-by-Step Flow/i)).toBeDefined();
    expect(within(prompt).getByText(/Step-by-Step Progression/i)).toBeDefined();
    expect(within(prompt).getByText(/Follow the sequential progression below/i)).toBeDefined();

    // 2. Stepper controls on /learn
    expect(within(prompt).getByText(/Step 1 of 3 in focus/i)).toBeDefined();
    const nextBtn = screen.getByRole('button', { name: /Next Step/i }) as HTMLButtonElement;
    expect(nextBtn).toBeDefined();

    // 3. LearnSidebar presence & benchmark / roadmap content
    const sidebar = screen.getByTestId('learn-sidebar');
    expect(sidebar).toBeDefined();
    expect(within(sidebar).getByText('Bell State Correlation')).toBeDefined();
    expect(within(sidebar).getByText('PRIMARY BENCHMARK')).toBeDefined();
    expect(within(sidebar).getByText('Future Algorithms')).toBeDefined();
    expect(within(sidebar).getByText('Quantum Teleportation')).toBeDefined();
  });
});
