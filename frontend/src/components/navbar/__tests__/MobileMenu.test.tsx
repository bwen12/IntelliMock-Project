/**
 * @fileoverview
 * Unit tests for the `MobileMenu` component.
 * Validates conditional rendering, login/logout flow, and event handlers.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileMenu from '../MobileMenu'
import { BrowserRouter } from 'react-router-dom'

/**
 * Helper function to render a component with routing context.
 * Ensures React Router links work as expected during tests.
 */
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('MobileMenu', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockReset()
  })

  /**
   * @test
   * Should not render the menu when `isOpen` is false.
   */
  test('does not render when isOpen is false', () => {
    renderWithRouter(
      <MobileMenu
        isOpen={false}
        user={null}
        onClose={mockOnClose}
      />
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  /**
   * @test
   * Should render the menu when `isOpen` is true.
   */
  test('renders when isOpen is true', () => {
    renderWithRouter(
      <MobileMenu
        isOpen={true}
        user={null}
        onClose={mockOnClose}
      />
    )
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  /**
   * @test
   * Should show a login link if no user is logged in.
   */
  test('shows login link when user is not logged in', () => {
    renderWithRouter(
      <MobileMenu
        isOpen={true}
        user={null}
        onClose={mockOnClose}
      />
    )
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  /**
   * @test
   * Should call `onClose` when the login link is clicked.
   */
  test('calls onClose when login link is clicked', () => {
    renderWithRouter(
      <MobileMenu
        isOpen={true}
        user={null}
        onClose={mockOnClose}
      />
    )
    fireEvent.click(screen.getByText('Login'))
    expect(mockOnClose).toHaveBeenCalled()
  })

}) 