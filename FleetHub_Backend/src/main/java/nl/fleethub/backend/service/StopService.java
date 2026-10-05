package nl.fleethub.backend.service;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.interfaces.StopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StopService {

    private final StopRepository stopRepository;

    public StopService(StopRepository stopRepository) {
        this.stopRepository = stopRepository;
    }

    @Transactional(readOnly = true)
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

        // Valideer of het record bestaat, anders gooi de exception voor de 404 handler
        stopRepository.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Stop with id " + stopId + " not found"));

        return stopRepository.updateStatus(stopId, newStatus);
    }
}