"""Authentication & Identity Router for Q-Trace.
Implements API contracts from docs/AUTH-SYSTEM-DESIGN.md Section 6.
"""

from __future__ import annotations

import base64
import logging
import os
import secrets
import time
import uuid
from typing import Optional
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse

from app.core.auth import (
    create_access_token,
    create_mfa_session_token,
    decode_access_token,
    decode_mfa_session_token,
    generate_secure_token,
    hash_token,
)
from app.core.password import hash_password, verify_password
from app.core.rate_limit import brute_force_guard, rate_limiter
from app.core.security import (
    ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    clear_auth_cookies,
    get_client_ip,
    get_current_user_token,
    set_auth_cookies,
    verify_csrf_token,
)
from app.models.auth import (
    ForgotPasswordRequest,
    InstitutionWaitlistRecord,
    InstitutionWaitlistRequest,
    LoginRequest,
    MfaVerifyRequest,
    PasswordResetRecord,
    RefreshTokenRecord,
    ResetPasswordRequest,
    SignupRequest,
    User,
    is_expired,
    utc_now_iso,
)
from app.models.entities import LearnerProfile, LearningPath, PriorKnowledge
from app.repositories import get_repository
from app.repositories.base import DataRepositoryProtocol
from app.services.email_service import email_service
from app.services.oauth_github import github_oauth_service
from app.services.totp_service import totp_service

logger = logging.getLogger("qtrace.routers.auth")

router = APIRouter(prefix="/v1/auth", tags=["auth"])

APP_URL = (os.getenv("APP_URL") or os.getenv("WEB_ORIGIN") or "http://localhost:3000").rstrip("/")


def get_frontend_url(request: Request) -> str:
    """Resolve the frontend application base URL dynamically."""
    env_app_url = (os.getenv("APP_URL") or os.getenv("WEB_ORIGIN") or "").strip()
    if env_app_url and "localhost" not in env_app_url:
        return env_app_url.rstrip("/")

    origin = request.headers.get("origin")
    if origin and not origin.startswith("chrome-extension://"):
        return origin.rstrip("/")

    referer = request.headers.get("referer")
    if referer:
        try:
            parsed = urlparse(referer)
            if parsed.scheme and parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            pass

    return (env_app_url or "http://localhost:3000").rstrip("/")


def encode_oauth_state(origin: str) -> str:
    """Encode nonce and origin domain into OAuth state parameter."""
    nonce = secrets.token_urlsafe(12)
    raw = f"{nonce}|{origin}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def decode_oauth_state(state: Optional[str]) -> Optional[str]:
    """Decode and extract origin domain from OAuth state parameter."""
    if not state:
        return None
    try:
        decoded = base64.urlsafe_b64decode(state.encode()).decode()
        if "|" in decoded:
            _, origin = decoded.split("|", 1)
            return origin
    except Exception:
        pass
    return None


# --- Authentication Dependencies ---

async def get_current_user(
    request: Request,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> User:
    """Dependency that requires a valid, authenticated user session."""
    payload = get_current_user_token(request)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Authentication session required"},
        )
    user_id = payload.get("sub")
    user = await repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "USER_NOT_FOUND", "message": "User account no longer exists"},
        )
    return user


