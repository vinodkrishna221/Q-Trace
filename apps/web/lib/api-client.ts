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
  ExportOpenQasm3Request,
  ExportOpenQasm3Response,
  TutorChatRequest,
  TutorChatResponse,
  StateTraceStep,
  CircuitModel,
} from './contracts';
import { generateOpenQasm3 } from '@/features/circuit/circuit-qasm-exporter';
import {
  DEMO_SIMULATION_RUN,
  DEMO_STARTER_CIRCUIT,
  DEMO_FLIGHT_RECORDER_DIAGNOSIS,
  DEMO_TUTOR_RESPONSE,
  DEMO_CHALLENGE,
  DEMO_BRIDGE_CHALLENGE,
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
      let errorJson: {
        error?: { message?: string; code?: string; requestId?: string };
        detail?: string | { message?: string; code?: string; requestId?: string };
        code?: string;
        message?: string;
      } = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // non-json response
      }

      let parsedCode: string | undefined = errorJson.error?.code;
      let parsedMessage: string | undefined = errorJson.error?.message;
      let parsedRequestId: string | undefined = errorJson.error?.requestId;

      if (!parsedCode && errorJson.detail && typeof errorJson.detail === 'object') {
        const detailObj = errorJson.detail as { code?: string; message?: string; requestId?: string };
        parsedCode = detailObj.code;
        parsedMessage = detailObj.message;
        parsedRequestId = detailObj.requestId;
      }
      if (!parsedCode && errorJson.code) {
        parsedCode = errorJson.code;
        parsedMessage = errorJson.message;
      }

      const err = new Error(
        parsedMessage || (typeof errorJson.detail === 'string' ? errorJson.detail : undefined) || `HTTP ${res.status}: ${res.statusText}`
      );
      (err as unknown as { status: number; code?: string; requestId: string }).status = res.status;
      (err as unknown as { status: number; code?: string; requestId: string }).code =
        parsedCode || 'HTTP_ERROR';
      (err as unknown as { status: number; code?: string; requestId: string }).requestId =
        parsedRequestId || responseRequestId;
      throw err;
    }

    const data = (await res.json()) as T;
    return { data, requestId: responseRequestId, isFallback: false };
  } catch (err) {
    // If backend is unavailable or fails, signal fallback need
    throw err;
  }
}

interface ComplexNumber {
  re: number;
  im: number;
}

export const fallbackSimulationRuns = new Map<string, SimulationRun>();

