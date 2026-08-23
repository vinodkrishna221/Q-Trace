'use client';

import * as React from 'react';
import { DEMO_INSTRUCTOR_INSIGHT } from '@/lib/fixtures';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, AlertTriangle, Activity, BarChart2 } from 'lucide-react';

export default function InstructorPage() {
  const insight = DEMO_INSTRUCTOR_INSIGHT;

  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="instructor-insight-view">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="warning" className="text-xs">INSTRUCTOR INSIGHT</Badge>
            <Badge variant="outline" className="text-[11px] font-mono text-zinc-400">Cohort: {insight.cohortId}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Cohort Analytics & Misconceptions
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Aggregate performance, module completion rates and Quantum Flight Recorder divergence signals.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg">
          <Users className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Active Learners</div>
            <div className="text-lg font-bold text-white">{insight.learnerCount} students</div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module Completion */}
        <Card className="border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Module Completion</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insight.moduleCompletion.map((m) => (
              <div key={m.moduleId} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300">{m.moduleId}</span>
                  <span className="text-zinc-400">{m.completed}/{m.assigned} ({Math.round((m.completed / m.assigned) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(m.completed / m.assigned) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Challenge Pass Rate */}
        <Card className="border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Challenge Pass Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insight.challengePassRate.map((ch) => (
              <div key={ch.challengeId} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300">{ch.challengeId}</span>
                  <span className="text-zinc-400">{ch.passed}/{ch.attempted} ({Math.round(ch.rate * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${ch.rate * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Misconceptions */}
        <Card className="border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Top Misconceptions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insight.topMisconceptions.map((disc) => (
              <div key={disc.code} className="p-2 rounded bg-zinc-950 border border-zinc-850 text-xs">
                <div className="font-mono text-amber-300 text-[11px] font-semibold">{disc.code}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {disc.learnerCount} learners · {disc.occurrences} detections
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-850 text-xs text-zinc-400 flex items-center justify-between">
        <span>{insight.dataDisclosure || 'Synthetic seeded cohort'}</span>
        <Badge variant="outline" className="text-[10px] font-mono text-zinc-500">
          Generated: {insight.generatedAt}
        </Badge>
      </div>
    </div>
  );
}
