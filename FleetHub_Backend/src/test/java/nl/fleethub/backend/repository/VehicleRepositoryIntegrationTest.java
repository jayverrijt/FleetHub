package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.repository.jpa.SpringDataVehicleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class VehicleRepositoryIntegrationTest {

    @Autowired
    private SpringDataVehicleRepository vehicleRepository;

    @Test
    @DisplayName("IT-03: Vind voertuig op basis van kenteken")
    void findByLicensePlate_ReturnsMatchingVehicle() {
        Vehicle vehicle = new Vehicle(null, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        vehicleRepository.save(vehicle);

        Optional<Vehicle> found = vehicleRepository.findByLicensePlate("V-101-BB");

        assertTrue(found.isPresent());
        assertEquals("Mercedes-Benz eVito", found.get().getModel());
    }

    @Test
    @DisplayName("IT-04: Vind voertuig op basis van assigned driver ID")
    void findByAssignedDriverId_ReturnsAssignedVehicle() {
        Vehicle vehicle = new Vehicle(null, "V-202-CD", "Volkswagen ID. Buzz Cargo", VehicleStatus.ON_ROUTE, 77, 310, 102L);
        vehicleRepository.save(vehicle);

        Optional<Vehicle> found = vehicleRepository.findByAssignedDriverId(102L);

        assertTrue(found.isPresent());
        assertEquals("V-202-CD", found.get().getLicensePlate());
    }
}