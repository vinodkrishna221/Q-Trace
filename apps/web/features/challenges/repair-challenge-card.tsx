'use client';

import * as React from 'react';
import { Challenge, ChallengeAttempt } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, CheckCircle2, Award, RefreshCw, Sparkles } from 'lucide-react';

interface RepairChallengeCardProps {
  challenge: Challenge;
  attempt?: ChallengeAttempt | null;
  isSubmitting?: boolean;
  onSubmitAttempt: () => void;
}

export function RepairChallengeCard({
  challenge,
  attempt,
  isSubmitting = false,
  onSubmitAttempt,
}: RepairChallengeCardProps) {
  const isPassed = attempt?.passed ?? false;

  return (
    <Card
      className="border-line bg-panel shadow-2xl overflow-hidden"
      data-testid="repair-challenge-card"
    >
      <CardHeader className="pb-3 border-b border-line bg-raised/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-mono">
              STEP 6 · REPAIR CHALLENGE
            </Badge>
            <span className="text-[11px] font-mono text-ink-dim">
              +{challenge.points} Points Available
            </span>
          </div>
          <span className="text-[11px] font-mono text-ink-faint">ID: {challenge.id}</span>
        </div>

        <CardTitle className="text-base text-ink flex items-center gap-2 mt-1" data-testid="challenge-title">
          <Wrench className="w-4 h-4 text-caution" />
          <span>{challenge.title}</span>
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim" data-testid="challenge-prompt">
          {challenge.prompt}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Acceptance Criteria */}
        <div className="rounded-lg border border-line bg-abyss p-4 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center text-ink-dim">
            <span className="text-ink font-bold">Deterministic Acceptance Rule:</span>
            <span className="text-caution">{challenge.acceptanceRule.kind}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-dim">
            <span>Required ideal states:</span>
            {challenge.acceptanceRule.states.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-raised border border-line text-accent font-bold"
              >
                |{s}⟩
              </span>
            ))}
            <span className="text-[10px] text-ink-faint">(tolerance ε = {challenge.acceptanceRule.epsilon})</span>
          </div>
        </div>

        {/* Attempt Feedback Box */}
        {attempt && (
          <div
            className={`rounded-lg border p-4 font-mono text-xs space-y-2 ${
              isPassed
                ? 'border-evidence/40 bg-evidence/10 text-evidence'
                : 'border-danger/40 bg-danger/10 text-danger'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-evidence" />
                <span data-testid="repair-status-badge">
                  {isPassed ? 'REPAIR ATTEMPT PASSED' : 'REPAIR ATTEMPT FAILED'}
                </span>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono text-evidence border-evidence/40">
                Score: {attempt.score} / {challenge.points}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-ink-dim text-[11px]">
              <span>Feedback Code:</span>
              <strong data-testid="repair-feedback-code" className="text-evidence">
                {attempt.feedbackCode}
              </strong>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-raised/40 p-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-ink-dim">
          <Award className="w-3.5 h-3.5 text-caution" />
          <span>Targets misconception: <strong className="text-ink font-mono">SUPERPOSITION_VS_ENTANGLEMENT</strong></span>
        </div>

        <Button
          onClick={onSubmitAttempt}
          disabled={isSubmitting || isPassed}
          data-testid="submit-repair-btn"
          className="font-semibold"
          variant={isPassed ? 'outline' : 'default'}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              <span>Grading Attempt...</span>
            </>
          ) : isPassed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-evidence" />
              <span>Challenge Passed (100 pts)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Submit Repair Attempt</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
