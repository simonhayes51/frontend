// src/pages/Trades.jsx
import React, { useEffect, useState } from "react";
import { useDashboard } from "../context/DashboardContext";

const Trades = () => {
  const { getAllTrades } = useDashboard();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const safeNumber = (value) => Number(value || 0).toLocaleString();
  const safeDate = (date) => {
    try {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleString([], {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const result = await getAllTrades();
        if (result.success) {
          setTrades(result.trades);
        } else {
          console.error("Failed to fetch trades:", result.message);
        }
      } catch (err) {
        console.error("Failed to fetch trades:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrades();
  }, [getAllTrades]);

  if (loading) return <p className="text-gray-600 dark:text-gray-400">Loading trades...</p>;

  return (
    <div className="bg-white text-gray-900 border border-slate-200 p-6 rounded-2xl shadow-md dark:bg-zinc-900 dark:text-white dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-4">Trade History</h1>
      {trades.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No trades logged yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-slate-200 dark:border-gray-700">
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
              <tr key={i} className="border-b border-slate-200 dark:border-gray-800">
                <td className="py-2">{trade.player || "N/A"}</td>
                <td>{trade.version || "N/A"}</td>
                <td>{trade.quantity || 0}</td>
                <td>{safeNumber(trade.buy)}</td>
                <td>{safeNumber(trade.sell)}</td>
                <td
                  className={
                    (trade.profit || 0) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {safeNumber(trade.profit)}
                </td>
                <td>{safeDate(trade.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Trades;
