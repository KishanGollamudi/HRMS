import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import employeeService from "@/services/employeeService";
import userService from "@/services/userService";
import sprintService from "@/services/sprintService";
import attendanceService from "@/services/attendanceService";
import { useAuth } from "@/context/AuthContext";
import { unwrapList } from "@/utils/apiResponse";
import { LEGACY_COHORT_NAMES } from "@/constants/cohortLabels";

// Static room list — no backend endpoint needed
const STATIC_ROOMS = [
  "Room A - Sandeepa",
  "Room B - Dhrona",
  "Room C - Brahma",
  "Room D - Maheshwara",
];

const AppDataContext = createContext();

/** HR-defined cohort names (persisted); merged with cohorts present on employees */
const COHORT_STORAGE_KEY = "sprintflow_hr_cohort_names";

/** Opt-in demo mode: set VITE_USE_MOCK=true — default uses real API / DB */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const AppDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [sprints, setSprints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hrbps, setHrbps] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [sprintCohortStats, setSprintCohortStats] = useState({});
  const [extraCohortNames, setExtraCohortNames] = useState([]);
  const [rooms, setRooms] = useState(STATIC_ROOMS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COHORT_STORAGE_KEY);
      if (raw) {
        let list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list = list.filter((c) => !LEGACY_COHORT_NAMES.has(c));
          setExtraCohortNames(list);
          localStorage.setItem(COHORT_STORAGE_KEY, JSON.stringify(list));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const cohortNames = useMemo(() => {
    const fromEmp = employees.map((e) => e.cohort).filter(Boolean);
    return [...new Set([...extraCohortNames, ...fromEmp])].sort((a, b) =>
      String(a).localeCompare(String(b)),
    );
  }, [employees, extraCohortNames]);

  const persistCohortNames = useCallback((list) => {
    setExtraCohortNames(list);
    try {
      localStorage.setItem(COHORT_STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }, []);

  const addCohort = useCallback(
    (name) => {
      const n = String(name ?? "").trim();
      if (!n) return { ok: false, message: "Enter a cohort name." };
      if (LEGACY_COHORT_NAMES.has(n))
        return {
          ok: false,
          message: "Use the same format as the database, e.g. Java cohort 1.",
        };
      const all = [
        ...new Set([
          ...extraCohortNames,
          ...employees.map((e) => e.cohort).filter(Boolean),
        ]),
      ];
      if (all.includes(n))
        return { ok: false, message: "That cohort already exists." };
      persistCohortNames([...extraCohortNames, n]);
      return { ok: true };
    },
    [employees, extraCohortNames, persistCohortNames],
  );

  const removeCohort = useCallback(
    (name) => {
      if (employees.some((e) => e.cohort === name))
        return {
          ok: false,
          message: "Reassign or remove employees in this cohort first.",
        };
      persistCohortNames(extraCohortNames.filter((c) => c !== name));
      return { ok: true };
    },
    [employees, extraCohortNames, persistCohortNames],
  );

  // ── Load real data from API ───────────────────────────────
  useEffect(() => {
    if (USE_MOCK) return;
    const token = localStorage.getItem("accessToken");
    if (!token || !user) return;

    const role = user.role?.toLowerCase();
    const uid = user.id;

    employeeService
      .getAll()
      .then((res) => setEmployees(unwrapList(res)))
      .catch(() => {});

    // /api/users is restricted to MANAGER — only fetch for that role
    if (role === "manager") {
      userService
        .getHRBPs()
        .then((res) => setHrbps(unwrapList(res)))
        .catch(() => {});
      userService
        .getTrainers()
        .then((res) => setTrainers(unwrapList(res)))
        .catch(() => {});
    }

    const sprintReq =
      role === "trainer" && uid != null
        ? sprintService.getByTrainer(uid)
        : sprintService.getAll();

    sprintReq
      .then((res) => {
        const list = unwrapList(res);
        setSprints(list);
        // For each sprint: load cohort stats AND all attendance records
        list.forEach((s) => {
          // Cohort stats (for breakdown panel)
          attendanceService
            .getCohortStats(s.id)
            .then((r) => {
              const stats = unwrapList(r);
              if (stats.length)
                setSprintCohortStats((prev) => ({ ...prev, [s.id]: stats }));
            })
            .catch(() => {});

          // All attendance records for this sprint (for charts + stat cards)
          attendanceService
            .getAllBySprint(s.id)
            .then((r) => {
              const records = unwrapList(r);
              if (!records.length) return;
              // Group by date and merge into attendance map
              const byDate = {};
              records.forEach((rec) => {
                const dateKey = rec.attendanceDate ?? rec.date ?? "";
                if (!dateKey) return;
                if (!byDate[dateKey]) byDate[dateKey] = [];
                byDate[dateKey].push({
                  empId: rec.empId ?? rec.employeeId,
                  name: rec.employeeName ?? rec.name ?? "",
                  cohort: rec.cohort ?? "",
                  technology: rec.technology ?? "",
                  sprint: rec.sprintTitle ?? s.title ?? "",
                  status: rec.status ?? "Absent",
                  time: rec.checkInTime ?? null,
                });
              });
              setAttendance((prev) => {
                const merged = { ...prev };
                Object.entries(byDate).forEach(([date, recs]) => {
                  merged[date] = recs;
                });
                return merged;
              });
            })
            .catch(() => {});
        });
      })
      .catch(() => {});

    // Rooms are static — no API call needed
    // setRooms is already initialised with STATIC_ROOMS above
  }, [user]);

  // ── Employees ─────────────────────────────────────────────
  const addEmployee = async (data) => {
    if (USE_MOCK) {
      setEmployees((p) => [...p, { ...data, id: crypto.randomUUID() }]);
      return;
    }
    const res = await employeeService.create(data);
    setEmployees((p) => [...p, res.data]);
  };
  const updateEmployee = async (id, data) => {
    if (USE_MOCK) {
      setEmployees((p) => p.map((e) => (e.id === id ? { ...e, ...data } : e)));
      return;
    }
    const res = await employeeService.update(id, data);
    setEmployees((p) =>
      p.map((e) => (e.id === id ? { ...e, ...res.data } : e)),
    );
  };
  const deleteEmployee = async (id) => {
    if (USE_MOCK) {
      setEmployees((p) => p.filter((e) => e.id !== id));
      return;
    }
    await employeeService.delete(id);
    setEmployees((p) => p.filter((e) => e.id !== id));
  };

  // ── HRBPs ─────────────────────────────────────────────────
  const addHrbp = async (data) => {
    if (USE_MOCK) {
      setHrbps((p) => [...p, { ...data, id: crypto.randomUUID() }]);
      return;
    }
    const payload = { ...data, role: "HR", joinedDate: data.joined ?? data.joinedDate };
    const res = await userService.create(payload);
    const created = res?.data ?? res;
    setHrbps((p) => [...p, created]);
  };
  const updateHrbp = async (id, data) => {
    if (USE_MOCK) {
      setHrbps((p) => p.map((h) => (h.id === id ? { ...h, ...data } : h)));
      return;
    }
    const payload = { ...data, joinedDate: data.joined ?? data.joinedDate };
    const res = await userService.update(id, payload);
    const updated = res?.data ?? res;
    setHrbps((p) => p.map((h) => (h.id === id ? { ...h, ...updated } : h)));
  };
  const deleteHrbp = async (id) => {
    if (USE_MOCK) {
      setHrbps((p) => p.filter((h) => h.id !== id));
      return;
    }
    await userService.delete(id);
    setHrbps((p) => p.filter((h) => h.id !== id));
  };

  // ── Trainers ──────────────────────────────────────────────
  const addTrainer = async (data) => {
    if (USE_MOCK) {
      setTrainers((p) => [...p, { ...data, id: crypto.randomUUID() }]);
      return;
    }
    const payload = { ...data, role: "TRAINER", joinedDate: data.joined ?? data.joinedDate };
    const res = await userService.create(payload);
    const created = res?.data ?? res;
    setTrainers((p) => [...p, created]);
  };
  const updateTrainer = async (id, data) => {
    if (USE_MOCK) {
      setTrainers((p) => p.map((t) => (t.id === id ? { ...t, ...data } : t)));
      return;
    }
    const payload = { ...data, joinedDate: data.joined ?? data.joinedDate };
    const res = await userService.update(id, payload);
    const updated = res?.data ?? res;
    setTrainers((p) => p.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };
  const deleteTrainer = async (id) => {
    if (USE_MOCK) {
      setTrainers((p) => p.filter((t) => t.id !== id));
      return;
    }
    await userService.delete(id);
    setTrainers((p) => p.filter((t) => t.id !== id));
  };

  // ── Sprints (AppData — used by manager module) ────────────
  const addSprint = async (data) => {
    if (USE_MOCK)
      setSprints((p) => [...p, { ...data, id: crypto.randomUUID() }]);
  };
  const updateSprint = async (id, data) => {
    if (USE_MOCK)
      setSprints((p) => p.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };
  const deleteSprint = async (id) => {
    if (USE_MOCK) setSprints((p) => p.filter((s) => s.id !== id));
  };

  // ── Attendance (DailyAttendance page) ────────────────────
  const getAttendanceForDate = (date) => attendance[date] ?? [];
  const setAttendanceForDate = (date, records) =>
    setAttendance((p) => ({ ...p, [date]: records }));

  return (
    <AppDataContext.Provider
      value={{
        sprints,
        employees,
        sprintCohortStats,
        hrbps,
        trainers,
        attendance,
        cohortNames,
        addCohort,
        removeCohort,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addHrbp,
        updateHrbp,
        deleteHrbp,
        addTrainer,
        updateTrainer,
        deleteTrainer,
        addSprint,
        updateSprint,
        deleteSprint,
        getAttendanceForDate,
        setAttendanceForDate,
        rooms,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
