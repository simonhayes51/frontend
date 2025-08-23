import React, { useEffect, useState } from "react";
import axios from "../axios";
import AddTrade from "./AddTrade";
import ProfitGraph from "./ProfitGraph";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
      const res = await axios.get(`/api/profile/${userId}`);
      setDashboard(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <p className="text-gray-400">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📊 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold">💰 Net Profit</h2>
          <p className="text-green-400 text-2xl">{dashboard.netProfit.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold">🧾 EA Tax Paid</h2>
          <p className="text-green-400 text-2xl">{dashboard.taxPaid.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold">🏦 Starting Balance</h2>
          <p className="text-green-400 text-2xl">{dashboard.startingBalance.toLocaleString()}</p>
        </div>
      </div>

      <ProfitGraph trades={dashboard.trades} />

      <AddTrade onTradeAdded={fetchDashboard} />
    </div>
  );
};

export default Dashboard;