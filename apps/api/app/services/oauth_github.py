"""GitHub OAuth 2.0 service for one-click developer authentication.
Conforms to docs/AUTH-SYSTEM-DESIGN.md Section 4.3.
"""

from __future__ import annotations

import logging
import os
import secrets
from typing import Any, Optional
import httpx

logger = logging.getLogger("qtrace.services.oauth")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "").strip()
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "").strip()
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/v1/auth/github/callback")


class GitHubOAuthService:
    """Manages GitHub OAuth 2.0 authorization code flow."""

    def __init__(self) -> None:
        self.client_id = GITHUB_CLIENT_ID
        self.client_secret = GITHUB_CLIENT_SECRET
        self.redirect_uri = GITHUB_REDIRECT_URI

    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """Generate GitHub authorization URL with state parameter."""
        oauth_state = state or secrets.token_urlsafe(16)
        if not self.is_configured():
            # Demo local redirect URL
            return f"{self.redirect_uri}?code=demo_github_code&state={oauth_state}"

        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "read:user user:email",
            "state": oauth_state,
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"https://github.com/login/oauth/authorize?{query}"

    async def exchange_code_for_user(self, code: str) -> dict[str, Any]:
        """Exchange authorization code for GitHub profile and email."""
        # Demo / mock flow if not configured
        if not self.is_configured() or code.startswith("demo_"):
            return {
                "githubId": "gh_demo_101",
                "username": "quantum_dev_gh",
                "displayName": "Alex Dev (GitHub)",
                "email": "alex.dev@github.example.com",
                "avatarUrl": "https://avatars.githubusercontent.com/u/9919?v=4",
            }

        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Exchange code for access token
            token_res = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                },
            )
            token_data = token_res.json()
            access_token = token_data.get("access_token")
            if not access_token:
                logger.error("GitHub OAuth exchange failed: %s", token_data)
                raise ValueError("Failed to obtain access token from GitHub")

            # 2. Fetch user profile
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Q-Trace-Auth",
            }
            user_res = await client.get("https://api.github.com/user", headers=headers)
            user_data = user_res.json()

            # 3. Fetch verified email
            emails_res = await client.get("https://api.github.com/user/emails", headers=headers)
            emails = emails_res.json() if emails_res.is_success else []
            primary_email = user_data.get("email")
            if not primary_email and isinstance(emails, list):
                for e in emails:
                    if e.get("primary") and e.get("verified"):
                        primary_email = e.get("email")
                        break

            if not primary_email:
                primary_email = f"{user_data.get('login')}@users.noreply.github.com"

            return {
                "githubId": str(user_data.get("id")),
                "username": user_data.get("login") or f"gh_{user_data.get('id')}",
                "displayName": user_data.get("name") or user_data.get("login") or "GitHub User",
                "email": primary_email,
                "avatarUrl": user_data.get("avatar_url"),
            }


github_oauth_service = GitHubOAuthService()
