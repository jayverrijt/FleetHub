package nl.fleethub.backend.dto;

import jakarta.validation.constraints.NotNull;
import nl.fleethub.backend.model.VehicleStatus;

public class UpdateVehicleStatusRequest {

    @NotNull(message = "Status is required")
    private VehicleStatus status;

    public UpdateVehicleStatusRequest() {}

    public UpdateVehicleStatusRequest(VehicleStatus status) {
        this.status = status;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }
}