package com.example.springboot;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import com.example.springboot.services.ChatService;
import com.example.springboot.services.JwtService;

import dev.langchain4j.model.chat.ChatLanguageModel;

import com.example.springboot.models.User;
import com.example.springboot.models.Message;

import com.example.springboot.repositories.ChatRepository;
import com.example.springboot.repositories.MessageRepository;
import com.example.springboot.repositories.ReviewRepository;
import com.example.springboot.repositories.SummaryRepository;
import com.example.springboot.repositories.UserRepository;
import com.example.springboot.models.Chat;
import com.example.springboot.services.ReviewService;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the ChatService class.
 * This class contains various test cases to verify the functionality of the ChatService methods.
 * It uses Mockito to mock dependencies and JUnit for assertions.
 * 
 */
@SpringBootTest
class SpringbootApplicationTests {

    @Mock
	private ChatRepository chatRepository;
	
	@Mock
	private UserRepository userRepository;
	
	@Mock
	private MessageRepository messageRepository;
	
	@Mock
	private JwtService jwtService;
	
	@Mock
	private ChatLanguageModel chatLanguageModel;

	@Mock
	private SummaryRepository summaryRepository;

	@Mock
	private ReviewRepository reviewRepository;

	@InjectMocks
	private ChatService chatService;

	@Mock
	private ReviewService reviewService;


	private Chat mockChat;
	private User mockUser;
	private Message mockMessage;
	private String testEmail = "test@example.com";
	private String testChatName = "Test Chat";

	/**
	 * Initializes the test data and mocks before each test case.
	 */
    @BeforeEach
	void setUp() {
		// Initialize test data
		mockChat = new Chat(
			testChatName,
			"Test Company",
			testEmail,
			"Software Engineer",
			"Test CV",
			"Test Job Description"
		);

		mockUser = new User();
		mockUser.setEmail(testEmail);
        mockMessage = new Message(
            mockChat.getId(),
            testEmail,
            "Test message",
            "User",
            1,
            false
        );

	}

	/**
	 * Tests the chatNameExists method of the ChatService class.
	 * This test verifies that the method correctly checks if a chat name exists for a given email.
	 */
    @Test
    void testChatNameExists() {
        // Arrange
        when(chatRepository.findByEmailAndChatName(testEmail, testChatName))
            .thenReturn(Optional.of(mockChat));
        when(chatRepository.findByEmailAndChatName(testEmail, "NonExistentChat"))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertTrue(chatService.chatNameExists(testEmail, testChatName),
            "Should return true for existing chat");
        assertFalse(chatService.chatNameExists(testEmail, "NonExistentChat"),
            "Should return false for non-existent chat");

        // Verify the repository was called with correct parameters
        verify(chatRepository, times(1))
            .findByEmailAndChatName(testEmail, testChatName);
        verify(chatRepository, times(1))
            .findByEmailAndChatName(testEmail, "NonExistentChat");
    }

	/**
	 * Tests the createChat method of the ChatService class.
	 * This test verifies that a new chat is created successfully when the user exists.
	 */
	@Test
	void testCreateChat_Success() {
		// Arrange
		when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(mockUser));
		when(chatRepository.save(any(Chat.class))).thenReturn(mockChat);
		when(chatLanguageModel.generate(any(String.class))).thenReturn("Welcome message");
		when(messageRepository.save(any(Message.class))).thenReturn(mockMessage);

		// Act
		Chat result = chatService.createChat(testEmail, mockChat);

		// Assert
		assertNotNull(result);
		assertEquals(testEmail, result.getEmail());
		verify(chatRepository).save(any(Chat.class));
		verify(messageRepository).save(any(Message.class));
	}


	/**
	 * Tests the createChat method of the ChatService class when the user does not exist.
	 * This test verifies that an exception is thrown when trying to create a chat for a non-existent user.
	 */
	@Test
	void testGetUserChats() {
		// Arrange
		List<Chat> mockChats = Arrays.asList(mockChat);
		when(chatRepository.findByEmail(testEmail)).thenReturn(mockChats);

		// Act
		List<Chat> result = chatService.getUserChats(testEmail);

		// Assert
		assertNotNull(result);
		assertEquals(1, result.size());
		assertEquals(testChatName, result.get(0).getChatName());
		verify(chatRepository).findByEmail(testEmail);
	}


	/**
	 * Tests the getChatMessages method of the ChatService class.
	 * This test verifies that the messages for a specific chat are retrieved successfully.
	 */
	@Test
	void testGetChatMessages() {
		// Arrange
		List<Message> mockMessages = Arrays.asList(mockMessage);
		when(messageRepository.findByChatIdOrderByCreatedDateAsc(mockChat.getId()))
			.thenReturn(mockMessages);

		// Act
		List<Message> result = chatService.getChatMessages(mockChat.getId());

		// Assert
		assertNotNull(result);
		assertEquals(1, result.size());
		assertEquals(testEmail, result.get(0).getEmail());
		verify(messageRepository).findByChatIdOrderByCreatedDateAsc(mockChat.getId());
	}

	/**
	 * Tests the updateElapsedTime method of the ChatService class.
	 * This test verifies that the elapsed time for a chat is updated successfully.
	 */
	@Test
	void testUpdateElapsedTime() {
		// Arrange
		long elapsedTime = 1000L;
		when(chatRepository.findById(mockChat.getId())).thenReturn(Optional.of(mockChat));
		when(chatRepository.save(any(Chat.class))).thenReturn(mockChat);

		// Act
		chatService.updateElapsedTime(mockChat.getId(), elapsedTime);

		// Assert
		verify(chatRepository).findById(mockChat.getId());
		verify(chatRepository).save(mockChat);
		assertEquals(elapsedTime, mockChat.getTimeElapsed());
	}

	/**
	 * Tests the deleteChat method of the ChatService class.
	 * This test verifies that a chat is deleted successfully.
	 */
	@Test
	void testSendMessage() {
		// Arrange
		when(chatRepository.findById(mockChat.getId())).thenReturn(Optional.of(mockChat));
		when(messageRepository.countByChatId(mockChat.getId())).thenReturn(1);
		when(chatLanguageModel.generate(any(String.class))).thenReturn("AI response");
		when(messageRepository.save(any(Message.class))).thenReturn(mockMessage);

		// Act
		String result = chatService.sendMessage(mockMessage);

		// Assert
		assertNotNull(result);
		verify(messageRepository, times(2)).save(any(Message.class));
		verify(chatLanguageModel).generate(any(String.class));
	}

	/**
	 * Tests the deleteChat method of the ChatService class.
	 * This test verifies that a chat is deleted successfully.
	 */
	@Test
	void testCreateChat_UserNotFound() {
		// Arrange
		when(userRepository.findByEmail(testEmail)).thenReturn(null);

		// Act & Assert
		Exception exception = assertThrows(RuntimeException.class, () -> {
			chatService.createChat(testEmail, mockChat);
		});
		assertEquals("User does not exist.", exception.getMessage());
	}

}