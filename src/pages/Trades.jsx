import React, { useEffect, useState } from "react"
import axios from "../axios"

const Trades = () => {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await axios.get(`/api/trades/${localStorage.getItem("user_id")}`)
        setTrades(res.data)
      } catch (err) {
        console.error("❌ Failed to fetch trades:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [])

  if (loading) {
    return <p className="text-gray-400">⏳ Loading trades...</p>
  }

  if (trades.length === 0) {
    return <p className="text-gray-400">📭 No trades logged yet.</p>
  }

  return (
    <div className="p-6 bg-zinc-900 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold text-lime mb-4">📊 Trade History</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-zinc-800 rounded-lg">
          <thead>
            <tr className="bg-zinc-700 text-gray-200 text-sm">
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-left">Version</th>
              <th className="px-4 py-3 text-center">Buy</th>
              <th className="px-4 py-3 text-center">Sell</th>
              <th className="px-4 py-3 text-center">Profit</th>
              <th className="px-4 py-3 text-center">EA Tax</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-center">Platform</th>
              <th className="px-4 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr
                key={index}
                className="border-b border-zinc-700 hover:bg-zinc-700 transition"
              >
                <td className="px-4 py-3">{trade.player}</td>
                <td className="px-4 py-3">{trade.version}</td>
                <td className="px-4 py-3 text-center text-blue-400">
                  {trade.buy.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center text-green-400">
                  {trade.sell.toLocaleString()}
                </td>
                <td
                  className={`px-4 py-3 text-center font-semibold ${
                    trade.profit >= 0 ? "text-lime" : "text-red-500"
                  }`}
                >
                  {trade.profit >= 0 ? `+${trade.profit.toLocaleString()}` : trade.profit.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center text-yellow-400">
                  {trade.ea_tax.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">{trade.quantity}</td>
                <td className="px-4 py-3 text-center">{trade.platform}</td>
                <td className="px-4 py-3 text-right text-gray-400">
                  {new Date(trade.timestamp).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Trades