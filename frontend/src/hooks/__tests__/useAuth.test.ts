/**
 * @fileoverview
 * Unit tests for the `useAuth` custom hook.
 * Tests verify the behavior of the hook when interacting with authentication services, handling loading state, user data, and manual state updates.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import * as authService from '../../services/authService'
import type { UserResponse } from '../../types/UserResponse'

// Mock dependencies
vi.mock('../../services/authService', () => ({
  getCurrentUser: vi.fn(),
  refreshToken: vi.fn()
}))

describe('useAuth', () => {
  const mockUser: UserResponse = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'user',
    profilePicture: 'https://example.com/picture.jpg'
  }

  // Clear all mocks before each test case
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * @test
   * Verifies that the hook initializes with a loading state and no user.
   */
  test('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
  })

  /**
   * @test
   * Verifies that the user is set correctly when `getCurrentUser` succeeds.
   * Ensures `getCurrentUser` is called and `refreshToken` is not.
   */
  test('sets user when getCurrentUser succeeds', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual(mockUser)
    expect(authService.getCurrentUser).toHaveBeenCalled()
    expect(authService.refreshToken).not.toHaveBeenCalled()
  })

  /**
   * @test
   * Verifies that the hook attempts a token refresh when `getCurrentUser` fails.
   * Ensures the `refreshToken` function is called and the user state is handled accordingly.
   */
  test('attempts token refresh when getCurrentUser fails', async () => {
    const callOrder: string[] = []

    vi.mocked(authService.getCurrentUser).mockImplementation(async () => {
      callOrder.push('getCurrentUser')
      throw new Error('Unauthorized')
    })
    vi.mocked(authService.refreshToken).mockImplementation(async () => {
      callOrder.push('refreshToken')
      return { message: 'Token refreshed' }
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toBe(null)
    // Expect the actual call sequence that includes all getCurrentUser calls
    expect(callOrder).toEqual([
      'getCurrentUser',
      'refreshToken',
      'getCurrentUser',
      'getCurrentUser'
    ])
  })

  /**
   * @test
   * Verifies that the user state is set to `null` when both `getCurrentUser` and `refreshToken` fail.
   * Ensures that all failure scenarios are handled properly.
   */
  test('sets user to null when both getCurrentUser and refreshToken fail', async () => {
    vi.mocked(authService.getCurrentUser)
      .mockRejectedValueOnce(new Error('Unauthorized'))
      .mockRejectedValueOnce(new Error('Unauthorized'))
    vi.mocked(authService.refreshToken).mockRejectedValue(new Error('Refresh failed'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toBe(null)
    expect(authService.getCurrentUser).toHaveBeenCalled()
    expect(authService.refreshToken).toHaveBeenCalled()
  })

  /**
   * @test
   * Verifies that the user state can be updated manually using `setUser`.
   * Ensures that `setUser` updates the user state properly when called.
   */
  test('allows manual user state updates', async () => {
    const { result } = renderHook(() => useAuth())

    // Wait for initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Then update the user state
    await act(async () => {
      result.current.setUser(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)
  })
}) 