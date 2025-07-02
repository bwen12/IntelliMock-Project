/**
 * @fileoverview
 * Unit tests for the `AuthMenu` component.
 * Verifies UI behavior and interaction logic for authenticated and unauthenticated users.
 * Uses React Testing Library and Vitest.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import AuthMenu from '../AuthMenu'
import { BrowserRouter } from 'react-router-dom'

// -------------------- Mocking dependencies --------------------

/**
 * Mock the custom useNotification hook to prevent real side effects during tests.
 */
vi.mock('../../../hooks/useNotification', () => ({
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}))

/**
 * Utility function to render a component wrapped with a BrowserRouter.
 * Ensures routes are available for components that use links or navigation.
 */
const renderWithRouter = async (component: React.ReactNode) => {
  let result
  await act(async () => {
    result = render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    )
  })
  return result
}

// -------------------- AuthMenu test suite --------------------

describe('AuthMenu', () => {
  const mockSetUser = vi.fn()
  const mockLogout = vi.fn()

  beforeEach(() => {
    mockSetUser.mockReset()
    mockLogout.mockReset()
  })

  /**
   * @test
   * Should show "Sign in" button when no user is logged in.
   */
  test('shows login button when user is not logged in', async () => {
    await renderWithRouter(
      <AuthMenu user={null} setUser={mockSetUser} logout={mockLogout} />
    )
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  /**
   * @test
   * Should display user avatar when a valid user object is provided.
   */
  test('shows user avatar when logged in', async () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER'
    }
    await renderWithRouter(
      <AuthMenu user={mockUser} setUser={mockSetUser} logout={mockLogout} />
    )
    expect(screen.getByAltText('John Doe')).toBeInTheDocument()
  })

  /**
   * @test
   * Should reveal a dropdown with user details and logout button when avatar is clicked.
   */
  test('shows dropdown menu when clicking avatar', async () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER'
    }
    await renderWithRouter(
      <AuthMenu user={mockUser} setUser={mockSetUser} logout={mockLogout} />
    )
    
    // Simulate avatar click to open dropdown
    await act(async () => {
      fireEvent.click(screen.getByAltText('John Doe'))
    })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  /**
   * @test
   * Should trigger the logout callback when the "Logout" button is clicked.
   */
  test('calls logout function when logout button is clicked', async () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER'
    }
    await renderWithRouter(
      <AuthMenu user={mockUser} setUser={mockSetUser} logout={mockLogout} />
    )
    
    await act(async () => {
      fireEvent.click(screen.getByAltText('John Doe'))
    })
    
    await act(async () => {
      fireEvent.click(screen.getByText('Logout'))
    })
    
    expect(mockLogout).toHaveBeenCalled()
  })
}) 