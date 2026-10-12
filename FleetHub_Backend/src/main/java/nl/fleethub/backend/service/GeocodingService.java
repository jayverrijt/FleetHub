package nl.fleethub.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeocodingService(ObjectMapper objectMapper) {
        this.restClient = RestClient.builder().build();
        this.objectMapper = objectMapper;
    }

    public double[] geocode(String address, String city) {
        if (address == null || address.isBlank() || city == null || city.isBlank()) {
            throw new IllegalArgumentException("Adres en stad zijn verplicht voor geocodering");
        }

        String cleanAddress = address.trim();
        String cleanCity = city.trim();

        // 1. Probeer eerst PDOK (volledig adres)
        double[] coords = queryPdok(cleanAddress + " " + cleanCity);
        if (coords != null) {
            return coords;
        }

        // 2. Fallback: OpenStreetMap Nominatim vanaf de backend
        log.warn("PDOK leverde geen resultaat voor '{} {}'. Schakelt over naar Nominatim...", cleanAddress, cleanCity);
        coords = queryNominatim(cleanAddress + ", " + cleanCity);
        if (coords != null) {
            return coords;
        }

        // 3. Fallback: Probeer straatnaam zonder huisnummer via Nominatim
        String streetOnly = cleanAddress.replaceAll("\\d+.*", "").trim();
        if (!streetOnly.isBlank() && !streetOnly.equalsIgnoreCase(cleanAddress)) {
            log.warn("Zoekt straat via Nominatim: '{} in {}'", streetOnly, cleanCity);
            coords = queryNominatim(streetOnly + ", " + cleanCity);
            if (coords != null) {
                return coords;
            }
        }

        // 4. Fallback: Stadscentrum via Nominatim
        log.warn("Straat niet gevonden, zoekt stadscentrum via Nominatim: '{}'", cleanCity);
        coords = queryNominatim(cleanCity);
        if (coords != null) {
            return coords;
        }

        throw new IllegalArgumentException("Kon geen geldige GPS-coördinaten bepalen voor: " + cleanAddress + " " + cleanCity);
    }

    private double[] queryPdok(String queryText) {
        try {
            // Handmatig encoderen voorkomt dubbele URI-encoding en Nginx 404's
            String encodedQuery = URLEncoder.encode(queryText, StandardCharsets.UTF_8);
            URI uri = URI.create("https://api.pdok.nl/bzk/locatieserver/v3_1/free?q=" + encodedQuery + "&rows=1");

            String response = restClient.get()
                    .uri(uri)
                    .header("Accept", "application/json")
                    .header("User-Agent", "FleetHub-App/1.0")
                    .retrieve()
                    .body(String.class);

            JsonNode docs = objectMapper.readTree(response).path("response").path("docs");
            if (docs.isArray() && !docs.isEmpty()) {
                JsonNode firstDoc = docs.get(0);
                String centroideWkt = firstDoc.path("centroide_ll").asText(); // "POINT(lon lat)"
                if (centroideWkt.startsWith("POINT(") && centroideWkt.endsWith(")")) {
                    String clean = centroideWkt.substring(6, centroideWkt.length() - 1).trim();
                    String[] parts = clean.split("\\s+");
                    double lon = Double.parseDouble(parts[0]);
                    double lat = Double.parseDouble(parts[1]);
                    log.info("PDOK gevonden: {} -> [lat: {}, lon: {}]", firstDoc.path("weergavenaam").asText(), lat, lon);
                    return new double[]{lat, lon};
                }
            }
        } catch (Exception e) {
            log.warn("PDOK call mislukt voor '{}': {}", queryText, e.getMessage());
        }
        return null;
    }

    private double[] queryNominatim(String queryText) {
        try {
            String encodedQuery = URLEncoder.encode(queryText + ", Netherlands", StandardCharsets.UTF_8);
            URI uri = URI.create("https://nominatim.openstreetmap.org/search?q=" + encodedQuery + "&format=json&limit=1");

            String response = restClient.get()
                    .uri(uri)
                    .header("Accept", "application/json")
                    .header("User-Agent", "FleetHub-Courier-Platform/1.0 (contact: info@fleethub.nl)")
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            if (root.isArray() && !root.isEmpty()) {
                double lat = root.get(0).path("lat").asDouble();
                double lon = root.get(0).path("lon").asDouble();
                log.info("Nominatim match voor '{}' -> [lat: {}, lon: {}]", queryText, lat, lon);
                return new double[]{lat, lon};
            }
        } catch (Exception e) {
            log.warn("Nominatim lookup mislukt voor '{}': {}", queryText, e.getMessage());
        }
        return null;
    }
}