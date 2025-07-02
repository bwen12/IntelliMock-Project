/**
 * @fileoverview Test suite for the SummaryPage component.
 *
 * The `SummaryPage` displays a list of interview sessions, allows users to filter sessions
 * by job title or company, and provides details such as the job title, company name, 
 * time elapsed, and session creation date. It also handles API errors and displays appropriate 
 * messages when no matching sessions are found.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SummaryPage from '../summary'
import { getUserChats } from '../../services/summaryService'

// Mock the services
vi.mock('../../services/summaryService')

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: () => ({ key: 'test-key' })
}))

describe('SummaryPage', () => {
  // Mock data for user chats
  const mockChats = [
    {
      id: '1',
      jobTitle: 'Frontend Developer',
      companyName: 'Google',
      chatName: 'Frontend Interview',
      createdDate: '2024-03-20T10:00:00Z',
      timeElapsed: 30
    },
    {
      id: '2',
      jobTitle: 'Backend Developer',
      companyName: 'Microsoft',
      chatName: 'Backend Interview',
      createdDate: '2024-03-21T14:00:00Z',
      timeElapsed: 45
    }
  ]

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
      ; (getUserChats as any).mockResolvedValue({ data: mockChats })
  })

  /**
   * Test: renders summary page with the title and search bar.
   */
  test('renders summary page with title and search', () => {
    render(<SummaryPage />)
    expect(screen.getByText('Interview Summary')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by chat name, job title, or company')).toBeInTheDocument()
  })

  /**
   * Test: displays chat sessions when data is loaded successfully.
   */
  test('displays chat sessions when data is loaded', async () => {
    render(<SummaryPage />)

    await waitFor(() => {
      // Use getAllByText and check length to verify both job titles are present
      const frontendTitles = screen.getAllByText('Frontend Developer')
      const backendTitles = screen.getAllByText('Backend Developer')
      expect(frontendTitles.length).toBeGreaterThan(0)
      expect(backendTitles.length).toBeGreaterThan(0)
      expect(screen.getByText('Google')).toBeInTheDocument()
      expect(screen.getByText('Microsoft')).toBeInTheDocument()
    })
  })

  /**
   * Test: filters sessions based on search term entered in the search bar.
   */
  test('filters sessions based on search term', async () => {
    render(<SummaryPage />)

    await waitFor(() => {
      const frontendTitles = screen.getAllByText('Frontend Developer')
      expect(frontendTitles.length).toBeGreaterThan(0)
    })

    const searchInput = screen.getByPlaceholderText('Search by chat name, job title, or company')
    fireEvent.change(searchInput, { target: { value: 'Frontend' } })

    const frontendTitles = screen.getAllByText('Frontend Developer')
    expect(frontendTitles.length).toBeGreaterThan(0)
    expect(screen.queryByText('Backend Developer')).not.toBeInTheDocument()
  })

  /**
   * Test: displays a "no results" message when search has no matches.
   */
  test('shows no results message when search has no matches', async () => {
    render(<SummaryPage />)

    await waitFor(() => {
      const frontendTitles = screen.getAllByText('Frontend Developer')
      expect(frontendTitles.length).toBeGreaterThan(0)
    })

    const searchInput = screen.getByPlaceholderText('Search by chat name, job title, or company')
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } })

    expect(screen.getByText('No interview sessions found matching your search.')).toBeInTheDocument()
  })

  /**
   * Test: gracefully handles API errors, ensuring no crash occurs.
   */
  test('handles API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
      ; (getUserChats as any).mockRejectedValue(new Error('API Error'))

    render(<SummaryPage />)

    await waitFor(() => {
      expect(screen.getByText('No interview sessions found matching your search.')).toBeInTheDocument()
    })

    consoleError.mockRestore()
  })

  /**
   * Test: displays formatted creation date and time for each session.
   */
  test('displays formatted date and time', async () => {
    render(<SummaryPage />)

    await waitFor(() => {
      const dateTexts = screen.getAllByText(/Created:/)
      expect(dateTexts.length).toBeGreaterThan(0)
      // Check if the first date is formatted correctly (contains month name and time)
      expect(dateTexts[0].textContent).toMatch(/Created: [A-Za-z]+ \d+, \d{4}, \d{1,2}:\d{2} [AP]M/)
    })
  })

  /**
   * Test: displays time elapsed for each session.
   */
  test('displays time elapsed for each session', async () => {
    render(<SummaryPage />)

    await waitFor(() => {
      expect(screen.getByText('Duration of Interview: 00:30')).toBeInTheDocument()
      expect(screen.getByText('Duration of Interview: 00:45')).toBeInTheDocument()
    })
  })

  /**
   * Test: renders the "View Details" button for each session, with correct href links.
   */
  test('renders view details button for each session', async () => {
    render(<SummaryPage />)

    // First wait for the data to load by checking for job titles
    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument()
      expect(screen.getByText("Backend Developer")).toBeInTheDocument()
    })

    // Find all links and check their hrefs
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)

    // Check that each link has the correct href
    expect(links[0]).toHaveAttribute('href', '/summary/2')
    expect(links[1]).toHaveAttribute('href', '/summary/1')
  })
}) 