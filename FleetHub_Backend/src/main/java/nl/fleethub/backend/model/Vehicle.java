package nl.fleethub.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_plate", nullable = false, unique = true)
    private String licensePlate;

    @Column(nullable = false)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @Column(name = "battery_capacity_kwh")
    private int batteryCapacityKwh;

    @Column(name = "current_range_km")
    private int currentRangeKm;

    @Column(name = "assigned_driver_id")
    private Long assignedDriverId;

    // Vereist door JPA/Hibernate
    public Vehicle() {
    }

    public Vehicle(Long id, String licensePlate, String model, VehicleStatus status,
                   int batteryCapacityKwh, int currentRangeKm, Long assignedDriverId) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.model = model;
        this.status = status;
        this.batteryCapacityKwh = batteryCapacityKwh;
        this.currentRangeKm = currentRangeKm;
        this.assignedDriverId = assignedDriverId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }

    public int getBatteryCapacityKwh() {
        return batteryCapacityKwh;
    }

    public void setBatteryCapacityKwh(int batteryCapacityKwh) {
        this.batteryCapacityKwh = batteryCapacityKwh;
    }

    public int getCurrentRangeKm() {
        return currentRangeKm;
    }

    public void setCurrentRangeKm(int currentRangeKm) {
        this.currentRangeKm = currentRangeKm;
    }

    public Long getAssignedDriverId() {
        return assignedDriverId;
    }

    public void setAssignedDriverId(Long assignedDriverId) {
        this.assignedDriverId = assignedDriverId;
    }
}