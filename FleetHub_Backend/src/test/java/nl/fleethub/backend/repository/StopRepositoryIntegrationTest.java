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
        DeliveryStop stop1 = new DeliveryStop(null, "ORD-1", "Klant A", "Adres 1", "Eindhoven", 2, StopStatus.PENDING, 101L);
        DeliveryStop stop2 = new DeliveryStop(null, "ORD-2", "Klant B", "Adres 2", "Eindhoven", 1, StopStatus.PENDING, 101L);
        DeliveryStop otherDriverStop = new DeliveryStop(null, "ORD-3", "Klant C", "Adres 3", "Eindhoven", 1, StopStatus.PENDING, 102L);

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
        DeliveryStop stop = new DeliveryStop(null, "ORD-99", "Klant X", "Adres X", "Eindhoven", 1, StopStatus.PENDING, 101L);
        DeliveryStop savedStop = stopRepository.save(stop);

        savedStop.setStatus(StopStatus.DELIVERED);
        stopRepository.save(savedStop);

        Optional<DeliveryStop> retrieved = stopRepository.findById(savedStop.getId());
        assertTrue(retrieved.isPresent());
        assertEquals(StopStatus.DELIVERED, retrieved.get().getStatus());
    }
}