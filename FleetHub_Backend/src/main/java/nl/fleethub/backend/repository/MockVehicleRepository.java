package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.repository.interfaces.VehicleRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class MockVehicleRepository implements VehicleRepository {

    private final List<Vehicle> vehicles = new ArrayList<>();

    public MockVehicleRepository() {
        vehicles.add(new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.ON_ROUTE, 60, 240, 101L));
        vehicles.add(new Vehicle(2L, "V-202-CD", "Volkswagen ID. Buzz Cargo", VehicleStatus.ON_ROUTE, 77, 310, 102L));
        vehicles.add(new Vehicle(3L, "V-303-EF", "Renault Master E-Tech", VehicleStatus.AVAILABLE, 52, 190, null));
    }

    @Override
    public List<Vehicle> findAll() {
        return new ArrayList<>(vehicles);
    }

    @Override
    public Optional<Vehicle> findById(Long id) {
        return vehicles.stream().filter(v -> v.getId().equals(id)).findFirst();
    }

    @Override
    public Optional<Vehicle> findByDriverId(Long driverId) {
        return vehicles.stream()
                .filter(v -> driverId.equals(v.getAssignedDriverId()))
                .findFirst();
    }

    @Override
    public Vehicle updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle with id " + id + " not found"));
        vehicle.setStatus(status);
        return vehicle;
    }

    @Override
    public Vehicle save(Vehicle vehicle) {
        if (vehicle.getId() == null) {
            long nextId = vehicles.stream()
                    .mapToLong(Vehicle::getId)
                    .max()
                    .orElse(0L) + 1L;
            vehicle.setId(nextId);
        }
        vehicles.add(vehicle);
        return vehicle;
    }

    @Override
    public Optional<Vehicle> findByLicensePlate(String licensePlate) {
        return vehicles.stream()
                .filter(v -> v.getLicensePlate().equalsIgnoreCase(licensePlate))
                .findFirst();
    }
}