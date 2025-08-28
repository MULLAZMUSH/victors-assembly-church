import React, { useState } from "react";

export default function CrudList({
  items = [],
  onCreate,
  onEdit,
  onDelete,
  renderItem, // function to render item content
  placeholder = "Add new item...",
  compact = false, // makes the list more compact
}) {
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const handleAdd = () => {
    if (!newText.trim()) return;
    onCreate && onCreate(newText);
    setNewText("");
  };

  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSave = (id) => {
    onEdit && onEdit(id, editText);
    setEditingId(null);
    setEditText("");
  };

  return (
    <div>
      {/* New Item Input */}
      {onCreate && (
        <div className={`mb-2 flex gap-2 ${compact ? "text-sm" : ""}`}>
          <input
            type="text"
            className={`border rounded flex-1 ${compact ? "p-1 text-sm" : "p-2"}`}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={placeholder}
          />
          <button
            onClick={handleAdd}
            className={`bg-blue-500 text-white px-3 py-1 rounded ${compact ? "text-sm" : ""}`}
          >
            Add
          </button>
        </div>
      )}

      {/* List of Items */}
      <ul>
        {items.length === 0 && <li className="text-gray-500">No items yet.</li>}
        {items.map((item) => {
          const itemId = item.id || item._id;
          const itemText = item.content || item.text || item.title || "";

          return (
            <li
              key={itemId}
              className={`border p-2 mb-2 rounded flex justify-between items-start ${compact ? "p-1 text-sm" : ""}`}
            >
              {editingId === itemId ? (
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    className={`border rounded flex-1 ${compact ? "p-1 text-sm" : "p-2"}`}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button
                    onClick={() => handleSave(itemId)}
                    className={`bg-green-500 text-white px-2 py-1 rounded ${compact ? "text-sm" : ""}`}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className={`bg-gray-400 text-white px-2 py-1 rounded ${compact ? "text-sm" : ""}`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">{renderItem(item)}</div>
                  <div className="flex gap-1">
                    {onEdit && (
                      <button
                        onClick={() => handleEdit(itemId, itemText)}
                        className={`bg-yellow-500 text-white px-2 py-1 rounded ${compact ? "text-sm" : ""}`}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(itemId)}
                        className={`bg-red-600 text-white px-2 py-1 rounded ${compact ? "text-sm" : ""}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
