import React, { useEffect, useState } from "react"
import axios from "../axios"

const Overview = () => {
  const [summary, setSummary] = useState({ net_profit: 0, total_tax: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const user_id = params.get("user_id")
        if (!user_id) return

        const res = await axios.get(`/api/stats/${user_id}`)
        setSummary(res.data)
      } catch (err) {
        console.error("❌ Failed to fetch stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">💰 Net Profit</h2>
        <p className="text-3xl font-bold text-lime">
          {loading ? "Loading..." : summary.net_profit.toLocaleString()}
        </p>
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">🧾 EA Tax Paid</h2>
        <p className="text-3xl font-bold text-lime">
          {loading ? "Loading..." : summary.total_tax.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default Overview
