package nl.fleethub.backend.service;

import nl.fleethub.backend.dto.DriverLocationPayload;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FleetTelemetryService {

    private final ConcurrentHashMap<Long, DriverLocationPayload> activeFleetPositions = new ConcurrentHashMap<>();

    public DriverLocationPayload recordTelemetry(DriverLocationPayload telemetry) {
        if (telemetry != null && telemetry.getVehicleId() != null) {
            activeFleetPositions.put(telemetry.getVehicleId(), telemetry);
        }
        return telemetry;
    }

    public Collection<DriverLocationPayload> getActiveFleetSnapshot() {
        return activeFleetPositions.values();
    }
}