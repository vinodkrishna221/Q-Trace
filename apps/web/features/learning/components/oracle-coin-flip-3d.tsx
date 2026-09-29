'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw, Eye, Sparkles, CheckCircle2, AlertCircle, Compass, HelpCircle, Info } from 'lucide-react';

interface CoinMeshProps {
  index: number;
  label: string;
  isTarget: boolean;
  isInverted: boolean;
  position: [number, number, number];
  onSelect: () => void;
  isScanning: boolean;
  scanProgress: number;
}

function CoinMesh({
  index,
  label,
  isTarget,
  isInverted,
  position,
  onSelect,
  isScanning,
  scanProgress,
}: CoinMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coinRef = useRef<THREE.Mesh>(null);
  const targetRotationX = isInverted ? Math.PI : 0;
  const currentRotationX = useRef(targetRotationX);

  // Scan highlighting calculation
  const scanIndex = scanProgress * 8;
  const isBeingScanned = isScanning && Math.abs(scanIndex - index) < 0.8;

  useFrame((state, delta) => {
    // Smooth lerp rotation for flip animation
    currentRotationX.current = THREE.MathUtils.lerp(
      currentRotationX.current,
      targetRotationX,
      delta * 6
    );

    if (groupRef.current) {
      // Gentle floating sine wave
      const floatOffset = Math.sin(state.clock.elapsedTime * 2 + index * 0.7) * 0.08;
      groupRef.current.position.y = position[1] + floatOffset;
    }

    if (coinRef.current) {
      coinRef.current.rotation.x = currentRotationX.current;
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* 3D Floating Target Crown / Marker Ring */}
      {isTarget && (
        <mesh position={[0, 0.9, 0]}>
          <ringGeometry args={[0.3, 0.38, 32]} />
          <meshBasicMaterial 
            color={isInverted ? "#f59e0b" : "#06b6d4"} 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.85} 
          />
        </mesh>
      )}

      {/* The 3D Coin / Disc */}
      <mesh ref={coinRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.1, 32]} />
        <meshStandardMaterial
          color={
            isBeingScanned
              ? "#a855f7"
              : isInverted
              ? "#d97706"
              : isTarget
              ? "#0284c7"
              : "#334155"
          }
          metalness={0.7}
          roughness={0.25}
          emissive={
            isBeingScanned
              ? "#7e22ce"
              : isInverted
              ? "#b45309"
              : isTarget
              ? "#0369a1"
              : "#0f172a"
          }
          emissiveIntensity={isBeingScanned ? 0.9 : isInverted ? 0.6 : isTarget ? 0.4 : 0.1}
        />

        {/* Top Face Symbol: Normal (+ Phase) */}
        <Html position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} center transform pointerEvents="none">
          <div className="flex flex-col items-center justify-center select-none text-[11px] font-mono font-bold text-white">
            <span className="text-cyan-300 drop-shadow-sm">+</span >
          </div>
        </Html>

        {/* Bottom Face Symbol: Inverted (-1 Phase) */}
        <Html position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]} center transform pointerEvents="none">
          <div className="flex flex-col items-center justify-center select-none text-[11px] font-mono font-bold text-amber-200">
            <span className="drop-shadow-sm">-1</span>
          </div>
        </Html>
      </mesh>

      {/* Pedestal Platform */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.42, 0.48, 0.15, 24]} />
        <meshStandardMaterial
          color={isTarget ? (isInverted ? "#78350f" : "#0c4a6e") : "#1e293b"}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Floating State Badge under Pedestal */}
      <Html position={[0, -1.05, 0]} center pointerEvents="none">
        <div className="flex flex-col items-center gap-0.5 select-none text-center">
          <span
            className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-semibold transition-colors duration-300 ${
              isTarget
                ? isInverted
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            {label}
          </span>
          <span className="font-mono text-[9px] text-slate-400">
            {isInverted ? '-0.35' : '+0.35'}
          </span>
          <span className="font-mono text-[9px] text-slate-500">12.5%</span>
        </div>
      </Html>
    </group>
  );
}

