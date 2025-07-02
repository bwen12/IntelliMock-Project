package com.example.springboot.utils;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import java.util.Collections;

/**
 * Utility class for extracting claims from a Google OAuth 2.0 ID token.
 * <p>
 * This class provides functionality for verifying and extracting user claims
 * from a Google ID token. The token verification ensures the authenticity
 * of the provided ID token and retrieves useful information such as the user's
 * email, name, and profile picture.
 */
public class TokenUtils {

    /**
     * Extracts claims from a Google OAuth 2.0 ID token after verification.
     * <p>
     * This method verifies the provided ID token using the specified client ID,
     * and if the token is valid, it extracts the user's claims (such as email, 
     * first name, last name, and profile picture).
     *
     * @param idToken the Google OAuth 2.0 ID token to verify and extract claims from
     * @param clientId the expected client ID to match during token verification
     * @return a {@link Claims} object containing the extracted claims from the token
     * @throws RuntimeException if token verification fails or if there's an issue extracting the claims
     */
    public static Claims extractClaimsFromIdToken(String idToken, String clientId) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()).setAudience(Collections.singletonList(clientId)).build();

            GoogleIdToken token = verifier.verify(idToken);

            if (token == null) {
                throw new RuntimeException("Invalid OAuth Token: Verification failed.");
            }

            GoogleIdToken.Payload payload = token.getPayload();

            Claims claims = Jwts.claims();
            claims.put("email", payload.getEmail());
            claims.put("given_name", payload.get("given_name"));
            claims.put("family_name", payload.get("family_name"));
            claims.put("picture", payload.get("picture"));

            return claims;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Invalid OAuth Token: Google ID Token verification failed", e);
        }
    }

}
