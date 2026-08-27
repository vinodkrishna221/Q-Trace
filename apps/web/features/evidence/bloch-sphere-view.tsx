'use client';

import * as React from 'react';
import { ReducedQubit } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, Info, ShieldAlert, Sparkles, Layers, Table as TableIcon, Eye } from 'lucide-react';

interface BlochSphereViewProps {
  reducedQubits: ReducedQubit[];
  stepLabel?: string;
  disablePlotly?: boolean;
}

export function BlochSphereView({
  reducedQubits,
  stepLabel,
  disablePlotly = false,
}: BlochSphereViewProps) {
  const [selectedQubitIndex, setSelectedQubitIndex] = React.useState<number>(0);
  const [forceStaticFallback, setForceStaticFallback] = React.useState<boolean>(disablePlotly);

  // Sync state if prop changes
  React.useEffect(() => {
    if (disablePlotly) {
      setForceStaticFallback(true);
    }
  }, [disablePlotly]);

  const activeQubit = reducedQubits[selectedQubitIndex] || reducedQubits[0] || {
    qubit: 0,
    bloch: { x: 0.0, y: 0.0, z: 0.0 },
    purity: 0.5,
    label: 'MIXED_SUBSYSTEM' as const,
  };

  const isMixed = activeQubit.purity < 1.0 || activeQubit.label === 'MIXED_SUBSYSTEM';
  const blochRadius = Math.sqrt(
    activeQubit.bloch.x ** 2 + activeQubit.bloch.y ** 2 + activeQubit.bloch.z ** 2
  );

  return (
    <Card
      className="border-line bg-abyss/80 shadow-lg overflow-hidden"
      data-testid="bloch-sphere-card"
    >
      <CardHeader className="pb-3 border-b border-line bg-raised/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-mono">
              BLOCH SUBSYSTEM VIEW
            </Badge>
            <Badge
              variant="outline"
              data-testid={`bloch-purity-badge-${activeQubit.qubit}`}
              className={`text-xs font-mono flex items-center gap-1.5 ${
                isMixed
                  ? 'text-violet border-violet/40 bg-violet/10'
                  : 'text-evidence border-evidence/40 bg-evidence/10'
              }`}
            >
              {isMixed ? <ShieldAlert className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span data-testid="active-subsystem-label">{activeQubit.label}</span>
              <span>(Purity: {activeQubit.purity.toFixed(3)})</span>
            </Badge>
          </div>

          {/* Toggle for interactive vs static fallback */}
          <button
            type="button"
            data-testid="toggle-plotly-fallback"
            onClick={() => setForceStaticFallback(!forceStaticFallback)}
            className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-raised border border-line hover:border-line-bright text-ink-dim hover:text-ink transition-colors cursor-pointer"
          >
            {forceStaticFallback ? (
              <>
                <Layers className="w-3 h-3 text-accent" />
                <span>Mode: Static Fallback (Active)</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-evidence" />
                <span>Mode: Dynamic Render</span>
              </>
            )}
          </button>
        </div>

        <CardTitle className="text-sm text-ink flex items-center gap-2 mt-1">
          <Compass className="w-4 h-4 text-accent" />
          <span>Single-Qubit Reduced Density Matrix & Bloch Representation</span>
          {stepLabel && <span className="text-xs text-ink-dim font-normal">({stepLabel})</span>}
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim">
          Partial trace representation for individual qubit subsystems. Pure separable states lie on the sphere surface ($r=1$); entangled subsystems produce mixed states inside the sphere ($r&lt;1$).
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Qubit Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <span className="text-xs font-mono text-ink-dim mr-2">Select Qubit Wire:</span>
          {reducedQubits.map((rq, idx) => (
            <button
              key={rq.qubit}
              type="button"
              data-testid={`qubit-tab-${rq.qubit}`}
              onClick={() => setSelectedQubitIndex(idx)}
              className={`px-3 py-1 text-xs font-mono rounded-md border transition-all cursor-pointer flex items-center gap-2 ${
                selectedQubitIndex === idx
                  ? 'border-accent bg-accent/15 text-accent font-bold shadow-glow'
                  : 'border-line bg-raised/50 text-ink-dim hover:text-ink hover:border-line-bright'
              }`}
            >
              <span>q[{rq.qubit}]</span>
              <span
                className={`text-[10px] px-1 rounded ${
                  rq.label === 'MIXED_SUBSYSTEM'
                    ? 'bg-violet/20 text-violet'
                    : 'bg-accent/20 text-accent'
                }`}
              >
                {rq.label === 'MIXED_SUBSYSTEM' ? 'MIXED' : 'PURE'}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Visual Bloch Representation (Interactive or SVG Fallback) */}
          <div
            className="flex flex-col items-center justify-center p-4 bg-abyss rounded-lg border border-line relative min-h-[260px]"
            data-testid="bloch-visual-container"
          >
            {forceStaticFallback ? (
              /* Static 2D/3D SVG Projection Fallback */
              <div
                className="w-full flex flex-col items-center space-y-2"
                data-testid="bloch-static-fallback"
              >
                <div className="text-[10px] font-mono text-ink-faint flex items-center gap-1 self-start">
                  <TableIcon className="w-3 h-3 text-accent" />
                  <span>Static SVG Orthographic Projection</span>
                </div>

                <svg
                  viewBox="-110 -110 220 220"
                  className="w-48 h-48 sm:w-56 sm:h-56 select-none overflow-visible"
                  role="img"
                  aria-label={`Bloch sphere projection for qubit ${activeQubit.qubit}`}
                >
                  {/* Sphere boundary */}
                  <circle
                    cx="0"
                    cy="0"
                    r="80"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Equator ellipse */}
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="80"
                    ry="25"
                    fill="none"
                    stroke="#3f3f46"
                    strokeWidth="1"
                  />

                  {/* Coordinate Axes */}
                  {/* Z Axis (Vertical: |0> at top, |1> at bottom) */}
                  <line x1="0" y1="-95" x2="0" y2="95" stroke="#71717a" strokeWidth="1.5" />
                  <polygon points="0,-98 -3,-90 3,-90" fill="#71717a" />
                  <text x="8" y="-85" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
                    +Z |0⟩
                  </text>
                  <text x="8" y="92" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
                    -Z |1⟩
                  </text>

                  {/* X Axis (Diagonal forward) */}
                  <line x1="60" y1="20" x2="-60" y2="-20" stroke="#52525b" strokeWidth="1.2" />
                  <text x="64" y="24" fill="#71717a" fontSize="9" fontFamily="monospace">
                    +X |+⟩
                  </text>

                  {/* Y Axis (Horizontal) */}
                  <line x1="-95" y1="0" x2="95" y2="0" stroke="#52525b" strokeWidth="1.2" />
                  <text x="80" y="-6" fill="#71717a" fontSize="9" fontFamily="monospace">
                    +Y |+i⟩
                  </text>

                  {/* Center Origin Dot */}
                  <circle cx="0" cy="0" r="2.5" fill="#a1a1aa" />

                  {/* Bloch Vector */}
                  {(() => {
                    const vx = (activeQubit.bloch.y * 0.7 - activeQubit.bloch.x * 0.45) * 80;
                    const vy = (-activeQubit.bloch.z + activeQubit.bloch.x * 0.2) * 80;
                    const color = isMixed ? '#a855f7' : '#06b6d4';

                    return (
                      <g>
                        {/* Vector Line */}
                        <line
                          x1="0"
                          y1="0"
                          x2={vx}
                          y2={vy}
                          stroke={color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Vector Head */}
                        <circle
                          cx={vx}
                          cy={vy}
                          r={isMixed ? 4 : 5}
                          fill={color}
                          stroke="#09090b"
                          strokeWidth="1.5"
                        />
                        {/* Radius indicator circle if mixed */}
                        {isMixed && blochRadius > 0.05 && (
                          <circle
                            cx="0"
                            cy="0"
                            r={blochRadius * 80}
                            fill={color}
                            fillOpacity="0.05"
                            stroke={color}
                            strokeWidth="0.8"
                            strokeDasharray="2 2"
                          />
                        )}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              /* Dynamic Canvas / SVG Representation */
              <div
                className="w-full flex flex-col items-center space-y-2"
                data-testid="bloch-dynamic-render"
              >
                <div className="text-[10px] font-mono text-evidence flex items-center gap-1 self-start">
                  <Sparkles className="w-3 h-3 text-evidence" />
                  <span>Dynamic Multi-Axis Projection</span>
                </div>

                <svg
                  viewBox="-110 -110 220 220"
                  className="w-48 h-48 sm:w-56 sm:h-56 select-none overflow-visible"
                  role="img"
                  aria-label={`Dynamic Bloch render for qubit ${activeQubit.qubit}`}
                >
                  <circle cx="0" cy="0" r="80" fill="#090d16" stroke="#1e293b" strokeWidth="2" />
                  <ellipse cx="0" cy="0" rx="80" ry="28" fill="none" stroke="#334155" strokeWidth="1" />
                  <ellipse cx="0" cy="0" rx="28" ry="80" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />

                  {/* Z Axis */}
                  <line x1="0" y1="-95" x2="0" y2="95" stroke="#64748b" strokeWidth="1.5" />
                  <text x="8" y="-85" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">|0⟩</text>
                  <text x="8" y="92" fill="#64748b" fontSize="10" fontFamily="monospace">|1⟩</text>

                  {/* X and Y Axes */}
                  <line x1="-90" y1="0" x2="90" y2="0" stroke="#475569" strokeWidth="1" />
                  <line x1="55" y1="22" x2="-55" y2="-22" stroke="#475569" strokeWidth="1" />

                  {/* Vector */}
                  {(() => {
                    const vx = (activeQubit.bloch.y * 0.7 - activeQubit.bloch.x * 0.45) * 80;
                    const vy = (-activeQubit.bloch.z + activeQubit.bloch.x * 0.2) * 80;
                    const color = isMixed ? '#c084fc' : '#22d3ee';

                    return (
                      <g>
                        <line x1="0" y1="0" x2={vx} y2={vy} stroke={color} strokeWidth="3" strokeLinecap="round" />
                        <circle cx={vx} cy={vy} r="5" fill={color} stroke="#0f172a" strokeWidth="2" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            )}
          </div>

          {/* Coordinates & Quantum Physics Interpretation Table */}
          <div className="space-y-4 font-mono text-xs" data-testid="bloch-data-table">
            <div className="rounded-lg border border-line bg-abyss p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-bold text-ink">Bloch Coordinates</span>
                <span className="text-[11px] text-ink-faint">Radius r = {blochRadius.toFixed(3)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-raised border border-line">
                  <div className="text-[10px] text-ink-faint">⟨X⟩</div>
                  <div className="font-bold text-ink" data-testid="coord-x">
                    {activeQubit.bloch.x.toFixed(3)}
                  </div>
                </div>
                <div className="p-2 rounded bg-raised border border-line">
                  <div className="text-[10px] text-ink-faint">⟨Y⟩</div>
                  <div className="font-bold text-ink" data-testid="coord-y">
                    {activeQubit.bloch.y.toFixed(3)}
                  </div>
                </div>
                <div className="p-2 rounded bg-raised border border-line">
                  <div className="text-[10px] text-ink-faint">⟨Z⟩</div>
                  <div className="font-bold text-ink" data-testid="coord-z">
                    {activeQubit.bloch.z.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between text-ink-dim">
                  <span>Subsystem Purity γ = Tr(ρ²):</span>
                  <span
                    data-testid="purity-value"
                    className={`font-bold ${isMixed ? 'text-violet' : 'text-evidence'}`}
                  >
                    {activeQubit.purity.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between text-ink-dim">
                  <span>State Classification:</span>
                  <span
                    data-testid="classification-label"
                    className={`font-bold ${isMixed ? 'text-violet' : 'text-accent'}`}
                  >
                    {activeQubit.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Subsystem Interpretation Box */}
            <div
              className={`p-3 rounded-lg border text-xs leading-relaxed font-sans ${
                isMixed
                  ? 'border-violet/40 bg-violet/10 text-violet-200'
                  : 'border-accent/40 bg-accent/10 text-cyan-200'
              }`}
              data-testid="subsystem-explanation-box"
            >
              {isMixed ? (
                <div className="space-y-1">
                  <strong className="block text-violet font-semibold">
                    Entangled Subsystem (Mixed Reduced State):
                  </strong>
                  <p className="text-[11px] text-ink-dim">
                    Because this qubit is entangled with another qubit, tracing out the rest of the system yields a mixed state (Tr(ρ²) = {activeQubit.purity} &lt; 1). The Bloch vector sits inside the sphere (r = {blochRadius.toFixed(2)}) and cannot describe the entangled whole.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <strong className="block text-accent font-semibold">
                    Separable Pure State:
                  </strong>
                  <p className="text-[11px] text-ink-dim">
                    This qubit is in a definite pure quantum state (Tr(ρ²) = 1.000) located on the surface of the Bloch sphere (r = 1.00).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-raised/40 p-4 border-t border-line flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-ink-dim">
          <Info className="w-3.5 h-3.5 text-accent" />
          <span className="italic">
            Mathematical representation, not physical trajectory.
          </span>
        </div>
        <span className="text-ink-faint font-mono text-[10px]">
          Qubit {activeQubit.qubit} · {activeQubit.label}
        </span>
      </CardFooter>
    </Card>
  );
}
