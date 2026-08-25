"""Router placeholder for /v1/simulation-runs endpoints.

SIM-1: skeleton only — real POST/GET endpoints added in SIM-4 (Expose and persist
Simulation Runs).
"""

from fastapi import APIRouter

router = APIRouter(prefix="/v1/simulation-runs", tags=["simulation-runs"])

# Endpoints implemented in SIM-4 (simulation routes)
