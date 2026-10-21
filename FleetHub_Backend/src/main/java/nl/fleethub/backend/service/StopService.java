package nl.fleethub.backend.service;

import nl.fleethub.backend.dto.CreateStopRequest;
import nl.fleethub.backend.dto.CustomerTrackingResponse;
import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.interfaces.StopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class StopService {

    private final StopRepository stopRepository;
    private final GeocodingService geocodingService;

    public StopService(StopRepository stopRepository, GeocodingService geocodingService) {
        this.stopRepository = stopRepository;
        this.geocodingService = geocodingService;
    }

    @Transactional(readOnly = true)
    public List<DeliveryStop> getActiveStopsForDriver(Long driverId) {
        if (driverId == null || driverId <= 0) {
            throw new IllegalArgumentException("Driver id must be a positive number");
        }
        List<DeliveryStop> stops = stopRepository.findActiveByDriverId(driverId);
        return stops != null ? stops : Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryStop> getStopsForRoute(Long routeId) {
        if (routeId == null || routeId <= 0) {
            throw new IllegalArgumentException("Route id must be a positive number");
        }
        List<DeliveryStop> stops = stopRepository.findByRouteId(routeId);
        return stops != null ? stops : Collections.emptyList();
    }

    public DeliveryStop createStop(CreateStopRequest request) {
        if (request.getDriverId() == null || request.getDriverId() <= 0) {
            throw new IllegalArgumentException("Driver id must be a positive number");
        }
        if (request.getRouteId() == null || request.getRouteId() <= 0) {
            throw new IllegalArgumentException("Route id must be a positive number");
        }

        // Schuif opvolgende stops van deze specifieke route op
        List<DeliveryStop> currentRouteStops = stopRepository.findByRouteId(request.getRouteId());
        for (DeliveryStop stop : currentRouteStops) {
            if (stop.getSequenceOrder() >= request.getSequenceOrder()) {
                stop.setSequenceOrder(stop.getSequenceOrder() + 1);
                stopRepository.save(stop);
            }
        }

        double[] coords = geocodingService.geocode(request.getAddress(), request.getCity());

        DeliveryStop newStop = new DeliveryStop();
        newStop.setRouteId(request.getRouteId());
        newStop.setDriverId(request.getDriverId());
        newStop.setOrderNumber(request.getOrderNumber());
        newStop.setRecipientName(request.getRecipientName());
        newStop.setSequenceOrder(request.getSequenceOrder());
        newStop.setAddress(request.getAddress());
        newStop.setCity(request.getCity());
        newStop.setLatitude(coords[0]);
        newStop.setLongitude(coords[1]);
        newStop.setStatus(request.getStatus() != null ? request.getStatus() : StopStatus.PENDING);

        return stopRepository.save(newStop);
    }

    public DeliveryStop updateStopStatus(Long stopId, StopStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Status is required");
        }
        if (newStatus == StopStatus.PENDING) {
            throw new IllegalArgumentException("Cannot reset stop status back to PENDING");
        }

        DeliveryStop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Stop with id " + stopId + " not found"));

        if (stop.getStatus() == StopStatus.DELIVERED || stop.getStatus() == StopStatus.FAILED_NOT_HOME) {
            throw new IllegalStateException("Stop has already been finalized");
        }

        stop.setStatus(newStatus);
        stop.setCompletedAt(LocalDateTime.now());
        return stopRepository.updateStatus(stopId, newStatus);
    }

    @Transactional(readOnly = true)
    public CustomerTrackingResponse getTrackingInfo(String orderNumber) {
        if (orderNumber == null || orderNumber.trim().isBlank()) {
            throw new IllegalArgumentException("Order number is required");
        }

        DeliveryStop stop = stopRepository.findByOrderNumber(orderNumber.trim())
                .orElseThrow(() -> new IllegalArgumentException("Order with number " + orderNumber + " not found"));

        return new CustomerTrackingResponse(
                stop.getOrderNumber(),
                stop.getRecipientName(),
                stop.getAddress(),
                stop.getCity(),
                stop.getStatus(),
                stop.getEstimatedArrival(),
                stop.getCompletedAt()
        );
    }
}