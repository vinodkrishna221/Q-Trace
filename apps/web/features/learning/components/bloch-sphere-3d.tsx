'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, RotateCcw } from 'lucide-react';

// Math helpers
const stateToAngles = (stateName: string) => {
  switch (stateName) {
    case '0': return { theta: 0, phi: 0 };
    case '1': return { theta: Math.PI, phi: 0 };
    case '+': return { theta: Math.PI / 2, phi: 0 };
    case '-': return { theta: Math.PI / 2, phi: Math.PI };
    default: return { theta: 0, phi: 0 };
  }
};

const applyHadamard = (stateName: string) => {
  switch (stateName) {
    case '0': return '+';
    case '1': return '-';
    case '+': return '0';
    case '-': return '1';
    default: return '+';
  }
};

// Animated Vector Component
function StateVector({ targetTheta, targetPhi, radius = 1.8 }: { targetTheta: number, targetPhi: number, radius?: number }) {
  const arrowRef = useRef<THREE.Group>(null);
  
  // Use local state for current angles to animate
  const currentTheta = useRef(targetTheta);
  const currentPhi = useRef(targetPhi);

  useFrame((state, delta) => {
    // Lerp angles for smooth animation
    currentTheta.current = THREE.MathUtils.lerp(currentTheta.current, targetTheta, delta * 3);
    currentPhi.current = THREE.MathUtils.lerp(currentPhi.current, targetPhi, delta * 3);
    
    if (arrowRef.current) {
      // Convert spherical to cartesian
      const x = radius * Math.sin(currentTheta.current) * Math.cos(currentPhi.current);
      const y = radius * Math.cos(currentTheta.current); // Z-axis in Bloch is Y-axis in ThreeJS
      const z = radius * Math.sin(currentTheta.current) * Math.sin(currentPhi.current);
      
      const dir = new THREE.Vector3(x, y, z).normalize();
      
      // Update arrow rotation to point in direction
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      arrowRef.current.quaternion.copy(quaternion);
    }
  });

  return (
    <group ref={arrowRef}>
      {/* Arrow cylinder */}
      <mesh position={[0, radius / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, radius, 8]} />
        <meshBasicMaterial color="#f43f5e" /> {/* Rose color for state vector */}
      </mesh>
      {/* Arrow cone (head) */}
      <mesh position={[0, radius, 0]}>
        <coneGeometry args={[0.08, 0.2, 16]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>
    </group>
  );
}

// Bloch Sphere Visuals
function BlochSphereVisuals() {
  const radius = 2;
  return (
    <group>
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
      {/* Z-Axis (Up/Down in Three.js) -> |0> and |1> */}
      <Line points={[[0, -radius-0.5, 0], [0, radius+0.5, 0]]} color="#94a3b8" lineWidth={1} dashed />
      <Html position={[0, radius+0.6, 0]} center className="text-xs font-mono font-bold text-ink-main select-none pointer-events-none">|0⟩</Html>
      <Html position={[0, -radius-0.6, 0]} center className="text-xs font-mono font-bold text-ink-main select-none pointer-events-none">|1⟩</Html>

      {/* X-Axis (Right/Left) -> |+> and |-> */}
      <Line points={[[-radius-0.5, 0, 0], [radius+0.5, 0, 0]]} color="#94a3b8" lineWidth={1} dashed />
      <Html position={[radius+0.6, 0, 0]} center className="text-xs font-mono font-bold text-accent select-none pointer-events-none">|+⟩</Html>
      <Html position={[-radius-0.6, 0, 0]} center className="text-xs font-mono font-bold text-ink-dim select-none pointer-events-none">|-⟩</Html>

      {/* Y-Axis (Forward/Backward) */}
      <Line points={[[0, 0, -radius-0.5], [0, 0, radius+0.5]]} color="#94a3b8" lineWidth={1} dashed />
    </group>
  );
}

export interface BlochSphere3DProps {
  initialState?: '0' | '1';
  interactable?: boolean;
}

export function BlochSphere3D({ initialState = '0', interactable = true }: BlochSphere3DProps) {
  const [qState, setQState] = useState<string>(initialState);

  // Compute probabilities based on state for UI
  const p0 = (qState === '0') ? 100 : (qState === '1') ? 0 : 50;
  const p1 = (qState === '1') ? 100 : (qState === '0') ? 0 : 50;

  const handleApplyH = () => {
    if (!interactable) return;
    setQState(applyHadamard(qState));
  };

  const handleReset = () => {
    if (!interactable) return;
    setQState(initialState);
  };

  const angles = stateToAngles(qState);

  return (
    <div className="w-full h-[400px] bg-panel rounded-xl border border-line relative overflow-hidden flex flex-col md:flex-row">
      {/* 3D Canvas Area */}
      <div className="flex-1 h-full relative cursor-move touch-none">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <BlochSphereVisuals />
          <StateVector targetTheta={angles.theta} targetPhi={angles.phi} radius={2} />
          <OrbitControls 
            enablePan={false} 
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3/4}
          />
        </Canvas>
        <div className="absolute bottom-3 left-3 text-[10px] text-ink-faint font-mono bg-background/50 px-2 py-1 rounded">
          Drag to rotate 3D view
        </div>
      </div>

      {/* Interactive Controls UI */}
      {interactable && (
        <div className="w-full md:w-[220px] bg-background/80 backdrop-blur-sm border-l border-line p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-ink-main uppercase tracking-widest mb-3">Live State</h4>
              <div className="bg-abyss rounded border border-line p-3 text-center mb-4 shadow-inner">
                <span className="text-2xl font-mono text-accent">|{qState}⟩</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs flex justify-between font-mono">
                  <span className="text-ink-dim">P(|0⟩)</span>
                  <span className="text-ink-main">{p0}%</span>
                </div>
                <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                  <div className="bg-accent h-full transition-all duration-500 ease-out" style={{ width: `${p0}%` }} />
                </div>
                
                <div className="text-xs flex justify-between font-mono mt-2">
                  <span className="text-ink-dim">P(|1⟩)</span>
                  <span className="text-ink-main">{p1}%</span>
                </div>
                <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                  <div className="bg-ink-dim h-full transition-all duration-500 ease-out" style={{ width: `${p1}%` }} />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-line space-y-2">
              <Button 
                onClick={handleApplyH} 
                className="w-full gap-2 font-mono"
                size="sm"
                data-testid="btn-apply-h"
              >
                <Play className="w-4 h-4" />
                Apply H Gate
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline"
                className="w-full gap-2 font-mono text-ink-dim"
                size="sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to |{initialState}⟩
              </Button>
            </div>
          </div>
          
          <div className="text-[10px] text-ink-faint leading-tight mt-4">
            Notice how applying H moves the vector between the Z-axis (definite) and X-axis (superposition).
          </div>
        </div>
      )}
    </div>
  );
}
