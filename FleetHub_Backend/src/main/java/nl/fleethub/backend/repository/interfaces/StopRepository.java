package nl.fleethub.backend.repository.interfaces;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;

import java.util.List;
import java.util.Optional;

public interface StopRepository {
    List<DeliveryStop> findActiveByDriverId(Long driverId);
    Optional<DeliveryStop> findById(Long id);
    DeliveryStop save(DeliveryStop stop);
    DeliveryStop updateStatus(Long id, StopStatus newStatus);
}