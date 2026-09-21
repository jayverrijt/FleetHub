package nl.fleethub.backend.dto;

import nl.fleethub.backend.model.VehicleStatus;

public class UpdateVehicleStatusRequest {
    private VehicleStatus status;

    public UpdateVehicleStatusRequest() {}
    public UpdateVehicleStatusRequest(VehicleStatus status) { this.status = status; }

    public VehicleStatus getStatus() { return status; }
    public void setStatus(VehicleStatus status) { this.status = status; }
}