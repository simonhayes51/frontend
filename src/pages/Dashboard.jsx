// src/pages/Dashboard.jsx
import React, { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    console.log("%c[NEW DASHBOARD MOUNTED]", "color:#22c55e;font-weight:bold");
  }, []);

  return (
    <div className="p-6">
      <div className="rounded-xl bg-emerald-600/20 border border-emerald-500/40 p-4 text-emerald-300 text-center font-bold">
        ✅ NEW DASHBOARD IS RENDERING
      </div>
    </div>
  );
}
