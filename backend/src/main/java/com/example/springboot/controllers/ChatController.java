package com.example.springboot.controllers;

import com.example.springboot.models.Chat;
import com.example.springboot.models.Message;
import com.example.springboot.services.ChatService;
import com.example.springboot.services.JwtService;
import com.example.springboot.utils.ApiResponseBuilder;
import com.example.springboot.utils.PdfToTextUtils;

import com.example.springboot.models.MessageResponseDTO;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller that handles chat-related endpoints for creating chats,
 * sending and retrieving messages, and managing chat metadata like elapsed time.
 */
@RestController
@RequestMapping("/openai")
public class ChatController {

    private final ChatService chatService;
    private final JwtService jwtService;

    /**
     * Constructs a ChatController with required services.
     *
     * @param chatService the service handling chat logic
     * @param jwtService the service for JWT token validation and email extraction
     */
    public ChatController(ChatService chatService, JwtService jwtService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
    }

    /**
     * Creates a new chat session with a job description, CV file, and optional context.
     *
     * @param token the JWT token from the accessToken cookie
     * @param chatName the name of the chat session
     * @param companyName the company related to the job application
     * @param jobTitle the title of the job
     * @param jobDescription the job description text
     * @param context optional context to guide the conversation
     * @param cvFile the user's CV uploaded as a PDF file
     * @return ResponseEntity with chat creation result or error
     */
    @PostMapping(value = "/createChat", consumes = { "multipart/form-data" })
    public ResponseEntity<?> createChat(
            @CookieValue(value = "accessToken", defaultValue = "") String token,
            @RequestPart("chatName") String chatName,
            @RequestPart("companyName") String companyName,
            @RequestPart("jobTitle") String jobTitle,
            @RequestPart("jobDescription") String jobDescription,
            @RequestPart(value = "context", required = false) String context,
            @RequestPart("cv") MultipartFile cvFile) {
        try {
            String email = jwtService.extractUserEmail(token);
            if (chatService.chatNameExists(email, chatName)) {
                               return ApiResponseBuilder.build(HttpStatus.BAD_REQUEST, "A Chat Session with that Name already exists");

            }

            String cvText = PdfToTextUtils.extractText(cvFile);

            Chat chat = new Chat(
                    chatName,
                    companyName,
                    email,
                    jobTitle,
                    cvText,
                    jobDescription,
                    context);

            Chat createdChat = chatService.createChat(email, chat);
            return ApiResponseBuilder.build(
                HttpStatus.OK,
                "Chat session created successfully",
                createdChat
            );
        } catch (Exception e) {
            return ApiResponseBuilder.build(HttpStatus.BAD_REQUEST, "Failed to create chat:" + e.getMessage());
        }
    }

    /**
     * Retrieves all chat sessions associated with the authenticated user.
     *
     * @param token the JWT token from the accessToken cookie
     * @return ResponseEntity with the list of chats or error
     */
    @GetMapping("/chats")
    public ResponseEntity<?> getUserChats(@CookieValue(value = "accessToken", defaultValue = "") String token) {
        try {
            String email = jwtService.extractUserEmail(token);
            return ApiResponseBuilder.build(HttpStatus.OK, "Chats fetched successfully", chatService.getUserChats(email));
        } catch (Exception e) {
            return ApiResponseBuilder.build(HttpStatus.BAD_REQUEST, "Error fetching chats: " + e.getMessage());
        }
    }

    /**
     * Retrieves all messages from a specific chat session.
     *
     * @param chatId the ID of the chat session
     * @return ResponseEntity with the list of messages or error
     */
    @GetMapping("/messages/{chatId}")
    public ResponseEntity<?> getChatMessages(@PathVariable String chatId) {
        try {
            List<Message> messages = chatService.getChatMessages(chatId);
            return ApiResponseBuilder.build(HttpStatus.OK, "Messages fetched successfully", new MessageResponseDTO(messages));
        } catch (Exception e) {
            return ApiResponseBuilder.build(HttpStatus.BAD_REQUEST, "Error fetching messages: " + e.getMessage());
        }
    }

    /**
     * Sends a user message in a chat and returns the AI-generated response.
     *
     * @param message the message object containing chatId, sender info, and content
     * @return ResponseEntity indicating success or error with AI's reply
     */
    @PostMapping("/sendMessage")
    public ResponseEntity<?> sendMessage(@RequestBody Message message) {
        try {
            // Get both message and isEnd flag
            String aiResponse = chatService.sendMessage(message);
            boolean isEnd = message.getIsEnd();

            Map<String, Object> response = new HashMap<>();
            response.put("message", aiResponse);
            response.put("isEnd", isEnd);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending message: " + e.getMessage());
        }
    }

    /**
     * Updates the elapsed time (in seconds) for a specific chat session.
     *
     * @param chatId the ID of the chat session
     * @param elapsedTime the total time spent in the session (in seconds)
     * @return ResponseEntity indicating success or failure
     */
    @PutMapping("/updateElapsedTime/{chatId}")
    public ResponseEntity<?> updateElapsedTime(@PathVariable String chatId,
                                            @RequestParam long elapsedTime) {
        try {
            chatService.updateElapsedTime(chatId, elapsedTime);
            return ApiResponseBuilder.build(HttpStatus.OK, "Elapsed time updated successfully");
        } catch (Exception e) {
            return ApiResponseBuilder.build(HttpStatus.BAD_REQUEST, "Error updating elapsed time");
        }
    }
}
