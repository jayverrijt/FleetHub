package nl.fleethub.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import nl.fleethub.backend.controller.StopController;
import nl.fleethub.backend.controller.TrackingController;
import nl.fleethub.backend.controller.VehicleController;
import nl.fleethub.backend.dto.CustomerTrackingResponse;
import nl.fleethub.backend.dto.UpdateStopStatusRequest;
import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import nl.fleethub.backend.service.AuthService;
import nl.fleethub.backend.service.StopService;
import nl.fleethub.backend.service.VehicleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {TrackingController.class, StopController.class, VehicleController.class})
@Import({SecurityConfig.class, JwtTokenProvider.class})
class SecurityAccessIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StopService stopService;

    @MockBean
    private VehicleService vehicleService;

    @MockBean
    private AuthService authService;

    @MockBean
    private SpringDataUserRepository userRepository;

    // --- 1. PUBLIEK (ANONIEM) ---

    @Test
    @DisplayName("SEC-01: Anonieme gebruiker kan publieke track & trace raadplegen (200 OK)")
    void anonymous_CanAccessTracking() throws Exception {
        CustomerTrackingResponse response = new CustomerTrackingResponse();
        response.setOrderNumber("ORD-1001");
        when(stopService.getTrackingInfo("ORD-1001")).thenReturn(response);

        mockMvc.perform(get("/api/tracking/ORD-1001"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SEC-02: Anonieme bezoeker krijgt 401 Unauthorized op InDrive stops")
    void anonymous_CannotAccessStops() throws Exception {
        mockMvc.perform(patch("/api/stops/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"DELIVERED\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("SEC-03: Anonieme bezoeker krijgt 401 Unauthorized op vlootbeheer")
    void anonymous_CannotAccessVehicles() throws Exception {
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isUnauthorized());
    }

    // --- 2. DISPATCHER ACCESS ---

    @Test
    @WithMockUser(authorities = "ROLE_DISPATCHER")
    @DisplayName("SEC-04: Dispatcher HEEFT toegang tot wagenparkbeheer (200 OK)")
    void dispatcher_CanAccessVehicles() throws Exception {
        Vehicle vehicle = new Vehicle(1L, "V-101-BB", "Mercedes eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        when(vehicleService.getAllVehicles()).thenReturn(List.of(vehicle));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ROLE_DISPATCHER")
    @DisplayName("SEC-05: Dispatcher HEEFT GEEN toegang tot InDrive stopmutaties (403 Forbidden)")
    void dispatcher_CannotMutateInDriveStops() throws Exception {
        UpdateStopStatusRequest request = new UpdateStopStatusRequest();
        request.setStatus(StopStatus.DELIVERED);

        mockMvc.perform(patch("/api/stops/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // --- 3. COURIER ACCESS ---

    @Test
    @WithMockUser(authorities = "ROLE_COURIER")
    @DisplayName("SEC-06: Chauffeur HEEFT toegang tot InDrive stopmutaties (200 OK)")
    void courier_CanMutateInDriveStops() throws Exception {
        DeliveryStop stop = new DeliveryStop();
        stop.setStatus(StopStatus.DELIVERED);
        when(stopService.updateStopStatus(eq(1L), any())).thenReturn(stop);

        UpdateStopStatusRequest request = new UpdateStopStatusRequest();
        request.setStatus(StopStatus.DELIVERED);

        mockMvc.perform(patch("/api/stops/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ROLE_COURIER")
    @DisplayName("SEC-07: Chauffeur HEEFT GEEN toegang tot wagenparkbeheer (403 Forbidden)")
    void courier_CannotAccessVehicles() throws Exception {
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isForbidden());
    }
}