package nl.fleethub.backend.dto;

import java.time.Instant;

public class DriverLocationPayload {

    private Long driverId;
    private String driverName;
    private Long vehicleId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private Instant timestamp;

    public DriverLocationPayload() {
        this.timestamp = Instant.now();
    }

    public DriverLocationPayload(Long driverId, String driverName, Long vehicleId,
                                 Double latitude, Double longitude, Double speed,
                                 Double heading, Instant timestamp) {
        this.driverId = driverId;
        this.driverName = driverName;
        this.vehicleId = vehicleId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.heading = heading;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
    }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getSpeed() { return speed; }
    public void setSpeed(Double speed) { this.speed = speed; }

    public Double getHeading() { return heading; }
    public void setHeading(Double heading) { this.heading = heading; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}