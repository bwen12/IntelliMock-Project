/**
 * @fileoverview
 * Unit tests for the `useInterviewSession` custom hook that handles chat message loading, answer submission,
 * and elapsed time tracking for interview sessions. Tests cover loading chat messages, error handling, and 
 * the behavior of sending messages.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useInterviewSession } from '../useInterviewSession'
import { getChatMessages, sendMessage } from '../../../services/interviewService'
import { useNotification } from '../../../hooks/useNotification'
import type { ChatMessage } from '../../../types/interview'

// Mock dependencies
vi.mock('../../../services/interviewService', () => ({
  getChatMessages: vi.fn(),
  sendMessage: vi.fn()
}))

vi.mock('../../../hooks/useNotification', () => ({
  useNotification: vi.fn()
}))

describe('useInterviewSession', () => {
  const mockChatId = '123'
  const mockEmail = 'test@example.com'
  const mockShowError = vi.fn()
  const mockMessages: ChatMessage[] = [
    { chatId: mockChatId, email: mockEmail, message: 'Hello', role: 'interviewer' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.mocked(useNotification).mockReturnValue({
      showError: mockShowError,
      showSuccess: vi.fn(),
      showInfo: vi.fn(),
      showWarning: vi.fn()
    })
    vi.mocked(getChatMessages).mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /**
   * @test
   * Verifies that the hook initializes with correct default values.
   */
  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useInterviewSession(mockChatId, mockEmail))

    expect(result.current.messages).toEqual([])
    expect(result.current.currentAnswer).toBe('')
    expect(result.current.loading).toBe(false)
    expect(result.current.elapsedTime).toBe(0)
  })

  /**
   * @test
   * Verifies that chat messages are loaded correctly when the component mounts.
   */
  test('loads chat messages on mount', async () => {
    vi.mocked(getChatMessages).mockResolvedValue(mockMessages)

    const { result } = renderHook(() => useInterviewSession(mockChatId, mockEmail))

    await waitFor(() => {
      expect(getChatMessages).toHaveBeenCalledWith(mockChatId)
      expect(result.current.messages).toEqual(mockMessages)
    }, { timeout: 1000 })
  })

  /**
   * @test
   * Verifies that an error is shown if chat messages fail to load.
   */
  test('handles chat message loading error', async () => {
    const errorMessage = 'Failed to load messages'
    vi.mocked(getChatMessages).mockRejectedValue({
      response: {
        data: { message: errorMessage }
      }
    })

    renderHook(() => useInterviewSession(mockChatId, mockEmail))

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(errorMessage)
    }, { timeout: 1000 })
  })

  /**
   * @test
   * Verifies that the elapsed time is updated every second.
   */
  test('updates elapsed time every second', async () => {
    const { result } = renderHook(() => useInterviewSession(mockChatId, mockEmail))

    // Wait for initial render
    await waitFor(() => {
      expect(result.current).toBeDefined()
    }, { timeout: 1000 })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.elapsedTime).toBe(2)
  })

  /**
   * @test
   * Verifies that an answer is successfully submitted, including AI reply and message updates.
   */
  test('submits answer successfully', async () => {
    const mockAiReply = 'Thank you for your answer'
    const mockMessages: ChatMessage[] = [
      { chatId: mockChatId, email: mockEmail, message: 'My answer', role: 'user' as const },
      { chatId: mockChatId, email: mockEmail, message: mockAiReply, role: 'interviewer' as const }
    ]
    vi.mocked(sendMessage).mockResolvedValue({ message: mockAiReply, isEnd: false })
    vi.mocked(getChatMessages).mockResolvedValue(mockMessages)

    const { result } = renderHook(() => useInterviewSession(mockChatId, mockEmail))

    // Wait for initial messages to load
    await waitFor(() => {
      expect(getChatMessages).toHaveBeenCalled()
    }, { timeout: 1000 })

    // Set the answer
    act(() => {
      result.current.setCurrentAnswer('My answer')
    })

    // Submit the answer
    await act(async () => {
      await result.current.submitAnswer()
    })

    // Wait for all state updates to complete
    await waitFor(() => {
      expect(result.current.currentAnswer).toBe('')
      expect(result.current.messages).toEqual(mockMessages)
      expect(result.current.loading).toBe(false)
    })
  })

  /**
   * @test
   * Verifies that an empty answer is not submitted.
   */
  test('does not submit empty answer', async () => {
    const { result } = renderHook(() => useInterviewSession(mockChatId, mockEmail))

    // Wait for initial messages to load
    await waitFor(() => {
      expect(getChatMessages).toHaveBeenCalled()
    }, { timeout: 1000 })

    await act(async () => {
      result.current.setCurrentAnswer('')
      await result.current.submitAnswer()
    })

    expect(sendMessage).not.toHaveBeenCalled()
    expect(result.current.messages).toHaveLength(0)
  })

  /**
   * @test
   * Verifies that an error is shown when message submission fails.
   */
  test('handles answer submission error', async () => {
    const errorMessage = 'Failed to send message'
    vi.mocked(sendMessage).mockRejectedValue({
      response: {
        data: { message: errorMessage }
      }
    })

    const { result } = renderHook(() => useInterviewSession(mockChatId, mockEmail))

    // Wait for initial messages to load
    await waitFor(() => {
      expect(getChatMessages).toHaveBeenCalled()
    }, { timeout: 1000 })

    // Set the answer
    act(() => {
      result.current.setCurrentAnswer('My answer')
    })

    // Submit the answer
    await act(async () => {
      await result.current.submitAnswer()
    })

    // Wait for error to be shown and loading state to be updated
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })
})
