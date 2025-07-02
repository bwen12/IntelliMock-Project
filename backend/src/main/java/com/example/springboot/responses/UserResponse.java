package com.example.springboot.responses;

import lombok.Getter;
import lombok.Setter;

/**
 * A DTO representing the user information returned to clients.
 * This excludes sensitive data like passwords and internal IDs.
 */
@Getter
@Setter
public class UserResponse {
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String profilePicture;

    /**
     * Constructs a new UserResponse with the given details.
     *
     * @param firstName      The user's first name.
     * @param lastName       The user's last name.
     * @param email          The user's email address.
     * @param role           The user's role (e.g., USER, ADMIN).
     * @param profilePicture URL to the user's profile picture.
     */
    public UserResponse(String firstName, String lastName, String email, String role, String profilePicture) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.profilePicture = profilePicture;
    }
}
