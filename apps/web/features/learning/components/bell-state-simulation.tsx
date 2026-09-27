'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Play, Link as LinkIcon, Eye, RotateCcw } from 'lucide-react';

// Reusable Bloch Sphere Visuals
function BlochSphereVisuals({ position, label }: { position: [number, number, number], label: string }) {
  const radius = 2;
  return (
    <group position={position}>
      {/* Main Sphere (Wireframe) */}
      <mesh>
        <sphereGeometry args={[radius, 32, 16]} />
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.15} />
      </mesh>
      
      {/* Equator Circle */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[radius, 0.01, 16, 64]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.4} />
      </mesh>

      {/* Axes */}
      <Line points={[[0, -radius-0.5, 0], [0, radius+0.5, 0]]} color="#94a3b8" lineWidth={1} dashed opacity={0.3} transparent />
      <Line points={[[-radius-0.5, 0, 0], [radius+0.5, 0, 0]]} color="#94a3b8" lineWidth={1} dashed opacity={0.3} transparent />
      <Line points={[[0, 0, -radius-0.5], [0, 0, radius+0.5]]} color="#94a3b8" lineWidth={1} dashed opacity={0.3} transparent />

      {/* Label */}
      <Html position={[0, radius+0.8, 0]} center className="text-[10px] font-mono font-bold text-ink-dim uppercase tracking-widest select-none pointer-events-none whitespace-nowrap">
        {label}
      </Html>
    </group>
  );
}

