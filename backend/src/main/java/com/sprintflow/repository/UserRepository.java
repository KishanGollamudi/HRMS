package com.sprintflow.repository;

import com.sprintflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmployeeId(String employeeId);
    
    @Query("SELECT u FROM User u WHERE u.role = ?1 AND u.active = true")
    List<User> findByRole(String role);
    
    @Query("SELECT u FROM User u WHERE u.active = true")
    List<User> findAllActive();
    
    @Query("SELECT u FROM User u WHERE u.role = ?1 AND u.active = true")
    List<User> findByRoleAndActive(String role, boolean active);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.email = ?1 AND u.deletedAt IS NULL")
    Optional<User> findByEmailAndNotDeleted(String email);
}
