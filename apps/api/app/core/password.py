"""Argon2id cryptographic password hashing engine.
Conforms to OWASP guidelines & docs/AUTH-SYSTEM-DESIGN.md Section 7.1.
"""

from __future__ import annotations

import logging
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError

logger = logging.getLogger("qtrace.auth.password")

# OWASP Recommended Argon2id parameters
_ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MiB
    parallelism=4,
    hash_len=32,
    salt_len=16,
)


def hash_password(password: str) -> str:
    """Hash a cleartext password with Argon2id."""
    return _ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a cleartext password against an Argon2id hash.
    Constant-time comparison is guaranteed by argon2-cffi.
    """
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False
    except Exception as exc:
        logger.error("Unexpected error during password verification: %s", exc)
        return False


def needs_rehash(hashed_password: str) -> bool:
    """Check if hash needs rehashing due to parameter updates."""
    try:
        return _ph.check_needs_rehash(hashed_password)
    except Exception:
        return False
