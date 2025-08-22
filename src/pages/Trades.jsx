import React, { useEffect, useState } from "react"
import axios from "../axios"

const Trades = () => {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const user_id = params.get("user_id")
        if (!user_id) return

        const res = await axios.get(`/api/trades/${user_id}`)
        setTrades(res.data)
      } catch (err) {
        console.error("❌ Failed to fetch trades:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">📊 Trade History</h1>
      {loading ? (
        <p>Loading trades...</p>
      ) : trades.length === 0 ? (
        <p>No trades found.</p>
      ) : (
        <div className="grid gap-4">
          {trades.map((trade, idx) => (
            <div key={idx} className="bg-zinc-900 p-4 rounded-xl shadow">
              <div className="font-semibold">{trade.player} ({trade.version})</div>
              <div className="text-sm text-gray-300">Buy: {trade.buy} | Sell: {trade.sell} | Qty: {trade.quantity}</div>
              <div className="text-sm text-gray-400">Profit: {trade.profit} | EA Tax: {trade.ea_tax}</div>
              <div className="text-xs text-gray-500">{new Date(trade.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Trades
