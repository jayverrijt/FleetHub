package nl.fleethub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import nl.fleethub.backend.model.StopStatus;

public class CreateStopRequest {

    @NotNull(message = "routeId is verplicht")
    private Long routeId;

    @NotNull(message = "driverId is verplicht")
    private Long driverId;

    @NotBlank(message = "orderNumber is verplicht")
    private String orderNumber;

    @NotBlank(message = "recipientName is verplicht")
    private String recipientName;

    @NotNull(message = "sequenceOrder is verplicht")
    private Integer sequenceOrder;

    @NotBlank(message = "address is verplicht")
    private String address;

    @NotBlank(message = "city is verplicht")
    private String city;

    private StopStatus status = StopStatus.PENDING;

    public CreateStopRequest() {}

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