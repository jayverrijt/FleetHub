package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.UpdateStopStatusRequest;
import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.service.StopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StopController {
    private final StopService stopService;

    public StopController(StopService stopService) {
        this.stopService = stopService;
    }

    @GetMapping("/driver/routes/active")
    public ResponseEntity<List<DeliveryStop>> getActiveDriverRoute() {
        Long dummyDriverId = 101L;
        List<DeliveryStop> stops = stopService.getActiveStopsForDriver(dummyDriverId);
        return ResponseEntity.ok(stops);
    }

    @PatchMapping("/stops/{id}/status")
    public ResponseEntity<?> updateStopStatus(
            @PathVariable("id") Long id,
            @RequestBody UpdateStopStatusRequest request) {
        try {
            DeliveryStop updatedStop = stopService.updateStopStatus(id, request.getStatus());
            return ResponseEntity.ok(updatedStop);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}