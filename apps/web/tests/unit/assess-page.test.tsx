import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { render } from '../test-utils';
import AssessPage from '@/app/(app)/assess/page';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/assess',
}));

describe('Socratic Counterexample Assessment Page (/assess)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Clean Page Header & Invariant Violation Banner', () => {
    it('renders the assess page container, title, and Socratic counterexample badges', async () => {
      render(<AssessPage />);

      await waitFor(() => {
        expect(screen.getByTestId('assess-page')).toBeDefined();
      });

      expect(screen.getByText('Quantum Invariant Assessment')).toBeDefined();
      expect(screen.getByText('SOCRATIC COUNTEREXAMPLE')).toBeDefined();
      expect(screen.getByText('DETERMINISTIC GRADING ENGINE')).toBeDefined();
    });

    it('renders the invariant violation banner with G-1 Entanglement Entropy details and physics explanation', async () => {
      render(<AssessPage />);

      await waitFor(() => {
        expect(screen.getByTestId('assess-invariant-banner')).toBeDefined();
      });

      // Violations and explanations
      expect(screen.getByTestId('assess-invariant-explanation')).toBeDefined();
      expect(
        screen.getByText(/Invariant Violated: G-1 \(Entanglement Entropy\)/i)
      ).toBeDefined();

      // Invariants check breakdown
      expect(screen.getByText('G-1:')).toBeDefined();
      expect(screen.getByText('G-2:')).toBeDefined();
      expect(screen.getByText('G-3:')).toBeDefined();
      expect(screen.getByText('Entanglement Entropy')).toBeDefined();
      expect(screen.getByText('Phase Observability')).toBeDefined();
      expect(screen.getByText('Unitary Reversibility')).toBeDefined();
    });
  });

  describe('2. Two-Column Read-Only Circuit Canvas Comparison', () => {
    it('renders side-by-side 50/50 read-only circuit canvases for student and target circuits', async () => {
      render(<AssessPage />);

      await waitFor(() => {
        expect(screen.getByTestId('assess-student-circuit')).toBeDefined();
        expect(screen.getByTestId('assess-target-circuit')).toBeDefined();
      });

      // Left column: Student Submission
      expect(screen.getByText('YOUR SUBMISSION')).toBeDefined();
      expect(screen.getByText('Student Circuit Model')).toBeDefined();
      expect(screen.getByTestId('student-circuit-canvas')).toBeDefined();

      // Right column: Target Specification
      expect(screen.getByText('TARGET SPECIFICATION')).toBeDefined();
      expect(screen.getByText('Target Canonical Model')).toBeDefined();
      expect(screen.getByTestId('target-circuit-canvas')).toBeDefined();
    });
  });

  describe('3. Flight Recorder Divergence Panel', () => {
    it('renders the divergence point analysis with input state |+⟩ and divergence step', async () => {
      render(<AssessPage />);

      await waitFor(() => {
        expect(screen.getByTestId('assess-divergence-panel')).toBeDefined();
      });

      // Minimal counterexample input
      const inputState = screen.getByTestId('assess-input-state');
      expect(inputState.textContent).toBe('|+⟩');

      // Divergence step
      const divergenceStep = screen.getByTestId('assess-divergence-step');
      expect(divergenceStep.textContent).toContain('Step 2: CNOT');

      // Student and Target Outputs
      const studentOutput = screen.getByTestId('assess-student-output');
      expect(studentOutput.textContent).toContain('|11⟩ with P = 1.00');

      const targetOutput = screen.getByTestId('assess-target-output');
      expect(targetOutput.textContent).toContain('(|00⟩ + |11⟩)/√2');
    });
  });

  describe('4. Socratic Hint Drawer & Action Buttons', () => {
    it('toggles the collapsible Socratic hint drawer when View Hint is clicked', async () => {
      render(<AssessPage />);

      await waitFor(() => {
        expect(screen.getByTestId('assess-view-hint-btn')).toBeDefined();
      });

      // Initially hint drawer is closed
      expect(screen.queryByTestId('assess-hint-drawer')).toBeNull();

      // Click to open hint
      const hintBtn = screen.getByTestId('assess-view-hint-btn');
      await act(async () => {
        fireEvent.click(hintBtn);
      });

      // Now hint drawer is visible with guidance
      expect(screen.getByTestId('assess-hint-drawer')).toBeDefined();
      expect(screen.getByText('Socratic Pedagogical Guidance')).toBeDefined();
      expect(
        screen.getByText(/Replace the Pauli-X gate on qubit 0 with a Hadamard \(H\) gate/i)
      ).toBeDefined();

      // Click again to close
      await act(async () => {
        fireEvent.click(hintBtn);
      });
      expect(screen.queryByTestId('assess-hint-drawer')).toBeNull();
    });

    it('navigates back to /lab when Try Again button is clicked', async () => {
      render(<AssessPage />);

      await waitFor(() => {
        expect(screen.getByTestId('assess-try-again-btn')).toBeDefined();
      });

      const tryAgainBtn = screen.getByTestId('assess-try-again-btn');
      await act(async () => {
        fireEvent.click(tryAgainBtn);
      });

      expect(mockPush).toHaveBeenCalledWith('/lab');
    });
  });

  describe('5. Query Parameters Resilience', () => {
    it('handles custom challengeId and attemptId query params seamlessly', async () => {
      mockSearchParams = new URLSearchParams('challengeId=CH_BELL_ENTANGLE&attemptId=att_demo_01');

      render(<AssessPage />);

      await waitFor(() => {
        expect(screen.getByTestId('assess-page')).toBeDefined();
      });

      expect(screen.getByTestId('assess-student-circuit')).toBeDefined();
      expect(screen.getByTestId('assess-target-circuit')).toBeDefined();
    });
  });
});
