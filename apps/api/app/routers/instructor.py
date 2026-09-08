"""Instructor insights router for Q-Trace.

Endpoints:
- GET /v1/instructor-insights/{cohortId}
"""

from fastapi import APIRouter, Depends, HTTPException
from app.repositories import DataRepositoryProtocol, get_repository

router = APIRouter(tags=["instructor"])


@router.get("/instructor-insights/{cohort_id}")
async def get_instructor_insight(
    cohort_id: str,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """Retrieve aggregate instructor insight metrics for a specific cohort."""
    insight = await repo.get_instructor_insight(cohort_id)
    if not insight:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "COHORT_NOT_FOUND",
                "message": f"Cohort '{cohort_id}' not found",
            },
        )

    return {"instructorInsight": insight.model_dump()}
