// src/components/RegisterForm.jsx
import { useState } from "react";

export default function RegisterForm({ onSubmit, loading = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    onSubmit({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1 font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label htmlFor="password" className="block mb-1 font-semibold">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block mb-1 font-semibold">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 rounded text-white transition ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      {/* Already have an account? */}
      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500 hover:underline">
          Login
        </a>
      </p>
    </form>
  );
}
