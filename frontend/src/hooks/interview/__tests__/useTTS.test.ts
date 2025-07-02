/**
 * @fileoverview Test suite for the `useTTS` hook, which interacts with the 
 * browser's speech synthesis API to provide text-to-speech functionality. 
 * It tests the hook's behavior for initializing values, speaking, canceling speech, 
 * handling errors, and managing the speaking state.
 * Utilizes `vitest` and `@testing-library/react` for testing.
 */
import { describe, test, expect, vi, beforeEach, Mock } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTTS } from '../useTTS'

describe('useTTS', () => {
  const mockVoice = {
    name: 'Google UK English Male',
    lang: 'en-GB'
  }

  beforeEach(() => {
    // Mock window.speechSynthesis
    const mockSpeechSynthesis = {
      getVoices: vi.fn().mockReturnValue([mockVoice]),
      speak: vi.fn(),
      cancel: vi.fn(),
      onvoiceschanged: null as (() => void) | null
    }
    window.speechSynthesis = mockSpeechSynthesis as any

    // Mock SpeechSynthesisUtterance
    const mockUtterance = {
      voice: null,
      lang: '',
      onstart: null as ((event: SpeechSynthesisEvent) => void) | null,
      onend: null as ((event: SpeechSynthesisEvent) => void) | null,
      onerror: null as ((event: SpeechSynthesisErrorEvent) => void) | null
    }
    global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => mockUtterance) as any
  })

  /**
   * Test for verifying that the hook initializes with the correct default values.
   */
  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useTTS(true))

    expect(result.current.isSpeaking).toBe(false)
    expect(result.current.voice).toBe(mockVoice)
    expect(result.current.isFemale === true || result.current.isFemale === false).toBe(true)
  })

  /**
   * Test for verifying that speech is made when the TTS functionality is disabled but muted.
   */
  test('mutes speech when disabled but still calls speak', () => {
    const { result } = renderHook(() => useTTS(false))

    act(() => {
      result.current.speak('Hello world')
    })

    const speakMock = window.speechSynthesis.speak as Mock

    expect(speakMock).toHaveBeenCalledTimes(1)

    const utteranceArg = speakMock.mock.calls[0][0]
    expect(utteranceArg.volume).toBe(0)
  })


  /**
   * Test for verifying that speech is canceled correctly when `cancel` is called.
   */
  test('cancels speech when cancel is called', () => {
    const { result } = renderHook(() => useTTS(true))

    act(() => {
      result.current.cancel()
    })

    expect(window.speechSynthesis.cancel).toHaveBeenCalled()
  })

  /**
   * Test for handling speech synthesis errors, ensuring the speaking state is reset.
   */
  test('handles speech synthesis errors', async () => {
    const { result } = renderHook(() => useTTS(true))

    const mockUtterance = new SpeechSynthesisUtterance('test')
    mockUtterance.onerror = vi.fn()

    await act(async () => {
      result.current.speak('Hello world')
      // Simulate error
      const errorEvent = new Event('error') as SpeechSynthesisErrorEvent
      Object.defineProperties(errorEvent, {
        error: { value: 'network' },
        message: { value: 'Network error' },
        utterance: { value: mockUtterance },
        elapsedTime: { value: 0 },
        name: { value: 'error' },
        charIndex: { value: 0 },
        charLength: { value: 0 }
      })
      mockUtterance.onerror?.(errorEvent)
    })

    expect(result.current.isSpeaking).toBe(false)
  })

  /**
   * Test for updating the `isSpeaking` state during speech, verifying it transitions 
   * correctly when speech starts and ends.
   */
  test('updates speaking state during speech', async () => {
    const { result } = renderHook(() => useTTS(true))

    const mockUtterance = new SpeechSynthesisUtterance('test')
    mockUtterance.onstart = vi.fn()
    mockUtterance.onend = vi.fn()

    await act(async () => {
      result.current.speak('Hello world')
      // Simulate speech start
      const startEvent = new Event('start') as SpeechSynthesisEvent
      Object.defineProperties(startEvent, {
        utterance: { value: mockUtterance },
        elapsedTime: { value: 0 },
        name: { value: 'start' },
        charIndex: { value: 0 },
        charLength: { value: 0 }
      })
      mockUtterance.onstart?.(startEvent)
    })

    expect(result.current.isSpeaking).toBe(true)

    await act(async () => {
      // Simulate speech end
      const endEvent = new Event('end') as SpeechSynthesisEvent
      Object.defineProperties(endEvent, {
        utterance: { value: mockUtterance },
        elapsedTime: { value: 0 },
        name: { value: 'end' },
        charIndex: { value: 0 },
        charLength: { value: 0 }
      })
      mockUtterance.onend?.(endEvent)
    })

    expect(result.current.isSpeaking).toBe(false)
  })

  /**
   * Test for verifying that the hook falls back to a default voice 
   * when no male or female-specific voices are found in the available voices.
   * This ensures the `useTTS` hook still assigns a voice even when expected
   * named voices like "Google UK English Male/Female" are unavailable.
   */
  test('falls back to default voice if no male/female voice is found', () => {
    const fallbackVoice = { name: 'Default Voice', lang: 'en-US' }
    const mockGetVoices = vi.fn().mockReturnValue([fallbackVoice])
    window.speechSynthesis.getVoices = mockGetVoices

    const { result } = renderHook(() => useTTS(true))

    expect(result.current.voice?.name).toBe('Default Voice')
  })

}) 