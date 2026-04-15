// src/services/sprintService.js
// api.js interceptor returns ApiResponseDTO: { success, message, data, statusCode }
// So res.data is the actual payload (SprintDTO or SprintDTO[])

import api from "./api";

const sprintService = {
  getAll(params = {}) {
    return api.get("/sprints", { params });
  },
  getById(id) {
    return api.get(`/sprints/${id}`);
  },
  getByTrainer(trainerId) {
    return api.get(`/sprints/trainer/${trainerId}`);
  },
  create(data) {
    return api.post("/sprints", data);
  },
  update(id, data) {
    return api.put(`/sprints/${id}`, data);
  },
  updateStatus(id, status) {
    return api.patch(`/sprints/${id}/status`, { status });
  },
  delete(id) {
    return api.delete(`/sprints/${id}`);
  },
  getEmployees(sprintId) {
    return api.get(`/employees/sprint/${sprintId}`);
  },
  autoEnroll(sprintId) {
    return api.post(`/employees/sprint/${sprintId}/auto-enroll`);
  },
};

export default sprintService;
