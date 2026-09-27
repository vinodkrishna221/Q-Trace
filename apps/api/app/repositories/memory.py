"""In-memory deterministic repository implementation for Q-Trace."""

import asyncio
import time
from typing import Optional
from app.models.entities import (
    Challenge,
    ChallengeAttempt,
    CircuitModel,
    CohortChallengePassRate,
    CohortLiveDemoLearner,
    CohortModuleCompletion,
    CohortTopMisconception,
    InstructorInsight,
    InstructorProfile,
    LearnerProfile,
    LearningPath,
    MisconceptionSignal,
    MisconceptionSummaryItem,
    Module,
    ModuleLevel,
    PredictionCheckpoint,
    ProgressRecord,
    SimulationRun,
    SkillState,
    utc_now_iso,
)
from app.models.auth import (
    InstitutionWaitlistRecord,
    PasswordResetRecord,
    RefreshTokenRecord,
    User,
    is_expired,
)
from app.repositories.base import DataRepositoryProtocol


class InMemoryRepository(DataRepositoryProtocol):
    """Thread-safe, deterministic in-memory datastore conforming to DataRepositoryProtocol."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._learner_profiles: dict[str, LearnerProfile] = {}
        self._instructor_profiles: dict[str, InstructorProfile] = {}
        self._learning_paths: dict[str, LearningPath] = {}
        self._modules: dict[str, Module] = {}
        self._prediction_checkpoints: dict[str, PredictionCheckpoint] = {}
        self._circuit_models: dict[str, CircuitModel] = {}
        self._simulation_runs: dict[str, SimulationRun] = {}
        self._misconception_signals: dict[str, MisconceptionSignal] = {}
        self._challenges: dict[str, Challenge] = {}
        self._challenge_attempts: dict[str, ChallengeAttempt] = {}
        self._progress_records: dict[str, ProgressRecord] = {}
        self._insight_cache: dict[str, tuple[float, InstructorInsight]] = {}
        self._users: dict[str, User] = {}
        self._refresh_tokens: dict[str, RefreshTokenRecord] = {}
        self._password_resets: dict[str, PasswordResetRecord] = {}
        self._institution_waitlist: dict[str, InstitutionWaitlistRecord] = {}

    # --- Lifecycle ---

    async def reset(self) -> None:
        """Reset all collections to empty state."""
        async with self._lock:
            self._learner_profiles.clear()
            self._instructor_profiles.clear()
            self._learning_paths.clear()
            self._modules.clear()
            self._prediction_checkpoints.clear()
            self._circuit_models.clear()
            self._simulation_runs.clear()
            self._misconception_signals.clear()
            self._challenges.clear()
            self._challenge_attempts.clear()
            self._progress_records.clear()
            self._insight_cache.clear()
            self._users.clear()
            self._refresh_tokens.clear()
            self._password_resets.clear()
            self._institution_waitlist.clear()

    # --- Learner & Instructor Profiles ---

    async def get_learner_profile(self, profile_id: str) -> Optional[LearnerProfile]:
        async with self._lock:
            return self._learner_profiles.get(profile_id)

    async def list_learner_profiles(
        self, cohort_id: Optional[str] = None
    ) -> list[LearnerProfile]:
        async with self._lock:
            profiles = list(self._learner_profiles.values())
            if cohort_id is not None:
                profiles = [p for p in profiles if p.cohortId == cohort_id]
            return sorted(profiles, key=lambda p: p.id)

    async def create_or_update_learner_profile(
        self, profile: LearnerProfile
    ) -> LearnerProfile:
        async with self._lock:
            self._learner_profiles[profile.id] = profile
            return profile

    async def get_instructor_profile(
        self, profile_id: str
    ) -> Optional[InstructorProfile]:
        async with self._lock:
            return self._instructor_profiles.get(profile_id)

    async def create_or_update_instructor_profile(
        self, profile: InstructorProfile
    ) -> InstructorProfile:
        async with self._lock:
            self._instructor_profiles[profile.id] = profile
            return profile

    # --- Learning Paths ---

    async def get_learning_path(self, path_id: str) -> Optional[LearningPath]:
        async with self._lock:
            return self._learning_paths.get(path_id)

    async def get_learning_path_by_learner(
        self, learner_profile_id: str
    ) -> Optional[LearningPath]:
        async with self._lock:
            for path in self._learning_paths.values():
                if path.learnerProfileId == learner_profile_id:
                    return path
            return None

    async def create_or_update_learning_path(
        self, path: LearningPath
    ) -> LearningPath:
        async with self._lock:
            self._learning_paths[path.id] = path
            return path

    # --- Modules & Checkpoints ---

    async def get_module(self, module_id: str) -> Optional[Module]:
        async with self._lock:
            return self._modules.get(module_id)

    async def get_module_by_slug(self, slug: str) -> Optional[Module]:
        async with self._lock:
            for module in self._modules.values():
                if module.slug == slug:
                    return module
            return None

    async def list_modules(
        self, level: Optional[ModuleLevel] = None, limit: int = 10
    ) -> list[Module]:
        async with self._lock:
            modules = list(self._modules.values())
            if level is not None:
                modules = [m for m in modules if m.level == level]
            modules = sorted(modules, key=lambda m: m.id)
            return modules[:limit]

    async def create_or_update_module(self, module: Module) -> Module:
        async with self._lock:
            self._modules[module.id] = module
            return module

    async def get_prediction_checkpoint(
        self, checkpoint_id: str
    ) -> Optional[PredictionCheckpoint]:
        async with self._lock:
            return self._prediction_checkpoints.get(checkpoint_id)

    async def get_prediction_checkpoint_by_module(
        self, module_id: str
    ) -> Optional[PredictionCheckpoint]:
        async with self._lock:
            for cp in self._prediction_checkpoints.values():
                if cp.moduleId == module_id:
                    return cp
            return None

    async def create_or_update_prediction_checkpoint(
        self, checkpoint: PredictionCheckpoint
    ) -> PredictionCheckpoint:
        async with self._lock:
            self._prediction_checkpoints[checkpoint.id] = checkpoint
            return checkpoint

    # --- Circuit Models ---

    async def get_circuit_model(self, circuit_id: str) -> Optional[CircuitModel]:
        async with self._lock:
            return self._circuit_models.get(circuit_id)

    async def list_circuit_models_by_owner(
        self, owner_learner_profile_id: str
    ) -> list[CircuitModel]:
        async with self._lock:
            circuits = [
                c
                for c in self._circuit_models.values()
                if c.ownerLearnerProfileId == owner_learner_profile_id
            ]
            return sorted(circuits, key=lambda c: c.id)

    async def create_or_update_circuit_model(
        self, circuit: CircuitModel
    ) -> CircuitModel:
        async with self._lock:
            self._circuit_models[circuit.id] = circuit
            return circuit

    # --- Simulation Runs ---

    async def get_simulation_run(self, run_id: str) -> Optional[SimulationRun]:
        async with self._lock:
            return self._simulation_runs.get(run_id)

    async def list_simulation_runs(
        self,
        learner_profile_id: Optional[str] = None,
        module_id: Optional[str] = None,
        limit: int = 50,
    ) -> list[SimulationRun]:
        async with self._lock:
            runs = list(self._simulation_runs.values())
            if learner_profile_id is not None:
                runs = [r for r in runs if r.learnerProfileId == learner_profile_id]
            if module_id is not None:
                runs = [r for r in runs if r.moduleId == module_id]
            runs = sorted(runs, key=lambda r: r.createdAt, reverse=True)
            return runs[:limit]

    async def create_simulation_run(self, run: SimulationRun) -> SimulationRun:
        async with self._lock:
            self._simulation_runs[run.id] = run
            return run

    # --- Misconception Signals ---

    async def get_misconception_signal(
        self, signal_id: str
    ) -> Optional[MisconceptionSignal]:
        async with self._lock:
            return self._misconception_signals.get(signal_id)

    async def get_misconception_signal_by_run(
        self, simulation_run_id: str
    ) -> Optional[MisconceptionSignal]:
        async with self._lock:
            for signal in self._misconception_signals.values():
                if signal.simulationRunId == simulation_run_id:
                    return signal
            return None

    async def list_misconception_signals(
        self, learner_profile_id: Optional[str] = None
    ) -> list[MisconceptionSignal]:
        async with self._lock:
            signals = list(self._misconception_signals.values())
            if learner_profile_id is not None:
                signals = [
                    s for s in signals if s.learnerProfileId == learner_profile_id
                ]
            return sorted(signals, key=lambda s: s.createdAt, reverse=True)

    async def create_misconception_signal(
        self, signal: MisconceptionSignal
    ) -> MisconceptionSignal:
        async with self._lock:
            self._misconception_signals[signal.id] = signal
            return signal

    # --- Challenges & Attempts ---

    async def get_challenge(self, challenge_id: str) -> Optional[Challenge]:
        async with self._lock:
            return self._challenges.get(challenge_id)

    async def list_challenges_by_module(self, module_id: str) -> list[Challenge]:
        async with self._lock:
            challenges = [
                c for c in self._challenges.values() if c.moduleId == module_id
            ]
            return sorted(challenges, key=lambda c: c.id)

    async def create_or_update_challenge(self, challenge: Challenge) -> Challenge:
        async with self._lock:
            self._challenges[challenge.id] = challenge
            return challenge

    async def get_challenge_attempt(
        self, attempt_id: str
    ) -> Optional[ChallengeAttempt]:
        async with self._lock:
            return self._challenge_attempts.get(attempt_id)

    async def list_challenge_attempts(
        self,
        learner_profile_id: Optional[str] = None,
        challenge_id: Optional[str] = None,
    ) -> list[ChallengeAttempt]:
        async with self._lock:
            attempts = list(self._challenge_attempts.values())
            if learner_profile_id is not None:
                attempts = [
                    a for a in attempts if a.learnerProfileId == learner_profile_id
                ]
            if challenge_id is not None:
                attempts = [a for a in attempts if a.challengeId == challenge_id]
            return sorted(attempts, key=lambda a: a.createdAt)

    async def get_next_attempt_number(
        self, learner_profile_id: str, challenge_id: str
    ) -> int:
        async with self._lock:
            matching = [
                a
                for a in self._challenge_attempts.values()
                if a.learnerProfileId == learner_profile_id
                and a.challengeId == challenge_id
            ]
            return len(matching) + 1

    async def create_challenge_attempt(
        self, attempt: ChallengeAttempt
    ) -> ChallengeAttempt:
        async with self._lock:
            self._challenge_attempts[attempt.id] = attempt
            return attempt

    # --- Progress Records & Atomic Transactions ---

    async def get_progress_record(self, progress_id: str) -> Optional[ProgressRecord]:
        async with self._lock:
            return self._progress_records.get(progress_id)

    async def get_progress_record_by_learner(
        self, learner_profile_id: str
    ) -> Optional[ProgressRecord]:
        async with self._lock:
            for record in self._progress_records.values():
                if record.learnerProfileId == learner_profile_id:
                    return record
            return None

    async def create_or_update_progress_record(
        self, record: ProgressRecord
    ) -> ProgressRecord:
        async with self._lock:
            self._progress_records[record.id] = record
            return record

    async def record_attempt_and_update_progress(
        self,
        attempt: ChallengeAttempt,
        points_earned: int,
        completed_module_id: Optional[str] = None,
        updated_skills: Optional[list[SkillState]] = None,
        misconception_code: Optional[str] = None,
    ) -> tuple[ChallengeAttempt, ProgressRecord]:
        """Atomically persist attempt and update learner's progress record."""
        async with self._lock:
            # 1. Save attempt
            self._challenge_attempts[attempt.id] = attempt

            # 2. Retrieve or create ProgressRecord
            progress: Optional[ProgressRecord] = None
            for p in self._progress_records.values():
                if p.learnerProfileId == attempt.learnerProfileId:
                    progress = p
                    break

            now_iso = attempt.createdAt or utc_now_iso()

            if progress is None:
                progress = ProgressRecord(
                    id=f"progress_{attempt.learnerProfileId}",
                    learnerProfileId=attempt.learnerProfileId,
                    completedModuleIds=[],
                    skillStates=[],
                    latestChallengeAttemptId=attempt.id,
                    misconceptionSummary=[],
                    totalPoints=points_earned,
                    schemaVersion=1,
                    updatedAt=now_iso,
                )
            else:
                progress.latestChallengeAttemptId = attempt.id
                progress.totalPoints += points_earned
                progress.updatedAt = now_iso

            # 3. Update completed modules if provided
            if (
                completed_module_id
                and completed_module_id not in progress.completedModuleIds
            ):
                progress.completedModuleIds.append(completed_module_id)

            # 4. Update skill states if provided
            if updated_skills:
                skill_map = {s.skillId: s for s in progress.skillStates}
                for new_skill in updated_skills:
                    skill_map[new_skill.skillId] = new_skill
                progress.skillStates = list(skill_map.values())

            # 5. Update misconception summary if provided
            if misconception_code:
                found = False
                for item in progress.misconceptionSummary:
                    if item.code == misconception_code:
                        item.count += 1
                        item.latestAt = now_iso
                        found = True
                        break
                if not found:
                    progress.misconceptionSummary.append(
                        MisconceptionSummaryItem(
                            code=misconception_code,
                            count=1,
                            latestAt=now_iso,
                        )
                    )

            # 6. Save updated progress record
            self._progress_records[progress.id] = progress
            self._insight_cache.clear()

            return attempt, progress

    # --- Instructor Insights ---

    async def get_instructor_insight(
        self, cohort_id: str
    ) -> Optional[InstructorInsight]:
        async with self._lock:
            now_ts = time.time()
            if cohort_id in self._insight_cache:
                cached_ts, cached_insight = self._insight_cache[cohort_id]
                if now_ts - cached_ts < 10.0:
                    return cached_insight

            cohort_learners = [
                p for p in self._learner_profiles.values() if p.cohortId == cohort_id
            ]
            if not cohort_learners:
                return None

            learner_ids = {p.id for p in cohort_learners}
            learner_count = len(cohort_learners)

            # Module completion rates
            module_completions: dict[str, int] = {}
            for p in self._progress_records.values():
                if p.learnerProfileId in learner_ids:
                    for mod_id in p.completedModuleIds:
                        module_completions[mod_id] = (
                            module_completions.get(mod_id, 0) + 1
                        )

            module_completion_list = [
                CohortModuleCompletion(
                    moduleId=mod_id,
                    completed=count,
                    assigned=learner_count,
                )
                for mod_id, count in sorted(module_completions.items())
            ]

            # Challenge pass rates
            challenge_attempts: dict[str, list[ChallengeAttempt]] = {}
            for a in self._challenge_attempts.values():
                if a.learnerProfileId in learner_ids:
                    challenge_attempts.setdefault(a.challengeId, []).append(a)

            challenge_pass_rates: list[CohortChallengePassRate] = []
            for ch_id, attempts in sorted(challenge_attempts.items()):
                attempted = len(attempts)
                passed = sum(1 for a in attempts if a.passed)
                rate = round(passed / attempted, 4) if attempted > 0 else 0.0
                challenge_pass_rates.append(
                    CohortChallengePassRate(
                        challengeId=ch_id,
                        passed=passed,
                        attempted=attempted,
                        rate=rate,
                    )
                )

            # Top misconceptions
            misconceptions_count: dict[str, int] = {}
            misconceptions_learners: dict[str, set[str]] = {}
            for s in self._misconception_signals.values():
                if s.learnerProfileId in learner_ids and s.code != "NO_SIGNAL":
                    misconceptions_count[s.code] = (
                        misconceptions_count.get(s.code, 0) + 1
                    )
                    misconceptions_learners.setdefault(s.code, set()).add(
                        s.learnerProfileId
                    )

            top_misconceptions = [
                CohortTopMisconception(
                    code=code,
                    learnerCount=len(misconceptions_learners[code]),
                    occurrences=count,
                )
                for code, count in sorted(
                    misconceptions_count.items(), key=lambda x: x[1], reverse=True
                )
            ]

            # Live demo learner check (Aarav lp_aarav if in cohort)
            live_demo_learner: Optional[CohortLiveDemoLearner] = None
            if "lp_aarav" in learner_ids:
                aarav_attempts = [
                    a
                    for a in self._challenge_attempts.values()
                    if a.learnerProfileId == "lp_aarav"
                ]
                latest_passed = (
                    aarav_attempts[-1].passed if aarav_attempts else False
                )
                live_demo_learner = CohortLiveDemoLearner(
                    learnerProfileId="lp_aarav",
                    latestAttemptPassed=latest_passed,
                )

            insight = InstructorInsight(
                cohortId=cohort_id,
                generatedAt=utc_now_iso(),
                learnerCount=learner_count,
                moduleCompletion=module_completion_list,
                challengePassRate=challenge_pass_rates,
                topMisconceptions=top_misconceptions,
                liveDemoLearner=live_demo_learner,
                dataDisclosure="Synthetic seeded cohort plus current live demo attempt",
            )
            self._insight_cache[cohort_id] = (now_ts, insight)
            return insight

    # --- Authentication & Identity (docs/AUTH-SYSTEM-DESIGN.md) ---

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        async with self._lock:
            return self._users.get(user_id)

    async def get_user_by_email(self, email: str) -> Optional[User]:
        target = email.strip().lower()
        async with self._lock:
            for user in self._users.values():
                if user.email.lower() == target:
                    return user
            return None

    async def get_user_by_username(self, username: str) -> Optional[User]:
        target = username.strip().lower()
        async with self._lock:
            for user in self._users.values():
                if user.username.lower() == target:
                    return user
            return None

    async def get_user_by_identifier(self, identifier: str) -> Optional[User]:
        target = identifier.strip().lower()
        async with self._lock:
            for user in self._users.values():
                if user.email.lower() == target or user.username.lower() == target:
                    return user
            return None

    async def get_user_by_github_id(self, github_id: str) -> Optional[User]:
        async with self._lock:
            for user in self._users.values():
                if user.githubId == github_id:
                    return user
            return None

    async def get_user_by_verification_token_hash(self, token_hash: str) -> Optional[User]:
        async with self._lock:
            for user in self._users.values():
                if user.verificationTokenHash == token_hash:
                    return user
            return None

    async def create_or_update_user(self, user: User) -> User:
        async with self._lock:
            uid = user.id or getattr(user, "_id", "")
            if not uid:
                import uuid
                uid = f"usr_{uuid.uuid4().hex[:12]}"
                user.id = uid
            user.updatedAt = utc_now_iso()
            self._users[uid] = user
            return user

    async def delete_user(self, user_id: str) -> bool:
        async with self._lock:
            return bool(self._users.pop(user_id, None))

    # --- Refresh Tokens & Family Rotation ---

    async def create_refresh_token(self, record: RefreshTokenRecord) -> RefreshTokenRecord:
        async with self._lock:
            rid = record.id or getattr(record, "_id", "")
            if not rid:
                import uuid
                rid = f"rtk_{uuid.uuid4().hex[:12]}"
                record.id = rid
            self._refresh_tokens[rid] = record
            return record

    async def get_refresh_token_by_hash(self, token_hash: str) -> Optional[RefreshTokenRecord]:
        async with self._lock:
            for rtk in self._refresh_tokens.values():
                if rtk.tokenHash == token_hash:
                    return rtk
            return None

    async def update_refresh_token_status(
        self, token_id: str, status: str
    ) -> Optional[RefreshTokenRecord]:
        async with self._lock:
            rtk = self._refresh_tokens.get(token_id)
            if rtk:
                rtk.status = status  # type: ignore
                return rtk
            return None

    async def consume_refresh_token(
        self, token_hash: str
    ) -> tuple[str, Optional[RefreshTokenRecord]]:
        async with self._lock:
            target_record: Optional[RefreshTokenRecord] = None
            for rtk in self._refresh_tokens.values():
                if rtk.tokenHash == token_hash:
                    target_record = rtk
                    break

            if not target_record:
                return ("NOT_FOUND", None)

            if target_record.status in ("USED", "REVOKED"):
                return ("REPLAY", target_record)

            if is_expired(target_record.expiresAt):
                target_record.status = "REVOKED"
                return ("EXPIRED", target_record)

            target_record.status = "USED"
            return ("SUCCESS", target_record)

    async def revoke_refresh_token_family(self, family_id: str) -> int:
        count = 0
        async with self._lock:
            for rtk in self._refresh_tokens.values():
                if rtk.familyId == family_id and rtk.status != "REVOKED":
                    rtk.status = "REVOKED"
                    count += 1
            return count

    async def revoke_all_user_refresh_tokens(self, user_id: str) -> int:
        count = 0
        async with self._lock:
            for rtk in self._refresh_tokens.values():
                if rtk.userId == user_id and rtk.status != "REVOKED":
                    rtk.status = "REVOKED"
                    count += 1
            return count

    # --- Password Resets ---

    async def create_password_reset(self, record: PasswordResetRecord) -> PasswordResetRecord:
        async with self._lock:
            rid = record.id or getattr(record, "_id", "")
            if not rid:
                import uuid
                rid = f"rst_{uuid.uuid4().hex[:12]}"
                record.id = rid
            self._password_resets[rid] = record
            return record

    async def get_password_reset_by_hash(self, token_hash: str) -> Optional[PasswordResetRecord]:
        async with self._lock:
            for pr in self._password_resets.values():
                if pr.tokenHash == token_hash:
                    return pr
            return None

    async def mark_password_reset_used(self, reset_id: str) -> bool:
        async with self._lock:
            pr = self._password_resets.get(reset_id)
            if pr:
                pr.used = True
                return True
            return False

    # --- Institutional Waitlist ---

    async def add_institution_waitlist(
        self, record: InstitutionWaitlistRecord
    ) -> InstitutionWaitlistRecord:
        async with self._lock:
            wid = record.id or getattr(record, "_id", "")
            if not wid:
                import uuid
                wid = f"wtl_{uuid.uuid4().hex[:12]}"
                record.id = wid
            record.waitlistPosition = len(self._institution_waitlist) + 1
            self._institution_waitlist[wid] = record
            return record

    async def get_institution_waitlist_by_email(
        self, work_email: str
    ) -> Optional[InstitutionWaitlistRecord]:
        target = work_email.strip().lower()
        async with self._lock:
            for rec in self._institution_waitlist.values():
                if rec.workEmail.lower() == target:
                    return rec
            return None

    async def count_institution_waitlist(self) -> int:
        async with self._lock:
            return len(self._institution_waitlist)

