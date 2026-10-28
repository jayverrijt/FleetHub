package nl.fleethub.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("SEC-01: Geldig token uit HttpOnly cookie stelt Authentication in")
    void doFilterInternal_ValidCookie_AuthenticatesUser() throws Exception {
        Cookie jwtCookie = new Cookie("jwt_token", "valid-cookie-token");
        when(request.getCookies()).thenReturn(new Cookie[]{jwtCookie});
        when(jwtTokenProvider.validateToken("valid-cookie-token")).thenReturn(true);
        when(jwtTokenProvider.getEmailFromToken("valid-cookie-token")).thenReturn("driver@fleethub.nl");
        when(jwtTokenProvider.getRoleFromToken("valid-cookie-token")).thenReturn("ROLE_COURIER");

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("driver@fleethub.nl", auth.getName());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COURIER")));
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("SEC-02: Fallback naar Bearer header wanneer cookies ontbreken")
    void doFilterInternal_ValidBearerHeader_AuthenticatesUser() throws Exception {
        when(request.getCookies()).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer valid-header-token");
        when(jwtTokenProvider.validateToken("valid-header-token")).thenReturn(true);
        when(jwtTokenProvider.getEmailFromToken("valid-header-token")).thenReturn("dispatcher@fleethub.nl");
        when(jwtTokenProvider.getRoleFromToken("valid-header-token")).thenReturn("ROLE_DISPATCHER");

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("dispatcher@fleethub.nl", auth.getName());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DISPATCHER")));
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("SEC-03: Geen cookie en geen header stelt géén Authentication in")
    void doFilterInternal_NoToken_DoesNotAuthenticate() throws Exception {
        when(request.getCookies()).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain, times(1)).doFilter(request, response);
        verify(jwtTokenProvider, never()).validateToken(anyString());
    }

    @Test
    @DisplayName("SEC-04: Verlopen of gemanipuleerd token stelt géén Authentication in")
    void doFilterInternal_InvalidToken_DoesNotAuthenticate() throws Exception {
        Cookie jwtCookie = new Cookie("jwt_token", "tampered-token");
        when(request.getCookies()).thenReturn(new Cookie[]{jwtCookie});
        when(jwtTokenProvider.validateToken("tampered-token")).thenReturn(false);

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain, times(1)).doFilter(request, response);
    }
}