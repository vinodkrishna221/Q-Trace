"""Unit test suite for DATA-2: Core truth seeding and contract ID verification."""

import pytest
from app.repositories import InMemoryRepository, seed_core_truth
from app.repositories.seeds import (
    CORE_CHALLENGES,
    CORE_CIRCUIT_MODELS,
    CORE_INSTRUCTOR_PROFILE,
    CORE_LEARNER_PROFILES,
    CORE_LEARNING_PATHS,
    CORE_MODULES,
    CORE_PREDICTION_CHECKPOINTS,
    CORE_PROGRESS_RECORDS,
    get_core_seed_dataset,
)


@pytest.fixture
def repo() -> InMemoryRepository:
    """Fresh in-memory repository for test isolation."""
    return InMemoryRepository()


@pytest.mark.asyncio
async def test_seed_twice_idempotency_no_duplicates(repo: InMemoryRepository) -> None:
    """Proves seeding twice results in zero duplicates and identical entity counts."""
    # First seed
    counts1 = await seed_core_truth(repo)
    assert counts1["learner_profiles"] == 2
    assert counts1["instructor_profiles"] == 1
    assert counts1["learning_paths"] == 2
    assert counts1["prediction_checkpoints"] == 1
    assert counts1["circuit_models"] == 2
    assert counts1["challenges"] == 4
    assert counts1["modules"] == 3
    assert counts1["progress_records"] == 2

    # Verify initial collection sizes
    profiles_pass1 = await repo.list_learner_profiles()
    modules_pass1 = await repo.list_modules(limit=100)
    assert len(profiles_pass1) == 2
    assert len(modules_pass1) == 3

    # Second seed
    counts2 = await seed_core_truth(repo)
    assert counts2 == counts1

    # Verify collection sizes did not grow (no duplicates)
    profiles_pass2 = await repo.list_learner_profiles()
    modules_pass2 = await repo.list_modules(limit=100)
    assert len(profiles_pass2) == 2
    assert len(modules_pass2) == 3
    assert [p.id for p in profiles_pass2] == ["lp_aarav", "lp_meera"]
    assert [m.id for m in modules_pass2] == ["mod_bell", "mod_measurement", "mod_superposition"]


@pytest.mark.asyncio
async def test_retrieval_of_all_contract_learner_profiles(repo: InMemoryRepository) -> None:
    """Verify retrieval of Aarav, Meera, and Dr. Rao profiles matching contracts."""
    await seed_core_truth(repo)

    # 1. Aarav (Beginner CSE)
    aarav = await repo.get_learner_profile("lp_aarav")
    assert aarav is not None
    assert aarav.id == "lp_aarav"
    assert aarav.displayName == "Aarav"
    assert aarav.role == "BEGINNER_CSE"
    assert aarav.cohortId == "cohort_demo_2026"
    assert aarav.priorKnowledge.python is True
    assert aarav.priorKnowledge.linearAlgebra is False
    assert aarav.priorKnowledge.quantumTheory is False
    assert aarav.priorKnowledge.circuitProgramming is False
    assert aarav.activeLearningPathId == "path_aarav_foundations"

    # 2. Meera (Physics-to-Code)
    meera = await repo.get_learner_profile("lp_meera")
    assert meera is not None
    assert meera.id == "lp_meera"
    assert meera.displayName == "Meera"
    assert meera.role == "PHYSICS_TO_CODE"
    assert meera.cohortId == "cohort_demo_2026"
    assert meera.priorKnowledge.python is True
    assert meera.priorKnowledge.linearAlgebra is True
    assert meera.priorKnowledge.quantumTheory is True
    assert meera.priorKnowledge.circuitProgramming is False
    assert meera.activeLearningPathId == "path_meera_code"

    # 3. Dr. Rao (Instructor)
    rao = await repo.get_instructor_profile("instructor_rao")
    assert rao is not None
    assert rao.id == "instructor_rao"
    assert rao.displayName == "Dr. Rao"
    assert rao.cohortId == "cohort_demo_2026"


@pytest.mark.asyncio
async def test_retrieval_of_all_contract_learning_paths(repo: InMemoryRepository) -> None:
    """Verify retrieval of Learning Paths for Aarav and Meera."""
    await seed_core_truth(repo)

    # Aarav Path
    path_aarav = await repo.get_learning_path("path_aarav_foundations")
    assert path_aarav is not None
    assert path_aarav.id == "path_aarav_foundations"
    assert path_aarav.learnerProfileId == "lp_aarav"
    assert path_aarav.entryBand == "FOUNDATIONS"
    assert path_aarav.currentModuleId == "mod_bell"
    assert path_aarav.moduleIds == ["mod_superposition", "mod_measurement", "mod_bell"]
    assert "Bell-state lab" in path_aarav.recommendationReason

    # Lookup by learner
    path_aarav_by_learner = await repo.get_learning_path_by_learner("lp_aarav")
    assert path_aarav_by_learner is not None
    assert path_aarav_by_learner.id == "path_aarav_foundations"

    # Meera Path
    path_meera = await repo.get_learning_path("path_meera_code")
    assert path_meera is not None
    assert path_meera.id == "path_meera_code"
    assert path_meera.learnerProfileId == "lp_meera"
    assert path_meera.entryBand == "THEORY_TO_CODE"
    assert path_meera.currentModuleId == "mod_bell"
    assert path_meera.moduleIds == ["mod_superposition", "mod_measurement", "mod_bell"]


