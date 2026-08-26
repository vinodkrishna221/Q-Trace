'use client';

import * as React from 'react';
import Link from 'next/link';
import { DEMO_MODULES } from '@/lib/fixtures';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight, Star } from 'lucide-react';

export default function LearnIndexPage() {
  const modules = Object.values(DEMO_MODULES);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        eyebrow={<Badge variant="default">LEARNING PATH</Badge>}
        title="Quantum Learning Modules"
        purpose="A structured path from superposition to entanglement — every module guarded by a prediction checkpoint."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const isHero = mod.slug === 'bell-state';
          return (
            <Card
              key={mod.id}
              className={`flex flex-col transition-colors ${
                isHero
                  ? 'border-accent/50 shadow-glow-soft'
                  : 'hover:border-line-bright'
              }`}
            >
              <CardContent className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isHero ? 'default' : 'secondary'}>{mod.level}</Badge>
                  <span className="text-ink-faint text-xs flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {mod.estimatedMinutes} min
                  </span>
                </div>

                {isHero && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-accent">
                    <Star className="w-3 h-3 fill-current" />
                    <span>HERO MODULE</span>
                  </div>
                )}

                <h3 className="font-display font-semibold text-base text-ink leading-snug">
                  {mod.title}
                </h3>
                <p className="text-xs text-ink-dim font-mono">
                  Skills: {mod.skillIds.map((s) => s.replace('skill_', '')).join(', ')}
                </p>

                <div className="mt-auto pt-2">
                  <Link href={`/learn/${mod.slug}`} className="w-full block">
                    <Button
                      variant={isHero ? 'default' : 'outline'}
                      size="sm"
                      className="w-full gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isHero ? 'Launch Hero Lab' : 'View Module'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
