"""Unit tests for DATA-5: Synthetic cohort seeding, path variants, disclosure, and live attempt override."""

import pytest
from app.models.entities import ChallengeAttempt, SkillState
from app.repositories import InMemoryRepository, seed_demo_cohort


@pytest.mark.asyncio
async def test_demo_seed_story_counts_and_ranges():
    """Verify exact counts/ranges for 30-profile cohort, 60-90 attempts, and 35-50 misconception signals."""
    repo = InMemoryRepository()
    counts = await seed_demo_cohort(repo)

    # 1. Learner profiles count (30 total in cohort)
    profiles = await repo.list_learner_profiles("cohort_demo_2026")
    assert len(profiles) == 30, f"Expected exactly 30 profiles in cohort, got {len(profiles)}"

    # Check hero profile preservation
    aarav = await repo.get_learner_profile("lp_aarav")
    meera = await repo.get_learner_profile("lp_meera")
    assert aarav is not None and aarav.displayName == "Aarav"
    assert meera is not None and meera.displayName == "Meera"

    # Check instructor profile
    inst = await repo.get_instructor_profile("instructor_rao")
    assert inst is not None and inst.displayName == "Dr. Rao"

    # 2. Challenge attempts range (60 to 90 attempts)
    attempts = await repo.list_challenge_attempts()
    assert 60 <= len(attempts) <= 90, f"Expected between 60 and 90 attempts, got {len(attempts)}"

    # 3. Misconception signals range (35 to 50 signals)
    signals = await repo.list_misconception_signals()
    assert 35 <= len(signals) <= 50, f"Expected between 35 and 50 misconception signals, got {len(signals)}"


@pytest.mark.asyncio
async def test_demo_seed_story_idempotency():
    """Verify that seeding twice maintains exact record counts and produces no duplicates."""
    repo = InMemoryRepository()

    # First seed
    await seed_demo_cohort(repo)
    profiles_pass1 = await repo.list_learner_profiles("cohort_demo_2026")
    attempts_pass1 = await repo.list_challenge_attempts()
    signals_pass1 = await repo.list_misconception_signals()

    # Second seed
    await seed_demo_cohort(repo)
    profiles_pass2 = await repo.list_learner_profiles("cohort_demo_2026")
    attempts_pass2 = await repo.list_challenge_attempts()
    signals_pass2 = await repo.list_misconception_signals()

    assert len(profiles_pass1) == len(profiles_pass2) == 30
    assert len(attempts_pass1) == len(attempts_pass2) == 75
    assert len(signals_pass1) == len(signals_pass2) == 40


@pytest.mark.asyncio
async def test_demo_seed_story_disclosure_text():
    """Verify that instructor insight contains the required synthetic data disclosure string."""
    repo = InMemoryRepository()
    await seed_demo_cohort(repo)

    insight = await repo.get_instructor_insight("cohort_demo_2026")
    assert insight is not None
    assert "Synthetic" in insight.dataDisclosure
    assert insight.dataDisclosure == "Synthetic seeded cohort plus current live demo attempt"
    assert insight.learnerCount == 30


@pytest.mark.asyncio
async def test_demo_seed_story_aarav_live_attempt_override():
    """Verify that submitting a live attempt for Aarav updates progress and instructor insight without corrupting cohort structure."""
    repo = InMemoryRepository()
    await seed_demo_cohort(repo)

    # Initial state check
    initial_insight = await repo.get_instructor_insight("cohort_demo_2026")
    assert initial_insight.liveDemoLearner is not None
    assert initial_insight.liveDemoLearner.learnerProfileId == "lp_aarav"

    # Create a new passing attempt for Aarav on Bell repair
    live_attempt = ChallengeAttempt(
        id="att_aarav_live_001",
        challengeId="ch_bell_repair",
        learnerProfileId="lp_aarav",
        simulationRunId="sim_aarav_live",
        submittedAnswer={"operations": [{"gate": "H", "targets": [0]}, {"gate": "CNOT", "targets": [1], "controls": [0]}]},
        passed=True,
        score=100,
        feedbackCode="BELL_CORRELATION_RESTORED",
        attemptNumber=1,
        schemaVersion=1,
    )

    updated_skills = [
        SkillState(skillId="skill_create_superposition", status="MASTERED", score=100),
        SkillState(skillId="skill_predict_measurement", status="MASTERED", score=100),
        SkillState(skillId="skill_create_bell", status="MASTERED", score=100),
        SkillState(skillId="skill_explain_correlation", status="PRACTICING", score=50),
    ]

    recorded_att, updated_prog = await repo.record_attempt_and_update_progress(
        attempt=live_attempt,
        points_earned=100,
        completed_module_id="mod_bell",
        updated_skills=updated_skills,
    )

    assert recorded_att.id == "att_aarav_live_001"
    assert recorded_att.passed is True
    assert updated_prog.totalPoints == 300
    assert "mod_bell" in updated_prog.completedModuleIds

    # Check that Instructor Insight reflects Aarav's live attempt override
    updated_insight = await repo.get_instructor_insight("cohort_demo_2026")
    assert updated_insight.liveDemoLearner is not None
    assert updated_insight.liveDemoLearner.learnerProfileId == "lp_aarav"
    assert updated_insight.liveDemoLearner.latestAttemptPassed is True

    # Check cohort stability
    profiles = await repo.list_learner_profiles("cohort_demo_2026")
    assert len(profiles) == 30
