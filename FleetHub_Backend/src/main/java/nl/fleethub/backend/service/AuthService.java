package nl.fleethub.backend.service;

import nl.fleethub.backend.dto.AuthResponse;
import nl.fleethub.backend.dto.LoginRequest;
import nl.fleethub.backend.model.User;
import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import nl.fleethub.backend.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final SpringDataUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(SpringDataUserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Ongeldige inloggegevens"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Ongeldige inloggegevens");
        }

        String token = jwtTokenProvider.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }
}