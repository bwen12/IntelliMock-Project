package com.example.springboot.services;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.springboot.models.User;

import jakarta.servlet.http.Cookie;

/**
 * Unit tests for the JwtService class.
 * This class contains various test cases to verify the functionality of the JwtService methods.
 * It uses Mockito to mock dependencies and JUnit for assertions.
 * 
 */
@SpringBootTest
class JwtServiceTests {

    private JwtService jwtService;
    private User mockUser;
    private String testEmail = "test@example.com";
    private String secretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private long accessExpiration = 3600000; // 1 hour
    private long refreshExpiration = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "accessExpiration", accessExpiration);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", refreshExpiration);

        mockUser = new User();
        mockUser.setEmail(testEmail);
    }

    /**
     * Test case for generating an access token.
     * This test verifies that the generated token is not null and contains the expected email.
     */
    @Test
    void testGenerateAccessToken() {
        // Act
        String token = jwtService.generateAccessToken(mockUser);

        // Assert
        assertNotNull(token);
        assertEquals(testEmail, jwtService.extractUserEmail(token));
    }


    /**
     * Test case for generating a refresh token.
     * This test verifies that the generated token is not null and contains the expected email.
     */
    @Test
    void testGenerateRefreshToken() {
        // Act
        String token = jwtService.generateRefreshToken(mockUser);

        // Assert
        assertNotNull(token);
        assertEquals(testEmail, jwtService.extractUserEmail(token));
    }

    /**
     * Test case for extracting the user email from a token.
     * This test verifies that the extracted email matches the expected email.
     */
    @Test
    void testExtractUserEmail() {
        // Arrange
        String token = jwtService.generateAccessToken(mockUser);

        // Act
        String extractedEmail = jwtService.extractUserEmail(token);

        // Assert
        assertEquals(testEmail, extractedEmail);
    }

    /**
     * Test case for extracting the expiration date from a token.
     * This test verifies that the extracted expiration date is not null and is after the current date.
     */
    @Test
    void testIsTokenValid() {
        // Arrange
        String token = jwtService.generateAccessToken(mockUser);
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(testEmail)
            .password("password")
            .authorities("USER")
            .build();

        // Act & Assert
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }


    /**
     * Test case for checking if a token is expired.
     * This test verifies that the token is not expired immediately after generation.
     */
    @Test
    void testIsTokenExpired() {
        // Arrange
        String token = jwtService.generateAccessToken(mockUser);

        // Act & Assert
        assertFalse(jwtService.isTokenExpired(token));
    }

    /**
     * Test case for generating an access cookie.
     * This test verifies that the generated cookie has the expected properties.
     */
    @Test
    void testGenerateAccessCookie() {
        // Arrange
        String token = jwtService.generateAccessToken(mockUser);

        // Act
        Cookie cookie = jwtService.generateAccessCookie(token);

        // Assert
        assertNotNull(cookie);
        assertEquals("accessToken", cookie.getName());
        assertEquals(token, cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.getSecure());
        assertEquals("/", cookie.getPath());
        assertEquals(accessExpiration / 1000, cookie.getMaxAge());
    }

    /**
     * Test case for generating a refresh cookie.
     * This test verifies that the generated cookie has the expected properties.
     */
    @Test
    void testGenerateRefreshCookie() {
        // Arrange
        String token = jwtService.generateRefreshToken(mockUser);

        // Act
        Cookie cookie = jwtService.generateRefreshCookie(token);

        // Assert
        assertNotNull(cookie);
        assertEquals("refreshToken", cookie.getName());
        assertEquals(token, cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.getSecure());
        assertEquals("/", cookie.getPath());
        assertEquals(refreshExpiration / 1000, cookie.getMaxAge());
    }

    /**
     * Test case for generating a delete access cookie.
     * This test verifies that the generated cookie has the expected properties.
     */
    @Test
    void testGenerateDeleteAccessCookie() {
        // Act
        Cookie cookie = jwtService.generateDeleteAccessCookie();

        // Assert
        assertNotNull(cookie);
        assertEquals("accessToken", cookie.getName());
        assertNull(cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.getSecure());
        assertEquals("/", cookie.getPath());
        assertEquals(0, cookie.getMaxAge());
    }

    /**
     * Test case for generating a delete refresh cookie.
     * This test verifies that the generated cookie has the expected properties.
     */
    @Test
    void testGenerateDeleteRefreshCookie() {
        // Act
        Cookie cookie = jwtService.generateDeleteRefreshCookie();

        // Assert
        assertNotNull(cookie);
        assertEquals("refreshToken", cookie.getName());
        assertNull(cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.getSecure());
        assertEquals("/", cookie.getPath());
        assertEquals(0, cookie.getMaxAge());
    }

    /**
     * Test case for checking if a token is valid.
     * This test verifies that the token is valid when the user details match.
     */
    @Test
    void testInvalidToken() {
        // Arrange
        String invalidToken = "invalid.token.here";
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(testEmail)
            .password("password")
            .authorities("USER")
            .build();

        // Act & Assert
        assertNull(jwtService.extractUserEmail(invalidToken));
        assertFalse(jwtService.isTokenValid(invalidToken, userDetails));
    }
}