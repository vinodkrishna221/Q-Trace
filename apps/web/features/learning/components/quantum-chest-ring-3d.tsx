'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Eye, Zap, RotateCcw, Sparkles } from 'lucide-react';

const STATES = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
const RING_RADIUS = 3.4;

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
  const meshRef = useRef<THREE.Mesh>(null);
  const currentRotX = useRef(0);
  const currentGlow = useRef(0);
  const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * RING_RADIUS;
  const z = Math.sin(angle) * RING_RADIUS;

  const targetRotX = isOracleApplied && isMarked ? Math.PI : 0;
  const targetGlow = isOracleApplied && isMarked ? 1.2 : 0.35;

  const isThisMeasured = isMeasured && measuredIndex === index;
  const baseColor = isMarked && isOracleApplied ? '#fbbf24' : '#38bdf8';
  const dimColor = '#475569';
  const color = isMeasured ? (isThisMeasured ? '#22c55e' : dimColor) : baseColor;

  useFrame((state, delta) => {
    currentRotX.current = THREE.MathUtils.lerp(currentRotX.current, targetRotX, delta * 4);
    currentGlow.current = THREE.MathUtils.lerp(currentGlow.current, targetGlow, delta * 3);

    if (groupRef.current) {
      groupRef.current.rotation.x = currentRotX.current;
      // Gentle zero-g quantum levitation
      const hoverOffset = Math.sin(state.clock.elapsedTime * 2 + index * 0.78) * 0.08;
      groupRef.current.position.y = hoverOffset;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Light ray connecting center singularity to each state */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-x, 0, -z),
          new THREE.Vector3(0, 0, 0)
        ])} />
        <lineBasicMaterial
          attach="material"
          color={isMarked && isOracleApplied ? '#f59e0b' : '#0284c7'}
          transparent
          opacity={isMarked && isOracleApplied ? 0.6 : 0.22}
          linewidth={1}
        />
      </line>

      <group ref={groupRef}>
        {/* Local glow point light for the marked state */}
        {isMarked && isOracleApplied && (
          <pointLight color="#f59e0b" intensity={2.8} distance={3.5} />
        )}

        {/* Outer specular aura */}
        <mesh>
          <boxGeometry args={[0.72, 0.72, 0.72]} />
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={isMarked && isOracleApplied ? 0.45 : 0.18}
          />
        </mesh>

        {/* Main Chest body with metallic specular reflection */}
        <mesh ref={meshRef}>
          <boxGeometry args={[0.62, 0.62, 0.62]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isOracleApplied && isMarked ? 0.85 : 0.28}
            roughness={0.2}
            metalness={0.65}
          />
        </mesh>

        {/* Golden quantum latch / lid rim */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.64, 0.05, 0.64]} />
          <meshStandardMaterial
            color={isOracleApplied && isMarked ? '#fef08a' : '#e0f2fe'}
            emissive={isOracleApplied && isMarked ? '#f59e0b' : '#38bdf8'}
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* State Label: high contrast readable pill */}
        <Html
          position={[0, 0.78, 0]}
          center
          className="select-none pointer-events-none whitespace-nowrap"
        >
          <div
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-md transition-all ${
              isThisMeasured
                ? 'bg-emerald-950 text-emerald-300 border-emerald-400'
                : isOracleApplied && isMarked
                ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/90 text-sky-200 border-sky-500/40'
            }`}
          >
            {label}
          </div>
        </Html>

        {/* Phase tag badge */}
        {isOracleApplied && isMarked && (
          <Html
            position={[0, -0.85, 0]}
            center
            className="select-none pointer-events-none whitespace-nowrap"
          >
            <div className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/90 border border-amber-400 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse">
              phase: −1 (180° flip)
            </div>
          </Html>
        )}

        {isThisMeasured && (
          <Html
            position={[0, -0.85, 0]}
            center
            className="select-none pointer-events-none whitespace-nowrap"
          >
            <div className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-400 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-bounce">
              MEASURED! (12.5%)
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// Glowing Ring Platform with concentric quantum coordinate rings
function QuantumStageRings() {
  return (
    <group>
      {/* Primary Glowing Orbit Rail */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RING_RADIUS - 0.02, RING_RADIUS + 0.02, 80]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Ground Ring */}
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RING_RADIUS + 0.58, RING_RADIUS + 0.62, 80]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Stage Floor Disc with soft radial glow */}
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RING_RADIUS + 1.2, 48]} />
        <meshStandardMaterial
          color="#030712"
          emissive="#0284c7"
          emissiveIntensity={0.08}
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

// Center Singularity (Pulsing Superposition Energy Node)
function CenterSingularity({ isOracleApplied }: { isOracleApplied: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && auraRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
      auraRef.current.scale.set(scale * 1.35, scale * 1.35, scale * 1.35);
      meshRef.current.rotation.y += 0.015;
      meshRef.current.rotation.x += 0.008;
    }
  });

  const coreColor = isOracleApplied ? '#f59e0b' : '#38bdf8';

  return (
    <group position={[0, 0, 0]}>
      {/* Core point light illuminating all 8 chests from the center */}
      <pointLight
        color={coreColor}
        intensity={isOracleApplied ? 3.8 : 2.6}
        distance={9}
        decay={2}
      />

      {/* Outer aura pulse */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshBasicMaterial
          color={coreColor}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Center octahedron core */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={coreColor}
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
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
    if (!isOracleApplied) return 'All 8 chests glow in equal superposition. Each has exactly 12.5% chance of being found.';
    if (!isMeasured) return `Oracle applied phase flip −1 to |${markedState}⟩ (turned upside down with golden aura). But notice: can you detect it by measuring?`;
    return `Measured |${STATES[measuredIndex!].slice(1, -1)}⟩! Probability is still uniform (12.5%). The phase mark is invisible until Diffusion!`;
  };

  return (
    <div className="w-full rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-raised/40 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <div>
            <p className="text-xs font-mono font-semibold text-text-primary tracking-wider">8 MYSTERY CHESTS · 3D QUANTUM CHAMBER</p>
            <p className="text-[11px] font-mono text-text-muted mt-0.5">Marked state: <span className="text-accent font-bold">|{markedState}⟩</span> · Drag to orbit · Scroll to zoom</p>
          </div>
        </div>
        {measureCount > 0 && (
          <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded font-semibold shadow-2xs">
            {measureCount} measurement{measureCount > 1 ? 's' : ''} · 12.5% flat distribution
          </span>
        )}
      </div>

      {/* 3D Canvas with enhanced lighting & atmosphere */}
      <div className="w-full h-[360px] bg-gradient-to-b from-slate-950 via-[#070d19] to-slate-950 relative cursor-move touch-none overflow-hidden">
        <Canvas camera={{ position: [0, 4.2, 7.2], fov: 46 }}>
          {/* 1. Ambient Fill Light: soft cool tint */}
          <ambientLight intensity={0.7} color="#cbd5e1" />

          {/* 2. Key Studio Directional Light from top-front */}
          <directionalLight
            position={[6, 9, 7]}
            intensity={2.4}
            color="#ffffff"
          />

          {/* 3. Deep Rim Light from behind for specular edge definition */}
          <directionalLight
            position={[-6, 5, -6]}
            intensity={1.8}
            color="#a855f7"
          />

          {/* 4. Soft Top Spotlight focused on the quantum stage */}
          <spotLight
            position={[0, 8, 0]}
            angle={0.65}
            penumbra={0.8}
            intensity={2.0}
            color="#38bdf8"
          />

          {/* Stage floor & rail lines */}
          <QuantumStageRings />

          {/* Center singularity radiating core light */}
          <CenterSingularity isOracleApplied={isOracleApplied} />

          {/* 8 Quantum Chests */}
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
            enableZoom={true}
            minDistance={4.5}
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.15}
          />
        </Canvas>

        {/* HUD Navigation Hints */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700/80 shadow-md backdrop-blur-xs select-none pointer-events-none">
          Drag to orbit · Scroll to zoom
        </div>

        {isOracleApplied && (
          <div className="absolute top-3 right-3 text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-500/60 shadow-md backdrop-blur-xs select-none pointer-events-none">
            Oracle Active: Phase Flip (−1) Applied
          </div>
        )}
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