@pytest.mark.asyncio
async def test_retrieval_of_all_contract_modules_and_slugs(repo: InMemoryRepository) -> None:
    """Verify retrieval of three Modules by ID and route slugs."""
    await seed_core_truth(repo)

    # Module 1: Superposition
    mod_sup = await repo.get_module("mod_superposition")
    assert mod_sup is not None
    assert mod_sup.slug == "superposition"
    assert mod_sup.title == "Qubits and Superposition"
    assert mod_sup.level == "FOUNDATION"
    assert mod_sup.estimatedMinutes == 14
    assert "skill_create_superposition" in mod_sup.skillIds

    slug_sup = await repo.get_module_by_slug("superposition")
    assert slug_sup is not None
    assert slug_sup.id == "mod_superposition"

    # Module 2: Measurement
    mod_meas = await repo.get_module("mod_measurement")
    assert mod_meas is not None
    assert mod_meas.slug == "measurement"
    assert mod_meas.title == "Measurement and Probability"
    assert mod_meas.level == "FOUNDATION"
    assert mod_meas.estimatedMinutes == 12

    slug_meas = await repo.get_module_by_slug("measurement")
    assert slug_meas is not None
    assert slug_meas.id == "mod_measurement"

    # Module 3: Bell State
    mod_bell = await repo.get_module("mod_bell")
    assert mod_bell is not None
    assert mod_bell.slug == "bell-state"
    assert mod_bell.title == "From Superposition to Bell Correlation"
    assert mod_bell.level == "FOUNDATION"
    assert mod_bell.estimatedMinutes == 18
    assert mod_bell.predictionCheckpointId == "pc_bell_outcomes"
    assert mod_bell.starterCircuitModelId == "cm_bell_seed"
    assert "ch_bell_repair" in mod_bell.challengeIds
    assert len(mod_bell.contentBlocks) == 2

    slug_bell = await repo.get_module_by_slug("bell-state")
    assert slug_bell is not None
    assert slug_bell.id == "mod_bell"


@pytest.mark.asyncio
async def test_retrieval_of_bell_prediction_checkpoint(repo: InMemoryRepository) -> None:
    """Verify Prediction Checkpoint structure and misconception mapping."""
    await seed_core_truth(repo)

    cp = await repo.get_prediction_checkpoint("pc_bell_outcomes")
    assert cp is not None
    assert cp.id == "pc_bell_outcomes"
    assert cp.moduleId == "mod_bell"
    assert "After H and CNOT" in cp.prompt
    assert cp.answerSchema["type"] == "SINGLE_CHOICE"
    assert "INDEPENDENT_RANDOM" in cp.answerSchema["options"]
    assert "CORRELATED_00_11" in cp.answerSchema["options"]
    assert cp.misconceptionMap["INDEPENDENT_RANDOM"] == "SUPERPOSITION_VS_ENTANGLEMENT"
    assert cp.misconceptionMap["ALWAYS_00"] == "MEASUREMENT_DETERMINISM"

    by_mod = await repo.get_prediction_checkpoint_by_module("mod_bell")
    assert by_mod is not None
    assert by_mod.id == "pc_bell_outcomes"


@pytest.mark.asyncio
async def test_retrieval_of_circuit_models(repo: InMemoryRepository) -> None:
    """Verify seeded Bell starter circuit and broken repair circuit."""
    await seed_core_truth(repo)

    # 1. Bell Starter Seed
    seed_cm = await repo.get_circuit_model("cm_bell_seed")
    assert seed_cm is not None
    assert seed_cm.id == "cm_bell_seed"
    assert seed_cm.name == "Bell State Seed"
    assert seed_cm.qubitCount == 2
    assert seed_cm.classicalBitCount == 2
    assert len(seed_cm.operations) == 4
    assert seed_cm.operations[0].gate == "H"
    assert seed_cm.operations[0].targets == [0]
    assert seed_cm.operations[1].gate == "CNOT"
    assert seed_cm.operations[1].controls == [0]
    assert seed_cm.operations[1].targets == [1]
    assert seed_cm.operations[2].gate == "MEASURE"
    assert seed_cm.operations[3].gate == "MEASURE"
    assert seed_cm.source == "SEED"

    # 2. Broken Bell State
    broken_cm = await repo.get_circuit_model("cm_bell_broken")
    assert broken_cm is not None
    assert broken_cm.id == "cm_bell_broken"
    assert broken_cm.name == "Broken Bell State (Misordered Gates)"
    assert len(broken_cm.operations) == 4
    # First operation in broken circuit is CNOT before H
    assert broken_cm.operations[0].gate == "CNOT"
    assert broken_cm.operations[1].gate == "H"


