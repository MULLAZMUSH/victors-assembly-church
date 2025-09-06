import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach JWT token from localStorage if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ───── New helper function to test backend ─────
export async function fetchTest() {
  const res = await api.get("/auth/test-auth");
  return res.data;
}

export default api;
