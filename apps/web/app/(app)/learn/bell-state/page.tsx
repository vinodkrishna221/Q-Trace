'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { usePredictionStore } from '@/lib/prediction-store';
import {
  DEMO_MODULES,
  DEMO_STARTER_CIRCUIT,
  DEMO_SIMULATION_RUN,
  DEMO_FLIGHT_RECORDER_DIAGNOSIS,
  DEMO_TUTOR_RESPONSE,
  DEMO_CHALLENGE,
  DEMO_CHALLENGE_ATTEMPT_RESPONSE,
  DEMO_REPAIRED_CIRCUIT,
} from '@/lib/fixtures';
import {
  useSimulationRunMutation,
  useDiagnoseMutation,
  useTutorExplainMutation,
  useChallengeAttemptMutation,
} from '@/lib/hooks/use-quantum-api';
import { PriorKnowledgeBadge } from '@/features/learning/prior-knowledge-badge';
import { ConceptBlocks } from '@/features/learning/concept-blocks';
import { PredictionCheckpoint } from '@/features/learning/prediction-checkpoint';
import { CircuitWorkspaceReadonly } from '@/features/circuit/circuit-workspace-readonly';
import { QiskitCodePanel } from '@/features/circuit/qiskit-code-panel';
import { ProbabilityHistogramView } from '@/features/evidence/probability-histogram-view';
import { FlightRecorderView } from '@/features/flight-recorder/flight-recorder-view';
import { TutorCard } from '@/features/tutor/tutor-card';
import { RepairChallengeCard } from '@/features/challenges/repair-challenge-card';
import { ProgressSuccessCard } from '@/features/progress/progress-success-card';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Cpu, ShieldCheck, Radio, Server, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  ChallengeAttempt,
  ProgressRecord,
  SimulationRun,
  DiagnoseResponse,
  TutorExplanation,
} from '@/lib/contracts';

