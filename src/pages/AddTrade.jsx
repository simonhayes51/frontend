import React, { useState, useEffect, useContext } from "react";
import axios from "../axios";
import { DashboardContext } from "../context/DashboardContext";

const AddTrade = () => {
  const [form, setForm] = useState({
    name: "",
    version: "",
    buyPrice: "",
    sellPrice: "",
    platform: "Console",
    user_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { refreshDashboard } = useContext(DashboardContext);

  // Get user_id from URL if provided
  useEffect(() => {
    const userId = new URLSearchParams(window.location.search).get("user_id");
    if (userId) {
      setForm((prevForm) => ({ ...prevForm, user_id: userId }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post("/logtrade", {
        name: form.name,
        version: form.version,
        buy_price: Number(form.buyPrice),
        sell_price: Number(form.sellPrice),
        platform: form.platform,
        user_id: form.user_id,
      });

      if (response.status === 200) {
        alert("✅ Trade logged successfully!");
        setForm({
          name: "",
          version: "",
          buyPrice: "",
          sellPrice: "",
          platform: "Console",
          user_id: form.user_id,
        });

        // Refresh dashboard totals instantly
        refreshDashboard();
      } else {
        alert("❌ Failed to log trade. Please try again.");
      }
    } catch (err) {
      console.error("Log trade error:", err.response?.data || err.message);
      alert("❌ Failed to log trade.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 p-6 rounded-2xl space-y-4 shadow-lg"
    >
      <h2 className="text-xl font-semibold text-white">📥 Log a Trade</h2>

      {["name", "version", "buyPrice", "sellPrice"].map((field) => (
        <input
          key={field}
          name={field}
          type={field.includes("Price") ? "number" : "text"}
          placeholder={field}
          value={form[field]}
          onChange={handleChange}
          className="w-full p-3 rounded bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-lime"
          required
        />
      ))}

      <select
        name="platform"
        value={form.platform}
        onChange={handleChange}
        className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-lime"
      >
        <option value="Console">🎮 Console</option>
        <option value="PC">💻 PC</option>
      </select>

      <button
        type="submit"
        disabled={submitting}
        className="bg-lime text-black py-2 px-6 rounded hover:opacity-90 font-semibold w-full"
      >
        {submitting ? "Submitting..." : "Submit Trade"}
      </button>
    </form>
  );
};

export default AddTrade;