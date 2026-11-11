package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.DriverLocationPayload;
import nl.fleethub.backend.service.FleetTelemetryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DriverTelemetryControllerTest {

    @Mock
    private FleetTelemetryService telemetryService;

    @InjectMocks
    private DriverTelemetryController controller;

    private DriverLocationPayload samplePayload;

    @BeforeEach
    void setUp() {
        samplePayload = new DriverLocationPayload();
        samplePayload.setDriverId(1L);
        samplePayload.setDriverName("Jan de Vries");
        samplePayload.setVehicleId(10L);
        samplePayload.setLatitude(51.4416);
        samplePayload.setLongitude(5.4697);
        samplePayload.setSpeed(12.5);
        samplePayload.setHeading(90.0);
        samplePayload.setTimestamp(Instant.now());
    }

    @Test
    @DisplayName("UT-TEL-01: Broadcast stuurt telemetrie door naar service en behoudt bestaande timestamp")
    void broadcastDriverLocation_WithTimestamp_PassesToService() {
        when(telemetryService.recordTelemetry(any(DriverLocationPayload.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DriverLocationPayload result = controller.broadcastDriverLocation(samplePayload);

        assertNotNull(result);
        assertEquals(samplePayload.getVehicleId(), result.getVehicleId());
        verify(telemetryService, times(1)).recordTelemetry(samplePayload);
    }

    @Test
    @DisplayName("UT-TEL-02: Broadcast vult timestamp in indien afwezig")
    void broadcastDriverLocation_WithoutTimestamp_SetsCurrentTimestamp() {
        DriverLocationPayload payloadWithoutTimestamp = new DriverLocationPayload();
        payloadWithoutTimestamp.setVehicleId(2L);
        payloadWithoutTimestamp.setDriverName("Sophie Bakker");

        when(telemetryService.recordTelemetry(any(DriverLocationPayload.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DriverLocationPayload result = controller.broadcastDriverLocation(payloadWithoutTimestamp);

        assertNotNull(result.getTimestamp());
        verify(telemetryService, times(1)).recordTelemetry(payloadWithoutTimestamp);
    }

    @Test
    @DisplayName("UT-TEL-03: getActiveFleetPositions haalt snapshot op via service")
    void getActiveFleetPositions_ReturnsSnapshot() {
        when(telemetryService.getActiveFleetSnapshot()).thenReturn(List.of(samplePayload));

        Collection<DriverLocationPayload> snapshot = controller.getActiveFleetPositions();

        assertNotNull(snapshot);
        assertEquals(1, snapshot.size());
        verify(telemetryService, times(1)).getActiveFleetSnapshot();
    }
}