/**
 * @fileoverview Test suite for the `InterviewResults` component. The tests check the correct 
 * rendering and behavior of the interview results page, including loading states, data display 
 * (strengths, areas for improvement), handling API errors, and the PDF download functionality.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent} from '@testing-library/react'
import InterviewResults from '../interview-results'
import { getReview } from '../../services/reviewService'
import { getSummary, getUserChats } from '../../services/summaryService'

// Mock the services
vi.mock('../../services/reviewService')
vi.mock('../../services/summaryService')

// Mock react-router-dom
const mockLocation = { state: { chatId: 'test-chat-id' } }
vi.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Mock PDFDownloadLink
vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children}: { children: any, fileName: string }) => {
    const renderProp = children({ loading: false });
    return renderProp;
  },
  StyleSheet: {
    create: (styles: any) => styles
  }
}))

describe('InterviewResults', () => {
  /**
   * Test data mock used to simulate a successful review response from the service.
   * Includes information like strengths, weaknesses, and exemplar comments.
   */
  const mockReview = {
    chatId: 'test-chat-id',
    email: 'test@example.com',
    reviews: [
      {
        question: 'Tell me about yourself',
        answer: 'I am a software engineer with 5 years of experience',
        strengths: 'Good communication skills\nStrong technical knowledge',
        weaknesses: 'Could improve time management\nNeed more examples',
        exemplar: 'Great answer, but could provide more specific examples'
      }
    ]
  }


  /**
   * Test data mock used to simulate a successful summary response from the service.
   * Includes interview summary, score, and associated chat ID.
   */
  const mockSummary = {
    summary: 'Test summary',
    questions: [],
    score: 85,
    chatId: 'test-chat-id',
    email: 'test@example.com'
  }

  /**
   * Test data mock used to simulate a user chat object representing a specific interview.
   * Contains details like interview name, job title, company name, and time elapsed.
   */
  const mockUserChat = {
    id: 'test-chat-id',
    name: 'Test Interview',
    createdDate: '2024-03-20',
    jobTitle: 'Software Engineer',
    companyName: 'Test Company',
    timeElapsed: '30 minutes'
  }

  /**
   * Reset mock data and setup necessary mock responses before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks()
      ; (getReview as any).mockResolvedValue(mockReview)
      ; (getSummary as any).mockResolvedValue(mockSummary)
      ; (getUserChats as any).mockResolvedValue({ data: [mockUserChat] })
  })

  /**
   * Test to verify that the loading state is shown initially when data is being fetched.
   * Confirms the presence of the "Loading interview results..." message.
   */
  test('renders loading state initially', () => {
    render(<InterviewResults />)
    expect(screen.getByText('Loading interview results...')).toBeInTheDocument()
  })

  /**
   * Test to ensure the interview results are displayed when the data is successfully loaded.
   * Verifies the presence of interview results and performance-related texts.
   */
  test('renders interview results when data is loaded', async () => {
    render(<InterviewResults />)

    await waitFor(() => {
      expect(screen.getByText('Interview Results')).toBeInTheDocument()
      expect(screen.getByText('Overall Performance')).toBeInTheDocument()
    })

    // Click on Questions & Answers tab
    fireEvent.click(screen.getByText('Questions & Answers'))

    await waitFor(() => {
      expect(screen.getByText('Areas of Strength:')).toBeInTheDocument()
      expect(screen.getByText('Areas for Improvement:')).toBeInTheDocument()
    })
  })

  /**
   * Test to verify that strengths and areas for improvement from the review data are displayed.
   * Ensures both strengths and weaknesses appear in the document.
   */
  test('displays strengths and improvements from review data', async () => {
    render(<InterviewResults />)

    await waitFor(() => {
      expect(screen.getByText('Interview Results')).toBeInTheDocument()
      expect(screen.getByText('Overall Performance')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Questions & Answers'))

    await waitFor(() => {
      // Individual strengths
      expect(screen.getByText('Good communication skills')).toBeInTheDocument()
      expect(screen.getByText('Strong technical knowledge')).toBeInTheDocument()

      // Individual weaknesses
      expect(screen.getByText('Could improve time management')).toBeInTheDocument()
      expect(screen.getByText('Need more examples')).toBeInTheDocument()
    })
  })

  /**
   * Test to handle the case when no review data is found.
   * Verifies the error message "No review found." is shown when no review data is available.
   */
  test('shows error state when no review is found', async () => {
    ; (getReview as any).mockResolvedValue(null)

    render(<InterviewResults />)

    await waitFor(() => {
      expect(screen.getByText('No review found.')).toBeInTheDocument()
    })
  })

  /**
   * Test to handle API errors during the review data fetch.
   * Verifies that the error is logged and the component handles the API failure gracefully.
   */
  test('handles API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
      ; (getReview as any).mockRejectedValue(new Error('API Error'))

    render(<InterviewResults />)

    await waitFor(() => {
      expect(screen.getByText('No review found.')).toBeInTheDocument()
    })

    consoleError.mockRestore()
  })

  /**
   * Test to ensure the PDF download button is shown when the interview summary is available.
   * Verifies that the "Download Full Report" button is displayed and enabled.
   */
  test('renders PDF download button when summary is available', async () => {
    render(<InterviewResults />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading interview results...')).not.toBeInTheDocument()
    })

    // Then check for the download button
    await waitFor(() => {
      const downloadButton = screen.getByText('Download Full Report')
      expect(downloadButton).toBeInTheDocument()
      expect(downloadButton).not.toBeDisabled()
    })
  })

  /**
   * Test to check that the PDF download button is disabled when the summary is not available.
   * Verifies that the download button is visible but disabled if no summary is found.
   */
  test('disables PDF download button when summary is not available', async () => {
    ; (getSummary as any).mockResolvedValue(null)

    render(<InterviewResults />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading interview results...')).not.toBeInTheDocument()
    })

    // Then check for the disabled download button
    await waitFor(() => {
      const downloadButton = screen.getByText('Download Full Report')
      expect(downloadButton).toBeInTheDocument()
      expect(downloadButton).toBeDisabled()
    })
  })

  /**
   * Test to ensure the API is called with the correct chat ID.
   * Verifies that the `getReview`, `getSummary`, and `getUserChats` functions are called with the appropriate `chatId`.
   */
  test('fetches data with correct chat ID', async () => {
    render(<InterviewResults />)

    await waitFor(() => {
      expect(getReview).toHaveBeenCalledWith('test-chat-id')
      expect(getSummary).toHaveBeenCalledWith('test-chat-id')
      expect(getUserChats).toHaveBeenCalled()
    })
  })
}) 