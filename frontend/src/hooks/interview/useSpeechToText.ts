import { useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

/**
 * Custom hook to manage speech-to-text functionality using the `react-speech-recognition` library.
 * 
 * This hook provides functionality to start and stop speech recognition, as well as manage
 * the transcription of speech to text. It includes helper functions for starting, stopping
 * listening, and resetting the transcript, as well as checking if the browser supports speech recognition.
 * 
 * @hook useSpeechToText
 * 
 * @returns {Object} - An object containing the speech-to-text functionality:
 *   - {string} transcript - The current transcription of the spoken words.
 *   - {Function} resetTranscript - Function to reset the current transcription.
 *   - {boolean} browserSupportsSpeechRecognition - A boolean indicating whether the browser supports speech recognition.
 *   - {Function} startListening - Function to start continuous speech recognition.
 *   - {Function} stopListening - Function to stop speech recognition.
 */
export function useSpeechToText() {
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const checkVolume = () => {
    if (!analyserRef.current) return;

    const data = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(data);

    // Check if the average audio volume exceeds a threshold
    const isSpeakingNow = data.some((v) => Math.abs(v - 128) > 10);
    setIsUserSpeaking(isSpeakingNow);

    animationRef.current = requestAnimationFrame(checkVolume);
  };

  const startListening = async () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      checkVolume();
    } catch (error) {
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsUserSpeaking(false);

    micStreamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
  };

  return {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    isUserSpeaking
  };
}
