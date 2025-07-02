/**
 * @fileoverview Test suite for the `useSpeechToText` hook, which interacts with 
 * the `react-speech-recognition` library. It tests the hook's behavior for 
 * initializing values, starting and stopping listening, and handling browser support.
 * Utilizes `vitest` and `@testing-library/react` for testing.
 * 
 * Dependencies:
 * - `react-speech-recognition`: Provides functions and hooks for speech recognition.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeechToText } from '../useSpeechToText'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

// Mock `react-speech-recognition`
vi.mock('react-speech-recognition', () => ({
  default: {
    startListening: vi.fn(),
    stopListening: vi.fn()
  },
  useSpeechRecognition: vi.fn()
}))

/**
 * Test suite for the `useSpeechToText` hook, focusing on its interaction 
 * with the `react-speech-recognition` library and verifying its functionality.
 */
describe('useSpeechToText', () => {
  const mockTranscript = 'Hello world'
  const mockResetTranscript = vi.fn()
  const mockBrowserSupportsSpeechRecognition = true

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSpeechRecognition).mockReturnValue({
      transcript: mockTranscript,
      resetTranscript: mockResetTranscript,
      browserSupportsSpeechRecognition: mockBrowserSupportsSpeechRecognition,
      browserSupportsContinuousListening: true,
      listening: false,
      interimTranscript: '',
      finalTranscript: '',
      isMicrophoneAvailable: true
    })
  })

  /**
   * Test for verifying that the hook initializes with the correct default values.
   */
  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useSpeechToText())

    expect(result.current.transcript).toBe(mockTranscript)
    expect(result.current.browserSupportsSpeechRecognition).toBe(mockBrowserSupportsSpeechRecognition)
  })

  /**
   * Test for verifying that the `startListening` function starts listening 
   * and resets the transcript correctly.
   */
  test('starts listening when startListening is called', () => {
    const { result } = renderHook(() => useSpeechToText())

    act(() => {
      result.current.startListening()
    })

    expect(mockResetTranscript).toHaveBeenCalled()
    expect(SpeechRecognition.startListening).toHaveBeenCalledWith({
      continuous: true,
      language: 'en-US'
    })
  })

  /**
   * Test for verifying that the `stopListening` function stops the listening process.
   */
  test('stops listening when stopListening is called', () => {
    const { result } = renderHook(() => useSpeechToText())

    act(() => {
      result.current.stopListening()
    })

    expect(SpeechRecognition.stopListening).toHaveBeenCalled()
  })

  /**
   * Test for checking the behavior when the browser does not support speech recognition.
   */
  test('handles browser support check', () => {
    vi.mocked(useSpeechRecognition).mockReturnValue({
      transcript: '',
      resetTranscript: mockResetTranscript,
      browserSupportsSpeechRecognition: false,
      browserSupportsContinuousListening: false,
      listening: false,
      interimTranscript: '',
      finalTranscript: '',
      isMicrophoneAvailable: true
    })

    const { result } = renderHook(() => useSpeechToText())

    expect(result.current.browserSupportsSpeechRecognition).toBe(false)
  })

  /**
   * Test that verifies `startListening` handles microphone access failure gracefully.
   */
  test('startListening handles microphone access failure', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: { getUserMedia: vi.fn().mockRejectedValueOnce(new Error('Permission denied')) }
    })

    const { result } = renderHook(() => useSpeechToText())

    await act(async () => {
      await result.current.startListening()
    })

    expect(result.current.isUserSpeaking).toBe(false)
  })

  /**
   * Test that verifies `stopListening` correctly stops mic stream and cleans up.
   */
  test('stopListening stops mic stream and cleans up', async () => {
    const stopMock = vi.fn()
    const closeMock = vi.fn()

    const mockStream = {
      getTracks: () => [{ stop: stopMock }]
    }

    const mockAudioCtx = {
      close: closeMock,
      createMediaStreamSource: vi.fn().mockReturnValue({ connect: vi.fn() }),
      createAnalyser: vi.fn().mockReturnValue({
        fftSize: 2048,
        getByteTimeDomainData: vi.fn()
      })
    }

    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: { getUserMedia: vi.fn().mockResolvedValueOnce(mockStream as any) }
    })

    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioCtx))

    const { result } = renderHook(() => useSpeechToText())

    await act(async () => {
      await result.current.startListening()
    })

    act(() => {
      result.current.stopListening()
    })

    expect(stopMock).toHaveBeenCalled()
    expect(closeMock).toHaveBeenCalled()
  })

}) 