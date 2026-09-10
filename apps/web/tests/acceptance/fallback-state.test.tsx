/**
 * QA-5: Fallback state acceptance fixtures — UI state rendering.
 *
 * Consumes (read-only):
 *   - @/lib/fixtures (DEMO_SIMULATION_RUN, DEMO_FLIGHT_RECORDER_DIAGNOSIS, DEMO_TUTOR_RESPONSE)
 *   - board/contracts/flight-recorder-tutor.md v1  (model, fallbackUsed fields)
 *   - board/contracts/circuit-simulation.md v1     (conformance, skippedReason)
 *
 * QA owns this file; UX track retains implementation unit tests.
 *
 * These tests prove that every critical fallback state reachable during the
 * live demo path has fixture data that is contract-correct and non-null —
 * ensuring the UI has valid data to render for offline/fallback modes.
 */

import { describe, it, expect } from 'vitest';
import {
  DEMO_SIMULATION_RUN,
  DEMO_FLIGHT_RECORDER_DIAGNOSIS,
  DEMO_TUTOR_RESPONSE,
  DEMO_CHALLENGE_ATTEMPT_RESPONSE,
  DEMO_PROGRESS_RECORDS,
} from '@/lib/fixtures';

// ---------------------------------------------------------------------------
// Helper: check that a fixture value is the expected type and non-empty
// ---------------------------------------------------------------------------

function assertNonEmpty(value: unknown, label: string): void {
  if (value === null || value === undefined) {
    throw new Error(`[QA-5] Fallback fixture ${label} is null/undefined`);
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    throw new Error(`[QA-5] Fallback fixture ${label} is an empty string`);
  }
  if (Array.isArray(value) && value.length === 0) {
    throw new Error(`[QA-5] Fallback fixture ${label} is an empty array`);
  }
}


