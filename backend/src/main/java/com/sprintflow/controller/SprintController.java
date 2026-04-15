package com.sprintflow.controller;

import com.sprintflow.dto.SprintDTO;
import com.sprintflow.dto.ApiResponseDTO;
import com.sprintflow.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SprintController {

    @Autowired
    private SprintService sprintService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<SprintDTO>>> getAllSprints() {
        List<SprintDTO> sprints = sprintService.getAllSprints();
        return ResponseEntity.ok(
            ApiResponseDTO.<List<SprintDTO>>builder()
                    .success(true)
                    .message("Sprints retrieved successfully")
                    .data(sprints)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<SprintDTO>> getSprintById(@PathVariable Long id) {
        SprintDTO sprint = sprintService.getSprintById(id);
        return ResponseEntity.ok(
            ApiResponseDTO.<SprintDTO>builder()
                    .success(true)
                    .message("Sprint retrieved successfully")
                    .data(sprint)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponseDTO<List<SprintDTO>>> getSprintsByStatus(@PathVariable String status) {
        List<SprintDTO> sprints = sprintService.getSprintsByStatus(status);
        return ResponseEntity.ok(
            ApiResponseDTO.<List<SprintDTO>>builder()
                    .success(true)
                    .message("Sprints retrieved successfully")
                    .data(sprints)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/trainer/{trainerId}/active")
    public ResponseEntity<ApiResponseDTO<List<SprintDTO>>> getActiveSprints(@PathVariable Long trainerId) {
        List<SprintDTO> sprints = sprintService.getActiveSprintsForTrainer(trainerId);
        return ResponseEntity.ok(
            ApiResponseDTO.<List<SprintDTO>>builder()
                    .success(true)
                    .message("Active sprints retrieved successfully")
                    .data(sprints)
                    .statusCode(200)
                    .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<SprintDTO>> createSprint(
            @RequestBody SprintDTO sprintDTO,
            @RequestParam Long trainerId) {
        SprintDTO createdSprint = sprintService.createSprint(sprintDTO, trainerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponseDTO.<SprintDTO>builder()
                    .success(true)
                    .message("Sprint created successfully")
                    .data(createdSprint)
                    .statusCode(201)
                    .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<SprintDTO>> updateSprint(
            @PathVariable Long id,
            @RequestBody SprintDTO sprintDTO) {
        SprintDTO updatedSprint = sprintService.updateSprint(id, sprintDTO);
        return ResponseEntity.ok(
            ApiResponseDTO.<SprintDTO>builder()
                    .success(true)
                    .message("Sprint updated successfully")
                    .data(updatedSprint)
                    .statusCode(200)
                    .build()
        );
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponseDTO<String>> closeSprint(@PathVariable Long id) {
        sprintService.closeSprint(id);
        return ResponseEntity.ok(
            ApiResponseDTO.<String>builder()
                    .success(true)
                    .message("Sprint closed successfully")
                    .data(null)
                    .statusCode(200)
                    .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<String>> deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.ok(
            ApiResponseDTO.<String>builder()
                    .success(true)
                    .message("Sprint deleted successfully")
                    .data(null)
                    .statusCode(200)
                    .build()
        );
    }
}
