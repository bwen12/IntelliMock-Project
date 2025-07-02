package com.example.springboot.utils;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.mockito.MockedConstruction;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the {@link TokenUtils} utility class.
 * <p>
 * These tests validate the behaviour of the extractClaimsFromIdToken method,
 * ensuring correct parsing of Google ID tokens under different scenarios:
 * successful verification, failed verification, and unexpected internal errors.
 */
@SpringBootTest
class TokenUtilsTests {

    private final String clientId = "mock-client-id";
    private final String idTokenString = "mock-id-token";
    private final String email = "test@example.com";
    private final String firstName = "John";
    private final String lastName = "Doe";
    private final String pictureUrl = "http://example.com/pic.jpg";

    /**
     * Verifies that {@code extractClaimsFromIdToken} successfully extracts expected claims
     * when the Google ID token is valid and verification passes.
     */
    @Test
    void testExtractClaimsFromIdToken_Success() throws Exception {
        Payload payload = mock(Payload.class);
        when(payload.getEmail()).thenReturn(email);
        when(payload.get("given_name")).thenReturn(firstName);
        when(payload.get("family_name")).thenReturn(lastName);
        when(payload.get("picture")).thenReturn(pictureUrl);

        GoogleIdToken token = mock(GoogleIdToken.class);
        when(token.getPayload()).thenReturn(payload);

        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        when(verifier.verify(idTokenString)).thenReturn(token);

        try (MockedConstruction<GoogleIdTokenVerifier.Builder> mocked = mockConstruction(
                GoogleIdTokenVerifier.Builder.class,
                (builderMock, context) -> {
                    when(builderMock.setAudience(Collections.singletonList(clientId))).thenReturn(builderMock);
                    when(builderMock.build()).thenReturn(verifier);
                })) {

            Claims claims = TokenUtils.extractClaimsFromIdToken(idTokenString, clientId);

            assertEquals(email, claims.get("email"));
            assertEquals(firstName, claims.get("given_name"));
            assertEquals(lastName, claims.get("family_name"));
            assertEquals(pictureUrl, claims.get("picture"));
        }
    }

    /**
     * Verifies that {@code extractClaimsFromIdToken} throws a RuntimeException
     * when token verification fails (i.e., the token is null).
     */
    @Test
    void testExtractClaimsFromIdToken_VerificationFails() throws Exception {
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        when(verifier.verify(idTokenString)).thenReturn(null);

        try (MockedConstruction<GoogleIdTokenVerifier.Builder> mocked = mockConstruction(
                GoogleIdTokenVerifier.Builder.class,
                (builderMock, context) -> {
                    when(builderMock.setAudience(Collections.singletonList(clientId))).thenReturn(builderMock);
                    when(builderMock.build()).thenReturn(verifier);
                })) {

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                TokenUtils.extractClaimsFromIdToken(idTokenString, clientId);
            });

            assertEquals("Invalid OAuth Token: Google ID Token verification failed", exception.getMessage());
        }
    }

    /**
     * Verifies that {@code extractClaimsFromIdToken} throws a RuntimeException
     * when an unexpected exception occurs during token verifier construction.
     */
    @Test
    void testExtractClaimsFromIdToken_ThrowsException() {
        try (MockedConstruction<GoogleIdTokenVerifier.Builder> mocked = mockConstruction(
                GoogleIdTokenVerifier.Builder.class,
                (builderMock, context) -> {
                    when(builderMock.setAudience(any())).thenReturn(builderMock);
                    when(builderMock.build()).thenThrow(new RuntimeException("Unexpected error"));
                })) {

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                TokenUtils.extractClaimsFromIdToken(idTokenString, clientId);
            });

            assertTrue(exception.getMessage().contains("Invalid OAuth Token"));
        }
    }
}
