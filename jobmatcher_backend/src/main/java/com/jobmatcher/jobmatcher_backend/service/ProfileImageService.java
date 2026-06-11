package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.ProfileImageResponse;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class ProfileImageService {

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            ".jpg", ".jpeg", ".png", ".webp"
    );

    @Value("${file.profile-image-dir:uploads/profile-images}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    private UserRepository userRepository;

    public ProfileImageResponse uploadProfileImage(MultipartFile file, String userEmail) {
        validateFile(file);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProfileImageFileName() != null) {
            deleteFileFromDisk(user.getProfileImageFileName());
        }

        String savedFileName = storeFile(file);

        user.setProfileImageFileName(savedFileName);
        user.setProfileImageUrl(baseUrl + "/uploads/profile-images/" + savedFileName);

        userRepository.save(user);

        return new ProfileImageResponse(user);
    }

    // ── Private helpers ────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File must not be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Image size exceeds the 2MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Invalid file type. Only JPG, PNG, and WEBP images are allowed");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException("File name must not be empty");
        }

        String lowerName = originalName.toLowerCase();
        boolean hasValidExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
        if (!hasValidExtension) {
            throw new RuntimeException("Invalid file extension. Only .jpg, .jpeg, .png, .webp are allowed");
        }
    }

    private String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename();
            String extension = originalName.substring(originalName.lastIndexOf('.'));
            String uniqueFileName = UUID.randomUUID() + extension;

            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store image. Please try again: " + ex.getMessage());
        }
    }

    private void deleteFileFromDisk(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // Non-critical — old image cleanup failure should not block the upload
        }
    }
}
