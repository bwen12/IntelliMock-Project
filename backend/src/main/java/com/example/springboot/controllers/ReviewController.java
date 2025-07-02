package com.example.springboot.controllers;

import com.example.springboot.models.Summary;
import com.example.springboot.models.Review;
import com.example.springboot.services.ReviewService;
import com.example.springboot.utils.ApiResponseBuilder;
import com.example.springboot.services.JwtService;
import org.springframework.http.HttpStatus;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller that handles review-related endpoints for creating summaries,
 * reviews, fetching them, and deleting interview sessions.
 */
@RestController
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtService jwtService;

    /**
     * Constructs a ReviewController with required services.
     *
     * @param reviewService the service handling review and summary logic
     * @param jwtService the service for JWT token validation and email extraction
     */
    public ReviewController(ReviewService reviewService, JwtService jwtService) {
        this.reviewService = reviewService;
        this.jwtService = jwtService;
    }

    /**
     * Creates a summary for a specific chat session.
     *
     * @param token the JWT token from the accessToken cookie
     * @param payload a map containing the chatId for the chat session
     * @return ResponseEntity with the generated summary or error
     */
    @PostMapping("/createSummary")
    public ResponseEntity<?> createSummary(@CookieValue(value = "accessToken", defaultValue = "") String token,
            @RequestBody Map<String, String> payload) {
        try {
            // Extract chatId and email from the payload and token
            String chatId = payload.get("chatId");
            String email = jwtService.extractUserEmail(token);
            
            // Generate the summary for the chat session
            Summary summary = reviewService.createSummary(email, chatId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Summary generation failed.");
        }
    }

    /**
     * Creates a review for a specific chat session.
     *
     * @param token the JWT token from the accessToken cookie
     * @param payload a map containing the chatId for the chat session
     * @return ResponseEntity with the generated review or error
     */
    @PostMapping("/createReview")
    public ResponseEntity<?> createReview(@CookieValue(value = "accessToken", defaultValue = "") String token,
            @RequestBody Map<String, String> payload) {

        try {
            // Extract chatId and email from the payload and token
            String chatId = payload.get("chatId");
            String email = jwtService.extractUserEmail(token);
            
            // Generate the review for the chat session
            Review review = reviewService.createReview(email, chatId);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Review generation failed.");
        }
    }

    /**
     * Retrieves the summary for a specific chat session.
     *
     * @param chatId the ID of the chat session
     * @return ResponseEntity with the summary or error
     */
    @GetMapping("/summary/{chatId}")
    public ResponseEntity<?> getSummary(@PathVariable String chatId) {
        return ResponseEntity.ok(reviewService.getSummary(chatId));
    }

    /**
     * Retrieves the review for a specific chat session.
     *
     * @param chatId the ID of the chat session
     * @return ResponseEntity with the review or error
     */
    @GetMapping("/review/{chatId}")
    public ResponseEntity<?> getReview(@PathVariable String chatId) {
        return ResponseEntity.ok(reviewService.getReview(chatId));
    }

    /**
     * Deletes a specific interview session associated with a chat.
     *
     * @param token the JWT token from the accessToken cookie
     * @param chatId the ID of the chat session to delete
     * @return ResponseEntity indicating success or failure of deletion
     */
    @DeleteMapping("/delete/{chatId}")
    public ResponseEntity<?> deleteInterview(
            @CookieValue(value = "accessToken", defaultValue = "") String token,
            @PathVariable String chatId) {
        try {
            String email = jwtService.extractUserEmail(token);
            reviewService.deleteInterviewSession(email, chatId);
            return ApiResponseBuilder.build(HttpStatus.OK, "Interview session deleted successfully.");
        } catch (Exception e) {
            return ApiResponseBuilder.build(HttpStatus.BAD_REQUEST, "Could not delete interview: " + e.getMessage());
        }
    }

}
