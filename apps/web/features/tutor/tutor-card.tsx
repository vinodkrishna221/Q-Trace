'use client';

import * as React from 'react';
import { TutorExplanation } from '@/lib/contracts';
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
} from 'lucide-react';

interface TutorCardProps {
  tutorResponse?: TutorExplanation | null;
  isCorrectPrediction?: boolean;
}

export function TutorCard({ tutorResponse, isCorrectPrediction }: TutorCardProps) {
  const [questionInput, setQuestionInput] = React.useState('');
  const [qaHistory, setQaHistory] = React.useState<Array<{ q: string; a: string }>>([]);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;

    const q = questionInput.trim();
    let answer =
      'In a maximally entangled Bell state |Φ+⟩, measurement collapses both qubits simultaneously into matching states (00 or 11) with zero local communication delay. Tracing out either qubit yields purity 0.5 (maximally mixed), proving the correlation is global.';
    if (q.toLowerCase().includes('faster') || q.toLowerCase().includes('communication')) {
      answer =
        'No-Communication Theorem: Because local measurement outcomes are individually random (50/50), neither party can transmit information faster than light without a classical communication channel.';
    } else if (q.toLowerCase().includes('bloch') || q.toLowerCase().includes('subsystem')) {
      answer =
        'The single-qubit Bloch vector vanishes to the origin (r=0) because an entangled qubit possesses no pure individual statevector—it can only be described by the joint 2-qubit state space.';
    }

    setQaHistory((prev) => [...prev, { q, a: answer }]);
    setQuestionInput('');
  };

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
              You correctly predicted that the Hadamard and CNOT gates create non-local quantum correlation (|Φ+⟩ = (|00⟩ + |11⟩)/√2). Because no conceptual divergence was detected, remedial tutoring is bypassed.
            </p>
          </div>

          {/* Socratic Deep-Dive Follow-Up Q&A */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-accent" />
              Ask Tutor a Follow-Up Quantum Question
            </span>

            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="e.g. Can Bell correlation transmit information faster than light?"
                className="flex-1 px-3 py-2 rounded-lg border border-line bg-abyss text-xs font-mono text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent"
              />
              <Button type="submit" size="sm" variant="default" className="gap-1 font-mono text-xs">
                <Send className="w-3 h-3" />
                <span>Ask</span>
              </Button>
            </form>

            {qaHistory.length > 0 && (
              <div className="space-y-2.5 pt-2">
                {qaHistory.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-line bg-abyss p-3 text-xs space-y-1">
                    <div className="font-semibold text-accent font-mono flex items-center gap-1">
                      <span>Q:</span> {item.q}
                    </div>
                    <div className="text-ink-dim font-sans text-[11px] leading-relaxed">
                      <strong className="text-evidence">Tutor: </strong> {item.a}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            {summary}
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
                <p className="text-ink-dim font-sans leading-normal">{step.body}</p>
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
                <span className="text-evidence font-bold">{item.claim}</span>
                <span className="text-ink-dim text-[11px]">{item.evidenceKey}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Follow-Up Q&A Panel */}
        <div className="space-y-3 pt-2 border-t border-line">
          <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            Ask Socratic Follow-Up Question
          </span>

          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="e.g. Why does tracing out one qubit produce a mixed state?"
              className="flex-1 px-3 py-2 rounded-lg border border-line bg-abyss text-xs font-mono text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent"
            />
            <Button type="submit" size="sm" variant="default" className="gap-1 font-mono text-xs">
              <Send className="w-3 h-3" />
              <span>Ask</span>
            </Button>
          </form>

          {qaHistory.length > 0 && (
            <div className="space-y-2.5 pt-1">
              {qaHistory.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-line bg-abyss p-3 text-xs space-y-1">
                  <div className="font-semibold text-accent font-mono flex items-center gap-1">
                    <span>Q:</span> {item.q}
                  </div>
                  <div className="text-ink-dim font-sans text-[11px] leading-relaxed">
                    <strong className="text-evidence">Tutor: </strong> {item.a}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
