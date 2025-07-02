/**
 * @fileoverview
 * Unit tests for the `useInterviewHistory` custom hook that handles interview session deletion.
 * Tests ensure correct handling of API responses (success and error scenarios) and appropriate notifications.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInterviewHistory } from '../useInterviewHistory'
import { deleteInterview } from '../../../services/reviewService'
import { useNotification } from '../../../hooks/useNotification'

// Mock dependencies
vi.mock('../../../services/reviewService', () => ({
  deleteInterview: vi.fn()
}))

vi.mock('../../../hooks/useNotification', () => ({
  useNotification: vi.fn()
}))

describe('useInterviewHistory', () => {
  const mockShowSuccess = vi.fn()
  const mockShowError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNotification).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showInfo: vi.fn(),
      showWarning: vi.fn()
    })
  })

  /**
   * @test
   * Verifies that the interview session is successfully deleted and the success notification is shown.
   */
  test('successfully deletes interview session', async () => {
    const mockResponse = { message: 'Interview deleted successfully' }
    vi.mocked(deleteInterview).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useInterviewHistory())

    await result.current.deleteSession('123')

    expect(deleteInterview).toHaveBeenCalledWith('123')
    expect(mockShowSuccess).toHaveBeenCalledWith('Interview deleted successfully')
    expect(mockShowError).not.toHaveBeenCalled()
  })

  /**
   * @test
   * Verifies that an error message from the API is shown when interview deletion fails with a message.
   */
  test('handles API error with message', async () => {
    const errorMessage = 'Interview not found'
    vi.mocked(deleteInterview).mockRejectedValue({
      response: {
        data: { message: errorMessage }
      }
    })

    const { result } = renderHook(() => useInterviewHistory())

    await result.current.deleteSession('123')

    expect(deleteInterview).toHaveBeenCalledWith('123')
    expect(mockShowError).toHaveBeenCalledWith(errorMessage)
    expect(mockShowSuccess).not.toHaveBeenCalled()
  })

  /**
   * @test
   * Verifies that a default error message is shown when interview deletion fails without a message.
   */
  test('handles API error without message', async () => {
    vi.mocked(deleteInterview).mockRejectedValue({})

    const { result } = renderHook(() => useInterviewHistory())

    await result.current.deleteSession('123')

    expect(deleteInterview).toHaveBeenCalledWith('123')
    expect(mockShowError).toHaveBeenCalledWith('Failed to delete interview session.')
    expect(mockShowSuccess).not.toHaveBeenCalled()
  })
}) 