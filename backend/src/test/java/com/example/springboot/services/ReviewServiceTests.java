package com.example.springboot.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.springboot.models.Chat;
import com.example.springboot.models.Message;
import com.example.springboot.models.Review;
import com.example.springboot.models.Summary;
import com.example.springboot.repositories.ChatRepository;
import com.example.springboot.repositories.MessageRepository;
import com.example.springboot.repositories.ReviewRepository;
import com.example.springboot.repositories.SummaryRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;

/**
 * Unit tests for the ReviewService class.
 * This class contains various test cases to verify the functionality of the
 * ReviewService methods.
 * It uses Mockito to mock dependencies and JUnit for assertions.
 * 
 */
@SpringBootTest
class ReviewServiceTests {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private SummaryRepository summaryRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private ChatLanguageModel llm;

    @InjectMocks
    private ReviewService reviewService;

    private Chat mockChat;
    private Message mockMessage;
    private Review mockReview;
    private Summary mockSummary;
    private String testEmail = "test@example.com";
    private String testChatId = "test-chat-id";

    /**
     * Sets up the test environment by initializing mock objects and their expected
     * behavior.
     * This method is called before each test case.
     * It initializes mockChat, mockMessage, mockReview, and mockSummary with test
     * data.
     */
    @BeforeEach
    void setUp() {
        // Initialize mock chat
        mockChat = new Chat(
                "Test Chat",
                "Test Company",
                testEmail,
                "Software Engineer",
                "Test CV",
                "Test Job Description");
        mockChat.setId(testChatId);

        // Initialize mock message
        mockMessage = new Message(
                testChatId,
                testEmail,
                "Test answer",
                "User",
                1,
                false);

        // Initialize mock review
        mockReview = new Review();
        mockReview.setChatId(testChatId);
        mockReview.setEmail(testEmail);
        List<Review.QuestionReview> reviews = Arrays.asList(new Review.QuestionReview());
        mockReview.setReviews(reviews);

        // Initialize mock summary
        mockSummary = new Summary();
        mockSummary.setChatId(testChatId);
        mockSummary.setEmail(testEmail);
        mockSummary.setSummary("Test summary");
        mockSummary.setScore(8);
    }

    /**
     * Tests the createSummary method of the ReviewService class.
     * It verifies that the summary is created successfully and saved to the
     * repository.
     */
    @Test
    void testCreateSummary() {
        // Arrange
        when(chatRepository.findById(testChatId)).thenReturn(Optional.of(mockChat));
        when(messageRepository.findByChatIdOrderByCreatedDateAsc(testChatId))
                .thenReturn(Arrays.asList(mockMessage));
        when(llm.generate(any(String.class))).thenReturn("Test summary\n\nScore: 8");
        when(summaryRepository.save(any(Summary.class))).thenReturn(mockSummary);

        // Act
        Summary result = reviewService.createSummary(testEmail, testChatId);

        // Assert
        assertNotNull(result);
        assertEquals(testChatId, result.getChatId());
        assertEquals(testEmail, result.getEmail());
        verify(summaryRepository).save(any(Summary.class));
    }

    /**
     * Tests the createReview method of the ReviewService class.
     * It verifies that the review is created successfully and saved to the
     * repository.
     */
    @Test
    void testCreateReview() {
        // Arrange
        when(chatRepository.findById(testChatId)).thenReturn(Optional.of(mockChat));
        when(messageRepository.findByChatIdOrderByCreatedDateAsc(testChatId))
                .thenReturn(Arrays.asList(mockMessage));
        when(llm.generate(any(String.class)))
                .thenReturn("STRENGTHS:\nGood\n\nWEAKNESSES:\nNone\n\nEXEMPLAR:\nBetter\n\nRATING:\n8");
        when(reviewRepository.save(any(Review.class))).thenReturn(mockReview);

        // Act
        Review result = reviewService.createReview(testEmail, testChatId);

        // Assert
        assertNotNull(result);
        assertEquals(testChatId, result.getChatId());
        assertEquals(testEmail, result.getEmail());
        verify(reviewRepository).save(any(Review.class));
    }

    /**
     * Tests the getChat method of the ReviewService class.
     * It verifies that the chat is retrieved successfully from the repository.
     */
    @Test
    void testGetSummary() {
        // Arrange
        when(summaryRepository.findByChatId(testChatId)).thenReturn(mockSummary);

        // Act
        Summary result = reviewService.getSummary(testChatId);

        // Assert
        assertNotNull(result);
        assertEquals(testChatId, result.getChatId());
        assertEquals(testEmail, result.getEmail());
        verify(summaryRepository).findByChatId(testChatId);
    }

