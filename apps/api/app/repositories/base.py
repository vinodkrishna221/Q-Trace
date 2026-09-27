"""Base repository protocols for Q-Trace data analytics and persistence."""

from typing import Optional, Protocol, runtime_checkable
from app.models.entities import (
    Challenge,
    ChallengeAttempt,
    CircuitModel,
    InstructorInsight,
    InstructorProfile,
    LearnerProfile,
    LearningPath,
    MisconceptionSignal,
    Module,
    ModuleLevel,
    PredictionCheckpoint,
    ProgressRecord,
    SimulationRun,
    SkillState,
)
from app.models.auth import (
    InstitutionWaitlistRecord,
    PasswordResetRecord,
    RefreshTokenRecord,
    User,
)


@runtime_checkable
class DataRepositoryProtocol(Protocol):
    """Unified repository protocol for Q-Trace domain persistence."""

    # --- Lifecycle & Maintenance ---
    async def reset(self) -> None:
        """Reset the datastore to a clean baseline state."""
        ...

    # --- Learner & Instructor Profiles ---
    async def get_learner_profile(self, profile_id: str) -> Optional[LearnerProfile]:
        """Retrieve a learner profile by its unique ID."""
        ...

    async def list_learner_profiles(
        self, cohort_id: Optional[str] = None
    ) -> list[LearnerProfile]:
        """List learner profiles, optionally filtered by cohort ID."""
        ...

    async def create_or_update_learner_profile(
        self, profile: LearnerProfile
    ) -> LearnerProfile:
        """Upsert a learner profile."""
        ...

    async def get_instructor_profile(self, profile_id: str) -> Optional[InstructorProfile]:
        """Retrieve an instructor profile by its ID."""
        ...

    async def create_or_update_instructor_profile(
        self, profile: InstructorProfile
    ) -> InstructorProfile:
        """Upsert an instructor profile."""
        ...

    # --- Learning Paths ---
    async def get_learning_path(self, path_id: str) -> Optional[LearningPath]:
        """Retrieve a learning path by ID."""
        ...

    async def get_learning_path_by_learner(
        self, learner_profile_id: str
    ) -> Optional[LearningPath]:
        """Retrieve active learning path for a learner."""
        ...

    async def create_or_update_learning_path(
        self, path: LearningPath
    ) -> LearningPath:
        """Upsert a learning path."""
        ...

    # --- Modules & Checkpoints ---
    async def get_module(self, module_id: str) -> Optional[Module]:
        """Retrieve a module by ID."""
        ...

    async def get_module_by_slug(self, slug: str) -> Optional[Module]:
        """Retrieve a module by route slug."""
        ...

    async def list_modules(
        self, level: Optional[ModuleLevel] = None, limit: int = 10
    ) -> list[Module]:
        """List modules, optionally filtered by level with limit."""
        ...

    async def create_or_update_module(self, module: Module) -> Module:
        """Upsert a learning module."""
        ...

    async def get_prediction_checkpoint(
        self, checkpoint_id: str
    ) -> Optional[PredictionCheckpoint]:
        """Retrieve a prediction checkpoint by ID."""
        ...

    async def get_prediction_checkpoint_by_module(
        self, module_id: str
    ) -> Optional[PredictionCheckpoint]:
        """Retrieve prediction checkpoint associated with a module."""
        ...

    async def create_or_update_prediction_checkpoint(
        self, checkpoint: PredictionCheckpoint
    ) -> PredictionCheckpoint:
        """Upsert a prediction checkpoint."""
        ...

    # --- Circuit Models ---
    async def get_circuit_model(self, circuit_id: str) -> Optional[CircuitModel]:
        """Retrieve a circuit model by ID."""
        ...

    async def list_circuit_models_by_owner(
        self, owner_learner_profile_id: str
    ) -> list[CircuitModel]:
        """List saved circuit models owned by a learner."""
        ...

    async def create_or_update_circuit_model(
        self, circuit: CircuitModel
    ) -> CircuitModel:
        """Upsert a circuit model."""
        ...

    # --- Simulation Runs ---
    async def get_simulation_run(self, run_id: str) -> Optional[SimulationRun]:
        """Retrieve a simulation run by ID."""
        ...

    async def list_simulation_runs(
        self,
        learner_profile_id: Optional[str] = None,
        module_id: Optional[str] = None,
        limit: int = 50,
    ) -> list[SimulationRun]:
        """List simulation runs filtered by learner profile or module."""
        ...

    async def create_simulation_run(self, run: SimulationRun) -> SimulationRun:
        """Persist a new simulation run."""
        ...

    # --- Misconception Signals ---
    async def get_misconception_signal(
        self, signal_id: str
    ) -> Optional[MisconceptionSignal]:
        """Retrieve a misconception signal by ID."""
        ...

    async def get_misconception_signal_by_run(
        self, simulation_run_id: str
    ) -> Optional[MisconceptionSignal]:
        """Retrieve a misconception signal for a specific simulation run."""
        ...

    async def list_misconception_signals(
        self, learner_profile_id: Optional[str] = None
    ) -> list[MisconceptionSignal]:
        """List misconception signals, optionally filtered by learner."""
        ...

    async def create_misconception_signal(
        self, signal: MisconceptionSignal
    ) -> MisconceptionSignal:
        """Persist a misconception signal."""
        ...

    # --- Challenges & Attempts ---
    async def get_challenge(self, challenge_id: str) -> Optional[Challenge]:
        """Retrieve a challenge by ID."""
        ...

    async def list_challenges_by_module(self, module_id: str) -> list[Challenge]:
        """List challenges belonging to a module."""
        ...

    async def create_or_update_challenge(self, challenge: Challenge) -> Challenge:
        """Upsert a challenge."""
        ...

    async def get_challenge_attempt(self, attempt_id: str) -> Optional[ChallengeAttempt]:
        """Retrieve a challenge attempt by ID."""
        ...

    async def list_challenge_attempts(
        self,
        learner_profile_id: Optional[str] = None,
        challenge_id: Optional[str] = None,
    ) -> list[ChallengeAttempt]:
        """List challenge attempts filtered by learner or challenge."""
        ...

    async def get_next_attempt_number(
        self, learner_profile_id: str, challenge_id: str
    ) -> int:
        """Compute the next attempt number for a learner/challenge pair."""
        ...

    async def create_challenge_attempt(
        self, attempt: ChallengeAttempt
    ) -> ChallengeAttempt:
        """Persist a challenge attempt."""
        ...

    # --- Progress Records & Atomic Updates ---
    async def get_progress_record(self, progress_id: str) -> Optional[ProgressRecord]:
        """Retrieve a progress record by ID."""
        ...

    async def get_progress_record_by_learner(
        self, learner_profile_id: str
    ) -> Optional[ProgressRecord]:
        """Retrieve progress record for a learner."""
        ...

    async def create_or_update_progress_record(
        self, record: ProgressRecord
    ) -> ProgressRecord:
        """Upsert a progress record."""
        ...

    async def record_attempt_and_update_progress(
        self,
        attempt: ChallengeAttempt,
        points_earned: int,
        completed_module_id: Optional[str] = None,
        updated_skills: Optional[list[SkillState]] = None,
        misconception_code: Optional[str] = None,
    ) -> tuple[ChallengeAttempt, ProgressRecord]:
        """Atomically record a challenge attempt and update the learner's progress record."""
        ...

    # --- Instructor Insights ---
    async def get_instructor_insight(
        self, cohort_id: str
    ) -> Optional[InstructorInsight]:
        """Compute aggregate instructor insights for a cohort."""
        ...

    # --- Authentication & Identity (docs/AUTH-SYSTEM-DESIGN.md) ---
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Retrieve a user by unique usr_ ID."""
        ...

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Retrieve a user by email address."""
        ...

    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Retrieve a user by username."""
        ...

    async def get_user_by_identifier(self, identifier: str) -> Optional[User]:
        """Retrieve a user by email or username."""
        ...

    async def get_user_by_github_id(self, github_id: str) -> Optional[User]:
        """Retrieve a user by GitHub user ID."""
        ...

    async def get_user_by_verification_token_hash(self, token_hash: str) -> Optional[User]:
        """Retrieve a user by their email verification token hash."""
        ...

    async def create_or_update_user(self, user: User) -> User:
        """Upsert user document."""
        ...

    async def delete_user(self, user_id: str) -> bool:
        """Delete user document."""
        ...

    # --- Refresh Tokens & Family Rotation ---
    async def create_refresh_token(self, record: RefreshTokenRecord) -> RefreshTokenRecord:
        """Persist a refresh token record."""
        ...

    async def get_refresh_token_by_hash(self, token_hash: str) -> Optional[RefreshTokenRecord]:
        """Lookup refresh token by its SHA-256 hash."""
        ...

    async def update_refresh_token_status(
        self, token_id: str, status: str
    ) -> Optional[RefreshTokenRecord]:
        """Update token status (ACTIVE, USED, REVOKED)."""
        ...

    async def consume_refresh_token(self, token_hash: str) -> tuple[str, Optional[RefreshTokenRecord]]:
        """Atomically validate and consume a refresh token.
        
        Returns:
            (outcome, record) where outcome is "NOT_FOUND", "REPLAY", "EXPIRED", or "SUCCESS"
        """
        ...

    async def revoke_refresh_token_family(self, family_id: str) -> int:
        """Revoke all tokens belonging to a family upon replay detection."""
        ...

    async def revoke_all_user_refresh_tokens(self, user_id: str) -> int:
        """Revoke all active tokens for a user (e.g. logout all, password reset)."""
        ...

    # --- Password Resets ---
    async def create_password_reset(self, record: PasswordResetRecord) -> PasswordResetRecord:
        """Persist a single-use password reset record."""
        ...

    async def get_password_reset_by_hash(self, token_hash: str) -> Optional[PasswordResetRecord]:
        """Retrieve password reset record by token hash."""
        ...

    async def mark_password_reset_used(self, reset_id: str) -> bool:
        """Mark a password reset token as used."""
        ...

    # --- Institutional Waitlist ---
    async def add_institution_waitlist(
        self, record: InstitutionWaitlistRecord
    ) -> InstitutionWaitlistRecord:
        """Add institutional lead to the waitlist."""
        ...

    async def get_institution_waitlist_by_email(
        self, work_email: str
    ) -> Optional[InstitutionWaitlistRecord]:
        """Retrieve waitlist record by academic/work email."""
        ...

    async def count_institution_waitlist(self) -> int:
        """Count total waitlisted institutions."""
        ...

