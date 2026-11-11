package nl.fleethub.backend.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WebSocketConfigTest {

    @Test
    @DisplayName("UT-WS-01: configureMessageBroker stelt topic broker en /app prefix in")
    void configureMessageBroker_ConfiguresBroker() {
        WebSocketConfig config = new WebSocketConfig();
        MessageBrokerRegistry registry = mock(MessageBrokerRegistry.class);

        config.configureMessageBroker(registry);

        verify(registry, times(1)).enableSimpleBroker("/topic");
        verify(registry, times(1)).setApplicationDestinationPrefixes("/app");
    }

    @Test
    @DisplayName("UT-WS-02: registerStompEndpoints parseert geconfigureerde allowed origins correct")
    void registerStompEndpoints_CustomOrigins() {
        WebSocketConfig config = new WebSocketConfig("https://app1.fleethub.test, https://app2.fleethub.test");
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration registration = mock(StompWebSocketEndpointRegistration.class);

        when(registry.addEndpoint("/ws/fleet")).thenReturn(registration);
        when(registration.setAllowedOriginPatterns(any(String[].class))).thenReturn(registration);

        config.registerStompEndpoints(registry);

        ArgumentCaptor<String[]> captor = ArgumentCaptor.forClass(String[].class);
        verify(registry).addEndpoint("/ws/fleet");
        verify(registration).setAllowedOriginPatterns(captor.capture());
        assertArrayEquals(new String[]{"https://app1.fleethub.test", "https://app2.fleethub.test"}, captor.getValue());
    }

    @Test
    @DisplayName("UT-WS-03: registerStompEndpoints valt terug op veilige origin bij lege origins string")
    void registerStompEndpoints_BlankOrigins_FallbackSafeOrigin() {
        WebSocketConfig config = new WebSocketConfig("");
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration registration = mock(StompWebSocketEndpointRegistration.class);

        when(registry.addEndpoint("/ws/fleet")).thenReturn(registration);
        when(registration.setAllowedOriginPatterns(any(String[].class))).thenReturn(registration);

        config.registerStompEndpoints(registry);

        ArgumentCaptor<String[]> captor = ArgumentCaptor.forClass(String[].class);
        verify(registration).setAllowedOriginPatterns(captor.capture());
        assertArrayEquals(new String[]{"https://fleethub.local"}, captor.getValue());
    }

    @Test
    @DisplayName("UT-WS-04: registerStompEndpoints valt terug op veilige origin bij null origins")
    void registerStompEndpoints_NullOrigins_FallbackSafeOrigin() {
        WebSocketConfig config = new WebSocketConfig(null);
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration registration = mock(StompWebSocketEndpointRegistration.class);

        when(registry.addEndpoint("/ws/fleet")).thenReturn(registration);
        when(registration.setAllowedOriginPatterns(any(String[].class))).thenReturn(registration);

        config.registerStompEndpoints(registry);

        ArgumentCaptor<String[]> captor = ArgumentCaptor.forClass(String[].class);
        verify(registration).setAllowedOriginPatterns(captor.capture());
        assertArrayEquals(new String[]{"https://fleethub.local"}, captor.getValue());
    }
}