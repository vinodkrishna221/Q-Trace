import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const GAMIFICATION_STORAGE_KEY = 'qtrace-gamification';
export const DEFAULT_DECOHERENCE_PENALTY = 20;
export const DEFAULT_SHIELD_RESTORE = 15;
export const INITIAL_COHERENCE_SHIELD = 100;
export const INITIAL_COHERENCE_JOULES = 0;
export const INITIAL_STREAK_DAYS = 0;

export interface GamificationState {
  coherenceJoules: number;
  coherenceShield: number;
  streakDays: number;
  lastActiveDate: string | null;

  awardXP: (amount: number) => void;
  applyDecoherencePenalty: (percentage?: number) => void;
  restoreShield: (percentage?: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  setShield: (percentage: number) => void;
  setJoules: (amount: number) => void;
  resetGamification: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set) => ({
      coherenceJoules: INITIAL_COHERENCE_JOULES,
      coherenceShield: INITIAL_COHERENCE_SHIELD,
      streakDays: INITIAL_STREAK_DAYS,
      lastActiveDate: null,

      awardXP: (amount: number) => {
        if (amount <= 0) return;
        set((state) => ({
          coherenceJoules: state.coherenceJoules + Math.round(amount),
        }));
      },

      applyDecoherencePenalty: (percentage = DEFAULT_DECOHERENCE_PENALTY) => {
        const penalty = Math.max(0, percentage);
        set((state) => ({
          coherenceShield: Math.max(0, state.coherenceShield - penalty),
        }));
      },

      restoreShield: (percentage = DEFAULT_SHIELD_RESTORE) => {
        const restore = Math.max(0, percentage);
        set((state) => ({
          coherenceShield: Math.min(100, state.coherenceShield + restore),
        }));
      },

      incrementStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          streakDays: state.streakDays + 1,
          lastActiveDate: today,
        }));
      },

      resetStreak: () => {
        set({ streakDays: 0 });
      },

      setShield: (percentage: number) => {
        set({
          coherenceShield: Math.max(0, Math.min(100, Math.round(percentage))),
        });
      },

      setJoules: (amount: number) => {
        set({
          coherenceJoules: Math.max(0, Math.round(amount)),
        });
      },

      resetGamification: () => {
        set({
          coherenceJoules: INITIAL_COHERENCE_JOULES,
          coherenceShield: INITIAL_COHERENCE_SHIELD,
          streakDays: INITIAL_STREAK_DAYS,
          lastActiveDate: null,
        });
      },
    }),
    {
      name: GAMIFICATION_STORAGE_KEY,
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
