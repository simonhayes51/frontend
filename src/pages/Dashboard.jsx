// src/pages/Dashboard.jsx
import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useSettings } from '../context/SettingsContext';

// If you already have a widget registry, import it instead of the placeholder below:
// import * as widgets from '../widgets'; // <-- your real registry
const widgets = {}; // placeholder to keep this file self-safe if no registry is present

const toArray = (v) => (Array.isArray(v) ? v : []);

export default function Dashboard() {
  const {
    trades = [],
    netProfit = 0,
    taxPaid = 0,
    startingBalance = 0,
    isLoading = false,
    error = null,
  } = useDashboard() || {};

  const {
    formatCurrency: _formatCurrency,
    visible_widgets: _visibleWidgets,
  } = useSettings() || {};

  const formatCurrency =
    typeof _formatCurrency === 'function'
      ? _formatCurrency
      : (n) =>
          typeof n === 'number'
            ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : String(n ?? '0');

  const visibleWidgets = toArray(_visibleWidgets);
  const safeTrades = toArray(trades);

  // Safely compute "best trade" without ever mapping undefined
  const bestTradeProfit =
    safeTrades.length > 0
      ? Math.max(...safeTrades.map((t) => Number(t?.profit ?? 0)))
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mr-3" />
        <span className="text-gray-300">Loading dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 text-red-300 border border-red-500/30 rounded-lg p-4">
          {String(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      {/* Quick Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Profit" value={formatCurrency(netProfit)} />
        <StatCard title="Amount Deposit" value={formatCurrency(startingBalance)} />
        <StatCard title="Amount Spent" value={formatCurrency(taxPaid)} />
        <StatCard title="Best Trade" value={formatCurrency(bestTradeProfit)} />
      </section>

      {/* Widgets Grid (SAFE) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleWidgets
          .map((key) => widgets?.[key])
          .filter(Boolean)
          .map((Widget, i) => (
            <div key={`${visibleWidgets[i]}-${i}`} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4">
              {/* If your widgets are React components, render them: */}
              {typeof Widget === 'function' ? <Widget /> : <WidgetFallback name={String(visibleWidgets[i])} />}
            </div>
          ))}

        {/* Fallback when no registry is present or list is empty */}
        {visibleWidgets.length > 0 && Object.keys(widgets).length === 0 && (
          <div className="col-span-full text-sm text-gray-400">
            {/* Remove this note once you wire your real widgets import */}
            Tip: Import your widget registry and assign it to <code>widgets</code> to render them here.
          </div>
        )}
      </section>

      {/* History preview (SAFE) */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Recent Trades</h2>
        <div className="space-y-3">
          {safeTrades.slice(0, 8).map((t, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-bold">{String(t?.player ?? '—').charAt(0)}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">{t?.player ?? 'Unknown'}</div>
                  <div className="text-xs text-gray-400">{t?.version ?? 'player'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${Number(t?.profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(t?.profit ?? 0) >= 0 ? '+' : ''}
                  {formatCurrency(Number(t?.profit ?? 0))}
                </div>
              </div>
            </div>
          ))}
          {safeTrades.length === 0 && (
            <div className="text-sm text-gray-400">No trades yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4">
      <div className="text-gray-400 text-xs mb-1">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function WidgetFallback({ name }) {
  return (
    <div className="text-sm text-gray-400">
      Widget <span className="text-gray-300 font-mono">{name}</span> not found.
    </div>
  );
}
