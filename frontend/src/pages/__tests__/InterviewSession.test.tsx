import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InterviewSession from '../interview-session'
import { useInterviewSession } from '../../hooks/interview/useInterviewSession'
import { useSpeechToText } from '../../hooks/interview/useSpeechToText'
import { useTTS } from '../../hooks/interview/useTTS'
import { useVideoRecording } from '../../hooks/interview/useVideoRecording'
import { useAuthContext } from '../../contexts/AuthProvider'
import { createReview } from '../../services/reviewService'
import { createSummary } from '../../services/summaryService'

/**
 * @fileoverview
 * Test suite for the InterviewSession component.
 * This suite includes tests for rendering, functionality, and user interactions.
 *  
 */
// Mock all the hooks and services
vi.mock('../../hooks/interview/useInterviewSession')
vi.mock('../../hooks/interview/useSpeechToText')
vi.mock('../../hooks/interview/useTTS')
vi.mock('../../hooks/interview/useVideoRecording')
vi.mock('../../contexts/AuthProvider')
vi.mock('../../services/reviewService')
vi.mock('../../services/summaryService')

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockUseParams = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams()
}))

describe('InterviewSession', () => {
  const mockUser = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    profilePicture: 'test.jpg'
  }

  /**
   * Setup for each test.
   * - Clears all mocks before each test.
   * - Mocks necessary hooks and services used in the InterviewSession component.
   */
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn()
    
    // Mock useParams
    mockUseParams.mockReturnValue({ chatId: 'test-chat-id' })
    
    // Mock useAuthContext
    ;(useAuthContext as any).mockReturnValue({ user: mockUser })
    
    // Mock useInterviewSession
    ;(useInterviewSession as any).mockReturnValue({
      messages: [],
      currentAnswer: '',
      setCurrentAnswer: vi.fn(),
      submitAnswer: vi.fn(),
      elapsedTime: 0,
      loading: false
    })
    
    // Mock useSpeechToText
    ;(useSpeechToText as any).mockReturnValue({
      transcript: '',
      resetTranscript: vi.fn(),
      browserSupportsSpeechRecognition: true,
      startListening: vi.fn(),
      stopListening: vi.fn()
    })
    
    // Mock useTTS
    ;(useTTS as any).mockReturnValue({
      avatarUrl: 'test-avatar.jpg',
      speak: vi.fn(),
      isSpeaking: false,
      voice: 'test-voice',
      cancel: vi.fn()
    })
    
    // Mock useVideoRecording
    ;(useVideoRecording as any).mockReturnValue({
      videoRef: { current: null },
      isRecording: true,
      startCamera: vi.fn(),
      stopCamera: vi.fn()
    })
  })

  /**
   * Test to verify the correct rendering of the interview session's initial state.
   * Ensures that the question, timer, and end interview button are displayed.
   */
  test('renders interview session with initial state', () => {
    render(<InterviewSession />)
    expect(screen.getByText('00:00')).toBeInTheDocument()
    expect(screen.getByText('End Interview')).toBeInTheDocument()
  })

  /**
   * Test to check the functionality of toggling Text-to-Speech (TTS) 
   * when the volume button is clicked.
   */
  test('toggles TTS when volume button is clicked', () => {
    render(<InterviewSession />)
    const volumeButton = screen.getByTitle('Mute TTS')
    fireEvent.click(volumeButton)
    expect(screen.getByTitle('Unmute TTS')).toBeInTheDocument()
  })

  /**
   * Test for handling the end interview confirmation.
   * Ensures that both review and summary are created, 
   * and navigation to the interview results page occurs.
   */
  test('handles end interview confirmation', async () => {
    ;(createReview as any).mockResolvedValue({})
    ;(createSummary as any).mockResolvedValue({})
    
    render(<InterviewSession />)
    fireEvent.click(screen.getByText('End Interview'))
    
    // Find and click the confirm button in the dialog
    const confirmButton = screen.getByRole('button', { name: /end interview/i })
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(createReview).toHaveBeenCalledWith('test-chat-id')
      expect(createSummary).toHaveBeenCalledWith('test-chat-id')
      expect(mockNavigate).toHaveBeenCalledWith('/interview-results', {
        state: { chatId: 'test-chat-id' },
        replace: true
      })
    })
  })

  /**
   * Test for handling the end interview cancellation.
   * Ensures that no actions are taken when the user cancels the interview end.
   */
  test('handles end interview cancellation', async () => {
    render(<InterviewSession />)
    fireEvent.click(screen.getByText('End Interview'))
    
    // Find and click the cancel button in the dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(createReview).not.toHaveBeenCalled()
    expect(createSummary).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  /**
   * Test to verify toggling of audio recording when the mic button is clicked.
   * Ensures that the start and stop listening functions are called as expected.
   */
  test('toggles audio recording when mic button is clicked', () => {
    const mockStartListening = vi.fn()
    const mockStopListening = vi.fn()
    ;(useSpeechToText as any).mockReturnValue({
      transcript: '',
      resetTranscript: vi.fn(),
      browserSupportsSpeechRecognition: true,
      startListening: mockStartListening,
      stopListening: mockStopListening
    })
    
    render(<InterviewSession />)
    const micButton = screen.getByTestId('mic-button')
    
    // Start recording
    fireEvent.click(micButton)
    expect(mockStartListening).toHaveBeenCalled()
    
    // Stop recording
    fireEvent.click(micButton)
    expect(mockStopListening).toHaveBeenCalled()
  })

  /**
   * Test to ensure that an error is shown when the browser does not support speech recognition.
   * An alert should be triggered in this case.
   */
  test('shows error when browser does not support speech recognition', () => {
    window.alert = vi.fn()
    ;(useSpeechToText as any).mockReturnValue({
      transcript: '',
      resetTranscript: vi.fn(),
      browserSupportsSpeechRecognition: false,
      startListening: vi.fn(),
      stopListening: vi.fn()
    })
    
    render(<InterviewSession />)
    const micButton = screen.getByTestId('mic-button')
    fireEvent.click(micButton)
    
    expect(window.alert).toHaveBeenCalledWith('Your browser does not support mic voice recognition.')
  })

  /**
   * Test to verify that the loading state is shown when ending an interview.
   * This ensures that the UI reflects the loading process while review and summary are being generated.
   */
  test('shows loading state when ending interview', async () => {
    render(<InterviewSession />)
    ;(createReview as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    // Click the initial End Interview button
    fireEvent.click(screen.getByText('End Interview'))
    
    // Click the confirm button in the dialog
    const confirmButton = screen.getByRole('button', { name: /end interview/i })
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Generating your interview review and summary/)).toBeInTheDocument()
    })
  })
}) 