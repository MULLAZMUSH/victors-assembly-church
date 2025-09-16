// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";

// Dashboard sections (optional nested routes)
import Posts from "./components/Posts";
import Profile from "./components/Profile";
import Events from "./components/Events";

// Auth
import Login from "./components/Login";
import Register from "./components/Register";
import Verify from "./components/Verify";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ---------- Root Redirect ---------- */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ---------- Public Routes ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ---------- Protected Dashboard ---------- */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Optional nested routes */}
          <Route path="posts" element={<Posts />} />
          <Route path="profile" element={<Profile />} />
          <Route path="events" element={<Events />} />
        </Route>

        {/* ---------- Catch-all ---------- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
