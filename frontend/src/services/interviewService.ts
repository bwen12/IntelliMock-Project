import { ChatMessage } from "@/types/interview";
import api from "../lib/api";

export interface ChatSessionResponse {
  id: string;
  email: string;
  chatName: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  context: string;
  cv: string;
}

export interface AIResponse {
  message: string;
  isEnd: boolean;
}

/**
 * Creates a new chat session by sending the provided form data.
 * 
 * @async
 * @function createChatSession
 * @param {FormData} formData - The form data to create a new chat session, including details like email, job title, and CV.
 * @returns {Promise<ChatSessionResponse>} The response containing details of the created chat session.
 * @throws {Error} Throws an error if the API request fails.
 */
export const createChatSession = async (formData: FormData): Promise<ChatSessionResponse> => {
  const res = await api.post("/openai/createChat", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data as ChatSessionResponse;
};

/**
 * Retrieves all messages for a specific chat session.
 * 
 * @async
 * @function getChatMessages
 * @param {string} chatId - The unique identifier for the chat session.
 * @returns {Promise<ChatMessage[]>} An array of chat messages in the specified session.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getChatMessages = async (
  chatId: string
): Promise<ChatMessage[]> => {
  const res = await api.get(`/openai/messages/${chatId}`, {
    withCredentials: true,
  });
  return res.data.data.messages;
};

/**
 * Sends a message to the chat session.
 * 
 * @async
 * @function sendMessage
 * @param {ChatMessage} message - The message to be sent, containing the content and other relevant information.
 * @returns {Promise<string>} A response message indicating the success or failure of the send operation.
 * @throws {Error} Throws an error if the API request fails.
 */
export const sendMessage = async (
  message: ChatMessage
): Promise<AIResponse> => {
  const res = await api.post<AIResponse>(
    "/openai/sendMessage",
    message,
    { withCredentials: true }
  );
  return res.data;
};
