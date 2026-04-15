package com.sprintflow.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponseDTO<T> {
    
    private boolean success;
    private String message;
    private T data;
    private Integer statusCode;
    private LocalDateTime timestamp;
    private String error;
    private String path;
    
    // Constructors
    public ApiResponseDTO() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ApiResponseDTO(boolean success, String message, T data, Integer statusCode) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
        this.timestamp = LocalDateTime.now();
    }
    
    public static <T> ApiResponseDTOBuilder<T> builder() {
        return new ApiResponseDTOBuilder<>();
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public Integer getStatusCode() {
        return statusCode;
    }
    
    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public String getPath() {
        return path;
    }
    
    public void setPath(String path) {
        this.path = path;
    }
    
    // Builder Pattern
    public static class ApiResponseDTOBuilder<T> {
        private boolean success;
        private String message;
        private T data;
        private Integer statusCode;
        private LocalDateTime timestamp = LocalDateTime.now();
        private String error;
        private String path;
        
        public ApiResponseDTOBuilder<T> success(boolean success) {
            this.success = success;
            return this;
        }
        
        public ApiResponseDTOBuilder<T> message(String message) {
            this.message = message;
            return this;
        }
        
        public ApiResponseDTOBuilder<T> data(T data) {
            this.data = data;
            return this;
        }
        
        public ApiResponseDTOBuilder<T> statusCode(Integer statusCode) {
            this.statusCode = statusCode;
            return this;
        }
        
        public ApiResponseDTOBuilder<T> timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        
        public ApiResponseDTOBuilder<T> error(String error) {
            this.error = error;
            return this;
        }
        
        public ApiResponseDTOBuilder<T> path(String path) {
            this.path = path;
            return this;
        }
        
        public ApiResponseDTO<T> build() {
            ApiResponseDTO<T> response = new ApiResponseDTO<>();
            response.success = this.success;
            response.message = this.message;
            response.data = this.data;
            response.statusCode = this.statusCode;
            response.timestamp = this.timestamp;
            response.error = this.error;
            response.path = this.path;
            return response;
        }
    }
}
