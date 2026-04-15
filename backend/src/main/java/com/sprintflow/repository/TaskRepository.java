package com.sprintflow.repository;

import com.sprintflow.entity.Sprint;
import com.sprintflow.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    @Query("SELECT t FROM Task t WHERE t.sprint.id = ?1 AND t.user.id = ?2 AND t.attendanceDate = ?3")
    Optional<Task> findBySprintIdUserIdAndDate(Long sprintId, Long userId, LocalDate date);
    
    @Query("SELECT t FROM Task t WHERE t.sprint.id = ?1 AND t.user.id = ?2 ORDER BY t.attendanceDate DESC")
    List<Task> findBySprintIdAndUserId(Long sprintId, Long userId);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = ?1 ORDER BY t.attendanceDate DESC")
    List<Task> findByUserId(Long userId);
    
    @Query("SELECT t FROM Task t WHERE t.sprint.id = ?1 ORDER BY t.attendanceDate DESC")
    List<Task> findBySprintId(Long sprintId);
    
    @Query("SELECT t FROM Task t WHERE t.attendanceDate = ?1 AND t.sprint.id = ?2 ORDER BY t.user.firstName ASC")
    List<Task> findByDateAndSprint(LocalDate date, Long sprintId);
    
    @Query("SELECT t FROM Task t WHERE t.attendanceDate >= ?1 AND t.attendanceDate <= ?2 AND t.user.id = ?3")
    List<Task> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Task t WHERE t.status = ?1 AND t.attendanceDate = ?2")
    List<Task> findByStatusAndDate(String status, LocalDate date);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = ?1 AND t.status = 'PRESENT' AND t.attendanceDate >= ?2 AND t.attendanceDate <= ?3")
    long countPresentDays(Long userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = ?1 AND t.status = 'ABSENT' AND t.attendanceDate >= ?2 AND t.attendanceDate <= ?3")
    long countAbsentDays(Long userId, LocalDate startDate, LocalDate endDate);
}
