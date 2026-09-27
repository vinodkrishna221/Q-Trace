import { describe, it, expect, beforeEach } from 'vitest';
import {
  useGamificationStore,
  GAMIFICATION_STORAGE_KEY,
  INITIAL_COHERENCE_SHIELD,
  INITIAL_COHERENCE_JOULES,
  INITIAL_STREAK_DAYS,
  DEFAULT_DECOHERENCE_PENALTY,
  DEFAULT_SHIELD_RESTORE,
} from '@/lib/gamification-store';

describe('GamificationStore Suite (DUO-5)', () => {
  beforeEach(() => {
    localStorage.clear();
    useGamificationStore.getState().resetGamification();
  });

  describe('Initial State', () => {
    it('verifies initial state is correct (100% shield, 0 joules, 0 streak)', () => {
      const state = useGamificationStore.getState();

      expect(state.coherenceShield).toBe(INITIAL_COHERENCE_SHIELD);
      expect(state.coherenceShield).toBe(100);
      expect(state.coherenceJoules).toBe(INITIAL_COHERENCE_JOULES);
      expect(state.coherenceJoules).toBe(0);
      expect(state.streakDays).toBe(INITIAL_STREAK_DAYS);
      expect(state.streakDays).toBe(0);
      expect(state.lastActiveDate).toBeNull();
    });
  });

  describe('Decoherence Penalty & Shield Clamping', () => {
    it('applies default decoherence penalty (-20%) correctly', () => {
      expect(useGamificationStore.getState().coherenceShield).toBe(100);

      useGamificationStore.getState().applyDecoherencePenalty();

      expect(useGamificationStore.getState().coherenceShield).toBe(100 - DEFAULT_DECOHERENCE_PENALTY);
      expect(useGamificationStore.getState().coherenceShield).toBe(80);
    });

    it('applies custom decoherence penalty percentage correctly', () => {
      useGamificationStore.getState().applyDecoherencePenalty(35);
      expect(useGamificationStore.getState().coherenceShield).toBe(65);

      useGamificationStore.getState().applyDecoherencePenalty(15);
      expect(useGamificationStore.getState().coherenceShield).toBe(50);
    });

    it('ensures coherence shield cannot drop below 0%', () => {
      // 100 -> 80 -> 60 -> 40 -> 20 -> 0 -> clamps at 0
      useGamificationStore.getState().applyDecoherencePenalty(50);
      expect(useGamificationStore.getState().coherenceShield).toBe(50);

      useGamificationStore.getState().applyDecoherencePenalty(40);
      expect(useGamificationStore.getState().coherenceShield).toBe(10);

      useGamificationStore.getState().applyDecoherencePenalty(25);
      expect(useGamificationStore.getState().coherenceShield).toBe(0);

      // Extra penalty while at 0%
      useGamificationStore.getState().applyDecoherencePenalty(50);
      expect(useGamificationStore.getState().coherenceShield).toBe(0);
    });

    it('handles negative penalty values gracefully (no inadvertent healing)', () => {
      useGamificationStore.getState().applyDecoherencePenalty(-20);
      expect(useGamificationStore.getState().coherenceShield).toBe(100);
    });
  });

  describe('Shield Restoration & Clamping', () => {
    it('applies default practice shield restore (+15%) correctly', () => {
      useGamificationStore.getState().applyDecoherencePenalty(40); // 60%
      expect(useGamificationStore.getState().coherenceShield).toBe(60);

      useGamificationStore.getState().restoreShield();
      expect(useGamificationStore.getState().coherenceShield).toBe(60 + DEFAULT_SHIELD_RESTORE);
      expect(useGamificationStore.getState().coherenceShield).toBe(75);
    });

    it('applies custom practice shield restore percentage correctly', () => {
      useGamificationStore.getState().applyDecoherencePenalty(50); // 50%
      expect(useGamificationStore.getState().coherenceShield).toBe(50);

      useGamificationStore.getState().restoreShield(30);
      expect(useGamificationStore.getState().coherenceShield).toBe(80);
    });

    it('ensures coherence shield cannot exceed 100%', () => {
      useGamificationStore.getState().applyDecoherencePenalty(10); // 90%
      expect(useGamificationStore.getState().coherenceShield).toBe(90);

      useGamificationStore.getState().restoreShield(15); // 90 + 15 = 105 -> clamps at 100
      expect(useGamificationStore.getState().coherenceShield).toBe(100);

      // Extra restore when already at 100%
      useGamificationStore.getState().restoreShield(50);
      expect(useGamificationStore.getState().coherenceShield).toBe(100);
    });
  });

  describe('XP / Joules Awarding', () => {
    it('awards XP and increments coherenceJoules correctly', () => {
      expect(useGamificationStore.getState().coherenceJoules).toBe(0);

      // Curriculum stage awards: +30 concept, +50 gate lab, +100 boss
      useGamificationStore.getState().awardXP(30);
      expect(useGamificationStore.getState().coherenceJoules).toBe(30);

      useGamificationStore.getState().awardXP(50);
      expect(useGamificationStore.getState().coherenceJoules).toBe(80);

      useGamificationStore.getState().awardXP(100);
      expect(useGamificationStore.getState().coherenceJoules).toBe(180);
    });

    it('ignores non-positive XP awards', () => {
      useGamificationStore.getState().awardXP(50);
      expect(useGamificationStore.getState().coherenceJoules).toBe(50);

      useGamificationStore.getState().awardXP(0);
      expect(useGamificationStore.getState().coherenceJoules).toBe(50);

      useGamificationStore.getState().awardXP(-25);
      expect(useGamificationStore.getState().coherenceJoules).toBe(50);
    });
  });

  describe('Streak Tracking', () => {
    it('increments streak and records current active date', () => {
      expect(useGamificationStore.getState().streakDays).toBe(0);
      expect(useGamificationStore.getState().lastActiveDate).toBeNull();

      useGamificationStore.getState().incrementStreak();
      expect(useGamificationStore.getState().streakDays).toBe(1);
      expect(useGamificationStore.getState().lastActiveDate).toBe(new Date().toISOString().split('T')[0]);

      useGamificationStore.getState().incrementStreak();
      expect(useGamificationStore.getState().streakDays).toBe(2);
    });

    it('resets streak to 0', () => {
      useGamificationStore.getState().incrementStreak();
      useGamificationStore.getState().incrementStreak();
      expect(useGamificationStore.getState().streakDays).toBe(2);

      useGamificationStore.getState().resetStreak();
      expect(useGamificationStore.getState().streakDays).toBe(0);
    });
  });

  describe('Helper Setters & Reset', () => {
    it('setShield clamps correctly between 0 and 100', () => {
      useGamificationStore.getState().setShield(45);
      expect(useGamificationStore.getState().coherenceShield).toBe(45);

      useGamificationStore.getState().setShield(150);
      expect(useGamificationStore.getState().coherenceShield).toBe(100);

      useGamificationStore.getState().setShield(-20);
      expect(useGamificationStore.getState().coherenceShield).toBe(0);
    });

    it('setJoules clamps correctly to non-negative values', () => {
      useGamificationStore.getState().setJoules(850);
      expect(useGamificationStore.getState().coherenceJoules).toBe(850);

      useGamificationStore.getState().setJoules(-50);
      expect(useGamificationStore.getState().coherenceJoules).toBe(0);
    });

    it('resetGamification restores full initial state', () => {
      useGamificationStore.getState().awardXP(300);
      useGamificationStore.getState().applyDecoherencePenalty(40);
      useGamificationStore.getState().incrementStreak();

      expect(useGamificationStore.getState().coherenceJoules).toBe(300);
      expect(useGamificationStore.getState().coherenceShield).toBe(60);
      expect(useGamificationStore.getState().streakDays).toBe(1);

      useGamificationStore.getState().resetGamification();

      expect(useGamificationStore.getState().coherenceJoules).toBe(0);
      expect(useGamificationStore.getState().coherenceShield).toBe(100);
      expect(useGamificationStore.getState().streakDays).toBe(0);
      expect(useGamificationStore.getState().lastActiveDate).toBeNull();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('round-trips state updates through localStorage correctly', () => {
      useGamificationStore.getState().awardXP(250);
      useGamificationStore.getState().applyDecoherencePenalty(20);
      useGamificationStore.getState().incrementStreak();

      const raw = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!);
      expect(parsed.state).toBeDefined();
      expect(parsed.state.coherenceJoules).toBe(250);
      expect(parsed.state.coherenceShield).toBe(80);
      expect(parsed.state.streakDays).toBe(1);
      expect(parsed.state.lastActiveDate).toBe(new Date().toISOString().split('T')[0]);
    });
  });
});
