package nl.fleethub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import nl.fleethub.backend.model.StopStatus;

public class CreateStopRequest {

    private Long routeId;

    @NotNull(message = "Driver ID is mandatory")
    private Long driverId;

    @NotBlank(message = "Order number is mandatory")
    private String orderNumber;

    @NotBlank(message = "Recipient name is mandatory")
    private String recipientName;

    @NotNull(message = "Sequence order is mandatory")
    @Positive(message = "Sequence order must be positive")
    private Integer sequenceOrder;

    @NotBlank(message = "Address is mandatory")
    private String address;

    @NotBlank(message = "City is mandatory")
    private String city;

    private StopStatus status;

    public CreateStopRequest() {}

    public CreateStopRequest(Long routeId, Long driverId, String orderNumber, String recipientName,
                             Integer sequenceOrder, String address, String city, StopStatus status) {
        this.routeId = routeId;
        this.driverId = driverId;
        this.orderNumber = orderNumber;
        this.recipientName = recipientName;
        this.sequenceOrder = sequenceOrder;
        this.address = address;
        this.city = city;
        this.status = status;
    }

    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public StopStatus getStatus() { return status; }
    public void setStatus(StopStatus status) { this.status = status; }
}
