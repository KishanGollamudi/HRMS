// src/services/profileService.js
import api from "./api";

const profileService = {
  getProfile() {
    return api.get("/auth/profile");
  },
  updateProfile(data) {
    return api.put("/auth/profile", data);
  },
};

export default profileService;
