package nl.fleethub.backend.config;

import nl.fleethub.backend.model.*;
import nl.fleethub.backend.repository.jpa.SpringDataRouteRepository;
import nl.fleethub.backend.repository.jpa.SpringDataStopRepository;
import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import nl.fleethub.backend.repository.jpa.SpringDataVehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@Profile("!test")
public class DatabaseSeeder {

    @Bean
    public CommandLineRunner initDatabaseData(
            SpringDataUserRepository userRepository,
            SpringDataRouteRepository routeRepository,
            SpringDataVehicleRepository vehicleRepository,
            SpringDataStopRepository stopRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Standaard accounts aanmaken / ophalen
            User driver1 = userRepository.findByEmail("driver1@fleethub.nl")
                    .orElseGet(() -> userRepository.save(new User(null, "driver1@fleethub.nl", passwordEncoder.encode("password123"), "Jan de Vries", Role.ROLE_COURIER)));

            User driver2 = userRepository.findByEmail("driver2@fleethub.nl")
                    .orElseGet(() -> userRepository.save(new User(null, "driver2@fleethub.nl", passwordEncoder.encode("password123"), "Sophie Bakker", Role.ROLE_COURIER)));

            userRepository.findByEmail("dispatcher@fleethub.nl")
                    .orElseGet(() -> userRepository.save(new User(null, "dispatcher@fleethub.nl", passwordEncoder.encode("password123"), "Tim de Planner", Role.ROLE_DISPATCHER)));

            // 2. Alleen seeden als er nog geen routes bestaan
            if (routeRepository.count() == 0) {
                Vehicle vehicle1 = vehicleRepository.save(new Vehicle(null, "VH-01-AB", "Nissan e-NV200", VehicleStatus.ON_ROUTE, 40, 180, driver1.getId()));
                Vehicle vehicle2 = vehicleRepository.save(new Vehicle(null, "VH-02-CD", "Renault Kangoo E-Tech", VehicleStatus.ON_ROUTE, 45, 210, driver2.getId()));

                Route route104 = routeRepository.save(new Route(null, "Eindhoven Centrum - Ochtend", driver1.getId(), vehicle1.getId(), "IN_PROGRESS"));
                Route route105 = routeRepository.save(new Route(null, "Helmond West - Middag", driver1.getId(), vehicle1.getId(), "PLANNED"));
                Route route106 = routeRepository.save(new Route(null, "Tilburg Centrum - Dagroute", driver2.getId(), vehicle2.getId(), "IN_PROGRESS"));

                // Route 104 (Chauffeur 1) - Alle 4 stops op PENDING
                stopRepository.saveAll(List.of(
                        createStop(route104.getId(), driver1.getId(), "ORD-1001", "Fontys Rachelsmolen R1", 1, "Rachelsmolen 1", "Eindhoven", 51.4518, 5.4815, StopStatus.PENDING),
                        createStop(route104.getId(), driver1.getId(), "ORD-1002", "Sophie Jansen", 2, "Frederiklaan 10", "Eindhoven", 51.4419, 5.4674, StopStatus.PENDING),
                        createStop(route104.getId(), driver1.getId(), "ORD-1003", "Jay Verrijt", 3, "Kievitstraat 36", "Helmond", 51.48865, 5.6552, StopStatus.PENDING),
                        createStop(route104.getId(), driver1.getId(), "ORD-TEST-PICNICHLM", "Klant Picnic Helmond", 4, "Duizeldonksestraat 15", "Helmond", 51.4682, 5.6698, StopStatus.PENDING)
                ));

                // Route 105 (Chauffeur 1) - Alle 2 stops op PENDING
                stopRepository.saveAll(List.of(
                        createStop(route105.getId(), driver1.getId(), "ORD-2001", "Karel Visser", 1, "Markt 15", "Helmond", 51.4815, 5.6580, StopStatus.PENDING),
                        createStop(route105.getId(), driver1.getId(), "ORD-2002", "Daan Peters", 2, "Molenstraat 26", "Helmond", 51.4800, 5.6530, StopStatus.PENDING)
                ));

                // Route 106 (Chauffeur 2) - Alle 2 stops op PENDING
                stopRepository.saveAll(List.of(
                        createStop(route106.getId(), driver2.getId(), "ORD-3001", "Bram van Dijk", 1, "Heuvelstraat 42", "Tilburg", 51.5562, 5.0864, StopStatus.PENDING),
                        createStop(route106.getId(), driver2.getId(), "ORD-3002", "Emma Hermans", 2, "Spoorlaan 12", "Tilburg", 51.5601, 5.0830, StopStatus.PENDING)
                ));
            }
        };
    }

    private DeliveryStop createStop(Long routeId, Long driverId, String orderNumber, String recipientName,
                                    int sequenceOrder, String address, String city, double lat, double lon, StopStatus status) {
        DeliveryStop stop = new DeliveryStop();
        stop.setRouteId(routeId);
        stop.setDriverId(driverId);
        stop.setOrderNumber(orderNumber);
        stop.setRecipientName(recipientName);
        stop.setSequenceOrder(sequenceOrder);
        stop.setAddress(address);
        stop.setCity(city);
        stop.setLatitude(lat);
        stop.setLongitude(lon);
        stop.setStatus(status);
        stop.setEstimatedArrival(LocalDateTime.now().plusHours(sequenceOrder));
        return stop;
    }
}