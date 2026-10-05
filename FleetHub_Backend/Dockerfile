# Runtime stage met een lichte JRE 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Kopieer de reeds gebouwde jar (afkomstig uit de CI pipeline of lokale build)
COPY build/libs/*.jar app.jar

# Exposeer de poort waarop Spring Boot luistert
EXPOSE 8080

# Start de applicatie
ENTRYPOINT ["java", "-jar", "app.jar"]