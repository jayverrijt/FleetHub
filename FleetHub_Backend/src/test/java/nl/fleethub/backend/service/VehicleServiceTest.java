package nl.fleethub.backend.service;

import nl.fleethub.backend.dto.CreateVehicleRequest;
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
import static org.mockito.ArgumentMatchers.any;
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
    @DisplayName("UT-V02: Voertuig succesvol vinden op ID")
    void getVehicleById_Success() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));

        Vehicle result = vehicleService.getVehicleById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(vehicleRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("UT-V03: Foutmelding gooien als voertuig ID niet bestaat")
    void getVehicleById_NotFound() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.getVehicleById(999L)
        );

        assertTrue(ex.getMessage().contains("not found"));
        verify(vehicleRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("UT-V04: Voertuig vinden op chauffeur ID")
    void getVehicleByDriverId_Success() {
        when(vehicleRepository.findByDriverId(101L)).thenReturn(Optional.of(sampleVehicle));

        Vehicle result = vehicleService.getVehicleByDriverId(101L);

        assertNotNull(result);
        assertEquals(101L, result.getAssignedDriverId());
        verify(vehicleRepository, times(1)).findByDriverId(101L);
    }

    @Test
    @DisplayName("UT-V05: Foutmelding gooien als chauffeur geen voertuig heeft")
    void getVehicleByDriverId_NotFound() {
        when(vehicleRepository.findByDriverId(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.getVehicleByDriverId(999L)
        );

        assertTrue(ex.getMessage().contains("No vehicle assigned to driver"));
        verify(vehicleRepository, times(1)).findByDriverId(999L);
    }

    @Test
    @DisplayName("UT-V06: Status van voertuig succesvol bijwerken")
    void updateVehicleStatus_Success() {
        Vehicle updated = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.MAINTENANCE, 60, 240, 101L);
        when(vehicleRepository.updateStatus(1L, VehicleStatus.MAINTENANCE)).thenReturn(updated);

        Vehicle result = vehicleService.updateVehicleStatus(1L, VehicleStatus.MAINTENANCE);

        assertNotNull(result);
        assertEquals(VehicleStatus.MAINTENANCE, result.getStatus());
        verify(vehicleRepository, times(1)).updateStatus(1L, VehicleStatus.MAINTENANCE);
    }

    @Test
    @DisplayName("UT-V07: Foutmelding wanneer status null is bij update")
    void updateVehicleStatus_NullStatus_ThrowsException() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.updateVehicleStatus(1L, null)
        );

        assertEquals("Status cannot be null", ex.getMessage());
        verify(vehicleRepository, never()).updateStatus(anyLong(), any());
    }

    @Test
    @DisplayName("UT-V08: Voertuig succesvol aanmaken met hoofdletters kenteken en standaard status")
    void createVehicle_Success_DefaultStatus() {
        CreateVehicleRequest request = new CreateVehicleRequest("v-101-bb", "Mercedes-Benz eVito", null, 60, 240, null);

        when(vehicleRepository.findByLicensePlate("V-101-BB")).thenReturn(Optional.empty());
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Vehicle created = vehicleService.createVehicle(request);

        assertNotNull(created);
        assertEquals("V-101-BB", created.getLicensePlate());
        assertEquals(VehicleStatus.AVAILABLE, created.getStatus());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("UT-V09: Voertuig creatie weigeren bij null of leeg kenteken")
    void createVehicle_InvalidLicensePlate_ThrowsException() {
        CreateVehicleRequest nullPlate = new CreateVehicleRequest(null, "eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        assertThrows(IllegalArgumentException.class, () -> vehicleService.createVehicle(nullPlate));

        CreateVehicleRequest blankPlate = new CreateVehicleRequest("   ", "eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        assertThrows(IllegalArgumentException.class, () -> vehicleService.createVehicle(blankPlate));
    }

    @Test
    @DisplayName("UT-V10: Voertuig creatie weigeren bij null of leeg model")
    void createVehicle_InvalidModel_ThrowsException() {
        CreateVehicleRequest nullModel = new CreateVehicleRequest("V-101-BB", null, VehicleStatus.AVAILABLE, 60, 240, null);
        assertThrows(IllegalArgumentException.class, () -> vehicleService.createVehicle(nullModel));

        CreateVehicleRequest blankModel = new CreateVehicleRequest("V-101-BB", "   ", VehicleStatus.AVAILABLE, 60, 240, null);
        assertThrows(IllegalArgumentException.class, () -> vehicleService.createVehicle(blankModel));
    }

    @Test
    @DisplayName("UT-V11: Voertuig creatie weigeren bij ongeldige batterij of actieradius")
    void createVehicle_InvalidBatteryOrRange_ThrowsException() {
        CreateVehicleRequest negativeRange = new CreateVehicleRequest("V-101-BB", "eVito", VehicleStatus.AVAILABLE, 60, -1, null);
        assertThrows(IllegalArgumentException.class, () -> vehicleService.createVehicle(negativeRange));

        CreateVehicleRequest zeroBattery = new CreateVehicleRequest("V-101-BB", "eVito", VehicleStatus.AVAILABLE, 0, 100, null);
        assertThrows(IllegalArgumentException.class, () -> vehicleService.createVehicle(zeroBattery));
    }

    @Test
    @DisplayName("UT-V12: Voertuig creatie weigeren bij duplicaat kenteken")
    void createVehicle_DuplicatePlate_ThrowsException() {
        CreateVehicleRequest request = new CreateVehicleRequest("V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        when(vehicleRepository.findByLicensePlate("V-101-BB")).thenReturn(Optional.of(sampleVehicle));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.createVehicle(request)
        );

        assertTrue(ex.getMessage().contains("already exists"));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }
}
