'use client';

import { create } from 'zustand';
import { AuthUser, LoginRequest, SignupRequest } from './auth-types';
import { authClient, DEMO_FALLBACK_USER } from './auth-client';

export interface LoginResult {
  success: boolean;
  mfaRequired?: boolean;
  mfaSessionToken?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginRequest) => Promise<LoginResult>;
  verifyMfa: (code: string, mfaSessionToken?: string) => Promise<boolean>;
  signup: (payload: SignupRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  resendVerification: () => Promise<string>;
  clearError: () => void;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user, isLoading: false }),

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const user = await authClient.getMe();
      set({ user, isLoading: false, error: null });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  login: async (payload: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authClient.login(payload);
      if (res.mfaRequired) {
        set({ isLoading: false });
        return { success: false, mfaRequired: true, mfaSessionToken: res.mfaSessionToken };
      }
      if (res.user) {
        set({ user: res.user, isLoading: false, error: null });
      } else {
        set({ isLoading: false });
      }
      return { success: true };
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  verifyMfa: async (code: string, mfaSessionToken?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authClient.verifyMfa({ code, mfaSessionToken });
      if (res.user) {
        set({ user: res.user, isLoading: false, error: null });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      set({ error: err.message || 'MFA verification failed', isLoading: false });
      throw err;
    }
  },

  signup: async (payload: SignupRequest) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authClient.signup(payload);
      set({ user: res.user, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Signup failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authClient.logout();
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  resendVerification: async () => {
    const user = get().user;
    const res = await authClient.resendVerification(user?.email);
    return res.message;
  },
}));
