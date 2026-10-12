package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.Route;
import nl.fleethub.backend.repository.jpa.SpringDataRouteRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class RouteRepositoryIntegrationTest {

    @Autowired
    private SpringDataRouteRepository routeRepository;

    @Test
    @DisplayName("IT-05: Filter routes op driverId")
    void findByDriverId_ReturnsMatchingRoutes() {
        Route route1 = new Route(null, "Route #104", 1L, 1L, "IN_PROGRESS");
        Route route2 = new Route(null, "Route #105", 2L, 2L, "PLANNED");
        routeRepository.saveAll(List.of(route1, route2));

        List<Route> driver1Routes = routeRepository.findByDriverId(1L);

        assertEquals(1, driver1Routes.size());
        assertEquals("Route #104", driver1Routes.getFirst().getName());
    }

    @Test
    @DisplayName("IT-06: Filter routes op driverId en status")
    void findByDriverIdAndStatus_ReturnsActiveRoute() {
        Route activeRoute = new Route(null, "Route Active", 1L, 1L, "IN_PROGRESS");
        Route completedRoute = new Route(null, "Route Done", 1L, 1L, "COMPLETED");
        routeRepository.saveAll(List.of(activeRoute, completedRoute));

        List<Route> result = routeRepository.findByDriverIdAndStatus(1L, "IN_PROGRESS");

        assertEquals(1, result.size());
        assertEquals("Route Active", result.getFirst().getName());
        assertEquals("IN_PROGRESS", result.getFirst().getStatus());
    }
}