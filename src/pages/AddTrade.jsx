import React, { useState, useContext } from "react";
import axios from "../axios";
import { DashboardContext } from "../context/DashboardContext";

const AddTrade = () => {
  const [form, setForm] = useState({
    name: "",
    version: "",
    buyPrice: "",
    sellPrice: "",
    platform: "Console"
  });
  const [loading, setLoading] = useState(false);
  const { refreshDashboard } = useContext(DashboardContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/logtrade", {
        name: form.name,
        version: form.version,
        buy_price: Number(form.buyPrice),
        sell_price: Number(form.sellPrice),
        platform: form.platform
      });

      alert("✅ Trade logged successfully!");
      setForm({
        name: "",
        version: "",
        buyPrice: "",
        sellPrice: "",
        platform: "Console"
      });

      refreshDashboard(); // instantly refresh totals
    } catch (error) {
      console.error("Error logging trade:", error);
      alert("❌ Failed to log trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">📥 Log a Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Player Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 rounded bg-zinc-800"
          required
        />
        <input
          type="text"
          name="version"
          placeholder="Card Version (e.g. TOTS)"
          value={form.version}
          onChange={handleChange}
          className="w-full p-3 rounded bg-zinc-800"
        />
        <input
          type="number"
          name="buyPrice"
          placeholder="Buy Price"
          value={form.buyPrice}
          onChange={handleChange}
          className="w-full p-3 rounded bg-zinc-800"
          required
        />
        <input
          type="number"
          name="sellPrice"
          placeholder="Sell Price"
          value={form.sellPrice}
          onChange={handleChange}
          className="w-full p-3 rounded bg-zinc-800"
          required
        />
        <select
          name="platform"
          value={form.platform}
          onChange={handleChange}
          className="w-full p-3 rounded bg-zinc-800"
        >
          <option value="Console">🎮 Console</option>
          <option value="PC">💻 PC</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-lime text-black py-3 px-6 rounded-lg hover:opacity-90 w-full"
        >
          {loading ? "Submitting..." : "Submit Trade"}
        </button>
      </form>
    </div>
  );
};

export default AddTrade;