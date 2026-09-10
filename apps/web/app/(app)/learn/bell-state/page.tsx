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
import { InteractiveCircuitWorkspace } from '@/features/circuit/interactive-circuit-workspace';
import { useCircuitStore } from '@/lib/circuit-store';
import { ProbabilityHistogramView } from '@/features/evidence/probability-histogram-view';
import { FlightRecorderView } from '@/features/flight-recorder/flight-recorder-view';
import { TutorCard } from '@/features/tutor/tutor-card';
import { RepairChallengeCard } from '@/features/challenges/repair-challenge-card';
import { ProgressSuccessCard } from '@/features/progress/progress-success-card';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LearnSidebar } from '@/features/learning/learn-sidebar';
import {
  Clock,
  Cpu,
  ShieldCheck,
  Radio,
  Server,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Workflow,
  Sparkles,
  Layers,
  Check,
  Zap,
} from 'lucide-react';
import {
  ChallengeAttempt,
  ProgressRecord,
  SimulationRun,
  DiagnoseResponse,
  TutorExplanation,
  CircuitModel,
} from '@/lib/contracts';

export default function BellStateLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const { getPredictionDraft } = usePredictionStore();
  const moduleData = DEMO_MODULES['bell-state'];

  const learnerProfileId = activeLearnerProfile?.id || activeRole.profileId || 'lp_aarav';
  const learnerName = activeRole.name;
  const isMeera = activeRole.id === 'role_meera' || activeLearnerProfile?.role === 'PHYSICS_TO_CODE';

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
  const [simulationError, setSimulationError] = React.useState<{
    message: string;
    isTimeout: boolean;
  } | null>(null);

  // Stepper state: steps come one by one
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const [viewMode, setViewMode] = React.useState<'step-by-step' | 'all'>('step-by-step');

  const isExecutingPipeline =
    simulationMutation.isPending || diagnoseMutation.isPending || tutorMutation.isPending;

  const { circuit: activeCircuit } = useCircuitStore();

  const handleRunSimulation = async (circuitOverride?: CircuitModel) => {
    setSimulationError(null);
    try {
      const savedDraft = getPredictionDraft(learnerProfileId, moduleData.id);
      const predictionAnswer = savedDraft?.answer || 'INDEPENDENT_RANDOM';
      const targetCircuit = circuitOverride || activeCircuit || DEMO_STARTER_CIRCUIT;

      // 1. Run simulation via TanStack Query mutation
      const simResult = await simulationMutation.mutateAsync({
        learnerProfileId,
        moduleId: moduleData.id,
        circuitModel: targetCircuit,
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
      setSimulationError(null);

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
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number; code?: string };
      const isTimeout = Boolean(
        errorObj?.message?.toLowerCase().includes('timeout') ||
        errorObj?.message?.toLowerCase().includes('timed out') ||
        errorObj?.status === 504 ||
        errorObj?.code === 'SIMULATION_TIMEOUT'
      );

      if (isTimeout) {
        setSimulationError({
          message: errorObj?.message || 'Simulation execution exceeded 1500ms timeout threshold.',
          isTimeout: true,
        });
      } else {
        // Retain fallback state on unexpected offline/network error
        setIsFallbackActive(true);
        setHasSimulated(true);
      }
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

  const stepMeta = [
    { num: 1, title: 'Prediction Prompt', label: 'Step 1: Predict' },
    { num: 2, title: 'Circuit & Simulation', label: 'Step 2: Circuit' },
    { num: 3, title: 'Visual Evidence', label: 'Step 3: Histogram' },
    { num: 4, title: 'Flight Recorder', label: 'Step 4: Diagnosis' },
    { num: 5, title: 'AI Tutor', label: 'Step 5: Explanation' },
    { num: 6, title: 'Repair Challenge', label: 'Step 6: Repair' },
    { num: 7, title: 'Progress Mastery', label: 'Step 7: Mastery' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" data-testid="learn-bell-state-view">
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

      {/* 2-Column Responsive Layout: Algorithm Sidebar + Step-by-Step Learning Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Rail: Bell Correlation Benchmark & Future Algorithms Directory */}
        <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
          <LearnSidebar currentSlug="bell-state" isMeera={isMeera} />
        </div>

        {/* Right Main Column: Guided Step-by-Step Learning Engine */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6 order-1 lg:order-2">
          {/* Top Interactive Stepper Controller (One by One) */}
          <div className="rounded-xl border border-line bg-panel p-4 space-y-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/60">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 border border-accent text-accent">
                  <Workflow className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                    Interactive Learning Stepper
                  </span>
                  <span className="text-[11px] font-mono text-ink-dim block">
                    Step {activeStep} of 7 · {stepMeta[activeStep - 1].title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border border-line bg-abyss p-0.5 text-[10px] font-mono">
                  <button
                    onClick={() => setViewMode('step-by-step')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      viewMode === 'step-by-step'
                        ? 'bg-accent/20 text-accent font-semibold'
                        : 'text-ink-faint hover:text-ink-dim'
                    }`}
                  >
                    One by One
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      viewMode === 'all'
                        ? 'bg-accent/20 text-accent font-semibold'
                        : 'text-ink-faint hover:text-ink-dim'
                    }`}
                  >
                    View All
                  </button>
                </div>

                {/* Prev & Next Step buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                  className="h-7 text-xs font-mono gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeStep === 7}
                  onClick={() => setActiveStep((prev) => Math.min(7, prev + 1))}
                  className="h-7 text-xs font-mono gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Stepper Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
              {stepMeta.map((s) => {
                const isActive = activeStep === s.num;
                const isCompleted = activeStep > s.num;

                return (
                  <button
                    key={s.num}
                    onClick={() => setActiveStep(s.num)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-accent bg-accent/15 text-ink shadow-glow'
                        : isCompleted
                        ? 'border-line-bright bg-abyss/80 text-ink-dim hover:border-accent/40'
                        : 'border-line bg-abyss/40 text-ink-faint hover:border-line-bright'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-accent">0{s.num}</span>
                      {isCompleted ? (
                        <Check className="w-3 h-3 text-evidence" />
                      ) : isActive ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      ) : null}
                    </div>
                    <div className="text-[11px] font-medium truncate mt-0.5">{s.label.split(': ')[1]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: Required Learning Prompt & Prediction Checkpoint */}
          <div className={viewMode === 'step-by-step' && activeStep !== 1 ? 'hidden' : 'space-y-6'}>
            <div className="rounded-xl border border-accent/40 bg-gradient-to-b from-panel to-abyss p-5 space-y-3 shadow-glow-soft">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 border border-accent text-accent">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                    Step 01 · Initial Prediction Directive & Mental Model Prompt
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-accent/40 text-accent">
                  ACTIVE DIRECTIVE
                </Badge>
              </div>
              <p className="text-xs text-ink-dim leading-relaxed">
                Before launching the quantum simulator, test your mental model: An entangled Bell pair produces
                correlated measurement outcomes. Predict whether measuring both qubits will result in independent random
                bitstrings or correlated outcomes.
              </p>
            </div>

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

            {viewMode === 'step-by-step' && (
              <div className="flex justify-end pt-4 border-t border-line">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setActiveStep(2)}
                  className="gap-2 font-mono"
                >
                  <span>Next: Step 2 — Build & Simulate Circuit</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* STEP 2: Circuit Workspace & Synchronized Qiskit Code */}
          <div className={viewMode === 'step-by-step' && activeStep !== 2 ? 'hidden' : 'space-y-6 pt-4 border-t border-line'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-accent border-accent/40">
                  STEP 02 OF 07
                </Badge>
                <h2 className="text-base font-display font-semibold text-ink">
                  Interactive Circuit Workspace & Qiskit Aer
                </h2>
              </div>
              <span className="text-xs font-mono text-ink-dim">Drag/Click gates onto wires</span>
            </div>

            <InteractiveCircuitWorkspace
              initialCircuit={DEMO_STARTER_CIRCUIT}
              isSimulating={isExecutingPipeline}
              hasExecuted={hasSimulated && !simulationError}
              onRunSimulation={handleRunSimulation}
            />

            {/* Simulation Timeout & Error Recovery Banner */}
            {simulationError && (
              <Card
                className="border-caution/60 bg-caution/10 p-5 space-y-3"
                data-testid="simulation-error-banner"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-caution mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-ink flex items-center gap-2">
                        <span>Simulation Execution Failed / Timed Out</span>
                        <Badge variant="warning" className="text-[10px] font-mono">
                          {simulationError.isTimeout ? 'TIMEOUT 1500ms' : 'RUNTIME ERROR'}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink-dim leading-relaxed">
                        {simulationError.message}
                      </p>
                      <p className="text-[11px] text-ink-faint">
                        The circuit workspace remains intact. Click retry to rerun simulation on Qiskit Aer runtime.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleRunSimulation()}
                    disabled={isExecutingPipeline}
                    className="text-xs font-mono shrink-0 bg-caution hover:bg-caution/80 text-abyss font-bold"
                    data-testid="retry-simulation-btn"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isExecutingPipeline ? 'animate-spin' : ''}`} />
                    Retry Simulation
                  </Button>
                </div>
              </Card>
            )}

            {/* Pipeline execution indicator */}
            {isExecutingPipeline && (
              <div className="p-4 rounded-lg border border-accent/40 bg-accent/10 flex items-center gap-3 font-mono text-xs text-accent">
                <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                <span>Executing live contract pipeline: Simulation Run → State Trace → Diagnosis → Tutor...</span>
              </div>
            )}

            {viewMode === 'step-by-step' && (
              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(1)} className="gap-1 font-mono text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 1</span>
                </Button>
                <Button variant="default" size="sm" onClick={() => setActiveStep(3)} className="gap-1 font-mono text-xs">
                  <span>Next: Step 3 — Visual Evidence</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* STEP 3: Visual Evidence (Probability & Histogram) */}
          <div className={viewMode === 'step-by-step' && activeStep !== 3 ? 'hidden' : 'space-y-6 pt-4 border-t border-line'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-accent border-accent/40">
                  STEP 03 OF 07
                </Badge>
                <h2 className="text-base font-display font-semibold text-ink">
                  Visual Evidence & Measurement Probabilities
                </h2>
              </div>
              <span className="text-xs font-mono text-evidence">Qiskit Aer 1024 Shots</span>
            </div>

            {hasSimulated && simulationRun && (
              <ProbabilityHistogramView simulationRun={simulationRun} />
            )}

            {viewMode === 'step-by-step' && (
              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(2)} className="gap-1 font-mono text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 2</span>
                </Button>
                <Button variant="default" size="sm" onClick={() => setActiveStep(4)} className="gap-1 font-mono text-xs">
                  <span>Next: Step 4 — Flight Recorder</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* STEP 4: Quantum Flight Recorder */}
          <div className={viewMode === 'step-by-step' && activeStep !== 4 ? 'hidden' : 'space-y-6 pt-4 border-t border-line'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-accent border-accent/40">
                  STEP 04 OF 07
                </Badge>
                <h2 className="text-base font-display font-semibold text-ink">
                  Quantum Flight Recorder Diagnosis
                </h2>
              </div>
              <span className="text-xs font-mono text-accent">Gate-by-Gate State Trace</span>
            </div>

            {hasSimulated && diagnosis && simulationRun && (
              <FlightRecorderView
                diagnosis={diagnosis}
                stateTrace={simulationRun.stateTrace}
              />
            )}

            {viewMode === 'step-by-step' && (
              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(3)} className="gap-1 font-mono text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 3</span>
                </Button>
                <Button variant="default" size="sm" onClick={() => setActiveStep(5)} className="gap-1 font-mono text-xs">
                  <span>Next: Step 5 — AI Tutor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* STEP 5: Evidence-Bound Tutor Card */}
          <div className={viewMode === 'step-by-step' && activeStep !== 5 ? 'hidden' : 'space-y-6 pt-4 border-t border-line'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-accent border-accent/40">
                  STEP 05 OF 07
                </Badge>
                <h2 className="text-base font-display font-semibold text-ink">
                  Evidence-Bound Tutor Explanation
                </h2>
              </div>
              <span className="text-xs font-mono text-ink-dim">Grounded in Simulation Evidence</span>
            </div>

            {hasSimulated && tutorResponse && (
              <TutorCard tutorResponse={tutorResponse} />
            )}

            {viewMode === 'step-by-step' && (
              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(4)} className="gap-1 font-mono text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 4</span>
                </Button>
                <Button variant="default" size="sm" onClick={() => setActiveStep(6)} className="gap-1 font-mono text-xs">
                  <span>Next: Step 6 — Repair Challenge</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* STEP 6: Repair Challenge Card */}
          <div className={viewMode === 'step-by-step' && activeStep !== 6 ? 'hidden' : 'space-y-6 pt-4 border-t border-line'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-accent border-accent/40">
                  STEP 06 OF 07
                </Badge>
                <h2 className="text-base font-display font-semibold text-ink">
                  Quantum Repair Challenge
                </h2>
              </div>
              <span className="text-xs font-mono text-caution">Restore Correlation</span>
            </div>

            {hasSimulated && (
              <RepairChallengeCard
                challenge={DEMO_CHALLENGE}
                attempt={repairAttempt}
                isSubmitting={challengeAttemptMutation.isPending}
                onSubmitAttempt={handleSubmitRepair}
              />
            )}

            {viewMode === 'step-by-step' && (
              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(5)} className="gap-1 font-mono text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 5</span>
                </Button>
                <Button variant="default" size="sm" onClick={() => setActiveStep(7)} className="gap-1 font-mono text-xs">
                  <span>Next: Step 7 — Progress Mastery</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* STEP 7: Progress Success Card */}
          <div className={viewMode === 'step-by-step' && activeStep !== 7 ? 'hidden' : 'space-y-6 pt-4 border-t border-line'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-accent border-accent/40">
                  STEP 07 OF 07
                </Badge>
                <h2 className="text-base font-display font-semibold text-ink">
                  Progress Mastery & Cohort Record
                </h2>
              </div>
              <span className="text-xs font-mono text-evidence">Certified Completion</span>
            </div>

            {progressRecord && (
              <ProgressSuccessCard
                progress={progressRecord}
                learnerName={learnerName}
              />
            )}

            {viewMode === 'step-by-step' && (
              <div className="flex items-center justify-between pt-4 border-t border-line">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(6)} className="gap-1 font-mono text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 6</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('all')}
                  className="gap-1 font-mono text-xs text-accent"
                >
                  <span>Review Entire Journey (All Steps)</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
