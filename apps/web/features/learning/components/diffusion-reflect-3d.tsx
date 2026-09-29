'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw, Sparkles, CheckCircle2, Waves, Compass, Info, ArrowUpRight } from 'lucide-react';

interface PillarMeshProps {
  index: number;
  label: string;
  isTarget: boolean;
  step: 'INITIAL' | 'MEAN_SHOWN' | 'REFLECTED_1' | 'REFLECTED_2';
  position: [number, number, number];
}

function PillarMesh({
  index,
  label,
  isTarget,
  step,
  position,
}: PillarMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentHeight = useRef(isTarget ? -1.2 : 1.2);
  const currentY = useRef(isTarget ? -0.6 : 0.6);

  // Compute target amplitude and height based on step
  let targetAmp = 0.354;
  let heightScale = 1.2;

  if (step === 'INITIAL' || step === 'MEAN_SHOWN') {
    targetAmp = isTarget ? -0.354 : 0.354;
  } else if (step === 'REFLECTED_1') {
    targetAmp = isTarget ? 0.729 : 0.177;
  } else if (step === 'REFLECTED_2') {
    targetAmp = isTarget ? 0.972 : 0.035;
  }

  heightScale = targetAmp * 3.5; // Visual height multiplier

  useFrame((_, delta) => {
    // Lerp height and position for smooth physics reflection
    currentHeight.current = THREE.MathUtils.lerp(
      currentHeight.current,
      heightScale,
      delta * 4.5
    );
    currentY.current = THREE.MathUtils.lerp(
      currentY.current,
      currentHeight.current / 2,
      delta * 4.5
    );

    if (meshRef.current) {
      meshRef.current.scale.y = Math.max(Math.abs(currentHeight.current), 0.05);
      meshRef.current.position.y = currentY.current;
    }
  });

  const probability = (targetAmp * targetAmp * 100).toFixed(1);
  const isPositive = targetAmp >= 0;

  return (
    <group position={position}>
      {/* 3D Pillar */}
      <mesh ref={meshRef} position={[0, currentY.current, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 1, 24]} />
        <meshStandardMaterial
          color={
            isTarget
              ? isPositive
                ? "#10b981" // Emerald when boosted
                : "#f59e0b" // Amber when inverted
              : "#6366f1"   // Indigo for background states
          }
          metalness={0.6}
          roughness={0.3}
          emissive={
            isTarget
              ? isPositive
                ? "#047857"
                : "#b45309"
              : "#312e81"
          }
          emissiveIntensity={isTarget ? 0.6 : 0.2}
        />
      </mesh>

      {/* Base Foundation disc */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 0.06, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Floating State Info Label */}
      <Html position={[0, -0.65, 0]} center pointerEvents="none">
        <div className="flex flex-col items-center gap-0.5 select-none text-center">
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors duration-300 ${
              isTarget
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            {label}
          </span>
          <span className="font-mono text-[9px] font-bold text-slate-200">
            {probability}%
          </span>
          <span className="font-mono text-[8px] text-slate-400">
            α: {targetAmp > 0 ? `+${targetAmp.toFixed(2)}` : targetAmp.toFixed(2)}
          </span>
        </div>
      </Html>
    </group>
  );
}

// Glowing Average Plane (Water Level)
function MeanPlane({ show }: { show: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetOpacity = show ? 0.45 : 0;
  const currentOpacity = useRef(0);

  // Mean amplitude for N=8 with 1 inverted state is ~0.265 (visual height ~0.93)
  const meanHeight = 0.265 * 3.5;

  useFrame((_, delta) => {
    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity,
      delta * 4
    );
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = currentOpacity.current;
    }
  });

  return (
    <group position={[0, meanHeight, 0]}>
      {/* Translucent Mean Glass Surface */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0}
          roughness={0.1}
          metalness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating Indicator on the Average Plane */}
      {show && (
        <Html position={[5.8, 0, 0]} center pointerEvents="none">
          <div className="bg-sky-500/20 border border-sky-400 text-sky-200 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap backdrop-blur-xs select-none">
            Average Plane (Mean ᾱ = +0.26)
          </div>
        </Html>
      )}
    </group>
  );
}

const STATES_8 = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];

