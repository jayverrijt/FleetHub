package nl.fleethub.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import nl.fleethub.backend.model.VehicleStatus;

public record CreateVehicleRequest(
        @NotBlank(message = "License plate is required")
        String licensePlate,

        @NotBlank(message = "Vehicle model is required")
        String model,

        @NotNull(message = "Vehicle status is required")
        VehicleStatus status,

        @Positive(message = "Battery capacity must be greater than 0")
        int batteryCapacityKwh,

        @Min(value = 0, message = "Current range cannot be negative")
        int currentRangeKm,

        Long assignedDriverId
) {
    public String getLicensePlate() { return licensePlate(); }
    public String getModel() { return model(); }
    public VehicleStatus getStatus() { return status(); }
    public int getBatteryCapacityKwh() { return batteryCapacityKwh(); }
    public int getCurrentRangeKm() { return currentRangeKm(); }
    public Long getAssignedDriverId() { return assignedDriverId(); }
}
