package com.sprintflow.exception;

import com.sprintflow.dto.ApiResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponseDTO<?>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        
        ApiResponseDTO<?> response = ApiResponseDTO.builder()
                .success(false)
                .message(ex.getMessage())
                .statusCode(HttpStatus.NOT_FOUND.value())
                .error("Resource Not Found")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponseDTO<?>> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        
        ApiResponseDTO<?> response = ApiResponseDTO.builder()
                .success(false)
                .message(ex.getMessage())
                .statusCode(HttpStatus.UNAUTHORIZED.value())
                .error("Authentication Failed")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
    
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponseDTO<?>> handleDuplicateResourceException(
            DuplicateResourceException ex, WebRequest request) {
        
        ApiResponseDTO<?> response = ApiResponseDTO.builder()
                .success(false)
                .message(ex.getMessage())
                .statusCode(HttpStatus.CONFLICT.value())
                .error("Duplicate Resource")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDTO<?>> handleGlobalException(
            Exception ex, WebRequest request) {
        
        ApiResponseDTO<?> response = ApiResponseDTO.builder()
                .success(false)
                .message("An internal server error occurred")
                .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
