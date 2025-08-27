// src/context/DashboardContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/axios';

const DashboardContext = createContext(null);

const asArray = (v) => (Array.isArray(v) ? v : []);
const asNumber = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

const initialState = {
  isLoading: true,
  error: null,
  netProfit: 0,
  taxPaid: 0,
  startingBalance: 0,
  trades: [],
  profile: {
    totalProfit: 0,
    tradesLogged: 0,
    winRate: 0,
    mostUsedTag: 'N/A',
    bestTrade: null
  },
  shouldRefresh: false
};

// Normalise any server payload so we never store undefined/nulls that break render
const normalisePayload = (payload = {}) => {
  const p = payload || {};
  const profile = p.profile || {};
  return {
    netProfit: asNumber(p.netProfit, 0),
    taxPaid: asNumber(p.taxPaid, 0),
    startingBalance: asNumber(p.startingBalance, 0),
    trades: asArray(p.trades),
    profile: {
      totalProfit: asNumber(profile.totalProfit, 0),
      tradesLogged: asNumber(profile.tradesLogged, 0),
      winRate: asNumber(profile.winRate, 0),
      mostUsedTag: profile.mostUsedTag ?? 'N/A',
      bestTrade: profile.bestTrade ?? null
    }
  };
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_DASHBOARD_DATA': {
      // Merge safely: only overwrite with normalised values
      const n = normalisePayload(action.payload);
      return {
        ...state,
        ...n,
        // ensure keys exist even if server skipped them later
        trades: asArray(n.trades),
        profile: { ...state.profile, ...n.profile },
        isLoading: false,
        error: null,
        shouldRefresh: false
      };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, shouldRefresh: false };

    case 'ADD_TRADE': {
      const safeTrades = asArray(state.trades);
      const profit = asNumber(action.payload?.profit, 0);
      const ea_tax = asNumber(action.payload?.ea_tax, 0);
      return {
        ...state,
        trades: [action.payload, ...safeTrades].slice(0, 10), // keep 10 most recent
        netProfit: asNumber(state.netProfit, 0) + profit,
        taxPaid: asNumber(state.taxPaid, 0) + ea_tax,
        profile: {
          ...state.profile,
          totalProfit: asNumber(state.profile?.totalProfit, 0) + profit,
          tradesLogged: asNumber(state.profile?.tradesLogged, 0) + 1
        }
      };
    }

    case 'REFRESH_DATA':
      return { ...state, shouldRefresh: true };

    default:
      return state;
  }
};

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const fetchDashboardData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await api.get('/api/dashboard');
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: data });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err?.userMessage || 'Failed to load dashboard data'
      });
    }
  };

  const addTrade = async (tradeData) => {
    try {
      const { data } = await api.post('/api/trades', tradeData);
      const newTrade = {
        ...tradeData,
        profit: asNumber(data?.profit, 0),
        ea_tax: asNumber(data?.ea_tax, 0),
        timestamp: new Date().toISOString()
      };
      dispatch({ type: 'ADD_TRADE', payload: newTrade });
      return { success: true, message: data?.message || 'Trade added' };
    } catch (err) {
      console.error('Add trade error:', err);
      return { success: false, message: err?.userMessage || 'Failed to add trade' };
    }
  };

  const getAllTrades = async () => {
    try {
      const { data } = await api.get('/api/trades');
      return { success: true, trades: asArray(data?.trades) };
    } catch (err) {
      console.error('Get trades error:', err);
      return { success: false, message: err?.userMessage || 'Failed to load trades' };
    }
  };

  const deleteTrade = async (tradeId) => {
    try {
      await api.delete(`/api/trades/${tradeId}`);
      await fetchDashboardData();
      return { success: true, message: 'Trade deleted successfully' };
    } catch (err) {
      console.error('Delete trade error:', err);
      return { success: false, message: err?.userMessage || 'Failed to delete trade' };
    }
  };

  const refreshData = () => dispatch({ type: 'REFRESH_DATA' });

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (state.shouldRefresh) fetchDashboardData();
  }, [state.shouldRefresh]);

  const value = {
    ...state,
    addTrade,
    getAllTrades,
    deleteTrade,
    refreshData,
    fetchDashboardData
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within a DashboardProvider');
  return ctx;
};