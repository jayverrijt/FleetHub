package nl.fleethub.backend.controller;

import jakarta.validation.Valid;
import nl.fleethub.backend.dto.AuthResponse;
import nl.fleethub.backend.dto.LoginRequest;
import nl.fleethub.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }
}