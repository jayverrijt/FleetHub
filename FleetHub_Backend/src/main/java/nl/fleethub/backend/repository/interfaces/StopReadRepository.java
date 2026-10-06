package nl.fleethub.backend.repository.interfaces;

import nl.fleethub.backend.model.DeliveryStop;

import java.util.List;
import java.util.Optional;

public interface StopReadRepository {
    List<DeliveryStop> findActiveByDriverId(Long driverId);
    Optional<DeliveryStop> findById(Long id);
}