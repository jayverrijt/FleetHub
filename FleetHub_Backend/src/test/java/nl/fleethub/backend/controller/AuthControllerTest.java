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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("API-AUTH-01: Succesvol inloggen retourneert 200 OK en zet HttpOnly cookie")
    void login_Success_SetsCookieAndReturnsUser() throws Exception {
        LoginRequest request = new LoginRequest("driver1@fleethub.nl", "password123");
        AuthResponse response = new AuthResponse(
                "mocked-jwt-token",
                1L,
                "driver1@fleethub.nl",
                "Jan de Vries",
                Role.ROLE_COURIER
        );

        when(authService.authenticate(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt_token"))
                .andExpect(cookie().httpOnly("jwt_token", true))
                .andExpect(cookie().value("jwt_token", "mocked-jwt-token"))
                .andExpect(jsonPath("$.email").value("driver1@fleethub.nl"))
                .andExpect(jsonPath("$.fullName").value("Jan de Vries"))
                .andExpect(jsonPath("$.role").value("ROLE_COURIER"));
    }

    @Test
    @DisplayName("API-AUTH-02: Uitloggen wist het jwt_token cookie (maxAge = 0)")
    void logout_Success_ClearsCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("jwt_token", 0));
    }

    @Test
    @DisplayName("API-AUTH-03: Ongeldige invoer triggert Bean Validation 400 Bad Request")
    void login_InvalidInput_Returns400() throws Exception {
        LoginRequest request = new LoginRequest("", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}