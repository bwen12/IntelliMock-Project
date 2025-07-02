import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Mic, MicOff, CameraOff, X, Send, Volume2, VolumeX, Loader2, Camera } from "lucide-react";
import { useInterviewSession } from "../hooks/interview/useInterviewSession";
import { useSpeechToText } from "../hooks/interview/useSpeechToText";
import { useTTS } from "../hooks/interview/useTTS";
import { useVideoRecording } from "../hooks/interview/useVideoRecording";
import { useAuthContext } from "../contexts/AuthProvider";
import { createReview } from "@/services/reviewService";
import { createSummary } from "@/services/summaryService";
import { updateElapsedTime } from "@/services/reviewService";
import { EndInterviewDialog } from "../components/dialog/end-interview-dialog";
import { useNotification } from "../hooks/useNotification";
import femaleInterviewer from "../assets/images/femaleInterviewer.png";
import maleInterviewer from "../assets/images/maleInterviewer.png";
import blurredBackground from "../assets/images/blurredBackground.jpg";


/**
 * InterviewSession component handles the entire interview session with the user. It includes features such as:
 * - Recording audio from the user using speech-to-text.
 * - Video recording and display.
 * - Text-to-speech for AI interviewer responses.
 * - Time tracking for the interview duration.
 * - Handling the submission of answers, including audio and typed responses.
 * - Ending the interview, generating a summary, and saving the review.
 */
