package com.sprintflow.service;

import com.sprintflow.dto.LoginDTO;
import com.sprintflow.dto.RegisterDTO;
import com.sprintflow.dto.AuthResponseDTO;
import com.sprintflow.entity.User;
import com.sprintflow.exception.AuthenticationException;
import com.sprintflow.exception.DuplicateResourceException;
import com.sprintflow.exception.ResourceNotFoundException;
import com.sprintflow.repository.UserRepository;
import com.sprintflow.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponseDTO login(LoginDTO loginDTO) {
        // Find user by email
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive()) {
            throw new AuthenticationException("User account is inactive");
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        // Build response
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        response.setActive(user.isActive());

        return response;
    }

    public AuthResponseDTO register(RegisterDTO registerDTO) {
        // Check if user already exists
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("User already exists with email: " + registerDTO.getEmail());
        }

        // Create new user
        User user = new User();
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setFirstName(registerDTO.getFirstName());
        user.setLastName(registerDTO.getLastName());
        user.setRole(registerDTO.getRole() != null ? registerDTO.getRole() : "EMPLOYEE");
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        // Build response
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setUserId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setFirstName(savedUser.getFirstName());
        response.setLastName(savedUser.getLastName());
        response.setRole(savedUser.getRole());
        response.setActive(savedUser.isActive());

        return response;
    }

    public User validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new AuthenticationException("Invalid or expired token");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public AuthResponseDTO getCurrentUserInfo(String token) {
        User user = validateToken(token);
        
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        response.setActive(user.isActive());

        return response;
    }
}
