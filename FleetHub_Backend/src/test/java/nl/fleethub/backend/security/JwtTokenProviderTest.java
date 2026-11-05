package nl.fleethub.backend.security;

import nl.fleethub.backend.model.Role;
import nl.fleethub.backend.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        testUser = new User(1L, "driver1@fleethub.nl", "password123", "John Doe", Role.ROLE_COURIER);
    }

    @Test
    @DisplayName("JWT-01: Token succesvol genereren en claims uitlezen")
    void generateToken_AndExtractClaims_Success() {
        String token = jwtTokenProvider.generateToken(testUser);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals("driver1@fleethub.nl", jwtTokenProvider.getEmailFromToken(token));
        assertEquals("ROLE_COURIER", jwtTokenProvider.getRoleFromToken(token));
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    @DisplayName("JWT-02: Ongeldige of gemanipuleerde token retourneert false")
    void validateToken_InvalidToken_ReturnsFalse() {
        assertFalse(jwtTokenProvider.validateToken("invalid.jwt.token"));
        assertFalse(jwtTokenProvider.validateToken(null));
        assertFalse(jwtTokenProvider.validateToken(""));
    }
}