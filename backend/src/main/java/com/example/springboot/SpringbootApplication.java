package com.example.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The entry point of the Spring Boot application.
 * <p>
 * This class contains the main method that is used to launch the Spring Boot application.
 * The {@link SpringBootApplication} annotation marks it as the primary configuration class,
 * and it enables various features such as component scanning and auto-configuration.
 */
@SpringBootApplication
public class SpringbootApplication {

	/**
     * The main method that starts the Spring Boot application.
     * <p>
     * This method triggers the {@link SpringApplication} to run the application context and start
     * the embedded web server. It initializes the application using the class annotated with 
     * {@link SpringBootApplication}.
     *
     * @param args command-line arguments passed to the application
     */
	public static void main(String[] args) {
		SpringApplication.run(SpringbootApplication.class, args);
	}

}
