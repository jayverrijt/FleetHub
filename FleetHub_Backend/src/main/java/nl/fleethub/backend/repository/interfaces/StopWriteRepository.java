package nl.fleethub.backend.repository.interfaces;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;

public interface StopWriteRepository {
    DeliveryStop updateStatus(Long id, StopStatus newStatus);
}