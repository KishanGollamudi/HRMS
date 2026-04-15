# 🚀 SprintFlow Backend - Getting Started Guide

## Welcome! 👋

Your SprintFlow backend is **fully implemented and ready to use**. This guide will help you get started quickly.

---

## ⚡ Super Quick Start (5 minutes)

### 1. Start MySQL (if not already running)
```bash
# Make sure MySQL server is running
# Windows: Services or MySQL command line
mysql -u root -p
# Password: root
```

### 2. Build and Run Backend
```bash
cd C:\SpringBoot\POC\sprintflow-backend
mvn clean install
mvn spring-boot:run
```

### 3. Verify Backend Started
```
Visit: http://localhost:8080/api/health
Expected: {"status":"UP",...}
```

### 4. Start Frontend
```bash
cd C:\Users\2531019\my-project\sprintflow-frontend
npm install
npm run dev
```

### 5. Access Application
```
http://localhost:5173
```

---

## 📖 Documentation Structure

### 🔍 For Different Needs:

**Want to understand the API?**
→ Read **API_DOCUMENTATION.md**

**Want integration code examples?**
→ Read **INTEGRATION_GUIDE.md**

**Want architecture details?**
→ Read **API_PLAN.md**

**Want to see what's implemented?**
→ Read **IMPLEMENTATION_SUMMARY.md**

**This is your first time?**
→ Continue reading this file

---

## 📋 What You Have

### Backend Features ✅
- User authentication with JWT
- User management (CRUD)
- Sprint management (create, update, close)
- Attendance tracking
- Role-based access control
- Complete error handling
- CORS enabled for frontend

### Frontend Features ✅
- React with Vite
- Login/Registration pages
- Sprint dashboard
- Attendance tracking interface
- User management pages
- Role-based dashboards

---

## 🔧 Configuration

### Backend Configuration
**File:** `src/main/resources/application.properties`

**Current Settings:**
```
Server Port: 8080
Database: MySQL on localhost:3306
Database Name: sprintflow_db (auto-created)
Database User: root
Database Password: root
JWT Expiration: 24 hours
Frontend URL: http://localhost:5173
```

### Change Settings
If your setup is different, update application.properties:
```properties
spring.datasource.url=jdbc:mysql://your-host:3306/sprintflow_db
spring.datasource.username=your-user
spring.datasource.password=your-password
```

### Frontend Configuration
**File:** `.env` (create if doesn't exist)

Add this line:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🧪 Test Your Setup

### Option 1: Using cURL (Command Line)

**Test 1: Check Backend Health**
```bash
curl http://localhost:8080/api/health
```
Expected response:
```json
{"success":true,"message":"Service is healthy",...}
```

**Test 2: Register User**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "TRAINER"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "id": 1,
    "email": "test@example.com",
    ...
  }
}
```

**Test 3: Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copy the `token` from response for next tests.

**Test 4: Get Current User** (replace TOKEN)
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Option 2: Using Postman

1. Download Postman (if not already installed)
2. Create new request
3. Set Method: POST
4. Set URL: http://localhost:8080/api/auth/login
5. Go to Body tab
6. Select raw → JSON
7. Paste:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
8. Click Send
9. Copy the token from response
10. For subsequent requests, go to Headers and add:
```
Authorization: Bearer [paste-token-here]
```

---

## 📊 API Overview

### Authentication (No login required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /auth/login | Login and get token |
| POST | /auth/register | Create new account |
| POST | /auth/logout | Logout |

### Users (Login required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /users | List all users |
| GET | /users/{id} | Get user by ID |
| POST | /users | Create user |
| PUT | /users/{id} | Update user |
| DELETE | /users/{id} | Delete user |

### Sprints (Login required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /sprints | List all sprints |
| GET | /sprints/{id} | Get sprint by ID |
| POST | /sprints?trainerId={id} | Create sprint |
| PUT | /sprints/{id} | Update sprint |
| DELETE | /sprints/{id} | Delete sprint |

### Attendance (Login required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /tasks | List all taskss |
| GET | /tasks/sprint/{sprintId} | Get sprint tasks |
| POST | /tasks/attendance | Mark attendance |
| PUT | /tasks/{id}/attendance/{status} | Update attendance |

See **API_DOCUMENTATION.md** for complete details.

---

## 🔐 User Roles

### What each role can do:

**ADMIN** 🔴
- Full control over everything
- Manage all users
- View all sprints and attendance

**HR** 🟠
- Create and manage sprints
- Manage user accounts
- View all reports

**MANAGER** 🟡
- View team attendance
- Manage tasks
- Cannot create sprints

**TRAINER** 🟢
- Create sprints
- Mark attendance
- Manage own sprints

**EMPLOYEE** 🔵
- View own attendance
- View assigned sprints
- Cannot modify data

---

## 🛠 Troubleshooting

### Problem: Backend won't start

**Check 1:** Is Java installed?
```bash
java -version
```
Should show Java 11 or higher.

**Check 2:** Is MySQL running?
```bash
mysql -u root -p
```
Enter password: `root`

**Check 3:** Is port 8080 free?
Windows:
```bash
netstat -ano | findstr :8080
```

### Problem: Database error

**Check 1:** Database connection
```bash
mysql -u root -p
CREATE DATABASE sprintflow_db;
```

**Check 2:** Credentials in application.properties are correct
```properties
spring.datasource.username=root
spring.datasource.password=root
```

### Problem: Frontend can't reach backend

**Check 1:** Is backend running?
```bash
http://localhost:8080/api/health
```

**Check 2:** Is .env file correct?
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

**Check 3:** Restart frontend
```bash
npm run dev
```

### Problem: Login not working

1. Make sure you registered first
2. Use same email and password you registered with
3. Check backend logs for errors

---

## 📝 Project Structure

```
Backend (C:\SpringBoot\POC\sprintflow-backend)
├── src/main/java/com/sprintflow/
│   ├── controller/          # REST endpoints
│   ├── service/             # Business logic
│   ├── entity/              # Database models
│   ├── repository/          # Database queries
│   ├── dto/                 # Data transfer objects
│   ├── security/            # JWT & Security
│   ├── exception/           # Error handling
│   └── config/              # Configuration
├── src/main/resources/
│   └── application.properties  # Settings
└── pom.xml                     # Dependencies

