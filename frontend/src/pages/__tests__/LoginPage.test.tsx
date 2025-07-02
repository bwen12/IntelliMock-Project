/**
 * @fileoverview
 * This file contains tests for the LoginPage component. It uses Vitest and Testing Library
 * to test the various functionalities and states of the LoginPage component.
 * 
 * The tests verify:
 * - Correct rendering of login elements, such as the Google sign-in button and related texts.
 * - Redirect behavior when the user is already logged in.
 * - The redirection to the dashboard or the original path based on login status.
 * 
 * Mocking is used for hooks such as `useAuthContext`, `useGoogleLogin`, and routing mechanisms like `useNavigate`.
 * 
 * The tests ensure that the LoginPage component behaves correctly based on the user's authentication state.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from '../login'
import { AuthProvider } from '../../contexts/AuthProvider'
import { BrowserRouter } from 'react-router-dom'

// Create a mock function for useAuthContext
const mockUseAuthContext = vi.fn()

// Mock the auth context
vi.mock('../../contexts/AuthProvider', () => ({
  useAuthContext: () => mockUseAuthContext(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Mock useGoogleLogin hook
vi.mock('../../hooks/useGoogleLogin', () => ({
  useGoogleLogin: vi.fn()
}))

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
const mockLocation = { state: { from: { pathname: '/dashboard' } } }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation
  }
})

/**
 * Utility function to render components with necessary providers.
 * Wraps the component in BrowserRouter and AuthProvider for testing.
 *
 * @param component - The component to render.
 * @returns {RenderResult} The result of rendering the component.
 */
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  /**
   * Before each test, reset the mock functions for a clean state.
   */
  beforeEach(() => {
    mockUseAuthContext.mockReset()
    mockNavigate.mockReset()
  })

  /**
   * Test to verify that the login page renders correctly with the Google sign-in button.
   * Ensures that the sign-in button and related information are displayed.
   */
  test('renders login page with Google sign-in button', () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      loading: false
    })
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('Welcome to IntelliMock')).toBeInTheDocument()
    expect(screen.getByText('You will be redirected to sign in via Google.')).toBeInTheDocument()
    expect(screen.getByAltText('IntelliMock Logo')).toBeInTheDocument()
    expect(screen.getByTestId('google-signin-button')).toBeInTheDocument()
  })

  /**
   * Test to check that the page redirects to the dashboard if the user is already logged in.
   * Ensures that the navigate function is called to redirect to the dashboard.
   */
  test('redirects to dashboard when user is already logged in', () => {
    mockUseAuthContext.mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false
    })
    renderWithProviders(<LoginPage />)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  /**
   * Test to verify that the page redirects to the original path when the user logs in.
   * Ensures the navigate function redirects the user to the correct path.
   */
  test('redirects to original path when user logs in', () => {
    mockUseAuthContext.mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false
    })
    renderWithProviders(<LoginPage />)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })
}) 