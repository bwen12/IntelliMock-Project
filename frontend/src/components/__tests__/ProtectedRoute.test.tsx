/**
 * @fileoverview
 * Unit tests for route guard components: `ProtectedRoute` and `PublicOnlyRoute`.
 * Uses Vitest and React Testing Library to simulate authentication flow and validate
 * rendering or redirection logic based on the user's auth state.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute, PublicOnlyRoute } from '../ProtectedRoute'
import { useAuthContext } from '../../contexts/AuthProvider'
import { Routes, Route, MemoryRouter } from 'react-router-dom'

// Mock the useAuthContext hook from AuthProvider
vi.mock('../../contexts/AuthProvider', () => ({
  useAuthContext: vi.fn()
}))

// Alias the mocked function for easy configuration
const mockUseAuthContext = useAuthContext as ReturnType<typeof vi.fn>

/**
 * Utility function to render a component with MemoryRouter and nested routes.
 * Simulates routing behavior for testing route guards.
 */
const renderWithRouter = (component: React.ReactNode, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={component}>
          <Route index element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

// -------------------- Tests for <ProtectedRoute /> --------------------

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockUseAuthContext.mockReset()
  })

  /**
   * @test
   * Should display a loading indicator when the auth state is still being resolved.
   */
  test('shows loading state', () => {
    mockUseAuthContext.mockReturnValue({ user: null, loading: true })
    renderWithRouter(<ProtectedRoute />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  /**
   * @test
   * Should redirect unauthenticated users to the login page.
   */
  test('redirects to login when not authenticated', () => {
    mockUseAuthContext.mockReturnValue({ user: null, loading: false })
    renderWithRouter(<ProtectedRoute />)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  /**
   * @test
   * Should render protected content when a user is authenticated.
   */
  test('renders protected content when authenticated', () => {
    mockUseAuthContext.mockReturnValue({ 
      user: { email: 'test@example.com' }, 
      loading: false 
    })
    renderWithRouter(<ProtectedRoute />)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})

// -------------------- Tests for <PublicOnlyRoute /> --------------------

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockUseAuthContext.mockReset()
  })

  /**
   * @test
   * Should show a loading indicator when the auth state is unresolved.
   */
  test('shows loading state', () => {
    mockUseAuthContext.mockReturnValue({ user: null, loading: true })
    renderWithRouter(
      <PublicOnlyRoute>
        <div>Public Content</div>
      </PublicOnlyRoute>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  /**
   * @test
   * Should allow access to public content for unauthenticated users.
   */
  test('renders public content when not authenticated', () => {
    mockUseAuthContext.mockReturnValue({ user: null, loading: false })
    renderWithRouter(
      <PublicOnlyRoute>
        <div>Public Content</div>
      </PublicOnlyRoute>
    )
    expect(screen.getByText('Public Content')).toBeInTheDocument()
  })

  /**
   * @test
   * Should redirect authenticated users from public-only routes (e.g. login)
   * back to the home/protected page.
   */
  test('redirects to home when authenticated', () => {
    mockUseAuthContext.mockReturnValue({ 
      user: { email: 'test@example.com' }, 
      loading: false 
    })
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={
            <PublicOnlyRoute>
              <div>Public Content</div>
            </PublicOnlyRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
}) 