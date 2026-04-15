# SprintFlow Backend - Complete API Documentation

## Overview
SprintFlow Backend is a Spring Boot REST API for managing sprint-based training programs with attendance tracking. It provides role-based access control (HR, Manager, Trainer, Employee) and comprehensive attendance management.

---

## Base URL
```
http://localhost:8080/api
```

---

## Authentication
All endpoints (except login/register) require JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## API Endpoints

### 1. AUTHENTICATION ENDPOINTS

#### 1.1 User Login
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate user and get JWT token
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "TRAINER",
    "active": true
  }
}
```

#### 1.2 User Registration
- **Endpoint:** `POST /auth/register`
- **Description:** Register new user
- **Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "EMPLOYEE"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "statusCode": 201,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": 2,
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "EMPLOYEE",
    "active": true
  }
}
```

#### 1.3 Get Current User
- **Endpoint:** `GET /auth/me`
- **Description:** Get authenticated user information
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User information retrieved",
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "TRAINER",
    "active": true
  }
}
```

#### 1.4 Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Invalidate JWT token (client-side implementation)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "statusCode": 200,
  "data": null
}
```

#### 1.5 Validate Token
- **Endpoint:** `GET /auth/validate`
- **Description:** Check if token is valid
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid",
  "statusCode": 200,
  "data": null
}
```

---

### 2. USER MANAGEMENT ENDPOINTS

#### 2.1 Get All Users
- **Endpoint:** `GET /users`
- **Description:** Retrieve all users
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "email": "user1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "TRAINER",
      "active": true,
      "createdAt": "2026-04-01T10:00:00"
    },
    {
      "id": 2,
      "email": "user2@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "EMPLOYEE",
      "active": true,
      "createdAt": "2026-04-01T11:00:00"
    }
  ]
}
```

#### 2.2 Get User by ID
- **Endpoint:** `GET /users/{id}`
- **Description:** Retrieve user by ID
- **Path Parameters:**
  - `id` (required): User ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "statusCode": 200,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "TRAINER",
    "active": true,
    "createdAt": "2026-04-01T10:00:00"
  }
}
```

#### 2.3 Get User by Email
- **Endpoint:** `GET /users/email/{email}`
- **Description:** Retrieve user by email address
- **Path Parameters:**
  - `email` (required): User email
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** Same as 2.2

#### 2.4 Get Users by Role
- **Endpoint:** `GET /users/role/{role}`
- **Description:** Retrieve all users with specific role
- **Path Parameters:**
  - `role` (required): User role (ADMIN, HR, MANAGER, TRAINER, EMPLOYEE)
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** List of users with specified role

#### 2.5 Create User
- **Endpoint:** `POST /users`
- **Description:** Create new user (Admin only)
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "EMPLOYEE"
}
```
- **Response (201 Created):** User object created

#### 2.6 Update User
- **Endpoint:** `PUT /users/{id}`
- **Description:** Update user information
- **Path Parameters:**
  - `id` (required): User ID
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "MANAGER"
}
```
- **Response (200 OK):** Updated user object

#### 2.7 Delete User (Deactivate)
- **Endpoint:** `DELETE /users/{id}`
- **Description:** Soft delete user (deactivate)
- **Path Parameters:**
  - `id` (required): User ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "statusCode": 200,
  "data": null
}
```

#### 2.8 Activate User
- **Endpoint:** `PUT /users/{id}/activate`
- **Description:** Reactivate a deactivated user
- **Path Parameters:**
  - `id` (required): User ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "statusCode": 200,
  "data": null
}
```

---

### 3. SPRINT MANAGEMENT ENDPOINTS

#### 3.1 Get All Sprints
- **Endpoint:** `GET /sprints`
- **Description:** Retrieve all sprints
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Sprints retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "name": "Spring Training 2026",
      "description": "Q1 2026 training program",
      "startDate": "2026-04-01",
      "endDate": "2026-06-30",
      "trainerId": 1,
      "trainerName": "John Doe",
      "status": "ACTIVE",
      "createdAt": "2026-04-01T10:00:00",
      "updatedAt": "2026-04-01T10:00:00"
    }
  ]
}
```