@pytest.mark.asyncio
async def test_retrieval_of_challenges(repo: InMemoryRepository) -> None:
    """Verify seeded quizzes and Bell Repair Challenge."""
    await seed_core_truth(repo)

    # Bell Repair Challenge
    repair_ch = await repo.get_challenge("ch_bell_repair")
    assert repair_ch is not None
    assert repair_ch.id == "ch_bell_repair"
    assert repair_ch.moduleId == "mod_bell"
    assert repair_ch.type == "CIRCUIT_REPAIR"
    assert repair_ch.starterCircuitModelId == "cm_bell_broken"
    assert repair_ch.points == 100
    assert repair_ch.acceptanceRule["kind"] == "PROBABILITY_SUPPORT_EQUALS"
    assert repair_ch.acceptanceRule["states"] == ["00", "11"]
    assert "SUPERPOSITION_VS_ENTANGLEMENT" in repair_ch.targetsMisconceptionCodes
    assert "GATE_ORDER" in repair_ch.targetsMisconceptionCodes

    # Bell module challenge list
    bell_challenges = await repo.list_challenges_by_module("mod_bell")
    assert len(bell_challenges) == 2
    ch_ids = [c.id for c in bell_challenges]
    assert "ch_bell_quiz" in ch_ids
    assert "ch_bell_repair" in ch_ids


@pytest.mark.asyncio
async def test_retrieval_of_initial_progress_records(repo: InMemoryRepository) -> None:
    """Verify seeded progress records for Aarav and Meera."""
    await seed_core_truth(repo)

    # Aarav progress
    aarav_prog = await repo.get_progress_record("progress_lp_aarav")
    assert aarav_prog is not None
    assert aarav_prog.id == "progress_lp_aarav"
    assert aarav_prog.learnerProfileId == "lp_aarav"
    assert aarav_prog.totalPoints == 200
    assert len(aarav_prog.skillStates) == 4

    skill_map = {s.skillId: s for s in aarav_prog.skillStates}
    assert skill_map["skill_create_superposition"].status == "MASTERED"
    assert skill_map["skill_predict_measurement"].status == "MASTERED"
    assert skill_map["skill_create_bell"].status == "PRACTICING"
    assert skill_map["skill_explain_correlation"].status == "NOT_STARTED"

    # By learner ID
    prog_by_learner = await repo.get_progress_record_by_learner("lp_aarav")
    assert prog_by_learner is not None
    assert prog_by_learner.id == "progress_lp_aarav"

    # Meera progress
    meera_prog = await repo.get_progress_record("progress_lp_meera")
    assert meera_prog is not None
    assert meera_prog.id == "progress_lp_meera"
    assert meera_prog.learnerProfileId == "lp_meera"
    assert meera_prog.totalPoints == 200


@pytest.mark.asyncio
async def test_seed_dataset_referential_integrity(repo: InMemoryRepository) -> None:
    """Verify referential integrity across all seeded entities."""
    await seed_core_truth(repo)
    dataset = get_core_seed_dataset()

    # 1. All moduleIds in learning paths must exist
    for path in dataset["learning_paths"]:
        for mod_id in path.moduleIds:
            mod = await repo.get_module(mod_id)
            assert mod is not None, f"Module {mod_id} referenced by path {path.id} missing"

    # 2. Prediction checkpoints referenced in modules must exist
    for mod in dataset["modules"]:
        if mod.predictionCheckpointId:
            cp = await repo.get_prediction_checkpoint(mod.predictionCheckpointId)
            assert cp is not None, f"Checkpoint {mod.predictionCheckpointId} in module {mod.id} missing"

    # 3. Starter circuit models referenced in modules must exist
    for mod in dataset["modules"]:
        if mod.starterCircuitModelId:
            cm = await repo.get_circuit_model(mod.starterCircuitModelId)
            assert cm is not None, f"Circuit {mod.starterCircuitModelId} in module {mod.id} missing"

    # 4. Challenges in modules must exist
    for mod in dataset["modules"]:
        for ch_id in mod.challengeIds:
            ch = await repo.get_challenge(ch_id)
            assert ch is not None, f"Challenge {ch_id} in module {mod.id} missing"

    # 5. Broken circuit in repair challenge must exist
    for ch in dataset["challenges"]:
        if ch.starterCircuitModelId:
            cm = await repo.get_circuit_model(ch.starterCircuitModelId)
            assert cm is not None, f"Circuit {ch.starterCircuitModelId} in challenge {ch.id} missing"

    # 6. Progress record learnerProfileIds must match real learner profiles
    for prog in dataset["progress_records"]:
        learner = await repo.get_learner_profile(prog.learnerProfileId)
        assert learner is not None, f"Learner {prog.learnerProfileId} in progress record {prog.id} missing"
