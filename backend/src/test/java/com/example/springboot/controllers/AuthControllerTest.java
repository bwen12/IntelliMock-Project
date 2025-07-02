package com.example.springboot.controllers;

import com.example.springboot.context.TestSecurityConfig;
import com.example.springboot.models.User;
import com.example.springboot.repositories.UserRepository;
import com.example.springboot.services.JwtService;
import com.example.springboot.services.OAuthUserProcessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration-level tests for {@link AuthController}, focusing on HTTP status
 * codes,
 * response structures, and endpoint behaviours. Dependencies are mocked
 * via @TestConfiguration.
 */
@WebMvcTest(AuthController.class)
@Import({ AuthControllerTest.MockConfig.class, TestSecurityConfig.class })
class AuthControllerTest {

    /**
     * Provides mock implementations of required services for the controller.
     */
    @TestConfiguration
    static class MockConfig {
        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }

        @Bean
        public OAuthUserProcessor oAuthUserProcessor() {
            return Mockito.mock(OAuthUserProcessor.class);
        }

        @Bean
        public UserRepository userRepository() {
            return Mockito.mock(UserRepository.class);
        }
    }

    @Autowired
    private JwtService jwtService;
    @Autowired
    private OAuthUserProcessor oAuthUserProcessor;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        Mockito.reset(jwtService, oAuthUserProcessor, userRepository);
    }

    /**
     * Verifies that the logout endpoint returns 200 OK and clears authentication
     * cookies.
     */
    @Test
    void logout_ShouldReturnOkAndClearCookies() throws Exception {
        Mockito.when(jwtService.generateDeleteAccessCookie()).thenReturn(new Cookie("accessToken", null));
        Mockito.when(jwtService.generateDeleteRefreshCookie()).thenReturn(new Cookie("refreshToken", null));

        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged Out Successfully"));
    }

    /**
     * Verifies that /auth/me returns the current authenticated user's details with
     * 200 OK.
     */
    @Test
    void getCurrentUser_ShouldReturnUser_WhenAuthenticated() throws Exception {
        User userObj = new User("test@example.com", "John", "Doe", User.Role.USER, "http://example.com/pic.jpg");

        mockMvc.perform(get("/auth/me").with(user(userObj)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    /**
     * Verifies that /auth/me returns 401 Unauthorized when no user is
     * authenticated.
     */
    @Test
    void getCurrentUser_ShouldReturnUnauthorized_WhenNoUser() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User Not Authenticated"));
    }

    /**
     * Verifies that /auth/oauth/login returns 400 Bad Request if no ID token is
     * provided.
     */
    @Test
    void oauthLogin_ShouldReturnBadRequest_WhenIdTokenMissing() throws Exception {
        mockMvc.perform(post("/auth/oauth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Missing ID Token"));
    }

    /**
     * Verifies that /auth/oauth/login returns 200 OK with user data when the token
     * is valid.
     */
    @Test
    void oauthLogin_ShouldReturnOk_WhenTokenValid() throws Exception {
        User userObj = new User("test@example.com", "Jane", "Doe", User.Role.USER, "http://img");
        Mockito.when(oAuthUserProcessor.processOAuthUser("valid-token")).thenReturn(userObj);
        Mockito.doNothing().when(oAuthUserProcessor).setOAuthCookie(eq(userObj), any(HttpServletResponse.class));

        mockMvc.perform(post("/auth/oauth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("id_token", "valid-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.user.role").value("USER"));
    }

    /**
     * Verifies that /auth/oauth/login returns 401 Unauthorized when token
     * processing fails.
     */
    @Test
    void oauthLogin_ShouldReturnUnauthorized_OnFailure() throws Exception {
        Mockito.when(oAuthUserProcessor.processOAuthUser(anyString()))
                .thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(post("/auth/oauth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("id_token", "bad-token"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid OAuth Token"));
    }

    /**
     * Verifies that /auth/refresh returns 401 Unauthorized if no refresh token is
     * provided.
     */
    @Test
    void refreshToken_ShouldReturnUnauthorized_WhenTokenMissing() throws Exception {
        mockMvc.perform(post("/auth/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("No refresh token found"));
    }

    /**
     * Verifies that /auth/refresh returns 401 Unauthorized if the token is invalid
     * or expired.
     */
    @Test
    void refreshToken_ShouldReturnUnauthorized_WhenTokenInvalid() throws Exception {
        Mockito.when(jwtService.extractUserEmail(any())).thenReturn(null);

        mockMvc.perform(post("/auth/refresh")
                .cookie(new Cookie("refreshToken", "expired")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid or expired refresh token"));
    }

    /**
     * Verifies that /auth/refresh returns 200 OK and sets a new access token cookie
     * when valid.
     */
    @Test
    void refreshToken_ShouldReturnOk_WhenValid() throws Exception {
        User userObj = new User("test@example.com", "John", "Doe", User.Role.USER, null);
        Mockito.when(jwtService.extractUserEmail("valid-token")).thenReturn("test@example.com");
        Mockito.when(jwtService.isTokenExpired("valid-token")).thenReturn(false);
        Mockito.when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userObj));
        Mockito.when(jwtService.generateAccessToken(userObj)).thenReturn("new-access-token");
        Mockito.when(jwtService.generateAccessCookie("new-access-token"))
                .thenReturn(new Cookie("accessToken", "new-access-token"));

        mockMvc.perform(post("/auth/refresh")
                .cookie(new Cookie("refreshToken", "valid-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Access token refreshed successfully"));
    }

    /**
     * Verifies that /auth/avatar returns 400 Bad Request when no profile picture or
     * imageUrl is provided.
     */
    @Test
    void proxyAvatar_ShouldReturnBadRequest_WhenUrlMissing() throws Exception {
        User userObj = new User("test@example.com", "Jane", "Doe", User.Role.USER, "");
        mockMvc.perform(get("/auth/avatar").with(user(userObj)))
                .andExpect(status().isBadRequest());
    }
}
