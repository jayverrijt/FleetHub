package nl.fleethub.backend.service;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.interfaces.StopRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StopServiceTest {

    @Mock
    private StopRepository stopRepository;

    @InjectMocks
    private StopService stopService;

    private DeliveryStop sampleStop;

    @BeforeEach
    void setUp() {
        sampleStop = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.PENDING, 101L);
    }

    @Test
    @DisplayName("UT-01: Actieve stops ophalen voor chauffeur")
    void getActiveStopsForDriver_Success() {
        when(stopRepository.findActiveByDriverId(101L)).thenReturn(List.of(sampleStop));

        List<DeliveryStop> result = stopService.getActiveStopsForDriver(101L);

        assertEquals(1, result.size());
        assertEquals("ORD-1001", result.get(0).getOrderNumber());
        verify(stopRepository, times(1)).findActiveByDriverId(101L);
    }

    @Test
    @DisplayName("UT-02: Stopstatus succesvol bijwerken naar DELIVERED")
    void updateStopStatus_Success() {
        DeliveryStop updatedStop = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.DELIVERED, 101L);
        when(stopRepository.updateStatus(1L, StopStatus.DELIVERED)).thenReturn(updatedStop);

        DeliveryStop result = stopService.updateStopStatus(1L, StopStatus.DELIVERED);

        assertNotNull(result);
        assertEquals(StopStatus.DELIVERED, result.getStatus());
        verify(stopRepository, times(1)).updateStatus(1L, StopStatus.DELIVERED);
    }

    @Test
    @DisplayName("UT-03: Foutmelding gooien als status null is")
    void updateStopStatus_ThrowsException_WhenStatusIsNull() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            stopService.updateStopStatus(1L, null);
        });

        assertEquals("Status is required", ex.getMessage());
        verify(stopRepository, never()).updateStatus(anyLong(), any());
    }

    @Test
    @DisplayName("UT-04: Foutmelding gooien als status PENDING is")
    void updateStopStatus_ThrowsException_WhenStatusIsPending() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            stopService.updateStopStatus(1L, StopStatus.PENDING);
        });

        assertEquals("Cannot reset stop status back to PENDING", ex.getMessage());
        verify(stopRepository, never()).updateStatus(anyLong(), any());
    }

    @Test
    @DisplayName("UT-05: Exceptie doorduwen wanneer stopRepository faalt (bijv. ID niet gevonden)")
    void updateStopStatus_ThrowsException_WhenRepositoryFails() {
        when(stopRepository.updateStatus(999L, StopStatus.DELIVERED))
                .thenThrow(new IllegalArgumentException("Stop with id 999 not found"));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            stopService.updateStopStatus(999L, StopStatus.DELIVERED);
        });

        assertEquals("Stop with id 999 not found", ex.getMessage());
        verify(stopRepository, times(1)).updateStatus(999L, StopStatus.DELIVERED);
    }
}