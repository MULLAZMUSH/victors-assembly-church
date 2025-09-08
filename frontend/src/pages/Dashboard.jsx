import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import CrudList from "../components/CrudList";

const API_URL = import.meta.env.VITE_API_URL || "https://victors-assembly-backend.onrender.com/api";

export default function Dashboard() {
  const [selected, setSelected] = useState("posts");

  // ----------------- Auth -----------------
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ----------------- Profile -----------------
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", emails: [""], picture: null });

  // ----------------- Data -----------------
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [voiceChats, setVoiceChats] = useState([]);
  const [users, setUsers] = useState([]);

  // ----------------- Helper: Fetch with Auto Refresh -----------------
  const fetchWithAuth = async (url, options = {}, retry = true) => {
    options.headers = options.headers || {};
    if (token) options.headers["Authorization"] = `Bearer ${token}`;

    let res = await fetch(url, options);

    if (res.status === 401 && retry) {
      const refreshedToken = await handleTokenRefresh();
      if (refreshedToken) {
        options.headers["Authorization"] = `Bearer ${refreshedToken}`;
        res = await fetch(url, options, false);
      }
    }

    return res;
  };

  // ----------------- Token Refresh -----------------
  const handleTokenRefresh = async () => {
    if (!refreshToken) {
      handleLogout();
      return null;
    }
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        return data.token;
      } else {
        handleLogout();
        return null;
      }
    } catch (err) {
      console.error("Token Refresh Error:", err);
      handleLogout();
      return null;
    }
  };

  // ----------------- Auth Handlers -----------------
  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) return alert("Email and password required");
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.token && data.refreshToken) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