export function DiffusionReflect3D() {
  const [targetIndex, setTargetIndex] = useState<number>(5); // |101⟩
  const [step, setStep] = useState<'INITIAL' | 'MEAN_SHOWN' | 'REFLECTED_1' | 'REFLECTED_2'>('INITIAL');

  const handleNextStep = () => {
    if (step === 'INITIAL') setStep('MEAN_SHOWN');
    else if (step === 'MEAN_SHOWN') setStep('REFLECTED_1');
    else if (step === 'REFLECTED_1') setStep('REFLECTED_2');
  };

  const handleReset = () => {
    setStep('INITIAL');
  };

  return (
    <Card className="border border-line bg-card overflow-hidden" data-testid="diffusion-reflect-3d-card">
      <CardContent className="p-0 flex flex-col">
        {/* Header Ribbon */}
        <div className="p-4 sm:p-5 border-b border-line bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] tracking-wider border-sky-500/40 text-sky-400">
                3D PHYSICAL REFLECTION
              </Badge>
              <span className="text-xs font-mono text-text-muted">Target: {STATES_8[targetIndex]}</span>
            </div>
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <span>The Water Level Reflection (Inversion About the Mean)</span>
            </h3>
            <p className="text-xs text-text-secondary max-w-xl">
              Because the Oracle flipped target {STATES_8[targetIndex]} deep underground, reflecting every pillar across the average launches the target into the sky.
            </p>
          </div>

          {/* Stepper Status Pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted">Stage:</span>
            <Badge variant="default" className="font-mono text-xs">
              {step === 'INITIAL' && '1. Marked State Underground'}
              {step === 'MEAN_SHOWN' && '2. Average Glass Plane Revealed'}
              {step === 'REFLECTED_1' && '3. Iteration 1 (53.1% Boost)'}
              {step === 'REFLECTED_2' && '4. Iteration 2 (94.5% Peak!)'}
            </Badge>
          </div>
        </div>

        {/* 3D Canvas Area */}
        <div className="w-full h-[360px] sm:h-[420px] relative bg-abyss cursor-grab active:cursor-grabbing">
          <Canvas camera={{ position: [0, 2.2, 8.2], fov: 46 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[6, 9, 6]} intensity={1.2} />
            <pointLight position={[0, 4, 3]} intensity={0.5} color="#38bdf8" />

            {/* Glowing Mean Plane */}
            <MeanPlane show={step !== 'INITIAL'} />

            {/* Zero ground plane line */}
            <gridHelper args={[14, 14, '#334155', '#1e293b']} position={[0, 0, 0]} />

            {/* 8 Pillars */}
            {STATES_8.map((label, idx) => {
              const xPos = -5.25 + idx * 1.5;
              return (
                <PillarMesh
                  key={label}
                  index={idx}
                  label={label}
                  isTarget={targetIndex === idx}
                  step={step}
                  position={[xPos, 0, 0]}
                />
              );
            })}

            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 3.2}
              maxPolarAngle={Math.PI / 2.05}
              minAzimuthAngle={-Math.PI / 7}
              maxAzimuthAngle={Math.PI / 7}
            />
          </Canvas>

          {/* Interactive Hint */}
          <div className="absolute top-3 left-3 bg-surface/80 backdrop-blur-sm border border-line px-2.5 py-1 rounded text-[11px] font-mono text-text-secondary flex items-center gap-1.5 pointer-events-none">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Drag gently to orbit • Notice how the underground pillar bounces upward</span>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="p-4 sm:p-5 border-t border-line bg-surface/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={handleNextStep}
              disabled={step === 'REFLECTED_2'}
              className="gap-2 font-mono text-xs shadow-glow bg-accent hover:bg-accent/90"
              data-testid="step-diffusion-reflect-btn"
            >
              {step === 'INITIAL' && (
                <>
                  <Waves className="w-3.5 h-3.5" />
                  <span>Reveal Average Plane</span>
                </>
              )}
              {step === 'MEAN_SHOWN' && (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reflect Across Mean (Iter 1)</span>
                </>
              )}
              {step === 'REFLECTED_1' && (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Run Iteration 2 (Peak 94.5%)</span>
                </>
              )}
              {step === 'REFLECTED_2' && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Maximum Amplification Reached</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="gap-1.5 font-mono text-xs text-text-secondary hover:text-text-primary border-line"
              data-testid="reset-diffusion-btn"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset State</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              <span>Normal States</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>Target State (Amplified)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              <span>Average Glass Plane</span>
            </div>
          </div>
        </div>

        {/* Layperson Explanation Callout */}
        <div className="p-4 sm:p-5 bg-panel border-t border-line">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary block">
                Why Does Inversion Across the Average Work?
              </span>
              <p className="leading-relaxed">
                Think of the average plane like a mirror. If you stand 1 foot in front of a mirror, your reflection is 1 foot behind it.
                <br />
                The normal pillars were already close to the average, so when reflected, they barely moved and sank to <strong className="text-text-primary">17.7%</strong>.
                <br />
                But because the Oracle pulled the secret coin <strong className="text-amber-400">deep underground</strong>, it was far below the average mirror. When reflected, it had to bounce <strong className="text-emerald-400">all the way up into the sky</strong>! After two bounces, measuring the qubits has a <strong className="text-emerald-400 font-bold">94.5% certainty</strong> of finding the prize!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
