package nl.fleethub.backend.repository.interfaces;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;

import java.util.List;
import java.util.Optional;

public interface StopRepository {
    List<DeliveryStop> findActiveByDriverId(Long driverId);
    List<DeliveryStop> findByRouteId(Long routeId);
    List<DeliveryStop> findByRouteIdOrderBySequenceOrderAsc(Long routeId);
    Optional<DeliveryStop> findById(Long id);
    DeliveryStop save(DeliveryStop stop);
    DeliveryStop updateStatus(Long id, StopStatus newStatus);
}