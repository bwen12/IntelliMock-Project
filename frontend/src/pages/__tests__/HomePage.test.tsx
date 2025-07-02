/**
 * @fileoverview Test suite for the `HomePage` component. The tests check the
 * correct rendering and behavior of the home page, including login state, feature 
 * section visibility, and main heading rendering. Uses `vitest` and `@testing-library/react`.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import HomePage from '../home'
import { AuthProvider } from '../../contexts/AuthProvider'
import { BrowserRouter } from 'react-router-dom'

// Create a mock function for useAuthContext
const mockUseAuthContext = vi.fn()

// Mock the auth context
vi.mock('../../contexts/AuthProvider', () => ({
  useAuthContext: () => mockUseAuthContext(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

/**
 * Custom render function to render the component with required providers.
 * This function wraps the component with the `BrowserRouter` and `AuthProvider`.
 * @param {React.ReactNode} component - The component to render with the required context providers.
 * @returns {Promise<RenderResult>} - The result of rendering the component.
 */
const renderWithProviders = async (component: React.ReactNode) => {
  let result
  await act(async () => {
    result = render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    )
  })
  return result
}

describe('HomePage', () => {
  /**
   * Reset the mock before each test to ensure clean test state.
   */
  beforeEach(() => {
    // Reset the mock before each test
    mockUseAuthContext.mockReset()
  })

  /**
   * Test to verify that the main heading is rendered correctly.
   * Verifies that the heading "Ready to Ace Your Next Interview?" is present in the document.
   */
  test('renders the main heading', async () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      loading: false
    })
    await renderWithProviders(<HomePage />)
    expect(screen.getByText('Ready to Ace Your Next Interview?')).toBeInTheDocument()
  })

  /**
   * Test to check if the login button is displayed when the user is not logged in.
   * Verifies that "Log In" is shown when `user` is `null`.
   */
  test('shows login button when user is not logged in', async () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      loading: false
    })
    await renderWithProviders(<HomePage />)
    expect(screen.getByText('Log In')).toBeInTheDocument()
  })

  /**
   * Test to ensure the login button is hidden when the user is logged in.
   * Verifies that "Log In" is not shown when a `user` object is provided with valid user data.
   */
  test('hides login button when user is logged in', async () => {
    mockUseAuthContext.mockReturnValue({
      user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'USER' },
      setUser: vi.fn(),
      loading: false
    })
    await renderWithProviders(<HomePage />)
    expect(screen.queryByText('Log In')).not.toBeInTheDocument()
  })

  /**
   * Test to ensure all feature sections are displayed correctly.
   * Verifies that multiple feature sections like "Why Choose IntelliMock?", 
   * "AI-Powered Questions", "Realistic Simulations", and "Instant Feedback" are shown.
   */
  test('shows all feature sections', async () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      loading: false
    })
    await renderWithProviders(<HomePage />)
    expect(screen.getByText('Why Choose IntelliMock?')).toBeInTheDocument()
    expect(screen.getByText('AI-Powered Questions')).toBeInTheDocument()
    expect(screen.getByText('Realistic Simulations')).toBeInTheDocument()
    expect(screen.getByText('Instant Feedback')).toBeInTheDocument()
  })
}) 