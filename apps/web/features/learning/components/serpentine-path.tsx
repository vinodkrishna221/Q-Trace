"use client";

import React, { useMemo } from "react";

/**
 * Breakpoint amplitude specification per docs/LEARN-DUOLINGO-PATH-UI-SPEC.md Section 9:
 * - Mobile Portrait (< 640px): ±42px
 * - Mobile Landscape / Small Tablet (640px – 768px): ±68px
 * - Tablet / Small Laptop (769px – 1023px): ±96px
 * - Desktop High-Res (≥ 1024px): ±120px
 */
export const SERPENTINE_BREAKPOINTS = {
  MOBILE_MAX: 639,
  LANDSCAPE_MAX: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
} as const;

export const SERPENTINE_AMPLITUDES = {
  MOBILE: 42,
  LANDSCAPE: 68,
  TABLET: 96,
  DESKTOP: 120,
} as const;

export type NodeStageStatus = "locked" | "active" | "completed" | "diverged";

export interface PathNodePoint {
  id: string;
  x?: number;
  y?: number;
  status?: NodeStageStatus | string;
  title?: string;
  [key: string]: unknown;
}

export interface CalculatedNodePosition {
  id: string;
  index: number;
  x: number;
  y: number;
  status: NodeStageStatus;
  xOffset: number;
}

export interface PathSegment {
  index: number;
  fromId: string;
  toId: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  rail1Path: string;
  rail2Path: string;
  centerPath: string;
  status: NodeStageStatus;
  isLocked: boolean;
  isActiveOrCompleted: boolean;
}

export interface DualRailSplineResult {
  fullRail1Path: string;
  fullRail2Path: string;
  fullCenterPath: string;
  segments: PathSegment[];
}

export interface SerpentineLayoutOptions {
  viewportWidth?: number;
  centerX?: number;
  startY?: number;
  ySpacing?: number;
  amplitude?: number;
  phaseOffset?: number;
}

/**
 * Returns sinusoidal swing amplitude in pixels based on viewport width
 * per Section 9 of LEARN-DUOLINGO-PATH-UI-SPEC.md.
 */
export function getSerpentineAmplitude(viewportWidth: number): number {
  if (viewportWidth < 640) {
    return SERPENTINE_AMPLITUDES.MOBILE; // 42px
  }
  if (viewportWidth <= 768) {
    return SERPENTINE_AMPLITUDES.LANDSCAPE; // 68px
  }
  if (viewportWidth < 1024) {
    return SERPENTINE_AMPLITUDES.TABLET; // 96px
  }
  return SERPENTINE_AMPLITUDES.DESKTOP; // 120px
}

/**
 * Calculates sinusoidal x-offset for a sequential node index:
 * Swing alternates sinusoidally: 0 -> +A -> 0 -> -A -> 0 ...
 * Formula: A * sin((index * Math.PI) / 2 + phaseOffset)
 */
export function getSinusoidalXOffset(
  index: number,
  viewportWidth: number,
  options?: { amplitude?: number; phaseOffset?: number }
): number {
  const amplitude = options?.amplitude ?? getSerpentineAmplitude(viewportWidth);
  const phase = options?.phaseOffset ?? 0;
  const rawOffset = amplitude * Math.sin((index * Math.PI) / 2 + phase);
  // Round to 2 decimal places to avoid floating point precision noise
  return Math.round(rawOffset * 100) / 100;
}

/**
 * Pure calculation function generating 2D coordinates for an array of nodes.
 * Used by SerpentinePath and parent layout components (e.g., DUO-11 assemble page).
 */
export function calculateNodeCoordinates<T extends PathNodePoint>(
  nodes: T[],
  options?: SerpentineLayoutOptions
): (T & CalculatedNodePosition)[] {
  const viewportWidth = options?.viewportWidth ?? 1440;
  const amplitude = options?.amplitude ?? getSerpentineAmplitude(viewportWidth);
  const defaultCenterX = Math.max(amplitude + 40, 200);
  const centerX = options?.centerX ?? defaultCenterX;
  const startY = options?.startY ?? 60;
  const ySpacing = options?.ySpacing ?? 110;

  return nodes.map((node, index) => {
    // If custom x and y were passed, preserve them; otherwise calculate sinusoidal position
    const xOffset = getSinusoidalXOffset(index, viewportWidth, {
      amplitude,
      phaseOffset: options?.phaseOffset,
    });
    const x = typeof node.x === "number" ? node.x : Math.round(centerX + xOffset);
    const y = typeof node.y === "number" ? node.y : Math.round(startY + index * ySpacing);
    const status = (node.status as NodeStageStatus) || (index === 0 ? "active" : "locked");

    return {
      ...node,
      id: node.id || `node-${index}`,
      index,
      x,
      y,
      status,
      xOffset,
    };
  });
}

