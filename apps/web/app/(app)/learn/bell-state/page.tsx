'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_MODULES, DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, HelpCircle, Cpu, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BellStateLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const moduleData = DEMO_MODULES['bell-state'];

  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);

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
        <div className="flex flex-col items-start md:items-end bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg text-xs" data-testid="learner-context-banner">
          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
            <span>Learner:</span>
            <span className="text-cyan-400 font-bold" data-testid="active-learner-name">{activeRole.name}</span>
            <span className="text-zinc-500">({activeRole.roleTag})</span>
          </div>
          {activeLearningPath && (
            <div className="text-[11px] text-zinc-400 mt-1 max-w-xs text-left md:text-right">
              {activeLearningPath.recommendationReason}
            </div>
          )}
        </div>
      </div>

      {/* Lesson Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Concept Blocks */}
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Concept Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              {moduleData.contentBlocks.map((block, idx) => {
                if (block.type === 'TEXT') {
                  return <p key={idx}>{block.body}</p>;
                }
                if (block.type === 'CALLOUT') {
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex gap-2.5 items-start"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{block.body}</span>
                    </div>
                  );
                }
                if (block.type === 'FORMULA') {
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-center text-cyan-300 text-sm tracking-wide"
                    >
                      {block.latex}
                    </div>
                  );
                }
                return null;
              })}
            </CardContent>
          </Card>

          {/* Prediction Checkpoint */}
          {moduleData.predictionCheckpoint && (
            <Card className="border-cyan-900/60 bg-gradient-to-b from-zinc-900/90 to-zinc-950" data-testid="prediction-checkpoint-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="warning" className="text-xs">
                    STEP 1 · PREDICTION CHECKPOINT
                  </Badge>
                  <span className="text-[11px] font-mono text-zinc-500">
                    ID: {moduleData.predictionCheckpoint.id}
                  </span>
                </div>
                <CardTitle className="text-base text-white mt-1 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>{moduleData.predictionCheckpoint.prompt}</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Select your prediction before executing the circuit. Quantum Flight Recorder uses this to test for mental-model divergence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-1">
                {moduleData.predictionCheckpoint.answerSchema.options.map((opt) => {
                  const isSelected = selectedAnswer === opt;
                  return (
                    <button
                      key={opt}
                      data-testid={`prediction-opt-${opt}`}
                      onClick={() => setSelectedAnswer(opt)}
                      className={`w-full text-left p-3 rounded-lg text-xs font-mono transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </CardContent>
              <CardFooter className="pt-2 flex justify-between items-center text-xs text-zinc-400 border-t border-zinc-800/60">
                <span>{selectedAnswer ? `Selected: ${selectedAnswer}` : 'No prediction recorded yet'}</span>
                <Button
                  size="sm"
                  disabled={!selectedAnswer}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  Confirm & Advance to Workspace
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Sidebar / Circuit Workspace Preview Shell */}
        <div className="space-y-6">
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-zinc-200">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Starter Circuit ({DEMO_STARTER_CIRCUIT.name})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {DEMO_STARTER_CIRCUIT.qubitCount} qubits · {DEMO_STARTER_CIRCUIT.operations.length} gates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded bg-zinc-950 p-3 border border-zinc-850 font-mono text-xs text-zinc-400 space-y-1">
                {DEMO_STARTER_CIRCUIT.operations.map((op) => (
                  <div key={op.opId} className="flex justify-between">
                    <span className="text-cyan-300 font-bold">{op.gate}</span>
                    <span>targets: [{op.targets.join(', ')}]</span>
                    {op.controls.length > 0 && <span className="text-amber-400">ctrl: [{op.controls.join(', ')}]</span>}
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-zinc-500">
                Execution target: <span className="text-zinc-400 font-mono">Qiskit Aer (1024 shots)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-300">
                Demonstration Path
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>1. Predict measurement behavior</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>2. Simulate Bell Circuit on Aer</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>3. Quantum Flight Recorder Diagnosis</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>4. Evidence-Grounded Repair Challenge</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
