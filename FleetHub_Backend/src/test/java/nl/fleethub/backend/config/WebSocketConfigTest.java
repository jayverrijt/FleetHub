package nl.fleethub.backend.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketConfigTest {

    @Mock
    private MessageBrokerRegistry messageBrokerRegistry;

    @Mock
    private StompEndpointRegistry stompEndpointRegistry;

    @Mock
    private StompWebSocketEndpointRegistration endpointRegistration;

    @Test
    @DisplayName("UT-WS-01: Configures broker prefixes /topic and /app")
    void configureMessageBroker_RegistersCorrectPrefixes() {
        WebSocketConfig config = new WebSocketConfig();

        config.configureMessageBroker(messageBrokerRegistry);

        verify(messageBrokerRegistry, times(1)).enableSimpleBroker("/topic");
        verify(messageBrokerRegistry, times(1)).setApplicationDestinationPrefixes("/app");
    }

    @Test
    @DisplayName("UT-WS-02: Registers Stomp endpoint /ws/fleet with CORS patterns")
    void registerStompEndpoints_RegistersEndpointWithCors() {
        WebSocketConfig config = new WebSocketConfig();
        when(stompEndpointRegistry.addEndpoint("/ws/fleet")).thenReturn(endpointRegistration);
        when(endpointRegistration.setAllowedOriginPatterns(any(String[].class))).thenReturn(endpointRegistration);

        config.registerStompEndpoints(stompEndpointRegistry);

        verify(stompEndpointRegistry, times(1)).addEndpoint("/ws/fleet");
        verify(endpointRegistration, times(1)).setAllowedOriginPatterns(any(String[].class));
    }
}