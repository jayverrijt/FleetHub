package nl.fleethub.backend.service;

import nl.fleethub.backend.dto.CreateVehicleRequest;
import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.repository.interfaces.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle with id " + id + " not found"));
    }

    public Vehicle getVehicleByDriverId(Long driverId) {
        return vehicleRepository.findByDriverId(driverId)
                .orElseThrow(() -> new IllegalArgumentException("No vehicle assigned to driver " + driverId));
    }

    public Vehicle updateVehicleStatus(Long id, VehicleStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        return vehicleRepository.updateStatus(id, status);
    }

    public Vehicle createVehicle(CreateVehicleRequest request) {
        if (request.getLicensePlate() == null || request.getLicensePlate().isBlank()) {
            throw new IllegalArgumentException("License plate is required");
        }
        if (request.getModel() == null || request.getModel().isBlank()) {
            throw new IllegalArgumentException("Vehicle model is required");
        }
        if (request.getCurrentRangeKm() < 0 || request.getBatteryCapacityKwh() <= 0) {
            throw new IllegalArgumentException("Battery capacity and range must be positive numbers");
        }

        String cleanedLicensePlate = request.getLicensePlate().trim().toUpperCase();

        if (vehicleRepository.findByLicensePlate(cleanedLicensePlate).isPresent()) {
            throw new IllegalArgumentException("A vehicle with license plate " + cleanedLicensePlate + " already exists.");
        }

        VehicleStatus initialStatus = request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE;

        Vehicle newVehicle = new Vehicle(
                null,
                cleanedLicensePlate,
                request.getModel().trim(),
                initialStatus,
                request.getBatteryCapacityKwh(),
                request.getCurrentRangeKm(),
                request.getAssignedDriverId()
        );

        return vehicleRepository.save(newVehicle);
    }
}