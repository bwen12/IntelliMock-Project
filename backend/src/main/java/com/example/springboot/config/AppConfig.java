package com.example.springboot.config;

import com.example.springboot.repositories.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Application-level configuration class.
 *
 * <p>This class defines beans related to authentication management and user detail services
 * for integration with Spring Security.</p>
 */
@Configuration
public class AppConfig {

    /**
     * Provides an {@link AuthenticationManager} bean.
     *
     * <p>The {@code AuthenticationManager} is retrieved from the {@link AuthenticationConfiguration},
     * which automatically configures the manager based on the Spring Security context.</p>
     *
     * @param config the authentication configuration provided by Spring
     * @return the authentication manager
     * @throws Exception if the authentication manager cannot be retrieved
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Provides a {@link UserDetailsService} bean to be used by Spring Security for loading user details.
     *
     * <p>This implementation looks up users by their email using the provided {@link UserRepository}.
     * If the user is not found, a {@link UsernameNotFoundException} is thrown.</p>
     *
     * @param userRepository the repository used to look up users by email
     * @return a user details service implementation
     */
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
