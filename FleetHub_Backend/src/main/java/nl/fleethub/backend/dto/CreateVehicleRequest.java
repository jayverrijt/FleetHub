package nl.fleethub.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import nl.fleethub.backend.model.VehicleStatus;

public class CreateVehicleRequest {

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    @NotBlank(message = "Vehicle model is required")
    private String model;

    @NotNull(message = "Vehicle status is required")
    private VehicleStatus status;

    @Positive(message = "Battery capacity must be greater than 0")
    private int batteryCapacityKwh;

    @Min(value = 0, message = "Current range cannot be negative")
    private int currentRangeKm;

    private Long assignedDriverId; // Kan null zijn voor het geval er geen chauffeur assigned is.

    public CreateVehicleRequest() {}

    public CreateVehicleRequest(String licensePlate, String model, VehicleStatus status,
                                int batteryCapacityKwh, int currentRangeKm, Long assignedDriverId) {
        this.licensePlate = licensePlate;
        this.model = model;
        this.status = status;
        this.batteryCapacityKwh = batteryCapacityKwh;
        this.currentRangeKm = currentRangeKm;
        this.assignedDriverId = assignedDriverId;
    }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public VehicleStatus getStatus() { return status; }
    public void setStatus(VehicleStatus status) { this.status = status; }

    public int getBatteryCapacityKwh() { return batteryCapacityKwh; }
    public void setBatteryCapacityKwh(int batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }

    public int getCurrentRangeKm() { return currentRangeKm; }
    public void setCurrentRangeKm(int currentRangeKm) { this.currentRangeKm = currentRangeKm; }

    public Long getAssignedDriverId() { return assignedDriverId; }
    public void setAssignedDriverId(Long assignedDriverId) { this.assignedDriverId = assignedDriverId; }
}