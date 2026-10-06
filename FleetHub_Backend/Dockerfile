FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Kopieert uitsluitend het reeds in Job 1 gebouwde JAR-artefact
COPY build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
