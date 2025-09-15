// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import CrudList from "../components/CrudList";
import api from "../utils/api"; // Ensure api.js is in src/utils

export default function Dashboard() {
  const [selected, setSelected] = useState("posts");
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // --- Profile ---
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", emails: [""], picture: null });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- Posts, Messages, Events ---
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);

  // ----------------- API Fetchers -----------------
  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchPosts();
    fetchMessages();
    fetchEvents();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      setProfile(res.data);
      setProfileForm({
        name: res.data.user?.name || "",
        emails: res.data.emails || [""],
        picture: res.data.picture || null,
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get("/messages");
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Fetch events error:", err);
    }
  };

  // ----------------- Profile Handlers -----------------
  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      profileForm.emails.forEach((email, idx) => formData.append(`emails[${idx}]`, email));
      if (profileForm.picture instanceof File) {
        formData.append("picture", profileForm.picture);
      }

      const res = await api.post("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Save profile error:", err);
    }
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileForm({ ...profileForm, picture: file });
  };

  const handleAddEmail = () => setProfileForm({ ...profileForm, emails: [...profileForm.emails, ""] });
  const handleEmailChange = (idx, val) => {
    const updated = [...profileForm.emails];
    updated[idx] = val;
    setProfileForm({ ...profileForm, emails: updated });
  };

  // ----------------- Posts Handlers -----------------
  const handleCreatePost = async (content) => {
    try {
      const res = await api.post("/posts", { title: content, content });
      setPosts([res.data, ...posts]);
    } catch (err) {
      console.error("Create post error:", err);
    }
  };

  const handleEditPost = async (id, content) => {
    try {
      const res = await api.put(`/posts/${id}`, { title: content, content });
      setPosts(posts.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error("Edit post error:", err);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  // ----------------- Messages Handlers -----------------
  const handleSendMessage = async (text, recipient) => {
    try {
      const res = await api.post("/messages", {
        title: text,
        body: text,
        sender: profile?.user?._id || "anon",
        recipient: recipient || "anon",
      });
      setMessages([res.data, ...messages]);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
      setMessages(messages.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  // ----------------- Events Handlers -----------------
  const handleCreateEvent = async (title) => {
    try {
      const res = await api.post("/events", { title, date: new Date().toISOString().slice(0, 10) });
      setEvents([res.data, ...events]);
    } catch (err) {
      console.error("Create event error:", err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Delete event error:", err);
    }
  };

  // ----------------- Auth Handlers -----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const handleLogin = () => setSelected("login");

  // ----------------- Render -----------------
  const renderContent = () => {
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
                  <strong>{m.sender?.name || "Anon"}:</strong> {m.body}
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
      case "profile":
        return (
          <DashboardCard title="Profile">
            {isEditingProfile ? (
              <div>
                <label>Profile Picture</label>
                {profileForm.picture && typeof profileForm.picture === "string" && (
                  <img
                    src={profileForm.picture}
                    alt="Preview"
                    className="w-24 h-24 rounded-full mb-2 object-cover"
                  />
                )}
                <input type="file" accept="image/*" onChange={handlePictureUpload} />
                <label>Name</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
                <label>Emails</label>
                {profileForm.emails.map((email, idx) => (
                  <input key={idx} value={email} onChange={(e) => handleEmailChange(idx, e.target.value)} />
                ))}
                <button onClick={handleAddEmail}>+ Add Email</button>
                <button onClick={handleSaveProfile}>Save</button>
                <button onClick={() => setIsEditingProfile(false)}>Cancel</button>
              </div>
            ) : (
              <div>
                {profile?.picture && (
                  <img
                    src={profile.picture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mb-3 object-cover"
                  />
                )}
                <p>
                  <strong>Name:</strong> {profile?.user?.name}
                </p>
                <p>
                  <strong>Emails:</strong>
                </p>
                <ul>{profile?.emails?.map((e, idx) => <li key={idx}>{e}</li>)}</ul>
                <button onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
              </div>
            )}
          </DashboardCard>
        );
      default:
        return <p>Select a section</p>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        token={token}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />
      <div className="flex-1 p-4 bg-gray-100">{renderContent()}</div>
    </div>
  );
}
