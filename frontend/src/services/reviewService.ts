import api from "@/lib/api";

/**
 * Retrieves the review for a specific chat session.
 * 
 * @async
 * @function getReview
 * @param {string} chatId - The unique identifier for the chat session whose review is being fetched.
 * @returns {Promise<any>} The response containing the review data for the specified chat session.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function getReview(chatId: string) {

  const res = await api.get(`/review/review/${chatId}`, {
    withCredentials: true,
  });
  return res.data;
}



/**
 * Creates a new review for a specific chat session.
 * 
 * @async
 * @function createReview
 * @param {string} chatId - The unique identifier for the chat session to be reviewed.
 * @returns {Promise<any>} The response containing data of the newly created review for the specified chat session.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function createReview(chatId: string) {

  const res = await api.post(`/review/createReview`, { chatId }, {
    withCredentials: true,
  });

  return res.data;
}

/**
 * Deletes an interview (review) for a specific chat session.
 * 
 * @async
 * @function deleteInterview
 * @param {string} chatId - The unique identifier for the chat session whose interview is being deleted.
 * @returns {Promise<{ message: string }>} A response containing a message confirming the deletion of the interview.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function deleteInterview(chatId: string): Promise<{ message: string }> {
  const res = await api.delete(`/review/delete/${chatId}`, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * Updates the elapsed time for a specific chat session.
 * 
 * @async
 * @function updateElapsedTime
 * @param {string} chatId - The unique identifier for the chat session whose elapsed time is being updated.
 * @param {number} elapsedTime - The new elapsed time (in minutes) to be updated for the chat session.
 * @returns {Promise<{ message: string }>} A response containing a message confirming the update of the elapsed time.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function updateElapsedTime(chatId: string, elapsedTime: number): Promise<{ message: string }> {
  const res = await api.put(`/openai/updateElapsedTime/${chatId}?elapsedTime=${elapsedTime}`, null, {
    withCredentials: true,
  });
  return res.data;
}
