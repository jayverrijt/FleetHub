package nl.fleethub.backend.controller;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.Route;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.jpa.SpringDataRouteRepository;
import nl.fleethub.backend.service.StopService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RouteController.class)
class RouteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SpringDataRouteRepository routeRepository;

    @MockBean
    private StopService stopService;

    @Test
    @DisplayName("GET /api/routes - Haalt alle routes op (Dispatcher view)")
    void getRoutes_ReturnsAllRoutes() throws Exception {
        Route route1 = new Route(104L, "Route #104 - Eindhoven & Helmond", 1L, 1L, "IN_PROGRESS");
        Route route2 = new Route(105L, "Route #105 - Tilburg & Veldhoven", 2L, 2L, "IN_PROGRESS");
        when(routeRepository.findAll()).thenReturn(List.of(route1, route2));

        mockMvc.perform(get("/api/routes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(104))
                .andExpect(jsonPath("$[1].id").value(105));

        verify(routeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("GET /api/routes?driverId=1 - Filtert uitsluitend op chauffeur")
    void getRoutes_FilterByDriverId_ReturnsMatchingRoutes() throws Exception {
        Route route = new Route(104L, "Route #104 - Eindhoven & Helmond", 1L, 1L, "IN_PROGRESS");
        when(routeRepository.findByDriverId(1L)).thenReturn(List.of(route));

        mockMvc.perform(get("/api/routes?driverId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].driverId").value(1))
                .andExpect(jsonPath("$[0].id").value(104));

        verify(routeRepository, times(1)).findByDriverId(1L);
    }

    @Test
    @DisplayName("GET /api/routes?driverId=1&status=IN_PROGRESS - Filtert op chauffeur én status")
    void getRoutes_FilterByDriverIdAndStatus_ReturnsActiveRoute() throws Exception {
        Route route = new Route(104L, "Route #104 - Eindhoven & Helmond", 1L, 1L, "IN_PROGRESS");
        when(routeRepository.findByDriverIdAndStatus(1L, "IN_PROGRESS")).thenReturn(List.of(route));

        mockMvc.perform(get("/api/routes?driverId=1&status=IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("IN_PROGRESS"));

        verify(routeRepository, times(1)).findByDriverIdAndStatus(1L, "IN_PROGRESS");
    }

    @Test
    @DisplayName("GET /api/routes/{id} - 200 OK bij bestaande route")
    void getRouteById_Success() throws Exception {
        Route route = new Route(104L, "Route #104", 1L, 1L, "IN_PROGRESS");
        when(routeRepository.findById(104L)).thenReturn(Optional.of(route));

        mockMvc.perform(get("/api/routes/104"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(104))
                .andExpect(jsonPath("$.name").value("Route #104"));
    }

    @Test
    @DisplayName("GET /api/routes/{id} - 404 Not Found bij niet-bestaande route")
    void getRouteById_NotFound() throws Exception {
        when(routeRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/routes/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/routes/{id}/stops - Haalt stops op via de dekkende subresource")
    void getStopsForRoute_Success() throws Exception {
        DeliveryStop stop1 = new DeliveryStop(1L, "ORD-1001", "Fontys", "Rachelsmolen 1", "Eindhoven", 1, StopStatus.PENDING, 1L);
        when(stopService.getStopsForRoute(104L)).thenReturn(List.of(stop1));

        mockMvc.perform(get("/api/routes/104/stops"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].orderNumber").value("ORD-1001"));

        verify(stopService, times(1)).getStopsForRoute(104L);
    }
}