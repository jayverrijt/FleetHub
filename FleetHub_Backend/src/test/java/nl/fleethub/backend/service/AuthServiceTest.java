package nl.fleethub.backend.service;

import nl.fleethub.backend.dto.AuthResponse;
import nl.fleethub.backend.dto.LoginRequest;
import nl.fleethub.backend.model.Role;
import nl.fleethub.backend.model.User;
import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import nl.fleethub.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private SpringDataUserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("UT-AUTH-01: Succesvol inloggen genereert token en response")
    void authenticate_Success() {
        LoginRequest request = new LoginRequest("driver1@fleethub.nl", "password123");
        User user = new User(1L, "driver1@fleethub.nl", "hashedPassword", "John Doe", Role.ROLE_COURIER);

        when(userRepository.findByEmail("driver1@fleethub.nl")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken(user)).thenReturn("sample-jwt");

        AuthResponse response = authService.authenticate(request);

        assertNotNull(response);
        assertEquals("sample-jwt", response.getToken());
        assertEquals("John Doe", response.getFullName());
        assertEquals(Role.ROLE_COURIER, response.getRole());
    }

    @Test
    @DisplayName("UT-AUTH-02: Foutmelding bij onbekende gebruiker")
    void authenticate_UserNotFound() {
        LoginRequest request = new LoginRequest("unknown@fleethub.nl", "password123");
        when(userRepository.findByEmail("unknown@fleethub.nl")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.authenticate(request));

        assertEquals("Ongeldige inloggegevens", ex.getMessage());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("UT-AUTH-03: Foutmelding bij incorrect wachtwoord")
    void authenticate_WrongPassword() {
        LoginRequest request = new LoginRequest("driver1@fleethub.nl", "wrongPassword");
        User user = new User(1L, "driver1@fleethub.nl", "hashedPassword", "John Doe", Role.ROLE_COURIER);

        when(userRepository.findByEmail("driver1@fleethub.nl")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.authenticate(request));

        assertEquals("Ongeldige inloggegevens", ex.getMessage());
        verify(jwtTokenProvider, never()).generateToken(any());
    }
}