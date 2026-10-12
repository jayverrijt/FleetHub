package nl.fleethub.backend.controller;

import jakarta.validation.Valid;
import nl.fleethub.backend.dto.CreateStopRequest;
import nl.fleethub.backend.dto.UpdateStopStatusRequest;
import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.service.StopService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stops")
@CrossOrigin(origins = "*")
public class StopController {

    private final StopService stopService;

    public StopController(StopService stopService) {
        this.stopService = stopService;
    }

    @PostMapping
    public ResponseEntity<DeliveryStop> createStop(@Valid @RequestBody CreateStopRequest request) {
        DeliveryStop createdStop = stopService.createStop(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStop);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DeliveryStop> updateStopStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateStopStatusRequest request) {
        DeliveryStop updatedStop = stopService.updateStopStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedStop);
    }
}