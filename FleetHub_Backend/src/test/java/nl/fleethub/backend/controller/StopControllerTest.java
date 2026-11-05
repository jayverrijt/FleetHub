package nl.fleethub.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import nl.fleethub.backend.dto.CreateStopRequest;
import nl.fleethub.backend.dto.UpdateStopStatusRequest;
import nl.fleethub.backend.exception.GlobalExceptionHandler;
import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.service.StopService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StopController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class StopControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StopService stopService;

    @Test
    @DisplayName("API-02: PATCH /api/stops/{id}/status - Geeft HTTP 200 bij geldige statusupdate")
    void updateStopStatus_Success() throws Exception {
        DeliveryStop updatedStop = new DeliveryStop(
                1L, 104L, 1L, "ORD-1001", "Fontys Rachelsmolen R1",
                1, "Rachelsmolen 1", "Eindhoven", 51.4518, 5.4815,
                StopStatus.DELIVERED, null, null
        );

        when(stopService.updateStopStatus(eq(1L), eq(StopStatus.DELIVERED))).thenReturn(updatedStop);

        UpdateStopStatusRequest request = new UpdateStopStatusRequest();
        request.setStatus(StopStatus.DELIVERED);

        mockMvc.perform(patch("/api/stops/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        verify(stopService, times(1)).updateStopStatus(eq(1L), eq(StopStatus.DELIVERED));
    }

    @Test
    @DisplayName("API-03: PATCH /api/stops/{id}/status - Geeft HTTP 400 bij ongeldige invoer (null status)")
    void updateStopStatus_ValidationError() throws Exception {
        UpdateStopStatusRequest request = new UpdateStopStatusRequest();
        request.setStatus(null);

        mockMvc.perform(patch("/api/stops/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(stopService, never()).updateStopStatus(any(), any());
    }

    @Test
    @DisplayName("API-04: PATCH /api/stops/{id}/status - Geeft HTTP 404 als stop niet bestaat")
    void updateStopStatus_NotFound() throws Exception {
        when(stopService.updateStopStatus(eq(999L), any()))
                .thenThrow(new IllegalArgumentException("Stop with id 999 not found"));

        UpdateStopStatusRequest request = new UpdateStopStatusRequest();
        request.setStatus(StopStatus.DELIVERED);

        mockMvc.perform(patch("/api/stops/999/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("API-05: POST /api/stops - Maakt stop aan en geeft HTTP 201")
    void createStop_Success() throws Exception {
        DeliveryStop createdStop = new DeliveryStop(
                14L, 104L, 1L, "ORD-NEW", "Nieuwe Klant",
                8, "Kanaaldijk-Zuid 7", "Eindhoven", 51.4361, 5.4924,
                StopStatus.PENDING, null, null
        );

        when(stopService.createStop(any(CreateStopRequest.class))).thenReturn(createdStop);

        CreateStopRequest request = new CreateStopRequest();
        request.setRouteId(104L);
        request.setDriverId(1L);
        request.setOrderNumber("ORD-NEW");
        request.setRecipientName("Nieuwe Klant");
        request.setSequenceOrder(8);
        request.setAddress("Kanaaldijk-Zuid 7");
        request.setCity("Eindhoven");

        mockMvc.perform(post("/api/stops")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(14))
                .andExpect(jsonPath("$.orderNumber").value("ORD-NEW"));

        verify(stopService, times(1)).createStop(any(CreateStopRequest.class));
    }
}