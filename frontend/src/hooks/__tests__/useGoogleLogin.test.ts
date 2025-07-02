/**
 * @fileoverview
 * Unit tests for the `useGoogleLogin` custom hook.
 * Tests verify the hook's behavior when interacting with the Google login API, handling success, errors, and environment configuration.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGoogleLogin } from '../useGoogleLogin';
import { useAuthContext } from '../../contexts/AuthProvider';
import { useNotification } from '../useNotification';
import { loginWithGoogle, getCurrentUser } from '../../services/authService';
import { UserResponse } from '../../types/UserResponse';

// Mock dependencies
vi.mock('../../contexts/AuthProvider', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../useNotification', () => ({
  useNotification: vi.fn(),
}));

vi.mock('../../services/authService', () => ({
  loginWithGoogle: vi.fn(),
  getCurrentUser: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('useGoogleLogin', () => {
  const mockSetUser = vi.fn();
  const mockShowError = vi.fn();
  const mockShowSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue({ setUser: mockSetUser } as any);
    vi.mocked(useNotification).mockReturnValue({
      showError: mockShowError,
      showSuccess: mockShowSuccess,
    } as any);

    // Mock window.google
    window.google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn(),
        },
      },
    } as any;

    // Mock environment variable
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
  });

  /**
   * @test
   * Verifies that Google Sign-In is initialized with the correct client ID from environment variables.
   */
  test('initializes Google Sign-In with client ID', () => {
    renderHook(() => useGoogleLogin());

    expect(window.google.accounts.id.initialize).toHaveBeenCalledWith({
      client_id: 'test-client-id',
      callback: expect.any(Function),
    });
  });

  /**
   * @test
   * Verifies that an error message is shown if the Google Client ID is missing from the environment variables.
   */
  test('shows error when Google Client ID is missing', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    
    renderHook(() => useGoogleLogin());
    
    expect(mockShowError).toHaveBeenCalledWith('Missing Google Client ID');
  });

  /**
   * @test
   * Verifies that the hook handles a successful Google login:
   * - Calls `loginWithGoogle` with the credential
   * - Sets the user in the context
   * - Shows a success message
   */
  test('handles successful Google login', async () => {
    const mockUser: UserResponse = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };
    vi.mocked(loginWithGoogle).mockResolvedValue(mockUser);
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    renderHook(() => useGoogleLogin());

    // Simulate Google callback
    const callback = vi.mocked(window.google.accounts.id.initialize).mock.calls[0][0].callback;
    await callback({ credential: 'test-credential' });

    expect(loginWithGoogle).toHaveBeenCalledWith('test-credential');
    expect(getCurrentUser).toHaveBeenCalled();
    expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    expect(mockShowSuccess).toHaveBeenCalledWith('Login successful!');
  });

  /**
   * @test
   * Verifies that the hook handles a failed Google login:
   * - Calls `loginWithGoogle` with the credential
   * - Shows an error message and does not set the user in the context
   */
  test('handles failed Google login', async () => {
    vi.mocked(loginWithGoogle).mockRejectedValue(new Error('Login failed'));

    renderHook(() => useGoogleLogin());

    // Simulate Google callback
    const callback = vi.mocked(window.google.accounts.id.initialize).mock.calls[0][0].callback;
    await callback({ credential: 'test-credential' });

    expect(loginWithGoogle).toHaveBeenCalledWith('test-credential');
    expect(mockShowError).toHaveBeenCalledWith('Google login failed. Please try again.');
    expect(mockSetUser).not.toHaveBeenCalled();
  });
}); 