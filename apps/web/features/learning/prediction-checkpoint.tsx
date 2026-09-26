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
      className="border-caution/40 shadow-lg"
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
                className="text-[11px] font-mono text-evidence flex items-center gap-1 bg-evidence/10 border border-evidence/40 px-2 py-0.5 rounded-full"
                data-testid="prediction-saved-indicator"
              >
                <Save className="w-3 h-3" />
                Draft saved ({learnerName})
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-ink-faint">ID: {checkpoint.id}</span>
        </div>

        <CardTitle className="text-base mt-1.5 flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 text-caution shrink-0 mt-0.5" />
          <span className="leading-snug">{checkpoint.prompt}</span>
        </CardTitle>

        <CardDescription className="text-xs mt-1">
          Select your prediction before executing the circuit. Quantum Flight Recorder captures this structured hypothesis to diagnose any mental model divergence.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-1" role="radiogroup" aria-label="Prediction hypothesis choices">
        {checkpoint.answerSchema.options.map((opt) => {
          const isSelected = selectedAnswer === opt;
          const isCommonMisconception = opt === 'INDEPENDENT_RANDOM';

          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`prediction-opt-${opt}`}
              onClick={() => handleSelectOption(opt)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectOption(opt);
                }
              }}
              className={`w-full text-left p-3 rounded-md transition-all flex items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? 'bg-surface-raised border border-border-strong shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                  : 'bg-surface border border-border-subtle hover:bg-surface-raised'
              }`}
            >
              <div
                className={`mt-0.5 w-[14px] h-[14px] rounded-full shrink-0 flex items-center justify-center ${
                  isSelected
                    ? 'bg-accent ring-2 ring-accent/30 border-none'
                    : 'bg-surface-sunken border border-border-medium'
                }`}
                aria-hidden="true"
              >
                {/* Active Center Node */}
                {isSelected && <div className="w-[6px] h-[6px] rounded-full bg-surface" />}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-text-primary">{opt}</span>
                <span className="font-sans text-[11px] text-text-secondary leading-relaxed mt-1">
                  {isCommonMisconception
                    ? 'Qubit 1 collapses to 50% |0⟩ or |1⟩ independently of Qubit 0'
                    : opt === 'CORRELATED_00_11'
                    ? 'Entangled state: outcomes are deterministic and correlated on every measurement'
                    : 'Assumes non-entangled independent state.'}
                </span>
              </div>
            </button>
          );
        })}
      </CardContent>

      <CardFooter className="pt-3 flex flex-wrap justify-between items-center gap-3 text-xs border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <span data-testid="selected-prediction-label" className="text-ink-dim">
            {selectedAnswer ? `Selected: ${selectedAnswer}` : 'No prediction recorded yet'}
          </span>
          {selectedAnswer && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-ink-faint hover:text-ink underline font-mono ml-2 flex items-center gap-1 cursor-pointer"
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
          className="active:scale-[0.985] transition-transform"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          {confirmed ? 'Prediction Locked · Ready to Run' : 'Confirm & Advance to Workspace'}
        </Button>
      </CardFooter>
    </Card>
  );
}
