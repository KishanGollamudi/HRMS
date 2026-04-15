package com.sprintflow.service;

import com.sprintflow.dto.TaskDTO;
import com.sprintflow.entity.Task;
import com.sprintflow.entity.User;
import com.sprintflow.entity.Sprint;
import com.sprintflow.exception.ResourceNotFoundException;
import com.sprintflow.repository.TaskRepository;
import com.sprintflow.repository.UserRepository;
import com.sprintflow.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SprintRepository sprintRepository;

    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return convertToDTO(task);
    }

    public List<TaskDTO> getTasksBySprintId(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + sprintId));
        return taskRepository.findBySprintId(sprintId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getAttendanceBySprintAndDate(Long sprintId, LocalDate date) {
        // Verify sprint exists
        sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + sprintId));
        return taskRepository.findByDateAndSprint(date, sprintId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getAttendanceByUserAndSprint(Long userId, Long sprintId) {
        // Verify user and sprint exist
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + sprintId));
        return taskRepository.findBySprintIdAndUserId(sprintId, userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO markAttendance(Long userId, Long sprintId, String status, LocalDate date) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + sprintId));

        Task task = new Task();
        task.setUser(user);
        task.setSprint(sprint);
        task.setStatus(status); // PRESENT, ABSENT, LEAVE, LATE
        task.setAttendanceDate(date);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    public TaskDTO updateAttendance(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        task.setStatus(status); // PRESENT, ABSENT, LEAVE, LATE
        task.setUpdatedAt(LocalDateTime.now());
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    public TaskDTO createTask(TaskDTO taskDTO) {
        User user = userRepository.findById(taskDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + taskDTO.getUserId()));
        Sprint sprint = sprintRepository.findById(taskDTO.getSprintId())
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + taskDTO.getSprintId()));

        Task task = new Task();
        task.setUser(user);
        task.setSprint(sprint);
        task.setStatus(taskDTO.getStatus());
        task.setAttendanceDate(taskDTO.getAttendanceDate());
        task.setNotes(taskDTO.getNotes());
        task.setHoursWorked(taskDTO.getHoursWorked());
        task.setMarkedBy(taskDTO.getMarkedBy());
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (taskDTO.getStatus() != null) {
            task.setStatus(taskDTO.getStatus());
        }
        if (taskDTO.getNotes() != null) {
            task.setNotes(taskDTO.getNotes());
        }
        if (taskDTO.getHoursWorked() != null) {
            task.setHoursWorked(taskDTO.getHoursWorked());
        }
        if (taskDTO.getMarkedBy() != null) {
            task.setMarkedBy(taskDTO.getMarkedBy());
        }
        task.setUpdatedAt(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setSprintId(task.getSprint().getId());
        dto.setUserId(task.getUser().getId());
        dto.setUserName(task.getUser().getFirstName() + " " + task.getUser().getLastName());
        dto.setStatus(task.getStatus());
        dto.setAttendanceDate(task.getAttendanceDate());
        dto.setNotes(task.getNotes());
        dto.setHoursWorked(task.getHoursWorked());
        dto.setMarkedBy(task.getMarkedBy());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
}
