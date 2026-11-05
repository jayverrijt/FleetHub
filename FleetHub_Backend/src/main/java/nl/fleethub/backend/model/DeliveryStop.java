package nl.fleethub.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_stops")
public class DeliveryStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "route_id")
    private Long routeId;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "sequence_order", nullable = false)
    private int sequenceOrder;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StopStatus status;

    @Column(name = "estimated_arrival")
    private LocalDateTime estimatedArrival;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public DeliveryStop() {
    }

    public DeliveryStop(Long id, String orderNumber, String recipientName,
                        String address, String city, int sequenceOrder,
                        StopStatus status, Long driverId) {
        this(id, null, driverId, orderNumber, recipientName, sequenceOrder, address, city, null, null, status, null, null);
    }

    public DeliveryStop(Long id, String orderNumber, String recipientName,
                        String address, String city, int sequenceOrder,
                        StopStatus status, Long driverId, LocalDateTime completedAt) {
        this(id, null, driverId, orderNumber, recipientName, sequenceOrder, address, city, null, null, status, null, completedAt);
    }

    public DeliveryStop(Long id, Long routeId, Long driverId, String orderNumber,
                        String recipientName, int sequenceOrder, String address,
                        String city, Double latitude, Double longitude,
                        StopStatus status, LocalDateTime estimatedArrival,
                        LocalDateTime completedAt) {
        this.id = id;
        this.routeId = routeId;
        this.driverId = driverId;
        this.orderNumber = orderNumber;
        this.recipientName = recipientName;
        this.sequenceOrder = sequenceOrder;
        this.address = address;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.estimatedArrival = estimatedArrival;
        this.completedAt = completedAt;
    }

    // Getters en Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public int getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(int sequenceOrder) { this.sequenceOrder = sequenceOrder; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public StopStatus getStatus() { return status; }
    public void setStatus(StopStatus status) { this.status = status; }

    public LocalDateTime getEstimatedArrival() { return estimatedArrival; }
    public void setEstimatedArrival(LocalDateTime estimatedArrival) { this.estimatedArrival = estimatedArrival; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}