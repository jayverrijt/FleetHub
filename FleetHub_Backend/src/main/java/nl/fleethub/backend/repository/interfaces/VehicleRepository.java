package nl.fleethub.backend.repository.interfaces;

import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository {
    List<Vehicle> findAll();
    Optional<Vehicle> findById(Long id);
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    Optional<Vehicle> findByDriverId(Long driverId);
    Vehicle save(Vehicle vehicle);
    Vehicle updateStatus(Long id, VehicleStatus status);
}