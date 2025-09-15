import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api"; // Ensure api.js is in src/utils

export default function Verify() {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying...");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        const message = res.data?.message || "Email verified!";
        setStatus(message);
        setIsVerified(message.toLowerCase().includes("verified"));
      } catch (err) {
        console.error("Verification error:", err);
        setStatus(
          err.response?.data?.error || "Verification failed. Please try again."
        );
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("Invalid verification token.");
      setLoading(false);
    }
  }, [token]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Email Verification</h2>
      <p>{loading ? "Verifying..." : status}</p>

      {!loading && isVerified && (
        <div style={{ marginTop: "1rem" }}>
          <Link to="/login">✅ Proceed to Login</Link>
        </div>
      )}
    </div>
  );
}
