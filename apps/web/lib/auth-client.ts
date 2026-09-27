/**
 * Frontend Auth Client for Q-Trace.
 * Enforces credentials: 'include', double-submit CSRF headers, and deterministic DEMO_LOCAL resilience.
 */

import {
  AuthResponse,
  AuthUser,
  InstitutionWaitlistRequest,
  InstitutionWaitlistResponse,
  LoginRequest,
  MfaVerifyRequest,
  SignupRequest,
} from './auth-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)qtrace_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const text = await res.text();
  let json: any = {};
  try {
    json = JSON.parse(text);
  } catch {
    // Non-JSON response
  }

  if (!res.ok) {
    const errorMsg =
      json.error?.message ||
      json.detail?.message ||
      (typeof json.detail === 'string' ? json.detail : null) ||
      `HTTP ${res.status}: ${res.statusText}`;
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    (err as any).code = json.error?.code || json.detail?.code || 'AUTH_ERROR';
    throw err;
  }

  return json as T;
}

// Demo fallback user for offline presentation
export const DEMO_FALLBACK_USER: AuthUser = {
  id: 'usr_aarav',
  email: 'aarav@university.edu',
  username: 'aarav_quantum',
  displayName: 'Aarav Sharma',
  accountType: 'INDIVIDUAL',
  personaTag: 'STUDENT',
  isVerified: false,
  learnerProfileId: 'lp_aarav',
  createdAt: '2026-09-26T06:30:00Z',
};

export const authClient = {
  async signup(payload: SignupRequest): Promise<AuthResponse> {
    try {
      return await authFetch<AuthResponse>('/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if ((err as any).status) throw err;
      // Offline fallback: simulate local registration
      return {
        user: {
          id: `usr_demo_${Date.now().toString(36)}`,
          email: payload.email,
          username: payload.username,
          displayName: payload.displayName,
          accountType: 'INDIVIDUAL',
          personaTag: payload.personaTag,
          isVerified: false,
          learnerProfileId: 'lp_aarav',
        },
        message: 'Account created (Demo offline mode). Soft verification banner active.',
      };
    }
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    try {
      return await authFetch<AuthResponse>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if ((err as any).status) throw err;
      // Offline fallback: allow local test accounts
      if (
        payload.identifier.includes('aarav') ||
        payload.identifier.includes('student') ||
        payload.identifier === 'demo'
      ) {
        return {
          user: DEMO_FALLBACK_USER,
          mfaRequired: false,
          message: 'Logged in as Demo Student',
        };
      }
      throw err;
    }
  },

  async verifyMfa(payload: MfaVerifyRequest): Promise<AuthResponse> {
    return await authFetch<AuthResponse>('/v1/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const data = await authFetch<{ user: AuthUser }>('/v1/auth/me');
      return data.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await authFetch('/v1/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
  },

  async logoutAll(): Promise<void> {
    await authFetch('/v1/auth/logout-all', { method: 'POST' });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await authFetch('/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      return {
        message: 'If that email exists, reset instructions have been dispatched.',
      };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return await authFetch('/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async resendVerification(email?: string): Promise<{ message: string }> {
    try {
      return await authFetch('/v1/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      return { message: 'Verification link resent to your email address.' };
    }
  },

  async submitWaitlist(
    payload: InstitutionWaitlistRequest
  ): Promise<InstitutionWaitlistResponse> {
    try {
      return await authFetch<InstitutionWaitlistResponse>('/v1/waitlist/institutions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if ((err as any).status) throw err;
      return {
        status: 'WAITLISTED',
        waitlistPosition: 42,
        message: `Thank you, ${payload.fullName}. Your institutional request has been priority-queued.`,
      };
    }
  },
};
