package nl.fleethub.backend.model;

public class DeliveryStop {
    private Long id;
    private String orderNumber;
    private String recipientName;
    private String address;
    private String city;
    private int sequenceOrder;
    private StopStatus status;
    private Long driverId;

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
    public String getOrderNumber() { return orderNumber; }
    public String getRecipientName() { return recipientName; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public int getSequenceOrder() { return sequenceOrder; }
    public StopStatus getStatus() { return status; }
    public void setStatus(StopStatus status) { this.status = status; }
    public Long getDriverId() { return driverId; }
}