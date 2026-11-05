    package nl.fleethub.backend.exception;

    import org.junit.jupiter.api.DisplayName;
    import org.junit.jupiter.api.Test;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;

    import java.util.Map;

    import static org.junit.jupiter.api.Assertions.*;

    class GlobalExceptionHandlerTest {

        private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

        @Test
        @DisplayName("EX-01: IllegalArgumentException met 'not found' levert HTTP 404")
        void handleNotFound() {
            IllegalArgumentException ex = new IllegalArgumentException("Stop with id 999 not found");
            ResponseEntity<Map<String, String>> response = handler.handleIllegalArgumentException(ex);

            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Stop with id 999 not found", response.getBody().get("message"));
        }

        @Test
        @DisplayName("EX-02: IllegalArgumentException zonder 'not found' levert HTTP 400")
        void handleBadRequest() {
            IllegalArgumentException ex = new IllegalArgumentException("Status is required");
            ResponseEntity<Map<String, String>> response = handler.handleIllegalArgumentException(ex);

            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Status is required", response.getBody().get("message"));
        }

        @Test
        @DisplayName("EX-03: IllegalStateException levert HTTP 400")
        void handleIllegalState() {
            IllegalStateException ex = new IllegalStateException("Stop has already been finalized");
            ResponseEntity<Map<String, String>> response = handler.handleIllegalStateException(ex);

            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Stop has already been finalized", response.getBody().get("message"));
        }
    }