# Stage 1: Build stage met Gradle en JDK 21
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Kopieer Gradle wrapper en configuratiebestanden
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Maak de wrapper executable en download dependencies
RUN chmod a+x gradlew
RUN ./gradlew dependencies --no-daemon

# Kopieer broncode en bouw de JAR (tests overslaan omdat die in CI draaien)
COPY src src
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Runtime stage met een lichte JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Kopieer de gebouwde jar vanuit de build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Exposeer de poort waarop Spring Boot luistert
EXPOSE 8080

# Start de applicatie
ENTRYPOINT ["java", "-jar", "app.jar"]