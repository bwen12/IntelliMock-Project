import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing text-to-speech (TTS) functionality.
 * 
 * This hook allows you to convert text to speech, manage voice selection, and control the 
 * state of speech synthesis (e.g., whether speech is currently playing). The voice is selected 
 * randomly between a male or female voice.
 * 
 * @hook useTTS
 * 
 * @param {boolean} isEnabled - Flag to enable or disable speech synthesis.
 * 
 * @returns {Object} - An object containing the following properties and methods:
 *   - {SpeechSynthesisVoice | null} voice - The selected voice for speech synthesis.
 *   - {boolean} isSpeaking - A boolean indicating whether speech synthesis is currently in progress.
 *   - {Function} speak - Function to start speaking the provided text.
 *   - {Function} cancel - Function to cancel any ongoing speech.
 */
export function useTTS(isEnabled: boolean) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFemale, setIsFemale] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const shouldMuteRef = useRef(false);

  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      const maleVoice =
        voices.find((v) => v.name === "Google UK English Male") ||
        voices.find((v) => v.name === "Google US English") ||
        voices.find((v) => v.name.toLowerCase().includes("david")) ||
        voices.find((v) => v.name.toLowerCase().includes("male"));

      const femaleVoice =
        voices.find((v) => v.name === "Google UK English Female") ||
        voices.find((v) => v.name === "Google US English Female") ||
        voices.find((v) => v.name.toLowerCase().includes("female")) ||
        voices.find((v) => v.name.toLowerCase().includes("susan"));

      const fallback = voices.find((v) => v.lang === "en-US") || voices[0];
      const useMale = Math.random() < 0.5;
      const selected = useMale ? maleVoice || fallback : femaleVoice || fallback;

      setVoice(selected || null);
      setIsFemale(
        selected?.name?.toLowerCase().includes("female") ||
        selected?.name?.toLowerCase().includes("susan")
      );
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = loadVoice;
    } else {
      loadVoice();
    }
  }, []);

  useEffect(() => {
    shouldMuteRef.current = !isEnabled;
  }, [isEnabled]);

  const cancel = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speak = (text: string) => {
    if (!voice || !text) return;

    window.speechSynthesis.cancel();

    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

    (async () => {
      for (let sentence of sentences) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        await new Promise<void>((resolve) => {
          const u = new SpeechSynthesisUtterance(sentence.trim());
          utteranceRef.current = u;
          u.voice = voice;
          u.lang = voice.lang || "en-US";
          u.volume = shouldMuteRef.current ? 0 : 1;
          u.onstart = () => setIsSpeaking(true);
          u.onend = () => {
            setIsSpeaking(false);
            resolve();
          };
          u.onerror = () => {
            setIsSpeaking(false);
            resolve();
          };
          window.speechSynthesis.speak(u);
        });
      }
    })();
  };

  return { voice, speak, cancel, isSpeaking, isFemale };
}