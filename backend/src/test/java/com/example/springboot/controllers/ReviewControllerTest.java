package com.example.springboot.controllers;

import com.example.springboot.context.TestSecurityConfig;
import com.example.springboot.models.Review;
import com.example.springboot.models.Summary;
import com.example.springboot.services.JwtService;
import com.example.springboot.services.ReviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import java.util.Map;

import static org.mockito.Mockito.reset;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration-level tests for {@link ReviewController}, focusing on HTTP request
 * and response validation. All dependencies are mocked.
 */
@WebMvcTest(ReviewController.class)
@Import({ ReviewControllerTest.MockConfig.class, TestSecurityConfig.class })
class ReviewControllerTest {

    @TestConfiguration
    static class MockConfig {
        @Bean
        public ReviewService reviewService() {
            return Mockito.mock(ReviewService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }
    }

    @org.springframework.beans.factory.annotation.Autowired
    private ReviewService reviewService;

    @org.springframework.beans.factory.annotation.Autowired
    private JwtService jwtService;

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @org.springframework.beans.factory.annotation.Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        reset(reviewService, jwtService);
    }

    /**
     * Verifies that /review/createSummary returns 200 OK and a summary object.
     */
    @Test
    void createSummary_ShouldReturnOk() throws Exception {
        Summary summary = new Summary();
        summary.setChatId("chat123");
        summary.setEmail("test@example.com");
        summary.setSummary("Great job overall");
        summary.setScore(8);

        Mockito.when(jwtService.extractUserEmail("valid-token")).thenReturn("test@example.com");
        Mockito.when(reviewService.createSummary("test@example.com", "chat123")).thenReturn(summary);

        mockMvc.perform(post("/review/createSummary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("chatId", "chat123")))
                        .cookie(new Cookie("accessToken", "valid-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary").value("Great job overall"))
                .andExpect(jsonPath("$.score").value(8));
    }

    /**
     * Verifies that /review/createReview returns 200 OK and a review object.
     */
    @Test
    void createReview_ShouldReturnOk() throws Exception {
        Review review = new Review();
        review.setChatId("chat123");
        review.setEmail("test@example.com");

        Mockito.when(jwtService.extractUserEmail("valid-token")).thenReturn("test@example.com");
        Mockito.when(reviewService.createReview("test@example.com", "chat123")).thenReturn(review);

        mockMvc.perform(post("/review/createReview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("chatId", "chat123")))
                        .cookie(new Cookie("accessToken", "valid-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chatId").value("chat123"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    /**
     * Verifies that /review/summary/{chatId} returns 200 OK with the summary.
     */
    @Test
    void getSummary_ShouldReturnOk() throws Exception {
        Summary summary = new Summary();
        summary.setChatId("chat123");
        summary.setSummary("Excellent performance");
        summary.setScore(9);

        Mockito.when(reviewService.getSummary("chat123")).thenReturn(summary);

        mockMvc.perform(get("/review/summary/chat123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary").value("Excellent performance"))
                .andExpect(jsonPath("$.score").value(9));
    }

    /**
     * Verifies that /review/review/{chatId} returns 200 OK with the review.
     */
    @Test
    void getReview_ShouldReturnOk() throws Exception {
        Review review = new Review();
        review.setChatId("chat123");
        review.setEmail("test@example.com");

        Mockito.when(reviewService.getReview("chat123")).thenReturn(review);

        mockMvc.perform(get("/review/review/chat123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chatId").value("chat123"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    /**
     * Verifies that /review/delete/{chatId} returns 200 OK on successful deletion.
     */
    @Test
    void deleteInterview_ShouldReturnOk() throws Exception {
        Mockito.when(jwtService.extractUserEmail("valid-token")).thenReturn("test@example.com");

        mockMvc.perform(delete("/review/delete/chat123")
                        .cookie(new Cookie("accessToken", "valid-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Interview session deleted successfully."));
    }
}
