package com.sprintflow.controller;

import com.sprintflow.dto.TaskDTO;
import com.sprintflow.dto.ApiResponseDTO;
import com.sprintflow.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getAllTasks() {
        List<TaskDTO> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(
            ApiResponseDTO.<List<TaskDTO>>builder()
                    .success(true)
                    .message("Tasks retrieved successfully")
                    .data(tasks)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> getTaskById(@PathVariable Long id) {
        TaskDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(
            ApiResponseDTO.<TaskDTO>builder()
                    .success(true)
                    .message("Task retrieved successfully")
                    .data(task)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksBySprintId(@PathVariable Long sprintId) {
        List<TaskDTO> tasks = taskService.getTasksBySprintId(sprintId);
        return ResponseEntity.ok(
            ApiResponseDTO.<List<TaskDTO>>builder()
                    .success(true)
                    .message("Tasks retrieved successfully")
                    .data(tasks)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/attendance/sprint/{sprintId}/date/{date}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getAttendanceBySprintAndDate(
            @PathVariable Long sprintId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TaskDTO> attendance = taskService.getAttendanceBySprintAndDate(sprintId, date);
        return ResponseEntity.ok(
            ApiResponseDTO.<List<TaskDTO>>builder()
                    .success(true)
                    .message("Attendance retrieved successfully")
                    .data(attendance)
                    .statusCode(200)
                    .build()
        );
    }

    @GetMapping("/attendance/user/{userId}/sprint/{sprintId}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getAttendanceByUserAndSprint(
            @PathVariable Long userId,
            @PathVariable Long sprintId) {
        List<TaskDTO> attendance = taskService.getAttendanceByUserAndSprint(userId, sprintId);
        return ResponseEntity.ok(
            ApiResponseDTO.<List<TaskDTO>>builder()
                    .success(true)
                    .message("Attendance retrieved successfully")
                    .data(attendance)
                    .statusCode(200)
                    .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<TaskDTO>> createTask(
            @RequestBody TaskDTO taskDTO) {
        TaskDTO createdTask = taskService.createTask(taskDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponseDTO.<TaskDTO>builder()
                    .success(true)
                    .message("Task created successfully")
                    .data(createdTask)
                    .statusCode(201)
                    .build()
        );
    }

    @PostMapping("/attendance")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> markAttendance(
            @RequestParam Long userId,
            @RequestParam Long sprintId,
            @RequestParam String status,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        TaskDTO attendance = taskService.markAttendance(userId, sprintId, status, date);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponseDTO.<TaskDTO>builder()
                    .success(true)
                    .message("Attendance marked successfully")
                    .data(attendance)
                    .statusCode(201)
                    .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDTO taskDTO) {
        TaskDTO updatedTask = taskService.updateTask(id, taskDTO);
        return ResponseEntity.ok(
            ApiResponseDTO.<TaskDTO>builder()
                    .success(true)
                    .message("Task updated successfully")
                    .data(updatedTask)
                    .statusCode(200)
                    .build()
        );
    }

    @PutMapping("/{id}/attendance/{status}")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> updateAttendance(
            @PathVariable Long id,
            @PathVariable String status) {
        TaskDTO updatedTask = taskService.updateAttendance(id, status);
        return ResponseEntity.ok(
            ApiResponseDTO.<TaskDTO>builder()
                    .success(true)
                    .message("Attendance updated successfully")
                    .data(updatedTask)
                    .statusCode(200)
                    .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<String>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(
            ApiResponseDTO.<String>builder()
                    .success(true)
                    .message("Task deleted successfully")
                    .data(null)
                    .statusCode(200)
                    .build()
        );
    }
}
