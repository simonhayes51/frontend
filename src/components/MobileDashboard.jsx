import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const MobileDashboard = () => {
  const { netProfit, taxPaid, startingBalance, trades } = useDashboard();
  const { formatCurrency, formatDate } = useSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Net Profit', value: formatCurrency(netProfit), color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'EA Tax', value: formatCurrency(taxPaid), color: 'text-red-400', bg: 'bg-red-500/10' },
    { title: 'Starting Balance', value: formatCurrency(startingBalance), color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Total Trades', value: trades.length.toString(), color: 'text-purple-400', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.avatar_url} 
              alt={user?.global_name}
              className="w-10 h-10 rounded-full border-2 border-purple-500"
            />
            <div>
              <p className="text-sm font-medium">Welcome back</p>
              <p className="text-xs text-gray-400">{user?.global_name}</p>
            </div>
          </div>
          <button className="p-2 rounded-lg bg-gray-800 border border-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bg} rounded-2xl p-4 border border-gray-700/30`}>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.title}</p>
              <p className={`text-xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'trades', label: 'Recent Trades' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center space-x-2 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <span>➕</span>
                  <span className="text-sm font-medium">Add Trade</span>
                </button>
                <button className="flex items-center space-x-2 p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <span>📊</span>
                  <span className="text-sm font-medium">Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="space-y-3">
            {trades.slice(0, 10).map((trade, index) => (
              <div key={index} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{trade.player}</p>
                    <p className="text-xs text-gray-400">{trade.version} • {trade.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(trade.timestamp).split(',')[0]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
