package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.jpa.SpringDataStopRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class StopRepositoryIntegrationTest {

    @Autowired
    private SpringDataStopRepository stopRepository;

    @Test
    @DisplayName("IT-01: Vind en sorteer actieve stops chronologisch per chauffeur")
    void findByDriverIdOrderBySequenceOrderAsc_ReturnsSortedStops() {
        DeliveryStop stop1 = new DeliveryStop(null, 104L, 101L, "ORD-1", "Klant A", 2, "Adres 1", "Eindhoven", 51.44, 5.46, StopStatus.PENDING, null, null);
        DeliveryStop stop2 = new DeliveryStop(null, 104L, 101L, "ORD-2", "Klant B", 1, "Adres 2", "Eindhoven", 51.45, 5.47, StopStatus.PENDING, null, null);
        DeliveryStop otherDriverStop = new DeliveryStop(null, 105L, 102L, "ORD-3", "Klant C", 1, "Adres 3", "Tilburg", 51.55, 5.08, StopStatus.PENDING, null, null);

        stopRepository.saveAll(List.of(stop1, stop2, otherDriverStop));

        List<DeliveryStop> result = stopRepository.findByDriverIdOrderBySequenceOrderAsc(101L);

        assertEquals(2, result.size());
        assertEquals("ORD-2", result.getFirst().getOrderNumber());
        assertEquals(1, result.getFirst().getSequenceOrder());
        assertEquals("ORD-1", result.get(1).getOrderNumber());
        assertEquals(2, result.get(1).getSequenceOrder());
    }

    @Test
    @DisplayName("IT-02: Werk de status van een opgeslagen stop persistent bij")
    void updateStopStatus_PersistsInDatabase() {
        DeliveryStop stop = new DeliveryStop(null, 104L, 101L, "ORD-99", "Klant X", 1, "Adres X", "Eindhoven", 51.44, 5.46, StopStatus.PENDING, null, null);
        DeliveryStop savedStop = stopRepository.save(stop);

        savedStop.setStatus(StopStatus.DELIVERED);
        stopRepository.save(savedStop);

        Optional<DeliveryStop> retrieved = stopRepository.findById(savedStop.getId());
        assertTrue(retrieved.isPresent());
        assertEquals(StopStatus.DELIVERED, retrieved.get().getStatus());
    }

    @Test
    @DisplayName("IT-03: Vind en sorteer stops chronologisch per routeId")
    void findByRouteIdOrderBySequenceOrderAsc_ReturnsSortedRouteStops() {
        DeliveryStop stopRoute104B = new DeliveryStop(null, 104L, 1L, "ORD-104-2", "Klant 2", 2, "Adres 2", "Eindhoven", 51.44, 5.46, StopStatus.PENDING, null, null);
        DeliveryStop stopRoute104A = new DeliveryStop(null, 104L, 1L, "ORD-104-1", "Klant 1", 1, "Adres 1", "Eindhoven", 51.45, 5.47, StopStatus.PENDING, null, null);
        DeliveryStop stopRoute105 = new DeliveryStop(null, 105L, 2L, "ORD-105-1", "Klant 3", 1, "Adres 3", "Tilburg", 51.55, 5.08, StopStatus.PENDING, null, null);

        stopRepository.saveAll(List.of(stopRoute104B, stopRoute104A, stopRoute105));

        List<DeliveryStop> route104Stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(104L);

        assertEquals(2, route104Stops.size());
        assertEquals("ORD-104-1", route104Stops.getFirst().getOrderNumber());
        assertEquals(1, route104Stops.getFirst().getSequenceOrder());
        assertEquals("ORD-104-2", route104Stops.get(1).getOrderNumber());
        assertEquals(2, route104Stops.get(1).getSequenceOrder());
    }
}