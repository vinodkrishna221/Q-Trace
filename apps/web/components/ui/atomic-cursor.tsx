'use client';

import * as React from 'react';

/**
 * AtomicCursor: High-Precision Quantum Atom Cursor
 * 
 * Architecture:
 * - Unified (0,0) SVG canvas: Nucleus, orbital paths, and electrons are locked
 *   to the identical coordinate origin, completely eliminating orbit drift.
 * - Standard SVG transform="rotate(...)": mathematically accurate 0°, 60°, 120°
 *   orbital plane angles centered precisely at the nucleus.
 * - Multi-Chromance Particle Contrast:
 *   - Nucleus: Royal Amethyst Violet (#7c3aed / #a855f7) with a pure white specular pip (#ffffff)
 *   - Electrons: Electric Cyan (#00f0ff / #0284c7) particle sparks (different from nucleus!)
 *   - Excited Button State: Shifts to Solar White + Radiant Cyan/Amber to guarantee
 *     extreme visibility over dark indigo, violet, and dark-mode buttons.
 * - Specular shadow contour: 1px high-contrast perimeter ensures visibility over ANY background.
 */
export function AtomicCursor() {
  const [enabled, setEnabled] = React.useState(() => {
    if (typeof window === 'undefined') return true;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) {
      return false;
    }
    return true;
  });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const e1Ref = React.useRef<SVGCircleElement>(null);
  const e2Ref = React.useRef<SVGCircleElement>(null);
  const e3Ref = React.useRef<SVGCircleElement>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Mobile / coarse touch bypass
    if (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) {
      setEnabled(false);
      return;
    }

    // Singleton guard
    if ((window as any).__qtrace_cursor_active__) {
      return;
    }
    (window as any).__qtrace_cursor_active__ = true;

    // Check opt-out preference
    const isOptedOut = localStorage.getItem('qtrace_cursor_enabled') === 'false';
    if (isOptedOut) {
      setEnabled(false);
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    setEnabled(true);
    document.body.classList.add('custom-cursor-active');

    let mouseX = -200;
    let mouseY = -200;
    let hasMoved = false;

    let t1 = 0;
    let t2 = 1.25;
    let t3 = 2.5;
    let speedMultiplier = 1.0;
    let targetSpeedMultiplier = 1.0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMoved) {
        hasMoved = true;
        if (rootRef.current) {
          rootRef.current.style.opacity = '1';
        }
      }

      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const handleMouseLeave = () => {
      if (rootRef.current) rootRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (hasMoved && rootRef.current) {
        rootRef.current.style.opacity = '1';
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      document.body.classList.add('cursor-down');

      // Quantum shockwave ripple effect centered at click coordinate
      if (rootRef.current && hasMoved) {
        const shockwave = document.createElement('div');
        shockwave.className = 'cursor-shockwave';
        shockwave.style.left = '0px';
        shockwave.style.top = '0px';
        rootRef.current.appendChild(shockwave);

        setTimeout(() => {
          shockwave.remove();
        }, 550);
      }
    };

    const handleMouseUp = () => {
      document.body.classList.remove('cursor-down');
    };

    // Event delegation for interactive hovering across all quantum components
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const input = target.closest(
        'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"], .monaco-editor, .cm-editor'
      );
      const interactive = target.closest(
        'button, a, [role="button"], [role="tab"], [role="radio"], [role="checkbox"], [role="slider"], input[type="range"], .gate-chip, .gate-tile, .cursor-pointer, [data-interactive], select, summary, [tabindex]:not([tabindex="-1"])'
      );

      if (input) {
        document.body.classList.add('cursor-collimated');
        document.body.classList.remove('cursor-excited');
        targetSpeedMultiplier = 0.7;
      } else if (interactive) {
        document.body.classList.add('cursor-excited');
        document.body.classList.remove('cursor-collimated');
        targetSpeedMultiplier = 2.4;
      } else {
        document.body.classList.remove('cursor-excited');
        document.body.classList.remove('cursor-collimated');
        targetSpeedMultiplier = 1.0;
      }
    };

    const handleToggleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail?.enabled === false) {
        document.body.classList.remove(
          'custom-cursor-active',
          'cursor-excited',
          'cursor-down',
          'cursor-collimated'
        );
        setEnabled(false);
      } else {
        setEnabled(true);
        document.body.classList.add('custom-cursor-active');
        if (hasMoved && rootRef.current) {
          rootRef.current.style.opacity = '1';
        }
      }
    };

    window.addEventListener('qtrace:cursor-toggle', handleToggleEvent);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    // Orbital physics loop
    const rx = 22;
    const ry = 7.5;

    const animate = () => {
      speedMultiplier += (targetSpeedMultiplier - speedMultiplier) * 0.12;
      t1 += 0.034 * speedMultiplier;
      t2 += 0.042 * speedMultiplier;
      t3 += 0.028 * speedMultiplier;

      if (e1Ref.current) {
        e1Ref.current.setAttribute('cx', (rx * Math.cos(t1)).toFixed(2));
        e1Ref.current.setAttribute('cy', (ry * Math.sin(t1)).toFixed(2));
      }
      if (e2Ref.current) {
        e2Ref.current.setAttribute('cx', (rx * Math.cos(t2)).toFixed(2));
        e2Ref.current.setAttribute('cy', (ry * Math.sin(t2)).toFixed(2));
      }
      if (e3Ref.current) {
        e3Ref.current.setAttribute('cx', (rx * Math.cos(t3)).toFixed(2));
        e3Ref.current.setAttribute('cy', (ry * Math.sin(t3)).toFixed(2));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      (window as any).__qtrace_cursor_active__ = false;
      document.body.classList.remove(
        'custom-cursor-active',
        'cursor-excited',
        'cursor-down',
        'cursor-collimated'
      );
      window.removeEventListener('qtrace:cursor-toggle', handleToggleEvent);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div
      id="atomic-cursor-root"
      ref={rootRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 999999,
        opacity: 0,
        overflow: 'visible',
      }}
    >
      <div className="atomic-cursor-canvas">
        <svg
          className="atomic-cursor-svg"
          viewBox="-32 -32 64 64"
          width="64"
          height="64"
          style={{
            overflow: 'visible',
            transform: 'translate(-32px, -32px)',
          }}
        >
          {/* Defs for Glow Filters and Radial Gradients */}
          <defs>
            <filter id="cursor-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#00f0ff" floodOpacity="0.8" />
            </filter>
            <filter id="nucleus-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#a855f7" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Orbitals System */}
          <g className="cursor-orbital-system">
            {/* Orbit 1: Equatorial (0°) */}
            <g transform="rotate(0)" className="orbital-plane">
              <ellipse cx="0" cy="0" rx="22" ry="7.5" className="orbital-ellipse" />
              <circle cx="0" cy="0" r="2.5" className="electron electron-1" ref={e1Ref} />
            </g>

            {/* Orbit 2: Ascending (60°) */}
            <g transform="rotate(60)" className="orbital-plane">
              <ellipse cx="0" cy="0" rx="22" ry="7.5" className="orbital-ellipse" />
              <circle cx="0" cy="0" r="2.5" className="electron electron-2" ref={e2Ref} />
            </g>

            {/* Orbit 3: Descending (120°) */}
            <g transform="rotate(120)" className="orbital-plane">
              <ellipse cx="0" cy="0" rx="22" ry="7.5" className="orbital-ellipse" />
              <circle cx="0" cy="0" r="2.5" className="electron electron-3" ref={e3Ref} />
            </g>
          </g>

          {/* Central Nucleus System: Locked at (0, 0) */}
          <g className="nucleus-assembly cursor-nucleus">
            {/* Pulsing Breathing Aura */}
            <circle cx="0" cy="0" r="7.5" className="nucleus-aura" />
            {/* Reticle Crosshairs (Appears on Hover) */}
            <line x1="-9" y1="0" x2="-4" y2="0" className="nucleus-reticle" />
            <line x1="4" y1="0" x2="9" y2="0" className="nucleus-reticle" />
            <line x1="0" y1="-9" x2="0" y2="-4" className="nucleus-reticle" />
            <line x1="0" y1="4" x2="0" y2="9" className="nucleus-reticle" />
            {/* Nucleus Core Body (Royal Amethyst Violet) */}
            <circle cx="0" cy="0" r="4" className="nucleus-core" />
            {/* Specular White Center Pip (Infinite Contrast Point) */}
            <circle cx="0" cy="0" r="1.4" className="nucleus-pip" />
          </g>
        </svg>
      </div>
    </div>
  );
}
