/**
 * @fileoverview Unit tests for the `reviewService` module.
 * 
 * This file contains tests for the review-related service functions, such as:
 * - `getReview`: Retrieves the review for a specific chat session.
 * - `createReview`: Creates a new review for a specific chat session.
 * - `deleteInterview`: Deletes a specific interview session.
 * 
 * Mock API responses are set up using `axios-mock-adapter` to simulate the backend API calls.
 * The tests ensure that each service function handles both successful and failed requests
 * and correctly returns or throws expected values.
 */

import MockAdapter from 'axios-mock-adapter';
import api from '@/lib/api';
import { getReview, createReview, deleteInterview } from '../reviewService';

const mock = new MockAdapter(api);

describe('reviewService', () => {
  // Reset the mock API before each test
  beforeEach(() => {
    mock.reset();
  });

  /**
   * Test suite for the `getReview` function.
   */
  describe('getReview', () => {
    /**
     * Test: should return review data when the request is successful.
     */
    it('should return review data when successful', async () => {
      const chatId = '123';
      const mockReview = {
        id: chatId,
        feedback: 'Great interview performance',
        score: 85
      };

      mock.onGet(`/review/review/${chatId}`).reply(200, mockReview);

      const result = await getReview(chatId);
      expect(result).toEqual(mockReview);
    });

    /**
     * Test: should throw error when the request fails.
     */
    it('should throw error when request fails', async () => {
      const chatId = '123';
      mock.onGet(`/review/review/${chatId}`).reply(500);

      await expect(getReview(chatId)).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `createReview` function.
   */
  describe('createReview', () => {
    /**
     * Test: should create review successfully.
     */
    it('should create review successfully', async () => {
      const chatId = '123';
      const mockResponse = {
        message: 'Review created successfully',
        reviewId: '456'
      };

      mock.onPost('/review/createReview', { chatId }).reply(200, mockResponse);

      const result = await createReview(chatId);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test: should throw error when creation fails.
     */
    it('should throw error when creation fails', async () => {
      const chatId = '123';
      mock.onPost('/review/createReview', { chatId }).reply(400);

      await expect(createReview(chatId)).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `deleteInterview` function.
   */
  describe('deleteInterview', () => {
    /**
     * Test: should delete interview successfully.
     */
    it('should delete interview successfully', async () => {
      const chatId = '123';
      const mockResponse = { message: 'Interview deleted successfully' };

      mock.onDelete(`/review/delete/${chatId}`).reply(200, mockResponse);

      const result = await deleteInterview(chatId);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test: should throw error when deletion fails.
     */
    it('should throw error when deletion fails', async () => {
      const chatId = '123';
      mock.onDelete(`/review/delete/${chatId}`).reply(404);

      await expect(deleteInterview(chatId)).rejects.toThrow();
    });
  });
}); 