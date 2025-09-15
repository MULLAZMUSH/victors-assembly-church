// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import api from "../utils/api";

/**
 * Protects routes from unauthorized access.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if authorized
 */
export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) return <Navigate to="/login" replace />;

  // Optional: set default Authorization header if missing
  if (!api.defaults.headers.common["Authorization"]) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // TODO: Optional - Add token expiry validation here if JWT has exp claim
  // const payload = JSON.parse(atob(token.split('.')[1]));
  // if (payload.exp * 1000 < Date.now()) {
  //   localStorage.removeItem("token");
  //   return <Navigate to="/login" replace />;
  // }

  return children;
}
