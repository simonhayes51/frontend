// src/pages/ThemedDashboard.jsx - Complete integrated version
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, TrendingUp, TrendingDown, Eye, Settings, User, Bell, Filter, 
  Calendar, BarChart3, PieChart, Activity, Coins, Target, Clock, Star, 
  AlertCircle, Menu, X, Grid3x3, ChevronDown, LineChart, DollarSign, 
  Trophy, Sun, Moon, Save, RotateCcw
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../context/DashboardContext";
import { useSettings } from "../context/SettingsContext";

const ThemedDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Dashboard context
  const {
    netProfit: rawNet,
    taxPaid: rawTax,
    startingBalance: rawStart,
    trades: rawTrades,
    isLoading: dashLoading,
    error: dashError,
  } = useDashboard();

  // Settings context
  const {
    formatCurrency,
    formatDate,
    include_tax_in_profit,
    custom_tags,
    default_platform,
    theme: settingsTheme,
    currency_format,
    date_format,
    visible_widgets,
    isLoading: settingsLoading,
  } = useSettings();

  // Local UI state
  const [activeView, setActiveView] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Theme management
  const [localTheme, setLocalTheme] = useState("dark");
  const currentTheme = settingsTheme || localTheme;
  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setLocalTheme(newTheme);
  };

  // Settings state for the modal
  const [settingsData, setSettingsData] = useState({
    theme: currentTheme,
    notifications: {
      priceAlerts: true,
      tradeConfirmations: true,
      marketUpdates: false,
      weeklyReports: true
    },
    display: {
      currency: currency_format || "coins",
      dateFormat: date_format || "relative",
      compactMode: false,
      showProfitPercentage: true
    },
    trading: {
      autoRefresh: true,
      refreshInterval: 30,
      confirmTrades: true,
      defaultTradeAmount: 100000
    }
  });

  // Widget management
  const [dashboardWidgets, setDashboardWidgets] = useState([
    { id: "profit", type: "profit-tracker", size: "large" },
    { id: "watchlist", type: "watchlist-preview", size: "medium" },
    { id: "market", type: "market-trends", size: "medium" },
    { id: "trades", type: "recent-trades", size: "small" },
    { id: "analytics", type: "quick-analytics", size: "small" },
    { id: "alerts", type: "price-alerts", size: "small" }
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
    { type: "top-investments", name: "Top Investments", icon: Star },
    { type: "win-rate", name: "Win Rate Tracker", icon: Target },
    { type: "trading-calendar", name: "Trading Calendar", icon: Calendar }
  ];

  // Theme configuration
  const themes = {
    dark: {
      bg: "bg-gray-900",
      cardBg: "bg-gray-800",
      navBg: "bg-gray-800",
      border: "border-gray-700",
      text: "text-white",
      textSecondary: "text-gray-400",
      textTertiary: "text-gray-500",
      hover: "hover:bg-gray-700",
      button: "bg-gray-700 hover:bg-gray-600",
      input: "bg-gray-700 border-gray-600",
      subtle: "bg-gray-700"
    },
    light: {
      bg: "bg-gray-50",
      cardBg: "bg-white",
      navBg: "bg-white",
      border: "border-gray-200",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      textTertiary: "text-gray-400",
      hover: "hover:bg-gray-50",
      button: "bg-gray-100 hover:bg-gray-200",
      input: "bg-white border-gray-300",
      subtle: "bg-gray-100"
    }
  };

  const theme = themes[currentTheme];

  // Data processing with safe fallbacks
  const trades = Array.isArray(rawTrades) ? rawTrades : [];
  const netProfit = Number(rawNet ?? 0);
  const taxPaid = Number(rawTax ?? 0);
  const startingBalance = Number(rawStart ?? 0);
  const grossProfit = netProfit + taxPaid;
  const taxPercentage = grossProfit > 0 ? (taxPaid / grossProfit) * 100 : 0;

  // Recent trades processing
  const recentTrades = useMemo(() => {
    return trades.slice(0, 10).map((trade) => {
      const baseProfit = Number(trade?.profit ?? 0);
      const eaTax = Number(trade?.ea_tax ?? 0);
      const displayProfit = include_tax_in_profit ? baseProfit - eaTax : baseProfit;
      return { ...trade, _displayProfit: displayProfit };
    });
  }, [trades, include_tax_in_profit]);

  // Quick stats
  const winningTrades = trades.filter(t => Number(t?.profit ?? 0) > 0).length;
  const losingTrades = trades.filter(t => Number(t?.profit ?? 0) < 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => Number(t?.profit ?? 0))) : 0;
  const avgProfit = trades.length > 0 ? netProfit / trades.length : 0;

  // Settings functions
  const updateSettings = (newSettings) => {
    setSettingsData({ ...settingsData, ...newSettings });
  };

  const saveSettings = () => {
    console.log('Settings saved:', settingsData);
    setShowSettings(false);
  };

  const resetSettings = () => {
    setSettingsData({
      theme: "dark",
      notifications: {
        priceAlerts: true,
        tradeConfirmations: true,
        marketUpdates: false,
        weeklyReports: true
      },
      display: {
        currency: "coins",
        dateFormat: "relative", 
        compactMode: false,
        showProfitPercentage: true
      },
      trading: {
        autoRefresh: true,
        refreshInterval: 30,
        confirmTrades: true,
        defaultTradeAmount: 100000
      }
    });
  };

  // Widget component
  const Widget = ({ widget }) => {
    const widgetConfig = availableWidgets.find(w => w.type === widget.type);
    const Icon = widgetConfig?.icon || Activity;

    const removeWidget = () => {
      setDashboardWidgets(dashboardWidgets.filter(w => w.id !== widget.id));
    };

    const baseClasses = `${theme.cardBg} rounded-xl p-6 border ${theme.border} relative group transition-all ${
      widget.size === 'large' ? 'col-span-2' : ''
    } ${isCustomizing ? 'border-dashed border-blue-500' : ''}`;

    const getWidgetContent = () => {
      switch (widget.type) {
        case 'profit-tracker':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Profit Tracker
                </h3>
                <div className="text-right">
                  <div className="text-green-400 text-3xl font-bold">
                    {formatCurrency ? formatCurrency(netProfit) : `${netProfit.toLocaleString()}`}
                  </div>
                  <div className="text-green-400 text-sm">
                    {include_tax_in_profit ? 'Net Profit' : 'Gross Profit'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme.textSecondary}>EA Tax Paid</span>
                    <span className="text-red-400">
                      {formatCurrency ? formatCurrency(taxPaid) : `${taxPaid.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme.textSecondary}>Win Rate</span>
                    <span className={theme.text}>{winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme.textSecondary}>Total Trades</span>
                    <span className="text-purple-400">{trades.length}</span>
                  </div>
                </div>
                <div className={`h-20 ${theme.subtle} rounded-lg flex items-center justify-center`}>
                  <span className={`${theme.textTertiary} text-xs`}>
                    {taxPercentage > 0 ? `${taxPercentage.toFixed(1)}% tax` : 'Mini Chart'}
                  </span>
                </div>
              </div>
            </>
          );

        case 'watchlist-preview':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Eye className="w-5 h-5 text-blue-400" />
                  Watchlist
                </h3>
                <button 
                  onClick={() => navigate('/app/watchlist')}
                  className={`${theme.textSecondary} text-sm hover:text-blue-400`}
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded"></div>
                    <span className={`${theme.textSecondary} text-sm`}>Mbappé</span>
                  </div>
                  <span className="text-red-400 text-sm">-2.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                    <span className={`${theme.textSecondary} text-sm`}>Haaland</span>
                  </div>
                  <span className="text-green-400 text-sm">+1.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
                    <span className={`${theme.textSecondary} text-sm`}>Bellingham</span>
                  </div>
                  <span className="text-green-400 text-sm">+0.8%</span>
                </div>
              </div>
            </>
          );

        case 'market-trends':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Market Trends
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>La Liga</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">3.2%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Premier League</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">1.1%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Icons</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">5.7%</span>
                  </div>
                </div>
              </div>
            </>
          );

        case 'recent-trades':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Activity className="w-5 h-5 text-orange-400" />
                  Recent Trades
                </h3>
                <button 
                  onClick={() => navigate('/app/trades')}
                  className={`${theme.textSecondary} text-sm hover:text-orange-400`}
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {recentTrades.slice(0, 5).map((trade, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded text-xs flex items-center justify-center text-white font-bold">
                        {trade?.version?.slice(0, 2) || 'ST'}
                      </div>
                      <span className={`${theme.textSecondary} truncate`}>
                        {trade?.player?.split(' ')[0] || 'Unknown'}
                      </span>
                    </div>
                    <span className={`font-medium ${trade._displayProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade._displayProfit >= 0 ? '+' : ''}
                      {formatCurrency ? formatCurrency(trade._displayProfit) : `${Math.floor(trade._displayProfit / 1000)}K`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          );

        case 'quick-analytics':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <PieChart className="w-5 h-5 text-cyan-400" />
                  Quick Analytics
                </h3>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{winRate.toFixed(1)}%</div>
                  <div className={`${theme.textSecondary} text-xs`}>Win Rate</div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Avg Profit</span>
                  <span className="text-green-400">
                    {formatCurrency ? formatCurrency(avgProfit) : `${Math.floor(avgProfit / 1000)}K`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Best Trade</span>
                  <span className="text-green-400">
                    {formatCurrency ? formatCurrency(bestTrade) : `${Math.floor(bestTrade / 1000)}K`}
                  </span>
                </div>
              </div>
            </>
          );

        case 'price-alerts':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Price Alerts
                </h3>
                <span className="text-red-400 text-xs bg-red-400/20 px-2 py-1 rounded-full">
                  {losingTrades}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Mbappé</span>
                  <span className="text-orange-400 text-xs bg-orange-400/20 px-2 py-1 rounded">Below 950K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Haaland</span>
                  <span className="text-green-400 text-xs bg-green-400/20 px-2 py-1 rounded">Above 900K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Vini Jr.</span>
                  <span className="text-orange-400 text-xs bg-orange-400/20 px-2 py-1 rounded">Below 700K</span>
                </div>
              </div>
            </>
          );

        case 'coin-balance':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Coin Balance
                </h3>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-yellow-400">
                  {formatCurrency ? formatCurrency(startingBalance + netProfit) : `${((startingBalance + netProfit) / 1000000).toFixed(1)}M`}
                </div>
                <div className={`${theme.textSecondary} text-sm`}>Current Balance</div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Starting</span>
                    <span className={theme.text}>{formatCurrency ? formatCurrency(startingBalance) : `${(startingBalance / 1000000).toFixed(1)}M`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Net Profit</span>
                    <span className="text-green-400">{formatCurrency ? formatCurrency(netProfit) : `${(netProfit / 1000000).toFixed(1)}M`}</span>
                  </div>
                </div>
              </div>
            </>
          );

        case 'competition-tracker':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Competitions
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Weekend League</span>
                  <span className="text-green-400">16-4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Squad Battles</span>
                  <span className="text-blue-400">Elite 1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Division Rivals</span>
                  <span className="text-purple-400">Div 3</span>
                </div>
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
      <div className={baseClasses}>
        {isCustomizing && (
          <button
            onClick={removeWidget}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {getWidgetContent()}
      </div>
    );
  };

  // Settings Panel Component
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
              className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg ${theme.hover}`}
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
                onClick={() => {
                  updateSettings({ theme: "dark" });
                  setLocalTheme("dark");
                }}
                className={`px-4 py-2 rounded-lg border ${currentTheme === "dark" ? "border-green-500" : theme.border} ${theme.text} ${theme.hover} flex items-center gap-2`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
              <button
                onClick={() => {
                  updateSettings({ theme: "light" });
                  setLocalTheme("light");
                }}
                className={`px-4 py-2 rounded-lg border ${currentTheme === "light" ? "border-green-500" : theme.border} ${theme.text} ${theme.hover} flex items-center gap-2`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
            </div>
          </div>

          <div>
            <h3 className={`${theme.text} text-lg font-semibold mb-4`}>Notifications</h3>
            <div className="space-y-4">
              {[
                { key: 'priceAlerts', label: 'Price Alerts', description: 'Get notified when players reach target prices' },
                { key: 'tradeConfirmations', label: 'Trade Confirmations', description: 'Confirm successful trades' },
                { key: 'marketUpdates', label: 'Market Updates', description: 'Daily market trend notifications' },
                { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly trading performance summary' }
              ].map((notification) => (
                <label key={notification.key} className="flex items-center justify-between">
                  <div>
                    <div className={`${theme.text} text-sm font-medium`}>{notification.label}</div>
                    <div className={`${theme.textSecondary} text-xs`}>{notification.description}</div>
                  </div>
                  <button
                    onClick={() => updateSettings({
                      notifications: {
                        ...settingsData.notifications,
                        [notification.key]: !settingsData.notifications[notification.key]
                      }
                    })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settingsData.notifications[notification.key] ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                      settingsData.notifications[notification.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={resetSettings}
              className={`px-4 py-2 ${theme.button} ${theme.text} rounded-lg flex items-center gap-2 transition-colors`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className={`px-6 py-2 ${theme.button} ${theme.text} rounded-lg transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      {/* Top Navigation */}
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
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === 'dashboard' ? 'bg-green-600 text-white' : `${theme.textSecondary} hover:${theme.text} ${theme.hover}`
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveView('trades')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === 'trades' ? 'bg-green-600 text-white' : `${theme.textSecondary} hover:${theme.text} ${theme.hover}`
                  }`}
                >
                  Trades
                </button>
                <button 
                  onClick={() => setActiveView('watchlist')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === 'watchlist' ? 'bg-green-600 text-white' : `${theme.textSecondary} hover:${theme.text} ${theme.hover}`
                  }`}
                >
                  Watchlist
                </button>
                <button 
                  onClick={() => setActiveView('analytics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === 'analytics' ? 'bg-green-600 text-white' : `${theme.textSecondary} hover:${theme.text} ${theme.hover}`
                  }`}
                >
                  Analytics
                </button>
                <button 
                  onClick={() => navigate('/app/player-search')}
                  className={`px-4 py-2 rounded-lg font-medium ${theme.textSecondary} hover:${theme.text} ${theme.hover} flex items-center gap-2`}
                >
                  <Search className="w-4 h-4" />
                  Player Search
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg ${theme.hover} transition-colors`}
              >
                {currentTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg ${theme.hover} relative transition-colors`}>
                <Bell className="w-5 h-5" />
                {settingsData.notifications.priceAlerts && losingTrades > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {losingTrades}
                  </span>
                )}
              </button>

              {!user ? (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Login
                </button>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-3 ${theme.button} ${theme.hover} rounded-lg px-4 py-2 ${theme.text} transition-colors`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {String(user?.global_name || user?.username || 'U').slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block font-medium">
                      {user?.global_name || user?.username || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className={`absolute right-0 mt-2 w-56 ${theme.cardBg} rounded-xl shadow-2xl border ${theme.border} z-50`}>
                      <div className={`p-4 border-b ${theme.border}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {String(user?.global_name || user?.username || 'U').slice(0, 1).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className={`${theme.text} font-medium`}>{user?.global_name || user?.username}</p>
                            <p className={`${theme.textSecondary} text-sm`}>Elite Trader</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <button 
                          onClick={() => navigate('/app/profile')}
                          className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}
                        >
                          <User className="w-4 h-4" />
                          Profile Settings
                        </button>
                        <button 
                          onClick={() => {
                            setShowSettings(true);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}
                        >
                          <Settings className="w-4 h-4" />
                          App Settings
                        </button>
                        <button 
                          onClick={() => navigate('/app/settings')}
                          className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}
                        >
                          <Bell className="w-4 h-4" />
                          Notifications
                        </button>
                        <button className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}>
                          <AlertCircle className="w-4 h-4" />
                          Help & Support
                        </button>
                      </div>
                      
                      <div className={`border-t ${theme.border} p-2`}>
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors rounded-lg"
                        >
                          Sign Out
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

      {dashError && (
        <div className="px-6 py-3">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm">Error: {String(dashError)}</div>
          </div>
        </div>
      )}

      <main className="px-6 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard Overview</h1>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/app/add-trade')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Trade
                </button>
                <button 
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isCustomizing 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : `${theme.button} ${theme.text}`
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  {isCustomizing ? 'Done Customizing' : 'Customize Widgets'}
                </button>
              </div>
            </div>

            {(dashLoading || settingsLoading) && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className={theme.textSecondary}>Loading your trading data...</p>
              </div>
            )}

            {isCustomizing && !dashLoading && (
              <div className={`${currentTheme === 'dark' ? 'bg-blue-900/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border rounded-xl p-6`}>
                <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Widgets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableWidgets.filter(widget => !dashboardWidgets.some(w => w.type === widget.type)).map((widget) => {
                    const Icon = widget.icon;
                    return (
                      <button
                        key={widget.type}
                        onClick={() => {
                          setDashboardWidgets([...dashboardWidgets, {
                            id: Date.now().toString(),
                            type: widget.type,
                            size: 'small'
                          }]);
                        }}
                        className={`p-4 ${theme.cardBg} ${theme.hover} rounded-lg border ${theme.border} hover:border-blue-500 transition-all group`}
                      >
                        <Icon className={`w-8 h-8 ${theme.textSecondary} group-hover:text-blue-400 mx-auto mb-2 transition-colors`} />
                        <span className={`text-sm ${theme.textSecondary} group-hover:${theme.text} transition-colors block text-center`}>{widget.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!dashLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardWidgets.map((widget) => (
                  <Widget key={widget.id} widget={widget} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Advanced Analytics</h1>
              <div className="flex items-center gap-3">
                <select className={`${theme.input} ${theme.text} rounded-lg px-4 py-2 text-sm border ${theme.border}`}>
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>This Week</option>
                  <option>All Time</option>
                </select>
                <button className={`${theme.button} ${theme.text} px-4 py-2 rounded-lg flex items-center gap-2`}>
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${currentTheme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>
                      {formatCurrency ? formatCurrency(netProfit) : `+${(netProfit / 1000000).toFixed(1)}M`}
                    </div>
                    <div className={`${theme.textSecondary} text-sm`}>Total Profit</div>
                  </div>
                </div>
                <div className="text-green-400 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {startingBalance > 0 ? `+${((netProfit / startingBalance) * 100).toFixed(1)}% ROI` : 'No starting balance set'}
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${currentTheme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                    <Activity className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>{trades.length}</div>
                    <div className={`${theme.textSecondary} text-sm`}>Total Trades</div>
                  </div>
                </div>
                <div className="text-blue-400 text-sm">
                  {trades.filter(t => {
                    const tradeDate = new Date(t.timestamp);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return tradeDate > weekAgo;
                  }).length} trades this week
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${currentTheme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-xl flex items-center justify-center`}>
                    <Target className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>{winRate.toFixed(1)}%</div>
                    <div className={`${theme.textSecondary} text-sm`}>Win Rate</div>
                  </div>
                </div>
                <div className="text-purple-400 text-sm">
                  {winningTrades}W / {losingTrades}L
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${currentTheme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'} rounded-xl flex items-center justify-center`}>
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>
                      {formatCurrency ? formatCurrency(avgProfit) : `${Math.floor(avgProfit / 1000)}K`}
                    </div>
                    <div className={`${theme.textSecondary} text-sm`}>Avg Profit</div>
                  </div>
                </div>
                <div className="text-orange-400 text-sm">Per successful trade</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-xl font-semibold mb-6 flex items-center gap-2`}>
                  <LineChart className="w-6 h-6 text-green-400" />
                  Profit Over Time
                </h3>
                <div className={`h-80 ${theme.subtle} rounded-lg flex items-center justify-center mb-4`}>
                  <div className="text-center">
                    <LineChart className={`w-16 h-16 ${theme.textTertiary} mx-auto mb-2`} />
                    <span className={theme.textSecondary}>Interactive Line Chart</span>
                    <div className={`${theme.textTertiary} text-sm mt-1`}>Daily profit tracking</div>
                  </div>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-xl font-semibold mb-6 flex items-center gap-2`}>
                  <PieChart className="w-6 h-6 text-blue-400" />
                  Trading Distribution
                </h3>
                <div className={`h-80 ${theme.subtle} rounded-lg flex items-center justify-center mb-4`}>
                  <div className="text-center">
                    <PieChart className={`w-16 h-16 ${theme.textTertiary} mx-auto mb-2`} />
                    <span className={theme.textSecondary}>Platform & Tag Breakdown</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'trades' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Trade History</h1>
              <div className="flex items-center gap-3">
                <button className={`${theme.button} ${theme.text} px-4 py-2 rounded-lg flex items-center gap-2`}>
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <select className={`${theme.input} ${theme.text} rounded-lg px-4 py-2 text-sm border ${theme.border}`}>
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
                  <span>Version</span>
                  <span>Buy Price</span>
                  <span>Sell Price</span>
                  <span>Profit/Loss</span>
                  <span>Platform</span>
                  <span>Date</span>
                </div>
                {trades.length === 0 ? (
                  <div className="text-center py-8">
                    <div className={`${theme.textSecondary} mb-2`}>No trades logged yet</div>
                    <p className={`text-sm ${theme.textTertiary}`}>
                      <button 
                        onClick={() => navigate('/app/add-trade')}
                        className="text-green-400 hover:text-green-300 underline"
                      >
                        Add your first trade
                      </button> to see your progress here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {trades.slice(0, 20).map((trade, i) => {
                      const baseProfit = Number(trade?.profit ?? 0);
                      const eaTax = Number(trade?.ea_tax ?? 0);
                      const displayProfit = include_tax_in_profit ? baseProfit - eaTax : baseProfit;
                      
                      return (
                        <div key={i} className={`grid grid-cols-7 gap-4 py-3 text-sm ${theme.hover} rounded-lg px-2`}>
                          <span className={`${theme.text} font-medium`}>{trade?.player || 'Unknown'}</span>
                          <span className={`${theme.textSecondary}`}>{trade?.version || 'Base'}</span>
                          <span className={theme.textSecondary}>
                            {formatCurrency ? formatCurrency(Number(trade?.buy ?? 0)) : `${Number(trade?.buy ?? 0).toLocaleString()}`}
                          </span>
                          <span className={theme.textSecondary}>
                            {formatCurrency ? formatCurrency(Number(trade?.sell ?? 0)) : `${Number(trade?.sell ?? 0).toLocaleString()}`}
                          </span>
                          <span className={`font-medium ${displayProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {displayProfit >= 0 ? '+' : ''}
                            {formatCurrency ? formatCurrency(displayProfit) : `${displayProfit.toLocaleString()}`}
                          </span>
                          <span className={theme.textSecondary}>{trade?.platform || 'Console'}</span>
                          <span className={theme.textSecondary}>
                            {trade?.timestamp ? formatDate ? formatDate(trade.timestamp) : new Date(trade.timestamp).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'watchlist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Watchlist</h1>
              <button 
                onClick={() => navigate('/app/watchlist')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Manage Watchlist
              </button>
            </div>
            
            <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
              <div className="text-center py-12">
                <Eye className={`w-16 h-16 ${theme.textTertiary} mx-auto mb-4`} />
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>Player Watchlist</h3>
                <p className={`${theme.textSecondary} mb-6 max-w-md mx-auto`}>
                  Track your favorite players' prices and get notifications when they hit your target prices.
                </p>
                <button 
                  onClick={() => navigate('/app/watchlist')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Go to Full Watchlist
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showSettings && <SettingsPanel />}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default ThemedDashboard;
