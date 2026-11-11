package nl.fleethub.backend.service;

import nl.fleethub.backend.dto.DriverLocationPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class FleetTelemetryServiceTest {

    private FleetTelemetryService service;

    @BeforeEach
    void setUp() {
        service = new FleetTelemetryService();
    }

    @Test
    @DisplayName("UT-FLEET-01: Correct updates and aggregates multiple vehicles")
    void recordTelemetry_StoresMultipleVehicles() {
        DriverLocationPayload van1 = new DriverLocationPayload(1L, "Jan", 10L, 51.44, 5.46, 10.0, 90.0, Instant.now());
        DriverLocationPayload van2 = new DriverLocationPayload(2L, "Sophie", 20L, 51.45, 5.47, 12.0, 180.0, Instant.now());

        service.recordTelemetry(van1);
        service.recordTelemetry(van2);

        Collection<DriverLocationPayload> snapshot = service.getActiveFleetSnapshot();
        assertEquals(2, snapshot.size());
    }

    @Test
    @DisplayName("UT-FLEET-02: Overwrites prior vehicle telemetry on position update")
    void recordTelemetry_UpdatesVehiclePositionInPlace() {
        DriverLocationPayload pos1 = new DriverLocationPayload(1L, "Jan", 10L, 51.44, 5.46, 10.0, 90.0, Instant.now());
        DriverLocationPayload pos2 = new DriverLocationPayload(1L, "Jan", 10L, 51.46, 5.49, 15.0, 120.0, Instant.now());

        service.recordTelemetry(pos1);
        service.recordTelemetry(pos2);

        Collection<DriverLocationPayload> snapshot = service.getActiveFleetSnapshot();
        assertEquals(1, snapshot.size());
        assertEquals(51.46, snapshot.iterator().next().getLatitude());
    }
}