package com.example.springboot.services;

import com.example.springboot.models.User;
import com.example.springboot.repositories.UserRepository;
import com.example.springboot.utils.TokenUtils;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import java.util.UUID;

/**
 * Service class responsible for processing users authenticated via OAuth2 providers (e.g., Google).
 * It extracts user information from the provided ID token, updates or creates a user in the database,
 * and sets JWT access and refresh tokens as cookies in the HTTP response.
 */
@Service
public class OAuthUserProcessor {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${security.oauth2.client.client-id}")
    private String clientId;

    /**
     * Constructs an OAuthUserProcessor with the required dependencies.
     *
     * @param userRepository the repository for accessing and storing user data
     * @param jwtService     the service responsible for JWT token generation
     */
    public OAuthUserProcessor(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Processes an OAuth user by extracting user information from the ID token.
     * If a user with the given email exists, their details are updated.
     * Otherwise, a new user is created and stored in the database.
     *
     * @param idToken the OAuth2 ID token (e.g., from Google) containing user claims
     * @return the updated or newly created User object
     */
    public User processOAuthUser(String idToken) {
        Claims claims = TokenUtils.extractClaimsFromIdToken(idToken, clientId);        
        String email = claims.get("email", String.class);
        String firstName = claims.get("given_name", String.class);
        String lastName = claims.get("family_name", String.class);
        String profilePicture = claims.get("picture", String.class);

        return userRepository.findByEmail(email).map(existingUser -> {
            existingUser.setFirstName(firstName);
            existingUser.setLastName(lastName);
            existingUser.setProfilePicture(profilePicture);
            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            User user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setProfilePicture(profilePicture);
            user.setRole(User.Role.USER);
            return userRepository.save(user);
        });
    }

    /**
     * Generates and attaches secure HTTP-only access and refresh token cookies
     * for the authenticated OAuth user to the HTTP response.
     *
     * @param user     the authenticated user
     * @param response the HTTP response to which cookies are added
     */
    public void setOAuthCookie(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        response.addCookie(jwtService.generateAccessCookie(accessToken));
        response.addCookie(jwtService.generateRefreshCookie(refreshToken));
    }
}
