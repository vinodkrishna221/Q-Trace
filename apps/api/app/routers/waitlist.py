"""Institutional Coming-Soon & Waitlist Router.
Conforms to docs/AUTH-SYSTEM-DESIGN.md Section 4.6 and Section 6.2.
"""

from __future__ import annotations

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.rate_limit import rate_limiter
from app.core.security import get_client_ip, verify_csrf_token
from app.models.auth import (
    InstitutionWaitlistRecord,
    InstitutionWaitlistRequest,
    utc_now_iso,
)
from app.repositories import get_repository
from app.repositories.base import DataRepositoryProtocol
from app.services.email_service import email_service

logger = logging.getLogger("qtrace.routers.waitlist")

router = APIRouter(prefix="/v1/waitlist", tags=["waitlist"])


@router.post("/institutions", status_code=status.HTTP_201_CREATED)
async def submit_institutional_waitlist(
    payload: InstitutionWaitlistRequest,
    request: Request,
    repo: DataRepositoryProtocol = Depends(get_repository),
):
    """Capture an institutional classroom pilot lead and return priority queue position."""
    # 1. CSRF verification
    if not verify_csrf_token(request):
        raise HTTPException(status_code=403, detail={"code": "CSRF_ERROR", "message": "Invalid CSRF token"})

    # 2. Rate limit (5 / hour / IP per docs/AUTH-SYSTEM-DESIGN.md Section 6.1)
    client_ip = get_client_ip(request)
    if await rate_limiter.is_rate_limited(f"waitlist:{client_ip}", max_requests=5, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMIT_EXCEEDED", "message": "Too many waitlist requests. Please try again later."},
        )

    clean_email = payload.workEmail.strip().lower()

    # Check if already registered
    existing = await repo.get_institution_waitlist_by_email(clean_email)
    if existing:
        return {
            "status": "WAITLISTED",
            "waitlistPosition": existing.waitlistPosition,
            "message": f"Welcome back, {payload.fullName}. Your request is already priority-queued at position #{existing.waitlistPosition}.",
        }

    waitlist_id = f"wtl_{uuid.uuid4().hex[:12]}"
    record = InstitutionWaitlistRecord(
        _id=waitlist_id,
        fullName=payload.fullName.strip(),
        workEmail=clean_email,
        institutionName=payload.institutionName.strip(),
        role=payload.role.strip(),
        expectedStudents=payload.expectedStudents,
        notes=payload.notes.strip() if payload.notes else None,
        status="PENDING_REVIEW",
        createdAt=utc_now_iso(),
    )
    saved = await repo.add_institution_waitlist(record)

    # Async email notification to educator (non-blocking fallback)
    await email_service.send_waitlist_confirmation(
        to_email=clean_email,
        full_name=payload.fullName.strip(),
        position=saved.waitlistPosition,
    )

    return {
        "status": "WAITLISTED",
        "waitlistPosition": saved.waitlistPosition,
        "message": f"Thank you, {payload.fullName}. Your institutional request has been priority-queued.",
    }


@router.get("/institutions/count")
async def get_waitlist_count(repo: DataRepositoryProtocol = Depends(get_repository)):
    """Return total count of early-access institutions."""
    count = await repo.count_institution_waitlist()
    return {"totalWaitlisted": count}
