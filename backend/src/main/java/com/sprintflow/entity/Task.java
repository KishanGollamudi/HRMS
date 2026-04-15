package com.sprintflow.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", nullable = false)
    private Sprint sprint;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;
    
    @Column(name = "status", nullable = false)
    private String status; // PRESENT, ABSENT, LEAVE, LATE
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "hours_worked")
    private Double hoursWorked;
    
    @Column(name = "marked_by")
    private String markedBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Constructors
    public Task() {}
    
    public Task(Sprint sprint, User user, LocalDate attendanceDate, String status) {
        this.sprint = sprint;
        this.user = user;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Sprint getSprint() {
        return sprint;
    }
    
    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
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
