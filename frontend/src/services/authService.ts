import api from "../lib/api";
import { UserResponse } from "../types/UserResponse";

/**
 * Fetches the current authenticated user's details.
 * 
 * @async
 * @function getCurrentUser
 * @returns {Promise<UserResponse>} The current user's data.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  const res = await api.get<UserResponse>("/auth/me");
  return res.data;
};

/**
 * Refreshes the authentication token for the current user.
 * 
 * @async
 * @function refreshToken
 * @returns {Promise<{ message: string }>} A response containing a success message.
 * @throws {Error} Throws an error if the API request fails.
 */
export const refreshToken = async (): Promise<{ message: string }> => {
  const res = await api.post<{ message: string }>("/auth/refresh");
  return res.data;
};

/**
 * Logs the current user out of the application.
 * 
 * @async
 * @function logout
 * @returns {Promise<{ message: string }>} A response containing a success message.
 * @throws {Error} Throws an error if the API request fails.
 */
export const logout = async (): Promise<{ message: string }> => {
  const res = await api.post<{ message: string }>("/auth/logout");
  return res.data;
};

/**
 * Logs the user in using their Google OAuth token.
 * 
 * @async
 * @function loginWithGoogle
 * @param {string} idToken - The Google OAuth ID token received after authentication.
 * @returns {Promise<UserResponse>} The authenticated user's data.
 * @throws {Error} Throws an error if the API request fails.
 */
export const loginWithGoogle = async (idToken: string): Promise<UserResponse> => {
    const res = await api.post<UserResponse>("/auth/oauth/login", { id_token: idToken });
    return res.data;
  };