describe('QA-5: Fallback state acceptance fixtures — offline demo safety', () => {

  // -------------------------------------------------------------------------
  // A. Simulation run fallback — DEMO_LOCAL / QISKIT_AER offline
  // -------------------------------------------------------------------------

  describe('SimulationRun fallback fixture', () => {
    it('is defined and has id, status, adapter', () => {
      assertNonEmpty(DEMO_SIMULATION_RUN.id, 'DEMO_SIMULATION_RUN.id');
      expect(DEMO_SIMULATION_RUN.status).toBe('SUCCEEDED');
      assertNonEmpty(DEMO_SIMULATION_RUN.adapter, 'DEMO_SIMULATION_RUN.adapter');
    });

    it('probabilities object is non-empty and values are in [0,1]', () => {
      const probs = DEMO_SIMULATION_RUN.probabilities as Record<string, number>;
      expect(Object.keys(probs).length).toBeGreaterThan(0);
      for (const [basis, p] of Object.entries(probs)) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
        expect(typeof basis).toBe('string');
      }
    });

    it('stateTrace is an array with at least 2 steps', () => {
      const trace = DEMO_SIMULATION_RUN.stateTrace as unknown[];
      expect(Array.isArray(trace)).toBe(true);
      expect(trace.length).toBeGreaterThanOrEqual(2);
    });

    it('each stateTrace step has stepIndex, label, basisProbabilities, reducedQubits', () => {
      const trace = DEMO_SIMULATION_RUN.stateTrace as Array<Record<string, unknown>>;
      for (const step of trace) {
        expect(typeof step.stepIndex).toBe('number');
        assertNonEmpty(step.label, `stateTrace[${step.stepIndex}].label`);
        expect(step.basisProbabilities).toBeDefined();
        expect(step.reducedQubits).toBeDefined();
      }
    });

    it('conformance has passed, epsilon, and adapter fields', () => {
      const c = DEMO_SIMULATION_RUN.conformance as Record<string, unknown>;
      expect(c).toBeDefined();
      expect(typeof c.passed).toBe('boolean');
      expect(typeof c.epsilon).toBe('number');
      expect(c.adapter).toBeDefined();
    });

    it('durationMs is a positive number (performance claim)', () => {
      expect(typeof DEMO_SIMULATION_RUN.durationMs).toBe('number');
      expect((DEMO_SIMULATION_RUN.durationMs as number)).toBeGreaterThan(0);
    });
  });


  // -------------------------------------------------------------------------
  // B. Flight Recorder diagnosis fallback
  // -------------------------------------------------------------------------

  describe('FlightRecorder diagnosis fallback fixture', () => {
    it('misconceptionSignal has all required contract fields', () => {
      const signal = DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal as Record<string, unknown>;
      const required = ['id', 'learnerProfileId', 'simulationRunId', 'code',
                        'evidence', 'confidence', 'repairChallengeId', 'createdAt'];
      for (const field of required) {
        expect(signal[field]).toBeDefined();
      }
    });

    it('confidence is exactly 1.0 (deterministic diagnosis)', () => {
      const signal = DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal as { confidence: number };
      expect(signal.confidence).toBe(1.0);
    });

    it('evidence has prediction, verifiedBehavior, stateTraceStepIndexes', () => {
      const ev = (DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal as {
        evidence: Record<string, unknown>;
      }).evidence;
      expect(ev.prediction).toBeDefined();
      expect(ev.verifiedBehavior).toBe('CORRELATED_00_11');
      expect(Array.isArray(ev.stateTraceStepIndexes)).toBe(true);
    });

    it('replay is an array with at least 1 step', () => {
      const replay = DEMO_FLIGHT_RECORDER_DIAGNOSIS.replay as unknown[];
      expect(Array.isArray(replay)).toBe(true);
      expect(replay.length).toBeGreaterThanOrEqual(1);
    });

    it('each replay step has stepIndex, headline, evidenceKeys', () => {
      const replay = DEMO_FLIGHT_RECORDER_DIAGNOSIS.replay as Array<{
        stepIndex: number;
        headline: string;
        evidenceKeys: string[];
      }>;
      for (const step of replay) {
        expect(typeof step.stepIndex).toBe('number');
        assertNonEmpty(step.headline, `replay[${step.stepIndex}].headline`);
        expect(Array.isArray(step.evidenceKeys)).toBe(true);
        expect(step.evidenceKeys.length).toBeGreaterThan(0);
      }
    });

    it('each replay evidenceKey starts with stateTrace (dot-path convention)', () => {
      const replay = DEMO_FLIGHT_RECORDER_DIAGNOSIS.replay as Array<{
        evidenceKeys: string[];
      }>;
      for (const step of replay) {
        for (const key of step.evidenceKeys) {
          expect(key.startsWith('stateTrace.')).toBe(true);
        }
      }
    });
  });


  // -------------------------------------------------------------------------
  // C. Tutor response fallback — DEMO_FALLBACK mode (DEMO_LOCAL=1)
  // -------------------------------------------------------------------------

  describe('TutorResponse fallback fixture', () => {
    it('model is DEMO_FALLBACK (offline/demo mode)', () => {
      expect(DEMO_TUTOR_RESPONSE.model).toBe('DEMO_FALLBACK');
    });

    it('fallbackUsed is true', () => {
      expect(DEMO_TUTOR_RESPONSE.fallbackUsed).toBe(true);
    });

    it('safetyNote is present and non-empty', () => {
      assertNonEmpty(
        DEMO_TUTOR_RESPONSE.safetyNote,
        'DEMO_TUTOR_RESPONSE.safetyNote',
      );
    });

    it('steps array is non-empty', () => {
      const steps = DEMO_TUTOR_RESPONSE.steps as unknown[];
      assertNonEmpty(steps, 'DEMO_TUTOR_RESPONSE.steps');
    });

    it('numericalClaims each have claim and evidenceKey', () => {
      const claims = DEMO_TUTOR_RESPONSE.numericalClaims as Array<{
        claim: string;
        evidenceKey: string;
      }>;
      for (const nc of claims) {
        assertNonEmpty(nc.claim, 'numericalClaim.claim');
        assertNonEmpty(nc.evidenceKey, 'numericalClaim.evidenceKey');
      }
    });

    it('repairChallengeId is non-null (offline path always provides repair challenge)', () => {
      assertNonEmpty(
        DEMO_TUTOR_RESPONSE.repairChallengeId,
        'DEMO_TUTOR_RESPONSE.repairChallengeId',
      );
    });
  });


  // -------------------------------------------------------------------------
  // D. Challenge attempt + progress record fallback
  // -------------------------------------------------------------------------

  describe('ChallengeAttempt and ProgressRecord fallback fixture', () => {
    it('DEMO_CHALLENGE_ATTEMPT_RESPONSE has challengeAttempt and progressRecord', () => {
      expect(DEMO_CHALLENGE_ATTEMPT_RESPONSE).toHaveProperty('challengeAttempt');
      expect(DEMO_CHALLENGE_ATTEMPT_RESPONSE).toHaveProperty('progressRecord');
    });

    it('challengeAttempt has passed=true for the Bell repair scenario', () => {
      const attempt = DEMO_CHALLENGE_ATTEMPT_RESPONSE.challengeAttempt as { passed: boolean };
      expect(attempt.passed).toBe(true);
    });

    it('challengeAttempt score is 100 (full points for Bell repair)', () => {
      const attempt = DEMO_CHALLENGE_ATTEMPT_RESPONSE.challengeAttempt as { score: number };
      expect(attempt.score).toBe(100);
    });

    it('progressRecord totalPoints is 150 after successful repair (cumulative)', () => {
      const pr = DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord as { totalPoints: number };
      expect(pr.totalPoints).toBe(150);
    });

    it('progressRecord has skillStates array', () => {
      const pr = DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord as {
        skillStates: unknown[];
      };
      expect(Array.isArray(pr.skillStates)).toBe(true);
      expect(pr.skillStates.length).toBeGreaterThan(0);
    });

    it('at least one skill is MASTERED after Bell repair', () => {
      const pr = DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord as {
        skillStates: Array<{ skillId: string; status: string; score: number }>;
      };
      const mastered = pr.skillStates.some(s => s.status === 'MASTERED');
      expect(mastered).toBe(true);
    });

    it('DEMO_PROGRESS_RECORDS for lp_aarav exists', () => {
      expect(DEMO_PROGRESS_RECORDS).toBeDefined();
      expect(typeof DEMO_PROGRESS_RECORDS).toBe('object');
    });
  });
});
