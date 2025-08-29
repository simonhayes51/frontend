import React, { useMemo, useState } from "react";
import {
  Search, Plus, TrendingUp, Eye, Settings as SettingsIcon, User, Bell, Filter, BarChart3, PieChart,
  Activity, Coins, Target, Clock, AlertCircle, X, ChevronDown, LineChart, DollarSign, Trophy, Sun, Moon, Save, RotateCcw, LayoutGrid
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useDashboard } from "../context/DashboardContext";

const ThemedDashboard = () => {
  const { theme: themeName, updateSettings, ...S } = useSettings();
  const { netProfit, taxPaid, startingBalance, trades, isLoading, error } = useDashboard();

  const [activeView, setActiveView] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

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
      button: "bg-gray-700 hover:bg-gray-600",
      input: "bg-gray-700 border-gray-600",
      hoverText: "hover:text-white",
      groupHoverText: "group-hover:text-white",
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
      button: "bg-gray-100 hover:bg-gray-200",
      input: "bg-white border-gray-300",
      hoverText: "hover:text-gray-900",
      groupHoverText: "group-hover:text-gray-900",
    },
  };
  const theme = themes[themeName];

  // widgets you want shown (can tie to S.visible_widgets later if you want to hide/show)
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

  // derived
  const gross = useMemo(() => (netProfit || 0) + (taxPaid || 0), [netProfit, taxPaid]);

  const SettingsPanel = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`${theme.cardBg} rounded-xl p-0 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden`}>
        <div className={`p-6 border-b ${theme.border}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
              <SettingsIcon className="w-6 h-6" /> Settings
            </h2>
            <button onClick={() => setShowSettings(false)} className={`p-2 rounded-lg ${theme.hoverBg} ${theme.textSecondary}`}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* simple settings (theme toggle) */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateSettings({ theme: "dark" })}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                themeName === "dark" ? "border-green-500 bg-green-500/10" : `border-gray-600 ${theme.hoverBg}`
              }`}
            >
              <Moon className="w-5 h-5" />
              <div>
                <div className={theme.text}>Dark</div>
                <div className={`${theme.textSecondary} text-xs`}>Default theme</div>
              </div>
            </button>
            <button
              onClick={() => updateSettings({ theme: "light" })}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                themeName === "light" ? "border-green-500 bg-green-500/10" : `border-gray-600 ${theme.hoverBg}`
              }`}
            >
              <Sun className="w-5 h-5 text-yellow-500" />
              <div>
                <div className={theme.text}>Light</div>
                <div className={`${theme.textSecondary} text-xs`}>Bright theme</div>
              </div>
            </button>
          </div>
        </div>

        <div className={`p-6 border-t ${theme.border} flex justify-end`}>
          <button onClick={() => setShowSettings(false)} className={`px-6 py-2 ${theme.button} ${theme.text} rounded-lg`}>Close</button>
        </div>
      </div>
    </div>
  );

  const WidgetCard = ({ children, size }) => (
    <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border} ${size === "large" ? "col-span-2" : ""}`}>{children}</div>
  );

  const Widgets = {
    "profit-tracker": () => (
      <WidgetCard size="large">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
            <TrendingUp className="w-5 h-5 text-green-400" /> Profit Tracker
          </h3>
          <div className="text-right">
            <div className="text-green-400 text-3xl font-bold">+{S.formatCurrency(netProfit)}{S.display?.currency === "coins" ? "" : ""}</div>
            {!S.include_tax_in_profit && (
              <div className={`${theme.textSecondary} text-xs`}>Before tax: {S.formatCurrency(gross)}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className={theme.textSecondary}>Tax Paid</span><span className="text-red-400">-{S.formatCurrency(taxPaid)}</span></div>
            <div className="flex justify-between"><span className={theme.textSecondary}>Starting Balance</span><span className={theme.text}>{S.formatCurrency(startingBalance)}</span></div>
            <div className="flex justify-between"><span className={theme.textSecondary}>Trades</span><span className={theme.text}>{trades.length}</span></div>
          </div>
          <div className={`h-20 ${themeName === "dark" ? "bg-gray-700" : "bg-gray-100"} rounded-lg flex items-center justify-center`}>
            <span className={`${theme.textTertiary} text-xs`}>Chart</span>
          </div>
        </div>
      </WidgetCard>
    ),
    "recent-trades": () => (
      <WidgetCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
            <Activity className="w-5 h-5 text-orange-400" /> Recent Trades
          </h3>
          <span className={`${theme.textSecondary} text-sm`}>Showing {Math.min(trades.length, 5)}</span>
        </div>
        {isLoading ? (
          <div className={theme.textSecondary}>Loading…</div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : trades.length === 0 ? (
          <div className={theme.textSecondary}>No trades yet</div>
        ) : (
          <div className="space-y-2 text-sm">
            {trades.slice(0, 5).map((t, i) => {
              const profit = S.calculateProfit({ profit: t?.profit ?? 0, ea_tax: t?.ea_tax ?? 0 });
              return (
                <div key={i} className="flex justify-between">
                  <span className={theme.textSecondary}>{t?.player ?? "Unknown"}</span>
                  <span className={profit >= 0 ? "text-green-400" : "text-red-400"}>
                    {profit >= 0 ? "+" : ""}{S.formatCurrency(profit)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </WidgetCard>
    ),
    "watchlist-preview": () => (
      <WidgetCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
            <Eye className="w-5 h-5 text-blue-400" /> Watchlist
          </h3>
          <span className={`${theme.textSecondary} text-sm`}>demo</span>
        </div>
        <div className={`${theme.textSecondary} text-sm`}>Hook to your watchlist API next.</div>
      </WidgetCard>
    ),
    "market-trends": () => (
      <WidgetCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
            <BarChart3 className="w-5 h-5 text-purple-400" /> Market Trends
          </h3>
        </div>
        <div className={`${theme.textSecondary} text-sm`}>Wire to your market endpoint.</div>
      </WidgetCard>
    ),
    "quick-analytics": () => (
      <WidgetCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
            <PieChart className="w-5 h-5 text-cyan-400" /> Quick Stats
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className={theme.textSecondary}>Win Rate</span><span className={theme.text}>
            {trades.length ? `${((trades.filter(t => (t?.profit ?? 0) > 0).length / trades.length) * 100).toFixed(1)}%` : "—"}
          </span></div>
          <div className="flex justify-between"><span className={theme.textSecondary}>Best Trade</span>
            <span className="text-green-400">
              {trades.length ? S.formatCurrency(Math.max(...trades.map(t => t?.profit ?? 0))) : "—"}
            </span>
          </div>
        </div>
      </WidgetCard>
    ),
    "price-alerts": () => (
      <WidgetCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
            <Bell className="w-5 h-5 text-yellow-400" /> Price Alerts
          </h3>
          <span className="text-red-400 text-xs bg-red-400/20 px-2 py-1 rounded-full">demo</span>
        </div>
        <div className={`${theme.textSecondary} text-sm`}>Connect to your alerts feed.</div>
      </WidgetCard>
    ),
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      {/* Top Nav */}
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
                {["dashboard","trades","watchlist","analytics"].map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeView === key ? "bg-green-600 text-white" : `${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText}`
                    }`}
                  >
                    {key[0].toUpperCase()+key.slice(1)}
                  </button>
                ))}
                <button className={`px-4 py-2 rounded-lg font-medium ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} flex items-center gap-2`}>
                  <Search className="w-4 h-4" /> Player Search
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => updateSettings({ theme: themeName === "dark" ? "light" : "dark" })}
                className={`p-2 rounded-lg ${theme.hoverBg} ${theme.textSecondary} ${theme.hoverText}`}
              >
                {themeName === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className={`p-2 rounded-lg ${theme.hoverBg} ${theme.textSecondary} ${theme.hoverText} relative`}>
                <Bell className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-3 ${theme.button} rounded-lg px-4 py-2 ${theme.text}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">W</span>
                  </div>
                  <span className="hidden md:block font-medium">whatthefut</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-56 ${theme.cardBg} rounded-xl shadow-2xl border ${theme.border} z-50`}>
                    <div className="py-2">
                      <button
                        onClick={() => { setShowSettings(true); setShowUserMenu(false); }}
                        className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} flex items-center gap-3`}
                      >
                        <SettingsIcon className="w-4 h-4" /> App Settings
                      </button>
                      <button className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} flex items-center gap-3`}>
                        <AlertCircle className="w-4 h-4" /> Help & Support
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="px-6 py-8">
        {activeView === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard Overview</h1>
              <div className="flex items-center gap-3">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Trade
                </button>
                <button
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isCustomizing ? "bg-blue-600 text-white" : `${theme.button} ${theme.text}`}`}
                >
                  <LayoutGrid className="w-4 h-4" /> {isCustomizing ? "Done Customizing" : "Customize Widgets"}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className={`${theme.textSecondary}`}>Loading dashboard…</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardWidgets.map((w) => {
                const Comp = Widgets[w.type];
                return <div key={w.id} className={w.size === "large" ? "md:col-span-2" : ""}>{Comp ? <Comp/> : null}</div>;
              })}
            </div>
          </div>
        )}

        {activeView === "analytics" && (
          <div className={`${theme.textSecondary}`}>Analytics content (hook charts later)</div>
        )}

        {activeView === "trades" && (
          <div className={`${theme.textSecondary}`}>Trades table (reuse your /trades list component)</div>
        )}

        {activeView === "watchlist" && (
          <div className={`${theme.textSecondary}`}>Watchlist (connect to your watchlist endpoint)</div>
        )}
      </main>

      {showSettings && <SettingsPanel />}
      {showUserMenu && <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />}
    </div>
  );
};

export default ThemedDashboard;