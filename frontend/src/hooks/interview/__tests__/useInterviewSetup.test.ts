/**
 * @fileoverview Test suite for the `useInterviewSetup` hook, testing its functionality 
 * including form validation, successful submission, error handling, and reset behavior.
 * Utilizes `vitest` and `@testing-library/react` for testing.
 * 
 * Each test case validates a specific behavior of the hook.
 * 
 * Dependencies:
 * - `createChatSession`: Mocked service function that handles creating a new chat session.
 * - `useNotification`: Mocked custom hook that handles notifications for success or errors.
 * - `react-router-dom`: Mocked `useNavigate` function for navigation after submission.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInterviewSetup } from '../useInterviewSetup'
import { createChatSession, type ChatSessionResponse } from '../../../services/interviewService'
import { useNotification } from '../../../hooks/useNotification'

// Mock dependencies
vi.mock('../../../services/interviewService', () => ({
  createChatSession: vi.fn()
}))

vi.mock('../../../hooks/useNotification', () => ({
  useNotification: vi.fn()
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

/**
 * Test suite for the `useInterviewSetup` hook, focusing on form submission and validation.
 */
describe('useInterviewSetup', () => {
  const mockShowError = vi.fn()
  const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNotification).mockReturnValue({
      showError: mockShowError,
      showSuccess: vi.fn(),
      showInfo: vi.fn(),
      showWarning: vi.fn()
    })
  })

  /**
   * Test for validating required fields in the interview setup form.
   */
  test('validates required fields', async () => {
    const { result } = renderHook(() => useInterviewSetup())

    const response = await act(async () => {
      return result.current.submitInterview({
        chatName: '',
        jobTitle: '',
        companyName: '',
        jobDescription: '',
        resume: null,
        context: ''
      })
    })

    expect(response.success).toBe(false)
    expect(response.errors).toEqual({
      chatName: 'Chat name is required',
      jobTitle: 'Job title is required',
      companyName: 'Company name is required',
      jobDescription: 'Job description is required',
      resume: 'Please upload a resume / CV'
    })
  })

  /**
   * Test for successfully submitting the interview setup form with valid data.
   */
  test('submits form successfully with valid data', async () => {
    const mockResponse: ChatSessionResponse = {
      id: '123',
      email: 'test@example.com',
      chatName: 'Test Interview',
      companyName: 'Test Company',
      jobTitle: 'Software Engineer',
      jobDescription: 'Test Description',
      context: 'Test Context',
      cv: 'test.pdf'
    }
    vi.mocked(createChatSession).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useInterviewSetup())

    const response = await act(async () => {
      return result.current.submitInterview({
        chatName: 'Test Interview',
        jobTitle: 'Software Engineer',
        companyName: 'Test Company',
        jobDescription: 'Test Description',
        resume: mockFile,
        context: 'Test Context'
      })
    })

    expect(response.success).toBe(true)
    expect(createChatSession).toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
  })

  /**
   * Test for handling the error when submitting a duplicate chat name.
   */
  test('handles duplicate chat name error', async () => {
    const errorMessage = 'A chat with this name already exists'
    vi.mocked(createChatSession).mockRejectedValue({
      response: {
        status: 400,
        data: { message: errorMessage }
      }
    })

    const { result } = renderHook(() => useInterviewSetup())

    const response = await act(async () => {
      return result.current.submitInterview({
        chatName: 'Test Interview',
        jobTitle: 'Software Engineer',
        companyName: 'Test Company',
        jobDescription: 'Test Description',
        resume: mockFile,
        context: 'Test Context'
      })
    })

    expect(response.success).toBe(false)
    expect(response.errors).toEqual({ chatName: errorMessage })
    expect(mockShowError).toHaveBeenCalledWith(errorMessage)
  })

  /**
   * Test for handling general API errors during form submission.
   */
  test('handles general API errors', async () => {
    const errorMessage = 'Server error'
    vi.mocked(createChatSession).mockRejectedValue({
      response: {
        data: errorMessage
      }
    })

    const { result } = renderHook(() => useInterviewSetup())

    const response = await act(async () => {
      return result.current.submitInterview({
        chatName: 'Test Interview',
        jobTitle: 'Software Engineer',
        companyName: 'Test Company',
        jobDescription: 'Test Description',
        resume: mockFile,
        context: 'Test Context'
      })
    })

    expect(response.success).toBe(false)
    expect(response.errors).toEqual({ global: errorMessage })
    expect(mockShowError).toHaveBeenCalledWith(errorMessage)
  })

  /**
   * Test for resetting errors in the interview setup form.
   */
  test('resets errors when resetErrors is called', () => {
    const { result } = renderHook(() => useInterviewSetup())

    act(() => {
      result.current.resetErrors()
    })

    expect(result.current.errors).toEqual({})
  })
}) 