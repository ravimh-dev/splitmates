import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import SidebarLayout from "../layouts/SidebarLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Groups from "../pages/Groups";
import GroupDetails from "../pages/GroupDetails";
import Settlements from "../pages/Settlements";
import Profile from "../pages/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <SidebarLayout>
              <Dashboard />
            </SidebarLayout>
          }
        />
        <Route
          path="/groups"
          element={
            <SidebarLayout>
              <Groups />
            </SidebarLayout>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <SidebarLayout>
              <GroupDetails />
            </SidebarLayout>
          }
        />
        <Route
          path="/settlements"
          element={
            <SidebarLayout>
              <Settlements />
            </SidebarLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <SidebarLayout>
              <Profile />
            </SidebarLayout>
          }
        />
      </Route>

      {/* Fallback Redirects */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