    /**
     * Tests the getSummary method of the ReviewService class.
     * It verifies that an exception is thrown when the summary is not found.
     */
    @Test
    void testGetSummary_NotFound() {
        // Arrange
        when(summaryRepository.findByChatId(testChatId)).thenReturn(null);

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            reviewService.getSummary(testChatId);
        });
        assertEquals("Summary not found", exception.getMessage());
    }

    /**
     * Tests the getReview method of the ReviewService class.
     * It verifies that the review is retrieved successfully from the repository.
     */
    @Test
    void testGetReview() {
        // Arrange
        when(reviewRepository.findByChatId(testChatId)).thenReturn(mockReview);

        // Act
        Review result = reviewService.getReview(testChatId);

        // Assert
        assertNotNull(result);
        assertEquals(testChatId, result.getChatId());
        assertEquals(testEmail, result.getEmail());
        verify(reviewRepository).findByChatId(testChatId);
    }

    /**
     * Tests the getReview method of the ReviewService class.
     * It verifies that an exception is thrown when the review is not found.
     */
    @Test
    void testGetReview_NotFound() {
        // Arrange
        when(reviewRepository.findByChatId(testChatId)).thenReturn(null);

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            reviewService.getReview(testChatId);
        });
        assertEquals("Review not found", exception.getMessage());
    }

    /**
     * Tests the getAllReviews method of the ReviewService class.
     * It verifies that all reviews are retrieved successfully from the repository.
     */
    @Test
    void testDeleteInterviewSession() {
        // Act
        reviewService.deleteInterviewSession(testEmail, testChatId);

        // Assert
        verify(summaryRepository).deleteByChatIdAndEmail(testChatId, testEmail);
        verify(reviewRepository).deleteByChatIdAndEmail(testChatId, testEmail);
        verify(chatRepository).deleteByIdAndEmail(testChatId, testEmail);
        verify(messageRepository).deleteByChatIdAndEmail(testChatId, testEmail);
    }

    /**
     * Tests the createSummary method when no user answers are present in the chat.
     * Verifies that the default summary and score of 0 are returned.
     */
    @Test
    void testCreateSummary_WithNoUserAnswers() {
        when(chatRepository.findById(testChatId)).thenReturn(Optional.of(mockChat));
        when(messageRepository.findByChatIdOrderByCreatedDateAsc(testChatId)).thenReturn(List.of(mockMessage));
        when(messageRepository.countByChatId(testChatId)).thenReturn(1);
        when(summaryRepository.save(any(Summary.class))).thenAnswer(inv -> inv.getArgument(0));

        Summary result = reviewService.createSummary(testEmail, testChatId);

        assertEquals("The candidate did not provide any responses in the interview, so no evaluation can be made.",
                result.getSummary());
        assertEquals(0, result.getScore());
    }

    /**
     * Tests the createReview method with multiple question/answer pairs.
     * Verifies that each question is reviewed separately and included in the
     * result.
     */
    @Test
    void testCreateReview_WithMultipleQuestions() {
        Message q1 = new Message(testChatId, testEmail, "Tell me about yourself", "Interviewer", 1, false);
        Message a1 = new Message(testChatId, testEmail, "I'm a software engineer", "User", 2, false);
        Message q2 = new Message(testChatId, testEmail, "Why our company?", "Interviewer", 3, false);
        Message a2 = new Message(testChatId, testEmail, "Because I love your culture", "User", 4, false);

        List<Message> messages = List.of(q1, a1, q2, a2);
        when(chatRepository.findById(testChatId)).thenReturn(Optional.of(mockChat));
        when(messageRepository.findByChatIdOrderByCreatedDateAsc(testChatId)).thenReturn(messages);
        when(llm.generate(any(String.class))).thenReturn(
                "STRENGTHS:\nClear answer\n\nWEAKNESSES:\nLacks depth\n\nEXEMPLAR:\nA better one\n\nRATING:\n6");

        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        Review result = reviewService.createReview(testEmail, testChatId);

        assertEquals(2, result.getReviews().size());
        assertEquals("Tell me about yourself", result.getReviews().get(0).getQuestion());
        assertEquals("Why our company?", result.getReviews().get(1).getQuestion());
    }

    /**
     * Tests the createSummary method with a malformed score response from the LLM.
     * Ensures that the fallback score (0) is applied when parsing fails.
     */
    @Test
    void testCreateSummary_WithMalformedScore() {
        when(chatRepository.findById(testChatId)).thenReturn(Optional.of(mockChat));
        when(messageRepository.findByChatIdOrderByCreatedDateAsc(testChatId))
                .thenReturn(List.of(mockMessage, mockMessage));
        when(messageRepository.countByChatId(testChatId)).thenReturn(2);
        when(llm.generate(anyString())).thenReturn("Summary only. No score line");
        when(summaryRepository.save(any(Summary.class))).thenAnswer(inv -> inv.getArgument(0));

        Summary result = reviewService.createSummary(testEmail, testChatId);

        assertEquals(0, result.getScore());
    }

}