import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteSessionDialog } from '../delete-session-dialog';
import { EndInterviewDialog } from '../end-interview-dialog';

/**
 * @fileoverview
 * Unit tests for DeleteSessionDialog and EndInterviewDialog components.
 * These modal dialogs confirm destructive actions and provide user choices.
 * Tests verify text rendering, button interaction, and callback invocation.
 */

describe('DeleteSessionDialog', () => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    onCancel.mockClear();
    onConfirm.mockClear();
  });

  /**
   * @test
   * Checks that the delete dialog renders with correct title and message.
   */
  test('renders with default title and confirmation text', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onCancel={onCancel}
        onConfirm={onConfirm}
        interviewTitle="Mock Interview"
      />
    );

    expect(screen.getByText('Delete Interview')).toBeInTheDocument();
    expect(screen.getByText(/permanently delete/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  /**
   * @test
   * Simulates clicking the Cancel button and verifies onCancel is triggered.
   */
  test('calls onCancel when cancel button is clicked', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onCancel={onCancel}
        onConfirm={onConfirm}
        interviewTitle="Mock Interview"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  /**
   * @test
   * Simulates clicking the Delete button and verifies onConfirm is triggered.
   */
  test('calls onConfirm when delete button is clicked', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onCancel={onCancel}
        onConfirm={onConfirm}
        interviewTitle="Mock Interview"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalled();
  });
});

describe('EndInterviewDialog', () => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    onCancel.mockClear();
    onConfirm.mockClear();
  });

  /**
   * @test
   * Verifies that the end interview dialog displays the expected confirmation text.
   */
  test('renders with static confirmation message', () => {
    render(
      <EndInterviewDialog
        open={true}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('heading', { name: /end interview/i })).toBeInTheDocument();
    expect(screen.getByText(/end this interview session/i)).toBeInTheDocument();
    expect(screen.getByText(/won't be able to modify/i)).toBeInTheDocument();
  });

  /**
   * @test
   * Simulates clicking Cancel and ensures onCancel is called.
   */
  test('calls onCancel when cancel button is clicked', () => {
    render(
      <EndInterviewDialog
        open={true}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  /**
   * @test
   * Simulates clicking the End Interview button and ensures onConfirm is called.
   */
  test('calls onConfirm when end interview button is clicked', () => {
    render(
      <EndInterviewDialog
        open={true}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    // Ensure the button is targeted (not the title)
    fireEvent.click(screen.getAllByRole('button', { name: /end interview/i })[0]);
    expect(onConfirm).toHaveBeenCalled();
  });
});
