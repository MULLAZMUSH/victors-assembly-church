// src/pages/ForgotPassword.jsx
import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState(""); // 👈 store reset link
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResetLink("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "✅ Reset link sent to your email.");

      // 👇 in test mode, backend returns resetLink
      if (res.data.resetLink) {
        setResetLink(res.data.resetLink);
      }

      // Optional: redirect after a few seconds if you want
      // setTimeout(() => navigate("/login"), 5000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "❌ Something went wrong.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full p-6 bg-white rounded shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

        {message && (
          <p
            className={`text-center mb-4 ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* 👇 Show reset link in test mode */}
        {resetLink && (
          <div className="bg-gray-100 p-3 rounded text-sm mb-4">
            <p className="font-semibold text-gray-700">Test Reset Link:</p>
            <a
              href={resetLink}
              className="text-blue-600 hover:underline break-words"
            >
              {resetLink}
            </a>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded text-white transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="text-center mt-4">
          <a href="/login" className="text-blue-500 hover:underline">
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
}
