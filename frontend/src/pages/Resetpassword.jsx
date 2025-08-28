// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Password rules
  const [rules, setRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const handlePasswordChange = (pwd) => {
    setPassword(pwd);
    setRules({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&]/.test(pwd),
    });
  };

  const isStrong = Object.values(rules).every(Boolean);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirm) {
      return setMessage("❌ Passwords do not match.");
    }

    if (!isStrong) {
      return setMessage("❌ Password does not meet all requirements.");
    }

    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message || "✅ Password reset successful.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || "❌ Reset failed.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleReset}
        className="max-w-md w-full p-6 bg-white rounded shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        {message && (
          <p
            className={`text-center mb-4 ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* New Password */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">New Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
          />

          {/* Live checklist */}
          <ul className="mt-2 text-sm space-y-1">
            <li className={rules.length ? "text-green-600" : "text-red-500"}>
              {rules.length ? "✅" : "❌"} At least 8 characters
            </li>
            <li className={rules.upper ? "text-green-600" : "text-red-500"}>
              {rules.upper ? "✅" : "❌"} At least 1 uppercase letter
            </li>
            <li className={rules.lower ? "text-green-600" : "text-red-500"}>
              {rules.lower ? "✅" : "❌"} At least 1 lowercase letter
            </li>
            <li className={rules.number ? "text-green-600" : "text-red-500"}>
              {rules.number ? "✅" : "❌"} At least 1 number
            </li>
            <li className={rules.special ? "text-green-600" : "text-red-500"}>
              {rules.special ? "✅" : "❌"} At least 1 special character (@$!%*?&)
            </li>
          </ul>
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded text-white transition ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
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
