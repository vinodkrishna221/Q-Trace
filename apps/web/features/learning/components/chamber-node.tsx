"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Atom,
  Compass,
  Binary,
  Activity,
  Crown,
  Gift,
  Lock,
  Check,
  Star,
} from "lucide-react";

/**
 * 6 Chamber Archetypes per docs/LEARN-DUOLINGO-PATH-UI-SPEC.md Section 5.1:
 * - NODE_CONCEPT: Concept Chamber (Physical intuition & everyday analogies)
 * - NODE_PREDICTION: Prediction Checkpoint (Formulate hypothesis before seeing simulation)
 * - NODE_GATE_LAB: Gate Construction Lab (Hands-on circuit assembly using drag-and-drop or Qiskit)
 * - NODE_DEBUG: Flight Recorder Debug (Replay state traces & isolate divergence step)
 * - NODE_MILESTONE: Unit Milestone Boss (Capstone synthesis uniting all concepts of the unit)
 * - NODE_BONUS: Bonus Vault / Discovery (Speed challenges, historical physics experiments)
 */
export const CHAMBER_ARCHETYPES = {
  CONCEPT: "NODE_CONCEPT",
  PREDICTION: "NODE_PREDICTION",
  GATE_LAB: "NODE_GATE_LAB",
  DEBUG: "NODE_DEBUG",
  MILESTONE: "NODE_MILESTONE",
  BONUS: "NODE_BONUS",
} as const;

export type ChamberArchetype =
  | "NODE_CONCEPT"
  | "NODE_PREDICTION"
  | "NODE_GATE_LAB"
  | "NODE_DEBUG"
  | "NODE_MILESTONE"
  | "NODE_BONUS"
  | "concept"
  | "prediction"
  | "gate_lab"
  | "gate"
  | "debug"
  | "flight_recorder"
  | "milestone"
  | "boss"
  | "bonus"
  | "vault";

/**
 * 4 Chamber Interaction States per docs/LEARN-DUOLINGO-PATH-UI-SPEC.md Section 7.1:
 * - STATE_LOCKED: Opacity 0.45, grayscale filter, padlock icon, head-shake on click
 * - STATE_ACTIVE: 100% opacity, specular crest, radar sonar beacon, 1.06x hover, 0.94x click squash
 * - STATE_COMPLETED: 1.5px Pine Emerald border, 100% orbital progress ring, verified checkmark/glyph
 * - STATE_DIVERGED: 1.5px Amber border, warm amber tint, pulsing amber sonar pip
 */
export const CHAMBER_STATES = {
  LOCKED: "STATE_LOCKED",
  ACTIVE: "STATE_ACTIVE",
  COMPLETED: "STATE_COMPLETED",
  DIVERGED: "STATE_DIVERGED",
} as const;

export type ChamberState =
  | "STATE_LOCKED"
  | "STATE_ACTIVE"
  | "STATE_COMPLETED"
  | "STATE_DIVERGED"
  | "locked"
  | "active"
  | "completed"
  | "diverged";

export interface ChamberNodeProps {
  /** Unique stage identifier */
  id?: string;
  /** Stage sequential number (e.g. 3, '03') */
  stageNumber?: number | string;
  /** Lesson or stage title */
  title?: string;
  /** Micro-copy descriptor (e.g. "CONCEPT", "PREDICT", "GATE LAB", "DEBUG") */
  descriptor?: string;
  /** Archetype type of the chamber */
  archetype?: ChamberArchetype;
  /** Interaction state of the chamber */
  state?: ChamberState;
  /** Gate letter/name if archetype is Gate Lab (e.g. 'H', 'X', 'Z', 'CNOT') */
  gateGlyph?: string;
  /** Custom icon override */
  icon?: React.ReactNode;
  /** Progress along the orbital ring (0 to 1, default: 0 or 1 if completed) */
  progress?: number;
  /** Mastery star rating (0 to 3) */
  stars?: number;
  /** Whether to render the 3-star badge below the node */
  showStars?: boolean;
  /** Whether to display the floating label tooltip */
  showLabel?: boolean;
  /** Explicit label override */
  label?: string;
  /** Diameter of the circular node in pixels (default: 68) */
  size?: number;
  /** Custom CSS classes */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Click/press handler */
  onClick?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
  /** Triggered on Enter key / primary activation */
  onOpen?: () => void;
  /** Triggered on Space key / launch action */
  onLaunch?: () => void;
  /** Custom accessibility label */
  ariaLabel?: string;
}

