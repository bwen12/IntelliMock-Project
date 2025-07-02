/**
 * @fileoverview
 * Unit tests for the `AuthProvider` component and its usage with `useAuthContext`.
 * Tests cover loading state, user data handling, state updating, and proper usage within the `AuthProvider`.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '../AuthProvider'
import { useAuth } from '../../hooks/useAuth'

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock the globalUserStore
vi.mock('../../stores/globalUserStore', () => ({
  registerUserSetter: vi.fn(),
}))

/**
 * A test component to test usage of the `AuthContext`.
 * Displays user information or loading state, and includes a logout button.
 */
const TestComponent = () => {
  const { user, setUser, loading } = useAuthContext()
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div data-testid="user">{user ? JSON.stringify(user) : 'no user'}</div>
          <button onClick={() => setUser(null)}>Logout</button>
        </>
      )}
    </div>
  )
}

describe('AuthProvider', () => {
  const mockSetUser = vi.fn()
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'USER'
  }

  // Clear all mocks before each test case
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * @test
   * Verifies that the loading state is displayed when `loading` is true.
   */
  test('shows loading state when loading is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: true
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  /**
   * @test
   * Verifies that user data is provided to children when `loading` is false and a user is logged in.
   */
  test('provides user data to children when not loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser))
  })

  /**
   * @test
   * Verifies that `no user` text is displayed when no user is logged in.
   */
  test('provides null user data when no user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: false
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('no user')
  })

  /**
   * @test
   * Verifies that the `setUser` function is called when the logout button is clicked.
   */
  test('allows children to update user state', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Logout').click()
    })

    expect(mockSetUser).toHaveBeenCalledWith(null)
  })

  /**
   * @test
   * Verifies that an error is thrown if `useAuthContext` is used outside of `AuthProvider`.
   */
  test('throws error when useAuthContext is used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuthContext must be used within an AuthProvider')

    consoleError.mockRestore()
  })
}) 