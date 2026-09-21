package nl.fleethub.backend.service;

import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.repository.interfaces.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle sampleVehicle;

    @BeforeEach
    void setUp() {
        sampleVehicle = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 60, 240, 101L);
    }

    @Test
    @DisplayName("UT-V01: Haal alle voertuigen op")
    void getAllVehicles_Success() {
        when(vehicleRepository.findAll()).thenReturn(List.of(sampleVehicle));

        List<Vehicle> result = vehicleService.getAllVehicles();

        assertEquals(1, result.size());
        assertEquals("V-101-BB", result.getFirst().getLicensePlate());
        verify(vehicleRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("UT-V02: Haal specifiek voertuig op via ID")
    void getVehicleById_Success() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));

        Vehicle result = vehicleService.getVehicleById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(vehicleRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("UT-V03: Foutmelding wanneer voertuig ID niet bestaat")
    void getVehicleById_ThrowsException_WhenNotFound() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.getVehicleById(99L)
        );

        assertEquals("Vehicle with id 99 not found", ex.getMessage());
        verify(vehicleRepository, times(1)).findById(99L);
    }

    @Test
    @DisplayName("UT-V04: Haal voertuig op gekoppeld aan chauffeur")
    void getVehicleByDriverId_Success() {
        when(vehicleRepository.findByDriverId(101L)).thenReturn(Optional.of(sampleVehicle));

        Vehicle result = vehicleService.getVehicleByDriverId(101L);

        assertNotNull(result);
        assertEquals(101L, result.getAssignedDriverId());
        verify(vehicleRepository, times(1)).findByDriverId(101L);
    }

    @Test
    @DisplayName("UT-V05: Foutmelding wanneer chauffeur geen voertuig heeft")
    void getVehicleByDriverId_ThrowsException_WhenNotFound() {
        when(vehicleRepository.findByDriverId(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.getVehicleByDriverId(999L)
        );

        assertEquals("No vehicle assigned to driver 999", ex.getMessage());
        verify(vehicleRepository, times(1)).findByDriverId(999L);
    }

    @Test
    @DisplayName("UT-V06: Werk voertuigstatus bij naar MAINTENANCE")
    void updateVehicleStatus_Success() {
        Vehicle updated = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.MAINTENANCE, 60, 240, 101L);
        when(vehicleRepository.updateStatus(1L, VehicleStatus.MAINTENANCE)).thenReturn(updated);

        Vehicle result = vehicleService.updateVehicleStatus(1L, VehicleStatus.MAINTENANCE);

        assertNotNull(result);
        assertEquals(VehicleStatus.MAINTENANCE, result.getStatus());
        verify(vehicleRepository, times(1)).updateStatus(1L, VehicleStatus.MAINTENANCE);
    }

    @Test
    @DisplayName("UT-V07: Foutmelding wanneer nieuwe status null is")
    void updateVehicleStatus_ThrowsException_WhenStatusIsNull() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.updateVehicleStatus(1L, null)
        );

        assertEquals("Status cannot be null", ex.getMessage());
        verify(vehicleRepository, never()).updateStatus(anyLong(), any());
    }
}