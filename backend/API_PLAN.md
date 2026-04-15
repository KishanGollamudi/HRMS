# SprintFlow Backend - Complete API Plan & Specification

## Project Overview
SprintFlow is a comprehensive Sprint-based training attendance management system built with Spring Boot backend and React frontend. It supports role-based access control for different user types: HR, Managers, Trainers, and Employees.

---

## System Architecture

### Technology Stack

#### Backend
- **Framework:** Spring Boot 4.1.0
- **Language:** Java 21
- **Database:** MySQL 8.0+
- **Authentication:** JWT (JSON Web Tokens)
- **ORM:** JPA/Hibernate
- **Build Tool:** Maven
- **Security:** Spring Security with JWT
- **API Format:** RESTful with JSON

#### Frontend
- **Framework:** React 18+
- **Module Bundler:** Vite
- **HTTP Client:** Axios
- **UI Components:** Custom components + shadcn/ui
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Routing:** React Router

---

## Data Models

### 1. User Entity
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;  // BCrypt encrypted
    
    private String firstName;
    private String lastName;
    
    @Column(length = 50)
    private String role;  // ADMIN, HR, MANAGER, TRAINER, EMPLOYEE
    
    private boolean active;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

**Attributes:**
- `id`: Unique identifier
- `email`: Unique email for login
- `password`: Bcrypt encrypted password
- `firstName`: User's first name
- `lastName`: User's last name
- `role`: User role (ADMIN, HR, MANAGER, TRAINER, EMPLOYEE)
- `active`: Account active status
- `createdAt`: Account creation timestamp

**Roles & Permissions:**
| Role | Permissions |
|------|-------------|
| ADMIN | Full system access |
| HR | Manage users, sprints, view reports |
| MANAGER | View team attendance, manage tasks |
| TRAINER | Create/manage sprints, mark attendance |
| EMPLOYEE | View own data, view sprint info |

---

### 2. Sprint Entity
```java
@Entity
@Table(name = "sprints")
public class Sprint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;
    
    @Column(length = 50)
    private String status;  // ACTIVE, CLOSED, PLANNED
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "sprint", cascade = CascadeType.ALL)
    private List<Task> tasks;
}
```

**Attributes:**
- `id`: Unique identifier
- `name`: Sprint name/title
- `description`: Sprint details
- `startDate`: Training start date
- `endDate`: Training end date
- `trainer`: Reference to trainer User
- `status`: ACTIVE, CLOSED, PLANNED
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `tasks`: Associated attendance records

**Status Values:**
- **PLANNED**: Sprint scheduled but not started
- **ACTIVE**: Current ongoing sprint
- **CLOSED**: Completed sprint

---

### 3. Task Entity (Attendance Records)
```java
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(length = 50)
    private String status;  // PENDING, IN_PROGRESS, COMPLETED
    
    @Column(length = 50)
    private String attendanceStatus;  // PRESENT, ABSENT, LATE, EXCUSED
    
    private LocalDate attendanceDate;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**Attributes:**
- `id`: Unique identifier
- `title`: Task/attendance title
- `description`: Task details
- `sprint`: Reference to Sprint
- `user`: Reference to User (Attendee)
- `status`: PENDING, IN_PROGRESS, COMPLETED
- `attendanceStatus`: PRESENT, ABSENT, LATE, EXCUSED
- `attendanceDate`: Date of attendance
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Status Values:**
- **PENDING**: Not yet processed
- **IN_PROGRESS**: Currently being worked on
- **COMPLETED**: Finished

**Attendance Status Values:**
- **PRESENT**: User was present
- **ABSENT**: User was absent
- **LATE**: User arrived late
- **EXCUSED**: User had valid reason for absence

---

## Complete API Endpoints

### Authentication API (No Auth Required)

#### 1. Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "trainer@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": 1,
    "email": "trainer@example.com",
    "firstName": "John",
    "lastName": "Trainer",
    "role": "TRAINER",
    "active": true
  }
}
```

#### 2. Register
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Employee",
  "role": "EMPLOYEE"
}

Response (201 Created):
{
  "success": true,
  "message": "Registration successful",
  "statusCode": 201,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": 2,
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Employee",
    "role": "EMPLOYEE",
    "active": true
  }
}
```

#### 3. Logout
```
POST /api/auth/logout
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Logout successful",
  "statusCode": 200,
  "data": null
}
```

---

### User Management API (Auth Required)

#### 1. Get All Users
```
GET /api/users
Authorization: Bearer {token}

