package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.DriverLocationPayload;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class DriverTelemetryController {

    /**
     * Vangt inkomende telemetrie van chauffeurs op via destination: /app/driver/location
     * Stuurt deze direct door naar alle geabonneerde dispatchers op: /topic/fleet/locations
     */
    @MessageMapping("/driver/location")
    @SendTo("/topic/fleet/locations")
    public DriverLocationPayload broadcastDriverLocation(DriverLocationPayload telemetry) {
        if (telemetry.getTimestamp() == null) {
            telemetry.setTimestamp(Instant.now());
        }
        return telemetry;
    }
}