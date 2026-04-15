package com.sprintflow.dto;

public class AuthResponseDTO {
    
    private String token;
    private String refreshToken;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private long expiresIn;
    
    // Constructors
    public AuthResponseDTO() {}
    
    public AuthResponseDTO(String token, Long userId, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.expiresIn = 86400; // 24 hours in seconds
    }
    
    public AuthResponseDTO(String token, String refreshToken, Long userId, String email, 
                          String firstName, String lastName, String role, long expiresIn) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.expiresIn = expiresIn;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

	public void setActive(boolean active) {
		// TODO Auto-generated method stub
		
	}
}
