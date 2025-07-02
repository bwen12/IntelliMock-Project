import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing video recording functionality using the user's camera.
 *
 * @returns {{
 *   videoRef: React.RefObject<HTMLVideoElement>,
 *   isRecording: boolean,
 *   startCamera: () => Promise<void>,
 *   stopCamera: () => void,
 *   hasTried: boolean,
 *   hasPermissionError: boolean,
 * }}
 */
export function useVideoRecording() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const startCamera = async () => {
    try {
      await stopCamera();
      setHasTried(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      setIsRecording(true);
      setHasPermissionError(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setIsRecording(false);
      setHasPermissionError(true);
    }
  };

  const stopCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      } catch (e) {
      }
    }
    setIsRecording(false);
  };

  useEffect(() => {
    if (isRecording && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isRecording]);

  return {
    videoRef,
    isRecording,
    startCamera,
    stopCamera,
    hasTried,
    hasPermissionError,
  };
}