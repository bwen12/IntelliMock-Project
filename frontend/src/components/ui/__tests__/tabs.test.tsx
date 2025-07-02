/**
 * @fileoverview
 * Unit tests for the custom `Tabs` component.
 * Tests cover default and controlled behavior, accessibility roles, interaction,
 * event callbacks, and custom className styling.
 */

import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'

/**
 * Utility function to render a component wrapped in `act()`.
 * Ensures all effects and updates are applied before assertions.
 */
const renderWithAct = async (component: React.ReactNode) => {
  let result
  await act(async () => {
    result = render(component)
  })
  return result
}

describe('Tabs', () => {
  /**
   * @test
   * Should display the tab with defaultValue as selected
   * and only show its corresponding content.
   */
  test('renders with default value', async () => {
    await renderWithAct(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  /**
   * @test
   * Should update selected tab and visible content when user clicks on a different tab.
   */
  test('switches tabs when clicked', async () => {
    await renderWithAct(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))
    })

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  /**
   * @test
   * Should invoke the `onValueChange` callback with the new tab's value when clicked.
   */
  test('calls onValueChange when tab is clicked', async () => {
    const handleValueChange = vi.fn()
    await renderWithAct(
      <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))
    })
    expect(handleValueChange).toHaveBeenCalledWith('tab2')
  })

  /**
   * @test
   * Should respect controlled `value` prop and only show content for that value.
   */
  test('uses controlled value when provided', async () => {
    await renderWithAct(
      <Tabs value="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  /**
   * @test
   * Should apply any custom `className` props passed to Tabs, TabsList, TabsTrigger, and TabsContent.
   */
  test('applies custom className to components', async () => {
    await renderWithAct(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">Content 1</TabsContent>
      </Tabs>
    )

    const tablist = screen.getByRole('tablist')
    const tab = screen.getByRole('tab')
    const tabpanel = screen.getByRole('tabpanel')

    expect(tablist).toHaveClass('custom-list')
    expect(tab).toHaveClass('custom-trigger')
    expect(tabpanel).toHaveClass('custom-content')
  })
}) 