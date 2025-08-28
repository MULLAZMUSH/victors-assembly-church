// src/components/LoginForm.jsx
import { useState } from "react";

export default function LoginForm({ onSubmit, loading = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // reset previous errors

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    onSubmit({ email, password, remember });
  };

  return (
    <form
      className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      {error && (
        <p className="text-red-500 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block mb-1 font-semibold text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your email"
          autoComplete="email"
          required
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label
          htmlFor="password"
          className="block mb-1 font-semibold text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between mb-6">
        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="form-checkbox h-4 w-4"
          />
          Remember Me
        </label>
        <a
          href="/forgot-password"
          className="text-blue-500 hover:underline text-sm"
        >
          Forgot Password?
        </a>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 rounded text-white font-medium transition ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
