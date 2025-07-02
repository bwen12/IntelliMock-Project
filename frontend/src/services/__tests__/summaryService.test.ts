/**
 * @fileoverview Unit tests for the `summaryService` module.
 * 
 * This file contains tests for the summary-related service functions, such as:
 * - `getUserChats`: Retrieves the list of user chats.
 * - `getSummary`: Retrieves the summary of a specific chat.
 * - `createSummary`: Creates a summary for a specific chat.
 * 
 * Mock API responses are set up using `axios-mock-adapter` to simulate the backend API calls.
 * The tests ensure that each service function handles both successful and failed requests
 * and correctly returns or throws expected values.
 */

import MockAdapter from 'axios-mock-adapter';
import api from '@/lib/api';
import { getUserChats, getSummary, createSummary } from '../summaryService';

const mock = new MockAdapter(api);

describe('summaryService', () => {
  // Reset the mock API before each test
  beforeEach(() => {
    mock.reset();
  });

  /**
   * Test suite for the `getUserChats` function.
   */
  describe('getUserChats', () => {
    /**
     * Test: should return user chats successfully.
     */
    it('should return user chats successfully', async () => {
      const mockChats = [
        {
          id: '123',
          chatName: 'Interview 1',
          companyName: 'Company A',
          jobTitle: 'Software Engineer'
        },
        {
          id: '456',
          chatName: 'Interview 2',
          companyName: 'Company B',
          jobTitle: 'Product Manager'
        }
      ];

      mock.onGet('/openai/chats').reply(200, mockChats);

      const result = await getUserChats();
      expect(result).toEqual(mockChats);
    });

    /**
     * Test: should throw error when the request fails.
     */
    it('should throw error when request fails', async () => {
      mock.onGet('/openai/chats').reply(500);

      await expect(getUserChats()).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `getSummary` function.
   */
  describe('getSummary', () => {
    /**
     * Test: should return summary successfully.
     */
    it('should return summary successfully', async () => {
      const chatId = '123';
      const mockSummary = {
        id: chatId,
        strengths: ['Good communication', 'Technical knowledge'],
        weaknesses: ['Could improve on system design'],
        overallScore: 85
      };

      mock.onGet(`/review/summary/${chatId}`).reply(200, mockSummary);

      const result = await getSummary(chatId);
      expect(result).toEqual(mockSummary);
    });

    /**
     * Test: should throw error when the request fails.
     */
    it('should throw error when request fails', async () => {
      const chatId = '123';
      mock.onGet(`/review/summary/${chatId}`).reply(404);

      await expect(getSummary(chatId)).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `createSummary` function.
   */
  describe('createSummary', () => {
    /**
     * Test: should create summary successfully.
     */
    it('should create summary successfully', async () => {
      const chatId = '123';
      const mockResponse = {
        message: 'Summary created successfully',
        summaryId: '789'
      };

      mock.onPost('/review/createSummary', { chatId }).reply(200, mockResponse);

      const result = await createSummary(chatId);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test: should throw error when creation fails.
     */
    it('should throw error when creation fails', async () => {
      const chatId = '123';
      mock.onPost('/review/createSummary', { chatId }).reply(400);

      await expect(createSummary(chatId)).rejects.toThrow();
    });
  });
}); 