// Scanner Beam Line
function ScannerLaser({ isScanning, scanProgress }: { isScanning: boolean; scanProgress: number }) {
  if (!isScanning) return null;
  // Calculate X position from -5.25 to +5.25
  const laserX = -5.25 + scanProgress * 10.5;

  return (
    <group position={[laserX, 0, 0]}>
      {/* Vertical beam */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 16]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.75} />
      </mesh>
      {/* Ground ripple */}
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.6, 24]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

const STATES_8 = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];

export function OracleCoinFlip3D() {
  const [targetIndex, setTargetIndex] = useState<number>(5); // default |101>
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [peekResult, setPeekResult] = useState<string | null>(null);

  // Trigger Oracle Scan Animation
  const handleApplyOracle = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setPeekResult(null);

    const startTime = performance.now();
    const duration = 1200; // 1.2s sweep

    const animateSweep = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setScanProgress(progress);

      // Trigger flip when laser hits target
      const hitProgress = targetIndex / 7;
      if (progress >= hitProgress && !isInverted) {
        setIsInverted(true);
      }

      if (progress < 1) {
        requestAnimationFrame(animateSweep);
      } else {
        setIsScanning(false);
        setIsInverted(true);
      }
    };

    requestAnimationFrame(animateSweep);
  };

  const handleReset = () => {
    setIsScanning(false);
    setIsInverted(false);
    setScanProgress(0);
    setPeekResult(null);
  };

  const handlePeekMeasure = () => {
    // Layperson demonstration: pick a random state
    const randomIndex = Math.floor(Math.random() * 8);
    const state = STATES_8[randomIndex];
    setPeekResult(state);
  };

  return (
    <Card className="border border-line bg-card overflow-hidden" data-testid="oracle-coin-flip-3d-card">
      <CardContent className="p-0 flex flex-col">
        {/* Header Ribbon */}
        <div className="p-4 sm:p-5 border-b border-line bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] tracking-wider border-accent/40 text-accent">
                3D INTERACTIVE CHAMBER
              </Badge>
              <span className="text-xs font-mono text-text-muted">Target: {STATES_8[targetIndex]}</span>
            </div>
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <span>The Quantum Coin Flip (Phase Marking)</span>
            </h3>
            <p className="text-xs text-text-secondary max-w-xl">
              All 8 possibilities float in equal superposition. The Oracle scans the field and secretly flips the target coin upside-down without collapsing the wave.
            </p>
          </div>

          {/* Quick Target Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-text-muted mr-1">Secret Target:</span>
            {STATES_8.map((label, idx) => (
              <button
                key={label}
                onClick={() => {
                  setTargetIndex(idx);
                  setIsInverted(false);
                  setPeekResult(null);
                }}
                className={`font-mono text-xs px-2 py-1 rounded transition-colors ${
                  targetIndex === idx
                    ? 'bg-accent text-white font-bold shadow-sm'
                    : 'bg-panel hover:bg-surface text-text-secondary border border-line'
                }`}
                title={`Set ${label} as the secret target`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Canvas Area */}
        <div className="w-full h-[360px] sm:h-[400px] relative bg-abyss cursor-grab active:cursor-grabbing">
          <Canvas camera={{ position: [0, 1.8, 7.8], fov: 46 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} />
            <pointLight position={[0, 4, 3]} intensity={0.5} color="#06b6d4" />
            
            <ScannerLaser isScanning={isScanning} scanProgress={scanProgress} />

            {/* 8 Floating Coins */}
            {STATES_8.map((label, idx) => {
              const xPos = -5.25 + idx * 1.5;
              return (
                <CoinMesh
                  key={label}
                  index={idx}
                  label={label}
                  isTarget={targetIndex === idx}
                  isInverted={targetIndex === idx && isInverted}
                  position={[xPos, 0, 0]}
                  onSelect={() => {
                    setTargetIndex(idx);
                    setIsInverted(false);
                    setPeekResult(null);
                  }}
                  isScanning={isScanning}
                  scanProgress={scanProgress}
                />
              );
            })}

            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2.1}
              minAzimuthAngle={-Math.PI / 8}
              maxAzimuthAngle={Math.PI / 8}
            />
          </Canvas>

          {/* Interactive Hint Overlay */}
          <div className="absolute top-3 left-3 bg-surface/80 backdrop-blur-sm border border-line px-2.5 py-1 rounded text-[11px] font-mono text-text-secondary flex items-center gap-1.5 pointer-events-none">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>Drag gently to tilt 3D view • Click any coin to set secret target</span>
          </div>

          {/* Target Status Floating Pill */}
          <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-sm border border-line px-3 py-1.5 rounded text-xs font-mono flex items-center gap-2">
            <span className="text-text-muted">Target Phase:</span>
            {isInverted ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                -1 (Flipped Upside-Down)
              </span>
            ) : (
              <span className="text-cyan-400 font-medium">+1 (Normal / Upright)</span>
            )}
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="p-4 sm:p-5 border-t border-line bg-surface/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={handleApplyOracle}
              disabled={isScanning || isInverted}
              className="gap-2 font-mono text-xs shadow-glow bg-accent hover:bg-accent/90"
              data-testid="apply-oracle-scan-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isInverted ? 'Oracle Tag Applied' : 'Apply Oracle Scan'}</span>
            </Button>

            <Button
              onClick={handlePeekMeasure}
              variant="outline"
              className="gap-2 font-mono text-xs border-line hover:bg-surface text-text-primary"
              data-testid="peek-measure-btn"
            >
              <Eye className="w-3.5 h-3.5 text-warning" />
              <span>Try Peeking (Measure Now)</span>
            </Button>

            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="gap-1.5 font-mono text-xs text-text-muted hover:text-text-primary"
              data-testid="reset-oracle-btn"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              <span>+0.35 (Upright)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>-0.35 (Target Flipped)</span>
            </div>
            <div className="text-text-muted">
              P = <span className="text-text-primary font-bold">12.5% each</span>
            </div>
          </div>
        </div>

        {/* Peek / Measurement Collapse Result Notification */}
        {peekResult && (
          <div className="mx-4 sm:mx-5 mb-4 p-3.5 rounded-lg border border-warning/30 bg-warning/10 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-text-primary">
                You measured the 3 qubits and collapsed onto: <span className="font-mono text-warning font-bold">{peekResult}</span>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {peekResult === STATES_8[targetIndex]
                  ? `Pure luck! Even though ${peekResult} was inverted by the Oracle, its probability was still exactly 12.5% (1 in 8). The Oracle only flips the phase sign upside-down—it doesn't amplify probability yet!`
                  : `You didn't find the secret coin ${STATES_8[targetIndex]}! Why? Because flipping the coin upside-down did NOT make it larger—its probability was still only 12.5%. To actually make the secret coin stand out to a measurement, we must pass it to the Diffusion Chamber next!`}
              </p>
            </div>
          </div>
        )}

        {/* Intuitive Layperson Insight Card */}
        <div className="p-4 sm:p-5 bg-panel border-t border-line">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary block">
                The Core Layperson Secret: Phase vs. Probability
              </span>
              <p className="leading-relaxed">
                Notice that when the Oracle flips the target coin upside-down, the coin didn&apos;t grow bigger. In quantum mechanics, the probability of picking an item is its height <strong className="text-text-primary">squared</strong>:
                <br />
                <code className="text-text-primary font-mono">(+0.35)² = 0.125 (12.5%)</code> and <code className="text-text-primary font-mono">(-0.35)² = 0.125 (12.5%)</code>.
                <br />
                The secret coin is marked, but invisible to a normal measurement. Next, the <strong className="text-accent">Diffusion operator</strong> uses that upside-down mark to bounce the secret coin high into the sky!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
