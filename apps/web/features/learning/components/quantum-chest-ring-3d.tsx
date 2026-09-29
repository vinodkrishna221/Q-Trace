'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Eye, Zap, RotateCcw } from 'lucide-react';

const STATES = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
const RING_RADIUS = 3.8;

interface ChestProps {
  index: number;
  label: string;
  isMarked: boolean;
  isOracleApplied: boolean;
  isMeasured: boolean;
  measuredIndex: number | null;
}

function Chest({ index, label, isMarked, isOracleApplied, isMeasured, measuredIndex }: ChestProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentRotX = useRef(0);
  const currentGlow = useRef(0);
  const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * RING_RADIUS;
  const z = Math.sin(angle) * RING_RADIUS;

  const targetRotX = isOracleApplied && isMarked ? Math.PI : 0;
  const targetGlow = isOracleApplied && isMarked ? 1 : 0;

  const isThisMeasured = isMeasured && measuredIndex === index;
  const baseColor = isMarked && isOracleApplied ? '#f59e0b' : '#06b6d4';
  const dimColor = '#64748b';
  const color = isMeasured ? (isThisMeasured ? '#22c55e' : dimColor) : baseColor;

  useFrame((_, delta) => {
    currentRotX.current = THREE.MathUtils.lerp(currentRotX.current, targetRotX, delta * 3);
    currentGlow.current = THREE.MathUtils.lerp(currentGlow.current, targetGlow, delta * 3);
    if (groupRef.current) {
      groupRef.current.rotation.x = currentRotX.current;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <group ref={groupRef}>
        {/* Chest body */}
        <mesh>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isOracleApplied && isMarked ? 0.6 : 0.15}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
        {/* Lid line */}
        <mesh position={[0, 0.29, 0]}>
          <boxGeometry args={[0.56, 0.04, 0.56]} />
          <meshStandardMaterial color={isOracleApplied && isMarked ? '#fbbf24' : '#0e7490'} />
        </mesh>
        {/* Label */}
        <Html
          position={[0, 0.65, 0]}
          center
          className="text-[9px] font-mono font-bold select-none pointer-events-none whitespace-nowrap px-1 py-0.5 rounded"
          style={{ color: isMeasured ? (isThisMeasured ? '#22c55e' : '#64748b') : (isOracleApplied && isMarked ? '#f59e0b' : '#06b6d4') }}
        >
          {label}
        </Html>
        {/* Phase badge */}
        {isOracleApplied && isMarked && (
          <Html
            position={[0, -0.75, 0]}
            center
            className="text-[8px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded shadow select-none pointer-events-none whitespace-nowrap"
          >
            phase: −1
          </Html>
        )}
        {isThisMeasured && (
          <Html
            position={[0, -0.75, 0]}
            center
            className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded shadow select-none pointer-events-none whitespace-nowrap"
          >
            CLICKED!
          </Html>
        )}
      </group>
    </group>
  );
}

function RingConnector() {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2 - Math.PI / 2;
    points.push(new THREE.Vector3(Math.cos(angle) * RING_RADIUS, 0, Math.sin(angle) * RING_RADIUS));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#334155" transparent opacity={0.3} />
    </line>
  );
}

interface QuantumChestRing3DProps {
  markedState?: string;
}

export function QuantumChestRing3D({ markedState = '101' }: QuantumChestRing3DProps) {
  const [isOracleApplied, setIsOracleApplied] = useState(false);
  const [isMeasured, setIsMeasured] = useState(false);
  const [measuredIndex, setMeasuredIndex] = useState<number | null>(null);
  const [measureCount, setMeasureCount] = useState(0);

  const markedIndex = STATES.findIndex((s) => s === `|${markedState}⟩`);

  const applyOracle = () => {
    setIsOracleApplied(true);
    setIsMeasured(false);
    setMeasuredIndex(null);
  };

  const measure = () => {
    // Uniform random — phase flip is invisible!
    const outcome = Math.floor(Math.random() * 8);
    setMeasuredIndex(outcome);
    setIsMeasured(true);
    setMeasureCount((c) => c + 1);
  };

  const reset = () => {
    setIsOracleApplied(false);
    setIsMeasured(false);
    setMeasuredIndex(null);
    setMeasureCount(0);
  };

  const statusMsg = () => {
    if (!isOracleApplied) return 'All 8 states are equal. Each chest has exactly 12.5% chance of being found.';
    if (!isMeasured) return `Oracle tagged |${markedState}⟩ with phase −1. Chest flipped upside-down. But can you spot it by measuring?`;
    return `You got |${STATES[measuredIndex!].slice(1, -1)}⟩ — still random! The phase flip is invisible until Diffusion amplifies it.`;
  };

  return (
    <div className="w-full rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-raised/40 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono font-semibold text-text-primary tracking-wider">8 MYSTERY CHESTS · 3D QUANTUM RING</p>
          <p className="text-[11px] font-mono text-text-muted mt-0.5">Marked state: <span className="text-accent font-bold">|{markedState}⟩</span> · Drag to rotate</p>
        </div>
        {measureCount > 0 && (
          <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
            {measureCount} measure{measureCount > 1 ? 's' : ''} · still random!
          </span>
        )}
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-[320px] bg-slate-950 relative cursor-move touch-none">
        <Canvas camera={{ position: [0, 5, 9], fov: 48 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, 3, -5]} intensity={0.5} color="#06b6d4" />

          <RingConnector />

          {STATES.map((label, i) => (
            <Chest
              key={label}
              index={i}
              label={label}
              isMarked={i === markedIndex}
              isOracleApplied={isOracleApplied}
              isMeasured={isMeasured}
              measuredIndex={measuredIndex}
            />
          ))}

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
        <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-400 bg-slate-900/70 px-2 py-0.5 rounded border border-slate-700">
          Drag to orbit
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex flex-col sm:flex-row items-center gap-3 border-t border-border-subtle bg-surface">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant={isOracleApplied ? 'outline' : 'default'}
            onClick={applyOracle}
            disabled={isOracleApplied}
            className="flex-1 sm:flex-none font-mono text-xs gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Apply Oracle
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={measure}
            disabled={!isOracleApplied}
            className="flex-1 sm:flex-none font-mono text-xs gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Measure Now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={reset}
            className="font-mono text-xs text-text-muted gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
        <p className="text-[11px] text-text-secondary font-sans leading-relaxed text-center sm:text-left flex-1">
          {statusMsg()}
        </p>
      </div>
    </div>
  );
}
