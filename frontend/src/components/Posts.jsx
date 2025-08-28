import { useState } from "react";

export default function Posts() {
  const [posts, setPosts] = useState([
    { id: 1, content: "Welcome to our church app!" },
    { id: 2, content: "Don’t forget the choir practice this Saturday." },
  ]);
  const [newPost, setNewPost] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleAdd = () => {
    if (!newPost.trim()) return;
    setPosts([...posts, { id: Date.now(), content: newPost }]);
    setNewPost("");
  };

  const handleDelete = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleEdit = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleUpdate = () => {
    setPosts(posts.map((p) =>
      p.id === editingPost ? { ...p, content: editContent } : p
    ));
    setEditingPost(null);
    setEditContent("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Posts</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Write a post..."
          className="border p-2 flex-1 rounded"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Post
        </button>
      </div>

      <ul>
        {posts.map((post) => (
          <li
            key={post.id}
            className="border-b py-2 flex justify-between items-center"
          >
            {editingPost === post.id ? (
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  className="border p-2 flex-1 rounded"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingPost(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span>{post.content}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