Response (200 OK):
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
    }
  ]
}
```

#### 2. Get User by ID
```
GET /api/users/{id}
Authorization: Bearer {token}

Path Parameters:
- id: User ID (required)

Response (200 OK): Single user object
```

#### 3. Get User by Email
```
GET /api/users/email/{email}
Authorization: Bearer {token}

Path Parameters:
- email: User email (required)

Response (200 OK): Single user object
```

#### 4. Get Users by Role
```
GET /api/users/role/{role}
Authorization: Bearer {token}

Path Parameters:
- role: ADMIN, HR, MANAGER, TRAINER, EMPLOYEE (required)

Response (200 OK): Array of users with specified role
```

#### 5. Create User
```
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE"
}

Response (201 Created): Created user object
```

#### 6. Update User
```
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

Path Parameters:
- id: User ID (required)

Request:
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "MANAGER"
}

Response (200 OK): Updated user object
```

#### 7. Delete User (Deactivate)
```
DELETE /api/users/{id}
Authorization: Bearer {token}

Path Parameters:
- id: User ID (required)

Response (200 OK):
{
  "success": true,
  "message": "User deleted successfully",
  "statusCode": 200,
  "data": null
}
```

#### 8. Activate User
```
PUT /api/users/{id}/activate
Authorization: Bearer {token}

Path Parameters:
- id: User ID (required)

Response (200 OK):
{
  "success": true,
  "message": "User activated successfully",
  "statusCode": 200,
  "data": null
}
```

---

### Sprint Management API (Auth Required)

#### 1. Get All Sprints
```
GET /api/sprints
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Sprints retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "name": "Q1 Training 2026",
      "description": "First quarter training program",
      "startDate": "2026-04-01",
      "endDate": "2026-06-30",
      "trainerId": 1,
      "trainerName": "John Trainer",
      "status": "ACTIVE",
      "createdAt": "2026-04-01T10:00:00",
      "updatedAt": "2026-04-01T10:00:00"
    }
  ]
}
```

#### 2. Get Sprint by ID
```
GET /api/sprints/{id}
Authorization: Bearer {token}

Path Parameters:
- id: Sprint ID (required)

Response (200 OK): Single sprint object
```

#### 3. Get Sprints by Status
```
GET /api/sprints/status/{status}
Authorization: Bearer {token}

Path Parameters:
- status: ACTIVE, CLOSED, PLANNED (required)

Response (200 OK): Array of sprints with specified status
```

#### 4. Get Trainer's Active Sprints
```
GET /api/sprints/trainer/{trainerId}/active
Authorization: Bearer {token}

Path Parameters:
- trainerId: Trainer User ID (required)

Response (200 OK): Array of active sprints for trainer
```

#### 5. Create Sprint
```
POST /api/sprints?trainerId={trainerId}
Authorization: Bearer {token}
Content-Type: application/json

Query Parameters:
- trainerId: Trainer User ID (required)

Request:
{
  "name": "Q2 Training",
  "description": "Second quarter training",
  "startDate": "2026-07-01",
  "endDate": "2026-09-30"
}

Response (201 Created): Created sprint object
```

#### 6. Update Sprint
```
PUT /api/sprints/{id}
Authorization: Bearer {token}
Content-Type: application/json

Path Parameters:
- id: Sprint ID (required)

Request:
{
  "name": "Updated Sprint Name",
  "status": "ACTIVE",
  "description": "Updated description"
}

Response (200 OK): Updated sprint object
```

#### 7. Close Sprint
```
PUT /api/sprints/{id}/close
Authorization: Bearer {token}

Path Parameters:
- id: Sprint ID (required)

Response (200 OK):
{
  "success": true,
  "message": "Sprint closed successfully",
  "statusCode": 200,
  "data": null
}
```

#### 8. Delete Sprint
```
DELETE /api/sprints/{id}
Authorization: Bearer {token}

Path Parameters:
- id: Sprint ID (required)

