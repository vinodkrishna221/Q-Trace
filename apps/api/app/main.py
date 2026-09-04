from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.repositories import get_repository, seed_core_truth
from app.routers.instructor import router as instructor_router
from app.routers.learning import router as learning_router
from app.routers.progress import router as progress_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler to ensure core truth is seeded on startup."""
    repo = get_repository()
    await seed_core_truth(repo)
    yield


app = FastAPI(
    title="Q-Trace API",
    description="Backend API for Q-Trace quantum learning platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware configuration
web_origin = os.getenv("WEB_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[web_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Domain Routers
app.include_router(learning_router, prefix="/v1")
app.include_router(progress_router, prefix="/v1")
app.include_router(instructor_router, prefix="/v1")


@app.get("/health")
async def health_check():
    """Process health verification endpoint."""
    return {"status": "ok", "service": "q-trace-api"}


@app.get("/ready")
async def readiness_check():
    """Readiness verification endpoint."""
    return {
        "status": "ready",
        "demo_local": os.getenv("DEMO_LOCAL", "1") == "1",
        "demo_fallback": os.getenv("DEMO_FALLBACK", "1") == "1",
    }

