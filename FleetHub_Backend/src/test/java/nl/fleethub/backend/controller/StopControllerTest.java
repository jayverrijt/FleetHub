package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.UpdateStopStatusRequest;
import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.service.StopService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StopControllerTest {

    @Mock
    private StopService stopService;

    @InjectMocks
    private StopController stopController;

    @Test
    @DisplayName("API-01: GET /api/driver/routes/active geeft HTTP 200 en stops terug")
    void getActiveDriverRoute_Returns200AndList() {
        DeliveryStop stop = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.PENDING, 101L);
        when(stopService.getActiveStopsForDriver(101L)).thenReturn(List.of(stop));

        ResponseEntity<List<DeliveryStop>> response = stopController.getActiveDriverRoute();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(stopService, times(1)).getActiveStopsForDriver(101L);
    }

    @Test
    @DisplayName("API-02: PATCH /api/stops/{id}/status geeft HTTP 200 bij geldige update")
    void updateStopStatus_Success_Returns200() {
        DeliveryStop updatedStop = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.DELIVERED, 101L);
        when(stopService.updateStopStatus(1L, StopStatus.DELIVERED)).thenReturn(updatedStop);

        UpdateStopStatusRequest request = new UpdateStopStatusRequest(StopStatus.DELIVERED);
        ResponseEntity<?> response = stopController.updateStopStatus(1L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedStop, response.getBody());
        verify(stopService, times(1)).updateStopStatus(1L, StopStatus.DELIVERED);
    }

    @Test
    @DisplayName("API-03: PATCH /api/stops/{id}/status geeft HTTP 400 bij ongeldige invoer")
    void updateStopStatus_Failure_Returns400() {
        when(stopService.updateStopStatus(1L, StopStatus.PENDING))
                .thenThrow(new IllegalArgumentException("Cannot reset stop status back to PENDING"));

        UpdateStopStatusRequest request = new UpdateStopStatusRequest(StopStatus.PENDING);
        ResponseEntity<?> response = stopController.updateStopStatus(1L, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Cannot reset stop status back to PENDING", response.getBody());
        verify(stopService, times(1)).updateStopStatus(1L, StopStatus.PENDING);
    }
}