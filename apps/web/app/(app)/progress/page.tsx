'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_PROGRESS_RECORDS } from '@/lib/fixtures';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, BookOpen, Sparkles } from 'lucide-react';

export default function ProgressPage() {
  const { activeRole, activeLearnerProfile } = useRoleStore();
  const profileId = activeLearnerProfile?.id || 'lp_aarav';
  const progress = DEMO_PROGRESS_RECORDS[profileId] || DEMO_PROGRESS_RECORDS['lp_aarav'];

  const masteredCount = progress.skillStates.filter((s) => s.status === 'MASTERED').length;

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
            <span>ID: {progress.id}</span>
          </>
        }
        title={`Progress — ${activeRole.name}`}
        purpose="Skill mastery, completed modules, and misconception history — recorded from verified simulator runs."
      />

      {/* Stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <div className="text-2xl font-display font-bold text-ink">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {progress.completedModuleIds.length > 0 ? (
              progress.completedModuleIds.map((modId) => (
                <div key={modId} className="flex items-center gap-2 text-xs text-ink font-mono p-2 rounded-lg bg-abyss border border-line">
                  <CheckCircle className="w-4 h-4 text-evidence" />
                  <span>{modId}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-ink-faint leading-relaxed">
                No completed modules yet — finish the Bell-state lab to begin the record.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Skill Competency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {progress.skillStates.map((skill) => (
              <div
                key={skill.skillId}
                className="p-3 rounded-lg bg-abyss border border-line space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-ink">{skill.skillId}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ink-dim">{skill.score}%</span>
                    <Badge variant={skill.status === 'MASTERED' ? 'success' : 'warning'} className="text-[10px]">
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
    </div>
  );
}
