import React from "react";
import { useDashboard } from "../context/DashboardContext";

const Dashboard = () => {
  const { dashboard, loading } = useDashboard();

  if (loading) return <p className="text-gray-400">Loading dashboard...</p>;
  if (!dashboard) return <p className="text-gray-400">No data available.</p>;

  const { netProfit, taxPaid, startingBalance, profile } = dashboard;

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold">💰 Net Profit</h2>
        <p className="text-green-400 text-3xl">{netProfit.toLocaleString()}</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold">🧾 EA Tax Paid</h2>
        <p className="text-green-400 text-3xl">{taxPaid.toLocaleString()}</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold">🏦 Starting Balance</h2>
        <p className="text-green-400 text-3xl">{startingBalance.toLocaleString()}</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-2">📊 Trader Profile</h2>
        <p>💵 Total Profit: {profile.totalProfit.toLocaleString()}</p>
        <p>📝 Trades Logged: {profile.tradesLogged}</p>
        <p>📈 Win Rate: {profile.winRate}%</p>
        <p>🏷️ Most Used Tag: {profile.mostUsedTag}</p>
        {profile.bestTrade && (
          <p>
            🏆 Best Trade: {profile.bestTrade.player} (+{profile.bestTrade.profit.toLocaleString()})
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
