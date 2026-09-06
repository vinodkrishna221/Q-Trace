"""Async MongoDB repository implementation for Q-Trace."""

import time
from typing import Any, Optional
from pydantic import BaseModel
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
from app.repositories.base import DataRepositoryProtocol


def _clean(doc: Optional[dict[str, Any]]) -> Optional[dict[str, Any]]:
    """Remove Mongo internal _id field to prevent ObjectId leakage across boundaries."""
    if doc is None:
        return None
    d = dict(doc)
    d.pop("_id", None)
    return d


class MongoRepository(DataRepositoryProtocol):
    """Async MongoDB repository providing database-backed persistence with schema versioning and index support."""

    def __init__(self, db: Any) -> None:
        self.db = db
        self._insight_cache: dict[str, tuple[float, InstructorInsight]] = {}

    # --- Collection Getters ---

    def get_learner_profiles_collection(self) -> Any:
        return self.db["learner_profiles"]

    def get_instructor_profiles_collection(self) -> Any:
        return self.db["instructor_profiles"]

    def get_learning_paths_collection(self) -> Any:
        return self.db["learning_paths"]

    def get_modules_collection(self) -> Any:
        return self.db["modules"]

    def get_prediction_checkpoints_collection(self) -> Any:
        return self.db["prediction_checkpoints"]

    def get_circuit_models_collection(self) -> Any:
        return self.db["circuit_models"]

    def get_simulation_runs_collection(self) -> Any:
        return self.db["simulation_runs"]

    def get_misconception_signals_collection(self) -> Any:
        return self.db["misconception_signals"]

    def get_challenges_collection(self) -> Any:
        return self.db["challenges"]

    def get_challenge_attempts_collection(self) -> Any:
        return self.db["challenge_attempts"]

    def get_progress_records_collection(self) -> Any:
        return self.db["progress_records"]

    # --- Index Management ---

    async def ensure_indexes(self) -> dict[str, list[str]]:
        """Create all required schema indexes idempotently across collections."""
        created: dict[str, list[str]] = {}

        # 1. Learner Profiles
        lp_coll = self.get_learner_profiles_collection()
        n1 = await lp_coll.create_index([("id", 1)], unique=True, name="idx_learner_profiles_id_unique")
        n2 = await lp_coll.create_index([("cohortId", 1), ("displayName", 1)], name="idx_learner_profiles_cohort_name")
        created["learner_profiles"] = [n1, n2]

        # 2. Instructor Profiles
        ip_coll = self.get_instructor_profiles_collection()
        n3 = await ip_coll.create_index([("id", 1)], unique=True, name="idx_instructor_profiles_id_unique")
        created["instructor_profiles"] = [n3]

        # 3. Learning Paths
        path_coll = self.get_learning_paths_collection()
        n4 = await path_coll.create_index([("id", 1)], unique=True, name="idx_learning_paths_id_unique")
        n5 = await path_coll.create_index([("learnerProfileId", 1)], unique=True, name="idx_learning_paths_learner_unique")
        created["learning_paths"] = [n4, n5]

        # 4. Modules
        mod_coll = self.get_modules_collection()
        n6 = await mod_coll.create_index([("id", 1)], unique=True, name="idx_modules_id_unique")
        n7 = await mod_coll.create_index([("slug", 1)], unique=True, name="idx_modules_slug_unique")
        n8 = await mod_coll.create_index([("level", 1), ("title", 1)], name="idx_modules_level_title")
        created["modules"] = [n6, n7, n8]

        # 5. Prediction Checkpoints
        cp_coll = self.get_prediction_checkpoints_collection()
        n9 = await cp_coll.create_index([("id", 1)], unique=True, name="idx_checkpoints_id_unique")
        n10 = await cp_coll.create_index([("moduleId", 1)], unique=True, name="idx_checkpoints_module_unique")
        created["prediction_checkpoints"] = [n9, n10]

        # 6. Circuit Models
        cm_coll = self.get_circuit_models_collection()
        n11 = await cm_coll.create_index([("id", 1)], unique=True, name="idx_circuits_id_unique")
        n12 = await cm_coll.create_index([("ownerLearnerProfileId", 1), ("updatedAt", -1)], name="idx_circuits_owner_updated")
        created["circuit_models"] = [n11, n12]

        # 7. Simulation Runs
        sr_coll = self.get_simulation_runs_collection()
        n13 = await sr_coll.create_index([("id", 1)], unique=True, name="idx_runs_id_unique")
        n14 = await sr_coll.create_index([("learnerProfileId", 1), ("createdAt", -1)], name="idx_runs_learner_created")
        n15 = await sr_coll.create_index([("moduleId", 1), ("createdAt", -1)], name="idx_runs_module_created")
        created["simulation_runs"] = [n13, n14, n15]

        # 8. Misconception Signals
        ms_coll = self.get_misconception_signals_collection()
        n16 = await ms_coll.create_index([("id", 1)], unique=True, name="idx_signals_id_unique")
        n17 = await ms_coll.create_index([("simulationRunId", 1)], unique=True, name="idx_signals_run_unique")
        n18 = await ms_coll.create_index([("learnerProfileId", 1), ("code", 1), ("createdAt", -1)], name="idx_signals_learner_code_created")
        created["misconception_signals"] = [n16, n17, n18]

        # 9. Challenges
        ch_coll = self.get_challenges_collection()
        n19 = await ch_coll.create_index([("id", 1)], unique=True, name="idx_challenges_id_unique")
        n20 = await ch_coll.create_index([("moduleId", 1), ("type", 1)], name="idx_challenges_module_type")
        created["challenges"] = [n19, n20]

        # 10. Challenge Attempts
        ca_coll = self.get_challenge_attempts_collection()
        n21 = await ca_coll.create_index([("id", 1)], unique=True, name="idx_attempts_id_unique")
        n22 = await ca_coll.create_index([("learnerProfileId", 1), ("createdAt", -1)], name="idx_attempts_learner_created")
        n23 = await ca_coll.create_index([("challengeId", 1), ("passed", 1)], name="idx_attempts_challenge_passed")
        n24 = await ca_coll.create_index([("learnerProfileId", 1), ("challengeId", 1), ("attemptNumber", 1)], unique=True, name="idx_attempts_learner_challenge_num_unique")
        created["challenge_attempts"] = [n21, n22, n23, n24]

        # 11. Progress Records
        pr_coll = self.get_progress_records_collection()
        n25 = await pr_coll.create_index([("id", 1)], unique=True, name="idx_progress_id_unique")
        n26 = await pr_coll.create_index([("learnerProfileId", 1)], unique=True, name="idx_progress_learner_unique")
        created["progress_records"] = [n25, n26]

        return created

    # --- Lifecycle ---

    async def reset(self) -> None:
        collections = [
            self.get_learner_profiles_collection(),
            self.get_instructor_profiles_collection(),
            self.get_learning_paths_collection(),
            self.get_modules_collection(),
            self.get_prediction_checkpoints_collection(),
            self.get_circuit_models_collection(),
            self.get_simulation_runs_collection(),
            self.get_misconception_signals_collection(),
            self.get_challenges_collection(),
            self.get_challenge_attempts_collection(),
            self.get_progress_records_collection(),
        ]
        for coll in collections:
            await coll.delete_many({})

    # --- Learner & Instructor Profiles ---

    async def get_learner_profile(self, profile_id: str) -> Optional[LearnerProfile]:
        doc = await self.get_learner_profiles_collection().find_one({"id": profile_id})
        cleaned = _clean(doc)
        return LearnerProfile.model_validate(cleaned) if cleaned else None

    async def list_learner_profiles(
        self, cohort_id: Optional[str] = None
    ) -> list[LearnerProfile]:
        query = {"cohortId": cohort_id} if cohort_id is not None else {}
        cursor = self.get_learner_profiles_collection().find(query)
        docs = []
        if hasattr(cursor, "to_list"):
            docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                docs.append(d)
        res = [LearnerProfile.model_validate(_clean(d)) for d in docs]
        return sorted(res, key=lambda p: p.id)

    async def create_or_update_learner_profile(
        self, profile: LearnerProfile
    ) -> LearnerProfile:
        doc = profile.model_dump()
        doc["_id"] = profile.id
        await self.get_learner_profiles_collection().update_one(
            {"id": profile.id}, {"$set": doc}, upsert=True
        )
        return profile

    async def get_instructor_profile(
        self, profile_id: str
    ) -> Optional[InstructorProfile]:
        doc = await self.get_instructor_profiles_collection().find_one({"id": profile_id})
        cleaned = _clean(doc)
        return InstructorProfile.model_validate(cleaned) if cleaned else None

    async def create_or_update_instructor_profile(
        self, profile: InstructorProfile
    ) -> InstructorProfile:
        doc = profile.model_dump()
        doc["_id"] = profile.id
        await self.get_instructor_profiles_collection().update_one(
            {"id": profile.id}, {"$set": doc}, upsert=True
        )
        return profile

    # --- Learning Paths ---

    async def get_learning_path(self, path_id: str) -> Optional[LearningPath]:
        doc = await self.get_learning_paths_collection().find_one({"id": path_id})
        cleaned = _clean(doc)
        return LearningPath.model_validate(cleaned) if cleaned else None

    async def get_learning_path_by_learner(
        self, learner_profile_id: str
    ) -> Optional[LearningPath]:
        doc = await self.get_learning_paths_collection().find_one(
            {"learnerProfileId": learner_profile_id}
        )
        cleaned = _clean(doc)
        return LearningPath.model_validate(cleaned) if cleaned else None

    async def create_or_update_learning_path(
        self, path: LearningPath
    ) -> LearningPath:
        doc = path.model_dump()
        doc["_id"] = path.id
        await self.get_learning_paths_collection().update_one(
            {"id": path.id}, {"$set": doc}, upsert=True
        )
        return path

    # --- Modules & Checkpoints ---

    async def get_module(self, module_id: str) -> Optional[Module]:
        doc = await self.get_modules_collection().find_one({"id": module_id})
        cleaned = _clean(doc)
        return Module.model_validate(cleaned) if cleaned else None

    async def get_module_by_slug(self, slug: str) -> Optional[Module]:
        doc = await self.get_modules_collection().find_one({"slug": slug})
        cleaned = _clean(doc)
        return Module.model_validate(cleaned) if cleaned else None

    async def list_modules(
        self, level: Optional[ModuleLevel] = None, limit: int = 10
    ) -> list[Module]:
        query = {"level": level} if level is not None else {}
        cursor = self.get_modules_collection().find(query)
        docs = []
        if hasattr(cursor, "to_list"):
            docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                docs.append(d)
        res = [Module.model_validate(_clean(d)) for d in docs]
        res = sorted(res, key=lambda m: m.id)
        return res[:limit]

    async def create_or_update_module(self, module: Module) -> Module:
        doc = module.model_dump()
        doc["_id"] = module.id
        await self.get_modules_collection().update_one(
            {"id": module.id}, {"$set": doc}, upsert=True
        )
        return module

    async def get_prediction_checkpoint(
        self, checkpoint_id: str
    ) -> Optional[PredictionCheckpoint]:
        doc = await self.get_prediction_checkpoints_collection().find_one({"id": checkpoint_id})
        cleaned = _clean(doc)
        return PredictionCheckpoint.model_validate(cleaned) if cleaned else None

    async def get_prediction_checkpoint_by_module(
        self, module_id: str
    ) -> Optional[PredictionCheckpoint]:
        doc = await self.get_prediction_checkpoints_collection().find_one({"moduleId": module_id})
        cleaned = _clean(doc)
        return PredictionCheckpoint.model_validate(cleaned) if cleaned else None

    async def create_or_update_prediction_checkpoint(
        self, checkpoint: PredictionCheckpoint
    ) -> PredictionCheckpoint:
        doc = checkpoint.model_dump()
        doc["_id"] = checkpoint.id
        await self.get_prediction_checkpoints_collection().update_one(
            {"id": checkpoint.id}, {"$set": doc}, upsert=True
        )
        return checkpoint

    # --- Circuit Models ---

    async def get_circuit_model(self, circuit_id: str) -> Optional[CircuitModel]:
        doc = await self.get_circuit_models_collection().find_one({"id": circuit_id})
        cleaned = _clean(doc)
        return CircuitModel.model_validate(cleaned) if cleaned else None

    async def list_circuit_models_by_owner(
        self, owner_learner_profile_id: str
    ) -> list[CircuitModel]:
        cursor = self.get_circuit_models_collection().find(
            {"ownerLearnerProfileId": owner_learner_profile_id}
        )
        docs = []
        if hasattr(cursor, "to_list"):
            docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                docs.append(d)
        res = [CircuitModel.model_validate(_clean(d)) for d in docs]
        return sorted(res, key=lambda c: c.id)

    async def create_or_update_circuit_model(
        self, circuit: CircuitModel
    ) -> CircuitModel:
        doc = circuit.model_dump()
        doc["_id"] = circuit.id
        await self.get_circuit_models_collection().update_one(
            {"id": circuit.id}, {"$set": doc}, upsert=True
        )
        return circuit

    # --- Simulation Runs ---

    async def get_simulation_run(self, run_id: str) -> Optional[SimulationRun]:
        doc = await self.get_simulation_runs_collection().find_one({"id": run_id})
        cleaned = _clean(doc)
        return SimulationRun.model_validate(cleaned) if cleaned else None

    async def list_simulation_runs(
        self,
        learner_profile_id: Optional[str] = None,
        module_id: Optional[str] = None,
        limit: int = 50,
    ) -> list[SimulationRun]:
        query: dict[str, Any] = {}
        if learner_profile_id is not None:
            query["learnerProfileId"] = learner_profile_id
        if module_id is not None:
            query["moduleId"] = module_id
        cursor = self.get_simulation_runs_collection().find(query)
        docs = []
        if hasattr(cursor, "to_list"):
            docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                docs.append(d)
        res = [SimulationRun.model_validate(_clean(d)) for d in docs]
        res = sorted(res, key=lambda r: r.createdAt, reverse=True)
        return res[:limit]

    async def create_simulation_run(self, run: SimulationRun) -> SimulationRun:
        doc = run.model_dump()
        doc["_id"] = run.id
        await self.get_simulation_runs_collection().update_one(
            {"id": run.id}, {"$set": doc}, upsert=True
        )
        return run

    # --- Misconception Signals ---

    async def get_misconception_signal(
        self, signal_id: str
    ) -> Optional[MisconceptionSignal]:
        doc = await self.get_misconception_signals_collection().find_one({"id": signal_id})
        cleaned = _clean(doc)
        return MisconceptionSignal.model_validate(cleaned) if cleaned else None

    async def get_misconception_signal_by_run(
        self, simulation_run_id: str
    ) -> Optional[MisconceptionSignal]:
        doc = await self.get_misconception_signals_collection().find_one(
            {"simulationRunId": simulation_run_id}
        )
        cleaned = _clean(doc)
        return MisconceptionSignal.model_validate(cleaned) if cleaned else None

    async def list_misconception_signals(
        self, learner_profile_id: Optional[str] = None
    ) -> list[MisconceptionSignal]:
        query = {"learnerProfileId": learner_profile_id} if learner_profile_id else {}
        cursor = self.get_misconception_signals_collection().find(query)
        docs = []
        if hasattr(cursor, "to_list"):
            docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                docs.append(d)
        res = [MisconceptionSignal.model_validate(_clean(d)) for d in docs]
        return sorted(res, key=lambda s: s.createdAt, reverse=True)

    async def create_misconception_signal(
        self, signal: MisconceptionSignal
    ) -> MisconceptionSignal:
        doc = signal.model_dump()
        doc["_id"] = signal.id
        await self.get_misconception_signals_collection().update_one(
            {"id": signal.id}, {"$set": doc}, upsert=True
        )
        return signal

    # --- Challenges & Attempts ---

    async def get_challenge(self, challenge_id: str) -> Optional[Challenge]:
        doc = await self.get_challenges_collection().find_one({"id": challenge_id})
        cleaned = _clean(doc)
        return Challenge.model_validate(cleaned) if cleaned else None

    async def list_challenges_by_module(self, module_id: str) -> list[Challenge]:
        cursor = self.get_challenges_collection().find({"moduleId": module_id})
        docs = []
        if hasattr(cursor, "to_list"):
            docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                docs.append(d)
        res = [Challenge.model_validate(_clean(d)) for d in docs]
        return sorted(res, key=lambda c: c.id)

    async def create_or_update_challenge(self, challenge: Challenge) -> Challenge:
        doc = challenge.model_dump()
        doc["_id"] = challenge.id
        await self.get_challenges_collection().update_one(
            {"id": challenge.id}, {"$set": doc}, upsert=True
        )
        return challenge

    async def get_challenge_attempt(
        self, attempt_id: str
    ) -> Optional[ChallengeAttempt]:
        doc = await self.get_challenge_attempts_collection().find_one({"id": attempt_id})
        cleaned = _clean(doc)
        return ChallengeAttempt.model_validate(cleaned) if cleaned else None

    async def list_challenge_attempts(
        self,
        learner_profile_id: Optional[str] = None,
        challenge_id: Optional[str] = None,
    ) -> list[ChallengeAttempt]:
        query: dict[str, Any] = {}
        if learner_profile_id is not None:
            query["learnerProfileId"] = learner_profile_id
        if challenge_id is not None:
            query["challengeId"] = challenge_id
        cursor = self.get_challenge_attempts_collection().find(query)
        docs = []
        if hasattr(cursor, "to_list"):
            docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                docs.append(d)
        res = [ChallengeAttempt.model_validate(_clean(d)) for d in docs]
        return sorted(res, key=lambda a: a.createdAt)

    async def get_next_attempt_number(
        self, learner_profile_id: str, challenge_id: str
    ) -> int:
        query = {
            "learnerProfileId": learner_profile_id,
            "challengeId": challenge_id,
        }
        cursor = self.get_challenge_attempts_collection().find(query)
        docs = []
        if hasattr(cursor, "to_list"):
            docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                docs.append(d)
        return len(docs) + 1

    async def create_challenge_attempt(
        self, attempt: ChallengeAttempt
    ) -> ChallengeAttempt:
        doc = attempt.model_dump()
        doc["_id"] = attempt.id
        await self.get_challenge_attempts_collection().update_one(
            {"id": attempt.id}, {"$set": doc}, upsert=True
        )
        return attempt

    # --- Progress Records & Atomic Operations ---

    async def get_progress_record(self, progress_id: str) -> Optional[ProgressRecord]:
        doc = await self.get_progress_records_collection().find_one({"id": progress_id})
        cleaned = _clean(doc)
        return ProgressRecord.model_validate(cleaned) if cleaned else None

    async def get_progress_record_by_learner(
        self, learner_profile_id: str
    ) -> Optional[ProgressRecord]:
        doc = await self.get_progress_records_collection().find_one(
            {"learnerProfileId": learner_profile_id}
        )
        cleaned = _clean(doc)
        return ProgressRecord.model_validate(cleaned) if cleaned else None

    async def create_or_update_progress_record(
        self, record: ProgressRecord
    ) -> ProgressRecord:
        doc = record.model_dump()
        doc["_id"] = record.id
        await self.get_progress_records_collection().update_one(
            {"id": record.id}, {"$set": doc}, upsert=True
        )
        return record

    async def record_attempt_and_update_progress(
        self,
        attempt: ChallengeAttempt,
        points_earned: int,
        completed_module_id: Optional[str] = None,
        updated_skills: Optional[list[SkillState]] = None,
        misconception_code: Optional[str] = None,
    ) -> tuple[ChallengeAttempt, ProgressRecord]:
        # 1. Save attempt
        await self.create_challenge_attempt(attempt)

        # 2. Get existing progress record
        existing_doc = await self.get_progress_records_collection().find_one(
            {"learnerProfileId": attempt.learnerProfileId}
        )
        now_iso = attempt.createdAt or utc_now_iso()

        if existing_doc is not None:
            cleaned = _clean(existing_doc)
            progress = ProgressRecord.model_validate(cleaned)
            progress.latestChallengeAttemptId = attempt.id
            progress.totalPoints += points_earned
            progress.updatedAt = now_iso
        else:
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

        if completed_module_id and completed_module_id not in progress.completedModuleIds:
            progress.completedModuleIds.append(completed_module_id)

        if updated_skills:
            skill_map = {s.skillId: s for s in progress.skillStates}
            for ns in updated_skills:
                skill_map[ns.skillId] = ns
            progress.skillStates = list(skill_map.values())

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

        await self.create_or_update_progress_record(progress)
        self._insight_cache.clear()
        return attempt, progress

    # --- Instructor Insights ---

    async def get_instructor_insight(
        self, cohort_id: str
    ) -> Optional[InstructorInsight]:
        now_ts = time.time()
        if cohort_id in self._insight_cache:
            cached_ts, cached_insight = self._insight_cache[cohort_id]
            if now_ts - cached_ts < 10.0:
                return cached_insight

        learners = await self.list_learner_profiles(cohort_id=cohort_id)
        if not learners:
            return None

        learner_ids = {p.id for p in learners}
        learner_count = len(learners)

        # Module completion
        pr_docs = []
        cursor = self.get_progress_records_collection().find({})
        if hasattr(cursor, "to_list"):
            pr_docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                pr_docs.append(d)
        progresses = [ProgressRecord.model_validate(_clean(d)) for d in pr_docs]

        module_completions: dict[str, int] = {}
        for p in progresses:
            if p.learnerProfileId in learner_ids:
                for mod_id in p.completedModuleIds:
                    module_completions[mod_id] = module_completions.get(mod_id, 0) + 1

        module_completion_list = [
            CohortModuleCompletion(
                moduleId=mod_id,
                completed=count,
                assigned=learner_count,
            )
            for mod_id, count in sorted(module_completions.items())
        ]

        # Challenge pass rates
        ca_docs = []
        cursor = self.get_challenge_attempts_collection().find({})
        if hasattr(cursor, "to_list"):
            ca_docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                ca_docs.append(d)
        attempts = [ChallengeAttempt.model_validate(_clean(d)) for d in ca_docs]

        challenge_attempts_map: dict[str, list[ChallengeAttempt]] = {}
        for a in attempts:
            if a.learnerProfileId in learner_ids:
                challenge_attempts_map.setdefault(a.challengeId, []).append(a)

        challenge_pass_rates: list[CohortChallengePassRate] = []
        for ch_id, ch_attempts in sorted(challenge_attempts_map.items()):
            attempted = len(ch_attempts)
            passed = sum(1 for a in ch_attempts if a.passed)
            rate = round(passed / attempted, 4) if attempted > 0 else 0.0
            challenge_pass_rates.append(
                CohortChallengePassRate(
                    challengeId=ch_id,
                    passed=passed,
                    attempted=attempted,
                    rate=rate,
                )
            )

        # Misconceptions
        ms_docs = []
        cursor = self.get_misconception_signals_collection().find({})
        if hasattr(cursor, "to_list"):
            ms_docs = await cursor.to_list(length=None)
        else:
            async for d in cursor:
                ms_docs.append(d)
        signals = [MisconceptionSignal.model_validate(_clean(d)) for d in ms_docs]

        misconceptions_count: dict[str, int] = {}
        misconceptions_learners: dict[str, set[str]] = {}
        for s in signals:
            if s.learnerProfileId in learner_ids and s.code != "NO_SIGNAL":
                misconceptions_count[s.code] = misconceptions_count.get(s.code, 0) + 1
                misconceptions_learners.setdefault(s.code, set()).add(s.learnerProfileId)

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

        # Live demo learner check
        live_demo_learner: Optional[CohortLiveDemoLearner] = None
        if "lp_aarav" in learner_ids:
            aarav_attempts = [a for a in attempts if a.learnerProfileId == "lp_aarav"]
            latest_passed = aarav_attempts[-1].passed if aarav_attempts else False
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
