'use client';

import * as React from 'react';
import { DEMO_INSTRUCTOR_INSIGHT } from '@/lib/fixtures';
import { useInstructorInsightQuery } from '@/lib/hooks/use-quantum-api';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CohortAnalyticsChart } from '@/features/instructor/cohort-analytics-chart';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  BarChart2,
  Radio,
  Server,
  RefreshCw,
  AlertCircle,
  Inbox,
} from 'lucide-react';

export default function InstructorPage() {
  const {
    data: insightWithMeta,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useInstructorInsightQuery('cohort_demo_2026');

  const insight = insightWithMeta?.data || DEMO_INSTRUCTOR_INSIGHT;
  const isFallback = insightWithMeta?.meta?.isFallback ?? true;
  const requestId = insightWithMeta?.meta?.requestId ?? 'req_demo_instructor';

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
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 bg-panel border border-line px-3 py-2 rounded-lg text-xs font-mono"
              data-testid="instructor-meta-badge"
            >
              <Server className="w-3.5 h-3.5 text-accent" />
              <span className="text-ink-dim">Req:</span>
              <span className="text-accent font-semibold" data-testid="instructor-request-id">
                {requestId}
              </span>
              <Badge
                variant={isFallback ? 'warning' : 'outline'}
                className="text-[9px]"
                data-testid="instructor-mode-badge"
              >
                {isFallback ? 'DEMO_LOCAL' : 'LIVE API'}
              </Badge>
            </div>

            <div className="flex items-center gap-3 bg-panel border border-line px-4 py-2.5 rounded-lg">
              <Users className="w-5 h-5 text-accent" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                  Active Learners
                </div>
                <div className="text-lg font-display font-bold text-ink" data-testid="active-learners-count">
                  {insight.learnerCount} students
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* Error / Timeout Banner with Retry Action */}
      {isError && (
        <Card
          className="border-caution/50 bg-caution/10 p-4"
          data-testid="instructor-error-banner"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-caution shrink-0" />
              <div className="text-xs">
                <div className="font-semibold text-ink">Telemetry Query Failed / Timed Out</div>
                <div className="text-ink-dim">
                  {error?.message || 'Unable to fetch aggregate cohort analytics from backend.'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs font-mono shrink-0 cursor-pointer"
              data-testid="retry-instructor-query-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
              Retry Query
            </Button>
          </div>
        </Card>
      )}

      {/* Loading Skeleton when explicitly loading without data */}
      {isLoading && !insightWithMeta && (
        <div className="space-y-6" data-testid="instructor-loading-skeleton">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-24" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {insight.learnerCount === 0 && (
        <Card className="p-8 text-center border-line bg-panel" data-testid="instructor-empty-state">
          <CardContent className="space-y-3 flex flex-col items-center">
            <Inbox className="w-10 h-10 text-ink-faint" />
            <div className="text-sm font-semibold text-ink">No Cohort Telemetry Recorded</div>
            <div className="text-xs text-ink-dim max-w-sm">
              No learners have completed module simulations or submitted repair attempts for cohort {insight.cohortId}.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Three Metric Cards */}
      {insight.learnerCount > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="instructor-three-cards">
            {/* Card 1: Module Completion */}
            <Card data-testid="instructor-module-completion-card">
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
                        {m.completed}/{m.assigned} ({Math.round((m.completed / (m.assigned || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-evidence rounded-full"
                        style={{ width: `${(m.completed / (m.assigned || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Card 2: Challenge Pass Rate */}
            <Card data-testid="instructor-challenge-passrate-card">
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

            {/* Card 3: Top Misconceptions */}
            <Card data-testid="instructor-top-misconceptions-card">
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

          {/* Dedicated 1-Chart: Cohort Analytics Visualization */}
          <CohortAnalyticsChart insight={insight} />

          {/* Live-demo callout — connects the cohort to the demo just performed */}
          {insight.liveDemoLearner && (
            <div
              className="flex items-center gap-3 p-3.5 rounded-lg border border-accent/30 bg-accent/5 text-xs"
              data-testid="instructor-live-learner-callout"
            >
              <Radio className="w-4 h-4 text-accent shrink-0" />
              <span className="text-ink-dim">
                Live demo learner{' '}
                <span className="font-mono text-accent font-semibold">
                  {insight.liveDemoLearner.learnerProfileId}
                </span>
                {' '}—{' '}
                {insight.liveDemoLearner.latestAttemptPassed
                  ? 'latest repair attempt: passed'
                  : 'latest repair attempt: not yet passed'}
              </span>
            </div>
          )}

          {/* Disclosure footer */}
          <div
            className="p-3 rounded-lg border border-line bg-panel/60 text-xs text-ink-faint flex flex-wrap items-center justify-between gap-2"
            data-testid="instructor-disclosure-footer"
          >
            <span>{insight.dataDisclosure || 'Synthetic seeded cohort plus current live demo attempt'}</span>
            <span className="font-mono text-[10px]">Generated: {insight.generatedAt}</span>
          </div>
        </>
      )}
    </div>
  );
}