/** Normalize archetype string to canonical enum value */
export function normalizeArchetype(archetype: ChamberArchetype = "NODE_CONCEPT"): string {
  switch (archetype) {
    case "NODE_CONCEPT":
    case "concept":
      return "NODE_CONCEPT";
    case "NODE_PREDICTION":
    case "prediction":
      return "NODE_PREDICTION";
    case "NODE_GATE_LAB":
    case "gate_lab":
    case "gate":
      return "NODE_GATE_LAB";
    case "NODE_DEBUG":
    case "debug":
    case "flight_recorder":
      return "NODE_DEBUG";
    case "NODE_MILESTONE":
    case "milestone":
    case "boss":
      return "NODE_MILESTONE";
    case "NODE_BONUS":
    case "bonus":
    case "vault":
      return "NODE_BONUS";
    default:
      return "NODE_CONCEPT";
  }
}

/** Normalize state string to canonical enum value */
export function normalizeState(
  state: ChamberState = "STATE_ACTIVE"
): "STATE_LOCKED" | "STATE_ACTIVE" | "STATE_COMPLETED" | "STATE_DIVERGED" {
  switch (state) {
    case "STATE_LOCKED":
    case "locked":
      return "STATE_LOCKED";
    case "STATE_ACTIVE":
    case "active":
      return "STATE_ACTIVE";
    case "STATE_COMPLETED":
    case "completed":
      return "STATE_COMPLETED";
    case "STATE_DIVERGED":
    case "diverged":
      return "STATE_DIVERGED";
    default:
      return "STATE_ACTIVE";
  }
}

interface ArchetypeConfig {
  token: string;
  tokenCssVar: string;
  defaultDescriptor: string;
  surface: string;
  defaultBorder: string;
  accentColor: string;
}

const ARCHETYPE_CONFIGS: Record<string, ArchetypeConfig> = {
  NODE_CONCEPT: {
    token: "--accent",
    tokenCssVar: "var(--accent)",
    defaultDescriptor: "CONCEPT",
    surface: "var(--bg-surface)",
    defaultBorder: "var(--border-subtle)",
    accentColor: "var(--accent)",
  },
  NODE_PREDICTION: {
    token: "--caution",
    tokenCssVar: "var(--caution)",
    defaultDescriptor: "PREDICT",
    surface: "var(--bg-surface-raised)",
    defaultBorder: "var(--border-strong)",
    accentColor: "var(--caution)",
  },
  NODE_GATE_LAB: {
    token: "--gate-h",
    tokenCssVar: "var(--gate-h)",
    defaultDescriptor: "GATE LAB",
    surface: "var(--bg-surface)",
    defaultBorder: "var(--border-medium)",
    accentColor: "var(--accent)",
  },
  NODE_DEBUG: {
    token: "--evidence-diverge",
    tokenCssVar: "var(--evidence-diverge)",
    defaultDescriptor: "DEBUG",
    surface: "var(--bg-surface-sunken)",
    defaultBorder: "var(--evidence-diverge)",
    accentColor: "var(--evidence-diverge)",
  },
  NODE_MILESTONE: {
    token: "--violet",
    tokenCssVar: "var(--violet)",
    defaultDescriptor: "MILESTONE",
    surface: "var(--bg-surface-raised)",
    defaultBorder: "var(--violet)",
    accentColor: "var(--violet)",
  },
  NODE_BONUS: {
    token: "--text-secondary",
    tokenCssVar: "var(--text-secondary)",
    defaultDescriptor: "BONUS",
    surface: "var(--bg-surface-sunken)",
    defaultBorder: "var(--border-subtle)",
    accentColor: "var(--text-secondary)",
  },
};

/**
 * ChamberNode — Tactile stepping-stone node component supporting 6 archetypes,
 * 4 interaction states, specular crest, radar sonar beacon, 3D mechanical press,
 * locked head-shake animation, and WCAG keyboard accessibility.
 */
