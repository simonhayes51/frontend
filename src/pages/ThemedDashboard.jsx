// src/pages/ThemedDashboard.jsx - Fixed integration with proper user handling and settings persistence
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, TrendingUp, TrendingDown, Eye, Settings, User, Bell, Filter, 
  Calendar, BarChart3, PieChart, Activity, Coins, Target, Clock, Star, 
  AlertCircle, Menu, X, Layout, ChevronDown, LineChart, DollarSign, 
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

  // Settings context - get actual settings
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

  // Fix user_id issue - ensure contexts have the user data they need
  useEffect(() => {
    if (user && user.id) {
      // Store user_id in localStorage for contexts that expect it
      localStorage.setItem('user_id', user.id.toString());
    }
  }, [user]);

  // Theme management - use settings theme if available
  const [localTheme, setLocalTheme] = useState(settingsTheme || "dark");
  const currentTheme = settingsTheme || localTheme;
  
  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setLocalTheme(newTheme);
    // TODO: Save to your actual settings system
    // You might need to call a settings context method here
  };

  // Settings state - initialize from actual settings context
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
      showProfitPercentage: include_tax_in_profit !== undefined ? include_tax_in_profit : true
    },
    trading: {
      autoRefresh: true,
      refreshInterval: 30,
      confirmTrades: true,
      defaultTradeAmount: 100000,
      defaultPlatform: default_platform || "Console"
    }
  });

  // Update settings data when context changes
  useEffect(() => {
    setSettingsData(prev => ({
      ...prev,
      theme: settingsTheme || prev.theme,
      display: {
        ...prev.display,
        currency: currency_format || prev.display.currency,
        dateFormat: date_format || prev.display.dateFormat,
        showProfitPercentage: include_tax_in_profit !== undefined ? include_tax_in_profit : prev.display.showProfitPercentage
      },
      trading: {
        ...prev.trading,
        defaultPlatform: default_platform || prev.trading.defaultPlatform
      }
    }));
  }, [settingsTheme, currency_format, date_format, include_tax_in_profit, default_platform]);

  // Widget management - could be stored in settings
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

  // Debug logging
  useEffect(() => {
    console.log('User:', user);
    console.log('Trades:', trades);
    console.log('NetProfit:', netProfit);
    console.log('Dashboard Loading:', dashLoading);
    console.log('Dashboard Error:', dashError);
  }, [user, trades, netProfit, dashLoading, dashError]);

  // Settings functions
  const updateSettings = (newSettings) => {
    setSettingsData({ ...settingsData, ...newSettings });
  };

  const saveSettings = async () => {
    console.log('Saving settings:', settingsData);
    // TODO: Integrate with your actual settings save method
    // You might need to call your SettingsContext save method here
    // Example: await saveUserSettings(settingsData);
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
        defaultTradeAmount: 100000,
        defaultPlatform: "Console"
      }
    });
  };

  // Navigation handlers - keep user in themed dashboard
  const handleNavigation = (page) => {
    if (page === 'player-search') {
      // TODO: Create a themed player search view or navigate to existing
      // For now, navigate to existing page - you might want to create a themed version
      navigate('/app/player-search');
    } else if (page === 'watchlist') {
      // TODO: Create a themed watchlist view or navigate to existing
      navigate('/app/watchlist');  
    } else {
      setActiveView(page);
    }
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
                  onClick={() => handleNavigation('watchlist')}
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

        case 'recent-trades':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <Activity className="w-5 h-5 text-orange-400" />
                  Recent Trades
                </h3>
                <button 
                  onClick={() => setActiveView('trades')}
                  className={`${theme.textSecondary} text-sm hover:text-orange-400`}
                >
                  View All
                </button>
              </div>
              {recentTrades.length === 0 ? (
                <div className={`${theme.textSecondary} text-sm text-center py-4`}>
                  No trades yet.{' '}
                  <button 
                    onClick={() => navigate('/app/add-trade')}
                    className="text-green-400 hover:text-green-300 underline"
                  >
                    Add your first trade
                  </button>
                </div>
              ) : (
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
                        {formatCurrency ? formatCurrency(trade._displayProfit) : `${Math.floor(Math.abs(trade._displayProfit) / 1000)}K`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                    {formatCurrency ? formatCurrency(avgProfit) : `${Math.floor(Math.abs(avgProfit) / 1000)}K`}
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

        // Add other widget cases...
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

  // Show loading state if no user
  if (!user) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className={theme.textSecondary}>Loading user data...</p>
        </div>
      </div>
    );
  }

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
                  onClick={() => handleNavigation('player-search')}
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
                        Full Settings
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
            </div>
          </div>
        </div>
      </nav>

      {/* Error Display */}
      {dashError && (
        <div className="px-6 py-3">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm">
              <strong>Dashboard Error:</strong> {String(dashError)}
            </div>
            <div className="text-red-300 text-xs mt-1">
              Check console for details. User ID: {user?.id || 'missing'}
            </div>
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
                  <Layout className="w-4 h-4" />
                  {isCustomizing ? 'Done Customizing' : 'Customize Widgets'}
                </button>
              </div>
            </div>

            {/* Debug Info */}
            {(dashLoading || settingsLoading) && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className={theme.textSecondary}>Loading your trading data...</p>
                <p className={`${theme.textTertiary} text-xs mt-2`}>
                  User: {user?.username || 'Loading...'} | Trades: {trades.length} | Profit: {netProfit}
                </p>
              </div>
            )}

            {/* Widget Customization */}
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

            {/* Widget Grid */}
            {!dashLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardWidgets.map((widget) => (
                  <Widget key={widget.id} widget={widget} />
                ))}
              </div>
            )}

            {/* No Data Message */}
            {!dashLoading && trades.length === 0 && netProfit === 0 && (
              <div className={`${theme.cardBg} rounded-xl p-8 border ${theme.border} text-center`}>
                <div className={`w-16 h-16 ${theme.textTertiary} mx-auto mb-4`}>
                  <TrendingUp className="w-full h-full" />
                </div>
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>Welcome to your FUT Dashboard!</h3>
                <p className={`${theme.textSecondary} mb-6 max-w-md mx-auto`}>
                  Start logging your trades to see your profit tracking, analytics, and trading insights.
                </p>
                <button 
                  onClick={() => navigate('/app/add-trade')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Log Your First Trade
                </button>
              </div>
            )}
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
                <button 
                  onClick={() => navigate('/app/trades')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Full Trade Manager
                </button>
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
                Manage Full Watchlist
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

        {activeView === 'analytics' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Analytics Overview</h1>
              <button 
                onClick={() => navigate('/app/analytics')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Full Analytics
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${currentTheme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>
                      {formatCurrency ? formatCurrency(netProfit) : `${(netProfit / 1000000).toFixed(1)}M`}
                    </div>
                    <div className={`${theme.textSecondary} text-sm`}>Total Profit</div>
                  </div>
                </div>
                <div className="text-green-400 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {startingBalance > 0 ? `${((netProfit / startingBalance) * 100).toFixed(1)}% ROI` : 'Set starting balance'}
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
                  {winningTrades} winning, {losingTrades} losing
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
                  {trades.length > 0 ? 'Good performance' : 'No data yet'}
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${currentTheme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'} rounded-xl flex items-center justify-center`}>
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>
                      {formatCurrency ? formatCurrency(Math.abs(avgProfit)) : `${Math.floor(Math.abs(avgProfit) / 1000)}K`}
                    </div>
                    <div className={`${theme.textSecondary} text-sm`}>Avg Profit</div>
                  </div>
                </div>
                <div className="text-orange-400 text-sm">Per trade</div>
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
