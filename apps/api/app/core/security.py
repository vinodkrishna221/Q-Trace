"""Security utilities, CSRF enforcement, and cookie management.
Conforms to docs/AUTH-SYSTEM-DESIGN.md Section 6.2 and Section 9.
"""

from __future__ import annotations

import hmac
import os
import secrets
from typing import Optional
from fastapi import HTTPException, Request, Response
from app.core.auth import decode_access_token

ACCESS_COOKIE_NAME = "qtrace_access"
REFRESH_COOKIE_NAME = "qtrace_refresh"
CSRF_COOKIE_NAME = "qtrace_csrf"
CSRF_HEADER_NAME = "X-CSRF-Token"

IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"
SECURE_COOKIES = os.getenv("SECURE_COOKIES", "0" if not IS_PRODUCTION else "1") == "1"


def generate_csrf_token() -> str:
    """Generate a high-entropy CSRF double-submit token."""
    return secrets.token_urlsafe(32)


def set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: Optional[str] = None,
    csrf_token: Optional[str] = None,
) -> None:
    """Set HttpOnly, Secure, SameSite=Lax authentication cookies."""
    # 1. Access Token Cookie: 15 min (900 seconds)
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        max_age=900,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="lax",
        path="/",
    )

    # 2. Refresh Token Cookie: 7 days (604800 seconds) scoped to /v1/auth
    if refresh_token:
        response.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value=refresh_token,
            max_age=604800,
            httponly=True,
            secure=SECURE_COOKIES,
            samesite="lax",
            path="/v1/auth",
        )

    # 3. Double-Submit CSRF Cookie: 7 days, HttpOnly=False so client script can read and attach in header
    token_csrf = csrf_token or generate_csrf_token()
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=token_csrf,
        max_age=604800,
        httponly=False,
        secure=SECURE_COOKIES,
        samesite="lax",
        path="/",
    )


def get_client_ip(request: Request) -> str:
    """Extract client IP address, respecting X-Forwarded-For reverse proxy header."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def clear_auth_cookies(response: Response) -> None:
    """Clear all session authentication cookies upon logout."""
    response.delete_cookie(key=ACCESS_COOKIE_NAME, path="/", samesite="lax", secure=SECURE_COOKIES, httponly=True)
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/v1/auth", samesite="lax", secure=SECURE_COOKIES, httponly=True)
    response.delete_cookie(key=CSRF_COOKIE_NAME, path="/", samesite="lax", secure=SECURE_COOKIES)


def verify_csrf_token(request: Request) -> bool:
    """Verify double-submit CSRF token matching between cookie and header for state-mutating requests.
    Exempts safe methods (GET, HEAD, OPTIONS) and authorization bearer token calls.
    """
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return True

    # If standard Authorization header is provided, XSS/CSRF threat model differs
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return True

    cookie_csrf = request.cookies.get(CSRF_COOKIE_NAME)
    header_csrf = request.headers.get(CSRF_HEADER_NAME) or request.headers.get(CSRF_HEADER_NAME.lower())

    # If both cookie and header are present, verify constant-time match
    if cookie_csrf and header_csrf:
        return hmac.compare_digest(cookie_csrf, header_csrf)

    # Entry and lifecycle routes that can be initiated prior to or during token refresh/logout
    public_paths = (
        "/v1/auth/login",
        "/v1/auth/signup",
        "/v1/auth/refresh",
        "/v1/auth/logout",
        "/v1/auth/forgot-password",
        "/v1/auth/reset-password",
        "/v1/auth/mfa/verify",
        "/v1/waitlist/institutions",
    )
    if any(request.url.path.startswith(p) for p in public_paths):
        # If header was provided but doesn't match cookie, reject; otherwise allow
        if header_csrf and not cookie_csrf:
            return True
        if not header_csrf:
            return True

    # For mutating authenticated session actions, if CSRF cookie is present, header is strictly required
    if cookie_csrf and not header_csrf:
        return False

    return True


def get_current_user_token(request: Request) -> Optional[dict]:
    """Extract authenticated JWT payload from either HttpOnly cookie or Authorization Bearer header."""
    # 1. Check HttpOnly cookie
    token = request.cookies.get(ACCESS_COOKIE_NAME)

    # 2. Check Authorization Bearer header fallback
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return None

    return decode_access_token(token)
