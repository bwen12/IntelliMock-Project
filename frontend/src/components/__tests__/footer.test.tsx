/**
 * @fileoverview
 * Unit tests for the `Footer` component using Vitest and React Testing Library.
 * The component is rendered inside a React Router context using BrowserRouter.
 * Tests validate branding text, dynamic year, links, and CSS class structure for responsive layout.
 */

import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Footer from '../footer'

/**
 * Utility function to render components with React Router context.
 * @param component - React component to render within a BrowserRouter
 */
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

/**
 * Test suite for the Footer component.
 * Covers visual content, links, dynamic values, and responsive styling.
 */
describe('Footer', () => {

  /**
   * @test
   * Checks that the company name and copyright
   * text are rendered properly in the footer.
   */
  test('renders company name and copyright', () => {
    renderWithRouter(<Footer />)
    
    expect(screen.getByText('IntelliMock')).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
  })

  /**
   * @test
   * Verifies the current year is dynamically displayed in the footer.
   */
  test('displays current year in copyright', () => {
    renderWithRouter(<Footer />)
    const currentYear = new Date().getFullYear()
    
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
  })

  /**
   * @test
   * Ensures that the footer contains a working home link.
   */
  test('has working home link', () => {
    renderWithRouter(<Footer />)
    const link = screen.getByRole('link')
    
    expect(link).toHaveAttribute('href', '/')
  })

  /**
   * @test
   * Verifies that the footer and its container have the correct
   * responsive utility classes for layout and spacing.
   */
  test('has correct responsive classes', () => {
    renderWithRouter(<Footer />)
    const footer = screen.getByRole('contentinfo')
    const container = footer.firstChild
    
    expect(footer).toHaveClass('border-t', 'py-6', 'md:py-8')
    expect(container).toHaveClass('container', 'flex', 'flex-col', 'md:flex-row')
  })
}) 