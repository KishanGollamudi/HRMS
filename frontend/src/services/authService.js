import api from "./api";

const authService = {

  async login(email, password) {
    // api.js interceptor returns ApiResponseDTO directly as `res`
    // Shape: { success: true, data: { accessToken, user }, message, statusCode }
    const res = await api.post("/auth/login", { email, password });

    // res.data is { accessToken, user, expiresIn }
    const { accessToken, refreshToken, user } = res.data;

    if (!accessToken) throw new Error("Login failed: no token received");
    if (!user)        throw new Error("Login failed: no user data received");

    localStorage.setItem("accessToken",  accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  },

  async logout() {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  getStoredUser() {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  },

  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  },
};

export default authService;
