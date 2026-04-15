import { Routes, Route, Navigate } from "react-router-dom";
import React, { lazy, Suspense, useContext } from "react";
import MainLayout from "@/layouts/MainLayout";
import { AuthContext } from "@/context/AuthContext";

const HrDashboard = lazy(() => import("@/features/hr/pages/HrDashboard"));
const CreateSprint = lazy(() => import("@/features/hr/pages/CreateSprint"));
const SprintList = lazy(() => import("@/features/hr/pages/SprintList"));
const HrCohortsPage = lazy(() => import("@/features/hr/pages/HrCohortsPage"));

const HrRoutes = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== "hr") return <Navigate to="/" replace />;

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<MainLayout><HrDashboard /></MainLayout>} />
        <Route path="/create-sprint" element={<MainLayout><CreateSprint /></MainLayout>} />
        <Route path="/sprints" element={<MainLayout><SprintList /></MainLayout>} />
        <Route path="/cohorts" element={<MainLayout><HrCohortsPage /></MainLayout>} />
      </Routes>
    </Suspense>
  );
};

export default HrRoutes;
