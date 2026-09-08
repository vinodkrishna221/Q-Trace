import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, Cpu, Users, BrainCircuit, Play, ScanSearch, Wrench } from 'lucide-react';

const FLIGHT_RECORDER_STEPS = [
  { icon: BrainCircuit, title: 'Predict', body: 'Commit to an outcome before execution' },
  { icon: Play, title: 'Simulate', body: 'Run the circuit on Qiskit Aer' },
  { icon: ScanSearch, title: 'Diagnose', body: 'Find the gate where your model diverged' },
  { icon: Wrench, title: 'Repair', body: 'Fix the misconception with evidence' },
];

const PERSONAS = [
  {
    tag: 'AARAV · BEGINNER CSE',
    title: 'Structured Learning',
    body: 'Prediction checkpoints surface misconceptions before the simulation ever runs.',
    cta: 'Start Module',
    href: '/learn/bell-state',
    badgeVariant: 'default' as const,
  },
  {
    tag: 'MEERA · PHYSICS → CODE',
    title: 'Circuit Lab & State Trace',
    body: 'Synchronized circuit grid, generated Qiskit, and verified statevector evidence.',
    cta: 'Launch Lab',
    href: '/lab',
    badgeVariant: 'secondary' as const,
  },
  {
    tag: 'DR. RAO · COURSE OPERATOR',
    title: 'Instructor Insight',
    body: 'Cohort completion, pass rates, and the misconceptions worth re-teaching.',
    cta: 'View Cohort',
    href: '/instructor',
    badgeVariant: 'warning' as const,
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center text-center space-y-10 py-10 md:py-16">
        {/* 1 · Status pill */}
        <Badge variant="outline" className="px-3 py-1 text-[11px] tracking-widest text-accent border-accent/40 bg-accent/5">
          SIH 2026 PROTOTYPE · QUANTUM FLIGHT RECORDER
        </Badge>

        {/* 2 · Hero */}
        <div className="space-y-5 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-ink leading-[1.05]">
            Learn quantum computing from{' '}
            <span className="bg-gradient-to-r from-accent via-accent to-violet bg-clip-text text-transparent">
              verified evidence
            </span>{' '}
            — not guesswork.
          </h1>
          <p className="text-ink-dim text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Q-Trace captures your prediction, replays the true simulator state gate by gate,
            and pinpoints the exact moment your mental model diverges from the physics.
          </p>
        </div>

        {/* 3 · Primary actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/learn/bell-state">
            <Button size="lg" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Enter the Bell-State Module</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/lab">
            <Button variant="outline" size="lg" className="gap-2">
              <Cpu className="w-4 h-4" />
              <span>Open Circuit Lab</span>
            </Button>
          </Link>
        </div>

        {/* 4 · Flight Recorder strip — the differentiator, above the fold */}
        <div className="w-full max-w-4xl pt-4">
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-y-8">
            {/* traced connector line */}
            <div className="hidden md:block absolute top-6 inset-x-[12%] h-px bg-line-bright" aria-hidden />
            {FLIGHT_RECORDER_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDiagnose = step.title === 'Diagnose';
              return (
                <div key={step.title} className="relative flex flex-col items-center gap-2 px-2">
                  <div
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border bg-panel ${
                      isDiagnose
                        ? 'border-accent text-accent shadow-glow'
                        : 'border-line-bright text-ink-dim'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-raised border border-line font-mono text-[10px] text-ink-faint">
                      {i + 1}
                    </span>
                  </div>
                  <div className={`font-display font-semibold text-sm ${isDiagnose ? 'text-accent' : 'text-ink'}`}>
                    {step.title}
                  </div>
                  <div className="text-[11px] text-ink-faint leading-snug max-w-[160px]">
                    {step.body}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 · Persona cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-6 text-left">
          {PERSONAS.map((p) => (
            <Card key={p.tag} className="hover:border-line-bright transition-colors">
              <CardContent className="p-6 space-y-3">
                <Badge variant={p.badgeVariant} className="w-fit">{p.tag}</Badge>
                <h3 className="font-display font-semibold text-lg text-ink">{p.title}</h3>
                <p className="text-sm text-ink-dim leading-relaxed">{p.body}</p>
                <Link
                  href={p.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                >
                  {p.cta} <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 6 · contextual link for instructors landing here */}
        <div className="flex items-center gap-2 text-xs text-ink-faint font-mono pt-2">
          <Users className="w-3.5 h-3.5" />
          <span>Three demo roles available — switch personas from the header at any time.</span>
        </div>
      </div>
    </AppShell>
  );
}
