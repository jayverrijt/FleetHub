package nl.fleethub.backend.config;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.Role;
import nl.fleethub.backend.model.Route;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.model.User;
import nl.fleethub.backend.model.Vehicle;
import nl.fleethub.backend.model.VehicleStatus;
import nl.fleethub.backend.repository.jpa.SpringDataRouteRepository;
import nl.fleethub.backend.repository.jpa.SpringDataStopRepository;
import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import nl.fleethub.backend.repository.jpa.SpringDataVehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

// Database-seeder die bij een lege database de initiele gebruikers, voertuigen, routes en stops aanmaakt.
@Configuration
@Profile("!test")
public class DatabaseSeeder {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Bean
    public CommandLineRunner seedDatabase(
            SpringDataUserRepository userRepository,
            SpringDataVehicleRepository vehicleRepository,
            SpringDataRouteRepository routeRepository,
            SpringDataStopRepository stopRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // 1. Seed gebruikers (indien nog niet aanwezig)
            if (userRepository.count() == 0) {
                User driver1 = new User();
                driver1.setEmail("driver1@fleethub.nl");
                driver1.setFullName("Jan de Vries");
                driver1.setPassword(passwordEncoder.encode("password123"));
                driver1.setRole(Role.ROLE_COURIER);

                User driver2 = new User();
                driver2.setEmail("driver2@fleethub.nl");
                driver2.setFullName("Sophie Bakker");
                driver2.setPassword(passwordEncoder.encode("password123"));
                driver2.setRole(Role.ROLE_COURIER);

                User dispatcher = new User();
                dispatcher.setEmail("dispatcher@fleethub.nl");
                dispatcher.setFullName("Jane Smith");
                dispatcher.setPassword(passwordEncoder.encode("password123"));
                dispatcher.setRole(Role.ROLE_DISPATCHER);

                userRepository.saveAll(List.of(driver1, driver2, dispatcher));
                log.info("DatabaseSeeder: Initiële gebruikers aangemaakt.");
            }

            // 2. Seed voertuigen, routes en stops (indien routes leeg zijn)
            if (routeRepository.count() == 0) {
                Vehicle v1 = new Vehicle(null, "VH-01-AB", "Nissan e-NV200", VehicleStatus.ON_ROUTE, 40, 180, 1L);
                Vehicle v2 = new Vehicle(null, "VH-02-CD", "Renault Kangoo E-Tech", VehicleStatus.ON_ROUTE, 45, 210, 2L);
                vehicleRepository.saveAll(List.of(v1, v2));

                Route r104 = new Route();
                r104.setName("Route #104 - Zuidoost Brabant");
                r104.setDriverId(1L);
                r104.setVehicleId(1L);
                r104.setStatus("IN_PROGRESS");

                Route r105 = new Route();
                r105.setName("Route #105 - Midden Brabant");
                r105.setDriverId(2L);
                r105.setVehicleId(2L);
                r105.setStatus("PLANNED");

                List<Route> savedRoutes = routeRepository.saveAll(List.of(r104, r105));
                Long route104Id = savedRoutes.get(0).getId();
                Long route105Id = savedRoutes.get(1).getId();

                DeliveryStop s1 = buildStop(route104Id, 1L, "ORD-1001", "Fontys Rachelsmolen", 1, "Rachelsmolen 1", "Eindhoven", 51.4518, 5.4815, 30);
                DeliveryStop s2 = buildStop(route104Id, 1L, "ORD-1002", "PSV Stadion", 2, "Frederiklaan 10", "Eindhoven", 51.4419, 5.4674, 60);
                DeliveryStop s3 = buildStop(route104Id, 1L, "ORD-1003", "Jay Verrijt", 3, "Kievitstraat 36", "Helmond", 51.48865, 5.6552, 90);
                DeliveryStop s4 = buildStop(route105Id, 2L, "ORD-2001", "Daan Peters", 1, "Heuvelstraat 42", "Tilburg", 51.5562, 5.0864, 45);

                stopRepository.saveAll(List.of(s1, s2, s3, s4));
                log.info("DatabaseSeeder: Initiële voertuigen, routes en stops aangemaakt.");
            }
        };
    }

    private DeliveryStop buildStop(Long routeId, Long driverId, String orderNumber, String recipientName,
                                   int sequenceOrder, String address, String city,
                                   double lat, double lon, int minutesOffset) {
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
        stop.setStatus(StopStatus.PENDING);
        stop.setEstimatedArrival(LocalDateTime.now().plusMinutes(minutesOffset));
        return stop;
    }
}