Response (200 OK):
{
  "success": true,
  "message": "Sprint deleted successfully",
  "statusCode": 200,
  "data": null
}
```

---

### Task & Attendance API (Auth Required)

#### 1. Get All Tasks
```
GET /api/tasks
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "title": "John Doe - 2026-04-01",
      "description": "Attendance record",
      "sprintId": 1,
      "assigneeId": 1,
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

#### 2. Get Task by ID
```
GET /api/tasks/{id}
Authorization: Bearer {token}

Path Parameters:
- id: Task ID (required)

Response (200 OK): Single task object
```

#### 3. Get Sprint's Tasks
```
GET /api/tasks/sprint/{sprintId}
Authorization: Bearer {token}

Path Parameters:
- sprintId: Sprint ID (required)

Response (200 OK): Array of tasks in sprint
```

#### 4. Get Attendance by Sprint & Date
```
GET /api/tasks/attendance/sprint/{sprintId}/date/{date}
Authorization: Bearer {token}

Path Parameters:
- sprintId: Sprint ID (required)
- date: Date in YYYY-MM-DD format (required)

Response (200 OK): Attendance records for date
```

#### 5. Get User's Attendance in Sprint
```
GET /api/tasks/attendance/user/{userId}/sprint/{sprintId}
Authorization: Bearer {token}

Path Parameters:
- userId: Employee User ID (required)
- sprintId: Sprint ID (required)

Response (200 OK): User's attendance records in sprint
```

#### 6. Create Task
```
POST /api/tasks?sprintId={sprintId}
Authorization: Bearer {token}
Content-Type: application/json

Query Parameters:
- sprintId: Sprint ID (required)

Request:
{
  "title": "Task Title",
  "description": "Task description",
  "assigneeId": 2,
  "status": "PENDING"
}

Response (201 Created): Created task object
```

#### 7. Mark Attendance
```
POST /api/tasks/attendance?userId={userId}&sprintId={sprintId}&status={status}&date={date}
Authorization: Bearer {token}

Query Parameters:
- userId: Employee User ID (required)
- sprintId: Sprint ID (required)
- status: PRESENT, ABSENT, LATE, EXCUSED (required)
- date: Date in YYYY-MM-DD format (required)

Response (201 Created):
{
  "success": true,
  "message": "Attendance marked successfully",
  "statusCode": 201,
  "data": {
    "id": 1,
    "title": "Employee Name - 2026-04-01",
    "description": "Attendance record for 2026-04-01",
    "sprintId": 1,
    "assigneeId": 2,
    "attendanceStatus": "PRESENT",
    "attendanceDate": "2026-04-01",
    "status": "COMPLETED",
    "createdAt": "2026-04-01T10:00:00",
    "updatedAt": "2026-04-01T10:00:00"
  }
}
```

#### 8. Update Task
```
PUT /api/tasks/{id}
Authorization: Bearer {token}
Content-Type: application/json

Path Parameters:
- id: Task ID (required)

Request:
{
  "title": "Updated Title",
  "status": "IN_PROGRESS"
}

Response (200 OK): Updated task object
```

#### 9. Update Attendance
```
PUT /api/tasks/{id}/attendance/{status}
Authorization: Bearer {token}

Path Parameters:
- id: Task ID (required)
- status: PRESENT, ABSENT, LATE, EXCUSED (required)

Response (200 OK): Updated task object
```

#### 10. Delete Task
```
DELETE /api/tasks/{id}
Authorization: Bearer {token}

Path Parameters:
- id: Task ID (required)

Response (200 OK):
{
  "success": true,
  "message": "Task deleted successfully",
  "statusCode": 200,
  "data": null
}
```

---

### Health Check API (No Auth Required)

#### 1. Service Health
```
GET /api/health

Response (200 OK):
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

#### 2. Database Health
```
GET /api/health/db

Response (200 OK):
{
  "success": true,
  "message": "Database connection is healthy",
  "statusCode": 200,
  "data": "Connected"
}
```

---

## Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "data": null
}
```

### Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid parameters or malformed request |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User doesn't have permission for resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 500 | Internal Server Error | Server/database error |

### Custom Exceptions

- **AuthenticationException**: Authentication/authorization failures
- **ResourceNotFoundException**: Resource not found
- **DuplicateResourceException**: Resource already exists
- **GlobalExceptionHandler**: Centralized error handling

---

## Security Features

