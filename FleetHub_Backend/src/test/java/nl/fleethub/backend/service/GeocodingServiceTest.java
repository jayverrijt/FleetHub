package nl.fleethub.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GeocodingServiceTest {

    private GeocodingService geocodingService;
    private MockRestServiceServer mockServer;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        geocodingService = new GeocodingService(objectMapper);
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        ReflectionTestUtils.setField(geocodingService, "restClient", builder.build());
    }

    @Test
    @DisplayName("UT-GEO-01: PDOK succesvol parsen naar lat/lon")
    void geocode_PdokSuccess() {
        String pdokResponse = """
                {
                  "response": {
                    "docs": [
                      {
                        "weergavenaam": "Rachelsmolen 1, Eindhoven",
                        "centroide_ll": "POINT(5.4815 51.4518)"
                      }
                    ]
                  }
                }
                """;

        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("api.pdok.nl")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(pdokResponse, MediaType.APPLICATION_JSON));

        double[] coords = geocodingService.geocode("Rachelsmolen 1", "Eindhoven");

        assertNotNull(coords);
        assertEquals(51.4518, coords[0], 0.0001);
        assertEquals(5.4815, coords[1], 0.0001);
        mockServer.verify();
    }

    @Test
    @DisplayName("UT-GEO-02: PDOK levert niets op, fallback naar Nominatim slaagt")
    void geocode_FallbackToNominatim_Success() {
        String emptyPdok = "{\"response\":{\"docs\":[]}}";
        String nominatimResponse = """
                [
                  {
                    "lat": "51.4416",
                    "lon": "5.4697"
                  }
                ]
                """;

        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("api.pdok.nl")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(emptyPdok, MediaType.APPLICATION_JSON));

        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("nominatim.openstreetmap.org")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(nominatimResponse, MediaType.APPLICATION_JSON));

        double[] coords = geocodingService.geocode("Kerkstraat 1", "Eindhoven");

        assertNotNull(coords);
        assertEquals(51.4416, coords[0], 0.0001);
        assertEquals(5.4697, coords[1], 0.0001);
        mockServer.verify();
    }

    @Test
    @DisplayName("UT-GEO-03: Foutmelding gooien bij lege of ongeldige invoer")
    void geocode_InvalidInput_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> geocodingService.geocode(null, "Eindhoven"));
        assertThrows(IllegalArgumentException.class, () -> geocodingService.geocode("   ", "Eindhoven"));
        assertThrows(IllegalArgumentException.class, () -> geocodingService.geocode("Rachelsmolen 1", null));
        assertThrows(IllegalArgumentException.class, () -> geocodingService.geocode("Rachelsmolen 1", "   "));
    }

    @Test
    @DisplayName("UT-GEO-04: Exceptie gooien als alle providers falen")
    void geocode_AllProvidersFail_ThrowsException() {
        // PDOK mislukt
        mockServer.expect(ExpectedCount.between(1, 2), requestTo(org.hamcrest.Matchers.containsString("api.pdok.nl")))
                .andRespond(withServerError());

        // Alle opeenvolgende Nominatim fallbacks (volledig adres, straat, stad) mogen falen
        mockServer.expect(ExpectedCount.between(1, 5), requestTo(org.hamcrest.Matchers.containsString("nominatim.openstreetmap.org")))
                .andRespond(withServerError());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> geocodingService.geocode("OnbekendAdres 999", "OnbekendStad")
        );

        assertTrue(ex.getMessage().contains("Kon geen geldige GPS-coördinaten bepalen"));
    }
}
