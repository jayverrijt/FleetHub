package nl.fleethub.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. DTO Veldvalidatie (@NotBlank, @Positive, etc.) -> HTTP 400 Bad Request
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    // 2. Lege of corrupte JSON-body -> HTTP 400 Bad Request
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleMalformedJson(HttpMessageNotReadableException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Request body is missing or malformed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // 3. Afhandeling van domeinstatusfouten (bijv. reeds voltooide stop) -> HTTP 400 Bad Request
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage() != null ? ex.getMessage() : "Ongeldige statusovergang");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // 4. 404 Not Found vs 400 Bad Request voor argumentfouten
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage() != null ? ex.getMessage() : "Unknown error";
        String lowerMsg = message.toLowerCase();

        error.put("message", message);

        if (lowerMsg.contains("not found") || lowerMsg.contains("niet gevonden") || lowerMsg.contains("no vehicle assigned")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}