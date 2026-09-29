import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { render } from '../test-utils';
import React from 'react';
import {
  GroverAmplitudeScrubber,
  CANONICAL_GROVER_STEPS,
  detectMarkedState,
  getBasisStates,
  getSignedAmplitude,
  computeMeanAmplitude,
  getGroverStepDescription,
  isGroverCircuit,
  GROVER_CIRCUIT,
} from '@/features/evidence/grover-amplitude-scrubber';
import { StateTraceStep, CircuitModel } from '@/lib/contracts';

describe('FEA-4: Grover Amplitude Scrubber UI Component', () => {
  // Test fixture: 3-qubit Grover 5-step trace
  const mockTrace: StateTraceStep[] = [
    {
      stepIndex: 0,
      operationId: 'op_0',
      label: 'After H gates',
      basisProbabilities: {
        '000': 0.125, '001': 0.125, '010': 0.125, '011': 0.125,
        '100': 0.125, '101': 0.125, '110': 0.125, '111': 0.125,
      },
      amplitudes: {
        '000': { re: 0.354, im: 0.0 }, '001': { re: 0.354, im: 0.0 },
        '010': { re: 0.354, im: 0.0 }, '011': { re: 0.354, im: 0.0 },
        '100': { re: 0.354, im: 0.0 }, '101': { re: 0.354, im: 0.0 },
        '110': { re: 0.354, im: 0.0 }, '111': { re: 0.354, im: 0.0 },
      },
      reducedQubits: [],
    },
    {
      stepIndex: 1,
      operationId: 'op_1',
      label: 'Oracle Phase Flip',
      basisProbabilities: {
        '000': 0.125, '001': 0.125, '010': 0.125, '011': 0.125,
        '100': 0.125, '101': 0.125, '110': 0.125, '111': 0.125,
      },
      amplitudes: {
        '000': { re: 0.354, im: 0.0 }, '001': { re: 0.354, im: 0.0 },
        '010': { re: 0.354, im: 0.0 }, '011': { re: 0.354, im: 0.0 },
        '100': { re: 0.354, im: 0.0 }, '101': { re: -0.354, im: 0.0 },
        '110': { re: 0.354, im: 0.0 }, '111': { re: 0.354, im: 0.0 },
      },
      reducedQubits: [],
    },
    {
      stepIndex: 2,
      operationId: 'op_2',
      label: 'Diffusion Inversion About Mean',
      basisProbabilities: {
        '000': 0.031, '001': 0.031, '010': 0.031, '011': 0.031,
        '100': 0.031, '101': 0.531, '110': 0.031, '111': 0.031,
      },
      amplitudes: {
        '000': { re: 0.177, im: 0.0 }, '001': { re: 0.177, im: 0.0 },
        '010': { re: 0.177, im: 0.0 }, '011': { re: 0.177, im: 0.0 },
        '100': { re: 0.177, im: 0.0 }, '101': { re: 0.729, im: 0.0 },
        '110': { re: 0.177, im: 0.0 }, '111': { re: 0.177, im: 0.0 },
      },
      reducedQubits: [],
    },
    {
      stepIndex: 3,
      operationId: 'op_3',
      label: 'Oracle Phase Flip 2',
      basisProbabilities: {
        '000': 0.031, '001': 0.031, '010': 0.031, '011': 0.031,
        '100': 0.031, '101': 0.531, '110': 0.031, '111': 0.031,
      },
      amplitudes: {
        '000': { re: 0.177, im: 0.0 }, '001': { re: 0.177, im: 0.0 },
        '010': { re: 0.177, im: 0.0 }, '011': { re: 0.177, im: 0.0 },
        '100': { re: 0.177, im: 0.0 }, '101': { re: -0.729, im: 0.0 },
        '110': { re: 0.177, im: 0.0 }, '111': { re: 0.177, im: 0.0 },
      },
      reducedQubits: [],
    },
    {
      stepIndex: 4,
      operationId: 'op_4',
      label: 'Final Diffusion Reflection',
      basisProbabilities: {
        '000': 0.008, '001': 0.008, '010': 0.008, '011': 0.008,
        '100': 0.008, '101': 0.945, '110': 0.008, '111': 0.008,
      },
      amplitudes: {
        '000': { re: 0.088, im: 0.0 }, '001': { re: 0.088, im: 0.0 },
        '010': { re: 0.088, im: 0.0 }, '011': { re: 0.088, im: 0.0 },
        '100': { re: 0.088, im: 0.0 }, '101': { re: 0.972, im: 0.0 },
        '110': { re: 0.088, im: 0.0 }, '111': { re: 0.088, im: 0.0 },
      },
      reducedQubits: [],
    },
  ];

  describe('1. Pure Helper Functions & Mathematical Precision', () => {
    it('detectMarkedState identifies the phase-inverted state |101⟩ from negative amplitudes', () => {
      const detected = detectMarkedState(mockTrace, '000');
      expect(detected).toBe('101');
    });

    it('detectMarkedState falls back correctly when no negative amplitude exists', () => {
      const fallback = detectMarkedState([mockTrace[0]], '111');
      expect(fallback).toBe('111');
    });

    it('getBasisStates generates all 2^n basis states in lexicographical order', () => {
      const states3Q = getBasisStates(undefined, 3);
      expect(states3Q).toEqual(['000', '001', '010', '011', '100', '101', '110', '111']);

      const states2Q = getBasisStates(undefined, 2);
      expect(states2Q).toEqual(['00', '01', '10', '11']);
    });

    it('getSignedAmplitude returns signed real values correctly', () => {
      expect(getSignedAmplitude(mockTrace[1], '101')).toBe(-0.354);
      expect(getSignedAmplitude(mockTrace[1], '000')).toBe(0.354);
      expect(getSignedAmplitude(mockTrace[2], '101')).toBe(0.729);
      expect(getSignedAmplitude(undefined, '101')).toBe(0);
    });

    it('computeMeanAmplitude calculates the arithmetic average amplitude ᾱ', () => {
      const states = getBasisStates(mockTrace[0], 3);

      // Step 0: all 8 states equal +0.354 -> mean = +0.354
      const mean0 = computeMeanAmplitude(mockTrace[0], states);
      expect(mean0).toBeCloseTo(0.354, 3);

      // Step 1: 7 states at +0.354, 1 state at -0.354 -> mean = (7*0.354 - 0.354)/8 = 6*0.354/8 = 0.2655
      const mean1 = computeMeanAmplitude(mockTrace[1], states);
      expect(mean1).toBeCloseTo(0.2655, 3);

      // Empty step returns 0
      expect(computeMeanAmplitude(undefined, states)).toBe(0);
    });

    it('getGroverStepDescription categorizes Oracle Phase Flip and Diffusion steps accurately', () => {
      const oracleDesc = getGroverStepDescription(mockTrace[1], '101', 1, 5);
      expect(oracleDesc.title).toBe('Oracle Phase Flip');
      expect(oracleDesc.category).toBe('Phase Inversion');
      expect(oracleDesc.description).toContain('inverting its sign');

      const diffusionDesc = getGroverStepDescription(mockTrace[2], '101', 2, 5);
      expect(diffusionDesc.title).toBe('Diffusion (Inversion About Mean)');
      expect(diffusionDesc.category).toBe('Amplitude Amplification');
      expect(diffusionDesc.description).toContain('average height ᾱ');

      const initDesc = getGroverStepDescription(mockTrace[0], '101', 0, 5);
      expect(initDesc.title).toBe('Equal Superposition');
      expect(initDesc.category).toBe('Initialization');
    });
  });

  describe('2. Rendering & Linear Design System Styling', () => {
    it('renders all 8 basis state bars and ket labels for a 3-qubit Grover circuit', () => {
      render(<GroverAmplitudeScrubber stateTrace={mockTrace} markedState="101" />);

      // Verify scrubber card and SVG exist
      expect(screen.getByTestId('grover-amplitude-scrubber')).toBeDefined();
      expect(screen.getByTestId('grover-amplitude-svg')).toBeDefined();

      // Verify all 8 basis state bars and ket labels are rendered
      const expectedStates = ['000', '001', '010', '011', '100', '101', '110', '111'];
      for (const s of expectedStates) {
        expect(screen.getByTestId(`basis-bar-${s}`)).toBeDefined();
        expect(screen.getByTestId(`ket-label-${s}`).textContent).toContain(`|${s}⟩`);
      }
    });

    it('highlights the marked target |101⟩ in Electric Cyan (#00D4FF) and non-marked in Cobalt (#1E40AF)', () => {
      render(<GroverAmplitudeScrubber stateTrace={mockTrace} markedState="101" />);

      // Marked state bar
      const markedBar = screen.getByTestId('basis-bar-101');
      expect(markedBar.getAttribute('data-marked')).toBe('true');
      const markedRect = markedBar.querySelector('rect');
      expect(markedRect?.getAttribute('fill')).toBe('#00D4FF');

      // Non-marked state bar (e.g. |000⟩)
      const nonMarkedBar = screen.getByTestId('basis-bar-000');
      expect(nonMarkedBar.getAttribute('data-marked')).toBe('false');
      const nonMarkedRect = nonMarkedBar.querySelector('rect');
      expect(nonMarkedRect?.getAttribute('fill')).toBe('#1E40AF');
    });

    it('renders the dashed mean amplitude line (ᾱ) with label', () => {
      render(<GroverAmplitudeScrubber stateTrace={mockTrace} markedState="101" />);

      const meanLine = screen.getByTestId('mean-amplitude-line');
      expect(meanLine).toBeDefined();
      expect(meanLine.getAttribute('stroke-dasharray')).toBe('4 4');

      const meanLabel = screen.getByTestId('mean-amplitude-label');
      expect(meanLabel).toBeDefined();
      expect(meanLabel.textContent).toContain('ᾱ=');
    });

    it('displays the target badge, probability readout, and step counter', () => {
      render(<GroverAmplitudeScrubber stateTrace={mockTrace} markedState="101" />);

      expect(screen.getByTestId('marked-state-badge').textContent).toContain('Target: |101⟩');
      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 1 of 5');
      expect(screen.getByTestId('marked-probability-value')).toBeDefined();
      expect(screen.getByTestId('mean-amplitude-value')).toBeDefined();
    });
  });

  describe('3. Scrubber Timeline & Step Progression Interaction', () => {
    it('advances through execution steps using Next / Previous buttons', () => {
      const onStepChange = vi.fn();
      render(
        <GroverAmplitudeScrubber
          stateTrace={mockTrace}
          markedState="101"
          onStepChange={onStepChange}
        />
      );

      const nextBtn = screen.getByTestId('scrubber-next-btn');
      const prevBtn = screen.getByTestId('scrubber-prev-btn');

      // Initially at step 0: prev is disabled
      expect(prevBtn.hasAttribute('disabled')).toBe(true);
      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 1 of 5');

      // Click Next -> moves to Step 1 (Oracle Phase Flip)
      fireEvent.click(nextBtn);
      expect(onStepChange).toHaveBeenCalledWith(1);
      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 2 of 5');
      expect(screen.getByTestId('scrubber-step-title').textContent).toContain('Oracle Phase Flip');

      // Amplitude for |101⟩ is now negative
      expect(screen.getByTestId('amplitude-val-101').textContent).toBe('-0.354');

      // Click Next again -> moves to Step 2 (Diffusion)
      fireEvent.click(nextBtn);
      expect(onStepChange).toHaveBeenCalledWith(2);
      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 3 of 5');
      expect(screen.getByTestId('scrubber-step-title').textContent).toContain('Diffusion');

      // Click Prev -> moves back to Step 1
      fireEvent.click(prevBtn);
      expect(onStepChange).toHaveBeenCalledWith(1);
      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 2 of 5');
    });

    it('updates position and reflects negative phase flip when scrubbing range input', () => {
      const onStepChange = vi.fn();
      render(
        <GroverAmplitudeScrubber
          stateTrace={mockTrace}
          markedState="101"
          onStepChange={onStepChange}
        />
      );

      const slider = screen.getByTestId('grover-range-slider');

      // Scrub to Step 1 (Oracle Phase Flip)
      fireEvent.change(slider, { target: { value: '1' } });
      expect(onStepChange).toHaveBeenCalledWith(1);
      expect(screen.getByTestId('amplitude-val-101').textContent).toBe('-0.354');

      // Scrub to Step 4 (Final peak amplification)
      fireEvent.change(slider, { target: { value: '4' } });
      expect(onStepChange).toHaveBeenCalledWith(4);
      expect(screen.getByTestId('amplitude-val-101').textContent).toBe('+0.972');
      expect(screen.getByTestId('marked-probability-value').textContent).toBe('94.5%');
    });

    it('jumps directly to step when clicking step pills in the navigation strip', () => {
      const onStepChange = vi.fn();
      render(
        <GroverAmplitudeScrubber
          stateTrace={mockTrace}
          markedState="101"
          onStepChange={onStepChange}
        />
      );

      // Click pill for Step 3 (index 2: Diffusion)
      const pill2 = screen.getByTestId('step-pill-2');
      fireEvent.click(pill2);

      expect(onStepChange).toHaveBeenCalledWith(2);
      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 3 of 5');
      expect(screen.getByTestId('amplitude-val-101').textContent).toBe('+0.729');
    });

    it('resets to step 0 when clicking the reset button', () => {
      render(<GroverAmplitudeScrubber stateTrace={mockTrace} initialStepIndex={3} />);

      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 4 of 5');

      const resetBtn = screen.getByTestId('scrubber-reset-btn');
      fireEvent.click(resetBtn);

      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 1 of 5');
    });

    it('toggles auto-play animation and advances steps', () => {
      vi.useFakeTimers();
      const onStepChange = vi.fn();
      render(
        <GroverAmplitudeScrubber
          stateTrace={mockTrace}
          markedState="101"
          onStepChange={onStepChange}
        />
      );

      const playToggle = screen.getByTestId('scrubber-play-toggle');
      expect(playToggle.textContent).toContain('Auto Play');

      // Start auto play
      fireEvent.click(playToggle);
      expect(playToggle.textContent).toContain('Pause');

      // Fast-forward 1 step (1400ms)
      act(() => {
        vi.advanceTimersByTime(1400);
      });
      expect(onStepChange).toHaveBeenCalledWith(1);

      // Fast-forward another step
      act(() => {
        vi.advanceTimersByTime(1400);
      });
      expect(onStepChange).toHaveBeenCalledWith(2);

      // Pause
      fireEvent.click(playToggle);
      expect(playToggle.textContent).toContain('Auto Play');

      vi.useRealTimers();
    });
  });

  describe('4. Grover Heuristic Detection & Preset Validation', () => {
    it('isGroverCircuit returns true only when circuit has BOTH CCX and H gates', () => {
      // Empty circuit -> false
      expect(isGroverCircuit(null)).toBe(false);
      expect(isGroverCircuit({ qubitCount: 2, classicalBitCount: 2, operations: [] } as any)).toBe(false);

      // Circuit with only H (Superposition) -> false
      const hOnly: Partial<CircuitModel> = {
        operations: [{ opId: '1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 }],
      };
      expect(isGroverCircuit(hOnly as CircuitModel)).toBe(false);

      // Circuit with H and CNOT (Bell state) -> false
      const bell: Partial<CircuitModel> = {
        operations: [
          { opId: '1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
          { opId: '2', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 1 },
        ],
      };
      expect(isGroverCircuit(bell as CircuitModel)).toBe(false);

      // Circuit with H and CCX (Grover) -> true
      const grover: Partial<CircuitModel> = {
        operations: [
          { opId: '1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
          { opId: '2', gate: 'CCX', targets: [2], controls: [0, 1], classicalTargets: [], column: 1 },
        ],
      };
      expect(isGroverCircuit(grover as CircuitModel)).toBe(true);
    });

    it('GROVER_CIRCUIT benchmark preset satisfies all Grover requirements', () => {
      expect(GROVER_CIRCUIT).toBeDefined();
      expect(GROVER_CIRCUIT.qubitCount).toBe(3);
      expect(GROVER_CIRCUIT.classicalBitCount).toBe(3);

      const ops = GROVER_CIRCUIT.operations;
      expect(ops.length).toBeGreaterThan(15);

      // Contains CCX and H
      expect(ops.some((op) => op.gate === 'CCX')).toBe(true);
      expect(ops.some((op) => op.gate === 'H')).toBe(true);

      // isGroverCircuit confirms preset is Grover
      expect(isGroverCircuit(GROVER_CIRCUIT)).toBe(true);
    });
  });

  describe('5. Robustness & Fallback Edge Cases', () => {
    it('gracefully falls back to CANONICAL_GROVER_STEPS when given empty stateTrace', () => {
      render(<GroverAmplitudeScrubber stateTrace={[]} />);

      // Component renders fallback with 5 steps
      expect(screen.getByTestId('grover-amplitude-scrubber')).toBeDefined();
      expect(screen.getByTestId('step-counter-text').textContent).toBe('Step 1 of 5');
      expect(CANONICAL_GROVER_STEPS).toHaveLength(5);
    });

    it('sanitizes ket characters in rawMarkedState prop', () => {
      render(<GroverAmplitudeScrubber stateTrace={mockTrace} markedState="|101⟩" />);

      expect(screen.getByTestId('marked-state-badge').textContent).toContain('Target: |101⟩');
    });
  });
});
