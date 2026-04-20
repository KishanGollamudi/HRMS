package com.sprintflow.controller;

import com.sprintflow.dto.AuthResponseDTO;
import com.sprintflow.dto.LoginDTO;
import com.sprintflow.dto.RegisterDTO;
import com.sprintflow.exception.AuthenticationException;
import com.sprintflow.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        String email = loginDTO != null ? loginDTO.getEmail() : null;
        log.info("Login request received for email: {}", email);

        try {
            AuthResponseDTO authResponse = authService.login(loginDTO);
            log.info("Login successful for email: {}", authResponse.getEmail());
            return ResponseEntity.ok(successResponse("Login successful", authResponse));
        } catch (AuthenticationException ex) {
            log.warn("Login failed for email {}: {}", email, ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        String email = registerDTO != null ? registerDTO.getEmail() : null;
        log.info("Registration request received for email: {}", email);

        AuthResponseDTO authResponse = authService.register(registerDTO);
        log.info("Registration successful for email: {}", authResponse.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(successResponse("User registered successfully", authResponse));
    }

    private Map<String, Object> successResponse(String message, AuthResponseDTO authResponse) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", authResponse.getUserId());
        user.put("email", authResponse.getEmail());
        user.put("firstName", authResponse.getFirstName());
        user.put("lastName", authResponse.getLastName());
        user.put("role", authResponse.getRole());
        user.put("active", authResponse.isActive());

        Map<String, Object> data = new HashMap<>();
        data.put("token", authResponse.getToken());
        data.put("accessToken", authResponse.getToken());
        data.put("expiresIn", authResponse.getExpiresIn());
        data.put("user", user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
}
