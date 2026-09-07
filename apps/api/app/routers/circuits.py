"""Router for /v1/circuits endpoints — SIM-5.

Implements:
  POST /v1/circuits/parse-qiskit   → 200 ParseQiskitResponse
  POST /v1/circuits/export-openqasm3 → 200 ExportOpenQasm3Response

Rules:
  - Submitted code is PARSED, never executed (quantum-runtime.md).
  - All errors return the contract error shape with requestId.
  - No quantum SDK import at module level — happens inside service layer.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.models.circuit import (
    ExportOpenQasm3Request,
    ExportOpenQasm3Response,
    ParseQiskitRequest,
    ParseQiskitResponse,
)
from app.services.quantum.openqasm_exporter import ExportError, export_openqasm3
from app.services.quantum.parser import ParseError, parse_qiskit_code

router = APIRouter(prefix="/v1/circuits", tags=["circuits"])


# ---------------------------------------------------------------------------
# Error code → HTTP status mapping (contract v1)
# ---------------------------------------------------------------------------

_PARSE_ERROR_TO_STATUS: dict[str, int] = {
    "UNSAFE_CODE":            422,
    "UNSUPPORTED_GATE":       422,
    "CIRCUIT_LIMIT_EXCEEDED": 422,
    "PARSE_ERROR":            422,
}

_EXPORT_ERROR_TO_STATUS: dict[str, int] = {
    "INVALID_CIRCUIT_MODEL":         422,
    "OPENQASM_EXPORT_UNSUPPORTED":   422,
}


# ---------------------------------------------------------------------------
# POST /v1/circuits/parse-qiskit
# ---------------------------------------------------------------------------

@router.post(
    "/parse-qiskit",
    status_code=200,
    response_model=ParseQiskitResponse,
)
async def parse_qiskit(
    body: ParseQiskitRequest,
    request: Request,
) -> ParseQiskitResponse:
    """Parse submitted Qiskit Python into a CircuitModel.

    Code is NEVER executed — pure AST analysis with an allowlist.
    Returns 422 for unsafe, unsupported or invalid code.
    """
    request_id: str = getattr(request.state, "request_id", "req_unknown")

    try:
        circuit_model = parse_qiskit_code(body.code)
    except ParseError as exc:
        status = _PARSE_ERROR_TO_STATUS.get(exc.code, 422)
        raise HTTPException(
            status_code=status,
            detail={
                "code": exc.code,
                "message": exc.message,
                "requestId": request_id,
                "details": exc.details,
            },
        ) from exc

    return ParseQiskitResponse(circuitModel=circuit_model, warnings=[])


# ---------------------------------------------------------------------------
# POST /v1/circuits/export-openqasm3
# ---------------------------------------------------------------------------

@router.post(
    "/export-openqasm3",
    status_code=200,
    response_model=ExportOpenQasm3Response,
)
async def export_openqasm3_endpoint(
    body: ExportOpenQasm3Request,
    request: Request,
) -> ExportOpenQasm3Response:
    """Export a CircuitModel to OpenQASM 3.0.

    Subset export: all supported gates round-trip correctly (lossy=False).
    Returns 422 if the circuit contains unsupported gates.
    """
    request_id: str = getattr(request.state, "request_id", "req_unknown")

    try:
        result = export_openqasm3(body.circuitModel)
    except ExportError as exc:
        status = _EXPORT_ERROR_TO_STATUS.get(exc.code, 422)
        raise HTTPException(
            status_code=status,
            detail={
                "code": exc.code,
                "message": exc.message,
                "requestId": request_id,
                "details": exc.details,
            },
        ) from exc

    return ExportOpenQasm3Response(
        openQasmVersion=result["openQasmVersion"],
        openQasm3=result["openQasm3"],
        lossy=result["lossy"],
        warnings=result["warnings"],
    )
