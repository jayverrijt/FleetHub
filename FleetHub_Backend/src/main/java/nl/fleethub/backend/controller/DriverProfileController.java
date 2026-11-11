package nl.fleethub.backend.controller;

import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/driver")
public class DriverProfileController {

    private final SpringDataUserRepository userRepository;
    private final String backendBaseUrl;
    private final Path storageDirectory = Paths.get("uploads/avatars");

    @Autowired
    public DriverProfileController(
            SpringDataUserRepository userRepository,
            @Value("${app.backend-base-url:}") String backendBaseUrl) {
        this.userRepository = userRepository;
        this.backendBaseUrl = backendBaseUrl;
        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("Kon upload-map niet initialiseren: " + e.getMessage(), e);
        }
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("driverId") Long driverId) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Geen bestand ontvangen."));
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("message", "Alleen JPG, PNG en WebP bestanden zijn toegestaan."));
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";

            String newFilename = "driver_" + driverId + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Path targetPath = this.storageDirectory.resolve(newFilename);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String baseUrl = "";
            if (backendBaseUrl != null && !backendBaseUrl.isBlank()) {
                baseUrl = backendBaseUrl.endsWith("/")
                        ? backendBaseUrl.substring(0, backendBaseUrl.length() - 1)
                        : backendBaseUrl;
            }
            String avatarUrl = baseUrl + "/uploads/avatars/" + newFilename;

            userRepository.findById(driverId).ifPresent(user -> {
                user.setAvatarUrl(avatarUrl);
                userRepository.save(user);
            });

            return ResponseEntity.ok(Map.of(
                    "avatarUrl", avatarUrl,
                    "message", "Profielfoto succesvol bijgewerkt"
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Kon afbeelding niet opslaan: " + e.getMessage()));
        }
    }
}