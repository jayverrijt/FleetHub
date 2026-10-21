package nl.fleethub.backend.dto;

import nl.fleethub.backend.model.StopStatus;
import java.time.LocalDateTime;

public class CustomerTrackingResponse {

    private String orderNumber;
    private String recipientName;
    private String address;
    private String city;
    private StopStatus status;
    private LocalDateTime estimatedArrival;
    private LocalDateTime completedAt;

    public CustomerTrackingResponse() {}

    public CustomerTrackingResponse(String orderNumber, String recipientName, String address,
                                    String city, StopStatus status, LocalDateTime estimatedArrival,
                                    LocalDateTime completedAt) {
        this.orderNumber = orderNumber;
        this.recipientName = recipientName;
        this.address = address;
        this.city = city;
        this.status = status;
        this.estimatedArrival = estimatedArrival;
        this.completedAt = completedAt;
    }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public StopStatus getStatus() { return status; }
    public void setStatus(StopStatus status) { this.status = status; }

    public LocalDateTime getEstimatedArrival() { return estimatedArrival; }
    public void setEstimatedArrival(LocalDateTime estimatedArrival) { this.estimatedArrival = estimatedArrival; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}