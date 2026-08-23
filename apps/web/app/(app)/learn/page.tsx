'use client';

import * as React from 'react';
import Link from 'next/link';
import { DEMO_MODULES } from '@/lib/fixtures';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export default function LearnIndexPage() {
  const modules = Object.values(DEMO_MODULES);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Quantum Learning Modules</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Interactive quantum curriculum with prediction checkpoints and flight recorder diagnosis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <Card key={mod.id} className="border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant={mod.slug === 'bell-state' ? 'default' : 'secondary'} className="text-xs">
                  {mod.level}
                </Badge>
                <span className="text-zinc-500 text-xs flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {mod.estimatedMinutes}m
                </span>
              </div>
              <CardTitle className="text-base text-white">{mod.title}</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Skills: {mod.skillIds.map((s) => s.replace('skill_', '')).join(', ')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href={`/learn/${mod.slug}`} className="w-full">
                <Button variant={mod.slug === 'bell-state' ? 'default' : 'outline'} size="sm" className="w-full gap-2 text-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{mod.slug === 'bell-state' ? 'Launch Hero Lab' : 'View Module'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
