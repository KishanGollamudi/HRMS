import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  PauseCircle,
  CheckCircle,
  Users,
  UserCheck,
  Clock,
  UserX,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAttendance } from "@/context/AttendanceContext";
import { useAuth } from "@/context/AuthContext";
import { useSprints } from "@/context/SprintContext";
import { useAppData } from "@/context/AppDataContext";
import attendanceService from "@/services/attendanceService";
import { unwrapList } from "@/utils/apiResponse";
import { countEmployeesForSprint } from "@/utils/sprintEmployees";
import { T } from "@/theme/trainer";
import PageBanner from "@/components/PageBanner";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const BAR_COLORS = {
  Java: "#0d9488",
  Devops: "#14b8a6",
  Python: "#2dd4bf",
  DotNet: "#06b6d4",
  SalesForce: "#00c896",
};
const TECH_STACKS = ["Java", "Devops", "Python", "DotNet", "SalesForce"];

const statusConfig = {
  Scheduled: { color: T.accent, bg: T.accentBg },
  "On Hold": { color: T.amber, bg: T.amberBg },
  Completed: { color: "#059669", bg: "rgba(5,150,105,0.08)" },
};

export default function Overview() {
  const { sessions } = useAttendance();
  const { user } = useAuth();
  const { sprints } = useSprints();
  const { employees, attendance } = useAppData();
  const navigate = useNavigate();

  const [apiTodayRows, setApiTodayRows] = useState([]);

  const mockRows = useMemo(() => {
    if (!sessions) return [];
    return Object.values(sessions).flatMap((s) => s.entries);
  }, [sessions]);

  useEffect(() => {
    if (USE_MOCK) return;
    if (!sprints?.length) return;
    const today = new Date().toISOString().slice(0, 10);
    let cancelled = false;
    Promise.all(
      sprints.map((s) =>
        attendanceService.getByDate(s.id, today).catch(() => ({ data: [] })),
      ),
    ).then((responses) => {
      if (cancelled) return;
      const rows = [];
      responses.forEach((res) => {
        const list = Array.isArray(res?.data) ? res.data : unwrapList(res);
        if (!Array.isArray(list)) return;
        list.forEach((r) => {
          rows.push({
            techStack: r.technology ?? r.techStack ?? "",
            status: r.status ?? "Absent",
          });
        });
      });
      setApiTodayRows(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [sprints]);

  const today = new Date().toISOString().slice(0, 10);
  const attendanceRows = USE_MOCK
    ? mockRows
    : attendance &&
        Array.isArray(attendance[today]) &&
        attendance[today].length > 0
      ? attendance[today].map((r) => ({
          techStack: r.technology ?? r.techStack ?? "",
          status: r.status ?? "Absent",
        }))
      : !sprints?.length
        ? []
        : apiTodayRows;

  const totalEnrolled = useMemo(
    () =>
      sprints.reduce(
        (sum, s) => sum + countEmployeesForSprint(s, employees),
        0,
      ),
    [sprints, employees],
  );

  const totalSprints = sprints.length;
  const onHoldCount = sprints.filter((s) => s.status === "On Hold").length;
  const completedCount = sprints.filter((s) => s.status === "Completed").length;

  const totalStudents = USE_MOCK ? mockRows.length : totalEnrolled;
  const presentCount = attendanceRows.filter(
    (e) => e.status === "Present",
  ).length;
  const lateCount = attendanceRows.filter((e) => e.status === "Late").length;
  const absentCount = attendanceRows.filter(
    (e) => e.status === "Absent",
  ).length;

  const sprintStats = [
    {
      title: "Total Sprints",
      value: totalSprints,
      icon: Calendar,
      gradient: "linear-gradient(135deg,#0d9488,#14b8a6)",
      glow: "rgba(13,148,136,0.2)",
      lightBg: T.accentBg,
      iconColor: T.accent,
    },
    {
      title: "On Hold",
      value: onHoldCount,
      icon: PauseCircle,
      gradient: "linear-gradient(135deg,#d97706,#f59e0b)",
      glow: "rgba(217,119,6,0.2)",
      lightBg: T.amberBg,
      iconColor: T.amber,
    },
    {
      title: "Completed",
      value: completedCount,
      icon: CheckCircle,
      gradient: "linear-gradient(135deg,#059669,#10b981)",
      glow: "rgba(5,150,105,0.2)",
      lightBg: "rgba(5,150,105,0.08)",
      iconColor: "#059669",
    },
  ];

  const attendanceStats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      gradient: "linear-gradient(135deg,#0d9488,#14b8a6)",
      glow: "rgba(13,148,136,0.2)",
      lightBg: T.accentBg,
      iconColor: T.accent,
    },
    {
      title: "Present Today",
      value: presentCount,
      icon: UserCheck,
      gradient: "linear-gradient(135deg,#059669,#10b981)",
      glow: "rgba(5,150,105,0.2)",
      lightBg: "rgba(5,150,105,0.08)",
      iconColor: "#059669",
    },
    {
      title: "Late Today",
      value: lateCount,
      icon: Clock,
      gradient: "linear-gradient(135deg,#d97706,#f59e0b)",
      glow: "rgba(217,119,6,0.2)",
      lightBg: T.amberBg,
      iconColor: T.amber,
    },
    {
      title: "Absent Today",
      value: absentCount,
      icon: UserX,
      gradient: "linear-gradient(135deg,#dc2626,#ef4444)",
      glow: "rgba(220,38,38,0.2)",
      lightBg: T.redBg,
      iconColor: T.red,
    },
  ];

  const stackStats = TECH_STACKS.map((stack) => {
    const group = attendanceRows.filter(
      (e) => String(e.techStack || "") === stack,
    );
    const present = group.filter((e) => e.status === "Present").length;
    const pct = group.length ? Math.round((present / group.length) * 100) : 0;
    return { stack, pct, total: group.length, present };
  });

  const KpiCard = ({ item, index, delay = 0 }) => {
    const Icon = item.icon;
    const denom = totalStudents > 0 ? totalStudents : 1;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: `0 16px 40px ${item.glow}` }}
        transition={{ delay: delay + index * 0.08, duration: 0.35 }}
        style={{
          background: T.card,
          border: `1.5px solid ${T.border}`,
          borderRadius: 16,
          padding: "20px 20px 16px",
          position: "relative",
          overflow: "hidden",
          boxShadow: T.shadow,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: item.gradient,
            borderRadius: "16px 16px 0 0",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                color: T.muted,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              {item.title}
            </p>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: delay + index * 0.08 + 0.3,
                type: "spring",
                stiffness: 200,
              }}
              style={{
                color: T.text,
                fontSize: 34,
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {item.value}
            </motion.p>
            {totalStudents > 0 &&
              ![
                "Total Sprints",
                "On Hold",
                "Completed",
                "Total Students",
              ].includes(item.title) && (
                <p style={{ color: T.muted, fontSize: 11 }}>
                  {Math.round((item.value / denom) * 100)}% of enrolled
                </p>
              )}
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: item.lightBg,
              border: `1.5px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={19} style={{ color: item.iconColor }} />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ background: T.bg, minHeight: "100vh", padding: "28px 24px" }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "8px",
          }}
        >
          <PageBanner
            title={`Welcome back, ${user?.name?.split(" ")[0] || ""} 👋`}
            gradient="linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)"
            shadow="4px 0 24px rgba(13,148,136,0.30)"
            width="360px"
          />
          <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>
            Sprint & attendance overview
          </p>
        </div>

        {/* Sprint KPIs */}
        <div>
          <p
            style={{
              color: T.muted,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Sprint Overview
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 14,
            }}
          >
            {sprintStats.map((item, i) => (
              <KpiCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Attendance KPIs */}
        <div>
          <p
            style={{
              color: T.muted,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Attendance Overview
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 14,
            }}
          >
            {attendanceStats.map((item, i) => (
              <KpiCard key={item.title} item={item} index={i} delay={0.3} />
            ))}
          </div>
        </div>

        {/* Sprint table + Attendance bars */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* Sprint table */}
          <div
            style={{
              background: T.card,
              border: `1.5px solid ${T.border}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: T.shadow,
            }}
          >
            <div style={{ height: 3, background: T.line }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: `1.5px solid ${T.border}`,
              }}
            >
              <p
                style={{
                  color: T.text,
                  fontSize: 14,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Active Sprints
              </p>
              <Link
                to="/sprints"
                style={{
                  color: T.accent,
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View all →
              </Link>
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: T.bg,
                    borderBottom: `1.5px solid ${T.border}`,
                  }}
                >
                  {["Sprint", "Time", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 16px",
                        color: T.muted,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sprints.map((s, i) => {
                  const cfg = statusConfig[s.status] || statusConfig.Scheduled;
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      style={{
                        borderBottom: `1px solid ${T.border}`,
                        cursor: "pointer",
                        transition: "background 0.12s",
                      }}
                      onClick={() => navigate(`/sprints/${s.id}/attendance`)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = T.bg)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              color: T.accent,
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            {s.title}
                          </span>
                          <ChevronRight
                            size={12}
                            style={{ color: T.accent, opacity: 0.6 }}
                          />
                        </div>
                        <p style={{ color: T.muted, fontSize: 11, margin: 0 }}>
                          {s.cohort} · {s.room}
                        </p>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: T.sub,
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          {s.startDate} → {s.endDate}
                        </p>
                        <p style={{ margin: 0, color: T.muted }}>
                          {s.sprintStart && s.sprintEnd
                            ? `${s.sprintStart} – ${s.sprintEnd}`
                            : s.timeSlot}
                        </p>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 20,
                            border: `1px solid ${T.border}`,
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Attendance bars */}
          <div
            style={{
              background: T.card,
              border: `1.5px solid ${T.border}`,
              borderRadius: 16,
              padding: "20px",
              boxShadow: T.shadow,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: T.line,
              }}
            />
            <p
              style={{
                color: T.text,
                fontSize: 14,
                fontWeight: 700,
                margin: "0 0 4px",
              }}
            >
              Tech Stack Attendance
            </p>
            <p style={{ color: T.muted, fontSize: 12, margin: "0 0 20px" }}>
              Today&apos;s presence by group
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {stackStats.map((stat, i) => (
                <div key={stat.stack}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{ color: T.sub, fontSize: 13, fontWeight: 600 }}
                    >
                      {stat.stack}
                    </span>
                    <span
                      style={{ color: T.accent, fontSize: 12, fontWeight: 700 }}
                    >
                      {stat.pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 4,
                      background: T.bg2,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.pct}%` }}
                      transition={{
                        delay: 0.7 + i * 0.1,
                        duration: 0.7,
                        ease: "easeOut",
                      }}
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        background: BAR_COLORS[stat.stack] || T.accent,
                      }}
                    />
                  </div>
                  <p
                    style={{
                      color: T.muted,
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: "right",
                    }}
                  >
                    {stat.present} / {stat.total} present
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
