import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import BellStateLearnPage from '@/app/(app)/learn/bell-state/page';
import ProgressPage from '@/app/(app)/progress/page';
import InstructorPage from '@/app/(app)/instructor/page';
import { useRoleStore } from '@/lib/role-store';
import { usePredictionStore } from '@/lib/prediction-store';
import {
  DEMO_SIMULATION_RUN,
  DEMO_FLIGHT_RECORDER_DIAGNOSIS,
  DEMO_TUTOR_RESPONSE,
  DEMO_CHALLENGE_ATTEMPT_RESPONSE,
  DEMO_PROGRESS_RECORDS,
  DEMO_INSTRUCTOR_INSIGHT,
} from '@/lib/fixtures';

describe('Live Bell Journey & Contract Swapping (UX-4)', () => {
  beforeEach(() => {
    localStorage.clear();
    usePredictionStore.getState().resetAllDrafts();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('completes live journey: prediction -> simulation run -> diagnosis -> tutor -> repair -> progress and exposes the request ID', async () => {
    // Mock global fetch to simulate live FastAPI backend responses
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const parsedUrl = new URL(url, 'http://localhost:8000');
      const pathname = parsedUrl.pathname;

      if (pathname === '/v1/simulation-runs' && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Id': 'req_live_aer_1001',
          }),
          json: async () => ({
            simulationRun: {
              ...DEMO_SIMULATION_RUN,
              id: 'sr_live_1001',
              status: 'SUCCEEDED',
              adapter: 'QISKIT_AER',
              durationMs: 72,
            },
          }),
        });
      }

      if (pathname === '/v1/flight-recorder/diagnose' && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Id': 'req_live_diag_1002',
          }),
          json: async () => ({
            ...DEMO_FLIGHT_RECORDER_DIAGNOSIS,
            misconceptionSignal: {
              ...DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal,
              id: 'ms_live_1002',
              simulationRunId: 'sr_live_1001',
            },
          }),
        });
      }

      if (pathname === '/v1/tutor/explain' && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Id': 'req_live_tutor_1003',
          }),
          json: async () => ({
            tutorResponse: {
              ...DEMO_TUTOR_RESPONSE,
              responseId: 'tr_live_1003',
              fallbackUsed: false,
              model: 'CLAUDE_3_5_SONNET',
            },
          }),
        });
      }

      if (pathname === '/v1/challenge-attempts' && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Id': 'req_live_repair_1004',
          }),
          json: async () => ({
            challengeAttempt: {
              ...DEMO_CHALLENGE_ATTEMPT_RESPONSE.challengeAttempt,
              id: 'ca_live_1004',
              simulationRunId: 'sr_live_1001',
            },
            progressRecord: {
              ...DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord,
              id: 'progress_lp_aarav',
              totalPoints: 150,
            },
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled mock endpoint: ${pathname}`));
    });

    vi.stubGlobal('fetch', mockFetch);

    // Render the Bell State learning journey
    render(<BellStateLearnPage />);

    // 1. Initial State & Request ID
    expect(screen.getByTestId('learn-bell-state-view')).toBeDefined();
    expect(screen.getByTestId('live-request-badge')).toBeDefined();

    // 2. Select Prediction Checkpoint
    const predictionOpt = screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM');
    fireEvent.click(predictionOpt);
    expect(screen.getByText('Selected: INDEPENDENT_RANDOM')).toBeDefined();

    // 3. Trigger Simulation Run
    const runBtn = screen.getByTestId('run-simulation-btn');
    fireEvent.click(runBtn);

    // Wait for the full mutation pipeline to complete
    await waitFor(() => {
      expect(screen.getByTestId('request-id').textContent).toBe('req_live_aer_1001');
    });

    expect(screen.getByTestId('api-mode-badge').textContent).toBe('LIVE API');

    // 4. Verify Visual Evidence from Live Run
    expect(screen.getByTestId('visual-evidence-card')).toBeDefined();
    expect(screen.getByTestId('basis-prob-00')).toBeDefined();
    expect(screen.getByTestId('basis-prob-11')).toBeDefined();

    // 5. Verify Flight Recorder Diagnosis from Live Run
    expect(screen.getByTestId('flight-recorder-card')).toBeDefined();
    expect(screen.getByTestId('misconception-code').textContent).toBe('SUPERPOSITION_VS_ENTANGLEMENT');
    expect(screen.getByTestId('first-divergence-step').textContent).toContain('Step 1');

    // 6. Verify Evidence-Bound Tutor from Live Run
    expect(screen.getByTestId('tutor-card')).toBeDefined();
    expect(screen.getByTestId('tutor-summary').textContent).toContain(
      'The Hadamard gate made qubit 0 uncertain'
    );
    expect(screen.getByTestId('tutor-fallback-badge').textContent).toContain('Live Model');

    // 7. Verify & Submit Repair Challenge
    const submitRepairBtn = screen.getByTestId('submit-repair-btn');
    fireEvent.click(submitRepairBtn);

    await waitFor(() => {
      expect(screen.getByTestId('request-id').textContent).toBe('req_live_repair_1004');
    });

    expect(screen.getByTestId('repair-status-badge').textContent).toBe('REPAIR ATTEMPT PASSED');
    expect(screen.getByTestId('repair-feedback-code').textContent).toBe('BELL_SUPPORT_CORRECT');

    // 8. Verify Progress Record updated
    expect(screen.getByTestId('progress-success-card')).toBeDefined();
    expect(screen.getByTestId('total-points-display').textContent).toContain('150 pts');
  });

  it('gracefully degrades to disclosed DEMO_LOCAL fallback when backend API is unreachable', async () => {
    // Mock network failure / connection refused
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Failed to fetch (ECONNREFUSED)'))
    );

    render(<BellStateLearnPage />);

    // Select prediction and click run
    const predictionOpt = screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM');
    fireEvent.click(predictionOpt);

    const runBtn = screen.getByTestId('run-simulation-btn');
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByTestId('api-mode-badge').textContent).toBe('DEMO_LOCAL');
    });

    // Request ID exposes fallback prefix
    const reqId = screen.getByTestId('request-id').textContent;
    expect(reqId).toMatch(/^req_fb_/);

    // All evidence panels render safely with seeded fallback
    expect(screen.getByTestId('visual-evidence-card')).toBeDefined();
    expect(screen.getByTestId('flight-recorder-card')).toBeDefined();
    expect(screen.getByTestId('tutor-card')).toBeDefined();
    expect(screen.getByTestId('tutor-fallback-badge').textContent).toContain('Fallback Active (DEMO_FALLBACK)');

    // Repair challenge also passes via fallback
    const submitRepairBtn = screen.getByTestId('submit-repair-btn');
    fireEvent.click(submitRepairBtn);

    await waitFor(() => {
      expect(screen.getByTestId('repair-status-badge').textContent).toBe('REPAIR ATTEMPT PASSED');
    });
  });

  it('renders Progress page with live query and fallback meta badge', async () => {
    render(<ProgressPage />);

    expect(screen.getByTestId('progress-view')).toBeDefined();
    expect(screen.getByTestId('progress-meta-badge')).toBeDefined();
    expect(screen.getByText('Total Points')).toBeDefined();
    expect(screen.getByText('Completed Modules')).toBeDefined();
  });

  it('renders Instructor Insight page with live query and cohort analytics', async () => {
    render(<InstructorPage />);

    expect(screen.getByTestId('instructor-insight-view')).toBeDefined();
    expect(screen.getByTestId('instructor-meta-badge')).toBeDefined();
    expect(screen.getByText('Cohort Analytics & Misconceptions')).toBeDefined();
    expect(screen.getByText('Module Completion')).toBeDefined();
    expect(screen.getByText('Top Misconceptions')).toBeDefined();
  });
});
