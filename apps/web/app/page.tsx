import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Atom, BookOpen, ArrowRight, Activity, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center text-center space-y-6 py-8 md:py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          <span>Smart India Hackathon Prototype · P0 Walking Skeleton</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl">
          Visual Quantum Learning with{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            Quantum Flight Recorder
          </span>
        </h1>

        <p className="text-zinc-400 text-base md:text-lg max-w-2xl">
          Observe how quantum states evolve gate by gate, test predictions before execution, and diagnose mental-model divergence with step-by-step mathematical evidence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/learn/bell-state">
            <Button size="lg" className="gap-2 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white">
              <BookOpen className="w-4 h-4" />
              <span>Enter Bell-State Module as Aarav</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/lab">
            <Button variant="outline" size="lg" className="gap-2 text-sm">
              <Cpu className="w-4 h-4" />
              <span>Open Circuit Lab</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 text-left">
          <Card className="border-cyan-900/40 bg-zinc-900/60">
            <CardHeader>
              <Badge variant="default" className="w-fit mb-1">Aarav · Beginner CSE</Badge>
              <CardTitle className="text-lg">Structured Learning</CardTitle>
              <CardDescription>Predict measurement outcomes and learn superposition before entanglement.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400">
              Captures pre-run prediction checkpoints to discover misconceptions before seeing simulation results.
            </CardContent>
            <CardFooter>
              <Link href="/learn/bell-state" className="text-xs font-medium text-cyan-400 hover:underline inline-flex items-center gap-1">
                Start Module <ArrowRight className="w-3 h-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-cyan-900/40 bg-zinc-900/60">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-1">Meera · Theory-to-Code</Badge>
              <CardTitle className="text-lg">State Trace & Qiskit</CardTitle>
              <CardDescription>Inspect statevectors, single-qubit Bloch views and verified Aer evidence.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400">
              Synchronized 2-qubit circuit grid with Qiskit generator and safe parse validation.
            </CardContent>
            <CardFooter>
              <Link href="/lab" className="text-xs font-medium text-cyan-400 hover:underline inline-flex items-center gap-1">
                Launch Lab <ArrowRight className="w-3 h-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-cyan-900/40 bg-zinc-900/60">
            <CardHeader>
              <Badge variant="warning" className="w-fit mb-1">Dr. Rao · Course Operator</Badge>
              <CardTitle className="text-lg">Instructor Insight</CardTitle>
              <CardDescription>Aggregate cohort pass rates, top misconceptions and repair efficacy.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400">
              Privacy-conscious cohort intelligence without persistent chat logs or unverified claims.
            </CardContent>
            <CardFooter>
              <Link href="/instructor" className="text-xs font-medium text-cyan-400 hover:underline inline-flex items-center gap-1">
                View Cohort Proof <ArrowRight className="w-3 h-3" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
