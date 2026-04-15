package com.sprintflow.repository;

import com.sprintflow.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    
    @Query("SELECT s FROM Sprint s WHERE s.trainer.id = ?1")
    List<Sprint> findByTrainerId(Long trainerId);
    
    @Query("SELECT s FROM Sprint s WHERE s.status = ?1")
    List<Sprint> findByStatus(String status);
    
    @Query("SELECT s FROM Sprint s WHERE s.trainer.id = ?1 AND s.status = ?2")
    List<Sprint> findByTrainerIdAndStatus(Long trainerId, String status);
    
    @Query("SELECT s FROM Sprint s WHERE s.startDate >= ?1 AND s.endDate <= ?2")
    List<Sprint> findByDateRange(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT s FROM Sprint s WHERE s.status IN ('PLANNED', 'IN_PROGRESS') ORDER BY s.startDate ASC")
    List<Sprint> findActiveOrUpcoming();
    
    Optional<Sprint> findByName(String name);
}