async def get_optional_user(
    request: Request,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> Optional[User]:
    """Dependency that extracts user if authenticated, but does not error if unauthenticated."""
    payload = get_current_user_token(request)
    if not payload:
        return None
    user_id = payload.get("sub")
    return await repo.get_user_by_id(user_id)


# --- Route Handlers ---

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(
    payload: SignupRequest,
    request: Request,
    response: Response,
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Register a new individual user (Learner, Student, or Educator)."""
    # 1. CSRF check on mutating requests
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    # 2. Rate limiting check (3 signups per hour per IP per docs/AUTH-SYSTEM-DESIGN.md Section 6.1)
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"signup:{client_ip}", max_requests=3, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many signup requests. Please try again later."},
        )

    # 3. Input validation
    if len(payload.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "WEAK_PASSWORD", "message": "Password must be at least 8 characters long."},
        )

    clean_email = payload.email.strip().lower()
    clean_username = payload.username.strip().lower()

    if len(clean_username) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "INVALID_USERNAME", "message": "Username must be at least 3 characters."},
        )

    # 4. Check uniqueness
    existing_email = await repo.get_user_by_email(clean_email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "EMAIL_TAKEN", "message": "Email is already registered."},
        )

    existing_username = await repo.get_user_by_username(clean_username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "USERNAME_TAKEN", "message": "Username is already registered."},
        )

    # 5. Cryptographic hash with Argon2id
    password_hash = hash_password(payload.password)
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    learner_profile_id = f"lp_{user_id}"

    # 6. Verification token (24-hour expiration)
    raw_verify_token = generate_secure_token(32)
    verify_token_hash = hash_token(raw_verify_token)
    verify_expires_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 86400))

    # 7. Create User
    new_user = User(
        _id=user_id,
        email=clean_email,
        username=clean_username,
        displayName=payload.displayName.strip(),
        passwordHash=password_hash,
        accountType="INDIVIDUAL",
        personaTag=payload.personaTag,
        isVerified=False,
        verificationTokenHash=verify_token_hash,
        verificationExpiresAt=verify_expires_at,
        learnerProfileId=learner_profile_id,
        createdAt=utc_now_iso(),
        updatedAt=utc_now_iso(),
    )
    await repo.create_or_update_user(new_user)

    # 8. Auto-provision LearnerProfile & LearningPath for individuals
    role_type = "PHYSICS_TO_CODE" if payload.personaTag == "STUDENT" else "BEGINNER_CSE"
    await repo.create_or_update_learner_profile(
        LearnerProfile(
            id=learner_profile_id,
            displayName=payload.displayName.strip(),
            role=role_type,
            cohortId="cohort_general",
            priorKnowledge=PriorKnowledge(
                python=True,
                linearAlgebra=(payload.personaTag == "STUDENT"),
                quantumTheory=False,
                circuitProgramming=False,
            ),
            completedSkillIds=[],
            activeLearningPathId=f"path_{user_id}",
        )
    )

    # 9. Email dispatch (non-blocking / local fallback)
    frontend_url = get_frontend_url(request)
    await email_service.send_verification_email(
        to_email=clean_email,
        token=raw_verify_token,
        user_name=payload.displayName.strip(),
        app_url=frontend_url,
    )

    # 10. Issue tokens and HttpOnly SameSite=Lax cookies
    access_token = create_access_token(
        user_id=user_id,
        email=clean_email,
        username=clean_username,
        role="INDIVIDUAL",
        persona=payload.personaTag,
    )
    raw_refresh_token = generate_secure_token(32)
    refresh_record = RefreshTokenRecord(
        _id=f"rtk_{uuid.uuid4().hex[:12]}",
        tokenHash=hash_token(raw_refresh_token),
        userId=user_id,
        familyId=f"fam_{uuid.uuid4().hex[:12]}",
        status="ACTIVE",
        expiresAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + (7 * 86400))),
    )
    await repo.create_refresh_token(refresh_record)

    set_auth_cookies(response, access_token=access_token, refresh_token=raw_refresh_token)

    return {
        "user": new_user.to_public_dict(),
        "accessToken": access_token,
        "refreshToken": raw_refresh_token,
        "message": "Account created. Soft access granted. Verification email dispatched.",
    }


@router.post("/login")
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Authenticate with Email or Username + Password."""
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    identifier = payload.identifier.strip()

    # 1. Check brute force lockout
    remaining_lock_seconds = await brute_force_guard.check_lockout(identifier)
    if remaining_lock_seconds:
        mins = max(1, remaining_lock_seconds // 60)
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail={
                "code": "ACCOUNT_LOCKED",
                "message": f"Account locked for {mins} minutes due to consecutive failed attempts.",
            },
        )

    # 2. IP Rate limiting (5 / min / IP per docs/AUTH-SYSTEM-DESIGN.md Section 6.1)
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"login:{client_ip}", max_requests=5, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many login attempts. Please wait a minute before retrying."},
        )

    # 3. Lookup user by email OR username
    user = await repo.get_user_by_identifier(identifier)
    if not user:
        failed_count, is_locked = await brute_force_guard.record_failure(identifier)
        if is_locked:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail={"code": "ACCOUNT_LOCKED", "message": "Account locked for 15 minutes due to consecutive failures."},
            )
        remaining_attempts = max(0, 5 - failed_count)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": f"Invalid credentials. {remaining_attempts} attempt{'s' if remaining_attempts != 1 else ''} remaining.",
            },
        )

    # 3. Verify Argon2id password
    is_valid = verify_password(payload.password, user.passwordHash)
    if not is_valid:
        failed_count, is_locked = await brute_force_guard.record_failure(identifier)
        if is_locked:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail={"code": "ACCOUNT_LOCKED", "message": "Account locked for 15 minutes due to consecutive failures."},
            )
        remaining_attempts = max(0, 5 - failed_count)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": f"Invalid credentials. {remaining_attempts} attempt{'s' if remaining_attempts != 1 else ''} remaining.",
            },
        )

    # 4. Successful password - reset failure counters
    await brute_force_guard.reset(identifier)

    # 5. Check if TOTP 2FA required
    if user.mfa.enabled and user.mfa.totpSecret:
        mfa_session_token = create_mfa_session_token(user.id)
        return {
            "mfaRequired": True,
            "mfaSessionToken": mfa_session_token,
            "message": "Enter your two-factor authentication code to complete sign-in.",
        }

    # 6. Issue Access Token + Refresh Token
    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        username=user.username,
        role=user.accountType,
        persona=user.personaTag,
    )
    raw_refresh_token = generate_secure_token(32)
    refresh_record = RefreshTokenRecord(
        _id=f"rtk_{uuid.uuid4().hex[:12]}",
        tokenHash=hash_token(raw_refresh_token),
        userId=user.id,
        familyId=f"fam_{uuid.uuid4().hex[:12]}",
        status="ACTIVE",
        expiresAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + (7 * 86400))),
    )
    await repo.create_refresh_token(refresh_record)

    set_auth_cookies(response, access_token=access_token, refresh_token=raw_refresh_token)

    return {
        "user": user.to_public_dict(),
        "accessToken": access_token,
        "refreshToken": raw_refresh_token,
        "mfaRequired": False,
        "message": "Login successful",
    }


