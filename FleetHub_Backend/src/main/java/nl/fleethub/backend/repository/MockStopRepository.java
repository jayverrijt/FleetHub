package nl.fleethub.backend.repository;

import nl.fleethub.backend.model.DeliveryStop;
import nl.fleethub.backend.model.StopStatus;
import nl.fleethub.backend.repository.interfaces.StopRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class MockStopRepository implements StopRepository {

    private final List<DeliveryStop> stops = new ArrayList<>();

    public MockStopRepository() {
        stops.add(new DeliveryStop(1L, "ORD-1001", "Jan de Vries", "Heuvelstraat 42", "Tilburg", 1, StopStatus.PENDING, 101L));
        stops.add(new DeliveryStop(2L, "ORD-1002", "Sophie Bakker", "Markt 15", "Venlo", 2, StopStatus.PENDING, 101L));
        stops.add(new DeliveryStop(3L, "ORD-1003", "Bram van Dijk", "Oudegracht 118", "Utrecht", 3, StopStatus.PENDING, 101L));
        stops.add(new DeliveryStop(4L, "ORD-1004", "Emma Hermans", "Korenpad 5", "Arnhem", 4, StopStatus.PENDING, 101L));

        stops.add(new DeliveryStop(5L, "ORD-1005", "Daan Peters", "Marktstraat 8", "Asten", 1, StopStatus.PENDING, 102L));
        stops.add(new DeliveryStop(6L, "ORD-1006", "Lisa Janssen", "Vrijthof 21", "Maastricht", 2, StopStatus.PENDING, 102L));
        stops.add(new DeliveryStop(7L, "ORD-1007", "Klaas Visser", "Coolsingel 50", "Rotterdam", 3, StopStatus.PENDING, 102L));
    }

    @Override
    public List<DeliveryStop> findActiveByDriverId(Long driverId) {
        return stops.stream()
                .filter(s -> s.getDriverId().equals(driverId))
                .sorted(Comparator.comparingInt(DeliveryStop::getSequenceOrder))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<DeliveryStop> findById(Long id) {
        return stops.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst();
    }

    @Override
    public DeliveryStop updateStatus(Long id, StopStatus newStatus) {
        DeliveryStop stop = findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stop with id " + id + " not found"));
        stop.setStatus(newStatus);
        return stop;
    }
}