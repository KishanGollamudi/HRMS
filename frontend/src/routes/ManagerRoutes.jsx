import { Routes, Route, Navigate } from "react-router-dom";
import React, { lazy, Suspense, useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const SprintPage = lazy(() => import("../pages/SprintPage"));
const DailyAttendance = lazy(() => import("../components/attendance/DailyAttendance"));
const EmployeesPage = lazy(() => import("../pages/EmployeesPage"));
const HrBpPage = lazy(() => import("../pages/HrBpPage"));
const TrainersPage = lazy(() => import("../pages/TrainersPage"));

const ManagerRoutes = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== "manager") return <Navigate to="/" replace />;

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/dashboard"  element={<Layout><Dashboard /></Layout>} />
        <Route path="/sprints"    element={<Layout><SprintPage /></Layout>} />
        <Route path="/attendance" element={<Layout><DailyAttendance /></Layout>} />
        <Route path="/employees"  element={<Layout><EmployeesPage /></Layout>} />
        <Route path="/hrbp"       element={<Layout><HrBpPage /></Layout>} />
        <Route path="/trainers"   element={<Layout><TrainersPage /></Layout>} />
        <Route path="*" element={<Navigate to="/manager/dashboard" replace />} /> {/* Default for manager */}
      </Routes>
    </Suspense>
  );
};

export default ManagerRoutes;