'use client';

import * as React from 'react';
import { RotateCcw, Play, Pause, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

export interface Bloch3DSphereProps {
  bloch: { x: number; y: number; z: number };
  purity: number;
  label: 'PURE_SUBSYSTEM' | 'MIXED_SUBSYSTEM';
  qubitIndex: number;
  rotation?: { rotX: number; rotY: number };
  onRotate?: (rot: { rotX: number; rotY: number }) => void;
  size?: number;
  interactive?: boolean;
}

export function Bloch3DSphere({
  bloch,
  purity,
  label,
  qubitIndex,
  rotation: externalRotation,
  onRotate,
  size = 280,
  interactive = true,
}: Bloch3DSphereProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Internal camera rotation state if not controlled externally
  const [internalRotation, setInternalRotation] = React.useState({ rotX: -0.35, rotY: 0.55 });
  const [zoom, setZoom] = React.useState(1.0);
  const [isAutoRotating, setIsAutoRotating] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const activeRotation = externalRotation || internalRotation;

  const setRotation = React.useCallback(
    (newRot: { rotX: number; rotY: number }) => {
      if (onRotate) {
        onRotate(newRot);
      } else {
        setInternalRotation(newRot);
      }
    },
    [onRotate]
  );

  const radius = Math.sqrt(bloch.x ** 2 + bloch.y ** 2 + bloch.z ** 2);
  const isMixed = purity < 0.999 || label === 'MIXED_SUBSYSTEM';
  const isAtOrigin = radius < 0.05;

  // Auto-rotation animation loop
  React.useEffect(() => {
    if (!isAutoRotating) return;
    let animationFrameId: number;

    const tick = () => {
      setRotation({
        rotX: activeRotation.rotX,
        rotY: activeRotation.rotY + 0.008,
      });
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoRotating, activeRotation, setRotation]);

  // Canvas render effect
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
    const sphereR = (width * 0.38) * zoom;

    // 3D projection math
    // World coordinates:
    // X_w = Y_quantum (East/West)
    // Y_w = Z_quantum (North/South: +1 is |0>, -1 is |1>)
    // Z_w = X_quantum (Depth: +1 is |+>, front)
    const project = (xw: number, yw: number, zw: number): { x: number; y: number; z: number } => {
      // 1. Rotate around Y_w by rotY (yaw)
      const cosY = Math.cos(activeRotation.rotY);
      const sinY = Math.sin(activeRotation.rotY);
      const x1 = xw * cosY + zw * sinY;
      const z1 = -xw * sinY + zw * cosY;
      const y1 = yw;

      // 2. Rotate around X_w by rotX (pitch)
      const cosX = Math.cos(activeRotation.rotX);
      const sinX = Math.sin(activeRotation.rotX);
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const x2 = x1;

      // Slight perspective projection
      const k = 1.0 / (1.0 - z2 * 0.15);
      return {
        x: cx + x2 * sphereR * k,
        y: cy - y2 * sphereR * k, // Canvas Y is inverted
        z: z2, // Depth: positive is in front, negative is behind
      };
    };

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // --- 1. Draw outer sphere backdrop & glow ---
    const sphereGrad = ctx.createRadialGradient(
      cx - sphereR * 0.25,
      cy - sphereR * 0.25,
      sphereR * 0.1,
      cx,
      cy,
      sphereR
    );
    sphereGrad.addColorStop(0, 'rgba(17, 24, 39, 0.7)');
    sphereGrad.addColorStop(0.7, 'rgba(10, 14, 26, 0.85)');
    sphereGrad.addColorStop(1, 'rgba(6, 7, 13, 0.95)');

    ctx.beginPath();
    ctx.arc(cx, cy, sphereR, 0, Math.PI * 2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // --- 2. Draw 3D Latitude and Longitude Wireframe Rings ---
    const drawRing = (points: { xw: number; yw: number; zw: number }[], strokeStyle: string, dash: number[] = []) => {
      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1;

      let first = true;
      for (const pt of points) {
        const p = project(pt.xw, pt.yw, pt.zw);
        if (first) {
          ctx.moveTo(p.x, p.y);
          first = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Equator (Y_w = 0, X-Z circle)
    const equatorPts: { xw: number; yw: number; zw: number }[] = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      equatorPts.push({ xw: Math.cos(theta), yw: 0, zw: Math.sin(theta) });
    }
    drawRing(equatorPts, 'rgba(56, 189, 248, 0.25)'); // Cyan equator

    // Latitudes (+45 deg and -45 deg)
    const lat45Y = Math.sin(Math.PI / 4);
    const lat45R = Math.cos(Math.PI / 4);
    const latNorthPts: { xw: number; yw: number; zw: number }[] = [];
    const latSouthPts: { xw: number; yw: number; zw: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      latNorthPts.push({ xw: Math.cos(theta) * lat45R, yw: lat45Y, zw: Math.sin(theta) * lat45R });
      latSouthPts.push({ xw: Math.cos(theta) * lat45R, yw: -lat45Y, zw: Math.sin(theta) * lat45R });
    }
    drawRing(latNorthPts, 'rgba(71, 85, 105, 0.25)', [3, 3]);
    drawRing(latSouthPts, 'rgba(71, 85, 105, 0.25)', [3, 3]);

    // Longitude Meridians (Prime meridian & orthogonal)
    const meridianXPts: { xw: number; yw: number; zw: number }[] = [];
    const meridianYPts: { xw: number; yw: number; zw: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      meridianXPts.push({ xw: 0, yw: Math.sin(theta), zw: Math.cos(theta) });
      meridianYPts.push({ xw: Math.cos(theta), yw: Math.sin(theta), zw: 0 });
    }
    drawRing(meridianXPts, 'rgba(71, 85, 105, 0.25)', [3, 3]);
    drawRing(meridianYPts, 'rgba(71, 85, 105, 0.25)', [3, 3]);

    // --- 3. Draw 3D Axes ---
    // Z axis (Vertical: -Z to +Z)
    const zPos = project(0, 1.2, 0);
    const zNeg = project(0, -1.2, 0);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(zNeg.x, zNeg.y);
    ctx.lineTo(zPos.x, zPos.y);
    ctx.stroke();

    // X axis (Depth/Forward: -X to +X)
    const xPos = project(0, 0, 1.2);
    const xNeg = project(0, 0, -1.2);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.moveTo(xNeg.x, xNeg.y);
    ctx.lineTo(xPos.x, xPos.y);
    ctx.stroke();

    // Y axis (Lateral/Right: -Y to +Y)
    const yPos = project(1.2, 0, 0);
    const yNeg = project(-1.2, 0, 0);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.moveTo(yNeg.x, yNeg.y);
    ctx.lineTo(yPos.x, yPos.y);
    ctx.stroke();

    // Pole labels with 3D offset
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // +Z = |0> (North Pole)
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('|0⟩ (+Z)', zPos.x, zPos.y - 10);

    // -Z = |1> (South Pole)
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('|1⟩ (-Z)', zNeg.x, zNeg.y + 10);

    // +X = |+> (Front)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.fillText('|+⟩ (+X)', xPos.x + 8, xPos.y + 6);

    // +Y = |+i> (Right)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('|+i⟩ (+Y)', yPos.x + 10, yPos.y - 6);

    // --- 4. Render State Vector OR Entangled Mixed Core ---
    const origin = project(0, 0, 0);

    if (isAtOrigin) {
      // --- Special Case: Bell State Maximally Mixed Subsystem at Origin (r = 0) ---
      // 1. Concentric pulsing mixed state halo
      const coreGrad = ctx.createRadialGradient(origin.x, origin.y, 2, origin.x, origin.y, 24);
      coreGrad.addColorStop(0, 'rgba(192, 132, 252, 1)'); // Bright violet center
      coreGrad.addColorStop(0.35, 'rgba(167, 139, 250, 0.7)');
      coreGrad.addColorStop(0.7, 'rgba(139, 92, 246, 0.25)');
      coreGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 24, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // 2. Central singularity node
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#a78bfa';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Label highlighting maximally mixed origin
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillStyle = '#e9d5ff';
      ctx.fillText('r = 0.000', origin.x, origin.y + 16);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('(MIXED CORE)', origin.x, origin.y + 26);
    } else {
      // --- Pure or Partially Mixed State Vector ---
      // Map quantum (bloch.x, bloch.y, bloch.z) to world (xw, yw, zw)
      // xw = bloch.y, yw = bloch.z, zw = bloch.x
      const target = project(bloch.y, bloch.z, bloch.x);

      // If partially mixed (0 < r < 1), draw dashed inner radius boundary shell
      if (isMixed && radius > 0.05) {
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, sphereR * radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Projection drop lines onto equator (X-Z in world, Y_w=0)
      const equatorProj = project(bloch.y, 0, bloch.x);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.setLineDash([2, 2]);
      ctx.moveTo(target.x, target.y);
      ctx.lineTo(equatorProj.x, equatorProj.y);
      ctx.lineTo(origin.x, origin.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vector arrow line
      const vectorColor = isMixed ? '#c084fc' : '#22d3ee'; // Violet if mixed, cyan if pure
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = vectorColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = vectorColor;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Vector head endpoint node
      ctx.beginPath();
      ctx.arc(target.x, target.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = vectorColor;
      ctx.shadowColor = vectorColor;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Origin anchor
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
    }
  }, [bloch, purity, label, activeRotation, zoom, size, isAtOrigin, isMixed, radius]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setIsAutoRotating(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: activeRotation.rotX,
      rotY: activeRotation.rotY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Pitch (rotX) clamped between -1.4 and 1.4 radians to avoid gimbal inversion
    const newRotX = Math.max(-1.4, Math.min(1.4, dragStartRef.current.rotX + dy * 0.01));
    const newRotY = dragStartRef.current.rotY + dx * 0.01;

    setRotation({ rotX: newRotX, rotY: newRotY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    setZoom((prev) => Math.max(0.7, Math.min(1.4, prev - e.deltaY * 0.001)));
  };

  const resetCamera = () => {
    setRotation({ rotX: -0.35, rotY: 0.55 });
    setZoom(1.0);
  };

  return (
    <div className="relative flex flex-col items-center select-none" data-testid={`bloch-3d-container-${qubitIndex}`}>
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
          onWheel={handleWheel}
          className={`rounded-lg cursor-grab active:cursor-grabbing touch-none transition-shadow ${
            isMixed ? 'border border-violet/30' : 'border border-line'
          }`}
          aria-label={`3D Bloch sphere for qubit ${qubitIndex}`}
          role="img"
        />

        {/* 3D Floating Control Pills */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-abyss/85 border border-line rounded-md p-1 shadow-md opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            title="Reset 3D Orientation"
            onClick={resetCamera}
            className="p-1 text-ink-dim hover:text-accent rounded hover:bg-raised transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title={isAutoRotating ? 'Pause Auto-Rotation' : 'Start Auto-Rotation'}
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="p-1 text-ink-dim hover:text-accent rounded hover:bg-raised transition-colors"
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-accent" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            title="Zoom In"
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-1 text-ink-dim hover:text-accent rounded hover:bg-raised transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Zoom Out"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1 text-ink-dim hover:text-accent rounded hover:bg-raised transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <span className="text-[9px] font-mono text-ink-faint bg-abyss/80 px-1.5 py-0.5 rounded border border-line/60 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-accent" />
            <span>Drag to rotate 3D</span>
          </span>
        </div>
      </div>
    </div>
  );
}
