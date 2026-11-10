package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.repository.jpa.SpringDataVehicleRepository;
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
class VehicleDatabaseRepositoryTest {

    @Mock
    private SpringDataVehicleRepository jpaRepository;

    @InjectMocks
    private VehicleDatabaseRepository vehicleDatabaseRepository;

    @Test
    @DisplayName("UT-REPO-VEH-01: Delegeert findAll, findById, findByLicensePlate en findByDriverId")
    void delegationQueries_WorkCorrectly() {
        Vehicle vehicle = new Vehicle(1L, "V-101-BB", "Mercedes eVito", VehicleStatus.AVAILABLE, 60, 240, 10L);
        when(jpaRepository.findAll()).thenReturn(List.of(vehicle));
        when(jpaRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(jpaRepository.findByLicensePlate("V-101-BB")).thenReturn(Optional.of(vehicle));
        when(jpaRepository.findByAssignedDriverId(10L)).thenReturn(Optional.of(vehicle));
        when(jpaRepository.save(vehicle)).thenReturn(vehicle);

        assertEquals(1, vehicleDatabaseRepository.findAll().size());
        assertTrue(vehicleDatabaseRepository.findById(1L).isPresent());
        assertTrue(vehicleDatabaseRepository.findByLicensePlate("V-101-BB").isPresent());
        assertTrue(vehicleDatabaseRepository.findByDriverId(10L).isPresent());
        assertNotNull(vehicleDatabaseRepository.save(vehicle));
    }

    @Test
    @DisplayName("UT-REPO-VEH-02: updateStatus werkt voertuigstatus correct bij")
    void updateStatus_ExistingVehicle_UpdatesSuccessfully() {
        Vehicle vehicle = new Vehicle(1L, "V-101-BB", "Mercedes eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        when(jpaRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(jpaRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Vehicle updated = vehicleDatabaseRepository.updateStatus(1L, VehicleStatus.MAINTENANCE);

        assertEquals(VehicleStatus.MAINTENANCE, updated.getStatus());
        verify(jpaRepository).save(vehicle);
    }

    @Test
    @DisplayName("UT-REPO-VEH-03: updateStatus gooit exceptie bij onbekend voertuig-id")
    void updateStatus_NotFound_ThrowsException() {
        when(jpaRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> vehicleDatabaseRepository.updateStatus(404L, VehicleStatus.ON_ROUTE));
    }
}