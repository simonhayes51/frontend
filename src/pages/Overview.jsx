import React, { useEffect, useState } from "react"
import axios from "../axios"

const Overview = () => {
  const [summary, setSummary] = useState({ netProfit: 0, taxPaid: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/summary")
        setSummary(res.data)
      } catch (err) {
        console.error("❌ Failed to fetch summary:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">💰 Net Profit</h2>
        <p className="text-3xl font-bold text-lime">
          {loading ? "Loading..." : summary.netProfit.toLocaleString()}
        </p>
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">🧾 EA Tax Paid</h2>
        <p className="text-3xl font-bold text-lime">
          {loading ? "Loading..." : summary.taxPaid.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default Overview