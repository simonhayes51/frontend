import React, { useState } from "react"
import axios from "../axios"

const AddTrade = () => {
  const [form, setForm] = useState({
    player_name: "",
    version: "",
    buy_price: "",
    sell_price: "",
    platform: "Console",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post("/api/trade", {
        player_name: form.player_name,
        version: form.version,
        buy_price: parseInt(form.buy_price),
        sell_price: parseInt(form.sell_price),
        platform: form.platform,
      })
      alert("✅ Trade logged!")
      setForm({
        player_name: "",
        version: "",
        buy_price: "",
        sell_price: "",
        platform: "Console",
      })
    } catch (err) {
      alert("❌ Failed to log trade.")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-2xl space-y-4">
      <h2 className="text-xl font-semibold text-white">📥 Log a Trade</h2>

      {[
        { name: "player_name", placeholder: "Player Name" },
        { name: "version", placeholder: "Card Version (e.g. Gold Rare)" },
        { name: "buy_price", placeholder: "Buy Price" },
        { name: "sell_price", placeholder: "Sell Price" },
      ].map((field) => (
        <input
          key={field.name}
          name={field.name}
          type="text"
          placeholder={field.placeholder}
          value={form[field.name]}
          onChange={handleChange}
          className="w-full p-3 rounded bg-zinc-800 text-white placeholder:text-zinc-400"
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
  )
}

export default AddTrade