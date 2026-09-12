import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import { apiClient } from '@/lib/api-client';
import { healUnclosedLatex, renderMathText, normalizeLatexDelimiters } from '@/lib/math-renderer';
import { FlightRecorderView } from '@/features/flight-recorder/flight-recorder-view';
import { TutorCard } from '@/features/tutor/tutor-card';
import BellStateLearnPage from '@/app/(app)/learn/bell-state/page';
import { useRoleStore } from '@/lib/role-store';
import { usePredictionStore } from '@/lib/prediction-store';
import {
  DEMO_SIMULATION_RUN,
  DEMO_FLIGHT_RECORDER_DIAGNOSIS,
  DEMO_TUTOR_RESPONSE,
} from '@/lib/fixtures';
import { DiagnoseResponse } from '@/lib/contracts';

describe('Flight Recorder False-Positive Bug & Inline AI Tutor Integration', () => {
  const CORRECT_DIAGNOSIS: DiagnoseResponse = {
    misconceptionSignal: {
      id: 'ms_correct_001',
      learnerProfileId: 'lp_meera',
      simulationRunId: 'sr_meera_001',
      code: 'NO_SIGNAL',
      firstDivergenceStep: null,
      evidence: {
        prediction: 'CORRELATED_00_11',
        verifiedBehavior: 'CORRELATED_00_11',
        stateTraceStepIndexes: [0, 1],
      },
      confidence: 1.0,
      repairChallengeId: null,
      isCorrectPrediction: true,
      createdAt: '2026-09-11T12:00:00Z',
    },
    replay: [
      {
        stepIndex: 0,
        headline: 'Superposition created',
        evidenceKeys: ['stateTrace.0.basisProbabilities'],
      },
      {
        stepIndex: 1,
        headline: 'Bell correlation confirmed',
        evidenceKeys: ['stateTrace.1.basisProbabilities'],
      },
    ],
    isCorrectPrediction: true,
  };

  it('renders clean green success state for correct prediction without divergence or red X', () => {
    render(
      <FlightRecorderView
        diagnosis={CORRECT_DIAGNOSIS}
        stateTrace={DEMO_SIMULATION_RUN.stateTrace}
      />
    );

    // 1. Check confirmed hypothesis status and badge
    expect(screen.getByTestId('hypothesis-confirmed-badge')).toBeDefined();
    expect(screen.getByTestId('hypothesis-confirmed-badge').textContent).toBe(
      'NO MISCONCEPTION DETECTED'
    );
    expect(screen.getByTestId('no-divergence-status').textContent).toContain(
      '✓ Hypothesis Confirmed — No Misconception Detected'
    );

    // 2. Both prediction and verified behavior show checkmarks
    const signalCard = screen.getByTestId('misconception-signal-card');
    expect(signalCard.textContent).toContain('✓ CORRELATED_00_11');
    expect(signalCard.textContent).not.toContain('✕');

    // 3. No misconception-code or first-divergence-step badges
    expect(screen.queryByTestId('misconception-code')).toBeNull();
    expect(screen.queryByTestId('first-divergence-step')).toBeNull();

    // 4. Trace step buttons show VERIFIED instead of DIVERGENCE
    expect(screen.getByTestId('step-btn-0').textContent).toContain('VERIFIED');
    expect(screen.getByTestId('step-btn-1').textContent).toContain('VERIFIED');
    expect(screen.queryByText('DIVERGENCE')).toBeNull();

    // 5. AI Tutor is NOT displayed for correct predictions
    expect(screen.queryByTestId('inline-tutor-container')).toBeNull();
    expect(screen.queryByTestId('tutor-loading-skeleton')).toBeNull();
  });

  it('renders inline AI Tutor loading skeleton when isTutorLoading is true', () => {
    render(
      <FlightRecorderView
        diagnosis={DEMO_FLIGHT_RECORDER_DIAGNOSIS}
        stateTrace={DEMO_SIMULATION_RUN.stateTrace}
        isTutorLoading={true}
        learnerRole="BEGINNER_CSE"
      />
    );

    // Loading skeleton is visible
    expect(screen.getByTestId('tutor-loading-skeleton')).toBeDefined();
    expect(screen.getByText(/Generating AI Pedagogical Guidance/i)).toBeDefined();
    expect(screen.queryByTestId('inline-tutor-container')).toBeNull();
  });

  it('renders inline AI explanation with grounded evidence and role badge beneath scrubber', () => {
    render(
      <FlightRecorderView
        diagnosis={DEMO_FLIGHT_RECORDER_DIAGNOSIS}
        stateTrace={DEMO_SIMULATION_RUN.stateTrace}
        tutorResponse={DEMO_TUTOR_RESPONSE}
        isTutorLoading={false}
        learnerRole="PHYSICS_TO_CODE"
      />
    );

    // Inline AI Tutor card is rendered
    expect(screen.getByTestId('inline-tutor-container')).toBeDefined();
    expect(screen.getByTestId('inline-tutor-summary')).toBeDefined();
    expect(screen.getByTestId('inline-tutor-summary').textContent).toContain(
      DEMO_TUTOR_RESPONSE.summary
    );

    // Persona tone badge is rendered
    expect(screen.getByText('Formal Physics')).toBeDefined();

    // Fallback badge is rendered
    expect(screen.getByTestId('inline-tutor-badge')).toBeDefined();
  });

  it('renders TutorCard in Socratic deep-dive mode when hypothesis is confirmed', async () => {
    const askSpy = vi.spyOn(apiClient, 'askTutorChat').mockImplementation(async (payload) => {
      let answer =
        'In a maximally entangled Bell state |Φ+⟩, measurement collapses both qubits simultaneously into matching states (00 or 11) with zero local communication delay. Tracing out either qubit yields purity 0.5 (maximally mixed), proving the correlation is global.';
      if (
        payload.question.toLowerCase().includes('faster') ||
        payload.question.toLowerCase().includes('communication')
      ) {
        answer =
          'No-Communication Theorem: Because local measurement outcomes are individually random (50/50), neither party can transmit information faster than light without a classical communication channel.';
      }
      return {
        data: {
          answer,
          model: 'DEMO_FALLBACK',
          fallbackUsed: true,
          groundedEvidenceKeys: ['stateTrace.1.basisProbabilities'],
        },
        meta: {
          requestId: 'req_mock_chat_001',
          isFallback: true,
          durationMs: 10,
        },
      };
    });

    render(
      <TutorCard
        tutorResponse={null}
        isCorrectPrediction={true}
      />
    );

    expect(screen.getByTestId('tutor-card')).toBeDefined();
    expect(screen.getByText(/Theory Mastery Confirmed/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Can Bell correlation transmit/i)).toBeDefined();

    // Ask a follow-up question
    const input = screen.getByPlaceholderText(/Can Bell correlation transmit/i);
    const form = input.closest('form')!;
    fireEvent.change(input, { target: { value: 'Can we use this for faster communication?' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/No-Communication Theorem/i)).toBeDefined();
    });
    expect(askSpy).toHaveBeenCalled();
    askSpy.mockRestore();
  });

  it('suppresses false-positive and AI tutor call end-to-end on BellStateLearnPage when learner selects CORRELATED_00_11', async () => {
    localStorage.clear();
    usePredictionStore.getState().resetAllDrafts();
    useRoleStore.getState().setRole('role_meera');

    render(<BellStateLearnPage />);

    // 1. Select the correct prediction
    const predictionOpt = screen.getByTestId('prediction-opt-CORRELATED_00_11');
    fireEvent.click(predictionOpt);

    // 2. Click run simulation
    const runBtn = screen.getByTestId('run-simulation-btn');
    fireEvent.click(runBtn);

    // 3. Verify Flight Recorder confirmed hypothesis state
    await waitFor(
      () => {
        expect(screen.getByTestId('hypothesis-confirmed-badge')).toBeDefined();
      },
      { timeout: 4000 }
    );

    expect(screen.getByTestId('no-divergence-status').textContent).toContain(
      '✓ Hypothesis Confirmed — No Misconception Detected'
    );
    expect(screen.queryByTestId('misconception-code')).toBeNull();
    expect(screen.queryByTestId('first-divergence-step')).toBeNull();
    expect(screen.queryByTestId('inline-tutor-container')).toBeNull();

    // 4. Verify TutorCard is in Socratic confirmed mode
    expect(screen.getByText(/Theory Mastery Confirmed/i)).toBeDefined();
  });

  it('heals truncated KaTeX math strings with unclosed delimiters and unbalanced braces', () => {
    // Truncated display math
    const truncatedDisplay = 'Density matrix: $$\\rho_A = \\frac{1}{2';
    const healedDisplay = healUnclosedLatex(truncatedDisplay);
    expect(healedDisplay).toBe('Density matrix: $$\\rho_A = \\frac{1}{2}$$');

    // Truncated inline math
    const truncatedInline = 'State $|\\Phi^+\\rangle$ has purity $\\text{Tr}(\\rho^2) = 0.5';
    const healedInline = healUnclosedLatex(truncatedInline);
    expect(healedInline).toBe('State $|\\Phi^+\\rangle$ has purity $\\text{Tr}(\\rho^2) = 0.5$');

    // Truncated with unbalanced open brace
    const truncatedBrace = 'Formula $\\sqrt{2';
    const healedBrace = healUnclosedLatex(truncatedBrace);
    expect(healedBrace).toBe('Formula $\\sqrt{2}$');
  });

  it('renders KaTeX equations in TutorCard summary, steps, claims, and hypothesis confirmed', () => {
    const mathExplanation: TutorExplanation = {
      responseId: 'tr_math_001',
      intent: 'EXPLAIN_DIVERGENCE',
      summary: 'Tracing out gives $\\rho_0 = \\frac{1}{2}|0\\rangle\\langle 0| + \\frac{1}{2}|1\\rangle\\langle 1|$.',
      steps: [
        {
          title: 'Partial Trace Step',
          body: 'The subsystem is in mixed state $$\\rho_A = \\text{Tr}_B(|\\Phi^+\\rangle\\langle\\Phi^+|)$$ with purity 0.5.',
          evidenceKeys: ['stateTrace.1.basisProbabilities'],
        },
      ],
      numericalClaims: [
        { claim: '$\\text{Tr}(\\rho_0^2) = 0.5$', evidenceKey: 'stateTrace.1.reducedQubits.0.purity' },
      ],
      repairChallengeId: 'ch_bell_repair',
      fallbackUsed: false,
      model: 'test-model',
      safetyNote: 'Grounded math evidence note.',
    };

    render(<TutorCard tutorResponse={mathExplanation} isCorrectPrediction={false} />);

    // Verify KaTeX rendered html elements exist (katex class in dom)
    const katexNodes = document.querySelectorAll('.katex');
    expect(katexNodes.length).toBeGreaterThanOrEqual(3);
  });

  it('heals unclosed math even with escaped dollar signs and escaped braces', () => {
    // Escaped dollar followed by truncated formula
    const textWithCurrency = 'Cost is \\$100, formula is $a = \\frac{1}{2';
    const healed = healUnclosedLatex(textWithCurrency);
    expect(healed).toBe('Cost is \\$100, formula is $a = \\frac{1}{2}$');

    // Truncated formula with escaped currency following the open delimiter
    const textWithTrailingEscaped = 'Equation $a = \\frac{1}{2 and cost is \\$50';
    const healedTrailing = healUnclosedLatex(textWithTrailingEscaped);
    expect(healedTrailing).toBe('Equation $a = \\frac{1}{2 and cost is \\$50}$');
  });

  it('normalizes plain-text and math-mode Dirac notation without raw backslashes', () => {
    // Plain-text Bell state and kets should be wrapped in $...$ for KaTeX
    const plainText = 'You created (|Φ+⟩ = (|00⟩ + |11⟩)/√2). Also |+⟩ and ⟨0|.';
    const normalized = normalizeLatexDelimiters(plainText);
    expect(normalized).toContain('$|\\Phi^+\\rangle$');
    expect(normalized).toContain('$|00\\rangle$');
    expect(normalized).toContain('$|11\\rangle$');
    expect(normalized).toContain('$|+\\rangle$');
    expect(normalized).toContain('$\\langle 0|$');

    // Math-mode Dirac notation should NOT be double-wrapped in $$
    const mathMode = 'Formula: $\\frac{|00⟩ + |11⟩}{\\sqrt{2}}$';
    const normalizedMath = normalizeLatexDelimiters(mathMode);
    expect(normalizedMath).toBe('Formula: $\\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$');
    expect(normalizedMath).not.toContain('$$|');
  });

  it('falls back gracefully to DEMO_FALLBACK when askTutorChat rejects due to network error', async () => {
    const askSpy = vi.spyOn(apiClient, 'askTutorChat').mockRejectedValueOnce(new Error('Network offline'));

    render(<TutorCard tutorResponse={null} isCorrectPrediction={true} />);

    const input = screen.getByPlaceholderText(/Can Bell correlation transmit/i);
    const form = input.closest('form')!;
    fireEvent.change(input, { target: { value: 'Why is purity 0.5?' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Offline Fallback/i)).toBeDefined();
      expect(screen.getByText(/In this simulation run, measurement collapses both qubits/i)).toBeDefined();
    });

    expect(askSpy).toHaveBeenCalled();
    askSpy.mockRestore();
  });
});
