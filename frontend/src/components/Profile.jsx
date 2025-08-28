import { useState, useEffect } from "react";
import api from "../utils/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/profiles/me");
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-xl font-bold mb-2">{profile.name}</h3>
      <p>Email: {profile.email}</p>
      <p>Bio: {profile.bio || "N/A"}</p>
    </div>
  );
}
