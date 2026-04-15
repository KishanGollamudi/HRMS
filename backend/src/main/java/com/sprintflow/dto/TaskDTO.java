package com.sprintflow.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDTO {
    
    private Long id;
    private Long sprintId;
    private Long userId;
    private String userName;
    private LocalDate attendanceDate;
    private String status; // PRESENT, ABSENT, LEAVE, LATE
    private String notes;
    private Double hoursWorked;
    private String markedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public TaskDTO() {}
    
    public TaskDTO(Long id, Long sprintId, Long userId, LocalDate attendanceDate, String status) {
        this.id = id;
        this.sprintId = sprintId;
        this.userId = userId;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSprintId() {
        return sprintId;
    }
    
    public void setSprintId(Long sprintId) {
        this.sprintId = sprintId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }
    
    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Double getHoursWorked() {
        return hoursWorked;
    }
    
    public void setHoursWorked(Double hoursWorked) {
        this.hoursWorked = hoursWorked;
    }
    
    public String getMarkedBy() {
        return markedBy;
    }
    
    public void setMarkedBy(String markedBy) {
        this.markedBy = markedBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
