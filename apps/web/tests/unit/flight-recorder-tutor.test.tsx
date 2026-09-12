import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
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

  it('renders TutorCard in Socratic deep-dive mode when hypothesis is confirmed', () => {
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

    expect(screen.getByText(/No-Communication Theorem/i)).toBeDefined();
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
    await waitFor(() => {
      expect(screen.getByTestId('hypothesis-confirmed-badge')).toBeDefined();
    });

    expect(screen.getByTestId('no-divergence-status').textContent).toContain(
      '✓ Hypothesis Confirmed — No Misconception Detected'
    );
    expect(screen.queryByTestId('misconception-code')).toBeNull();
    expect(screen.queryByTestId('first-divergence-step')).toBeNull();
    expect(screen.queryByTestId('inline-tutor-container')).toBeNull();

    // 4. Verify TutorCard is in Socratic confirmed mode
    expect(screen.getByText(/Theory Mastery Confirmed/i)).toBeDefined();
  });
});
