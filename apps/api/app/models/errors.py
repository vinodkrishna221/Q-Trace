"""Contract-shaped error models for Q-Trace API.

Matches the shared error shape in board/contracts/circuit-simulation.md:
  { "error": { "code": str, "message": str, "requestId": str, "details": dict | None } }
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """Inner error payload — mirrors the contract error shape."""

    code: str
    message: str
    requestId: str
    details: dict[str, Any] | None = None


class ErrorEnvelope(BaseModel):
    """Top-level error envelope returned by all endpoints on failure."""

    error: ErrorDetail
