package com.example.springboot.controllers;

import com.example.springboot.context.TestSecurityConfig;
import com.example.springboot.models.Chat;
import com.example.springboot.models.Message;
import com.example.springboot.services.ChatService;
import com.example.springboot.services.JwtService;
import com.example.springboot.utils.PdfToTextUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mockStatic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration-level tests for {@link ChatController}, focusing on
 * REST endpoint correctness and HTTP response handling.
 * All service and utility classes are mocked.
 */
@WebMvcTest(ChatController.class)
@Import({ ChatControllerTest.MockConfig.class, TestSecurityConfig.class })
class ChatControllerTest {

    @TestConfiguration
    static class MockConfig {
        @Bean
        public ChatService chatService() {
            return Mockito.mock(ChatService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }
    }

    @org.springframework.beans.factory.annotation.Autowired
    private ChatService chatService;

    @org.springframework.beans.factory.annotation.Autowired
    private JwtService jwtService;

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @org.springframework.beans.factory.annotation.Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void resetMocks() {
        Mockito.reset(chatService, jwtService);
    }

    /**
     * Helper to construct multipart file uploads for chat creation.
     */
    private MockMultipartFile[] createMultipartRequest(boolean includeContext) {
        MockMultipartFile chatName = new MockMultipartFile("chatName", "", "text/plain", "My Chat".getBytes());
        MockMultipartFile companyName = new MockMultipartFile("companyName", "", "text/plain", "OpenAI".getBytes());
        MockMultipartFile jobTitle = new MockMultipartFile("jobTitle", "", "text/plain", "ML Engineer".getBytes());
        MockMultipartFile jobDescription = new MockMultipartFile("jobDescription", "", "text/plain", "Job desc".getBytes());
        MockMultipartFile cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", "Fake CV content".getBytes());

        if (includeContext) {
            MockMultipartFile context = new MockMultipartFile("context", "", "text/plain", "Some context".getBytes());
            return new MockMultipartFile[]{chatName, companyName, jobTitle, jobDescription, context, cv};
        }

        return new MockMultipartFile[]{chatName, companyName, jobTitle, jobDescription, cv};
    }

    /**
     * Verifies that chat creation fails with 400 when chat name already exists.
     */
    @Test
    void createChat_ShouldReturnBadRequest_WhenChatNameExists() throws Exception {
        Mockito.when(jwtService.extractUserEmail("valid-token")).thenReturn("test@example.com");
        Mockito.when(chatService.chatNameExists("test@example.com", "My Chat")).thenReturn(true);

        try (MockedStatic<PdfToTextUtils> mockedStatic = mockStatic(PdfToTextUtils.class)) {
            mockedStatic.when(() -> PdfToTextUtils.extractText(any())).thenReturn("Parsed CV text");

            mockMvc.perform(multipart("/openai/createChat")
                            .file(createMultipartRequest(true)[0])
                            .file(createMultipartRequest(true)[1])
                            .file(createMultipartRequest(true)[2])
                            .file(createMultipartRequest(true)[3])
                            .file(createMultipartRequest(true)[4])
                            .file(createMultipartRequest(true)[5])
                            .cookie(new Cookie("accessToken", "valid-token")))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("A Chat Session with that Name already exists"));
        }
    }

    /**
     * Verifies that chat creation returns 400 if PDF parsing fails.
     */
    @Test
    void createChat_ShouldReturnBadRequest_WhenPdfParsingFails() throws Exception {
        Mockito.when(jwtService.extractUserEmail("valid-token")).thenReturn("test@example.com");
        Mockito.when(chatService.chatNameExists("test@example.com", "My Chat")).thenReturn(false);

        try (MockedStatic<PdfToTextUtils> mockStatic = mockStatic(PdfToTextUtils.class)) {
            mockStatic.when(() -> PdfToTextUtils.extractText(any())).thenThrow(new RuntimeException("Parse fail"));

            mockMvc.perform(multipart("/openai/createChat")
                            .file(createMultipartRequest(true)[0])
                            .file(createMultipartRequest(true)[1])
                            .file(createMultipartRequest(true)[2])
                            .file(createMultipartRequest(true)[3])
                            .file(createMultipartRequest(true)[4])
                            .file(createMultipartRequest(true)[5])
                            .cookie(new Cookie("accessToken", "valid-token")))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Failed to create chat")));
        }
    }

    /**
     * Verifies that chat creation works with null context.
     */
    @Test
    void createChat_ShouldReturnOk_WhenContextIsNull() throws Exception {
        Mockito.when(jwtService.extractUserEmail("valid-token")).thenReturn("test@example.com");
        Mockito.when(chatService.chatNameExists("test@example.com", "My Chat")).thenReturn(false);

        Chat savedChat = new Chat("My Chat", "OpenAI", "test@example.com", "ML Engineer", "Parsed CV text", "Job desc", null);
        Mockito.when(chatService.createChat(eq("test@example.com"), any(Chat.class))).thenReturn(savedChat);

        try (MockedStatic<PdfToTextUtils> mockStatic = mockStatic(PdfToTextUtils.class)) {
            mockStatic.when(() -> PdfToTextUtils.extractText(any())).thenReturn("Parsed CV text");

            MockMultipartFile[] files = createMultipartRequest(false);

            mockMvc.perform(multipart("/openai/createChat")
                            .file(files[0]).file(files[1]).file(files[2])
                            .file(files[3]).file(files[4])
                            .cookie(new Cookie("accessToken", "valid-token")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Chat session created successfully"))
                    .andExpect(jsonPath("$.data.chatName").value("My Chat"));
        }
    }

    /**
     * Verifies successful retrieval of user's chat sessions.
     */
    @Test
    void getUserChats_ShouldReturnOk() throws Exception {
        Mockito.when(jwtService.extractUserEmail("valid-token")).thenReturn("test@example.com");
        Mockito.when(chatService.getUserChats("test@example.com")).thenReturn(List.of());

        mockMvc.perform(get("/openai/chats")
                        .cookie(new Cookie("accessToken", "valid-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Chats fetched successfully"));
    }

    /**
     * Verifies message list retrieval from chat.
     */
    @Test
    void getChatMessages_ShouldReturnOk() throws Exception {
        Message msg = new Message("chat123", "test@example.com", "Hi", "user", 1, false);
        Mockito.when(chatService.getChatMessages("chat123")).thenReturn(List.of(msg));

        mockMvc.perform(get("/openai/messages/chat123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Messages fetched successfully"))
                .andExpect(jsonPath("$.data.messages[0].message").value("Hi"));
    }

    /**
     * Verifies successful message sending and AI response.
     */
    @Test
    void sendMessage_ShouldReturnOk() throws Exception {
        Message msg = new Message("chat123", "test@example.com", "Hi there", "user", 2, false);
        Mockito.when(chatService.sendMessage(any(Message.class))).thenReturn("Hello, welcome!");

        mockMvc.perform(post("/openai/sendMessage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(msg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hello, welcome!"))
                .andExpect(jsonPath("$.isEnd").value(false));
    }

    /**
     * Verifies elapsed time update succeeds.
     */
    @Test
    void updateElapsedTime_ShouldReturnOk() throws Exception {
        Mockito.doNothing().when(chatService).updateElapsedTime("chat123", 120);

        mockMvc.perform(put("/openai/updateElapsedTime/chat123")
                        .param("elapsedTime", "120"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Elapsed time updated successfully"));
    }
}
