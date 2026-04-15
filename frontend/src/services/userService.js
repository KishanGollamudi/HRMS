// ─────────────────────────────────────────────────────────────
// src/services/userService.js
// Handles Trainer, HR, HRBP user management (MANAGER only)
//
// Backend endpoints:
//   GET    /api/users?role=TRAINER       — get all trainers
//   GET    /api/users?role=HR            — get all HRBPs
//   GET    /api/users/:id                — get user by id
//   POST   /api/users                    — create user (generates credentials)
//   PUT    /api/users/:id                — update user
//   DELETE /api/users/:id                — delete user
//
// User shape:
// {
//   id, name, email, role: "HR"|"TRAINER"|"MANAGER",
//   phone, department, trainerRole, status, joinedDate
// }
//
// Create body:
// {
//   name, email, role, phone, department,
//   trainerRole (for TRAINER), joinedDate
// }
// Backend auto-generates a random password and emails credentials
// ─────────────────────────────────────────────────────────────

import api from "./api";

const userService = {
  // ── Get all trainers ────────────────────────────────────────
  getTrainers() {
    return api.get("/users", { params: { role: "TRAINER" } });
  },

  // ── Get all HRBPs ───────────────────────────────────────────
  getHRBPs() {
    return api.get("/users", { params: { role: "HR" } });
  },

  // ── Get user by ID ──────────────────────────────────────────
  getById(id) {
    return api.get(`/users/${id}`);
  },

  // ── Create user — backend generates & emails credentials ────
  // Body: { name, email, role, phone, department, trainerRole, joinedDate }
  create(data) {
    return api.post("/users", data);
  },

  // ── Update user ─────────────────────────────────────────────
  update(id, data) {
    return api.put(`/users/${id}`, data);
  },

  // ── Delete user ─────────────────────────────────────────────
  delete(id) {
    return api.delete(`/users/${id}`);
  },

  // ── Resend credentials email ─────────────────────────────────
  resendCredentials(id) {
    return api.post(`/users/${id}/resend-credentials`);
  },
};

export default userService;
