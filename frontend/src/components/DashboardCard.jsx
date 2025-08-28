// src/components/DashboardCard.jsx
import React from "react";

export default function DashboardCard({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
