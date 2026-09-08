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
} from '@/lib/fixtures';

describe('Resilient Journey, Failure Recovery & Instructor Proof (UX-7)', () => {
  beforeEach(() => {
    localStorage.clear();
    usePredictionStore.getState().resetAllDrafts();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('completes the learner journey with cloud Tutor off (curated fallback active) and updates progress', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const parsedUrl = new URL(url, 'http://localhost:8000');
      const pathname = parsedUrl.pathname;

      if (pathname === '/v1/simulation-runs' && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Id': 'req_live_aer_2001',
          }),
          json: async () => ({
            simulationRun: {
              ...DEMO_SIMULATION_RUN,
              id: 'sr_live_2001',
              status: 'SUCCEEDED',
              adapter: 'QISKIT_AER',
              durationMs: 65,
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
            'X-Request-Id': 'req_live_diag_2002',
          }),
          json: async () => ({
            ...DEMO_FLIGHT_RECORDER_DIAGNOSIS,
            misconceptionSignal: {
              ...DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal,
              id: 'ms_live_2002',
              simulationRunId: 'sr_live_2001',
            },
          }),
        });
      }

      // Cloud Tutor is OFF / returns 503 Tutor Unavailable (or DEMO_FALLBACK active)
      if (pathname === '/v1/tutor/explain' && init?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 503,
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Id': 'req_fb_tutor_2003',
          }),
          text: async () =>
            JSON.stringify({
              error: {
                code: 'TUTOR_UNAVAILABLE',
                message: 'Cloud AI provider disabled. Falling back to deterministic trace explanation.',
                requestId: 'req_fb_tutor_2003',
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
            'X-Request-Id': 'req_live_repair_2004',
          }),
          json: async () => ({
            challengeAttempt: {
              ...DEMO_CHALLENGE_ATTEMPT_RESPONSE.challengeAttempt,
              id: 'ca_live_2004',
              simulationRunId: 'sr_live_2001',
            },
            progressRecord: {
              ...DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord,
              id: 'progress_lp_aarav',
              totalPoints: 100,
            },
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled mock endpoint: ${pathname}`));
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<BellStateLearnPage />);

    // 1. Initial render check
    expect(screen.getByTestId('learn-bell-state-view')).toBeDefined();

    // 2. Select prediction and run simulation
    const predictionOpt = screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM');
    fireEvent.click(predictionOpt);

    const runBtn = screen.getByTestId('run-simulation-btn');
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByTestId('visual-evidence-card')).toBeDefined();
    });

    // 3. Verify Flight Recorder diagnosis
    expect(screen.getByTestId('flight-recorder-card')).toBeDefined();
    expect(screen.getByTestId('misconception-code').textContent).toBe('SUPERPOSITION_VS_ENTANGLEMENT');

    // 4. Verify Tutor Card operates with Cloud Tutor OFF using curated fallback
    expect(screen.getByTestId('tutor-card')).toBeDefined();
    const fallbackBadge = screen.getByTestId('tutor-fallback-badge');
    expect(fallbackBadge.textContent).toContain('Fallback Active (DEMO_FALLBACK)');
    expect(screen.getByTestId('tutor-summary').textContent).toContain('Hadamard gate made qubit 0 uncertain');
    expect(screen.getByTestId('numerical-claims-table')).toBeDefined();

    // 5. Submit Repair Challenge and verify atomic Progress update
    const submitRepairBtn = screen.getByTestId('submit-repair-btn');
    fireEvent.click(submitRepairBtn);

    await waitFor(() => {
      expect(screen.getByTestId('repair-status-badge').textContent).toBe('REPAIR ATTEMPT PASSED');
    });

    expect(screen.getByTestId('progress-success-card')).toBeDefined();
    expect(screen.getByTestId('total-points-display').textContent).toContain('100 pts');
  });

  it('renders a simulation-timeout recovery banner and recovers cleanly without blank UI', async () => {
    let attemptCount = 0;

    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const parsedUrl = new URL(url, 'http://localhost:8000');
      const pathname = parsedUrl.pathname;

      if (pathname === '/v1/simulation-runs' && init?.method === 'POST') {
        attemptCount += 1;
        if (attemptCount === 1) {
          // First attempt: simulate 504 Gateway Timeout
          return Promise.resolve({
            ok: false,
            status: 504,
            headers: new Headers({
              'Content-Type': 'application/json',
              'X-Request-Id': 'req_err_timeout_9001',
            }),
            text: async () =>
              JSON.stringify({
                error: {
                  code: 'SIMULATION_TIMEOUT',
                  message: 'Simulation execution exceeded 1500ms timeout threshold.',
                  requestId: 'req_err_timeout_9001',
                },
              }),
          });
        }

        // Second attempt: succeeds
        return Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Id': 'req_live_aer_9002',
          }),
          json: async () => ({
            simulationRun: {
              ...DEMO_SIMULATION_RUN,
              id: 'sr_live_9002',
              status: 'SUCCEEDED',
              adapter: 'QISKIT_AER',
              durationMs: 80,
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
            'X-Request-Id': 'req_live_diag_9003',
          }),
          json: async () => ({
            ...DEMO_FLIGHT_RECORDER_DIAGNOSIS,
            misconceptionSignal: {
              ...DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal,
              id: 'ms_live_9003',
              simulationRunId: 'sr_live_9002',
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
            'X-Request-Id': 'req_live_tutor_9004',
          }),
          json: async () => ({
            tutorResponse: DEMO_TUTOR_RESPONSE,
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled mock endpoint: ${pathname}`));
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<BellStateLearnPage />);

    // Select prediction and click run
    const predictionOpt = screen.getByTestId('prediction-opt-INDEPENDENT_RANDOM');
    fireEvent.click(predictionOpt);

    const runBtn = screen.getByTestId('run-simulation-btn');
    fireEvent.click(runBtn);

    // 1. Verify that on timeout, the screen is NOT blank: Header, Workspace, and Error Banner remain visible
    await waitFor(() => {
      expect(screen.getByTestId('simulation-error-banner')).toBeDefined();
    });

    expect(screen.getByTestId('bell-page-header')).toBeDefined();
    expect(screen.getByTestId('interactive-circuit-workspace')).toBeDefined();
    expect(screen.getByText(/Simulation execution exceeded 1500ms timeout threshold/i)).toBeDefined();

    const retryBtn = screen.getByTestId('retry-simulation-btn');
    expect(retryBtn).toBeDefined();

    // 2. Click Retry Simulation
    fireEvent.click(retryBtn);

    // 3. Verify successful recovery: error banner disappears, evidence & flight recorder render
    await waitFor(() => {
      expect(screen.queryByTestId('simulation-error-banner')).toBeNull();
      expect(screen.getByTestId('visual-evidence-card')).toBeDefined();
    });

    expect(screen.getByTestId('flight-recorder-card')).toBeDefined();
    expect(screen.getByTestId('tutor-card')).toBeDefined();
    expect(screen.getByTestId('request-id').textContent).toBe('req_live_aer_9002');
  });

  it('renders Instructor Insight 3-card and 1-chart structure with live demo learner connection', async () => {
    render(<InstructorPage />);

    expect(screen.getByTestId('instructor-insight-view')).toBeDefined();
    expect(screen.getByTestId('instructor-meta-badge')).toBeDefined();

    // Verify 3 Cards
    expect(screen.getByTestId('instructor-module-completion-card')).toBeDefined();
    expect(screen.getByTestId('instructor-challenge-passrate-card')).toBeDefined();
    expect(screen.getByTestId('instructor-top-misconceptions-card')).toBeDefined();

    // Verify 1 dedicated Chart
    expect(screen.getByTestId('cohort-analytics-chart-card')).toBeDefined();
    expect(screen.getByTestId('cohort-svg-chart')).toBeDefined();

    // Verify chart table fallback toggle
    const toggleBtn = screen.getByTestId('toggle-chart-fallback-btn');
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('cohort-table-fallback')).toBeDefined();

    // Verify Live Demo Learner proof connection (Dr. Rao seeing Aarav's attempt)
    expect(screen.getByTestId('instructor-live-learner-callout')).toBeDefined();
    expect(screen.getByText(/Live demo learner/i)).toBeDefined();
    expect(screen.getByText('lp_aarav')).toBeDefined();

    // Verify disclosure footer
    expect(screen.getByTestId('instructor-disclosure-footer')).toBeDefined();
  });

  it('renders Progress Record with live points, skill competencies, and misconception history', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      const parsedUrl = new URL(url, 'http://localhost:8000');
      if (parsedUrl.pathname.startsWith('/v1/progress-records/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Request-Id': 'req_live_prog_8001',
          }),
          json: async () => ({
            progressRecord: {
              ...DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord,
              id: 'progress_lp_aarav',
              totalPoints: 100,
              misconceptionSummary: [
                {
                  code: 'SUPERPOSITION_VS_ENTANGLEMENT',
                  count: 1,
                  latestAt: '2026-08-23T05:27:01Z',
                },
              ],
            },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled mock endpoint: ${parsedUrl.pathname}`));
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<ProgressPage />);

    expect(screen.getByTestId('progress-view')).toBeDefined();
    expect(screen.getByTestId('progress-meta-badge')).toBeDefined();
    expect(screen.getByTestId('progress-stats-strip')).toBeDefined();
    expect(screen.getByTestId('completed-modules-card')).toBeDefined();
    expect(screen.getByTestId('skill-competency-card')).toBeDefined();
    expect(screen.getByTestId('misconception-history-card')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByTestId('misconception-item-SUPERPOSITION_VS_ENTANGLEMENT')).toBeDefined();
    });
  });
});
