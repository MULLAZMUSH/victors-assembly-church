import { useState } from "react";

export default function Events() {
  const [events, setEvents] = useState([
    { id: 1, content: "Sunday Service at 10 AM" },
    { id: 2, content: "Youth Bible Study on Wednesday" },
  ]);
  const [newEvent, setNewEvent] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleAdd = () => {
    if (!newEvent.trim()) return;
    setEvents([...events, { id: Date.now(), content: newEvent }]);
    setNewEvent("");
  };

  const handleDelete = (id) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleEdit = (event) => {
    setEditingEvent(event.id);
    setEditContent(event.content);
  };

  const handleUpdate = () => {
    setEvents(events.map((e) =>
      e.id === editingEvent ? { ...e, content: editContent } : e
    ));
    setEditingEvent(null);
    setEditContent("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Events</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Add an event..."
          className="border p-2 flex-1 rounded"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul>
        {events.map((event) => (
          <li
            key={event.id}
            className="border-b py-2 flex justify-between items-center"
          >
            {editingEvent === event.id ? (
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
                  onClick={() => setEditingEvent(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span>{event.content}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
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
