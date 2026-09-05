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

  // NOTE: chips keep the zinc/emerald class tokens asserted by UX-2 unit tests.
  const chipClass = (known: boolean) =>
    `inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
      known
        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
        : 'bg-abyss border-line text-zinc-500'
    }`;

  return (
    <div
      className="p-4 rounded-xl bg-panel border border-line space-y-3"
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
          <Badge variant="outline" className="text-xs font-mono" data-testid="role-tag-badge">
            {activeRole.roleTag}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-ink-dim font-mono">
          <User className="w-3.5 h-3.5 text-accent" />
          <span>Active:</span>
          <span className="text-ink font-bold" data-testid="active-learner-badge-name">
            {activeRole.name}
          </span>
        </div>
      </div>

      {/* Prior Knowledge Matrix Chips */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="text-ink-faint font-medium mr-1">Prior Knowledge:</span>
        <span data-testid="prior-chip-python" className={chipClass(prior.python)}>
          {prior.python ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3" />}
          Python
        </span>
        <span data-testid="prior-chip-linalg" className={chipClass(prior.linearAlgebra)}>
          {prior.linearAlgebra ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3" />}
          Linear Algebra
        </span>
        <span data-testid="prior-chip-theory" className={chipClass(prior.quantumTheory)}>
          {prior.quantumTheory ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3" />}
          Quantum Theory
        </span>
        <span data-testid="prior-chip-circuit" className={chipClass(prior.circuitProgramming)}>
          {prior.circuitProgramming ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3" />}
          Qiskit Circuits
        </span>
      </div>

      {/* Path Recommendation Reason */}
      {learningPath?.recommendationReason && (
        <div
          className="text-xs text-ink-dim bg-abyss p-2.5 rounded-lg border border-line flex items-center gap-2"
          data-testid="path-recommendation-reason"
        >
          <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{learningPath.recommendationReason}</span>
        </div>
      )}
    </div>
  );
}
