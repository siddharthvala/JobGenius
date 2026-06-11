package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.ChangePasswordRequest;
import com.jobmatcher.jobmatcher_backend.dto.UserResponse;
import com.jobmatcher.jobmatcher_backend.dto.UserUpdateRequest;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    public UserResponse updateCurrentUser(String email, UserUpdateRequest updatedInfo) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedInfo.getEmail() != null &&
                !user.getEmail().equals(updatedInfo.getEmail()) &&
                userRepository.findByEmail(updatedInfo.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        if (updatedInfo.getUsername() != null) user.setUsername(updatedInfo.getUsername());
        if (updatedInfo.getEmail() != null) user.setEmail(updatedInfo.getEmail());
        if (updatedInfo.getPhone() != null) user.setPhone(updatedInfo.getPhone().isBlank() ? null : updatedInfo.getPhone());
        if (updatedInfo.getLocation() != null) user.setLocation(updatedInfo.getLocation().isBlank() ? null : updatedInfo.getLocation());
        if (updatedInfo.getEducation() != null) user.setEducation(updatedInfo.getEducation().isBlank() ? null : updatedInfo.getEducation());
        if (updatedInfo.getAboutMe() != null) user.setAboutMe(updatedInfo.getAboutMe().isBlank() ? null : updatedInfo.getAboutMe());

        return new UserResponse(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}


