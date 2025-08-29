// src/pages/ThemedDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, TrendingUp, Eye, Settings, User, Bell, Filter, BarChart3, PieChart,
  Activity, Coins, Target, Clock, AlertCircle, X, LayoutGrid, ChevronDown, LineChart,
  DollarSign, Trophy, Sun, Moon, Save, RotateCcw,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { fetchWatchlist, fetchAlerts, fetchMarketTrends } from "../services/api";

const ThemedDashboard = () => {
  // Real data from the context you installed
  const { user_id, isLoading: loadingCore, error, netProfit, taxPaid, startingBalance, trades } = useDashboard();

  // Local UI state
  const [activeView, setActiveView] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Theme & toggles (purely visual)
  const [settings, setSettings] = useState({
    theme: "dark",
    notifications: { priceAlerts: true, tradeConfirmations: true, marketUpdates: false, weeklyReports: true },
    display: { currency: "coins", dateFormat: "relative", compactMode: false, showProfitPercentage: true },
    trading: { autoRefresh: true, refreshInterval: 30, confirmTrades: true, defaultTradeAmount: 100000 },
  });
  const themes = {
    dark: {
      bg: "bg-gray-900", cardBg: "bg-gray-800", navBg: "bg-gray-800",
      border: "border-gray-700", text: "text-white", textSecondary: "text-gray-400", textTertiary: "text-gray-500",
      hover: "hover:bg-gray-700", button: "bg-gray-700 hover:bg-gray-600", input: "bg-gray-700 border-gray-600",
    },
    light: {
      bg: "bg-gray-50", cardBg: "bg-white", navBg: "bg-white",
      border: "border-gray-200", text: "text-gray-900", textSecondary: "text-gray-600", textTertiary: "text-gray-400",
      hover: "hover:bg-gray-50", button: "bg-gray-100 hover:bg-gray-200", input: "bg-white border-gray-300",
    },
  };
  const theme = themes[settings.theme];
  const updateSettings = (patch) => setSettings((s) => ({ ...s, ...patch }));

  // ---- Extra live data (watchlist / alerts / market trends) ----
  const [wl, setWl] = useState({ items: [], loading: true, err: null });
  const [alerts, setAlerts] = useState({ items: [], loading: true, err: null });
  const [trends, setTrends] = useState({ items: [], loading: true, err: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user_id) return; // auth will show inline banner from context
      setWl((s) => ({ ...s, loading: true, err: null }));
      setAlerts((s) => ({ ...s, loading: true, err: null }));
      setTrends((s) => ({ ...s, loading: true, err: null }));
      try {
        const [watchlistData, alertsData, trendData] = await Promise.all([
          fetchWatchlist(user_id),
          fetchAlerts(user_id),
          fetchMarketTrends(),
        ]);
        if (cancelled) return;
        setWl({ items: Array.isArray(watchlistData) ? watchlistData : [], loading: false, err: null });
        setAlerts({ items: Array.isArray(alertsData) ? alertsData : [], loading: false, err: null });
        setTrends({ items: Array.isArray(trendData) ? trendData : [], loading: false, err: null });
      } catch (e) {
        if (cancelled) return;
        const msg = e?.response?.data?.message || e?.message || "Failed to load";
        setWl((s) => ({ ...s, loading: false, err: msg }));
        setAlerts((s) => ({ ...s, loading: false, err: msg }));
        setTrends((s) => ({ ...s, loading: false, err: msg }));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user_id]);

  // derive recent trades
  const recentTrades = useMemo(() => (Array.isArray(trades) ? trades.slice(0, 8) : []), [trades]);

  // fmt helpers
  const fmtCoins = (n) => {
    const v = Number(n || 0);
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return String(v);
  };

  // widgets definition (same as before)
  const [dashboardWidgets, setDashboardWidgets] = useState([
    { id: "profit", type: "profit-tracker", size: "large" },
    { id: "watchlist", type: "watchlist-preview", size: "medium" },
    { id: "market", type: "market-trends", size: "medium" },
    { id: "trades", type: "recent-trades", size: "small" },
    { id: "analytics", type: "quick-analytics", size: "small" },
    { id: "alerts", type: "price-alerts", size: "small" },
  ]);
  const availableWidgets = [
    { type: "profit-tracker", name: "Profit Tracker", icon: TrendingUp },
    { type: "watchlist-preview", name: "Watchlist Preview", icon: Eye },
    { type: "market-trends", name: "Market Trends", icon: BarChart3 },
    { type: "recent-trades", name: "Recent Trades", icon: Activity },
    { type: "quick-analytics", name: "Quick Analytics", icon: PieChart },
    { type: "price-alerts", name: "Price Alerts", icon: Bell },
    { type: "coin-balance", name: "Coin Balance", icon: Coins },
    { type: "competition-tracker", name: "Competitions", icon: Trophy },
  ];

  // --- Widget component using real data ---
  const Widget = ({ widget }) => {
    const cfg = availableWidgets.find((w) => w.type === widget.type);
    const Icon = cfg?.icon || Activity;
    const removeWidget = () => setDashboardWidgets((arr) => arr.filter((w) => w.id !== widget.id));

    const getContent = () => {
      switch (widget.type) {
        case "profit-tracker": {
          const gross = netProfit + taxPaid;
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Profit Tracker
                </h3>
                <div className="text-right">
                  <div className="text-green-400 text-3xl font-bold">
                    {loadingCore ? "…" : `+${fmtCoins(netProfit)}`}
                  </div>
                  <div className="text-green-400 text-sm">This Month</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Tax Paid</span>
                    <span className="text-red-400">{loadingCore ? "…" : fmtCoins(taxPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Starting Balance</span>
                    <span className={theme.text}>{loadingCore ? "…" : fmtCoins(startingBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Trades</span>
                    <span className="text-blue-400">{loadingCore ? "…" : recentTrades.length}</span>
                  </div>
                </div>
                <div className={`h-20 ${settings.theme === "dark" ? "bg-gray-700" : "bg-gray-100"} rounded-lg flex items-center justify-center`}>
                  <span className={`${theme.textTertiary} text-xs`}>Chart</span>
                </div>
              </div>

              {gross > 0 && (
                <div className={`mt-3 text-xs ${theme.textSecondary}`}>
                  Tax is {(taxPaid / gross * 100).toFixed(1)}% of gross profit.
                </div>
              )}
            </>
          );
        }

        case "recent-trades":
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Activity className="w-5 h-5 text-orange-400" />
                  Recent Trades
                </h3>
                <span className={`${theme.textSecondary} text-sm`}>
                  {loadingCore ? "Loading…" : `Showing last ${recentTrades.length}`}
                </span>
              </div>

              {loadingCore ? (
                <div className={`${theme.textSecondary} text-sm`}>Loading trades…</div>
              ) : recentTrades.length === 0 ? (
                <div className={`${theme.textSecondary} text-sm`}>No trades yet.</div>
              ) : (
                <div className="space-y-2">
                  {recentTrades.map((t, i) => {
                    const p = Number(t?.profit ?? 0);
                    const right = p >= 0 ? `+${fmtCoins(p)}` : `-${fmtCoins(Math.abs(p))}`;
                    return (
                      <div key={t.id ?? i} className="flex justify-between text-sm">
                        <span className={theme.textSecondary}>
                          {t?.player ?? "Unknown"}{t?.rating ? ` (${t.rating})` : ""}{t?.platform ? ` • ${t.platform}` : ""}
                        </span>
                        <span className={p >= 0 ? "text-green-400" : "text-red-400"}>{right}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );

        case "watchlist-preview":
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Eye className="w-5 h-5 text-blue-400" />
                  Watchlist
                </h3>
                <span className={`${theme.textSecondary} text-sm`}>
                  {wl.loading ? "Loading…" : `${wl.items.length} players`}
                </span>
              </div>

              {wl.loading ? (
                <div className={`${theme.textSecondary} text-sm`}>Loading watchlist…</div>
              ) : wl.items.length === 0 ? (
                <div className={`${theme.textSecondary} text-sm`}>No players in watchlist.</div>
              ) : (
                <div className="space-y-3">
                  {wl.items.slice(0, 5).map((p, i) => (
                    <div key={p.id ?? i} className="flex items-center justify-between">
                      <span className={`${theme.textSecondary} text-sm`}>
                        {p.name ?? p.player ?? "Unknown"}
                      </span>
                      {/* if your object has 24h change or delta, map it here */}
                      <span className={`${Number(p.delta ?? p.change ?? 0) >= 0 ? "text-green-400" : "text-red-400"} text-sm`}>
                        {typeof p.change === "string" ? p.change : `${Number(p.delta ?? 0).toFixed(1)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          );

        case "market-trends":
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Market Trends
                </h3>
              </div>

              {trends.loading ? (
                <div className={`${theme.textSecondary} text-sm`}>Loading trends…</div>
              ) : trends.items.length === 0 ? (
                <div className={`${theme.textSecondary} text-sm`}>No trend data.</div>
              ) : (
                <div className="space-y-3">
                  {trends.items.slice(0, 5).map((row, i) => (
                    <div key={row.id ?? row.league ?? i} className="flex items-center justify-between">
                      <span className={`${theme.textSecondary} text-sm`}>{row.name ?? row.league ?? "Segment"}</span>
                      <span className={`${Number(row.change ?? row.delta ?? 0) >= 0 ? "text-green-400" : "text-red-400"} text-sm`}>
                        {Number(row.change ?? row.delta ?? 0) >= 0 ? "↑" : "↓"} {Math.abs(Number(row.change ?? row.delta ?? 0)).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          );

        case "price-alerts":
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Price Alerts
                </h3>
                {!alerts.loading && alerts.items.length > 0 && (
                  <span className="text-red-400 text-xs bg-red-400/20 px-2 py-1 rounded-full">
                    {alerts.items.length}
                  </span>
                )}
              </div>

              {alerts.loading ? (
                <div className={`${theme.textSecondary} text-sm`}>Loading alerts…</div>
              ) : alerts.items.length === 0 ? (
                <div className={`${theme.textSecondary} text-sm`}>No active alerts.</div>
              ) : (
                <div className="space-y-2">
                  {alerts.items.slice(0, 6).map((a, i) => (
                    <div key={a.id ?? i} className={`text-sm ${theme.textSecondary}`}>
                      {(a.player ?? a.title ?? "Player")} {a.operator ?? "at"} {a.target ?? a.price ?? ""}
                    </div>
                  ))}
                </div>
              )}
            </>
          );

        case "quick-analytics":
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <PieChart className="w-5 h-5 text-cyan-400" />
                  Quick Stats
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Total Profit</span>
                  <span className="text-green-400">{loadingCore ? "…" : fmtCoins(netProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Total Trades</span>
                  <span className="text-blue-400">{loadingCore ? "…" : trades.length}</span>
                </div>
              </div>
            </>
          );

        case "coin-balance":
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Coin Balance
                </h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{fmtCoins(startingBalance)}</div>
                <div className={`${theme.textSecondary} text-sm`}>Starting Balance</div>
              </div>
            </>
          );

        default:
          return (
            <div className="flex items-center justify-center h-24">
              <Icon className={`w-8 h-8 ${theme.textTertiary}`} />
            </div>
          );
      }
    };

    return (
      <div
        className={`${theme.cardBg} rounded-xl p-6 border ${theme.border} relative group ${
          widget.size === "large" ? "col-span-2" : ""
        } ${isCustomizing ? "border-dashed border-blue-500" : ""}`}
      >
        {isCustomizing && (
          <button
            onClick={removeWidget}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <getContent.constructor /> {/* noop to avoid linter thinking getContent is a component */}
        {getContent()}
      </div>
    );
  };

  // (SettingsPanel unchanged – keep yours if you like)

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      <nav className={`${theme.navBg} border-b ${theme.border} sticky top-0 z-40`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className={`${theme.text} font-bold text-xl`}>FUT Dashboard</span>
              </div>

              <div className="hidden md:flex space-x-6">
                {["dashboard", "trades", "watchlist", "analytics"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveView(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeView === tab
                        ? "bg-green-600 text-white"
                        : `${theme.textSecondary} hover:${theme.text} ${theme.hover}`
                    }`}
                  >
                    {tab[0].toUpperCase() + tab.slice(1)}
                  </button>
                ))}
                <button className={`px-4 py-2 rounded-lg font-medium ${theme.textSecondary} hover:${theme.text} ${theme.hover} flex items-center gap-2`}>
                  <Search className="w-4 h-4" />
                  Player Search
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
                className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg ${theme.hover} transition-colors`}
                title="Toggle theme"
              >
                {settings.theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg ${theme.hover} relative transition-colors`}>
                <Bell className="w-5 h-5" />
                {/* If you want a live badge, use alerts.items.length */}
                {alerts.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.items.length}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((s) => !s)}
                  className={`flex items-center space-x-3 ${theme.button} ${theme.hover} rounded-lg px-4 py-2 ${theme.text} transition-colors`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">W</span>
                  </div>
                  <span className="hidden md:block font-medium">{user_id ? `user:${user_id}` : "guest"}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-56 ${theme.cardBg} rounded-xl shadow-2xl border ${theme.border} z-50`}>
                    <div className={`p-4 border-b ${theme.border}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">W</span>
                        </div>
                        <div>
                          <p className={`${theme.text} font-medium`}>{user_id ? `ID: ${user_id}` : "Not signed in"}</p>
                          <p className={`${theme.textSecondary} text-sm`}>Elite Trader</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}>
                        <User className="w-4 h-4" />
                        Profile Settings
                      </button>
                      <button
                        onClick={() => { setShowSettings(true); setShowUserMenu(false); }}
                        className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}
                      >
                        <Settings className="w-4 h-4" />
                        App Settings
                      </button>
                    </div>
                    <div className={`border-t ${theme.border} p-2`}>
                      <button className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors rounded-lg">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Inline error from the data layer */}
      {error && (
        <div className="px-6 pt-4">
          <div className="bg-red-500/10 text-red-300 border border-red-500/30 rounded-lg px-4 py-3 text-sm">
            {String(error)}
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="px-6 py-8">
        {activeView === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard Overview</h1>
              <div className="flex items-center gap-3">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Trade
                </button>
                <button
                  onClick={() => setIsCustomizing((c) => !c)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isCustomizing ? "bg-blue-600 hover:bg-blue-700 text-white" : `${theme.button} ${theme.text}`
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  {isCustomizing ? "Done Customizing" : "Customize Widgets"}
                </button>
              </div>
            </div>

            {/* Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardWidgets.map((w) => (
                <Widget key={w.id} widget={w} />
              ))}
            </div>
          </div>
        )}

        {/* You can keep your Analytics/Trades/Watchlist view code here exactly as before */}
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* keep your SettingsPanel from before or omit if unused */}
          <div className="p-8 rounded-xl bg-black/70 text-white">Settings panel coming from your previous code…</div>
        </div>
      )}

      {showUserMenu && <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />}
    </div>
  );
};

export default ThemedDashboard;