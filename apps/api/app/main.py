"""FastAPI application entry point for Q-Trace."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Q-Trace API",
    description="Backend API for Q-Trace quantum learning platform",
    version="0.1.0",
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
