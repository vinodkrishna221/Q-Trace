"""Router placeholder for /v1/circuits endpoints.

SIM-1: skeleton only — real endpoints added in SIM-2 (Circuit Model validation)
and SIM-5 (Qiskit parse / OpenQASM export).
"""

from fastapi import APIRouter

router = APIRouter(prefix="/v1/circuits", tags=["circuits"])

# Endpoints implemented in SIM-2 (circuit model) and SIM-5 (parse / export)
