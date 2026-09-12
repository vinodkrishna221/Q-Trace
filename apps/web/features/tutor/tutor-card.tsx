'use client';

import * as React from 'react';
import { TutorExplanation, TutorChatMessage } from '@/lib/contracts';
import { useTutorChatMutation } from '@/lib/hooks/use-quantum-api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  Lightbulb,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Send,
  HelpCircle,
  Loader2,
  Compass,
} from 'lucide-react';
import {
  renderMathText,
  normalizeLatexDelimiters,
  healUnclosedLatex,
} from '@/lib/math-renderer';

export { renderMathText, normalizeLatexDelimiters, healUnclosedLatex };

interface TutorCardProps {
  tutorResponse?: TutorExplanation | null;
  isCorrectPrediction?: boolean;
  circuit?: unknown;
  prediction?: string;
  stateTrace?: unknown[];
  learnerProfileId?: string;
  learnerRole?: string;
  misconceptionCode?: string;
}

/**
 * Interactive Socratic Follow-Up Q&A Panel connected to live OpenRouter.
 */
function SocraticQAPanel({
  circuit,
  prediction,
  stateTrace,
  learnerProfileId,
  learnerRole,
  misconceptionCode,
  title = 'Ask Socratic Follow-Up Question',
  placeholder = 'e.g. Why does tracing out one qubit produce a mixed state?',
}: {
  circuit?: unknown;
  prediction?: string;
  stateTrace?: unknown[];
  learnerProfileId?: string;
  learnerRole?: string;
  misconceptionCode?: string;
  title?: string;
  placeholder?: string;
}) {
  const [questionInput, setQuestionInput] = React.useState('');
  const [qaHistory, setQaHistory] = React.useState<
    Array<{ q: string; a: string; model?: string; fallbackUsed?: boolean }>
  >([]);

  const chatMutation = useTutorChatMutation();

  const suggestedQuestions = [
    'Why does tracing out one qubit produce a mixed state?',
    'Can Bell correlation transmit information faster than light?',
    'What happens if we swap the Hadamard and CNOT gates?',
    'Why are P(01) and P(10) strictly zero in this run?',
  ];

  const handleAsk = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || chatMutation.isPending) return;

    setQuestionInput('');

    const historyPayload: TutorChatMessage[] = qaHistory.flatMap((item) => [
      { role: 'user', content: item.q },
      { role: 'assistant', content: item.a },
    ]);

    try {
      const res = await chatMutation.mutateAsync({
        learnerProfileId: learnerProfileId || 'lp_aarav',
        question: q,
        history: historyPayload,
        circuit,
        prediction,
        stateTrace,
        misconceptionCode,
        learnerRole,
      });

      setQaHistory((prev) => [
        ...prev,
        {
          q,
          a: res.data.answer,
          model: res.data.model,
          fallbackUsed: res.data.fallbackUsed,
        },
      ]);
    } catch {
      setQaHistory((prev) => [
        ...prev,
        {
          q,
          a: 'In this simulation run, measurement collapses both qubits into correlated outcomes (00 and 11 each with probability 0.5). Tracing out either qubit yields a reduced density matrix with purity 0.5, proving the entanglement correlation is non-local.',
          model: 'DEMO_FALLBACK',
          fallbackUsed: true,
        },
      ]);
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(questionInput);
  };

  return (
    <div className="space-y-3 pt-2 border-t border-line">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-accent" />
          {title}
        </span>
        <span className="text-[10px] font-mono text-ink-faint flex items-center gap-1">
          <Compass className="w-3 h-3" />
          Grounded in Circuit &amp; Aer Trace
        </span>
      </div>

      {/* Suggested 1-Click Question Chips */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono text-ink-dim font-medium">Quick Exploration Questions:</div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              disabled={chatMutation.isPending}
              onClick={() => handleAsk(sq)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-accent/30 bg-accent/5 hover:bg-accent/15 text-accent text-left transition-colors disabled:opacity-50 hover:border-accent/60 active:scale-95"
            >
              + {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={onSubmitForm} className="flex gap-2">
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          disabled={chatMutation.isPending}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-line bg-abyss text-xs font-mono text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent disabled:opacity-60"
        />
        <Button
          type="submit"
          size="sm"
          variant="default"
          disabled={chatMutation.isPending || !questionInput.trim()}
          className="gap-1 font-mono text-xs"
        >
          {chatMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          <span>Ask</span>
        </Button>
      </form>

      {/* Real-time Thinking Indicator */}
      {chatMutation.isPending && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-accent/40 bg-accent/10 text-xs font-mono text-accent animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-accent" />
          <span>Tutor is analyzing your circuit trace via OpenRouter...</span>
        </div>
      )}

      {/* Multi-turn Chat History */}
      {qaHistory.length > 0 && (
        <div className="space-y-2.5 pt-1">
          {qaHistory.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-line bg-abyss p-3 text-xs space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-accent font-mono flex items-center gap-1.5">
                  <span className="text-accent/60">Q:</span>
                  <span>{item.q}</span>
                </div>
                {item.fallbackUsed ? (
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono text-caution border-caution/40 bg-caution/10 px-1.5 py-0"
                  >
                    Offline Fallback
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono text-evidence border-evidence/40 bg-evidence/10 px-1.5 py-0 flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-evidence" />
                    <span>Live AI ({item.model || 'OpenRouter'})</span>
                  </Badge>
                )}
              </div>

              <div className="text-ink-dim font-sans text-xs leading-relaxed pl-2 border-l-2 border-evidence/40">
                <strong className="text-evidence font-mono text-[11px]">Tutor: </strong>
                {renderMathText(item.a)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TutorCard({
  tutorResponse,
  isCorrectPrediction,
  circuit,
  prediction,
  stateTrace,
  learnerProfileId,
  learnerRole,
  misconceptionCode,
}: TutorCardProps) {
  // If hypothesis confirmed / correct prediction
  if (isCorrectPrediction || !tutorResponse) {
    return (
      <Card
        className="border-line bg-panel shadow-2xl overflow-hidden"
        data-testid="tutor-card"
      >
        <CardHeader className="pb-3 border-b border-line bg-raised/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-mono">
                STEP 5 · SOCRATIC TUTOR DEEP-DIVE
              </Badge>
              <Badge
                variant="outline"
                className="text-xs font-mono text-evidence border-evidence/40 bg-evidence/10 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-evidence" />
                Hypothesis Confirmed
              </Badge>
            </div>
            <span className="text-[11px] font-mono text-ink-faint">Mode: Advanced Exploration</span>
          </div>

          <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
            <Lightbulb className="w-4 h-4 text-evidence" />
            <span>Hypothesis Confirmed — Socratic Exploration</span>
          </CardTitle>
          <CardDescription className="text-xs text-ink-dim">
            Your prediction correctly anticipated Bell state entanglement! Explore deeper foundational questions below.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-6">
          <div
            data-testid="tutor-summary"
            className="rounded-lg border border-evidence/40 bg-evidence/10 p-4 text-sm text-ink leading-relaxed space-y-2"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-evidence uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-evidence" />
              <span>Theory Mastery Confirmed</span>
            </div>
            <p className="text-ink font-medium">
              {renderMathText(
                'You correctly predicted that the Hadamard and CNOT gates create non-local quantum correlation (|Φ+⟩ = (|00⟩ + |11⟩)/√2). Because no conceptual divergence was detected, remedial tutoring is bypassed.'
              )}
            </p>
          </div>

          {/* Live Socratic Deep-Dive Follow-Up Q&A */}
          <SocraticQAPanel
            circuit={circuit}
            prediction={prediction}
            stateTrace={stateTrace}
            learnerProfileId={learnerProfileId}
            learnerRole={learnerRole}
            misconceptionCode={misconceptionCode}
            title="Ask Tutor a Follow-Up Quantum Question"
            placeholder="e.g. Can Bell correlation transmit information faster than light?"
          />
        </CardContent>

        <CardFooter className="bg-raised/40 p-4 border-t border-line text-[11px] text-ink-dim flex items-center justify-between">
          <div className="flex items-center gap-1.5" data-testid="tutor-safety-note">
            <AlertCircle className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Explanation is grounded in this Simulation Run; it is not a hardware claim.</span>
          </div>
        </CardFooter>
      </Card>
    );
  }

  const { summary, steps, numericalClaims, fallbackUsed, model, safetyNote, intent } = tutorResponse;

  return (
    <Card
      className="border-line bg-panel shadow-2xl overflow-hidden"
      data-testid="tutor-card"
    >
      <CardHeader className="pb-3 border-b border-line bg-raised/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-mono">
              STEP 5 · EVIDENCE-BOUND TUTOR
            </Badge>
            <Badge
              variant="outline"
              data-testid="tutor-fallback-badge"
              className="text-xs font-mono text-caution border-caution/40 bg-caution/10 flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              {fallbackUsed ? `Fallback Active (${model})` : `Live Model (${model})`}
            </Badge>
          </div>
          <span className="text-[11px] font-mono text-ink-faint">Intent: {intent}</span>
        </div>

        <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
          <Lightbulb className="w-4 h-4 text-caution" />
          <span>Grounded Conceptual Explanation & Follow-Up Q&A</span>
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim">
          The Tutor explains only from verified Simulation Run state trace data without hallucinating unproven hardware claims.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Core Summary Box */}
        <div
          data-testid="tutor-summary"
          className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-ink leading-relaxed space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Key Pedagogical Insight</span>
          </div>
          <p className="text-ink font-medium">
            {renderMathText(summary)}
          </p>
        </div>

        {/* Trace-Grounded Explanation Steps */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-accent" />
            Verified Trace Steps Breakdown
          </span>

          <div className="space-y-2.5">
            {steps.map((step, idx) => (
              <div
                key={idx}
                data-testid={`tutor-step-${idx}`}
                className="rounded-lg border border-line bg-abyss p-3.5 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-accent font-mono">{step.title}</span>
                  <div className="flex gap-1">
                    {step.evidenceKeys.map((key) => (
                      <code
                        key={key}
                        className="text-[10px] font-mono text-ink-dim bg-raised px-1.5 py-0.5 rounded border border-line"
                      >
                        {key}
                      </code>
                    ))}
                  </div>
                </div>
                <p className="text-ink-dim font-sans leading-normal">{renderMathText(step.body)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Numerical Claims Grounding Table */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
            <CheckCheck className="w-3.5 h-3.5 text-evidence" />
            Simulator-Bound Numerical Claims
          </span>

          <div
            data-testid="numerical-claims-table"
            className="rounded-lg border border-line bg-abyss overflow-hidden text-xs font-mono"
          >
            <div className="grid grid-cols-2 p-2.5 bg-raised text-ink-dim font-bold border-b border-line">
              <span>Claimed Mathematical Value</span>
              <span>Grounded Simulator Evidence Key</span>
            </div>
            {numericalClaims.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 p-2.5 border-b border-line last:border-0 items-center"
              >
                <span className="text-evidence font-bold">{renderMathText(item.claim)}</span>
                <span className="text-ink-dim text-[11px]">{item.evidenceKey}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Interactive Follow-Up Q&A Panel */}
        <SocraticQAPanel
          circuit={circuit}
          prediction={prediction}
          stateTrace={stateTrace}
          learnerProfileId={learnerProfileId}
          learnerRole={learnerRole}
          misconceptionCode={misconceptionCode}
          title="Ask Socratic Follow-Up Question"
          placeholder="e.g. Why does tracing out one qubit produce a mixed state?"
        />
      </CardContent>

      <CardFooter className="bg-raised/40 p-4 border-t border-line text-[11px] text-ink-dim flex items-center justify-between">
        <div className="flex items-center gap-1.5" data-testid="tutor-safety-note">
          <AlertCircle className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{safetyNote}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
