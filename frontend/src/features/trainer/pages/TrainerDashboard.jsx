import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Clock, UserX, ArrowRight } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { Link } from "react-router-dom";
import { T } from "@/theme/trainer";
import PageBanner from "@/components/PageBanner";
import CohortTag from "@/components/CohortTag";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

const COHORT_COLORS = {
  "Cohort A": "#0d9488",
  "Cohort B": "#f59e0b",
  "Cohort C": "#8b5cf6",
};
const COHORT_COLOR_LIST = ["#0d9488", "#f59e0b", "#8b5cf6", "#3b82f6", "#ec4899"];

const getCohortColor = (cohort, idx) =>
  COHORT_COLORS[cohort] ?? COHORT_COLOR_LIST[idx % COHORT_COLOR_LIST.length];

const TRAINER_GRADIENT = "linear-gradient(135deg, #0d9488 0%, #99f6e4 100%)";

const TrainerStatCard = ({ item, index, total }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden", borderRadius: 16,
        padding: "28px 24px", cursor: "default",
        border: `1.5px solid ${hovered ? T.accent : T.border}`,
        background: hovered ? TRAINER_GRADIENT : T.card,
        boxShadow: hovered ? T.accentGlow : T.shadow,
        transition: "background 0.28s, border-color 0.28s, box-shadow 0.28s",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: hovered ? "rgba(255,255,255,0.2)" : item.lightBg,
          border: `1.5px solid ${hovered ? "rgba(255,255,255,0.35)" : T.border}`,
          transition: "background 0.28s, border-color 0.28s",
        }}>
          <Icon size={17} style={{ color: hovered ? "#fff" : item.iconColor, transition: "color 0.28s" }} />
        </div>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.15em", marginBottom: 6,
          color: hovered ? "rgba(255,255,255,0.7)" : T.muted,
          transition: "color 0.28s",
        }}>
          {item.title}
        </p>
        <p style={{
          fontSize: 38, fontWeight: 800, lineHeight: 1, marginBottom: 6,
          color: hovered ? "#fff" : T.text,
          transition: "color 0.28s",
        }}>
          {item.value}
        </p>
        <p style={{
          fontSize: 11,
          color: hovered ? "rgba(255,255,255,0.55)" : T.muted,
          transition: "color 0.28s",
        }}>
          {total > 0 ? `${Math.round((item.value / total) * 100)}% of total` : "—"}
        </p>
      </div>
    </motion.div>
  );
};

// Custom tooltip for bar chart
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: T.shadowMd }}>
      <p style={{ color: T.text, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill, fontSize: 11, margin: "2px 0" }}>
          {p.name}: <span style={{ fontWeight: 700 }}>{p.value}%</span>
        </p>
      ))}
    </div>
  );
};

