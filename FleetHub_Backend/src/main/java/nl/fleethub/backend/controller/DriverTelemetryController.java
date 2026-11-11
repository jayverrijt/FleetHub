package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.DriverLocationPayload;
import nl.fleethub.backend.service.FleetTelemetryService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Collection;

@RestController
public class DriverTelemetryController {

    private final FleetTelemetryService telemetryService;

    public DriverTelemetryController(FleetTelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @MessageMapping("/driver/location")
    @SendTo("/topic/fleet/locations")
    public DriverLocationPayload broadcastDriverLocation(DriverLocationPayload telemetry) {
        if (telemetry.getTimestamp() == null) {
            telemetry.setTimestamp(Instant.now());
        }
        return telemetryService.recordTelemetry(telemetry);
    }

    @GetMapping("/api/fleet/positions")
    public Collection<DriverLocationPayload> getActiveFleetPositions() {
        return telemetryService.getActiveFleetSnapshot();
    }
}