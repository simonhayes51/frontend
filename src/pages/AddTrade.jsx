import React, { useState } from "react";
import axios from "../axios";

const AddTrade = ({ user, onTradeAdded }) => {
  const [form, setForm] = useState({
    player: "",
    version: "",
    buy: "",
    sell: "",
    quantity: 1,
    platform: "Console",
    tag: "General",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/add_trade", { ...form, user_id: user.id });
      setMessage("✅ Trade logged successfully!");
      setForm({
        player: "",
        version: "",
        buy: "",
        sell: "",
        quantity: 1,
        platform: "Console",
        tag: "General",
      });
      if (onTradeAdded) onTradeAdded(); // refresh dashboard
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to log trade.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">➕ Add Trade</h1>
      {message && <p className="mb-3 text-sm">{message}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input name="player" placeholder="Player" value={form.player} onChange={handleChange} className="p-2 bg-gray-800 rounded" required />
        <input name="version" placeholder="Version" value={form.version} onChange={handleChange} className="p-2 bg-gray-800 rounded" required />
        <input name="buy" type="number" placeholder="Buy Price" value={form.buy} onChange={handleChange} className="p-2 bg-gray-800 rounded" required />
        <input name="sell" type="number" placeholder="Sell Price" value={form.sell} onChange={handleChange} className="p-2 bg-gray-800 rounded" required />
        <input name="quantity" type="number" placeholder="Qty" value={form.quantity} onChange={handleChange} className="p-2 bg-gray-800 rounded" required />
        <select name="platform" value={form.platform} onChange={handleChange} className="p-2 bg-gray-800 rounded">
          <option value="Console">Console</option>
          <option value="PC">PC</option>
        </select>
        <input name="tag" placeholder="Tag" value={form.tag} onChange={handleChange} className="p-2 bg-gray-800 rounded" required />
        <button disabled={loading} type="submit" className="bg-green-500 text-black py-2 px-4 rounded hover:bg-green-400">
          {loading ? "Logging..." : "Log Trade"}
        </button>
      </form>
    </div>
  );
};

export default AddTrade;