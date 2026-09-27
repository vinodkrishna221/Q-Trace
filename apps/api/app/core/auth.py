"""PyJWT access token and refresh token management.
Conforms to docs/AUTH-SYSTEM-DESIGN.md Section 7.2.
"""

from __future__ import annotations

import hashlib
import os
import secrets
import time
from typing import Any, Optional
import jwt

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "qtrace_insecure_default_secret_key_change_in_prod_12345678")
JWT_ALGORITHM = "HS256"
JWT_ISSUER = "qtrace-api"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


def hash_token(raw_token: str) -> str:
    """Compute deterministic SHA-256 hex digest of a token for secure database storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_secure_token(nbytes: int = 32) -> str:
    """Generate cryptographically strong random token."""
    return secrets.token_urlsafe(nbytes)


def create_access_token(
    user_id: str,
    email: str,
    username: str,
    role: str = "INDIVIDUAL",
    persona: str = "LEARNER",
    expires_delta_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES,
) -> str:
    """Issue a signed JWT access token carrying strictly non-sensitive identity claims."""
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "username": username,
        "role": role,
        "persona": persona,
        "iss": JWT_ISSUER,
        "iat": now,
        "exp": now + (expires_delta_minutes * 60),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """Decode and validate a signed JWT access token."""
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
        )
        return payload
    except jwt.PyJWTError:
        return None


def create_mfa_session_token(user_id: str, expires_minutes: int = 5) -> str:
    """Temporary token issued after valid password check, required to complete MFA."""
    now = int(time.time())
    payload = {
        "sub": user_id,
        "type": "mfa_pending",
        "iss": JWT_ISSUER,
        "iat": now,
        "exp": now + (expires_minutes * 60),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_mfa_session_token(token: str) -> Optional[str]:
    """Validate MFA session token and return user_id if valid."""
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
        )
        if payload.get("type") != "mfa_pending":
            return None
        return payload.get("sub")
    except jwt.PyJWTError:
        return None
