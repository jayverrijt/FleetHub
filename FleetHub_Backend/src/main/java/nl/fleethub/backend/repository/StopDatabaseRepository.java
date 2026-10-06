package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.interfaces.StopRepository;
import nl.fleethub.backend.repository.jpa.SpringDataStopRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class StopDatabaseRepository implements StopRepository {

    private final SpringDataStopRepository springDataStopRepository;

    public StopDatabaseRepository(SpringDataStopRepository springDataStopRepository) {
        this.springDataStopRepository = springDataStopRepository;
    }

    @Override
    public List<DeliveryStop> findActiveByDriverId(Long driverId) {
        return springDataStopRepository.findByDriverIdOrderBySequenceOrderAsc(driverId);
    }

    @Override
    public Optional<DeliveryStop> findById(Long id) {
        return springDataStopRepository.findById(id);
    }

    @Override
    public DeliveryStop save(DeliveryStop stop) {
        return springDataStopRepository.save(stop);
    }

    @Override
    public DeliveryStop updateStatus(Long id, StopStatus newStatus) {
        DeliveryStop stop = springDataStopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stop with id " + id + " not found"));

        stop.setStatus(newStatus);
        stop.setCompletedAt(LocalDateTime.now());
        return springDataStopRepository.save(stop);
    }
}