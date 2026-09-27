'use client';

import * as React from 'react';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearnSidebar } from '../learn-sidebar';

export interface DailyQuest {
  id: string;
  title: string;
  progress: number;
  total: number;
  xpReward: number;
  completed: boolean;
}

export interface CohortRank {
  rank: number;
  name: string;
  xp: number;
  isCurrentUser: boolean;
  avatarInitial: string;
}

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: 'quest_superposition',
    title: 'Create 1 Superposition',
    progress: 1,
    total: 1,
    xpReward: 20,
    completed: true,
  },
  {
    id: 'quest_repair',
    title: 'Solve 1 Repair Challenge',
    progress: 0,
    total: 1,
    xpReward: 35,
    completed: false,
  },
  {
    id: 'quest_fidelity',
    title: 'Maintain >90% Fidelity',
    progress: 1,
    total: 1,
    xpReward: 25,
    completed: true,
  },
];

const DEFAULT_LEADERBOARD: CohortRank[] = [
  { rank: 1, name: 'Dr. Rao', xp: 980, isCurrentUser: false, avatarInitial: 'R' },
  { rank: 2, name: 'Meera', xp: 920, isCurrentUser: false, avatarInitial: 'M' },
  { rank: 3, name: 'You', xp: 850, isCurrentUser: true, avatarInitial: 'A' },
  { rank: 4, name: 'Alex', xp: 790, isCurrentUser: false, avatarInitial: 'X' },
];

export interface LeftQuestRailProps {
  currentSlug?: string;
  isMeera?: boolean;
  className?: string;
}

export function LeftQuestRail({
  currentSlug = 'bell-state',
  isMeera = false,
  className = '',
}: LeftQuestRailProps) {
  const completedCount = DEFAULT_QUESTS.filter((q) => q.completed).length;
  const totalCount = DEFAULT_QUESTS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      className={`space-y-5 w-full ${className}`}
      data-testid="left-quest-rail"
      aria-label="Daily Quests & Cohort Benchmarks"
    >
      {/* 1. Daily Calibration Quests Card */}
      <Card
        className="border border-border-subtle bg-surface shadow-2xs overflow-hidden"
        data-testid="daily-quests-card"
      >
        <CardHeader className="p-4 pb-3 border-b border-border-subtle">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              </span>
              <CardTitle className="text-xs font-bold tracking-tight text-text-primary uppercase font-mono">
                Daily Calibration Quests
              </CardTitle>
            </div>
            <span className="text-[11px] font-mono font-semibold text-text-muted">
              {completedCount}/{totalCount}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-sunken h-1.5 rounded-full overflow-hidden mt-2 border border-border-subtle/50">
            <div
              className="bg-gradient-to-r from-amber-500 to-accent h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          {DEFAULT_QUESTS.map((quest) => (
            <div
              key={quest.id}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2.5 transition-colors ${
                quest.completed
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-text-primary'
                  : 'border-border-subtle bg-surface-raised/40 text-text-secondary hover:border-border-default'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {quest.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-border-medium shrink-0" />
                )}
                <span className={`truncate font-medium ${quest.completed ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {quest.title}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] font-semibold text-violet-700 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                <Zap className="h-2.5 w-2.5 fill-violet-600 text-violet-600" />
                <span>+{quest.xpReward}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Cohort Benchmark Card */}
      <Card
        className="border border-border-subtle bg-surface shadow-2xs overflow-hidden"
        data-testid="cohort-benchmark-card"
      >
        <CardHeader className="p-4 pb-2 border-b border-border-subtle">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Trophy className="h-3.5 w-3.5 text-accent" />
              </span>
              <CardTitle className="text-xs font-bold tracking-tight text-text-primary uppercase font-mono">
                Cohort Benchmark
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="text-[9px] font-mono border-accent/40 bg-accent/10 text-accent px-1.5 py-0"
            >
              LEAGUE
            </Badge>
          </div>
          <p className="text-[11px] text-text-secondary font-medium mt-1">
            Superconducting League: You #3
          </p>
        </CardHeader>

        <CardContent className="p-3 space-y-1.5">
          {DEFAULT_LEADERBOARD.map((item) => (
            <div
              key={item.name}
              className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors ${
                item.isCurrentUser
                  ? 'bg-accent/10 border border-accent/30 font-semibold text-accent'
                  : 'bg-surface-raised/40 border border-transparent text-text-secondary'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-center text-text-muted font-bold">
                  {item.rank}
                </span>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  item.isCurrentUser
                    ? 'bg-accent text-white'
                    : 'bg-surface-sunken text-text-muted'
                }`}>
                  {item.avatarInitial}
                </div>
                <span className="truncate max-w-[110px] text-text-primary">
                  {item.name} {item.isCurrentUser && '(You)'}
                </span>
              </div>
              <span className="text-[11px] text-text-muted">
                {item.xp} XP
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. Observer Tip Card */}
      <div
        className="p-3.5 rounded-xl border border-border-subtle bg-surface-raised/60 text-xs space-y-1.5"
        data-testid="observer-tip-card"
      >
        <div className="flex items-center gap-1.5 text-accent text-[11px] font-bold tracking-wider uppercase font-mono">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>OBSERVER TIP</span>
        </div>
        <p className="text-text-secondary text-[11px] leading-relaxed italic">
          "Remember: H is its own inverse! H·H = I"
        </p>
        <p className="text-[10px] text-text-muted font-mono pt-1 text-right">
          — Quantum Observer
        </p>
      </div>

      {/* 4. Full Algorithm & Roadmap Directory (Preserves data-testid="learn-sidebar") */}
      <div className="pt-2">
        <LearnSidebar currentSlug={currentSlug} isMeera={isMeera} />
      </div>
    </div>
  );
}
