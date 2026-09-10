import { test, expect } from '@playwright/test';

/**
 * QA-6 · Automate the learner-led Playwright journey
 *
 * Automates the exact 90-second learner-led demo path (Beats B1–B8 from docs/DEMO-SCRIPT.md):
 * 1. Role entry (Aarav, beginner CSE)
 * 2. Prediction Checkpoint (selecting INDEPENDENT_RANDOM misconception)
 * 3. Circuit Workspace with synchronized Qiskit code & dual simulation run
 * 4. Visual Evidence inspection (basis 00 and 11 probabilities)
 * 5. Quantum Flight Recorder divergence detection (SUPERPOSITION_VS_ENTANGLEMENT & MIXED_SUBSYSTEM)
 * 6. Evidence-bound Tutor explanation with provider/fallback runtime badge
 * 7. Repair Challenge attempt submission & atomic progress record update
 * 8. Learner Progress Record view (/progress)
 * 9. Brief Instructor Insight proof (/instructor) with cohort divergence signals
 */

test.describe('Learner-Led Bell Journey E2E (QA-6)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear client-side local storage drafts before page scripts run
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('executes complete learner-led journey from prediction to repair and instructor proof', async ({ page }) => {
    // -------------------------------------------------------------------------
    // Beat 1: Seeded role entry (Aarav)
    // -------------------------------------------------------------------------
    await page.goto('/learn/bell-state');

    // Confirm Aarav is active in RoleSwitcher
    const aaravBtn = page.getByTestId('role-btn-aarav');
    await expect(aaravBtn).toBeVisible();
    await aaravBtn.click();

    // Verify Bell state header and prior knowledge badge
    await expect(page.getByTestId('learn-bell-state-view')).toBeVisible();
    const priorKnowledgeBadge = page.getByTestId('prior-knowledge-path-badge');
    await expect(priorKnowledgeBadge).toBeVisible();
    await expect(priorKnowledgeBadge).toContainText('Aarav');

    // -------------------------------------------------------------------------
    // Beat 2: Prediction Checkpoint
    // -------------------------------------------------------------------------
    const predictionCard = page.getByTestId('prediction-checkpoint-card');
    await expect(predictionCard).toBeVisible();

    // Select the common misconception: Two independent random outputs
    const independentRandomOpt = page.getByTestId('prediction-opt-INDEPENDENT_RANDOM');
    await expect(independentRandomOpt).toBeVisible();
    await independentRandomOpt.click();

    // Record the prediction
    const recordBtn = page.getByTestId('confirm-prediction-btn');
    await expect(recordBtn).toBeEnabled();
    await recordBtn.click();

    // Verify draft saved indicator
    await expect(page.getByTestId('prediction-saved-indicator')).toBeVisible();
    await expect(page.getByTestId('prediction-saved-indicator')).toContainText('Draft saved');

    // -------------------------------------------------------------------------
    // Beat 3: Visual builder + Synchronized Qiskit code
    // -------------------------------------------------------------------------
    const circuitWorkspace = page.getByTestId('interactive-circuit-workspace');
    await expect(circuitWorkspace).toBeVisible();

    // Verify synchronized Qiskit code contains expected gate calls
    const qiskitPanel = page.getByTestId('qiskit-code-panel');
    await expect(qiskitPanel).toBeVisible();
    const qiskitInput = page.getByTestId('qiskit-code-editor-input');
    await expect(qiskitInput).toBeVisible();
    await expect(qiskitInput).toHaveValue(/QuantumCircuit/);
    await expect(qiskitInput).toHaveValue(/qc\.h\(0\)/);
    await expect(qiskitInput).toHaveValue(/qc\.cx\(0,\s*1\)/);

    // -------------------------------------------------------------------------
    // Beat 4: Dual simulation execution
    // -------------------------------------------------------------------------
    const runBtn = page.getByTestId('run-simulation-btn');
    await expect(runBtn).toBeVisible();
    await expect(runBtn).toBeEnabled();
    await runBtn.click();

    // -------------------------------------------------------------------------
    // Beat 5: Visual Evidence
    // -------------------------------------------------------------------------
    const visualEvidence = page.getByTestId('visual-evidence-card');
    await expect(visualEvidence).toBeVisible({ timeout: 15000 });
    await expect(visualEvidence).toContainText('|00⟩');
    await expect(visualEvidence).toContainText('|11⟩');

    // -------------------------------------------------------------------------
    // Beat 6: Quantum Flight Recorder wow moment
    // -------------------------------------------------------------------------
    const flightRecorder = page.getByTestId('flight-recorder-card');
    await expect(flightRecorder).toBeVisible();

    // Verify misconception code identified
    const misconceptionCode = page.getByTestId('misconception-code');
    await expect(misconceptionCode).toBeVisible();
    await expect(misconceptionCode).toContainText('SUPERPOSITION_VS_ENTANGLEMENT');

    // Verify first divergence point at Step 1 (After CNOT)
    const divergenceStep = page.getByTestId('first-divergence-step');
    await expect(divergenceStep).toBeVisible();
    await expect(divergenceStep).toContainText('Step 1');

    // Step 1 scrubber inspection shows MIXED_SUBSYSTEM for reduced state
    const step1Btn = page.getByTestId('step-btn-1');
    await step1Btn.click();
    const subsystemLabel0 = page.getByTestId('subsystem-label-0');
    await expect(subsystemLabel0).toBeVisible();
    await expect(subsystemLabel0).toContainText('MIXED_SUBSYSTEM');

    // -------------------------------------------------------------------------
    // Beat 7: Evidence-bound Tutor & Repair Challenge
    // -------------------------------------------------------------------------
    const tutorCard = page.getByTestId('tutor-card');
    await expect(tutorCard).toBeVisible();

    // Verify Tutor provider/fallback runtime badge is present
    const tutorBadge = page.getByTestId('tutor-fallback-badge');
    await expect(tutorBadge).toBeVisible();

    // Verify grounded pedagogical summary
    const tutorSummary = page.getByTestId('tutor-summary');
    await expect(tutorSummary).toBeVisible();

    // Repair Challenge submission
    const repairCard = page.getByTestId('repair-challenge-card');
    await expect(repairCard).toBeVisible();

    const submitRepairBtn = page.getByTestId('submit-repair-btn');
    await expect(submitRepairBtn).toBeVisible();
    await expect(submitRepairBtn).toBeEnabled();
    await submitRepairBtn.click();

    // Verify repair passed and atomic progress success card
    const repairStatusBadge = page.getByTestId('repair-status-badge');
    await expect(repairStatusBadge).toBeVisible({ timeout: 15000 });
    await expect(repairStatusBadge).toContainText('REPAIR ATTEMPT PASSED');

    const progressSuccessCard = page.getByTestId('progress-success-card');
    await expect(progressSuccessCard).toBeVisible();
    await expect(page.getByTestId('total-points-display')).toBeVisible();

    // -------------------------------------------------------------------------
    // Beat 8: Learner Progress Record & Instructor Insight proof
    // -------------------------------------------------------------------------
    // Navigate to /progress
    await page.getByRole('link', { name: 'Progress' }).click();
    const progressView = page.getByTestId('progress-view');
    await expect(progressView).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('progress-id-badge')).toBeVisible();

    // Navigate to /instructor
    await page.getByRole('link', { name: 'Instructor' }).click();
    const instructorView = page.getByTestId('instructor-insight-view');
    await expect(instructorView).toBeVisible({ timeout: 30000 });

    // Switch role to Dr. Rao for instructor proof
    const drRaoBtn = page.getByTestId('role-btn-drrao');
    await expect(drRaoBtn).toBeVisible();
    await drRaoBtn.click();

    await expect(page.getByTestId('instructor-meta-badge')).toBeVisible();
    await expect(instructorView).toContainText('SUPERPOSITION_VS_ENTANGLEMENT');
  });
});
