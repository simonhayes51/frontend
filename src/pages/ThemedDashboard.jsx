// src/pages/ThemedDashboard.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, TrendingUp, Eye, Settings, User, Bell, Filter, BarChart3, PieChart,
  Activity, Coins, Target, Clock, AlertCircle, X, ChevronDown, LineChart,
  DollarSign, Trophy, Sun, Moon, Save, RotateCcw, LayoutGrid
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../context/DashboardContext";
import { useSettings } from "../context/SettingsContext";

const ThemedDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    netProfit: rawNet,
    taxPaid: rawTax,
    startingBalance: rawStart,
    trades: rawTrades,
    isLoading: dashLoading,
    error: dashError,
  } = useDashboard();

  const {
    formatCurrency,
    formatDate,
    include_tax_in_profit,
    isLoading: settingsLoading,
  } = useSettings();

  const [activeView, setActiveView] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const [uiSettings, setUiSettings] = useState({ theme: "dark" });
  const updateUITheme = () =>
    setUiSettings((s) => ({ theme: s.theme === "dark" ? "light" : "dark" }));

  const themes = {
    dark: {
      bg: "bg-gray-900",
      cardBg: "bg-gray-800",
      navBg: "bg-gray-800",
      border: "border-gray-700",
      text: "text-white",
      textSecondary: "text-gray-400",
      textTertiary: "text-gray-500",
      hoverBg: "hover:bg-gray-700",
      btn: "bg-gray-700 hover:bg-gray-600 text-white",
      input: "bg-gray-700 border-gray-600 text-white",
      subtle: "bg-gray-700",
    },
    light: {
      bg: "bg-gray-50",
      cardBg: "bg-white",
      navBg: "bg-white",
      border: "border-gray-200",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      textTertiary: "text-gray-400",
      hoverBg: "hover:bg-gray-50",
      btn: "bg-gray-100 hover:bg-gray-200 text-gray-900",
      input: "bg-white border-gray-300 text-gray-900",
      subtle: "bg-gray-100",
    },
  };
  const theme = themes[uiSettings.theme];

  const trades = Array.isArray(rawTrades) ? rawTrades : [];
  const net = Number(rawNet ?? 0);
  const tax = Number(rawTax ?? 0);
  const start = Number(rawStart ?? 0);
  const gross = net + tax;
  const taxPct = gross > 0 ? (tax / gross) * 100 : 0;

  const recentTrades = useMemo(
    () =>
      trades.slice(0, 8).map((t) => {
        const base = Number(t?.profit ?? 0);
        const ea = Number(t?.ea_tax ?? 0);
        const displayProfit = include_tax_in_profit ? base - ea : base;
        return { ...t, _displayProfit: displayProfit };
      }),
    [trades, include_tax_in_profit]
  );

  const alertsCount = trades.filter((t) => Number(t?.profit ?? 0) < 0).length;

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

  const SettingsPanel = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`${theme.cardBg} rounded-xl p-0 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden`}>
        <div className={`p-6 border-b ${theme.border}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
              <Settings className="w-6 h-6" />
              Settings
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className={`${theme.textSecondary} p-2 rounded-lg ${theme.hoverBg}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className={`${theme.text} text-lg font-semibold mb-3`}>Appearance</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setUiSettings({ theme: "dark" })}
                className={`px-4 py-2 rounded-lg border ${uiSettings.theme === "dark" ? "border-green-500" : theme.border} ${theme.text} ${theme.hoverBg}`}
              >
                <span className="inline-flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Dark
                </span>
              </button>
              <button
                onClick={() => setUiSettings({ theme: "light" })}
                className={`px-4 py-2 rounded-lg border ${uiSettings.theme === "light" ? "border-green-500" : theme.border} ${theme.text} ${theme.hoverBg}`}
              >
                <span className="inline-flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Light
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowSettings(false)}
              className={`px-5 py-2 rounded-lg ${theme.btn}`}
            >
              Close
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const Widget = ({ widget }) => {
    const removeWidget = () =>
      setDashboardWidgets((arr) => arr.filter((w) => w.id !== widget.id));

    const cardCls = `${theme.cardBg} rounded-xl p-6 border ${theme.border} relative group ${
      widget.size === "large" ? "col-span-2" : ""
    } ${isCustomizing ? "border-dashed border-blue-500" : ""}`;

    switch (widget.type) {
      case "profit-tracker":
        return (
          <div className={cardCls}>
            {isCustomizing && (
              <button
                onClick={removeWidget}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                <TrendingUp className="w-5 h-5 text-green-400" />
                Profit Tracker
              </h3>
              <div className="text-right">
                <div className="text-green-400 text-2xl font-bold">
                  {formatCurrency(net)}
                </div>
                {!include_tax_in_profit && (
                  <div className="text-green-400 text-xs">Net (excl. EA tax)</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Tax Paid</span>
                  <span className="text-red-400">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Starting Balance</span>
                  <span className={theme.text}>{formatCurrency(start)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Trades</span>
                  <span className="text-purple-300">{trades.length}</span>
                </div>
              </div>

              <div className={`h-20 ${themes[uiSettings.theme].subtle} rounded-lg flex items-center justify-center`}>
                <span className={`${theme.textTertiary} text-xs`}>
                  {tax > 0 ? `${taxPct.toFixed(1)}% of gross to tax` : "No tax yet"}
                </span>
              </div>
            </div>
          </div>
        );

      case "recent-trades":
        return (
          <div className={cardCls}>
            {isCustomizing && (
              <button
                onClick={removeWidget}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                <Activity className="w-5 h-5 text-orange-400" />
                Recent Trades
              </h3>
              <span className={`${theme.textSecondary} text-sm`}>
                Showing last {recentTrades.length} trades
              </span>
            </div>

            {recentTrades.length === 0 ? (
              <div className={`${theme.textSecondary} text-sm`}>No trades yet.</div>
            ) : (
              <div className="space-y-2">
                {recentTrades.map((t, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between text-sm rounded-lg px-3 py-2 ${theme.hoverBg}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`${theme.text} font-medium truncate`}>
                          {t?.player ?? "Unknown"}
                        </span>
                        <span className={`${theme.textSecondary} text-xs`}>
                          ({t?.version ?? "N/A"})
                        </span>
                        {t?.tag && (
                          <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded-full">
                            {t.tag}
                          </span>
                        )}
                      </div>
                      <div className={`${theme.textSecondary} text-xs`}>
                        {formatCurrency(t?.buy ?? 0)} → {formatCurrency(t?.sell ?? 0)}
                        {t?.quantity > 1 && ` (${t.quantity}x)`} • {t?.platform ?? "Console"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          t._displayProfit >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {t._displayProfit >= 0 ? "+" : ""}
                        {formatCurrency(t._displayProfit)} coins
                      </div>
                      <div className={`${theme.textSecondary} text-[10px]`}>
                        {t?.timestamp ? formatDate(t.timestamp) : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "watchlist-preview":
        return (
          <div className={cardCls}>
            {isCustomizing && (
              <button
                onClick={removeWidget}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                <Eye className="w-5 h-5 text-blue-400" />
                Watchlist
              </h3>
              <span className={`${theme.textSecondary} text-sm`}>Connect your watchlist</span>
            </div>
            <div className={`${theme.textTertiary} text-sm`}>Wire to your watchlist API.</div>
          </div>
        );

      case "market-trends":
        return (
          <div className={cardCls}>
            {isCustomizing && (
              <button
                onClick={removeWidget}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Market Trends
              </h3>
            </div>
            <div className={`${theme.textTertiary} text-sm`}>Wire to your market endpoint.</div>
          </div>
        );

      case "quick-analytics":
        return (
          <div className={cardCls}>
            {isCustomizing && (
              <button
                onClick={removeWidget}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                <PieChart className="w-5 h-5 text-cyan-400" />
                Quick Stats
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={theme.textSecondary}>Win Rate</span>
                <span className={theme.text}>
                  {trades.length
                    ? ((trades.filter((t) => Number(t?.profit ?? 0) > 0).length / trades.length) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme.textSecondary}>Avg Profit</span>
                <span className="text-green-400">
                  {trades.length
                    ? formatCurrency(net / trades.length)
                    : formatCurrency(0)}
                </span>
              </div>
            </div>
          </div>
        );

      case "price-alerts":
        return (
          <div className={cardCls}>
            {isCustomizing && (
              <button
                onClick={removeWidget}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                <Bell className="w-5 h-5 text-yellow-400" />
                Price Alerts
              </h3>
              <span className="text-red-400 text-xs bg-red-400/20 px-2 py-1 rounded-full">
                {alertsCount}
              </span>
            </div>
            <div className={`${theme.textTertiary} text-sm`}>
              Connect to your alerts feed.
            </div>
          </div>
        );

      case "coin-balance":
        return (
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                <Coins className="w-5 h-5 text-yellow-400" />
                Coin Balance
              </h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {formatCurrency(start + net)}
              </div>
              <div className={`${theme.textSecondary} text-sm`}>Approx. coins</div>
            </div>
          </div>
        );

      case "competition-tracker":
        return (
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                <Trophy className="w-5 h-5 text-yellow-400" />
                Competitions
              </h3>
            </div>
            <div className={`${theme.textTertiary} text-sm`}>Hook up your comp data.</div>
          </div>
        );

      default:
        return null;
    }
  };

  const busy = dashLoading || settingsLoading;

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <nav className={`${theme.navBg} border-b ${theme.border} sticky top-0 z-40`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className={`${theme.text} font-bold text-xl`}>FUT Dashboard</span>
              </div>

              <div className="hidden md:flex gap-2">
                {[
                  ["dashboard", "Dashboard"],
                  ["trades", "Trades"],
                  ["watchlist", "Watchlist"],
                  ["analytics", "Analytics"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      activeView === key
                        ? "bg-green-600 text-white"
                        : `${theme.textSecondary} ${theme.hoverBg}`
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => navigate("/player-search")}
                  className={`px-4 py-2 rounded-lg font-medium ${theme.textSecondary} ${theme.hoverBg} flex items-center gap-2`}
                >
                  <Search className="w-4 h-4" />
                  Player Search
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={updateUITheme}
                className={`${theme.textSecondary} p-2 rounded-lg ${theme.hoverBg}`}
                title="Toggle theme"
              >
                {uiSettings.theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                className={`${theme.textSecondary} p-2 rounded-lg ${theme.hoverBg} relative`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {alertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alertsCount}
                  </span>
                )}
              </button>

              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Sign in
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu((s) => !s)}
                    className={`flex items-center gap-3 ${theme.btn} rounded-lg px-4 py-2`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {String(user?.global_name || user?.username || "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block font-medium">
                      {user?.global_name || user?.username || "User"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div
                      className={`absolute right-0 mt-2 w-56 ${theme.cardBg} rounded-xl shadow-2xl border ${theme.border} z-50`}
                    >
                      <div className={`p-4 border-b ${theme.border}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {String(user?.global_name || user?.username || "U")
                                .slice(0, 1)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className={`${theme.text} font-medium`}>
                              {user?.global_name || user?.username}
                            </p>
                            <p className={`${theme.textSecondary} text-sm`}>Signed in</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowSettings(true);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hoverBg} flex items-center gap-3`}
                        >
                          <Settings className="w-4 h-4" /> App Settings
                        </button>
                      </div>

                      <div className={`border-t ${theme.border} p-2`}>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="px-6 pt-4">
        {dashError && (
          <div className="mb-4 text-sm text-red-400">
            {String(dashError)}
          </div>
        )}
        {(dashLoading || settingsLoading) && (
          <div className="mb-4 text-sm text-gray-400">Loading…</div>
        )}
      </div>

      <main className="px-6 py-6">
        {activeView === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard Overview</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/add-trade")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Trade
                </button>
                <button
                  onClick={() => setIsCustomizing((v) => !v)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isCustomizing ? "bg-blue-600 text-white hover:bg-blue-700" : theme.btn
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  {isCustomizing ? "Done Customizing" : "Customize Widgets"}
                </button>
              </div>
            </div>

            {isCustomizing && (
              <div
                className={`${
                  uiSettings.theme === "dark"
                    ? "bg-blue-900/10 border-blue-500/20"
                    : "bg-blue-50 border-blue-200"
                } border rounded-xl p-6`}
              >
                <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Widgets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableWidgets
                    .filter((w) => !dashboardWidgets.some((dw) => dw.type === w.type))
                    .map((w) => {
                      const Icon = w.icon;
                      return (
                        <button
                          key={w.type}
                          onClick={() =>
                            setDashboardWidgets((arr) => [
                              ...arr,
                              { id: Date.now().toString(), type: w.type, size: "small" },
                            ])
                          }
                          className={`p-4 ${theme.cardBg} ${theme.hoverBg} rounded-lg border ${theme.border} hover:border-blue-500 transition-all group`}
                        >
                          <Icon
                            className={`w-8 h-8 ${theme.textSecondary} group-hover:text-blue-400 mx-auto mb-2`}
                          />
                          <span className={`text-sm ${theme.textSecondary} block text-center`}>
                            {w.name}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardWidgets.map((w) => (
                <Widget key={w.id} widget={w} />
              ))}
            </div>
          </div>
        )}

        {activeView === "trades" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Trade History</h1>
              <div className="flex items-center gap-3">
                <button className={`${theme.btn} px-4 py-2 rounded-lg flex items-center gap-2`}>
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <select className={`${theme.input} rounded-lg px-4 py-2 text-sm border ${theme.border}`}>
                  <option>All Trades</option>
                  <option>Profitable Only</option>
                  <option>Losses Only</option>
                  <option>This Week</option>
                </select>
              </div>
            </div>

            <div className={`${theme.cardBg} rounded-xl overflow-hidden border ${theme.border}`}>
              <div className="p-6">
                <div className={`grid grid-cols-7 gap-4 ${theme.textSecondary} text-sm font-medium mb-4 pb-3 border-b ${theme.border}`}>
                  <span>Player</span>
                  <span>Position</span>
                  <span>Buy Price</span>
                  <span>Sell Price</span>
                  <span>Profit/Loss</span>
                  <span>Time</span>
                  <span>Actions</span>
                </div>

                {trades.length === 0 ? (
                  <div className={`${theme.textSecondary} text-sm`}>No trades found.</div>
                ) : (
                  <div className="space-y-1">
                    {trades.slice(0, 20).map((t, i) => (
                      <div key={i} className={`grid grid-cols-7 gap-4 py-3 text-sm ${theme.hoverBg} rounded-lg px-2`}>
                        <span className={`${theme.text} font-medium truncate`}>{t?.player ?? "Unknown"}</span>
                        <span className="text-red-400">{t?.position ?? t?.version ?? "-"}</span>
                        <span className={theme.textSecondary}>{formatCurrency(t?.buy ?? 0)}</span>
                        <span className={theme.textSecondary}>{formatCurrency(t?.sell ?? 0)}</span>
                        <span className={`${Number(t?.profit ?? 0) >= 0 ? "text-green-400" : "text-red-400"} font-medium`}>
                          {Number(t?.profit ?? 0) >= 0 ? "+" : ""}
                          {formatCurrency(
                            include_tax_in_profit
                              ? Number(t?.profit ?? 0) - Number(t?.ea_tax ?? 0)
                              : Number(t?.profit ?? 0)
                          )}
                        </span>
                        <span className={theme.textSecondary}>{t?.timestamp ? formatDate(t.timestamp) : "—"}</span>
                        <button className="text-blue-400 hover:text-blue-300">View</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === "watchlist" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Watchlist</h1>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Player
              </button>
            </div>
            <div className={`${theme.textTertiary}`}>Connect this to your real watchlist page/API.</div>
          </div>
        )}

        {activeView === "analytics" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Advanced Analytics</h1>
              <div className="flex items-center gap-3">
                <select className={`${theme.input} rounded-lg px-4 py-2 text-sm border ${theme.border}`}>
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>This Week</option>
                  <option>All Time</option>
                </select>
                <button className={`${theme.btn} px-4 py-2 rounded-lg flex items-center gap-2`}>
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${uiSettings.theme === "dark" ? "bg-green-500/20" : "bg-green-100"} rounded-xl flex items-center justify-center`}>
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>{formatCurrency(net)}</div>
                    <div className={`${theme.textSecondary} text-sm`}>Total Profit</div>
                  </div>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${uiSettings.theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"} rounded-xl flex items-center justify-center`}>
                    <Activity className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>{trades.length}</div>
                    <div className={`${theme.textSecondary} text-sm`}>Total Trades</div>
                  </div>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${uiSettings.theme === "dark" ? "bg-purple-500/20" : "bg-purple-100"} rounded-xl flex items-center justify-center`}>
                    <Target className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>
                      {trades.length
                        ? ((trades.filter((t) => Number(t?.profit ?? 0) > 0).length / trades.length) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className={`${theme.textSecondary} text-sm`}>Win Rate</div>
                  </div>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${uiSettings.theme === "dark" ? "bg-orange-500/20" : "bg-orange-100"} rounded-xl flex items-center justify-center`}>
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>
                      {trades.length ? formatCurrency(net / trades.length) : formatCurrency(0)}
                    </div>
                    <div className={`${theme.textSecondary} text-sm`}>Avg Profit</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-xl font-semibold mb-6 flex items-center gap-2`}>
                  <LineChart className="w-6 h-6 text-green-400" />
                  Profit Over Time
                </h3>
                <div className={`h-64 ${themes[uiSettings.theme].subtle} rounded-lg flex items-center justify-center`}>
                  <span className={theme.textTertiary}>Chart placeholder</span>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-xl font-semibold mb-6 flex items-center gap-2`}>
                  <PieChart className="w-6 h-6 text-blue-400" />
                  Profit Distribution
                </h3>
                <div className={`h-64 ${themes[uiSettings.theme].subtle} rounded-lg flex items-center justify-center`}>
                  <span className={theme.textTertiary}>Chart placeholder</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showSettings && <SettingsPanel />}
      {showUserMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
      )}
    </div>
  );
};

export default ThemedDashboard;