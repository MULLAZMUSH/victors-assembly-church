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
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ----------------- Data -----------------
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [voiceChats, setVoiceChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");

  // ----------------- Helper: Fetch with Auto Refresh -----------------
  const fetchWithAuth = async (url, options = {}, retry = true) => {
    options.headers = options.headers || {};
    if (token) options.headers["Authorization"] = `Bearer ${token}`;

    let res = await fetch(url, options);

    // Auto-refresh token if 401
    if (res.status === 401 && retry) {
      const refreshed = await handleTokenRefresh();
      if (refreshed) {
        options.headers["Authorization"] = `Bearer ${refreshed}`;
        res = await fetch(url, options);
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
        setToken(data.token);
        setRefreshToken(data.refreshToken);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setRefreshToken(null);
    setProfile(null);
    setPosts([]);
    setMessages([]);
    setEvents([]);
    setVoiceChats([]);
    setUsers([]);
    setSelected("posts");
  };

  // ----------------- Fetch Profile -----------------
  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/profiles/me`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      setProfileForm({
        name: data.name || "",
        emails: data.emails || [""],
        picture: data.picture || null,
      });
      fetchAllData(data._id);
    } catch (err) {
      console.error("Fetch Profile Error:", err);
      handleLogout();
    }
  };

  // ----------------- Fetch All Data -----------------
  const fetchAllData = (profileId) => {
    fetchPosts();
    fetchMessages(profileId);
    fetchEvents();
    fetchVoiceChats(profileId);
    fetchUsers(profileId);
  };

  const fetchPosts = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/posts`);
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error("Fetch Posts Error:", err);
    }
  };

  const fetchMessages = async (profileId) => {
    if (!profileId) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/messages/recipient`);
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/events`);
      if (res.ok) setEvents(await res.json());
    } catch (err) {
      console.error("Fetch Events Error:", err);
    }
  };

  const fetchVoiceChats = async (profileId) => {
    if (!profileId) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/voiceChats/mychats`);
      if (res.ok) setVoiceChats(await res.json());
    } catch (err) {
      console.error("Fetch VoiceChats Error:", err);
    }
  };

  const fetchUsers = async (profileId) => {
    if (!profileId) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.filter((u) => u._id !== profileId));
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
    }
  };

  // ----------------- Return JSX -----------------
  return (
    <div className="flex min-h-screen">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        token={token}
        onLogout={handleLogout}
        onLogin={() => setSelected("login")}
      />
      <div className="flex-1 p-4 bg-gray-100">
        {/* You can render content based on selected tab */}
        {selected === "posts" && <CrudList items={posts} />}
        {selected === "messages" && <CrudList items={messages} />}
        {selected === "events" && <CrudList items={events} />}
        {selected === "voiceChats" && <CrudList items={voiceChats} />}
        {selected === "profile" && profile && <DashboardCard profile={profile} />}
        {selected === "login" && (
          <div>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
