import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ correct import

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow mock token for testing
  if (token === "MOCK_TOKEN_FOR_TESTING") {
    return children;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      alert("Session expired. Please log in again.");
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error("Invalid token in ProtectedRoute:", err);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
