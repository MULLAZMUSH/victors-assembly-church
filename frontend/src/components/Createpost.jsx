// src/components/CreatePost.jsx
import { useState } from "react";
import api from "../utils/api"; // centralized Axios instance

export default function CreatePost({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/messages", { title, content }); // adjust endpoint if needed
      // Call parent callback to update post list immediately
      onPostCreated(response.data);
      // Clear form fields
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error creating post:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded shadow">
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        disabled={loading}
      />

      <textarea
        placeholder="Write your post..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        disabled={loading}
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
