'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { ComplexValue } from '@/lib/contracts';
import { RotateCcw, Sparkles } from 'lucide-react';

interface TwoQubitQSphereProps {
  amplitudes?: Record<string, ComplexValue>;
  basisProbabilities?: Record<string, number>;
  size?: number;
}

export function TwoQubitQSphere({
  amplitudes,
  basisProbabilities,
  size = 280,
}: TwoQubitQSphereProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const [rotation, setRotation] = React.useState({ rotX: -0.35, rotY: 0.55 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  // Default to Bell state amplitudes if not provided
  const amps = amplitudes || {
    '00': { re: 0.70710678, im: 0 },
    '01': { re: 0, im: 0 },
    '10': { re: 0, im: 0 },
    '11': { re: 0.70710678, im: 0 },
  };

  const basisStates = [
    { label: '|00⟩', key: '00', weight: 0, theta: 0, phi: 0 },
    { label: '|01⟩', key: '01', weight: 1, theta: Math.PI / 2, phi: 0 },
    { label: '|10⟩', key: '10', weight: 1, theta: Math.PI / 2, phi: Math.PI },
    { label: '|11⟩', key: '11', weight: 2, theta: Math.PI, phi: 0 },
  ];

  // Render Q-Sphere on Canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (typeof window !== 'undefined' && window.navigator?.userAgent?.includes('jsdom')) {
      return;
    }

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      // jsdom environment without canvas support
      return;
    }
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const width = size;
    const height = size;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    const cx = width / 2;
    const cy = height / 2;
    const sphereR = width * 0.38;

    const project = (xw: number, yw: number, zw: number) => {
      const cosY = Math.cos(rotation.rotY);
      const sinY = Math.sin(rotation.rotY);
      const x1 = xw * cosY + zw * sinY;
      const z1 = -xw * sinY + zw * cosY;
      const y1 = yw;

      const cosX = Math.cos(rotation.rotX);
      const sinX = Math.sin(rotation.rotX);
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const x2 = x1;

      const k = 1.0 / (1.0 - z2 * 0.15);
      return {
        x: cx + x2 * sphereR * k,
        y: cy - y2 * sphereR * k,
        z: z2,
      };
    };

    ctx.clearRect(0, 0, width, height);

    // 1. Sphere backdrop
    const grad = ctx.createRadialGradient(
      cx - sphereR * 0.25,
      cy - sphereR * 0.25,
      sphereR * 0.1,
      cx,
      cy,
      sphereR
    );
    if (isLight) {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.6, 'rgba(241, 245, 249, 0.95)');
      grad.addColorStop(1, 'rgba(226, 232, 240, 0.98)');
    } else {
      grad.addColorStop(0, 'rgba(17, 24, 39, 0.7)');
      grad.addColorStop(1, 'rgba(6, 7, 13, 0.95)');
    }

    ctx.beginPath();
    ctx.arc(cx, cy, sphereR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.18)' : '#1e293b';
    ctx.stroke();

    // 2. Wireframe circles
    // Equator (Hamming weight = 1)
    ctx.beginPath();
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const p = project(Math.cos(angle), 0, Math.sin(angle));
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.45)' : 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vertical meridian
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const p = project(0, Math.sin(angle), Math.cos(angle));
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = isLight ? 'rgba(100, 116, 139, 0.35)' : 'rgba(71, 85, 105, 0.2)';
    ctx.stroke();

    // 3. Central axis
    const zPos = project(0, 1.15, 0);
    const zNeg = project(0, -1.15, 0);
    ctx.beginPath();
    ctx.moveTo(zNeg.x, zNeg.y);
    ctx.lineTo(zPos.x, zPos.y);
    ctx.strokeStyle = isLight ? 'rgba(71, 85, 105, 0.6)' : 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. Basis State Nodes (Hamming coordinates)
    basisStates.forEach((state) => {
      const c = amps[state.key] || { re: 0, im: 0 };
      const prob = basisProbabilities?.[state.key] ?? (c.re ** 2 + c.im ** 2);
      const phase = Math.atan2(c.im, c.re); // [-pi, pi]

      // Spherical to Cartesian:
      // Y_w = cos(theta) (Vertical North/South)
      // X_w = sin(theta) * sin(phi)
      // Z_w = sin(theta) * cos(phi)
      const xw = Math.sin(state.theta) * Math.sin(state.phi);
      const yw = Math.cos(state.theta);
      const zw = Math.sin(state.theta) * Math.cos(state.phi);

      const p = project(xw, yw, zw);
      const hasSupport = prob > 0.01;

      // Draw node connector to center
      ctx.beginPath();
      const origin = project(0, 0, 0);
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = hasSupport
        ? (isLight ? 'rgba(2, 132, 199, 0.6)' : 'rgba(56, 189, 248, 0.5)')
        : (isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(71, 85, 105, 0.15)');
      ctx.lineWidth = hasSupport ? 2 : 1;
      ctx.stroke();

      // Node size proportional to probability
      const nodeRadius = hasSupport ? 5 + Math.sqrt(prob) * 14 : 3;

      // Node color mapped from phase
      const hue = ((phase + Math.PI) / (Math.PI * 2)) * 360;
      const nodeColor = hasSupport
        ? `hsl(${hue}, 85%, ${isLight ? '45%' : '60%'})`
        : (isLight ? '#94a3b8' : '#334155');

      ctx.beginPath();
      ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      if (hasSupport && !isLight) {
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hasSupport ? '#ffffff' : (isLight ? '#cbd5e1' : '#1e293b');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label text
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = hasSupport ? (isLight ? '#0f172a' : '#f8fafc') : (isLight ? '#475569' : '#64748b');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const offset = nodeRadius + 12;
      const labelY = yw >= 0 ? p.y - offset : p.y + offset;
      ctx.fillText(state.label, p.x, labelY);

      if (hasSupport) {
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
        ctx.fillText(`P=${(prob * 100).toFixed(0)}%`, p.x, labelY + (yw >= 0 ? -10 : 10));
      }
    });
  }, [amps, basisProbabilities, rotation, size, isLight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotation.rotX,
      rotY: rotation.rotY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setRotation({
      rotX: Math.max(-1.4, Math.min(1.4, dragStartRef.current.rotX + dy * 0.01)),
      rotY: dragStartRef.current.rotY + dx * 0.01,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col items-center select-none" data-testid="qsphere-container">
      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ width: `${size}px`, height: `${size}px` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="rounded-lg cursor-grab active:cursor-grabbing border border-line bg-abyss"
          role="img"
          aria-label="Two-Qubit Q-Sphere Statevector Representation"
        />

        <button
          type="button"
          onClick={() => setRotation({ rotX: -0.35, rotY: 0.55 })}
          title="Reset Q-Sphere Orientation"
          className="absolute top-2 right-2 p-1 text-ink-dim hover:text-accent rounded bg-abyss/80 border border-line"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="absolute bottom-2 left-2 pointer-events-none">
          <span className="text-[9px] font-mono text-ink-faint bg-abyss/80 px-1.5 py-0.5 rounded border border-line/60 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-accent" />
            <span>2-Qubit Q-Sphere · Drag to rotate</span>
          </span>
        </div>
      </div>
    </div>
  );
}
