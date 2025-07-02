package com.example.springboot.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.example.springboot.models.User;
import com.example.springboot.repositories.UserRepository;
import com.example.springboot.responses.UserResponse;
import com.example.springboot.services.JwtService;
import com.example.springboot.services.OAuthUserProcessor;
import com.example.springboot.utils.ApiResponseBuilder;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.MediaType;

import jakarta.servlet.http.HttpServletResponse;

/**
 * REST controller handling authentication-related endpoints such as login,
 * logout, token refresh, and user details retrieval.
 */
@RequestMapping("/auth")
@RestController
public class AuthController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final OAuthUserProcessor oAuthUserProcessor;

    /**
     * Constructs the AuthController with required services.
     *
     * @param jwtService         the service for handling JWT operations
     * @param userRepository     the repository for accessing user data
     * @param oAuthUserProcessor service that processes OAuth-based login
     */
    public AuthController(JwtService jwtService,
            UserRepository userRepository, OAuthUserProcessor oAuthUserProcessor) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.oAuthUserProcessor = oAuthUserProcessor;
    }

    /**
     * Logs out the current user by clearing authentication cookies.
     *
     * @param response the HTTP response where cookies will be cleared
     * @return a 200 OK response indicating logout was successful
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        response.addCookie(jwtService.generateDeleteAccessCookie());
        response.addCookie(jwtService.generateDeleteRefreshCookie());

        return ApiResponseBuilder.build(HttpStatus.OK, "Logged Out Successfully");
    }

    /**
     * Retrieves the current authenticated user's information.
     *
     * @param user the authenticated user injected by Spring Security
     * @return user details or a 401 response if not authenticated
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ApiResponseBuilder.build(HttpStatus.UNAUTHORIZED, "User Not Authenticated");
        }

        UserResponse userResponse = new UserResponse(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getProfilePicture());

        return ResponseEntity.ok(userResponse);
    }

    /**
     * Handles login via an OAuth provider by validating the ID token,
     * registering or retrieving the user, and setting authentication cookies.
     *
     * @param requestBody a map containing the OAuth "id_token"
     * @param response    the HTTP response used to set authentication cookies
     * @return a success response with user details, or error status on failure
     */
    @PostMapping("/oauth/login")
    public ResponseEntity<?> oauthLogin(@RequestBody Map<String, String> requestBody, HttpServletResponse response) {
        try {
            String idToken = requestBody.get("id_token");
            if (idToken == null || idToken.isEmpty()) {
                return ApiResponseBuilder.build(HttpStatus.BAD_REQUEST, "Missing ID Token");
            }

            User user = oAuthUserProcessor.processOAuthUser(idToken);
            oAuthUserProcessor.setOAuthCookie(user, response);

            UserResponse userResponse = new UserResponse(
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getRole().name(),
                    user.getProfilePicture());

            return ApiResponseBuilder.build(
                    HttpStatus.OK,
                    "Login successful",
                    userResponse);
        } catch (Exception e) {
            return ApiResponseBuilder.build(HttpStatus.UNAUTHORIZED, "Invalid OAuth Token");
        }
    }

    /**
     * Refreshes the user's access token using a valid refresh token stored in
     * cookies.
     *
     * @param refreshToken the JWT refresh token from cookies
     * @param response     the HTTP response used to set the new access token
     * @return a response with a new access token or an error if invalid/expired
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(value = "refreshToken", defaultValue = "") String refreshToken,
            HttpServletResponse response) {

        if (refreshToken.isEmpty()) {
            return ApiResponseBuilder.build(HttpStatus.UNAUTHORIZED, "No refresh token found");
        }

        String email = jwtService.extractUserEmail(refreshToken);
        if (email == null || jwtService.isTokenExpired(refreshToken)) {
            return ApiResponseBuilder.build(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ApiResponseBuilder.build(HttpStatus.UNAUTHORIZED, "User not found");
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        response.addCookie(jwtService.generateAccessCookie(newAccessToken));

        return ApiResponseBuilder.build(HttpStatus.OK, "Access token refreshed successfully");
    }

    /**
     * Proxies the user's avatar image from an external URL. Optionally accepts an
     * image URL,
     * or defaults to the user's saved profile picture.
     *
     * @param user     the authenticated user
     * @param imageUrl optional image URL to proxy
     * @return the image data as a byte array with appropriate content type,
     *         or a 400/502 error response if invalid or unreachable
     */
    @GetMapping("/avatar")
    public ResponseEntity<byte[]> proxyAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String imageUrl) {

        String targetUrl = imageUrl != null ? imageUrl : user.getProfilePicture();

        if (targetUrl == null || targetUrl.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Java");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    targetUrl,
                    HttpMethod.GET,
                    entity,
                    byte[].class);

            HttpHeaders responseHeaders = new HttpHeaders();
            MediaType contentType = response.getHeaders().getContentType();
            if (contentType != null) {
                responseHeaders.setContentType(contentType);
            }

            return new ResponseEntity<>(response.getBody(), responseHeaders, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(null);
        }
    }

}