export default function BellStateLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const { getPredictionDraft } = usePredictionStore();
  const moduleData = DEMO_MODULES['bell-state'];

  const learnerProfileId = activeLearnerProfile?.id || activeRole.profileId || 'lp_aarav';
  const learnerName = activeRole.name;

  // TanStack Query mutations
  const simulationMutation = useSimulationRunMutation();
  const diagnoseMutation = useDiagnoseMutation();
  const tutorMutation = useTutorExplainMutation();
  const challengeAttemptMutation = useChallengeAttemptMutation();

  // Active state for live pipeline
  const [simulationRun, setSimulationRun] = React.useState<SimulationRun | null>(DEMO_SIMULATION_RUN);
  const [diagnosis, setDiagnosis] = React.useState<DiagnoseResponse | null>(DEMO_FLIGHT_RECORDER_DIAGNOSIS);
  const [tutorResponse, setTutorResponse] = React.useState<TutorExplanation | null>(DEMO_TUTOR_RESPONSE);
  const [repairAttempt, setRepairAttempt] = React.useState<ChallengeAttempt | null>(
    DEMO_CHALLENGE_ATTEMPT_RESPONSE.challengeAttempt
  );
  const [progressRecord, setProgressRecord] = React.useState<ProgressRecord | null>(
    DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord
  );
  const [hasSimulated, setHasSimulated] = React.useState(true);
  const [latestRequestId, setLatestRequestId] = React.useState<string>('req_demo_001');
  const [isFallbackActive, setIsFallbackActive] = React.useState<boolean>(false);

  const isExecutingPipeline =
    simulationMutation.isPending || diagnoseMutation.isPending || tutorMutation.isPending;

  const handleRunSimulation = async () => {
    try {
      const savedDraft = getPredictionDraft(learnerProfileId, moduleData.id);
      const predictionAnswer = savedDraft?.answer || 'INDEPENDENT_RANDOM';

      // 1. Run simulation via TanStack Query mutation
      const simResult = await simulationMutation.mutateAsync({
        learnerProfileId,
        moduleId: moduleData.id,
        circuitModel: DEMO_STARTER_CIRCUIT,
        predictionResponse: {
          checkpointId: moduleData.predictionCheckpoint?.id || 'pc_bell_outcomes',
          answer: predictionAnswer,
        },
        primaryAdapter: 'QISKIT_AER',
        runConformance: true,
        shots: 1024,
      });

      setSimulationRun(simResult.data);
      setLatestRequestId(simResult.meta.requestId);
      setIsFallbackActive(simResult.meta.isFallback);
      setHasSimulated(true);

      // 2. Automatically trigger Flight Recorder diagnosis
      const diagResult = await diagnoseMutation.mutateAsync({
        learnerProfileId,
        simulationRunId: simResult.data.id,
      });
      setDiagnosis(diagResult.data);

      // 3. Automatically trigger Tutor explanation
      const tutorResult = await tutorMutation.mutateAsync({
        learnerProfileId,
        moduleId: moduleData.id,
        simulationRunId: simResult.data.id,
        misconceptionSignalId: diagResult.data.misconceptionSignal.id,
        intent: 'EXPLAIN_DIVERGENCE',
      });
      setTutorResponse(tutorResult.data.tutorResponse);
    } catch {
      // Retain fallback state on unexpected error
      setIsFallbackActive(true);
      setHasSimulated(true);
    }
  };

  const handleSubmitRepair = async () => {
    try {
      const result = await challengeAttemptMutation.mutateAsync({
        challengeId: DEMO_CHALLENGE.id,
        learnerProfileId,
        submittedAnswer: {
          type: 'CIRCUIT_MODEL',
          circuitModelId: DEMO_REPAIRED_CIRCUIT.id,
        },
        simulationRunId: simulationRun?.id || 'sr_demo_002',
      });

      setRepairAttempt(result.data.challengeAttempt);
      setProgressRecord(result.data.progressRecord);
      setLatestRequestId(result.meta.requestId);
      setIsFallbackActive(result.meta.isFallback);
    } catch {
      setRepairAttempt(DEMO_CHALLENGE_ATTEMPT_RESPONSE.challengeAttempt);
      setProgressRecord(DEMO_CHALLENGE_ATTEMPT_RESPONSE.progressRecord);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12" data-testid="learn-bell-state-view">
      <PageHeader
        data-testid="bell-page-header"
        eyebrow={
          <>
            <Badge variant="default">{moduleData.level} MODULE</Badge>
            <span className="flex items-center gap-1 font-mono text-xs text-ink-dim">
              <Clock className="w-3.5 h-3.5" />
              {moduleData.estimatedMinutes} mins
            </span>
            <span className="font-mono text-xs text-ink-faint">ID: {moduleData.id}</span>
          </>
        }
        title={moduleData.title}
        purpose="Build, simulate, and diagnose an entangled two-qubit Bell pair — with Qiskit Aer evidence at every gate."
        actions={
          <div
            className="flex flex-col items-start md:items-end bg-panel border border-line px-4 py-3 rounded-lg text-xs space-y-1.5"
            data-testid="learner-context-banner"
          >
            <div className="flex items-center gap-1.5 font-medium text-ink-dim">
              <span>Learner:</span>
              <span className="text-accent font-bold" data-testid="active-learner-name">
                {activeRole.name}
              </span>
              <span className="text-ink-faint">({activeRole.roleTag})</span>
            </div>

            {/* Request ID & Live Protocol Badge */}
            <div
              className="flex items-center gap-2 pt-1 border-t border-line/60 font-mono text-[10px]"
              data-testid="live-request-badge"
            >
              <div className="flex items-center gap-1 text-ink-dim">
                <Server className="w-3 h-3 text-accent" />
                <span>Req:</span>
                <span data-testid="request-id" className="text-accent font-semibold">
                  {latestRequestId}
                </span>
              </div>
              <Badge
                variant={isFallbackActive ? 'warning' : 'outline'}
                className="text-[9px] px-1.5 py-0"
                data-testid="api-mode-badge"
              >
                {isFallbackActive ? 'DEMO_LOCAL' : 'LIVE API'}
              </Badge>
            </div>

            {activeLearningPath && (
              <div className="text-[11px] text-ink-faint mt-0.5 max-w-xs text-left md:text-right">
                {activeLearningPath.recommendationReason}
              </div>
            )}
          </div>
        }
      />

      {/* Prior Knowledge & Entry Path Badge */}
      <PriorKnowledgeBadge
        activeRole={activeRole}
        learnerProfile={activeLearnerProfile}
        learningPath={activeLearningPath}
      />

      {/* Main Lesson Content & Prediction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ConceptBlocks contentBlocks={moduleData.contentBlocks} />

          {moduleData.predictionCheckpoint && (
            <PredictionCheckpoint
              checkpoint={moduleData.predictionCheckpoint}
              learnerProfileId={learnerProfileId}
              learnerName={learnerName}
              moduleId={moduleData.id}
            />
          )}
        </div>

        {/* Context rail */}
        <div className="space-y-6">
          <Card data-testid="starter-circuit-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <span>Starter Circuit</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {DEMO_STARTER_CIRCUIT.name} · {DEMO_STARTER_CIRCUIT.qubitCount} qubits ·{' '}
                {DEMO_STARTER_CIRCUIT.operations.length} operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Mini wire diagram */}
              <div
                className="rounded-lg bg-abyss p-4 border border-line space-y-5 font-mono text-xs"
                role="img"
                aria-label="Bell circuit: Hadamard on qubit 0, CNOT from qubit 0 to qubit 1, then both qubits measured"
              >
                {[0, 1].map((wire) => (
                  <div key={wire} className="flex items-center gap-2">
                    <span className="w-8 text-accent font-semibold">q[{wire}]</span>
                    <div className="relative flex-1 h-px bg-line-bright">
                      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-around">
                        {wire === 0 ? (
                          <>
                            <span className="px-1.5 py-0.5 -mt-px bg-accent/15 border border-accent/60 text-accent rounded font-bold shadow-glow">H</span>
                            <span className="h-2.5 w-2.5 rounded-full bg-accent border border-accent shadow-glow" />
                            <span className="px-1.5 py-0.5 bg-raised border border-line-bright text-ink-dim rounded">M</span>
                          </>
                        ) : (
                          <>
                            <span className="w-6" />
                            <span className="px-1.5 py-0.5 bg-violet/15 border border-violet/60 text-violet rounded font-bold">⊕</span>
                            <span className="px-1.5 py-0.5 bg-raised border border-line-bright text-ink-dim rounded">M</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center text-[10px] text-violet font-mono tracking-widest">
                  ┆ CNOT(0 → 1) · entanglement ┆
                </div>
              </div>

              {/* Operation list */}
              <div className="rounded-lg bg-abyss p-3 border border-line font-mono text-xs text-ink-dim space-y-1.5">
                {DEMO_STARTER_CIRCUIT.operations.map((op) => (
                  <div key={op.opId} className="flex justify-between items-center bg-panel/60 p-1.5 rounded border border-line/60">
                    <span className="text-accent font-bold px-1.5 py-0.5 rounded bg-accent/10 border border-accent/30">
                      {op.gate}
                    </span>
                    <span>targets: [{op.targets.join(', ')}]</span>
                    {op.controls.length > 0 && (
                      <span className="text-violet">ctrl: [{op.controls.join(', ')}]</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-ink-dim font-mono bg-abyss p-2 rounded border border-line">
                <ShieldCheck className="w-3.5 h-3.5 text-evidence" />
                <span>Target: Qiskit Aer · 1024 shots</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/30" data-testid="demo-path-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-accent" />
                <span>Flight Recorder Path</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2.5">
              {[
                'Predict the measurement pattern',
                'Simulate on Aer (TanStack Mutation)',
                'Flight Recorder diagnosis (Deterministic Rule)',
                'Evidence-based repair & Progress record',
              ].map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-2.5 ${i === 0 ? 'text-accent font-medium' : 'text-ink-faint'}`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px] ${
                      i === 0
                        ? 'border-accent bg-accent/15 text-accent shadow-glow'
                        : 'border-line-bright bg-raised'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Step 2: Circuit Workspace & Synchronized Qiskit Code */}
      <div className="space-y-6 pt-4 border-t border-line">
        <CircuitWorkspaceReadonly
          circuit={DEMO_STARTER_CIRCUIT}
          isSimulating={isExecutingPipeline}
          hasExecuted={hasSimulated}
          onRunSimulation={handleRunSimulation}
        />

        <QiskitCodePanel />
      </div>

      {/* Pipeline execution indicator */}
      {isExecutingPipeline && (
        <div className="p-4 rounded-lg border border-accent/40 bg-accent/10 flex items-center gap-3 font-mono text-xs text-accent">
          <RefreshCw className="w-4 h-4 animate-spin text-accent" />
          <span>Executing live contract pipeline: Simulation Run → State Trace → Diagnosis → Tutor...</span>
        </div>
      )}

      {/* Step 3: Visual Evidence (Probability & Histogram) */}
      {hasSimulated && simulationRun && (
        <div className="space-y-6 pt-4 border-t border-line">
          <ProbabilityHistogramView simulationRun={simulationRun} />
        </div>
      )}

      {/* Step 4: Quantum Flight Recorder */}
      {hasSimulated && diagnosis && simulationRun && (
        <div className="space-y-6 pt-4 border-t border-line">
          <FlightRecorderView
            diagnosis={diagnosis}
            stateTrace={simulationRun.stateTrace}
          />
        </div>
      )}

      {/* Step 5: Evidence-Bound Tutor Card */}
      {hasSimulated && tutorResponse && (
        <div className="space-y-6 pt-4 border-t border-line">
          <TutorCard tutorResponse={tutorResponse} />
        </div>
      )}

      {/* Step 6: Repair Challenge Card */}
      {hasSimulated && (
        <div className="space-y-6 pt-4 border-t border-line">
          <RepairChallengeCard
            challenge={DEMO_CHALLENGE}
            attempt={repairAttempt}
            isSubmitting={challengeAttemptMutation.isPending}
            onSubmitAttempt={handleSubmitRepair}
          />
        </div>
      )}

      {/* Step 7: Progress Success Card */}
      {progressRecord && (
        <div className="space-y-6 pt-4 border-t border-line">
          <ProgressSuccessCard
            progress={progressRecord}
            learnerName={learnerName}
          />
        </div>
      )}
    </div>
  );
}
