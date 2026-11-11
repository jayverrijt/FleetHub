package nl.fleethub.backend.controller;

import nl.fleethub.backend.model.User;
import nl.fleethub.backend.repository.jpa.SpringDataUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DriverProfileControllerTest {

    @Mock
    private SpringDataUserRepository userRepository;

    private DriverProfileController controller;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        // Expliciet instantiëren met mock repository en een test-base-url
        controller = new DriverProfileController(userRepository, "https://api.fleethub.test");

        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setFullName("Jan de Vries");
        sampleUser.setEmail("driver@fleethub.nl");
    }

    @Test
    @DisplayName("UT-AVATAR-01: Upload geldige profielfoto combineert base URL en werkt user bij")
    void uploadProfilePicture_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                "dummy image bytes".getBytes()
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = controller.uploadProfilePicture(file, 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        String avatarUrl = (String) body.get("avatarUrl");

        // Verifieert dat de geconfigureerde base URL netjes vooraan staat en er geen hardcoded localhost is
        assertTrue(avatarUrl.startsWith("https://api.fleethub.test/uploads/avatars/driver_1_"));
        assertEquals("Profielfoto succesvol bijgewerkt", body.get("message"));

        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).save(sampleUser);
        assertEquals(avatarUrl, sampleUser.getAvatarUrl());
    }

    @Test
    @DisplayName("UT-AVATAR-02: Leeg bestand geeft HTTP 400 Bad Request")
    void uploadProfilePicture_EmptyFile_Returns400() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        ResponseEntity<?> response = controller.uploadProfilePicture(emptyFile, 1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).findById(anyLong());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("UT-AVATAR-03: Null bestand geeft HTTP 400 Bad Request")
    void uploadProfilePicture_NullFile_Returns400() {
        ResponseEntity<?> response = controller.uploadProfilePicture(null, 1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("UT-AVATAR-04: Niet-toegestaan bestandstype geeft HTTP 415 Unsupported Media Type")
    void uploadProfilePicture_InvalidContentType_Returns415() {
        MockMultipartFile invalidFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "%PDF-1.4 dummy content".getBytes()
        );

        ResponseEntity<?> response = controller.uploadProfilePicture(invalidFile, 1L);

        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, response.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("UT-AVATAR-05: Fallback naar relatief pad wanneer base URL leeg of null is")
    void uploadProfilePicture_EmptyBaseUrl_GeneratesRelativeUrl() {
        DriverProfileController controllerWithoutBaseUrl = new DriverProfileController(userRepository, "");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "photo.jpg",
                "image/jpeg",
                "bytes".getBytes()
        );

        when(userRepository.findById(2L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = controllerWithoutBaseUrl.uploadProfilePicture(file, 2L);

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        String avatarUrl = (String) body.get("avatarUrl");

        assertTrue(avatarUrl.startsWith("/uploads/avatars/driver_2_"));
    }
}