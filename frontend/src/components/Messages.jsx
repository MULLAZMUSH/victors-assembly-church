import { useState } from "react";

export default function Messages() {
  const [messages, setMessages] = useState([
    { id: 1, content: "Hello, how are you?" },
    { id: 2, content: "I’ll be attending the evening service." },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleAdd = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), content: newMessage }]);
    setNewMessage("");
  };

  const handleDelete = (id) => {
    setMessages(messages.filter((m) => m.id !== id));
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg.id);
    setEditContent(msg.content);
  };

  const handleUpdate = () => {
    setMessages(messages.map((m) =>
      m.id === editingMessage ? { ...m, content: editContent } : m
    ));
    setEditingMessage(null);
    setEditContent("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Messages</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Write a message..."
          className="border p-2 flex-1 rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      <ul>
        {messages.map((msg) => (
          <li
            key={msg.id}
            className="border-b py-2 flex justify-between items-center"
          >
            {editingMessage === msg.id ? (
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
                  onClick={() => setEditingMessage(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span>{msg.content}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(msg)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
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
