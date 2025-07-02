package com.example.springboot.utils;

import com.example.springboot.dto.ApiResponse;
import com.example.springboot.responses.UserResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the {@link ApiResponseBuilder} utility class.
 * <p>
 * These tests verify the correctness of various static methods that construct
 * standardised API responses, including support for custom payloads,
 * user responses, and validation error formatting.
 */
@SpringBootTest
class ApiResponseBuilderTests {

    /**
     * Verifies that a full response with status, message, and data is built
     * correctly.
     */
    @Test
    void testBuild_withAllFields() {
        String message = "Success";
        Map<String, Object> data = Map.of("key", "value");

        ResponseEntity<ApiResponse> response = ApiResponseBuilder.build(HttpStatus.OK, message, data);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(200, response.getBody().getStatus());
        assertEquals(message, response.getBody().getMessage());
        assertEquals(data, response.getBody().getData());
    }

    /**
     * Verifies that data of type {@link UserResponse} is wrapped in a "user" key.
     */
    @Test
    void testBuild_withUserResponseData() {
        String message = "User fetched";
        UserResponse userData = new UserResponse("John", "Doe", "test@example.com", "USER", "pic.jpg");

        ResponseEntity<ApiResponse> response = ApiResponseBuilder.build(HttpStatus.OK, message, userData);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(message, response.getBody().getMessage());

        @SuppressWarnings("unchecked")
        Map<String, Object> responseData = (Map<String, Object>) response.getBody().getData();
        assertTrue(responseData.containsKey("user"));
        assertEquals(userData, responseData.get("user"));
    }

    /**
     * Verifies that a response with just status and message (no data) is built
     * correctly.
     */
    @Test
    void testBuild_withStatusAndMessageOnly() {
        String message = "Created";
        ResponseEntity<ApiResponse> response = ApiResponseBuilder.build(HttpStatus.CREATED, message);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(201, response.getBody().getStatus());
        assertEquals(message, response.getBody().getMessage());
        assertNull(response.getBody().getData());
    }

    /**
     * Verifies that a field-level validation error is constructed properly.
     */
    @Test
    void testBuildFieldError() {
        String field = "email";
        String errorMsg = "Email is invalid";

        ResponseEntity<ApiResponse> response = ApiResponseBuilder.buildFieldError(HttpStatus.BAD_REQUEST, field,
                errorMsg);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().getMessage();
        assertEquals(errorMsg, errors.get(field));
        assertNull(response.getBody().getData());
    }

    /**
     * Verifies that multiple field-level validation errors are constructed
     * properly.
     */
    @Test
    void testBuildFieldErrors() {
        String[][] errorsArray = {
                { "email", "Email is required" },
                { "password", "Password is too short" }
        };

        ResponseEntity<ApiResponse> response = ApiResponseBuilder.buildFieldErrors(HttpStatus.UNPROCESSABLE_ENTITY,
                errorsArray);

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().getMessage();
        assertEquals(2, errors.size());
        assertEquals("Email is required", errors.get("email"));
        assertEquals("Password is too short", errors.get("password"));
        assertNull(response.getBody().getData());
    }
}
