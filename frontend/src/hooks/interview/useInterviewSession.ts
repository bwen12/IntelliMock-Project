import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "../../types/interview";
import { getChatMessages, sendMessage } from "../../services/interviewService";
import { useNotification } from "../useNotification";

/**
 * Custom hook to manage the interview session, including retrieving and submitting chat messages, 
 * tracking elapsed time, and handling state for the interview process.
 * 
 * This hook allows you to load and send messages during the interview session, update the state of the 
 * current answer, track the time elapsed since the session started, and manage the loading state.
 * 
 * @hook useInterviewSession
 * 
 * @param {string} chatId - The ID of the chat session.
 * @param {string} email - The email of the user.
 * @param {number} [totalQuestions=8] - The total number of questions in the interview.
 * @returns {Object} - An object containing the interview session state and functions:
 *   - {ChatMessage[]} messages - The list of chat messages for the current session.
 *   - {string} currentAnswer - The user's current answer being typed.
 *   - {Function} setCurrentAnswer - Function to update the current answer state.
 *   - {Function} submitAnswer - Function to submit the user's current answer.
 *   - {number} elapsedTime - The time elapsed (in seconds) since the interview started.
 *   - {boolean} loading - Indicates if the message is being sent or if data is loading.
 * 
 * @typedef {Object} ChatMessage - The structure of a chat message.
 * @property {string} chatId - The ID of the chat session.
 * @property {string} email - The email of the user.
 * @property {string} message - The content of the message.
 * @property {string} role - The role of the message sender ("user" or "interviewer").
 * 
 * @throws {Error} - Throws an error if fetching messages fails, or if submitting an empty answer.
 */
export function useInterviewSession(chatId: string, email: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { showError } = useNotification();
  useEffect(() => {
    getChatMessages(chatId)
      .then(setMessages)
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to load chat messages.";
        showError(msg);
      });
  }, [chatId]);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /**
  * Submits the user's answer to the current question and updates the chat messages with both user and AI responses.
  * 
  * @returns {Promise<void>} - A promise that resolves when the answer is successfully submitted and the response is received.
  * @throws {Error} - Throws an error if the answer is empty.
  * @throws {Error} - Throws an error if the message submission fails.
  */
  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    const userMessage: ChatMessage = {
      chatId,
      email,
      message: currentAnswer,
      role: "user",
      isEnd: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentAnswer("");

    try {
      setLoading(true);
      const aiResponse = await sendMessage(userMessage);
      const aiMessage: ChatMessage = {
        chatId,
        email,
        message: aiResponse.message,
        role: "interviewer",
        isEnd: aiResponse.isEnd,
      };

      setMessages((prev) => [...prev, aiMessage]);
      const latest = await getChatMessages(chatId);
      setMessages(latest);
      const last = latest[latest.length - 1];
      if (last?.isEnd) {
        setSessionEnded(true);
      }
    } catch (err: any) {
      showError("Error Sending Message.");
      const apiMessage =
        err?.response?.data?.message || "Something went wrong sending your message.";
      showError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    currentAnswer,
    setCurrentAnswer,
    submitAnswer,
    elapsedTime,
    loading,
    sessionEnded,
  };
}
