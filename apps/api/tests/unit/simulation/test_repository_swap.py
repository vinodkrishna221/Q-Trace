"""SIM-7 · test_repository_swap.py

Runs the same contract suite against:
  1. InMemorySimRunRepo  (DEMO_LOCAL=1 path)
  2. A mock MongoSimRunRepo (DATA-6 DataRepositoryProtocol mock path,
     since DATA-6 is not yet merged to main)

Also verifies that:
  - get_sim_run_repo() returns InMemorySimRunRepo when DEMO_LOCAL=1
  - get_sim_run_repo() falls back to InMemorySimRunRepo when DEMO_LOCAL=0
    and MongoRepository is unavailable (mock path)
  - The FastAPI router dependency override works end-to-end
  - DEMO_LOCAL env var is the sole selection gate
"""

from __future__ import annotations

import asyncio
import uuid
from typing import Optional
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.models.simulation import (
    BlochVectorOut,
    ComplexValue,
    ConformanceResult,
    ReducedQubitOut,
    SimulationRunOut,
    StateTraceStepOut,
)
from app.repositories.sim_run_repository import (
    InMemorySimRunRepo,
    MongoSimRunRepo,
    SimulationRunRepositoryProtocol,
    get_sim_run_repo,
    _memory_repo,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _make_run(run_id: str = "sr_test_001") -> SimulationRunOut:
    """Build a minimal SimulationRunOut matching the contract Bell shape."""
    return SimulationRunOut(
        id=run_id,
        learnerProfileId="lp_aarav",
        moduleId="mod_bell",
        circuitModelId="cm_bell_seed",
        adapter="QISKIT_AER",
        shots=1024,
        status="SUCCEEDED",
        probabilities={"00": 0.5, "11": 0.5},
        counts={"00": 512, "11": 512},
        stateTrace=[
            StateTraceStepOut(
                stepIndex=0,
                operationId="op_1",
                label="After H",
                basisProbabilities={"00": 0.5, "10": 0.5},
                amplitudes={
                    "00": ComplexValue(re=0.70710678, im=0.0),
                    "10": ComplexValue(re=0.70710678, im=0.0),
                },
                reducedQubits=[
                    ReducedQubitOut(
                        qubit=0,
                        bloch=BlochVectorOut(x=1.0, y=0.0, z=0.0),
                        purity=1.0,
                        label="PURE_SUBSYSTEM",
                    ),
                    ReducedQubitOut(
                        qubit=1,
                        bloch=BlochVectorOut(x=0.0, y=0.0, z=1.0),
                        purity=1.0,
                        label="PURE_SUBSYSTEM",
                    ),
                ],
            ),
        ],
        conformance=ConformanceResult(
            adapter="PENNYLANE",
            maxProbabilityDelta=0.0,
            epsilon=1e-6,
            passed=True,
            skippedReason=None,
        ),
        durationMs=84,
        createdAt="2026-08-23T05:27:00Z",
    )


@pytest.fixture()
def memory_repo() -> InMemorySimRunRepo:
    repo = InMemorySimRunRepo()
    return repo


@pytest.fixture()
def mock_data_repo() -> MagicMock:
    """Mock for DATA-6's DataRepositoryProtocol — used in the Mongo path test.

    DATA-6 mock path: MongoSimRunRepo passes SimulationRunOut directly when
    app.models.entities is unavailable (branch not merged).  The mock stores
    and returns the same object so the contract suite can verify round-trips.
    Includes reset() to satisfy MongoSimRunRepo.clear() behaviour.
    """
    mock = MagicMock()
    stored: dict[str, object] = {}

    async def _create(payload: object) -> object:
        # payload is SimulationRunOut on the mock path (DATA-6 not merged)
        key = payload.id if hasattr(payload, "id") else str(payload)
        stored[key] = payload
        return payload

    async def _get(run_id: str) -> object:
        return stored.get(run_id)

    async def _reset() -> None:
        stored.clear()

    mock.create_simulation_run = _create
    mock.get_simulation_run = _get
    mock.reset = _reset
    return mock


@pytest.fixture()
def mongo_repo(mock_data_repo: MagicMock) -> MongoSimRunRepo:
    return MongoSimRunRepo(data_repo=mock_data_repo)


# ---------------------------------------------------------------------------
# Contract suite — identical behaviour expected from both implementations
# ---------------------------------------------------------------------------


async def _run_contract_suite(repo: InMemorySimRunRepo | MongoSimRunRepo) -> None:
    """Run the same assertions against either backend implementation."""
    run = _make_run("sr_contract_001")
    req_id = f"req_{uuid.uuid4().hex[:12]}"

    # 1. get() returns None before save
    assert await repo.get("sr_contract_001") is None, "expect None before save"

    # 2. save() and get() round-trip
    await repo.save(run, request_id=req_id)
    retrieved = await repo.get("sr_contract_001")
    assert retrieved is not None, "expect run after save"
    assert retrieved.id == "sr_contract_001"
    assert retrieved.probabilities == {"00": 0.5, "11": 0.5}
    assert retrieved.status == "SUCCEEDED"

    # 3. idempotency cache hit within TTL
    cached = repo.get_by_request_id(req_id, ttl_seconds=60.0)
    assert cached is not None, "expect idempotency cache hit"
    assert cached.id == "sr_contract_001"

    # 4. idempotency cache miss (expired TTL)
    expired = repo.get_by_request_id(req_id, ttl_seconds=0.0)
    assert expired is None, "expect cache miss when TTL=0"

    # 5. get_by_request_id for unknown key → None
    assert repo.get_by_request_id("req_unknown_xyz") is None

    # 6. clear() resets state
    await repo.save(run)  # re-save (idempotency entry was evicted)
    repo.clear()
    assert await repo.get("sr_contract_001") is None, "expect None after clear"


class TestInMemorySimRunRepo:
    """Contract suite for the in-memory implementation."""

    async def test_contract_suite(self, memory_repo: InMemorySimRunRepo) -> None:
        await _run_contract_suite(memory_repo)

    async def test_multiple_runs(self, memory_repo: InMemorySimRunRepo) -> None:
        run_a = _make_run("sr_a")
        run_b = _make_run("sr_b")
        await memory_repo.save(run_a)
        await memory_repo.save(run_b)
        assert await memory_repo.get("sr_a") is not None
        assert await memory_repo.get("sr_b") is not None
        assert await memory_repo.get("sr_c") is None

    async def test_clear_leaves_other_instance_untouched(self) -> None:
        """Each InMemorySimRunRepo instance has its own isolated store."""
        repo1 = InMemorySimRunRepo()
        repo2 = InMemorySimRunRepo()
        await repo1.save(_make_run("sr_isolated"))
        repo2.clear()
        assert await repo1.get("sr_isolated") is not None, "repo2.clear must not affect repo1"


class TestMongoSimRunRepo:
    """Contract suite for the Mongo-backed implementation (mock DATA-6 path)."""

    async def test_contract_suite(self, mongo_repo: MongoSimRunRepo) -> None:
        await _run_contract_suite(mongo_repo)

    async def test_save_persists_to_data_repo(
        self, mongo_repo: MongoSimRunRepo, mock_data_repo: MagicMock
    ) -> None:
        """Saving a run should invoke create_simulation_run on the data repo."""
        run = _make_run("sr_mongo_001")
        await mongo_repo.save(run, request_id="req_mongo_001")
        # The underlying async call was made (we check via get)
        retrieved = await mongo_repo.get("sr_mongo_001")
        assert retrieved is not None
        assert retrieved.id == "sr_mongo_001"

    def test_protocol_compliance(self) -> None:
        """MongoSimRunRepo must satisfy SimulationRunRepositoryProtocol."""
        mock = MagicMock()
        repo = MongoSimRunRepo(data_repo=mock)
        assert isinstance(repo, SimulationRunRepositoryProtocol)


# ---------------------------------------------------------------------------
# DEMO_LOCAL env var gate — factory selection
# ---------------------------------------------------------------------------


class TestGetSimRunRepo:
    def test_demo_local_true_returns_memory(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("DEMO_LOCAL", "1")
        repo = get_sim_run_repo()
        assert isinstance(repo, InMemorySimRunRepo)

    def test_demo_local_false_falls_back_to_memory_when_data6_absent(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """When DEMO_LOCAL=0 but DATA-6 is not merged, must fall back to memory."""
        monkeypatch.setenv("DEMO_LOCAL", "0")
        # Patch _build_mongo_repo to return None (DATA-6 not merged)
        with patch(
            "app.repositories.sim_run_repository._build_mongo_repo", return_value=None
        ):
            repo = get_sim_run_repo()
        assert isinstance(repo, InMemorySimRunRepo)

    def test_demo_local_false_returns_mongo_when_data6_present(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """When DEMO_LOCAL=0 and DATA-6 is available, must return MongoSimRunRepo."""
        monkeypatch.setenv("DEMO_LOCAL", "0")
        fake_mongo = MongoSimRunRepo(data_repo=MagicMock())
        with patch(
            "app.repositories.sim_run_repository._build_mongo_repo",
            return_value=fake_mongo,
        ):
            repo = get_sim_run_repo()
        assert isinstance(repo, MongoSimRunRepo)


# ---------------------------------------------------------------------------
# Router end-to-end: dependency override verifies the same contract suite
# ---------------------------------------------------------------------------


class TestRouterWithRepositorySwap:
    """Verify the router correctly uses the injected repository."""

    @pytest.fixture()
    def client_with_memory_repo(self) -> TestClient:
        from app.main import app
        from app.repositories.sim_run_repository import get_sim_run_repo

        isolated_repo = InMemorySimRunRepo()
        app.dependency_overrides[get_sim_run_repo] = lambda: isolated_repo
        client = TestClient(app, raise_server_exceptions=False)
        yield client, isolated_repo
        app.dependency_overrides.clear()

    async def test_post_and_get_uses_injected_repo(
        self, client_with_memory_repo
    ) -> None:
        """POST then GET a run; confirm the injected repo holds the data."""
        client, repo = client_with_memory_repo

        response = client.post(
            "/v1/simulation-runs",
            json={
                "learnerProfileId": "lp_aarav",
                "moduleId": "mod_bell",
                "circuitModel": {
                    "id": "cm_bell_seed",
                    "name": "Bell State Seed",
                    "qubitCount": 2,
                    "classicalBitCount": 2,
                    "operations": [
                        {
                            "opId": "op_1",
                            "gate": "H",
                            "targets": [0],
                            "controls": [],
                            "classicalTargets": [],
                            "column": 0,
                        },
                        {
                            "opId": "op_2",
                            "gate": "CNOT",
                            "targets": [1],
                            "controls": [0],
                            "classicalTargets": [],
                            "column": 1,
                        },
                        {
                            "opId": "op_3",
                            "gate": "MEASURE",
                            "targets": [0],
                            "controls": [],
                            "classicalTargets": [0],
                            "column": 2,
                        },
                        {
                            "opId": "op_4",
                            "gate": "MEASURE",
                            "targets": [1],
                            "controls": [],
                            "classicalTargets": [1],
                            "column": 2,
                        },
                    ],
                    "source": "BUILDER",
                    "modelVersion": 1,
                },
                "primaryAdapter": "QISKIT_AER",
                "runConformance": False,
                "shots": 1024,
            },
            headers={"X-Request-ID": "req_swap_e2e_001"},
        )
        assert response.status_code == 201, response.text
        data = response.json()
        run_id = data["simulationRun"]["id"]

        # The run must now be in the injected repo
        assert await repo.get(run_id) is not None

        # GET must retrieve the same run
        get_resp = client.get(f"/v1/simulation-runs/{run_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["simulationRun"]["id"] == run_id

    def test_idempotency_same_request_id_returns_cached(
        self, client_with_memory_repo
    ) -> None:
        """Sending the same X-Request-ID twice must return the same run."""
        client, _ = client_with_memory_repo
        payload = {
            "learnerProfileId": "lp_aarav",
            "moduleId": "mod_bell",
            "circuitModel": {
                "id": "cm_bell_seed",
                "name": "Bell State Seed",
                "qubitCount": 2,
                "classicalBitCount": 2,
                "operations": [
                    {
                        "opId": "op_1",
                        "gate": "H",
                        "targets": [0],
                        "controls": [],
                        "classicalTargets": [],
                        "column": 0,
                    },
                    {
                        "opId": "op_2",
                        "gate": "CNOT",
                        "targets": [1],
                        "controls": [0],
                        "classicalTargets": [],
                        "column": 1,
                    },
                    {
                        "opId": "op_3",
                        "gate": "MEASURE",
                        "targets": [0],
                        "controls": [],
                        "classicalTargets": [0],
                        "column": 2,
                    },
                    {
                        "opId": "op_4",
                        "gate": "MEASURE",
                        "targets": [1],
                        "controls": [],
                        "classicalTargets": [1],
                        "column": 2,
                    },
                ],
                "source": "BUILDER",
                "modelVersion": 1,
            },
            "primaryAdapter": "QISKIT_AER",
            "runConformance": False,
            "shots": 1024,
        }
        r1 = client.post(
            "/v1/simulation-runs",
            json=payload,
            headers={"X-Request-ID": "req_idempotency_swap_001"},
        )
        r2 = client.post(
            "/v1/simulation-runs",
            json=payload,
            headers={"X-Request-ID": "req_idempotency_swap_001"},
        )
        assert r1.status_code == 201
        assert r2.status_code == 201
        assert r1.json()["simulationRun"]["id"] == r2.json()["simulationRun"]["id"]

    def test_get_unknown_run_returns_404(
        self, client_with_memory_repo
    ) -> None:
        client, _ = client_with_memory_repo
        resp = client.get("/v1/simulation-runs/sr_does_not_exist")
        assert resp.status_code == 404
        body = resp.json()
        assert body["error"]["code"] == "SIMULATION_RUN_NOT_FOUND"


# ---------------------------------------------------------------------------
# Protocol structural check
# ---------------------------------------------------------------------------


def test_in_memory_repo_satisfies_protocol() -> None:
    repo = InMemorySimRunRepo()
    assert isinstance(repo, SimulationRunRepositoryProtocol)
