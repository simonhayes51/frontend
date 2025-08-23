import React from "react";
import { useDashboard } from "../context/DashboardContext";

const Dashboard = () => {
  const { dashboard, loading } = useDashboard();

  if (loading) return <p className="text-white text-lg">Loading dashboard...</p>;
  if (!dashboard) return <p className="text-red-400">No data available.</p>;

  const { netProfit, taxPaid, startingBalance, profile, trades } = dashboard;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold">💰 Net Profit</h3>
          <p className="text-3xl font-bold text-lime">{netProfit.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold">🧾 EA Tax Paid</h3>
          <p className="text-3xl font-bold text-lime">{taxPaid.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold">🏦 Starting Balance</h3>
          <p className="text-3xl font-bold text-lime">{startingBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Trader Profile */}
      <div className="bg-zinc-900 p-6 rounded-2xl">
        <h3 className="text-xl font-semibold mb-3">📊 Trader Profile</h3>
        <p>💵 Total Profit: <span className="text-lime">{profile.totalProfit.toLocaleString()}</span></p>
        <p>🛒 Trades Logged: <span className="text-lime">{profile.tradesLogged}</span></p>
        <p>📈 Win Rate: <span className="text-lime">{profile.winRate}%</span></p>
        <p>🏷️ Most Used Tag: <span className="text-lime">{profile.mostUsedTag}</span></p>
        {profile.bestTrade && (
          <p>🏆 Best Trade: <span className="text-lime">{profile.bestTrade.player} (+{profile.bestTrade.profit.toLocaleString()})</span></p>
        )}
      </div>

      {/* Recent Trades */}
      <div className="bg-zinc-900 p-6 rounded-2xl">
        <h3 className="text-xl font-semibold mb-3">📜 Recent Trades</h3>
        <div className="space-y-2">
          {trades.length === 0 ? (
            <p>No trades logged yet.</p>
          ) : (
            trades.map((t, i) => (
              <div key={i} className="flex justify-between p-3 bg-zinc-800 rounded">
                <span>{t.player} ({t.version})</span>
                <span className="text-lime">+{t.profit?.toLocaleString() || 0}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
