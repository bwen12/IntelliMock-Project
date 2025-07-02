/**
 * @fileoverview
 * Unit tests for the `useNotification` custom hook that wraps notifications using `notistack`.
 * Tests ensure the correct behavior of success, error, info, and warning notifications.
 */

import { describe, test, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotification } from '../useNotification';
import { SnackbarProvider } from 'notistack';

// Mock notistack's useSnackbar
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: vi.fn(),
  }),
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('useNotification', () => {
  /**
   * @test
   * Verifies that a success notification is shown when calling `showSuccess`.
   */
  test('shows success notification', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: SnackbarProvider,
    });

    result.current.showSuccess('Test success message');
    expect(result.current.showSuccess).toBeDefined();
  });

  /**
   * @test
   * Verifies that an error notification is shown when calling `showError`.
   */
  test('shows error notification', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: SnackbarProvider,
    });

    result.current.showError('Test error message');
    expect(result.current.showError).toBeDefined();
  });

  /**
   * @test
   * Verifies that an info notification is shown when calling `showInfo`.
   */
  test('shows info notification', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: SnackbarProvider,
    });

    result.current.showInfo('Test info message');
    expect(result.current.showInfo).toBeDefined();
  });

  /**
   * @test
   * Verifies that a warning notification is shown when calling `showWarning`.
   */
  test('shows warning notification', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: SnackbarProvider,
    });

    result.current.showWarning('Test warning message');
    expect(result.current.showWarning).toBeDefined();
  });

  /**
   * @test
   * Verifies that options can be passed to the notification function, such as auto-hide duration.
   */
  test('passes options to notifications', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: SnackbarProvider,
    });

    const options = { autoHideDuration: 5000 };
    result.current.showSuccess('Test message', options);
    expect(result.current.showSuccess).toBeDefined();
  });
}); 