export default function TrainerDashboard() {
  const { employees, attendance, sprints, sprintCohortStats } = useAppData();
  const [cohortFilter, setCohortFilter] = useState("All");

  // Flatten all attendance records from the date-keyed map
  const allEntries = useMemo(() =>
    Object.values(attendance).flat()
  , [attendance]);

  // Today's entries only — used for stat cards (Present/Late/Absent today)
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayEntries = useMemo(() =>
    attendance[todayKey] ?? []
  , [attendance, todayKey]);

  // statusMap from today's records only so stat cards reflect today's attendance
  const statusMap = useMemo(() => {
    const map = {};
    todayEntries.forEach((r) => {
      const id = r.empId ?? r.employeeId;
      if (id) map[String(id)] = r.status;
    });
    return map;
  }, [todayEntries]);

  // All unique cohorts from employees
  const allCohorts = useMemo(() => {
    const set = new Set(employees.map((e) => e.cohort).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [employees]);

  // Filtered employees by cohort — must be declared before cohortBreakdown
  const filteredEmployees = useMemo(() =>
    cohortFilter === "All" ? employees : employees.filter((e) => e.cohort === cohortFilter)
  , [employees, cohortFilter]);

  const total        = filteredEmployees.length;
  const presentCount = filteredEmployees.filter((e) => statusMap[String(e.empId)] === "Present").length;
  const lateCount    = filteredEmployees.filter((e) => statusMap[String(e.empId)] === "Late").length;
  const absentCount  = filteredEmployees.filter((e) => statusMap[String(e.empId)] === "Absent").length;

  const kpis = [
    { title: "Total Students",  value: total,        icon: Users,     lightBg: T.accentBg,             iconColor: T.accent  },
    { title: "Present",         value: presentCount, icon: UserCheck, lightBg: "rgba(5,150,105,0.08)", iconColor: "#059669" },
    { title: "Late",            value: lateCount,    icon: Clock,     lightBg: T.amberBg,              iconColor: T.amber   },
    { title: "Absent",          value: absentCount,  icon: UserX,     lightBg: T.redBg,                iconColor: T.red     },
  ];

  // Bar chart: attendance % per sprint per cohort
  // Uses backend sprintCohortStats as primary source (DB-persisted data)
  // Falls back to local allEntries if API stats not yet loaded
  const cohortBarData = useMemo(() =>
    sprints.map((sprint) => {
      const apiStats = sprintCohortStats[sprint.id] ?? [];
      if (apiStats.length > 0) {
        // Build from backend cohort stats
        const cohortStats = {};
        const uniqueCohorts = [];
        apiStats.forEach((stat) => {
          const cohort = stat.cohort;
          if (!cohort) return;
          cohortStats[cohort] = stat.presentPercentage ?? 0;
          uniqueCohorts.push(cohort);
        });
        return { sprint: sprint.title, ...cohortStats, _cohorts: uniqueCohorts };
      }
      // Fallback: derive from local attendance cache
      const sprintRecords = allEntries.filter(
        (r) => (r.sprint ?? r.sprintTitle ?? "") === sprint.title
      );
      const cohortStats = {};
      const uniqueCohorts = [...new Set(sprintRecords.map((r) => r.cohort).filter(Boolean))];
      uniqueCohorts.forEach((cohort) => {
        const group   = sprintRecords.filter((r) => r.cohort === cohort);
        const present = group.filter((r) => r.status === "Present").length;
        cohortStats[cohort] = group.length ? Math.round((present / group.length) * 100) : 0;
      });
      return { sprint: sprint.title, ...cohortStats, _cohorts: uniqueCohorts };
    })
  , [sprints, allEntries, sprintCohortStats]);

  const chartCohorts = useMemo(() => {
    const set = new Set();
    cohortBarData.forEach((d) => d._cohorts.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [cohortBarData]);

  // Cohort breakdown table
  // Primary: aggregate across all sprints from sprintCohortStats (backend)
  // Fallback: derive from local allEntries
  const cohortBreakdown = useMemo(() => {
    const cohorts = allCohorts.filter((c) => c !== "All");

    // Aggregate sprintCohortStats across all sprints for each cohort
    const aggregated = {};
    Object.values(sprintCohortStats).flat().forEach((stat) => {
      const c = stat.cohort;
      if (!c) return;
      if (!aggregated[c]) aggregated[c] = { present: 0, late: 0, absent: 0, total: 0 };
      aggregated[c].present += stat.presentDays ?? 0;
      aggregated[c].late    += stat.lateDays    ?? 0;
      aggregated[c].absent  += stat.absentDays  ?? 0;
      aggregated[c].total   += stat.totalDays   ?? 0;
    });

    // If we have API data, use it
    if (Object.keys(aggregated).length > 0) {
      return cohorts
        .filter((c) => aggregated[c])
        .map((cohort) => {
          const a   = aggregated[cohort];
          const pct = a.total > 0 ? Math.round((a.present / a.total) * 100) : 0;
          const empCount = employees.filter((e) => e.cohort === cohort).length;
          return { cohort, total: empCount, present: a.present, late: a.late, absent: a.absent, pct };
        });
    }

    // Fallback: derive from local attendance cache
    return cohorts.map((cohort) => {
      const group   = filteredEmployees.filter((e) => e.cohort === cohort);
      const records = allEntries.filter((r) => r.cohort === cohort);
      const present = records.filter((r) => r.status === "Present").length;
      const late    = records.filter((r) => r.status === "Late").length;
      const absent  = records.filter((r) => r.status === "Absent").length;
      const pct     = records.length ? Math.round((present / records.length) * 100) : 0;
      return { cohort, total: group.length, present, late, absent, pct };
    });
  }, [allCohorts, filteredEmployees, allEntries, sprintCohortStats, employees]);

  // Per-sprint cohort breakdown — uses backend cohort-stats API data
  // This shows actual DB-persisted stats, distinct from the local attendance cache
  const sprintCohortBars = useMemo(() =>
    sprints.map((sprint) => {
      const apiStats = sprintCohortStats[sprint.id] ?? [];
      // If we have API stats, use them
      if (apiStats.length > 0) {
        return {
          sprint,
          cohorts: apiStats.map((stat, idx) => ({
            cohort: stat.cohort,
            pct: stat.presentPercentage ?? 0,
            total: stat.totalDays ?? 0,
            present: stat.presentDays ?? 0,
            late: stat.lateDays ?? 0,
            absent: stat.absentDays ?? 0,
            color: getCohortColor(stat.cohort, idx),
          })),
        };
      }
      // Fallback: derive from local attendance cache (before first API sync)
      const sprintRecords = allEntries.filter(
        (r) => (r.sprint ?? r.sprintTitle ?? "") === sprint.title
      );
      const uniqueCohorts = [...new Set(sprintRecords.map((r) => r.cohort).filter(Boolean))];
      return {
        sprint,
        cohorts: uniqueCohorts.map((cohort, idx) => {
          const group   = sprintRecords.filter((r) => r.cohort === cohort);
          const present = group.filter((r) => r.status === "Present").length;
          const late    = group.filter((r) => r.status === "Late").length;
          const absent  = group.filter((r) => r.status === "Absent").length;
          const pct     = group.length ? Math.round((present / group.length) * 100) : 0;
          return { cohort, pct, total: group.length, present, late, absent, color: getCohortColor(cohort, idx) };
        }),
      };
    })
  , [sprints, allEntries, sprintCohortStats]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
      style={{ background: T.bg, minHeight: "100vh", padding: "28px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
          <PageBanner
            title="Trainer Dashboard"
            gradient="linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)"
            shadow="4px 0 24px rgba(13,148,136,0.30)"
            width="320px"
            right={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Cohort filter */}
                <select value={cohortFilter} onChange={(e) => setCohortFilter(e.target.value)}
                  style={{ height: 36, borderRadius: 10, border: `1.5px solid ${T.border}`, background: "#fff", color: T.text, padding: "0 12px", fontSize: 13, outline: "none", cursor: "pointer" }}>
                  {allCohorts.map((c) => <option key={c} value={c}>{c === "All" ? "All Cohorts" : c}</option>)}
                </select>
                <Link to="/trainer/attendance"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 12, background: T.accent, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", boxShadow: T.accentGlow }}>
                  Manage Attendance <ArrowRight size={14} />
                </Link>
              </div>
            }
          />
          <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>
            {cohortFilter === "All" ? "All cohorts · Today's attendance at a glance" : `Filtered by ${cohortFilter}`}
          </p>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {kpis.map((item, i) => (
            <TrainerStatCard key={item.title} item={item} index={i} total={total} />
          ))}
        </div>

        {/* Grouped Bar Chart — Attendance % by Sprint & Cohort */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow }}>
          <div style={{ height: 3, background: T.line }} />
          <div style={{ padding: "18px 20px 4px" }}>
            <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>Attendance % by Sprint &amp; Cohort</p>
            <p style={{ color: T.muted, fontSize: 12, margin: "0 0 16px" }}>Present percentage per cohort across all sprints</p>
          </div>
          <div style={{ padding: "0 16px 20px" }}>
            {cohortBarData.length === 0 || chartCohorts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 13 }}>No attendance data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={cohortBarData} barSize={22} barGap={4} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke={T.bg2} vertical={false} />
                  <XAxis dataKey="sprint" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: T.sub, paddingTop: 12 }} />
                  {chartCohorts.map((cohort, idx) => (
                    <Bar key={cohort} dataKey={cohort} name={cohort} fill={getCohortColor(cohort, idx)} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Cohort Attendance Breakdown + Per-Sprint Cohort Bars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Cohort breakdown table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow }}>
            <div style={{ height: 3, background: T.line }} />
            <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${T.border}` }}>
              <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: 0 }}>Attendance by Cohort</p>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.bg, borderBottom: `1.5px solid ${T.border}` }}>
                  {["Cohort", "Total", "Present", "Late", "Absent", "%"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: T.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohortBreakdown.map(({ cohort, total: t, present, late, absent, pct }, idx) => (
                  <tr key={cohort} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "12px 16px" }}>
                      <CohortTag cohort={cohort} />
                    </td>
                    <td style={{ padding: "12px 16px", color: T.text, fontWeight: 600 }}>{t}</td>
                    <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 600 }}>{present}</td>
                    <td style={{ padding: "12px 16px", color: T.amber, fontWeight: 600 }}>{late}</td>
                    <td style={{ padding: "12px 16px", color: T.red, fontWeight: 600 }}>{absent}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 4, background: T.bg2, overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6 + idx * 0.1, duration: 0.7, ease: "easeOut" }}
                            style={{ height: "100%", borderRadius: 4, background: getCohortColor(cohort, idx) }} />
                        </div>
                        <span style={{ color: T.accent, fontSize: 11, fontWeight: 700, minWidth: 32 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {cohortBreakdown.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "30px 0", color: T.muted, fontSize: 13 }}>No data available.</td></tr>
                )}
              </tbody>
            </table>
          </motion.div>

          {/* Per-sprint cohort attendance bars */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: 20, boxShadow: T.shadow, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: T.line }} />
            <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Sprint Cohort Breakdown</p>
            <p style={{ color: T.muted, fontSize: 12, margin: "0 0 18px" }}>DB stats per cohort — "total" = attendance records (employees × days submitted)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {sprintCohortBars.map(({ sprint, cohorts: bars }) => (
                <div key={sprint.id}>
                  <p style={{ color: T.sub, fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>{sprint.title}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {bars.length === 0 && <p style={{ color: T.muted, fontSize: 11 }}>No submitted data yet</p>}
                    {bars.map(({ cohort, pct, total: t, present, late, absent, color }) => (
                      <div key={cohort}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <CohortTag cohort={cohort} />
                          <span style={{ color, fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 4, background: T.bg2, overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.7, duration: 0.7, ease: "easeOut" }}
                            style={{ height: "100%", borderRadius: 4, background: color }} />
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 10, color: T.muted }}>
                          <span style={{ color: "#059669" }}>✓ {present} present</span>
                          {late > 0 && <span style={{ color: T.amber }}>⏱ {late} late</span>}
                          {absent > 0 && <span style={{ color: T.red }}>✗ {absent} absent</span>}
                          <span style={{ marginLeft: "auto" }}>
                            {t} record{t !== 1 ? "s" : ""}
                            {(() => {
                              // Estimate days submitted: total / employees in this cohort
                              const empCount = employees.filter((e) => e.cohort === cohort).length;
                              if (empCount > 0 && t > 0) {
                                const days = Math.round(t / empCount);
                                return days > 0 ? ` · ${empCount} emp · ${days} day${days !== 1 ? "s" : ""}` : "";
                              }
                              return "";
                            })()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
