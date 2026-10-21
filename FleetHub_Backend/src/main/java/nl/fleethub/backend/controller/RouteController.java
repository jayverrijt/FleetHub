package nl.fleethub.backend.controller;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.Route;
import nl.fleethub.backend.repository.jpa.SpringDataRouteRepository;
import nl.fleethub.backend.service.StopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
public class RouteController {

    private final SpringDataRouteRepository routeRepository;
    private final StopService stopService;

    public RouteController(SpringDataRouteRepository routeRepository, StopService stopService) {
        this.routeRepository = routeRepository;
        this.stopService = stopService;
    }

    @GetMapping
    public ResponseEntity<List<Route>> getRoutes(
            @RequestParam(name = "driverId", required = false) Long driverId,
            @RequestParam(name = "status", required = false) String status) {

        if (driverId != null && status != null) {
            return ResponseEntity.ok(routeRepository.findByDriverIdAndStatus(driverId, status));
        }
        if (driverId != null) {
            return ResponseEntity.ok(routeRepository.findByDriverId(driverId));
        }
        if (status != null) {
            return ResponseEntity.ok(routeRepository.findByStatus(status));
        }

        return ResponseEntity.ok(routeRepository.findAll());
    }

    @GetMapping("/{routeId}")
    public ResponseEntity<Route> getRouteById(@PathVariable("routeId") Long routeId) {
        return routeRepository.findById(routeId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new IllegalArgumentException("Route with id " + routeId + " not found"));
    }

    @GetMapping("/{routeId}/stops")
    public ResponseEntity<List<DeliveryStop>> getStopsForRoute(@PathVariable("routeId") Long routeId) {
        return ResponseEntity.ok(stopService.getStopsForRoute(routeId));
    }
}