#### 3.2 Get Sprint by ID
- **Endpoint:** `GET /sprints/{id}`
- **Description:** Retrieve sprint by ID
- **Path Parameters:**
  - `id` (required): Sprint ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** Single sprint object

#### 3.3 Get Sprints by Status
- **Endpoint:** `GET /sprints/status/{status}`
- **Description:** Retrieve sprints by status
- **Path Parameters:**
  - `status` (required): Sprint status (ACTIVE, CLOSED, PLANNED)
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** List of sprints

#### 3.4 Get Active Sprints for Trainer
- **Endpoint:** `GET /sprints/trainer/{trainerId}/active`
- **Description:** Retrieve active sprints for a specific trainer
- **Path Parameters:**
  - `trainerId` (required): Trainer user ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** List of active sprints

#### 3.5 Create Sprint
- **Endpoint:** `POST /sprints?trainerId={trainerId}`
- **Description:** Create new sprint
- **Query Parameters:**
  - `trainerId` (required): ID of trainer managing the sprint
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
```json
{
  "name": "Q2 Training Program",
  "description": "Advanced training for employees",
  "startDate": "2026-07-01",
  "endDate": "2026-09-30"
}
```
- **Response (201 Created):** Sprint object created

#### 3.6 Update Sprint
- **Endpoint:** `PUT /sprints/{id}`
- **Description:** Update sprint details
- **Path Parameters:**
  - `id` (required): Sprint ID
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
```json
{
  "name": "Updated Sprint Name",
  "status": "ACTIVE"
}
```
- **Response (200 OK):** Updated sprint object

#### 3.7 Close Sprint
- **Endpoint:** `PUT /sprints/{id}/close`
- **Description:** Close/end a sprint
- **Path Parameters:**
  - `id` (required): Sprint ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Sprint closed successfully",
  "statusCode": 200,
  "data": null
}
```

#### 3.8 Delete Sprint
- **Endpoint:** `DELETE /sprints/{id}`
- **Description:** Delete sprint permanently
- **Path Parameters:**
  - `id` (required): Sprint ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Sprint deleted successfully",
  "statusCode": 200,
  "data": null
}
```

---

### 4. TASK & ATTENDANCE ENDPOINTS

#### 4.1 Get All Tasks
- **Endpoint:** `GET /tasks`
- **Description:** Retrieve all tasks/attendance records
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "title": "John Doe - 2026-04-01",
      "description": "Attendance record for 2026-04-01",
      "sprintId": 1,
      "assigneeId": 2,
      "assigneeName": "John Doe",
      "status": "COMPLETED",
      "attendanceStatus": "PRESENT",
      "attendanceDate": "2026-04-01",
      "createdAt": "2026-04-01T10:00:00",
      "updatedAt": "2026-04-01T10:00:00"
    }
  ]
}
```

#### 4.2 Get Task by ID
- **Endpoint:** `GET /tasks/{id}`
- **Description:** Retrieve task by ID
- **Path Parameters:**
  - `id` (required): Task ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** Single task object

#### 4.3 Get Tasks by Sprint
- **Endpoint:** `GET /tasks/sprint/{sprintId}`
- **Description:** Retrieve all tasks/attendance in a sprint
- **Path Parameters:**
  - `sprintId` (required): Sprint ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** List of tasks

#### 4.4 Get Attendance by Sprint and Date
- **Endpoint:** `GET /tasks/attendance/sprint/{sprintId}/date/{date}`
- **Description:** Get attendance records for a sprint on specific date
- **Path Parameters:**
  - `sprintId` (required): Sprint ID
  - `date` (required): Date in format YYYY-MM-DD
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** List of attendance records

#### 4.5 Get User Attendance for Sprint
- **Endpoint:** `GET /tasks/attendance/user/{userId}/sprint/{sprintId}`
- **Description:** Get attendance records for a user in a sprint
- **Path Parameters:**
  - `userId` (required): User/Employee ID
  - `sprintId` (required): Sprint ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** List of attendance records

#### 4.6 Create Task
- **Endpoint:** `POST /tasks?sprintId={sprintId}`
- **Description:** Create new task
- **Query Parameters:**
  - `sprintId` (required): Sprint ID
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "assigneeId": 2,
  "status": "PENDING"
}
```
- **Response (201 Created):** Task object created

