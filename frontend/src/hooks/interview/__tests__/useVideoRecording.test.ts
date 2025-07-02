/**
 * @fileoverview Test suite for the `useVideoRecording` hook, which interacts 
 * with the browser's `mediaDevices` API to enable video recording functionality. 
 * It tests the hook's behavior for initializing values, starting and stopping 
 * the camera, and handling camera errors.
 * Utilizes `vitest` and `@testing-library/react` for testing.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useVideoRecording } from '../useVideoRecording'

// Mock the video element
const mockVideoElement = {
  srcObject: null,
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  removeAttribute: vi.fn()
}

describe('useVideoRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test for verifying that the hook initializes with correct default values.
   */
  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useVideoRecording())

    expect(result.current.isRecording).toBe(false)
    expect(result.current.videoRef.current).toBe(null)
  })

  /**
   * Test for verifying that the camera starts successfully when `startCamera` is called.
   * This includes checking that the correct stream is assigned to the video element.
   */
  test('starts camera successfully', async () => {
    const stopMock = vi.fn()
    const testStream = {
      getTracks: () => [{ stop: stopMock, readyState: 'live' }]
    }

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(testStream)
      },
      writable: true
    })

    const { result } = renderHook(() => useVideoRecording())
    result.current.videoRef.current = mockVideoElement as unknown as HTMLVideoElement

    await act(async () => {
      await result.current.startCamera()
    })

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: false })
    expect(mockVideoElement.srcObject).toBe(testStream)
    expect(mockVideoElement.play).toHaveBeenCalled()

    await waitFor(() => {
      expect(result.current.isRecording).toBe(true)
    })
  })

  /**
   * Test for handling errors when accessing the camera.
   * Verifies that the `isRecording` state is false when the camera access fails.
   */
  test('handles camera errors', async () => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('Camera access denied'))
      },
      writable: true
    })

    const { result } = renderHook(() => useVideoRecording())
    result.current.videoRef.current = mockVideoElement as unknown as HTMLVideoElement

    await act(async () => {
      await result.current.startCamera()
    })

    expect(result.current.isRecording).toBe(false)
  })

  /**
   * Test for verifying that the camera stops successfully when `stopCamera` is called.
   * This includes checking that the tracks are stopped and the video element's `srcObject` is cleared.
   */
  test('stops camera successfully', async () => {
    const stopMock = vi.fn()
    const track = { stop: stopMock, readyState: "live" }
    const testStream = {
      getTracks: () => [track]
    }

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(testStream)
      },
      writable: true
    })

    const { result } = renderHook(() => useVideoRecording())
    result.current.videoRef.current = mockVideoElement as unknown as HTMLVideoElement

    await act(async () => {
      await result.current.startCamera()
    })

    await act(async () => {
      await result.current.stopCamera()
    })

    expect(stopMock).toHaveBeenCalled()
    expect(mockVideoElement.srcObject).toBe(null)

    await waitFor(() => {
      expect(result.current.isRecording).toBe(false)
    })
  })
})
