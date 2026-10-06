package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.UpdateVehicleStatusRequest;
import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.service.VehicleService;
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

    // GET /api/vehicles - Geeft alle voertuigen terug voor het dispatcher dashboard (FR4, FR5)
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    // GET /api/vehicles/{id} - Specifiek voertuig ophalen
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(vehicleService.getVehicleById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH /api/vehicles/{id}/status - Status wijzigen (bijv. naar MAINTENANCE)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateVehicleStatus(
            @PathVariable("id") Long id,
            @RequestBody UpdateVehicleStatusRequest request) {
        try {
            Vehicle updated = vehicleService.updateVehicleStatus(id, request.getStatus());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody nl.fleethub.backend.dto.CreateVehicleRequest request) {
        try {
            Vehicle created = vehicleService.createVehicle(request);
            return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}