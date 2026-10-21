package nl.fleethub.backend.security;

import jakarta.servlet.http.HttpServletResponse;
import nl.fleethub.backend.model.Role;
import nl.fleethub.backend.model.User;
import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtTokenProvider);

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authEx) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Niet geauthenticeerd"))
                        .accessDeniedHandler((request, response, accessEx) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Geen toegang voor deze rol"))
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. Publiek toegankelijk (zonder inloggen)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/tracking/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Chauffeur (InDrive stops en chauffeursroutes)
                        .requestMatchers("/api/driver/**").hasAuthority("ROLE_COURIER")
                        .requestMatchers("/api/stops/**").hasAuthority("ROLE_COURIER")

                        // 3. Routes: toegankelijk voor zowel chauffeur als dispatcher
                        .requestMatchers("/api/routes/**").hasAnyAuthority("ROLE_COURIER", "ROLE_DISPATCHER")

                        // 4. Dispatcher: uitsluitend wagenparkbeheer
                        .requestMatchers("/api/vehicles/**").hasAuthority("ROLE_DISPATCHER")

                        // 5. Fallback: alles wat hierboven niet staat vereist een geldige login
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Zorgt dat de testaccounts altijd bestaan met een gegarandeerd correcte BCrypt hash van 'password123'
     */
    @Bean
    public CommandLineRunner initUsers(SpringDataUserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByEmail("driver1@fleethub.nl").ifPresentOrElse(
                    user -> {
                        user.setPassword(passwordEncoder.encode("password123"));
                        user.setRole(Role.ROLE_COURIER);
                        userRepository.save(user);
                    },
                    () -> userRepository.save(new User(null, "driver1@fleethub.nl", passwordEncoder.encode("password123"), "Jan de Vries", Role.ROLE_COURIER))
            );

            userRepository.findByEmail("dispatcher@fleethub.nl").ifPresentOrElse(
                    user -> {
                        user.setPassword(passwordEncoder.encode("password123"));
                        user.setRole(Role.ROLE_DISPATCHER);
                        userRepository.save(user);
                    },
                    () -> userRepository.save(new User(null, "dispatcher@fleethub.nl", passwordEncoder.encode("password123"), "Tim de Planner", Role.ROLE_DISPATCHER))
            );
        };
    }
}