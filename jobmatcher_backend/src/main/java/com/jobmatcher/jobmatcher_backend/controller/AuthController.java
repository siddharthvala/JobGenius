package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.LoginRequest;
import com.jobmatcher.jobmatcher_backend.dto.LoginResponse;
import com.jobmatcher.jobmatcher_backend.dto.RegisterRequest;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {    

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        User result = authService.register(user);

        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        try {
            String token = authService.login(loginRequest);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "message", "Login successful"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }
    }
    @PostMapping("/loginresponse")
    public ResponseEntity<?> loginresponse(@RequestBody LoginRequest loginRequest) {

        try {
            LoginResponse response = authService.loginresponse(loginRequest);
            return ResponseEntity.ok(response);


        } catch (Exception e) {

            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
    }




}
