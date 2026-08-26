'use client';

import * as React from 'react';
import { DEMO_INSTRUCTOR_INSIGHT } from '@/lib/fixtures';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, AlertTriangle, BarChart2, Radio } from 'lucide-react';

export default function InstructorPage() {
  const insight = DEMO_INSTRUCTOR_INSIGHT;

  return (
    <div className="space-y-8 max-w-5xl mx-auto" data-testid="instructor-insight-view">
      <PageHeader
        eyebrow={
          <>
            <Badge variant="warning">INSTRUCTOR INSIGHT</Badge>
            <span>Cohort: {insight.cohortId}</span>
          </>
        }
        title="Cohort Analytics & Misconceptions"
        purpose="Aggregate completion, challenge pass rates, and Flight Recorder divergence signals — evidence for what to re-teach next."
        actions={
          <div className="flex items-center gap-3 bg-panel border border-line px-4 py-2.5 rounded-lg">
            <Users className="w-5 h-5 text-accent" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                Active Learners
              </div>
              <div className="text-lg font-display font-bold text-ink">
                {insight.learnerCount} students
              </div>
            </div>
          </div>
        }
      />

      {/* Metric panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-evidence" />
              <span>Module Completion</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insight.moduleCompletion.map((m) => (
              <div key={m.moduleId} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ink">{m.moduleId}</span>
                  <span className="text-ink-dim">
                    {m.completed}/{m.assigned} ({Math.round((m.completed / m.assigned) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-raised rounded-full overflow-hidden">
                  <div
                    className="h-full bg-evidence rounded-full"
                    style={{ width: `${(m.completed / m.assigned) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent" />
              <span>Challenge Pass Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insight.challengePassRate.map((ch) => (
              <div key={ch.challengeId} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ink">{ch.challengeId}</span>
                  <span className="text-ink-dim">
                    {ch.passed}/{ch.attempted} ({Math.round(ch.rate * 100)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-raised rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${ch.rate * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-caution" />
              <span>Top Misconceptions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insight.topMisconceptions.map((disc) => (
              <div key={disc.code} className="p-2.5 rounded-lg bg-abyss border border-line text-xs">
                <div className="font-mono text-caution text-[11px] font-semibold">{disc.code}</div>
                <div className="text-[10px] text-ink-faint mt-0.5 font-mono">
                  {disc.learnerCount} learners · {disc.occurrences} detections
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Live-demo callout — connects the cohort to the demo just performed */}
      {insight.liveDemoLearner && (
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-accent/30 bg-accent/5 text-xs">
          <Radio className="w-4 h-4 text-accent shrink-0" />
          <span className="text-ink-dim">
            Live demo learner{' '}
            <span className="font-mono text-accent">{insight.liveDemoLearner.learnerProfileId}</span>
            {' '}—{' '}
            {insight.liveDemoLearner.latestAttemptPassed
              ? 'latest repair attempt: passed'
              : 'latest repair attempt: not yet passed'}
          </span>
        </div>
      )}

      {/* Disclosure footer */}
      <div className="p-3 rounded-lg border border-line bg-panel/60 text-xs text-ink-faint flex flex-wrap items-center justify-between gap-2">
        <span>{insight.dataDisclosure || 'Synthetic seeded cohort'}</span>
        <span className="font-mono text-[10px]">Generated: {insight.generatedAt}</span>
      </div>
    </div>
  );
}
