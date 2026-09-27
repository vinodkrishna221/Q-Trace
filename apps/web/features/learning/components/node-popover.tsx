"use client";

import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { Zap, Shield, Star, Play, X } from "lucide-react";

export type PopoverPlacement = "top" | "bottom" | "auto";

export interface NodePopoverProps {
  /** Stage sequential number (e.g. 3, '03', 'Stage 03') */
  stageNumber?: number | string;
  /** Category tag (e.g. 'Foundation', 'Superposition', 'Entanglement') */
  category?: string;
  /** Lesson or stage title */
  title: string;
  /** Objective micro-copy */
  objective?: string;
  /** Reward XP value (e.g. 50, '+50', '+50⚡') */
  xp?: number | string;
  /** Reward Shield restore value (e.g. 5, 20, '+20%', '+5%') */
  shield?: number | string;
  /** Mastery star rating (0 to 3) */
  stars?: number;
  /** Custom CTA button label override */
  ctaLabel?: string;
  /** Whether the popover is visible (defaults to true) */
  isOpen?: boolean;
  /** Anchor element reference */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Direct anchor element */
  anchorEl?: HTMLElement | null;
  /** Explicit anchor bounding rect for positioning or tests */
  anchorRect?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  };
  /** Placement preference: 'top' (above node), 'bottom' (below node), or 'auto' (computed from viewport) */
  placement?: PopoverPlacement;
  /** Callback triggered when user clicks/activates the primary START CTA */
  onStart?: () => void;
  /** Callback triggered when user dismisses the popover (click-outside, Esc, close button) */
  onClose?: () => void;
  /** Custom CSS classes */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom test ID override */
  testId?: string;
}

const POPOVER_WIDTH_DESKTOP = 260;
const POPOVER_ESTIMATED_HEIGHT = 165;
const BEAK_WIDTH = 12;
const BEAK_HEIGHT = 8;
const GAP_OFFSET = 6;

/**
 * NodePopover — In-Situ Anchored Popover with Pointing Beak per
 * docs/LEARN-DUOLINGO-PATH-UI-SPEC.md Section 6 & 6.1.
 *
 * Sprouted directly when an active/completed stepping-stone node is tapped,
 * displaying stage metadata, stars, XP/Shield rewards, and tactile START CTA.
 */
