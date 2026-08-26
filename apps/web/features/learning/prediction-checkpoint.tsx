'use client';

import * as React from 'react';
import { PredictionCheckpoint as PredictionCheckpointType } from '@/lib/contracts';
import { usePredictionStore } from '@/lib/prediction-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, CheckCircle2, Save, Play, RotateCcw, AlertTriangle } from 'lucide-react';

interface PredictionCheckpointProps {
  checkpoint: PredictionCheckpointType;
  learnerProfileId: string;
  learnerName: string;
  moduleId: string;
  onConfirm?: (answer: string) => void;
}

export function PredictionCheckpoint({
  checkpoint,
  learnerProfileId,
  learnerName,
  moduleId,
  onConfirm,
}: PredictionCheckpointProps) {
  const { drafts, setPredictionDraft, clearPredictionDraft } = usePredictionStore();
  const draftKey = `${learnerProfileId}:${moduleId}`;
  const currentDraft = drafts[draftKey] || null;
  const selectedAnswer = currentDraft?.answer || null;

  const [confirmed, setConfirmed] = React.useState(false);

  const handleSelectOption = (option: string) => {
    setPredictionDraft(learnerProfileId, moduleId, checkpoint.id, option);
    setConfirmed(false);
  };

  const handleClear = () => {
    clearPredictionDraft(learnerProfileId, moduleId);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if (!selectedAnswer) return;
    setConfirmed(true);
    if (onConfirm) {
      onConfirm(selectedAnswer);
    }
  };

  return (
    <Card
      className="border-cyan-900/60 bg-gradient-to-b from-zinc-900/90 to-zinc-950 shadow-xl"
      data-testid="prediction-checkpoint-card"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-xs font-mono">
              STEP 1 · PREDICTION CHECKPOINT
            </Badge>
            {selectedAnswer && (
              <span
                className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded"
                data-testid="prediction-saved-indicator"
              >
                <Save className="w-3 h-3" />
                Draft saved ({learnerName})
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-zinc-500">ID: {checkpoint.id}</span>
        </div>

        <CardTitle className="text-base text-white mt-1.5 flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{checkpoint.prompt}</span>
        </CardTitle>

        <CardDescription className="text-xs text-zinc-400 mt-1">
          Select your prediction before executing the circuit. Quantum Flight Recorder captures this structured hypothesis to diagnose any mental model divergence.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-1">
        {checkpoint.answerSchema.options.map((opt) => {
          const isSelected = selectedAnswer === opt;
          const isCommonMisconception = opt === 'INDEPENDENT_RANDOM';

          return (
            <button
              key={opt}
              type="button"
              data-testid={`prediction-opt-${opt}`}
              onClick={() => handleSelectOption(opt)}
              className={`w-full text-left p-3.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between border cursor-pointer ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/50 text-cyan-100 ring-1 ring-cyan-400 shadow-md'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                    isSelected ? 'border-cyan-400 bg-cyan-400 text-black font-bold' : 'border-zinc-700 bg-zinc-950'
                  }`}
                >
                  {isSelected && '✓'}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-200">{opt}</span>
                  {isCommonMisconception && (
                    <span className="text-[10px] text-amber-400/80 font-sans flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Assumes qubits remain independent after CNOT
                    </span>
                  )}
                  {opt === 'CORRELATED_00_11' && (
                    <span className="text-[10px] text-cyan-400/80 font-sans mt-0.5">
                      Entangled state: 50% |00⟩ + 50% |11⟩
                    </span>
                  )}
                </div>
              </div>

              {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
            </button>
          );
        })}
      </CardContent>

      <CardFooter className="pt-3 flex flex-wrap justify-between items-center gap-3 text-xs text-zinc-400 border-t border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span data-testid="selected-prediction-label" className="text-zinc-300">
            {selectedAnswer ? `Selected: ${selectedAnswer}` : 'No prediction recorded yet'}
          </span>
          {selectedAnswer && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 underline font-mono ml-2 flex items-center gap-1 cursor-pointer"
              data-testid="clear-prediction-btn"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        <Button
          size="sm"
          data-testid="confirm-prediction-btn"
          disabled={!selectedAnswer}
          onClick={handleConfirm}
          className={`font-semibold transition-all ${
            selectedAnswer
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          {confirmed ? 'Prediction Locked · Ready to Run' : 'Confirm & Advance to Workspace'}
        </Button>
      </CardFooter>
    </Card>
  );
}
