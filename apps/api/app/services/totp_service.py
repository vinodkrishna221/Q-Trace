"""TOTP Multi-Factor Authentication (2FA) service.
Conforms to docs/AUTH-SYSTEM-DESIGN.md Section 2 and Section 6.1.
"""

from __future__ import annotations

import secrets
import pyotp


class TotpService:
    """Manages Time-based One-Time Password generation and verification."""

    @staticmethod
    def generate_secret() -> str:
        """Generate a base32 random secret."""
        return pyotp.random_base32()

    @staticmethod
    def get_provisioning_uri(secret: str, username: str, issuer: str = "Q-Trace Quantum") -> str:
        """Generate otpauth:// URI for QR code presentation."""
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=username, issuer_name=issuer)

    @staticmethod
    def verify_code(secret: str, code: str, valid_window: int = 1) -> bool:
        """Verify 6-digit TOTP code with time drift window."""
        totp = pyotp.TOTP(secret)
        return totp.verify(code.strip(), valid_window=valid_window)

    @staticmethod
    def generate_backup_codes(count: int = 8) -> list[str]:
        """Generate single-use alphanumeric backup codes."""
        return [secrets.token_hex(4).upper() for _ in range(count)]


totp_service = TotpService()