export function NodePopover({
  stageNumber,
  category,
  title,
  objective,
  xp,
  shield,
  stars = 0,
  ctaLabel,
  isOpen = true,
  anchorRef,
  anchorEl,
  anchorRect: explicitAnchorRect,
  placement = "auto",
  onStart,
  onClose,
  className = "",
  style,
  testId = "node-popover",
}: NodePopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Position state
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    resolvedPlacement: "top" | "bottom";
    beakLeft: number;
  } | null>(null);

  // Helper to resolve anchor rect
  const getAnchorRect = useCallback(() => {
    if (explicitAnchorRect) return explicitAnchorRect;
    const el = anchorRef?.current || anchorEl;
    if (el && typeof el.getBoundingClientRect === "function") {
      return el.getBoundingClientRect();
    }
    return null;
  }, [explicitAnchorRect, anchorRef, anchorEl]);

  // Compute position & beak alignment
  const updatePosition = useCallback(() => {
    const rect = getAnchorRect();
    if (!rect) {
      // If no anchor rect provided, resolve based on requested placement
      setCoords({
        top: 0,
        left: 0,
        resolvedPlacement: placement === "bottom" ? "bottom" : "top",
        beakLeft: POPOVER_WIDTH_DESKTOP / 2,
      });
      return;
    }

    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

    // Determine placement direction
    let resolvedPlacement: "top" | "bottom" = "top";
    if (placement === "top") {
      resolvedPlacement = "top";
    } else if (placement === "bottom") {
      resolvedPlacement = "bottom";
    } else {
      // Auto: if not enough room above node, place below
      const spaceAbove = rect.top;
      if (spaceAbove < POPOVER_ESTIMATED_HEIGHT + BEAK_HEIGHT + GAP_OFFSET + 10) {
        resolvedPlacement = "bottom";
      } else {
        resolvedPlacement = "top";
      }
    }

    const popoverWidth = Math.min(POPOVER_WIDTH_DESKTOP, viewportWidth - 24);
    const nodeCenterX = rect.left + rect.width / 2;

    // Horizontal positioning clamped within viewport
    const rawLeft = nodeCenterX - popoverWidth / 2;
    const clampedLeft = Math.max(12, Math.min(viewportWidth - popoverWidth - 12, rawLeft));

    // Beak pointing directly to node center
    const rawBeakLeft = nodeCenterX - clampedLeft;
    const clampedBeakLeft = Math.max(BEAK_WIDTH + 8, Math.min(popoverWidth - BEAK_WIDTH - 8, rawBeakLeft));

    // Vertical positioning
    let top = 0;
    if (resolvedPlacement === "top") {
      top = rect.top - (POPOVER_ESTIMATED_HEIGHT + BEAK_HEIGHT + GAP_OFFSET);
    } else {
      top = rect.bottom + BEAK_HEIGHT + GAP_OFFSET;
    }

    setCoords({
      top: Math.max(8, top),
      left: clampedLeft,
      resolvedPlacement,
      beakLeft: clampedBeakLeft,
    });
  }, [getAnchorRect, placement]);

  // Compute position on mount, layout and resize
  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isOpen, updatePosition]);

  // Click-outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        const anchor = anchorRef?.current || anchorEl;
        if (anchor && anchor.contains(target)) {
          return;
        }
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose, anchorRef, anchorEl]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPlacement = coords?.resolvedPlacement || (placement === "bottom" ? "bottom" : "top");
  const beakLeft = coords?.beakLeft ?? POPOVER_WIDTH_DESKTOP / 2;

  // Format stage number string
  const formatStage = () => {
    if (stageNumber === undefined || stageNumber === null) return null;
    const str = String(stageNumber).trim();
    if (str.toLowerCase().startsWith("stage")) return str;
    const num = parseInt(str, 10);
    if (!isNaN(num)) {
      return `STAGE ${num < 10 ? `0${num}` : num}`;
    }
    return `STAGE ${str}`;
  };

  const formattedStage = formatStage();

  // Clean values for rewards
  const cleanXp = xp !== undefined && xp !== null ? String(xp).replace(/[^0-9+]/g, "") : null;
  const cleanShield = shield !== undefined && shield !== null ? String(shield).replace(/[^0-9+]/g, "") : null;

  // Default CTA label
  const resolvedCtaLabel =
    ctaLabel ||
    (cleanXp ? `▶ START (+${cleanXp} XP)` : "▶ START");

  const isPositioned = coords !== null && (explicitAnchorRect || anchorRef || anchorEl);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      data-testid={testId}
      data-placement={currentPlacement}
      className={`rounded-2xl transition-all duration-150 select-none ${className}`}
      style={{
        width: "260px",
        backgroundColor: "var(--bg-surface, #ffffff)",
        border: "1px solid var(--border-strong, rgba(0, 0, 0, 0.18))",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10)",
        padding: "14px 16px",
        position: isPositioned ? "fixed" : "relative",
        ...(isPositioned
          ? {
              top: `${coords?.top ?? 0}px`,
              left: `${coords?.left ?? 0}px`,
              zIndex: 50,
            }
          : {}),
        ...style,
      }}
    >
      {/* Pointing SVG Beak (12x8px) */}
      <div
        data-testid="popover-beak"
        data-placement={currentPlacement}
        data-direction={currentPlacement === "top" ? "down" : "up"}
        className="absolute pointer-events-none"
        style={{
          left: `${beakLeft}px`,
          transform: "translateX(-50%)",
          ...(currentPlacement === "top"
            ? {
                bottom: "-8px",
                width: `${BEAK_WIDTH}px`,
                height: `${BEAK_HEIGHT}px`,
              }
            : {
                top: "-8px",
                width: `${BEAK_WIDTH}px`,
                height: `${BEAK_HEIGHT}px`,
              }),
        }}
      >
        <svg
          width={BEAK_WIDTH}
          height={BEAK_HEIGHT}
          viewBox={`0 0 ${BEAK_WIDTH} ${BEAK_HEIGHT}`}
          className="overflow-visible block"
        >
          {currentPlacement === "top" ? (
            // Beak pointing down towards node center
            <>
              <polygon
                points={`0,0 ${BEAK_WIDTH},0 ${BEAK_WIDTH / 2},${BEAK_HEIGHT}`}
                fill="var(--bg-surface, #ffffff)"
              />
              <polyline
                points={`0,0 ${BEAK_WIDTH / 2},${BEAK_HEIGHT} ${BEAK_WIDTH},0`}
                fill="none"
                stroke="var(--border-strong, rgba(0, 0, 0, 0.18))"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Mask line to seamlessly connect with popover body */}
              <line
                x1="0.5"
                y1="0"
                x2={BEAK_WIDTH - 0.5}
                y2="0"
                stroke="var(--bg-surface, #ffffff)"
                strokeWidth="1.5"
              />
            </>
          ) : (
            // Beak pointing up towards node center
            <>
              <polygon
                points={`0,${BEAK_HEIGHT} ${BEAK_WIDTH},${BEAK_HEIGHT} ${BEAK_WIDTH / 2},0`}
                fill="var(--bg-surface, #ffffff)"
              />
              <polyline
                points={`0,${BEAK_HEIGHT} ${BEAK_WIDTH / 2},0 ${BEAK_WIDTH},${BEAK_HEIGHT}`}
                fill="none"
                stroke="var(--border-strong, rgba(0, 0, 0, 0.18))"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Mask line to seamlessly connect with popover body */}
              <line
                x1="0.5"
                y1={BEAK_HEIGHT}
                x2={BEAK_WIDTH - 0.5}
                y2={BEAK_HEIGHT}
                stroke="var(--bg-surface, #ffffff)"
                strokeWidth="1.5"
              />
            </>
          )}
        </svg>
      </div>

      {/* Header Row: Stage Number + Category Tag + Close / Stars */}
      <div className="flex items-center justify-between gap-1 text-[11px] font-semibold tracking-wider uppercase text-[var(--text-muted,#94a3b8)]">
        <div className="flex items-center gap-1.5 truncate" data-testid="popover-header">
          {formattedStage && (
            <span
              data-testid="popover-stage-number"
              className="text-[var(--text-muted,#94a3b8)] font-medium"
            >
              {formattedStage}
            </span>
          )}
          {formattedStage && category && (
            <span className="text-[var(--text-faint,#cbd5e1)] select-none">•</span>
          )}
          {category && (
            <span
              data-testid="popover-category"
              className="text-[var(--accent,#0284c7)] font-semibold truncate"
            >
              {category}
            </span>
          )}
        </div>

        {/* Top-right action or close */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Star rating preview */}
          <div
            data-testid="popover-stars"
            className="flex items-center gap-0.5"
            aria-label={`${stars} of 3 stars`}
          >
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                data-testid={`popover-star-${starIdx}`}
                className={`w-3 h-3 ${
                  starIdx <= stars
                    ? "text-[#f59e0b] fill-[#f59e0b]"
                    : "text-[var(--text-faint,#cbd5e1)] stroke-[1.5]"
                }`}
              />
            ))}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              data-testid="popover-close-btn"
              aria-label="Close popover"
              className="text-[var(--text-muted,#94a3b8)] hover:text-[var(--text-primary,#0f172a)] rounded p-0.5 ml-1 transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent,#0284c7)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lesson Title (Inter 14px SemiBold) */}
      <h3
        data-testid="popover-title"
        className="text-[14px] font-semibold text-[var(--text-primary,#0f172a)] mt-1.5 leading-snug line-clamp-1"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {title}
      </h3>

      {/* Objective Micro-copy */}
      {objective && (
        <p
          data-testid="popover-objective"
          className="text-[12px] text-[var(--text-secondary,#475569)] mt-1 leading-normal line-clamp-2"
        >
          {objective}
        </p>
      )}

      {/* Reward Badge Strip */}
      <div
        data-testid="popover-rewards"
        className="flex items-center gap-2 mt-2.5"
      >
        {cleanXp && (
          <div
            data-testid="popover-xp-badge"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--accent-subtle,#f0f9ff)] text-[var(--accent,#0284c7)] border border-[var(--border-subtle,rgba(0,0,0,0.06))]"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>+{cleanXp}⚡ Coherence</span>
          </div>
        )}

        {cleanShield && (
          <div
            data-testid="popover-shield-badge"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--success-subtle,#ecfdf5)] text-[var(--success,#059669)] border border-[var(--border-subtle,rgba(0,0,0,0.06))]"
          >
            <Shield className="w-3 h-3" />
            <span>🛡️ +{cleanShield}% Shield</span>
          </div>
        )}
      </div>

      {/* Big Tactile CTA Button: ▶ START (+XP) */}
      <button
        type="button"
        data-testid="popover-cta"
        onClick={() => onStart?.()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onStart?.();
          }
        }}
        className="w-full h-10 mt-3 rounded-xl font-bold text-[12px] tracking-wide uppercase text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95 active:scale-[0.97] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent,#0284c7)] focus:ring-offset-2"
        style={{
          backgroundColor: "var(--accent, #0284c7)",
        }}
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>{resolvedCtaLabel}</span>
      </button>
    </div>
  );
}
