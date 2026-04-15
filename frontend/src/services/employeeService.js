// ─────────────────────────────────────────────────────────────
// src/services/employeeService.js
// Handles employee CRUD
//
// Backend endpoints:
//   GET    /api/employees                — get all (with filters)
//   GET    /api/employees/:id            — get by id
//   POST   /api/employees                — create
//   PUT    /api/employees/:id            — update
//   DELETE /api/employees/:id            — delete (MANAGER only)
//   GET    /api/employees/search         — search by keyword
//
// Employee shape:
// {
//   id, empId, name, email, phone,
//   technology, cohort, department, status
// }
// ─────────────────────────────────────────────────────────────

import api from "./api";

const employeeService = {
  // ── Get all employees ───────────────────────────────────────
  // Params: technology, cohort, status, page, size
  getAll(params = {}) {
    return api.get("/employees", { params });
  },

  // ── Get employee by ID ──────────────────────────────────────
  getById(id) {
    return api.get(`/employees/${id}`);
  },

  // ── Search employees ────────────────────────────────────────
  // Params: keyword, technology
  search(keyword, technology = "") {
    return api.get("/employees/search", { params: { keyword, technology } });
  },

  // ── Create employee ─────────────────────────────────────────
  // Body: { name, empId, email, phone, technology, cohort, department }
  create(data) {
    return api.post("/employees", data);
  },

  // ── Update employee ─────────────────────────────────────────
  update(id, data) {
    return api.put(`/employees/${id}`, data);
  },

  // ── Delete employee (MANAGER only) ──────────────────────────
  delete(id) {
    return api.delete(`/employees/${id}`);
  },

  // ── Get employees by technology + cohort ─────────────────────
  // Used to preview who will be enrolled when creating a sprint
  getByCohortPair(technology, cohort) {
    return api.get("/employees", { params: { technology, cohort } });
  },
};

export default employeeService;
