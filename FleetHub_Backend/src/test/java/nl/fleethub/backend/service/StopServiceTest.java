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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    // --- US5a: Route inspectie tests ---

    @Test
    @DisplayName("UT-01: Actieve stops ophalen voor chauffeur")
    void getActiveStopsForDriver_Success() {
        when(stopRepository.findActiveByDriverId(101L)).thenReturn(List.of(sampleStop));

        List<DeliveryStop> result = stopService.getActiveStopsForDriver(101L);

        assertEquals(1, result.size());
        assertEquals("ORD-1001", result.getFirst().getOrderNumber());
        verify(stopRepository, times(1)).findActiveByDriverId(101L);
    }

    @Test
    @DisplayName("UT-02: Lege lijst retourneren wanneer chauffeur geen actieve ritten heeft")
    void getActiveStopsForDriver_EmptyRoute_ReturnsEmptyList() {
        when(stopRepository.findActiveByDriverId(101L)).thenReturn(List.of());

        List<DeliveryStop> result = stopService.getActiveStopsForDriver(101L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(stopRepository, times(1)).findActiveByDriverId(101L);
    }

    @Test
    @DisplayName("UT-03: Foutmelding gooien bij ongeldig driverId (null of negatief getal)")
    void getActiveStopsForDriver_ThrowsException_WhenDriverIdInvalid() {
        IllegalArgumentException exNull = assertThrows(
                IllegalArgumentException.class,
                () -> stopService.getActiveStopsForDriver(null)
        );
        assertEquals("Driver id must be a positive number", exNull.getMessage());

        IllegalArgumentException exNegative = assertThrows(
                IllegalArgumentException.class,
                () -> stopService.getActiveStopsForDriver(-5L)
        );
        assertEquals("Driver id must be a positive number", exNegative.getMessage());

        verify(stopRepository, never()).findActiveByDriverId(anyLong());
    }

    // --- US5b: Status transition & timestamp tests ---

    @Test
    @DisplayName("UT-04: Stopstatus succesvol bijwerken naar DELIVERED inclusief timestamp")
    void updateStopStatus_Success_Delivered() {
        DeliveryStop deliveredStop = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.DELIVERED, 101L, LocalDateTime.now());
        when(stopRepository.findById(1L)).thenReturn(Optional.of(sampleStop));
        when(stopRepository.updateStatus(1L, StopStatus.DELIVERED)).thenReturn(deliveredStop);

        DeliveryStop result = stopService.updateStopStatus(1L, StopStatus.DELIVERED);

        assertNotNull(result);
        assertEquals(StopStatus.DELIVERED, result.getStatus());
        assertNotNull(result.getCompletedAt());
        verify(stopRepository, times(1)).findById(1L);
        verify(stopRepository, times(1)).updateStatus(1L, StopStatus.DELIVERED);
    }

    @Test
    @DisplayName("UT-05: Stopstatus succesvol bijwerken naar FAILED_NOT_HOME inclusief timestamp")
    void updateStopStatus_Success_FailedNotHome() {
        DeliveryStop failedStop = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.FAILED_NOT_HOME, 101L, LocalDateTime.now());
        when(stopRepository.findById(1L)).thenReturn(Optional.of(sampleStop));
        when(stopRepository.updateStatus(1L, StopStatus.FAILED_NOT_HOME)).thenReturn(failedStop);

        DeliveryStop result = stopService.updateStopStatus(1L, StopStatus.FAILED_NOT_HOME);

        assertNotNull(result);
        assertEquals(StopStatus.FAILED_NOT_HOME, result.getStatus());
        assertNotNull(result.getCompletedAt());
        verify(stopRepository, times(1)).findById(1L);
        verify(stopRepository, times(1)).updateStatus(1L, StopStatus.FAILED_NOT_HOME);
    }

    @Test
    @DisplayName("UT-06: Foutmelding gooien als status null is")
    void updateStopStatus_ThrowsException_WhenStatusIsNull() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> stopService.updateStopStatus(1L, null)
        );

        assertEquals("Status is required", ex.getMessage());
        verify(stopRepository, never()).findById(anyLong());
        verify(stopRepository, never()).updateStatus(anyLong(), any());
    }

    @Test
    @DisplayName("UT-07: Foutmelding gooien als geprobeerd wordt te resetten naar PENDING")
    void updateStopStatus_ThrowsException_WhenStatusIsPending() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> stopService.updateStopStatus(1L, StopStatus.PENDING)
        );

        assertEquals("Cannot reset stop status back to PENDING", ex.getMessage());
        verify(stopRepository, never()).findById(anyLong());
        verify(stopRepository, never()).updateStatus(anyLong(), any());
    }

    @Test
    @DisplayName("UT-08: Blokkeer mutatie als stop al eerder afgerond (DELIVERED) is")
    void updateStopStatus_ThrowsException_WhenAlreadyDelivered() {
        DeliveryStop alreadyDelivered = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.DELIVERED, 101L, LocalDateTime.now().minusMinutes(5));
        when(stopRepository.findById(1L)).thenReturn(Optional.of(alreadyDelivered));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> stopService.updateStopStatus(1L, StopStatus.FAILED_NOT_HOME)
        );

        assertEquals("Stop has already been finalized", ex.getMessage());
        verify(stopRepository, times(1)).findById(1L);
        verify(stopRepository, never()).updateStatus(anyLong(), any());
    }

    @Test
    @DisplayName("UT-09: Blokkeer mutatie als stop al eerder afgerond (FAILED_NOT_HOME) is")
    void updateStopStatus_ThrowsException_WhenAlreadyFailed() {
        DeliveryStop alreadyFailed = new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Kerkstraat 12", "Eindhoven", 1, StopStatus.FAILED_NOT_HOME, 101L, LocalDateTime.now().minusMinutes(10));
        when(stopRepository.findById(1L)).thenReturn(Optional.of(alreadyFailed));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> stopService.updateStopStatus(1L, StopStatus.DELIVERED)
        );

        assertEquals("Stop has already been finalized", ex.getMessage());
        verify(stopRepository, times(1)).findById(1L);
        verify(stopRepository, never()).updateStatus(anyLong(), any());
    }

    @Test
    @DisplayName("UT-10: Exceptie gooien wanneer stop-ID niet gevonden wordt")
    void updateStopStatus_ThrowsException_WhenStopNotFound() {
        when(stopRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> stopService.updateStopStatus(999L, StopStatus.DELIVERED)
        );

        assertEquals("Stop with id 999 not found", ex.getMessage());
        verify(stopRepository, times(1)).findById(999L);
        verify(stopRepository, never()).updateStatus(anyLong(), any());
    }
}