1. **JWT Authentication**
   - Token generated on login/register
   - Token includes: email, userId, role, expiration
   - Expiration: 24 hours
   - Validated on every protected endpoint

2. **Password Security**
   - BCrypt encryption
   - 8+ character minimum
   - Unique per user

3. **CORS Configuration**
   - Allowed origin: http://localhost:5173
   - Credentials allowed
   - Methods: GET, POST, PUT, DELETE

4. **Request Validation**
   - Email format validation
   - Required field validation
   - Role validation

---

## Response Format

All API responses follow standard format:

```json
{
  "success": boolean,
  "message": "Response message",
  "statusCode": number,
  "data": object | array | null
}
```

---

## Frontend Integration Summary

### Key Integration Points:
1. **Authentication Context**: Store token and user info
2. **API Service**: Axios instance with JWT interceptor
3. **Error Handling**: Global 401 handling for token expiration
4. **API Hooks**: Custom hooks for API calls
5. **Environment Configuration**: API base URL from .env

### API Calls by Page:

| Page | Endpoint | Method |
|------|----------|--------|
| Login | /auth/login | POST |
| Register | /auth/register | POST |
| Dashboard | /sprints, /users/role/{role} | GET |
| Sprint List | /sprints | GET |
| Create Sprint | /sprints | POST |
| Sprint Attendance | /tasks/attendance/sprint/{id}/date/{date} | GET |
| Mark Attendance | /tasks/attendance | POST |
| User Management | /users | GET, POST, PUT, DELETE |
| HR Dashboard | /sprints, /users, /tasks | GET |

---

## Database Relationships

```
User (1) ──────→ (Many) Sprint
                   ↓
                 Trainer

User (1) ──────→ (Many) Task
                   ↓
                 Attendee

Sprint (1) ──────→ (Many) Task
```

---

## Deployment Checklist

- [ ] MySQL database running on production server
- [ ] `.properties` file configured with production DB credentials
- [ ] JWT secret key secured and configured
- [ ] CORS allowed origins updated for production frontend URL
- [ ] Build JAR: `mvn clean package`
- [ ] Deploy JAR to production server
- [ ] Configure reverse proxy (nginx/Apache) if needed
- [ ] Set up SSL/HTTPS
- [ ] Enable database backups
- [ ] Configure logging and monitoring
- [ ] Test all endpoints with production URL

---

## Performance Optimization

1. **Database Indexing**
   - Index on `email` column
   - Index on `status` column
   - Index on `attendanceDate` column

2. **Caching** (Future Enhancement)
   - Cache user roles
   - Cache active sprints

3. **Pagination** (Future Enhancement)
   - Add pagination to list endpoints
   - Default page size: 10-20 records

4. **Batch Operations** (Future Enhancement)
   - Bulk attendance marking
   - Batch user creation

---

## API Testing

### Using Postman
1. Create collection with all endpoints
2. Set environment variables: `base_url`, `token`
3. Use pre-request scripts to fetch token
4. Create test cases for each endpoint

### Using cURL
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all sprints
curl -X GET http://localhost:8080/api/sprints \
  -H "Authorization: Bearer <token>"
```

### Using Thunder Client
- Similar to Postman
- Lighter weight alternative
- Available as VS Code extension

---

## Version History

- **v1.0.0** (2026-04-01)
  - Initial release
  - Core authentication
  - User management
  - Sprint management
  - Attendance tracking
  - Role-based access control

---

## Future Enhancements

1. **Email Notifications**
   - Attendance confirmations
   - Sprint reminders

2. **Reports & Analytics**
   - Attendance reports by user/sprint
   - Performance metrics
   - Export to PDF/Excel

3. **Mobile App**
   - React Native version
   - Offline attendance marking

4. **Advanced Features**
   - Attendance patterns
   - Predictive analytics
   - Automated scheduling

5. **Integration**
   - Calendar sync
   - Slack notifications
   - Third-party SSO

---

## Support & Documentation

- API Documentation: See `API_DOCUMENTATION.md`
- Integration Guide: See `INTEGRATION_GUIDE.md`
- Backend README: See `README.md`

---

**API Plan Complete! Ready for Implementation ✅**

Backend is fully implemented and ready for frontend integration.
All endpoints have been created with proper validation, security, and error handling.
