/**
 * @fileoverview
 * Unit tests for the `NavLinks` component.
 * Validates conditional rendering based on authentication state,
 * dynamic class application, and link click handling.
 */

import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NavLinks from '../NavLinks'
import { BrowserRouter } from 'react-router-dom'

/**
 * Helper to wrap components in a router for testing navigation-related behavior.
 */
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('NavLinks', () => {
  /**
   * @test
   * Should render only public links when user is not authenticated.
   */
  test('renders all non-protected routes when user is not logged in', () => {
    renderWithRouter(<NavLinks user={null} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Mock Interview')).not.toBeInTheDocument()
    expect(screen.queryByText('Summary')).not.toBeInTheDocument()
  })

  /**
   * @test
   * Should render all navigation links when user is authenticated.
   */
  test('renders all routes when user is logged in', () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER'
    }
    renderWithRouter(<NavLinks user={mockUser} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Mock Interview')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
  })

  /**
   * @test
   * Should apply the custom className passed via props.
   */
  test('applies custom className when provided', () => {
    renderWithRouter(<NavLinks user={null} className="custom-class" />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('custom-class')
  })

  /**
   * @test
   * Should call the onClick handler when a link is clicked.
   */
  test('calls onClick handler when link is clicked', () => {
    const handleClick = vi.fn()
    renderWithRouter(<NavLinks user={null} onClick={handleClick} />)
    screen.getByText('Home').click()
    expect(handleClick).toHaveBeenCalled()
  })
}) 