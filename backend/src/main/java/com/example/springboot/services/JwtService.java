package com.example.springboot.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.springboot.models.User;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtService is a service class that handles JWT token generation, validation, and extraction of claims.
 * It uses the io.jsonwebtoken library to create and parse JWT tokens.
 */
@Service
public class JwtService {

    /** Secret key used for signing and verifying JWT tokens. */
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    /** Expiration time for access tokens (in milliseconds). */
    @Value("${security.jwt.access-expiration}")
    private long accessExpiration;

    /** Expiration time for refresh tokens (in milliseconds). */
    @Value("${security.jwt.refresh-expiration}")
    private long refreshExpiration;

    /**
     * Extracts the user's email (subject) from the given JWT token.
     *
     * @param token the JWT token
     * @return the user's email, or null if extraction fails
     */
    public String extractUserEmail(String token) {
        try {
            String userEmail = extractClaim(token, Claims::getSubject);
            System.out.println(" Extracted user Email from JWT: " + userEmail);
            return userEmail;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extracts a specific claim from a JWT token using a resolver function.
     *
     * @param token the JWT token
     * @param claimsResolver function to resolve the specific claim
     * @param <T> type of the claim
     * @return the extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generates an access token for the given user.
     *
     * @param user the user for whom the token is generated
     * @return the JWT access token as a string
     */
    public String generateAccessToken(User user) {
        return generateToken(new HashMap<>(), user, accessExpiration);
    }

    /**
     * Generates a refresh token for the given user.
     *
     * @param user the user for whom the token is generated
     * @return the JWT refresh token as a string
     */
    public String generateRefreshToken(User user) {
        return generateToken(new HashMap<>(), user, refreshExpiration);
    }

    /**
     * Generates a JWT token with given claims, user details, and expiration.
     *
     * @param extraClaims additional claims to include in the token
     * @param user the user for whom the token is generated
     * @param expiration token expiration time in milliseconds
     * @return the generated JWT token
     */
    private String generateToken(Map<String, Object> extraClaims, User user, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setHeaderParam("typ", "JWT")
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates a JWT token against the provided user details.
     *
     * @param token the JWT token
     * @param userDetails the user details to validate against
     * @return true if the token is valid, false otherwise
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String userEmail = extractUserEmail(token);
        return (userEmail != null && userEmail.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
    

    /**
     * Checks whether the given JWT token is expired.
     *
     * @param token the JWT token
     * @return true if the token is expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extracts the expiration date from a JWT token.
     *
     * @param token the JWT token
     * @return the expiration date
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts all claims from a JWT token.
     *
     * @param token the JWT token
     * @return the Claims object
     * @throws RuntimeException if the token is invalid
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT Token", e);
        }
    }

    /**
     * Retrieves the signing key used for token generation and verification.
     *
     * @return the secret signing key
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates an HTTP-only secure cookie for the access token.
     *
     * @param accessToken the access token
     * @return the configured Cookie object
     */
    public Cookie generateAccessCookie(String accessToken) {
        Cookie cookie = new Cookie("accessToken", accessToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) accessExpiration / 1000);
        cookie.setAttribute("SameSite", "None");
        return cookie;
    }

    /**
     * Generates an HTTP-only secure cookie for the refresh token.
     *
     * @param refreshToken the refresh token
     * @return the configured Cookie object
     */
    public Cookie generateRefreshCookie(String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) refreshExpiration / 1000);
        cookie.setAttribute("SameSite", "None");
        return cookie;
    }

    /**
     * Generates a cookie to delete the refresh token by setting its max age to 0.
     *
     * @return the configured Cookie object
     */
    public Cookie generateDeleteRefreshCookie() {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }

    /**
     * Generates a cookie to delete the access token by setting its max age to 0.
     *
     * @return the configured Cookie object
     */
    public Cookie generateDeleteAccessCookie() {
        Cookie cookie = new Cookie("accessToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }
}
