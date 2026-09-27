import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';
import { QTraceLogo } from '@/components/ui/q-trace-logo';
import { AtomicCursor } from '@/components/ui/atomic-cursor';

describe('Q-Trace Logo & Atomic Cursor Suite', () => {
  describe('QTraceLogo Component', () => {
    it('renders full brand lockup with Q-TRACE text and flight recorder subtitle by default', () => {
      render(<QTraceLogo />);
      expect(screen.getByText('Q-TRACE')).toBeDefined();
      expect(screen.getByText('Flight Recorder')).toBeDefined();
    });

    it('renders mark-only variant without text elements', () => {
      const { container } = render(<QTraceLogo variant="mark-only" size="sm" aria-label="Brand Mark" />);
      expect(screen.queryByText('Q-TRACE')).toBeNull();
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg?.getAttribute('width')).toBe('24');
      expect(svg?.getAttribute('height')).toBe('24');
    });

    it('renders hero variant with custom pixel size', () => {
      const { container } = render(<QTraceLogo variant="hero" size={40} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      // Hero scales height by 1.5x
      expect(svg?.getAttribute('width')).toBe('60');
      expect(svg?.getAttribute('height')).toBe('60');
    });

    it('hides subtext in full lockup when showSubtext is false', () => {
      render(<QTraceLogo variant="full" showSubtext={false} />);
      expect(screen.getByText('Q-TRACE')).toBeDefined();
      expect(screen.queryByText('Flight Recorder')).toBeNull();
    });
  });

  describe('AtomicCursor Component', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
      document.body.className = '';
    });

    it('renders atomic cursor root with nucleus and 3 orbital planes on desktop pointer', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(pointer: fine)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(<AtomicCursor />);
      const cursorRoot = container.querySelector('#atomic-cursor-root');
      expect(cursorRoot).toBeDefined();
      expect(container.querySelector('.cursor-nucleus')).toBeDefined();
      expect(container.querySelector('.cursor-orbital-system')).toBeDefined();
      expect(container.querySelectorAll('.orbital-plane').length).toBe(3);
      expect(container.querySelectorAll('.electron').length).toBe(3);
      expect(document.body.classList.contains('custom-cursor-active')).toBe(true);
    });

    it('does not render on coarse touch devices', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(<AtomicCursor />);
      const cursorRoot = container.querySelector('#atomic-cursor-root');
      expect(cursorRoot).toBeNull();
    });
  });
});