export function simulateFallbackCircuit(circuit: CircuitModel, shots: number = 1024): {
  probabilities: Record<string, number>;
  counts: Record<string, number>;
  stateTrace: StateTraceStep[];
} {
  const ops = [...(circuit.operations || [])].sort((a, b) => a.column - b.column);

  let state: Record<string, ComplexNumber> = {
    '00': { re: 1.0, im: 0.0 },
    '01': { re: 0.0, im: 0.0 },
    '10': { re: 0.0, im: 0.0 },
    '11': { re: 0.0, im: 0.0 },
  };

  const traceSteps: StateTraceStep[] = [];
  let stepIndex = 0;

  for (const op of ops) {
    if (op.gate === 'MEASURE') continue;

    const nextState: Record<string, ComplexNumber> = {
      '00': { ...state['00'] },
      '01': { ...state['01'] },
      '10': { ...state['10'] },
      '11': { ...state['11'] },
    };

    const target = op.targets[0] ?? 0;
    const control = op.controls?.[0] ?? 0;

    if (op.gate === 'H') {
      if (target === 0) {
        for (const b1 of ['0', '1']) {
          const s0 = state['0' + b1];
          const s1 = state['1' + b1];
          nextState['0' + b1] = {
            re: (s0.re + s1.re) / Math.SQRT2,
            im: (s0.im + s1.im) / Math.SQRT2,
          };
          nextState['1' + b1] = {
            re: (s0.re - s1.re) / Math.SQRT2,
            im: (s0.im - s1.im) / Math.SQRT2,
          };
        }
      } else if (target === 1) {
        for (const b0 of ['0', '1']) {
          const s0 = state[b0 + '0'];
          const s1 = state[b0 + '1'];
          nextState[b0 + '0'] = {
            re: (s0.re + s1.re) / Math.SQRT2,
            im: (s0.im + s1.im) / Math.SQRT2,
          };
          nextState[b0 + '1'] = {
            re: (s0.re - s1.re) / Math.SQRT2,
            im: (s0.im - s1.im) / Math.SQRT2,
          };
        }
      }
    } else if (op.gate === 'X') {
      if (target === 0) {
        for (const b1 of ['0', '1']) {
          nextState['0' + b1] = state['1' + b1];
          nextState['1' + b1] = state['0' + b1];
        }
      } else if (target === 1) {
        for (const b0 of ['0', '1']) {
          nextState[b0 + '0'] = state[b0 + '1'];
          nextState[b0 + '1'] = state[b0 + '0'];
        }
      }
    } else if (op.gate === 'Z') {
      if (target === 0) {
        for (const b1 of ['0', '1']) {
          nextState['1' + b1] = { re: -state['1' + b1].re, im: -state['1' + b1].im };
        }
      } else if (target === 1) {
        for (const b0 of ['0', '1']) {
          nextState[b0 + '1'] = { re: -state[b0 + '1'].re, im: -state[b0 + '1'].im };
        }
      }
    } else if (op.gate === 'CNOT') {
      if (control === 0 && target === 1) {
        nextState['10'] = state['11'];
        nextState['11'] = state['10'];
      } else if (control === 1 && target === 0) {
        nextState['01'] = state['11'];
        nextState['11'] = state['01'];
      }
    }

    state = nextState;

    const probs: Record<string, number> = {};
    for (const key of ['00', '01', '10', '11']) {
      const p = state[key].re ** 2 + state[key].im ** 2;
      probs[key] = Math.round(p * 1000000) / 1000000;
    }

    const p0_0 = (probs['00'] || 0) + (probs['01'] || 0);
    const p0_1 = (probs['10'] || 0) + (probs['11'] || 0);
    const rho0_01_re =
      state['00'].re * state['10'].re +
      state['00'].im * state['10'].im +
      state['01'].re * state['11'].re +
      state['01'].im * state['11'].im;
    const rho0_01_im =
      state['00'].im * state['10'].re -
      state['00'].re * state['10'].im +
      state['01'].im * state['11'].re -
      state['01'].re * state['11'].im;
    const purity0 = p0_0 ** 2 + p0_1 ** 2 + 2 * (rho0_01_re ** 2 + rho0_01_im ** 2);
    const bloch0 = {
      x: Math.round(2 * rho0_01_re * 1000) / 1000,
      y: Math.round(-2 * rho0_01_im * 1000) / 1000,
      z: Math.round((p0_0 - p0_1) * 1000) / 1000,
    };

    const p1_0 = (probs['00'] || 0) + (probs['10'] || 0);
    const p1_1 = (probs['01'] || 0) + (probs['11'] || 0);
    const rho1_01_re =
      state['00'].re * state['01'].re +
      state['00'].im * state['01'].im +
      state['10'].re * state['11'].re +
      state['10'].im * state['11'].im;
    const rho1_01_im =
      state['00'].im * state['01'].re -
      state['00'].re * state['01'].im +
      state['10'].im * state['11'].re -
      state['10'].re * state['11'].im;
    const purity1 = p1_0 ** 2 + p1_1 ** 2 + 2 * (rho1_01_re ** 2 + rho1_01_im ** 2);
    const bloch1 = {
      x: Math.round(2 * rho1_01_re * 1000) / 1000,
      y: Math.round(-2 * rho1_01_im * 1000) / 1000,
      z: Math.round((p1_0 - p1_1) * 1000) / 1000,
    };

    traceSteps.push({
      stepIndex,
      operationId: op.opId,
      label: `After ${op.gate}`,
      basisProbabilities: { ...probs },
      amplitudes: {
        '00': { ...state['00'] },
        '01': { ...state['01'] },
        '10': { ...state['10'] },
        '11': { ...state['11'] },
      },
      reducedQubits: [
        {
          qubit: 0,
          bloch: bloch0,
          purity: Math.round(purity0 * 1000) / 1000,
          label: purity0 < 0.9 ? 'MIXED_SUBSYSTEM' : 'PURE_SUBSYSTEM',
        },
        {
          qubit: 1,
          bloch: bloch1,
          purity: Math.round(purity1 * 1000) / 1000,
          label: purity1 < 0.9 ? 'MIXED_SUBSYSTEM' : 'PURE_SUBSYSTEM',
        },
      ],
    });
    stepIndex++;
  }

  if (traceSteps.length === 0) {
    traceSteps.push({
      stepIndex: 0,
      operationId: 'op_init',
      label: 'Initial State',
      basisProbabilities: { '00': 1.0, '01': 0.0, '10': 0.0, '11': 0.0 },
      amplitudes: {
        '00': { re: 1.0, im: 0.0 },
        '01': { re: 0.0, im: 0.0 },
        '10': { re: 0.0, im: 0.0 },
        '11': { re: 0.0, im: 0.0 },
      },
      reducedQubits: [
        { qubit: 0, bloch: { x: 0, y: 0, z: 1 }, purity: 1.0, label: 'PURE_SUBSYSTEM' },
        { qubit: 1, bloch: { x: 0, y: 0, z: 1 }, purity: 1.0, label: 'PURE_SUBSYSTEM' },
      ],
    });
  }

  const finalProbs = traceSteps[traceSteps.length - 1].basisProbabilities;
  const filteredProbs: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const [k, v] of Object.entries(finalProbs)) {
    if (v > 0) {
      filteredProbs[k] = v;
      counts[k] = Math.round(v * shots);
    }
  }

  return {
    probabilities: Object.keys(filteredProbs).length > 0 ? filteredProbs : { '00': 1.0 },
    counts: Object.keys(counts).length > 0 ? counts : { '00': shots },
    stateTrace: traceSteps,
  };
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
      fallbackSimulationRuns.set(data.simulationRun.id, data.simulationRun);
      return {
        data: data.simulationRun,
        meta: {
          requestId,
          isFallback: false,
          durationMs: Date.now() - startTime,
        },
      };
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number; code?: string };
      // Only treat explicit backend application simulation timeouts as engine timeouts.
      // Infrastructure/proxy 504 Gateway Timeouts (e.g. Render container cold starts) fall back gracefully.
      const isEngineTimeout = errorObj?.code === 'SIMULATION_TIMEOUT';
      if (isEngineTimeout) {
        throw err;
      }

      // Offline / DEMO_LOCAL fallback path with accurate 2-qubit state evaluation
      const simulated = simulateFallbackCircuit(payload.circuitModel, payload.shots || 1024);
      const isStarterBell =
        payload.circuitModel.id === DEMO_STARTER_CIRCUIT.id ||
        payload.circuitModel.id === 'cm_bell_seed';
      const fallbackRunId = isStarterBell
        ? DEMO_SIMULATION_RUN.id
        : `sr_fb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      const fallbackRun: SimulationRun = {
        ...DEMO_SIMULATION_RUN,
        id: fallbackRunId,
        learnerProfileId: payload.learnerProfileId,
        moduleId: payload.moduleId,
        circuitModelId: payload.circuitModel.id,
        predictionResponse: payload.predictionResponse,
        probabilities: simulated.probabilities,
        counts: simulated.counts,
        stateTrace: simulated.stateTrace,
        createdAt: new Date().toISOString(),
      };
      fallbackSimulationRuns.set(fallbackRun.id, fallbackRun);
      if (isStarterBell) {
        fallbackSimulationRuns.set(DEMO_SIMULATION_RUN.id, fallbackRun);
      }
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
      const simRun = fallbackSimulationRuns.get(payload.simulationRunId);
      const prediction = simRun?.predictionResponse?.answer || 'INDEPENDENT_RANDOM';
      const probs = simRun?.probabilities || {};
      const isProductState00 = (probs['00'] ?? 0) > 0.99;
      const isBellPhiPlus = (probs['00'] ?? 0) > 0.4 && (probs['11'] ?? 0) > 0.4;
      const isBellPsiPlus = (probs['01'] ?? 0) > 0.4 && (probs['10'] ?? 0) > 0.4;

      const isCorrectPrediction = isBellPhiPlus && prediction === 'CORRELATED_00_11';
      const traceLen = simRun?.stateTrace?.length ?? 2;
      const divergenceStep = isCorrectPrediction ? null : Math.min(1, Math.max(0, traceLen - 1));
      const stepIdx = traceLen === 1 ? 0 : 1;

      const misconceptionCode = isCorrectPrediction
        ? 'NO_SIGNAL'
        : isProductState00
        ? 'GATE_ORDER'
        : DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal.code;

      const repairChallengeId = isCorrectPrediction
        ? 'ch_bell_psi_plus'
        : 'ch_bell_repair';

      const verifiedBehavior = isProductState00
        ? 'INDEPENDENT_00_PRODUCT'
        : isBellPsiPlus
        ? 'ANTI_CORRELATED_01_10'
        : 'CORRELATED_00_11';

      return {
        data: {
          ...DEMO_FLIGHT_RECORDER_DIAGNOSIS,
          misconceptionSignal: {
            ...DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal,
            learnerProfileId: payload.learnerProfileId,
            simulationRunId: payload.simulationRunId,
            code: misconceptionCode,
            firstDivergenceStep: divergenceStep,
            evidence: {
              ...DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal.evidence,
              prediction,
              verifiedBehavior,
              stateTraceStepIndexes: [stepIdx],
            },
            repairChallengeId,
            isCorrectPrediction,
            createdAt: new Date().toISOString(),
          },
          replay:
            traceLen === 1
              ? [
                  {
                    stepIndex: 0,
                    headline: 'Superposition missing',
                    evidenceKeys: ['stateTrace.0.basisProbabilities'],
                  },
                ]
              : DEMO_FLIGHT_RECORDER_DIAGNOSIS.replay,
          isCorrectPrediction,
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
      const simRun = fallbackSimulationRuns.get(payload.simulationRunId);
      const traceLen = simRun?.stateTrace?.length ?? 2;
      const isSingleStep = traceLen === 1;

      if (isSingleStep) {
        return {
          data: {
            tutorResponse: {
              responseId: `tr_fb_${Date.now().toString(36)}`,
              intent: payload.intent,
              summary:
                'Without superposition on qubit 0, the CNOT operation acted on |00⟩ leaving the system in a deterministic product state.',
              steps: [
                {
                  title: 'After CNOT',
                  body: 'Without superposition on qubit 0, the system remained in product state |00⟩.',
                  evidenceKeys: ['stateTrace.0.basisProbabilities'],
                },
              ],
              numericalClaims: [
                { claim: 'P(00)=1.0', evidenceKey: 'stateTrace.0.basisProbabilities.00' },
              ],
              repairChallengeId: 'ch_bell_repair',
              fallbackUsed: true,
              model: 'DEMO_FALLBACK',
              safetyNote: 'Explanation is grounded in this Simulation Run; it is not a hardware claim.',
            },
          },
          meta: {
            requestId: `req_fb_${Date.now().toString(36)}`,
            isFallback: true,
            durationMs: Date.now() - startTime,
          },
        };
      }

      const summary =
        payload.learnerRole === 'PHYSICS_TO_CODE'
          ? 'The Hadamard transformation H prepares product state (|00⟩+|10⟩)/√2; CNOT maps it to entangled Bell state |Φ+⟩=(|00⟩+|11⟩)/√2. Reduced subsystems are maximally mixed (purity 0.5), demonstrating non-separable state correlation.'
          : DEMO_TUTOR_RESPONSE.summary;
      return {
        data: {
          tutorResponse: {
            ...DEMO_TUTOR_RESPONSE,
            summary,
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
   * POST /v1/tutor/chat - Socratic Follow-Up Q&A
   */
  async askTutorChat(
    payload: TutorChatRequest
  ): Promise<ApiResponseWithMeta<TutorChatResponse>> {
    const startTime = Date.now();
    try {
      const { data, requestId } = await requestJson<TutorChatResponse>(
        '/v1/tutor/chat',
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
      // Smart contextual client-side fallback if backend/cloud is offline
      let answer =
        'In this simulation run, the Hadamard gate placed qubit 0 in equal superposition (|00⟩ + |10⟩)/√2, and the CNOT gate correlated qubit 1, producing the Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2.\n\nNotice that outcomes 01 and 10 have probability exactly 0.0, while 00 and 11 each occur with probability 0.5.';
      const q = payload.question.toLowerCase().trim();
      if (q.includes('mixed') || q.includes('trace') || q.includes('purity')) {
        answer =
          'Tracing out qubit 1 from |Φ+⟩ yields the reduced density matrix ρ₀ = 0.5|0⟩⟨0| + 0.5|1⟩⟨1|. Its purity Tr(ρ₀²) = 0.5, which is a **maximally mixed state**. Neither qubit has a definite state vector on its own—the correlation is purely joint!';
      } else if (q.includes('faster') || q.includes('ftl') || q.includes('communication') || q.includes('light')) {
        answer =
          '**No-Communication Theorem**: Entangled correlation cannot transmit messages faster than light. Local measurement results appear completely random (50/50) to either observer without a classical channel comparing outcomes.';
      } else if (q.includes('swap') || q.includes('order')) {
        answer =
          'If you swap gate order and apply CNOT before H on |00⟩, the control qubit is |0⟩ so CNOT does nothing. Then H only superposes qubit 0, leaving an unentangled product state (|00⟩ + |10⟩)/√2 instead of a Bell pair.';
      } else if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
        answer =
          "Hello! I am your Q-Trace Socratic Tutor. Ask me any question about your Bell state circuit, measurement probabilities, or why tracing out an entangled qubit produces a mixed state!";
      }

      return {
        data: {
          answer,
          model: 'DEMO_FALLBACK',
          fallbackUsed: true,
          groundedEvidenceKeys: ['stateTrace.1.basisProbabilities'],
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
      const challenge =
        challengeId === 'ch_bell_psi_plus'
          ? DEMO_BRIDGE_CHALLENGE
          : DEMO_CHALLENGE;
      return {
        data: { challenge },
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
      const targetChallenge =
        payload.challengeId === 'ch_bell_psi_plus'
          ? DEMO_BRIDGE_CHALLENGE
          : DEMO_CHALLENGE;
      const simRun = payload.simulationRunId
        ? fallbackSimulationRuns.get(payload.simulationRunId)
        : undefined;
      const targetStates = targetChallenge.acceptanceRule.states || ['00', '11'];

      let passed = false;
      let feedbackCode = 'SUPPORT_MISMATCH';

      if (simRun?.probabilities) {
        const nonzeroStates = Object.entries(simRun.probabilities)
          .filter(([_, p]) => p > 0.001)
          .map(([s]) => s)
          .sort();
        const expectedStates = [...targetStates].sort();
        if (
          nonzeroStates.length === expectedStates.length &&
          nonzeroStates.every((s, i) => s === expectedStates[i])
        ) {
          passed = true;
          feedbackCode = 'BELL_SUPPORT_CORRECT';
        }
      } else {
        passed = false;
        feedbackCode = 'SUPPORT_MISMATCH';
      }

      return {
        data: {
          challengeAttempt: {
            ...DEMO_CHALLENGE_ATTEMPT_RESPONSE.challengeAttempt,
            id: `ca_fb_${Date.now().toString(36)}`,
            challengeId: payload.challengeId,
            learnerProfileId: payload.learnerProfileId,
            simulationRunId: payload.simulationRunId || 'sr_demo_002',
            submittedAnswer: payload.submittedAnswer,
            passed,
            score: passed ? 100 : 0,
            feedbackCode,
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

  /**
   * POST /v1/circuits/export-openqasm3
   */
  async exportOpenQasm3(
    payload: ExportOpenQasm3Request
  ): Promise<ApiResponseWithMeta<ExportOpenQasm3Response>> {
    try {
      const { data, requestId } = await requestJson<ExportOpenQasm3Response>(
        '/v1/circuits/export-openqasm3',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      return {
        data,
        meta: { requestId, isFallback: false },
      };
    } catch {
      const qasm = generateOpenQasm3(payload.circuitModel);
      return {
        data: {
          openQasmVersion: '3.0',
          openQasm3: qasm,
          lossy: false,
          warnings: [],
        },
        meta: { requestId: `req_fb_${Date.now().toString(36)}`, isFallback: true },
      };
    }
  },
};
