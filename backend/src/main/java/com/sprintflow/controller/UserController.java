package com.sprintflow.controller;

import com.sprintflow.dto.UserDTO;
import com.sprintflow.dto.ApiResponseDTO;
import com.sprintflow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(
            ApiResponseDTO.<List<UserDTO>>builder()
                    .success(true)
                    .message("Users retrieved successfully")
                    .data(users)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(
            ApiResponseDTO.<UserDTO>builder()
                    .success(true)
                    .message("User retrieved successfully")
                    .data(user)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponseDTO<UserDTO>> getUserByEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(
            ApiResponseDTO.<UserDTO>builder()
                    .success(true)
                    .message("User retrieved successfully")
                    .data(user)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponseDTO<List<UserDTO>>> getUsersByRole(@PathVariable String role) {
        List<UserDTO> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(
            ApiResponseDTO.<List<UserDTO>>builder()
                    .success(true)
                    .message("Users retrieved successfully")
                    .data(users)
                    .statusCode(200)
                    .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<UserDTO>> createUser(@RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.createUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponseDTO.<UserDTO>builder()
                    .success(true)
                    .message("User created successfully")
                    .data(createdUser)
                    .statusCode(201)
                    .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<UserDTO>> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(
            ApiResponseDTO.<UserDTO>builder()
                    .success(true)
                    .message("User updated successfully")
                    .data(updatedUser)
                    .statusCode(200)
                    .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(
            ApiResponseDTO.<String>builder()
                    .success(true)
                    .message("User deleted successfully")
                    .data(null)
                    .statusCode(200)
                    .build()
        );
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponseDTO<String>> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok(
            ApiResponseDTO.<String>builder()
                    .success(true)
                    .message("User activated successfully")
                    .data(null)
                    .statusCode(200)
                    .build()
        );
    }
}
