package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.DriverLocationPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class DriverTelemetryControllerTest {

    private DriverTelemetryController controller;

    @BeforeEach
    void setUp() {
        controller = new DriverTelemetryController();
    }

    @Test
    @DisplayName("UT-TEL-01: Broadcasts telemetry when timestamp is already present")
    void broadcastDriverLocation_WithExistingTimestamp() {
        Instant fixedTimestamp = Instant.parse("2026-11-05T12:00:00Z");
        DriverLocationPayload payload = new DriverLocationPayload(
                1L,
                "Jan de Vries",
                10L,
                51.4416,
                5.4697,
                12.5,
                90.0,
                fixedTimestamp
        );

        DriverLocationPayload result = controller.broadcastDriverLocation(payload);

        assertNotNull(result);
        assertEquals(1L, result.getDriverId());
        assertEquals("Jan de Vries", result.getDriverName());
        assertEquals(10L, result.getVehicleId());
        assertEquals(51.4416, result.getLatitude());
        assertEquals(5.4697, result.getLongitude());
        assertEquals(12.5, result.getSpeed());
        assertEquals(90.0, result.getHeading());
        assertEquals(fixedTimestamp, result.getTimestamp());
    }

    @Test
    @DisplayName("UT-TEL-02: Assigns a new timestamp when timestamp is null (covers fallback branch)")
    void broadcastDriverLocation_WithNullTimestamp_GeneratesNewTimestamp() {
        DriverLocationPayload payload = new DriverLocationPayload();
        payload.setDriverId(2L);
        payload.setDriverName("Piet");
        payload.setLatitude(51.4500);
        payload.setLongitude(5.4800);
        payload.setTimestamp(null); // Forceer null om de if-tak te raken

        DriverLocationPayload result = controller.broadcastDriverLocation(payload);

        assertNotNull(result);
        assertNotNull(result.getTimestamp(), "Timestamp moet automatisch ingevuld worden door de controller");
        assertTrue(result.getTimestamp().isBefore(Instant.now().plusSeconds(2)));
    }
}