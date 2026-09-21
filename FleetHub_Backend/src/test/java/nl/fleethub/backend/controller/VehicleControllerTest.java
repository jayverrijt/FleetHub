package nl.fleethub.backend.controller;

import nl.fleethub.backend.dto.UpdateVehicleStatusRequest;
import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    @Mock
    private VehicleService vehicleService;

    @InjectMocks
    private VehicleController vehicleController;

    private Vehicle sampleVehicle;

    @BeforeEach
    void setUp() {
        sampleVehicle = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 60, 240, 101L);
    }

    @Test
    @DisplayName("API-V01: GET /api/vehicles geeft 200 OK met lijst")
    void getAllVehicles_Returns200() {
        when(vehicleService.getAllVehicles()).thenReturn(List.of(sampleVehicle));

        ResponseEntity<List<Vehicle>> response = vehicleController.getAllVehicles();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(vehicleService, times(1)).getAllVehicles();
    }

    @Test
    @DisplayName("API-V02: GET /api/vehicles/{id} geeft 200 OK bij bestaand ID")
    void getVehicleById_Returns200_WhenExists() {
        when(vehicleService.getVehicleById(1L)).thenReturn(sampleVehicle);

        ResponseEntity<Vehicle> response = vehicleController.getVehicleById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("V-101-BB", response.getBody().getLicensePlate());
        verify(vehicleService, times(1)).getVehicleById(1L);
    }

    @Test
    @DisplayName("API-V03: GET /api/vehicles/{id} geeft 404 NOT FOUND bij onbekend ID")
    void getVehicleById_Returns404_WhenNotFound() {
        when(vehicleService.getVehicleById(99L)).thenThrow(new IllegalArgumentException("Vehicle with id 99 not found"));

        ResponseEntity<Vehicle> response = vehicleController.getVehicleById(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(vehicleService, times(1)).getVehicleById(99L);
    }

    @Test
    @DisplayName("API-V04: PATCH /api/vehicles/{id}/status geeft 200 OK bij succes")
    void updateVehicleStatus_Returns200_WhenValid() {
        Vehicle updated = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.MAINTENANCE, 60, 240, 101L);
        UpdateVehicleStatusRequest request = new UpdateVehicleStatusRequest(VehicleStatus.MAINTENANCE);
        when(vehicleService.updateVehicleStatus(1L, VehicleStatus.MAINTENANCE)).thenReturn(updated);

        ResponseEntity<?> response = vehicleController.updateVehicleStatus(1L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updated, response.getBody());
        verify(vehicleService, times(1)).updateVehicleStatus(1L, VehicleStatus.MAINTENANCE);
    }

    @Test
    @DisplayName("API-V05: PATCH /api/vehicles/{id}/status geeft 400 BAD REQUEST bij fout")
    void updateVehicleStatus_Returns400_WhenException() {
        UpdateVehicleStatusRequest request = new UpdateVehicleStatusRequest(null);
        when(vehicleService.updateVehicleStatus(1L, null)).thenThrow(new IllegalArgumentException("Status cannot be null"));

        ResponseEntity<?> response = vehicleController.updateVehicleStatus(1L, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Status cannot be null", response.getBody());
        verify(vehicleService, times(1)).updateVehicleStatus(1L, null);
    }
}