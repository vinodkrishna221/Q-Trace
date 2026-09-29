'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Dices, RotateCcw, Eye, ShieldCheck, Compass, Info } from 'lucide-react';

interface QuantumPillarProps {
  stateLabel: string;
  position: [number, number, number];
  isInverted: boolean;
  isMeasured: boolean;
  onSelect: () => void;
  isSelected: boolean;
}

function QuantumPillar({
  stateLabel,
  position,
  isInverted,
  isMeasured,
  onSelect,
  isSelected,
}: QuantumPillarProps) {
  const meshRef = React.useRef<THREE.Group>(null);
  const currentHeight = React.useRef(isInverted ? -1.2 : 1.2);
  const targetHeight = isInverted ? -1.2 : 1.2;

  useFrame((_, delta) => {
    currentHeight.current = THREE.MathUtils.lerp(currentHeight.current, targetHeight, delta * 5);
    if (meshRef.current) {
      meshRef.current.position.y = currentHeight.current / 2;
      meshRef.current.scale.y = Math.abs(currentHeight.current) / 1.2;
      meshRef.current.rotation.x = currentHeight.current < 0 ? Math.PI : 0;
    }
  });

  const pillarColor = isMeasured
    ? '#059669' // Emerald green if sampled
    : isInverted
    ? '#d97706' // Amber for marked inverted state
    : isSelected
    ? '#0284c7' // Sky blue if selected
    : '#475569'; // Slate for normal states

  return (
    <group position={position} onClick={onSelect}>
      {/* Base pad */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.05, 16]} />
        <meshBasicMaterial color={isSelected ? '#0284c7' : '#94a3b8'} transparent opacity={0.4} />
      </mesh>

      {/* Floating Amplitude Pillar */}
      <group ref={meshRef}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
          <meshStandardMaterial
            color={pillarColor}
            emissive={pillarColor}
            emissiveIntensity={isInverted || isMeasured || isSelected ? 0.4 : 0.1}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* Energy Cap */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color={pillarColor}
            emissive={pillarColor}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* 3D Label */}
      <Html
        position={[0, isInverted ? -1.8 : 1.8, 0]}
        center
        className="pointer-events-none select-none"
      >
        <div
          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold transition-all shadow-xs ${
            isMeasured
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
              : isInverted
              ? 'bg-amber-600 text-white ring-2 ring-amber-400'
              : isSelected
              ? 'bg-accent text-white ring-2 ring-accent'
              : 'bg-surface/90 text-text-primary border border-border-subtle'
          }`}
        >
          |{stateLabel}⟩
        </div>
      </Html>
    </group>
  );
}

function OracleBeam({ targetPos, active }: { targetPos: [number, number, number]; active: boolean }) {
  const lineRef = React.useRef<any>(null);

  useFrame((state) => {
    if (lineRef.current && active) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 6) * 0.3;
    }
  });

  if (!active) return null;

  return (
    <group ref={lineRef}>
      <Line
        points={[[0, 0.2, 0], [targetPos[0], -0.6, targetPos[2]]]}
        color="#d97706"
        lineWidth={3}
        transparent
        opacity={0.8}
      />
    </group>
  );
}

export function QuantumStateRing3D() {
  const [isOracleApplied, setIsOracleApplied] = React.useState<boolean>(false);
  const [markedTarget, setMarkedTarget] = React.useState<string>('101');
  const [measuredState, setMeasuredState] = React.useState<string | null>(null);
  const [selectedState, setSelectedState] = React.useState<string>('101');
  const [shotHistory, setShotHistory] = React.useState<{ state: string; count: number }[]>([]);

  const basisStates = ['000', '001', '010', '011', '100', '101', '110', '111'];
  const ringRadius = 2.5;

  const statePositions = React.useMemo(() => {
    return basisStates.map((state, index) => {
      const angle = (index / basisStates.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;
      return {
        state,
        pos: [x, 0, z] as [number, number, number],
      };
    });
  }, [basisStates]);

  const targetPillar = statePositions.find((s) => s.state === markedTarget);

  const handleApplyOracle = () => {
    setIsOracleApplied((prev) => !prev);
    setMeasuredState(null);
  };

  const handleMeasure = () => {
    // Quantum measurement simulation:
    // Even if marked target has negative phase, probability is |-1/sqrt(8)|^2 = 1/8 = 12.5% for ALL states!
    const randomIndex = Math.floor(Math.random() * basisStates.length);
    const chosen = basisStates[randomIndex];
    setMeasuredState(chosen);
    setSelectedState(chosen);

    setShotHistory((prev) => {
      const existing = prev.find((item) => item.state === chosen);
      if (existing) {
        return prev.map((item) => (item.state === chosen ? { ...item, count: item.count + 1 } : item));
      }
      return [...prev, { state: chosen, count: 1 }];
    });
  };

  const handleReset = () => {
    setIsOracleApplied(false);
    setMeasuredState(null);
    setSelectedState('101');
    setShotHistory([]);
  };

  return (
    <Card className="border border-border-subtle bg-surface shadow-xs overflow-hidden" data-testid="quantum-state-ring-3d">
      <CardHeader className="py-3.5 px-4 bg-surface-raised/40 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-sans font-semibold text-text-primary flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <span>Interactive 3D Quantum State Ring (The 8 Mystery Chests)</span>
          </CardTitle>
          <CardDescription className="text-xs text-text-muted mt-0.5">
            Rotate the 3D scene freely. See the oracle flip the winner upside down while measurement probabilities stay equal.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleApplyOracle}
            className={`h-7 text-xs font-mono gap-1.5 cursor-pointer ${
              isOracleApplied
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold'
                : 'bg-accent hover:bg-accent/90 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOracleApplied ? 'Undo Oracle' : 'Apply Oracle U_ω'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMeasure}
            className="h-7 text-xs font-mono gap-1.5 border-emerald-600/40 text-emerald-700 hover:bg-emerald-500/10 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-emerald-600" />
            <span>Try Measure Now</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs text-text-muted hover:text-text-primary"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* 3D Canvas Viewport */}
        <div className="relative h-80 sm:h-96 w-full rounded-xl bg-surface-sunken border border-border-subtle overflow-hidden">
          <Canvas camera={{ position: [0, 4.5, 5], fov: 48 }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <pointLight position={[-10, -5, -10]} intensity={0.5} color="#d97706" />

            {/* Orbiting Ground Circle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
              <ringGeometry args={[ringRadius - 0.05, ringRadius + 0.05, 64]} />
              <meshBasicMaterial color="#94a3b8" transparent opacity={0.2} />
            </mesh>

            {/* Center Oracle Beacon */}
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial
                color={isOracleApplied ? '#d97706' : '#0284c7'}
                emissive={isOracleApplied ? '#d97706' : '#0284c7'}
                emissiveIntensity={0.8}
              />
            </mesh>

            {/* Beam from center to marked state when oracle is active */}
            {targetPillar && (
              <OracleBeam targetPos={targetPillar.pos} active={isOracleApplied} />
            )}

            {/* 8 State Pillars */}
            {statePositions.map(({ state, pos }) => {
              const isMarked = state === markedTarget;
              const isInverted = isOracleApplied && isMarked;
              const isMeasured = state === measuredState;
              const isSelected = state === selectedState;

              return (
                <QuantumPillar
                  key={state}
                  stateLabel={state}
                  position={pos}
                  isInverted={isInverted}
                  isMeasured={isMeasured}
                  isSelected={isSelected}
                  onSelect={() => setSelectedState(state)}
                />
              );
            })}

            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Canvas>

          {/* 3D Viewport Overlay Hint */}
          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-text-muted bg-surface/80 backdrop-blur-xs px-2 py-1 rounded border border-border-subtle">
            🖱️ Drag to rotate 3D view · Click any state to inspect
          </div>

          {/* Top Status Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-mono font-bold shadow-xs ${
                isOracleApplied
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                  : 'bg-surface/90 text-text-primary border border-border-subtle'
              }`}
            >
              {isOracleApplied ? `Phase Oracle Applied: |${markedTarget}⟩ Inverted (-180°)` : 'Superposition: All 8 Upright (+1)'}
            </span>
          </div>
        </div>

        {/* Interactive Telemetry & The Aha-Moment Callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Left: Selected State Telemetry */}
          <div className="p-3.5 rounded-lg border border-border-subtle bg-surface-raised/40 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-sans font-semibold text-text-primary text-[11px] uppercase tracking-wider">
                Inspected State: |{selectedState}⟩
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono ${
                  isOracleApplied && selectedState === markedTarget
                    ? 'border-amber-600 text-amber-700 bg-amber-500/10'
                    : 'border-accent/40 text-accent'
                }`}
              >
                {selectedState === markedTarget ? 'TARGET WINNER' : 'NORMAL CHEST'}
              </Badge>
            </div>

            <div className="space-y-1 text-text-secondary text-[11px]">
              <div className="flex justify-between">
                <span>Phase Factor:</span>
                <strong className={isOracleApplied && selectedState === markedTarget ? 'text-amber-700' : 'text-emerald-600'}>
                  {isOracleApplied && selectedState === markedTarget ? '-1.0 (Inverted In 3D Space)' : '+1.0 (Normal)'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Amplitude (α):</span>
                <strong>{isOracleApplied && selectedState === markedTarget ? '-0.354' : '+0.354'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Measurement Probability (|α|²):</span>
                <strong className="text-emerald-600">12.5% (1/8 exactly)</strong>
              </div>
            </div>
          </div>

          {/* Right: The Measurement Proof Card */}
          <div className="p-3.5 rounded-lg border border-border-subtle bg-surface-raised/40 space-y-2">
            <div className="flex items-center gap-1.5 font-sans font-semibold text-text-primary text-[11px] uppercase tracking-wider">
              <Dices className="w-3.5 h-3.5 text-emerald-600" />
              <span>Measurement Invariance Proof</span>
            </div>

            {measuredState ? (
              <div className="space-y-1 text-xs">
                <p className="text-text-primary font-medium">
                  Sampled Output: <strong className="font-mono text-emerald-700">|{measuredState}⟩</strong>
                </p>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Notice that even with the oracle active, you randomly sampled a normal chest! Measurement cannot detect a negative sign because <code className="font-mono">|-0.354|² = 12.5%</code>.
                  This proves why we must use the <strong>Diffusion Operator</strong> in the next step to amplify it!
                </p>
              </div>
            ) : (
              <p className="text-xs text-text-muted leading-relaxed">
                Click <strong>"Try Measure Now"</strong> above. Watch what happens when you collapse the superposition immediately after the oracle.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
