"""Database seed and verification script for Q-Trace."""

import argparse
import asyncio
import sys
from app.repositories import get_repository, seed_demo_cohort
from app.repositories.seeds import (
    CORE_CHALLENGES,
    CORE_CIRCUIT_MODELS,
    CORE_INSTRUCTOR_PROFILE,
    CORE_LEARNER_PROFILES,
    CORE_LEARNING_PATHS,
    CORE_MODULES,
    CORE_PREDICTION_CHECKPOINTS,
    CORE_PROGRESS_RECORDS,
)


async def run_seed(reset: bool = False, check_only: bool = False) -> int:
    """Execute seeding or check verification."""
    repo = get_repository()

    if check_only:
        print("[seed] Verifying core seed records in repository...")
        if not await repo.get_learner_profile("lp_aarav"):
            print("[seed] Repository empty; seeding demo cohort before verification...")
            await seed_demo_cohort(repo)

        # Check learner profiles
        for p in CORE_LEARNER_PROFILES:
            found = await repo.get_learner_profile(p.id)
            if not found:
                print(f"  [MISSING] LearnerProfile: {p.id}")
                return 1
            print(f"  [OK] LearnerProfile: {p.id} ({found.displayName} - {found.role})")

        all_profiles = await repo.list_learner_profiles("cohort_demo_2026")
        if len(all_profiles) < 30:
            print(f"  [MISSING] Synthetic cohort size expected >= 30, got {len(all_profiles)}")
            return 1
        print(f"  [OK] Cohort size verified: {len(all_profiles)} profiles present.")

        # Check instructor
        inst = await repo.get_instructor_profile(CORE_INSTRUCTOR_PROFILE.id)
        if not inst:
            print(f"  [MISSING] InstructorProfile: {CORE_INSTRUCTOR_PROFILE.id}")
            return 1
        print(f"  [OK] InstructorProfile: {inst.id} ({inst.displayName})")

        # Check learning paths
        for lp in CORE_LEARNING_PATHS:
            found_lp = await repo.get_learning_path(lp.id)
            if not found_lp:
                print(f"  [MISSING] LearningPath: {lp.id}")
                return 1
            print(f"  [OK] LearningPath: {lp.id} -> {found_lp.currentModuleId}")

        # Check modules
        for m in CORE_MODULES:
            found_m = await repo.get_module(m.id)
            if not found_m:
                print(f"  [MISSING] Module: {m.id}")
                return 1
            print(f"  [OK] Module: {m.id} (slug: {found_m.slug}, title: {found_m.title})")

        # Check prediction checkpoint
        for cp in CORE_PREDICTION_CHECKPOINTS:
            found_cp = await repo.get_prediction_checkpoint(cp.id)
            if not found_cp:
                print(f"  [MISSING] PredictionCheckpoint: {cp.id}")
                return 1
            print(f"  [OK] PredictionCheckpoint: {cp.id}")

        # Check circuit models
        for cm in CORE_CIRCUIT_MODELS:
            found_cm = await repo.get_circuit_model(cm.id)
            if not found_cm:
                print(f"  [MISSING] CircuitModel: {cm.id}")
                return 1
            print(f"  [OK] CircuitModel: {cm.id} ({found_cm.name})")

        # Check challenges
        for ch in CORE_CHALLENGES:
            found_ch = await repo.get_challenge(ch.id)
            if not found_ch:
                print(f"  [MISSING] Challenge: {ch.id}")
                return 1
            print(f"  [OK] Challenge: {ch.id} ({found_ch.type})")

        # Check progress records
        for pr in CORE_PROGRESS_RECORDS:
            found_pr = await repo.get_progress_record(pr.id)
            if not found_pr:
                print(f"  [MISSING] ProgressRecord: {pr.id}")
                return 1
            print(f"  [OK] ProgressRecord: {pr.id} (points: {found_pr.totalPoints})")

        print("[seed] Verification complete: All hero seed and cohort records present.")
        return 0

    if reset:
        print("[seed] Resetting repository before seed...")
        await repo.reset()

    print("[seed] Seeding demo cohort truth records...")
    counts = await seed_demo_cohort(repo)
    for entity, count in counts.items():
        print(f"  - {entity}: {count} records seeded")
    print("[seed] Demo cohort seeding complete successfully.")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed and verify Q-Trace truth dataset.")
    parser.add_argument("--reset", action="store_true", help="Reset datastore before seeding.")
    parser.add_argument("--check", action="store_true", help="Verify that all core records exist.")
    args = parser.parse_args()

    exit_code = asyncio.run(run_seed(reset=args.reset, check_only=args.check))
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
