package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.repository.interfaces.VehicleRepository;
import nl.fleethub.backend.repository.jpa.SpringDataVehicleRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class VehicleDatabaseRepository implements VehicleRepository {

    private final SpringDataVehicleRepository jpaRepository;

    public VehicleDatabaseRepository(SpringDataVehicleRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Vehicle> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public Optional<Vehicle> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<Vehicle> findByLicensePlate(String licensePlate) {
        return jpaRepository.findByLicensePlate(licensePlate);
    }

    @Override
    public Optional<Vehicle> findByDriverId(Long driverId) {
        return jpaRepository.findByAssignedDriverId(driverId);
    }

    @Override
    public Vehicle save(Vehicle vehicle) {
        return jpaRepository.save(vehicle);
    }

    @Override
    public Vehicle updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = jpaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle with id " + id + " not found"));
        vehicle.setStatus(status);
        return jpaRepository.save(vehicle);
    }
}