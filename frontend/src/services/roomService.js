import api from "./api";

const roomService = {
  getAll() {
    return api.get("/rooms");
  },
  // future: create/update/delete if backend supports it
};

export default roomService;
