'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_PROGRESS_RECORDS } from '@/lib/fixtures';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Clock, BookOpen, AlertOctagon } from 'lucide-react';

export default function ProgressPage() {
  const { activeRole, activeLearnerProfile } = useRoleStore();
  const profileId = activeLearnerProfile?.id || 'lp_aarav';
  const progress = DEMO_PROGRESS_RECORDS[profileId] || DEMO_PROGRESS_RECORDS['lp_aarav'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="progress-view">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="default" className="text-xs">LEARNER PROGRESS RECORD</Badge>
            <Badge variant="outline" className="text-[11px] font-mono text-zinc-400">ID: {progress.id}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Progress for {activeRole.name}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Skill mastery, completed modules and misconception diagnosis history.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Points</div>
            <div className="text-lg font-bold text-white">{progress.totalPoints} pts</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200">Completed Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {progress.completedModuleIds.length > 0 ? (
              progress.completedModuleIds.map((modId) => (
                <div key={modId} className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{modId}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500">No completed modules yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200">Skill Competency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {progress.skillStates.map((skill) => (
              <div key={skill.skillId} className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-zinc-850 text-xs">
                <span className="font-mono text-zinc-300">{skill.skillId}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">{skill.score}%</span>
                  <Badge variant={skill.status === 'MASTERED' ? 'success' : 'warning'} className="text-[10px]">
                    {skill.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
