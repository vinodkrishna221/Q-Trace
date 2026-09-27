import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { render } from '../test-utils';
import { LearningHUD } from '@/features/learning/components/learning-hud';
import { useGamificationStore } from '@/lib/gamification-store';
import { useAuthStore } from '@/lib/auth-store';

describe('Learning HUD & Telemetry Suite (DUO-6)', () => {
  beforeEach(() => {
    localStorage.clear();
    useGamificationStore.getState().resetGamification();
    useAuthStore.getState().setUser(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('HUD Items Rendering', () => {
    it('renders all 5 items from store state: brand wordmark, streak pill, joules counter, shield gauge, profile pill', () => {
      act(() => {
        useGamificationStore.getState().setJoules(850);
        useGamificationStore.getState().setShield(100);
        useGamificationStore.getState().incrementStreak();
        useGamificationStore.getState().incrementStreak();
        useGamificationStore.getState().incrementStreak();
        useGamificationStore.getState().incrementStreak(); // 4 days
      });

      render(<LearningHUD />);

      // 1. Brand Wordmark & Route Breadcrumb
      const brandSection = screen.getByTestId('hud-brand-section');
      expect(brandSection).toBeDefined();
      expect(screen.getByText('Q-TRACE')).toBeDefined();
      expect(screen.getByText('learn')).toBeDefined();

      // 2. Streak Pill
      const streakPill = screen.getByTestId('hud-streak-pill');
      expect(streakPill).toBeDefined();
      expect(screen.getByText(/4-Day Streak/i)).toBeDefined();

      // 3. Coherence Joules Counter
      const joulesCounter = screen.getByTestId('hud-joules-counter');
      expect(joulesCounter).toBeDefined();
      expect(screen.getByText(/850 Coherence/i)).toBeDefined();

      // 4. Shield Gauge
      const shieldGauge = screen.getByTestId('hud-shield-gauge');
      expect(shieldGauge).toBeDefined();
      expect(screen.getByText(/100% Shield/i)).toBeDefined();

      // 5. Account Profile Pill
      const profileTrigger = screen.getByTestId('hud-profile-trigger');
      expect(profileTrigger).toBeDefined();
      expect(screen.getByText(/Learner Profile/i)).toBeDefined();
    });
  });

  describe('Streak Pill Day Count', () => {
    it('renders streak pill with correct initial day count (0-Day Streak)', () => {
      render(<LearningHUD />);
      const streakPill = screen.getByTestId('hud-streak-pill');
      expect(streakPill).toBeDefined();
      expect(screen.getByText(/0-Day Streak/i)).toBeDefined();
    });

    it('reactively updates day count when streak is incremented', () => {
      const { rerender } = render(<LearningHUD />);
      expect(screen.getByText(/0-Day Streak/i)).toBeDefined();

      act(() => {
        useGamificationStore.getState().incrementStreak();
        useGamificationStore.getState().incrementStreak();
      });

      rerender(<LearningHUD />);
      expect(screen.getByText(/2-Day Streak/i)).toBeDefined();
    });

    it('applies cryogenic highlight class when streak is 3 or higher', () => {
      render(<LearningHUD />);
      const streakPill = screen.getByTestId('hud-streak-pill');
      expect(streakPill.className).not.toContain('shadow-[0_0_10px');

      act(() => {
        useGamificationStore.getState().incrementStreak();
        useGamificationStore.getState().incrementStreak();
        useGamificationStore.getState().incrementStreak();
      });

      expect(useGamificationStore.getState().streakDays).toBe(3);
      // Streak >= 3 gains the glowing cryogenic border/shadow
      expect(screen.getByTestId('hud-streak-pill').className).toContain('border-amber-500');
    });

    it('toggles freeze-shield tooltip on interaction', () => {
      render(<LearningHUD />);
      const streakPill = screen.getByTestId('hud-streak-pill');

      expect(screen.queryByRole('tooltip')).toBeNull();

      fireEvent.click(streakPill);
      expect(screen.getByRole('tooltip')).toBeDefined();
      expect(screen.getByText(/Freeze Shield Active/i)).toBeDefined();

      fireEvent.click(streakPill);
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  describe('Shield Display Color & Condition Tokens', () => {
    it('renders optimal condition styling when shield >= 50%', () => {
      act(() => {
        useGamificationStore.getState().setShield(100);
      });

      render(<LearningHUD />);
      const shieldGauge = screen.getByTestId('hud-shield-gauge');

      expect(shieldGauge.getAttribute('data-shield-status')).toBe('optimal');
      expect(shieldGauge.className).toContain('shield-optimal');
      expect(shieldGauge.className).not.toContain('shield-amber');
      expect(shieldGauge.className).not.toContain('shield-crimson');
      expect(screen.getByText(/100% Shield/i)).toBeDefined();
    });

    it('changes color and class to amber warning when shield falls below 50%', () => {
      act(() => {
        useGamificationStore.getState().setShield(45);
      });

      render(<LearningHUD />);
      const shieldGauge = screen.getByTestId('hud-shield-gauge');

      expect(shieldGauge.getAttribute('data-shield-status')).toBe('warning');
      expect(shieldGauge.className).toContain('shield-amber');
      expect(shieldGauge.className).toContain('shield-warning');
      expect(shieldGauge.className).toContain('text-amber-700');
      expect(screen.getByText(/45% Shield/i)).toBeDefined();
    });

    it('changes color and class to crimson critical when shield falls below 20%', () => {
      act(() => {
        useGamificationStore.getState().setShield(15);
      });

      render(<LearningHUD />);
      const shieldGauge = screen.getByTestId('hud-shield-gauge');

      expect(shieldGauge.getAttribute('data-shield-status')).toBe('critical');
      expect(shieldGauge.className).toContain('shield-crimson');
      expect(shieldGauge.className).toContain('shield-critical');
      expect(shieldGauge.className).toContain('text-rose-700');
      expect(screen.getByText(/15% Shield/i)).toBeDefined();
    });
  });

  describe('Profile Dropdown & Telemetry Summary', () => {
    it('opens and closes profile dropdown menu on click', () => {
      render(<LearningHUD />);
      const trigger = screen.getByTestId('hud-profile-trigger');

      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByTestId('hud-profile-menu')).toBeNull();

      // Open
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByTestId('hud-profile-menu')).toBeDefined();

      // Close
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByTestId('hud-profile-menu')).toBeNull();
    });

    it('closes profile dropdown when Escape is pressed', () => {
      render(<LearningHUD />);
      const trigger = screen.getByTestId('hud-profile-trigger');

      fireEvent.click(trigger);
      expect(screen.getByTestId('hud-profile-menu')).toBeDefined();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('hud-profile-menu')).toBeNull();
    });

    it('renders calibration telemetry summary, settings link, and sign-out button inside profile menu', () => {
      act(() => {
        useGamificationStore.getState().setJoules(850);
        useGamificationStore.getState().setShield(80);
        useGamificationStore.getState().incrementStreak();
        useGamificationStore.getState().incrementStreak();
      });

      render(<LearningHUD />);
      const trigger = screen.getByTestId('hud-profile-trigger');
      fireEvent.click(trigger);

      const menu = screen.getByTestId('hud-profile-menu');
      expect(menu).toBeDefined();

      // Telemetry Summary
      const telemetry = screen.getByTestId('hud-profile-telemetry');
      expect(telemetry).toBeDefined();
      expect(screen.getByText(/🔥 2d/i)).toBeDefined();
      expect(screen.getByText(/⚡ 850/i)).toBeDefined();
      expect(screen.getByText(/🛡️ 80%/i)).toBeDefined();

      // Settings and Sign Out items
      expect(screen.getByTestId('hud-settings-link')).toBeDefined();
      expect(screen.getByText(/Individual Settings/i)).toBeDefined();
      expect(screen.getByTestId('hud-logout-button')).toBeDefined();
      expect(screen.getByText(/Sign Out/i)).toBeDefined();
    });

    it('displays authenticated user details when available', () => {
      act(() => {
        useAuthStore.getState().setUser({
          id: 'usr_test_123',
          email: 'aarav.sharma@example.edu',
          username: 'aarav_quantum',
          displayName: 'Aarav Sharma',
          accountType: 'INDIVIDUAL',
          personaTag: 'LEARNER',
          isVerified: true,
        });
      });

      render(<LearningHUD />);
      expect(screen.getByText('Aarav Sharma')).toBeDefined();

      const trigger = screen.getByTestId('hud-profile-trigger');
      fireEvent.click(trigger);

      expect(screen.getByText('aarav.sharma@example.edu')).toBeDefined();
      expect(screen.getByText('LEARNER')).toBeDefined();
    });
  });

  describe('Accessibility & Semantics', () => {
    it('verifies HUD is aria-labeled as a banner landmark', () => {
      render(<LearningHUD />);
      const banner = screen.getByRole('banner', { name: /Learning Telemetry HUD/i });
      expect(banner).toBeDefined();
    });

    it('verifies all interactive elements have accessible aria-labels', () => {
      act(() => {
        useGamificationStore.getState().setJoules(500);
        useGamificationStore.getState().setShield(75);
      });

      render(<LearningHUD />);

      expect(screen.getByLabelText(/Q-Trace Learn Home/i)).toBeDefined();
      expect(screen.getByLabelText(/Calibration Streak: 0 days/i)).toBeDefined();
      expect(screen.getByLabelText(/Coherence Joules: 500 Coherence/i)).toBeDefined();
      expect(screen.getByLabelText(/Coherence Shield: 75%/i)).toBeDefined();
      expect(screen.getByLabelText(/Learner Profile Menu/i)).toBeDefined();
    });
  });
});
