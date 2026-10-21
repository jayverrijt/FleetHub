package nl.fleethub.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import nl.fleethub.backend.dto.AuthResponse;
import nl.fleethub.backend.dto.LoginRequest;
import nl.fleethub.backend.exception.GlobalExceptionHandler;
import nl.fleethub.backend.model.Role;
import nl.fleethub.backend.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Zorgt dat de filter chain de controller tests niet blokkeert
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("API-AUTH-01: Succesvol inloggen retourneert 200 OK en JWT")
    void login_Success() throws Exception {
        LoginRequest request = new LoginRequest("driver1@fleethub.nl", "password123");
        AuthResponse response = new AuthResponse("mocked-jwt-token", 1L, "driver1@fleethub.nl", "John Doe", Role.ROLE_COURIER);

        when(authService.authenticate(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"))
                .andExpect(jsonPath("$.role").value("ROLE_COURIER"))
                .andExpect(jsonPath("$.email").value("driver1@fleethub.nl"));
    }

    @Test
    @DisplayName("API-AUTH-02: Ongeldige invoer (lege velden) triggert Bean Validation 400 Bad Request")
    void login_InvalidInput_Returns400() throws Exception {
        LoginRequest invalidRequest = new LoginRequest("", ""); // Lege body

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    @DisplayName("API-AUTH-03: Verkeerde credentials triggert 400 Bad Request via GlobalExceptionHandler")
    void login_InvalidCredentials_Returns400() throws Exception {
        LoginRequest request = new LoginRequest("driver1@fleethub.nl", "wrongPassword");

        when(authService.authenticate(any(LoginRequest.class)))
                .thenThrow(new IllegalArgumentException("Ongeldige inloggegevens"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ongeldige inloggegevens"));
    }
}