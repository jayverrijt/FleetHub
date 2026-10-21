package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.CustomerTrackingResponse;
import nl.fleethub.backend.exception.GlobalExceptionHandler;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.service.StopService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TrackingController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class TrackingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StopService stopService;

    @Test
    @DisplayName("API-TRACK-01: trackOrder retourneert 200 OK en tracking details")
    void trackOrder_Returns200AndTrackingDetails() throws Exception {
        CustomerTrackingResponse response = new CustomerTrackingResponse(
                "ORD-1001",
                "Sophie Jansen",
                "Frederiklaan 10",
                "Eindhoven",
                StopStatus.PENDING,
                LocalDateTime.of(2026, 10, 14, 16, 30),
                null
        );

        when(stopService.getTrackingInfo("ORD-1001")).thenReturn(response);

        mockMvc.perform(get("/api/tracking/ORD-1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-1001"))
                .andExpect(jsonPath("$.recipientName").value("Sophie Jansen"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(stopService, times(1)).getTrackingInfo("ORD-1001");
    }

    @Test
    @DisplayName("API-TRACK-02: trackOrder retourneert 404 als order onbekend is")
    void trackOrder_Returns404_WhenOrderNotFound() throws Exception {
        when(stopService.getTrackingInfo("ORD-UNKNOWN"))
                .thenThrow(new IllegalArgumentException("Order with number ORD-UNKNOWN not found"));

        mockMvc.perform(get("/api/tracking/ORD-UNKNOWN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order with number ORD-UNKNOWN not found"));

        verify(stopService, times(1)).getTrackingInfo("ORD-UNKNOWN");
    }
}