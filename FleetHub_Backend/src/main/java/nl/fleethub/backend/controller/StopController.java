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
        List<DeliveryStop> activeStops = stopService.getActiveStopsForDriver(dummyDriverId);
        return ResponseEntity.ok(activeStops);
    }

    @PatchMapping("/stops/{id}/status")
    public ResponseEntity<DeliveryStop> updateStopStatus(
            @PathVariable("id") Long id,
            @RequestBody UpdateStopStatusRequest request) {
        // Laat de exception direct doorvloeien naar de GlobalExceptionHandler
        DeliveryStop updatedStop = stopService.updateStopStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedStop);
    }
}