export default function InterviewSession() {
  const navigate = useNavigate();
  // Get the user from the auth context
  const { user } = useAuthContext();
  // Get the chat ID from the URL parameters
  const { chatId } = useParams();
  // State variables to manage the interview session
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  // State variable to manage the audio recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  // State variable to manage the ending state of the interview
  const [isEnding, setIsEnding] = useState(false);
  // State variable to manage the controls enabled state
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const hasEndedRef = useRef(false);
  const { showError } = useNotification();
  const [isTogglingCamera, setIsTogglingCamera] = useState(false);

  const {
    messages,
    currentAnswer,
    setCurrentAnswer,
    submitAnswer,
    elapsedTime,
    loading,
    sessionEnded,
  } = useInterviewSession(chatId || "", user?.email || "anonymous");

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    isUserSpeaking,
  } = useSpeechToText();

  const {
    speak,
    isSpeaking,
    voice,
    cancel,
    isFemale,
  } = useTTS(isTtsEnabled);

  const {
    videoRef,
    isRecording: isRecordingVideo,
    startCamera,
    stopCamera,
  } = useVideoRecording();

  const toggleCamera = async () => {
    setIsTogglingCamera(true);
    try {
      if (isRecordingVideo) {
        await stopCamera();
      } else {
        await startCamera();
      }
    } catch (err) {
      showError("Error toggling Camera");
    }
    setIsTogglingCamera(false);
  };

  // State variable to manage the final elapsed time
  const finalElapsedTimeRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInteractionDisabled = isEnding || sessionEnded;


  // Effect to start the camera and stop it when the component unmounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      setIsRecordingAudio(false);
      cancel();
    };
  }, []);

  // Effect to handle the end of the interview session automatically
  useEffect(() => {
    if (sessionEnded) {
      stopCamera();
    }
    if (!sessionEnded)
      return;

    if (!isTtsEnabled) {
      confirmEndInterview(true);
      return;
    }

    if (!isSpeaking) {
      const timeout = setTimeout(() => {
        if (!isSpeaking) {
          confirmEndInterview(true);
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [sessionEnded, isTtsEnabled, isSpeaking]);

  // Effect to update the current answer with the transcript when recording audio
  useEffect(() => {
    if (isRecordingAudio) {
      setCurrentAnswer(transcript);
    }
  }, [transcript, isRecordingAudio]);

  const lastSpokenRef = useRef<string>("");

  // Effect to handle text-to-speech for the interviewer's messages
  useEffect(() => {
    const last = messages
      .filter(m => m.role.toLowerCase() === "interviewer")
      .slice(-1)[0];
    if (last && last.message !== lastSpokenRef.current) {
      lastSpokenRef.current = last.message;
      speak(last.message);
    }
  }, [messages, voice]);

  // Effect to scroll to the bottom of the messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to enable or disable controls based on the speaking state
  useEffect(() => {
    if (isSpeaking) {
      setControlsEnabled(false);
    } else {
      const delay = window.setTimeout(() => setControlsEnabled(true), 1500);
      return () => clearTimeout(delay);
    }
  }, [isSpeaking]);

  // Toggle the audio recording state and handle the submission of answers
  const toggleAudioRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Your browser does not support mic voice recognition.");
      return;
    }

    if (isRecordingAudio) {
      stopListening();
      setIsRecordingAudio(false);

      if (transcript.trim()) {
        setCurrentAnswer(transcript);
        submitAnswer();
      }
    } else {
      resetTranscript();
      startListening();
      setIsRecordingAudio(true);
    }
  };

  // Function to end the interview session
  const confirmEndInterview = async (skipCancel = false) => {

    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    if (!skipCancel) cancel();
    await stopCamera();
    setIsRecordingAudio(false);
    setIsEnding(true);

    if (chatId) {
      try {
        await createReview(chatId);
        await createSummary(chatId);
        finalElapsedTimeRef.current = elapsedTime;
        await updateElapsedTime(chatId, elapsedTime);
        navigate("/interview-results", { state: { chatId }, replace: true });
      } catch (error) {
        showError("Error Generating Review");
        alert("Error ending interview or generating review. Please try again.");
        setIsEnding(false);
        hasEndedRef.current = false;
      }
    } else {
      alert("Chat ID is not available. Cannot end the interview.");
      setIsEnding(false);
      hasEndedRef.current = false;
    }
  };

  // Function to format the elapsed time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto py-6 px-4 h-[calc(100vh)] flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b pb-4 relative">
        <div className="flex-1" /> {/* Left spacer */}

        <div className="flex items-center space-x-4 justify-center">
          <div className="text-base font-semibold">{formatTime(elapsedTime)}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              cancel();
              setIsTtsEnabled((prev) => !prev);
            }}
            title={isTtsEnabled ? "Mute TTS" : "Unmute TTS"}
            disabled={sessionEnded || isEnding}
          >
            {isTtsEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted" />
            )}
          </Button>
        </div>

        <div className="flex-1 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowEndDialog(true)}
            className="flex items-center"
            disabled={isEnding}
          >
            {isEnding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                End Interview
              </>
            )}
          </Button>
        </div>
      </div>
      {isEnding && (
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating your interview review and summary...</span>
        </div>
      )}
      <div className="flex-grow flex flex-col md:flex-row gap-4 overflow-hidden">
        <div className="w-full md:w-1/2 flex flex-col rounded-lg px-2 py-2 gap-2 h-full">
          {/* AI Interviewer Camera */}
          <div
            className={`flex-1 min-h-0 flex items-center justify-center rounded-lg border border-muted transition-all duration-300 ${isSpeaking && isTtsEnabled ? "ring-2 ring-green-500 shadow-lg" : ""
              }`}
            style={{
              backgroundImage: `url(${blurredBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <img
                src={blurredBackground}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                src={isFemale ? femaleInterviewer : maleInterviewer}
                alt="AI Interviewer"
                className="absolute inset-0 w-full h-full object-contain z-10"
              />
            </div>
          </div>

          {/* User Camera */}
          <div
            className={`flex-1 min-h-0 bg-black relative flex items-center justify-center rounded-lg border border-muted overflow-hidden transition-all duration-300 ${isUserSpeaking ? "ring-2 ring-green-500 shadow-lg" : ""
              }`}
          >
            {/* Video layer */}
            {isRecordingVideo && (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-fill rounded-lg"
              />
            )}

            {/* Profile layer (only shown when video is off) */}
            {!isRecordingVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 space-y-2">
                <img
                  src={
                    user?.profilePicture ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || "User"}+${user?.lastName || ""}`
                  }
                  alt="User Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <p className="text-base font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            )}

            {/* Camera toggle button (always visible) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={toggleCamera}
                disabled={isTogglingCamera || isInteractionDisabled}
                className="flex items-center gap-2 px-4 py-2 rounded bg-muted hover:bg-muted/80 text-sm disabled:opacity-50"
              >
                {isRecordingVideo ? (
                  <>
                    <CameraOff className="h-4 w-4" />
                    Turn Off Camera
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Turn On Camera
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col bg-card rounded-lg border">
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                msg.role.toLowerCase() === "interviewer" ? (
                  <div key={`interviewer-${index}`} className="flex items-start">
                    <img
                      src={isFemale ? femaleInterviewer : maleInterviewer}
                      alt="AI Interviewer"
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[80%]">
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ) : (
                  <div key={`user-${index}`} className="flex items-start justify-end">
                    <div className="bg-primary/10 p-3 rounded-lg rounded-tr-none max-w-[80%] break-words whitespace-pre-wrap">
                      <p>{msg.message}</p>
                    </div>
                    <img
                      src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || "User"}+${user?.lastName || ""}`}
                      alt="You"
                      className="w-8 h-8 rounded-full ml-2 object-cover"
                    />
                  </div>
                )
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center gap-2 h-14">
              <Button
                data-testid="mic-button"
                variant={isRecordingAudio ? "default" : "outline"}
                className={`h-full aspect-square p-0 flex items-center justify-center ${isRecordingAudio ? "text-red-500 animate-pulse" : ""
                  }`}
                onClick={toggleAudioRecording}
                disabled={isInteractionDisabled || !controlsEnabled}
              >
                {isRecordingAudio ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Textarea
                placeholder="Type your answer here..."
                className="flex-grow resize-none h-full"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={isRecordingAudio || isInteractionDisabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitAnswer();
                  }
                }}
              />

              <Button
                onClick={submitAnswer}
                disabled={loading || isEnding || sessionEnded || isRecordingAudio}
                className="h-full aspect-square p-0 flex items-center justify-center ml-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            {isRecordingAudio && (
              <div className="mt-2 text-sm text-center text-primary animate-pulse">
                Listening... Click the microphone icon when you're done speaking.
              </div>
            )}
          </div>
        </div>
      </div >
      <EndInterviewDialog
        open={showEndDialog}
        onCancel={() => setShowEndDialog(false)}
        onConfirm={() => {
          setShowEndDialog(false);
          confirmEndInterview();
        }}
      />
    </div >
  );
}
