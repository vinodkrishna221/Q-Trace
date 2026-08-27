/**
 * API client for Q-Trace services.
 * Implements contracts defined in board/contracts/ with TanStack Query compatibility
 * and deterministic DEMO_LOCAL fallback resilience.
 */
import {
  SimulationRunRequest,
  SimulationRunResponse,
  SimulationRun,
  DiagnoseRequest,
  DiagnoseResponse,
  ExplainRequest,
  ExplainResponse,
  ChallengeResponse,
  CreateChallengeAttemptRequest,
  CreateChallengeAttemptResponse,
  ProgressRecordResponse,
  ProgressRecord,
  InstructorInsightResponse,
  InstructorInsight,
  ModuleResponse,
  ModuleDetail,
  LearningPathResponse,
  LearningPath,
  DemoProfilesResponse,
} from './contracts';
import {
  DEMO_SIMULATION_RUN,
  DEMO_FLIGHT_RECORDER_DIAGNOSIS,
  DEMO_TUTOR_RESPONSE,
  DEMO_CHALLENGE,
  DEMO_CHALLENGE_ATTEMPT_RESPONSE,
  DEMO_PROGRESS_RECORDS,
  DEMO_INSTRUCTOR_INSIGHT,
  DEMO_MODULES,
  DEMO_LEARNING_PATHS,
  DEMO_LEARNER_PROFILES,
  DEMO_INSTRUCTOR_PROFILE,
} from './fixtures';

export interface ApiResponseMeta {
  requestId: string;
  isFallback: boolean;
  durationMs?: number;
}

