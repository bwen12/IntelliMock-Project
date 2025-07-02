/**
 * Represents the user details returned from the API response after a successful login or session retrieval.
 * 
 * @interface UserResponse
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} email - The user's email address.
 * @property {string} role - The user's role (e.g., "admin", "user", etc.).
 * @property {string} [profilePicture] - The URL or path to the user's profile picture (optional).
 */
export interface UserResponse {
  firstName: string
  lastName: string
  email: string
  role: string
  profilePicture?: string
}