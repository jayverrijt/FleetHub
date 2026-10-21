package nl.fleethub.backend.dto;

import nl.fleethub.backend.model.Role;

public class AuthResponse {

    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private Role role;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String email, String fullName, Role role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public Role getRole() { return role; }
}