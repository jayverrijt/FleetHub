package nl.fleethub.backend.repository.jpa;

import nl.fleethub.backend.model.DeliveryStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataStopRepository extends JpaRepository<DeliveryStop, Long> {
    List<DeliveryStop> findByDriverIdOrderBySequenceOrderAsc(Long driverId);
}