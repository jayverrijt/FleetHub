package nl.fleethub.backend.repository.interfaces;

import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;

public interface VehicleWriteRepository {
    Vehicle save(Vehicle vehicle);
    Vehicle updateStatus(Long id, VehicleStatus status);
}