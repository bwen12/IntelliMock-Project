package com.example.springboot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

/**
 * Configures Spring Security for the application, including CORS, JWT filter, 
 * session policy, and URL authorization rules.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthenticationFilter;

    /**
     * Development frontend URL used for configuring allowed CORS origins.
     */
    @Value("${frontend.dev.url}")
    private String frontendDevUrl;

     /**
     * Production frontend URL used for configuring allowed CORS origins.
     */
    @Value("${frontend.prod.url}")
    private String frontendProdUrl;

    /**
     * Development backend URL (not directly used in this class).
     */
    @Value("${backend.dev.url}")
    private String backendDevUrl;

    /**
     * Constructor for injecting the custom {@link JwtAuthFilter}.
     *
     * @param jwtAuthenticationFilter the filter used to process JWT authentication.
     */
    public SecurityConfig(JwtAuthFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Defines the security filter chain for HTTP requests, including:
     * <ul>
     *     <li>Disabling CSRF</li>
     *     <li>Custom CORS configuration</li>
     *     <li>JWT-based stateless authentication</li>
     *     <li>Authorization rules for different endpoints</li>
     *     <li>Custom entry point for unauthorized access</li>
     * </ul>
     *
     * @param http the {@link HttpSecurity} object to customize
     * @return the configured {@link SecurityFilterChain}
     * @throws Exception if an error occurs during configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/auth/avatar").authenticated()
                .requestMatchers("/openai/**").authenticated()
                .requestMatchers("/review/**").authenticated()
                .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/user/**").hasAuthority("ROLE_USER")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Unauthorized: Access denied from spring security");
                })
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
                .contentSecurityPolicy(csp -> csp.policyDirectives("script-src 'self'"))
            );

        return http.build();
    }

    /**
     * Configures CORS settings to allow requests from the frontend development URL.
     * <p>Supports credentials and standard HTTP methods like GET, POST, PUT, DELETE.</p>
     *
     * @return a configured {@link CorsConfigurationSource}
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendDevUrl, frontendProdUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
