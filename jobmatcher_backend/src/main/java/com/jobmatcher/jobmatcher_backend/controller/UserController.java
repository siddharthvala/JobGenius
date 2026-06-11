package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.ChangePasswordRequest;
import com.jobmatcher.jobmatcher_backend.dto.ProfileImageResponse;
import com.jobmatcher.jobmatcher_backend.dto.UserResponse;
import com.jobmatcher.jobmatcher_backend.dto.UserUpdateRequest;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import com.jobmatcher.jobmatcher_backend.service.ProfileImageService;
import com.jobmatcher.jobmatcher_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserService userService;

    @Autowired
    ProfileImageService profileImageService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new UserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@Valid @RequestBody UserUpdateRequest updatedInfo, Authentication authentication) {

        String email = authentication.getName();

        UserResponse userResponse = userService.updateCurrentUser(email, updatedInfo);

        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/profile-image")
    public ResponseEntity<ProfileImageResponse> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        ProfileImageResponse response = profileImageService.uploadProfileImage(file, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
