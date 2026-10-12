package nl.fleethub.backend.service;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.interfaces.StopRepository;
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
class RouteServiceTest {

    @Mock
    private StopRepository stopRepository;

    @InjectMocks
    private StopService stopService;

    @Test
    @DisplayName("UT-R01: Haal geordende stops op voor een specifiek route-ID")
    void getStopsForRoute_Success() {
        DeliveryStop stop1 = new DeliveryStop(1L, 104L, 1L, "ORD-1001", "Klant 1", 1, "Straat 1", "Eindhoven", 51.44, 5.46, StopStatus.PENDING, null, null);
        DeliveryStop stop2 = new DeliveryStop(2L, 104L, 1L, "ORD-1002", "Klant 2", 2, "Straat 2", "Helmond", 51.48, 5.65, StopStatus.PENDING, null, null);

        when(stopRepository.findByRouteId(104L)).thenReturn(List.of(stop1, stop2));

        List<DeliveryStop> result = stopService.getStopsForRoute(104L);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("ORD-1001", result.getFirst().getOrderNumber());
        verify(stopRepository, times(1)).findByRouteId(104L);
    }

    @Test
    @DisplayName("UT-R02: Foutmelding bij ongeldig route-ID (null of negatief getal)")
    void getStopsForRoute_ThrowsException_WhenRouteIdInvalid() {
        IllegalArgumentException exNull = assertThrows(
                IllegalArgumentException.class,
                () -> stopService.getStopsForRoute(null)
        );
        assertEquals("Route id must be a positive number", exNull.getMessage());

        IllegalArgumentException exNegative = assertThrows(
                IllegalArgumentException.class,
                () -> stopService.getStopsForRoute(-10L)
        );
        assertEquals("Route id must be a positive number", exNegative.getMessage());

        verify(stopRepository, never()).findByRouteId(anyLong());
    }
}