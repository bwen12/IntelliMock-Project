# -------- Stage 1: Build the Spring Boot application --------
FROM openjdk:17-slim AS build

WORKDIR /app

# Copy Maven wrapper and project files
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copy the source code
COPY src ./src

# Build the application and skip tests
RUN ./mvnw clean package -DskipTests

# -------- Stage 2: Run the application --------
FROM openjdk:17-slim

WORKDIR /app

# Create a non-root user for security
RUN useradd -ms /bin/bash appuser
USER appuser

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Set environment variables
ENV JAVA_OPTS=""
ENV TZ=UTC
ENV LANG=C.UTF-8

# Expose the Spring Boot port
EXPOSE 8080

# Start the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