export function ChamberNode({
  id,
  stageNumber,
  title,
  descriptor,
  archetype = "NODE_CONCEPT",
  state = "STATE_ACTIVE",
  gateGlyph,
  icon: customIcon,
  progress,
  stars,
  showStars = false,
  showLabel = false,
  label,
  size = 68,
  className = "",
  style,
  onClick,
  onOpen,
  onLaunch,
  ariaLabel,
}: ChamberNodeProps) {
  const normArchetype = normalizeArchetype(archetype);
  const normState = normalizeState(state);
  const config = ARCHETYPE_CONFIGS[normArchetype] || ARCHETYPE_CONFIGS.NODE_CONCEPT;

  const [isPressed, setIsPressed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showLockedTooltip, setShowLockedTooltip] = useState(false);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isLocked = normState === "STATE_LOCKED";
  const isActive = normState === "STATE_ACTIVE";
  const isCompleted = normState === "STATE_COMPLETED";
  const isDiverged = normState === "STATE_DIVERGED";

  // Trigger gentle horizontal head-shake on locked click
  const triggerHeadShake = useCallback(() => {
    setIsShaking(true);
    setShowLockedTooltip(true);

    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false);
    }, 250);

    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowLockedTooltip(false);
    }, 1800);
  }, []);

  // Trigger 3D mechanical press feedback
  const triggerSquash = useCallback(() => {
    setIsPressed(true);
    if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
    pressTimeoutRef.current = setTimeout(() => {
      setIsPressed(false);
    }, 150);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      triggerHeadShake();
      return;
    }
    triggerSquash();
    onClick?.(e);
    onOpen?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isLocked) {
        triggerHeadShake();
      } else {
        triggerSquash();
        onClick?.(e);
        onOpen?.();
      }
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      if (isLocked) {
        triggerHeadShake();
      } else {
        triggerSquash();
        onClick?.(e);
        onLaunch?.();
      }
    }
  };

  // Determine surface background and border based on state and archetype
  let surfaceBg = config.surface;
  let borderColor = config.defaultBorder;
  let opacity = 1.0;

  if (isLocked) {
    opacity = 0.45;
    surfaceBg = "var(--bg-surface-sunken)";
    borderColor = "var(--border-subtle)";
  } else if (isActive) {
    opacity = 1.0;
    surfaceBg = "var(--bg-surface)";
    borderColor = "var(--border-strong)";
  } else if (isCompleted) {
    opacity = 1.0;
    surfaceBg = "var(--bg-surface-raised)";
    borderColor = "var(--evidence-success)";
  } else if (isDiverged) {
    opacity = 1.0;
    surfaceBg = "rgba(154, 52, 18, 0.06)";
    borderColor = "var(--evidence-diverge)";
  }

  // Specular top bevel
  const specularBevel = isActive
    ? "inset 0 1px 0 rgba(255, 255, 255, 0.90), 0 2px 8px rgba(0, 0, 0, 0.08)"
    : "inset 0 1px 0 rgba(255, 255, 255, 0.50)";

  // Orbital progress ring geometry
  const ringPadding = 6;
  const ringSize = size + ringPadding * 2;
  const radius = size / 2 + 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = isCompleted ? 1 : isLocked ? 0 : progress ?? 0;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressRatio)));

  let ringStrokeColor = "var(--border-subtle)";
  if (isCompleted) {
    ringStrokeColor = "var(--evidence-success)";
  } else if (isDiverged) {
    ringStrokeColor = "var(--evidence-diverge)";
  } else if (isActive) {
    ringStrokeColor = config.accentColor;
  }

  // Render archetype icon/glyph
  const renderGlyph = () => {
    if (customIcon) return customIcon;

    if (isLocked) {
      return (
        <Lock
          className="w-5 h-5 text-[var(--text-faint)]"
          data-testid="glyph-locked"
          aria-hidden="true"
        />
      );
    }

    if (isCompleted && normArchetype !== "NODE_MILESTONE") {
      return (
        <Check
          className="w-5 h-5 text-[var(--evidence-success)] stroke-[2.5]"
          data-testid="glyph-completed"
          aria-hidden="true"
        />
      );
    }

    switch (normArchetype) {
      case "NODE_CONCEPT":
        return (
          <Atom
            className="w-5 h-5 text-[var(--accent)]"
            data-testid="glyph-concept"
            aria-hidden="true"
          />
        );
      case "NODE_PREDICTION":
        return (
          <Compass
            className="w-5 h-5 text-[var(--caution)]"
            data-testid="glyph-prediction"
            aria-hidden="true"
          />
        );
      case "NODE_GATE_LAB":
        if (gateGlyph) {
          return (
            <span
              className="font-mono text-base font-bold text-[var(--accent)] tracking-tight"
              data-testid="glyph-gate-lab"
            >
              {gateGlyph}
            </span>
          );
        }
        return (
          <Binary
            className="w-5 h-5 text-[var(--accent)]"
            data-testid="glyph-gate-lab"
            aria-hidden="true"
          />
        );
      case "NODE_DEBUG":
        return (
          <Activity
            className="w-5 h-5 text-[var(--evidence-diverge)]"
            data-testid="glyph-debug"
            aria-hidden="true"
          />
        );
      case "NODE_MILESTONE":
        return (
          <Crown
            className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b]/20"
            data-testid="glyph-milestone"
            aria-hidden="true"
          />
        );
      case "NODE_BONUS":
        return (
          <Gift
            className="w-5 h-5 text-[var(--text-secondary)]"
            data-testid="glyph-bonus"
            aria-hidden="true"
          />
        );
      default:
        return (
          <Atom
            className="w-5 h-5 text-[var(--accent)]"
            data-testid="glyph-concept"
            aria-hidden="true"
          />
        );
    }
  };

  const displayText = descriptor || config.defaultDescriptor;
  const stageFormatted = stageNumber !== undefined ? String(stageNumber).padStart(2, "0") : undefined;
  const defaultAriaLabel = ariaLabel || `${stageFormatted ? `Stage ${stageFormatted}: ` : ""}${title || displayText} (${normArchetype.replace("NODE_", "")}, ${normState.replace("STATE_", "")})`;

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center select-none"
      data-testid="chamber-node-container"
    >
      {/* Floating Tooltip Label (hover/focus or locked guidance) */}
      {(showLabel || label || showLockedTooltip) && (
        <div
          data-testid="chamber-node-tooltip"
          className="absolute -top-8 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-tight whitespace-nowrap z-20 shadow-sm pointer-events-none transition-all duration-200"
          style={{
            backgroundColor: showLockedTooltip ? "var(--text-primary)" : "var(--bg-surface)",
            color: showLockedTooltip ? "var(--bg-canvas)" : "var(--text-primary)",
            border: `1px solid ${showLockedTooltip ? "transparent" : "var(--border-strong)"}`,
          }}
        >
          {showLockedTooltip
            ? `Complete prior stage to unlock`
            : label || (stageFormatted ? `${stageFormatted}. ${title || displayText}` : title || displayText)}
        </div>
      )}

      {/* Radar Sonar Beacon: Concentric Expanding Pulse Ring on Active Stage */}
      {isActive && (
        <span
          data-testid="sonar-beacon"
          className="absolute inset-0 rounded-full animate-sonar-beacon pointer-events-none"
          style={{
            border: `1.5px solid ${config.accentColor}`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Amber Sonar Pip: Flagged Divergence on Debug Stage */}
      {isDiverged && (
        <span
          data-testid="divergence-sonar-pip"
          className="absolute -top-1 -right-1 z-20 flex h-3 w-3 pointer-events-none"
          aria-hidden="true"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--evidence-diverge)] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--evidence-diverge)]" />
        </span>
      )}

      {/* Outer 1.5px Orbital Progress Ring */}
      <svg
        data-testid="orbital-progress-ring"
        className="absolute pointer-events-none overflow-visible"
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        aria-hidden="true"
      >
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke={ringStrokeColor}
          strokeWidth="1.5"
          strokeDasharray={isLocked ? "3 3" : circumference}
          strokeDashoffset={isLocked ? 0 : strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Core Tactile Instrument Circle */}
      <button
        type="button"
        id={id}
        role="button"
        tabIndex={0}
        aria-label={defaultAriaLabel}
        aria-disabled={isLocked}
        data-testid="chamber-node"
        data-archetype={normArchetype}
        data-state={normState}
        data-token={config.token}
        data-pressed={isPressed}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseDown={() => {
          if (!isLocked) setIsPressed(true);
        }}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={[
          "relative rounded-full flex flex-col items-center justify-center",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2",
          "transition-all duration-150 ease-out",
          isLocked ? "cursor-not-allowed filter grayscale" : "cursor-pointer hover:scale-[1.06] hover:-translate-y-0.5",
          isPressed ? "squash mechanical-squash scale-[0.94]" : "",
          isShaking ? "animate-head-shake" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          width: size,
          height: size,
          backgroundColor: surfaceBg,
          borderColor: borderColor,
          borderWidth: isCompleted || isDiverged || isActive ? 1.5 : 1,
          borderStyle: "solid",
          boxShadow: specularBevel,
          opacity: opacity,
          ...style,
        }}
      >
        {/* Glyph / Icon */}
        <div
          data-testid="chamber-node-glyph"
          className="flex items-center justify-center transition-transform duration-150"
        >
          {renderGlyph()}
        </div>

        {/* Subscript Descriptor (Inter 8px uppercase) */}
        {!isLocked && (
          <span
            data-testid="chamber-node-descriptor"
            className="mt-0.5 font-sans text-[8px] font-bold tracking-wider uppercase text-[var(--text-secondary)] opacity-85 select-none"
            style={{
              fontSize: size <= 60 ? "7px" : "8px",
            }}
          >
            {displayText}
          </span>
        )}
      </button>

      {/* Mastery Stars (3-Star Rating) */}
      {(showStars || stars !== undefined) && (
        <div
          data-testid="star-rating"
          className="flex items-center gap-0.5 mt-1.5 pointer-events-none"
          aria-label={`Mastery rating: ${stars ?? 0} of 3 stars`}
        >
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= (stars ?? 0);
            return (
              <Star
                key={starIndex}
                className={`w-3 h-3 ${
                  isEarned
                    ? "fill-[#f59e0b] text-[#f59e0b]"
                    : "fill-transparent text-[var(--text-faint)]"
                }`}
                data-testid={`star-${starIndex}-${isEarned ? "earned" : "empty"}`}
                aria-hidden="true"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