@router.post("/refresh")
async def refresh_tokens(
    request: Request,
    response: Response,
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Rotate refresh token & issue new access token with anti-replay detection."""
    # 1. CSRF verification
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    # 2. Rate limit (20 / min per docs/AUTH-SYSTEM-DESIGN.md Section 6.1)
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"refresh:{client_ip}", max_requests=20, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many refresh requests. Please wait."},
        )

    raw_refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not raw_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "NO_REFRESH_TOKEN", "message": "No refresh token provided in cookies."},
        )

    token_hash = hash_token(raw_refresh_token)
    outcome, record = await repo.consume_refresh_token(token_hash)

    if outcome == "NOT_FOUND":
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_REFRESH_TOKEN", "message": "Session expired or invalid. Please log in."},
        )

    if outcome == "REPLAY":
        if record:
            await repo.revoke_refresh_token_family(record.familyId)
            logger.warning(
                "REPLAY BREACH DETECTED: Family %s for user %s revoked completely.",
                record.familyId,
                record.userId,
            )
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "REPLAY_DETECTED",
                "message": "Security alert: Session invalidated due to rotated token reuse. Please log in again.",
            },
        )

    if outcome == "EXPIRED":
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "REFRESH_EXPIRED", "message": "Session expired. Please log in."},
        )

    # Valid ACTIVE refresh token consumed atomically -> Rotate!
    assert record is not None
    user = await repo.get_user_by_id(record.userId)
    if not user:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "USER_NOT_FOUND", "message": "User no longer exists."},
        )

    new_access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        username=user.username,
        role=user.accountType,
        persona=user.personaTag,
    )
    new_raw_refresh = generate_secure_token(32)
    new_refresh_record = RefreshTokenRecord(
        _id=f"rtk_{uuid.uuid4().hex[:12]}",
        tokenHash=hash_token(new_raw_refresh),
        userId=user.id,
        familyId=record.familyId,  # Preserves family across rotations
        status="ACTIVE",
        expiresAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + (7 * 86400))),
    )
    await repo.create_refresh_token(new_refresh_record)

    set_auth_cookies(response, access_token=new_access_token, refresh_token=new_raw_refresh)

    return {
        "status": "refreshed",
        "user": user.to_public_dict(),
    }


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Revoke current session and clear cookies."""
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    raw_refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_refresh_token:
        token_hash = hash_token(raw_refresh_token)
        record = await repo.get_refresh_token_by_hash(token_hash)
        if record:
            await repo.update_refresh_token_status(record.id, "REVOKED")

    clear_auth_cookies(response)
    return {"message": "Logged out successfully."}


@router.post("/logout-all")
async def logout_all(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Revoke all active sessions on all devices for the current user."""
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    # Rate limit: 5 / min / user
    if await rate_limiter.is_rate_limited(f"logout_all:{current_user.id}", max_requests=5, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please wait a minute."},
        )

    revoked_count = await repo.revoke_all_user_refresh_tokens(current_user.id)
    clear_auth_cookies(response)
    return {"message": f"Successfully terminated {revoked_count} active sessions."}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Fetch authenticated profile & persona for currently active user."""
    return {"user": current_user.to_public_dict()}


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Request a single-use password recovery email.
    Always returns 200 to prevent user enumeration attacks.
    """
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    # Rate limiting: 3 / 15m / IP per docs/AUTH-SYSTEM-DESIGN.md Section 6.1
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"forgot:{client_ip}", max_requests=3, window_seconds=900):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many password reset requests. Please try again later."},
        )

    clean_email = payload.email.strip().lower()
    user = await repo.get_user_by_email(clean_email)
    if user:
        raw_token = generate_secure_token(32)
        token_hash = hash_token(raw_token)
        expires_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 900))  # 15 mins

        reset_record = PasswordResetRecord(
            _id=f"rst_{uuid.uuid4().hex[:12]}",
            tokenHash=token_hash,
            userId=user.id,
            used=False,
            expiresAt=expires_at,
        )
        await repo.create_password_reset(reset_record)
        frontend_url = get_frontend_url(request)
        await email_service.send_password_reset_email(to_email=clean_email, token=raw_token, app_url=frontend_url)

    return {"message": "If that email exists, reset instructions have been dispatched."}


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Reset password using email recovery token."""
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    # Rate limiting: 5 / 15m / IP per docs/AUTH-SYSTEM-DESIGN.md Section 6.1
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"reset:{client_ip}", max_requests=5, window_seconds=900):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many reset attempts. Please wait."},
        )

    if len(payload.newPassword) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "WEAK_PASSWORD", "message": "Password must be at least 8 characters long."},
        )

    token_hash = hash_token(payload.token.strip())
    reset_record = await repo.get_password_reset_by_hash(token_hash)

    if not reset_record or reset_record.used or is_expired(reset_record.expiresAt):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_RESET_TOKEN", "message": "Reset link expired or already used."},
        )

    # 1. Update password
    user = await repo.get_user_by_id(reset_record.userId)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "USER_NOT_FOUND", "message": "Account no longer exists."},
        )

    user.passwordHash = hash_password(payload.newPassword)
    await repo.create_or_update_user(user)

    # 2. Mark token used
    await repo.mark_password_reset_used(reset_record.id)

    # 3. Invalidate ALL existing refresh tokens (kill sessions)
    await repo.revoke_all_user_refresh_tokens(user.id)

    return {"message": "Password updated successfully. Please log in with your new password."}