Frontend (C:\Users\2531019\my-project\sprintflow-frontend)
├── src/
│   ├── components/          # React components
│   ├── context/             # State management
│   ├── features/            # Feature modules
│   ├── pages/               # Page components
│   ├── services/            # API service
│   └── App.jsx              # Main app
├── .env                     # Environment variables
└── package.json             # Dependencies
```

---

## 🔄 Typical Workflow

### 1. User Registration
```
User fills form → Frontend POST /auth/register 
→ Backend creates user → 
Frontend stores token → 
User logged in ✅
```

### 2. Create Sprint
```
Trainer clicks "Create Sprint" → 
Frontend POST /sprints → 
Backend creates sprint → 
Sprint appears in list ✅
```

### 3. Mark Attendance
```
Trainer opens sprint → 
Clicks "Mark Attendance" → 
Frontend POST /tasks/attendance → 
Backend records attendance → 
Attendance confirmed ✅
```

---

## 💾 Database Overview

### Three Main Tables

**users** - Store user accounts
- Stores email, password, name, role
- Used for login and access control

**sprints** - Store training programs
- Stores sprint details (name, dates)
- Links to trainer (user)
- Has many attendance records (tasks)

**tasks** - Store attendance records
- Stores attendance (present/absent/late)
- Links to sprint and user
- Tracks date and status

---

## 🎓 Learning Path

### If you're new to Spring Boot:
1. Read components in this order:
   - SecurityConfig (how auth works)
   - AuthService (login logic)
   - UserService (user operations)
   - SprintService (sprint operations)

### If you're new to JWT:
- JWT is like a "digital ticket"
- User logs in → gets JWT token
- User sends token with each request
- Backend verifies token is real
- Token expires after 24 hours

### If you're new to REST APIs:
- GET = read data
- POST = create data
- PUT = update data
- DELETE = remove data

---

## 📚 Next Steps

### Immediate (Next 5 mins)
1. ✅ Get backend running
2. ✅ Get frontend running
3. ✅ Register a test user
4. ✅ Login and verify

### Short Term (Next 30 mins)
1. Read **API_DOCUMENTATION.md**
2. Test all endpoints with Postman or cURL
3. Create test sprints
4. Mark attendance

### Medium Term (Today)
1. Read **INTEGRATION_GUIDE.md**
2. Update frontend API service
3. Test full integration
4. Verify all features work

### Long Term (This Week)
1. Read **API_PLAN.md**
2. Understand full architecture
3. Add additional features if needed
4. Deploy to production

---

## 🎯 Success Indicators

You'll know everything is working when:

✅ Backend starts without errors
```
"Started SprintFlowApplication in X seconds"
```

✅ Frontend starts without errors
```
"VITE v... ready in X ms"
```

✅ Can access health check
```
http://localhost:8080/api/health → returns UP
```

✅ Can register and login
```
Can create account and get token
```

✅ Can create sprints
```
POST /sprints returns sprint with ID
```

✅ Can mark attendance
```
POST /tasks/attendance marks attendance
```

---

## 🆘 Getting Help

### Check These Files In Order:
1. **GETTING_STARTED.md** (this file) - Quick start
2. **INTEGRATION_GUIDE.md** - Integration code examples
3. **API_DOCUMENTATION.md** - API endpoint details
4. **API_PLAN.md** - Full architecture and specs
5. **IMPLEMENTATION_SUMMARY.md** - What's implemented

### Common Questions

**Q: Where do I change the database?**
A: `src/main/resources/application.properties`

**Q: How long is token valid?**
A: 24 hours from login

**Q: Can I change frontend port?**
A: Yes, in vite.config.js

**Q: How do I add new endpoints?**
A: Create Controller → Service → Repository

**Q: How do I deploy?**
A: Build JAR with `mvn clean package`

---

## 🎉 You're Ready!

Everything is set up. Just:

1. Start MySQL
2. Run: `mvn spring-boot:run`
3. Run: `npm run dev`
4. Visit: http://localhost:5173

**That's it! 🚀**

For detailed information, check the other documentation files.

---

**Last Updated:** 2026-04-01
**Status:** Ready for Use ✅
**Backend:** Fully Implemented ✅
**Frontend:** Ready for Integration ✅
