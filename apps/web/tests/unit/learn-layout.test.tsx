import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import LearnIndexPage from '@/app/(app)/learn/page';
import BellStateLearnPage from '@/app/(app)/learn/bell-state/page';
import { useRoleStore } from '@/lib/role-store';

describe('Learn Page Layout, Stepper & Algorithm Sidebar Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    useRoleStore.getState().setRole('role_aarav');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the guided pedagogical prompt card and step progression directive on /learn catalogue', () => {
    render(<LearnIndexPage />);

    // 1. Guided Prompt
    const prompt = screen.getByTestId('learning-guided-prompt');
    expect(prompt).toBeDefined();
    expect(screen.getByText(/Pedagogical Directive · Sequential Mastery/i)).toBeDefined();
    expect(screen.getByText(/Step-by-Step Flow/i)).toBeDefined();
    expect(screen.getByText(/Follow the sequential progression below/i)).toBeDefined();

    // 2. Stepper Header
    expect(screen.getByText('Step-by-Step Progression')).toBeDefined();
  });

  it('renders the LearnSidebar with Bell correlation hero lab and future algorithms roadmap', () => {
    render(<LearnIndexPage />);

    const sidebar = screen.getByTestId('learn-sidebar');
    expect(sidebar).toBeDefined();

    // Bell Correlation
    expect(screen.getByText('Bell State Correlation')).toBeDefined();
    expect(screen.getByText('PRIMARY BENCHMARK')).toBeDefined();
    expect(screen.getByText('LIVE LAB')).toBeDefined();
    expect(screen.getByText('Launch Bell Correlation Lab')).toBeDefined();

    // Future algorithms
    expect(screen.getByText('Future Algorithms')).toBeDefined();
    expect(screen.getByText('Quantum Teleportation')).toBeDefined();
    expect(screen.getByText('Superdense Coding')).toBeDefined();
    expect(screen.getByText('Deutsch-Jozsa Algorithm')).toBeDefined();
    expect(screen.getByText("Grover's Search")).toBeDefined();
    expect(screen.getByText('Quantum Fourier Transform (QFT)')).toBeDefined();
    expect(screen.getByText('Variational Quantum Eigensolver (VQE)')).toBeDefined();
  });

  it('supports stepping through one by one via Next Step and Prev Step buttons on /learn', () => {
    render(<LearnIndexPage />);

    // Initial state: Step 1 in focus
    expect(screen.getByText(/Step 1 of 3 in focus/i)).toBeDefined();

    // Click Next Step -> Step 2
    const nextBtn = screen.getByRole('button', { name: /Next Step/i }) as HTMLButtonElement;
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 2 of 3 in focus/i)).toBeDefined();

    // Click Next Step -> Step 3
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 3 of 3 in focus/i)).toBeDefined();
    expect(nextBtn.disabled).toBe(true);

    // Click Prev Step -> Step 2
    const prevBtn = screen.getByRole('button', { name: /Prev Step/i }) as HTMLButtonElement;
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Step 2 of 3 in focus/i)).toBeDefined();
  });

  it('renders the LearnSidebar and step-by-step controller on the Bell State lesson page (/learn/bell-state)', () => {
    render(<BellStateLearnPage />);

    // 1. Sidebar presence
    const sidebar = screen.getByTestId('learn-sidebar');
    expect(sidebar).toBeDefined();
    expect(screen.getByText('Bell State Correlation')).toBeDefined();
    expect(screen.getByText('Future Algorithms')).toBeDefined();

    // 2. Stepper controller
    expect(screen.getByText('Interactive Learning Stepper')).toBeDefined();
    expect(screen.getByText(/Step 1 of 7/i)).toBeDefined();

    // 3. Step 1 Prediction Directive Prompt
    expect(screen.getByText(/Step 01 · Initial Prediction Directive/i)).toBeDefined();

    // 4. Stepping forward: Click Next -> Step 2
    const nextBtn = screen.getByRole('button', { name: /Next: Step 2 — Build & Simulate Circuit/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 2 of 7/i)).toBeDefined();
    expect(screen.getByText(/Interactive Circuit Workspace & Qiskit Aer/i)).toBeDefined();

    // 5. Toggle View All Mode
    const viewAllBtn = screen.getByRole('button', { name: /View All/i });
    fireEvent.click(viewAllBtn);
    expect(screen.getByTestId('prediction-checkpoint-card')).toBeDefined();
    expect(screen.getByTestId('interactive-circuit-workspace')).toBeDefined();
  });
});
