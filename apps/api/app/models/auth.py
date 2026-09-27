"""Pydantic entity models and DTO schemas for Q-Trace Authentication & Identity System.
Conforms to docs/AUTH-SYSTEM-DESIGN.md and docs/SCHEMA.md.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


def utc_now_iso() -> str:
    """Return current UTC timestamp in ISO-8601 format without microsecond ambiguity."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def is_expired(expires_at: Optional[str]) -> bool:
    """Safely check if an ISO timestamp string has expired compared to current UTC time."""
    if not expires_at:
        return True
    try:
        clean_ts = expires_at.strip().replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_ts)
        now = datetime.now(timezone.utc)
        return dt < now
    except Exception:
        return True


# --- User & Account Enums ---

AccountType = Literal["INDIVIDUAL", "INSTITUTION"]
PersonaTag = Literal["LEARNER", "STUDENT", "EDUCATOR", "ORGANIZATION"]
RefreshTokenStatus = Literal["ACTIVE", "USED", "REVOKED"]
WaitlistStatus = Literal["PENDING_REVIEW", "PRIORITY_QUEUED", "APPROVED", "REJECTED"]


# --- Sub-schemas ---

class MfaSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    enabled: bool = False
    totpSecret: Optional[str] = None
    backupCodes: list[str] = Field(default_factory=list)


class LockoutState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    failedAttempts: int = 0
    lockedUntil: Optional[str] = None


# --- Core Entities ---

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(alias="_id", default="")
    email: str
    username: str
    displayName: str
    passwordHash: str
    accountType: AccountType = "INDIVIDUAL"
    personaTag: PersonaTag = "LEARNER"
    isVerified: bool = False
    verificationTokenHash: Optional[str] = None
    verificationExpiresAt: Optional[str] = None
    githubId: Optional[str] = None
    githubUsername: Optional[str] = None
    avatarUrl: Optional[str] = None
    mfa: MfaSettings = Field(default_factory=MfaSettings)
    lockout: LockoutState = Field(default_factory=LockoutState)
    learnerProfileId: Optional[str] = None
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=utc_now_iso)
    updatedAt: str = Field(default_factory=utc_now_iso)

    def to_public_dict(self) -> dict[str, Any]:
        """Convert to sanitized dictionary safe for API responses."""
        uid = self.id or getattr(self, "_id", "")
        return {
            "id": uid,
            "email": self.email,
            "username": self.username,
            "displayName": self.displayName,
            "accountType": self.accountType,
            "personaTag": self.personaTag,
            "isVerified": self.isVerified,
            "avatarUrl": self.avatarUrl,
            "learnerProfileId": self.learnerProfileId,
            "mfaEnabled": self.mfa.enabled,
            "createdAt": self.createdAt,
        }


class RefreshTokenRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(alias="_id", default="")
    tokenHash: str
    userId: str
    familyId: str
    status: RefreshTokenStatus = "ACTIVE"
    userAgent: Optional[str] = None
    ipAddress: Optional[str] = None
    expiresAt: str
    createdAt: str = Field(default_factory=utc_now_iso)


class PasswordResetRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(alias="_id", default="")
    tokenHash: str
    userId: str
    used: bool = False
    expiresAt: str
    createdAt: str = Field(default_factory=utc_now_iso)


class InstitutionWaitlistRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(alias="_id", default="")
    fullName: str
    workEmail: str
    institutionName: str
    role: str
    expectedStudents: int
    notes: Optional[str] = None
    status: WaitlistStatus = "PENDING_REVIEW"
    waitlistPosition: int = 1
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=utc_now_iso)


# --- Request DTOs ---

class SignupRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    username: str
    displayName: str
    password: str
    personaTag: PersonaTag = "LEARNER"


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    identifier: str  # Email or username
    password: str


class ForgotPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    token: str
    newPassword: str


class ResendVerificationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: Optional[EmailStr] = None


class MfaVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str
    mfaSessionToken: Optional[str] = None


class InstitutionWaitlistRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    fullName: str
    workEmail: EmailStr
    institutionName: str
    role: str
    expectedStudents: int = 50
    notes: Optional[str] = None
