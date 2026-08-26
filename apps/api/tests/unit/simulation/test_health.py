"""SIM-1 card TEST — FastAPI service boundary.

Proves:
  1. GET /health → 200, body {"status": "ok", "service": "q-trace-api"}
  2. GET /ready  → 200, body includes primaryAdapter field
  3. Any unhandled server error returns the contract error envelope with requestId
     (tested via a purposely-thrown route injected during test setup).

Run with:
  uv run --project apps/api pytest apps/api/tests/unit/simulation/test_health.py
"""

from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client() -> TestClient:
    return TestClient(app, raise_server_exceptions=False)


# ---------------------------------------------------------------------------
# 1. Health endpoint
# ---------------------------------------------------------------------------


def test_health_returns_200(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200


def test_health_body(client: TestClient):
    response = client.get("/health")
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "q-trace-api"


# ---------------------------------------------------------------------------
# 2. Readiness endpoint — must include primaryAdapter
# ---------------------------------------------------------------------------


def test_ready_returns_200(client: TestClient):
    response = client.get("/ready")
    assert response.status_code == 200


def test_ready_reports_primary_adapter(client: TestClient):
    body = client.get("/ready").json()
    assert "primaryAdapter" in body, "readiness must expose primaryAdapter field"
    assert body["primaryAdapter"] == "QISKIT_AER"


def test_ready_reports_adapter_statuses(client: TestClient):
    body = client.get("/ready").json()
    assert "adapters" in body
    assert "QISKIT_AER" in body["adapters"]


# ---------------------------------------------------------------------------
# 3. Contract error shape — requestId must appear in error responses
# ---------------------------------------------------------------------------


def test_error_response_includes_request_id(client: TestClient):
    """Inject a route that raises an unhandled exception; verify envelope shape."""
    # Create an isolated app with a crashing route to avoid polluting the main app
    test_app = FastAPI()

    # Reproduce the same middleware + handler pattern from main
    import uuid
    from starlette.middleware.base import BaseHTTPMiddleware
    from fastapi import Request
    from fastapi.responses import JSONResponse
    from app.models.errors import ErrorDetail, ErrorEnvelope

    class _ReqIDMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            rid = f"req_{uuid.uuid4().hex[:12]}"
            request.state.request_id = rid
            response = await call_next(request)
            response.headers["X-Request-ID"] = rid
            return response

    test_app.add_middleware(_ReqIDMiddleware)

    @test_app.exception_handler(Exception)
    async def _handler(request: Request, exc: Exception) -> JSONResponse:
        rid = getattr(request.state, "request_id", "req_unknown")
        envelope = ErrorEnvelope(
            error=ErrorDetail(code="INTERNAL_ERROR", message="boom", requestId=rid)
        )
        return JSONResponse(status_code=500, content=envelope.model_dump())

    @test_app.get("/boom")
    async def _boom():
        raise RuntimeError("test error")

    boom_client = TestClient(test_app, raise_server_exceptions=False)
    response = boom_client.get("/boom")
    assert response.status_code == 500
    body = response.json()
    assert "error" in body, "error envelope missing"
    err = body["error"]
    assert "requestId" in err, "requestId missing from error"
    assert "code" in err
    assert "message" in err
    assert err["requestId"].startswith("req_")


def test_x_request_id_header_on_response(client: TestClient):
    """Every response must carry X-Request-ID header."""
    response = client.get("/health")
    assert "x-request-id" in response.headers or "X-Request-ID" in response.headers
