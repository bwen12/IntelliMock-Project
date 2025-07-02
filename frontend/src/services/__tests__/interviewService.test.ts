/**
 * @fileoverview Unit tests for the `interviewService` module.
 * 
 * This file contains tests for the interview-related service functions, such as:
 * - `createChatSession`: Creates a new chat session for an interview.
 * - `getChatMessages`: Retrieves messages from a specific chat session.
 * - `sendMessage`: Sends a message to a specific chat session.
 * 
 * Mock API responses are set up using `axios-mock-adapter` to simulate the backend API calls.
 * The tests ensure that each service function handles both successful and failed requests
 * and correctly returns or throws expected values.
 */

import MockAdapter from 'axios-mock-adapter';
import api from '@/lib/api';
import { createChatSession, getChatMessages, sendMessage } from '../interviewService';
import { ChatMessage } from '@/types/interview';

const mock = new MockAdapter(api);

describe('interviewService', () => {
  // Reset the mock API before each test
  beforeEach(() => {
    mock.reset();
  });

  /**
   * Test suite for the `createChatSession` function.
   */
  describe('createChatSession', () => {
    /**
     * Test: should create chat session successfully.
     */
    it('should create chat session successfully', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('chatName', 'Test Interview');
      formData.append('companyName', 'Test Company');
      formData.append('jobTitle', 'Software Engineer');
      formData.append('jobDescription', 'Test job description');
      formData.append('context', 'Test context');
      formData.append('cv', new Blob(['test cv content']));

      const mockResponse = {
        data: {
          id: '123',
          email: 'test@example.com',
          chatName: 'Test Interview',
          companyName: 'Test Company',
          jobTitle: 'Software Engineer',
          jobDescription: 'Test job description',
          context: 'Test context',
          cv: 'test cv content'
        }
      };

      mock.onPost('/openai/createChat').reply(200, mockResponse);

      const result = await createChatSession(formData);
      expect(result).toEqual(mockResponse.data);
    });

    /**
     * Test: should throw error when creation fails.
     */
    it('should throw error when creation fails', async () => {
      const formData = new FormData();
      mock.onPost('/openai/createChat').reply(400);

      await expect(createChatSession(formData)).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `getChatMessages` function.
   */
  describe('getChatMessages', () => {
    /**
     * Test: should return chat messages successfully.
     */
    it('should return chat messages successfully', async () => {
      const chatId = '123';
      const mockMessages: ChatMessage[] = [
        { chatId, email: 'test@example.com', message: 'Hello', role: 'user' },
        { chatId, email: 'test@example.com', message: 'Hi there!', role: 'interviewer' }
      ];

      mock.onGet(`/openai/messages/${chatId}`).reply(200, {
        data: { messages: mockMessages }
      });

      const result = await getChatMessages(chatId);
      expect(result).toEqual(mockMessages);
    });

    /**
     * Test: should throw error when the request fails.
     */
    it('should throw error when request fails', async () => {
      const chatId = '123';
      mock.onGet(`/openai/messages/${chatId}`).reply(500);

      await expect(getChatMessages(chatId)).rejects.toThrow();
    });
  });

  /**
   * Test suite for the `sendMessage` function.
   */
  describe('sendMessage', () => {
    /**
     * Test: should send message successfully.
     */
    it('should send message successfully', async () => {
      const message: ChatMessage = {
        chatId: '123',
        email: 'test@example.com',
        message: 'Test message',
        role: 'user'
      };
      const mockResponse = { data: 'Response message' };
      mock.onPost('/openai/sendMessage', message).reply(200, mockResponse);

      const result = await sendMessage(message);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test: should throw error when sending fails.
     */
    it('should throw error when sending fails', async () => {
      const message: ChatMessage = {
        chatId: '123',
        email: 'test@example.com',
        message: 'Hello',
        role: 'user'
      };
      mock.onPost('/openai/sendMessage', message).reply(400);

      await expect(sendMessage(message)).rejects.toThrow();
    });
  });
}); 