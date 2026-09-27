import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import { UnitSectionBanner } from '@/features/learning/components/unit-section-banner';
import { UnitGuidebookModal } from '@/features/learning/components/unit-guidebook-modal';

describe('UnitSectionBanner & UnitGuidebookModal Component Suite (DUO-2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('UnitSectionBanner Rendering', () => {
    it('renders unit title, subtitle, and progress metrics with default props', () => {
      render(<UnitSectionBanner />);

      // Banner card
      const banner = screen.getByTestId('unit-section-banner');
      expect(banner).toBeDefined();

      // Title & Subtitle
      expect(screen.getByText('UNIT 1: THE QUANTUM COMPASS')).toBeDefined();
      expect(screen.getByText('Single-Qubit Rotations & Superposition')).toBeDefined();

      // Progress count & percentage
      const count = screen.getByTestId('unit-progress-count');
      expect(count.textContent).toBe('3/6 Completed');
      expect(screen.getByText('50%')).toBeDefined();

      // Progress bar
      const progressBar = screen.getByTestId('unit-progress-bar');
      expect(progressBar.getAttribute('aria-valuenow')).toBe('50');

      // Accent rail & Guidebook button
      expect(screen.getByTestId('unit-accent-rail')).toBeDefined();
      expect(screen.getByTestId('unit-guidebook-button')).toBeDefined();
      expect(screen.getByText(/Guidebook 📖/i)).toBeDefined();
    });

    it('supports custom unit numbers, titles, and completion counts', () => {
      render(
        <UnitSectionBanner
          unitNumber={2}
          unitTitle="ENTANGLEMENT & BELL STATES"
          subtitle="Non-local Quantum Correlations"
          completedCount={1}
          totalCount={4}
          accentRailColor="rgb(74, 2, 177)"
        />
      );

      expect(screen.getByText('UNIT 2: ENTANGLEMENT & BELL STATES')).toBeDefined();
      expect(screen.getByText('Non-local Quantum Correlations')).toBeDefined();

      const count = screen.getByTestId('unit-progress-count');
      expect(count.textContent).toBe('1/4 Completed');
      expect(screen.getByText('25%')).toBeDefined();

      const progressBar = screen.getByTestId('unit-progress-bar');
      expect(progressBar.getAttribute('aria-valuenow')).toBe('25');
    });

    it('clamps progress correctly at boundaries (0% and 100%)', () => {
      const { rerender } = render(
        <UnitSectionBanner completedCount={0} totalCount={5} />
      );
      expect(screen.getByText('0%')).toBeDefined();
      expect(screen.getByTestId('unit-progress-bar').getAttribute('aria-valuenow')).toBe('0');

      rerender(<UnitSectionBanner completedCount={6} totalCount={6} />);
      expect(screen.getByText('100%')).toBeDefined();
      expect(screen.getByTestId('unit-progress-bar').getAttribute('aria-valuenow')).toBe('100');
    });
  });

  describe('Guidebook Modal Interactions', () => {
    it('opens the guidebook cheatsheet modal when Guidebook button is clicked', () => {
      render(<UnitSectionBanner />);

      // Modal not initially in document
      expect(screen.queryByTestId('unit-guidebook-modal')).toBeNull();

      // Click button to open
      const button = screen.getByTestId('unit-guidebook-button');
      fireEvent.click(button);

      // Modal is now visible
      const modal = screen.getByTestId('unit-guidebook-modal');
      expect(modal).toBeDefined();
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getAllByText('UNIT 1: THE QUANTUM COMPASS').length).toBe(2);
    });

    it('calls custom onOpenGuidebook callback when provided', () => {
      const onOpenMock = vi.fn();
      render(<UnitSectionBanner onOpenGuidebook={onOpenMock} />);

      const button = screen.getByTestId('unit-guidebook-button');
      fireEvent.click(button);

      expect(onOpenMock).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('unit-guidebook-modal')).toBeDefined();
    });

    it('closes the modal when close button is clicked', () => {
      render(<UnitSectionBanner />);

      // Open modal
      fireEvent.click(screen.getByTestId('unit-guidebook-button'));
      expect(screen.getByTestId('unit-guidebook-modal')).toBeDefined();

      // Click close button
      const closeButton = screen.getByTestId('guidebook-close-button');
      fireEvent.click(closeButton);

      // Modal closed
      expect(screen.queryByTestId('unit-guidebook-modal')).toBeNull();
    });

    it('closes the modal when Escape key is pressed', () => {
      render(<UnitSectionBanner />);

      fireEvent.click(screen.getByTestId('unit-guidebook-button'));
      expect(screen.getByTestId('unit-guidebook-modal')).toBeDefined();

      // Fire Escape keydown
      fireEvent.keyDown(window, { key: 'Escape' });

      // Modal closed
      expect(screen.queryByTestId('unit-guidebook-modal')).toBeNull();
    });

    it('closes the modal when clicking outside on the backdrop', () => {
      render(<UnitSectionBanner />);

      fireEvent.click(screen.getByTestId('unit-guidebook-button'));
      expect(screen.getByTestId('unit-guidebook-modal')).toBeDefined();

      // Click backdrop
      const backdrop = screen.getByTestId('guidebook-backdrop');
      fireEvent.click(backdrop);

      // Modal closed
      expect(screen.queryByTestId('unit-guidebook-modal')).toBeNull();
    });
  });

  describe('Guidebook Content: Gate Truth Tables & Dirac Formulas', () => {
    it('renders all required single-qubit gate truth tables (X, H, Z, S, T)', () => {
      render(<UnitGuidebookModal open={true} onClose={() => {}} />);

      // Verify all 5 gates are represented
      expect(screen.getByTestId('gate-card-x')).toBeDefined();
      expect(screen.getByTestId('gate-card-h')).toBeDefined();
      expect(screen.getByTestId('gate-card-z')).toBeDefined();
      expect(screen.getByTestId('gate-card-s')).toBeDefined();
      expect(screen.getByTestId('gate-card-t')).toBeDefined();

      // Gate titles
      expect(screen.getByText('Pauli-X (NOT / Bit-Flip)')).toBeDefined();
      expect(screen.getByText('Hadamard (Superposition Creator)')).toBeDefined();
      expect(screen.getByText('Pauli-Z (Phase-Flip)')).toBeDefined();
      expect(screen.getByText('Phase Gate S (Quarter-Turn)')).toBeDefined();
      expect(screen.getByText('Phase Gate T (Eighth-Turn)')).toBeDefined();

      // Verify KaTeX math nodes are rendered
      const katexElements = document.querySelectorAll('.katex');
      expect(katexElements.length).toBeGreaterThanOrEqual(5);
    });

    it('renders Dirac notation formulas and Born rule summary', () => {
      render(<UnitGuidebookModal open={true} onClose={() => {}} />);

      // Dirac notation section
      expect(screen.getByText(/Dirac Bra-Ket Notation & Probability Formulas/i)).toBeDefined();
      expect(screen.getByText(/Statevector Superposition Definition/i)).toBeDefined();
      expect(screen.getByText(/The Born Rule & Normalization Constraint/i)).toBeDefined();
      expect(screen.getByText(/Conservation of Probability/i)).toBeDefined();
      expect(screen.getByText(/Inner Product \(Probability Overlap\)/i)).toBeDefined();

      // Basis representations
      expect(screen.getByText('Computational Z-Basis')).toBeDefined();
      expect(screen.getByText('Hadamard X-Basis')).toBeDefined();

      // Scientific honesty note
      expect(screen.getByText(/Scientific Honesty Protocol/i)).toBeDefined();
      expect(screen.getByText(/mathematical representations/i)).toBeDefined();
    });

    it('renders Bloch sphere coordinates and angle explanations', () => {
      render(<UnitGuidebookModal open={true} onClose={() => {}} />);

      expect(screen.getByText(/The Bloch Sphere: The Quantum Compass/i)).toBeDefined();
      expect(screen.getByText(/Unit Sphere Parameterization/i)).toBeDefined();
      expect(screen.getByText(/Latitude θ/i)).toBeDefined();
      expect(screen.getByText(/Longitude ϕ \(0 ≤ ϕ/i)).toBeDefined();
      expect(screen.getByText(/Equator \(50\/50 equal superposition\)/i)).toBeDefined();
    });

    it('filters sections using tab navigation buttons', () => {
      render(<UnitGuidebookModal open={true} onClose={() => {}} />);

      // Initially all sections exist
      expect(screen.getByTestId('section-gates')).toBeDefined();
      expect(screen.getByTestId('section-dirac')).toBeDefined();
      expect(screen.getByTestId('section-bloch')).toBeDefined();

      // Click "Gate Truth Tables" tab
      fireEvent.click(screen.getByRole('tab', { name: /Gate Truth Tables/i }));
      expect(screen.getByTestId('section-gates')).toBeDefined();
      expect(screen.queryByTestId('section-dirac')).toBeNull();
      expect(screen.queryByTestId('section-bloch')).toBeNull();

      // Click "Dirac & Born Rule" tab
      fireEvent.click(screen.getByRole('tab', { name: /Dirac & Born Rule/i }));
      expect(screen.queryByTestId('section-gates')).toBeNull();
      expect(screen.getByTestId('section-dirac')).toBeDefined();
      expect(screen.queryByTestId('section-bloch')).toBeNull();

      // Click "Bloch Sphere" tab
      fireEvent.click(screen.getByRole('tab', { name: /Bloch Sphere Coordinates/i }));
      expect(screen.queryByTestId('section-gates')).toBeNull();
      expect(screen.queryByTestId('section-dirac')).toBeNull();
      expect(screen.getByTestId('section-bloch')).toBeDefined();

      // Click "All References" tab
      fireEvent.click(screen.getByRole('tab', { name: /All References/i }));
      expect(screen.getByTestId('section-gates')).toBeDefined();
      expect(screen.getByTestId('section-dirac')).toBeDefined();
      expect(screen.getByTestId('section-bloch')).toBeDefined();
    });
  });
});
