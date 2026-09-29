'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sigma, Sparkles, HelpCircle, ArrowRight, Eye, Check } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

type FormulaPart = 'all' | 'oracle' | 'state' | 'phase_factor' | 'piecewise';

export function OracleFormulaMicroscope() {
  const [activePart, setActivePart] = React.useState<FormulaPart>('phase_factor');
  const [testState, setTestState] = React.useState<'101' | '000'>('101');

  const isWinner = testState === '101';
  const fxValue = isWinner ? 1 : 0;
  const phaseResult = isWinner ? -1 : 1;

  const fullLatex = 'U_\\omega |x\\rangle = (-1)^{f(x)} |x\\rangle = \\begin{cases} -|x\\rangle & \\text{if } x = \\omega \\text{ (Marked State)} \\\\ +|x\\rangle & \\text{if } x \\neq \\omega \\end{cases}';

  const renderedLatex = React.useMemo(() => {
    try {
      return katex.renderToString(fullLatex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return fullLatex;
    }
  }, [fullLatex]);

  return (
    <Card className="border border-border-subtle bg-surface shadow-xs overflow-hidden" data-testid="oracle-formula-microscope">
      <CardHeader className="py-3.5 px-4 bg-surface-raised/40 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent border border-accent/30">
            <Sigma className="w-3.5 h-3.5" />
          </div>
          <div>
            <CardTitle className="text-sm font-sans font-semibold text-text-primary">
              Interactive Formula Microscope
            </CardTitle>
            <p className="text-[11px] font-sans text-text-muted">
              Tap any symbol below to decode exactly what the quantum mathematics means in plain English.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono border-accent/40 text-accent">
          INTERACTIVE DECODER
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* The Mathematical Formula Presentation */}
        <div className="p-4 rounded-xl bg-surface-sunken border border-border-subtle text-center relative overflow-x-auto">
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-2 flex items-center justify-center gap-1.5">
            <span>Rigorous Dirac Mathematical Formulation</span>
          </div>
          <div
            className="text-base sm:text-lg font-medium py-1 overflow-x-auto text-text-primary"
            dangerouslySetInnerHTML={{ __html: renderedLatex }}
          />
        </div>

        {/* Interactive Symbol Selector Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-sans font-semibold text-text-secondary uppercase tracking-wider">
              Decode Term by Term:
            </span>
            <span className="text-[11px] font-mono text-text-muted">Click a part to zoom in</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActivePart('oracle')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activePart === 'oracle'
                  ? 'border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent'
                  : 'border-border-subtle bg-surface-raised/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>U_ω</span>
                <span className="text-[10px] opacity-75">OPERATOR</span>
              </div>
              <div className="text-[11px] font-sans font-normal truncate mt-0.5">The Oracle Circuit</div>
            </button>

            <button
              type="button"
              onClick={() => setActivePart('state')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activePart === 'state'
                  ? 'border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent'
                  : 'border-border-subtle bg-surface-raised/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>|x⟩</span>
                <span className="text-[10px] opacity-75">STATE</span>
              </div>
              <div className="text-[11px] font-sans font-normal truncate mt-0.5">The 8 Secret Chests</div>
            </button>

            <button
              type="button"
              onClick={() => setActivePart('phase_factor')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activePart === 'phase_factor'
                  ? 'border-amber-600 bg-amber-500/10 text-amber-700 font-bold ring-1 ring-amber-600'
                  : 'border-border-subtle bg-surface-raised/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>(-1)^f(x)</span>
                <span className="text-[10px] opacity-75">KEY TRICK</span>
              </div>
              <div className="text-[11px] font-sans font-normal truncate mt-0.5">The Minus Sign Flip</div>
            </button>

            <button
              type="button"
              onClick={() => setActivePart('piecewise')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activePart === 'piecewise'
                  ? 'border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent'
                  : 'border-border-subtle bg-surface-raised/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>f(x) ∈ {'{0,1}'}</span>
                <span className="text-[10px] opacity-75">CONDITION</span>
              </div>
              <div className="text-[11px] font-sans font-normal truncate mt-0.5">Winner vs Loser</div>
            </button>
          </div>
        </div>

        {/* Dynamic Plain-English Explanation Card */}
        <div className="p-4 rounded-xl border border-border-subtle bg-surface-raised/50 space-y-4">
          {activePart === 'oracle' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent font-semibold text-xs font-mono">
                <Sparkles className="w-4 h-4" />
                <span>U_ω · The Oracle Operator</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Think of <strong>U_ω</strong> as a <strong>black-box metal detector</strong>. You pass your 3-qubit superposition
                through it. It doesn’t open the chests or tell you which item is inside. Instead, it tests the circuit wires and
                tags the winning configuration with an invisible quantum mark.
              </p>
              <div className="text-[11px] text-text-muted font-mono bg-surface p-2.5 rounded border border-border-subtle">
                Mathematical Role: A Unitary Transformation matrix satisfying (U_ω)† · U_ω = I.
              </div>
            </div>
          )}

          {activePart === 'state' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent font-semibold text-xs font-mono">
                <Eye className="w-4 h-4" />
                <span>|x⟩ · The 8 Query Basis States</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                <strong>|x⟩</strong> represents any of the 8 possible 3-bit combinations: <code className="font-mono">|000⟩, |001⟩, |010⟩, ..., |111⟩</code>.
                Because of Hadamard superposition, all 8 states enter the oracle <strong>simultaneously</strong>! You test all 8 possibilities in a single quantum operation.
              </p>
              <div className="text-[11px] text-text-muted font-mono bg-surface p-2.5 rounded border border-border-subtle">
                Hilbert Space: Dimension N = 2³ = 8 computational basis vectors.
              </div>
            </div>
          )}

          {activePart === 'phase_factor' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs font-mono">
                <Sparkles className="w-4 h-4" />
                <span>(-1)^f(x) · The Minus Sign Flip (The Core Secret)</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Why use <code className="font-mono font-bold text-text-primary">(-1)</code> raised to a power? Because any number raised to the 0th power is <strong>+1</strong>, and raised to the 1st power is <strong>-1</strong>!
              </p>

              {/* Interactive Test Slider */}
              <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-sans font-medium text-text-secondary">Try it live with a state:</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setTestState('101')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        testState === '101' ? 'bg-amber-600 text-white font-bold' : 'bg-surface-raised text-text-muted'
                      }`}
                    >
                      |101⟩ (Winning Target)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestState('000')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        testState === '000' ? 'bg-accent text-white font-bold' : 'bg-surface-raised text-text-muted'
                      }`}
                    >
                      |000⟩ (Normal State)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-surface-raised font-mono text-xs text-text-primary">
                  <span>Step 1: Check match ➔ f({testState}) = {fxValue}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                  <span>Step 2: (-1)^{fxValue} = <strong className={isWinner ? 'text-amber-700 font-bold' : 'text-emerald-600 font-bold'}>{phaseResult}</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                  <span className={isWinner ? 'text-amber-700 font-bold' : 'text-text-primary'}>
                    Result: {phaseResult === -1 ? '-|101⟩' : '+|000⟩'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-text-muted">
                <strong>Why measurement can't see it:</strong> Measurement probability is amplitude squared:
                <code className="font-mono ml-1">|+0.354|² = 12.5%</code> and <code className="font-mono">|-0.354|² = 12.5%</code>. Both are identical!
              </div>
            </div>
          )}

          {activePart === 'piecewise' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent font-semibold text-xs font-mono">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>f(x) · The Boolean Marking Function</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                The function <strong>f(x)</strong> is simply a yes/no test. If the input string matches the secret target (<code className="font-mono">x = ω</code>),
                it returns <strong>1</strong>. For all other 7 incorrect strings, it returns <strong>0</strong>.
              </p>
              <div className="text-[11px] text-text-muted font-mono bg-surface p-2.5 rounded border border-border-subtle">
                Truth definition: f(x) = 1 if x == 101 else 0.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
