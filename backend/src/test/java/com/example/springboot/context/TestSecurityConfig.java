package com.example.springboot.context;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Test-specific security configuration to simplify authentication requirements
 * during integration tests. This configuration disables CSRF protection and
 * allows all HTTP requests without requiring authentication.
 *
 * <p>It is loaded only in the test context via {@code @Import(TestSecurityConfig.class)},
 * typically used in {@code @WebMvcTest} or {@code @SpringBootTest} environments.</p>
 */
@TestConfiguration
public class TestSecurityConfig {

    /**
     * Defines a permissive {@link SecurityFilterChain} bean for test environments.
     * <ul>
     *     <li>Disables CSRF protection (useful for test requests without tokens)</li>
     *     <li>Allows all requests without authentication</li>
     * </ul>
     *
     * @param http the {@link HttpSecurity} object to configure
     * @return a {@link SecurityFilterChain} that permits all requests
     * @throws Exception if the configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf().disable()
                   .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                   .build();
    }
}
