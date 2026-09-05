"""
Diagnosis service package — ai-pedagogy track
=============================================
AI-1: deterministic misconception rule engine (no LLM)
AI-4: complete misconception taxonomy, learner-level replay copy,
      and explanation templates distinguishing representation from trajectory.
"""

from app.services.diagnosis.rules import (
    BELL_VERIFIED_BEHAVIOR,
    KNOWN_EVIDENCE_KEYS,
    KNOWN_MISCONCEPTION_CODES,
    KNOWN_PREDICTION_ANSWERS,
    RULES,
    RULES_VERSION,
    DiagnosisResult,
    DiagnosisRule,
    apply_rules,
    find_rule,
    is_known_evidence_key,
    list_all_rules,
)
from app.services.diagnosis.taxonomy import (
    DEFAULT_LEARNER_ROLE,
    EXPLANATION_TEMPLATES,
    KNOWN_LEARNER_ROLES,
    REPLAY_COPY_TABLE,
    ExplanationTemplate,
    LearnerRole,
    ReplayStepCopy,
    TaxonomyDiagnosis,
    build_contract_replay,
    diagnose_with_taxonomy,
    get_explanation_template,
    get_replay_copy_for_role,
    normalize_learner_role,
)

__all__ = [
    # AI-1 rules
    "BELL_VERIFIED_BEHAVIOR",
    "KNOWN_EVIDENCE_KEYS",
    "KNOWN_MISCONCEPTION_CODES",
    "KNOWN_PREDICTION_ANSWERS",
    "RULES",
    "RULES_VERSION",
    "DiagnosisResult",
    "DiagnosisRule",
    "apply_rules",
    "find_rule",
    "is_known_evidence_key",
    "list_all_rules",
    # AI-4 taxonomy
    "DEFAULT_LEARNER_ROLE",
    "EXPLANATION_TEMPLATES",
    "KNOWN_LEARNER_ROLES",
    "REPLAY_COPY_TABLE",
    "ExplanationTemplate",
    "LearnerRole",
    "ReplayStepCopy",
    "TaxonomyDiagnosis",
    "build_contract_replay",
    "diagnose_with_taxonomy",
    "get_explanation_template",
    "get_replay_copy_for_role",
    "normalize_learner_role",
]
