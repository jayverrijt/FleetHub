package nl.fleethub.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_stops")
public class DeliveryStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private int sequenceOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StopStatus status;

    @Column(nullable = false)
    private Long driverId;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public DeliveryStop() {
    }

    public DeliveryStop(Long id, String orderNumber, String recipientName,
                        String address, String city, int sequenceOrder,
                        StopStatus status, Long driverId) {
        this(id, orderNumber, recipientName, address, city, sequenceOrder, status, driverId, null);
    }

    public DeliveryStop(Long id, String orderNumber, String recipientName,
                        String address, String city, int sequenceOrder,
                        StopStatus status, Long driverId, LocalDateTime completedAt) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.recipientName = recipientName;
        this.address = address;
        this.city = city;
        this.sequenceOrder = sequenceOrder;
        this.status = status;
        this.driverId = driverId;
        this.completedAt = completedAt;
    }

    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public String getRecipientName() { return recipientName; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public int getSequenceOrder() { return sequenceOrder; }
    public StopStatus getStatus() { return status; }
    public void setStatus(StopStatus status) { this.status = status; }
    public Long getDriverId() { return driverId; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}