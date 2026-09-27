"""Rate limiting and brute-force lockout guard.
Conforms to docs/AUTH-SYSTEM-DESIGN.md Section 4.2 & Section 9.
"""

from __future__ import annotations

import asyncio
import time
from collections import defaultdict
from typing import Optional
from fastapi import HTTPException, Request

LOCKOUT_THRESHOLD = 5
LOCKOUT_DURATION_SECONDS = 15 * 60  # 15 minutes


class BruteForceGuard:
    """Tracks failed login attempts by identifier and IP to prevent brute-force attacks."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._failed_attempts: dict[str, int] = defaultdict(int)
        self._locked_until: dict[str, float] = {}

    def _normalize_key(self, identifier: str) -> str:
        return identifier.strip().lower()

    async def check_lockout(self, identifier: str) -> Optional[int]:
        """Check if identifier is currently locked out.
        Returns remaining locked seconds if locked, None otherwise.
        """
        key = self._normalize_key(identifier)
        async with self._lock:
            locked_at = self._locked_until.get(key)
            if not locked_at:
                return None
            remaining = int(locked_at - time.time())
            if remaining > 0:
                return remaining
            # Lockout expired, clean up
            self._locked_until.pop(key, None)
            self._failed_attempts.pop(key, None)
            return None

    async def record_failure(self, identifier: str) -> tuple[int, bool]:
        """Record a failed login attempt.
        Returns: (failed_attempts_count, is_now_locked)
        """
        key = self._normalize_key(identifier)
        async with self._lock:
            self._failed_attempts[key] += 1
            count = self._failed_attempts[key]
            if count >= LOCKOUT_THRESHOLD:
                self._locked_until[key] = time.time() + LOCKOUT_DURATION_SECONDS
                return count, True
            return count, False

    async def reset(self, identifier: str) -> None:
        """Reset failed attempt counters upon successful authentication."""
        key = self._normalize_key(identifier)
        async with self._lock:
            self._failed_attempts.pop(key, None)
            self._locked_until.pop(key, None)

    async def clear_all(self) -> None:
        """Reset entire tracker (useful for test resets)."""
        async with self._lock:
            self._failed_attempts.clear()
            self._locked_until.clear()


# Global singleton instance
brute_force_guard = BruteForceGuard()


class SimpleRateLimiter:
    """In-memory sliding window rate limiter."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._requests: dict[str, list[float]] = defaultdict(list)

    async def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Check and record request. Returns True if rate limit is exceeded."""
        now = time.time()
        cutoff = now - window_seconds
        async with self._lock:
            timestamps = [ts for ts in self._requests[key] if ts > cutoff]
            if len(timestamps) >= max_requests:
                self._requests[key] = timestamps
                return True
            timestamps.append(now)
            self._requests[key] = timestamps
            return False

    async def clear_all(self) -> None:
        async with self._lock:
            self._requests.clear()


rate_limiter = SimpleRateLimiter()
