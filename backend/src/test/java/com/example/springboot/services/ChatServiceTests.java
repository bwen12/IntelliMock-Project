package com.example.springboot.services;

import com.example.springboot.models.Chat;
import com.example.springboot.models.Message;
import com.example.springboot.models.User;
import com.example.springboot.repositories.ChatRepository;
import com.example.springboot.repositories.MessageRepository;
import com.example.springboot.repositories.UserRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link ChatService}.
 * 
 * This test class verifies the core functionalities of the ChatService, including:
 * <ul>
 *   <li>Creating chat sessions and verifying user existence</li>
 *   <li>Checking for duplicate chat names</li>
 *   <li>Generating AI-driven responses and message storage</li>
 *   <li>Retrieving user chats and chat messages</li>
 *   <li>Handling interview session flow including AI conclusion</li>
 *   <li>Updating session elapsed time</li>
 * </ul>
 * 
 * External dependencies such as {@link UserRepository}, {@link ChatRepository},
 * {@link MessageRepository}, and {@link ChatLanguageModel} are mocked using Mockito.
 */
@SpringBootTest
class ChatServiceTests {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ChatRepository chatRepository;
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private ChatLanguageModel chatLanguageModel;

    @InjectMocks
    private ChatService chatService;

    private final String email = "test@example.com";
    private final String chatId = "chat-123";

    private Chat chat;
    private Message message;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail(email);
        chat = new Chat("Test Chat", "Company", email, "Engineer", "CV", "JD");
        chat.setId(chatId);
        message = new Message(chatId, email, "Hi", "User", 1, false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
    }

    /**
     * Verifies that chatNameExists returns true if a chat with the same name exists for the user.
     */
    @Test
    void testChatNameExists_WhenExists() {
        when(chatRepository.findByEmailAndChatName(email, "Test Chat")).thenReturn(Optional.of(chat));
        assertTrue(chatService.chatNameExists(email, "Test Chat"));
    }

    /**
     * Verifies that chatNameExists returns false if the chat name is not found for the user.
     */
    @Test
    void testChatNameExists_WhenNotExists() {
        when(chatRepository.findByEmailAndChatName(email, "Unknown")).thenReturn(Optional.empty());
        assertFalse(chatService.chatNameExists(email, "Unknown"));
    }

    /**
     * Tests successful creation of a new chat session with an initial AI message.
     */
    @Test
    void testCreateChat_Success() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(chatRepository.save(any(Chat.class))).thenReturn(chat);
        when(chatLanguageModel.generate(anyString())).thenReturn("Welcome!");
        Chat result = chatService.createChat(email, chat);
        assertNotNull(result);
        verify(chatRepository).save(any(Chat.class));
        verify(messageRepository).save(any(Message.class));
    }

    /**
     * Verifies that createChat throws a RuntimeException when the user is not found.
     */
    @Test
    void testCreateChat_UserNotFound() {
        when(userRepository.findByEmail(email)).thenReturn(null);
        RuntimeException e = assertThrows(RuntimeException.class, () -> chatService.createChat(email, chat));
        assertEquals("User does not exist.", e.getMessage());
    }

    /**
     * Tests retrieval of all chat sessions associated with a user.
     */
    @Test
    void testGetUserChats() {
        when(chatRepository.findByEmail(email)).thenReturn(List.of(chat));
        List<Chat> chats = chatService.getUserChats(email);
        assertEquals(1, chats.size());
    }

    /**
     * Tests retrieval of all messages in a chat session ordered by timestamp.
     */
    @Test
    void testGetChatMessages() {
        when(messageRepository.findByChatIdOrderByCreatedDateAsc(chatId)).thenReturn(List.of(message));
        List<Message> messages = chatService.getChatMessages(chatId);
        assertEquals(1, messages.size());
    }

    /**
     * Tests sending a message when the AI responds with continuation (isEnd = false).
     */
    @Test
    void testSendMessage_NormalFlow() {
        when(chatRepository.findById(chatId)).thenReturn(Optional.of(chat));
        when(messageRepository.findByChatIdOrderByCreatedDateAsc(chatId)).thenReturn(List.of(message));
        when(messageRepository.countByChatId(chatId)).thenReturn(1);
        when(chatLanguageModel.generate(anyString())).thenReturn("Sure! isEnd = false");

        String response = chatService.sendMessage(message);
        assertTrue(response.contains("Sure!"));
        verify(messageRepository, times(2)).save(any(Message.class));
    }

    /**
     * Tests sending a message when the AI indicates the interview should end (isEnd = true).
     */
    @Test
    void testSendMessage_EndDetected() {
        when(chatRepository.findById(chatId)).thenReturn(Optional.of(chat));
        when(messageRepository.findByChatIdOrderByCreatedDateAsc(chatId)).thenReturn(List.of(message));
        when(messageRepository.countByChatId(chatId)).thenReturn(1);
        when(chatLanguageModel.generate(anyString())).thenReturn("Final answer. isEnd = true");

        String response = chatService.sendMessage(message);
        assertTrue(response.contains("Final answer."));
        verify(messageRepository, times(2)).save(any(Message.class));
    }

    /**
     * Verifies that sendMessage throws an exception if the chat does not exist.
     */
    @Test
    void testSendMessage_ChatNotFound() {
        when(chatRepository.findById(chatId)).thenReturn(Optional.empty());
        RuntimeException e = assertThrows(RuntimeException.class, () -> chatService.sendMessage(message));
        assertEquals("Chat not found.", e.getMessage());
    }

    /**
     * Tests updating the total elapsed time of a chat session.
     */
    @Test
    void testUpdateElapsedTime() {
        when(chatRepository.findById(chatId)).thenReturn(Optional.of(chat));
        chatService.updateElapsedTime(chatId, 5000L);
        verify(chatRepository).save(chat);
        assertEquals(5000L, chat.getTimeElapsed());
    }
}