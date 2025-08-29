import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// 🧰 small helpers you already used elsewhere
const currency = (n = 0) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (d) => {
  try {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleString();
  } catch {
    return "—";
  }
};

const DEFAULT = {
  theme: "dark",
  notifications: { priceAlerts: true, tradeConfirmations: true, marketUpdates: false, weeklyReports: true },
  display: { currency: "coins", dateFormat: "relative", compactMode: false, showProfitPercentage: true },
  trading: { autoRefresh: true, refreshInterval: 30, confirmTrades: true, defaultTradeAmount: 100000 },
  // which widgets are visible (id matches ThemedDashboard widget types)
  visible_widgets: ["profit-tracker", "watchlist-preview", "market-trends", "recent-trades", "quick-analytics", "price-alerts"],
  include_tax_in_profit: true,
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...DEFAULT, ...(JSON.parse(localStorage.getItem("settings") || "{}")) };
    } catch {
      return DEFAULT;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // persist
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
    // allow ThemedDashboard body background to change
    document.documentElement.classList.toggle("light", settings.theme === "light");
  }, [settings]);

  const api = useMemo(
    () => ({
      ...settings,
      isLoading,
      setSettings,
      updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
      formatCurrency: currency,
      formatDate: fmtDate,
      calculateProfit: ({ profit = 0, ea_tax = 0 }) =>
        settings.include_tax_in_profit ? profit - ea_tax : profit,
    }),
    [settings, isLoading]
  );

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);