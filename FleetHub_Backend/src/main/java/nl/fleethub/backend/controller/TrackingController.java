package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.CustomerTrackingResponse;
import nl.fleethub.backend.service.StopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class TrackingController {

    private final StopService stopService;

    public TrackingController(StopService stopService) {
        this.stopService = stopService;
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<CustomerTrackingResponse> trackOrder(@PathVariable("orderNumber") String orderNumber) {
        return ResponseEntity.ok(stopService.getTrackingInfo(orderNumber));
    }
}