// Animated Vector Component
function StateVector({ 
  position, 
  targetTheta, 
  targetPhi, 
  targetLength, 
  color = "#f43f5e" 
}: { 
  position: [number, number, number], 
  targetTheta: number, 
  targetPhi: number, 
  targetLength: number,
  color?: string
}) {
  const arrowRef = useRef<THREE.Group>(null);
  
  // Local state for smooth animation
  const currentTheta = useRef(targetTheta);
  const currentPhi = useRef(targetPhi);
  const currentLength = useRef(targetLength);

  useFrame((state, delta) => {
    // Lerp values
    currentTheta.current = THREE.MathUtils.lerp(currentTheta.current, targetTheta, delta * 4);
    currentPhi.current = THREE.MathUtils.lerp(currentPhi.current, targetPhi, delta * 4);
    currentLength.current = THREE.MathUtils.lerp(currentLength.current, targetLength, delta * 4);
    
    if (arrowRef.current && currentLength.current > 0.01) {
      arrowRef.current.visible = true;
      const radius = currentLength.current;
      
      const x = radius * Math.sin(currentTheta.current) * Math.cos(currentPhi.current);
      const y = radius * Math.cos(currentTheta.current);
      const z = radius * Math.sin(currentTheta.current) * Math.sin(currentPhi.current);
      
      const dir = new THREE.Vector3(x, y, z).normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      
      arrowRef.current.quaternion.copy(quaternion);
      
      // Scale group to match length (base length is 1)
      arrowRef.current.scale.set(1, radius, 1);
    } else if (arrowRef.current) {
      arrowRef.current.visible = false;
    }
  });

  return (
    <group position={position} ref={arrowRef}>
      {/* Arrow cylinder (height 1, center at 0.5) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Arrow cone (head) at top of cylinder */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.1, 0.2, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

// Entanglement Link between spheres
function EntanglementLink({ isEntangled }: { isEntangled: boolean }) {
  const lineRef = useRef<any>(null);
  const currentOpacity = useRef(0);

  useFrame((state, delta) => {
    const targetOpacity = isEntangled ? 1 : 0;
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, delta * 3);
    
    if (lineRef.current) {
      lineRef.current.material.opacity = currentOpacity.current;
      lineRef.current.material.transparent = true;
    }
  });

  return (
    <group>
      <Line 
        ref={lineRef}
        points={[[-2.5, 0, 0], [2.5, 0, 0]]} 
        color="#8b5cf6" // Violet
        lineWidth={3} 
      />
      {isEntangled && (
        <Html position={[0, 0, 0]} center className="text-[10px] font-mono font-bold text-violet bg-violet/10 border border-violet/30 px-2 py-0.5 rounded shadow-glow select-none pointer-events-none whitespace-nowrap">
          ENTANGLED
        </Html>
      )}
    </group>
  );
}

export function BellStateSimulation() {
  const [step, setStep] = useState(0); // 0: |00>, 1: H(q0), 2: CNOT, 3: Measured
  const [result, setResult] = useState<'00' | '11' | null>(null);

  const applyH = () => setStep(1);
  const applyCNOT = () => setStep(2);
  const measure = () => {
    const outcome = Math.random() > 0.5 ? '00' : '11';
    setResult(outcome);
    setStep(3);
  };
  const reset = () => {
    setStep(0);
    setResult(null);
  };

  // State mappings based on step
  let q0Theta = 0;
  let q0Length = 2;
  let q1Theta = 0;
  let q1Length = 2;

  if (step === 1) {
    q0Theta = Math.PI / 2; // |+>
  } else if (step === 2) {
    q0Length = 0; // Contracts to center (maximally mixed)
    q1Length = 0; // Contracts to center
  } else if (step === 3 && result) {
    q0Theta = result === '00' ? 0 : Math.PI;
    q1Theta = result === '00' ? 0 : Math.PI;
  }

  return (
    <div className="w-full bg-panel rounded-xl border border-line overflow-hidden flex flex-col shadow-sm">
      
      {/* 3D Canvas Area */}
      <div className="w-full h-[350px] relative cursor-move touch-none bg-abyss border-b border-line">
        <Canvas camera={{ position: [0, 2, 7], fov: 50 }}>
          <ambientLight intensity={0.5} />
          
          {/* Qubit 0 (Left) */}
          <BlochSphereVisuals position={[-2.5, 0, 0]} label="Qubit 0" />
          <StateVector position={[-2.5, 0, 0]} targetTheta={q0Theta} targetPhi={0} targetLength={q0Length} color="#0284c7" />
          
          {/* Qubit 1 (Right) */}
          <BlochSphereVisuals position={[2.5, 0, 0]} label="Qubit 1" />
          <StateVector position={[2.5, 0, 0]} targetTheta={q1Theta} targetPhi={0} targetLength={q1Length} color="#059669" />

          {/* Connection */}
          <EntanglementLink isEntangled={step === 2} />

          <OrbitControls 
            enablePan={false} 
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3/4}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
          />
        </Canvas>

        {/* HUD Info */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-ink-faint bg-background/60 px-2 py-1 rounded border border-line/50">
          Drag to orbit
        </div>
        
        {step === 2 && (
          <div className="absolute top-3 right-3 text-[10px] font-mono text-violet bg-violet/10 px-2 py-1 rounded border border-violet/30 max-w-[180px] text-right">
            Purity loss: Vectors contracted to origin. State cannot be factored!
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant={step === 0 ? "default" : "outline"} 
            size="sm" 
            onClick={applyH}
            disabled={step > 0}
            className="flex-1 md:flex-none font-mono text-xs gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            1. H(q0)
          </Button>
          
          <Button 
            variant={step === 1 ? "default" : "outline"} 
            size="sm" 
            onClick={applyCNOT}
            disabled={step !== 1}
            className="flex-1 md:flex-none font-mono text-xs gap-1.5"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            2. CNOT
          </Button>

          <Button 
            variant={step === 2 ? "default" : "outline"} 
            size="sm" 
            onClick={measure}
            disabled={step !== 2}
            className="flex-1 md:flex-none font-mono text-xs gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            3. Measure
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={reset}
          className="font-mono text-xs text-ink-dim hover:text-ink-main gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>

      {/* Explainer Banner */}
      <div className="bg-background/40 p-3 text-[11px] text-ink-dim text-center border-t border-line">
        {step === 0 && "Start by applying a Hadamard gate to put Qubit 0 into a superposition (moves to equator)."}
        {step === 1 && "Q0 is now in superposition. Apply CNOT to entangle Q0 and Q1."}
        {step === 2 && "Notice how both state vectors vanish into the center! An entangled pair cannot be drawn as two independent spheres."}
        {step === 3 && (
          <span className="text-evidence font-medium">
            Collapsed! Both qubits instantaneously jumped to |{result?.[0]}⟩. They are perfectly correlated.
          </span>
        )}
      </div>
      
    </div>
  );
}
