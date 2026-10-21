package nl.fleethub.backend.controller;

import jakarta.validation.Valid;
import nl.fleethub.backend.dto.CreateVehicleRequest;
import nl.fleethub.backend.dto.UpdateVehicleStatusRequest;
import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.service.VehicleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable("id") Long id) {
        // Exceptie vloeit door naar GlobalExceptionHandler -> levert HTTP 404 Not Found met JSON
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Vehicle> updateVehicleStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateVehicleStatusRequest request) {
        Vehicle updated = vehicleService.updateVehicleStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(
            @Valid @RequestBody CreateVehicleRequest request) {
        Vehicle created = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}