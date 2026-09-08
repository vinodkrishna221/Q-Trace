import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import LearnIndexPage from '@/app/(app)/learn/page';
import SuperpositionLearnPage from '@/app/(app)/learn/superposition/page';
import MeasurementLearnPage from '@/app/(app)/learn/measurement/page';
import { BlochSphereView } from '@/features/evidence/bloch-sphere-view';
import { ProbabilityHistogramView } from '@/features/evidence/probability-histogram-view';
import { useRoleStore } from '@/lib/role-store';
import { usePredictionStore } from '@/lib/prediction-store';
import { DEMO_SIMULATION_RUN } from '@/lib/fixtures';

describe('Learning Paths & Visual Evidence Suite (UX-6)', () => {
  beforeEach(() => {
    localStorage.clear();
    usePredictionStore.getState().resetAllDrafts();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the complete three-Module catalogue with titles, levels, and estimated durations', () => {
    render(<LearnIndexPage />);

    expect(screen.getByTestId('learn-catalogue-page')).toBeDefined();
    expect(screen.getByTestId('modules-catalogue-grid')).toBeDefined();

    // 1. Module 1: Superposition
    expect(screen.getByTestId('module-card-superposition')).toBeDefined();
    expect(screen.getByText('Qubits and Superposition')).toBeDefined();
    expect(screen.getByText('14 min')).toBeDefined();

    // 2. Module 2: Measurement
    expect(screen.getByTestId('module-card-measurement')).toBeDefined();
    expect(screen.getByText('Measurement and Probability')).toBeDefined();
    expect(screen.getByText('12 min')).toBeDefined();

    // 3. Module 3: Bell State (Hero Lab)
    expect(screen.getByTestId('module-card-bell-state')).toBeDefined();
    expect(screen.getByText('From Superposition to Bell Correlation')).toBeDefined();
    expect(screen.getByText('18 min')).toBeDefined();
  });

  it('renders Aarav entry differences: FOUNDATIONS entry band, 3-module sequence, and structured recommendation', () => {
    useRoleStore.getState().setRole('role_aarav');
    render(<LearnIndexPage />);

    expect(screen.getByTestId('catalogue-learner-name').textContent).toBe('Aarav');
    expect(screen.getByTestId('entry-band-badge').textContent).toBe('FOUNDATIONS');
    expect(screen.getByTestId('path-mode-badge').textContent).toContain('Foundations Track (3 Modules)');
    expect(screen.getByTestId('path-recommendation-reason').textContent).toBe(
      'Complete the Bell-state lab after the superposition checkpoint.'
    );

    // Step indicators
    expect(screen.getByTestId('step-badge-superposition').textContent).toContain('STEP 1 OF 3');
    expect(screen.getByTestId('step-badge-measurement').textContent).toContain('STEP 2 OF 3');
    expect(screen.getByTestId('hero-module-badge').textContent).toContain('STEP 3');
  });

  it('renders Meera entry differences: THEORY_TO_CODE entry band, fast-track focus, and theory credit badges', () => {
    useRoleStore.getState().setRole('role_meera');
    render(<LearnIndexPage />);

    expect(screen.getByTestId('catalogue-learner-name').textContent).toBe('Meera');
    expect(screen.getByTestId('entry-band-badge').textContent).toBe('THEORY_TO_CODE');
    expect(screen.getByTestId('path-mode-badge').textContent).toContain('Theory-to-Code Track (1 Module)');
    expect(screen.getByTestId('path-recommendation-reason').textContent).toBe(
      'Fast-track directly to Bell correlation and Qiskit verification.'
    );

    // Fast-track & theory credited badges
    expect(screen.getByTestId('waived-badge-superposition').textContent).toContain('THEORY CREDITED');
    expect(screen.getByTestId('waived-badge-measurement').textContent).toContain('THEORY CREDITED');
    expect(screen.getByTestId('hero-module-badge').textContent).toContain('FAST-TRACK FOCUS');
  });

  it('renders scientifically honest Bloch subsystem view with MIXED_SUBSYSTEM and PURE_SUBSYSTEM labels', () => {
    const mixedReducedQubits = [
      { qubit: 0, bloch: { x: 0.0, y: 0.0, z: 0.0 }, purity: 0.5, label: 'MIXED_SUBSYSTEM' as const },
      { qubit: 1, bloch: { x: 0.0, y: 0.0, z: 0.0 }, purity: 0.5, label: 'MIXED_SUBSYSTEM' as const },
    ];

    const { rerender } = render(
      <BlochSphereView reducedQubits={mixedReducedQubits} stepLabel="After CNOT (Entangled Bell State)" />
    );

    // 1. Verify Mixed Subsystem (Entangled State)
    expect(screen.getByTestId('bloch-sphere-card')).toBeDefined();
    expect(screen.getByTestId('active-subsystem-label').textContent).toBe('MIXED_SUBSYSTEM');
    expect(screen.getByTestId('purity-value').textContent).toBe('0.500');
    expect(screen.getByTestId('coord-x').textContent).toBe('0.000');
    expect(screen.getByTestId('coord-y').textContent).toBe('0.000');
    expect(screen.getByTestId('coord-z').textContent).toBe('0.000');
    expect(screen.getByTestId('subsystem-explanation-box').textContent).toContain('Entangled Subsystem');
    expect(screen.getByText(/Mathematical representation, not physical trajectory/i)).toBeDefined();

    // 2. Verify Pure Subsystem (Separable State)
    const pureReducedQubits = [
      { qubit: 0, bloch: { x: 1.0, y: 0.0, z: 0.0 }, purity: 1.0, label: 'PURE_SUBSYSTEM' as const },
      { qubit: 1, bloch: { x: 0.0, y: 0.0, z: 1.0 }, purity: 1.0, label: 'PURE_SUBSYSTEM' as const },
    ];

    rerender(
      <BlochSphereView reducedQubits={pureReducedQubits} stepLabel="After Hadamard Gate" />
    );

    expect(screen.getByTestId('active-subsystem-label').textContent).toBe('PURE_SUBSYSTEM');
    expect(screen.getByTestId('purity-value').textContent).toBe('1.000');
    expect(screen.getByTestId('coord-x').textContent).toBe('1.000');
    expect(screen.getByTestId('subsystem-explanation-box').textContent).toContain('Separable Pure State');
  });

  it('renders functional static fallback when Plotly/dynamic render is disabled', () => {
    render(
      <ProbabilityHistogramView
        simulationRun={DEMO_SIMULATION_RUN}
        disablePlotly={true}
      />
    );

    // 1. Static Table is visible
    expect(screen.getByTestId('static-evidence-table')).toBeDefined();
    expect(screen.getByText('State Evidence Data Table (Static Fallback)')).toBeDefined();
    const activeBadges = screen.getAllByText('ACTIVE SUPPORT');
    expect(activeBadges.length).toBeGreaterThan(0);

    // 2. Static SVG projection is visible in BlochSphereView
    expect(screen.getByTestId('bloch-static-fallback')).toBeDefined();
    expect(screen.getByText('Static SVG Orthographic Projection')).toBeDefined();

    // 3. Toggle back and forth
    const toggleBtn = screen.getByTestId('toggle-plotly-fallback');
    fireEvent.click(toggleBtn);

    // Dynamic view rendered
    expect(screen.getByTestId('bloch-dynamic-render')).toBeDefined();

    // Toggle back to static fallback
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('bloch-static-fallback')).toBeDefined();
  });

  it('renders Superposition and Measurement module routes with correct pedagogical math and links', () => {
    // Superposition Page
    const { unmount } = render(<SuperpositionLearnPage />);
    expect(screen.getByTestId('learn-superposition-view')).toBeDefined();
    expect(screen.getByText(/Qubits and Superposition/i)).toBeDefined();
    expect(screen.getByTestId('single-qubit-preview-card')).toBeDefined();
    expect(screen.getByTestId('next-module-btn')).toBeDefined();
    unmount();

    // Measurement Page
    render(<MeasurementLearnPage />);
    expect(screen.getByTestId('learn-measurement-view')).toBeDefined();
    expect(screen.getByText(/Measurement and Probability/i)).toBeDefined();
    expect(screen.getByTestId('measurement-preview-card')).toBeDefined();
    expect(screen.getByTestId('next-module-btn')).toBeDefined();
  });
});
