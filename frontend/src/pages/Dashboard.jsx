import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import CrudList from "../components/CrudList";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const [selected, setSelected] = useState("posts");

  // --- Auth ---
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- Profile ---
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", emails: [""], picture: null });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- Data ---
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [voiceChats, setVoiceChats] = useState([]);

  // --- Users for voice chat ---
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");

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
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
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
    setToken(null);
    setProfile(null);
    setPosts([]);
    setMessages([]);
    setEvents([]);
    setVoiceChats([]);
    setUsers([]);
    setSelected("posts");
  };

  // ----------------- Fetch Data -----------------
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profiles/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setProfileForm({
          name: data.name || "",
          emails: data.emails || [""],
          picture: data.picture || null,
        });
        fetchAllData(); // fetch posts, messages, events, voiceChats, users
      }
    } catch (err) {
      console.error("Fetch Profile Error:", err);
    }
  };

  const fetchAllData = async () => {
    fetchPosts();
    fetchMessages();
    fetchEvents();
    fetchVoiceChats();
    fetchUsers();
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error("Fetch Posts Error:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/recipient`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      if (res.ok) setEvents(await res.json());
    } catch (err) {
      console.error("Fetch Events Error:", err);
    }
  };

  const fetchVoiceChats = async () => {
    try {
      const res = await fetch(`${API_URL}/voiceChats/mychats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setVoiceChats(await res.json());
    } catch (err) {
      console.error("Fetch VoiceChats Error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.filter((u) => u._id !== profile?._id));
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
    }
  };

  // ----------------- Profile Handlers -----------------
  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      setProfile(data);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Save Profile Error:", err);
    }
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 150;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
        else if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setProfileForm({ ...profileForm, picture: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddEmail = () => setProfileForm({ ...profileForm, emails: [...profileForm.emails, ""] });
  const handleEmailChange = (idx, val) => {
    const updated = [...profileForm.emails];
    updated[idx] = val;
    setProfileForm({ ...profileForm, emails: updated });
  };

  // ----------------- CRUD Handlers -----------------
  const handleCreatePost = async (content) => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: content, content }),
      });
      if (res.ok) setPosts([await res.json(), ...posts]);
    } catch (err) {
      console.error("Create Post Error:", err);
    }
  };

  const handleEditPost = async (id, content) => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: content, content }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts(posts.map((p) => (p._id === id ? updated : p)));
      }
    } catch (err) {
      console.error("Edit Post Error:", err);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await fetch(`${API_URL}/posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete Post Error:", err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: text, body: text, recipient: "recipient-user-id" }),
      });
      if (res.ok) setMessages([await res.json(), ...messages]);
    } catch (err) {
      console.error("Send Message Error:", err);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await fetch(`${API_URL}/messages/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setMessages(messages.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete Message Error:", err);
    }
  };

  const handleCreateEvent = async (title) => {
    if (!title.trim()) return;
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, date: new Date().toISOString().slice(0, 10) }),
      });
      if (res.ok) setEvents([await res.json(), ...events]);
    } catch (err) {
      console.error("Create Event Error:", err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await fetch(`${API_URL}/events/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Delete Event Error:", err);
    }
  };

  // ----------------- VoiceChat Handlers -----------------
  const handleStartVoiceChat = async (user_2, duration = 0) => {
    if (!user_2) return alert("Select a recipient first");
    try {
      const res = await fetch(`${API_URL}/voiceChats`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_2, duration }),
      });
      if (res.ok) setVoiceChats([await res.json(), ...voiceChats]);
      setSelectedRecipient("");
    } catch (err) {
      console.error("Start VoiceChat Error:", err);
    }
  };

  // ----------------- Voice Chat Duration Live Update -----------------
  useEffect(() => {
    const interval = setInterval(() => {
      setVoiceChats((chats) => chats.map((c) => ({ ...c, duration: (c.duration || 0) + 1 })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ----------------- Render -----------------
  const renderContent = () => {
    if (!token) {
      return (
        <DashboardCard title="Login">
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="w-full mb-2 p-2 border rounded"
          />
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="px-4 py-2 bg-green-600 text-white rounded w-full"
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </DashboardCard>
      );
    }

    switch (selected) {
      case "posts":
        return (
          <DashboardCard title="Posts">
            <CrudList
              items={posts}
              onCreate={handleCreatePost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              renderItem={(p) => (
                <div>
                  <strong>{p.user?.name}</strong>
                  <p>{p.content}</p>
                </div>
              )}
              placeholder="What's on your mind?"
              compact
            />
          </DashboardCard>
        );
      case "messages":
        return (
          <DashboardCard title="Messages">
            <CrudList
              items={messages}
              onCreate={handleSendMessage}
              onDelete={handleDeleteMessage}
              renderItem={(m) => (
                <span>
                  <strong>{m.sender?.name}:</strong> {m.body}
                </span>
              )}
              placeholder="Type your message..."
              compact
            />
          </DashboardCard>
        );
      case "events":
        return (
          <DashboardCard title="Events">
            <CrudList
              items={events}
              onCreate={handleCreateEvent}
              onDelete={handleDeleteEvent}
              renderItem={(e) => (
                <p>
                  {e.title} - {e.date}
                </p>
              )}
              placeholder="Add new event..."
              compact
            />
          </DashboardCard>
        );
      case "voiceChats":
        return (
          <DashboardCard title="Voice Chats">
            <div className="mb-2 flex gap-2">
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="flex-1 p-2 border rounded"
              >
                <option value="">Select recipient</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleStartVoiceChat(selectedRecipient)}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Start Chat
              </button>
            </div>
            <CrudList
              items={voiceChats}
              renderItem={(c) => (
                <p>
                  {c.user_1?.name} → {c.user_2?.name} | Duration: {c.duration}s
                </p>
              )}
              placeholder="Start new voice chat..."
              compact
            />
          </DashboardCard>
        );
      case "profile":
        return (
          <DashboardCard title="Profile">
            {isEditingProfile ? (
              <div>
                <label>Profile Picture</label>
                {profileForm.picture && (
                  <img src={profileForm.picture} alt="Preview" className="w-24 h-24 rounded-full mb-2 object-cover" />
                )}
                <input type="file" accept="image/*" onChange={handlePictureUpload} className="mb-2" />
                <label>Name</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full mb-2 p-2 border rounded"
                />
                <label>Emails</label>
                {profileForm.emails.map((email, idx) => (
                  <input
                    key={idx}
                    value={email}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    className="w-full mb-1 p-2 border rounded"
                  />
                ))}
                <button onClick={handleAddEmail} className="px-3 py-1 bg-blue-500 text-white rounded mb-2">
                  + Add Email
                </button>
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="px-4 py-2 bg-green-600 text-white rounded">
                    Save
                  </button>
                  <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 bg-gray-500 text-white rounded">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {profile?.picture && (
                  <img src={profile.picture} alt="Profile" className="w-24 h-24 rounded-full mb-3 object-cover" />
                )}
                <p>
                  <strong>Name:</strong> {profile?.name}
                </p>
                <p>
                  <strong>Emails:</strong>
                </p>
                <ul>{profile?.emails?.map((e, idx) => <li key={idx}>{e}</li>)}</ul>
                <button onClick={() => setIsEditingProfile(true)} className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded">
                  Edit Profile
                </button>
              </div>
            )}
          </DashboardCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        token={token}
        onLogout={handleLogout}
        onLogin={() => setSelected("login")}
      />
      <div className="flex-1 p-4 bg-gray-100">{renderContent()}</div>
    </div>
  );
}