/**
 * Computes a smooth cubic Bezier curve string between two points:
 * Exits vertically downward from p0 and enters vertically downward into p1.
 */
export function generateCubicBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  tension = 0.5
): string {
  const dy = p1.y - p0.y;
  const cp1x = Math.round(p0.x * 100) / 100;
  const cp1y = Math.round((p0.y + dy * tension) * 100) / 100;
  const cp2x = Math.round(p1.x * 100) / 100;
  const cp2y = Math.round((p1.y - dy * tension) * 100) / 100;

  return `M ${p0.x} ${p0.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
}

/**
 * Generates dual-rail SVG path data (Rail 1, Rail 2, and Center) plus segment details.
 * Rail 1 is offset by -railSpacing/2 and Rail 2 by +railSpacing/2.
 */
export function generateDualRailSpline(
  points: { x: number; y: number; status?: NodeStageStatus | string; id?: string }[],
  railSpacing = 8,
  tension = 0.5
): DualRailSplineResult {
  if (points.length < 2) {
    return {
      fullRail1Path: "",
      fullRail2Path: "",
      fullCenterPath: "",
      segments: [],
    };
  }

  const halfSpacing = railSpacing / 2;
  const segments: PathSegment[] = [];

  let fullRail1Path = "";
  let fullRail2Path = "";
  let fullCenterPath = "";

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];

    const centerSegment = generateCubicBezier(p0, p1, tension);
    const rail1_p0 = { x: p0.x - halfSpacing, y: p0.y };
    const rail1_p1 = { x: p1.x - halfSpacing, y: p1.y };
    const rail2_p0 = { x: p0.x + halfSpacing, y: p0.y };
    const rail2_p1 = { x: p1.x + halfSpacing, y: p1.y };

    const rail1Segment = generateCubicBezier(rail1_p0, rail1_p1, tension);
    const rail2Segment = generateCubicBezier(rail2_p0, rail2_p1, tension);

    const segmentStatus = (p1.status as NodeStageStatus) || "locked";
    const isLocked = segmentStatus === "locked";
    const isActiveOrCompleted =
      segmentStatus === "completed" ||
      segmentStatus === "active" ||
      segmentStatus === "diverged";

    segments.push({
      index: i,
      fromId: p0.id || `node-${i}`,
      toId: p1.id || `node-${i + 1}`,
      fromPoint: p0,
      toPoint: p1,
      rail1Path: rail1Segment,
      rail2Path: rail2Segment,
      centerPath: centerSegment,
      status: segmentStatus,
      isLocked,
      isActiveOrCompleted,
    });

    if (i === 0) {
      fullCenterPath = centerSegment;
      fullRail1Path = rail1Segment;
      fullRail2Path = rail2Segment;
    } else {
      const cSub = centerSegment.replace(/^M\s*[\d.]+\s+[\d.]+\s*/, "");
      const r1Sub = rail1Segment.replace(/^M\s*[\d.]+\s+[\d.]+\s*/, "");
      const r2Sub = rail2Segment.replace(/^M\s*[\d.]+\s+[\d.]+\s*/, "");
      fullCenterPath += ` ${cSub}`;
      fullRail1Path += ` ${r1Sub}`;
      fullRail2Path += ` ${r2Sub}`;
    }
  }

  return {
    fullRail1Path,
    fullRail2Path,
    fullCenterPath,
    segments,
  };
}

export interface SerpentinePathProps {
  /** Array of node objects to automatically calculate coordinates for */
  nodes?: PathNodePoint[];
  /** Or explicit 2D points */
  points?: { x: number; y: number; status?: NodeStageStatus | string; id?: string }[];
  /** Viewport width in pixels to determine sinusoidal amplitude (default: 1440) */
  viewportWidth?: number;
  /** Width of the SVG canvas (default: '100%') */
  width?: number | string;
  /** Height of the SVG canvas (default: auto computed or '100%') */
  height?: number | string;
  /** Center X position for the sinusoidal wave axis (default: auto) */
  centerX?: number;
  /** Initial Y coordinate for node 0 (default: 60) */
  startY?: number;
  /** Vertical distance between consecutive nodes (default: 110) */
  ySpacing?: number;
  /** Distance in pixels between the dual rails (default: 8) */
  railSpacing?: number;
  /** Stroke width in pixels for the rails (default: 2) */
  strokeWidth?: number;
  /** Additional CSS class names */
  className?: string;
  /** Enable voltage pulse animation on completed/active segments (default: true) */
  pulseAnimation?: boolean;
}

/**
 * SerpentinePath — A purely computational SVG canvas component that accepts
 * a list of node positions and outputs bezier/sinusoidal coordinate math for
 * dual-rail bus paths with animated stroke-dashoffset coherence-flow stream.
 *
 * NOTE: Per DUO-1 specification, this component renders path geometry ONLY.
 * Node buttons, badges, and labels are rendered separately by parent containers.
 */
export function SerpentinePath({
  nodes,
  points: explicitPoints,
  viewportWidth = 1440,
  width = "100%",
  height,
  centerX,
  startY = 60,
  ySpacing = 110,
  railSpacing = 8,
  strokeWidth = 2,
  className = "",
  pulseAnimation = true,
}: SerpentinePathProps) {
  // Resolve points either from explicitPoints or calculated from nodes
  const resolvedPoints = useMemo(() => {
    if (explicitPoints && explicitPoints.length > 0) {
      return explicitPoints;
    }
    if (nodes && nodes.length > 0) {
      return calculateNodeCoordinates(nodes, {
        viewportWidth,
        centerX,
        startY,
        ySpacing,
      });
    }
    return [];
  }, [explicitPoints, nodes, viewportWidth, centerX, startY, ySpacing]);

  // Compute dual-rail bezier splines
  const { fullRail1Path, fullRail2Path, segments } = useMemo(() => {
    return generateDualRailSpline(resolvedPoints, railSpacing);
  }, [resolvedPoints, railSpacing]);

  // Compute canvas bounding dimensions
  const computedHeight = useMemo(() => {
    if (height) return height;
    if (resolvedPoints.length === 0) return 300;
    const maxY = Math.max(...resolvedPoints.map((p) => p.y));
    return maxY + 80;
  }, [height, resolvedPoints]);

  if (resolvedPoints.length < 2) {
    return (
      <svg
        data-testid="serpentine-path-canvas"
        className={`w-full overflow-visible pointer-events-none select-none ${className}`}
        width={width}
        height={computedHeight}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      data-testid="serpentine-path-canvas"
      className={`w-full overflow-visible pointer-events-none select-none ${className}`}
      width={width}
      height={computedHeight}
      aria-hidden="true"
    >
      <defs>
        {/* Coherence Voltage Stream Linear Gradient: Deep Indigo to Royal Amethyst */}
        <linearGradient
          id="coherence-voltage-gradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#2a2882" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#4a02b1" stopOpacity="1" />
          <stop offset="100%" stopColor="#2a2882" stopOpacity="0.95" />
        </linearGradient>

        {/* Embedded keyframe styles for standalone / unit-test self-sufficiency */}
        <style>
          {`
            @keyframes coherence-flow {
              from { stroke-dashoffset: 36; }
              to { stroke-dashoffset: 0; }
            }
            .animate-coherence-stream {
              stroke-dasharray: 6 12;
              animation: coherence-flow 1200ms linear infinite;
            }
          `}
        </style>
      </defs>

      {/* 1. Background Tracks (Dual-Rail Hairline Spline) */}
      <g data-testid="serpentine-background-tracks" opacity="0.6">
        <path
          data-testid="serpentine-rail-1"
          d={fullRail1Path}
          stroke="var(--border-subtle, rgba(11, 10, 67, 0.08))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <path
          data-testid="serpentine-rail-2"
          d={fullRail2Path}
          stroke="var(--border-subtle, rgba(11, 10, 67, 0.08))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* 2. Segments: Locked (Dashed) or Active/Completed (Coherence Voltage Stream) */}
      <g data-testid="serpentine-segments">
        {segments.map((seg) => {
          if (seg.isLocked) {
            return (
              <g
                key={`locked-seg-${seg.index}`}
                data-testid={`serpentine-segment-locked-${seg.index}`}
                opacity="0.4"
              >
                <path
                  d={seg.rail1Path}
                  stroke="var(--border-subtle, rgba(11, 10, 67, 0.14))"
                  strokeWidth={strokeWidth}
                  strokeDasharray="2 6"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d={seg.rail2Path}
                  stroke="var(--border-subtle, rgba(11, 10, 67, 0.14))"
                  strokeWidth={strokeWidth}
                  strokeDasharray="2 6"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            );
          }

          // Active, Completed or Diverged Segments: Animated Coherence Voltage Stream
          const animationClass = pulseAnimation ? "animate-coherence-stream" : "";

          return (
            <g
              key={`active-seg-${seg.index}`}
              data-testid={`serpentine-voltage-stream-${seg.index}`}
              data-status={seg.status}
            >
              {/* Rail 1 Voltage Stream */}
              <path
                d={seg.rail1Path}
                className={animationClass}
                stroke="url(#coherence-voltage-gradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
              {/* Rail 2 Voltage Stream */}
              <path
                d={seg.rail2Path}
                className={animationClass}
                stroke="url(#coherence-voltage-gradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default SerpentinePath;
