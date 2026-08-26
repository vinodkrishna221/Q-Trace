'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_MODULES, DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';
import { PriorKnowledgeBadge } from '@/features/learning/prior-knowledge-badge';
import { ConceptBlocks } from '@/features/learning/concept-blocks';
import { PredictionCheckpoint } from '@/features/learning/prediction-checkpoint';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Cpu, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function BellStateLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const moduleData = DEMO_MODULES['bell-state'];

  const learnerProfileId = activeLearnerProfile?.id || activeRole.profileId || 'lp_aarav';
  const learnerName = activeRole.name;

  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="learn-bell-state-view">
      {/* Module Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="default" className="text-xs">
              {moduleData.level} MODULE
            </Badge>
            <span className="text-zinc-500 text-xs flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {moduleData.estimatedMinutes} mins
            </span>
            <Badge variant="outline" className="text-[11px] font-mono text-zinc-400">
              ID: {moduleData.id}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {moduleData.title}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Build, simulate and diagnose an entangled two-qubit Bell pair state with Qiskit Aer evidence.
          </p>
        </div>

        {/* Current Learner Context Banner */}
        <div
          className="flex flex-col items-start md:items-end bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg text-xs"
          data-testid="learner-context-banner"
        >
          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
            <span>Learner:</span>
            <span className="text-cyan-400 font-bold" data-testid="active-learner-name">
              {activeRole.name}
            </span>
            <span className="text-zinc-500">({activeRole.roleTag})</span>
          </div>
          {activeLearningPath && (
            <div className="text-[11px] text-zinc-400 mt-1 max-w-xs text-left md:text-right">
              {activeLearningPath.recommendationReason}
            </div>
          )}
        </div>
      </div>

      {/* Prior Knowledge & Entry Path Badge */}
      <PriorKnowledgeBadge
        activeRole={activeRole}
        learnerProfile={activeLearnerProfile}
        learningPath={activeLearningPath}
      />

      {/* Main Lesson Content & Prediction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Concept Blocks Component */}
          <ConceptBlocks contentBlocks={moduleData.contentBlocks} />

          {/* Prediction Checkpoint Component with Client Draft Persistence */}
          {moduleData.predictionCheckpoint && (
            <PredictionCheckpoint
              checkpoint={moduleData.predictionCheckpoint}
              learnerProfileId={learnerProfileId}
              learnerName={learnerName}
              moduleId={moduleData.id}
            />
          )}
        </div>

        {/* Sidebar / Circuit Workspace Preview Shell */}
        <div className="space-y-6">
          <Card className="border-zinc-800" data-testid="starter-circuit-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-zinc-200">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Starter Circuit ({DEMO_STARTER_CIRCUIT.name})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {DEMO_STARTER_CIRCUIT.qubitCount} qubits · {DEMO_STARTER_CIRCUIT.operations.length} operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded bg-zinc-950 p-3 border border-zinc-850 font-mono text-xs text-zinc-400 space-y-1.5">
                {DEMO_STARTER_CIRCUIT.operations.map((op) => (
                  <div key={op.opId} className="flex justify-between items-center bg-zinc-900/50 p-1.5 rounded border border-zinc-800/40">
                    <span className="text-cyan-300 font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                      {op.gate}
                    </span>
                    <span>targets: [{op.targets.join(', ')}]</span>
                    {op.controls.length > 0 && (
                      <span className="text-amber-400">ctrl: [{op.controls.join(', ')}]</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono bg-zinc-950 p-2 rounded border border-zinc-850">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target: Qiskit Aer (1024 shots)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/40" data-testid="demo-path-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demonstration Path (Hero Flow)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-medium">
                <div className="w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
                <span>1. Predict measurement outcome pattern</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span>2. Simulate Bell Circuit on Aer</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span>3. Quantum Flight Recorder Diagnosis</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span>4. Evidence-Grounded Repair Challenge</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
