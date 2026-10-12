package nl.fleethub.backend.repository.jpa;

import nl.fleethub.backend.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataRouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByDriverId(Long driverId);
    List<Route> findByStatus(String status);
    List<Route> findByDriverIdAndStatus(Long driverId, String status);
}