#### 4.7 Mark Attendance
- **Endpoint:** `POST /tasks/attendance?userId={userId}&sprintId={sprintId}&status={status}&date={date}`
- **Description:** Mark attendance for a user on a specific date
- **Query Parameters:**
  - `userId` (required): Employee User ID
  - `sprintId` (required): Sprint ID
  - `status` (required): Attendance status (PRESENT, ABSENT, LATE, EXCUSED)
  - `date` (required): Date in format YYYY-MM-DD
- **Headers:** Authorization: Bearer {token}
- **Response (201 Created):** Attendance record created

#### 4.8 Update Task
- **Endpoint:** `PUT /tasks/{id}`
- **Description:** Update task details
- **Path Parameters:**
  - `id` (required): Task ID
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
```json
{
  "title": "Updated Title",
  "status": "COMPLETED"
}
```
- **Response (200 OK):** Updated task object

#### 4.9 Update Attendance
- **Endpoint:** `PUT /tasks/{id}/attendance/{status}`
- **Description:** Update attendance status
- **Path Parameters:**
  - `id` (required): Task ID
  - `status` (required): New attendance status (PRESENT, ABSENT, LATE, EXCUSED)
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):** Updated task object

#### 4.10 Delete Task
- **Endpoint:** `DELETE /tasks/{id}`
- **Description:** Delete task permanently
- **Path Parameters:**
  - `id` (required): Task ID
- **Headers:** Authorization: Bearer {token}
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "statusCode": 200,
  "data": null
}
```

---

### 5. HEALTH CHECK ENDPOINTS

#### 5.1 Check Service Health
- **Endpoint:** `GET /health`
- **Description:** Check if service is running
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Service is healthy",
  "statusCode": 200,
  "data": {
    "status": "UP",
    "timestamp": "2026-04-01T10:30:00",
    "service": "SprintFlow Backend",
    "version": "1.0.0"
  }
}
```

#### 5.2 Check Database Connection
- **Endpoint:** `GET /health/db`
- **Description:** Check database connection
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Database connection is healthy",
  "statusCode": 200,
  "data": "Connected"
}
```

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all endpoints |
| **HR** | Create sprints, manage users, view reports |
| **MANAGER** | View team attendance, manage tasks |
| **TRAINER** | Create/manage sprints, mark attendance |
| **EMPLOYEE** | View own attendance, view sprint info |

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "statusCode": 400,
  "data": null
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "statusCode": 401,
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource",
  "statusCode": 403,
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "statusCode": 404,
  "data": null
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Resource already exists",
  "statusCode": 409,
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500,
  "data": null
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sprints Table
```sql
CREATE TABLE sprints (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  trainer_id BIGINT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id)
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sprint_id BIGINT,
  user_id BIGINT,
  status VARCHAR(50),
  attendance_status VARCHAR(50),
  attendance_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (sprint_id) REFERENCES sprints(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## How to Start the Backend

### Prerequisites
- Java 11 or higher
- Maven
- MySQL Server (running on localhost:3306)

### Steps

1. **Clone/Setup Project**
   ```bash
   cd C:\SpringBoot\POC\sprintflow-backend
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE sprintflow_db;
   ```

3. **Build Project**
   ```bash
   mvn clean install
   ```

4. **Run Application**
   ```bash
   mvn spring-boot:run
   ```
   OR
   ```bash
   java -jar target/sprintflow-backend-1.0.0.jar
   ```

5. **Verify**
   - Access health check: `http://localhost:8080/api/health`
   - Should return status UP

---

## Frontend Integration

### Environment Configuration (Frontend)
Add to `.env` file:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### API Service (Frontend)
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## Testing with Postman

1. Import collection from provided JSON
2. Set environment variables (base_url, token)
3. Use login endpoint to get token
4. Token is automatically added to subsequent requests

---

## Notes
- All timestamps are in ISO 8601 format
- Attendance status values: PRESENT, ABSENT, LATE, EXCUSED
- Sprint status values: ACTIVE, CLOSED, PLANNED
- Task status values: PENDING, IN_PROGRESS, COMPLETED
- Password must be at least 8 characters
- Email must be unique in the system

---

## Support
For any issues, check the logs at:
- Console output
- `sprintflow-backend.log` (if configured)
