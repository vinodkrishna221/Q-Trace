'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { LearnerProfile, LearningPath } from '@/lib/contracts';
import { SyntheticRole } from '@/lib/fixtures';
import { Compass, CheckCircle2, XCircle, ArrowRight, User } from 'lucide-react';

interface PriorKnowledgeBadgeProps {
  activeRole: SyntheticRole;
  learnerProfile: LearnerProfile | null;
  learningPath: LearningPath | null;
}

export function PriorKnowledgeBadge({
  activeRole,
  learnerProfile,
  learningPath,
}: PriorKnowledgeBadgeProps) {
  const isAarav = learnerProfile?.id === 'lp_aarav';
  const isMeera = learnerProfile?.id === 'lp_meera';
  const entryBand = learningPath?.entryBand || (isMeera ? 'THEORY_TO_CODE' : 'FOUNDATIONS');

  const prior = learnerProfile?.priorKnowledge || {
    python: true,
    linearAlgebra: isMeera,
    quantumTheory: isMeera,
    circuitProgramming: false,
  };

  return (
    <div
      className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3"
      data-testid="prior-knowledge-path-badge"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={entryBand === 'THEORY_TO_CODE' ? 'default' : 'secondary'}
            className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5"
            data-testid="entry-band-badge"
          >
            <Compass className="w-3.5 h-3.5 mr-1" />
            {entryBand === 'THEORY_TO_CODE' ? 'Theory → Code Path' : 'Foundations Path'}
          </Badge>
          <Badge variant="outline" className="text-xs font-mono text-zinc-400" data-testid="role-tag-badge">
            {activeRole.roleTag}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active:</span>
          <span className="text-white font-bold" data-testid="active-learner-badge-name">
            {activeRole.name}
          </span>
        </div>
      </div>

      {/* Prior Knowledge Matrix Chips */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="text-zinc-500 font-medium mr-1">Prior Knowledge:</span>
        <span
          data-testid="prior-chip-python"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
            prior.python
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500'
          }`}
        >
          {prior.python ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-zinc-600" />}
          Python
        </span>

        <span
          data-testid="prior-chip-linalg"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
            prior.linearAlgebra
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500'
          }`}
        >
          {prior.linearAlgebra ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-zinc-600" />}
          Linear Algebra
        </span>

        <span
          data-testid="prior-chip-theory"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
            prior.quantumTheory
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500'
          }`}
        >
          {prior.quantumTheory ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-zinc-600" />}
          Quantum Theory
        </span>

        <span
          data-testid="prior-chip-circuit"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
            prior.circuitProgramming
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500'
          }`}
        >
          {prior.circuitProgramming ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-zinc-600" />}
          Qiskit Circuits
        </span>
      </div>

      {/* Path Recommendation Reason */}
      {learningPath?.recommendationReason && (
        <div
          className="text-xs text-zinc-300 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-850 flex items-center gap-2"
          data-testid="path-recommendation-reason"
        >
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{learningPath.recommendationReason}</span>
        </div>
      )}
    </div>
  );
}
