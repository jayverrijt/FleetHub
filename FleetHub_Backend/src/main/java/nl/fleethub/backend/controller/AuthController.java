package nl.fleethub.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import nl.fleethub.backend.dto.AuthResponse;
import nl.fleethub.backend.dto.LoginRequest;
import nl.fleethub.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.authenticate(request);

        // Maak een beveiligde HttpOnly cookie aan voor het JWT-token
        Cookie jwtCookie = new Cookie("jwt_token", authResponse.getToken());
        jwtCookie.setHttpOnly(true); // Niet uitleesbaar via JavaScript (XSS-bescherming!)
        jwtCookie.setSecure(false);  // Zet op 'true' in productie bij HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(86400);  // 24 uur geldig
        response.addCookie(jwtCookie);

        // We sturen de gebruikersinfo terug in de body (zonder dat het token kwetsbaar in JS staat)
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        // Wis de cookie door maxAge op 0 te zetten
        Cookie cookie = new Cookie("jwt_token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }
}