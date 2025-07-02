/**
 * @fileoverview Unit tests for the `authService` module.
 * 
 * This file contains tests for the authentication service functions, such as:
 * - `getCurrentUser`: Retrieves the current user information.
 * - `refreshToken`: Refreshes the authentication token.
 * - `logout`: Logs the user out of the system.
 * - `loginWithGoogle`: Handles Google OAuth login for the user.
 * 
 * Mock API responses are set up using `axios-mock-adapter` to simulate the backend API calls.
 * The tests ensure that the authentication methods handle both successful and failed requests
 * and correctly return or throw expected values.
 */

import MockAdapter from 'axios-mock-adapter';
import api from '@/lib/api';
import { getCurrentUser, refreshToken, logout, loginWithGoogle } from '../authService';
import { UserResponse } from '@/types/UserResponse';

const mock = new MockAdapter(api);

describe('authService', () => {
  // Reset the mock API before each test
  beforeEach(() => {
    mock.reset();
  });

  /**
   * Test suite for the `getCurrentUser` function.
   */
  describe('getCurrentUser', () => {
    /**
     * Test: should return user data when the request is successful.
     */
    it('should return user data when successful', async () => {
      const mockUser: UserResponse = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user',
        profilePicture: 'https://example.com/profile.jpg'
      };

      mock.onGet('/auth/me').reply(200, mockUser);

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    /**
     * Test: should throw error when the request fails.
     */
    it('should throw error when request fails', async () => {
      mock.onGet('/auth/me').reply(500);

      await expect(getCurrentUser()).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `refreshToken` function.
   */
  describe('refreshToken', () => {
    /**
     * Test: should return a success message when the token is refreshed successfully.
     */
    it('should return success message when token is refreshed', async () => {
      const mockResponse = { message: 'Token refreshed successfully' };
      mock.onPost('/auth/refresh').reply(200, mockResponse);

      const result = await refreshToken();
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test: should throw error when token refresh fails.
     */
    it('should throw error when refresh fails', async () => {
      mock.onPost('/auth/refresh').reply(401);

      await expect(refreshToken()).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `logout` function.
   */
  describe('logout', () => {
    /**
     * Test: should return a success message when logout is successful.
     */
    it('should return success message when logout is successful', async () => {
      const mockResponse = { message: 'Logged out successfully' };
      mock.onPost('/auth/logout').reply(200, mockResponse);

      const result = await logout();
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test: should throw error when logout fails.
     */
    it('should throw error when logout fails', async () => {
      mock.onPost('/auth/logout').reply(500);

      await expect(logout()).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `loginWithGoogle` function.
   */
  describe('loginWithGoogle', () => {
    /**
     * Test: should return user data when Google login is successful.
     */
    it('should return user data when login is successful', async () => {
      const mockUser: UserResponse = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user',
        profilePicture: 'https://example.com/profile.jpg'
      };
      const idToken = 'mock-google-id-token';

      mock.onPost('/auth/oauth/login', { id_token: idToken }).reply(200, mockUser);

      const result = await loginWithGoogle(idToken);
      expect(result).toEqual(mockUser);
    });

    /**
     * Test: should throw error when Google login fails.
     */
    it('should throw error when login fails', async () => {
      const idToken = 'invalid-token';
      mock.onPost('/auth/oauth/login', { id_token: idToken }).reply(401);

      await expect(loginWithGoogle(idToken)).rejects.toThrow();
    });
  });
}); 