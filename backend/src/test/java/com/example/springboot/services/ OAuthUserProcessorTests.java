package com.example.springboot.services;

import com.example.springboot.models.User;
import com.example.springboot.repositories.UserRepository;
import com.example.springboot.utils.TokenUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link OAuthUserProcessor}.
 *
 * This test class covers:
 * <ul>
 *   <li>Processing of existing and new OAuth users via ID tokens.</li>
 *   <li>Correct extraction and setting of user claims (email, name, picture).</li>
 *   <li>Generation and injection of secure access and refresh cookies into the HTTP response.</li>
 * </ul>
 *
 * Mocks are used for {@link UserRepository}, {@link JwtService}, and {@link HttpServletResponse},
 * and {@link TokenUtils} is statically mocked to isolate tests from external dependencies.
 */
@SpringBootTest
class OAuthUserProcessorTests {

    @Mock private UserRepository userRepository;
    @Mock private JwtService jwtService;
    @Mock private HttpServletResponse response;

    @InjectMocks private OAuthUserProcessor processor;

    private AutoCloseable closeable;
    private final String email = "test@example.com";
    private final String idToken = "mock-token";
    private final String firstName = "John";
    private final String lastName = "Doe";
    private final String picture = "http://example.com/pic.jpg";
    private final String clientId = "fake-client-id";

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
        processor = new OAuthUserProcessor(userRepository, jwtService);
        try {
            var field = OAuthUserProcessor.class.getDeclaredField("clientId");
            field.setAccessible(true);
            field.set(processor, clientId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    /**
     * Verifies that an existing user is updated correctly using claims extracted from the ID token.
     */
    @Test
    void testProcessOAuthUser_updatesExistingUser() {
        User existing = new User();
        existing.setEmail(email);

        Claims claims = mock(Claims.class);
        when(claims.get("email", String.class)).thenReturn(email);
        when(claims.get("given_name", String.class)).thenReturn(firstName);
        when(claims.get("family_name", String.class)).thenReturn(lastName);
        when(claims.get("picture", String.class)).thenReturn(picture);

        try (MockedStatic<TokenUtils> tokenUtilsMock = mockStatic(TokenUtils.class)) {
            tokenUtilsMock.when(() -> TokenUtils.extractClaimsFromIdToken(idToken, clientId))
                    .thenReturn(claims);
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(existing));
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            User result = processor.processOAuthUser(idToken);

            assertEquals(email, result.getEmail());
            assertEquals(firstName, result.getFirstName());
            assertEquals(lastName, result.getLastName());
            assertEquals(picture, result.getProfilePicture());
        }
    }

    /**
     * Verifies that a new user is created if no existing user is found for the email.
     */
    @Test
    void testProcessOAuthUser_createsNewUser() {
        Claims claims = mock(Claims.class);
        when(claims.get("email", String.class)).thenReturn(email);
        when(claims.get("given_name", String.class)).thenReturn(firstName);
        when(claims.get("family_name", String.class)).thenReturn(lastName);
        when(claims.get("picture", String.class)).thenReturn(picture);

        try (MockedStatic<TokenUtils> tokenUtilsMock = mockStatic(TokenUtils.class)) {
            tokenUtilsMock.when(() -> TokenUtils.extractClaimsFromIdToken(idToken, clientId))
                    .thenReturn(claims);
            when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            User result = processor.processOAuthUser(idToken);

            assertNotNull(result.getId());
            assertEquals(email, result.getEmail());
            assertEquals(firstName, result.getFirstName());
            assertEquals(lastName, result.getLastName());
            assertEquals(picture, result.getProfilePicture());
        }
    }

    /**
     * Verifies that the correct access and refresh cookies are added to the HTTP response.
     */
    @Test
    void testSetOAuthCookie_setsAccessAndRefreshCookies() {
        User user = new User();
        user.setEmail(email);

        String accessToken = "access-token";
        String refreshToken = "refresh-token";

        Cookie accessCookie = new Cookie("accessToken", accessToken);
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);

        when(jwtService.generateAccessToken(user)).thenReturn(accessToken);
        when(jwtService.generateRefreshToken(user)).thenReturn(refreshToken);
        when(jwtService.generateAccessCookie(accessToken)).thenReturn(accessCookie);
        when(jwtService.generateRefreshCookie(refreshToken)).thenReturn(refreshCookie);

        processor.setOAuthCookie(user, response);

        verify(response).addCookie(accessCookie);
        verify(response).addCookie(refreshCookie);
    }
}
