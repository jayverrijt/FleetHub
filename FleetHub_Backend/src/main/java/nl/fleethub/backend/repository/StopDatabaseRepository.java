package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.interfaces.StopRepository;
import nl.fleethub.backend.repository.jpa.SpringDataStopRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class StopDatabaseRepository implements StopRepository {

    private final SpringDataStopRepository jpaRepository;

    public StopDatabaseRepository(SpringDataStopRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<DeliveryStop> findActiveByDriverId(Long driverId) {
        return jpaRepository.findByDriverIdOrderBySequenceOrderAsc(driverId);
    }

    @Override
    public Optional<DeliveryStop> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public DeliveryStop save(DeliveryStop stop) {
        return jpaRepository.save(stop);
    }

    @Override
    public DeliveryStop updateStatus(Long id, StopStatus newStatus) {
        DeliveryStop stop = jpaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stop with id " + id + " not found"));
        stop.setStatus(newStatus);
        return jpaRepository.save(stop);
    }
}