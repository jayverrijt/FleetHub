package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.CustomerTrackingResponse;
import nl.fleethub.backend.exception.GlobalExceptionHandler;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.service.StopService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TrackingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StopService stopService;

    @InjectMocks
    private TrackingController trackingController;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(trackingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
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
    void trackOrder_Returns404_WhenOrderNotFound() throws Exception {
        when(stopService.getTrackingInfo("ORD-UNKNOWN"))
                .thenThrow(new IllegalArgumentException("Order with number ORD-UNKNOWN not found"));

        mockMvc.perform(get("/api/tracking/ORD-UNKNOWN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order with number ORD-UNKNOWN not found"));

        verify(stopService, times(1)).getTrackingInfo("ORD-UNKNOWN");
    }
}