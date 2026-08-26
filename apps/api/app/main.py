"""FastAPI application entry point for Q-Trace.

SIM-1 additions over the SHIP-1 skeleton:
- X-Request-ID middleware: generates a UUID request ID per request and exposes it
  on the response header so every error can reference it.
- Contract-shaped global exception handler: all unhandled exceptions return the
  { "error": { code, message, requestId, details } } envelope from circuit-simulation.md.
- Router registration for /v1/circuits and /v1/simulation-runs placeholders.
- /ready now reports the primary adapter status field.
"""

from __future__ import annotations

import logging
import os
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.models.errors import ErrorDetail, ErrorEnvelope
from app.routers import circuits, simulation_runs

logger = logging.getLogger("qtrace.api")
logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Q-Trace API",
    description="Backend API for Q-Trace quantum learning platform",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS — must be first middleware (SIH demo: localhost + deployed frontend)
# ---------------------------------------------------------------------------

web_origin = os.getenv("WEB_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[web_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request-ID middleware
# Each inbound request gets a UUID stored in request.state.request_id.
# The same ID is returned on X-Request-ID response header so errors are
# traceable end-to-end.
# ---------------------------------------------------------------------------


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


app.add_middleware(RequestIDMiddleware)

# ---------------------------------------------------------------------------
# Global exception handler — contract error shape
# ---------------------------------------------------------------------------


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "req_unknown")
    logger.exception("Unhandled error [%s]: %s", request_id, exc)
    envelope = ErrorEnvelope(
        error=ErrorDetail(
            code="INTERNAL_ERROR",
            message="An unexpected error occurred.",
            requestId=request_id,
        )
    )
    return JSONResponse(status_code=500, content=envelope.model_dump())


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(circuits.router)
app.include_router(simulation_runs.router)

# ---------------------------------------------------------------------------
# Core endpoints
# ---------------------------------------------------------------------------


@app.get("/health", tags=["ops"])
async def health_check():
    """Process health verification — returns 200 when the process is alive."""
    return {"status": "ok", "service": "q-trace-api"}


@app.get("/ready", tags=["ops"])
async def readiness_check():
    """Readiness check — reports primary adapter availability and demo flags."""
    enable_qiskit = os.getenv("ENABLE_QISKIT", "1") == "1"
    enable_pennylane = os.getenv("ENABLE_PENNYLANE", "1") == "1"
    demo_local = os.getenv("DEMO_LOCAL", "1") == "1"

    # Primary adapter is QISKIT_AER; PennyLane is a conformance adapter only.
    adapters = {
        "QISKIT_AER": "enabled" if enable_qiskit else "disabled",
        "PENNYLANE": "enabled" if enable_pennylane else "disabled",
    }

    return {
        "status": "ready",
        "primaryAdapter": "QISKIT_AER",
        "adapters": adapters,
        "demoLocal": demo_local,
        "demoFallback": os.getenv("DEMO_FALLBACK", "1") == "1",
    }
