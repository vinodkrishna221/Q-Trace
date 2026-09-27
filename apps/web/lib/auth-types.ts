/**
 * Authentication & Identity TypeScript contracts.
 * Matches docs/AUTH-SYSTEM-DESIGN.md.
 */

export type AccountType = 'INDIVIDUAL' | 'INSTITUTION';
export type PersonaTag = 'LEARNER' | 'STUDENT' | 'EDUCATOR' | 'ORGANIZATION';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  accountType: AccountType;
  personaTag: PersonaTag;
  isVerified: boolean;
  avatarUrl?: string | null;
  learnerProfileId?: string | null;
  mfaEnabled?: boolean;
  createdAt?: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
  personaTag: PersonaTag;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  mfaRequired?: boolean;
  mfaSessionToken?: string;
}

export interface MfaVerifyRequest {
  code: string;
  mfaSessionToken?: string;
}

export interface InstitutionWaitlistRequest {
  fullName: string;
  workEmail: string;
  institutionName: string;
  role: string;
  expectedStudents: number;
  notes?: string;
}

export interface InstitutionWaitlistResponse {
  status: string;
  waitlistPosition: number;
  message: string;
}
