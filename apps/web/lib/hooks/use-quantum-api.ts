'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponseWithMeta } from '@/lib/api-client';
import {
  SimulationRunRequest,
  SimulationRun,
  DiagnoseRequest,
  DiagnoseResponse,
  ExplainRequest,
  ExplainResponse,
  CreateChallengeAttemptRequest,
  CreateChallengeAttemptResponse,
  ProgressRecord,
  InstructorInsight,
  ModuleDetail,
  LearningPath,
  DemoProfilesResponse,
} from '@/lib/contracts';

export const QUERY_KEYS = {
  progressRecord: (learnerProfileId: string) => ['progress-record', learnerProfileId] as const,
  instructorInsight: (cohortId: string) => ['instructor-insight', cohortId] as const,
  module: (slug: string) => ['module', slug] as const,
  learningPath: (learnerProfileId: string) => ['learning-path', learnerProfileId] as const,
  demoProfiles: () => ['demo-profiles'] as const,
};

/**
 * Mutation to run circuit simulation (POST /v1/simulation-runs)
 */
export function useSimulationRunMutation() {
  return useMutation<ApiResponseWithMeta<SimulationRun>, Error, SimulationRunRequest>({
    mutationFn: (payload: SimulationRunRequest) => apiClient.runSimulation(payload),
  });
}

/**
 * Mutation to diagnose flight recorder misconception (POST /v1/flight-recorder/diagnose)
 */
export function useDiagnoseMutation() {
  return useMutation<ApiResponseWithMeta<DiagnoseResponse>, Error, DiagnoseRequest>({
    mutationFn: (payload: DiagnoseRequest) => apiClient.diagnoseFlightRecorder(payload),
  });
}

/**
 * Mutation to get Tutor explanation (POST /v1/tutor/explain)
 */
export function useTutorExplainMutation() {
  return useMutation<ApiResponseWithMeta<ExplainResponse>, Error, ExplainRequest>({
    mutationFn: (payload: ExplainRequest) => apiClient.explainWithTutor(payload),
  });
}

/**
 * Mutation to submit a challenge attempt (POST /v1/challenge-attempts)
 */
export function useChallengeAttemptMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponseWithMeta<CreateChallengeAttemptResponse>,
    Error,
    CreateChallengeAttemptRequest
  >({
    mutationFn: (payload: CreateChallengeAttemptRequest) =>
      apiClient.submitChallengeAttempt(payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        QUERY_KEYS.progressRecord(variables.learnerProfileId),
        {
          data: data.data.progressRecord,
          meta: data.meta,
        }
      );
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.instructorInsight('cohort_demo_2026'),
      });
    },
  });
}

/**
 * Query for learner ProgressRecord (GET /v1/progress-records/:id)
 */
export function useProgressRecordQuery(learnerProfileId: string) {
  return useQuery<ApiResponseWithMeta<ProgressRecord>, Error>({
    queryKey: QUERY_KEYS.progressRecord(learnerProfileId),
    queryFn: () => apiClient.getProgressRecord(learnerProfileId),
    enabled: Boolean(learnerProfileId),
  });
}

/**
 * Query for InstructorInsight (GET /v1/instructor-insights/:cohortId)
 */
export function useInstructorInsightQuery(cohortId = 'cohort_demo_2026') {
  return useQuery<ApiResponseWithMeta<InstructorInsight>, Error>({
    queryKey: QUERY_KEYS.instructorInsight(cohortId),
    queryFn: () => apiClient.getInstructorInsight(cohortId),
    enabled: Boolean(cohortId),
  });
}

/**
 * Query for Module detail (GET /v1/modules/:slug)
 */
export function useModuleQuery(slug: string) {
  return useQuery<ApiResponseWithMeta<ModuleDetail>, Error>({
    queryKey: QUERY_KEYS.module(slug),
    queryFn: () => apiClient.getModule(slug),
    enabled: Boolean(slug),
  });
}

/**
 * Query for LearningPath (GET /v1/learning-paths/:learnerProfileId)
 */
export function useLearningPathQuery(learnerProfileId: string) {
  return useQuery<ApiResponseWithMeta<LearningPath>, Error>({
    queryKey: QUERY_KEYS.learningPath(learnerProfileId),
    queryFn: () => apiClient.getLearningPath(learnerProfileId),
    enabled: Boolean(learnerProfileId),
  });
}

/**
 * Query for DemoProfiles (GET /v1/demo-profiles)
 */
export function useDemoProfilesQuery() {
  return useQuery<ApiResponseWithMeta<DemoProfilesResponse>, Error>({
    queryKey: QUERY_KEYS.demoProfiles(),
    queryFn: () => apiClient.getDemoProfiles(),
  });
}
