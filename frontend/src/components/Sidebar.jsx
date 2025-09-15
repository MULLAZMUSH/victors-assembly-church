// src/components/Sidebar.jsx
import React from "react";
import { FaMicrophone } from "react-icons/fa"; // ✅ correct import

const tabs = [
  { key: "posts", label: "Posts" },
  { key: "messages", label: "Messages" },
  { key: "events", label: "Events" },
  { key: "voiceChats", label: "Voice Chats", icon: <FaMicrophone /> },
  { key: "profile", label: "Profile" },
];

export default function Sidebar({ selected, setSelected, token, onLogout, onLogin }) {
  return (
    <div className="w-48 bg-white shadow-md p-4 flex flex-col h-screen overflow-y-auto">
      {/* --- Top Buttons: Login / Logout --- */}
      <div className="flex justify-between mb-4">
        {token ? (
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        ) : (
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={onLogin}
              className="flex-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setSelected("register")}
              className="flex-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Register
            </button>
          </div>
        )}
      </div>

      {/* --- Navigation Tabs --- */}
      {token && (
        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-4">Dashboard</h2>
          <nav className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelected(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 ${
                  selected === tab.key
                    ? tab.key === "voiceChats"
                      ? "bg-purple-500 text-white font-semibold"
                      : "bg-blue-500 text-white font-semibold"
                    : "text-gray-700"
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
