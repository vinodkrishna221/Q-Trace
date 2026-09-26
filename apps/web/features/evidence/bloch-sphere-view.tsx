'use client';

import * as React from 'react';
import { ComplexValue, ReducedQubit } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, Info, ShieldAlert, Sparkles, Layers, Table as TableIcon, Eye, Globe2, Link2, Box } from 'lucide-react';
import { Bloch3DSphere } from './bloch-3d-sphere';
import { TwoQubitCorrelationBridge } from './two-qubit-correlation-bridge';
import { TwoQubitQSphere } from './two-qubit-qsphere';

export type BlochViewMode = 'DUAL_3D' | 'SINGLE_3D' | 'Q_SPHERE';

interface BlochSphereViewProps {
  reducedQubits: ReducedQubit[];
  stepLabel?: string;
  disablePlotly?: boolean;
  amplitudes?: Record<string, ComplexValue>;
  basisProbabilities?: Record<string, number>;
}

export function BlochSphereView({
  reducedQubits,
  stepLabel,
  disablePlotly = false,
  amplitudes,
  basisProbabilities,
}: BlochSphereViewProps) {
  const [selectedQubitIndex, setSelectedQubitIndex] = React.useState<number>(0);
  const [forceStaticFallback, setForceStaticFallback] = React.useState<boolean>(disablePlotly);
  const [viewMode, setViewMode] = React.useState<BlochViewMode>('DUAL_3D');
  const [sharedRotation, setSharedRotation] = React.useState({ rotX: -0.35, rotY: 0.55 });
  const [syncCameras, setSyncCameras] = React.useState(true);

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

  const hasTwoQubits = reducedQubits.length >= 2;

  return (
    <Card
      className="border-line bg-abyss/80 shadow-lg overflow-hidden"
      data-testid="bloch-sphere-card"
    >
      <CardHeader className="pb-3 border-b border-line bg-raised/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-mono">
              BLOCH SUBSYSTEM & 2-QUBIT SUITE
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

          {/* Controls: Mode Switcher & Fallback Toggle */}
          <div className="flex items-center gap-2">
            {/* View Mode Pills (Only in dynamic render mode) */}
            {!forceStaticFallback && hasTwoQubits && (
              <div className="flex items-center rounded-full border border-border-subtle bg-surface-raised/70 p-0.5 text-[11px] font-mono">
                <button
                  type="button"
                  data-testid="view-mode-dual-btn"
                  onClick={() => setViewMode('DUAL_3D')}
                  className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                    viewMode === 'DUAL_3D'
                      ? 'bg-accent/20 text-accent font-bold shadow-xs'
                      : 'text-ink-dim hover:text-ink'
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                  <span>Dual 3D Bloch</span>
                </button>
                <button
                  type="button"
                  data-testid="view-mode-single-btn"
                  onClick={() => setViewMode('SINGLE_3D')}
                  className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                    viewMode === 'SINGLE_3D'
                      ? 'bg-accent/20 text-accent font-bold shadow-xs'
                      : 'text-ink-dim hover:text-ink'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span>Single Wire</span>
                </button>
                <button
                  type="button"
                  data-testid="view-mode-qsphere-btn"
                  onClick={() => setViewMode('Q_SPHERE')}
                  className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                    viewMode === 'Q_SPHERE'
                      ? 'bg-accent/20 text-accent font-bold shadow-xs'
                      : 'text-ink-dim hover:text-ink'
                  }`}
                >
                  <Globe2 className="w-3 h-3" />
                  <span>2-Qubit Q-Sphere</span>
                </button>
              </div>
            )}

            {/* Toggle for interactive 3D vs static SVG fallback */}
            <button
              type="button"
              data-testid="toggle-plotly-fallback"
              aria-pressed={forceStaticFallback}
              onClick={() => setForceStaticFallback(!forceStaticFallback)}
              className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-surface-raised border border-border-subtle hover:border-border-medium text-ink-dim hover:text-ink transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
        {/* Qubit Selector Tabs (Available in Single Inspector mode and fallback mode) */}
        {(viewMode === 'SINGLE_3D' || forceStaticFallback || !hasTwoQubits) && (
          <div
            className="flex items-center gap-2 border-b border-border-subtle pb-3"
            role="tablist"
            aria-label="Qubit Wire Subsystem Selector"
          >
            <span className="text-xs font-mono text-ink-dim mr-2">Select Qubit Wire:</span>
            {reducedQubits.map((rq, idx) => (
              <button
                key={rq.qubit}
                type="button"
                role="tab"
                aria-selected={selectedQubitIndex === idx}
                aria-controls="bloch-visual-container"
                data-testid={`qubit-tab-${rq.qubit}`}
                onClick={() => setSelectedQubitIndex(idx)}
                className={`px-3 py-1 text-xs font-mono rounded-full border transition-all cursor-pointer flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  selectedQubitIndex === idx
                    ? 'border-accent bg-accent/15 text-accent font-bold shadow-xs'
                    : 'border-border-subtle bg-surface-raised/50 text-ink-dim hover:text-ink hover:border-border-medium'
                }`}
              >
                <span>q[{rq.qubit}]</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    rq.label === 'MIXED_SUBSYSTEM'
                      ? 'bg-violet/20 text-violet font-semibold'
                      : 'bg-accent/20 text-accent font-semibold'
                  }`}
                >
                  {rq.label === 'MIXED_SUBSYSTEM' ? 'MIXED' : 'PURE'}
                </span>
              </button>
            ))}
          </div>
        )}

        {forceStaticFallback ? (
          /* Static 2D/3D SVG Projection Fallback */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div
              className="flex flex-col items-center justify-center p-4 bg-abyss rounded-lg border border-line relative min-h-[260px]"
              data-testid="bloch-visual-container"
              id="bloch-visual-container"
            >
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
                  <line x1="0" y1="-95" x2="0" y2="95" stroke="#94a3b8" strokeWidth="1.5" />
                  <polygon points="0,-98 -3,-90 3,-90" fill="#94a3b8" />
                  <text x="8" y="-85" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    +Z |0⟩
                  </text>
                  <text x="8" y="92" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    -Z |1⟩
                  </text>

                  <line x1="60" y1="20" x2="-60" y2="-20" stroke="#64748b" strokeWidth="1.2" />
                  <text x="64" y="24" fill="#cbd5e1" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    +X |+⟩
                  </text>

                  <line x1="-95" y1="0" x2="95" y2="0" stroke="#64748b" strokeWidth="1.2" />
                  <text x="80" y="-6" fill="#cbd5e1" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    +Y |+i⟩
                  </text>

                  <circle cx="0" cy="0" r="2.5" fill="#a1a1aa" />

                  {/* Bloch Vector */}
                  {(() => {
                    const vx = (activeQubit.bloch.y * 0.7 - activeQubit.bloch.x * 0.45) * 80;
                    const vy = (-activeQubit.bloch.z + activeQubit.bloch.x * 0.2) * 80;
                    const color = isMixed ? '#a855f7' : '#06b6d4';

                    return (
                      <g>
                        <line
                          x1="0"
                          y1="0"
                          x2={vx}
                          y2={vy}
                          stroke={color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle
                          cx={vx}
                          cy={vy}
                          r={isMixed ? 4 : 5}
                          fill={color}
                          stroke="#09090b"
                          strokeWidth="1.5"
                        />
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
            </div>

            {/* Coordinates & Quantum Physics Interpretation Table */}
            <div className="space-y-4 font-mono text-xs" data-testid="bloch-data-table">
              <div className="rounded-lg border border-line bg-abyss p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="font-bold text-ink">Bloch Coordinates (q[{activeQubit.qubit}])</span>
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
        ) : (
          /* Dynamic Interactive 3D Suite */
          <div className="space-y-6" data-testid="bloch-dynamic-render">
            {/* MODE A: DUAL 3D BLOCH SPHERES (Both Qubits Side-by-Side + Entanglement Bridge) */}
            {viewMode === 'DUAL_3D' && hasTwoQubits && (
              <div className="space-y-6" data-testid="dual-3d-bloch-view">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sphere 0: Qubit 0 */}
                  <div
                    onClick={() => setSelectedQubitIndex(0)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-abyss flex flex-col items-center ${
                      selectedQubitIndex === 0
                        ? 'border-accent shadow-glow'
                        : 'border-line hover:border-line-bright'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">q[0] Wire</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            reducedQubits[0].label === 'MIXED_SUBSYSTEM'
                              ? 'text-violet border-violet/40'
                              : 'text-evidence border-evidence/40'
                          }`}
                        >
                          {reducedQubits[0].label === 'MIXED_SUBSYSTEM' ? 'MIXED (r=0)' : 'PURE (r=1)'}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono text-ink-faint">
                        γ = {reducedQubits[0].purity.toFixed(3)}
                      </span>
                    </div>

                    <Bloch3DSphere
                      bloch={reducedQubits[0].bloch}
                      purity={reducedQubits[0].purity}
                      label={reducedQubits[0].label}
                      qubitIndex={0}
                      rotation={syncCameras ? sharedRotation : undefined}
                      onRotate={syncCameras ? setSharedRotation : undefined}
                      size={270}
                    />

                    <div className="mt-2 text-[10px] font-mono text-ink-dim flex justify-between w-full px-2">
                      <span>⟨X⟩: {reducedQubits[0].bloch.x.toFixed(2)}</span>
                      <span>⟨Y⟩: {reducedQubits[0].bloch.y.toFixed(2)}</span>
                      <span>⟨Z⟩: {reducedQubits[0].bloch.z.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Sphere 1: Qubit 1 */}
                  <div
                    onClick={() => setSelectedQubitIndex(1)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-abyss flex flex-col items-center ${
                      selectedQubitIndex === 1
                        ? 'border-accent shadow-glow'
                        : 'border-line hover:border-line-bright'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-violet">q[1] Wire</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            reducedQubits[1].label === 'MIXED_SUBSYSTEM'
                              ? 'text-violet border-violet/40'
                              : 'text-evidence border-evidence/40'
                          }`}
                        >
                          {reducedQubits[1].label === 'MIXED_SUBSYSTEM' ? 'MIXED (r=0)' : 'PURE (r=1)'}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono text-ink-faint">
                        γ = {reducedQubits[1].purity.toFixed(3)}
                      </span>
                    </div>

                    <Bloch3DSphere
                      bloch={reducedQubits[1].bloch}
                      purity={reducedQubits[1].purity}
                      label={reducedQubits[1].label}
                      qubitIndex={1}
                      rotation={syncCameras ? sharedRotation : undefined}
                      onRotate={syncCameras ? setSharedRotation : undefined}
                      size={270}
                    />

                    <div className="mt-2 text-[10px] font-mono text-ink-dim flex justify-between w-full px-2">
                      <span>⟨X⟩: {reducedQubits[1].bloch.x.toFixed(2)}</span>
                      <span>⟨Y⟩: {reducedQubits[1].bloch.y.toFixed(2)}</span>
                      <span>⟨Z⟩: {reducedQubits[1].bloch.z.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Synchronized Camera Toggle */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSyncCameras(!syncCameras)}
                    className="text-[11px] font-mono text-ink-dim hover:text-accent px-2 py-1 rounded bg-raised border border-line"
                  >
                    {syncCameras ? '🔗 Cameras Synchronized' : '🔓 Independent Rotation'}
                  </button>
                </div>

                {/* Entanglement Bridge & Pauli Correlation Tensor */}
                <TwoQubitCorrelationBridge
                  reducedQubits={reducedQubits}
                  amplitudes={amplitudes}
                  basisProbabilities={basisProbabilities}
                />
              </div>
            )}

            {/* MODE B: SINGLE QUBIT INSPECTOR (Focused 3D view with table) */}
            {viewMode === 'SINGLE_3D' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div
                  className="flex flex-col items-center justify-center p-4 bg-abyss rounded-lg border border-line relative min-h-[280px]"
                  data-testid="bloch-visual-container"
                >
                  <div className="text-[10px] font-mono text-evidence flex items-center gap-1 self-start mb-2">
                    <Sparkles className="w-3 h-3 text-evidence" />
                    <span>Interactive 3D Bloch Inspection</span>
                  </div>

                  <Bloch3DSphere
                    bloch={activeQubit.bloch}
                    purity={activeQubit.purity}
                    label={activeQubit.label}
                    qubitIndex={activeQubit.qubit}
                    size={280}
                  />
                </div>

                {/* Subsystem Interpretation Box for Single View */}
                <div className="space-y-4 font-mono text-xs">
                  <div
                    className={`p-4 rounded-lg border text-xs leading-relaxed font-sans ${
                      isMixed
                        ? 'border-violet/40 bg-violet/10 text-violet-200'
                        : 'border-accent/40 bg-accent/10 text-cyan-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-violet" />
                      <strong className="text-ink font-semibold">
                        {isMixed ? 'Entangled Mixed Subsystem (r = 0.00)' : 'Separable Pure Subsystem (r = 1.00)'}
                      </strong>
                    </div>
                    <p className="text-[11px] text-ink-dim leading-relaxed">
                      {isMixed
                        ? `Because qubit ${activeQubit.qubit} is entangled with its partner, taking the partial trace yields a maximally mixed state. Its vector sits at the center of the sphere (radius r = 0.000) with zero local bias.`
                        : `Qubit ${activeQubit.qubit} is in a definite separable state located on the surface of the Bloch sphere (radius r = 1.000).`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MODE C: 2-QUBIT Q-SPHERE */}
            {viewMode === 'Q_SPHERE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center" data-testid="qsphere-view-wrapper">
                <div className="flex flex-col items-center justify-center p-4 bg-abyss rounded-lg border border-line relative min-h-[280px]">
                  <div className="text-[10px] font-mono text-accent flex items-center gap-1 self-start mb-2">
                    <Globe2 className="w-3 h-3 text-accent" />
                    <span>2-Qubit Q-Sphere (Hamming Latitudes)</span>
                  </div>

                  <TwoQubitQSphere
                    amplitudes={amplitudes}
                    basisProbabilities={basisProbabilities}
                    size={280}
                  />
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-4 rounded-lg border border-line bg-abyss space-y-2">
                    <span className="font-bold text-ink">Q-Sphere Interpretation</span>
                    <p className="text-[11px] font-sans text-ink-dim leading-relaxed">
                      Unlike the single-qubit Bloch sphere which is limited to 1 qubit, the Q-Sphere displays the entire 2-qubit statevector on a single sphere.
                    </p>
                    <ul className="text-[11px] font-sans text-ink-dim space-y-1 list-disc list-inside">
                      <li><strong>North Pole (|00⟩):</strong> Hamming weight 0</li>
                      <li><strong>Equator (|01⟩, |10⟩):</strong> Hamming weight 1</li>
                      <li><strong>South Pole (|11⟩):</strong> Hamming weight 2</li>
                      <li><strong>Node Size:</strong> Probability amplitude magnitude</li>
                      <li><strong>Node Color:</strong> Quantum phase angle arg(ψ)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Coordinates & Quantum Physics Interpretation Table (Always visible for active qubit to fulfill contract) */}
            <div className="space-y-4 font-mono text-xs" data-testid="bloch-data-table">
              <div className="rounded-lg border border-line bg-abyss p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="font-bold text-ink">
                    Active Subsystem Coordinates (q[{activeQubit.qubit}])
                  </span>
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
        )}
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
