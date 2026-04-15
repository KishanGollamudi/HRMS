# SprintFlow Backend & Frontend Integration Guide

## Project Setup Complete ✅

Your SprintFlow backend has been fully implemented with all necessary components for seamless integration with the frontend.

---

## 🚀 Quick Start

### Backend Setup

1. **Ensure MySQL is running:**
   ```bash
   # Make sure MySQL server is started
   # Create database (optional, will auto-create):
   mysql -u root -p
   # CREATE DATABASE sprintflow_db;
   ```

2. **Navigate to backend project:**
   ```bash
   cd C:\SpringBoot\POC\sprintflow-backend
   ```

3. **Build the project:**
   ```bash
   mvn clean install
   ```

4. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```
   
   **Alternative:** Run the JAR file
   ```bash
   java -jar target/sprintflow-0.0.1-SNAPSHOT.jar
   ```

5. **Verify backend is running:**
   ```
   http://localhost:8080/api/health
   ```
   Should return: `{"status":"UP",...}`

### Frontend Setup

1. **Navigate to frontend project:**
   ```bash
   cd C:\Users\2531019\my-project\sprintflow-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create/Update `.env` file:**
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   ```
   http://localhost:5173
   ```

---

## 📋 Backend Architecture

### Package Structure
```
src/main/java/com/sprintflow/
├── SprintFlowApplication.java      # Entry point
├── config/
│   └── SecurityConfig.java         # JWT & CORS configuration
├── controller/                     # REST endpoints
│   ├── AuthController.java
│   ├── UserController.java
│   ├── SprintController.java
│   ├── TaskController.java
│   └── HealthController.java
├── service/                        # Business logic
│   ├── AuthService.java
│   ├── UserService.java
│   ├── SprintService.java
│   └── TaskService.java
├── entity/                         # JPA entities
│   ├── User.java
│   ├── Sprint.java
│   └── Task.java
├── dto/                            # Data transfer objects
│   ├── AuthResponseDTO.java
│   ├── LoginDTO.java
│   ├── RegisterDTO.java
│   ├── UserDTO.java
│   ├── SprintDTO.java
│   ├── TaskDTO.java
│   └── ApiResponseDTO.java
├── repository/                     # JPA repositories
│   ├── UserRepository.java
│   ├── SprintRepository.java
│   └── TaskRepository.java
├── security/                       # JWT authentication
│   ├── JwtTokenProvider.java
│   └── JwtAuthenticationFilter.java
├── exception/                      # Custom exceptions
│   ├── GlobalExceptionHandler.java
│   ├── AuthenticationException.java
│   ├── ResourceNotFoundException.java
│   └── DuplicateResourceException.java
└── resources/
    └── application.properties
```

---

## 🔐 Authentication Flow

### Login/Register Flow
```
Frontend (Login Page)
    ↓ POST /auth/login {email, password}
Backend (AuthController)
    ↓ Verify credentials
    ↓ Generate JWT token
    ↓ Return token + user info
Frontend
    ↓ Store token in localStorage
    ↓ Use token in headers for subsequent requests
```

### Token Usage
Every request (after login) should include:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📦 API Endpoints Summary

### Authentication (No token required)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - Logout

### Authentication (Token required)
- `GET /auth/me` - Current user info
- `GET /auth/validate` - Validate token

### Users Management
- `GET /users` - All users
- `GET /users/{id}` - User by ID
- `GET /users/role/{role}` - Users by role
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Deactivate user
- `PUT /users/{id}/activate` - Activate user

### Sprints Management
- `GET /sprints` - All sprints
- `GET /sprints/{id}` - Sprint by ID
- `GET /sprints/status/{status}` - Sprints by status
- `GET /sprints/trainer/{trainerId}/active` - Trainer's active sprints
- `POST /sprints?trainerId={id}` - Create sprint
- `PUT /sprints/{id}` - Update sprint
- `PUT /sprints/{id}/close` - Close sprint
- `DELETE /sprints/{id}` - Delete sprint

### Tasks & Attendance
- `GET /tasks` - All tasks
- `GET /tasks/{id}` - Task by ID
- `GET /tasks/sprint/{sprintId}` - Sprint's tasks
- `GET /tasks/attendance/sprint/{sprintId}/date/{date}` - Daily attendance
- `GET /tasks/attendance/user/{userId}/sprint/{sprintId}` - User attendance
- `POST /tasks?sprintId={id}` - Create task
- `POST /tasks/attendance` - Mark attendance
- `PUT /tasks/{id}` - Update task
- `PUT /tasks/{id}/attendance/{status}` - Update attendance
- `DELETE /tasks/{id}` - Delete task

### Health Check
- `GET /health` - Service health
- `GET /health/db` - Database connection

---

## 🔌 Frontend Integration Points

### 1. Update API Service
File: `src/services/api.js`

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Update AuthContext
File: `src/context/AuthContext.jsx`

