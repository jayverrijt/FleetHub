package nl.fleethub.backend.dto;

import nl.fleethub.backend.model.StopStatus;
import java.time.LocalDateTime;

public record CustomerTrackingResponse(
        String orderNumber,
        String recipientName,
        String address,
        String city,
        StopStatus status,
        LocalDateTime estimatedArrival,
        LocalDateTime completedAt
) {
    public String getOrderNumber() { return orderNumber(); }
    public String getRecipientName() { return recipientName(); }
    public String getAddress() { return address(); }
    public String getCity() { return city(); }
    public StopStatus getStatus() { return status(); }
    public LocalDateTime getEstimatedArrival() { return estimatedArrival(); }
    public LocalDateTime getCompletedAt() { return completedAt(); }
}
