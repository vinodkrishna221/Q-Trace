'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_PROGRESS_RECORDS } from '@/lib/fixtures';
import { useProgressRecordQuery } from '@/lib/hooks/use-quantum-api';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Award,
  CheckCircle,
  BookOpen,
  Sparkles,
  Server,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Inbox,
  Clock,
} from 'lucide-react';

export default function ProgressPage() {
  const { activeRole, activeLearnerProfile } = useRoleStore();
  const profileId = activeLearnerProfile?.id || activeRole.profileId || 'lp_aarav';

  const {
    data: progressWithMeta,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProgressRecordQuery(profileId);

  const progress =
    progressWithMeta?.data ||
    DEMO_PROGRESS_RECORDS[profileId] ||
    DEMO_PROGRESS_RECORDS['lp_aarav'];
  const isFallback = progressWithMeta?.meta?.isFallback ?? true;
  const requestId = progressWithMeta?.meta?.requestId ?? 'req_demo_progress';

  const masteredCount = progress.skillStates.filter((s) => s.status === 'MASTERED').length;
  const isZeroState = progress.totalPoints === 0 && progress.completedModuleIds.length === 0;

  const stats = [
    { icon: Award, label: 'Total Points', value: `${progress.totalPoints} pts`, tone: 'text-caution' },
    { icon: BookOpen, label: 'Modules Completed', value: String(progress.completedModuleIds.length), tone: 'text-accent' },
    { icon: Sparkles, label: 'Skills Mastered', value: `${masteredCount}/${progress.skillStates.length}`, tone: 'text-evidence' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto" data-testid="progress-view">
      <PageHeader
        eyebrow={
          <>
            <Badge variant="default">LEARNER PROGRESS</Badge>
            <span data-testid="progress-id-badge">ID: {progress.id}</span>
          </>
        }
        title={`Progress — ${activeRole.name}`}
        purpose="Skill mastery, completed modules, and misconception history — recorded from verified simulator runs."
        actions={
          <div
            className="flex items-center gap-2 bg-panel border border-line px-3 py-1.5 rounded-lg text-xs font-mono"
            data-testid="progress-meta-badge"
          >
            <Server className="w-3.5 h-3.5 text-accent" />
            <span className="text-ink-dim">Req:</span>
            <span className="text-accent font-semibold" data-testid="progress-request-id">
              {requestId}
            </span>
            <Badge
              variant={isFallback ? 'warning' : 'outline'}
              className="text-[9px]"
              data-testid="progress-mode-badge"
            >
              {isFallback ? 'DEMO_LOCAL' : 'LIVE API'}
            </Badge>
          </div>
        }
      />

      {/* Error / Timeout Banner with Retry Action */}
      {isError && (
        <Card
          className="border-caution/50 bg-caution/10 p-4"
          data-testid="progress-error-banner"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-caution shrink-0" />
              <div className="text-xs">
                <div className="font-semibold text-ink">Progress Query Failed / Timed Out</div>
                <div className="text-ink-dim">
                  {error?.message || 'Unable to fetch learner progress record from backend.'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs font-mono shrink-0 cursor-pointer"
              data-testid="retry-progress-query-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
              Retry Query
            </Button>
          </div>
        </Card>
      )}

      {/* Loading Skeleton when explicitly loading without data */}
      {isLoading && !progressWithMeta && (
        <div className="space-y-6" data-testid="progress-loading-skeleton">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State Banner (if new learner with 0 points/modules) */}
      {isZeroState && (
        <Card className="p-6 border-line bg-panel/60" data-testid="progress-empty-state">
          <CardContent className="p-0 flex items-center gap-4">
            <Inbox className="w-8 h-8 text-accent shrink-0" />
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-ink">Welcome, {activeRole.name}! Your record is ready.</div>
              <div className="text-ink-dim">
                Start with the Bell State module in the Learn tab to earn points, resolve misconceptions, and master skills.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="progress-stats-strip">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-abyss ${s.tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                    {s.label}
                  </div>
                  <div className="text-2xl font-display font-bold text-ink" data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {s.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completed Modules */}
        <Card data-testid="completed-modules-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {progress.completedModuleIds.length > 0 ? (
              progress.completedModuleIds.map((modId) => (
                <div
                  key={modId}
                  className="flex items-center gap-2 text-xs text-ink font-mono p-2 rounded-lg bg-abyss border border-line"
                  data-testid={`completed-module-${modId}`}
                >
                  <CheckCircle className="w-4 h-4 text-evidence shrink-0" />
                  <span className="font-semibold">{modId}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-ink-faint leading-relaxed p-3 bg-abyss rounded-lg border border-line">
                No completed modules yet — complete the Bell-state lab to record mastery.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skill Competency */}
        <Card className="md:col-span-2" data-testid="skill-competency-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Skill Competency & Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {progress.skillStates.map((skill) => (
              <div
                key={skill.skillId}
                className="p-3 rounded-lg bg-abyss border border-line space-y-2"
                data-testid={`skill-card-${skill.skillId}`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-ink font-semibold">{skill.skillId}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ink-dim">{skill.score}%</span>
                    <Badge
                      variant={skill.status === 'MASTERED' ? 'success' : 'warning'}
                      className="text-[10px]"
                      data-testid={`skill-badge-${skill.skillId}`}
                    >
                      {skill.status}
                    </Badge>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-raised rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      skill.status === 'MASTERED' ? 'bg-evidence' : 'bg-caution'
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Misconception Summary Table */}
      <Card data-testid="misconception-history-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-caution" />
            <span>Misconception & Divergence History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress.misconceptionSummary.length > 0 ? (
            <div className="divide-y divide-line rounded-lg border border-line bg-abyss overflow-hidden text-xs">
              {progress.misconceptionSummary.map((item) => (
                <div
                  key={item.code}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  data-testid={`misconception-item-${item.code}`}
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-caution font-bold">{item.code}</span>
                    <div className="text-[10px] text-ink-faint">
                      Identified and resolved via Quantum Flight Recorder
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-ink-dim font-mono text-[11px]">
                    <span>Count: <strong className="text-ink">{item.count}</strong></span>
                    <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                      <Clock className="w-3 h-3" />
                      {item.latestAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-xs text-ink-faint leading-relaxed p-3 bg-abyss rounded-lg border border-line"
              data-testid="no-misconceptions-note"
            >
              No active misconceptions recorded — mental model verified on completed runs.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
