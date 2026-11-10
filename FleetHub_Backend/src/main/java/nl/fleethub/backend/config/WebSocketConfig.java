package nl.fleethub.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins = "http://localhost:3000,http://localhost:5173";

    // Constructor voor tests (optioneel, handig als unittests specifieke origins willen injecteren)
    public WebSocketConfig() {
    }

    public WebSocketConfig(String allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String originsToParse = (allowedOrigins != null && !allowedOrigins.isBlank())
                ? allowedOrigins
                : "http://localhost:3000,http://localhost:5173";

        String[] origins = Arrays.stream(originsToParse.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);

        registry.addEndpoint("/ws/fleet")
                .setAllowedOriginPatterns(origins);
    }
}