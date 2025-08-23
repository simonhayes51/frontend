import React, { useState, useEffect } from "react";
import axios from "../axios";
import { useDashboard } from "../context/DashboardContext";

const AddTrade = () => {
  const { refreshDashboard } = useDashboard();
  const [form, setForm] = useState({
    name: "",
    version: "",
    buyPrice: "",
    sellPrice: "",
    platform: "Console",
    user_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userId = new URLSearchParams(window.location.search).get("user_id");
    if (userId) {
      setForm((prev) => ({ ...prev, user_id: userId }));
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/logtrade", form);
      refreshDashboard(); // ✅ Updates totals instantly
      alert("✅ Trade logged!");
      setForm({ ...form, name: "", version: "", buyPrice: "", sellPrice: "", platform: "Console" });
    } catch {
      alert("❌ Failed to log trade.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-2xl space-y-4">
      <h2 className="text-xl font-semibold text-white">📥 Log a Trade</h2>
      {["name", "version", "buyPrice", "sellPrice"].map((field) => (
        <input
          key={field}
          name={field}
          type="text"
          placeholder={field}
          value={form[field]}
          onChange={handleChange}
          className="w-full p-3 rounded bg-zinc-800 text-white"
          required
        />
      ))}
      <select
        name="platform"
        value={form.platform}
        onChange={handleChange}
        className="w-full p-3 rounded bg-zinc-800 text-white"
      >
        <option value="Console">🎮 Console</option>
        <option value="PC">💻 PC</option>
      </select>
      <button
        type="submit"
        disabled={submitting}
        className="bg-lime text-black py-2 px-6 rounded hover:opacity-90 font-semibold"
      >
        {submitting ? "Submitting..." : "Submit Trade"}
      </button>
    </form>
  );
};

export default AddTrade;
