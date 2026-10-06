package nl.fleethub.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import nl.fleethub.backend.dto.CreateVehicleRequest;
import nl.fleethub.backend.dto.UpdateVehicleStatusRequest;
import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.service.VehicleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VehicleController.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VehicleService vehicleService;

    @Test
    @DisplayName("API-V01: GET /api/vehicles geeft 200 en lijst van voertuigen")
    void getAllVehicles_Success() throws Exception {
        Vehicle vehicle = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        when(vehicleService.getAllVehicles()).thenReturn(List.of(vehicle));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].licensePlate").value("V-101-BB"));
    }

    @Test
    @DisplayName("API-V02: GET /api/vehicles/{id} geeft 200 bij bestaand voertuig")
    void getVehicleById_Success() throws Exception {
        Vehicle vehicle = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        when(vehicleService.getVehicleById(1L)).thenReturn(vehicle);

        mockMvc.perform(get("/api/vehicles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.licensePlate").value("V-101-BB"));
    }

    @Test
    @DisplayName("API-V03: GET /api/vehicles/{id} geeft 404 bij onbekend ID")
    void getVehicleById_NotFound() throws Exception {
        when(vehicleService.getVehicleById(999L)).thenThrow(new IllegalArgumentException("Vehicle with id 999 not found"));

        mockMvc.perform(get("/api/vehicles/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("API-V04: POST /api/vehicles geeft 201 bij succesvolle creatie")
    void createVehicle_Success() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest("V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        Vehicle vehicle = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 60, 240, null);
        when(vehicleService.createVehicle(any(CreateVehicleRequest.class))).thenReturn(vehicle);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.licensePlate").value("V-101-BB"));
    }

    @Test
    @DisplayName("API-V05: POST /api/vehicles geeft 400 bij ongeldige invoer")
    void createVehicle_BadRequest() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest("V-101-BB", "Mercedes-Benz eVito", VehicleStatus.AVAILABLE, 0, -10, null);
        when(vehicleService.createVehicle(any(CreateVehicleRequest.class)))
                .thenThrow(new IllegalArgumentException("Battery capacity and range must be positive numbers"));

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("API-V06: PATCH /api/vehicles/{id}/status geeft 200 bij statusupdate")
    void updateStatus_Success() throws Exception {
        UpdateVehicleStatusRequest request = new UpdateVehicleStatusRequest(VehicleStatus.MAINTENANCE);
        Vehicle updated = new Vehicle(1L, "V-101-BB", "Mercedes-Benz eVito", VehicleStatus.MAINTENANCE, 60, 240, null);
        when(vehicleService.updateVehicleStatus(eq(1L), eq(VehicleStatus.MAINTENANCE))).thenReturn(updated);

        mockMvc.perform(patch("/api/vehicles/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("MAINTENANCE"));
    }
}