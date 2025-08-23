import React, { useEffect, useState } from "react";
import axios from "../axios";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`/api/dashboard/${userId}`);
        setData(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [userId]);

  if (loading) return <p className="text-lime text-xl">Loading...</p>;
  if (!data) return <p className="text-red-500">Failed to load dashboard.</p>;

  return (
    <div className="grid gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2">💰 Net Profit</h2>
          <p className="text-3xl font-bold text-lime">{data.netProfit.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2">🧾 EA Tax Paid</h2>
          <p className="text-3xl font-bold text-lime">{data.taxPaid.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2">🏦 Starting Balance</h2>
          <p className="text-3xl font-bold text-lime">{data.startingBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Trader Profile */}
      <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">🧳 Trader Profile</h2>
        <p>💰 Total Profit: <span className="text-lime">{data.profile.totalProfit.toLocaleString()}</span></p>
        <p>🛒 Trades Logged: <span className="text-lime">{data.profile.tradesLogged}</span></p>
        <p>📈 Win Rate: <span className="text-lime">{data.profile.winRate}%</span></p>
        <p>🏷️ Most Used Tag: <span className="text-lime">{data.profile.mostUsedTag}</span></p>
        {data.profile.bestTrade && (
          <p>🏆 Best Trade: <span className="text-lime">
            {data.profile.bestTrade.player} (+{data.profile.bestTrade.profit.toLocaleString()})
          </span></p>
        )}
      </div>

      {/* Recent Trades */}
      <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">📄 Recent Trades</h2>
        {data.trades.length > 0 ? (
          <ul className="space-y-2">
            {data.trades.map((trade, i) => (
              <li key={i} className="bg-zinc-800 p-3 rounded-lg flex justify-between items-center">
                <span>{trade.player} ({trade.version})</span>
                <span className="text-lime">+{trade.profit.toLocaleString()} coins</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No trades yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;