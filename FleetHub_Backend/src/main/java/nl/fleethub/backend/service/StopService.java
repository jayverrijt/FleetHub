package nl.fleethub.backend.service;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.interfaces.StopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StopService {

    private final StopRepository stopRepository;

    public StopService(StopRepository stopRepository) {
        this.stopRepository = stopRepository;
    }

    public List<DeliveryStop> getActiveStopsForDriver(Long driverId) {
        return stopRepository.findActiveByDriverId(driverId);
    }

    public DeliveryStop updateStopStatus(Long stopId, StopStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Status is required");
        }
        if (newStatus == StopStatus.PENDING) {
            throw new IllegalArgumentException("Cannot reset stop status back to PENDING");
        }
        return stopRepository.updateStatus(stopId, newStatus);
    }
}