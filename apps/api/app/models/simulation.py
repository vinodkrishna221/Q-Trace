"""Pydantic v2 request/response models for Simulation Runs.

Matches POST /v1/simulation-runs and GET /v1/simulation-runs/{id}
shapes from board/contracts/circuit-simulation.md v1.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

from app.models.circuit import CircuitModel


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------


class PredictionResponse(BaseModel):
    checkpointId: str
    answer: str


class SimulationRunRequest(BaseModel):
    learnerProfileId: str = Field(..., min_length=1)
    moduleId: str = Field(..., min_length=1)
    circuitModel: CircuitModel
    predictionResponse: PredictionResponse | None = None
    primaryAdapter: Literal["QISKIT_AER"] = "QISKIT_AER"
    runConformance: bool = False
    shots: int = Field(default=1024, ge=1, le=8192)


# ---------------------------------------------------------------------------
# Response sub-types  (match contract Types section exactly)
# ---------------------------------------------------------------------------


class ComplexValue(BaseModel):
    re: float
    im: float


class BlochVectorOut(BaseModel):
    x: float
    y: float
    z: float


class ReducedQubitOut(BaseModel):
    qubit: int
    bloch: BlochVectorOut
    purity: float
    label: str  # "PURE_SUBSYSTEM" | "MIXED_SUBSYSTEM"


class StateTraceStepOut(BaseModel):
    stepIndex: int
    operationId: str
    label: str
    basisProbabilities: dict[str, float]
    amplitudes: dict[str, ComplexValue]
    reducedQubits: list[ReducedQubitOut]


class ConformanceResult(BaseModel):
    adapter: str
    maxProbabilityDelta: float
    epsilon: float
    passed: bool
    skippedReason: str | None = None


# ---------------------------------------------------------------------------
# SimulationRun record — stored + returned
# ---------------------------------------------------------------------------


class SimulationRunOut(BaseModel):
    id: str
    learnerProfileId: str
    moduleId: str
    circuitModelId: str
    adapter: str
    shots: int
    status: str  # "SUCCEEDED" | "FAILED" | "TIMEOUT"
    probabilities: dict[str, float]
    counts: dict[str, int]
    stateTrace: list[StateTraceStepOut]
    conformance: ConformanceResult
    durationMs: int
    createdAt: str


# ---------------------------------------------------------------------------
# HTTP response wrappers
# ---------------------------------------------------------------------------


class SimulationRunResponse(BaseModel):
    """POST /v1/simulation-runs → 201"""

    simulationRun: SimulationRunOut


class SimulationRunGetResponse(BaseModel):
    """GET /v1/simulation-runs/{id} → 200"""

    simulationRun: SimulationRunOut
