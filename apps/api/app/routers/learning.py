"""Learning content router for Q-Trace.

Endpoints:
- GET /v1/demo-profiles
- GET /v1/learning-paths/{learnerProfileId}
- GET /v1/modules
- GET /v1/modules/{moduleSlug}
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.entities import ModuleLevel
from app.repositories import DataRepositoryProtocol, get_repository

router = APIRouter(tags=["learning"])


@router.get("/demo-profiles")
async def get_demo_profiles(
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """Retrieve all disclosed demo learner profiles and the instructor profile."""
    profiles = await repo.list_learner_profiles()
    instructor = await repo.get_instructor_profile("instructor_rao")
    return {
        "profiles": [p.model_dump() for p in profiles],
        "instructor": instructor.model_dump() if instructor else None,
    }


@router.get("/learning-paths/{learner_profile_id}")
async def get_learning_path(
    learner_profile_id: str,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """Retrieve the active learning path for a specific learner profile."""
    learner = await repo.get_learner_profile(learner_profile_id)
    if not learner:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "LEARNER_NOT_FOUND",
                "message": f"Learner profile '{learner_profile_id}' not found",
            },
        )

    path = await repo.get_learning_path_by_learner(learner_profile_id)
    if not path:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "LEARNING_PATH_NOT_FOUND",
                "message": f"Learning path for learner '{learner_profile_id}' not found",
            },
        )

    return {"learningPath": path.model_dump()}


@router.get("/modules")
async def list_modules(
    level: Optional[ModuleLevel] = Query(default=None),
    limit: int = Query(default=10, ge=1, le=20),
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """List modules catalogue optionally filtered by level with pagination limit."""
    modules = await repo.list_modules(level=level, limit=limit)
    return {
        "modules": [
            {
                "id": m.id,
                "slug": m.slug,
                "title": m.title,
                "level": m.level,
                "estimatedMinutes": m.estimatedMinutes,
                "skillIds": m.skillIds,
            }
            for m in modules
        ],
        "nextCursor": None,
    }


@router.get("/modules/{module_slug}")
async def get_module_by_slug(
    module_slug: str,
    repo: DataRepositoryProtocol = Depends(get_repository),
) -> dict:
    """Retrieve full module details by route slug."""
    module = await repo.get_module_by_slug(module_slug)
    if not module:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "MODULE_NOT_FOUND",
                "message": f"Module with slug '{module_slug}' not found",
            },
        )

    prediction_checkpoint = None
    if module.predictionCheckpointId:
        cp = await repo.get_prediction_checkpoint(module.predictionCheckpointId)
        if cp:
            prediction_checkpoint = {
                "id": cp.id,
                "prompt": cp.prompt,
                "answerSchema": cp.answerSchema,
            }

    return {
        "module": {
            "id": module.id,
            "slug": module.slug,
            "title": module.title,
            "skillIds": module.skillIds,
            "level": module.level,
            "estimatedMinutes": module.estimatedMinutes,
            "contentBlocks": module.contentBlocks,
            "predictionCheckpoint": prediction_checkpoint,
            "starterCircuitModelId": module.starterCircuitModelId,
            "challengeIds": module.challengeIds,
        }
    }
