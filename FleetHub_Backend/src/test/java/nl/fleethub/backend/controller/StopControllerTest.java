package nl.fleethub.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import nl.fleethub.backend.dto.UpdateStopStatusRequest;
import nl.fleethub.backend.exception.GlobalExceptionHandler;
import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.service.StopService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StopController.class)
@Import(GlobalExceptionHandler.class)
class StopControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StopService stopService;

    @Test
    @DisplayName("API-01: GET /api/driver/routes/active geeft HTTP 200 en stops terug")
    void getActiveDriverRoute_Returns200AndList() throws Exception {
        DeliveryStop stop = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.PENDING, 101L);
        when(stopService.getActiveStopsForDriver(101L)).thenReturn(List.of(stop));

        mockMvc.perform(get("/api/driver/routes/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("ORD-1001"));

        verify(stopService, times(1)).getActiveStopsForDriver(101L);
    }

    @Test
    @DisplayName("API-02: PATCH /api/stops/{id}/status geeft HTTP 200 bij geldige update")
    void updateStopStatus_Success_Returns200() throws Exception {
        DeliveryStop updatedStop = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.DELIVERED, 101L);
        when(stopService.updateStopStatus(1L, StopStatus.DELIVERED)).thenReturn(updatedStop);

        UpdateStopStatusRequest request = new UpdateStopStatusRequest(StopStatus.DELIVERED);

        mockMvc.perform(patch("/api/stops/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        verify(stopService, times(1)).updateStopStatus(1L, StopStatus.DELIVERED);
    }

    @Test
    @DisplayName("API-03: PATCH /api/stops/{id}/status geeft HTTP 400 bij ongeldige invoer")
    void updateStopStatus_Failure_Returns400() throws Exception {
        when(stopService.updateStopStatus(1L, StopStatus.PENDING))
                .thenThrow(new IllegalArgumentException("Cannot reset stop status back to PENDING"));

        UpdateStopStatusRequest request = new UpdateStopStatusRequest(StopStatus.PENDING);

        mockMvc.perform(patch("/api/stops/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Cannot reset stop status back to PENDING"));

        verify(stopService, times(1)).updateStopStatus(1L, StopStatus.PENDING);
    }

    @Test
    @DisplayName("API-04: PATCH /api/stops/{id}/status geeft HTTP 404 als stop niet bestaat")
    void updateStopStatus_NotFound_Returns404() throws Exception {
        when(stopService.updateStopStatus(999L, StopStatus.DELIVERED))
                .thenThrow(new IllegalArgumentException("Stop with id 999 not found"));

        UpdateStopStatusRequest request = new UpdateStopStatusRequest(StopStatus.DELIVERED);

        mockMvc.perform(patch("/api/stops/999/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Stop with id 999 not found"));

        verify(stopService, times(1)).updateStopStatus(999L, StopStatus.DELIVERED);
    }
}