package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.DriverLocationPayload;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class DriverTelemetryControllerTest {

    private final DriverTelemetryController controller = new DriverTelemetryController();

    @Test
    @DisplayName("UT-TEL-01: broadcastDriverLocation retourneert telemetry payload met actuele timestamp")
    void broadcastDriverLocation_ReturnsPayloadWithTimestamp() {
        DriverLocationPayload payload = new DriverLocationPayload();
        payload.setDriverId(1L);
        payload.setDriverName("Jan de Vries");
        payload.setLatitude(51.4416);
        payload.setLongitude(5.4697);
        payload.setSpeed(12.5);
        payload.setHeading(90.0);
        payload.setTimestamp(null); // Geen timestamp meegegeven

        DriverLocationPayload result = controller.broadcastDriverLocation(payload);

        assertNotNull(result);
        assertEquals(1L, result.getDriverId());
        assertEquals("Jan de Vries", result.getDriverName());
        assertEquals(51.4416, result.getLatitude());
        assertEquals(5.4697, result.getLongitude());
        assertNotNull(result.getTimestamp()); // Controller vult automatisch Instant.now() aan
    }

    @Test
    @DisplayName("UT-TEL-02: broadcastDriverLocation behoudt bestaande timestamp")
    void broadcastDriverLocation_KeepsExistingTimestamp() {
        Instant specificTime = Instant.parse("2026-11-06T12:00:00Z");
        DriverLocationPayload payload = new DriverLocationPayload(
                1L, "Jan de Vries", 101L, 51.4416, 5.4697, 10.0, 180.0, specificTime
        );

        DriverLocationPayload result = controller.broadcastDriverLocation(payload);

        assertEquals(specificTime, result.getTimestamp());
    }
}