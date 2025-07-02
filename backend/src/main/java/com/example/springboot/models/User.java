package com.example.springboot.models;

import java.util.Collection;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Getter;
import lombok.Setter;

/**
 * Represents a user in the system with roles and profile information.
 * Implements Spring Security's UserDetails for authentication and authorization purposes.
 */
@Document(collection = "users")
@Getter
@Setter
public class User implements UserDetails {

    /**
     * Enum representing user roles within the application.
     */
    public enum Role {
        USER,
        ADMIN
    }

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String firstName;

    private String lastName;

    private String profilePicture;

    private Role role;

    /**
     * Constructor to initialize a User with specific details.
     *
     * @param email          The email (username) of the user.
     * @param firstName      The user's first name.
     * @param lastName       The user's last name.
     * @param role           The role assigned to the user.
     * @param profilePicture The URL or path to the user's profile picture.
     */
    public User(String email, String firstName, String lastName, Role role, String profilePicture) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.profilePicture = profilePicture;
    }

    public User() {
    }

    /**
     * Returns the username (email) of the user.
     * 
     * @return The email of the user.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Returns the authorities (roles) granted to the user.
     *
     * @return A list of authorities granted to the user.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /**
     * Indicates whether the account is expired or not.
     *
     * @return true if the account is not expired, false otherwise.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the account is locked or not.
     *
     * @return true if the account is not locked, false otherwise.
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Indicates whether the credentials are expired or not.
     *
     * @return true if the credentials are not expired, false otherwise.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Returns null as the password is not stored directly here (would be handled by Spring Security).
     *
     * @return null as no password is stored.
     */
    @Override
    public String getPassword() {
        return null;
    }
}
