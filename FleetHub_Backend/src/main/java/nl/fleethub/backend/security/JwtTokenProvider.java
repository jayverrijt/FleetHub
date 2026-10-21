package nl.fleethub.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import nl.fleethub.backend.model.User;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // Minimaal 256-bit geheime sleutel voor HMAC-SHA256
    private static final String SECRET_STRING = "FleetHubSecretKeyForJwtTokenGenerationSecurity2026Semester3!";
    private static final long EXPIRATION_TIME_MS = 86400000; // 24 uur

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME_MS);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("name", user.getFullName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}