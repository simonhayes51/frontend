import React, { useState, useEffect } from "react"
import axios from "../axios"

const AddTrade = () => {
  const [form, setForm] = useState({
    name: "",
    version: "",
    buyPrice: "",
    sellPrice: "",
    platform: "Console",
    user_id: "",
  })
  const [submitting, setSubmitting] = useState(false)

  // Get user_id from URL
  useEffect(() => {
    const userId = new URLSearchParams(window.location.search).get("user_id")
    if (userId) {
      setForm((prevForm) => ({ ...prevForm, user_id: userId }))
    }
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    if (!form.user_id) {
      alert("❌ User not logged in")
      setSubmitting(false)
      return
    }

    try {
      await axios.post("/logtrade", form)
      alert("✅ Trade logged!")
      setForm({ name: "", version: "", buyPrice: "", sellPrice: "", platform: "Console", user_id: form.user_id })
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

      {["name", "version", "buyPrice", "sellPrice"].map((field) => (
        <input
          key={field}
          name={field}
          type="text"
          placeholder={field}
          value={form[field]}
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