// src/api.js
import axios from "axios";
import toast from "react-hot-toast"; // or your preferred toast lib

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // for cookie-based auth if needed
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle unauthorized: try refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.token;
        localStorage.setItem("token", newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest); // retry original request
      } catch (refreshError) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Network or CORS error
    if (error.message === "Network Error" || !error.response) {
      toast.error("Network issue. Please check your connection.");
    }

    // Other errors
    if (status >= 400 && status < 500) {
      toast.error(error.response?.data?.message || "Request failed.");
    }

    return Promise.reject(error);
  }
);

export default api;
