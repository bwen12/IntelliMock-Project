/**
 * @fileoverview Unit tests for the SessionDetailPage component.
 * 
 * This test suite contains various test cases for the SessionDetailPage component, 
 * which is responsible for rendering session details, handling session deletion, 
 * and managing user interactions. The tests ensure that the component behaves correctly 
 * under different conditions, such as rendering session data, handling confirmation dialogs, 
 * and dealing with API errors.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SessionDetailPage from '../session-detail'
import { getReview } from '../../services/reviewService'
import { getSummary, getUserChats } from '../../services/summaryService'
import { useInterviewHistory } from '../../hooks/interview/useInterviewHistory'
import { PDFDownloadLink } from '@react-pdf/renderer'

// Mock the services and context
vi.mock('../../services/reviewService')
vi.mock('../../services/summaryService')
vi.mock('../../contexts/AuthProvider')

// Mock the services and hooks
vi.mock('../../hooks/interview/useInterviewHistory')

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockUseParams = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Mock PDFDownloadLink
vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: vi.fn().mockImplementation(({ children }: { children: (props: { loading: boolean }) => React.ReactNode }) => {
    return children({ loading: false })
  }),
  StyleSheet: {
    create: (styles: any) => styles
  }
}))

describe('SessionDetailPage', () => {
  /**
   * Mock data used for testing
   * 
   * @constant {Object} mockSummary - Simulated summary data for a session.
   * @constant {Object} mockReview - Simulated review data for a session.
   * @constant {Object} mockUserChat - Simulated user chat data.
   */
  const mockSummary = {
    summary: 'Test summary',
    score: 0.85,
    questions: []
  }

  const mockReview = {
    reviews: [
      {
        question: 'Tell me about yourself',
        answer: 'I am a software developer',
        exemplar: 'Good answer',
        strengths: 'Good communication, Technical expertise',
        weaknesses: 'Could improve time management, Need more examples',
        rating: '0.8'
      }
    ]
  }

  const mockUserChat = {
    id: 'test-session-id',
    chatName: 'Frontend Developer Interview',
    jobTitle: 'Frontend Developer',
    companyName: 'Google',
    createdDate: '2024-03-20T10:00:00Z',
    timeElapsed: 30
  }

  /**
   * Setup before each test case to mock data and clear previous mocks.
   */
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({ sessionId: 'test-session-id' })
      ; (getSummary as any).mockResolvedValue(mockSummary)
      ; (getReview as any).mockResolvedValue(mockReview)
      ; (getUserChats as any).mockResolvedValue({ data: [mockUserChat] })
      ; (useInterviewHistory as any).mockReturnValue({
        deleteSession: vi.fn()
      })
  })

  /**
   * Test case to verify the rendering of the session detail page.
   */
  test('renders session detail page with title', async () => {
    render(<SessionDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer Interview')).toBeInTheDocument()
      expect(screen.getByText('Google')).toBeInTheDocument()
    })
  })

  /**
   * Test case to ensure strengths and improvements from review data are displayed correctly.
   */
  test('displays strengths and improvements from review data', async () => {
    render(<SessionDetailPage />)

    // First switch to the Questions & Answers tab
    await waitFor(() => {
      const questionsTab = screen.getByRole('tab', { name: /questions & answers/i })
      fireEvent.click(questionsTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Good communication, Technical expertise')).toBeInTheDocument()
      expect(screen.getByText('Could improve time management, Need more examples')).toBeInTheDocument()
    })
  })

  /**
   * Test case to ensure session deletion works after confirmation.
   */
  test('handles delete session confirmation', async () => {
    const mockDeleteSession = vi.fn().mockResolvedValue(undefined)
      ; (useInterviewHistory as any).mockReturnValue({
        deleteSession: mockDeleteSession
      })

    render(<SessionDetailPage />)

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete session/i })
      fireEvent.click(deleteButton)
    })

    const confirmButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteSession).toHaveBeenCalledWith('test-session-id')
      expect(mockNavigate).toHaveBeenCalledWith('/summary', { replace: true })
    })
  })

  /**
   * Test case to ensure session deletion is canceled when user declines the confirmation.
   */
  test('handles delete session cancellation', async () => {
    const mockDeleteSession = vi.fn()
      ; (useInterviewHistory as any).mockReturnValue({
        deleteSession: mockDeleteSession
      })

    render(<SessionDetailPage />)

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete session/i })
      fireEvent.click(deleteButton)
    })

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockDeleteSession).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  /**
   * Test case to ensure that API errors are handled gracefully.
   */
  test('handles API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
      ; (getSummary as any).mockRejectedValue(new Error('API Error'))

    render(<SessionDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer Interview')).toBeInTheDocument()
    })

    consoleError.mockRestore()
  })

  /**
   * Test case to verify correct formatting of the session date and time.
   */
  test('displays formatted date and time', async () => {
    render(<SessionDetailPage />)

    await waitFor(() => {
      expect(screen.getByText(/Mar 20, 2024, 11:00 PM/)).toBeInTheDocument()
    })
  })

  /**
   * Test case to ensure the PDF download button is rendered when summary data is available.
   */
  test('renders PDF download button when summary is available', async () => {
    render(<SessionDetailPage />)

    await waitFor(() => {
      const downloadButton = screen.getByRole('button', { name: /Download Full Report/i })
      expect(downloadButton).toBeInTheDocument()
      expect(downloadButton).not.toBeDisabled()
    })
  })

  /**
   * Test case to simulate and check loading state when PDF is being prepared.
   */
  test('shows loading state when PDF is being prepared', async () => {
    const mockPDFDownloadLink = PDFDownloadLink as unknown as ReturnType<typeof vi.fn>
    mockPDFDownloadLink.mockImplementationOnce(({ children }: { children: (props: { loading: boolean }) => React.ReactNode }) => {
      return children({ loading: true })
    })

    render(<SessionDetailPage />)

    await waitFor(() => {
      const loadingButton = screen.getByRole('button', { name: /Preparing/i })
      expect(loadingButton).toBeInTheDocument()
      expect(loadingButton).toBeDisabled()
    })
  })

  /**
   * Test case to verify that the PDF download button is disabled when summary is unavailable.
   */
  test('disables PDF download button when summary is not available', async () => {
    ; (getSummary as any).mockResolvedValue(null)

    render(<SessionDetailPage />)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Download Full Report/i })).not.toBeInTheDocument()
    })
  })

  /**
   * Test case to ensure data fetching happens with the correct session ID.
   */
  test('fetches data with correct session ID', async () => {
    render(<SessionDetailPage />)

    await waitFor(() => {
      expect(getSummary).toHaveBeenCalledWith('test-session-id')
      expect(getReview).toHaveBeenCalledWith('test-session-id')
      expect(getUserChats).toHaveBeenCalled()
    })
  })
}) 