# SprintFlow Database Schema Guide

This project uses a MySQL 8 container from [`docker-compose.yml`](/home/kishan/Downloads/HRMS/docker-compose.yml).

Container details:

- Container name: `sprintflow-mysql`
- Database name: `sprintflow_db`
- Username: `root`
- Password: `admin`
- Port: `3306`

Note:

- The backend is already configured with `spring.jpa.hibernate.ddl-auto=update`, so if the backend starts successfully it can create/update tables automatically.
- If you want to create the schema manually inside the MySQL container, use the SQL below.

## Required Schema

```sql
CREATE DATABASE IF NOT EXISTS sprintflow_db;
USE sprintflow_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(255) NULL,
    role VARCHAR(255) NOT NULL,
    is_active BIT(1) NOT NULL DEFAULT b'1',
    phone_number VARCHAR(255) NULL,
    department VARCHAR(255) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_employee_id (employee_id)
);

CREATE TABLE IF NOT EXISTS sprints (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(255) NOT NULL,
    trainer_id BIGINT NOT NULL,
    location VARCHAR(255) NULL,
    max_participants INT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_sprints_trainer_id (trainer_id),
    CONSTRAINT fk_sprints_trainer
        FOREIGN KEY (trainer_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sprint_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(255) NOT NULL,
    notes VARCHAR(255) NULL,
    hours_worked DOUBLE NULL,
    marked_by VARCHAR(255) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_tasks_sprint_id (sprint_id),
    KEY idx_tasks_user_id (user_id),
    CONSTRAINT fk_tasks_sprint
        FOREIGN KEY (sprint_id) REFERENCES sprints(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
```

## Start the DB Container

Run this from the project root:

```bash
docker compose up -d mysql
```

Check that the container is running:

```bash
docker ps
```

## Insert the Schema Into the DB Container

### Option 1: Paste SQL directly into MySQL inside the container

```bash
docker exec -it sprintflow-mysql mysql -uroot -padmin
```

Then paste the SQL from the schema section above.

### Option 2: Save SQL in a local file and import it

Create a file such as `schema.sql` in this project directory, then run:

```bash
docker exec -i sprintflow-mysql mysql -uroot -padmin sprintflow_db < schema.sql
```

If the database does not exist yet, use:

```bash
docker exec -i sprintflow-mysql mysql -uroot -padmin < schema.sql
```

## Verify the Tables

```bash
docker exec -it sprintflow-mysql mysql -uroot -padmin -e "USE sprintflow_db; SHOW TABLES;"
```

Check table structure:

```bash
docker exec -it sprintflow-mysql mysql -uroot -padmin -e "USE sprintflow_db; DESCRIBE users;"
docker exec -it sprintflow-mysql mysql -uroot -padmin -e "USE sprintflow_db; DESCRIBE sprints;"
docker exec -it sprintflow-mysql mysql -uroot -padmin -e "USE sprintflow_db; DESCRIBE tasks;"
```

## Optional Sample Inserts

```sql
INSERT INTO users (
    email, password, first_name, last_name, employee_id, role,
    is_active, phone_number, department, created_at, updated_at
) VALUES (
    'trainer@example.com',
    '$2a$10$examplehashedpassword',
    'Vikram',
    'Singh',
    'EMP001',
    'TRAINER',
    b'1',
    '9876543210',
    'Java',
    NOW(),
    NOW()
);

INSERT INTO sprints (
    name, description, start_date, end_date, status, trainer_id,
    location, max_participants, created_at, updated_at
) VALUES (
    'Sprint 1',
    'Java training sprint',
    '2026-04-20',
    '2026-04-30',
    'PLANNED',
    1,
    'Room A',
    30,
    NOW(),
    NOW()
);

INSERT INTO tasks (
    sprint_id, user_id, attendance_date, status, notes,
    hours_worked, marked_by, created_at, updated_at
) VALUES (
    1,
    1,
    '2026-04-20',
    'PRESENT',
    'Initial attendance entry',
    8,
    'system',
    NOW(),
    NOW()
);
```
