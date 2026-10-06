package nl.fleethub.backend.repository.interfaces;

import nl.fleethub.backend.model.Vehicle;

import java.util.List;
import java.util.Optional;

public interface VehicleReadRepository {
    List<Vehicle> findAll();
    Optional<Vehicle> findById(Long id);
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    Optional<Vehicle> findByDriverId(Long driverId);
}