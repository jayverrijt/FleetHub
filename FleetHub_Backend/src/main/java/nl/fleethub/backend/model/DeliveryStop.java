package nl.fleethub.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "delivery_stops")
public class DeliveryStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false)
    private String orderNumber;

    @Column(name = "recipient_name")
    private String recipientName;

    private String address;
    private String city;

    @Column(name = "sequence_order")
    private int sequenceOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StopStatus status;

    @Column(name = "driver_id")
    private Long driverId;

    public DeliveryStop() {
    }

    public DeliveryStop(Long id, String orderNumber, String recipientName,
                        String address, String city, int sequenceOrder,
                        StopStatus status, Long driverId) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.recipientName = recipientName;
        this.address = address;
        this.city = city;
        this.sequenceOrder = sequenceOrder;
        this.status = status;
        this.driverId = driverId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public int getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(int sequenceOrder) { this.sequenceOrder = sequenceOrder; }

    public StopStatus getStatus() { return status; }
    public void setStatus(StopStatus status) { this.status = status; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
}