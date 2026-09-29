'use client';

import React, { useState } from 'react';

// For 3 qubits (N=8):
// θ = arcsin(1/√8) ≈ 0.3614 rad
// After k iterations: P(ω) = sin²((2k+1)θ)
const THETA = Math.asin(1 / Math.sqrt(8));

function groverProbability(k: number): number {
  return Math.sin((2 * k + 1) * THETA) ** 2;
}

const ITER_DATA = [1, 2, 3, 4, 5].map((k) => ({
  k,
  prob: groverProbability(k),
  label: `${k} iteration${k > 1 ? 's' : ''}`,
}));

// SVG arc helpers
const CX = 110; // center x
const CY = 110; // center y
const R = 80;

function polarToXY(angle: number, r: number) {
  // angle 0 = bottom, clockwise
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

function arcPath(startAngle: number, endAngle: number, r: number) {
  const s = polarToXY(startAngle, r);
  const e = polarToXY(endAngle, r);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function SouffleOverRotationMeter() {
  const [iterations, setIterations] = useState(2);

  const data = ITER_DATA[iterations - 1];
  const prob = data.prob;
  const pct = Math.round(prob * 1000) / 10;

  // Arc spans from -120° to +120° (240° total) for full range
  const arcStart = -120;
  const arcEnd = 120;
  const arcRange = arcEnd - arcStart; // 240°

  // Map iterations 1-5 to arc angle
  const needleAngle = arcStart + ((iterations - 1) / 4) * arcRange;

  // Zones: green 1-2, red 3-5
  const greenEnd = arcStart + (1 / 4) * arcRange; // at 2 iterations
  const optimalAngle = arcStart + (1 / 4) * arcRange;

  const isOverRotated = iterations > 2;
  const statusColor = isOverRotated ? '#ef4444' : '#22c55e';
  const statusLabel = isOverRotated ? 'SOUFFLÉ COLLAPSED! ⚠️' : iterations === 2 ? 'OPTIMAL ✓' : 'UNDER-ROTATED';

  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-raised/40">
        <p className="text-xs font-mono font-semibold text-text-primary tracking-wider">
          SOUFFLÉ DANGER METER · OVER-ROTATION VISUALIZER
        </p>
        <p className="text-[11px] font-mono text-text-muted mt-0.5">
          Drag the slider — watch what happens past 2 iterations for N=8
        </p>
      </div>

      <div className="p-6 flex flex-col sm:flex-row gap-8 items-center">
        {/* SVG Gauge */}
        <div className="flex-shrink-0">
          <svg width={220} height={160} viewBox="0 0 220 160">
            {/* Background track */}
            <path
              d={arcPath(arcStart, arcEnd, R)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={18}
              strokeLinecap="round"
            />

            {/* Green zone (1-2 iterations) */}
            <path
              d={arcPath(arcStart, greenEnd, R)}
              fill="none"
              stroke="#bbf7d0"
              strokeWidth={18}
              strokeLinecap="round"
            />

            {/* Red zone (3-5 iterations) */}
            <path
              d={arcPath(greenEnd, arcEnd, R)}
              fill="none"
              stroke="#fecaca"
              strokeWidth={18}
              strokeLinecap="round"
            />

            {/* Active filled arc */}
            <path
              d={arcPath(arcStart, needleAngle, R)}
              fill="none"
              stroke={statusColor}
              strokeWidth={12}
              strokeLinecap="round"
            />

            {/* Optimal marker at 2 iterations */}
            {(() => {
              const pt = polarToXY(optimalAngle, R);
              return (
                <circle cx={pt.x} cy={pt.y} r={6} fill="#22c55e" stroke="white" strokeWidth={2} />
              );
            })()}

            {/* Needle */}
            {(() => {
              const inner = polarToXY(needleAngle, R - 25);
              const outer = polarToXY(needleAngle, R + 10);
              return (
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={statusColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              );
            })()}

            {/* Center probability text */}
            <text
              x={CX}
              y={CY + 5}
              textAnchor="middle"
              fontSize={22}
              fontWeight="bold"
              fill={statusColor}
              fontFamily="monospace"
            >
              {pct.toFixed(1)}%
            </text>
            <text x={CX} y={CY + 22} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="monospace">
              P(|101⟩)
            </text>

            {/* Zone labels */}
            <text x={CX - 75} y={150} textAnchor="middle" fontSize={8} fill="#16a34a" fontFamily="monospace">OPTIMAL</text>
            <text x={CX + 75} y={150} textAnchor="middle" fontSize={8} fill="#ef4444" fontFamily="monospace">DANGER</text>
          </svg>
        </div>

        {/* Controls & Explanation */}
        <div className="flex-1 space-y-4 w-full">
          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-text-secondary">Iterations: {iterations}</label>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                style={{ color: statusColor, borderColor: statusColor, background: `${statusColor}15` }}
              >
                {statusLabel}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[9px] font-mono text-text-muted">
              <span>1</span><span>2 ← optimal</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>

          {/* Probability bar */}
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-text-muted">P(|101⟩) after {iterations} iteration{iterations > 1 ? 's' : ''}</p>
            <div className="h-3 rounded-full bg-surface-raised border border-border-subtle overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(pct, 2)}%`, background: statusColor }}
              />
            </div>
            <p className="text-[10px] font-mono" style={{ color: statusColor }}>{pct.toFixed(1)}%</p>
          </div>

          {/* Per-iteration data */}
          <div className="space-y-1.5">
            {ITER_DATA.map((d) => (
              <div
                key={d.k}
                className={`flex items-center gap-3 rounded-lg px-3 py-1.5 border text-[10px] font-mono transition-all ${
                  d.k === iterations
                    ? d.k > 2
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-border-subtle text-text-muted'
                }`}
              >
                <span className="w-14 font-semibold">k = {d.k}</span>
                <div className="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(d.prob * 100, 2)}%`,
                      background: d.k === 2 ? '#22c55e' : d.k > 2 ? '#ef4444' : '#94a3b8',
                    }}
                  />
                </div>
                <span className="w-14 text-right">{(d.prob * 100).toFixed(1)}%</span>
                {d.k === 2 && <span className="text-emerald-600 font-bold">← peak</span>}
                {d.k === 3 && <span className="text-red-600">← collapse!</span>}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            {isOverRotated
              ? `⚠️ ${iterations} iterations over-rotates the state past |ω⟩. Probability collapses from 94.5% to ${pct.toFixed(1)}%. More is NOT better in quantum search!`
              : iterations === 2
              ? '✓ Exactly 2 iterations for N=8. The state vector points at |101⟩ as close as possible.'
              : `Under-rotated: ${pct.toFixed(1)}% is below the 94.5% peak at 2 iterations. Add one more.`}
          </p>
        </div>
      </div>
    </div>
  );
}
