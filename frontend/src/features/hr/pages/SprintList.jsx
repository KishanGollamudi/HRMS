import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  Clock,
  SlidersHorizontal,
  Eye,
  Pencil,
  X,
  CheckCircle,
} from "lucide-react";
import { useSprints } from "@/context/SprintContext";
import { H, hInp, hLbl } from "@/theme/hr";
import PageBanner from "@/components/PageBanner";
import Pagination from "@/components/ui/Pagination";
import { ALL_COHORT_OPTIONS } from "@/constants/cohortLabels";
import { useAppData } from "@/context/AppDataContext";
import { shortCohort } from "@/lib/cohortUtils";

const PAGE_SIZE = 8;

const STATUS_MAP = {
  Scheduled: { color: H.accent, bg: H.accentBg, bd: H.accentBd },
  "On Hold": { color: H.amber, bg: H.amberBg, bd: H.amberBd },
  Completed: { color: H.green, bg: H.greenBg, bd: H.greenBd },
};

const STATUSES = ["Scheduled", "On Hold", "Completed"];

const nativeSel = {
  background: "#ffffff",
  border: `1.5px solid ${H.border}`,
  borderRadius: 10,
  color: H.text,
  padding: "9px 13px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  height: 40,
  cursor: "pointer",
};

const StatusPill = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.Scheduled;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.bd}`,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.color,
        }}
      />
      {status}
    </span>
  );
};

// View Modal
const ViewModal = ({ sprint, onClose }) => {
  if (!sprint) return null;
  const rows = [
    { label: "Title", value: sprint.title },
    { label: "Trainer", value: sprint.trainer || "—" },
    { label: "Start Date", value: sprint.startDate },
    { label: "End Date", value: sprint.endDate },
    {
      label: "Time",
      value:
        sprint.sprintStart && sprint.sprintEnd
          ? `${sprint.sprintStart} – ${sprint.sprintEnd}`
          : "—",
    },
    { label: "Room", value: sprint.room || "—" },
    { label: "Cohort", value: sprint.cohort || "—" },
    { label: "Status", value: sprint.status },
  ];
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        style={{
          background: H.card,
          border: `1.5px solid ${H.border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 460,
          boxShadow: H.shadowMd,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 4, background: H.gradient }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: `1px solid ${H.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: H.accentBg,
                border: `1.5px solid ${H.accentBd}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: H.accent,
              }}
            >
              {sprint.title.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p
                style={{
                  color: H.text,
                  fontWeight: 700,
                  fontSize: 15,
                  margin: 0,
                }}
              >
                {sprint.title}
              </p>
              <StatusPill status={sprint.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: H.muted,
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {rows
            .filter((r) => r.label !== "Title" && r.label !== "Status")
            .map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: H.muted, fontWeight: 600 }}>{label}</span>
                <span style={{ color: H.text, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          {sprint.instructions && (
            <div style={{ marginTop: 4 }}>
              <p
                style={{
                  color: H.muted,
                  fontWeight: 600,
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Instructions
              </p>
              <p
                style={{
                  color: H.sub,
                  fontSize: 13,
                  background: H.bg,
                  borderRadius: 8,
                  padding: "8px 12px",
                  border: `1px solid ${H.border}`,
                  margin: 0,
                }}
              >
                {sprint.instructions}
              </p>
            </div>
          )}
        </div>
        <div style={{ padding: "0 24px 20px" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 10,
              background: H.gradient,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Edit Modal
const EditModal = ({ sprint, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: sprint.title || "",
    trainer: sprint.trainer || "",
    startDate: sprint.startDate || "",
    endDate: sprint.endDate || "",
    room: sprint.room || "",
    cohort: sprint.cohort || "",
    status: sprint.status || "Scheduled",
    instructions: sprint.instructions || "",
  });

  const inp = { ...hInp, width: "100%", boxSizing: "border-box" };
  const { cohortNames } = useAppData();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        style={{
          background: H.card,
          border: `1.5px solid ${H.border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          boxShadow: H.shadowMd,
          overflow: "hidden",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ height: 4, background: H.gradient }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: `1px solid ${H.border}`,
          }}
        >
          <p
            style={{ color: H.text, fontWeight: 700, fontSize: 15, margin: 0 }}
          >
            Edit Sprint
          </p>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: H.muted,
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            {[
              { name: "title", label: "Sprint Title", type: "text" },
              { name: "trainer", label: "Trainer", type: "text" },
              { name: "startDate", label: "Start Date", type: "date" },
              { name: "endDate", label: "End Date", type: "date" },
              { name: "room", label: "Room", type: "text" },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label style={hLbl}>{label}</label>
                <input
                  type={type}
                  value={form[name]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [name]: e.target.value }))
                  }
                  style={inp}
                  onFocus={(e) => (e.target.style.borderColor = H.accent)}
                  onBlur={(e) => (e.target.style.borderColor = H.border)}
                />
              </div>
            ))}
            <div>
              <label style={hLbl}>Cohort</label>
              <select
                value={form.cohort}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cohort: e.target.value }))
                }
                style={nativeSel}
              >
                <option value="">Select cohort</option>
                {(cohortNames?.length ? cohortNames : ALL_COHORT_OPTIONS).map(
                  (c) => (
                    <option key={c} value={c} title={c}>
                      {shortCohort(c)}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          <div>
            <label style={hLbl}>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
              style={nativeSel}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={hLbl}>Instructions (optional)</label>
            <textarea
              value={form.instructions}
              onChange={(e) =>
                setForm((p) => ({ ...p, instructions: e.target.value }))
              }
              rows={3}
              style={{
                ...inp,
                resize: "vertical",
                minHeight: 80,
                padding: "10px 13px",
              }}
              onFocus={(e) => (e.target.style.borderColor = H.accent)}
              onBlur={(e) => (e.target.style.borderColor = H.border)}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "0 24px 20px" }}>
          <button
            onClick={() => onSave(form)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              background: H.gradient,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <CheckCircle size={14} /> Save Changes
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              background: "transparent",
              color: H.sub,
              fontWeight: 600,
              fontSize: 13,
              border: `1.5px solid ${H.border}`,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SprintList = () => {
  const { sprints, deleteSprint, updateSprint } = useSprints();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewSprint, setViewSprint] = useState(null);
  const [editSprint, setEditSprint] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = sprints.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.title?.toLowerCase().includes(q) ||
      s.trainer?.toLowerCase().includes(q) ||
      s.room?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (form) => {
    updateSprint(editSprint.id, form);
    setEditSprint(null);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };
  const handleFilter = (val) => {
    setFilterStatus(val);
    setPage(1);
  };

  const inpStyle = {
    background: "#ffffff",
    border: `1.5px solid ${H.border}`,
    borderRadius: 10,
    color: H.text,
    padding: "9px 13px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      style={{ background: H.bg, minHeight: "100vh", padding: "32px 28px" }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <PageBanner
          title="All Sprints"
          gradient={H.gradient}
          shadow="4px 0 24px rgba(212,87,105,0.30)"
          width="230px"
          right={
            <span
              style={{
                background: H.accentBg,
                color: H.accent,
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                border: `1px solid ${H.accentBd}`,
              }}
            >
              {sprints.length} total
            </span>
          }
        />
        <p style={{ color: H.sub, fontSize: 13, marginTop: -8 }}>
          Manage and track all sprint schedules.
        </p>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{ position: "relative", flex: "1 1 240px", maxWidth: 320 }}
          >
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: H.muted,
              }}
            />
            <input
              placeholder="Search title, trainer, room..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                ...inpStyle,
                width: "100%",
                paddingLeft: 36,
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = H.accent)}
              onBlur={(e) => (e.target.style.borderColor = H.border)}
            />
          </div>
          <div style={{ position: "relative" }}>
            <SlidersHorizontal
              size={13}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: H.muted,
                pointerEvents: "none",
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => handleFilter(e.target.value)}
              style={{
                ...inpStyle,
                paddingLeft: 32,
                height: 40,
                cursor: "pointer",
                background: "#ffffff",
                color: H.text,
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: H.card,
            border: `1.5px solid ${H.border}`,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: H.shadow,
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: `1.5px solid ${H.border}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 4,
                height: 18,
                background: H.accent,
                borderRadius: 2,
              }}
            />
            <p
              style={{
                color: H.text,
                fontSize: 14,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Sprint List
            </p>
            <span
              style={{
                background: H.accentBg,
                color: H.accent,
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                border: `1px solid ${H.accentBd}`,
              }}
            >
              {filtered.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 0",
                gap: 10,
              }}
            >
              <Search size={36} style={{ color: H.muted }} />
              <p style={{ color: H.sub, fontSize: 13 }}>
                No sprints found. Try adjusting your search.
              </p>
            </div>
          ) : (
            <div>
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
                      background: H.bg,
                      borderBottom: `1.5px solid ${H.border}`,
                    }}
                  >
                    {[
                      "Sprint",
                      "Trainer",
                      "Dates",
                      "Time",
                      "Room",
                      "Cohort",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "11px 16px",
                          color: H.muted,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginated.map((s, i) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          borderBottom: `1px solid ${H.border}`,
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = H.bg)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: H.accentBg,
                                border: `1.5px solid ${H.accentBd}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 800,
                                color: H.accent,
                                flexShrink: 0,
                              }}
                            >
                              {s.title.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ color: H.text, fontWeight: 600 }}>
                              {s.title}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            color: H.sub,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.trainer || "—"}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            color: H.sub,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.startDate}{" "}
                          <span style={{ color: H.muted }}>→</span> {s.endDate}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            color: H.sub,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Clock size={11} style={{ color: H.muted }} />
                            {s.sprintStart && s.sprintEnd
                              ? `${s.sprintStart} – ${s.sprintEnd}`
                              : "—"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            color: H.sub,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.room || "—"}
                        </td>
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <span
                            title={s.cohort}
                            style={{
                              background: H.bg,
                              color: H.sub,
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "3px 9px",
                              borderRadius: 8,
                              border: `1px solid ${H.border}`,
                            }}
                          >
                            {s.cohort ? shortCohort(s.cohort) : "—"}
                          </span>
                        </td>
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <StatusPill status={s.status} />
                        </td>
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <div style={{ display: "flex", gap: 5 }}>
                            <button
                              onClick={() => setViewSprint(s)}
                              style={{
                                height: 28,
                                paddingInline: 8,
                                borderRadius: 7,
                                background: H.accentBg,
                                border: `1px solid ${H.accentBd}`,
                                color: H.accent,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              onClick={() => setEditSprint(s)}
                              style={{
                                height: 28,
                                paddingInline: 8,
                                borderRadius: 7,
                                background: "rgba(59,130,246,0.08)",
                                border: "1px solid rgba(59,130,246,0.2)",
                                color: "#3b82f6",
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(s.id)}
                              style={{
                                height: 28,
                                width: 28,
                                borderRadius: 7,
                                background: "rgba(244,63,94,0.08)",
                                border: "1px solid rgba(244,63,94,0.2)",
                                color: H.red,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && (
            <div style={{ padding: "16px 0 20px" }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                theme={H}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {viewSprint && (
          <ViewModal sprint={viewSprint} onClose={() => setViewSprint(null)} />
        )}
        {editSprint && (
          <EditModal
            sprint={editSprint}
            onSave={handleSave}
            onClose={() => setEditSprint(null)}
          />
        )}
        {deleteId && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.6)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                background: H.card,
                border: `1.5px solid ${H.border}`,
                borderRadius: 16,
                padding: 28,
                width: "100%",
                maxWidth: 380,
                boxShadow: H.shadowMd,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(244,63,94,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={18} style={{ color: H.red }} />
                </div>
                <div>
                  <p style={{ color: H.text, fontWeight: 700, margin: 0 }}>
                    Delete Sprint
                  </p>
                  <p style={{ color: H.muted, fontSize: 11, margin: 0 }}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <p style={{ color: H.sub, fontSize: 13, marginBottom: 20 }}>
                Are you sure you want to delete{" "}
                <strong style={{ color: H.text }}>
                  {sprints.find((s) => s.id === deleteId)?.title}
                </strong>
                ?
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    deleteSprint(deleteId);
                    setDeleteId(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 8,
                    background: H.red,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 8,
                    background: "transparent",
                    color: H.sub,
                    fontWeight: 600,
                    fontSize: 13,
                    border: `1.5px solid ${H.border}`,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SprintList;