@router.get("/verify-email")
async def verify_email(
    request: Request,
    token: str = Query(...),
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Confirm user email address via token link."""
    frontend_url = get_frontend_url(request)
    token_hash = hash_token(token.strip())
    target_user = await repo.get_user_by_verification_token_hash(token_hash)

    is_json = (
        "application/json" in request.headers.get("accept", "").lower()
        or request.headers.get("x-requested-with") == "XMLHttpRequest"
    )

    if not target_user or is_expired(target_user.verificationExpiresAt):
        if is_json:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_VERIFICATION_TOKEN", "message": "Verification link has expired or is invalid."},
            )
        return RedirectResponse(url=f"{frontend_url}/verify-email?token_error=invalid_or_expired")

    target_user.isVerified = True
    target_user.verificationTokenHash = None
    target_user.verificationExpiresAt = None
    await repo.create_or_update_user(target_user)

    if is_json:
        return {"verified": True, "message": "Email address verified successfully."}

    return RedirectResponse(url=f"{frontend_url}/learn?email_verified=true")


@router.post("/resend-verification")
async def resend_verification(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_user),
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Resend email verification link."""
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    user = current_user
    if not user:
        try:
            body = await request.json()
            email = body.get("email", "").strip().lower()
            if email:
                user = await repo.get_user_by_email(email)
        except Exception:
            pass

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "USER_REQUIRED", "message": "Specify user email or provide active session."},
        )

    # Rate limiting: 2 / 10m / User (or IP) per docs/AUTH-SYSTEM-DESIGN.md Section 6.1 & 9
    client_ip = get_client_ip(request)
    limit_key = f"resend_verify:{user.id or client_ip}"
    if await rate_limiter.is_rate_limited(limit_key, max_requests=2, window_seconds=600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many verification requests. Please wait a few minutes."},
        )

    if user.isVerified:
        return {"message": "Email is already verified."}

    raw_verify_token = generate_secure_token(32)
    user.verificationTokenHash = hash_token(raw_verify_token)
    user.verificationExpiresAt = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 86400))
    await repo.create_or_update_user(user)

    frontend_url = get_frontend_url(request)
    await email_service.send_verification_email(
        to_email=user.email,
        token=raw_verify_token,
        user_name=user.displayName,
        app_url=frontend_url,
    )

    return {"message": f"Verification email dispatched to {user.email}."}


