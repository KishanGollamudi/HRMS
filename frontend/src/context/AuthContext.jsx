import { createContext, useContext, useState, useEffect } from "react";
import authService from "@/services/authService";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const AuthContext = createContext();

const MOCK_PROFILES = {
  trainer: { id: 1, name: "Vikram Singh",  email: "vikram@sprintflow.com", role: "trainer", initials: "VS" },
  hr:      { id: 2, name: "Meena Iyer",    email: "meena@sprintflow.com",  role: "hr",      initials: "MI" },
  manager: { id: 3, name: "Surya Prakash", email: "surya@sprintflow.com",  role: "manager", initials: "SP" },
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on page refresh ──────────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = authService.getStoredUser();
        if (!stored) return;

        if (USE_MOCK) {
          setUser({ ...stored, role: stored.role?.toLowerCase() });
          return;
        }

        // Token exists — restore immediately (JWT is stateless)
        if (authService.isAuthenticated()) {
          setUser({ ...stored, role: stored.role?.toLowerCase() });
          return;
        }

        // Token expired — clear and force re-login
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // ── Login ─────────────────────────────────────────────────────
  const login = async (roleOrEmail, password) => {
    if (USE_MOCK) {
      const profile = MOCK_PROFILES[roleOrEmail];
      if (!profile) throw new Error("Invalid role");
      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      return profile;
    }
    const userData   = await authService.login(roleOrEmail, password);
    const normalized = { ...userData, role: userData.role?.toLowerCase() };
    setUser(normalized);
    return normalized;
  };

  // ── Logout ────────────────────────────────────────────────────
  const logout = async () => {
    if (!USE_MOCK) await authService.logout();
    else localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isMock: USE_MOCK }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
