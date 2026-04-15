package com.sprintflow.service;

import com.sprintflow.dto.SprintDTO;
import com.sprintflow.entity.Sprint;
import com.sprintflow.entity.User;
import com.sprintflow.exception.ResourceNotFoundException;
import com.sprintflow.repository.SprintRepository;
import com.sprintflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private UserRepository userRepository;

    public SprintDTO getSprintById(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + id));
        return convertToDTO(sprint);
    }

    public List<SprintDTO> getAllSprints() {
        return sprintRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SprintDTO> getActiveSprintsForTrainer(Long trainerId) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with id: " + trainerId));
        return sprintRepository.findByTrainerIdAndStatus(trainerId, "IN_PROGRESS")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SprintDTO> getSprintsByStatus(String status) {
        return sprintRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SprintDTO createSprint(SprintDTO sprintDTO, Long trainerId) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with id: " + trainerId));

        Sprint sprint = new Sprint();
        sprint.setName(sprintDTO.getName());
        sprint.setDescription(sprintDTO.getDescription());
        sprint.setStartDate(sprintDTO.getStartDate());
        sprint.setEndDate(sprintDTO.getEndDate());
        sprint.setTrainer(trainer);
        sprint.setLocation(sprintDTO.getLocation());
        sprint.setMaxParticipants(sprintDTO.getMaxParticipants());
        sprint.setStatus("IN_PROGRESS");
        sprint.setCreatedAt(LocalDateTime.now());
        sprint.setUpdatedAt(LocalDateTime.now());

        Sprint savedSprint = sprintRepository.save(sprint);
        return convertToDTO(savedSprint);
    }

    public SprintDTO updateSprint(Long id, SprintDTO sprintDTO) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + id));

        if (sprintDTO.getName() != null) {
            sprint.setName(sprintDTO.getName());
        }
        if (sprintDTO.getDescription() != null) {
            sprint.setDescription(sprintDTO.getDescription());
        }
        if (sprintDTO.getStartDate() != null) {
            sprint.setStartDate(sprintDTO.getStartDate());
        }
        if (sprintDTO.getEndDate() != null) {
            sprint.setEndDate(sprintDTO.getEndDate());
        }
        if (sprintDTO.getStatus() != null) {
            sprint.setStatus(sprintDTO.getStatus());
        }
        sprint.setUpdatedAt(LocalDateTime.now());

        Sprint updatedSprint = sprintRepository.save(sprint);
        return convertToDTO(updatedSprint);
    }

    public void closeSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + id));
        sprint.setStatus("CLOSED");
        sprint.setUpdatedAt(LocalDateTime.now());
        sprintRepository.save(sprint);
    }

    public void deleteSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + id));
        sprintRepository.delete(sprint);
    }

    private SprintDTO convertToDTO(Sprint sprint) {
        SprintDTO dto = new SprintDTO();
        dto.setId(sprint.getId());
        dto.setName(sprint.getName());
        dto.setDescription(sprint.getDescription());
        dto.setStartDate(sprint.getStartDate());
        dto.setEndDate(sprint.getEndDate());
        dto.setTrainerId(sprint.getTrainer().getId());
        dto.setTrainerName(sprint.getTrainer().getFirstName() + " " + sprint.getTrainer().getLastName());
        dto.setStatus(sprint.getStatus());
        dto.setLocation(sprint.getLocation());
        dto.setMaxParticipants(sprint.getMaxParticipants());
        dto.setCreatedAt(sprint.getCreatedAt());
        dto.setUpdatedAt(sprint.getUpdatedAt());
        return dto;
    }
}
