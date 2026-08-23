'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Play, Download, Code, Layers } from 'lucide-react';
import { DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';

export default function LabPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="lab-view">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="default" className="text-xs">CIRCUIT WORKSPACE</Badge>
            <Badge variant="outline" className="text-[11px] font-mono text-zinc-400">P0 Shell</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Quantum Circuit Lab</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Construct and inspect quantum circuits with synchronized grid and Qiskit code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white">
            <Play className="w-3.5 h-3.5" />
            <span>Simulate (Aer)</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-zinc-200">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Qubit Grid (2 Qubits)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Ordered qubit wire grid · Single truth source is Circuit Model JSON
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-850 space-y-4">
                {/* Wire 0 */}
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="w-8 text-cyan-400 font-bold">q[0]</span>
                  <div className="flex-1 flex items-center gap-2 bg-zinc-900/80 p-2 rounded border border-zinc-800">
                    <span className="px-2 py-1 bg-cyan-950 border border-cyan-700 text-cyan-300 rounded font-bold">H</span>
                    <div className="w-6 h-0.5 bg-zinc-700" />
                    <span className="px-2 py-1 bg-blue-950 border border-blue-700 text-blue-300 rounded font-bold">● (ctrl)</span>
                    <div className="w-6 h-0.5 bg-zinc-700" />
                    <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded">M → c[0]</span>
                  </div>
                </div>
                {/* Wire 1 */}
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="w-8 text-cyan-400 font-bold">q[1]</span>
                  <div className="flex-1 flex items-center gap-2 bg-zinc-900/80 p-2 rounded border border-zinc-800">
                    <div className="w-8 h-0.5 bg-zinc-700" />
                    <div className="w-6 h-0.5 bg-zinc-700" />
                    <span className="px-2 py-1 bg-blue-950 border border-blue-700 text-blue-300 rounded font-bold">⊕ (tgt)</span>
                    <div className="w-6 h-0.5 bg-zinc-700" />
                    <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded">M → c[1]</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-zinc-200">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Generated Qiskit (Read-Only)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-3 bg-zinc-950 rounded border border-zinc-850 font-mono text-xs text-cyan-300 overflow-x-auto">
{`from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
