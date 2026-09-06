'use client';

import * as React from 'react';
import { ProgressRecord } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, TrendingUp, ShieldCheck, Star } from 'lucide-react';

interface ProgressSuccessCardProps {
  progress: ProgressRecord;
  learnerName?: string;
}

export function ProgressSuccessCard({
  progress,
  learnerName = 'Aarav',
}: ProgressSuccessCardProps) {
  return (
    <Card
      className="border-line bg-panel shadow-2xl overflow-hidden"
      data-testid="progress-success-card"
    >
      <CardHeader className="pb-3 border-b border-line bg-raised/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-mono">
              STEP 7 · PROGRESS & MASTERY RECORD
            </Badge>
            <span className="text-xs font-bold text-evidence flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Module Completed
            </span>
          </div>
          <span className="text-[11px] font-mono text-ink-faint">ID: {progress.id}</span>
        </div>

        <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
          <Award className="w-4 h-4 text-evidence" />
          <span>Learner Progress Update · {learnerName}</span>
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim">
          Atomic update after completing Bell State repair challenge and resolving mental model divergence.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Points & Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-evidence/40 bg-evidence/10 p-3.5 text-center">
            <span className="text-[11px] text-evidence font-mono block mb-1">Total Points</span>
            <div
              data-testid="total-points-display"
              className="text-2xl font-bold text-evidence font-mono flex items-center justify-center gap-1"
            >
              <Star className="w-5 h-5 text-caution fill-caution" />
              <span>{progress.totalPoints} pts</span>
            </div>
            <span className="text-[10px] text-evidence/80 font-mono">+100 from Bell Repair</span>
          </div>

          <div className="rounded-lg border border-line bg-abyss p-3.5 text-center" data-testid="completed-modules-list">
            <span className="text-[11px] text-ink-dim font-mono block mb-1">Completed Modules</span>
            <div className="text-xl font-bold text-ink font-mono">
              {progress.completedModuleIds.length} Modules
            </div>
            <span className="text-[10px] text-ink-faint font-mono">
              {progress.completedModuleIds.join(', ')}
            </span>
          </div>

          <div className="rounded-lg border border-line bg-abyss p-3.5 text-center">
            <span className="text-[11px] text-ink-dim font-mono block mb-1">Misconceptions Resolved</span>
            <div className="text-xl font-bold text-caution font-mono">
              {progress.misconceptionSummary.length}
            </div>
            <span className="text-[10px] text-caution/80 font-mono">
              SUPERPOSITION_VS_ENTANGLEMENT
            </span>
          </div>
        </div>

        {/* Skill States Breakdown */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-evidence" />
            Verified Skill States
          </span>

          <div className="space-y-2">
            {progress.skillStates.map((skill) => {
              const isMastered = skill.status === 'MASTERED';

              return (
                <div
                  key={skill.skillId}
                  data-testid={`skill-status-${skill.skillId}`}
                  className="rounded-lg border border-line bg-abyss p-3 flex items-center justify-between font-mono text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isMastered ? 'bg-evidence ring-2 ring-evidence/30' : 'bg-accent'
                      }`}
                    />
                    <div>
                      <span className="font-bold text-ink block">{skill.skillId}</span>
                      <span className="text-[10px] text-ink-faint font-sans">
                        Score: {skill.score}/100
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono ${
                      isMastered
                        ? 'text-evidence border-evidence/40 bg-evidence/10 font-bold'
                        : 'text-accent border-accent/40 bg-accent/10'
                    }`}
                  >
                    {skill.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-raised/40 p-4 border-t border-line text-[11px] text-ink-dim flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-evidence" />
          <span>Synchronized with Dr. Rao&apos;s Instructor Insight aggregate cohort records.</span>
        </div>
        <span className="text-ink-faint font-mono">Updated: {progress.updatedAt}</span>
      </CardFooter>
    </Card>
  );
}
