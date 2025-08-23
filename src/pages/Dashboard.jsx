import React, { useEffect, useState } from "react";
import axios from "../axios";

const Dashboard = ({ user }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/profile/${user.id}`);
      setDashboard(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.id]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const stats = dashboard || {};
  const netProfit = stats.netProfit ?? 0;
  const taxPaid = stats.taxPaid ?? 0;
  const startingBalance = stats.startingBalance ?? 0;
  const trades = stats.trades || [];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📊 Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg">Net Profit</h2>
          <p className="text-2xl text-green-400">{netProfit.toLocaleString()} coins</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg">EA Tax Paid</h2>
          <p className="text-2xl text-red-400">{taxPaid.toLocaleString()} coins</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg">Starting Balance</h2>
          <p className="text-2xl">{startingBalance.toLocaleString()} coins</p>
        </div>
      </div>

      <h2 className="mt-6 text-lg">Recent Trades</h2>
      <ul className="bg-gray-900 rounded-lg p-4 mt-2">
        {trades.length > 0 ? (
          trades.map((trade, i) => (
            <li key={i} className="border-b border-gray-700 py-2">
              <span className="font-bold">{trade.player}</span> ({trade.version}) —  
              Profit:{" "}
              <span className={trade.profit >= 0 ? "text-green-400" : "text-red-400"}>
                {trade.profit.toLocaleString()} coins
              </span>
            </li>
          ))
        ) : (
          <li>No trades logged yet.</li>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;