import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppData } from "@/context/AppDataContext";
import { ArrowLeft, Users, UserCheck, Clock, XCircle, Calendar, Search, Eye, X, Mail, Hash, Layers } from "lucide-react";

const STATUS_BADGE = {
  Present: "bg-emerald-100 text-emerald-600 border border-emerald-200",
  Late:    "bg-amber-100 text-amber-600 border border-amber-200",
  Absent:  "bg-red-100 text-red-600 border border-red-200",
};

const TECH_STYLE = {
  Java:       "bg-amber-100 text-amber-600 border border-amber-200",
  Python:     "bg-sky-100 text-sky-600 border border-sky-200",
  Devops:     "bg-violet-100 text-violet-600 border border-violet-200",
  DotNet:     "bg-indigo-100 text-indigo-600 border border-indigo-200",
  SalesForce: "bg-emerald-100 text-emerald-600 border border-emerald-200",
};

// Employee detail modal
const EmployeeModal = ({ emp, rec, onClose }) => {
  if (!emp) return null;
  const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const info = [
    { icon: Hash,   label: "Emp ID",     value: emp.empId      },
    { icon: Layers, label: "Cohort",     value: emp.cohort     },
    { icon: Layers, label: "Technology", value: emp.technology },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <p className="text-gray-900 font-semibold text-base">Employee Info</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Avatar + name */}
        <div className="flex flex-col items-center pt-6 pb-4 px-6 gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold">
            {initials}
          </div>
          <p className="text-gray-900 font-bold text-lg">{emp.name}</p>
          {rec && (
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_BADGE[rec.status]}`}>
              {rec.status} · {rec.date}
            </span>
          )}
          {!rec && <span className="text-xs text-gray-400 italic">No attendance recorded</span>}
        </div>
        {/* Details */}
        <div className="px-6 pb-5 space-y-3">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500 font-medium">
                <Icon className="h-3.5 w-3.5" /> {label}
              </span>
              <span className="text-gray-900 font-semibold">{value || "—"}</span>
            </div>
          ))}
          {rec?.time && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500 font-medium">
                <Clock className="h-3.5 w-3.5" /> Check-in Time
              </span>
              <span className="text-gray-900 font-semibold">{rec.time}</span>
            </div>
          )}
        </div>
        <div className="px-6 pb-5">
          <Button onClick={onClose} variant="ghost" className="w-full border border-gray-200 text-gray-500 hover:text-gray-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const SprintAttendance = ({ sprint, onBack }) => {
  const { employees, attendance } = useAppData();

  const [dateFilter, setDateFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch]             = useState("");
  const [viewEmp, setViewEmp]           = useState(null);

  const sprintEmployees = useMemo(() =>
    employees.filter((e) => e.technology.toLowerCase() === sprint.title.toLowerCase())
  , [employees, sprint]);

  const allRecords = useMemo(() => {
    const result = [];
    Object.entries(attendance).forEach(([date, records]) => {
      records.forEach((r) => {
        if (r.sprint === sprint.title) result.push({ ...r, date });
      });
    });
    return result;
  }, [attendance, sprint]);

  const availableDates = useMemo(() =>
    [...new Set(allRecords.map((r) => r.date))].sort().reverse()
  , [allRecords]);

  const summarySource = useMemo(() =>
    dateFilter ? allRecords.filter((r) => r.date === dateFilter) : allRecords
  , [allRecords, dateFilter]);

  const summary = useMemo(() => ({
    present:  summarySource.filter((r) => r.status === "Present").length,
    late:     summarySource.filter((r) => r.status === "Late").length,
    absent:   summarySource.filter((r) => r.status === "Absent").length,
    total:    sprintEmployees.length,
  }), [summarySource, sprintEmployees]);

  const employeeStatus = useMemo(() => {
    const source = dateFilter
      ? allRecords.filter((r) => r.date === dateFilter)
      : allRecords;
    const map = {};
    source.forEach((r) => {
      if (!map[r.empId] || new Date(r.date) > new Date(map[r.empId].date)) map[r.empId] = r;
    });
    return map;
  }, [allRecords, dateFilter]);

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase();
    return sprintEmployees.filter((emp) => {
      const rec = employeeStatus[emp.empId];
      const matchStatus = statusFilter === "All"
        ? true
        : statusFilter === "Not Marked"
          ? !rec
          : rec?.status === statusFilter;
      const matchSearch = !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.empId.toLowerCase().includes(q) ||
        emp.cohort.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [sprintEmployees, employeeStatus, statusFilter, search]);

  const viewEmpRec = viewEmp ? employeeStatus[viewEmp.empId] : null;

  return (
    <div className="bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Sprints
        </button>

        {/* Sprint Header */}
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{sprint.title}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              sprint.status === "Active"    ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
              : sprint.status === "Completed" ? "bg-indigo-100 text-indigo-600 border border-indigo-200"
              : "bg-amber-100 text-amber-600 border border-amber-200"
            }`}>{sprint.status}</span>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {sprint.startDate} → {sprint.endDate}
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Enrolled", value: summary.total,   icon: Users,     color: "text-indigo-600",  bg: "bg-indigo-50"  },
            { label: "Present",  value: summary.present, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Late",     value: summary.late,    icon: Clock,     color: "text-amber-600",   bg: "bg-amber-50"   },
            { label: "Absent",   value: summary.absent,  icon: XCircle,   color: "text-red-600",     bg: "bg-red-50"     },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Attendance Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-base font-semibold">Attendance Records</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {filteredEmployees.length} of {sprintEmployees.length} employee{sprintEmployees.length !== 1 ? "s" : ""} · {sprint.title}
                  </p>
                </div>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Search name, ID, cohort..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-sm w-44 bg-white border-gray-300"
                  />
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  min={availableDates.length ? availableDates[availableDates.length - 1] : undefined}
                  max={availableDates.length ? availableDates[0] : undefined}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400"
                >
                  {["All", "Present", "Late", "Absent", "Not Marked"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {(dateFilter || statusFilter !== "All" || search) && (
                  <button
                    onClick={() => { setDateFilter(""); setStatusFilter("All"); setSearch(""); }}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    Clear ×
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {sprintEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Users className="h-10 w-10 text-gray-400" />
                <p className="text-gray-500 text-sm text-center">
                  No employees enrolled in <span className="font-medium text-gray-900">{sprint.title}</span> yet.
                  <br />
                  <span className="text-gray-400 text-xs">Add employees with technology "{sprint.title}" in the Employees page.</span>
                </p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Search className="h-10 w-10 text-gray-400" />
                <p className="text-gray-500 text-sm">No records match your filters.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    {["#", "Employee", "Emp ID", "Cohort", "Technology", "Latest Status", "Date", "Actions"].map((h) => (
                      <TableHead key={h} className="text-gray-500">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp, i) => {
                    const rec = employeeStatus[emp.empId];
                    return (
                      <TableRow key={emp.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                        <TableCell className="text-gray-400">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                              {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-gray-900 font-medium">{emp.name}</span>
                          </div>
                        </TableCell>
                        <TableCell><span className="font-mono text-sm text-gray-600">{emp.empId}</span></TableCell>
                        <TableCell>
                          <span className="rounded-md bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-600 font-medium">{emp.cohort}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TECH_STYLE[emp.technology] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                            {emp.technology}
                          </span>
                        </TableCell>
                        <TableCell>
                          {rec
                            ? <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[rec.status]}`}>{rec.status}</span>
                            : <span className="text-xs text-gray-400 italic">Not marked</span>}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{rec?.date ?? "—"}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewEmp(emp)}
                            className="h-7 px-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 border border-indigo-200"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Employee Info Modal */}
      <EmployeeModal emp={viewEmp} rec={viewEmpRec} onClose={() => setViewEmp(null)} />
    </div>
  );
};

export default SprintAttendance;
