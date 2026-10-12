package nl.fleethub.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "driver_id")
    private Long driverId;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(nullable = false)
    private String status;

    public Route() {
    }

    public Route(Long id, String name, Long driverId, Long vehicleId, String status) {
        this.id = id;
        this.name = name;
        this.driverId = driverId;
        this.vehicleId = vehicleId;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}