# --- GitHub OAuth 2.0 Endpoints ---

@router.get("/github/login")
async def github_login(
    request: Request,
    origin: Optional[str] = Query(None),
):
    """Initiate GitHub OAuth 2.0 authorization."""
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"gh_login:{client_ip}", max_requests=10, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please wait a minute."},
        )
    frontend_url = origin or get_frontend_url(request)
    state = encode_oauth_state(frontend_url)
    auth_url = github_oauth_service.get_authorization_url(state=state)
    return RedirectResponse(url=auth_url)


@router.get("/github/callback")
async def github_callback(
    request: Request,
    response: Response,
    code: str = Query(...),
    state: Optional[str] = Query(None),
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Handle GitHub OAuth authorization code exchange."""
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"gh_cb:{client_ip}", max_requests=10, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please wait a minute."},
        )
    target_origin = (decode_oauth_state(state) or get_frontend_url(request)).rstrip("/")
    try:
        gh_user = await github_oauth_service.exchange_code_for_user(code)
    except Exception as exc:
        logger.error("GitHub OAuth exchange failed: %s", exc)
        return RedirectResponse(url=f"{target_origin}/login?oauth_error=exchange_failed")

    # 1. Find user by githubId or email
    user = await repo.get_user_by_github_id(gh_user["githubId"])
    if not user:
        user = await repo.get_user_by_email(gh_user["email"])

    if user:
        # Existing user - update GitHub ID and avatar
        user.githubId = gh_user["githubId"]
        user.githubUsername = gh_user["username"]
        if gh_user.get("avatarUrl"):
            user.avatarUrl = gh_user["avatarUrl"]
        await repo.create_or_update_user(user)
    else:
        # New user - auto create individual account
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        learner_profile_id = f"lp_{user_id}"
        user = User(
            _id=user_id,
            email=gh_user["email"],
            username=gh_user["username"],
            displayName=gh_user["displayName"],
            passwordHash="",  # OAuth only, no local password initially
            accountType="INDIVIDUAL",
            personaTag="LEARNER",
            isVerified=True,  # GitHub verified
            githubId=gh_user["githubId"],
            githubUsername=gh_user["username"],
            avatarUrl=gh_user.get("avatarUrl"),
            learnerProfileId=learner_profile_id,
            createdAt=utc_now_iso(),
            updatedAt=utc_now_iso(),
        )
        await repo.create_or_update_user(user)
        # Create learner profile
        await repo.create_or_update_learner_profile(
            LearnerProfile(
                id=learner_profile_id,
                displayName=user.displayName,
                role="BEGINNER_CSE",
                cohortId="cohort_general",
                priorKnowledge=PriorKnowledge(python=True),
                completedSkillIds=[],
                activeLearningPathId=f"path_{user_id}",
            )
        )

    # Issue tokens & cookies
    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        username=user.username,
        role=user.accountType,
        persona=user.personaTag,
    )
    raw_refresh = generate_secure_token(32)
    refresh_record = RefreshTokenRecord(
        _id=f"rtk_{uuid.uuid4().hex[:12]}",
        tokenHash=hash_token(raw_refresh),
        userId=user.id,
        familyId=f"fam_{uuid.uuid4().hex[:12]}",
        status="ACTIVE",
        expiresAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + (7 * 86400))),
    )
    await repo.create_refresh_token(refresh_record)

    redir = RedirectResponse(url=f"{target_origin}/learn?oauth_token={access_token}", status_code=status.HTTP_302_FOUND)
    set_auth_cookies(redir, access_token=access_token, refresh_token=raw_refresh)
    return redir


# --- TOTP 2FA Endpoints ---

@router.post("/mfa/setup")
async def mfa_setup(
    request: Request,
    current_user: User = Depends(get_current_user),
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Generate TOTP secret and setup URI for Google Authenticator / 1Password."""
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    # Rate limiting: 3 / 10m per user
    if await rate_limiter.is_rate_limited(f"mfa_setup:{current_user.id}", max_requests=3, window_seconds=600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many MFA setup requests. Please wait a few minutes."},
        )

    secret = totp_service.generate_secret()
    uri = totp_service.get_provisioning_uri(secret, username=current_user.username)
    backup_codes = totp_service.generate_backup_codes()

    # Save pending secret
    current_user.mfa.totpSecret = secret
    current_user.mfa.backupCodes = backup_codes
    await repo.create_or_update_user(current_user)

    return {
        "secret": secret,
        "provisioningUri": uri,
        "backupCodes": backup_codes,
        "message": "Scan the QR code with your authenticator app, then submit a 6-digit verification code.",
    }


@router.post("/mfa/verify")
async def mfa_verify(
    payload: MfaVerifyRequest,
    response: Response,
    request: Request,
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Verify 6-digit TOTP code to finalize setup or complete login."""
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    # Rate limiting: 5 / min
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"mfa_verify:{client_ip}", max_requests=5, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many verification attempts. Please wait."},
        )

    # Case A: completing login with mfaSessionToken
    if payload.mfaSessionToken:
        user_id = decode_mfa_session_token(payload.mfaSessionToken)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_MFA_SESSION", "message": "MFA login session expired. Please log in again."},
            )
        user = await repo.get_user_by_id(user_id)
        if not user or not user.mfa.totpSecret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "MFA_NOT_CONFIGURED", "message": "2FA is not configured for this account."},
            )

        is_valid = totp_service.verify_code(user.mfa.totpSecret, payload.code)
        if not is_valid and payload.code in user.mfa.backupCodes:
            # Consume backup code
            user.mfa.backupCodes.remove(payload.code)
            await repo.create_or_update_user(user)
            is_valid = True

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_MFA_CODE", "message": "Invalid authentication code."},
            )

        # Issue full tokens & cookies
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            username=user.username,
            role=user.accountType,
            persona=user.personaTag,
        )
        raw_refresh = generate_secure_token(32)
        refresh_record = RefreshTokenRecord(
            _id=f"rtk_{uuid.uuid4().hex[:12]}",
            tokenHash=hash_token(raw_refresh),
            userId=user.id,
            familyId=f"fam_{uuid.uuid4().hex[:12]}",
            status="ACTIVE",
            expiresAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + (7 * 86400))),
        )
        await repo.create_refresh_token(refresh_record)
        set_auth_cookies(response, access_token=access_token, refresh_token=raw_refresh)
        return {
            "user": user.to_public_dict(),
            "accessToken": access_token,
            "refreshToken": raw_refresh,
            "message": "2FA verification successful.",
        }

    # Case B: confirming setup for already logged-in user
    current_user_token = get_current_user_token(request)
    if not current_user_token:
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Authentication required"})

    user = await repo.get_user_by_id(current_user_token.get("sub"))
    if not user or not user.mfa.totpSecret:
        raise HTTPException(status_code=400, detail={"code": "SETUP_REQUIRED", "message": "Run /mfa/setup first"})

    if not totp_service.verify_code(user.mfa.totpSecret, payload.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_MFA_CODE", "message": "Invalid code. Please re-enter current code from your authenticator app."},
        )

    user.mfa.enabled = True
    await repo.create_or_update_user(user)
    return {"message": "Two-factor authentication successfully enabled.", "enabled": True}
