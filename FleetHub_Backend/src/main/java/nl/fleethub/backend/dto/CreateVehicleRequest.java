package nl.fleethub.backend.dto;

import nl.fleethub.backend.model.VehicleStatus;

public class CreateVehicleRequest {
    private String licensePlate;
    private String model;
    private VehicleStatus status;
    private int batteryCapacityKwh;
    private int currentRangeKm;
    private Long assignedDriverId;

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