package nl.fleethub.backend.dto;

import nl.fleethub.backend.model.StopStatus;

public class UpdateStopStatusRequest {
    private StopStatus status;

    public UpdateStopStatusRequest() {}
    public UpdateStopStatusRequest(StopStatus status) { this.status = status; }

    public StopStatus getStatus() { return status; }
    public void setStatus(StopStatus status) { this.status = status; }
}