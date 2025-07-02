import { deleteInterview } from "../../services/reviewService";
import { useNotification } from "../useNotification";

/**
 * Custom hook to manage interview history.
 * @returns {Object} - An object containing the deleteSession function.
 */
export function useInterviewHistory() {
  const { showError, showSuccess } = useNotification();

  /**
   * Deletes an interview session by its chat ID.
   * @param {string}
   * @returns {Promise<void>} - A promise that resolves when the session is deleted.
   * @throws {Error} - Throws an error if the deletion fails.
   */
  const deleteSession = async (chatId: string) => {
    try {
      const res = await deleteInterview(chatId);
      showSuccess(res.message || "Interview session deleted.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete interview session.";
      showError(msg);
    }
  };

  return { deleteSession };
}
