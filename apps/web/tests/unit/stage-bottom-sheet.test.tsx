import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import { StageBottomSheet } from '@/features/learning/components/stage-bottom-sheet';
import { allCurriculumStages } from '@/lib/curriculum/all-stages';
import { CurriculumStage } from '@/lib/curriculum/types';

describe('StageBottomSheet Component Suite (DUO-12)', () => {
  const sampleStage: CurriculumStage = allCurriculumStages.find(
    (s) => s.id === 'stage_1_3_hadamard' || s.id === 'bell-state'
  ) || allCurriculumStages[0];

  it('renders bottom sheet modal with 75vh height and drag handle pill when isOpen is true', () => {
    const handleClose = vi.fn();

    render(
      <StageBottomSheet
        stage={sampleStage}
        isOpen={true}
        onClose={handleClose}
      />
    );

    // 1. Container and Sheet Presence
    const sheet = screen.getByTestId('stage-bottom-sheet');
    expect(sheet).toBeDefined();
    expect(sheet.className).toContain('h-[75vh]');
    expect(sheet.className).toContain('max-h-[75vh]');

    // 2. Drag Handle Pill
    const dragHandle = screen.getByTestId('sheet-drag-handle');
    expect(dragHandle).toBeDefined();
    expect(dragHandle.getAttribute('aria-label')).toContain('Drag down or tap to dismiss');

    // 3. Backdrop Presence
    const backdrop = screen.getByTestId('bottom-sheet-backdrop');
    expect(backdrop).toBeDefined();
  });

  it('hides or disables pointer events when isOpen is false', () => {
    const handleClose = vi.fn();

    render(
      <StageBottomSheet
        stage={sampleStage}
        isOpen={false}
        onClose={handleClose}
      />
    );

    const wrapper = screen.getByTestId('stage-bottom-sheet-wrapper');
    expect(wrapper.className).toContain('pointer-events-none');
    expect(wrapper.className).toContain('opacity-0');
  });

  it('renders deep stage telemetry matrix (difficulty, estimated time, coherence yield, shield restore)', () => {
    render(
      <StageBottomSheet
        stage={sampleStage}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // 1. Title and Archetype badge
    expect(screen.getByTestId('sheet-stage-title').textContent).toContain(sampleStage.title);
    expect(screen.getByTestId('sheet-stage-badge')).toBeDefined();

    // 2. Telemetry Grid
    const telemetryGrid = screen.getByTestId('sheet-telemetry-grid');
    expect(telemetryGrid).toBeDefined();
    expect(telemetryGrid.textContent).toContain('Difficulty');
    expect(telemetryGrid.textContent).toContain('Est. Time');
    expect(telemetryGrid.textContent).toContain('Coherence Yield');
    expect(telemetryGrid.textContent).toContain('Shield Restore');
    expect(telemetryGrid.textContent).toContain(`${sampleStage.coherenceReward || 35} XP`);
    expect(telemetryGrid.textContent).toContain('+15% Coherence');
  });

  it('renders prediction checkpoint radio options and allows selection', () => {
    const handleSelectOption = vi.fn();

    render(
      <StageBottomSheet
        stage={sampleStage}
        isOpen={true}
        onClose={vi.fn()}
        onSelectPredictionOption={handleSelectOption}
      />
    );

    if (sampleStage.predictionCheckpoint) {
      const checkpoint = screen.getByTestId('bottom-sheet-prediction-checkpoint');
      expect(checkpoint).toBeDefined();
      expect(checkpoint.textContent).toContain(sampleStage.predictionCheckpoint.prompt);

      const radioOptions = screen.getByTestId('bottom-sheet-prediction-options');
      expect(radioOptions).toBeDefined();

      const firstOption = sampleStage.predictionCheckpoint.options[0];
      const optEl = screen.getByTestId(`sheet-prediction-option-${firstOption.id}`);
      expect(optEl).toBeDefined();

      fireEvent.click(optEl);
      expect(handleSelectOption).toHaveBeenCalledWith(firstOption.id);
    }
  });

  it('renders 48px Thumb Action CTA button (ENTER CHAMBER) with h-12 height and sparks icon', () => {
    const handleEnterChamber = vi.fn();

    render(
      <StageBottomSheet
        stage={sampleStage}
        isOpen={true}
        onClose={vi.fn()}
        onEnterChamber={handleEnterChamber}
      />
    );

    const ctaBtn = screen.getByTestId('mobile-enter-chamber-btn');
    expect(ctaBtn).toBeDefined();
    expect(ctaBtn.className).toContain('h-12');
    expect(ctaBtn.textContent).toContain('ENTER CHAMBER');

    fireEvent.click(ctaBtn);
    expect(handleEnterChamber).toHaveBeenCalledWith(sampleStage);
  });

  it('calls onClose when close button, backdrop, or drag handle is clicked', () => {
    const handleClose = vi.fn();

    render(
      <StageBottomSheet
        stage={sampleStage}
        isOpen={true}
        onClose={handleClose}
      />
    );

    // 1. Close Button
    const closeBtn = screen.getByTestId('bottom-sheet-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // 2. Backdrop
    const backdrop = screen.getByTestId('bottom-sheet-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(2);

    // 3. Drag Handle
    const dragHandle = screen.getByTestId('sheet-drag-handle');
    fireEvent.click(dragHandle);
    expect(handleClose).toHaveBeenCalledTimes(3);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();

    render(
      <StageBottomSheet
        stage={sampleStage}
        isOpen={true}
        onClose={handleClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('detects swipe-down drag gesture (>60px) and dismisses sheet', () => {
    const handleClose = vi.fn();

    render(
      <StageBottomSheet
        stage={sampleStage}
        isOpen={true}
        onClose={handleClose}
      />
    );

    const sheet = screen.getByTestId('stage-bottom-sheet');

    // Simulate touch swipe down of 80px (> 60px threshold)
    fireEvent.touchStart(sheet, {
      touches: [{ clientY: 100 }],
    });
    fireEvent.touchMove(sheet, {
      touches: [{ clientY: 180 }],
    });
    fireEvent.touchEnd(sheet);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
