'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { PersonaTag } from '@/lib/auth-types';

interface PersonaSwitcherProps {
  value: PersonaTag;
  onChange: (value: PersonaTag) => void;
}

const PERSONA_OPTIONS: {
  tag: PersonaTag;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    tag: 'LEARNER',
    title: 'Individual Learner',
    badge: 'Explorer',
    icon: Sparkles,
    description: 'Intuitive state-vector exploration and foundational quantum intuition.',
  },
  {
    tag: 'STUDENT',
    title: 'Self-Study Student',
    badge: 'Coursework',
    icon: BookOpen,
    description: 'University syllabus alignment, problem sets, and diagnostic exams.',
  },
  {
    tag: 'EDUCATOR',
    title: 'Independent Educator',
    badge: 'Instructor',
    icon: GraduationCap,
    description: 'Class demo prep, circuit authoring, and curriculum prototyping.',
  },
];

export function PersonaSwitcher({ value, onChange }: PersonaSwitcherProps) {
  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
        aria-label="Account persona selector"
        className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-raised/80 border border-border-default"
      >
        {PERSONA_OPTIONS.map((opt) => {
          const isSelected = value === opt.tag;
          const Icon = opt.icon;

          return (
            <button
              key={opt.tag}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.tag)}
              className={`relative flex flex-col items-center sm:items-start text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer select-none ${
                isSelected
                  ? 'text-text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-persona-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-lg bg-surface border border-border-medium shadow-xs z-0"
                />
              )}

              <div className="relative z-10 flex items-center gap-1.5 w-full">
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-accent' : 'text-text-muted'
                  }`}
                />
                <span className="font-semibold truncate">{opt.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Persona Micro-description */}
      {(() => {
        const activeOpt = PERSONA_OPTIONS.find((o) => o.tag === value);
        if (!activeOpt) return null;
        return (
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="text-[11px] text-text-muted px-1"
          >
            {activeOpt.description}
          </motion.p>
        );
      })()}
    </div>
  );
}
