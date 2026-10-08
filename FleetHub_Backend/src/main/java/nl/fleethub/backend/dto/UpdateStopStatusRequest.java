package nl.fleethub.backend.dto;

import jakarta.validation.constraints.NotNull;
import nl.fleethub.backend.model.StopStatus;

public class UpdateStopStatusRequest {

    @NotNull(message = "Status is required")
    private StopStatus status;

    public UpdateStopStatusRequest() {}

    public UpdateStopStatusRequest(StopStatus status) {
        this.status = status;
    }

    public StopStatus getStatus() {
        return status;
    }

    public void setStatus(StopStatus status) {
        this.status = status;
    }
}