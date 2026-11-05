# Runtime container met Eclipse Temurin JRE 21 Alpine
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Kopieer uitsluitend de in CI/lokaal gebouwde JAR
COPY build/libs/*.jar app.jar

# Spring Boot default poort
EXPOSE 8080

# Start de applicatie
ENTRYPOINT ["java", "-jar", "app.jar"]

