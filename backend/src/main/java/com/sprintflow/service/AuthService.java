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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Slf4j
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponseDTO login(LoginDTO loginDTO) {
        if (loginDTO == null || loginDTO.getEmail() == null || loginDTO.getPassword() == null) {
            throw new AuthenticationException("Invalid credentials");
        }

        String email = loginDTO.getEmail().trim().toLowerCase();
        log.debug("Looking up user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.debug("No user found for email: {}", email);
                    return new AuthenticationException("Invalid credentials");
                });

        log.debug("User found for email: {}. Verifying password.", email);
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            log.debug("Password verification failed for email: {}", email);
            throw new AuthenticationException("Invalid credentials");
        }

        if (!user.isActive()) {
            log.debug("Inactive user attempted login: {}", email);
            throw new AuthenticationException("User account is inactive");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        log.debug("JWT generated for user id: {}", user.getId());
        return buildAuthResponse(user, token);
    }

    public AuthResponseDTO register(RegisterDTO registerDTO) {
        if (registerDTO == null || registerDTO.getEmail() == null || registerDTO.getPassword() == null
                || registerDTO.getFirstName() == null || registerDTO.getLastName() == null) {
            throw new IllegalArgumentException("email, password, firstName, and lastName are required");
        }

        String email = registerDTO.getEmail().trim().toLowerCase();
        log.debug("Checking whether email already exists: {}", email);

        if (userRepository.existsByEmail(email)) {
            log.debug("Registration rejected because email already exists: {}", email);
            throw new DuplicateResourceException("User already exists with email: " + email);
        }

        LocalDateTime now = LocalDateTime.now();
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setFirstName(registerDTO.getFirstName());
        user.setLastName(registerDTO.getLastName());
        user.setRole(registerDTO.getRole() != null && !registerDTO.getRole().isBlank() ? registerDTO.getRole() : "USER");
        user.setEmployeeId(registerDTO.getEmployeeId());
        user.setPhoneNumber(registerDTO.getPhoneNumber());
        user.setDepartment(registerDTO.getDepartment());
        user.setActive(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        User savedUser = userRepository.save(user);
        log.debug("Registered new user with id: {}", savedUser.getId());

        String token = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        return buildAuthResponse(savedUser, token);
    }

    private AuthResponseDTO buildAuthResponse(User user, String token) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        response.setActive(user.isActive());
        response.setExpiresIn(jwtTokenProvider.getExpirationTime() / 1000);

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
