package nl.fleethub.backend.security;

import nl.fleethub.backend.controller.RouteController;
import nl.fleethub.backend.controller.StopController;
import nl.fleethub.backend.controller.TrackingController;
import nl.fleethub.backend.controller.VehicleController;
import nl.fleethub.backend.dto.CustomerTrackingResponse;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.jpa.SpringDataRouteRepository;
import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import nl.fleethub.backend.service.StopService;
import nl.fleethub.backend.service.VehicleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({TrackingController.class, StopController.class, RouteController.class, VehicleController.class})
@Import({SecurityConfig.class, JwtTokenProvider.class})
@TestPropertySource(properties = "app.cors.allowed-origins=http://localhost:5173")
class SecurityAccessIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SpringDataUserRepository userRepository;

    @MockBean
    private SpringDataRouteRepository routeRepository;

    @MockBean
    private StopService stopService;

    @MockBean
    private VehicleService vehicleService;

    @Test
    @DisplayName("SEC-ACC-01: Publiek endpoint (/api/tracking) is toegankelijk ZONDER login")
    void publicTracking_AccessibleWithoutLogin() throws Exception {
        CustomerTrackingResponse response = new CustomerTrackingResponse(
                "ORD-1001", "Klant", "Adres 1", "Stad", StopStatus.PENDING, LocalDateTime.now(), null
        );
        when(stopService.getTrackingInfo("ORD-1001")).thenReturn(response);

        mockMvc.perform(get("/api/tracking/ORD-1001"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SEC-ACC-02: Interne stops weigeren anonieme gebruikers met 401 Unauthorized")
    void stops_RejectedWhenAnonymous() throws Exception {
        mockMvc.perform(patch("/api/stops/1/status"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("SEC-ACC-03: Ingelogde Chauffeur (ROLE_COURIER) heeft toegang tot stops")
    @WithMockUser(authorities = "ROLE_COURIER")
    void stops_AccessibleForCourier() throws Exception {
        // Geeft 400 i.p.v. 401/403 omdat er geen body meegegeven is, wat bewijst dat de autorisatielaag gepasseerd is
        mockMvc.perform(patch("/api/stops/1/status"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SEC-ACC-04: Dispatcher (ROLE_DISPATCHER) wordt geweigerd op chauffeursmutaties (403 Forbidden)")
    @WithMockUser(authorities = "ROLE_DISPATCHER")
    void stops_ForbiddenForDispatcher() throws Exception {
        mockMvc.perform(patch("/api/stops/1/status"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("SEC-ACC-05: Chauffeur (ROLE_COURIER) wordt geweigerd op wagenparkbeheer (403 Forbidden)")
    @WithMockUser(authorities = "ROLE_COURIER")
    void vehicles_ForbiddenForCourier() throws Exception {
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("SEC-ACC-06: Dispatcher (ROLE_DISPATCHER) heeft toegang tot wagenparkbeheer")
    @WithMockUser(authorities = "ROLE_DISPATCHER")
    void vehicles_AccessibleForDispatcher() throws Exception {
        when(vehicleService.getAllVehicles()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk());
    }
}