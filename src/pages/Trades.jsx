import React, { useEffect, useState } from "react";
import axios from "../axios";

const Trades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("❌ No user_id found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/trades/${userId}`);
        setTrades(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch trades:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  if (loading) return <p className="text-gray-400">Loading trades...</p>;

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">📊 Trade History</h1>
      {trades.length === 0 ? (
        <p className="text-gray-400">No trades logged yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="py-2">Player</th>
              <th>Version</th>
              <th>Qty</th>
              <th>Buy</th>
              <th>Sell</th>
              <th>Profit</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="py-2">{trade.player}</td>
                <td>{trade.version}</td>
                <td>{trade.quantity}</td>
                <td>{trade.buy.toLocaleString()}</td>
                <td>{trade.sell.toLocaleString()}</td>
                <td className={trade.profit >= 0 ? "text-green-400" : "text-red-400"}>
                  {trade.profit.toLocaleString()}
                </td>
                <td>{new Date(trade.timestamp).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Trades;