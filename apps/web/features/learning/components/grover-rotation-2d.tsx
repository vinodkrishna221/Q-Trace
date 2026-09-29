'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Compass, RotateCcw, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export function GroverRotation2D() {
  const [iterationK, setIterationK] = React.useState<number>(2);

  // N = 8 states
  // theta = arcsin(1 / sqrt(8)) ≈ 0.3614 rad ≈ 20.7048 deg
  const thetaDeg = 20.7048;
  const currentAngleDeg = (2 * iterationK + 1) * thetaDeg;
  const currentAngleRad = (currentAngleDeg * Math.PI) / 180;

  // Probability of measuring marked state: sin^2((2k+1)*theta)
  const probMarked = Math.pow(Math.sin(currentAngleRad), 2);
  const probMarkedPercent = (probMarked * 100).toFixed(1);

  // Coordinates on 2D circle (Radius = 120, Center = 150, 150)
  const radius = 110;
  const centerX = 140;
  const centerY = 140;

  // In SVG, 0 deg is right (+X), 90 deg is down (+Y).
  // Math coordinate: |omega_perp> is +X (angle 0), |omega> is +Y (angle 90).
  // SVG coordinate: X = center + r * cos(theta), Y = center - r * sin(theta)
  const vectorX = centerX + radius * Math.cos(currentAngleRad);
  const vectorY = centerY - radius * Math.sin(currentAngleRad);

  const isOptimal = iterationK === 2;
  const isOverRotated = iterationK >= 3;

  return (
    <Card className="border border-border-subtle bg-surface shadow-xs overflow-hidden" data-testid="grover-rotation-card">
      <CardHeader className="py-3.5 px-4 bg-surface-raised/40 border-b border-border-subtle flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-sans font-semibold text-text-primary flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <span>2D Subspace Geometric Rotation & Over-Rotation Guard</span>
          </CardTitle>
          <CardDescription className="text-xs text-text-muted mt-0.5">
            Grover's algorithm rotates the statevector towards the marked state by 2θ per iteration.
          </CardDescription>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIterationK(2)}
          className="h-7 px-2 text-xs text-text-muted hover:text-text-primary"
          title="Reset to optimal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: 2D Subspace Canvas */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-3 rounded-xl border border-border-subtle bg-surface-raised/30">
            <svg width="280" height="280" viewBox="0 0 280 280" className="overflow-visible select-none">
              {/* Coordinate Axes */}
              {/* Horizontal axis: |omega_perp> */}
              <line x1="20" y1={centerY} x2="260" y2={centerY} stroke="currentColor" className="text-border-strong" strokeWidth="1.5" />
              {/* Vertical axis: |omega> */}
              <line x1={centerX} y1="260" x2={centerX} y2="20" stroke="currentColor" className="text-border-strong" strokeWidth="1.5" />

              {/* Axis Labels */}
              <text x="265" y={centerY + 4} className="text-[10px] font-mono fill-text-muted">
                |ω_⟂⟩ (Unmarked)
              </text>
              <text x={centerX - 4} y="14" className="text-[10px] font-mono fill-accent font-bold" textAnchor="end">
                |ω⟩ (Marked Target)
              </text>

              {/* Quarter Circle Arc */}
              <path
                d={`M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 0 0 ${centerX} ${centerY - radius}`}
                fill="none"
                stroke="currentColor"
                className="text-border-strong"
                strokeDasharray="4 4"
                strokeWidth="1"
              />

              {/* Past 90 deg Arc (for over-rotation) */}
              <path
                d={`M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 0 ${centerX - radius} ${centerY}`}
                fill="none"
                stroke="currentColor"
                className="text-border-strong/50"
                strokeDasharray="3 3"
                strokeWidth="1"
              />

              {/* Ghost Paths for Iterations */}
              {[0, 1, 2, 3].map((k) => {
                const ang = ((2 * k + 1) * thetaDeg * Math.PI) / 180;
                const gx = centerX + radius * Math.cos(ang);
                const gy = centerY - radius * Math.sin(ang);
                return (
                  <circle
                    key={k}
                    cx={gx}
                    cy={gy}
                    r={k === iterationK ? 0 : 3}
                    fill="currentColor"
                    className="text-border-strong"
                  />
                );
              })}

              {/* Active State Vector Arrow */}
              <line
                x1={centerX}
                y1={centerY}
                x2={vectorX}
                y2={vectorY}
                stroke="currentColor"
                className={`transition-all duration-300 ${
                  isOptimal ? 'text-emerald-500' : isOverRotated ? 'text-amber-500' : 'text-accent'
                }`}
                strokeWidth="2.5"
              />

              {/* Arrow Head */}
              <circle
                cx={vectorX}
                cy={vectorY}
                r="5"
                fill="currentColor"
                className={`transition-all duration-300 ${
                  isOptimal ? 'text-emerald-500 ring-4 ring-emerald-500/20' : isOverRotated ? 'text-amber-500' : 'text-accent'
                }`}
              />

              {/* Angle text */}
              <text
                x={centerX + 25}
                y={centerY - 10}
                className="text-[9px] font-mono fill-text-muted"
              >
                θ={currentAngleDeg.toFixed(0)}°
              </text>
            </svg>
          </div>

          {/* Right: Controls & Telemetry */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-sans font-semibold text-text-primary">Grover Iterations (k):</span>
                <span className="font-bold text-accent">{iterationK} Iteration{iterationK === 1 ? '' : 's'}</span>
              </div>

              {/* Step Buttons */}
              <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                {[0, 1, 2, 3, 4].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setIterationK(k)}
                    className={`py-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      iterationK === k
                        ? k === 2
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                          : k > 2
                          ? 'bg-amber-600 border-amber-700 text-white'
                          : 'bg-accent border-accent text-white'
                        : 'border-border-subtle bg-surface-raised text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    k={k}
                  </button>
                ))}
              </div>
            </div>

            {/* Probability Gauge */}
            <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-raised/40 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Target Fidelity P(|ω⟩):</span>
                <span
                  className={`text-sm font-bold ${
                    isOptimal ? 'text-emerald-600' : isOverRotated ? 'text-amber-600' : 'text-accent'
                  }`}
                >
                  {probMarkedPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-border-strong/40 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOptimal ? 'bg-emerald-500' : isOverRotated ? 'bg-amber-500' : 'bg-accent'
                  }`}
                  style={{ width: `${probMarkedPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>Formula: ⌊(π/4)√8⌋ = 2</span>
                <span>Peak: 94.5%</span>
              </div>
            </div>

            {/* Status Feedback Banner */}
            {isOptimal && (
              <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 flex items-start gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block font-sans">Optimal Iteration Count (k=2)</span>
                  <span>
                    The statevector is maximally aligned with the target state <code className="font-mono">|101⟩</code>.
                    Measuring now succeeds with 94.5% certainty.
                  </span>
                </div>
              </div>
            )}

            {isOverRotated && (
              <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block font-sans">Soufflé Over-Rotation Fallacy!</span>
                  <span>
                    Classical intuition suggests "more iterations = more search progress." In quantum mechanics,
                    rotation continues past the target axis, dropping probability back down to{' '}
                    <strong className="font-mono">{probMarkedPercent}%</strong>!
                  </span>
                </div>
              </div>
            )}

            {!isOptimal && !isOverRotated && (
              <div className="p-3 rounded-lg border border-border-subtle bg-surface-raised flex items-start gap-2.5 text-xs text-text-secondary">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block font-sans">Under-Rotated</span>
                  <span>
                    The vector is turning towards the vertical target axis, but has not yet reached peak resonance.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
