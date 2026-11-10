package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.jpa.SpringDataStopRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StopDatabaseRepositoryTest {

    @Mock
    private SpringDataStopRepository springDataStopRepository;

    @InjectMocks
    private StopDatabaseRepository stopDatabaseRepository;

    @Test
    @DisplayName("UT-REPO-STOP-01: Delegeert ophalen actieve stops per chauffeur")
    void findActiveByDriverId_DelegatesCorrectly() {
        DeliveryStop stop = new DeliveryStop();
        when(springDataStopRepository.findByDriverIdOrderBySequenceOrderAsc(1L)).thenReturn(List.of(stop));

        List<DeliveryStop> result = stopDatabaseRepository.findActiveByDriverId(1L);

        assertEquals(1, result.size());
        verify(springDataStopRepository).findByDriverIdOrderBySequenceOrderAsc(1L);
    }

    @Test
    @DisplayName("UT-REPO-STOP-02: Delegeert ophalen stops per route")
    void findByRouteId_DelegatesCorrectly() {
        DeliveryStop stop = new DeliveryStop();
        when(springDataStopRepository.findByRouteIdOrderBySequenceOrderAsc(10L)).thenReturn(List.of(stop));

        List<DeliveryStop> result = stopDatabaseRepository.findByRouteId(10L);

        assertEquals(1, result.size());
        verify(springDataStopRepository).findByRouteIdOrderBySequenceOrderAsc(10L);
    }

    @Test
    @DisplayName("UT-REPO-STOP-03: Delegeert findById en save")
    void findByIdAndSave_DelegatesCorrectly() {
        DeliveryStop stop = new DeliveryStop();
        stop.setId(5L);
        when(springDataStopRepository.findById(5L)).thenReturn(Optional.of(stop));
        when(springDataStopRepository.save(stop)).thenReturn(stop);

        Optional<DeliveryStop> found = stopDatabaseRepository.findById(5L);
        DeliveryStop saved = stopDatabaseRepository.save(stop);

        assertTrue(found.isPresent());
        assertNotNull(saved);
        verify(springDataStopRepository).findById(5L);
        verify(springDataStopRepository).save(stop);
    }

    @Test
    @DisplayName("UT-REPO-STOP-04: updateStatus werkt stop bij met completedAt datum")
    void updateStatus_ExistingStop_UpdatesSuccessfully() {
        DeliveryStop stop = new DeliveryStop();
        stop.setId(1L);
        stop.setStatus(StopStatus.PENDING);

        when(springDataStopRepository.findById(1L)).thenReturn(Optional.of(stop));
        when(springDataStopRepository.save(any(DeliveryStop.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryStop updated = stopDatabaseRepository.updateStatus(1L, StopStatus.DELIVERED);

        assertEquals(StopStatus.DELIVERED, updated.getStatus());
        assertNotNull(updated.getCompletedAt());
        verify(springDataStopRepository).save(stop);
    }

    @Test
    @DisplayName("UT-REPO-STOP-05: updateStatus gooit exceptie bij onbekend stop-id")
    void updateStatus_NotFound_ThrowsException() {
        when(springDataStopRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> stopDatabaseRepository.updateStatus(999L, StopStatus.DELIVERED));
    }
}