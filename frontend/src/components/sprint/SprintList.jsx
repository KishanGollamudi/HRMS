import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppData } from "@/context/AppDataContext";
import { Search, PlusCircle, Pencil, Trash2, CheckCircle, XCircle, Calendar, Eye } from "lucide-react";
import { t } from "@/lib/i18n";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 8;

const STATUS_STYLE = {
  Active:    "bg-emerald-100 text-emerald-600 border border-emerald-200",
  Completed: "bg-indigo-100 text-indigo-600 border border-indigo-200",
  "On Hold": "bg-amber-100 text-amber-600 border border-amber-200",
};

const TECHNOLOGIES = ["Java", "Python", "Devops", "DotNet", "SalesForce"];

const EMPTY_FORM = { title: "", startDate: "", endDate: "", status: "Active" };
const EMPTY_ERRS = { title: "", startDate: "", endDate: "" };

const FieldError = ({ msg }) =>
  msg ? <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3" />{msg}</p> : null;

const Toast = ({ toast }) =>
  toast ? (
    <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
      toast.type === "success"
        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
        : "bg-red-50 text-red-600 border border-red-200"
    }`}>
      {toast.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
      {toast.message}
    </div>
  ) : null;

const SprintList = ({ onSelectSprint }) => {
  const { sprints, addSprint, updateSprint, deleteSprint } = useAppData();

  const [form, setForm]             = useState(EMPTY_FORM);
  const [errs, setErrs]             = useState(EMPTY_ERRS);
  const [editId, setEditId]         = useState(null);
  const [search, setSearch]         = useState("");
  const [techFilter, setTechFilter] = useState("All");
  const [deleteId, setDeleteId]     = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [toast, setToast]           = useState(null);
  const [page, setPage]             = useState(1);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = (name, value) => {
    if (name === "title")     return !value.trim() ? "Sprint title is required." : "";
    if (name === "startDate") return !value ? "Start date is required." : "";
    if (name === "endDate")   return !value ? "End date is required." : "";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrs((p) => ({ ...p, [name]: validate(name, value) }));
  };

  const validateAll = () => {
    const newErrs = Object.fromEntries(Object.keys(EMPTY_ERRS).map((k) => [k, validate(k, form[k])]));
    setErrs(newErrs);
    return Object.values(newErrs).every((e) => e === "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    if (editId) {
      updateSprint(editId, form);
      showToast("success", "Sprint updated successfully.");
    } else {
      addSprint(form);
      showToast("success", "Sprint created successfully.");
    }
    setForm(EMPTY_FORM); setErrs(EMPTY_ERRS); setEditId(null); setShowForm(false);
  };

  const handleEdit = (s) => {
    setForm({ title: s.title, startDate: s.startDate, endDate: s.endDate, status: s.status });
    setErrs(EMPTY_ERRS); setEditId(s.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = () => {
    deleteSprint(deleteId);
    setDeleteId(null);
    showToast("success", "Sprint removed successfully.");
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM); setErrs(EMPTY_ERRS); setEditId(null); setShowForm(false);
  };

  const filtered = useMemo(() =>
    sprints.filter((s) => {
      const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.status.toLowerCase().includes(search.toLowerCase());
      const matchTech = techFilter === "All" || s.title === techFilter;
      return matchSearch && matchTech;
    })
  , [sprints, search, techFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const handleSearchChange = (val) => { setSearch(val); setPage(1); };
  const handleTechChange   = (val) => { setTechFilter(val); setPage(1); };

  return (
    <div className="bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Sprints</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all sprints and view attendance per sprint.</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white mt-3 sm:mt-0">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Sprint
            </Button>
          )}
        </header>

        {toast && <Toast toast={toast} />}

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total",     value: sprints.length,                                        color: "text-indigo-600",  bg: "bg-indigo-50"  },
            { label: "Active",    value: sprints.filter((s) => s.status === "Active").length,    color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Completed", value: sprints.filter((s) => s.status === "Completed").length, color: "text-gray-600",    bg: "bg-gray-100"   },
          ].map(({ label, value, color, bg }) => (
            <Card key={label} className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  <Calendar className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <PlusCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-base font-semibold">
                    {editId ? "Edit Sprint" : "Add New Sprint"}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editId ? "Update sprint details below." : "Fill in the details to create a new sprint."}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('label.sprintTitle')}</label>
                    <select name="title" value={form.title} onChange={handleChange}
                      className={`h-9 w-full rounded-lg border bg-white px-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400 ${errs.title ? "border-red-400" : "border-gray-200"}`}>
                      <option value="">Select technology</option>
                      {TECHNOLOGIES.map((tech) => <option key={tech} value={tech}>{tech}</option>)}
                    </select>
                    <FieldError msg={errs.title} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('label.startDate')}</label>
                    <Input name="startDate" type="date" value={form.startDate} onChange={handleChange}
                      className={`bg-white text-gray-900 ${errs.startDate ? "border-red-400" : "border-gray-200"}`} />
                    <FieldError msg={errs.startDate} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('label.endDate')}</label>
                    <Input name="endDate" type="date" value={form.endDate} onChange={handleChange}
                      className={`bg-white text-gray-900 ${errs.endDate ? "border-red-400" : "border-gray-200"}`} />
                    <FieldError msg={errs.endDate} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('label.status')}</label>
                    <select name="status" value={form.status} onChange={handleChange}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400">
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {editId ? <><Pencil className="h-4 w-4 mr-2" />Save Changes</> : <><PlusCircle className="h-4 w-4 mr-2" />Add Sprint</>}
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleCancel} className="text-gray-500 hover:text-gray-900">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sprint Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-base font-semibold">All Sprints</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">{filtered.length} sprint{filtered.length !== 1 ? "s" : ""} found</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative w-full sm:w-52">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input placeholder="Search title or status..." value={search} onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-8 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-8 text-sm" />
                </div>
                <select
                  value={techFilter}
                  onChange={(e) => handleTechChange(e.target.value)}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400"
                >
                  <option value="All">All Technologies</option>
                  {TECHNOLOGIES.map((tech) => <option key={tech} value={tech}>{tech}</option>)}
                </select>
                {(search || techFilter !== "All") && (
                  <button onClick={() => { setSearch(""); setTechFilter("All"); setPage(1); }}
                    className="text-xs text-indigo-600 font-semibold hover:underline">
                    Clear ×
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Calendar className="h-10 w-10 text-gray-400" />
                <p className="text-gray-500 text-sm">
                  {sprints.length === 0 ? "No sprints yet. Click \"Add Sprint\" to get started." : "No sprints match your search."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    {[t('th.hash'), t('th.title'), t('th.startDate'), t('th.endDate'), t('th.status'), t('th.actions')].map((h) => (
                      <TableHead key={h} className="text-gray-500">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((s, i) => (
                    <TableRow key={s.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                      <TableCell className="text-gray-400">{i + 1}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{s.title}</TableCell>
                      <TableCell className="text-gray-600">{s.startDate}</TableCell>
                      <TableCell className="text-gray-600">{s.endDate}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s.status] ?? STATUS_STYLE.Active}`}>
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => onSelectSprint(s)}
                            className="h-7 px-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 border border-indigo-200">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}
                            className="h-7 w-7 p-0 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(s.id)}
                            className="h-7 w-7 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {filtered.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
          </CardContent>
        </Card>

        {/* Delete Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <Card className="w-full max-w-sm bg-white border border-gray-200 shadow-lg">
              <CardContent className="pt-6 pb-6 px-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">Remove Sprint</p>
                    <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-gray-900">
                    {sprints.find((s) => s.id === deleteId)?.title}
                  </span>?
                </p>
                <div className="flex gap-3 pt-1">
                  <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white">Yes, Remove</Button>
                  <Button variant="ghost" onClick={() => setDeleteId(null)}
                    className="flex-1 text-gray-500 hover:text-gray-900 border border-gray-200">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default SprintList;
