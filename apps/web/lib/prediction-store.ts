import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PredictionDraft {
  checkpointId: string;
  answer: string;
  moduleId: string;
  learnerProfileId: string;
  savedAt: string;
}

interface PredictionState {
  drafts: Record<string, PredictionDraft>;
  setPredictionDraft: (
    learnerProfileId: string,
    moduleId: string,
    checkpointId: string,
    answer: string
  ) => void;
  getPredictionDraft: (
    learnerProfileId: string,
    moduleId: string
  ) => PredictionDraft | null;
  clearPredictionDraft: (learnerProfileId: string, moduleId: string) => void;
  resetAllDrafts: () => void;
}

export function getDraftKey(learnerProfileId: string, moduleId: string): string {
  return `${learnerProfileId}:${moduleId}`;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      drafts: {},

      setPredictionDraft: (learnerProfileId, moduleId, checkpointId, answer) => {
        const key = getDraftKey(learnerProfileId, moduleId);
        const draft: PredictionDraft = {
          checkpointId,
          answer,
          moduleId,
          learnerProfileId,
          savedAt: new Date().toISOString(),
        };

        set((state) => ({
          drafts: {
            ...state.drafts,
            [key]: draft,
          },
        }));
      },

      getPredictionDraft: (learnerProfileId, moduleId) => {
        const key = getDraftKey(learnerProfileId, moduleId);
        return get().drafts[key] || null;
      },

      clearPredictionDraft: (learnerProfileId, moduleId) => {
        const key = getDraftKey(learnerProfileId, moduleId);
        set((state) => {
          const next = { ...state.drafts };
          delete next[key];
          return { drafts: next };
        });
      },

      resetAllDrafts: () => {
        set({ drafts: {} });
      },
    }),
    {
      name: 'qtrace-prediction-drafts',
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
