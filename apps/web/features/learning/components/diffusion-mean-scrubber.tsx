'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, ChevronLeft, ChevronRight, RotateCcw, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

export function DiffusionMeanScrubber() {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  const basisStates = ['000', '001', '010', '011', '100', '101', '110', '111'];
  const markedState = '101';

  // Math constants for 3 qubits
  const alphaInitial = 0.3536; // 1 / sqrt(8)
  const alphaMarkedInverted = -0.3536;
  const meanAlpha = (7 * alphaInitial + alphaMarkedInverted) / 8; // ≈ 0.2652

  // Reflection: alpha' = 2*mean - alpha
  const alphaMarkedReflected = 2 * meanAlpha - alphaMarkedInverted; // ≈ 0.7289 (53.1% prob)
  const alphaUnmarkedReflected = 2 * meanAlpha - alphaInitial; // ≈ 0.1768 (3.1% prob)

  const getAmplitudesForStep = (currentStep: number) => {
    return basisStates.map((s) => {
      const isMarked = s === markedState;
      if (currentStep === 1) {
        return {
          state: s,
          isMarked,
          amplitude: isMarked ? alphaMarkedInverted : alphaInitial,
          prob: Math.pow(isMarked ? alphaMarkedInverted : alphaInitial, 2),
        };
      } else if (currentStep === 2) {
        // Delta mode
        return {
          state: s,
          isMarked,
          amplitude: isMarked ? alphaMarkedInverted : alphaInitial,
          delta: meanAlpha - (isMarked ? alphaMarkedInverted : alphaInitial),
          prob: Math.pow(isMarked ? alphaMarkedInverted : alphaInitial, 2),
        };
      } else {
        // Reflected mode
        return {
          state: s,
          isMarked,
          amplitude: isMarked ? alphaMarkedReflected : alphaUnmarkedReflected,
          prob: Math.pow(isMarked ? alphaMarkedReflected : alphaUnmarkedReflected, 2),
        };
      }
    });
  };

  const currentData = getAmplitudesForStep(step);
  const maxAmpScale = 0.9;

  return (
    <Card className="border border-border-subtle bg-surface shadow-xs overflow-hidden" data-testid="diffusion-scrubber-card">
      <CardHeader className="py-3.5 px-4 bg-surface-raised/40 border-b border-border-subtle flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-sans font-semibold text-text-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span>Diffusion: Inversion About the Mean Scrubber</span>
          </CardTitle>
          <CardDescription className="text-xs text-text-muted mt-0.5">
            Step through how the operator reflects all amplitudes across their average height.
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={step === 1}
            onClick={() => setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3)}
            className="h-7 text-xs font-mono gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </Button>

          <div className="flex items-center gap-1 px-1">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s as 1 | 2 | 3)}
                className={`w-6 h-6 rounded-md font-mono text-xs font-bold transition-colors cursor-pointer ${
                  step === s ? 'bg-accent text-white' : 'bg-surface-raised text-text-muted hover:text-text-primary'
                }`}
              >
                0{s}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={step === 3}
            onClick={() => setStep((prev) => Math.min(3, prev + 1) as 1 | 2 | 3)}
            className="h-7 text-xs font-mono gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(1)}
            className="h-7 px-2 text-xs text-text-muted hover:text-text-primary"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Step Descriptor Banner */}
        <div className="p-3.5 rounded-lg border border-accent/30 bg-accent/5 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-accent/40 text-accent font-bold">
              STEP 0{step} OF 03
            </Badge>
            <span className="font-sans font-semibold text-text-primary">
              {step === 1 && 'Phase Inverted Base: Target is negative (-0.354), Mean is lowered to 0.265'}
              {step === 2 && 'Distance to Mean: Calculating distance Δ_i = (ᾱ - α_i) for each basis state'}
              {step === 3 && 'Geometric Reflection: Every amplitude flips across ᾱ, rocketing |101⟩ upward to +0.729!'}
            </span>
          </div>
          <span className="text-[11px] text-text-muted hidden sm:inline">
            Formula: α_i → 2ᾱ - α_i
          </span>
        </div>

        {/* Amplitude Chart with Dynamic Mean Line and Transition Effect */}
        <div className="relative h-64 w-full bg-surface-raised/40 rounded-xl border border-border-subtle p-4 flex flex-col justify-between overflow-hidden">
          {/* Y-Axis Labeling */}
          <div className="absolute left-2 inset-y-4 flex flex-col justify-between text-[10px] font-mono text-text-muted pointer-events-none z-10">
            <span>+0.80</span>
            <span>+0.40</span>
            <span>0.00</span>
            <span>-0.40</span>
          </div>

          {/* Zero Line */}
          <div
            className="absolute left-10 right-4 h-px bg-border-strong z-0"
            style={{ top: `${(maxAmpScale / (maxAmpScale + 0.45)) * 100}%` }}
          />

          {/* Average Line (ᾱ = 0.265) */}
          <div
            className="absolute left-10 right-4 h-0.5 border-t-2 border-dashed border-accent z-10"
            style={{
              top: `${((maxAmpScale - meanAlpha) / (maxAmpScale + 0.45)) * 100}%`,
            }}
          >
            <span className="absolute right-0 -top-4 text-[10px] font-mono text-accent font-bold bg-surface px-1.5 py-0.5 rounded border border-accent/40 shadow-xs">
              Average Line ᾱ = +0.265
            </span>
          </div>

          {/* 8 Bars */}
          <div className="ml-10 h-full flex items-center justify-around z-10">
            {currentData.map((item) => {
              const isMarked = item.isMarked;
              const isNegative = item.amplitude < 0;
              const totalRange = maxAmpScale + 0.45;
              const zeroPosPercent = (maxAmpScale / totalRange) * 100;
              const barHeight = (Math.abs(item.amplitude) / totalRange) * 100;

              return (
                <div key={item.state} className="flex flex-col items-center h-full justify-center w-10 relative">
                  {/* Top (Positive) Bar */}
                  {!isNegative && (
                    <div
                      className={`absolute w-6 rounded-t transition-all duration-700 ease-out flex items-start justify-center ${
                        isMarked
                          ? 'bg-emerald-500 border-t-2 border-x-2 border-emerald-600 shadow-sm'
                          : 'bg-text-secondary/30'
                      }`}
                      style={{
                        bottom: `${100 - zeroPosPercent}%`,
                        height: `${barHeight}%`,
                      }}
                    >
                      <span
                        className={`text-[9px] font-mono -mt-3.5 font-bold ${
                          isMarked ? 'text-emerald-700' : 'text-text-primary'
                        }`}
                      >
                        {item.amplitude.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Bottom (Negative) Bar */}
                  {isNegative && (
                    <div
                      className="absolute w-6 rounded-b bg-amber-500/80 border-b-2 border-x-2 border-amber-600 transition-all duration-700 ease-out flex items-end justify-center shadow-xs"
                      style={{
                        top: `${zeroPosPercent}%`,
                        height: `${barHeight}%`,
                      }}
                    >
                      <span className="text-[9px] font-mono text-amber-700 -mb-3.5 font-bold">
                        {item.amplitude.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Delta indicator arrow in Step 2 */}
                  {step === 2 && isMarked && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-accent animate-bounce z-20 pointer-events-none"
                      style={{
                        top: `${zeroPosPercent - 15}%`,
                      }}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </div>
                  )}

                  {/* State Label */}
                  <div className="absolute bottom-[-18px] text-[10px] font-mono text-text-primary font-bold">
                    |{item.state}⟩
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Numerical Proof Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg border border-border-subtle bg-surface-raised/40 space-y-1.5 font-mono text-xs">
            <span className="font-sans font-semibold text-text-primary text-[11px] uppercase tracking-wider block">
              Marked State |101⟩ Transformation
            </span>
            <div className="text-text-secondary space-y-1">
              <div>Initial: α = -0.354</div>
              <div>Reflection: α' = 2(0.265) - (-0.354)</div>
              <div className="text-emerald-600 font-bold">
                Final: α' = +0.530 + 0.354 = +0.729
              </div>
              <div className="text-xs text-text-muted">
                Measurement Probability: P = |0.729|² = <strong className="text-emerald-600">53.1%</strong> (up from 12.5%!)
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border-subtle bg-surface-raised/40 space-y-1.5 font-mono text-xs">
            <span className="font-sans font-semibold text-text-primary text-[11px] uppercase tracking-wider block">
              Unmarked States (7 states) Transformation
            </span>
            <div className="text-text-secondary space-y-1">
              <div>Initial: α = +0.354</div>
              <div>Reflection: α' = 2(0.265) - (+0.354)</div>
              <div className="text-text-primary font-semibold">
                Final: α' = +0.530 - 0.354 = +0.177
              </div>
              <div className="text-xs text-text-muted">
                Measurement Probability: P = |0.177|² = <strong>3.1% each</strong> (suppressed!)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
