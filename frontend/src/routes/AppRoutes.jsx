import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import MainLayout from "@/layouts/MainLayout";
import Login from "@/pages/Login";
import { useAuth } from "@/context/AuthContext";

// Trainer
import Overview        from "@/features/sprint/pages/Overview";
import TrainerDashboard from "@/features/trainer/pages/TrainerDashboard";
import SprintList      from "@/features/sprint/pages/SprintList";
import SprintAttendance from "@/features/sprint/pages/SprintAttendance";
import CreateSprint    from "@/features/sprint/pages/CreateSprint";
import AttendanceList  from "@/features/trainer/pages/AttendanceList";

// HR (lazy)
const HrDashboard    = lazy(() => import("@/features/hr/pages/HrDashboard"));
const HrCreateSprint = lazy(() => import("@/features/hr/pages/CreateSprint"));
const HrSprintList   = lazy(() => import("@/features/hr/pages/SprintList"));
const HrCohortsPage  = lazy(() => import("@/features/hr/pages/HrCohortsPage"));

// Manager (lazy)
const ManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const EmployeesPage    = lazy(() => import("@/pages/EmployeesPage"));
const HrBpPage         = lazy(() => import("@/pages/HrBpPage"));
const TrainersPage     = lazy(() => import("@/pages/TrainersPage"));
const SprintPage       = lazy(() => import("@/pages/SprintPage"));
const ChatPage         = lazy(() => import("@/pages/ChatPage"));
const ProfilePage      = lazy(() => import("@/pages/ProfilePage"));

const roleHome = { trainer: "/", hr: "/hr", manager: "/manager" };

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // wait for session restore before deciding
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome[user.role] || "/"} replace />;
  return <MainLayout><Suspense fallback={null}>{children}</Suspense></MainLayout>;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role] || "/"} replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ── Trainer routes ── */}
        <Route path="/"                       element={<ProtectedRoute roles={["trainer"]}><TrainerDashboard /></ProtectedRoute>} />
        <Route path="/overview"               element={<ProtectedRoute roles={["trainer"]}><Overview /></ProtectedRoute>} />
        <Route path="/sprints"                element={<ProtectedRoute roles={["trainer"]}><SprintList /></ProtectedRoute>} />
        <Route path="/sprints/:id/attendance" element={<ProtectedRoute roles={["trainer"]}><SprintAttendance /></ProtectedRoute>} />
        <Route path="/create-sprint"          element={<ProtectedRoute roles={["trainer"]}><CreateSprint /></ProtectedRoute>} />
        <Route path="/trainer/attendance"     element={<ProtectedRoute roles={["trainer"]}><AttendanceList /></ProtectedRoute>} />

        {/* ── HR routes ── */}
        <Route path="/hr"               element={<ProtectedRoute roles={["hr"]}><HrDashboard /></ProtectedRoute>} />
        <Route path="/hr/create-sprint" element={<ProtectedRoute roles={["hr"]}><HrCreateSprint /></ProtectedRoute>} />
        <Route path="/hr/sprints"       element={<ProtectedRoute roles={["hr"]}><HrSprintList /></ProtectedRoute>} />
        <Route path="/hr/cohorts"       element={<ProtectedRoute roles={["hr"]}><HrCohortsPage /></ProtectedRoute>} />

        {/* ── Manager routes ── */}
        <Route path="/manager"            element={<ProtectedRoute roles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/employees"  element={<ProtectedRoute roles={["manager"]}><EmployeesPage /></ProtectedRoute>} />
        <Route path="/manager/hrbp"       element={<ProtectedRoute roles={["manager"]}><HrBpPage /></ProtectedRoute>} />
        <Route path="/manager/trainers"   element={<ProtectedRoute roles={["manager"]}><TrainersPage /></ProtectedRoute>} />
        <Route path="/manager/sprints"    element={<ProtectedRoute roles={["manager"]}><SprintPage /></ProtectedRoute>} />

        <Route path="*" element={<RoleRedirect />} />

        {/* Chat — accessible to all authenticated roles */}
        <Route path="/chat"        element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:email" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* Profile — accessible to all authenticated roles */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
