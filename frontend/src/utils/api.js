import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ───── Request Interceptor ─────
// Attach JWT token from localStorage if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ───── Response Interceptor ─────
// Handles token refresh automatically if access token expires
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If 401 (Unauthorized) and we haven't retried yet
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          // Request new token from backend
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`,
            { refreshToken }
          );

          // Save new token
          localStorage.setItem("token", data.token);

          // Update default headers for next requests
          api.defaults.headers.Authorization = `Bearer ${data.token}`;

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error("🔴 Refresh token failed:", refreshError);

          // Cleanup and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(err);
  }
);

// ───── New helper function to test backend ─────
export async function fetchTest() {
  const res = await api.get("/auth/test-auth");
  return res.data;
}

export default api;
