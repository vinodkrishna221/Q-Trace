"""Pydantic entity models for Q-Trace data domain."""

from datetime import datetime, timezone
from typing import Any, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


def utc_now_iso() -> str:
    """Return current UTC timestamp in ISO-8601 format."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


# --- Learner Profile ---

LearnerRole = Literal["BEGINNER_CSE", "PHYSICS_TO_CODE"]


class PriorKnowledge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    python: bool = False
    linearAlgebra: bool = False
    quantumTheory: bool = False
    circuitProgramming: bool = False


class LearnerProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    displayName: str
    role: LearnerRole
    cohortId: str
    priorKnowledge: PriorKnowledge
    completedSkillIds: list[str] = Field(default_factory=list)
    activeLearningPathId: str
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=utc_now_iso)
    updatedAt: str = Field(default_factory=utc_now_iso)


class InstructorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    displayName: str
    cohortId: str


# --- Learning Path ---

EntryBand = Literal["FOUNDATIONS", "THEORY_TO_CODE"]


class LearningPath(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    learnerProfileId: str
    entryBand: EntryBand
    moduleIds: list[str] = Field(default_factory=list)
    currentModuleId: str
    recommendationReason: str
    schemaVersion: int = 1
    updatedAt: str = Field(default_factory=utc_now_iso)


# --- Module & Prediction Checkpoint ---

ContentBlockType = Literal["TEXT", "CALLOUT", "FORMULA", "CIRCUIT_PREVIEW"]


class ContentBlock(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: ContentBlockType
    body: Optional[str] = None
    tone: Optional[Literal["INFO", "CAUTION"]] = None
    latex: Optional[str] = None
    circuitModelId: Optional[str] = None


class PredictionCheckpoint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    moduleId: str
    prompt: str
    answerSchema: dict[str, Any]
    misconceptionMap: dict[str, str] = Field(default_factory=dict)
    schemaVersion: int = 1


ModuleLevel = Literal["FOUNDATION", "INTERMEDIATE"]


class Module(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    slug: str
    title: str
    skillIds: list[str] = Field(default_factory=list)
    level: ModuleLevel = "FOUNDATION"
    estimatedMinutes: int = 15
    contentBlocks: list[dict[str, Any]] = Field(default_factory=list)
    predictionCheckpointId: Optional[str] = None
    starterCircuitModelId: Optional[str] = None
    challengeIds: list[str] = Field(default_factory=list)
    schemaVersion: int = 1


# --- Circuit Model ---

GateName = Literal["H", "X", "Y", "Z", "CNOT", "MEASURE"]


class Operation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    opId: str
    gate: GateName
    targets: list[int] = Field(default_factory=list)
    controls: list[int] = Field(default_factory=list)
    classicalTargets: list[int] = Field(default_factory=list)
    column: int = 0


CircuitModelSource = Literal["BUILDER", "SUPPORTED_QISKIT", "SEED"]


class CircuitModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    qubitCount: int = 2
    classicalBitCount: int = 2
    operations: list[Operation] = Field(default_factory=list)
    source: CircuitModelSource = "SEED"
    ownerLearnerProfileId: Optional[str] = None
    openQasm3: Optional[str] = None
    modelVersion: int = 1
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


# --- Simulation Run ---

SimulationRunStatus = Literal["SUCCEEDED", "FAILED"]
SimulationAdapter = Literal["QISKIT_AER", "PENNYLANE"]


class SimulationRun(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    learnerProfileId: str
    moduleId: str
    circuitModelId: str
    circuitSnapshot: Optional[dict[str, Any]] = None
    predictionResponse: Optional[dict[str, Any]] = None
    adapter: SimulationAdapter = "QISKIT_AER"
    shots: int = 1024
    status: SimulationRunStatus = "SUCCEEDED"
    probabilities: dict[str, float] = Field(default_factory=dict)
    counts: dict[str, int] = Field(default_factory=dict)
    stateTrace: list[dict[str, Any]] = Field(default_factory=list)
    conformance: Optional[dict[str, Any]] = None
    durationMs: int = 0
    error: Optional[dict[str, Any]] = None
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=utc_now_iso)


# --- Misconception Signal ---

MisconceptionCode = Literal[
    "SUPERPOSITION_VS_ENTANGLEMENT",
    "MEASUREMENT_DETERMINISM",
    "GATE_ORDER",
    "NO_SIGNAL",
]


class MisconceptionSignal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    learnerProfileId: str
    simulationRunId: str
    code: MisconceptionCode
    firstDivergenceStep: Optional[int] = None
    evidence: dict[str, Any] = Field(default_factory=dict)
    confidence: float = 1.0
    repairChallengeId: Optional[str] = None
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=utc_now_iso)


# --- Challenge & Attempt ---

ChallengeType = Literal["QUIZ", "CIRCUIT_REPAIR"]


class Challenge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    moduleId: str
    type: ChallengeType
    title: str
    prompt: str
    starterCircuitModelId: Optional[str] = None
    acceptanceRule: dict[str, Any] = Field(default_factory=dict)
    targetsMisconceptionCodes: list[str] = Field(default_factory=list)
    points: int = 100
    schemaVersion: int = 1


class ChallengeAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    challengeId: str
    learnerProfileId: str
    simulationRunId: Optional[str] = None
    submittedAnswer: dict[str, Any] = Field(default_factory=dict)
    passed: bool
    score: int = 0
    feedbackCode: str = ""
    attemptNumber: int = 1
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=utc_now_iso)


# --- Progress Record ---

SkillStatus = Literal["NOT_STARTED", "PRACTICING", "MASTERED"]


class SkillState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    skillId: str
    status: SkillStatus = "NOT_STARTED"
    score: int = 0


class MisconceptionSummaryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str
    count: int = 0
    latestAt: str


class ProgressRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    learnerProfileId: str
    completedModuleIds: list[str] = Field(default_factory=list)
    skillStates: list[SkillState] = Field(default_factory=list)
    latestChallengeAttemptId: Optional[str] = None
    misconceptionSummary: list[MisconceptionSummaryItem] = Field(default_factory=list)
    totalPoints: int = 0
    schemaVersion: int = 1
    updatedAt: str = Field(default_factory=utc_now_iso)


# --- Instructor Insight ---


class CohortModuleCompletion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    moduleId: str
    completed: int
    assigned: int


class CohortChallengePassRate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    challengeId: str
    passed: int
    attempted: int
    rate: float


class CohortTopMisconception(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str
    learnerCount: int
    occurrences: int


class CohortLiveDemoLearner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    learnerProfileId: str
    latestAttemptPassed: bool


class InstructorInsight(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cohortId: str
    generatedAt: str = Field(default_factory=utc_now_iso)
    learnerCount: int = 0
    moduleCompletion: list[CohortModuleCompletion] = Field(default_factory=list)
    challengePassRate: list[CohortChallengePassRate] = Field(default_factory=list)
    topMisconceptions: list[CohortTopMisconception] = Field(default_factory=list)
    liveDemoLearner: Optional[CohortLiveDemoLearner] = None
    dataDisclosure: str = "Synthetic seeded cohort plus current live demo attempt"
