package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.LoginRequest;
import com.jobmatcher.jobmatcher_backend.dto.LoginResponse;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailNotificationService emailNotificationService;

    public User register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email is already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user); // ← save first

        try {
            emailNotificationService.sendWelcomeEmail(
                    savedUser.getEmail(),
                    savedUser.getUsername() != null ? savedUser.getUsername() : savedUser.getEmail()
            );
        } catch (Exception e) {
            log.warn("Welcome email failed for {}: {}", savedUser.getEmail(), e.getMessage());
        }

        return savedUser;
    }

    public String login(LoginRequest request) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            if (authentication.isAuthenticated()) {
                return jwtService.generateToken(request.getEmail());
            }

        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password ");
        }

        return null;
    }


    public LoginResponse loginresponse(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        if (authentication.isAuthenticated()) {

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtService.generateToken(user.getEmail());

            return new LoginResponse(
                    token,
                    user.getEmail(),
                    user.getUsername(),
                    user.getRole()
            );
        }

        throw new RuntimeException("Invalid credentials");
    }
}
