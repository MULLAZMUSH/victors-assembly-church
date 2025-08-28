// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import api from "../utils/api"; // centralized axios instance

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifyLink, setVerifyLink] = useState(""); // test-mode link
  const [message, setMessage] = useState("");

  const handleRegister = async ({ name, email, password }) => {
    setLoading(true);
    setVerifyLink("");
    setMessage("");

    try {
      const res = await api.post("/auth/register", { name, email, password });

      if (res.data.verifyLink) {
        setVerifyLink(res.data.verifyLink);
        setMessage("Registration successful! Use the test verification link below.");
      } else {
        setMessage("Registration successful! Please check your email to verify.");
      }

    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;
      setMessage(`Registration failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <RegisterForm onSubmit={handleRegister} loading={loading} />

      {message && (
        <p
          className={`mt-4 max-w-md text-center ${
            message.includes("successful") ? "text-green-700" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {verifyLink && (
        <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 max-w-md w-full rounded break-words">
          <p className="font-semibold mb-2">🔗 Test Mode Verification Link:</p>
          <a
            href={verifyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 break-all"
          >
            {verifyLink}
          </a>
          <p className="mt-2 text-sm text-gray-600">
            Click the link above to verify your email immediately.
          </p>
        </div>
      )}
    </div>
  );
}
