import api from "@/lib/api";


/**
 * Retrieves the list of chats for the summary page.
 * 
 * @async
 * @function getUserChats
 * @returns {Promise<any>} The response containing the list of chats for the user.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function getUserChats() {
    const res = await api.get("/openai/chats", {
      withCredentials: true,
    });
    return res.data;
}
  
/**
 * Retrieves the summary of a specific interview chat session.
 * 
 * @async
 * @function getSummary
 * @param {string} chatId - The unique identifier for the chat session whose summary is being fetched.
 * @returns {Promise<any>} The response containing the summary data of the specified chat session.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function getSummary(chatId: string) {
    const res = await api.get(`/review/summary/${chatId}`, {
      withCredentials: true,
    });
    return res.data;
}

/**
 * Creates a new summary for a specific chat session.
 * 
 * @async
 * @function createSummary
 * @param {string} chatId - The unique identifier for the chat session to create a summary for.
 * @returns {Promise<any>} The response containing data of the newly created summary for the specified chat session.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function createSummary(chatId: string) {
  const res = await api.post(`/review/createSummary`, { chatId}, {
    withCredentials: true,
  });
  return res.data;
}







