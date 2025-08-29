// src/pages/Overview.jsx
// Full themed Overview page (self-contained, no external contexts)
import React, { useState, useEffect } from 'react';
import {
  Search, Plus, TrendingUp, TrendingDown, Eye, Settings, User, Bell, Filter,
  Calendar, BarChart3, PieChart, Activity, Coins, Target, Clock, Star,
  AlertCircle, Menu, X, Grid3x3, ChevronDown, LineChart, DollarSign, Trophy,
  Sun, Moon, Save, RotateCcw
} from 'lucide-react';

const Overview = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Settings state (local to this page)
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: {
      priceAlerts: true,
      tradeConfirmations: true,
      marketUpdates: false,
      weeklyReports: true
    },
    display: {
      currency: 'coins',
      dateFormat: 'relative',
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

  const [dashboardWidgets, setDashboardWidgets] = useState([
    { id: 'profit', type: 'profit-tracker', size: 'large' },
    { id: 'watchlist', type: 'watchlist-preview', size: 'medium' },
    { id: 'market', type: 'market-trends', size: 'medium' },
    { id: 'trades', type: 'recent-trades', size: 'small' },
    { id: 'analytics', type: 'quick-analytics', size: 'small' },
    { id: 'alerts', type: 'price-alerts', size: 'small' }
  ]);

  const availableWidgets = [
    { type: 'profit-tracker', name: 'Profit Tracker', icon: TrendingUp },
    { type: 'watchlist-preview', name: 'Watchlist Preview', icon: Eye },
    { type: 'market-trends', name: 'Market Trends', icon: BarChart3 },
    { type: 'recent-trades', name: 'Recent Trades', icon: Activity },
    { type: 'quick-analytics', name: 'Quick Analytics', icon: PieChart },
    { type: 'price-alerts', name: 'Price Alerts', icon: Bell },
    { type: 'coin-balance', name: 'Coin Balance', icon: Coins },
    { type: 'competition-tracker', name: 'Competitions', icon: Trophy }
  ];

  // Theme configuration
  const themes = {
    dark: {
      bg: 'bg-gray-900',
      cardBg: 'bg-gray-800',
      navBg: 'bg-gray-800',
      border: 'border-gray-700',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      textTertiary: 'text-gray-500',
      hover: 'hover:bg-gray-700',
      button: 'bg-gray-700 hover:bg-gray-600',
      input: 'bg-gray-700 border-gray-600'
    },
    light: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white',
      navBg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textTertiary: 'text-gray-400',
      hover: 'hover:bg-gray-50',
      button: 'bg-gray-100 hover:bg-gray-200',
      input: 'bg-white border-gray-300'
    }
  };

  // (Optional) Persist theme locally so it sticks on refresh
  useEffect(() => {
    const saved = localStorage.getItem('ft_overview_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed === 'dark' || parsed === 'light')) {
          setSettings((s) => ({ ...s, theme: parsed }));
        }
      } catch {}
    }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('ft_overview_theme', JSON.stringify(settings.theme)); } catch {}
  }, [settings.theme]);

  const theme = themes[settings.theme];

  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
  };

  const saveSettings = () => {
    // In a real app, persist to API or shared context
    console.log('Settings saved:', settings);
    setShowSettings(false);
  };

  const resetSettings = () => {
    setSettings({
      theme: 'dark',
      notifications: {
        priceAlerts: true,
        tradeConfirmations: true,
        marketUpdates: false,
        weeklyReports: true
      },
      display: {
        currency: 'coins',
        dateFormat: 'relative',
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

  const Widget = ({ widget }) => {
    const widgetConfig = availableWidgets.find(w => w.type === widget.type);
    const Icon = widgetConfig?.icon || Activity;

    const removeWidget = () => {
      setDashboardWidgets(dashboardWidgets.filter(w => w.id !== widget.id));
    };

    const getContent = () => {
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
                  <div className="text-green-400 text-3xl font-bold">+2.3M</div>
                  <div className="text-green-400 text-sm">This Month</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme.textSecondary}>Today</span>
                    <span className="text-green-400">+125K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme.textSecondary}>This Week</span>
                    <span className="text-green-400">+450K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme.textSecondary}>Win Rate</span>
                    <span className={theme.text}>73%</span>
                  </div>
                </div>
                <div className={`h-20 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                  <span className={`${theme.textTertiary} text-xs`}>Chart</span>
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
                <span className={`${theme.textSecondary} text-sm`}>12 players</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Mbappé</span>
                  <span className="text-red-400 text-sm">-2.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Haaland</span>
                  <span className="text-green-400 text-sm">+1.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Bellingham</span>
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
                  <span className="text-green-400 text-sm">↑ 3.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Premier League</span>
                  <span className="text-red-400 text-sm">↓ 1.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme.textSecondary} text-sm`}>Icons</span>
                  <span className="text-green-400 text-sm">↑ 5.7%</span>
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
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Mbappé</span>
                  <span className="text-green-400">+50K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Haaland</span>
                  <span className="text-green-400">+70K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Vini Jr.</span>
                  <span className="text-red-400">-35K</span>
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
                <span className="text-red-400 text-xs bg-red-400/20 px-2 py-1 rounded-full">3</span>
              </div>
              <div className="space-y-2">
                <div className={`text-sm ${theme.textSecondary}`}>Mbappé below 950K</div>
                <div className={`text-sm ${theme.textSecondary}`}>Haaland above 900K</div>
                <div className={`text-sm ${theme.textSecondary}`}>Vini Jr. below 700K</div>
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
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">2.8M</div>
                <div className={`${theme.textSecondary} text-sm`}>Available Coins</div>
              </div>
            </>
          );

        case 'quick-analytics':
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${theme.text} font-semibold flex items-center gap-2`}>
                  <PieChart className="w-5 h-5 text-cyan-400" />
                  Quick Stats
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Win Rate</span>
                  <span className={theme.text}>73%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Avg Profit</span>
                  <span className="text-green-400">18K</span>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Weekend League</span>
                  <span className="text-green-400">16-4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>Squad Battles</span>
                  <span className="text-blue-400">Elite 1</span>
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
      <div
        className={`${theme.cardBg} rounded-xl p-6 border ${theme.border} relative group ${
          widget.size === 'large' ? 'col-span-2' : ''
        } ${isCustomizing ? 'border-dashed border-blue-500' : ''}`}
      >
        {isCustomizing && (
          <button
            onClick={removeWidget}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {getContent()}
      </div>
    );
  };

  const SettingsPanel = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`${theme.cardBg} rounded-xl p-0 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden`}>
        {/* Settings Header */}
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

        <div className="flex h-96">
          {/* Settings Sidebar */}
          <div className={`w-64 p-6 border-r ${theme.border}`}>
            <nav className="space-y-2">
              <button className={`w-full text-left px-3 py-2 rounded-lg ${theme.text} bg-green-600 font-medium`}>
                General
              </button>
              <button className={`w-full text-left px-3 py-2 rounded-lg ${theme.textSecondary} ${theme.hover}`}>
                Notifications
              </button>
              <button className={`w-full text-left px-3 py-2 rounded-lg ${theme.textSecondary} ${theme.hover}`}>
                Display
              </button>
              <button className={`w-full text-left px-3 py-2 rounded-lg ${theme.textSecondary} ${theme.hover}`}>
                Trading
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Theme Settings */}
              <div>
                <h3 className={`${theme.text} text-lg font-semibold mb-4`}>Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`${theme.text} text-sm font-medium mb-2 block`}>Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateSettings({ theme: 'dark' })}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          settings.theme === 'dark' 
                            ? 'border-green-500 bg-green-500/10' 
                            : `border-gray-600 ${theme.hover}`
                        }`}
                      >
                        <Moon className="w-5 h-5 text-gray-300" />
                        <div className="text-left">
                          <div className={theme.text}>Dark</div>
                          <div className={`${theme.textSecondary} text-xs`}>Default theme</div>
                        </div>
                      </button>
                      <button
                        onClick={() => updateSettings({ theme: 'light' })}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          settings.theme === 'light' 
                            ? 'border-green-500 bg-green-500/10' 
                            : `border-gray-600 ${theme.hover}`
                        }`}
                      >
                        <Sun className="w-5 h-5 text-yellow-500" />
                        <div className="text-left">
                          <div className={theme.text}>Light</div>
                          <div className={`${theme.textSecondary} text-xs`}>Bright theme</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
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
                            ...settings.notifications,
                            [notification.key]: !settings.notifications[notification.key]
                          }
                        })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          settings.notifications[notification.key] ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                          settings.notifications[notification.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}></div>
                      </button>
                    </label>
                  ))}
                </div>
              </div>

              {/* Display Settings */}
              <div>
                <h3 className={`${theme.text} text-lg font-semibold mb-4`}>Display Options</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`${theme.text} text-sm font-medium mb-2 block`}>Currency Display</label>
                    <select 
                      value={settings.display.currency}
                      onChange={(e) => updateSettings({
                        display: { ...settings.display, currency: e.target.value }
                      })}
                      className={`w-full ${theme.input} ${theme.text} rounded-lg px-3 py-2 text-sm border ${theme.border}`}
                    >
                      <option value="coins">Coins</option>
                      <option value="usd">USD Equivalent</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`${theme.text} text-sm font-medium mb-2 block`}>Date Format</label>
                    <select 
                      value={settings.display.dateFormat}
                      onChange={(e) => updateSettings({
                        display: { ...settings.display, dateFormat: e.target.value }
                      })}
                      className={`w-full ${theme.input} ${theme.text} rounded-lg px-3 py-2 text-sm border ${theme.border}`}
                    >
                      <option value="relative">Relative (2h ago)</option>
                      <option value="absolute">Absolute (Aug 29, 2:30 PM)</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between">
                    <div>
                      <div className={`${theme.text} text-sm font-medium`}>Compact Mode</div>
                      <div className={`${theme.textSecondary} text-xs`}>Show more information in less space</div>
                    </div>
                    <button
                      onClick={() => updateSettings({
                        display: { ...settings.display, compactMode: !settings.display.compactMode }
                      })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        settings.display.compactMode ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                        settings.display.compactMode ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </label>
                </div>
              </div>

              {/* Trading Settings */}
              <div>
                <h3 className={`${theme.text} text-lg font-semibold mb-4`}>Trading Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`${theme.text} text-sm font-medium mb-2 block`}>Auto Refresh Interval</label>
                    <select 
                      value={settings.trading.refreshInterval}
                      onChange={(e) => updateSettings({
                        trading: { ...settings.trading, refreshInterval: parseInt(e.target.value) }
                      })}
                      className={`w-full ${theme.input} ${theme.text} rounded-lg px-3 py-2 text-sm border ${theme.border}`}
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between">
                    <div>
                      <div className={`${theme.text} text-sm font-medium`}>Confirm Trades</div>
                      <div className={`${theme.textSecondary} text-xs`}>Show confirmation dialog before trades</div>
                    </div>
                    <button
                      onClick={() => updateSettings({
                        trading: { ...settings.trading, confirmTrades: !settings.trading.confirmTrades }
                      })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        settings.trading.confirmTrades ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                        settings.trading.confirmTrades ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Footer */}
        <div className={`p-6 border-t ${theme.border} flex justify-between`}>
          <button
            onClick={resetSettings}
            className={`px-4 py-2 ${theme.button} ${theme.text} rounded-lg flex items-center gap-2 transition-colors`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <div className="flex gap-3">
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
            {/* Logo and Main Nav */}
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
                <button className={`px-4 py-2 rounded-lg font-medium ${theme.textSecondary} hover:${theme.text} ${theme.hover} flex items-center gap-2`}>
                  <Search className="w-4 h-4" />
                  Player Search
                </button>
              </div>
            </div>

            {/* Right Side - Theme Toggle, Notifications and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Quick Theme Toggle */}
              <button 
                onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg ${theme.hover} transition-colors`}
              >
                {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg ${theme.hover} relative transition-colors`}>
                <Bell className="w-5 h-5" />
                {settings.notifications.priceAlerts && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                )}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-3 ${theme.button} ${theme.hover} rounded-lg px-4 py-2 ${theme.text} transition-colors`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">W</span>
                  </div>
                  <span className="hidden md:block font-medium">whatthefut</span>
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
                          <p className={`${theme.text} font-medium`}>whatthefut</p>
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
                        onClick={() => {
                          setShowSettings(true);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}
                      >
                        <Settings className="w-4 h-4" />
                        App Settings
                      </button>
                      <button className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}>
                        <Bell className="w-4 h-4" />
                        Notifications
                      </button>
                      <button className={`w-full text-left px-4 py-3 ${theme.textSecondary} ${theme.hover} hover:${theme.text} transition-colors flex items-center gap-3`}>
                        <AlertCircle className="w-4 h-4" />
                        Help & Support
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

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard Overview</h1>
              <div className="flex items-center gap-3">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
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

            {/* Widget Library for Customization */}
            {isCustomizing && (
              <div className={`${settings.theme === 'dark' ? 'bg-blue-900/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border rounded-xl p-6`}>
                <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Widgets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableWidgets
                    .filter(widget => !dashboardWidgets.some(w => w.type === widget.type))
                    .map((widget) => {
                      const Icon = widget.icon;
                      return (
                        <button
                          key={widget.type}
                          onClick={() => {
                            setDashboardWidgets([
                              ...dashboardWidgets,
                              { id: Date.now().toString(), type: widget.type, size: 'small' }
                            ]);
                          }}
                          className={`p-4 ${theme.cardBg} ${theme.hover} rounded-lg border ${theme.border} hover:border-blue-500 transition-all group`}
                        >
                          <Icon className={`w-8 h-8 ${theme.textSecondary} group-hover:text-blue-400 mx-auto mb-2 transition-colors`} />
                          <span className={`text-sm ${theme.textSecondary} group-hover:${theme.text} transition-colors block`}>{widget.name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardWidgets.map((widget) => (
                <Widget key={widget.id} widget={widget} />
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Analytics View */}
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
                <button className={`${theme.button} hover:${theme.text} px-4 py-2 rounded-lg flex items-center gap-2`}>
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${settings.theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>+2.3M</div>
                    <div className={`${theme.textSecondary} text-sm`}>Total Profit</div>
                  </div>
                </div>
                <div className="text-green-400 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +15.2% vs last month
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${settings.theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                    <Activity className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>127</div>
                    <div className={`${theme.textSecondary} text-sm`}>Total Trades</div>
                  </div>
                </div>
                <div className="text-blue-400 text-sm">23 trades this week</div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${settings.theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-xl flex items-center justify-center`}>
                    <Target className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>73%</div>
                    <div className={`${theme.textSecondary} text-sm`}>Win Rate</div>
                  </div>
                </div>
                <div className="text-purple-400 text-sm">+3% vs last month</div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${settings.theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'} rounded-xl flex items-center justify-center`}>
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${theme.text}`}>18K</div>
                    <div className={`${theme.textSecondary} text-sm`}>Avg Profit</div>
                  </div>
                </div>
                <div className="text-orange-400 text-sm">Per successful trade</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-xl font-semibold mb-6 flex items-center gap-2`}>
                  <LineChart className="w-6 h-6 text-green-400" />
                  Profit Over Time
                </h3>
                <div className={`h-80 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center mb-4`}>
                  <div className="text-center">
                    <LineChart className={`w-16 h-16 ${theme.textTertiary} mx-auto mb-2`} />
                    <span className={theme.textSecondary}>Interactive Line Chart</span>
                    <div className={`${theme.textTertiary} text-sm mt-1`}>Daily profit tracking</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-green-400 font-semibold">+450K</div>
                    <div className={`${theme.textSecondary} text-xs`}>This Week</div>
                  </div>
                  <div>
                    <div className="text-blue-400 font-semibold">+125K</div>
                    <div className={`${theme.textSecondary} text-xs`}>Best Day</div>
                  </div>
                  <div>
                    <div className="text-red-400 font-semibold">-45K</div>
                    <div className={`${theme.textSecondary} text-xs`}>Worst Day</div>
                  </div>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-xl font-semibold mb-6 flex items-center gap-2`}>
                  <PieChart className="w-6 h-6 text-blue-400" />
                  Profit Distribution
                </h3>
                <div className={`h-80 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center mb-4`}>
                  <div className="text-center">
                    <PieChart className={`w-16 h-16 ${theme.textTertiary} mx-auto mb-2`} />
                    <span className={theme.textSecondary}>League Breakdown Chart</span>
                    <div className={`${theme.textTertiary} text-sm mt-1`}>Profit by league</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className={`${theme.textSecondary} text-sm`}>La Liga 35%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className={`${theme.textSecondary} text-sm`}>PL 28%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className={`${theme.textSecondary} text-sm`}>Serie A 22%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className={`${theme.textSecondary} text-sm`}>Others 15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-lg font-semibold mb-4`}>Time Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-sm`}>Morning (6-12)</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-20 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-green-400 text-sm font-medium">+15K</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-sm`}>Afternoon (12-18)</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-20 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      <span className="text-blue-400 text-sm font-medium">+22K</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-sm`}>Evening (18-24)</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-20 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-yellow-400 text-sm font-medium">+8K</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-sm`}>Night (0-6)</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-20 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <span className="text-red-400 text-sm font-medium">-2K</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-lg font-semibold mb-4`}>Position Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-500/20 rounded text-xs flex items-center justify-center text-red-400">ST</div>
                      <span className={`${theme.textSecondary} text-sm`}>Strikers</span>
                    </div>
                    <span className="text-green-400 text-sm font-medium">+85K avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500/20 rounded text-xs flex items-center justify-center text-blue-400">CM</div>
                      <span className={`${theme.textSecondary} text-sm`}>Midfielders</span>
                    </div>
                    <span className="text-blue-400 text-sm font-medium">+42K avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-500/20 rounded text-xs flex items-center justify-center text-yellow-400">CB</div>
                      <span className={`${theme.textSecondary} text-sm`}>Defenders</span>
                    </div>
                    <span className="text-yellow-400 text-sm font-medium">+18K avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500/20 rounded text-xs flex items-center justify-center text-purple-400">GK</div>
                      <span className={`${theme.textSecondary} text-sm`}>Goalkeepers</span>
                    </div>
                    <span className="text-red-400 text-sm font-medium">-5K avg</span>
                  </div>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-lg font-semibold mb-4`}>Market Insights</h3>
                <div className="space-y-4">
                  <div className={`${settings.theme === 'dark' ? 'bg-green-900/30 border-green-500/30' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                    <div className="text-green-500 text-sm font-semibold mb-1">Best Opportunity</div>
                    <div className={`${theme.text} text-sm`}>La Liga defenders undervalued by 12%</div>
                  </div>
                  <div className={`${settings.theme === 'dark' ? 'bg-yellow-900/30 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}>
                    <div className="text-yellow-500 text-sm font-semibold mb-1">Market Alert</div>
                    <div className={`${theme.text} text-sm`}>Icon prices approaching resistance</div>
                  </div>
                  <div className={`${settings.theme === 'dark' ? 'bg-red-900/30 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
                    <div className="text-red-500 text-sm font-semibold mb-1">Risk Warning</div>
                    <div className={`${theme.text} text-sm`}>PL attackers showing high volatility</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Performance Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-lg font-semibold mb-4`}>Top Performing Players</h3>
                <div className="space-y-1">
                  <div className={`grid grid-cols-4 gap-4 ${theme.textSecondary} text-sm font-medium border-b ${theme.border} pb-3 mb-3`}>
                    <span>Player</span>
                    <span>Trades</span>
                    <span>Win Rate</span>
                    <span>Profit</span>
                  </div>
                  <div className={`grid grid-cols-4 gap-4 text-sm py-2 ${theme.hover} rounded`}>
                    <span className={theme.text}>Mbappé</span>
                    <span className={theme.textSecondary}>15</span>
                    <span className="text-green-400">80%</span>
                    <span className="text-green-400">+245K</span>
                  </div>
                  <div className={`grid grid-cols-4 gap-4 text-sm py-2 ${theme.hover} rounded`}>
                    <span className={theme.text}>Haaland</span>
                    <span className={theme.textSecondary}>12</span>
                    <span className="text-green-400">75%</span>
                    <span className="text-green-400">+189K</span>
                  </div>
                  <div className={`grid grid-cols-4 gap-4 text-sm py-2 ${theme.hover} rounded`}>
                    <span className={theme.text}>Vini Jr.</span>
                    <span className={theme.textSecondary}>18</span>
                    <span className="text-yellow-400">72%</span>
                    <span className="text-green-400">+156K</span>
                  </div>
                  <div className={`grid grid-cols-4 gap-4 text-sm py-2 ${theme.hover} rounded`}>
                    <span className={theme.text}>Bellingham</span>
                    <span className={theme.textSecondary}>8</span>
                    <span className="text-green-400">88%</span>
                    <span className="text-green-400">+134K</span>
                  </div>
                </div>
              </div>

              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <h3 className={`${theme.text} text-lg font-semibold mb-4`}>League Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-4 bg-gradient-to-r from-red-500 to-yellow-500 rounded"></div>
                      <span className={`${theme.text} text-sm`}>La Liga</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">+485K</div>
                      <div className={`${theme.textSecondary} text-xs`}>35 trades</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-4 bg-gradient-to-r from-blue-800 to red-600 rounded"></div>
                      <span className={`${theme.text} text-sm`}>Premier League</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">+320K</div>
                      <div className={`${theme.textSecondary} text-xs`}>28 trades</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-4 bg-gradient-to-r from-green-600 to-red-600 rounded"></div>
                      <span className={`${theme.text} text-sm`}>Serie A</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">+275K</div>
                      <div className={`${theme.textSecondary} text-xs`}>22 trades</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trades View */}
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
                  <span>Position</span>
                  <span>Buy Price</span>
                  <span>Sell Price</span>
                  <span>Profit/Loss</span>
                  <span>Time Held</span>
                  <span>Actions</span>
                </div>
                <div className="space-y-1">
                  <div className={`grid grid-cols-7 gap-4 py-3 text-sm ${theme.hover} rounded-lg px-2`}>
                    <span className={`${theme.text} font-medium`}>Kylian Mbappé</span>
                    <span className="text-red-400">ST</span>
                    <span className={theme.textSecondary}>925,000</span>
                    <span className={theme.textSecondary}>975,000</span>
                    <span className="text-green-400 font-medium">+50,000</span>
                    <span className={theme.textSecondary}>2h 15m</span>
                    <button className="text-blue-400 hover:text-blue-300">View Details</button>
                  </div>
                  <div className={`grid grid-cols-7 gap-4 py-3 text-sm ${theme.hover} rounded-lg px-2`}>
                    <span className={`${theme.text} font-medium`}>Erling Haaland</span>
                    <span className="text-red-400">ST</span>
                    <span className={theme.textSecondary}>850,000</span>
                    <span className={theme.textSecondary}>920,000</span>
                    <span className="text-green-400 font-medium">+70,000</span>
                    <span className={theme.textSecondary}>4h 30m</span>
                    <button className="text-blue-400 hover:text-blue-300">View Details</button>
                  </div>
                  <div className={`grid grid-cols-7 gap-4 py-3 text-sm ${theme.hover} rounded-lg px-2`}>
                    <span className={`${theme.text} font-medium`}>Vinicius Jr.</span>
                    <span className="text-green-400">LW</span>
                    <span className={theme.textSecondary}>720,000</span>
                    <span className={theme.textSecondary}>685,000</span>
                    <span className="text-red-400 font-medium">-35,000</span>
                    <span className={theme.textSecondary}>1h 45m</span>
                    <button className="text-blue-400 hover:text-blue-300">View Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist View */}
        {activeView === 'watchlist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Watchlist</h1>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Player
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl"></div>
                  <div>
                    <h3 className={`${theme.text} font-semibold`}>Kylian Mbappé</h3>
                    <p className={`${theme.textSecondary} text-sm`}>Real Madrid • ST</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Current Price</span>
                    <span className={`${theme.text} font-medium`}>975,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Target Buy</span>
                    <span className="text-green-400">950,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Target Sell</span>
                    <span className="text-blue-400">1,100,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>24h Change</span>
                    <span className="text-red-400">-2.9%</span>
                  </div>
                </div>
              </div>
              
              <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"></div>
                  <div>
                    <h3 className={`${theme.text} font-semibold`}>Erling Haaland</h3>
                    <p className={`${theme.textSecondary} text-sm`}>Man City • ST</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Current Price</span>
                    <span className={`${theme.text} font-medium`}>920,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Target Buy</span>
                    <span className="text-green-400">900,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Target Sell</span>
                    <span className="text-blue-400">1,050,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>24h Change</span>
                    <span className="text-green-400">+1.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel />}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default Overview;