export interface ApiResponseWithMeta<T> {
  data: T;
  meta: ApiResponseMeta;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function generateRequestId(): string {
  const rand = Math.random().toString(36).substring(2, 8);
  return `req_live_${Date.now().toString(36)}_${rand}`;
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  learnerProfileId?: string
): Promise<{ data: T; requestId: string; isFallback: boolean }> {
  const requestId = generateRequestId();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (learnerProfileId) {
    headers.set('X-Demo-Profile-Id', learnerProfileId);
  }
  headers.set('X-Request-Id', requestId);

  const url = `${API_BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const responseRequestId =
      res.headers.get('X-Request-Id') || res.headers.get('x-request-id') || requestId;

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson: { error?: { message?: string; code?: string; requestId?: string } } = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // non-json response
      }
      const err = new Error(
        errorJson.error?.message || `HTTP ${res.status}: ${res.statusText}`
      );
      (err as unknown as { status: number; code?: string; requestId: string }).status = res.status;
      (err as unknown as { status: number; code?: string; requestId: string }).code =
        errorJson.error?.code || 'HTTP_ERROR';
      (err as unknown as { status: number; code?: string; requestId: string }).requestId =
        errorJson.error?.requestId || responseRequestId;
      throw err;
    }

    const data = (await res.json()) as T;
    return { data, requestId: responseRequestId, isFallback: false };
  } catch (err) {
    // If backend is unavailable or fails, signal fallback need
    throw err;
  }
}

export const apiClient = {
  /**
   * POST /v1/simulation-runs
   */
  async runSimulation(
    payload: SimulationRunRequest
  ): Promise<ApiResponseWithMeta<SimulationRun>> {
    const startTime = Date.now();
    try {
      const { data, requestId } = await requestJson<SimulationRunResponse>(
        '/v1/simulation-runs',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        payload.learnerProfileId
      );
      return {
        data: data.simulationRun,
        meta: {
          requestId,
          isFallback: false,
          durationMs: Date.now() - startTime,
        },
      };
    } catch {
      // Offline / DEMO_LOCAL fallback path
      const fallbackRun: SimulationRun = {
        ...DEMO_SIMULATION_RUN,
        learnerProfileId: payload.learnerProfileId,
        moduleId: payload.moduleId,
        circuitModelId: payload.circuitModel.id,
        predictionResponse: payload.predictionResponse,
        createdAt: new Date().toISOString(),
      };
      return {
        data: fallbackRun,
        meta: {
          requestId: `req_fb_${Date.now().toString(36)}`,
          isFallback: true,
          durationMs: Date.now() - startTime,
        },
      };
    }
  },

  /**
   * POST /v1/flight-recorder/diagnose
   */
  async diagnoseFlightRecorder(
    payload: DiagnoseRequest
  ): Promise<ApiResponseWithMeta<DiagnoseResponse>> {
    const startTime = Date.now();
    try {
      const { data, requestId } = await requestJson<DiagnoseResponse>(
        '/v1/flight-recorder/diagnose',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        payload.learnerProfileId
      );
      return {
        data,
        meta: {
          requestId,
          isFallback: false,
          durationMs: Date.now() - startTime,
        },
      };
    } catch {
      return {
        data: {
          ...DEMO_FLIGHT_RECORDER_DIAGNOSIS,
          misconceptionSignal: {
            ...DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal,
            learnerProfileId: payload.learnerProfileId,
            simulationRunId: payload.simulationRunId,
            createdAt: new Date().toISOString(),
          },
        },
        meta: {
          requestId: `req_fb_${Date.now().toString(36)}`,
          isFallback: true,
          durationMs: Date.now() - startTime,
        },
      };
    }
  },

  /**
   * POST /v1/tutor/explain
   */
  async explainWithTutor(
    payload: ExplainRequest
  ): Promise<ApiResponseWithMeta<ExplainResponse>> {
    const startTime = Date.now();
    try {
      const { data, requestId } = await requestJson<ExplainResponse>(
        '/v1/tutor/explain',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        payload.learnerProfileId
      );
      return {
        data,
        meta: {
          requestId,
          isFallback: false,
          durationMs: Date.now() - startTime,
        },
      };
    } catch {
      return {
        data: {
          tutorResponse: {
            ...DEMO_TUTOR_RESPONSE,
            fallbackUsed: true,
            model: 'DEMO_FALLBACK',
          },
        },
        meta: {
          requestId: `req_fb_${Date.now().toString(36)}`,
          isFallback: true,
          durationMs: Date.now() - startTime,
        },
      };
    }
  },

  /**
   * GET /v1/challenges/:challengeId
   */
  async getChallenge(
    challengeId: string
  ): Promise<ApiResponseWithMeta<ChallengeResponse>> {
    try {
      const { data, requestId } = await requestJson<ChallengeResponse>(
        `/v1/challenges/${encodeURIComponent(challengeId)}`
      );
      return {
        data,
        meta: { requestId, isFallback: false },
      };
    } catch {
      return {
        data: { challenge: DEMO_CHALLENGE },
        meta: { requestId: `req_fb_${Date.now().toString(36)}`, isFallback: true },
      };
    }
  },

  /**
   * POST /v1/challenge-attempts
   */
  async submitChallengeAttempt(
    payload: CreateChallengeAttemptRequest
  ): Promise<ApiResponseWithMeta<CreateChallengeAttemptResponse>> {
    const startTime = Date.now();
    try {
      const { data, requestId } = await requestJson<CreateChallengeAttemptResponse>(
        '/v1/challenge-attempts',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        payload.learnerProfileId
      );
      return {
        data,
        meta: {
          requestId,
          isFallback: false,
          durationMs: Date.now() - startTime,
        },
      };
    } catch {
      return {
        data: {
          challengeAttempt: {
            ...DEMO_CHALLENGE_ATTEMPT_RESPONSE.challengeAttempt,
            challengeId: payload.challengeId,
            learnerProfileId: payload.learnerProfileId,
            simulationRunId: payload.simulationRunId || 'sr_demo_002',
            createdAt: new Date().toISOString(),
          },
          progressRecord: {
            ...DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord,
            learnerProfileId: payload.learnerProfileId,
            updatedAt: new Date().toISOString(),
          },
        },
        meta: {
          requestId: `req_fb_${Date.now().toString(36)}`,
          isFallback: true,
          durationMs: Date.now() - startTime,
        },
      };
    }
  },

  /**
   * GET /v1/progress-records/:learnerProfileId
   */
  async getProgressRecord(
    learnerProfileId: string
  ): Promise<ApiResponseWithMeta<ProgressRecord>> {
    try {
      const { data, requestId } = await requestJson<ProgressRecordResponse>(
        `/v1/progress-records/${encodeURIComponent(learnerProfileId)}`,
        {},
        learnerProfileId
      );
      return {
        data: data.progressRecord,
        meta: { requestId, isFallback: false },
      };
    } catch {
      const record =
        DEMO_PROGRESS_RECORDS[learnerProfileId] ||
        DEMO_PROGRESS_RECORDS['lp_aarav'];
      return {
        data: record,
        meta: { requestId: `req_fb_${Date.now().toString(36)}`, isFallback: true },
      };
    }
  },

  /**
   * GET /v1/instructor-insights/:cohortId
   */
  async getInstructorInsight(
    cohortId: string
  ): Promise<ApiResponseWithMeta<InstructorInsight>> {
    try {
      const { data, requestId } = await requestJson<InstructorInsightResponse>(
        `/v1/instructor-insights/${encodeURIComponent(cohortId)}`
      );
      return {
        data: data.instructorInsight,
        meta: { requestId, isFallback: false },
      };
    } catch {
      return {
        data: DEMO_INSTRUCTOR_INSIGHT,
        meta: { requestId: `req_fb_${Date.now().toString(36)}`, isFallback: true },
      };
    }
  },

  /**
   * GET /v1/modules/:slug
   */
  async getModule(
    slug: string
  ): Promise<ApiResponseWithMeta<ModuleDetail>> {
    try {
      const { data, requestId } = await requestJson<ModuleResponse>(
        `/v1/modules/${encodeURIComponent(slug)}`
      );
      return {
        data: data.module,
        meta: { requestId, isFallback: false },
      };
    } catch {
      const mod = DEMO_MODULES[slug] || DEMO_MODULES['bell-state'];
      return {
        data: mod,
        meta: { requestId: `req_fb_${Date.now().toString(36)}`, isFallback: true },
      };
    }
  },

  /**
   * GET /v1/learning-paths/:learnerProfileId
   */
  async getLearningPath(
    learnerProfileId: string
  ): Promise<ApiResponseWithMeta<LearningPath>> {
    try {
      const { data, requestId } = await requestJson<LearningPathResponse>(
        `/v1/learning-paths/${encodeURIComponent(learnerProfileId)}`,
        {},
        learnerProfileId
      );
      return {
        data: data.learningPath,
        meta: { requestId, isFallback: false },
      };
    } catch {
      const path =
        DEMO_LEARNING_PATHS[`path_${learnerProfileId.replace('lp_', '')}_foundations`] ||
        DEMO_LEARNING_PATHS['path_aarav_foundations'];
      return {
        data: path,
        meta: { requestId: `req_fb_${Date.now().toString(36)}`, isFallback: true },
      };
    }
  },

  /**
   * GET /v1/demo-profiles
   */
  async getDemoProfiles(): Promise<ApiResponseWithMeta<DemoProfilesResponse>> {
    try {
      const { data, requestId } = await requestJson<DemoProfilesResponse>(
        '/v1/demo-profiles'
      );
      return {
        data,
        meta: { requestId, isFallback: false },
      };
    } catch {
      return {
        data: {
          profiles: Object.values(DEMO_LEARNER_PROFILES),
          instructor: DEMO_INSTRUCTOR_PROFILE,
        },
        meta: { requestId: `req_fb_${Date.now().toString(36)}`, isFallback: true },
      };
    }
  },
};
