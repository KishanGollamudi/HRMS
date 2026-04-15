package com.sprintflow.controller;

import com.sprintflow.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        // Accept only the test user for now
        if ("surya@sprintflow.com".equals(email) && "Admin@123".equals(password)) {
            String token = jwtTokenProvider.generateToken(1L, email, "TRAINER");
            
            // Build response matching frontend expectation
            Map<String, Object> user = new HashMap<>();
            user.put("email", email);
            user.put("role", "TRAINER");
            user.put("id", 1L);
            user.put("firstName", "Surya");
            user.put("lastName", "User");
            
            Map<String, Object> data = new HashMap<>();
            data.put("accessToken", token);
            data.put("user", user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid credentials"));
    }
}
