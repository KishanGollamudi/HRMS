/**
 * Lightweight i18n helper for SprintFlow.
 * Resolves the "JSX label not internationalized" scanner findings.
 * Extend this file when adding new UI strings.
 */

const en = {
  // ── Common ──────────────────────────────────────────────────────
  "label.fullName":        "Full Name",
  "label.email":           "Email Address",
  "label.phone":           "Phone Number",
  "label.phoneOptional":   "Phone Number (optional)",
  "label.department":      "Department",
  "label.status":          "Status",
  "label.joiningDate":     "Joining Date",
  "label.role":            "Role",
  "label.date":            "Date",
  "label.cohort":          "Cohort",
  "label.cohortOptional":  "Cohort (optional)",
  "label.technology":      "Technology",
  "label.sprintTitle":     "Sprint Title",
  "label.startDate":       "Start Date",
  "label.endDate":         "End Date",
  "label.attendanceDate":  "Attendance Date",
  "label.selectTrainer":   "Select Trainer",

  // ── Placeholders ────────────────────────────────────────────────
  "placeholder.selectTechnology": "Select technology",
  "placeholder.selectDept":       "Select department",
  "placeholder.selectRole":       "Select role",
  "placeholder.selectName":       "Select your name",
  "placeholder.allCohorts":       "All Cohorts",

  // ── Status options ──────────────────────────────────────────────
  "status.active":    "Active",
  "status.inactive":  "Inactive",
  "status.onHold":    "On Hold",
  "status.completed": "Completed",

  // ── Table headers ───────────────────────────────────────────────
  "th.hash":        "#",
  "th.name":        "Name",
  "th.empId":       "Emp ID",
  "th.cohort":      "Cohort",
  "th.technology":  "Technology",
  "th.actions":     "Actions",
  "th.role":        "Role",
  "th.email":       "Email",
  "th.phone":       "Phone",
  "th.department":  "Department",
  "th.joined":      "Joined",
  "th.status":      "Status",
  "th.title":       "Title",
  "th.startDate":   "Start Date",
  "th.endDate":     "End Date",
  "th.employee":    "Employee",
  "th.markAttendance": "Mark Attendance",
  "th.time":        "Time",
  "th.id":          "ID",
  "th.techStack":   "Tech Stack",
};

/** Translate a key. Falls back to the key itself if not found. */
export const t = (key) => en[key] ?? key;

export default t;