```javascript
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      
      setToken(data.token);
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      const { data } = response.data;
      
      setToken(data.token);
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const getCurrentUser = async () => {
    if (!token) return null;
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (err) {
      console.error('Failed to get current user:', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      getCurrentUser,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### 3. Create API Helper Hooks
Create file: `src/hooks/useApi.js`

```javascript
import { useState, useCallback } from 'react';
import api from '../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({
        method,
        url,
        data,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url) => request('GET', url), [request]);
  const post = useCallback((url, data) => request('POST', url, data), [request]);
  const put = useCallback((url, data) => request('PUT', url, data), [request]);
  const delete_ = useCallback((url) => request('DELETE', url), [request]);

  return { get, post, put, delete: delete_, loading, error };
}
```

### 4. Update Sprint Related Components

Update `src/features/sprint/pages/SprintList.jsx`:

```javascript
import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function SprintList() {
  const { user } = useAuth();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSprints();
  }, []);

  const loadSprints = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sprints');
      setSprints(response.data.data);
    } catch (error) {
      console.error('Failed to load sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSprint = async (sprintData) => {
    try {
      const response = await api.post(
        `/sprints?trainerId=${user.id}`,
        sprintData
      );
      setSprints([...sprints, response.data.data]);
    } catch (error) {
      console.error('Failed to create sprint:', error);
    }
  };

  // ... rest of component
}
```

### 5. Update Attendance Components

Update `src/features/sprint/pages/SprintAttendance.jsx`:

```javascript
import api from '../../../services/api';

export default function SprintAttendance() {
  const [attendance, setAttendance] = useState([]);

  const markAttendance = async (userId, sprintId, status, date) => {
    try {
      const response = await api.post(
        `/tasks/attendance?userId=${userId}&sprintId=${sprintId}&status=${status}&date=${date}`
      );
      setAttendance([...attendance, response.data.data]);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const getAttendanceByDate = async (sprintId, date) => {
    try {
      const response = await api.get(
        `/tasks/attendance/sprint/${sprintId}/date/${date}`
      );
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  // ... rest of component
}
```

### 6. Update Login Component

Update `src/pages/Login.jsx`:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, error, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
```

---

## 🗄️ Database Setup

### Auto-Create Tables
Hibernate will auto-create tables on first run. If you want to pre-create them:

```sql
CREATE DATABASE IF NOT EXISTS sprintflow_db;
USE sprintflow_db;

-- Tables will be auto-created by Hibernate
-- Or manually execute these if needed:

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

CREATE TABLE sprints (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT,
  start_date DATE,
  end_date DATE,
  trainer_id BIGINT,
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id)
);

CREATE TABLE tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT,
  sprint_id BIGINT,
  user_id BIGINT,
  status VARCHAR(50),
  attendance_status VARCHAR(50),
  attendance_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (sprint_id) REFERENCES sprints(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🧪 Testing the Backend

### Using cURL

1. **Register User:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainer@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Trainer",
    "role": "TRAINER"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainer@example.com",
    "password": "password123"
  }'
```

3. **Create Sprint (replace token and trainerId):**
```bash
curl -X POST "http://localhost:8080/api/sprints?trainerId=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Training",
    "description": "First quarter training",
    "startDate": "2026-04-01",
    "endDate": "2026-06-30"
  }'
```

### Using Postman
1. Import the provided Postman collection (if created)
2. Set environment variables: `base_url` and `token`
3. Use pre-request scripts to automatically set token from login response

---

## ⚙️ Configuration Details

### application.properties Key Settings
- **Server Port:** 8080
- **Database:** MySQL on localhost:3306
- **Database Name:** sprintflow_db
- **JWT Secret:** Configured in properties
- **JWT Expiration:** 24 hours (86400000 ms)
- **CORS:** Allowed from http://localhost:5173

### Security Headers
- CORS enabled for frontend
- CSRF protection
- Password encryption with BCrypt
- JWT token-based authentication

---

## 🐛 Common Issues & Solutions

### Issue: "Connection refused" to database
**Solution:** 
- Ensure MySQL is running: `net start MySQL` (Windows)
- Check connectivity: `mysql -u root -p`

### Issue: JWT token expires
**Solution:**
- Token valid for 24 hours from login
- Frontend should redirect to login if 401 error
- Implement token refresh if needed

### Issue: CORS errors in frontend
**Solution:**
- Verify backend is running on port 8080
- Check `VITE_API_BASE_URL` in frontend `.env`
- Ensure SecurityConfig allows frontend origin

### Issue: Port 8080 already in use
**Solution:**
```bash
# Windows - Find process using 8080
netstat -ano | findstr :8080
# Kill process
taskkill /PID <PID> /F
```

---

## 📚 Additional Resources

- **JPA/Hibernate:** https://spring.io/guides/gs/accessing-data-jpa/
- **Spring Security:** https://spring.io/guides/gs/securing-web/
- **JWT with Spring:** https://jjwt.io/
- **Building REST APIs:** https://spring.io/guides/gs/rest-service/

---

## ✅ Checklist Before Going Live

- [ ] MySQL database created and running
- [ ] Backend built with `mvn clean install`
- [ ] Backend running: `http://localhost:8080/api/health` returns UP
- [ ] Frontend `.env` file has correct `VITE_API_BASE_URL`
- [ ] Frontend can access backend (no CORS errors)
- [ ] Test login/register flow
- [ ] Test sprint CRUD operations
- [ ] Test attendance marking
- [ ] Verify token persistence on page reload
- [ ] Check error handling for invalid tokens

---

## 🚀 Next Steps

1. **Run Backend:** `mvn spring-boot:run`
2. **Run Frontend:** `npm run dev`
3. **Test Integration:** Login and verify features work
4. **Deploy:** Once tested, deploy to production server

---

**Backend is ready for integration! 🎉**

For detailed API documentation, see `API_DOCUMENTATION.md`
