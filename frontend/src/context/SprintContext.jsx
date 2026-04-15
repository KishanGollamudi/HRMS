import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import sprintService from "@/services/sprintService";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { unwrapList } from "@/utils/apiResponse";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const SprintContext = createContext();

export const SprintProvider = ({ children }) => {
  const { user } = useAuth();
  // useAppData() is safe here because SprintProvider is always inside AppDataProvider
  // Guard with ?? {} in case context hasn't hydrated yet
  const appData = useAppData() ?? {};
  const appSprints = appData.sprints;

  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchSprints = useCallback(async () => {
    if (USE_MOCK) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const role = user?.role?.toLowerCase();
    const uid  = user?.id;
    try {
      setLoading(true);
      setError(null);
      const res =
        role === "trainer" && uid != null
          ? await sprintService.getByTrainer(uid)
          : await sprintService.getAll();
      setSprints(unwrapList(res));
    } catch (err) {
      if (!err.message?.includes("403")) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mirror sprints from AppDataContext when available; otherwise fetch directly
  useEffect(() => {
    if (Array.isArray(appSprints) && appSprints.length > 0) {
      setSprints(appSprints);
      return;
    }
    fetchSprints();
  }, [fetchSprints, user, appSprints]);

  const addSprint = async (data) => {
    const payload = {
      ...data,
      cohorts: data.cohorts?.length
        ? data.cohorts
        : [{ technology: data.technology || "", cohort: data.cohort || "" }],
      cohort: data.cohorts?.[0]?.cohort || data.cohort || "",
      timeSlot: `${data.sprintStart} - ${data.sprintEnd}`,
    };
    if (USE_MOCK) {
      setSprints((p) => [
        ...p,
        { ...payload, id: crypto.randomUUID(), status: "Scheduled" },
      ]);
      return;
    }
    const res = await sprintService.create(payload);
    setSprints((p) => [...p, res.data]);
  };

  const updateStatus = async (id, status) => {
    if (USE_MOCK) {
      setSprints((p) => p.map((s) => (s.id === id ? { ...s, status } : s)));
      return;
    }
    await sprintService.updateStatus(id, status);
    setSprints((p) => p.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const updateSprint = async (id, data) => {
    if (USE_MOCK) {
      setSprints((p) => p.map((s) => (s.id === id ? { ...s, ...data } : s)));
      return;
    }
    const res = await sprintService.update(id, data);
    setSprints((p) => p.map((s) => (s.id === id ? { ...s, ...res.data } : s)));
  };

  const deleteSprint = async (id) => {
    if (USE_MOCK) {
      setSprints((p) => p.filter((s) => s.id !== id));
      return;
    }
    await sprintService.delete(id);
    setSprints((p) => p.filter((s) => s.id !== id));
  };

  return (
    <SprintContext.Provider
      value={{
        sprints,
        loading,
        error,
        addSprint,
        updateStatus,
        updateSprint,
        deleteSprint,
        refetch: fetchSprints,
      }}
    >
      {children}
    </SprintContext.Provider>
  );
};

export const useSprints = () => useContext(SprintContext);
