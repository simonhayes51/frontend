// src/services/api.js
// Uses your existing axios instance so auth headers/baseURL keep working.
import axios from "../axios";

/**
 * NOTE: These endpoints mirror what your current pages call.
 * If your pages use different paths, copy those paths here 1:1.
 * (e.g. open src/pages/Watchlist.jsx and take the same URL it uses.)
 */

// Dashboard / Trades (already handled by DashboardContext, here for reference)
export const fetchSummary = (user_id) =>
  axios.get(`/summary`, { params: { user_id } }).then(r => r.data);

export const fetchTrades = (user_id, { limit = 50 } = {}) =>
  axios.get(`/trades`, { params: { user_id, limit } }).then(r => r.data?.trades ?? r.data ?? []);

// Watchlist
export const fetchWatchlist = (user_id) =>
  axios.get(`/watchlist`, { params: { user_id } }).then(r => r.data?.items ?? r.data ?? []);

/**
 * If your Watchlist page uses a different structure (e.g. r.data.watchlist),
 * just change the line above to match it exactly.
 */

// Alerts
export const fetchAlerts = (user_id) =>
  axios.get(`/alerts`, { params: { user_id } }).then(r => r.data?.alerts ?? r.data ?? []);

// Market Trends
export const fetchMarketTrends = () =>
  axios.get(`/market/trends`).then(r => r.data?.trends ?? r.data ?? []);

/**
 * If your app already hits different paths:
 *  - Open src/pages/Watchlist.jsx -> copy its GET path here.
 *  - Open src/pages/Trades.jsx    -> you already have in context.
 *  - Open src/pages/Dashboard.jsx -> you already have in context.
 *  - Open src/pages/PriceCheck.jsx or any market file -> copy trend path here.
 *  - Open alerts page (if any) -> copy its path here.
 */